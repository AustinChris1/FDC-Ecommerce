import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async'; // Import Helmet for SEO

const PrivacyPolicy = () => {
    // Replaced document.title with Helmet for better React SEO practices
    // document.title = `Privacy Policy - First Digits`;

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
            className="min-h-screen py-24 px-4 sm:px-6 lg:px-8
                       bg-gray-50 text-gray-900
                       dark:bg-gradient-to-br dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 dark:text-gray-200"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <Helmet>
                <title>Privacy Policy - FirstSmart Mart</title>
                <meta name="description" content="Read the Privacy Policy of FirstSmart Mart to understand how we collect, use, and protect your personal information." />
            </Helmet>

            <div className="container mx-auto max-w-4xl pt-10">
                <motion.h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-center mb-6 leading-tight drop-shadow-lg
                                   text-gray-800 dark:text-white" variants={itemVariants}>
                    Our <span className="text-blue-600 dark:text-cyan-400">Privacy Policy</span>
                </motion.h1>
                <motion.p className="text-lg md:text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto dark:text-gray-400" variants={itemVariants}>
                    Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
                </motion.p>

                <div className="space-y-10">
                    {/* Introduction */}
                    <motion.section
                        className="bg-white rounded-lg shadow-md p-8 border border-gray-200
                                   dark:bg-gray-800 dark:shadow-lg dark:border-gray-700"
                        variants={itemVariants}
                    >
                        <h2 className="text-3xl font-bold text-gray-800 mb-4 dark:text-white">Introduction</h2>
                        <p className="text-gray-700 leading-relaxed dark:text-gray-300">
                            This Privacy Policy describes how FirstSmart Mart Ltd. (referred to as "we", "us", or "our") collects, uses, and discloses your personal information when you visit or make a purchase from https://spx.firstdigit.com.ng (the "Site").
                        </p>
                    </motion.section>

                    {/* Information We Collect */}
                    <motion.section
                        className="bg-white rounded-lg shadow-md p-8 border border-gray-200
                                   dark:bg-gray-800 dark:shadow-lg dark:border-gray-700"
                        variants={itemVariants}
                    >
                        <h2 className="text-3xl font-bold text-gray-800 mb-4 dark:text-white">Information We Collect</h2>
                        <p className="text-gray-700 mb-4 leading-relaxed dark:text-gray-300">
                            When you visit the Site, we collect certain information about your device, your interaction with the Site, and information necessary to process your purchases. We may also collect additional information if you contact us for customer support.
                        </p>
                        <h3 className="text-2xl font-semibold text-blue-500 mb-3 dark:text-lime-400">Personal Information You Provide Directly:</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 dark:text-gray-300">
                            <li>Name, email address, shipping address, billing address, phone number (when placing an order).</li>
                            <li>Payment information (credit card numbers or other payment details - processed securely by third-party payment gateways).</li>
                            <li>Account login credentials (username, password).</li>
                            <li>Communications with customer support.</li>
                        </ul>
                        <h3 className="text-2xl font-semibold text-blue-500 mt-6 mb-3 dark:text-lime-400">Information Collected Automatically:</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 dark:text-gray-300">
                            <li>IP address, browser type, operating system.</li>
                            <li>Referring URLs, pages viewed, time spent on pages.</li>
                            <li>Device identifiers (for mobile devices).</li>
                        </ul>
                    </motion.section>

                    {/* How We Use Your Information */}
                    <motion.section
                        className="bg-white rounded-lg shadow-md p-8 border border-gray-200
                                   dark:bg-gray-800 dark:shadow-lg dark:border-gray-700"
                        variants={itemVariants}
                    >
                        <h2 className="text-3xl font-bold text-gray-800 mb-4 dark:text-white">How We Use Your Information</h2>
                        <p className="text-gray-700 mb-6 leading-relaxed dark:text-gray-300">
                            We use the information we collect for various purposes, including:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 dark:text-gray-300">
                            <li>To fulfill your orders and provide customer support.</li>
                            <li>To personalize your shopping experience.</li>
                            <li>To send you marketing and promotional communications (with your consent).</li>
                            <li>To improve our Site and services.</li>
                            <li>To detect and prevent fraudulent transactions.</li>
                            <li>To comply with legal obligations.</li>
                        </ul>
                    </motion.section>

                    {/* Sharing Your Information */}
                    <motion.section
                        className="bg-white rounded-lg shadow-md p-8 border border-gray-200
                                   dark:bg-gray-800 dark:shadow-lg dark:border-gray-700"
                        variants={itemVariants}
                    >
                        <h2 className="text-3xl font-bold text-gray-800 mb-4 dark:text-white">Sharing Your Information</h2>
                        <p className="text-gray-700 leading-relaxed dark:text-gray-300">
                            We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties without your consent, except for the following purposes:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 mt-4 dark:text-gray-300">
                            <li>**Service Providers:** We may share your information with trusted third-party service providers who assist us in operating our website, conducting our business, or serving you (e.g., payment processors, shipping companies).</li>
                            <li>**Legal Compliance:** We may disclose your information when we believe release is appropriate to comply with the law, enforce our site policies, or protect ours or others' rights, property, or safety.</li>
                        </ul>
                    </motion.section>
                </div>
            </div>
        </motion.div>
    );
};

export default PrivacyPolicy;