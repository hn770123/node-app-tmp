document.addEventListener('DOMContentLoaded', () => {
  const resultOutput = document.getElementById('result-output');
  const payloadPreview = document.getElementById('payload-preview');

  const btnGet = document.getElementById('btn-get');
  const btnPost = document.getElementById('btn-post');
  const btnPut = document.getElementById('btn-put');
  const btnDelete = document.getElementById('btn-delete');

  const btnServerGet = document.getElementById('btn-server-get');
  const btnServerPost = document.getElementById('btn-server-post');
  const btnServerPut = document.getElementById('btn-server-put');
  const btnServerDelete = document.getElementById('btn-server-delete');

  const API_BASE_URL = 'https://jsonplaceholder.typicode.com/posts';
  const SERVER_API_BASE_URL = '/api/jsonplaceholder/posts';

  // POST / PUT で送信するハードコードされたデータ
  const payloadData = {
    title: 'テストタイトル',
    body: 'これはテスト用の本文です。JSONPlaceholderへ送信されます。',
    userId: 1,
  };

  // 送信予定データをプレビューに表示
  payloadPreview.textContent = JSON.stringify(payloadData, null, 2);

  // 結果を表示するためのヘルパー関数
  const showResult = (data) => {
    resultOutput.textContent = JSON.stringify(data, null, 2);
  };

  const showError = (error) => {
    resultOutput.textContent = `エラーが発生しました:\n${error.message}`;
  };

  const showLoading = () => {
    resultOutput.textContent = '通信中...';
  };

  // GET: データ一覧の取得 (最初の3件だけ表示)
  btnGet.addEventListener('click', async () => {
    showLoading();
    try {
      const response = await fetch(`${API_BASE_URL}?_limit=3`);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      showResult(data);
    } catch (error) {
      showError(error);
    }
  });

  // POST: 新規データの作成
  btnPost.addEventListener('click', async () => {
    showLoading();
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        body: JSON.stringify(payloadData),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      });
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      showResult(data);
    } catch (error) {
      showError(error);
    }
  });

  // PUT: 既存データの更新 (ID=1 を更新)
  btnPut.addEventListener('click', async () => {
    showLoading();
    try {
      const response = await fetch(`${API_BASE_URL}/1`, {
        method: 'PUT',
        body: JSON.stringify({ ...payloadData, id: 1 }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      });
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      showResult(data);
    } catch (error) {
      showError(error);
    }
  });

  // DELETE: データの削除 (ID=1 を削除)
  btnDelete.addEventListener('click', async () => {
    showLoading();
    try {
      const response = await fetch(`${API_BASE_URL}/1`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      // JSONPlaceholderのDELETEは空のオブジェクトを返す
      const data = await response.json();
      showResult(data);
    } catch (error) {
      showError(error);
    }
  });

  // --- サーバー経由でのアクセス ---

  // サーバー経由 GET
  btnServerGet.addEventListener('click', async () => {
    showLoading();
    try {
      const response = await fetch(`${SERVER_API_BASE_URL}?_limit=3`);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      showResult(data);
    } catch (error) {
      showError(error);
    }
  });

  // サーバー経由 POST
  btnServerPost.addEventListener('click', async () => {
    showLoading();
    try {
      const response = await fetch(SERVER_API_BASE_URL, {
        method: 'POST',
        body: JSON.stringify(payloadData),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      });
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      showResult(data);
    } catch (error) {
      showError(error);
    }
  });

  // サーバー経由 PUT
  btnServerPut.addEventListener('click', async () => {
    showLoading();
    try {
      const response = await fetch(`${SERVER_API_BASE_URL}/1`, {
        method: 'PUT',
        body: JSON.stringify({ ...payloadData, id: 1 }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      });
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      showResult(data);
    } catch (error) {
      showError(error);
    }
  });

  // サーバー経由 DELETE
  btnServerDelete.addEventListener('click', async () => {
    showLoading();
    try {
      const response = await fetch(`${SERVER_API_BASE_URL}/1`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      showResult(data);
    } catch (error) {
      showError(error);
    }
  });
});
