import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
    User, Mail, Phone, Edit, Save, Loader, Key
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? 'https://spx.firstdigit.com.ng/api' // Replace with your actual production API URL
    : 'http://localhost:8000/api'; // Replace with your actual local API URL

const UserProfile = () => {
    const [loading, setLoading] = useState(true);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [error, setError] = useState(false); // This controls the main "Could not load profile data" message

    // Unified state for all form inputs
    const [userInput, setUserInput] = useState({
        id: '',
        name: '',
        email: '',
        phone: '',
        current_password: '',
        new_password: '',
        new_password_confirmation: '', // Changed key to match Laravel's 'confirmed' rule
    });

    // Editing states
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);

    // --- Unified Input Handler ---
    const handleInput = useCallback((e) => {
        const { name, type, value, checked } = e.target;
        setUserInput(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
        }));
    }, []);

    // --- Data Fetching ---
    const fetchUserData = useCallback(async () => {
        setLoading(true);
        setError(false); // Clear general error before fetching new data
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                toast.error("Authentication required. Please log in.");
                setError(true); // Set general error if no token
                setLoading(false);
                return;
            }

            const userEmailFromLocalStorage = localStorage.getItem('auth_email');
            if (!userEmailFromLocalStorage) {
                toast.error("Please log in again.");
                setError(true); // Set general error if no user email
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/users/view`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch user data.");
            }

            const data = await response.json();
            if (data.status === 200 && Array.isArray(data.users)) {
                const foundUser = data.users.filter(
                    fetchedUser => fetchedUser.email && fetchedUser.email.toLowerCase() === userEmailFromLocalStorage.toLowerCase()
                );

                if (foundUser.length > 0) {
                    const user = foundUser[0];
                    setUserInput(prev => ({
                        ...prev,
                        id: String(user.id || ''),
                        name: String(user.name || ''),
                        email: String(user.email || ''),
                        phone: String(user.phone || ''),
                    }));
                } else {
                    toast.error("Authenticated user not found in the fetched list.");
                    setError(true); // Set general error if user not found in fetched list
                }
            } else {
                toast.error(data.message || "Unexpected data structure received from API.");
                setError(true); // Set general error for unexpected data structure
            }
        } catch (err) {
            console.error("Error fetching user data:", err);
            toast.error(err.message || "An error occurred fetching your profile.");
            setError(true); // Set general error for network/unhandled fetching errors
        } finally {
            setLoading(false);
        }
    }, []);

    // Effect to fetch user data only on initial mount
    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    // Effect to update document title when userInput.name changes
    useEffect(() => {
        document.title = `${userInput.name ? userInput.name + ' - ' : ''}My Profile - First Digits`;
    }, [userInput.name]);


    // --- Update Profile Functionality (Personal Info) ---
    const handleUpdateProfile = useCallback(async (e) => {
        e.preventDefault();
        setIsUpdatingProfile(true);
        // Do NOT reset general error here; it's handled by fetchUserData if needed

        const token = localStorage.getItem('auth_token');
        if (!token) {
            toast.error("Authentication required.");
            setIsUpdatingProfile(false);
            return;
        }

        const profileData = {
            id: String(userInput.id),
            name: String(userInput.name),
            email: String(userInput.email),
            phone: String(userInput.phone),
        };

        try {
            const response = await fetch(`${API_BASE_URL}/user/update/${userInput.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(profileData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 422 && errorData.errors) {
                    // Validation errors, display as toasts, do NOT set global error
                    Object.values(errorData.errors).forEach(messages => {
                        messages.forEach(message => toast.error(message));
                    });
                } else {
                    // Other backend errors (e.g., 400, 500), display as toast, do NOT set global error
                    toast.error(errorData.message || "Failed to update profile.");
                }
            } else {
                const data = await response.json();
                if (data.status === 200) {
                    toast.success("Profile updated successfully!");
                    setIsEditingProfile(false);
                    fetchUserData(); // Re-fetch to ensure UI is in sync after a successful update
                } else {
                    toast.error(data.message || "Failed to update profile.");
                }
            }
        } catch (err) {
            // Network errors or unhandled client-side errors during fetch, display as toast, do NOT set global error
            console.error("Error updating profile:", err);
            toast.error(err.message || "An error occurred while updating profile.");
        } finally {
            setIsUpdatingProfile(false);
        }
    }, [userInput.id, userInput.name, userInput.email, userInput.phone, fetchUserData]);

    // --- Update Password Functionality ---
    const handleUpdatePassword = useCallback(async (e) => {
        e.preventDefault();
        setIsUpdatingPassword(true);
        // Do NOT reset general error here; it's handled by fetchUserData if needed

        const token = localStorage.getItem('auth_token');
        if (!token) {
            toast.error("Authentication required.");
            setIsUpdatingPassword(false);
            return;
        }

        // Client-side validation for passwords
        if (String(userInput.new_password).length < 8) {
            toast.error("New password must be at least 8 characters long.");
            setIsUpdatingPassword(false);
            return;
        }
        if (String(userInput.new_password) !== String(userInput.new_password_confirmation)) {
            toast.error("New password and confirmation do not match.");
            setIsUpdatingPassword(false);
            return;
        }
        if (!userInput.current_password) {
            toast.error("Please enter your current password.");
            setIsUpdatingPassword(false);
            return;
        }

        const passwordData = {
            id: String(userInput.id),
            current_password: String(userInput.current_password),
            new_password: String(userInput.new_password),
            new_password_confirmation: String(userInput.new_password_confirmation),
        };

        try {
            const response = await fetch(`${API_BASE_URL}/users/change-password/${userInput.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(passwordData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 422 && errorData.errors) {
                    // Validation errors, display as toasts, do NOT set global error
                    Object.values(errorData.errors).forEach(messages => {
                        messages.forEach(message => toast.error(message));
                    });
                } else if (response.status === 401) {
                    // Specific error for incorrect current password, display as toast, do NOT set global error
                    toast.error(errorData.message || "The current password you provided is incorrect.");
                }
                else {
                    // Other backend errors (e.g., 400, 500), display as toast, do NOT set global error
                    toast.error(errorData.message || "Failed to change password.");
                }
            } else {
                const data = await response.json();
                if (data.status === 200) {
                    toast.success("Password changed successfully!");
                    setIsEditingPassword(false);
                    setUserInput(prev => ({
                        ...prev,
                        current_password: '',
                        new_password: '',
                        new_password_confirmation: '',
                    }));
                } else {
                    toast.error(data.message || "Failed to change password.");
                }
            }
        } catch (err) {
            // Network errors or unhandled client-side errors during fetch, display as toast, do NOT set global error
            console.error("Error changing password:", err);
            toast.error(err.message || "An error occurred while changing password.");
        } finally {
            setIsUpdatingPassword(false);
        }
    }, [userInput.id, userInput.current_password, userInput.new_password, userInput.new_password_confirmation]);

    // --- UI/Styling Variants ---
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                delay: 0.1,
                duration: 0.5,
                when: "beforeChildren",
                staggerChildren: 0.15
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
    };

    const buttonVariants = {
        hover: { scale: 1.05, boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.3)" },
        tap: { scale: 0.95 }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-800 dark:text-gray-200 flex items-center justify-center p-4">
                <Loader className="w-16 h-16 animate-spin text-blue-500 dark:text-purple-400" />
                <p className="ml-4 text-xl">Loading your profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-red-600 dark:text-red-400 flex items-center justify-center p-4 text-center">
                <p className="text-xl font-semibold">Could not load profile data. Please try again later.</p>
            </div>
        );
    }

    return (
        <motion.div
            className="relative min-h-screen bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200 pt-24 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Pinkish Blurry Design for Dark Mode */}
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-br from-pink-300 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob dark:top-1/4 dark:left-1/4 dark:w-72 dark:h-72 dark:bg-gradient-to-br dark:from-pink-500 dark:to-purple-700 dark:rounded-full dark:mix-blend-multiply dark:filter dark:blur-xl dark:opacity-30 dark:animate-blob-slow"></div>
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-to-tl from-blue-300 to-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob-delay dark:bottom-1/4 dark:right-1/4 dark:w-72 dark:h-72 dark:bg-gradient-to-tl dark:from-blue-700 dark:to-green-900 dark:rounded-full dark:mix-blend-multiply dark:filter dark:blur-xl dark:opacity-30 dark:animate-blob-slow"></div>

            {/* Glassmorphism Overlay */}
            <div className="absolute inset-0 bg-white/10 dark:bg-gray-800/20 backdrop-filter backdrop-blur-lg dark:backdrop-blur-xl z-0 pointer-events-none"></div>


            <Helmet>
                <title>My Profile - First Digits</title>
                <meta name="description" content="View and manage your user profile and password." />
            </Helmet>

            <motion.h1
                className="relative z-10 text-4xl sm:text-5xl font-extrabold text-center mb-12 text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-600 dark:text-white dark:bg-clip-text dark:text-transparent dark:bg-gradient-to-r dark:from-purple-400 dark:to-pink-600 leading-tight"
                variants={cardVariants}
            >
                My Profile
            </motion.h1>

            {/* Personal Information Form */}
            <form className="relative z-10 max-w-xl mx-auto mb-8">
                <motion.div variants={cardVariants} className="bg-white rounded-xl shadow-xl p-6 sm:p-8 lg:p-10 border border-gray-200 dark:bg-gray-900 dark:shadow-2xl dark:border-gray-800">
                    <div className="flex justify-between items-center mb-6 sm:mb-8">
                        <h2 className="text-3xl font-bold text-blue-600 dark:text-lime-400 flex items-center space-x-3">
                            <User className="w-8 h-8" />
                            <span>Personal Information</span>
                        </h2>
                        {!isEditingProfile ? (
                            <motion.button
                                type="button"
                                onClick={() => setIsEditingProfile(true)}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-md transition-colors dark:bg-blue-600 dark:hover:bg-blue-700"
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                            >
                                <Edit className="w-5 h-5" />
                                <span className="hidden sm:inline">Edit</span>
                            </motion.button>
                        ) : (
                            <motion.button
                                type="button"
                                onClick={handleUpdateProfile}
                                disabled={isUpdatingProfile}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-green-600 dark:hover:bg-green-700"
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                            >
                                {isUpdatingProfile ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                <span className="hidden sm:inline">{isUpdatingProfile ? 'Saving...' : 'Save'}</span>
                            </motion.button>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-gray-600 text-sm font-medium mb-2 dark:text-gray-400">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={userInput.name}
                                onChange={handleInput}
                                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500 dark:focus:ring-purple-600"
                                required
                                disabled={!isEditingProfile}
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-gray-600 text-sm font-medium mb-2 dark:text-gray-400">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={userInput.email}
                                onChange={handleInput}
                                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500 dark:focus:ring-purple-600"
                                required
                                disabled={!isEditingProfile}
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-gray-600 text-sm font-medium mb-2 dark:text-gray-400">Phone</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={userInput.phone}
                                onChange={handleInput}
                                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500 dark:focus:ring-purple-600"
                                required
                                disabled={!isEditingProfile}
                            />
                        </div>
                        {isEditingProfile && (
                            <motion.button
                                type="button"
                                onClick={() => setIsEditingProfile(false)}
                                className="w-full mt-4 px-4 py-2 text-gray-600 hover:text-gray-800 bg-gray-200 rounded-md shadow-md transition-colors dark:text-gray-400 dark:hover:text-white dark:bg-gray-700"
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                            >
                                Cancel
                            </motion.button>
                        )}
                    </div>
                </motion.div>
            </form>

            {/* Change Password Form */}
            <form className="relative z-10 max-w-xl mx-auto">
                <motion.div variants={cardVariants} className="bg-white rounded-xl shadow-xl p-6 sm:p-8 lg:p-10 border border-gray-200 mt-8 dark:bg-gray-900 dark:shadow-2xl dark:border-gray-800">
                    <div className="flex justify-between items-center mb-6 sm:mb-8">
                        <h2 className="text-3xl font-bold text-blue-600 dark:text-lime-400 flex items-center space-x-3">
                            <Key className="w-8 h-8" />
                            <span>Change Password</span>
                        </h2>
                        {!isEditingPassword ? (
                            <motion.button
                                type="button"
                                onClick={() => setIsEditingPassword(true)}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-md transition-colors dark:bg-blue-600 dark:hover:bg-blue-700"
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                            >
                                <Edit className="w-5 h-5" />
                                <span className="hidden sm:inline">Edit</span>
                            </motion.button>
                        ) : (
                            <motion.button
                                type="button"
                                onClick={handleUpdatePassword}
                                disabled={isUpdatingPassword}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-green-600 dark:hover:bg-green-700"
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                            >
                                {isUpdatingPassword ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                <span className="hidden sm:inline">{isUpdatingPassword ? 'Saving...' : 'Save'}</span>
                            </motion.button>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label htmlFor="currentPassword" className="block text-gray-600 text-sm font-medium mb-2 dark:text-gray-400">Current Password</label>
                            <input
                                type="password"
                                id="currentPassword"
                                name="current_password"
                                value={userInput.current_password}
                                onChange={handleInput}
                                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500 dark:focus:ring-purple-600"
                                required
                                disabled={!isEditingPassword}
                            />
                        </div>
                        <div>
                            <label htmlFor="newPassword" className="block text-gray-600 text-sm font-medium mb-2 dark:text-gray-400">New Password</label>
                            <input
                                type="password"
                                id="newPassword"
                                name="new_password"
                                value={userInput.new_password}
                                onChange={handleInput}
                                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500 dark:focus:ring-purple-600"
                                required
                                disabled={!isEditingPassword}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmNewPassword" className="block text-gray-600 text-sm font-medium mb-2 dark:text-gray-400">Confirm New Password</label>
                            <input
                                type="password"
                                id="confirmNewPassword"
                                name="new_password_confirmation"
                                value={userInput.new_password_confirmation}
                                onChange={handleInput}
                                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500 dark:focus:ring-purple-600"
                                required
                                disabled={!isEditingPassword}
                            />
                        </div>
                        {isEditingPassword && (
                            <motion.button
                                type="button"
                                onClick={() => {
                                    setIsEditingPassword(false);
                                    setUserInput(prev => ({
                                        ...prev,
                                        current_password: '',
                                        new_password: '',
                                        new_password_confirmation: '',
                                    }));
                                }}
                                className="w-full mt-4 px-4 py-2 text-gray-600 hover:text-gray-800 bg-gray-200 rounded-md shadow-md transition-colors dark:text-gray-400 dark:hover:text-white dark:bg-gray-700"
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                            >
                                Cancel
                            </motion.button>
                        )}
                    </div>
                </motion.div>
            </form>
        </motion.div>
    );
};

export default UserProfile;