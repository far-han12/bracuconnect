import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { FaGithub,FaLinkedin } from "react-icons/fa";
const Home = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('addCourse');
    const [name, setName] = useState('');
    const [course, setCourse] = useState('');
    const [section, setSection] = useState('');
    const [emailInterval, setEmailInterval] = useState(20);
    const [userEmail, setUserEmail] = useState('');
    const [courses, setCourses] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            toast.error("Authentication failed. Redirecting to login...");
            navigate('/login');
            return;
        }

        try {
            const decodedToken = jwtDecode(token);
            if (!decodedToken || !decodedToken.email) {
                throw new Error("Invalid token structure");
            }
            setUserEmail(decodedToken.email);
        } catch (error) {
            toast.error("Invalid or expired token. Redirecting to login...");
            localStorage.removeItem('token');
            navigate('/login');
        }
    }, [navigate, token]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
        toast.success("Logged out successfully");
    };

    const handleAddCourse = async (e) => {
        e.preventDefault();
        if (!token || isSubmitting) return;

        setIsSubmitting(true);

        const emailIntervalMs = Math.max(emailInterval * 60000, 1000);
        try {
            await axios.post(
                'https://api.malaysiabdmartshop.com/api/add-student',
                { userEmail, name, course, section, emailInterval: emailIntervalMs },
                { headers: { 'x-auth-token': token, 'Content-Type': 'application/json' } }
            );

            toast.success("Course added successfully!");
            setName('');
            setCourse('');
            setSection('');
            setEmailInterval(20);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add course.");
        }
        setIsSubmitting(false);
    };

    const handleGetCourses = async () => {
        try {
            const response = await axios.post(
                'https://api.malaysiabdmartshop.com/api/get-student',
                { email: userEmail },
                { headers: { 'x-auth-token': token, 'Content-Type': 'application/json' } }
            );

            setCourses(response.data.userData || []);
            toast.success("Courses fetched successfully!");
        } catch (error) {
            toast.error("Failed to fetch courses.");
        }
    };

    const handleDeleteCourse = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (!result.isConfirmed) return;

        try {
            await axios.delete(
                `https://api.malaysiabdmartshop.com/api/delete-student/${id}`,
                { headers: { 'x-auth-token': token, 'Content-Type': 'application/json' } }
            );

            setCourses(courses.filter(course => course._id !== id));
            toast.success("Course deleted successfully!");
        } catch (error) {
            toast.error("Failed to delete course.");
        }
    };

    return (
        <div>
            <Toaster position="top-center" reverseOrder={false} />

            <div style={containerStyle}>
                <div style={cardStyle}>
                    <div style={headerContainerStyle}>
                        <h1 style={headerStyle}>Welcome to the Home Page</h1>
                        <button onClick={handleLogout} style={logoutButtonStyle}>Logout</button>
                    </div>

                    <div style={tabsContainerStyle}>
                        <button onClick={() => setActiveTab('addCourse')} style={activeTab === 'addCourse' ? tabStyleActive : tabStyle}>Add Course</button>
                        <button onClick={() => setActiveTab('getCourses')} style={activeTab === 'getCourses' ? tabStyleActive : tabStyle}>Courses</button>
                    </div>

                    {activeTab === 'addCourse' && (
                        <form onSubmit={handleAddCourse} style={formStyle}>
                            <input type="text" value={userEmail} className="input-field" readOnly placeholder="Email" />
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" required placeholder="Name" />
                            <input type="text" value={course} onChange={(e) => setCourse(e.target.value)} className="input-field" required placeholder="Course" />
                            <input type="text" value={section} onChange={(e) => setSection(e.target.value)} className="input-field" required placeholder="Section" />
                            <label>Email Interval (minutes)</label>
                            <input type="number" value={emailInterval} onChange={(e) => setEmailInterval(Math.max(e.target.value, 1))} className="input-field" required min="1" />
                            <button type="submit" style={buttonStyle} disabled={isSubmitting}>Add Course</button>
                        </form>
                    )}

                    {activeTab === 'getCourses' && (
                        <div>
                            <button onClick={handleGetCourses} style={buttonStyle}>Get Courses</button>
                            {courses.length > 0 && (
                                <table style={tableStyle}>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Course</th>
                                            <th>Section</th>
                                            <th>Email Interval (minutes)</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {courses.map((course, index) => (
                                            <tr key={index}>
                                                <td>{course.name}</td>
                                                <td>{course.course}</td>
                                                <td>{course.section}</td>
                                                <td>{(course.emailInterval / 60000).toFixed(2)}</td>
                                                <td><button onClick={() => handleDeleteCourse(course._id)} style={deleteButtonStyle}>Delete</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <footer style={footerStyle}>
    <p style={footerTextStyle}>
        Developed by 
        <span style={developerStyle}>
            Tanvir Ishtiaq 
            <a href="https://github.com/TanvirXen" target="_blank" rel="noopener noreferrer" style={socialLinkStyle}>
                <FaGithub size={20} />
            </a>
            <a href="https://www.linkedin.com/in/tanvir-ishtiaq/" target="_blank" rel="noopener noreferrer" style={socialLinkStyle}>
                <FaLinkedin size={20} />
            </a>
        </span>
        <span>&</span>
        <span style={developerStyle}>
            Farhan Mahmud 
            <a href="https://github.com/far-han12" target="_blank" rel="noopener noreferrer" style={socialLinkStyle}>
                <FaGithub size={20} />
            </a>
            <a href="https://www.linkedin.com/in/farhan-mahmud/" target="_blank" rel="noopener noreferrer" style={socialLinkStyle}>
                <FaLinkedin size={20} />
            </a>
        </span>
    </p>
    <p>Providing seamless solutions for your academic needs</p>
    <p>© {new Date().getFullYear()} All Rights Reserved</p>
</footer>


        </div>
    );
};

// Updated Styles
const containerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90vh' };
const cardStyle = { width: '700px', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: '#ffffff' };
const headerContainerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const logoutButtonStyle = { backgroundColor: '#ef4444', color: 'white', padding: '8px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer' };
const headerStyle = { fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' };
const tabsContainerStyle = { display: 'flex', justifyContent: 'space-between', marginBottom: '16px' };
const tabStyle = { flex: 1, padding: '10px', cursor: 'pointer', border: 'none', background: '#eee' };
const tabStyleActive = { ...tabStyle, background: '#3b82f6', color: 'white' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '10px' };
const buttonStyle = { backgroundColor: '#3b82f6', color: 'white', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', border: 'none' };
const deleteButtonStyle = { backgroundColor: '#ef4444', color: 'white', padding: '5px', borderRadius: '5px', cursor: 'pointer', border: 'none' };
const tableStyle = { width: '100%', marginTop: '16px', borderCollapse: 'collapse', textAlign: 'center' };
const footerStyle = {
    textAlign: 'center',
    padding: '20px',
    fontSize: '16px',
    color: '#333',
    backgroundColor: '#f9fafb',
    marginTop: '20px',
    borderTop: '1px solid #e5e7eb',
};

const footerTextStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
};

const developerStyle = {
    marginLeft: '10px',
    marginRight: '10px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
};

const socialLinkStyle = {
    marginLeft: '5px',
    color: '#0077b5',
    textDecoration: 'none',
};

export default Home;
