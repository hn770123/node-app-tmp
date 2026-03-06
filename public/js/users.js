/**
 * @fileoverview ユーザー管理画面のフロントエンドロジック
 * @description
 * ユーザー一覧の取得・表示、追加、更新、削除を行うスクリプトです。
 */

document.addEventListener('DOMContentLoaded', async () => {
  const usernameDisplay = document.getElementById('username-display');
  const logoutButton = document.getElementById('logout-button');
  const usersTableBody = document.querySelector('#users-table tbody');
  const addUserForm = document.getElementById('add-user-form');
  const errorMessageDiv = document.getElementById('error-message');

  // 現在のユーザー情報を取得して表示
  try {
    const response = await fetch('/api/me');
    if (response.ok) {
      const data = await response.json();
      usernameDisplay.textContent = `ログイン中: ${data.user.username} (${data.user.role})`;

      // 管理者でない場合はエラーメッセージを表示し、フォーム等を隠す（サーバー側でも弾かれるがUIとして）
      if (data.user.role !== 'admin') {
        document.body.innerHTML = '<h2>権限がありません</h2><p>このページにアクセスする権限がありません。</p><a href="/portal">ポータルに戻る</a>';
        return;
      }

      loadUsers();
    } else {
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('ユーザー情報の取得に失敗しました:', error);
  }

  // ログアウト処理
  logoutButton.addEventListener('click', async () => {
    try {
      const response = await fetch('/api/logout', { method: 'POST' });
      if (response.ok) {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('ログアウト処理に失敗しました:', error);
    }
  });

  // ユーザー一覧の取得と表示
  async function loadUsers() {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        renderUsers(data.users);
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'ユーザーの取得に失敗しました');
      }
    } catch (error) {
      console.error('ユーザーの取得に失敗しました:', error);
      showError('ユーザーの取得に失敗しました');
    }
  }

  // エラーメッセージの表示
  function showError(message) {
    errorMessageDiv.textContent = message;
    setTimeout(() => {
      errorMessageDiv.textContent = '';
    }, 5000);
  }

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

  // ユーザーテーブルの描画
  function renderUsers(users) {
    usersTableBody.innerHTML = '';
    users.forEach(user => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${user.id}</td>
        <td><input type="text" value="${escapeHTML(user.username)}" id="username-${user.id}"></td>
        <td>
          <select id="role-${user.id}">
            <option value="user" ${user.role === 'user' ? 'selected' : ''}>ユーザー</option>
            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>管理者</option>
          </select>
        </td>
        <td>
          <button class="btn update-btn" data-id="${user.id}">更新</button>
          <button class="btn btn-danger delete-btn" data-id="${user.id}">削除</button>
          <br><small>PW変更(空で維持):</small><input type="password" id="password-${user.id}" placeholder="新パスワード" style="width:100px;">
        </td>
      `;
      usersTableBody.appendChild(tr);
    });

    // 更新ボタンのイベントリスナー
    document.querySelectorAll('.update-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        const username = document.getElementById(`username-${id}`).value;
        const role = document.getElementById(`role-${id}`).value;
        const password = document.getElementById(`password-${id}`).value;

        await updateUser(id, username, role, password);
      });
    });

    // 削除ボタンのイベントリスナー
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        if (confirm('本当にこのユーザーを削除しますか？')) {
          await deleteUser(id);
        }
      });
    });
  }

  // ユーザー追加処理
  addUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;
    const role = document.getElementById('new-role').value;

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, role })
      });

      if (response.ok) {
        addUserForm.reset();
        loadUsers();
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'ユーザーの追加に失敗しました');
      }
    } catch (error) {
      console.error('ユーザーの追加に失敗しました:', error);
      showError('ユーザーの追加に失敗しました');
    }
  });

  // ユーザー更新処理
  async function updateUser(id, username, role, password) {
    try {
      const body = { username, role };
      if (password) {
        body.password = password;
      }

      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        loadUsers();
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'ユーザーの更新に失敗しました');
      }
    } catch (error) {
      console.error('ユーザーの更新に失敗しました:', error);
      showError('ユーザーの更新に失敗しました');
    }
  }

  // ユーザー削除処理
  async function deleteUser(id) {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadUsers();
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'ユーザーの削除に失敗しました');
      }
    } catch (error) {
      console.error('ユーザーの削除に失敗しました:', error);
      showError('ユーザーの削除に失敗しました');
    }
  }
});
