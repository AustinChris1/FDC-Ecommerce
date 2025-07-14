// src/Components/Navbar.jsx
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
    Truck, MessageSquare, HelpCircle} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Load from './Load';
// Make sure this path is correct and it's exporting as default
import NewDropdownMenu from './Dropdown'; // Corrected import name for clarity

import { useCart } from './CartContext';

import fdcLogo from '../assets/fdcLogo.png';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Hook to get current location
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    // category state will now store objects with name, link, and image
    const [category, setCategory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const desktopSearchRef = useRef(null);
    const mobileMenuRef = useRef(null); // Ref for the mobile menu container

    // Dark mode state and effect
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("theme") === "dark" ||
        (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );

    useEffect(() => {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
    }, [darkMode]);

    // Access totalCartItems and toggleCart from your CartContext
    const { totalCartItems, toggleCart } = useCart();

    const handleNavigation = (path) => {
        // REMOVED: setIsMobileMenuOpen(false); // This is now handled by the useEffect listening to location.pathname
        setSearchResults([]);
        setSearchTerm('');
        navigate(path);
    };

    // Handle scroll for sticky navbar effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Effect to close mobile menu automatically when location changes
    // This is the primary mechanism for closing the menu on navigation
    useEffect(() => {
        if (isMobileMenuOpen) {
            setIsMobileMenuOpen(false);
        }
    }, [location.pathname]); // Dependency on location.pathname ensures this runs on every route change

    // Fetch categories from backend on component mount
    useEffect(() => {
        axios.get('/api/getCategory')
            .then(res => {
                if (res.data.status === 200) {
                    // Map the fetched categories to include name, link, and image
                    const formattedCategories = res.data.category.map(cat => ({
                        name: cat.name,
                        link: `/collections/${cat.link}`, // Adjust link path as per your routing
                        image: cat.image ? `/${cat.image}` : `https://placehold.co/180x180/e0e0e0/555555?text=${cat.name}`
                    }));
                    setCategory(formattedCategories);
                } else {
                    console.error("Unable to fetch categories for Navbar.");
                }
            })
            .catch(err => {
                console.error("Network or server error fetching categories:", err);
            });
    }, []);

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
                // Even if backend fails, clear local storage for security
                localStorage.removeItem("auth_token");
                localStorage.removeItem("auth_name");
                localStorage.removeItem("auth_email");
                localStorage.removeItem("role");
                toast.success("User logout successful (local data cleared).");
            }
        } catch (err) {
            console.error("Logout request failed:", err);
            // Ensure local storage is cleared even on network/other errors
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_name");
            localStorage.removeItem("auth_email");
            localStorage.removeItem("role");
            toast.success("Logout successful (due to network error or unhandled backend response).");
        } finally {
            navigate(currentPath); // Redirect to current path to refresh auth state
            setIsMobileMenuOpen(false); // Ensure menu closes after logout attempt
        }
    };

    // Auth & Admin Links
    const AuthLink = localStorage.getItem('auth_token') ? (
        <>
            <Link to="/user/orders" onClick={() => handleNavigation('/user/orders')} className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors py-2 px-3 rounded-full hover:bg-gray-950" title="My Orders">
                <ShoppingBag className="w-5 h-5 mr-1" />
                <span className="hidden lg:inline">My Orders</span>
            </Link>
            <button onClick={logout} className="flex items-center text-red-400 hover:text-red-500 transition-colors py-2 px-3 rounded-full hover:bg-gray-950" title="Log Out">
                <LogOut className="w-5 h-5 mr-1" />
                <span className="hidden lg:inline">Logout</span>
            </button>
        </>
    ) : (
        <Link to="/login" onClick={() => handleNavigation('/login')} className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors py-2 px-3 rounded-full hover:bg-gray-950" title="Log In">
            <User className="w-5 h-5 mr-1" />
            <span className="hidden lg:inline">Login</span>
        </Link>
    );

    const AdminLink = localStorage.getItem('role') === 'admin' && (
        <Link to="/admin/dashboard" onClick={() => handleNavigation('/admin/dashboard')} className="flex items-center text-purple-400 hover:text-purple-300 transition-colors py-2 px-3 rounded-full hover:bg-gray-950" title="Admin Dashboard">
            <KeySquare className="w-5 h-5 mr-1" />
            <span className="hidden lg:inline">Admin</span>
        </Link>
    );

    // Search functionality for desktop and mobile
    const handleSearch = async (e) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (term.trim().length > 2) { // Only search if term is long enough
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
            setSearchResults([]); // Clear results if input is too short or empty
        }
    };

    // Close desktop search results when clicking outside
    useEffect(() => {
        const handleClickOutsideSearch = (event) => {
            if (desktopSearchRef.current && !desktopSearchRef.current.contains(event.target)) {
                setSearchResults([]);
                setSearchTerm(''); // Clear search term as well
            }
        };
        document.addEventListener('mousedown', handleClickOutsideSearch);
        return () => document.removeEventListener('mousedown', handleClickOutsideSearch);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'auto';
        // Cleanup function ensures scroll is re-enabled on unmount
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isMobileMenuOpen]);

    // FIX: Close mobile menu when clicking outside of it
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
                    ? 'bg-gray-900/90 shadow-xl py-3 backdrop-blur-md'
                    : 'bg-gray-950 py-4'
                }`}
        >
            <div className="container mx-auto px-4 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" onClick={() => handleNavigation('/')} className="flex-shrink-0">
                    <img src={fdcLogo} alt="First Digit Communications" className="h-10 w-15 sm:h-12 sm:w-15 filter brightness-150" />
                </Link>

                {/* Desktop Menu - Centralized */}
                <ul className="hidden lg:flex items-center space-x-8 mx-auto">
                    <li>
                        <Link to="/" onClick={() => handleNavigation('/')} className="text-gray-300 hover:text-cyan-400 text-lg font-medium transition-colors relative group">
                            Home
                            <span className="absolute left-0 bottom-0 w-full h-[2px] bg-cyan-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/shop" onClick={() => handleNavigation('/shop')} className="text-gray-300 hover:text-cyan-400 text-lg font-medium transition-colors relative group">
                            Shop
                            <span className="absolute left-0 bottom-0 w-full h-[2px] bg-cyan-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                        </Link>
                    </li>
                    {/* Categories Dropdown */}
                    <NewDropdownMenu
                        title="Categories"
                        // Pass the entire category objects as items
                        items={category}
                        handleNavigation={handleNavigation} // Pass handleNavigation to dropdown
                        isMobile={false} // Explicitly set for desktop
                    />
                    <NewDropdownMenu
                        title="Help"
                        items={helpMenuItems}
                        handleNavigation={handleNavigation} // Reuse your existing navigation handler
                        isMobile={false} // Explicitly set for desktop
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
                            className="p-2 pl-10 rounded-full bg-gray-950 border border-gray-900 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 w-52 transition-all duration-300 ease-in-out text-sm placeholder-gray-400"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        {isLoading && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Load />
                            </span>
                        )}
                        {/* Search Results Dropdown */}
                        <AnimatePresence>
                            {searchResults.length > 0 && searchTerm.length > 1 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-gray-950 shadow-lg rounded-lg border border-gray-900 max-h-60 overflow-y-auto z-10"
                                >
                                    <ul>
                                        {searchResults.map((item) => (
                                            <li key={item.id} className="p-3 hover:bg-gray-900 cursor-pointer border-b border-gray-900 last:border-b-0">
                                                <Link
                                                    to={`/collections/${item.category?.link || 'default-category'}/${item.link}`}
                                                    className="block text-gray-200 text-sm"
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
                                    className="absolute top-full left-0 right-0 mt-2 bg-gray-950 shadow-lg rounded-lg border border-gray-900 p-3 text-center text-gray-500 text-sm z-10"
                                >
                                    No products found.
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    {/* Updated Shopping Cart Button */}
                    <button onClick={toggleCart} className="relative text-gray-300 hover:text-lime-400 transition-colors p-2 rounded-full hover:bg-gray-950" title="Shopping Cart">
                        <ShoppingCart className="w-6 h-6" />
                        {totalCartItems > 0 && (
                            <AnimatePresence> {/* Use AnimatePresence for exit animations */}
                                <motion.span
                                    key={totalCartItems} // Key changes when totalCartItems changes to re-trigger animation
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

                {/* Mobile Menu Toggle & Icons (Visible on small screens) */}
                <div className="flex items-center lg:hidden space-x-4">
                    {/* Updated Mobile Shopping Cart Button */}
                    <button onClick={toggleCart} className="relative text-gray-300 hover:text-lime-400 transition-colors" title="Shopping Cart">
                        <ShoppingCart className="w-6 h-6" />
                        {totalCartItems > 0 && (
                            <AnimatePresence>
                                <motion.span
                                    key={totalCartItems + '_mobile'} // Unique key for mobile version
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
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle Menu" className="text-gray-300 hover:text-cyan-400 transition-colors">
                        {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            ref={mobileMenuRef} // Assign ref to mobile menu container
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="fixed top-0 right-0 min-h-screen w-full bg-gray-950 flex flex-col pt-20 px-6 pb-1 overflow-y-auto shadow-xl lg:hidden z-40"
                        >
                            <div className="absolute top-4 right-4 z-50"> {/* Ensure close button is above content */}
                                <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close Menu" className="text-gray-300 hover:text-white transition-colors">
                                    <X className="w-8 h-8" />
                                </button>
                            </div>
                            <ul className="flex flex-col space-y-6 mt-8 flex-grow">
                                <li>
                                    <Link to="/" onClick={() => handleNavigation('/')} className="block text-gray-200 hover:text-cyan-400 text-xl font-semibold py-2">
                                        Home
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/shop" onClick={() => handleNavigation('/shop')} className="block text-gray-200 hover:text-cyan-400 text-xl font-semibold py-2">
                                        Shop
                                    </Link>
                                </li>
                                {/* Mobile Categories Dropdown */}
                                <NewDropdownMenu
                                    title="Categories"
                                    // Pass the entire category objects as items for mobile
                                    items={category}
                                    handleNavigation={handleNavigation}
                                    isMobile={true}
                                />
                                <NewDropdownMenu
                                    title="Help"
                                    items={helpMenuItems}
                                    handleNavigation={handleNavigation} // Reuse your existing navigation handler
                                    isMobile={true} // Explicitly set for desktop
                                />
                                {/* Mobile Search Bar */}
                                <li className="relative w-full mt-6">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={handleSearch}
                                        placeholder="Search products..."
                                        className="w-full p-3 pl-12 border border-gray-900 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-950 text-gray-200 placeholder-gray-400"
                                        aria-label="Mobile Search Input"
                                    />
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
                                    {isLoading && (
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <Load />
                                        </span>
                                    )}
                                    {/* Mobile Search Results */}
                                    <AnimatePresence>
                                        {searchResults.length > 0 && searchTerm.length > 1 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                                className="mt-2 bg-gray-950 rounded-md shadow-lg p-1 max-h-40 overflow-y-auto"
                                            >
                                                {searchResults.map((product) => (
                                                    <div key={product.id} className="border-b border-gray-900 py-2 last:border-b-0">
                                                        <Link to={`/collections/${product.category?.link || 'default-category'}/${product.link}`} onClick={() => { setSearchResults([]); setSearchTerm(''); handleNavigation(`/collections/${product.category?.link || 'default-category'}/${product.link}`); }}>
                                                            <span className="block text-gray-200 text-sm hover:text-cyan-400">{product.name}</span>
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
                                                className="text-center text-gray-500 mt-4"
                                            >No products found.</motion.p>
                                        )}
                                    </AnimatePresence>
                                </li>
                            </ul>
                            {/* Auth and Admin Links for Mobile */}
                            <div className="mt-auto border-t border-gray-900 pt-2 flex flex-col space-y-3">
                                {localStorage.getItem('auth_token') ? (
                                    <>
                                        <Link to="/user/orders" onClick={() => handleNavigation('/user/orders')} className="flex items-center text-purple-400 hover:text-purple-300 transition-colors py-2 px-3 rounded-full hover:bg-gray-950 text-xl font-semibold w-fit">
                                            <ShoppingBag className="w-6 h-6 mr-2" />
                                            <span>My Orders</span>
                                        </Link>

                                        <button onClick={logout} className="flex items-center text-red-400 hover:text-red-500 transition-colors py-2 px-3 rounded-full hover:bg-gray-950 text-xl font-semibold w-fit">
                                            <LogOut className="w-6 h-6 mr-2" />
                                            <span>Logout</span>
                                        </button>
                                    </>
                                ) : (
                                    <Link to="/login" onClick={() => handleNavigation('/login')} className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors py-2 px-3 rounded-full hover:bg-gray-950 text-xl font-semibold w-fit">
                                        <User className="w-6 h-6 mr-2" />
                                        <span>Login</span>
                                    </Link>
                                )}
                                {localStorage.getItem('role') === 'admin' && (
                                    <Link to="/admin/dashboard" onClick={() => handleNavigation('/admin/dashboard')} className="flex items-center text-purple-400 hover:text-purple-300 transition-colors py-2 px-3 rounded-full hover:bg-gray-950 text-xl font-semibold w-fit">
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
            </div>
        </nav>
    );
};

export default Navbar;