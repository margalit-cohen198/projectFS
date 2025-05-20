import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userId = currentUser?.id; // קבלת ה-userId מה-localStorage

    return (
        <div>
            <h2>ברוכים הבאים, {currentUser?.username || 'אורח'}!</h2>
            <p>בחר את הפעולה הרצויה:</p>
            <ul>
                <li>
                    <Link to={`/users/${userId}/info`}>מידע</Link>
                </li>
                <li>
                    <Link to={`/users/${userId}/posts`}>פוסטים</Link>
                </li>
                <li>
                    <Link to={`/users/${userId}/todos`}>משימות</Link>
                </li>
            </ul>
            {/* תוכן נוסף של עמוד הבית יוצג כאן */}
        </div>
    );
}

export default HomePage;