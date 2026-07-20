/**
 * Gmail API OAuth2 Refresh Token 取得用補助スクリプト
 * 
 * [使い方]
 * 1. Google Cloud Console で OAuth 2.0 クライアントID (デスクトップアプリ) を作成
 * 2. 環境変数 GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET を設定
 * 3. `node scripts/get-gmail-token.js` を実行
 * 4. コンソールに表示されたURLをブラウザで開き、アクセス許可を与える
 * 5. リダイレクトされたコードまたは認証コードをコンソールに入力
 * 6. 表示された refresh_token を GitHub Secrets の GMAIL_REFRESH_TOKEN に設定
 */

const { google } = require('googleapis');
const readline = require('readline');

const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob'; // デスクトップアプリ用リダイレクトURI

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('エラー: 環境変数 GMAIL_CLIENT_ID と GMAIL_CLIENT_SECRET を設定してください。');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const SCOPES = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.modify',
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent',
});

console.log('----------------------------------------------------');
console.log('以下のURLをブラウザで開いて認証を行い、画面に表示されたコードをコピーしてください:');
console.log(authUrl);
console.log('----------------------------------------------------');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('認証コードを入力してください: ', async (code) => {
  rl.close();
  try {
    const { tokens } = await oauth2Client.getToken(code.trim());
    console.log('\n================ 取得成功 ================');
    console.log('Refresh Token:');
    console.log(tokens.refresh_token);
    console.log('==========================================');
    console.log('※上記 Refresh Token を GitHub Secrets "GMAIL_REFRESH_TOKEN" に登録してください。');
  } catch (error) {
    console.error('トークン取得エラー:', error);
  }
});
