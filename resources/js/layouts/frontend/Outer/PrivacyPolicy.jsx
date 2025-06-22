import React from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
  document.title = `Privacy Policy - First Digits`;

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
                    Our <span className="text-cyan-400">Privacy Policy</span>
                </motion.h1>
                <motion.p className="text-lg md:text-xl text-gray-400 text-center mb-12 max-w-2xl mx-auto" variants={itemVariants}>
                    Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
                </motion.p>

                <div className="space-y-10">
                    {/* Introduction */}
                    <motion.section className="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700" variants={itemVariants}>
                        <h2 className="text-3xl font-bold text-white mb-4">Introduction</h2>
                        <p className="text-gray-300 leading-relaxed">
                            This Privacy Policy describes how First Digit Communications Ltd. (referred to as "we", "us", or "our") collects, uses, and discloses your personal information when you visit or make a purchase from https://spx.firstdigit.com.ng (the "Site").
                        </p>
                    </motion.section>

                    {/* Information We Collect */}
                    <motion.section className="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700" variants={itemVariants}>
                        <h2 className="text-3xl font-bold text-white mb-4">Information We Collect</h2>
                        <p className="text-gray-300 mb-4 leading-relaxed">
                            When you visit the Site, we collect certain information about your device, your interaction with the Site, and information necessary to process your purchases. We may also collect additional information if you contact us for customer support.
                        </p>
                        <h3 className="text-2xl font-semibold text-lime-400 mb-3">Personal Information You Provide Directly:</h3>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li>Name, email address, shipping address, billing address, phone number (when placing an order).</li>
                            <li>Payment information (credit card numbers or other payment details - processed securely by third-party payment gateways).</li>
                            <li>Account login credentials (username, password).</li>
                            <li>Communications with customer support.</li>
                        </ul>
                        <h3 className="text-2xl font-semibold text-lime-400 mt-6 mb-3">Information Collected Automatically:</h3>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li>IP address, browser type, operating system.</li>
                            <li>Referring URLs, pages viewed, time spent on pages.</li>
                            <li>Device identifiers (for mobile devices).</li>
                        </ul>
                    </motion.section>

                    {/* How We Use Your Information */}
                    <motion.section className="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700" variants={itemVariants}>
                        <h2 className="text-3xl font-bold text-white mb-4">How We Use Your Information</h2>
                        <p className="text-gray-300 mb-6 leading-relaxed">
                            We use the information we collect for various purposes, including:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li>To fulfill your orders and provide customer support.</li>
                            <li>To personalize your shopping experience.</li>
                            <li>To send you marketing and promotional communications (with your consent).</li>
                            <li>To improve our Site and services.</li>
                            <li>To detect and prevent fraudulent transactions.</li>
                            <li>To comply with legal obligations.</li>
                        </ul>
                    </motion.section>

                    {/* Sharing Your Information */}
                    <motion.section className="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700" variants={itemVariants}>
                        <h2 className="text-3xl font-bold text-white mb-4">Sharing Your Information</h2>
                        <p className="text-gray-300 leading-relaxed">
                            We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties without your consent, except for the following purposes:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4">
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