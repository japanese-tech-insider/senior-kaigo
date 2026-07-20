/**
 * Job 3: check-review-replies
 * 15〜30分おきの cron で実行
 * 
 * 1. Gmail API で受信トレイの未読/返信メールをチェック
 * 2. processed_emails コレクションを参照して二重処理を防止
 * 3. メールの件名・スレッドIDから対象の article を特定
 * 4. 本文の判定:
 *    - 「OK」あり -> article.status = "published", publishedAt 記録, ISR再検証API(/api/revalidate)呼出
 *    - 「NG」あり -> article.status = "rejected", feedbackNotes 記録, reviewIteration++, topic status を "unused" に戻す
 *    - どちらでもない -> 無視してログ出力
 */

const admin = require('firebase-admin');
const { google } = require('googleapis');
const https = require('https');

function initFirebaseAdmin() {
  if (admin.apps.length === 0) {
    const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountVar) {
      throw new Error('環境変数 FIREBASE_SERVICE_ACCOUNT_KEY がセットされていません。');
    }
    const serviceAccount = typeof serviceAccountVar === 'string'
      ? JSON.parse(serviceAccountVar)
      : serviceAccountVar;

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  return admin.firestore();
}

function getGmailClient() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return google.gmail({ version: 'v1', auth: oauth2Client });
}

// オンデマンド ISR 再検証 API 呼出
async function triggerRevalidate(slug, category) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://senior-jikka.web.app';
  const secret = process.env.REVALIDATE_SECRET_TOKEN;

  const endpoint = `${siteUrl}/api/revalidate`;
  const postData = JSON.stringify({ slug, category });

  console.log(`ISR再検証APIを呼び出します: ${endpoint}`);

  return new Promise((resolve, reject) => {
    const urlObj = new URL(endpoint);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...(secret ? { Authorization: `Bearer ${secret}` } : {}),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        console.log(`ISR再検証レスポンス [Code ${res.statusCode}]:`, data);
        resolve(data);
      });
    });

    req.on('error', (e) => {
      console.error('ISR再検証エラー:', e);
      resolve(null); // エラーでもプロセス自体は落とさず継続
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('=== [Job 3] check-review-replies 開始 ===');

  const db = initFirebaseAdmin();
  const gmail = getGmailClient();

  // pending_review 状態の記事を取得
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

  // スレッドごとに返信メールを取得
  for (const [threadId, article] of threadMap.entries()) {
    console.log(`スレッド [${threadId}] のメッセージを確認中... (記事: ${article.title})`);

    const threadRes = await gmail.users.threads.get({
      userId: 'me',
      id: threadId,
    });

    const messages = threadRes.data.messages || [];

    // メッセージが2通以上あれば（1通目はJob2の送信通知、2通目以降がユーザー返信）
    if (messages.length < 2) {
      console.log(`スレッド [${threadId}] にはまだ返信が届いていません。`);
      continue;
    }

    // 送信済みの最新返信をチェック
    for (let i = 1; i < messages.length; i++) {
      const msg = messages[i];
      const msgId = msg.id;

      // すでに処理済みかチェック
      const processedDoc = await db.collection('processed_emails').doc(msgId).get();
      if (processedDoc.exists) {
        continue;
      }

      // メール本文の抽出
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
          publishedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // 二重処理防止記録
        await db.collection('processed_emails').doc(msgId).set({
          messageId: msgId,
          articleId: article.id,
          actionTaken: 'approved',
          processedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // ISR 再検証実行
        await triggerRevalidate(article.slug, article.category);

      } else if (upperBody.includes('NG')) {
        console.log(`>>> 【却下・再生成判定: NG】記事 [${article.id}] のトピックを未使用に戻します。`);

        await db.collection('articles').doc(article.id).update({
          status: 'rejected',
          feedbackNotes: bodyText,
        });

        // 該当 topic を unused に戻し、フィードバックを保存
        if (article.topicId) {
          await db.collection('topics').doc(article.topicId).update({
            status: 'unused',
            lastFeedbackNotes: bodyText,
            reviewIteration: (article.reviewIteration || 1) + 1,
          });
        }

        // 二重処理防止記録
        await db.collection('processed_emails').doc(msgId).set({
          messageId: msgId,
          articleId: article.id,
          actionTaken: 'rejected',
          processedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      } else {
        console.log(`>>> 【判定不能】返信本文に OK / NG が見つかりませんでした。ログのみ記録します。`);
        await db.collection('processed_emails').doc(msgId).set({
          messageId: msgId,
          articleId: article.id,
          actionTaken: 'ignored',
          processedAt: admin.firestore.FieldValue.serverTimestamp(),
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
