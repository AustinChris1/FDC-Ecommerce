import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { MailCheck } from 'lucide-react';

const ResendEmail = () => {
    document.title = "Verify Your Email - First Digit";
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!loading) {
                navigate("/");
            }
        }, 1.5 * 60 * 1000);

        return () => clearTimeout(timer);
    }, [navigate, loading]);

    const handleResendEmail = (e) => {
        e.preventDefault();
        setLoading(true);

        axios.get("/sanctum/csrf-cookie")
            .then(() => {
                axios
                    .post("/api/email/resend", null, { withCredentials: true })
                    .then((response) => {
                        if (response.data.status === 200) {
                            toast.success(response.data.message || "Verification email sent successfully!");
                        } else {
                            toast.error(response.data.message || "Failed to send verification email. Please try again.");
                        }
                    })
                    .catch((error) => {
                        const errorMessage =
                            error.response?.data?.message || "An unexpected error occurred. Please try again later.";
                        toast.error(errorMessage);
                        console.error('Resend email error:', error.response || error);
                    })
                    .finally(() => {
                        setLoading(false);
                    });
            })
            .catch((csrfError) => {
                setLoading(false);
                toast.error("Failed to prepare request. Please try again later.");
                console.error("CSRF Error:", csrfError);
            });
    };

    const pageVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut", delay: 0.2 } },
    };

    const buttonVariants = {
        hover: { scale: 1.02, boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.3)" },
        tap: { scale: 0.98 },
    };

    return (
        <motion.div
            className="flex items-center justify-center min-h-screen p-5 pt-24 relative overflow-hidden
                       bg-gradient-to-br from-white to-gray-100
                       dark:bg-gradient-to-br dark:from-gray-950 dark:via-gray-950 dark:to-gray-900"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Subtle background glow/design elements for Dark Mode */}
            <div className="absolute top-[10%] left-[5%] w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl opacity-30 dark:block hidden"></div>
            <div className="absolute bottom-[15%] right-[10%] w-80 h-80 bg-purple-500/10 rounded-full blur-3xl opacity-30 dark:block hidden"></div>

            {/* Subtle background glow/design elements for Light Mode */}
            <div className="absolute top-[10%] left-[5%] w-72 h-72 bg-rose-200/50 rounded-full blur-3xl opacity-50 dark:hidden block"></div>
            <div className="absolute bottom-[15%] right-[10%] w-80 h-80 bg-sky-200/50 rounded-full blur-3xl opacity-50 dark:hidden block"></div>

            <motion.div
                className="p-8 md:p-10 rounded-xl shadow-2xl w-full max-w-md relative z-10 text-center
                           bg-white border border-gray-200
                           dark:bg-gray-900 dark:border-gray-700 dark:shadow-2xl"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
            >
                <MailCheck className="w-20 h-20 mx-auto mb-6 drop-shadow-md
                                     text-indigo-600 dark:text-lime-400" />
                <h1 className="text-4xl font-extrabold mb-4 drop-shadow-md
                           text-indigo-600 dark:text-lime-400">
                    Verify Your Email
                </h1>
                <p className="text-lg mb-8 leading-relaxed
                          text-gray-600 dark:text-gray-400">
                    A verification link has been sent to your email address. Please check your inbox (and spam folder!) to complete your registration.
                </p>
                <p className="text-md mb-6
                          text-gray-500 dark:text-gray-500">
                    Didn't receive the email?
                </p>
                <form onSubmit={handleResendEmail}>
                    <motion.button
                        type="submit"
                        className={`w-full flex items-center justify-center font-bold py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 active:scale-98 shadow-lg ${
                            loading
                                ? "bg-gray-400 text-gray-700 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
                                : "bg-teal-600 hover:bg-teal-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-500"
                        }`}
                        disabled={loading}
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                    >
                        {loading ? "Sending..." : (
                            <>
                                <MailCheck className="w-5 h-5 mr-2" /> Resend Verification Email
                            </>
                        )}
                    </motion.button>
                </form>
                <p className="text-center mt-6 text-sm
                             text-gray-500 dark:text-gray-500">
                    You'll be redirected to the homepage in 1.5 minutes if you don't resend.
                </p>
            </motion.div>
        </motion.div>
    );
};

export default ResendEmail;