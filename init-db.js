/**
 * @fileoverview データベース初期化スクリプト
 * @description
 * アプリケーションで使用するSQLite3データベース（database.sqlite）を作成し、
 * usersテーブルの定義および初期データ（管理者と一般ユーザー）の登録を行います。
 * パスワードはbcryptjsを用いてハッシュ化して保存されます。
 */

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// データベースファイルのパス
const dbPath = path.resolve(__dirname, 'database.sqlite');

// データベースに接続
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('データベースの接続に失敗しました:', err.message);
    process.exit(1);
  }
  console.log('データベースに接続しました:', dbPath);
});

// 初期データ
const defaultUsers = [
  { username: 'admin', password: 'adminpassword', role: 'admin' },
  { username: 'user', password: 'userpassword', role: 'user' }
];

// 初期化処理
db.serialize(() => {
  // 既存のusersテーブルを削除（初期化のたびに再作成するため）
  db.run('DROP TABLE IF EXISTS users', (err) => {
    if (err) {
      console.error('usersテーブルの削除中にエラーが発生しました:', err.message);
    } else {
      console.log('既存のusersテーブルを削除しました（存在する場合）。');
    }
  });

  // usersテーブルの作成
  const createTableQuery = `
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL
    )
  `;
  db.run(createTableQuery, (err) => {
    if (err) {
      console.error('usersテーブルの作成に失敗しました:', err.message);
      process.exit(1);
    }
    console.log('usersテーブルを作成しました。');

    // 初期データの挿入
    const insertQuery = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
    const stmt = db.prepare(insertQuery);

    let insertedCount = 0;
    defaultUsers.forEach((user) => {
      // パスワードのハッシュ化（ソルトラウンドは10）
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(user.password, salt);

      stmt.run(user.username, hashedPassword, user.role, (err) => {
        if (err) {
          console.error(`ユーザー ${user.username} の登録に失敗しました:`, err.message);
        } else {
          console.log(`ユーザーを登録しました: ${user.username} (role: ${user.role})`);
        }

        insertedCount++;
        // すべてのユーザーの挿入が完了したらステートメントを完了し、データベース接続を閉じる
        if (insertedCount === defaultUsers.length) {
          stmt.finalize();
          db.close((err) => {
            if (err) {
              console.error('データベースの切断中にエラーが発生しました:', err.message);
            } else {
              console.log('データベース接続を閉じました。初期化完了。');
            }
          });
        }
      });
    });
  });
});
