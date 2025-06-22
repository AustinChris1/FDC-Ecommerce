import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Mail, User, Type, MessageSquare, Send, Loader } from 'lucide-react'; // Added relevant icons
import { toast } from 'react-toastify'; // For notifications
import axios from 'axios'; // For making API requests

const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? 'https://spx.firstdigit.com.ng/api' // Replace with your actual production API URL
    : 'http://localhost:8000/api'; // Replace with your actual local API URL

const ContactUs = () => {
    // State to hold form input values
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    // State for loading and submission status
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({}); // To hold validation errors from backend

    // Handle input changes, update formData state
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        // Clear error for the specific field as user types
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default browser form submission
        setIsSubmitting(true);
        setErrors({}); // Clear previous errors

        try {
            // First, get CSRF cookie if your Laravel API uses Sanctum
            await axios.get('/sanctum/csrf-cookie');

            const response = await axios.post(`${API_BASE_URL}/contact-us`, formData);

            if (response.data.status === 200) {
                toast.success(response.data.message || "Your message has been sent successfully!");
                // Clear the form fields on successful submission
                setFormData({
                    name: '',
                    email: '',
                    subject: '',
                    message: '',
                });
            } else {
                // This part handles generic errors not caught by 422 validation
                toast.error(response.data.message || "Failed to send message. Please try again.");
            }
        } catch (error) {
            console.error("Contact form submission error:", error);
            if (error.response && error.response.status === 422 && error.response.data.errors) {
                // Handle validation errors from Laravel
                setErrors(error.response.data.errors);
                Object.values(error.response.data.errors).forEach(messages => {
                    messages.forEach(message => toast.error(message));
                });
            } else {
                // Handle network errors or other unexpected errors
                toast.error(error.response?.data?.message || "An unexpected error occurred. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Animation variants for Framer Motion
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                delay: 0.1,
                duration: 0.6,
                when: "beforeChildren",
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <motion.div
            className="min-h-screen bg-gray-950 text-gray-200 pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <Helmet>
                <title>Contact Us - First Digit Communications</title>
                <meta name="description" content="Get in touch with First Digit Communications. Send us your questions or feedback." />
            </Helmet>

            <motion.div
                className="w-full max-w-2xl bg-gray-900 rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10 border border-gray-800"
                variants={itemVariants}
            >
                <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-6 text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 leading-tight">
                    Get in Touch
                </h1>
                <p className="text-center text-lg text-gray-400 mb-8 max-w-md mx-auto">
                    We'd love to hear from you! Please fill out the form below.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Input */}
                    <motion.div variants={itemVariants}>
                        <label htmlFor="name" className="block text-gray-400 text-sm font-medium mb-2">
                            <User className="inline-block w-4 h-4 mr-2 text-indigo-400" /> Your Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`w-full p-3 bg-gray-800 border rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors
                                ${errors.name ? 'border-red-500' : 'border-gray-700'}`}
                            placeholder="Enter your name"
                            required
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name[0]}</p>}
                    </motion.div>

                    {/* Email Input */}
                    <motion.div variants={itemVariants}>
                        <label htmlFor="email" className="block text-gray-400 text-sm font-medium mb-2">
                            <Mail className="inline-block w-4 h-4 mr-2 text-green-400" /> Your Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`w-full p-3 bg-gray-800 border rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors
                                ${errors.email ? 'border-red-500' : 'border-gray-700'}`}
                            placeholder="your.email@example.com"
                            required
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email[0]}</p>}
                    </motion.div>

                    {/* Subject Input */}
                    <motion.div variants={itemVariants}>
                        <label htmlFor="subject" className="block text-gray-400 text-sm font-medium mb-2">
                            <Type className="inline-block w-4 h-4 mr-2 text-yellow-400" /> Subject
                        </label>
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            className={`w-full p-3 bg-gray-800 border rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors
                                ${errors.subject ? 'border-red-500' : 'border-gray-700'}`}
                            placeholder="Reason for your message"
                            required
                        />
                        {errors.subject && <p className="mt-1 text-sm text-red-400">{errors.subject[0]}</p>}
                    </motion.div>

                    {/* Message Textarea */}
                    <motion.div variants={itemVariants}>
                        <label htmlFor="message" className="block text-gray-400 text-sm font-medium mb-2">
                            <MessageSquare className="inline-block w-4 h-4 mr-2 text-cyan-400" /> Your Message
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            rows="5"
                            className={`w-full p-3 bg-gray-800 border rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors resize-y
                                ${errors.message ? 'border-red-500' : 'border-gray-700'}`}
                            placeholder="Write your message here..."
                            required
                        ></textarea>
                        {errors.message && <p className="mt-1 text-sm text-red-400">{errors.message[0]}</p>}
                    </motion.div>

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                <span>Sending...</span>
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                <span>Send Message</span>
                            </>
                        )}
                    </motion.button>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default ContactUs;
