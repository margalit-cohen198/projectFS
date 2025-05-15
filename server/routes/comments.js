const express = require('express');
const router = express.Router();
const db = require('../db');

// GET - קבלת כל התגובות
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM comments';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('שגיאה בשליפת תגובות:', err);
            res.status(500).json({ error: 'שגיאה בשרת' });
            return;
        }
        res.json(results);
    });
});

// GET - קבלת תגובה לפי ID
router.get('/:id', (req, res) => {
    const commentId = req.params.id;
    const sql = 'SELECT * FROM comments WHERE id = ?';
    db.query(sql, [commentId], (err, results) => {
        if (err) {
            console.error('שגיאה בשליפת תגובה:', err);
            res.status(500).json({ error: 'שגיאה בשרת' });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ message: 'תגובה לא נמצאה' });
            return;
        }
        res.json(results[0]);
    });
});

// POST - הוספת תגובה חדשה
router.post('/', (req, res) => {
    const { postId, name, email, body } = req.body;
    const sql = 'INSERT INTO comments (post_id, name, email, body) VALUES (?, ?, ?, ?)';
    db.query(sql, [postId, name, email, body], (err, results) => {
        if (err) {
            console.error('שגיאה בהוספת תגובה:', err);
            res.status(500).json({ error: 'שגיאה בשרת' });
            return;
        }
        res.status(201).json({ message: 'תגובה נוספה בהצלחה', commentId: results.insertId });
    });
});

// PUT - עדכון תגובה קיימת
router.put('/:id', (req, res) => {
    const commentId = req.params.id;
    const { postId, name, email, body } = req.body;
    const sql = 'UPDATE comments SET post_id = ?, name = ?, email = ?, body = ? WHERE id = ?';
    db.query(sql, [postId, name, email, body, commentId], (err, results) => {
        if (err) {
            console.error('שגיאה בעדכון תגובה:', err);
            res.status(500).json({ error: 'שגיאה בשרת' });
            return;
        }
        if (results.affectedRows === 0) {
            res.status(404).json({ message: 'תגובה לא נמצאה' });
            return;
        }
        res.json({ message: 'תגובה עודכנה בהצלחה' });
    });
});

// DELETE - מחיקת תגובה קיימת
router.delete('/:id', (req, res) => {
    const commentId = req.params.id;
    const sql = 'DELETE FROM comments WHERE id = ?';
    db.query(sql, [commentId], (err, results) => {
        if (err) {
            console.error('שגיאה במחיקת תגובה:', err);
            res.status(500).json({ error: 'שגיאה בשרת' });
            return;
        }
        if (results.affectedRows === 0) {
            res.status(404).json({ message: 'תגובה לא נמצאה' });
            return;
        }
        res.json({ message: 'תגובה נמחקה בהצלחה' });
    });
});

module.exports = router;