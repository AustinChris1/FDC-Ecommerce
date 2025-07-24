import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    MapPin,
    Copyright,
    ArrowRight,
} from 'lucide-react';

// Importing your specific social icons and phone icon
import ig from '../assets/social/instagram.svg';
import x from '../assets/social/x.svg';
import fb from '../assets/social/facebook.svg';
import phoneIcon from '../assets/social/phone.svg';

import fdcLogo from '../assets/fdcLogo.png'; // Light logo for dark background
import fdcLogoBlack from '../assets/fdcLogoBlack.png'; // Dark logo for light background

// Google Map Iframe
const iframeSrc =
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126091.50068803449!2d7.481260032478743!3d9.030942164225989!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x104e0b964ec887e5%3A0x12a34843356767e8!2sNimota%20Plaza!5e0!3m2!1sen!2sng!4v1726406738672!5m2!1sen!2sng';

const Iframe = ({ src }) => (
    <div className="w-full pb-6 h-64 sm:h-80 rounded-xl overflow-hidden shadow-md dark:shadow-xl">
        <iframe
            src={src}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="First Digit Communications Location"
        ></iframe>
    </div>
);

const Footer = () => {
    // Initialize darkMode based on localStorage directly
    const [darkMode, setDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem("theme");
        // Default to dark mode if no preference is found in localStorage or system
        // This makes it consistent with your Navbar's initial darkMode logic
        if (savedTheme === "light") {
            return false;
        }
        if (savedTheme === "dark") {
            return true;
        }
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    // Effect to listen for changes in localStorage "theme"
    useEffect(() => {
        const handleStorageChange = () => {
            const savedTheme = localStorage.getItem("theme");
            setDarkMode(savedTheme === "dark");
        };

        // Listen for 'storage' events which fire when localStorage changes in another tab/window
        // or when explicitly set in the current window.
        window.addEventListener('storage', handleStorageChange);

        // Also, listen for changes to the 'dark' class on the documentElement (html tag)
        // This catches changes made by a theme toggle within the same application instance.
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    const isDark = document.documentElement.classList.contains('dark');
                    if (isDark !== darkMode) { // Only update if it's different to avoid unnecessary re-renders
                        setDarkMode(isDark);
                    }
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            observer.disconnect();
        };
    }, [darkMode]); // Include darkMode in dependency array to re-run if its value changes internally

    const currentYear = new Date().getFullYear();

    // Framer Motion variants
    const footerVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.7,
                ease: 'easeOut',
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.1,
            },
        },
    };

    const imageHoverVariants = {
        hover: {
            scale: 1.15,
            transition: {
                duration: 0.4,
                ease: "easeInOut",
            },
        },
    };

    return (
        <motion.footer
            className="w-full p-6 text-gray-700
                       bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 /* Light mode gradient: soft, inviting grays */
                       dark:text-gray-200 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" /* Dark mode gradient: deep, rich grays */
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Subtle background abstract shapes/glows */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-50 dark:opacity-30">
                <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-blue-300/30 rounded-full blur-3xl dark:bg-cyan-500/10"></div>
                <div className="absolute bottom-[15%] right-[15%] w-72 h-72 bg-fuchsia-300/30 rounded-full blur-3xl dark:bg-purple-500/10"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12
                                border-b border-gray-300 /* Light mode border: subtle gray */
                                dark:border-gray-700"> {/* Dark mode border: darker gray */}
                    {/* Column 1: Brand Info & Socials */}
                    <motion.div variants={itemVariants}>
                        <Link to="/" className="inline-block mb-4">
                            {/* Conditional rendering for logos based on darkMode state */}
                            <img
                                src={darkMode ? fdcLogo : fdcLogoBlack}
                                alt="First Digit Communications"
                                className={`${darkMode ? 'h-10 w-auto' : 'h-12 w-auto'}`} /* Adjusted sizes for better visual balance */
                            />
                        </Link>
                        <p className="text-sm leading-relaxed mb-4
                                      text-gray-600 /* Light mode text: darker gray for readability */
                                      dark:text-gray-200"> {/* Dark mode text: lighter gray */}
                            Your ultimate destination for cutting-edge electronics and smart innovations. Experience the future, today.
                        </p>
                        <div className="flex space-x-4">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                                className="w-8 h-8 flex items-center justify-center rounded-full transition-all p-1
                                           bg-gray-200 hover:bg-blue-500 text-gray-700 hover:text-white /* Light mode social icon background/text/hover */
                                           dark:bg-gray-700 dark:hover:bg-blue-600 dark:text-white"> {/* Dark mode social icon background/text/hover */}
                                <img src={fb} alt="Facebook" className="w-5 h-5" />
                            </a>
                            <a href="https://instagram.com/firstdigits" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                                className="w-8 h-8 flex items-center justify-center rounded-full transition-all p-1
                                           bg-gray-200 hover:bg-pink-500 text-gray-700 hover:text-white /* Light mode social icon background/text/hover */
                                           dark:bg-gray-700 dark:hover:bg-pink-600 dark:text-white"> {/* Dark mode social icon background/text/hover */}
                                <img src={ig} alt="Instagram" className="w-5 h-5" />
                            </a>
                            <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)"
                                className="w-8 h-8 flex items-center justify-center rounded-full transition-all p-1
                                           bg-gray-200 hover:bg-gray-700 text-gray-700 hover:text-white /* Light mode social icon background/text/hover */
                                           dark:bg-gray-700 dark:hover:bg-gray-400 dark:text-white"> {/* Dark mode social icon background/text/hover */}
                                <img src={x} alt="X (Twitter)" className="w-5 h-5" />
                            </a>
                            <a href="tel:+2347052500468" aria-label="Phone"
                                className="w-8 h-8 flex items-center justify-center rounded-full transition-all p-1
                                           bg-gray-200 hover:bg-green-500 text-gray-700 hover:text-white /* Light mode social icon background/text/hover */
                                           dark:bg-gray-700 dark:hover:bg-green-600 dark:text-white"> {/* Dark mode social icon background/text/white */}
                                <img src={phoneIcon} alt="Phone" className="w-5 h-5" />
                            </a>
                        </div>
                    </motion.div>

                    {/* Column 2: Quick Links */}
                    <motion.div variants={itemVariants}>
                        <h3 className="text-xl font-bold mb-6
                                       text-gray-900 /* Light mode header text: dark gray */
                                       dark:text-white">Quick Links</h3>
                        <ul className="space-y-3">
                            <li><Link to="/shop" className="text-base flex items-center group transition-colors
                                           hover:text-blue-600 /* Light mode link hover */
                                           dark:hover:text-cyan-400"> {/* Dark mode link hover */}
                                <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity
                                                       text-blue-400 /* Light mode arrow color */
                                                       dark:text-cyan-400" /> Shop All</Link></li>
                            <li><Link to="/collections/trending" className="text-base flex items-center group transition-colors
                                           hover:text-blue-600 /* Light mode link hover */
                                           dark:hover:text-cyan-400"> {/* Dark mode link hover */}
                                <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity
                                                       text-blue-400 /* Light mode arrow color */
                                                       dark:text-cyan-400" /> Trending Products</Link></li>
                            <li><Link to="/collections/new-arrival" className="text-base flex items-center group transition-colors
                                           hover:text-blue-600 /* Light mode link hover */
                                           dark:hover:text-cyan-400"> {/* Dark mode link hover */}
                                <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity
                                                       text-blue-400 /* Light mode arrow color */
                                                       dark:text-cyan-400" /> New Arrival</Link></li>
                            <li><Link to="/about" className="text-base flex items-center group transition-colors
                                           hover:text-blue-600 /* Light mode link hover */
                                           dark:hover:text-cyan-400"> {/* Dark mode link hover */}
                                <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity
                                                       text-blue-400 /* Light mode arrow color */
                                                       dark:text-cyan-400" /> About Us</Link></li>
                            <li><Link to="/contact" className="text-base flex items-center group transition-colors
                                           hover:text-blue-600 /* Light mode link hover */
                                           dark:hover:text-cyan-400"> {/* Dark mode link hover */}
                                <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity
                                                       text-blue-400 /* Light mode arrow color */
                                                       dark:text-cyan-400" /> Contact</Link></li>
                        </ul>
                    </motion.div>

                    {/* Column 3: Support & Information */}
                    <motion.div variants={itemVariants}>
                        <h3 className="text-xl font-bold mb-6
                                       text-gray-900 /* Light mode header text: dark gray */
                                       dark:text-white">Support</h3>
                        <ul className="space-y-3">
                            <li><Link to="/support/faq" className="text-base flex items-center group transition-colors
                                           hover:text-blue-600 /* Light mode link hover */
                                           dark:hover:text-cyan-400"> {/* Dark mode link hover */}
                                <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity
                                                       text-blue-400 /* Light mode arrow color */
                                                       dark:text-cyan-400" /> FAQ</Link></li>
                            <li><Link to="/support/shipping-returns" className="text-base flex items-center group transition-colors
                                           hover:text-blue-600 /* Light mode link hover */
                                           dark:hover:text-cyan-400"> {/* Dark mode link hover */}
                                <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity
                                                       text-blue-400 /* Light mode arrow color */
                                                       dark:text-cyan-400" /> Shipping & Returns</Link></li>
                            <li><Link to="/support/warranty" className="text-base flex items-center group transition-colors
                                           hover:text-blue-600 /* Light mode link hover */
                                           dark:hover:text-cyan-400"> {/* Dark mode link hover */}
                                <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity
                                                       text-blue-400 /* Light mode arrow color */
                                                       dark:text-cyan-400" /> Warranty</Link></li>
                            <li><Link to="/privacy" className="text-base flex items-center group transition-colors
                                           hover:text-blue-600 /* Light mode link hover */
                                           dark:hover:text-cyan-400"> {/* Dark mode link hover */}
                                <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity
                                                       text-blue-400 /* Light mode arrow color */
                                                       dark:text-cyan-400" /> Privacy Policy</Link></li>
                            <li><Link to="/terms" className="text-base flex items-center group transition-colors
                                           hover:text-blue-600 /* Light mode link hover */
                                           dark:hover:text-cyan-400"> {/* Dark mode link hover */}
                                <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity
                                                       text-blue-400 /* Light mode arrow color */
                                                       dark:text-cyan-400" /> Terms of Service</Link></li>
                        </ul>
                    </motion.div>

                    {/* Column 4: Address & Map */}
                    <motion.div variants={itemVariants}>
                        <h3 className="text-xl font-bold mb-6
                                       text-gray-900 /* Light mode header text: dark gray */
                                       dark:text-white">Our Location</h3>
                        <p className="leading-relaxed mb-6 flex items-start
                                      text-gray-600 /* Light mode text: darker gray */
                                      dark:text-gray-300"> {/* Dark mode text: lighter gray */}
                            <MapPin className="w-5 h-5 mr-3 mt-1 flex-shrink-0
                                               text-gray-500 /* Light mode icon color: medium gray */
                                               dark:text-gray-400" /> {/* Dark mode icon color: lighter gray */}
                            Suite 011, Nimota Plaza, Plot 855, Tafawa Balewa Way, Area 11, Garki Abuja, Nigeria
                        </p>
                        <Iframe src={iframeSrc} />
                    </motion.div>
                </div>

                {/* Bottom Section: Copyright & Legal Links */}
                <motion.div variants={itemVariants} className="pt-8 text-center text-sm
                                                               text-gray-500 /* Light mode text: medium gray */
                                                               dark:text-gray-500"> {/* Dark mode text: same medium gray */}
                    <div className="flex items-center justify-center mb-2">
                        <Copyright className="w-4 h-4 mr-2
                                               text-gray-500 /* Light mode icon color */
                                               dark:text-gray-500" />
                        <span>Copyright © {currentYear} All rights reserved.</span>
                    </div>
                    <div className="flex flex-col sm:flex-row text-center justify-center gap-4 sm:gap-10 mt-4">
                        <Link to="/terms" className="transition-colors
                                       text-gray-500 hover:text-blue-600 /* Light mode link/hover */
                                       dark:text-gray-400 dark:hover:text-blue-400"> {/* Dark mode link/hover */}
                            Terms of Use
                        </Link>
                        <Link to="/privacy" className="transition-colors
                                       text-gray-500 hover:text-blue-600 /* Light mode link/hover */
                                       dark:text-gray-400 dark:hover:text-blue-400"> {/* Dark mode link/hover */}
                            Privacy Notice
                        </Link>
                    </div>
                    {/* Payment Logos */}
                    <div className="mt-8 flex justify-center flex-wrap gap-3">
                        <img src="https://img.icons8.com/color/48/000000/visa.png" alt="Visa" className="h-8" />
                        <img src="https://img.icons8.com/color/48/000000/mastercard.png" alt="Mastercard" className="h-8" />
                        <img src="https://img.icons8.com/color/48/000000/paypal.png" alt="PayPal" className="h-8" />
                    </div>
                </motion.div>
            </div>
        </motion.footer>
    );
};

export default Footer;
