const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('データベースへの接続に失敗しました:', err.message);
  } else {
    console.log('データベースに接続しました:', dbPath);
  }
});

module.exports = db;
