/**
 * Job 3: check-review-replies
 * 15〜30分おきの cron で実行
 */

const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { google } = require('googleapis');

function initFirebaseAdmin() {
  if (getApps().length === 0) {
    const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountVar) {
      throw new Error('環境変数 FIREBASE_SERVICE_ACCOUNT_KEY がセットされていません。');
    }
    const serviceAccount = typeof serviceAccountVar === 'string'
      ? JSON.parse(serviceAccountVar)
      : serviceAccountVar;

    initializeApp({
      credential: cert(serviceAccount),
    });
  }
  return getFirestore();
}

function getGmailClient() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return google.gmail({ version: 'v1', auth: oauth2Client });
}

async function main() {
  console.log('=== [Job 3] check-review-replies 開始 ===');

  const db = initFirebaseAdmin();
  const gmail = getGmailClient();

  const pendingArticlesSnapshot = await db.collection('articles')
    .where('status', '==', 'pending_review')
    .get();

  if (pendingArticlesSnapshot.empty) {
    console.log('現在、レビュー待ち (status: "pending_review") の記事はありません。');
    return;
  }

  const threadMap = new Map();
  pendingArticlesSnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.gmailThreadId) {
      threadMap.set(data.gmailThreadId, { id: doc.id, ...data });
    }
  });

  console.log(`レビュー待ち記事数: ${pendingArticlesSnapshot.size}件 (紐づくスレッド数: ${threadMap.size})`);

  for (const [threadId, article] of threadMap.entries()) {
    console.log(`スレッド [${threadId}] のメッセージを確認中... (記事: ${article.title})`);

    const threadRes = await gmail.users.threads.get({
      userId: 'me',
      id: threadId,
    });

    const messages = threadRes.data.messages || [];

    if (messages.length < 2) {
      console.log(`スレッド [${threadId}] にはまだ返信が届いていません。`);
      continue;
    }

    for (let i = 1; i < messages.length; i++) {
      const msg = messages[i];
      const msgId = msg.id;

      const processedDoc = await db.collection('processed_emails').doc(msgId).get();
      if (processedDoc.exists) {
        continue;
      }

      let bodyText = '';
      if (msg.snippet) bodyText += msg.snippet + '\n';
      if (msg.payload && msg.payload.parts) {
        for (const part of msg.payload.parts) {
          if (part.mimeType === 'text/plain' && part.body && part.body.data) {
            bodyText += Buffer.from(part.body.data, 'base64').toString('utf-8');
          }
        }
      }

      const upperBody = bodyText.toUpperCase();
      console.log(`未処理の返信メッセージ検出 [${msgId}]:`, bodyText.substring(0, 100));

      if (upperBody.includes('OK')) {
        console.log(`>>> 【承認判定: OK】記事 [${article.id}] を公開(published)にします。`);

        await db.collection('articles').doc(article.id).update({
          status: 'published',
          publishedAt: FieldValue.serverTimestamp(),
        });

        await db.collection('processed_emails').doc(msgId).set({
          messageId: msgId,
          articleId: article.id,
          actionTaken: 'approved',
          processedAt: FieldValue.serverTimestamp(),
        });

      } else if (upperBody.includes('NG')) {
        console.log(`>>> 【却下・再生成判定: NG】記事 [${article.id}] のトピックを未使用に戻します。`);

        await db.collection('articles').doc(article.id).update({
          status: 'rejected',
          feedbackNotes: bodyText,
        });

        if (article.topicId) {
          await db.collection('topics').doc(article.topicId).update({
            status: 'unused',
            lastFeedbackNotes: bodyText,
            reviewIteration: (article.reviewIteration || 1) + 1,
          });
        }

        await db.collection('processed_emails').doc(msgId).set({
          messageId: msgId,
          articleId: article.id,
          actionTaken: 'rejected',
          processedAt: FieldValue.serverTimestamp(),
        });

      } else {
        console.log(`>>> 【判定不能】返信本文に OK / NG が見つかりませんでした。ログのみ記録します。`);
        await db.collection('processed_emails').doc(msgId).set({
          messageId: msgId,
          articleId: article.id,
          actionTaken: 'ignored',
          processedAt: FieldValue.serverTimestamp(),
        });
      }
    }
  }

  console.log('=== [Job 3] check-review-replies 完了 ===');
}

main().catch((err) => {
  console.error('Job 3 エラー発生:', err);
  process.exit(1);
});
