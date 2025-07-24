import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, LogIn as LogInIcon } from 'lucide-react';
import Load from "../Components/Load";
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Login = () => {
    document.title = "Login - First Digit";
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [loginInput, setLogin] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const googleButtonRef = useRef(null);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            window.google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                callback: handleGoogleCredentialResponse,
                auto_select: false,
            });

            if (googleButtonRef.current) {
                window.google.accounts.id.renderButton(
                    googleButtonRef.current,
                    { theme: "outline", size: "large", text: "signin_with", width: "100%" }
                );
            }
        };
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleGoogleCredentialResponse = async (response) => {
        setGoogleLoading(true);
        try {
            const res = await axios.post('/api/auth/google', {
                id_token: response.credential,
            }, {
                headers: {
                    Accept: "application/json",
                },
            });

            if (res.data.status === 200) {
                localStorage.setItem("auth_token", res.data.token);
                localStorage.setItem("auth_name", res.data.username);
                localStorage.setItem("auth_email", res.data.email);
                localStorage.setItem("role", res.data.role);
                axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;

                toast.success(res.data.message || "Logged in with Google successfully!");

                if (res.data.role === "admin") {
                    navigate("/admin/dashboard");
                } else {
                    navigate("/");
                }
            } else {
                setError(res.data.validation_errors || {});
                if (res.data.validation_errors) {
                    Object.values(res.data.validation_errors).forEach(errArr => {
                        errArr.forEach(err => toast.error(err));
                    });
                } else {
                    toast.error(res.data.message || "An error occurred during Google login.");
                }
            }
        } catch (err) {
            console.error('Google login error:', err.response || err);
            if (err.response && err.response.data && err.response.data.message) {
                toast.error(err.response.data.message);
                setError({ general: err.response.data.message });
            } else {
                toast.error("Something went wrong with Google login. Please try again later.");
                setError({ general: "Network error or unexpected issue." });
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleInput = (e) => {
        setLogin({
            ...loginInput,
            [e.target.name]: e.target.value,
        });
        setError({});
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const loginSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

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

                        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;

                        toast.success(res.data.message);

                        if (res.data.role === "admin") {
                            navigate("/admin/dashboard");
                        } else {
                            navigate("/");
                        }
                    } else if (res.data.status === 401) {
                        toast.error(res.data.message);
                        setError({ general: res.data.message });
                    } else {
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
                    setLoading(false);
                });
        })
        .catch((csrfError) => {
            setLoading(false);
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
            <div className="absolute top-[10%] left-[5%] w-72 h-72 bg-pink-200/50 rounded-full blur-3xl opacity-50 dark:hidden block"></div>
            <div className="absolute bottom-[15%] right-[10%] w-80 h-80 bg-blue-200/50 rounded-full blur-3xl opacity-50 dark:hidden block"></div>


            <motion.div
                className="p-8 md:p-10 rounded-xl shadow-2xl w-full max-w-md relative z-10
                           bg-white border border-gray-200
                           dark:bg-gray-900 dark:border-gray-700 dark:shadow-2xl"
                variants={formVariants}
                initial="hidden"
                animate="visible"
            >
                <h1 className="text-4xl font-extrabold text-center mb-8 drop-shadow-md
                           text-red-900 dark:text-lime-400">
                    Welcome Back!
                </h1>
                <p className="text-center mb-8 text-lg
                          text-gray-600 dark:text-gray-400">
                    Log in to continue your shopping journey.
                </p>
                <form onSubmit={loginSubmit} className="flex flex-col space-y-6">
                    {/* Email Input */}
                    <motion.div className="relative" variants={inputVariants}>
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2
                                       text-gray-400 dark:text-gray-500" size={20} />
                        <input
                            type="email"
                            name="email"
                            placeholder="Your Email"
                            aria-label="Email"
                            onChange={handleInput}
                            value={loginInput.email}
                            className="pl-12 pr-4 py-3 rounded-lg w-full focus:outline-none focus:ring-2 transition-colors
                                       bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500
                                       dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500 dark:focus:ring-blue-600"
                            required
                        />
                        {error.email && <small className="text-red-600 dark:text-red-400 mt-1 block">{error.email[0]}</small>}
                    </motion.div>

                    {/* Password Input with Toggle Icon */}
                    <motion.div className="relative" variants={inputVariants}>
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2
                                      text-gray-400 dark:text-gray-500" size={20} />
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Your Password"
                            aria-label="Password"
                            onChange={handleInput}
                            value={loginInput.password}
                            className="pl-12 pr-12 py-3 rounded-lg w-full focus:outline-none focus:ring-2 transition-colors
                                       bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500
                                       dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500 dark:focus:ring-blue-600"
                            required
                        />
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors focus:outline-none
                                       text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-400"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                        {error.password && <small className="text-red-600 dark:text-red-400 mt-1 block">{error.password[0]}</small>}
                    </motion.div>

                    {/* General Error Message */}
                    {error.general && <small className="text-red-600 dark:text-red-400 text-center mt-2 block">{error.general}</small>}

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        className="flex items-center justify-center font-bold py-3 rounded-lg w-full focus:outline-none focus:ring-2 active:scale-98 shadow-lg
                                   bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500
                                   dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700 dark:focus:ring-blue-500"
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

                {/* OR divider */}
                <div className="flex items-center my-6">
                    <div className="flex-grow border-t
                                    border-gray-300 dark:border-gray-700"></div>
                    <span className="mx-4
                                    text-gray-500 dark:text-gray-500">OR</span>
                    <div className="flex-grow border-t
                                    border-gray-300 dark:border-gray-700"></div>
                </div>

                {/* Google Sign-In Button */}
                <div className="flex justify-center">
                    {googleLoading ? (
                        <Load />
                    ) : (
                        <div ref={googleButtonRef} className="w-full">
                            {/* Google button will render here */}
                        </div>
                    )}
                </div>

                {/* Register Link */}
                <p className="text-center mt-6
                             text-gray-600 dark:text-gray-400">
                    Don't have an account?{" "}
                    <Link to="/register" className="font-semibold
                                                   text-blue-600 hover:underline
                                                   dark:text-blue-400 dark:hover:underline">
                        Register Now
                    </Link>
                </p>
            </motion.div>
        </motion.div>
    );
};

export default Login;