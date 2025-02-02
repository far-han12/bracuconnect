import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'; // Import CSS file
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false); // To differentiate error and success messages
    const navigate = useNavigate(); // Initialize useNavigate
    // Validate email format
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple regex for email validation
        return emailRegex.test(email);
    };

    const handleSendOtp = async () => {
        if (!email) {
            setMessage('Email is required.');
            setIsError(true); // Mark as error
            return;
        }

        if (!isValidEmail(email)) {
            setMessage('Invalid email format.');
            setIsError(true); // Mark as error
            return;
        }

        console.log("Sending OTP to:", email);
        try {
            const response = await axios.post('https://api.malaysiabdmartshop.com/api/send-otp', { email });
            console.log("Send OTP Response:", response.data);
            if (response.data.message === "OTP sent successfully") {
                setIsOtpSent(true);
                setMessage('OTP sent to your email.');
                setIsError(false); // Mark as success
            } else {
                setMessage('Failed to send OTP.');
                setIsError(true); // Mark as error
            }
        } catch (error) {
            console.error("Send OTP Error:", error);
            setMessage('Failed to send OTP.');
            setIsError(true); // Mark as error
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            setMessage('OTP is required.');
            setIsError(true); // Mark as error
            return;
        }

        console.log("Verifying OTP:", otp, "for email:", email);
        try {
            const response = await axios.post('https://api.malaysiabdmartshop.com/api/verify-otp', { email, otp });
            console.log("Verify OTP Response:", response.data);
            if (response.data.message === "OTP verified successfully") {
                console.log("Token received:", response.data.token);
                localStorage.setItem('token', response.data.token);
                setMessage('OTP verified successfully. You are now logged in.');
                setIsError(false); // Mark as success
                setTimeout(() => {
                    navigate('/'); // Redirect to home page
                }, 1000); 
            } else {
                setMessage('Failed to verify OTP.');
                setIsError(true); // Mark as error
            }
        } catch (error) {
            console.error("Verify OTP Error:", error);
            setMessage('Failed to verify OTP.');
            setIsError(true); // Mark as error
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Login</h2>
                {!isOtpSent ? (
                    <div>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setMessage(''); // Clear message on change
                            }}
                            className="input-field"
                        />
                        <button onClick={handleSendOtp} className="btn send-btn">
                            Send OTP
                        </button>
                    </div>
                ) : (
                    <div>
                        <input
                            type="text"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => {
                                setOtp(e.target.value);
                                setMessage(''); // Clear message on change
                            }}
                            className="input-field"
                        />
                        <button onClick={handleVerifyOtp} className="btn verify-btn">
                            Verify OTP
                        </button>
                    </div>
                )}
                {message && (
                    <p className={`message ${isError ? 'error-message' : 'success-message'}`}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default Login;
