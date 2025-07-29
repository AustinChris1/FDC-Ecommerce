import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async'; // Import Helmet for SEO

const Warranty = () => {
    // Replaced document.title with Helmet for better React SEO practices
    // document.title = `Warranty - First Digits`;

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
            className="min-h-screen py-28 px-4 sm:px-6 lg:px-8
                       bg-gray-50 text-gray-900
                       dark:bg-gradient-to-br dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 dark:text-gray-200"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <Helmet>
                <title>Product Warranty - FirstSmart Mart</title>
                <meta name="description" content="Understand the product warranty coverage for your purchases at FirstSmart Mart, including claim procedures and exclusions." />
            </Helmet>

            <div className="container mx-auto max-w-4xl pt-10">
                <motion.h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-center mb-6 leading-tight drop-shadow-lg
                                   text-gray-800 dark:text-white" variants={itemVariants}>
                    Product <span className="text-blue-600 dark:text-lime-400">Warranty</span>
                </motion.h1>
                <motion.p className="text-lg md:text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto dark:text-gray-400" variants={itemVariants}>
                    Your peace of mind is important to us. Learn about the warranty coverage for your purchases.
                </motion.p>

                <div className="space-y-10">
                    {/* General Warranty Information */}
                    <motion.section
                        className="bg-white rounded-lg shadow-md p-8 border border-gray-200
                                   dark:bg-gray-800 dark:shadow-lg dark:border-gray-700"
                        variants={itemVariants}
                    >
                        <h2 className="text-3xl font-bold text-gray-800 mb-4 dark:text-white">Our Commitment to Quality</h2>
                        <p className="text-gray-700 mb-6 leading-relaxed dark:text-gray-300">
                            We stand behind the quality of the products we sell. Most items purchased from our store are covered by a manufacturer's warranty, which protects against defects in materials and workmanship under normal use.
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 dark:text-gray-300">
                            <li>**Standard Warranty Period:** Typically 12 months from the date of purchase, unless otherwise stated on the product page.</li>
                            <li>**Extended Warranties:** Some products may offer optional extended warranty programs from the manufacturer or third-party providers.</li>
                        </ul>
                    </motion.section>

                    {/* How to Claim Warranty */}
                    <motion.section
                        className="bg-white rounded-lg shadow-md p-8 border border-gray-200
                                   dark:bg-gray-800 dark:shadow-lg dark:border-gray-700"
                        variants={itemVariants}
                    >
                        <h2 className="text-3xl font-bold text-gray-800 mb-4 dark:text-white">How to Claim Warranty</h2>
                        <p className="text-gray-700 mb-6 leading-relaxed dark:text-gray-300">
                            If you believe your product is defective and covered under warranty, please follow these steps:
                        </p>
                        <ol className="list-decimal list-inside text-gray-700 space-y-2 mb-6 dark:text-gray-300">
                            <li>**Contact Customer Support:** Reach out to us at <a href="mailto:help@firstdigit.com.ng" className="text-blue-600 hover:underline dark:text-blue-400">help@firstdigit.com.ng</a> with your order number, a description of the issue, and any relevant photos or videos.</li>
                            <li>**Troubleshooting:** Our team may provide initial troubleshooting steps to resolve the issue.</li>
                            <li>**Manufacturer Contact:** If the issue persists, we will guide you through the process of contacting the manufacturer directly for warranty service, as they are often best equipped to handle product-specific repairs or replacements.</li>
                            <li>**Proof of Purchase:** Keep your original receipt or order confirmation as proof of purchase; it is required for all warranty claims.</li>
                        </ol>
                    </motion.section>

                    {/* Exclusions */}
                    <motion.section
                        className="bg-white rounded-lg shadow-md p-8 border border-gray-200
                                   dark:bg-gray-800 dark:shadow-lg dark:border-gray-700"
                        variants={itemVariants}
                    >
                        <h2 className="text-3xl font-bold text-gray-800 mb-4 dark:text-white">Warranty Exclusions</h2>
                        <p className="text-gray-700 mb-6 leading-relaxed dark:text-gray-300">
                            Please be aware that warranties typically do not cover:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 dark:text-gray-300">
                            <li>Damage caused by accident, abuse, misuse, liquid contact, fire, or other external causes.</li>
                            <li>Damage caused by operating the product outside the manufacturer’s guidelines.</li>
                            <li>Cosmetic damage, including scratches, dents, and broken plastic on ports.</li>
                            <li>Defects caused by normal wear and tear or otherwise due to the normal aging of the product.</li>
                            <li>Products that have been modified or serviced by anyone other than the manufacturer or authorized service provider.</li>
                        </ul>
                    </motion.section>
                </div>
            </div>
        </motion.div>
    );
};

export default Warranty;