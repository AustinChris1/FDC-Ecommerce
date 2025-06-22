import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import { motion } from 'framer-motion'; // Import motion for animations
import { MailCheck } from 'lucide-react'; // Icon for email verification

const ResendEmail = () => {
    document.title = "Verify Your Email - First Digit"; // Updated title for clarity
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Redirect to home after 1.5 minutes
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!loading) { // Only redirect if not actively sending
                navigate("/");
            }
        }, 1.5 * 60 * 1000); // 1.5 minutes in milliseconds

        return () => clearTimeout(timer); // Cleanup on unmount
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

    // Framer Motion Variants (consistent with Login/Register)
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
            className="flex items-center justify-center min-h-screen p-5 relative overflow-hidden"
            style={{ backgroundImage: 'linear-gradient(to bottom right, #0a0a0a, #1a1a1a, #0a0a0a)' }} // Darker background
            variants={pageVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Subtle background glow/design elements (consistent positioning) */}
            <div className="absolute top-[10%] left-[5%] w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl opacity-30"></div>
            <div className="absolute bottom-[15%] right-[10%] w-80 h-80 bg-purple-500/10 rounded-full blur-3xl opacity-30"></div>

            <motion.div
                className="bg-gray-900 p-8 md:p-10 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md relative z-10 text-center"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
            >
                <MailCheck className="w-20 h-20 mx-auto text-lime-400 mb-6 drop-shadow-md" /> {/* Prominent icon */}
                <h1 className="text-4xl font-extrabold text-lime-400 mb-4 drop-shadow-md">
                    Verify Your Email
                </h1>
                <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                    A verification link has been sent to your email address. Please check your inbox (and spam folder!) to complete your registration.
                </p>
                <p className="text-md text-gray-500 mb-6">
                    Didn't receive the email?
                </p>
                <form onSubmit={handleResendEmail}>
                    <motion.button
                        type="submit"
                        className={`w-full flex items-center justify-center font-bold py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-98 shadow-lg ${
                            loading
                                ? "bg-blue-800 text-gray-400 cursor-not-allowed" // Darker disabled state
                                : "bg-blue-600 hover:bg-blue-700 text-white"
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
                <p className="text-center mt-6 text-gray-500 text-sm">
                    You will be redirected to the homepage in 1.5 minutes if you do not resend.
                </p>
            </motion.div>
        </motion.div>
    );
};

export default ResendEmail;