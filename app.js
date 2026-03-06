/**
 * @fileoverview Express アプリケーションのエントリーポイント
 * @description
 * このファイルは Express を用いたシンプルな Web サーバーを構築します。
 * /hello へのアクセスに対してプレーンテキストで "ハローワールド" を返します。
 * また、環境変数によるポート設定や、予期せぬエラーへのハンドリングを実装しています。
 */

const express = require('express');
const app = express();

// 環境変数からポート番号を取得。指定がない場合はデフォルトで3000番を使用する
const PORT = process.env.PORT || 3000;

/**
 * /hello への GET リクエストに対するハンドラ
 *
 * @param {Object} req - Expressのリクエストオブジェクト
 * @param {Object} res - Expressのレスポンスオブジェクト
 * @param {Function} next - 次のミドルウェア関数
 * @description
 * プレーンテキストとして "ハローワールド" という文字列を返却します。
 */
app.get('/hello', (req, res, next) => {
  try {
    // レスポンスの Content-Type を text/plain に設定し、文字化けを防ぐために charset を utf-8 に指定する
    res.type('text/plain; charset=utf-8');
    // プレーンテキストで "ハローワールド" を送信
    res.send('ハローワールド');
  } catch (err) {
    // エラーが発生した場合は、エラーハンドリングミドルウェアに処理を委譲する
    next(err);
  }
});

/**
 * 未定義のルートへのアクセスを処理するミドルウェア
 *
 * @param {Object} req - Expressのリクエストオブジェクト
 * @param {Object} res - Expressのレスポンスオブジェクト
 * @description
 * 定義されていないエンドポイントへのアクセスに対して404 Not Foundを返します。
 */
app.use((req, res) => {
  res.status(404).send('Not Found');
});

/**
 * アプリケーション全体のエラーハンドリングミドルウェア
 *
 * @param {Error} err - 発生したエラーオブジェクト
 * @param {Object} req - Expressのリクエストオブジェクト
 * @param {Object} res - Expressのレスポンスオブジェクト
 * @param {Function} next - 次のミドルウェア関数
 * @description
 * サーバー内部で発生したエラーを捕捉し、500 Internal Server Errorを返却します。
 */
app.use((err, req, res, next) => {
  console.error('サーバー内部エラーが発生しました:', err);
  res.status(500).send('Internal Server Error');
});

/**
 * プロセス全体で捕捉されなかった例外のハンドリング
 *
 * @description
 * 予期せぬ例外によりプロセスがクラッシュするのを防ぎ、エラーログを出力します。
 * 本番環境では、ここでログを出力したのち、安全にプロセスを終了させることが推奨されます。
 */
process.on('uncaughtException', (err) => {
  console.error('未捕捉の例外が発生しました:', err);
  // process.exit(1); // 状況に応じてプロセスを終了する
});

/**
 * 処理されなかったPromiseの拒否(unhandled rejection)のハンドリング
 *
 * @description
 * 非同期処理などでcatchされなかったエラーを捕捉し、ログを出力します。
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('未処理のPromise拒否が発生しました:', reason);
});

/**
 * サーバーの起動処理
 *
 * @description
 * 指定されたポートでサーバーをリッスンし、起動メッセージをコンソールに出力します。
 */
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
