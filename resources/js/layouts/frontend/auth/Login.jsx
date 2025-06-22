import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, LogIn as LogInIcon } from 'lucide-react'; // Added Mail, Lock, LogIn icons
import Load from "../Components/Load";
import { toast } from 'react-toastify';
import { motion } from 'framer-motion'; // Import motion for animations

const Login = () => {
    document.title = "Login - First Digit";
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loginInput, setLogin] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState({}); // Error state for validation errors
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

    const handleInput = (e) => {
        setLogin({
            ...loginInput,
            [e.target.name]: e.target.value,
        });
        setError({}); // Clear errors when input changes
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const loginSubmit = (e) => {
        e.preventDefault();
        setLoading(true); // Start loading

        const data = {
            email: loginInput.email,
            password: loginInput.password,
        };

        axios.get("/sanctum/csrf-cookie").then((response) => {
            axios
                .post(`/api/login`, data)
                .then((res) => {
                    if (res.data.status === 200) {
                        localStorage.setItem("auth_token", res.data.token);
                        localStorage.setItem("auth_name", res.data.username);
                        localStorage.setItem("auth_email", res.data.email);
                        localStorage.setItem("role", res.data.role);
                        toast.success(res.data.message);

                        if (res.data.role === "admin") {
                            navigate("/admin/dashboard");
                        } else {
                            navigate("/");
                        }
                    } else if (res.data.status === 401) {
                        toast.error(res.data.message);
                        setError({ general: res.data.message }); // Set general error for 401
                    } else {
                        // If validation errors exist, set them in the error state
                        setError(res.data.validation_errors || {});
                        if (res.data.validation_errors) {
                             Object.values(res.data.validation_errors).forEach(errArr => {
                                 errArr.forEach(err => toast.error(err));
                             });
                        } else {
                            toast.error("An unexpected error occurred.");
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
            toast.error("Failed to prepare login. Please try again later.");
            setError({ general: "CSRF token error." });
            console.error("CSRF Error:", csrfError);
        });
    };

    // Framer Motion Variants
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
            {/* Subtle background glow/design elements */}
            <div className="absolute top-[10%] left-[5%] w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl opacity-30"></div>
            <div className="absolute bottom-[15%] right-[10%] w-80 h-80 bg-purple-500/10 rounded-full blur-3xl opacity-30"></div>

            <motion.div
                className="bg-gray-900 p-8 md:p-10 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md relative z-10"
                variants={formVariants}
                initial="hidden"
                animate="visible"
            >
                <h1 className="text-4xl font-extrabold text-center text-lime-400 mb-8 drop-shadow-md">
                    Welcome Back!
                </h1>
                <p className="text-center text-gray-400 mb-8 text-lg">
                    Log in to continue your shopping journey.
                </p>
                <form onSubmit={loginSubmit} className="flex flex-col space-y-6">
                    {/* Email Input */}
                    <motion.div className="relative" variants={inputVariants}>
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input
                            type="email"
                            name="email"
                            placeholder="Your Email"
                            aria-label="Email"
                            onChange={handleInput}
                            value={loginInput.email}
                            className="pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg w-full text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
                            required
                        />
                        {error.email && <small className="text-red-400 mt-1 block">{error.email[0]}</small>}
                    </motion.div>

                    {/* Password Input with Toggle Icon */}
                    <motion.div className="relative" variants={inputVariants}>
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Your Password"
                            aria-label="Password"
                            onChange={handleInput}
                            value={loginInput.password}
                            className="pl-12 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-lg w-full text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
                            required
                        />
                        <button
                            type="button" // Important to prevent form submission
                            onClick={togglePasswordVisibility}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 transition-colors focus:outline-none"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                        {error.password && <small className="text-red-400 mt-1 block">{error.password[0]}</small>}
                    </motion.div>
                    
                    {/* General Error Message */}
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
                                <LogInIcon className="mr-2" size={20} /> Login
                            </>
                        )}
                    </motion.button>
                </form>

                {/* Register Link */}
                <p className="text-center mt-6 text-gray-400">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-blue-400 hover:underline font-semibold">
                        Register Now
                    </Link>
                </p>
            </motion.div>
        </motion.div>
    );
};

export default Login;