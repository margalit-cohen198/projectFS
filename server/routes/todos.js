const express = require('express');
const router = express.Router();
const db = require('../db');

// GET - קבלת כל המשימות
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM todos';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('שגיאה בשליפת משימות:', err);
            res.status(500).json({ error: 'שגיאה בשרת' });
            return;
        }
        res.json(results);
    });
});

// GET - קבלת משימה לפי ID
router.get('/:id', (req, res) => {
    const todoId = req.params.id;
    const sql = 'SELECT * FROM todos WHERE id = ?';
    db.query(sql, [todoId], (err, results) => {
        if (err) {
            console.error('שגיאה בשליפת משימה:', err);
            res.status(500).json({ error: 'שגיאה בשרת' });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ message: 'משימה לא נמצאה' });
            return;
        }
        res.json(results[0]);
    });
});

// POST - הוספת משימה חדשה
router.post('/', (req, res) => {
    const { userId, title, completed } = req.body;
    const sql = 'INSERT INTO todos (user_id, title, completed) VALUES (?, ?, ?)';
    db.query(sql, [userId, title, completed], (err, results) => {
        if (err) {
            console.error('שגיאה בהוספת משימה:', err);
            res.status(500).json({ error: 'שגיאה בשרת' });
            return;
        }
        res.status(201).json({ message: 'משימה נוספה בהצלחה', todoId: results.insertId });
    });
});

// PUT - עדכון משימה קיימת
router.put('/:id', (req, res) => {
    const todoId = req.params.id;
    const { userId, title, completed } = req.body;
    const sql = 'UPDATE todos SET user_id = ?, title = ?, completed = ? WHERE id = ?';
    db.query(sql, [userId, title, completed, todoId], (err, results) => {
        if (err) {
            console.error('שגיאה בעדכון משימה:', err);
            res.status(500).json({ error: 'שגיאה בשרת' });
            return;
        }
        if (results.affectedRows === 0) {
            res.status(404).json({ message: 'משימה לא נמצאה' });
            return;
        }
        res.json({ message: 'משימה עודכנה בהצלחה' });
    });
});

// DELETE - מחיקת משימה קיימת
router.delete('/:id', (req, res) => {
    const todoId = req.params.id;
    const sql = 'DELETE FROM todos WHERE id = ?';
    db.query(sql, [todoId], (err, results) => {
        if (err) {
            console.error('שגיאה במחיקת משימה:', err);
            res.status(500).json({ error: 'שגיאה בשרת' });
            return;
        }
        if (results.affectedRows === 0) {
            res.status(404).json({ message: 'משימה לא נמצאה' });
            return;
        }
        res.json({ message: 'משימה נמחקה בהצלחה' });
    });
});

module.exports = router;