const express = require('express');
const router = express.Router();
const db = require('../db');
const { buildQuery } = require('../queryUtils');

router.get('/', (req, res) => {
    const { userId } = req.query; // קבלת userId מפרמטר השאילתה
    let sql = 'SELECT * FROM todos';
    const values = [];
    if (userId) {
        sql += ' WHERE user_id = ?';
        values.push(userId);
    }
    sql += ' ORDER BY id'; // הוספת סדר ברירת מחדל

    console.log('SQL Query (Todos):', sql, 'Values (Todos):', values); // לוג לבדיקה

    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('שגיאה בשליפת מטלות:', err);
            return res.status(500).json({ error: 'שגיאה בשרת' });
        }
        res.status(200).json(results);
    });
});

// GET - קבלת מטלה ספציפית של משתמש ספציפי (דרך פרמטר בשאילתה)
router.get('/:id', (req, res) => {
    const todoId = parseInt(req.params.id);
    const userId = req.query.userId;
    if (isNaN(todoId) || !userId) {
        return res.status(400).json({ error: 'יש לספק ID מטלה ו-userId בשאילתה' });
    }
    const sql = 'SELECT * FROM todos WHERE id = ? AND user_id = ?';
    db.query(sql, [todoId, userId], (err, results) => {
        if (err) {
            console.error('שגיאה בשליפת מטלה:', err);
            return res.status(500).json({ error: 'שגיאה בשרת' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'מטלה לא נמצאה עבור משתמש זה' });
        }
        res.status(200).json(results[0]);
    });
});

// POST - הוספת מטלה חדשה עבור משתמש ספציפי (דרך body)
router.post('/', (req, res) => {
    const { userId, title } = req.body;
    if (!userId || !title) {
        return res.status(400).json({ error: 'יש לספק userId וכותרת למטלה בגוף הבקשה' });
    }
    const sql = 'INSERT INTO todos (user_id, title, completed) VALUES (?, ?, ?)';
    db.query(sql, [userId, title, false], (err, results) => {
        if (err) {
            console.error('שגיאה בהוספת מטלה:', err);
            return res.status(500).json({ error: 'שגיאה בשרת' });
        }
        res.status(201).json({ id: results.insertId, userId, title, completed: false });
    });
});

// PUT - עדכון מטלה קיימת של משתמש ספציפי (דרך body ופרמטר בשאילתה)
router.put('/:id', (req, res) => {
    const todoId = parseInt(req.params.id);
    const { userId, title, completed } = req.body;
    if (isNaN(todoId) || !userId) {
        return res.status(400).json({ error: 'יש לספק ID מטלה ו-userId בגוף הבקשה' });
    }
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (completed !== undefined) updates.completed = completed;

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'אין שדות לעדכון' });
    }

    const sql = 'UPDATE todos SET ? WHERE id = ? AND user_id = ?';
    db.query(sql, [updates, todoId, userId], (err, results) => {
        if (err) {
            console.error('שגיאה בעדכון מטלה:', err);
            return res.status(500).json({ error: 'שגיאה בשרת' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'מטלה לא נמצאה עבור משתמש זה' });
        }
        res.status(200).json({ message: 'המטלה עודכנה בהצלחה' });
    });
});

// DELETE - מחיקת מטלה קיימת של משתמש ספציפי (דרך פרמטר בשאילתה)
router.delete('/:id', (req, res) => {
    const todoId = parseInt(req.params.id);
    const userId = req.query.userId;
    if (isNaN(todoId) || !userId) {
        return res.status(400).json({ error: 'יש לספק ID מטלה ו-userId בשאילתה' });
    }
    const sql = 'DELETE FROM todos WHERE id = ? AND user_id = ?';
    db.query(sql, [todoId, userId], (err, results) => {
        if (err) {
            console.error('שגיאה במחיקת מטלה:', err);
            return res.status(500).json({ error: 'שגיאה בשרת' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'מטלה לא נמצאה עבור משתמש זה' });
        }
        res.status(200).json({ message: 'המטלה נמחקה בהצלחה' });
    });
});

module.exports = router;