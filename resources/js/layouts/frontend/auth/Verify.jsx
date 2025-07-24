import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from 'react-toastify';
import { motion } from 'framer-motion'; // Added motion for animations
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'; // Icons for success, error, and loading

const VerifyEmail = () => {
    document.title = "Verify Email - First Digit";
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const status = queryParams.get("status");
        const message = queryParams.get("message");

        if (status === "200") {
            toast.success(decodeURIComponent(message));
            setTimeout(() => navigate("/"), 3000); // Redirect after 3 seconds for user to read toast
        } else {
            toast.error(decodeURIComponent(message));
            setTimeout(() => navigate("/register"), 3000); // Redirect after 3 seconds
        }
    }, [location, navigate]);

    // Framer Motion Variants for a simple fade-in effect
    const containerVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
    };

    return (
        <motion.div
            className="min-h-screen flex items-center justify-center p-5 pt-24 
                       bg-gradient-to-br from-white to-gray-100
                       dark:bg-gradient-to-br dark:from-gray-950 dark:via-gray-950 dark:to-gray-900"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="text-center p-8 rounded-xl shadow-lg w-full max-w-md
                            bg-white border border-gray-200
                            dark:bg-gray-800 dark:border-gray-700">
                <Loader2 className="w-16 h-16 mx-auto mb-6 animate-spin
                                   text-blue-500 dark:text-blue-400" /> {/* Loading icon */}
                <h2 className="text-3xl font-extrabold mb-3
                               text-gray-800 dark:text-gray-100">
                    Processing your verification...
                </h2>
                <p className="text-lg
                              text-gray-600 dark:text-gray-400">
                    Please wait while we confirm your email address and redirect you.
                </p>
            </div>
        </motion.div>
    );
};

export default VerifyEmail;