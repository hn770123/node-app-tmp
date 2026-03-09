/**
 * @fileoverview Express アプリケーションのエントリーポイント
 * @description
 * このファイルは Express を用いたシンプルな Web サーバーを構築します。
 * /hello へのアクセスに対してプレーンテキストで "ハローワールド" を返します。
 * また、環境変数によるポート設定や、予期せぬエラーへのハンドリングを実装しています。
 */

const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('./db');
const { requireAuth, requireAdmin } = require('./middlewares/auth');

const app = express();

const usersRouter = require('./routes/users');
const jsonplaceholderRouter = require('./routes/jsonplaceholder');

// 環境変数からポート番号を取得。指定がない場合はデフォルトで3000番を使用する
const PORT = process.env.PORT || 3000;

// JSONとURLエンコードされたボディをパースするためのミドルウェア
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// セッション管理ミドルウェアの設定
app.use(session({
  store: new SQLiteStore({
    db: 'sessions.sqlite', // セッション用のデータベースファイル
    dir: __dirname // ファイルを保存するディレクトリ
  }),
  secret: process.env.SESSION_SECRET || 'super_secret_key_change_in_production', // 署名用のシークレットキー
  resave: false, // セッションが変更されなかった場合でも強制的に保存するかどうか
  saveUninitialized: false, // 初期化されていないセッションを保存するかどうか
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7日間有効
    httpOnly: true, // クライアントサイドのスクリプトからCookieにアクセスさせない
    secure: process.env.NODE_ENV === 'production' // 本番環境ではHTTPS経由でのみCookieを送信
  }
}));

// 静的ファイルの提供（認証不要なアセットなど）
app.use(express.static(path.join(__dirname, 'public')));

/**
 * ログイン画面のルート
 */
app.get('/login', (req, res) => {
  // すでにログインしている場合はポータルにリダイレクト
  if (req.session && req.session.user) {
    return res.redirect('/portal');
  }
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

/**
 * ポータル画面のルート (認証必須)
 */
app.get('/portal', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'portal.html'));
});

/**
 * ルートパス (/) へのアクセス
 */
app.get('/', (req, res) => {
  // ログインしていればポータルへ、していなければログイン画面へ
  if (req.session && req.session.user) {
    res.redirect('/portal');
  } else {
    res.redirect('/login');
  }
});

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
 * ログイン API
 *
 * @param {Object} req - Expressのリクエストオブジェクト
 * @param {Object} res - Expressのレスポンスオブジェクト
 * @description
 * ユーザー名とパスワードを照合し、成功した場合はセッションにユーザー情報を保存します。
 */
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'ユーザー名とパスワードを入力してください' });
  }

  // データベースからユーザーを検索
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      console.error('データベースエラー:', err);
      return res.status(500).json({ error: '内部サーバーエラーが発生しました' });
    }

    // ユーザーが存在しない、またはパスワードが一致しない場合
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'ユーザー名またはパスワードが間違っています' });
    }

    // パスワードを抜いたユーザー情報をセッションに保存
    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    res.json({ message: 'ログインに成功しました', user: req.session.user });
  });
});

/**
 * ログアウト API
 *
 * @param {Object} req - Expressのリクエストオブジェクト
 * @param {Object} res - Expressのレスポンスオブジェクト
 * @description
 * 現在のセッションを破棄し、ログアウトします。
 */
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('セッションの破棄に失敗しました:', err);
      return res.status(500).json({ error: 'ログアウト処理に失敗しました' });
    }
    // セッションクッキーをクリア
    res.clearCookie('connect.sid');
    res.json({ message: 'ログアウトしました' });
  });
});

/**
 * 現在のログインユーザー情報を取得する API
 *
 * @param {Object} req - Expressのリクエストオブジェクト
 * @param {Object} res - Expressのレスポンスオブジェクト
 */
app.get('/api/me', (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ error: '認証されていません' });
  }
});

/**
 * JSONPlaceholder 連携画面のルート (認証必須)
 */
app.get('/jsonplaceholder', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'jsonplaceholder.html'));
});

// ユーザー保守画面とAPIのルーターをマウント
app.use('/', usersRouter);

// JSONPlaceholder用サーバサイドAPIルーターをマウント
app.use('/', jsonplaceholderRouter);

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
