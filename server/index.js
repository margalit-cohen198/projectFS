const express = require('express');
const cors = require('cors');
const fs = require('fs');
const usersRouter = require('./routes/users.js');
const postsRouter = require('./routes/posts');
const commentsRouter = require('./routes/comments');
const todosRouter = require('./routes/todos');
const db = require('./db'); // ייבוא אובייקט החיבור ממודול db.js

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

function startServer() {
  // הגדרת הנתיבים
  app.use('/users', usersRouter);
  app.use('/posts', postsRouter);
  app.use('/comments', commentsRouter);
  app.use('/todos', todosRouter);

  // נתיב ברירת מחדל
  app.get('/', (req, res) => {
    res.send('השרת רץ בהצלחה!');
  });

  // הפעלת השרת
  app.listen(PORT, () => {
    console.log(`🚀 השרת פעיל על http://localhost:${PORT}`);
  });
}

// נקרא את קובץ הטבלאות
fs.readFile('./init.sql', 'utf8', (err, data) => {
  if (err) {
    console.error('שגיאה בקריאת קובץ init.sql:', err);
    // במקרה של שגיאה, אולי כדאי לנסות להפעיל את השרת בכל זאת או לטפל בשגיאה בצורה אחרת
    startServer();
    return;
  }
  const sqlCommands = data.split(';');
  sqlCommands.pop(); // הסרת פקודה ריקה בסוף הקובץ (אם יש)

  const runCommands = (commands) => {
    if (commands.length === 0) {
      console.log('📦 טבלאות נוצרו בהצלחה');
      startServer(); // הפעלת השרת רק לאחר יצירת הטבלאות
      return;
    }

    const currentCommand = commands.shift().trim();
    if (currentCommand) {
      console.log(`⏳ מנסה להריץ פקודה: ${currentCommand.substring(0, 50)}...`);
      db.query(currentCommand, (err, results) => {
        if (err) {
          console.error('❌ שגיאה בהרצת פקודה:', currentCommand, err);
          db.end();
          // במקרה של שגיאה, אולי כדאי לנסות להפעיל את השרת בכל זאת או לטפל בשגיאה בצורה אחרת
          startServer();
          return;
        }
        console.log(`✔️ פקודה בוצעה בהצלחה: ${currentCommand.substring(0, 50)}...`);
        runCommands(commands);
      });
    } else {
      runCommands(commands);
    }
  };

  runCommands(sqlCommands); // הפעלת הפונקציה כאן, לאחר הגדרתה
});

// במקרה שלא קראנו את init.sql מסיבה כלשהי (למשל, שגיאה מוקדמת),
// אפשר לשקול להפעיל את השרת כאן כגיבוי.
// אבל במצב הנוכחי, זה יופעל רק אם readFile נכשל סינכרונית.
// startServer();