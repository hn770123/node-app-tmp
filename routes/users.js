const express = require('express');
const router = express.Router();
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { requireAuth, requireAdmin } = require('../middlewares/auth');

/**
 * ユーザー管理画面のルート (管理者のみ)
 */
router.get('/users', requireAuth, requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'users.html'));
});

/**
 * ユーザー一覧取得 API (管理者のみ)
 */
router.get('/api/users', requireAuth, requireAdmin, (req, res) => {
  db.all('SELECT id, username, role FROM users', [], (err, rows) => {
    if (err) {
      console.error('データベースエラー:', err);
      return res.status(500).json({ error: 'ユーザーの取得に失敗しました' });
    }
    res.json({ users: rows });
  });
});

/**
 * ユーザー作成 API (管理者のみ)
 */
router.post('/api/users', requireAuth, requireAdmin, (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'すべての項目を入力してください' });
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, role], function(err) {
    if (err) {
      console.error('ユーザー作成エラー:', err);
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: '既に存在するユーザー名です' });
      }
      return res.status(500).json({ error: 'ユーザーの作成に失敗しました' });
    }
    res.json({ message: 'ユーザーを作成しました', user: { id: this.lastID, username, role } });
  });
});

/**
 * ユーザー更新 API (管理者のみ)
 */
router.put('/api/users/:id', requireAuth, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { username, password, role } = req.body;

  if (!username || !role) {
    return res.status(400).json({ error: 'ユーザー名とロールは必須です' });
  }

  if (password) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    db.run('UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?', [username, hashedPassword, role, id], function(err) {
      if (err) {
        console.error('ユーザー更新エラー:', err);
        return res.status(500).json({ error: 'ユーザーの更新に失敗しました' });
      }
      res.json({ message: 'ユーザーを更新しました' });
    });
  } else {
    db.run('UPDATE users SET username = ?, role = ? WHERE id = ?', [username, role, id], function(err) {
      if (err) {
        console.error('ユーザー更新エラー:', err);
        return res.status(500).json({ error: 'ユーザーの更新に失敗しました' });
      }
      res.json({ message: 'ユーザーを更新しました' });
    });
  }
});

/**
 * ユーザー削除 API (管理者のみ)
 */
router.delete('/api/users/:id', requireAuth, requireAdmin, (req, res) => {
  const { id } = req.params;

  // 自分自身は削除できないようにする
  if (req.session.user.id == id) {
    return res.status(400).json({ error: '自分自身は削除できません' });
  }

  db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('ユーザー削除エラー:', err);
      return res.status(500).json({ error: 'ユーザーの削除に失敗しました' });
    }
    res.json({ message: 'ユーザーを削除しました' });
  });
});

module.exports = router;
