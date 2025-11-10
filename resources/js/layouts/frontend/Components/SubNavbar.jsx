import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Load from './Load';

const SubNavbar = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const displayedCategoryCount = 4;

    useEffect(() => {
        axios.get('/api/getCategory')
            .then(res => {
                if (res.data.status === 200 && res.data.category) {
                    const formattedCategories = res.data.category.map(cat => ({
                        name: cat.name,
                        link: `/collections/${cat.link}`,
                        image: cat.image ? `/${cat.image}` : `https://placehold.co/80x80/e0e0e0/555555?text=${cat.name.charAt(0)}`
                    }));
                    setCategories(formattedCategories);
                } else {
                    console.error("Unable to fetch categories for SubNavbar.");
                    // toast.error(res.data.message || "Failed to load categories.");
                }
            })
            .catch(err => {
                console.error("Network or server error fetching categories for SubNavbar:", err);
                // toast.error("Network error. Could not load categories.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleCategoryClick = (link) => {
        setIsSidebarOpen(false);
        navigate(link);
    };

    // Prevent body scroll when sidebar is open
    useEffect(() => {
        document.body.style.overflow = isSidebarOpen ? 'hidden' : 'auto';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isSidebarOpen]);

    const sidebarVariants = {
        hidden: { x: '-100%' },
        visible: { x: 0, transition: { type: 'spring', stiffness: 120, damping: 20 } },
        exit: { x: '-100%', transition: { ease: 'easeInOut', duration: 0.3 } }
    };

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
    };

    return (
        <>
            {/* Sub-Navbar Horizontal Bar */}
            <div className="fixed top-[57px] sm:top-[60px] lg:top-[60px] w-full z-40
                           dark:bg-gray-800/80 bg-gray-200/80 backdrop-blur-md shadow-md
                           py-1.5 px-4 flex justify-between items-center">

                {/* "All Categories" Button */}
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="flex items-center px-4 py-2 rounded-lg font-semibold transition-colors
                               dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white
                               bg-red-900 hover:bg-red-800 text-white shadow-md text-sm sm:text-base flex-shrink-0"
                >
                    <Menu className="w-5 h-5 mr-2" /> All Categories
                </button>

                <div className="hidden md:flex items-center flex-grow pl-6 pr-4 overflow-x-auto"> {/* Added overflow-x-auto */}
                    {loading ? (
                        <div className="flex items-center w-full justify-start">
                            <Load /> <span className="ml-2 dark:text-gray-400 text-gray-600 text-sm">Loading categories...</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-6">
                            {categories.slice(0, displayedCategoryCount).map(cat => (
                                <Link
                                    key={cat.name}
                                    to={cat.link}
                                    onClick={() => handleCategoryClick(cat.link)}
                                    className="whitespace-nowrap dark:text-gray-300 text-gray-700 dark:hover:text-cyan-400 hover:text-blue-600 text-sm sm:text-base font-medium transition-colors relative group"
                                >
                                    {cat.name}
                                    <span className="absolute left-0 bottom-0 w-full h-[2px] dark:bg-cyan-400 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                                </Link>
                            ))}
                            {categories.length > displayedCategoryCount && !loading && (
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="whitespace-nowrap dark:text-gray-300 text-gray-700 dark:hover:text-cyan-400 hover:text-blue-600 text-sm sm:text-base font-medium transition-colors relative group"
                                >
                                    More...
                                    <span className="absolute left-0 bottom-0 w-full h-[2px] dark:bg-cyan-400 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="hidden md:block w-fit">
                </div>
            </div>

            {/* Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={overlayVariants}
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        {/* Sidebar Content */}
                        <motion.div
                            className="fixed top-0 left-0 h-full w-64 sm:w-72 md:w-80
                                       dark:bg-gray-900/90 bg-white/90
                                       dark:border-r dark:border-gray-700 border-r border-gray-300
                                       shadow-2xl flex flex-col pt-4 pb-4 overflow-y-auto"
                            variants={sidebarVariants}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center px-6 pb-4 border-b
                                             dark:border-gray-700 border-gray-200">
                                <h2 className="text-2xl font-bold
                                               dark:text-lime-400 text-red-900">All Categories</h2>
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="p-2 rounded-full transition-colors
                                               dark:text-gray-300 dark:hover:bg-gray-800
                                               text-gray-700 hover:bg-gray-100"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            {loading ? (
                                <div className="flex justify-center items-center flex-grow">
                                    <Load />
                                </div>
                            ) : (
                                <ul className="flex flex-col flex-grow py-4 px-2">
                                    {categories.length > 0 ? (
                                        categories.map(cat => (
                                            <li key={cat.name} className="my-1">
                                                <Link
                                                    to={cat.link}
                                                    onClick={() => handleCategoryClick(cat.link)}
                                                    className="flex items-center p-3 rounded-lg transition-colors
                                                               dark:text-gray-200 dark:hover:bg-gray-800
                                                               text-gray-800 hover:bg-gray-100"
                                                >
                                                    {cat.image && (
                                                        <img
                                                            src={cat.image}
                                                            alt={cat.name}
                                                            className="w-8 h-8 object-cover rounded-full mr-3"
                                                            onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/80x80/e0e0e0/555555?text=${cat.name.charAt(0)}`; }}
                                                        />
                                                    )}
                                                    <span className="font-medium text-lg">{cat.name}</span>
                                                </Link>
                                            </li>
                                        ))
                                    ) : (
                                        <p className="text-center text-gray-500 mt-4">No categories found.</p>
                                    )}
                                </ul>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default SubNavbar;