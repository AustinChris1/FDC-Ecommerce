import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Copyright } from 'lucide-react'; // Import Copyright icon

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    };

    return (
        <motion.footer
            className="flex-shrink-0 bg-white border-t border-gray-200 py-4 px-4 sm:px-6 lg:px-8 text-gray-600"
            initial="hidden"
            animate="visible"
            variants={footerVariants}
        >
            <div className="container mx-auto max-w-full">
                <div className="flex flex-col sm:flex-row items-center justify-between text-sm space-y-2 sm:space-y-0">
                    <div className="flex items-center text-gray-700 font-medium">
                        <Copyright className="w-4 h-4 mr-1 text-gray-500" />
                        <span>{currentYear} First Digits Communication. All rights reserved.</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link to="/privacy" className="text-blue-600 hover:text-blue-800 transition-colors">
                            Privacy Policy
                        </Link>
                        <span className="text-gray-400">&middot;</span>
                        <Link to="/terms" className="text-blue-600 hover:text-blue-800 transition-colors">
                            Terms & Conditions
                        </Link>
                    </div>
                </div>
            </div>
        </motion.footer>
    );
};

export default Footer;
