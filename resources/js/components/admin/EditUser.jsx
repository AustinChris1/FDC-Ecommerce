import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
// Corrected path for LoadingSpinner as per your instruction
import LoadingSpinner from './LoadingSpinner';

const EditUser = () => {
    const { id } = useParams(); // Get user ID from URL parameters
    const navigate = useNavigate(); // For navigation
    const [loading, setLoading] = useState(true); // Manages full-page loading for fetching user data
    const [editLoading, setEditLoading] = useState(false); // Manages loading state for the submit button
    const [userInput, setUserInput] = useState({
        name: '',
        email: '',
        password: '', // Added for password updates
        role_as: 0, // 0 for user, 1 for admin
    });
    const [error, setError] = useState({}); // Stores validation errors from backend

    // Effect to fetch user data when component mounts or ID changes
    useEffect(() => {
        document.title = "Edit User"; // Set page title
        axios.get(`/api/users/edit/${id}`)
            .then(res => {
                if (res.status === 200 && res.data.user) {
                    const userData = res.data.user;
                    setUserInput({
                        name: userData.name || '',
                        email: userData.email || '',
                        password: '', // Password is never pre-filled for security reasons
                        role_as: userData.role_as || 0, // Ensure it's 0 if null/undefined
                    });
                } else if (res.status === 404) {
                    toast.error(res.data.message || "User not found.");
                    navigate('/admin/dashboard'); // Redirect if user not found
                } else {
                    toast.error(res.data.message || 'Failed to fetch user details.');
                }
            })
            .catch(err => {
                console.error("Error fetching user details:", err);
                toast.error('Failed to fetch user details. Please check network/server.');
                navigate('/admin/dashboard'); // Redirect on network error
            })
            .finally(() => {
                setLoading(false); // Stop full-page loading spinner
            });
    }, [id, navigate]); // Dependencies: re-run if ID or navigate function changes

    // Handler for input changes
    const handleInput = (e) => {
        const { name, type, value, checked } = e.target;
        setUserInput(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value, // Convert boolean to 1 or 0
        }));
    };

    // Function to handle user update
    const editUser = async (e) => {
        e.preventDefault();
        setEditLoading(true); // Show spinner on submit button

        // Create data object for submission
        const data = {
            name: userInput.name,
            email: userInput.email,
            password: userInput.password, // Send password only if it's not empty
            role_as: userInput.role_as,
        };

        // Remove password from data if it's empty, so backend doesn't try to update with empty string
        if (data.password === '') {
            delete data.password;
        }

        try {
            const res = await axios.post(`/api/users/update/${id}`, data);

            if (res.data.status === 200) {
                toast.success(res.data.message);
                setError({}); // Clear errors on success
                navigate('/admin/dashboard'); // Navigate back to dashboard
            } else if (res.data.status === 422) {
                setError(res.data.errors); // Validation errors from backend
                toast.error('Please check the input fields for errors.');
            } else if (res.data.status === 404) {
                toast.error(res.data.message);
                navigate('/admin/dashboard'); // Redirect if user not found on update
            } else {
                toast.error(res.data.message || 'An unexpected error occurred during update.');
            }
        } catch (err) {
            if (err.response && err.response.status === 422) {
                setError(err.response.data.errors);
                toast.error('Please check the input fields for errors.');
            } else {
                console.error("Update error:", err);
                toast.error('Failed to update user, try again.');
            }
        } finally {
            setEditLoading(false); // Hide submit button spinner
        }
    };

    // Framer Motion variants for main container entry
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    // Show full-page loading spinner while fetching user details
    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <motion.div
            className='min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-100 text-gray-800' // Lighter background
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header section with title and Back button */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 md:mb-0">Edit User</h1>
                <Link
                    to="/admin/dashboard"
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
                >
                    Back to Dashboard
                </Link>
            </header>

            {/* Form container */}
            <motion.form
                onSubmit={editUser}
                id='editUserForm'
                className='bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8' // White background for form card
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                {/* Name Field */}
                <div className="mb-5">
                    <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-2">Name</label>
                    <input
                        onChange={handleInput}
                        value={userInput.name || ''}
                        type="text"
                        id="name"
                        name="name"
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                    />
                    <small className="text-red-500 text-sm mt-1 block">{error.name ? error.name[0] : ''}</small>
                </div>
                {/* Email Field */}
                <div className="mb-5">
                    <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                    <input
                        onChange={handleInput}
                        value={userInput.email || ''}
                        type="email"
                        id="email"
                        name="email"
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                    />
                    <small className="text-red-500 text-sm mt-1 block">{error.email ? error.email[0] : ''}</small>
                </div>
                {/* Password Field */}
                <div className="mb-5">
                    <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">New Password (leave blank to keep current)</label>
                    <input
                        onChange={handleInput}
                        value={userInput.password || ''}
                        type="password"
                        id="password"
                        name="password"
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                    />
                    <small className="text-red-500 text-sm mt-1 block">{error.password ? error.password[0] : ''}</small>
                </div>
                {/* Admin Role Toggle */}
                <div className="flex items-center mb-5">
                    <label htmlFor="role_as" className="relative inline-flex items-center cursor-pointer mr-3">
                        <input
                            onChange={handleInput}
                            checked={userInput.role_as === 1}
                            type='checkbox'
                            id="role_as"
                            name="role_as"
                            className="sr-only peer" // Hide original checkbox visually
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-200 after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div> {/* Lighter inactive switch background */}
                        <span className="ml-3 text-gray-700 text-sm font-medium">Admin Role</span> {/* Darker label text */}
                    </label>
                    <small className="text-red-500 text-sm mt-1 block">{error.role_as ? error.role_as[0] : ''}</small>
                </div>

                {/* Submit Button */}
                <button
                    className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 float-right"
                    type='submit'
                    disabled={editLoading}
                >
                    {editLoading ? (
                        <LoadingSpinner size="sm" />
                    ) : (
                        'Update User'
                    )}
                </button>
            </motion.form>
        </motion.div>
    );
};

export default EditUser;
