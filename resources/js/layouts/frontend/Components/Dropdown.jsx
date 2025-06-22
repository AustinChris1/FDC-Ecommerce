import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const NewDropdownMenu = ({ title, items, links, handleNavigation, isMobile = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const toggleButtonRef = useRef(null);

    const handleToggle = () => setIsOpen(!isOpen);

    // Close dropdown when clicking outside
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

    const dropdownVariants = {
        hidden: { opacity: 0, y: -10, x: isMobile ? '100%' : 0, transition: { duration: 0.2 } },
        visible: { opacity: 1, y: 0, x: 0, transition: { duration: 0.3 } },
    };

    const mobileDropdownVariants = {
        hidden: { opacity: 0, height: 0, transition: { duration: 0.2, ease: "easeOut" } },
        visible: { opacity: 1, height: "auto", transition: { duration: 0.3, ease: "easeIn" } },
    };

    return (
        <li className={`${isMobile ? 'w-full' : 'relative group'}`} aria-haspopup="true" aria-expanded={isOpen}>
            <button
                ref={toggleButtonRef}
                onClick={handleToggle}
                className={`flex items-center justify-between w-full
                    ${isMobile
                        ? 'text-gray-800 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-indigo-400 text-xl font-semibold py-2'
                        : 'text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 text-lg font-medium transition-colors relative'
                    }`}
            >
                <span>{title}</span>
                {isMobile ? (
                    <motion.div
                        animate={{ rotate: isOpen ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronRight className="w-6 h-6" />
                    </motion.div>
                ) : (
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronDown className="w-5 h-5 ml-1" />
                    </motion.div>
                )}
            </button>

            {!isMobile && ( // Desktop underline effect
                <span className="absolute left-0 bottom-0 w-full h-[2px] bg-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            )}

            <AnimatePresence>
                {isOpen && (
                    <motion.ul
                        ref={dropdownRef}
                        variants={isMobile ? mobileDropdownVariants : dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className={`z-50
                            ${isMobile
                                ? 'pl-4 mt-2 space-y-2' // Mobile styling
                                : 'absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 w-48 border border-gray-200 dark:border-gray-700' // Desktop styling
                            }`}
                        role="menu"
                    >
                        {items.map((item, index) => (
                            <li
                                key={index}
                                className={`${isMobile ? '' : 'hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md'}`}
                                role="menuitem"
                            >
                                <Link
                                    to={links[index]}
                                    className={`block py-2 px-4 text-gray-800 dark:text-gray-200
                                        ${isMobile
                                            ? 'text-lg'
                                            : 'text-base'
                                        }`}
                                    onClick={() => {
                                        handleNavigation(links[index]);
                                        setIsOpen(false); // Close dropdown after navigation
                                    }}
                                >
                                    {item}
                                </Link>
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </li>
    );
};

export default NewDropdownMenu;