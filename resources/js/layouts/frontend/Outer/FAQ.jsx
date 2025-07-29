import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react'; // Icons for accordion toggle
import { Helmet } from 'react-helmet-async'; // Import Helmet

const faqData = [
    {
        id: 1,
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, MasterCard, Verve), Bank Transfers and physical cash at store outlets.',
    },
    {
        id: 2,
        question: 'How long does shipping take?',
        answer: 'Standard shipping usually takes 5-7 business days. Express shipping options are available at checkout for faster delivery, typically 2-3 business days.',
    },
    {
        id: 3,
        question: 'What is your return policy?',
        answer: 'We offer a 30-day money-back guarantee on most products. Items must be in their original condition with all packaging. Please see our full Shipping & Returns Policy for details.',
    },
    {
        id: 4,
        question: 'Do you offer international shipping?',
        answer: 'Yes, we ship to most countries worldwide. International shipping times and costs vary depending on the destination. Customs duties and taxes may apply.',
    },
    {
        id: 5,
        question: 'How can I track my order?',
        answer: 'Once your order has shipped, you will receive an email with a tracking number and a link to track your package. You can also log in to your account to view order status.',
    },
    {
        id: 6,
        question: 'Do your products come with a warranty?',
        answer: 'Yes, most of our products come with a manufacturer\'s warranty. The specific warranty period is listed on each product page. Please refer to our Warranty Policy for more information.',
    },
];

const FAQ = () => {
    // Replaced document.title with Helmet for better React SEO practices
    // document.title = `FAQ - First Digits`;

    const [openQuestion, setOpenQuestion] = useState(null);

    const toggleQuestion = (id) => {
        setOpenQuestion(openQuestion === id ? null : id);
    };

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

    const answerVariants = {
        hidden: { height: 0, opacity: 0 },
        visible: { height: "auto", opacity: 1, transition: { duration: 0.3, ease: 'easeInOut' } },
        exit: { height: 0, opacity: 0, transition: { duration: 0.2, ease: 'easeOut' } },
    };

    return (
        <motion.div
            className="min-h-screen py-20 px-4 sm:px-6 lg:px-8
                       bg-gray-50 text-gray-900
                       dark:bg-gradient-to-br dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 dark:text-gray-200"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <Helmet>
                <title>FAQ - FirstSmart Mart</title>
                <meta name="description" content="Find answers to frequently asked questions about FirstSmart Mart products, orders, shipping, and more." />
            </Helmet>

            <div className="container mx-auto max-w-4xl pt-10"> {/* Added pt-10 for spacing below Navbar */}
                <motion.h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-center mb-6 leading-tight drop-shadow-lg
                                   text-gray-800 dark:text-white" variants={itemVariants}>
                    Frequently Asked <span className="text-lime-500 dark:text-lime-400">Questions</span>
                </motion.h1>
                <motion.p className="text-lg md:text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto dark:text-gray-400" variants={itemVariants}>
                    Find quick answers to our most common questions about products, orders, shipping, and more.
                </motion.p>

                <div className="space-y-6">
                    {faqData.map((faq) => (
                        <motion.div
                            key={faq.id}
                            className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden
                                       dark:bg-gray-800 dark:shadow-lg dark:border-gray-700"
                            variants={itemVariants}
                        >
                            <button
                                className="w-full text-left p-6 flex justify-between items-center text-gray-800 font-semibold text-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none
                                           dark:text-white dark:hover:bg-gray-700"
                                onClick={() => toggleQuestion(faq.id)}
                                aria-expanded={openQuestion === faq.id}
                                aria-controls={`faq-answer-${faq.id}`}
                            >
                                {faq.question}
                                <motion.div
                                    animate={{ rotate: openQuestion === faq.id ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {openQuestion === faq.id ? (
                                        <ChevronUp className="w-6 h-6 text-blue-500 dark:text-cyan-400" />
                                    ) : (
                                        <ChevronDown className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                    )}
                                </motion.div>
                            </button>
                            <AnimatePresence>
                                {openQuestion === faq.id && (
                                    <motion.div
                                        id={`faq-answer-${faq.id}`}
                                        className="px-6 pb-6 text-gray-700 text-base leading-relaxed dark:text-gray-300"
                                        variants={answerVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                    >
                                        {faq.answer}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default FAQ;