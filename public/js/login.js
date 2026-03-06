document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const errorMessage = document.getElementById('error-message');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = loginForm.username.value;
    const password = loginForm.password.value;

    errorMessage.textContent = ''; // エラーメッセージをクリア

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        // ログイン成功時、ポータル画面に遷移
        window.location.href = '/portal';
      } else {
        // エラーメッセージの表示
        errorMessage.textContent = data.error || 'ログインに失敗しました';
      }
    } catch (error) {
      console.error('通信エラー:', error);
      errorMessage.textContent = '通信エラーが発生しました';
    }
  });
});
