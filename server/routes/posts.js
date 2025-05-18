const express = require('express');
const router = express.Router();
const db = require('../db');
const { buildQuery } = require('../queryUtils');

// GET - קבלת פוסטים עם אפשרות לסינון ומיין
router.get('/', (req, res) => {
  const { whereClause, orderBy, values } = buildQuery('posts', req.query, {
    userId: 'user_id', // מיפוי אם שם הפרמטר ב-URL שונה משם העמודה ב-DB
    title: 'title'
    // הוסף מיפויים נוספים לפי הצורך
  });

  const sql = `SELECT * FROM posts ${whereClause} ${orderBy}`;

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error('שגיאה בשליפת פוסטים:', err);
      return res.status(500).json({ error: 'שגיאה בשרת' });
    }
    res.status(200).json(results);
  });
});

// GET - קבלת פוסט לפי ID
router.get('/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  if (isNaN(postId)) {
    return res.status(400).json({ error: 'ID פוסט לא תקין' });
  }
  const sql = 'SELECT * FROM posts WHERE id = ?';
  db.query(sql, [postId], (err, results) => {
    if (err) {
      console.error('שגיאה בשליפת פוסט:', err);
      return res.status(500).json({ error: 'שגיאה בשרת' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'פוסט לא נמצא' });
    }
    res.status(200).json(results[0]);
  });
});

// POST - הוספת פוסט חדש
router.post('/', (req, res) => {
  const { userId, title, body } = req.body;
  if (!userId || !title || !body) {
    return res.status(400).json({ error: 'יש לספק userId, title ו-body' });
  }
  const sql = 'INSERT INTO posts (user_id, title, body) VALUES (?, ?, ?)';
  db.query(sql, [userId, title, body], (err, results) => {
    if (err) {
      console.error('שגיאה בהוספת פוסט:', err);
      return res.status(500).json({ error: 'שגיאה בשרת' });
    }
    res.status(201).json({ message: 'פוסט נוסף בהצלחה', postId: results.insertId });
  });
});

// PUT - עדכון פוסט קיים
router.put('/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  if (isNaN(postId)) {
    return res.status(400).json({ error: 'ID פוסט לא תקין' });
  }
  const { userId, title, body } = req.body;
  const sql = 'UPDATE posts SET user_id = ?, title = ?, body = ? WHERE id = ?';
  db.query(sql, [userId, title, body, postId], (err, results) => {
    if (err) {
      console.error('שגיאה בעדכון פוסט:', err);
      return res.status(500).json({ error: 'שגיאה בשרת' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'פוסט לא נמצא' });
    }
    res.status(200).json({ message: 'פוסט עודכן בהצלחה' });
  });
});

// PATCH - עדכון חלקי של פוסט קיים
router.patch('/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  if (isNaN(postId)) {
    return res.status(400).json({ error: 'ID פוסט לא תקין' });
  }
  const { userId, title, body } = req.body;
  const updates = {};
  if (userId) updates.user_id = userId;
  if (title) updates.title = title;
  if (body) updates.body = body;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'אין שדות לעדכון' });
  }

  const sql = `UPDATE posts SET ? WHERE id = ?`;
  db.query(sql, [updates, postId], (err, results) => {
    if (err) {
      console.error('שגיאה בעדכון חלקי של פוסט:', err);
      return res.status(500).json({ error: 'שגיאה בשרת' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'פוסט לא נמצא' });
    }
    res.status(200).json({ message: 'הפוסט עודכן בהצלחה' });
  });
});

// DELETE - מחיקת פוסט קיים (כולל מחיקת תגובות משויכות)
router.delete('/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  if (isNaN(postId)) {
    return res.status(400).json({ error: 'ID פוסט לא תקין' });
  }

  // שלב 1: מחיקת כל התגובות המשויכות לפוסט
  const deleteCommentsSql = 'DELETE FROM comments WHERE post_id = ?';
  db.query(deleteCommentsSql, [postId], (err, commentsResults) => {
    if (err) {
      console.error('שגיאה במחיקת תגובות עבור פוסט:', err);
      return res.status(500).json({ error: 'שגיאה בשרת בעת מחיקת תגובות' });
    }

    console.log(`נמחקו ${commentsResults.affectedRows} תגובות עבור פוסט ${postId}`);

    // שלב 2: מחיקת הפוסט עצמו לאחר מחיקת התגובות
    const deletePostSql = 'DELETE FROM posts WHERE id = ?';
    db.query(deletePostSql, [postId], (err, postResults) => {
      if (err) {
        console.error('שגיאה במחיקת פוסט:', err);
        return res.status(500).json({ error: 'שגיאה בשרת בעת מחיקת הפוסט' });
      }

      if (postResults.affectedRows === 0) {
        return res.status(404).json({ message: 'פוסט לא נמצא' });
      }

      res.status(200).json({ message: `הפוסט ${postId} והתגובות המשויכות נמחקו בהצלחה` });
    });
  });
});


// HEAD - קבלת מידע על כל הפוסטים (ללא גוף)
router.head('/', (req, res) => {
  const { whereClause, values } = buildQuery('posts', req.query, {
    userId: 'user_id',
    title: 'title'
  });
  const sql = `SELECT COUNT(*) AS total FROM posts ${whereClause}`;
  db.query(sql, values, (err, results) => {
    if (err) {
      console.error('שגיאה בשליפת מידע על פוסטים:', err);
      return res.status(500).end();
    }
    res.setHeader('X-Total-Count', results[0].total);
    res.status(200).end();
  });
});

// HEAD - קבלת מידע על פוסט לפי ID (ללא גוף)
router.head('/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  if (isNaN(postId)) {
    return res.status(400).end();
  }
  const sql = 'SELECT * FROM posts WHERE id = ?';
  db.query(sql, [postId], (err, results) => {
    if (err) {
      console.error('שגיאה בשליפת פוסט:', err);
      return res.status(500).end();
    }
    if (results.length === 0) {
      return res.status(404).end();
    }
    res.status(200).end();
  });
});

// OPTIONS - קבלת רשימת שיטות HTTP נתמכות עבור /posts
router.options('/', (req, res) => {
  res.setHeader('Allow', 'GET, POST, HEAD, OPTIONS');
  res.status(200).end();
});

// OPTIONS - קבלת רשימת שיטות HTTP נתמכות עבור /posts/:id
router.options('/:id', (req, res) => {
  res.setHeader('Allow', 'GET, PUT, PATCH, DELETE, HEAD, OPTIONS');
  res.status(200).end();
});

module.exports = router;