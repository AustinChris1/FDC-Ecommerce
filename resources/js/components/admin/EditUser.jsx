import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner'; // Adjust path as needed
import { User, Mail, Lock, Key, MapPin } from 'lucide-react'; // Import icons

const EditUser = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true); // Manages full-page loading for fetching user data
    const [editLoading, setEditLoading] = useState(false); // Manages loading state for the submit button
    const [locations, setLocations] = useState([]); // State to store fetched locations
    const [userInput, setUserInput] = useState({
        name: '',
        email: '',
        password: '',
        role_as: 0, // 0: Normal User, 1: Admin, 2: Super Admin
        location_id: null, // New: To store the assigned location ID
    });
    const [error, setError] = useState({}); // Stores validation errors from backend


    // Fetch user data and locations
    useEffect(() => {
        document.title = "Edit User";

        const authToken = localStorage.getItem('auth_token');
        if (!authToken) {
            toast.error("Authentication token missing. Please log in.");
            navigate('/login'); // Redirect to login if no token
            return;
        }

        // Fetch user data
        const fetchUserData = axios.get(`/api/users/edit/${id}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        // Always attempt to fetch locations.
        // The backend's LocationController@allLocations will handle authorization.
        const fetchLocationsPromise = axios.get('/api/locations/all', { 
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        // Use Promise.allSettled to handle multiple promises independently.
        // This ensures that if one promise rejects (e.g., 404 for locations),
        // the other (user data) can still fulfill without crashing the .then() block.
        Promise.allSettled([fetchUserData, fetchLocationsPromise])
            .then(([userResult, locationsResult]) => {
                // Handle user data result
                if (userResult.status === 'fulfilled' && userResult.value.data && userResult.value.data.status === 200 && userResult.value.data.user) {
                    const userData = userResult.value.data.user;
                    setUserInput({
                        name: userData.name || '',
                        email: userData.email || '',
                        password: '', // Password is never pre-filled for security reasons
                        role_as: userData.role_as,
                        location_id: userData.location_id || '', // Use '' for select default, null for backend
                    });
                } else if (userResult.status === 'fulfilled' && userResult.value.data) {
                    // Handle specific error statuses from user data fetch
                    if (userResult.value.data.status === 404) {
                        toast.error(userResult.value.data.message || "User not found.");
                    } else if (userResult.value.data.status === 403) {
                        toast.error(userResult.value.data.message || "You don't have permission to edit this user.");
                    } else {
                        toast.error(userResult.value.data.message || 'Failed to fetch user details.');
                    }
                    navigate('/admin/dashboard'); // Redirect on significant user fetch error
                } else if (userResult.status === 'rejected') {
                    // Handle network errors or other rejections for user data fetch
                    console.error("Error fetching user data:", userResult.reason);
                    toast.error(userResult.reason?.response?.data?.message || 'Failed to fetch user details. Please check network/server.');
                    navigate('/admin/dashboard');
                } else {
                    // Fallback for unexpected userResult structure
                    toast.error('Failed to fetch user details due to an unexpected response.');
                    navigate('/admin/dashboard');
                }

                // Handle locations result
                if (locationsResult.status === 'fulfilled' && locationsResult.value.data && locationsResult.value.data.status === 200) {
                    setLocations(locationsResult.value.data.locations);
                } else if (locationsResult.status === 'fulfilled' && locationsResult.value.data) {
                    // Handle specific error statuses from locations fetch
                    if (locationsResult.value.data.status === 403) {
                        console.warn("Not authorized to fetch all locations. Location assignment options will not be available.");
                    } else {
                        toast.error(locationsResult.value.data.message || 'Failed to fetch locations.');
                    }
                    setLocations([]); // Ensure locations state is empty on error/forbidden
                } else if (locationsResult.status === 'rejected') {
                    // Handle network errors or other rejections for locations fetch
                    console.warn("Error fetching locations:", locationsResult.reason);
                    // Only toast error if it's not a 403 (expected for non-super admins)
                    if (locationsResult.reason?.response?.status !== 403) {
                        toast.error(locationsResult.reason?.response?.data?.message || 'Failed to fetch locations.');
                    }
                    setLocations([]); // Ensure locations are cleared on error
                } else {
                    // Fallback for unexpected locationsResult structure
                    toast.error('Failed to fetch locations due to an unexpected response.');
                    setLocations([]);
                }
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id, navigate]); // Dependencies: re-run if ID or navigate function changes

    // Handler for input changes
    const handleInput = (e) => {
        const { name, value } = e.target;

        setUserInput(prev => {
            const newState = { ...prev };

            if (name === 'role_as') {
                newState.role_as = parseInt(value, 10);
                // If role changes from admin (1) to non-admin (0 or 2), clear location_id
                // This condition should clear location_id if role is 0 (Normal User) or 2 (Super Admin)
                if (newState.role_as !== 1) {
                    newState.location_id = null;
                }
            } else if (name === 'location_id') {
                // Convert empty string from select to null for backend
                newState.location_id = value === '' ? null : parseInt(value, 10);
            } else {
                newState[name] = value;
            }
            return newState;
        });
    };

    // Function to handle user update
    const editUser = async (e) => {
        e.preventDefault();
        setEditLoading(true);

        const authToken = localStorage.getItem('auth_token');
        if (!authToken) {
            toast.error("Authentication token missing. Please log in.");
            setEditLoading(false);
            navigate('/login');
            return;
        }

        const data = {
            name: userInput.name,
            email: userInput.email,
            ...(userInput.password && { password: userInput.password }),
            // Always send role_as and location_id. Backend will handle authorization.
            role_as: userInput.role_as,
            location_id: userInput.location_id,
        };

        try {
            const res = await axios.post(`/api/users/update/${id}`, data, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (res.data.status === 200) {
                toast.success(res.data.message);
                setError({});
                navigate('/admin/dashboard');
            } else if (res.data.status === 422) {
                setError(res.data.errors);
                toast.error('Please check the input fields for errors.');
            } else if (res.data.status === 404 || res.data.status === 403) {
                toast.error(res.data.message);
                navigate('/admin/dashboard');
            } else {
                toast.error(res.data.message || 'An unexpected error occurred during update.');
            }
        } catch (err) {
            if (err.response) {
                if (err.response.status === 422) {
                    setError(err.response.data.errors);
                    toast.error('Validation errors. Please check your input.');
                } else if (err.response.status === 403) {
                    // Specific toast for permission denied if a non-super admin tries to change role/location
                    toast.error(err.response.data.message || 'You do not have permission to perform this action.');
                } else {
                    console.error("Update error:", err);
                    toast.error(err.response.data.message || 'Failed to update user, please try again.');
                }
            } else {
                console.error("Update error:", err);
                toast.error('Failed to update user, please try again.');
            }
        } finally {
            setEditLoading(false);
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
            className='min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-100 text-gray-800' // Removed dark:bg-gray-900 dark:text-gray-200
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 md:mb-0">Edit User</h1> {/* Removed dark:text-white */}
                <Link
                    to="/admin/dashboard"
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105" // Removed dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200
                >
                    Back to Dashboard
                </Link>
            </header>

            <motion.form
                onSubmit={editUser}
                id='editUserForm'
                className='bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8' // Removed dark:bg-gray-800
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                {/* Name Field */}
                <div className="mb-5">
                    <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-2"> {/* Removed dark:text-gray-300 */}
                        <User className="inline-block w-4 h-4 mr-2" /> Name
                    </label>
                    <input
                        onChange={handleInput}
                        value={userInput.name || ''}
                        type="text"
                        id="name"
                        name="name"
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200" // Removed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-blue-400
                    />
                    <small className="text-red-500 text-sm mt-1 block">{error.name ? error.name[0] : ''}</small>
                </div>

                {/* Email Field */}
                <div className="mb-5">
                    <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2"> {/* Removed dark:text-gray-300 */}
                        <Mail className="inline-block w-4 h-4 mr-2" /> Email
                    </label>
                    <input
                        onChange={handleInput}
                        value={userInput.email || ''}
                        type="email"
                        id="email"
                        name="email"
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200" // Removed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-blue-400
                    />
                    <small className="text-red-500 text-sm mt-1 block">{error.email ? error.email[0] : ''}</small>
                </div>

                {/* Password Field */}
                <div className="mb-5">
                    <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2"> {/* Removed dark:text-gray-300 */}
                        <Lock className="inline-block w-4 h-4 mr-2" /> New Password (leave blank to keep current)
                    </label>
                    <input
                        onChange={handleInput}
                        value={userInput.password || ''}
                        type="password"
                        id="password"
                        name="password"
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200" // Removed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-blue-400
                    />
                    <small className="text-red-500 text-sm mt-1 block">{error.password ? error.password[0] : ''}</small>
                </div>

                {/* Role and Location Assignment (Always visible to any admin) */}
                <div className="border-t border-gray-200 pt-5 mt-5"> {/* Removed dark:border-gray-700 */}
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Permissions & Assignment</h3> {/* Removed dark:text-gray-100 */}
                    
                    {/* Role Selection */}
                    <div className="mb-5">
                        <label htmlFor="role_as" className="block text-gray-700 text-sm font-medium mb-2"> {/* Removed dark:text-gray-300 */}
                            <Key className="inline-block w-4 h-4 mr-2" /> User Role
                        </label>
                        <select
                            onChange={handleInput}
                            value={userInput.role_as}
                            id="role_as"
                            name="role_as"
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200" // Removed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-400
                        >
                            <option value={0}>Normal User</option>
                            <option value={1}>Admin</option> {/* This is for General Admin OR Location Admin */}
                            <option value={2}>Super Admin</option>
                        </select>
                        <small className="text-red-500 text-sm mt-1 block">{error.role_as ? error.role_as[0] : ''}</small>
                    </div>

                    {/* Location Assignment (Only visible if role is Admin OR Super Admin AND locations are available) */}
                    {userInput.role_as !== 0 && locations.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mb-5 overflow-hidden"
                        >
                            <label htmlFor="location_id" className="block text-gray-700 text-sm font-medium mb-2"> {/* Removed dark:text-gray-300 */}
                                <MapPin className="inline-block w-4 h-4 mr-2" /> Assign to Location (for Location Admin)
                            </label>
                            <select
                                onChange={handleInput}
                                value={userInput.location_id || ''} // Use '' for no selection
                                id="location_id"
                                name="location_id"
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200" // Removed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-400
                            >
                                <option value="">-- Select Location (Optional for General Admin) --</option>
                                {locations.map(loc => (
                                    <option key={loc.id} value={loc.id}>
                                        {loc.name}
                                    </option>
                                ))}
                            </select>
                            <small className="text-red-500 text-sm mt-1 block">{error.location_id ? error.location_id[0] : ''}</small>
                            <p className="text-xs text-gray-500 mt-1"> {/* Removed dark:text-gray-400 */}
                                Leave blank for a General Admin. Select a location to make them a Location Store Admin.
                            </p>
                        </motion.div>
                    )}
                     {userInput.role_as === 1 && locations.length === 0 && (
                        <p className="text-sm text-red-500 mt-2"> {/* Removed dark:text-red-400 */}
                            No locations available to assign. Only Super Admin can assign locations.
                        </p>
                    )}
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
