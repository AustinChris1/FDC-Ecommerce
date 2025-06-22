import React from 'react';
import { motion } from 'framer-motion';

const TermsOfServicePage = () => {
    document.title = `Terms of Service - First Digits`;

    // Framer Motion Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
    };

    return (
        <motion.div
            className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 text-gray-200"
            style={{ backgroundImage: 'linear-gradient(to bottom right, #0a0a0a, #1a1a1a, #0a0a0a)' }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="container mx-auto max-w-4xl pt-10">
                <motion.h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-center mb-6 leading-tight drop-shadow-lg" variants={itemVariants}>
                    Terms of <span className="text-lime-400">Service</span>
                </motion.h1>
                <motion.p className="text-lg md:text-xl text-gray-400 text-center mb-12 max-w-2xl mx-auto" variants={itemVariants}>
                    Please read these terms and conditions carefully before using our website and services.
                </motion.p>

                <div className="space-y-10">
                    {/* Acceptance of Terms */}
                    <motion.section className="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700" variants={itemVariants}>
                        <h2 className="text-3xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                        <p className="text-gray-300 leading-relaxed">
                            By accessing and using https://spx.firstdigit.com.ng (the "Site") and our services, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to all the terms and conditions of this agreement, then you may not access the website or use any services.
                        </p>
                    </motion.section>

                    {/* Use of the Site */}
                    <motion.section className="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700" variants={itemVariants}>
                        <h2 className="text-3xl font-bold text-white mb-4">2. Use of the Site</h2>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li>You must be at least 18 years old to use this Site.</li>
                            <li>You agree to use the Site only for lawful purposes and in a way that does not infringe the rights of, restrict or inhibit anyone else's use and enjoyment of the Site.</li>
                            <li>You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer, and you agree to accept responsibility for all activities that occur under your account or password.</li>
                        </ul>
                    </motion.section>

                    {/* Products and Services */}
                    <motion.section className="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700" variants={itemVariants}>
                        <h2 className="text-3xl font-bold text-white mb-4">3. Products and Services</h2>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li>All products and services are subject to availability.</li>
                            <li>We reserve the right to limit the sales of our products or services to any person, geographic region or jurisdiction.</li>
                            <li>Prices for our products are subject to change without notice.</li>
                            <li>We do not warrant that the quality of any products, services, information, or other material purchased or obtained by you will meet your expectations.</li>
                        </ul>
                    </motion.section>

                    {/* Intellectual Property */}
                    <motion.section className="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700" variants={itemVariants}>
                        <h2 className="text-3xl font-bold text-white mb-4">4. Intellectual Property</h2>
                        <p className="text-gray-300 leading-relaxed">
                            The Site and its original content, features, and functionality are and will remain the exclusive property of First Digit Communications Ltd. and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of First Digit Communications Ltd..
                        </p>
                    </motion.section>
                </div>
            </div>
        </motion.div>
    );
};

export default TermsOfServicePage;