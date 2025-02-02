import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'; // Import updated CSS file
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast'; // Import React Hot Toast

const Login = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const navigate = useNavigate(); // Initialize useNavigate

    // Validate email format
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple regex for email validation
        return emailRegex.test(email);
    };

    const handleSendOtp = async () => {
        if (!email) {
            toast.error('Email is required.');
            return;
        }

        if (!isValidEmail(email)) {
            toast.error('Invalid email format.');
            return;
        }

        try {
            const response = await axios.post('https://api.malaysiabdmartshop.com/api/send-otp', { email });
            if (response.data.message === "OTP sent successfully") {
                setIsOtpSent(true);
                toast.success('OTP sent to your email.');
            } else {
                toast.error('Failed to send OTP.');
            }
        } catch (error) {
            toast.error('Failed to send OTP.');
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            toast.error('OTP is required.');
            return;
        }

        try {
            const response = await axios.post('https://api.malaysiabdmartshop.com/api/verify-otp', { email, otp });
            if (response.data.message === "OTP verified successfully") {
                localStorage.setItem('token', response.data.token);
                toast.success('OTP verified successfully. You are now logged in.');
                setTimeout(() => {
                    navigate('/'); // Redirect to home page
                }, 1500);
            } else {
                toast.error('Failed to verify OTP.');
            }
        } catch (error) {
            toast.error('Failed to verify OTP.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Login to</h2>
                {!isOtpSent ? (
                    <div>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
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
                            }}
                            className="input-field"
                        />
                        <button onClick={handleVerifyOtp} className="btn verify-btn">
                            Verify OTP
                        </button>
                    </div>
                )}
             
            </div>
        </div>
    );
};

export default Login;
