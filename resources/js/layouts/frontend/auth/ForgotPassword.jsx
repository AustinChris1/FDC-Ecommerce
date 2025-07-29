import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Mail, Loader, CheckCircle } from 'lucide-react'; // Icons for email, loading, success
import { Link } from 'react-router-dom'; // For navigation back to login

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        document.title = "Forgot Password";
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setErrors({});

        try {
            const response = await axios.post('/api/forgot-password', { email });

            if (response.data.status === 200) {
                setMessage(response.data.message);
                toast.success(response.data.message);
                setEmail(''); // Clear email field on success
            } else if (response.data.status === 422) {
                setErrors(response.data.errors);
                toast.error("Please correct the errors in the form.");
            } else {
                toast.error(response.data.message || "An unexpected error occurred.");
            }
        } catch (error) {
            console.error("Forgot password request error:", error.response?.data || error.message);
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
                toast.error("Validation failed. Please check your email.");
            } else {
                toast.error(error.response?.data?.message || "Could not send password reset link. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Framer Motion variants
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const formVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5, delay: 0.2 } },
    };

    const buttonVariants = {
        hover: { scale: 1.05 },
        tap: { scale: 0.95 },
    };

    return (
        <motion.div
            className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100
                       dark:from-gray-900 dark:to-gray-800"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div
                className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md
                           dark:bg-gray-800 dark:text-gray-200"
                variants={formVariants}
            >
                <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-6
                               dark:text-lime-400">
                    Forgot Password
                </h2>
                <p className="text-center text-gray-600 mb-8 dark:text-gray-400">
                    Enter your email address below and we'll send you a link to reset your password.
                </p>

                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative mb-4 flex items-center justify-center
                                   dark:bg-green-900 dark:border-green-700 dark:text-green-200"
                    >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span>{message}</span>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2
                                                       dark:text-gray-300">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2
                                            ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
                                            bg-gray-50 text-gray-900 placeholder-gray-500 transition-all duration-200
                                            dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-blue-400`}
                                placeholder="your@example.com"
                                required
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-sm mt-2">{errors.email[0]}</p>}
                    </div>

                    <motion.button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg
                                   shadow-lg transition-all duration-300 flex items-center justify-center
                                   dark:bg-blue-700 dark:hover:bg-blue-600"
                        disabled={isLoading}
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                    >
                        {isLoading ? (
                            <Loader className="w-5 h-5 animate-spin mr-2" />
                        ) : (
                            <Mail className="w-5 h-5 mr-2" />
                        )}
                        {isLoading ? 'Sending Link...' : 'Send Password Reset Link'}
                    </motion.button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/login" className="text-blue-600 hover:underline font-medium
                                                  dark:text-blue-400 dark:hover:text-blue-300">
                        Back to Login
                    </Link>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ForgotPassword;
