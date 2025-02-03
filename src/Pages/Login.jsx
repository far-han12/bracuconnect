import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { FaGithub, FaLinkedin } from "react-icons/fa";

const Login = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const navigate = useNavigate();

    // Validate email format
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
        <div style={styles.container}>
            <Toaster position="top-center" />
            <div style={styles.card}>
                <div style={styles.header}>
                    <h1 style={styles.title}>NotifySeat</h1>
                </div>

                <div style={styles.form}>
                    <h2>Login to NotifySeat</h2>
                    {!isOtpSent ? (
                        <div>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={styles.input}
                            />
                            <button onClick={handleSendOtp} style={styles.submitButton}>
                                Send OTP
                            </button>
                        </div>
                    ) : (
                        <div>
                            <input
                                type="text"
                                placeholder="Enter OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                style={styles.input}
                            />
                            <button onClick={handleVerifyOtp} style={styles.submitButton}>
                                Verify OTP
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <footer style={styles.footer}>
                <p>Developed by 
                    <span style={styles.dev}>
                        Tanvir Ishtiaq
                        <a href="https://github.com/TanvirXen" target="_blank" rel="noreferrer">
                            <FaGithub style={styles.icon} />
                        </a>
                        <a href="https://linkedin.com/in/tanvir-ishtiaq" target="_blank" rel="noreferrer">
                            <FaLinkedin style={styles.icon} />
                        </a>
                    </span>
                    &amp;
                    <span style={styles.dev}>
                        Farhan Mahmud
                        <a href="https://github.com/far-han12" target="_blank" rel="noreferrer">
                            <FaGithub style={styles.icon} />
                        </a>
                        <a href="https://linkedin.com/in/farhan-mahmud" target="_blank" rel="noreferrer">
                            <FaLinkedin style={styles.icon} />
                        </a>
                    </span>
                </p>
                <p>© {new Date().getFullYear()} All rights reserved</p>
            </footer>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',

        padding: '1rem',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        width: '100%',
        padding: '2rem',
        textAlign: 'center',
    },
    header: {
        marginBottom: '2rem',
    },
    title: {
        fontSize: '2rem',
        color: '#2563eb',
        margin: 0,
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    input: {
        padding: '0.8rem',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        fontSize: '1rem',
        width: '100%',
        boxSizing: 'border-box',
    },
    submitButton: {
        backgroundColor: '#2563eb',
        color: 'white',
        padding: '1rem',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '500',
    },
    footer: {
        textAlign: 'center',
        marginTop: '3rem',
        color: '#64748b',
        padding: '2rem',
        fontSize: '0.9rem',
    },
    dev: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        margin: '0 0.5rem',
    },
    icon: {
        fontSize: '1.2rem',
        color: '#475569',
        marginLeft: '0.5rem',
    },
};

export default Login;