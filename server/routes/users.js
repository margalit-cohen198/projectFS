const express = require('express');
const router = express.Router();
const db = require('../db'); // נניח שיצרנו קובץ db.js לחיבור למסד הנתונים
const { buildQuery } = require('../queryUtils');

// // נתיב GET לקבלת כל המשתמשים
// router.get('/', (req, res) => {
//   const sql = 'SELECT * FROM users';
//   db.query(sql, (err, results) => {
//     if (err) {
//       console.error('שגיאה בשליפת משתמשים:', err);
//       res.status(500).json({ error: 'שגיאה בשרת' });
//       return;
//     }
//     res.json(results);
//   });
// });

// GET - קבלת משתמשים עם אפשרות לסינון ומיין
router.get('/', (req, res) => {
  const { whereClause, orderBy, values } = buildQuery('users', req.query, {
    userId: 'user_id', // מיפוי אם שם הפרמטר ב-URL שונה משם העמודה ב-DB
    username:'username'
    // הוסף מיפויים נוספים לפי הצורך
  });

  const sql = `SELECT * FROM users ${whereClause} ${orderBy}`;

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error('שגיאה בשליפת משתמשים:', err);
      return res.status(500).json({ error: 'שגיאה בשרת' });
    }
    res.status(200).json(results);
  });
});


// נתיב GET לקבלת משתמש לפי ID
router.get('/:id', (req, res) => {
  const userId = req.params.id;
  const sql = 'SELECT * FROM users WHERE id = ?';
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('שגיאה בשליפת משתמש:', err);
      res.status(500).json({ error: 'שגיאה בשרת' });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ message: 'משתמש לא נמצא' });
      return;
    }
    res.json(results[0]);
  });
});

// נתיב POST להוספת משתמש חדש
router.post('/', (req, res) => {
  const { name, username, email, phone, website } = req.body;
  const sql = 'INSERT INTO users (name, username, email, phone, website) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [name, username, email, phone, website], (err, results) => {
    if (err) {
      console.error('שגיאה בהוספת משתמש:', err);
      res.status(500).json({ error: 'שגיאה בשרת' });
      return;
    }
    res.status(201).json({ message: 'משתמש נוסף בהצלחה', userId: results.insertId });
  });
});

// נתיב PUT לעדכון משתמש קיים
router.put('/:id', (req, res) => {
  const userId = parseInt(req.params.id); // ננסה להמיר ל-Integer
  const { name, username, email, phone, website } = req.body;
  const sql = 'UPDATE users SET name = ?, username = ?, email = ?, phone = ?, website = ? WHERE id = ?';
  db.query(sql, [name, username, email, phone, website, userId], (err, results) => {
    if (err) {
      console.error('שגיאה בעדכון משתמש:', err);
      res.status(500).json({ error: 'שגיאה בשרת' });
      return;
    }
    if (results.affectedRows === 0) {
      res.status(404).json({ message: 'משתמש לא נמצא' });
      return;
    }
    res.json({ message: 'משתמש עודכן בהצלחה' });
  });
});

// נתיב DELETE למחיקת משתמש קיים
router.delete('/:id', (req, res) => {
  const userId = parseInt(req.params.id); // ננסה להמיר ל-Integer
  const sql = 'DELETE FROM users WHERE id = ?';
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('שגיאה במחיקת משתמש:', err);
      res.status(500).json({ error: 'שגיאה בשרת' });
      return;
    }
    if (results.affectedRows === 0) {
      res.status(404).json({ message: 'משתמש לא נמצא' });
      return;
    }
    res.json({ message: 'משתמש נמחק בהצלחה' });
  });
});

module.exports = router;