/**
 * Job 3: check-review-replies
 * 15〜30分おきの cron で実行
 * 承認(OK)時に記事を本番公開し、公開完了をメールで通知する
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

function createRawHtmlEmail({ to, from, subject, htmlBody, threadId }) {
  const emailLines = [
    `To: ${to}`,
    `From: ${from}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    htmlBody,
  ];
  const email = emailLines.join('\r\n');
  return Buffer.from(email)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function sendPublishNotification({ gmail, article }) {
  const userEmail = process.env.GMAIL_USER_EMAIL;
  if (!userEmail) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://senior-kaigo.web.app';
  const articleUrl = `${siteUrl}/articles/${article.slug}`;

  const htmlBody = `
  <!DOCTYPE html>
  <html lang="ja">
  <head><meta charset="UTF-8"></head>
  <body style="font-family: -apple-system, sans-serif; line-height: 1.7; color: #374151; background-color: #fffdf9; padding: 20px;">
    <div style="max-w: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #f3d5c8; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <div style="background-color: #e07a5f; padding: 20px; color: #ffffff; text-align: center;">
        <h1 style="font-size: 20px; margin: 0;">🎉 記事が本番公開されました！</h1>
      </div>
      <div style="padding: 24px;">
        <p style="font-size: 15px; margin-top: 0;">
          レビューありがとうございます！以下の記事が正常に本番メディアサイトへ公開されました。
        </p>
        
        <div style="background-color: #fdf8f5; border: 1px solid #f3d5c8; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <h2 style="font-size: 16px; font-weight: bold; color: #7c2d12; margin: 0 0 10px 0;">${article.title}</h2>
          <p style="font-size: 14px; margin: 0 0 12px 0; color: #4b5563;">${article.metaDescription || ''}</p>
          <a href="${articleUrl}" target="_blank" style="display: inline-block; background-color: #e07a5f; color: #ffffff; text-decoration: none; font-weight: bold; padding: 10px 20px; border-radius: 8px; font-size: 14px;">
            公開ページを開いて確認する →
          </a>
        </div>

        <p style="font-size: 13px; color: #6b7280; margin-bottom: 0;">
          公開URL: <a href="${articleUrl}" style="color: #c85a32;">${articleUrl}</a>
        </p>
      </div>
      <div style="background-color: #fdf8f5; padding: 12px; text-align: center; font-size: 12px; color: #9a3412; border-top: 1px solid #f3d5c8;">
        親の介護施設えらびの相談室 自動記事投稿システム
      </div>
    </div>
  </body>
  </html>
  `;

  const rawEmail = createRawHtmlEmail({
    to: userEmail,
    from: userEmail,
    subject: `【公開完了】親の介護施設選び: ${article.title}`,
    htmlBody: htmlBody,
  });

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: rawEmail,
      threadId: article.gmailThreadId || undefined,
    },
  });

  console.log(`公開完了通知メールを送信しました (${userEmail})`);
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

        // 🎉 公開完了メールを送信
        try {
          await sendPublishNotification({ gmail, article });
        } catch (mailErr) {
          console.error('公開完了メール送信失敗:', mailErr.message);
        }

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
