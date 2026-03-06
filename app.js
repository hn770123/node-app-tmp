/**
 * @fileoverview Express アプリケーションのエントリーポイント
 * @description
 * このファイルは Express を用いたシンプルな Web サーバーを構築します。
 * /hello へのアクセスに対してプレーンテキストで "ハローワールド" を返します。
 */

const express = require('express');
const app = express();
const PORT = 3000;

/**
 * /hello への GET リクエストに対するハンドラ
 *
 * @param {Object} req - Expressのリクエストオブジェクト
 * @param {Object} res - Expressのレスポンスオブジェクト
 * @description
 * プレーンテキストとして "ハローワールド" という文字列を返却します。
 */
app.get('/hello', (req, res) => {
  // レスポンスの Content-Type を text/plain に設定し、文字化けを防ぐために charset を utf-8 に指定する
  res.type('text/plain; charset=utf-8');
  // プレーンテキストで "ハローワールド" を送信
  res.send('ハローワールド');
});

/**
 * サーバーの起動処理
 *
 * @description
 * 指定されたポート（3000番）でサーバーをリッスンし、起動メッセージをコンソールに出力します。
 */
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
