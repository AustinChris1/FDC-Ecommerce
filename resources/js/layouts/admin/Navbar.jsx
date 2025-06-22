import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menu, // For mobile sidebar toggle
    Search,
    User,
    Settings,
    LogOut,
    ChevronDown,
    LayoutDashboard, // Dashboard icon
    HardDrive,       // Category icon (representing storage/organization)
    Package,         // Products icon (representing individual items)
    ClipboardList,           // Teams icon
} from 'lucide-react'; // Import Lucide React icons
import { toast } from 'react-toastify';
import axios from 'axios';


const Navbar = ({ toggleSidebar }) => { // Expects a toggleSidebar prop from parent
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const authEmail = localStorage.getItem('auth_email') || 'Admin User'; // Fallback for display

    const dropdownVariants = {
        hidden: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15, ease: "easeOut" } },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
    };
    const navigate = useNavigate();
    const location = useLocation();

    // Logout functionality
    const logout = async (e) => {
        e.preventDefault();
        const currentPath = location.pathname;

        try {
            await axios.get('/sanctum/csrf-cookie');
            const res = await axios.post('/api/logout');

            if (res.data.status === 200) {
                localStorage.removeItem("auth_token");
                localStorage.removeItem("auth_name");
                localStorage.removeItem("auth_email");
                localStorage.removeItem("role");
                toast.success(res.data.message || "Logged out successfully!");
            } else {
                localStorage.removeItem("auth_token");
                localStorage.removeItem("auth_name");
                localStorage.removeItem("auth_email");
                localStorage.removeItem("role");
                toast.success("Logout successful ");
            }
        } catch (err) {
            console.error("Logout request failed:", err);
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_name");
            localStorage.removeItem("auth_email");
            localStorage.removeItem("role");
            toast.success("Logout successful");
        } finally {
            navigate('/');
        }
    };

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-md border-b border-gray-200 py-3 px-4 sm:px-6 lg:px-8 transition-all duration-300">
            <div className="flex items-center justify-between h-12">
                {/* Brand and Sidebar Toggle */}
                <div className="flex items-center">
                    <button
                        type="button"
                        className="lg:hidden text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-2 mr-3 transition-colors"
                        onClick={toggleSidebar} // This button will toggle the sidebar
                        aria-label="Toggle Sidebar"
                    >
                        <Menu className="w-7 h-7" />
                    </button>
                    <Link className="text-gray-900 text-xl font-bold tracking-tight" to="/">
                        First Digits <span className="text-blue-600">Admin</span>
                    </Link>
                </div>

                {/* Search Bar (Desktop) */}
                <div className="hidden md:block flex-grow max-w-sm mx-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search anything..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 text-sm bg-gray-100"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                </div>

                {/* User Dropdown */}
                <ul className="flex items-center space-x-4">
                    <li className="relative">
                        <button
                            className="flex items-center text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-2 transition-colors"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            aria-expanded={isDropdownOpen}
                            aria-label="User menu"
                        >
                            <User className="w-6 h-6 mr-2" />
                            <span className="hidden sm:inline font-medium text-gray-800">{authEmail}</span>
                            <ChevronDown
                                className={`w-5 h-5 ml-1 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`}
                            />
                        </button>

                        <AnimatePresence>
                            {isDropdownOpen && (
                                <motion.ul
                                    className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-20"
                                    variants={dropdownVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                >
                                    <li>
                                        <Link
                                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                                            to="/admin/settings"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            <Settings className="w-5 h-5 mr-3" /> Settings
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                                            to="/admin/activity"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            <LayoutDashboard className="w-5 h-5 mr-3" /> Activity Log
                                        </Link>
                                    </li>
                                    <li>
                                        <div className="border-t border-gray-200 my-1"></div>
                                    </li>
                                    <li>
                                        <Link
                                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                                            to="/admin/category/view" // Assuming a unified Add/View Categories page later
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            <HardDrive className="w-5 h-5 mr-3" /> Manage Categories
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                                            to="/admin/products/view" // Assuming a unified Add/View Products page later
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            <Package className="w-5 h-5 mr-3" /> Manage Products
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                                            to="/admin/orders" // Assuming a unified Add/View Teams page later
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            <ClipboardList className="w-5 h-5 mr-3" /> Manage Orders
                                        </Link>
                                    </li>
                                    <li>
                                        <div className="border-t border-gray-200 my-1"></div>
                                    </li>
                                    <li>
                                        <button
                                            className="flex items-center w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                                            onClick={logout}
                                        >
                                            <LogOut className="w-5 h-5 mr-3" /> Logout
                                        </button>
                                    </li>
                                </motion.ul>
                            )}
                        </AnimatePresence>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;