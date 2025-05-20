import React from 'react';

function Info() {
    // כאן תוכל לשלוף את פרטי המשתמש מה-localStorage או מהשרת
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    return (
        <div>
            <h2>Your Information</h2>
            {currentUser && (
                <div>
                    <p><strong>ID:</strong> {currentUser.id}</p>
                    <p><strong>Username:</strong> {currentUser.username}</p>
                    <p><strong>Email:</strong> {currentUser.email}</p>
                    {currentUser.name && <p><strong>Name:</strong> {currentUser.name}</p>}
                    {currentUser.phone && <p><strong>Phone:</strong> {currentUser.phone}</p>}

                </div>
            )}
            {!currentUser && <p>Could not retrieve user information.</p>}
        </div>
    );
}

export default Info;