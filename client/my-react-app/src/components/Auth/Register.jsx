import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordVerify, setPasswordVerify] = useState("");
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    function isEmailValid(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isPasswordValid(password) {
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
        return passwordRegex.test(password);
    }

    async function handleRegister() {
        if (!isEmailValid(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        if (!isPasswordValid(password)) {
            alert("Password must be at least 6 characters long and contain both letters and numbers.");
            return;
        }

        if (password !== passwordVerify) {
            alert("Passwords do not match!");
            return;
        }

        try {
            const registerResponse = await fetch("http://localhost:3001/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: username, email: email, website: password }),
            });

            if (registerResponse.ok) {
                const userData = await registerResponse.json();
                console.log("נתוני משתמש אחרי הרשמה:", userData);
                alert("Registration successful!");
                localStorage.setItem("currentUser", JSON.stringify({ id: userData.id, username: userData.username, email: userData.email }));
                navigate(`/users/${userData.id}/complete-registration`);
            } else {
                const errorData = await registerResponse.json();
                alert(`Registration failed. Please try again. Error: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            alert("Error:", error);
        }
    }

    return (
        <div>
            <h2>Register</h2>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <input
                type="password"
                placeholder="Verify Password"
                value={passwordVerify}
                onChange={(e) => setPasswordVerify(e.target.value)}
            />
            <button onClick={handleRegister}>Register</button>
            console.log()
        </div>
    );
}

export default Register;