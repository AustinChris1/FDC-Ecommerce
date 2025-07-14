import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const NewDropdownMenu = ({ title, items, handleNavigation, isMobile = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const toggleButtonRef = useRef(null);
    const timeoutRef = useRef(null); // Ref for our hover timeout

    const handleToggle = () => setIsOpen(!isOpen);

    const openDropdown = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsOpen(true);
    }, []);

    const closeDropdown = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 150); // Small delay to allow moving between button and dropdown
    }, []);

    // Close dropdown when clicking outside for both mobile and desktop (if open by click)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                toggleButtonRef.current && !toggleButtonRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Dropdown animation variants for desktop
    const dropdownVariants = {
        hidden: {
            opacity: 0,
            y: -10,
            scale: 0.95,
            transition: { duration: 0.2, ease: "easeOut" }
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.3, ease: "easeIn" }
        },
    };

    // Dropdown animation variants for mobile
    const mobileDropdownVariants = {
        hidden: {
            opacity: 0,
            height: 0,
            transition: { duration: 0.2, ease: "easeOut" }
        },
        visible: {
            opacity: 1,
            height: "auto",
            transition: { duration: 0.3, ease: "easeIn" }
        },
    };

    return (
        <li
            className={`${isMobile ? 'w-full' : 'relative group'}`}
            aria-haspopup="true"
            aria-expanded={isOpen}
            onMouseEnter={!isMobile ? openDropdown : undefined}
            onMouseLeave={!isMobile ? closeDropdown : undefined}
        >
            <button
                ref={toggleButtonRef}
                onClick={isMobile ? handleToggle : undefined} // Only click for mobile
                onFocus={!isMobile ? openDropdown : undefined} // For keyboard navigation on desktop
                onBlur={!isMobile ? closeDropdown : undefined} // For keyboard navigation on desktop
                className={`flex items-center justify-between w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md
                    ${isMobile
                        ? 'text-gray-800 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-indigo-400 text-xl font-semibold py-3 px-2'
                        : 'text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 text-lg font-medium transition-colors relative py-2 px-3'
                    }`}
            >
                <span>{title}</span>
                {isMobile ? (
                    <motion.div
                        animate={{ rotate: isOpen ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronRight className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </motion.div>
                ) : (
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronDown className="w-5 h-5 ml-2 text-gray-500 dark:text-gray-400" />
                    </motion.div>
                )}
            </button>

            {!isMobile && ( // Desktop underline effect with subtle animation
                <span className="absolute left-0 bottom-0 w-full h-[3px] bg-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full"></span>
            )}

            <AnimatePresence>
                {isOpen && (
                    <motion.ul
                        ref={dropdownRef}
                        variants={isMobile ? mobileDropdownVariants : dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        onMouseEnter={!isMobile ? openDropdown : undefined} // Keep open on dropdown hover
                        onMouseLeave={!isMobile ? closeDropdown : undefined} // Close when leaving dropdown
                        className={`z-50 overflow-hidden
                            ${isMobile
                                ? 'pl-4 mt-2 space-y-2' // Mobile styling
                                : 'absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-xl shadow-2xl py-3 w-64 border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out' // Desktop styling with glassmorphism
                            }`}
                        role="menu"
                    >
                        {items.map((item, index) => (
                            <motion.li
                                key={index}
                                whileHover={{ scale: 1.02, x: isMobile ? 0 : 5 }}
                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                className={`
                                    ${isMobile
                                        ? ''
                                        : 'hover:bg-indigo-50 dark:hover:bg-gray-700/50 rounded-lg mx-2 transition-colors duration-200'
                                    }`}
                                role="menuitem"
                            >
                                <Link
                                    to={item.link}
                                    className={`flex items-center p-3 text-gray-800 dark:text-gray-200
                                        ${isMobile
                                            ? 'text-lg font-medium'
                                            : 'text-base font-normal'
                                        }`}
                                    onClick={() => {
                                        handleNavigation(item.link);
                                        setIsOpen(false); // Close dropdown after navigation
                                    }}
                                >
                                    {/* MODIFIED: Check for item.icon (React component) or item.image (path) */}
                                    {item.icon && React.createElement(item.icon, { className: "w-6 h-6 mr-3 text-gray-500 dark:text-gray-400" })}
                                    {item.image && typeof item.image === 'string' && (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-7 h-7 object-cover rounded-full mr-3 shadow-sm"
                                        />
                                    )}
                                    <span>{item.name}</span>
                                </Link>
                            </motion.li>
                        ))}

                    </motion.ul>
                )}
            </AnimatePresence>
        </li>
    );
};

export default NewDropdownMenu;