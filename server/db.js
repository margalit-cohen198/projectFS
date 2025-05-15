const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Mc25082005', // שנה את הסיסמה שלך אם היא שונה
  database: 'my_project_db'
});

db.connect((err) => {
  if (err) {
    console.error('שגיאה בהתחברות למסד הנתונים:', err);
    return;
  }
  console.log('✅ התחברות למסד הנתונים (db.js) בוצעה בהצלחה!');
});

module.exports = db;