import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    ShoppingCart,
    User,
    Menu,
    X,
    LogOut,
    KeySquare,
    ShoppingBag,
    Truck, MessageSquare, HelpCircle, Sun, Moon
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Load from './Load';
import NewDropdownMenu from './Dropdown'; // Keep this for "Help" dropdown

import { useCart } from './CartContext';

import fdcLogo from '../assets/fdcLogo.png'; // Light logo for dark background
import fdcLogoBlack from '../assets/fdcLogoBlack.png'; // Dark logo for light background

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    // category state is no longer needed in Navbar if SubNavbar handles it
    // const [category, setCategory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const desktopSearchRef = useRef(null);
    const mobileMenuRef = useRef(null);

    // Dark mode state and effect
    const [darkMode, setDarkMode] = useState(() => {
        // Prioritize "dark" from localStorage, then system preference, then default to dark
        if (localStorage.getItem("theme") === "light") {
            return false;
        }
        if (localStorage.getItem("theme") === "dark") {
            return true;
        }
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode(prevMode => !prevMode);
    };

    const { totalCartItems, toggleCart } = useCart();

    const handleNavigation = (path) => {
        setSearchResults([]);
        setSearchTerm('');
        navigate(path);
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (isMobileMenuOpen) {
            setIsMobileMenuOpen(false);
        }
    }, [location.pathname]);

    // Removed category fetch from Navbar as SubNavbar will handle it

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
                toast.success("User logout successful (local data cleared).");
            }
        } catch (err) {
            console.error("Logout request failed:", err);
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_name");
            localStorage.removeItem("auth_email");
            localStorage.removeItem("role");
            toast.success("Logout successful (due to network error or unhandled backend response).");
        } finally {
            navigate(currentPath);
            setIsMobileMenuOpen(false);
        }
    };

    const AuthLink = localStorage.getItem('auth_token') ? (
        <>
            <Link to="/user/orders" onClick={() => handleNavigation('/user/orders')} className="flex items-center dark:text-cyan-400 text-blue-600 dark:hover:text-cyan-300 hover:text-blue-500 transition-colors py-2 px-3 rounded-full dark:hover:bg-gray-950 hover:bg-gray-100" title="My Orders">
                <ShoppingBag className="w-5 h-5 mr-1" />
                <span className="hidden lg:inline">My Orders</span>
            </Link>
            <button onClick={logout} className="flex items-center dark:text-red-400 text-red-600 dark:hover:text-red-500 hover:text-red-700 transition-colors py-2 px-3 rounded-full dark:hover:bg-gray-950 hover:bg-gray-100" title="Log Out">
                <LogOut className="w-5 h-5 mr-1" />
                <span className="hidden lg:inline">Logout</span>
            </button>
        </>
    ) : (
        <Link to="/login" onClick={() => handleNavigation('/login')} className="flex items-center dark:text-cyan-400 text-blue-600 dark:hover:text-cyan-300 hover:text-blue-500 transition-colors py-2 px-3 rounded-full dark:hover:bg-gray-950 hover:bg-gray-100" title="Log In">
            <User className="w-5 h-5 mr-1" />
            <span className="hidden lg:inline">Login</span>
        </Link>
    );

    const AdminLink = localStorage.getItem('role') === 'admin' && (
        <Link to="/admin/dashboard" onClick={() => handleNavigation('/admin/dashboard')} className="flex items-center dark:text-purple-400 text-purple-700 dark:hover:text-purple-300 hover:text-purple-600 transition-colors py-2 px-3 rounded-full dark:hover:bg-gray-950 hover:bg-gray-100" title="Admin Dashboard">
            <KeySquare className="w-5 h-5 mr-1" />
            <span className="hidden lg:inline">Admin</span>
        </Link>
    );

    const handleSearch = async (e) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (term.trim().length > 2) {
            setIsLoading(true);
            try {
                const response = await axios.get(`/api/search`, {
                    params: { query: term },
                    headers: { 'Accept': 'application/json' },
                });

                if (response.data.status === 200 && response.data.products && response.data.products.length > 0) {
                    setSearchResults(response.data.products);
                } else {
                    setSearchResults([]);
                }
            } catch (error) {
                console.error('Search error:', error);
                setSearchResults([]);
            } finally {
                setIsLoading(false);
            }
        } else {
            setSearchResults([]);
        }
    };

    useEffect(() => {
        const handleClickOutsideSearch = (event) => {
            if (desktopSearchRef.current && !desktopSearchRef.current.contains(event.target)) {
                setSearchResults([]);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutsideSearch);
        return () => document.removeEventListener('mousedown', handleClickOutsideSearch);
    }, []);

    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'auto';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isMobileMenuOpen]);

    useEffect(() => {
        const handleClickOutsideMobileMenu = (event) => {
            const menuToggleButton = document.querySelector('[aria-label="Toggle Menu"]');

            if (
                isMobileMenuOpen &&
                mobileMenuRef.current &&
                !mobileMenuRef.current.contains(event.target) &&
                (!menuToggleButton || !menuToggleButton.contains(event.target))
            ) {
                setIsMobileMenuOpen(false);
            }
        };

        if (isMobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutsideMobileMenu);
        } else {
            document.removeEventListener('mousedown', handleClickOutsideMobileMenu);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutsideMobileMenu);
        };
    }, [isMobileMenuOpen]);

    const helpMenuItems = [
        { name: 'Track Order', link: '/track-order', icon: Truck },
        { name: 'Contact', link: '/contact', icon: MessageSquare },
        { name: 'FAQ', link: 'support/faq', icon: HelpCircle },
    ];
    return (
        <nav
            className={`fixed top-0 z-50 w-full transition-all duration-300 ease-in-out
            ${isScrolled
                    ? 'dark:bg-gray-900/90 bg-white/90 dark:shadow-xl shadow-lg py-1 backdrop-blur-md'
                    : 'dark:bg-gray-950 bg-white py-2'
                }`}
        >
            <div className="container mx-auto px-4 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" onClick={() => handleNavigation('/')} className="flex-shrink-0">
                    <img
                        src={darkMode ? fdcLogo : fdcLogoBlack} // Conditional rendering for logos
                        alt="First Digit Communications"
                        className={`${darkMode ? 'h-14 lg:h-14 w-auto sm:h-14' : 'h-14 w-24 sm:h-14'}`}
                    />
                </Link>

                {/* Desktop Menu - Centralized */}
                <ul className="hidden lg:flex items-center space-x-8 mx-auto">
                    <li>
                        <Link to="/" onClick={() => handleNavigation('/')} className="dark:text-gray-300 text-gray-700 dark:hover:text-cyan-400 hover:text-blue-600 text-lg font-medium transition-colors relative group">
                            Home
                            <span className="absolute left-0 bottom-0 w-full h-[2px] dark:bg-cyan-400 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/shop" onClick={() => handleNavigation('/shop')} className="dark:text-gray-300 text-gray-700 dark:hover:text-cyan-400 hover:text-blue-600 text-lg font-medium transition-colors relative group">
                            Shop
                            <span className="absolute left-0 bottom-0 w-full h-[2px] dark:bg-cyan-400 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                        </Link>
                    </li>
                    {/* Categories Dropdown REMOVED from Navbar */}
                    <NewDropdownMenu
                        title="Support"
                        items={helpMenuItems}
                        handleNavigation={handleNavigation}
                        isMobile={false}
                    />
                </ul>

                {/* Desktop Icons & Search */}
                <div className="hidden lg:flex items-center space-x-4">
                    <div className="relative" ref={desktopSearchRef}>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearch}
                            placeholder="Search products..."
                            className="p-2 pl-10 rounded-full dark:bg-gray-950 bg-white dark:border-gray-900 border-gray-300 dark:text-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 w-64 md:w-80 lg:w-96 transition-all duration-300 ease-in-out text-sm dark:placeholder-gray-400 placeholder-gray-500" // Increased width with w-64 md:w-80 lg:w-96
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 dark:text-gray-500 text-gray-400" />
                        {isLoading && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Load />
                            </span>
                        )}
                        <AnimatePresence>
                            {searchResults.length > 0 && searchTerm.length > 1 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute top-full left-0 right-0 mt-2 dark:bg-gray-950 bg-white shadow-lg rounded-lg dark:border-gray-900 border-gray-300 max-h-60 overflow-y-auto z-10"
                                >
                                    <ul>
                                        {searchResults.map((item) => (
                                            <li key={item.id} className="p-3 dark:hover:bg-gray-900 hover:bg-gray-100 cursor-pointer dark:border-b dark:border-gray-900 border-b border-gray-200 last:border-b-0">
                                                <Link
                                                    to={`/collections/${item.category?.link || 'default-category'}/${item.link}`}
                                                    className="block dark:text-gray-200 text-gray-800 text-sm"
                                                    onClick={() => { setSearchTerm(''); setSearchResults([]); handleNavigation(`/collections/${item.category?.link || 'default-category'}/${item.link}`); }}
                                                >
                                                    {item.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            )}
                            {searchTerm.length > 1 && !isLoading && searchResults.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute top-full left-0 right-0 mt-2 dark:bg-gray-950 bg-white shadow-lg rounded-lg dark:border-gray-900 border-gray-300 p-3 text-center dark:text-gray-500 text-gray-400 text-sm z-10"
                                >
                                    No products found.
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-full dark:hover:bg-gray-950 hover:bg-gray-100 transition-colors"
                        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {darkMode ? (
                            <Sun className="w-6 h-6 text-yellow-400" />
                        ) : (
                            <Moon className="w-6 h-6 text-gray-700" />
                        )}
                    </button>
                    <button onClick={toggleCart} className="relative dark:text-gray-300 text-gray-700 dark:hover:text-lime-400 hover:text-green-600 transition-colors p-2 rounded-full dark:hover:bg-gray-950 hover:bg-gray-100" title="Shopping Cart">
                        <ShoppingCart className="w-6 h-6" />
                        {totalCartItems > 0 && (
                            <AnimatePresence>
                                <motion.span
                                    key={totalCartItems}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                                >
                                    {totalCartItems}
                                </motion.span>
                            </AnimatePresence>
                        )}
                    </button>
                    {AuthLink}
                    {AdminLink}
                </div>

                {/* Mobile Menu Toggle & Icons */}
                <div className="flex items-center lg:hidden space-x-4">
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-full dark:hover:bg-gray-950 hover:bg-gray-100 transition-colors"
                        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {darkMode ? (
                            <Sun className="w-6 h-6 text-yellow-400" />
                        ) : (
                            <Moon className="w-6 h-6 text-gray-700" />
                        )}
                    </button>
                    <button onClick={toggleCart} className="relative dark:text-gray-300 text-gray-700 dark:hover:text-lime-400 hover:text-green-600 transition-colors" title="Shopping Cart">
                        <ShoppingCart className="w-6 h-6" />
                        {totalCartItems > 0 && (
                            <AnimatePresence>
                                <motion.span
                                    key={totalCartItems + '_mobile'}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                                >
                                    {totalCartItems}
                                </motion.span>
                            </AnimatePresence>
                        )}
                    </button>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle Menu" className="dark:text-gray-300 text-gray-700 dark:hover:text-cyan-400 hover:text-blue-600 transition-colors">
                        {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        ref={mobileMenuRef}
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="fixed top-0 right-0 min-h-screen w-full dark:bg-gray-950 bg-white flex flex-col pt-20 px-6 pb-1 overflow-y-auto shadow-xl lg:hidden z-40"
                    >
                        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-50">
                            <Link to="/" onClick={() => handleNavigation('/')} className="flex-shrink-0">
                                <img
                                    src={darkMode ? fdcLogo : fdcLogoBlack}
                                    alt="First Digit Communications"
                                    className="h-14 w-auto sm:h-14"
                                />
                            </Link>
                            <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close Menu" className="dark:text-gray-300 text-gray-700 dark:hover:text-white hover:text-gray-900 transition-colors">
                                <X className="w-8 h-8" />
                            </button>
                        </div>
                        <ul className="flex flex-col space-y-6 mt-8 flex-grow">
                            <li>
                                <Link to="/" onClick={() => handleNavigation('/')} className="block dark:text-gray-200 text-gray-800 dark:hover:text-cyan-400 hover:text-blue-600 text-xl font-semibold py-2">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/shop" onClick={() => handleNavigation('/shop')} className="block dark:text-gray-200 text-gray-800 dark:hover:text-cyan-400 hover:text-blue-600 text-xl font-semibold py-2">
                                    Shop
                                </Link>
                            </li>
                            {/* Categories Dropdown REMOVED from Mobile Navbar */}
                            <NewDropdownMenu
                                title="Support"
                                items={helpMenuItems}
                                handleNavigation={handleNavigation}
                                isMobile={true}
                            />
                            <li className="relative w-full mt-6">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    placeholder="Search products..."
                                    className="w-full p-3 pl-12 dark:border-gray-900 border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-950 bg-white dark:text-gray-200 text-gray-800 dark:placeholder-gray-400 placeholder-gray-500"
                                    aria-label="Mobile Search Input"
                                />
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 dark:text-gray-500 text-gray-400" />
                                {isLoading && (
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <Load />
                                    </span>
                                )}
                                <AnimatePresence>
                                    {searchResults.length > 0 && searchTerm.length > 1 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="mt-2 dark:bg-gray-950 bg-white rounded-md shadow-lg p-1 max-h-40 overflow-y-auto"
                                        >
                                            {searchResults.map((product) => (
                                                <div key={product.id} className="dark:border-b dark:border-gray-900 border-b border-gray-200 py-2 last:border-b-0">
                                                    <Link to={`/collections/${product.category?.link || 'default-category'}/${product.link}`} onClick={() => { setSearchResults([]); setSearchTerm(''); handleNavigation(`/collections/${product.category?.link || 'default-category'}/${product.link}`); }}>
                                                        <span className="block dark:text-gray-200 text-gray-800 dark:hover:text-cyan-400 hover:text-blue-600">{product.name}</span>
                                                    </Link>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                    {searchTerm.length > 1 && !isLoading && searchResults.length === 0 && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="text-center dark:text-gray-500 text-gray-400 mt-4"
                                        >No products found.</motion.p>
                                    )}
                                </AnimatePresence>
                            </li>
                        </ul>
                        <div className="mt-auto dark:border-t dark:border-gray-900 border-t border-gray-200 pt-2 flex flex-col space-y-3">
                            {localStorage.getItem('auth_token') ? (
                                <>
                                    <Link to="/user/orders" onClick={() => handleNavigation('/user/orders')} className="flex items-center dark:text-purple-400 text-purple-700 dark:hover:text-purple-300 hover:text-purple-600 transition-colors py-2 px-3 rounded-full dark:hover:bg-gray-950 hover:bg-gray-100 text-xl font-semibold w-fit">
                                        <ShoppingBag className="w-6 h-6 mr-2" />
                                        <span>My Orders</span>
                                    </Link>

                                    <button onClick={logout} className="flex items-center dark:text-red-400 text-red-600 dark:hover:text-red-500 hover:text-red-700 transition-colors py-2 px-3 rounded-full dark:hover:bg-gray-950 hover:bg-gray-100 text-xl font-semibold w-fit">
                                        <LogOut className="w-6 h-6 mr-2" />
                                        <span>Logout</span>
                                    </button>
                                </>
                            ) : (
                                <Link to="/login" onClick={() => handleNavigation('/login')} className="flex items-center dark:text-cyan-400 text-blue-600 dark:hover:text-cyan-300 hover:text-blue-500 transition-colors py-2 px-3 rounded-full dark:hover:bg-gray-950 hover:bg-gray-100 text-xl font-semibold w-fit">
                                    <User className="w-6 h-6 mr-2" />
                                    <span>Login</span>
                                </Link>
                            )}
                            {localStorage.getItem('role') === 'admin' && (
                                <Link to="/admin/dashboard" onClick={() => handleNavigation('/admin/dashboard')} className="flex items-center dark:text-purple-400 text-purple-700 dark:hover:text-purple-300 hover:text-purple-600 transition-colors py-2 px-3 rounded-full dark:hover:bg-gray-950 hover:bg-gray-100 text-xl font-semibold w-fit">
                                    <KeySquare className="w-6 h-6 mr-2" />
                                    <span>Admin</span>
                                </Link>
                            )}
                            <div className="flex items-center py-8 px-3 w-fit">
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;