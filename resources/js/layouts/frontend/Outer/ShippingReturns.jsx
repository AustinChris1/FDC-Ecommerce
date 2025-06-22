import React from 'react';
import { motion } from 'framer-motion';

const ShippingReturns = () => {
  document.title = `Shipping Returns - First Digits`;

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
                    Shipping & <span className="text-cyan-400">Returns</span>
                </motion.h1>
                <motion.p className="text-lg md:text-xl text-gray-400 text-center mb-12 max-w-2xl mx-auto" variants={itemVariants}>
                    Everything you need to know about getting your orders and our hassle-free return process.
                </motion.p>

                <div className="space-y-10">
                    {/* Shipping Information */}
                    <motion.section className="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700" variants={itemVariants}>
                        <h2 className="text-3xl font-bold text-white mb-4">Shipping Information</h2>
                        <p className="text-gray-300 mb-6 leading-relaxed">
                            We strive to process and ship all orders as quickly as possible. Orders are typically processed within 1-2 business days.
                        </p>

                        <h3 className="text-2xl font-semibold text-lime-400 mb-3">Domestic Shipping (within Nigeria)</h3>
                        <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
                            <li>**Standard Shipping:** 5-7 business days. Cost: ₦2,500.</li>
                            <li>**Express Shipping:** 2-3 business days. Cost: ₦5,000.</li>
                            <li>Free standard shipping on all orders over ₦50,000.</li>
                        </ul>

                        <h3 className="text-2xl font-semibold text-lime-400 mb-3">International Shipping</h3>
                        <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
                            <li>**Standard International:** 7-14 business days. Cost varies by destination.</li>
                            <li>**Express International:** 3-7 business days. Cost varies by destination.</li>
                            <li>Customers are responsible for any customs duties, taxes, or import fees levied by their country.</li>
                        </ul>
                        <p className="text-gray-300 italic">
                            Please note that delivery times are estimates and may vary due to unforeseen circumstances or peak seasons.
                        </p>
                    </motion.section>

                    {/* Returns Information */}
                    <motion.section className="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700" variants={itemVariants}>
                        <h2 className="text-3xl font-bold text-white mb-4">Returns & Exchanges</h2>
                        <p className="text-gray-300 mb-6 leading-relaxed">
                            Your satisfaction is our priority. If you're not completely happy with your purchase, we're here to help.
                        </p>

                        <h3 className="text-2xl font-semibold text-lime-400 mb-3">Our Return Policy</h3>
                        <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
                            <li>You have **30 days** from the date of delivery to return an item.</li>
                            <li>Items must be unused, in their original packaging, and in resalable condition.</li>
                            <li>Proof of purchase (order number) is required for all returns.</li>
                            <li>Certain items (e.g., opened software, personalized items) may not be eligible for return.</li>
                        </ul>

                        <h3 className="text-2xl font-semibold text-lime-400 mb-3">How to Initiate a Return</h3>
                        <ol className="list-decimal list-inside text-gray-300 space-y-2 mb-6">
                            <li>Contact our customer support team at <a href="mailto:help@firstdigit.com.ng" className="text-blue-400 hover:underline">support@firstdigitt.com.ng</a> to request a Return Authorization (RA) number.</li>
                            <li>Package your item securely, including the RA number clearly marked on the outside of the package.</li>
                            <li>Ship the item back to us using a trackable shipping method. Return shipping costs are typically the customer's responsibility unless the item is defective or incorrect.</li>
                        </ol>

                        <h3 className="text-2xl font-semibold text-lime-400 mb-3">Refunds & Exchanges</h3>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li>Refunds are processed within 5-7 business days after we receive and inspect the returned item.</li>
                            <li>Refunds will be issued to the original payment method.</li>
                            <li>For exchanges, we recommend returning the unwanted item for a refund and placing a new order for the desired item.</li>
                        </ul>
                    </motion.section>
                </div>
            </div>
        </motion.div>
    );
};

export default ShippingReturns;