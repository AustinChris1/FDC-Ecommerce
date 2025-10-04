import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    HardDrive,
    Package,
    Users,
    ClipboardList,
    Settings,
    BarChart,
    ChevronDown,
    X,
    CirclePercent,
    Activity,
} from 'lucide-react';
import { Locate } from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => { 
    const location = useLocation(); 
    const authEmail = localStorage.getItem('auth_email') || 'Admin User';

    const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
    const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);

    useEffect(() => {
        if (window.innerWidth < 1024 && isOpen && toggleSidebar) {
            toggleSidebar();
        }
    }, [location.pathname]); 

    // Effect to prevent body scroll when sidebar is open on mobile
    useEffect(() => {
        const handleResize = () => {
            // If resized to desktop, ensure body overflow is auto
            if (window.innerWidth >= 1024) {
                document.body.style.overflow = 'auto';
            } else {
                // On mobile, control overflow based on isOpen
                document.body.style.overflow = isOpen ? 'hidden' : 'auto';
            }
        };

        window.addEventListener('resize', handleResize);

        // Initial check
        handleResize();

        // Cleanup function to remove event listener and reset overflow
        return () => {
            window.removeEventListener('resize', handleResize);
            document.body.style.overflow = 'auto'; // Always reset on unmount
        };
    }, [isOpen]); // Dependency on isOpen for mobile overflow control

    // Framer Motion variants for sidebar slide animation
    const sidebarVariants = {
        // 'hidden' for sliding out (mobile)
        hidden: {
            x: '-100%',
            opacity: 0,
            transition: { type: 'tween', duration: 0.2, ease: "easeOut" }
        },
        // 'visible' for sliding in (mobile) or for static desktop display
        visible: {
            x: '0%',
            opacity: 1,
            transition: { type: 'tween', duration: 0.3, ease: "easeOut" }
        },
    };

    // Link hover variants (unchanged, but ensuring they apply smoothly)
    const linkHoverVariants = {
        hover: { x: 5, backgroundColor: 'rgba(235, 245, 255, 0.8)', color: '#2563EB', scale: 1.02 },
        tap: { scale: 0.98 },
    };

    // Tailwind CSS classes for active and normal links
    const activeLinkClasses = "bg-blue-100 text-blue-700 font-semibold border-l-4 border-blue-600";
    const normalLinkClasses = "text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent";

    return (
        // AnimatePresence is used only for mobile sidebar's mount/unmount animation
        // On desktop, the sidebar is always present in the DOM for layout
        <AnimatePresence>
            {/* Conditional rendering for mobile, always render on desktop */}
            {(isOpen || window.innerWidth >= 1024) && (
                <motion.div
                    className="fixed lg:static lg:h-screen lg:pt-0 top-0 left-0 bottom-0 h-full w-64 bg-white shadow-xl lg:shadow-none border-r border-gray-200 z-40 flex flex-col pt-16"
                    initial={window.innerWidth < 1024 && !isOpen ? "hidden" : "visible"} // Only animate in from 'hidden' if on mobile and *not* already open
                    animate="visible" // Always transition to 'visible' state (either animated in or statically present)
                    exit="hidden" // Only animate out (slide left) when 'isOpen' becomes false on mobile
                    variants={sidebarVariants}
                >
                    {/* Mobile Close Button (only visible on small screens) */}
                    <div className="absolute top-4 right-4 lg:hidden">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                            aria-label="Close sidebar"
                        >
                            <X className="w-7 h-7" />
                        </button>
                    </div>

                    {/* Sidebar Menu - Added desktop-specific scroll handling */}
                    <div className="flex-1 overflow-y-auto pb-4 pt-4 px-4 lg:pt-6"> {/* Adjusted padding for scrollbar, lg:pt-6 for better desktop spacing */}
                        <nav className="space-y-2">
                            {/* Core */}
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-2 px-3">CORE</div>
                            <motion.div
                                whileHover="hover"
                                whileTap="tap"
                                variants={linkHoverVariants}
                            >
                                <Link
                                    className={`flex items-center p-3 rounded-lg transition-all duration-200 ${location.pathname === '/admin/dashboard' ? activeLinkClasses : normalLinkClasses}`}
                                    to="/admin/dashboard"
                                    onClick={window.innerWidth < 1024 ? toggleSidebar : undefined} // Only close sidebar on click if it's mobile
                                >
                                    <LayoutDashboard className="w-5 h-5 mr-3 text-blue-500" />
                                    Dashboard
                                </Link>
                            </motion.div>
                            <motion.div
                                whileHover="hover"
                                whileTap="tap"
                                variants={linkHoverVariants}
                            >
                                <Link
                                    className={`flex items-center p-3 rounded-lg transition-all duration-200 ${location.pathname === '/admin/sales' ? activeLinkClasses : normalLinkClasses}`}
                                    to="/admin/sales"
                                    onClick={window.innerWidth < 1024 ? toggleSidebar : undefined} // Only close sidebar on click if it's mobile
                                >
                                    <CirclePercent className="w-5 h-5 mr-3 text-blue-500" />
                                    Sales
                                </Link>
                            </motion.div>
                            <motion.div
                                whileHover="hover"
                                whileTap="tap"
                                variants={linkHoverVariants}
                            >
                                <Link
                                    className={`flex items-center p-3 rounded-lg transition-all duration-200 ${location.pathname === '/admin/locations' ? activeLinkClasses : normalLinkClasses}`}
                                    to="/admin/locations"
                                    onClick={window.innerWidth < 1024 ? toggleSidebar : undefined} // Only close sidebar on click if it's mobile
                                >
                                    <Locate className="w-5 h-5 mr-3 text-blue-500" />
                                    Store locations
                                </Link>
                            </motion.div>

                            {/* Category */}
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-2 px-3 mt-4">CATEGORY</div>
                            {/* Add Category */}
                            <motion.div
                                whileHover="hover"
                                whileTap="tap"
                                variants={linkHoverVariants}
                            >
                                <Link
                                    className={`flex items-center p-3 rounded-lg transition-all duration-200 ${location.pathname === '/admin/category' ? activeLinkClasses : normalLinkClasses}`}
                                    to="/admin/category"
                                    onClick={window.innerWidth < 1024 ? toggleSidebar : undefined}
                                >
                                    <HardDrive className="w-5 h-5 mr-3 text-emerald-500" />
                                    Add Category
                                </Link>
                            </motion.div>
                            {/* View Category */}
                            <motion.div
                                whileHover="hover"
                                whileTap="tap"
                                variants={linkHoverVariants}
                            >
                                <Link
                                    className={`flex items-center p-3 rounded-lg transition-all duration-200 ${location.pathname === '/admin/category/view' ? activeLinkClasses : normalLinkClasses}`}
                                    to="/admin/category/view"
                                    onClick={window.innerWidth < 1024 ? toggleSidebar : undefined}
                                >
                                    <ClipboardList className="w-5 h-5 mr-3 text-cyan-500" />
                                    View Categories
                                </Link>
                            </motion.div>

                            {/* Products */}
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-2 px-3 mt-4">PRODUCTS</div>
                            {/* Add Products */}
                            <motion.div
                                whileHover="hover"
                                whileTap="tap"
                                variants={linkHoverVariants}
                            >
                                <Link
                                    className={`flex items-center p-3 rounded-lg transition-all duration-200 ${location.pathname === '/admin/products' ? activeLinkClasses : normalLinkClasses}`}
                                    to="/admin/products"
                                    onClick={window.innerWidth < 1024 ? toggleSidebar : undefined}
                                >
                                    <Package className="w-5 h-5 mr-3 text-orange-500" />
                                    Add Products
                                </Link>
                            </motion.div>
                            {/* View Products */}
                            <motion.div
                                whileHover="hover"
                                whileTap="tap"
                                variants={linkHoverVariants}
                            >
                                <Link
                                    className={`flex items-center p-3 rounded-lg transition-all duration-200 ${location.pathname === '/admin/products/view' ? activeLinkClasses : normalLinkClasses}`}
                                    to="/admin/products/view"
                                    onClick={window.innerWidth < 1024 ? toggleSidebar : undefined}
                                >
                                    <BarChart className="w-5 h-5 mr-3 text-purple-500" />
                                    View Products
                                </Link>
                            </motion.div>
                            {/* Manage Teams (renamed to Users for clarity in dashboard context) */}
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-2 px-3 mt-4">USERS & MANAGEMENT</div>
                            <motion.div
                                whileHover="hover"
                                whileTap="tap"
                                variants={linkHoverVariants}
                            >
                                <Link
                                    className={`flex items-center p-3 rounded-lg transition-all duration-200 ${location.pathname === '/admin/users/view' ? activeLinkClasses : normalLinkClasses}`}
                                    to="/admin/users/view" // Changed path to a more general "view users"
                                    onClick={window.innerWidth < 1024 ? toggleSidebar : undefined}
                                >
                                    <Users className="w-5 h-5 mr-3 text-pink-500" />
                                    Manage Users
                                </Link>
                            </motion.div>
                            {/* Manage Orders */}
                            <motion.div
                                whileHover="hover"
                                whileTap="tap"
                                variants={linkHoverVariants}
                            >
                                <Link
                                    className={`flex items-center p-3 rounded-lg transition-all duration-200 ${location.pathname === '/admin/orders/view' ? activeLinkClasses : normalLinkClasses}`}
                                    to="/admin/orders"
                                    onClick={window.innerWidth < 1024 ? toggleSidebar : undefined}
                                >
                                    <ClipboardList className="w-5 h-5 mr-3 text-red-500" /> {/* Changed icon color for orders */}
                                    View Orders
                                </Link>
                            </motion.div>

                            {/* Other Addons */}
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-2 px-3 mt-4">ADDONS</div>
                            <motion.div
                                whileHover="hover"
                                whileTap="tap"
                                variants={linkHoverVariants}
                            >
                                <Link
                                    className={`flex items-center p-3 rounded-lg transition-all duration-200 ${location.pathname === '/admin/settings' ? activeLinkClasses : normalLinkClasses}`}
                                    to="/admin/settings"
                                    onClick={window.innerWidth < 1024 ? toggleSidebar : undefined}
                                >
                                    <Settings className="w-5 h-5 mr-3 text-gray-500" />
                                    General Settings
                                </Link>
                            </motion.div>
                            <motion.div
                                whileHover="hover"
                                whileTap="tap"
                                variants={linkHoverVariants}
                            >
                                <Link
                                    className={`flex items-center p-3 rounded-lg transition-all duration-200 ${location.pathname === '/admin/activity' ? activeLinkClasses : normalLinkClasses}`}
                                    to="/admin/activity"
                                    onClick={window.innerWidth < 1024 ? toggleSidebar : undefined}
                                >
                                    <Activity className="w-5 h-5 mr-3 text-gray-500" />
                                    Activity Logs
                                </Link>
                            </motion.div>
                        </nav>
                    </div>

                    {/* Sidebar Footer */}
                    <div className="flex-shrink-0 p-4 border-t border-gray-200 text-gray-600">
                        <div className="text-sm font-semibold">Logged in as:</div>
                        <div className="text-sm text-gray-800">{authEmail}</div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Sidebar;
