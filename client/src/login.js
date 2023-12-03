import React, { useState } from 'react';
import './login.css';

function Login(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showSuccessPopup, setShowSuccessPopup] = useState(false); // New state for popup visibility
    const [showErrorPopup, setShowErrorPopup] = useState(false); // New state for error popup visibility



    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                setShowErrorPopup(true);

                throw new Error('Login failed');
            }

            const data = await response.json();
            setShowSuccessPopup(true); // Show the popup
            props.onLoginSuccess(data.token);
            // Store the token in the session storage or state management

        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    const handleClosePopup = () => {
        setShowSuccessPopup(false); // Hide the popup
    };

    const handleCloseErrorPopup = () => {
        setShowErrorPopup(false); // Hide the error popup
    };


    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label>Email:</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                    <label>Password:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit">Login</button>
            </form>
            {showErrorPopup && (
                <div className="login-error-popup">
                    <p>Unsuccessful Login</p>
                    <button onClick={handleCloseErrorPopup}>x</button>
                </div>
            )}

            {showSuccessPopup && (
                <div className="login-success-popup">
                    <p>Successfully logged in</p>
                    <button onClick={handleClosePopup}>x</button>
                </div>
            )}
        </div>
    );
}

export default Login;
