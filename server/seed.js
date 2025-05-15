const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function seedDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Mc25082005', // שנה את הסיסמה שלך אם היא שונה
    database: 'my_project_db'
  });

  const saltRounds = 10; // מספר הסבבים להצפנה - ערך סביר לאבטחה

  try {
    // הכנסת משתמשים
    const [usersResult] = await connection.execute(`
      INSERT INTO users (name, username, email, phone, website) VALUES
      ('ארז כהן', 'erez123', 'erez@example.com', '050-1234567', 'erez.com'),
      ('שרה לוי', 'saralevi', 'sara@example.com', '052-8765432', 'sara.net'),
      ('יוסי מזרחי', 'yossim', 'yossi@example.com', '054-1122334', 'yossi.org')
    `);
    const userIds = [usersResult.insertId, usersResult.insertId + 1, usersResult.insertId + 2];
    console.log(`${usersResult.affectedRows} משתמשים הוכנסו.`);

    // הצפנת סיסמאות והכנסתן
    const hashedPassword1 = await bcrypt.hash('password123', saltRounds);
    const hashedPassword2 = await bcrypt.hash('securePass', saltRounds);
    const hashedPassword3 = await bcrypt.hash('mySecret', saltRounds);

    await connection.execute(`
      INSERT INTO passwords (user_id, password_hash) VALUES
      (?, ?),
      (?, ?),
      (?, ?)
    `, [userIds[0], hashedPassword1, userIds[1], hashedPassword2, userIds[2], hashedPassword3]);
    console.log(`${userIds.length} סיסמאות הוצפנו והוכנסו.`);

    // הכנסת פוסטים
    const [postsResult] = await connection.execute(`
      INSERT INTO posts (user_id, title, body) VALUES
      (?, 'הפוסט הראשון', 'תוכן הפוסט הראשון'),
      (?, 'פוסט שני בנושא מעניין', 'תוכן הפוסט השני'),
      (?, 'עוד פוסט אחד', 'סתם תוכן')
    `, [userIds[0], userIds[1], userIds[0]]);
    console.log(`${postsResult.affectedRows} פוסטים הוכנסו.`);

    const postIds = [postsResult.insertId, postsResult.insertId + 1, postsResult.insertId + 2];

    // הכנסת תגובות
    const [commentsResult] = await connection.execute(`
      INSERT INTO comments (post_id, name, email, body) VALUES
      (?, 'אורן', 'oren@example.com', 'תגובה מעניינת!'),
      (?, 'רחל', 'rachel@example.com', 'מסכים איתך.'),
      (?, 'דוד', 'david@example.com', 'פוסט מצוין!')
    `, [postIds[0], postIds[1], postIds[0]]);
    console.log(`${commentsResult.affectedRows} תגובות הוכנסו.`);

    // הכנסת מטלות
    const [todosResult] = await connection.execute(`
      INSERT INTO todos (user_id, title, completed) VALUES
      (?, 'לקנות חלב', false),
      (?, 'לנקות את הבית', false),
      (?, 'ללמוד NodeJS', true)
    `, [userIds[0], userIds[1], userIds[2]]);
    console.log(`${todosResult.affectedRows} מטלות הוכנסו.`);

    console.log('✅ מסד הנתונים אוכלס בהצלחה עם סיסמאות מוצפנות!');
  } catch (error) {
    console.error('❌ שגיאה באכלוס מסד הנתונים:', error);
  } finally {
    await connection.end();
  }
}

seedDatabase();