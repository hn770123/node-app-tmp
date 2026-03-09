const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/auth');

const API_BASE_URL = 'https://jsonplaceholder.typicode.com/posts';

/**
 * サーバー経由でJSONPlaceholder (GET) を実行するAPI
 */
router.get('/api/jsonplaceholder/posts', requireAuth, async (req, res) => {
  try {
    const limit = req.query._limit || 3;
    const response = await fetch(`${API_BASE_URL}?_limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('JSONPlaceholder GET Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * サーバー経由でJSONPlaceholder (POST) を実行するAPI
 */
router.post('/api/jsonplaceholder/posts', requireAuth, async (req, res) => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      body: JSON.stringify(req.body),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    const data = await response.json();
    res.status(201).json(data);
  } catch (error) {
    console.error('JSONPlaceholder POST Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * サーバー経由でJSONPlaceholder (PUT) を実行するAPI
 */
router.put('/api/jsonplaceholder/posts/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(req.body),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('JSONPlaceholder PUT Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * サーバー経由でJSONPlaceholder (DELETE) を実行するAPI
 */
router.delete('/api/jsonplaceholder/posts/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('JSONPlaceholder DELETE Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
