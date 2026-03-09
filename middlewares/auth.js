/**
 * 認証ミドルウェア
 *
 * @description
 * ユーザーがログインしているか確認し、ログインしていない場合はログイン画面にリダイレクトします。
 */
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

/**
 * 管理者権限チェックミドルウェア
 *
 * @description
 * ユーザーが管理者(admin)であるか確認し、そうでない場合は403 Forbiddenを返します。
 */
function requireAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    next();
  } else {
    // APIリクエストの場合はJSONで、通常の画面遷移の場合はHTMLでエラーを返すなどの対応が考えられます。
    // 今回は要件に従い「権限がない旨を表示」するため、適切なステータスコードを返します。
    if (req.path.startsWith('/api/')) {
      res.status(403).json({ error: '権限がありません' });
    } else {
      res.status(403).send('<h2>権限がありません</h2><p>このページにアクセスする権限がありません。</p><a href="/portal">ポータルに戻る</a>');
    }
  }
}

module.exports = {
  requireAuth,
  requireAdmin
};
