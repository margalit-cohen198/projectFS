const express = require('express');
const router = express.Router();
const db = require('../db');
const { buildQuery } = require('../queryUtils');

// GET - קבלת כל התגובות (אפשרות עם סינון כללי)
router.get('/', (req, res) => {
    const { whereClause, orderBy, values } = buildQuery('comments', req.query, {
        postid: 'post_id', // מאפשר סינון לפי post_id בשאילתה
        // הוסף מיפויים נוספים לסינון לפי הצורך
    });

    const sql = `SELECT * FROM comments ${whereClause} ${orderBy}`;

    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('שגיאה בשליפת תגובות:', err);
            return res.status(500).json({ error: 'שגיאה בשרת' });
        }
        res.status(200).json(results);
    });
});

// GET - קבלת תגובות עבור פוסט ספציפי
router.get('/post/:postId', (req, res) => {
    const postId = parseInt(req.params.postId);
    if (isNaN(postId)) {
        return res.status(400).json({ error: 'ID פוסט לא תקין' });
    }
    const sql = 'SELECT * FROM comments WHERE post_id = ?';
    db.query(sql, [postId], (err, results) => {
        if (err) {
            console.error('שגיאה בשליפת תגובות עבור פוסט:', err);
            return res.status(500).json({ error: 'שגיאה בשרת' });
        }
        res.status(200).json(results);
    });
});

// GET - קבלת תגובה לפי ID
router.get('/:id', (req, res) => {
    const commentId = parseInt(req.params.id);
    if (isNaN(commentId)) {
        return res.status(400).json({ error: 'ID תגובה לא תקין' });
    }
    const sql = 'SELECT * FROM comments WHERE id = ?';
    db.query(sql, [commentId], (err, results) => {
        if (err) {
            console.error('שגיאה בשליפת תגובה:', err);
            return res.status(500).json({ error: 'שגיאה בשרת' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'תגובה לא נמצאה' });
        }
        res.status(200).json(results[0]);
    });
});

// POST - הוספת תגובה חדשה
router.post('/', (req, res) => {
    const { postId, userId, body } = req.body;
    if (!postId || !userId || !body) {
        return res.status(400).json({ error: 'יש לספק postId, userId ו-body' });
    }
    const sql = 'INSERT INTO comments (post_id, user_id, body) VALUES (?, ?, ?)';
    db.query(sql, [postId, userId, body], (err, results) => {
        if (err) {
            console.error('שגיאה בהוספת תגובה:', err);
            return res.status(500).json({ error: 'שגיאה בשרת' });
        }
        res.status(201).json({ message: 'תגובה נוספה בהצלחה', commentId: results.insertId });
    });
});

// PUT - עדכון תגובה קיימת
router.put('/:id', (req, res) => {
    const commentId = parseInt(req.params.id);
    if (isNaN(commentId)) {
        return res.status(400).json({ error: 'ID תגובה לא תקין' });
    }
    const { postId, userId, body } = req.body;
    const sql = 'UPDATE comments SET post_id = ?, user_id = ?, body = ? WHERE id = ?';
    db.query(sql, [postId, userId, body, commentId], (err, results) => {
        if (err) {
            console.error('שגיאה בעדכון תגובה:', err);
            return res.status(500).json({ error: 'שגיאה בשרת' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'תגובה לא נמצאה' });
        }
        res.status(200).json({ message: 'התגובה עודכנה בהצלחה' });
    });
});

// PATCH - עדכון חלקי של תגובה קיימת
router.patch('/:id', (req, res) => {
    const commentId = parseInt(req.params.id);
    if (isNaN(commentId)) {
        return res.status(400).json({ error: 'ID תגובה לא תקין' });
    }
    const { postId, userId, body } = req.body;
    const updates = {};
    if (postId) updates.post_id = postId;
    if (userId) updates.user_id = userId;
    if (body) updates.body = body;

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'אין שדות לעדכון' });
    }

    const sql = `UPDATE comments SET ? WHERE id = ?`;
    db.query(sql, [updates, commentId], (err, results) => {
        if (err) {
            console.error('שגיאה בעדכון חלקי של תגובה:', err);
            return res.status(500).json({ error: 'שגיאה בשרת' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'תגובה לא נמצאה' });
        }
        res.status(200).json({ message: 'התגובה עודכנה בהצלחה' });
    });
});

// DELETE - מחיקת תגובה לפי ID
router.delete('/:id', (req, res) => {
    const commentId = parseInt(req.params.id);
    if (isNaN(commentId)) {
        return res.status(400).json({ error: 'ID תגובה לא תקין' });
    }
    const sql = 'DELETE FROM comments WHERE id = ?';
    db.query(sql, [commentId], (err, results) => {
        if (err) {
            console.error('שגיאה במחיקת תגובה:', err);
            return res.status(500).json({ error: 'שגיאה בשרת' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'תגובה לא נמצאה' });
        }
        res.status(200).json({ message: 'התגובה נמחקה בהצלחה' });
    });
});

// DELETE - מחיקת תגובות לפי post_id
router.delete('/byPost/:postId', (req, res) => {
    const postId = parseInt(req.params.postId);
    if (isNaN(postId)) {
        return res.status(400).json({ error: 'ID פוסט לא תקין' });
    }
    const sql = 'DELETE FROM comments WHERE post_id = ?';
    db.query(sql, [postId], (err, results) => {
        if (err) {
            console.error('שגיאה במחיקת תגובות לפי post_id:', err);
            return res.status(500).json({ error: 'שגיאה בשרת' });
        }
        res.status(200).json({ message: `נמחקו ${results.affectedRows} תגובות עבור פוסט ${postId}` });
    });
});

// HEAD - קבלת מידע על כל התגובות (ללא גוף)
router.head('/', (req, res) => {
    const sql = 'SELECT COUNT(*) AS total FROM comments';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('שגיאה בשליפת מידע על תגובות:', err);
            return res.status(500).end();
        }
        res.setHeader('X-Total-Count', results[0].total);
        res.status(200).end();
    });
});

// HEAD - קבלת מידע על תגובה לפי ID (ללא גוף)
router.head('/:id', (req, res) => {
    const commentId = parseInt(req.params.id);
    if (isNaN(commentId)) {
        return res.status(400).end();
    }
    const sql = 'SELECT * FROM comments WHERE id = ?';
    db.query(sql, [commentId], (err, results) => {
        if (err) {
            console.error('שגיאה בשליפת תגובה:', err);
            return res.status(500).end();
        }
        if (results.length === 0) {
            return res.status(404).end();
        }
        res.status(200).end();
    });
});

// OPTIONS - קבלת רשימת שיטות HTTP נתמכות עבור /comments
router.options('/', (req, res) => {
    res.setHeader('Allow', 'GET, POST, HEAD, OPTIONS');
    res.status(200).end();
});

// OPTIONS - קבלת רשימת שיטות HTTP נתמכות עבור /comments/:id
router.options('/:id', (req, res) => {
    res.setHeader('Allow', 'GET, PUT, DELETE, PATCH, HEAD, OPTIONS');
    res.status(200).end();
});

// OPTIONS - קבלת רשימת שיטות HTTP נתמכות עבור /comments/byPost/:postId
router.options('/byPost/:postId', (req, res) => {
    res.setHeader('Allow', 'DELETE, OPTIONS');
    res.status(200).end();
});

// OPTIONS - קבלת רשימת שיטות HTTP נתמכות עבור /comments/post/:postId
router.options('/post/:postId', (req, res) => {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    res.status(200).end();
});

module.exports = router;