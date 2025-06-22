import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    MapPin,
    Mail,
    Copyright,
    ArrowRight,
    Loader2 // Using Loader2 from lucide-react for consistency
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Importing your specific social icons and phone icon
import ig from '../assets/social/instagram.svg';
import x from '../assets/social/x.svg';
import fb from '../assets/social/facebook.svg';
import phoneIcon from '../assets/social/phone.svg'; // Renamed to avoid conflict with "phone" text

import fdcLogo from '../assets/fdcLogo.png'; // Your logo

// Google Map Iframe from your old footer
const iframeSrc =
'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126091.50068803449!2d7.481260032478743!3d9.030942164225989!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x104e0b964ec887e5%3A0x12a34843356767e8!2sNimota%20Plaza!5e0!3m2!1sen!2sng!4v1726406738672!5m2!1sen!2sng';

const Iframe = ({ src }) => (
    <div className="w-full pb-6 h-64 sm:h-80 rounded-xl overflow-hidden shadow-xl">
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
    const [categories, setCategories] = useState([]); // State to store categories from backend
    const [loadingCategories, setLoadingCategories] = useState(true);


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
            className="w-full min-h-screen p-6 text-gray-200"
            // Changed the background gradient to be a bit darker
            style={{ backgroundImage: 'linear-gradient(to bottom right, #0a0a0a, #1a1a1a, #0a0a0a)' }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Subtle background abstract shapes/glows */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-30">
                <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[15%] right-[15%] w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-gray-700">
                    {/* Column 1: Brand Info & Socials */}
                    <motion.div variants={itemVariants}>
                        <Link to="/" className="inline-block mb-4">
                            <img src={fdcLogo} alt="First Digit Communications" className="h-10 filter brightness-150" />
                        </Link>
                        <p className="text-sm leading-relaxed mb-4">
                            Your ultimate destination for cutting-edge electronics and smart innovations. Experience the future, today.
                        </p>
                        <div className="flex space-x-4">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 hover:bg-blue-600 transition-all p-1">
                                <img src={fb} alt="Facebook" className="w-5 h-5" />
                            </a>
                            <a href="https://instagram.com/firstdigits" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 hover:bg-pink-600 transition-all p-1">
                                <img src={ig} alt="Instagram" className="w-5 h-5" />
                            </a>
                            <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-400 transition-all p-1">
                                <img src={x} alt="X (Twitter)" className="w-5 h-5" />
                            </a>
                            <a href="tel:+2347052500468" aria-label="Phone" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 hover:bg-green-600 transition-all p-1">
                                <img src={phoneIcon} alt="Phone" className="w-5 h-5" />
                            </a>
                        </div>
                    </motion.div>

                    {/* Column 2: Quick Links */}
                    <motion.div variants={itemVariants}>
                        <h3 className="text-xl font-bold text-white mb-6">Quick Links</h3>
                        <ul className="space-y-3">
                            <li><Link to="/shop" className="hover:text-cyan-400 transition-colors text-base flex items-center group"><ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" /> Shop All</Link></li>
                            <li><Link to="/collections/trending" className="hover:text-cyan-400 transition-colors text-base flex items-center group"><ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" /> Trending Products</Link></li>
                            <li><Link to="/collections/new-arrival" className="hover:text-cyan-400 transition-colors text-base flex items-center group"><ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" /> New Arrival</Link></li>
                            <li><Link to="/about" className="hover:text-cyan-400 transition-colors text-base flex items-center group"><ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" /> About Us</Link></li>
                            <li><Link to="/contact" className="hover:text-cyan-400 transition-colors text-base flex items-center group"><ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" /> Contact</Link></li>
                        </ul>
                    </motion.div>

                    {/* Column 3: Support & Information */}
                    <motion.div variants={itemVariants}>
                        <h3 className="text-xl font-bold text-white mb-6">Support</h3>
                        <ul className="space-y-3">
                            <li><Link to="/support/faq" className="hover:text-cyan-400 transition-colors text-base flex items-center group"><ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" /> FAQ</Link></li>
                            <li><Link to="/support/shipping-returns" className="hover:text-cyan-400 transition-colors text-base flex items-center group"><ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" /> Shipping & Returns</Link></li>
                            <li><Link to="/support/warranty" className="hover:text-cyan-400 transition-colors text-base flex items-center group"><ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" /> Warranty</Link></li>
                            <li><Link to="/privacy" className="hover:text-cyan-400 transition-colors text-base flex items-center group"><ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" /> Privacy Policy</Link></li>
                            <li><Link to="/terms" className="hover:text-cyan-400 transition-colors text-base flex items-center group"><ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" /> Terms of Service</Link></li>
                        </ul>
                    </motion.div>

                    {/* Column 4: Address & Map (from old footer) */}
                    <motion.div variants={itemVariants}>
                        <h3 className="text-xl font-bold text-white mb-6">Our Location</h3>
                        <p className="text-gray-300 leading-relaxed mb-6 flex items-start">
                            <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-1 flex-shrink-0" />
                            Suite 011, Nimota Plaza, Plot 855, Tafawa Balewa Way, Area 11, Garki Abuja, Nigeria
                        </p>
                        <Iframe src={iframeSrc} />
                        {/* Removed the small newsletter form from here, as the dedicated component is better */}
                    </motion.div>
                </div>

                {/* Bottom Section: Copyright & Legal Links */}
                <motion.div variants={itemVariants} className="pt-8 text-center text-sm text-gray-500">
                    <div className="flex items-center justify-center mb-2">
                        <Copyright className="w-4 h-4 mr-2" />
                        <span>Copyright © {currentYear} All rights reserved.</span>
                    </div>
                    <div className="flex flex-col sm:flex-row text-center justify-center gap-4 sm:gap-10 mt-4">
                        <Link to="/terms" className="text-gray-400 hover:text-blue-400 transition-colors">
                            Terms of Use
                        </Link>
                        <Link to="/privacy" className="text-gray-400 hover:text-blue-400 transition-colors">
                            Privacy Notice
                        </Link>
                    </div>
                    {/* Payment Logos remain here or can be moved up if preferred */}
                    <div className="mt-8 flex justify-center flex-wrap gap-3">
                        <img src="https://img.icons8.com/color/48/000000/visa.png" alt="Visa" className="h-8" />
                        <img src="https://img.icons8.com/color/48/000000/mastercard.png" alt="Mastercard" className="h-8" />
                        <img src="https://img.icons8.com/color/48/000000/paypal.png" alt="PayPal" className="h-8" />
                        {/* Add more payment logos as needed */}
                    </div>
                </motion.div>
            </div>
        </motion.footer>
    );
};

export default Footer;