const express = require('express');
const router = express.Router();
const db = require('../db'); // נניח שיצרנו קובץ db.js לחיבור למסד הנתונים
const { buildQuery } = require('../queryUtils');
const bcrypt = require('bcrypt');

// GET - קבלת משתמשים עם אפשרות לסינון ומיין
router.get('/', (req, res) => {
  const { whereClause, orderBy, values } = buildQuery('users', req.query, {
    userId: 'id',
    name: 'name',
    username: 'username',
    email: 'email',
    phone: 'phone',
    website: 'website'
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

// GET - קבלת משתמש לפי ID
router.get('/:id', (req, res) => {
  const userId = req.params.id;
  const sql = 'SELECT * FROM users WHERE id = ?';
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('שגיאה בשליפת משתמש:', err);
      return res.status(500).json({ error: 'שגיאה בשרת' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'משתמש לא נמצא' });
    }
    res.json(results[0]);
  });
});
//לבנות שאילתה מתאימה
// const sql = `SELECT * FROM users ${whereClause} ${orderBy}`;

// const sql = `SELECT * FROM users`;
// db.query(sql, values, (err, results) => {
//   if (err) {
//     console.error('שגיאה בשליפת משתמשים:', err);
//     return res.status(500).json({ error: 'שגיאה בשרת' });
//   }
//   res.status(200).json(results);
// });



// // GET - קבלת משתמש לפי ID
// router.get('/:id', (req, res) => {
//   const userId = req.params.id;
//   const sql = 'SELECT * FROM users WHERE id = ?';
//   db.query(sql, [userId], (err, results) => {
//     if (err) {
//       console.error('שגיאה בשליפת משתמש:', err);
//       return res.status(500).json({ error: 'שגיאה בשרת' });
//     }
//     if (results.length === 0) {
//       return res.status(404).json({ message: 'משתמש לא נמצא' });
//     }
//     res.json(results[0]);
//   });
// });

// POST - הוספת משתמש חדש (רישום)
router.post('/', async (req, res) => {
  const { username, email, website } = req.body;

  if (!username || !email || !website) {
    return res.status(400).json({ error: 'יש לספק שם משתמש, אימייל וסיסמה' });
  }

  try {
    // בדיקה אם האימייל כבר קיים
    const emailCheckSql = 'SELECT * FROM users WHERE email = ?';
    const [existingUsers] = await db.promise().query(emailCheckSql, [email]);

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'האימייל כבר רשום במערכת' });
    }

    // גיבוב הסיסמה
    const hashedPassword = await bcrypt.hash(website, 10);

    // הוספת המשתמש לטבלת users
    const userInsertSql = 'INSERT INTO users (username, email) VALUES (?, ?)';
    const [userResult] = await db.promise().query(userInsertSql, [username, email]);
    const newUserId = userResult.insertId;

    // הוספת הסיסמה המגובבת לטבלת passwords
    const passwordInsertSql = 'INSERT INTO passwords (user_id,  password_hash) VALUES (?, ?)';
    await db.promise().query(passwordInsertSql, [newUserId, hashedPassword]);

    res.status(201).json({ message: 'המשתמש נרשם בהצלחה', id: newUserId, username: username, email: email });
  } catch (error) {
    console.error('שגיאה ברישום משתמש:', error);
    res.status(500).json({ error: 'שגיאה בשרת בעת רישום משתמש' });
  }
});

// POST - התחברות משתמש (/login)
router.post('/login', async (req, res) => {
  console.log('בקשת Login התקבלה!');
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'יש לספק אימייל וסיסמה' });
  }

  try {
    // בדיקה אם קיים משתמש עם האימייל הזה
    const userSql = 'SELECT id, username FROM users WHERE email = ?';
    const [users] = await db.promise().query(userSql, [email]);

    if (users.length === 0) {
      return res.status(401).json({ error: 'אימייל או סיסמה לא נכונים' });
    }

    const user = users[0];

    // שליפת הסיסמה המגובבת מטבלת passwords
    const passwordSql = 'SELECT  password_hash FROM passwords WHERE user_id = ?';
    const [passwords] = await db.promise().query(passwordSql, [user.id]);

    if (passwords.length === 0) {
      return res.status(500).json({ error: 'שגיאה בשרת: סיסמה לא נמצאה עבור משתמש זה' });
    }

    const hashedPassword = passwords[0].password_hash;

    // השוואת הסיסמה שהוזנה עם הסיסמה המגובבת
    const passwordMatch = await bcrypt.compare(password, hashedPassword);

    if (passwordMatch) {
      res.status(200).json({ message: 'התחברות מוצלחת', id: user.id, username: user.username, email: user.email });
    } else {
      res.status(401).json({ error: 'אימייל או סיסמה לא נכונים' });
    }
  } catch (error) {
    console.error('שגיאה בהתחברות משתמש:', error);
    
    res.status(500).json({ error: 'שגיאה בשרת בעת התחברות' });
  }
});

// PUT - עדכון פרטי משתמש (פרופיל)
router.put('/:id', async (req, res) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'ID משתמש לא תקין' });
  }
  const { name, phone, website, username, email } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (phone) updates.phone = phone;
  if (username) updates.username = username;
  if (email) updates.email = email;
  if (website) updates.website = website;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'אין שדות לעדכון' });
  }

  const sql = 'UPDATE users SET ? WHERE id = ?';
  try {
    const [results] = await db.promise().query(sql, [updates, userId]);
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'משתמש לא נמצא' });
    }
    // שליפת המשתמש המעודכן כדי להחזיר אותו
    const [updatedUsers] = await db.promise().query('SELECT id, username, email, name, phone, website FROM users WHERE id = ?', [userId]);
    res.status(200).json(updatedUsers[0]);
  } catch (error) {
    console.error('שגיאה בעדכון משתמש:', error);
    res.status(500).json({ error: 'שגיאה בשרת בעת עדכון משתמש' });
  }
});

// DELETE - מחיקת משתמש קיים
router.delete('/:id', (req, res) => {
  const userId = parseInt(req.params.id); // ננסה להמיר ל-Integer
  const sql = 'DELETE FROM users WHERE id = ?';
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('שגיאה במחיקת משתמש:', err);
      return res.status(500).json({ error: 'שגיאה בשרת' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'משתמש לא נמצא' });
    }
    res.json({ message: 'משתמש נמחק בהצלחה' });
  });
});

module.exports = router;