import React, { useState } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, User, Mail, Lock, UserPlus } from "lucide-react"; // Added User, Mail, Lock, UserPlus icons
import Load from "../Components/Load";
import { motion } from 'framer-motion'; // Import motion for animations

const Register = () => {
    document.title = "Register - First Digit";
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [registerInput, setRegister] = useState({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });
    const [error, setError] = useState({});
    const [showPassword, setShowPassword] = useState(false); // Toggle for password visibility

    // Handle input changes
    const handleInput = (e) => {
        setRegister({
            ...registerInput,
            [e.target.name]: e.target.value,
        });
        setError({}); // Clear errors when input changes
    };

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Submit Registration Form
    const registerSubmit = (e) => {
        e.preventDefault();
        setLoading(true); // Start loading

        const data = {
            name: registerInput.name,
            email: registerInput.email,
            password: registerInput.password,
            password_confirmation: registerInput.password_confirmation,
        };

        axios
            .get("/sanctum/csrf-cookie")
            .then(() => {
                axios
                    .post(`/api/register`, data, {
                        headers: {
                            Accept: "application/json", // Explicitly set the Accept header
                        },
                    })
                    .then((res) => {
                        if (res.data.status === 200) {
                            localStorage.setItem("auth_token", res.data.token);
                            localStorage.setItem("auth_name", res.data.username);
                            localStorage.setItem("auth_email", res.data.email);
                            localStorage.setItem("role", res.data.role);

                            setError({});
                            toast.success(res.data.message);
                            navigate("/email/resend"); // Assuming this is the correct next step
                        } else {
                            setError(res.data.validation_errors || {});
                            if (res.data.validation_errors) {
                                Object.values(res.data.validation_errors).forEach(errArr => {
                                    errArr.forEach(err => toast.error(err));
                                });
                           } else {
                               toast.error("An unexpected error occurred during registration.");
                           }
                        }
                    })
                    .catch((err) => {
                        if (err.response && err.response.status === 422) {
                            setError(err.response.data.validation_errors || {});
                            Object.values(err.response.data.validation_errors).forEach(errArr => {
                                errArr.forEach(err => toast.error(err));
                            });
                        } else if (err.response && err.response.data && err.response.data.message) {
                            toast.error(err.response.data.message);
                            setError({ general: err.response.data.message });
                        } else {
                            toast.error("Something went wrong. Please try again later.");
                            setError({ general: "Network error or unexpected issue." });
                            console.error('Error details:', err.response || err);
                        }
                    })
                    .finally(() => {
                        setLoading(false); // Stop loading
                    });
            })
            .catch((csrfError) => {
                setLoading(false); // Stop loading if CSRF fails
                toast.error("Failed to prepare registration. Please try again later.");
                setError({ general: "CSRF token error." });
                console.error("CSRF Error:", csrfError);
            });
    };

    // Framer Motion Variants (reused from Login for consistency)
    const pageVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const formVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut", delay: 0.2 } },
    };

    const inputVariants = {
        hidden: { x: -20, opacity: 0 },
        visible: { x: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
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
            {/* Subtle background glow/design elements (from Login) */}
            <div className="absolute top-[10%] right-[5%] w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl opacity-30"></div>
            <div className="absolute bottom-[15%] left-[10%] w-80 h-80 bg-purple-500/10 rounded-full blur-3xl opacity-30"></div>

            <motion.div
                className="bg-gray-900 mt-20 p-8 md:p-10 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md relative z-10"
                variants={formVariants}
                initial="hidden"
                animate="visible"
            >
                <h1 className="text-4xl font-extrabold text-center text-lime-400 mb-6 drop-shadow-md">
                    Join Us Today!
                </h1>
                <p className="text-center text-gray-400 mb-8 text-lg">
                    Create your account to unlock exclusive features.
                </p>
                <form onSubmit={registerSubmit} className="flex flex-col space-y-6">
                    {/* Name Input */}
                    <motion.div className="relative" variants={inputVariants}>
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            aria-label="Full Name"
                            onChange={handleInput}
                            value={registerInput.name}
                            className="pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg w-full text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
                            required
                        />
                        {error.name && <small className="text-red-400 mt-1 block">{error.name[0]}</small>}
                    </motion.div>

                    {/* Email Input */}
                    <motion.div className="relative" variants={inputVariants}>
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input
                            type="email"
                            name="email"
                            placeholder="Your Email"
                            aria-label="Email"
                            onChange={handleInput}
                            value={registerInput.email}
                            className="pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg w-full text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
                            required
                        />
                        {error.email && <small className="text-red-400 mt-1 block">{error.email[0]}</small>}
                    </motion.div>

                    {/* Password Field with Toggle Icon */}
                    <motion.div className="relative" variants={inputVariants}>
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            aria-label="Password"
                            onChange={handleInput}
                            value={registerInput.password}
                            className="pl-12 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-lg w-full text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
                            required
                        />
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 transition-colors focus:outline-none"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                        {error.password && <small className="text-red-400 mt-1 block">{error.password[0]}</small>}
                    </motion.div>

                    {/* Confirm Password Field (also with Lock icon for consistency) */}
                    <motion.div className="relative" variants={inputVariants}>
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input
                            type="password" // Always hide for confirm password
                            name="password_confirmation"
                            placeholder="Confirm Password"
                            aria-label="Confirm Password"
                            onChange={handleInput}
                            value={registerInput.password_confirmation}
                            className="pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg w-full text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
                            required
                        />
                        {error.password_confirmation && <small className="text-red-400 mt-1 block">{error.password_confirmation[0]}</small>}
                    </motion.div>

                    {/* General Error Message (for non-field specific errors) */}
                    {error.general && <small className="text-red-400 text-center mt-2 block">{error.general}</small>}

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        className="flex items-center justify-center bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors w-full focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-98 shadow-lg"
                        disabled={loading}
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                    >
                        {loading ? <Load /> : (
                            <>
                                <UserPlus className="mr-2" size={20} /> Register
                            </>
                        )}
                    </motion.button>
                </form>

                {/* Login Link */}
                <p className="text-center mt-6 text-gray-400">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-400 hover:underline font-semibold">
                        Login here
                    </Link>
                </p>
            </motion.div>
        </motion.div>
    );
};

export default Register;