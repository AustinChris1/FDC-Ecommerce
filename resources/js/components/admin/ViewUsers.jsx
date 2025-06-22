import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactPaginate from 'react-paginate'; // Ensure react-paginate is installed
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';
import { toast } from 'react-toastify';
import {
    User,           // Lucide icon for User Name/General User
    Mail,           // Lucide icon for Email
    KeySquare,      // Lucide icon for Admin Role
    UserCheck,      // Lucide icon for Regular User Role (or simply User)
    Calendar,       // Lucide icon for Joined Date
    Edit,           // Lucide icon for Edit Action
    Trash2,         // Lucide icon for Delete Action
    Search          // Lucide icon for Search bar
} from 'lucide-react'; // Import Lucide React icons

const ViewUsers = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true); // Manages full-page loading spinner
    const [users, setUsers] = useState([]); // Stores fetched users
    const [deleteLoading, setDeleteLoading] = useState({}); // Manages loading state per delete button
    const [currentPage, setCurrentPage] = useState(0); // Current page for pagination (ReactPaginate uses 0-indexed)
    const [itemsPerPage] = useState(6); // Number of users to display per page (adjusted for card layout)
    const [searchTerm, setSearchTerm] = useState(''); // State for search term

    // Effect to fetch users when the component mounts
    useEffect(() => {
        document.title = "Manage Users"; // Set page title
        axios.get('/api/users/view') // Assuming this endpoint returns all users
            .then(res => {
                if (res.status === 200 && res.data.users) {
                    setUsers(res.data.users);
                } else {
                    toast.error(res.data.message || "Failed to fetch users.");
                }
            })
            .catch(err => {
                console.error("Error fetching users:", err);
                toast.error("Network error or server issue. Could not load users.");
            })
            .finally(() => {
                setLoading(false); // Stop full-page loading spinner
            });
    }, []); // Empty dependency array ensures this runs once on mount

    // Function to handle user deletion
    const deleteUser = (e, id) => {
        e.preventDefault();
        setDeleteLoading((prev) => ({ ...prev, [id]: true })); // Show loading spinner for specific button

        axios.post(`/api/users/delete/${id}`) // Assuming admin endpoint for deletion
            .then(res => {
                if (res.data.status === 200) {
                    // Filter out the deleted user from the state
                    setUsers(prevUsers => prevUsers.filter(item => item.id !== id));
                    toast.success(res.data.message);
                } else if (res.data.status === 404 || res.data.status === 403) { // 403 if not authorized
                    toast.error(res.data.message);
                } else {
                    toast.error(res.data.message || "Failed to delete user.");
                }
            })
            .catch(err => {
                console.error("Error deleting user:", err);
                toast.error(`Failed to delete user: ${err.message || "Network error"}`);
            })
            .finally(() => {
                setDeleteLoading((prev) => ({ ...prev, [id]: false })); // Hide loading spinner for specific button
            });
    };

    // Handler for page click in pagination
    const handlePageClick = (data) => {
        setCurrentPage(data.selected); // ReactPaginate provides 0-indexed selected page
    };

    // Handler for search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(0); // Reset to first page on new search
    };

    // Filter users based on search term
    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.role_as === 1 ? 'admin' : 'user').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate users to display for the current page
    const offset = currentPage * itemsPerPage;
    const displayedUsers = filteredUsers.slice(offset, offset + itemsPerPage);

    // If users data is still loading, display the full-page spinner
    if (loading) {
        return <LoadingSpinner />;
    }

    // Framer Motion variants for main container entry
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    // Framer Motion variants for individual user cards
    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
        exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
        hover: { scale: 1.02, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }
    };

    return (
        <motion.div
            className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-100 text-gray-800" // Lighter background for admin panel
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header section with title */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 bg-white rounded-xl shadow-md p-6">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 sm:mb-0">Users Management</h1>
                {/* Add User Button (Optional, if you have a component to add new users) */}
                {/* <Link to="/admin/users/add" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105">Add User</Link> */}
            </header>

            {/* Search Bar */}
            <div className="relative mb-8 bg-white rounded-xl shadow-md p-4">
                <input
                    type="text"
                    placeholder="Search users by name, email, or role..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            {/* Main content area for user cards */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                {displayedUsers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"> {/* Responsive grid for cards */}
                        <AnimatePresence>
                            {displayedUsers.map((user) => (
                                <motion.div
                                    key={user.id}
                                    className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col transition-all duration-200"
                                    variants={cardVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    whileHover="hover"
                                >
                                    {/* User Avatar/Image (Placeholder) */}
                                    <div className="w-full h-32 bg-gray-200 flex items-center justify-center overflow-hidden">
                                        <img
                                            src={user.avatar_url || `https://placehold.co/128x128/e0e0e0/555555?text=${user.name ? user.name.charAt(0).toUpperCase() : 'U'}`} // Placeholder for user image
                                            alt={user.name || 'User Avatar'}
                                            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                                            onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/128x128/e0e0e0/555555?text=${user.name ? user.name.charAt(0).toUpperCase() : 'U'}`; }}
                                        />
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-4 flex-grow text-center">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-center">
                                            <User className="w-5 h-5 mr-2 text-blue-500" />
                                            {user.name}
                                        </h3>
                                        <p className="text-gray-600 mb-2 flex items-center justify-center">
                                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                            <span className="truncate">{user.email}</span>
                                        </p>
                                        
                                        {/* Role Badge */}
                                        <div className="mb-4">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role_as === 1 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {user.role_as === 1 ? (
                                                    <span className="flex items-center">
                                                        <KeySquare className="w-3 h-3 mr-1" /> Admin
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center">
                                                        <UserCheck className="w-3 h-3 mr-1" /> User
                                                    </span>
                                                )}
                                            </span>
                                        </div>

                                        {/* Joined Date */}
                                        <p className="text-sm text-gray-500 flex items-center justify-center">
                                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                            Joined: {new Date(user.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                                        </p>
                                    </div>

                                    {/* Card Actions */}
                                    <div className="p-4 border-t border-gray-100 flex justify-end space-x-2 bg-gray-50">
                                        <Link
                                            to={`/admin/users/edit/${user.id}`}
                                            className="px-4 py-2 rounded-md text-blue-600 hover:bg-blue-100 hover:text-blue-800 transition-colors duration-200 flex items-center"
                                            title="Edit User"
                                        >
                                            <Edit className="w-4 h-4 mr-1" /> Edit
                                        </Link>
                                        <button
                                            onClick={(e) => deleteUser(e, user.id)}
                                            className="px-4 py-2 rounded-md text-red-600 hover:bg-red-100 hover:text-red-800 transition-colors duration-200 flex items-center"
                                            disabled={deleteLoading[user.id]}
                                            title="Delete User"
                                        >
                                            {deleteLoading[user.id] ? (
                                                <LoadingSpinner size="sm" />
                                            ) : (
                                                <>
                                                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-10 text-gray-500 text-lg"
                    >
                        {searchTerm ? `No users found matching "${searchTerm}".` : "No users found. Add new users to get started!"}
                    </motion.div>
                )}

                {/* Pagination */}
                {filteredUsers.length > itemsPerPage && ( // Only show pagination if there are more items than itemsPerPage in the filtered list
                    <div className="mt-8 flex justify-center">
                        <ReactPaginate
                            previousLabel={"«"}
                            nextLabel={"»"}
                            breakLabel={"..."}
                            pageCount={Math.ceil(filteredUsers.length / itemsPerPage)} // Use filteredUsers length for page count
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={3} // Adjust to display fewer pages if desired
                            onPageChange={handlePageClick}
                            containerClassName={"flex space-x-1 items-center"} // Tailwind classes for overall container
                            pageClassName={"block"} // Ensure each page item is a block for padding
                            pageLinkClassName={"block px-4 py-2 leading-tight bg-white border border-gray-300 text-gray-700 hover:bg-gray-200 hover:text-gray-900 rounded-lg transition-colors duration-200"} // Base style for page links
                            previousClassName={"block"}
                            previousLinkClassName={"block px-4 py-2 leading-tight bg-white border border-gray-300 text-gray-700 hover:bg-gray-200 hover:text-gray-900 rounded-lg transition-colors duration-200"}
                            nextClassName={"block"}
                            nextLinkClassName={"block px-4 py-2 leading-tight bg-white border border-gray-300 text-gray-700 hover:bg-gray-200 hover:text-gray-900 rounded-lg transition-colors duration-200"}
                            breakClassName={"block"}
                            breakLinkClassName={"block px-4 py-2 leading-tight bg-white border border-gray-300 text-gray-700 rounded-lg"}
                            activeClassName={"!bg-blue-600 !text-white !border-blue-600 hover:!bg-blue-700"} // Active page style with !important overrides
                            disabledClassName={"opacity-50 cursor-not-allowed"} // Style for disabled prev/next buttons
                        />
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ViewUsers;
