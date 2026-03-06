document.addEventListener('DOMContentLoaded', async () => {
  const userInfoDiv = document.getElementById('user-info');
  const logoutButton = document.getElementById('logout-button');

  try {
    // ログイン情報を取得するAPIを呼び出し
    const response = await fetch('/api/me');

    if (response.ok) {
      const data = await response.json();
      const user = data.user;

      // ユーザー情報の表示
      userInfoDiv.innerHTML = `
        <p>ようこそ、<strong>${escapeHTML(user.username)}</strong> さん</p>
        <p>ロール: ${escapeHTML(user.role)}</p>
      `;
      logoutButton.style.display = 'block';
    } else {
      // 認証されていない場合はログイン画面へリダイレクト
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('通信エラー:', error);
    userInfoDiv.innerHTML = '<p style="color:red;">ユーザー情報の取得に失敗しました。ログインし直してください。</p>';
  }

  // ログアウト処理
  logoutButton.addEventListener('click', async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST'
      });
      if (response.ok) {
        window.location.href = '/login';
      } else {
        alert('ログアウトに失敗しました');
      }
    } catch (error) {
      console.error('ログアウトエラー:', error);
      alert('ログアウト処理中にエラーが発生しました');
    }
  });
});

// XSS対策のためのHTMLエスケープ関数
function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>'"]/g,
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
