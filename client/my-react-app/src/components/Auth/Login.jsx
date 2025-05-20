import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    function isEmailValid(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async function handleLogin() {
        if (!isEmailValid(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        try {
            const loginResponse = await fetch("http://localhost:3001/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email, password: password }),
            });

            if (loginResponse.ok) {
                const userData = await loginResponse.json();
                localStorage.setItem("currentUser", JSON.stringify({ id: userData.id, username: userData.username, email: userData.email }));
                alert("Login successful");
                navigate(`/users/${userData.id}/home`);
            } else {
                const errorData = await loginResponse.json();
                alert(`Login failed. Invalid email or password. Error: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            alert(`Network or server error. Please try again. Details: ${error.message}`);
        }
    }

    return (
        <div>
            <h2>Login</h2>
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
            <button onClick={handleLogin}>Login</button>
            <p>Don't have an account?</p>
            <button onClick={() => navigate("/register")}>Go to Register</button>
        </div>
    );
}

export default Login;