const express = require('express');
const router = express.Router();
const db = require('../db');

// GET - קבלת כל הפוסטים
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM posts';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('שגיאה בשליפת פוסטים:', err);
      res.status(500).json({ error: 'שגיאה בשרת' });
      return;
    }
    res.json(results);
  });
});

// GET - קבלת פוסט לפי ID
router.get('/:id', (req, res) => {
  const postId = req.params.id;
  const sql = 'SELECT * FROM posts WHERE id = ?';
  db.query(sql, [postId], (err, results) => {
    if (err) {
      console.error('שגיאה בשליפת פוסט:', err);
      res.status(500).json({ error: 'שגיאה בשרת' });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ message: 'פוסט לא נמצא' });
      return;
    }
    res.json(results[0]);
  });
});

// POST - הוספת פוסט חדש
router.post('/', (req, res) => {
  const { userId, title, body } = req.body;
  const sql = 'INSERT INTO posts (user_id, title, body) VALUES (?, ?, ?)';
  db.query(sql, [userId, title, body], (err, results) => {
    if (err) {
      console.error('שגיאה בהוספת פוסט:', err);
      res.status(500).json({ error: 'שגיאה בשרת' });
      return;
    }
    res.status(201).json({ message: 'פוסט נוסף בהצלחה', postId: results.insertId });
  });
});

// PUT - עדכון פוסט קיים
router.put('/:id', (req, res) => {
  const postId = req.params.id;
  const { userId, title, body } = req.body;
  const sql = 'UPDATE posts SET user_id = ?, title = ?, body = ? WHERE id = ?';
  db.query(sql, [userId, title, body, postId], (err, results) => {
    if (err) {
      console.error('שגיאה בעדכון פוסט:', err);
      res.status(500).json({ error: 'שגיאה בשרת' });
      return;
    }
    if (results.affectedRows === 0) {
      res.status(404).json({ message: 'פוסט לא נמצא' });
      return;
    }
    res.json({ message: 'פוסט עודכן בהצלחה' });
  });
});

// DELETE - מחיקת פוסט קיים
router.delete('/:id', (req, res) => {
  const postId = req.params.id;
  const sql = 'DELETE FROM posts WHERE id = ?';
  db.query(sql, [postId], (err, results) => {
    if (err) {
      console.error('שגיאה במחיקת פוסט:', err);
      res.status(500).json({ error: 'שגיאה בשרת' });
      return;
    }
    if (results.affectedRows === 0) {
      res.status(404).json({ message: 'פוסט לא נמצא' });
      return;
    }
    res.json({ message: 'פוסט נמחק בהצלחה' });
  });
});

module.exports = router;