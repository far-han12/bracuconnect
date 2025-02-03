import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { FaGithub, FaLinkedin } from "react-icons/fa";

const Home = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('addCourse');
    const [name, setName] = useState('');
    const [course, setCourse] = useState('');
    const [section, setSection] = useState('');
    const [emailInterval, setEmailInterval] = useState(null);

    const [userEmail, setUserEmail] = useState('');
    const [courses, setCourses] = useState([]);
    const [routineData, setRoutineData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const token = localStorage.getItem('token');
// 
    useEffect(() => {
        if (!token) {
            console.log("Authentication failed. Redirecting to login...");
            navigate('/login');
            return;
        }

        try {
            const decodedToken = jwtDecode(token);
            if (!decodedToken?.email) throw new Error("Invalid token");
            setUserEmail(decodedToken.email);
            fetchCourses(decodedToken.email);
        } catch (error) {
            localStorage.removeItem('token');
            navigate('/login');
        }
    }, [navigate, token]);

    useEffect(() => {
        if (activeTab === 'classRoutine') {
            const fetchRoutineData = async () => {
                try {
                    const response = await axios.get('https://usis-cdn.eniamza.com/connect.json');
                    setRoutineData(response.data);
                } catch (error) {
                    console.log("Failed to fetch routine data");
                }
            };

            fetchRoutineData();
            const interval = setInterval(fetchRoutineData, 60000);
            return () => clearInterval(interval);
        }
    }, [activeTab]);

    const fetchCourses = async (email) => {
        try {
            const response = await axios.post(
                'https://api.malaysiabdmartshop.com/api/get-student',
                { email },
                { headers: { 'x-auth-token': token } }
            );
            const userData = response.data.userData || [];
            setCourses(userData);
    
            // If user has courses, get the first course’s email interval
            if (userData.length > 0) {
                setEmailInterval(userData[0].emailInterval / 60000); // Convert milliseconds to minutes
            } else {
                setEmailInterval(null); // Reset if no courses exist
            }
        } catch (error) {
            console.log(error.response?.data?.message || "Failed to fetch courses");
        }
    };
    
    
    const handleAddCourse = async (e) => {
        e.preventDefault();
        if (!token || isSubmitting) return;
    
        setIsSubmitting(true);
        const formattedSection = section.padStart(2, '0');
    
        try {
            await axios.post(
                'https://api.malaysiabdmartshop.com/api/add-student',
                {
                    userEmail,
                    name,
                    course: course.toUpperCase(), 
                    section: formattedSection,
                    emailInterval: emailInterval * 60000
                },
                { headers: { 'x-auth-token': token } }
            );
    
            toast.success("Course added successfully!");
            setName('');
            setCourse('');
            setSection('');
            fetchCourses(userEmail);
        } catch (error) {
            console.log(error.response?.data?.message || "Failed to add course");
        }
        setIsSubmitting(false);
    };
    

    const handleDeleteCourse = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Delete'
        });
    
        if (result.isConfirmed) {
            try {
                await axios.delete(
                    `https://api.malaysiabdmartshop.com/api/delete-student/${id}`,
                    { headers: { 'x-auth-token': token } }
                );
    
                toast.success("Course deleted successfully!");
                fetchCourses(userEmail); 
            } catch (error) {
                console.log("Failed to delete course");
                toast.error("Failed to delete course");
            }
        }
    };
    

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
        toast.success("Logged out successfully");
    };

    const filteredRoutine = routineData.filter(item =>
        item.courseCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const convertTo12HourFormat = (time) => {
        let [hours, minutes] = time.split(":");
        hours = parseInt(hours, 10);
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12; 
        return `${hours}:${minutes} ${ampm}`;
    };
    
    return (
        <div style={styles.container}>
            <Toaster position="top-center" />
            
            <div style={styles.card}>
                <div style={styles.header}>
                    <h1 style={styles.title}>NotifySeat</h1>
                    <button onClick={handleLogout} style={styles.logoutButton}>
                        Logout
                    </button>
                </div>

                <div style={styles.tabs}>
                    <button 
                        style={activeTab === 'addCourse' ? styles.activeTab : styles.tab} 
                        onClick={() => setActiveTab('addCourse')}
                    >
                        Add Course
                    </button>
                    <button 
                        style={activeTab === 'getCourses' ? styles.activeTab : styles.tab} 
                        onClick={() => setActiveTab('getCourses')}
                    >
                        My Courses
                    </button>
                    <button 
                        style={activeTab === 'classRoutine' ? styles.activeTab : styles.tab} 
                        onClick={() => setActiveTab('classRoutine')}
                    >
                        Class Routine
                    </button>
                </div>

                {activeTab === 'addCourse' && (
                    <form onSubmit={handleAddCourse} style={styles.form}>
                        <input 
                            type="email" 
                            value={userEmail} 
                            readOnly 
                            style={styles.input} 
                            placeholder="Your Email"
                        />
                        <input 
                            required 
                            placeholder="Your Name" 
                            value={name}
                            onChange={(e) => setName(e.target.value)} 
                            style={styles.input} 
                        />
                     <input 
    required 
    placeholder="Course Code" 
    value={course}
    style={styles.input} 
    onChange={(e) => setCourse(e.target.value.toUpperCase())} 
/>

                        <input 
                            required 
                            placeholder="Section" 
                            value={section}
                            onChange={(e) => setSection(e.target.value.replace(/\D/g, ''))}
                            style={styles.input} 
                        />
           <input 
    type="number" 
    min="1" 
    value={emailInterval !== null ? emailInterval : ''} 
    onChange={(e) => setEmailInterval(e.target.value)}
    style={styles.input} 
    placeholder="Notification Interval (minutes)" 
/>


                        <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            style={styles.submitButton}
                        >
                            {isSubmitting ? 'Adding...' : 'Add Course'}
                        </button>
                    </form>
                )}

                {activeTab === 'getCourses' && (
                    <div style={styles.tableContainer}>
                        {courses.length > 0 ? (
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Course</th>
                                        <th>Section</th>
                                        <th>Interval</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courses.map((course) => (
                                        <tr key={course._id}>
                                            <td>{course.name}</td>
                                            <td>{course.course}</td>
                                            <td>{course.section}</td>
                                            <td>{Math.floor(course.emailInterval / 60000)}m</td>
                                            <td>
                                                <button 
                                                    onClick={() => handleDeleteCourse(course._id)}
                                                    style={styles.deleteButton}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p style={styles.noCourses}>No courses added yet</p>
                        )}
                    </div>
                )}

                {activeTab === 'classRoutine' && (
                    <div style={styles.routineContainer}>
                      <div style={styles.searchContainer}>
                            <input 
                                type="text" 
                                placeholder="Search by course code..."
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={styles.searchInput} 
                            />
                            {searchTerm && (
                                <button 
                                    onClick={() => setSearchTerm('')}
                                    style={styles.clearButton}
                                    aria-label="Clear search"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                        <div style={styles.tableWrapper}>
                            <table style={styles.routineTable}>
                                <thead>
                                    <tr>
                                        <th>Section</th>
                                        <th>Course</th>
                                        <th>Faculties</th>
                                        <th>Class Schedule</th>
                                        <th>Lab Schedule</th>
                                        <th>Seats Left</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {filteredRoutine.map((item) => (
    <tr key={item.sectionId}>
        <td>{item.sectionName}</td>
        <td>{item.courseCode}</td>
        <td>{item.faculties || 'N/A'}</td>
        <td>
            {item.sectionSchedule?.classSchedules?.map((schedule, i) => (
                <div key={i} style={styles.scheduleItem}>
                    <span style={styles.day}>{schedule.day}</span>
                    <span>{convertTo12HourFormat(schedule.startTime)} - {convertTo12HourFormat(schedule.endTime)}</span>
                </div>
            )) || 'N/A'}
        </td>
        <td>
            {item.labSchedules?.map((schedule, i) => (
                <div key={i} style={styles.scheduleItem}>
                    <span style={styles.day}>{schedule.day}</span>
                    <span>{convertTo12HourFormat(schedule.startTime)} - {convertTo12HourFormat(schedule.endTime)}</span>
                </div>
            )) || 'N/A'}
        </td>
        <td>{item.capacity - item.consumedSeat}</td>
    </tr>
))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
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
            </footer>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '90vh',
   
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '1rem'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
    },
    title: {
        fontSize: '2rem',
        color: '#2563eb',
        margin: 0
    },
    logoutButton: {
        backgroundColor: '#ef4444',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.9rem'
    },
    tabs: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem'
    },
    tab: {
        flex: 1,
        padding: '1rem',
        border: 'none',
        borderRadius: '8px',
        backgroundColor: '#f3f4f6',
        cursor: 'pointer',
        fontSize: '0.9rem'
    },
    activeTab: {
        flex: 1,
        padding: '1rem',
        border: 'none',
        borderRadius: '8px',
        backgroundColor: '#2563eb',
        color: 'white',
        cursor: 'pointer',
        fontSize: '0.9rem'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    },
    input: {
        padding: '0.8rem',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        fontSize: '1rem',
        width: '100%',
        boxSizing: 'border-box'
    },
    submitButton: {
        backgroundColor: '#2563eb',
        color: 'white',
        padding: '1rem',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '500'
    },
    tableContainer: {
        overflowX: 'auto',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: 'white'
    },
    deleteButton: {
        backgroundColor: '#ef4444',
        color: 'white',
        padding: '0.3rem 0.6rem',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.8rem'
    },
    noCourses: {
        textAlign: 'center',
        color: '#6b7280',
        margin: '2rem 0',
        padding: '1rem'
    },
    routineContainer: {
        width: '100%',
        overflow: 'hidden'
    },
    tableWrapper: {
        maxHeight: '500px',
        overflowY: 'auto',
        overflowX: 'auto',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        marginTop: '1rem',
        '::-webkit-scrollbar': {
            width: '8px',
            height: '8px'
        },
        '::-webkit-scrollbar-thumb': {
            backgroundColor: '#cbd5e1',
            borderRadius: '4px'
        }
    },
    routineTable: {
        width: '100%',
        borderCollapse: 'collapse',
        minWidth: '800px'
    },
    scheduleItem: {
        margin: '0.5rem 0',
        padding: '0.5rem',
        backgroundColor: '#f8fafc',
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem'
    },
    day: {
        fontWeight: '600',
        color: '#3b82f6',
        fontSize: '0.8rem'
    },
    footer: {
        textAlign: 'center',
        marginTop: '3rem',
        color: '#64748b',
        padding: '2rem',
        fontSize: '0.9rem'
    },
    dev: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        margin: '0 0.5rem'
    },
    icon: {
        fontSize: '1.2rem',
        color: '#475569',
        marginLeft: '0.5rem'
    }, searchContainer: {
        position: 'relative',
        marginBottom: '1rem'
    },
    searchInput: {
        width: '100%',
        padding: '0.8rem 2.5rem 0.8rem 1rem',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        fontSize: '1rem',
        boxSizing: 'border-box',
        transition: 'all 0.2s',
        ':focus': {
            outline: 'none',
            borderColor: '#2563eb',
            boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.1)'
        }
    },
    clearButton: {
        position: 'absolute',
        right: '1rem',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'transparent',
        border: 'none',
        color: '#94a3b8',
        fontSize: '1.5rem',
        cursor: 'pointer',
        padding: '0',
        lineHeight: '1',
        transition: 'color 0.2s',
        ':hover': {
            color: '#ef4444'
        }
    },
};

export default Home;