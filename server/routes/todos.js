const express = require('express');
const router = express.Router();
const db = require('../db');
const { buildQuery } = require('../queryUtils');


// // GET - קבלת כל המטלות
// router.get('/', (req, res) => {
//     const sql = 'SELECT * FROM todos';
//     db.query(sql, (err, results) => {
//         if (err) {
//             console.error('שגיאה בשליפת מטלות:', err);
//             return res.status(500).json({ error: 'שגיאה בשרת' });
//         }
//         res.status(200).json(results);
//     });
// });

// GET - קבלת המטלות עם אפשרות לסינון ומיין
router.get('/', (req, res) => {
    const { whereClause, orderBy, values } = buildQuery('todos', req.query, {
      userId: 'user_id', // מיפוי אם שם הפרמטר ב-URL שונה משם העמודה ב-DB
      completed: 'completed'
      // הוסף מיפויים נוספים לפי הצורך
    });
  
    const sql = `SELECT * FROM todos ${whereClause} ${orderBy}`;
  
    db.query(sql, values, (err, results) => {
      if (err) {
        console.error('שגיאה בשליפת מטלותם:', err);
        return res.status(500).json({ error: 'שגיאה בשרת' });
      }
      res.status(200).json(results);
    });
  });

// GET - קבלת מטלה לפי ID
router.get('/:id', (req, res) => {
    const todoId = parseInt(req.params.id);
    if (isNaN(todoId)) {
        return res.status(400).json({ error: 'ID מטלה לא תקין' });
    }
    const sql = 'SELECT * FROM todos WHERE id = ?';
    db.query(sql, [todoId], (err, results) => {
        if (err) {
            console.error('שגיאה בשליפת מטלה:', err);
            return res.status(500).json({ error: 'שגיאה בשרת' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'מטלה לא נמצאה' });
        }
        res.status(200).json(results[0]);
    });
});

// POST - הוספת מטלה חדשה
router.post('/', (req, res) => {
    const { userId, title, completed } = req.body;
    if (!userId || !title || completed === undefined) {
        return res.status(400).json({ error: 'יש לספק userId, title ו-completed' });
    }
    const sql = 'INSERT INTO todos (user_id, title, completed) VALUES (?, ?, ?)';
    db.query(sql, [userId, title, completed], (err, results) => {
        if (err) {
            console.error('שגיאה בהוספת מטלה:', err);
            return res.status(500).json({ error: 'שגיאה בשרת' });
        }
        res.status(201).json({ message: 'מטלה נוספה בהצלחה', todoId: results.insertId });
    });
});

// PUT - עדכון מטלה קיימת
router.put('/:id', (req, res) => {
    const todoId = parseInt(req.params.id);
    if (isNaN(todoId)) {
        return res.status(400).json({ error: 'ID מטלה לא תקין' });
    }
    const { userId, title, completed } = req.body;
    const sql = 'UPDATE todos SET user_id = ?, title = ?, completed = ? WHERE id = ?';
    db.query(sql, [userId, title, completed, todoId], (err, results) => {
        if (err) {
            console.error('שגיאה בעדכון מטלה:', err);
            return res.status(500).json({ error: 'שגיאה בשרת' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'מטלה לא נמצאה' });
        }
        res.status(200).json({ message: 'המטלה עודכנה בהצלחה' });
    });
});

// PATCH - עדכון חלקי של מטלה קיימת
router.patch('/:id', (req, res) => {
    const todoId = parseInt(req.params.id);
    if (isNaN(todoId)) {
        return res.status(400).json({ error: 'ID מטלה לא תקין' });
    }
    const { userId, title, completed } = req.body;
    const updates = {};
    if (userId) updates.user_id = userId;
    if (title) updates.title = title;
    if (completed !== undefined) updates.completed = completed;

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'אין שדות לעדכון' });
    }

    const sql = `UPDATE todos SET ? WHERE id = ?`;
    db.query(sql, [updates, todoId], (err, results) => {
        if (err) {
            console.error('שגיאה בעדכון חלקי של מטלה:', err);
            return res.status(500).json({ error: 'שגיאה בשרת' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'מטלה לא נמצאה' });
        }
        res.status(200).json({ message: 'המטלה עודכנה בהצלחה' });
    });
});

// DELETE - מחיקת מטלה קיימת
router.delete('/:id', (req, res) => {
    const todoId = parseInt(req.params.id);
    if (isNaN(todoId)) {
        return res.status(400).json({ error: 'ID מטלה לא תקין' });
    }
    const sql = 'DELETE FROM todos WHERE id = ?';
    db.query(sql, [todoId], (err, results) => {
        if (err) {
            console.error('שגיאה במחיקת מטלה:', err);
            return res.status(500).json({ error: 'שגיאה בשרת' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'מטלה לא נמצאה' });
        }
        res.status(200).json({ message: 'המטלה נמחקה בהצלחה' });
    });
});

// HEAD - קבלת מידע על כל המטלות (ללא גוף)
router.head('/', (req, res) => {
    const sql = 'SELECT COUNT(*) AS total FROM todos';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('שגיאה בשליפת מידע על מטלות:', err);
            return res.status(500).end();
        }
        res.setHeader('X-Total-Count', results[0].total);
        res.status(200).end();
    });
});

// HEAD - קבלת מידע על מטלה לפי ID (ללא גוף)
router.head('/:id', (req, res) => {
    const todoId = parseInt(req.params.id);
    if (isNaN(todoId)) {
        return res.status(400).end();
    }
    const sql = 'SELECT * FROM todos WHERE id = ?';
    db.query(sql, [todoId], (err, results) => {
        if (err) {
            console.error('שגיאה בשליפת מטלה:', err);
            return res.status(500).end();
        }
        if (results.length === 0) {
            return res.status(404).end();
        }
        res.status(200).end();
    });
});

// OPTIONS - קבלת רשימת שיטות HTTP נתמכות עבור /todos
router.options('/', (req, res) => {
    res.setHeader('Allow', 'GET, POST, HEAD, OPTIONS');
    res.status(200).end();
});

// OPTIONS - קבלת רשימת שיטות HTTP נתמכות עבור /todos/:id
router.options('/:id', (req, res) => {
    res.setHeader('Allow', 'GET, PUT, PATCH, DELETE, HEAD, OPTIONS');
    res.status(200).end();
});

module.exports = router;