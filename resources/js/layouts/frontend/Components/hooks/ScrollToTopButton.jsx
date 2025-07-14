import React, { useState, useEffect, useCallback } from 'react';
import { ChevronUp } from 'lucide-react'; // Using Lucide React for the icon
import { motion, AnimatePresence } from 'framer-motion';

const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Show button when page is scrolled up to a certain amount
    const toggleVisibility = useCallback(() => {
        if (window.scrollY > 300) { // Show if scrolled more than 300px
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, []);

    // Scroll to top when button is clicked
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, [toggleVisibility]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    className="fixed bottom-24 right-4 sm:right-6 md:right-8 bg-indigo-900 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-900 dark:hover:bg-indigo-800 z-50"
                    onClick={scrollToTop}
                    initial={{ opacity: 0, y: 50, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    aria-label="Scroll to top"
                >
                    <ChevronUp className="w-6 h-6" />
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default ScrollToTopButton;