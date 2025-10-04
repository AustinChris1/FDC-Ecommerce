import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, User, Mail, Lock, UserPlus, Phone } from "lucide-react"; // Added Phone icon
import Load from "../Components/Load";
import { motion } from 'framer-motion';

const Register = () => {
    document.title = "Register - First Digit";
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [registerInput, setRegister] = useState({
        name: "",
        email: "",
        phone: "", // Added new state variable for phone
        password: "",
        password_confirmation: "",
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
                    { theme: "outline", size: "large", text: "signup_with", width: "100%" }
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
                localStorage.setItem("auth_phone", res.data.phone); // Store phone number
                localStorage.setItem("role", res.data.role);
                axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;

                toast.success(res.data.message || "Signed up with Google successfully!");
                navigate("/");
            } else {
                setError(res.data.validation_errors || {});
                if (res.data.validation_errors) {
                    Object.values(res.data.validation_errors).forEach(errArr => {
                        errArr.forEach(err => toast.error(err));
                    });
                } else {
                    toast.error(res.data.message || "An error occurred during Google registration.");
                }
            }
        } catch (err) {
            console.error('Google registration error:', err.response || err);
            if (err.response && err.response.data && err.response.data.message) {
                toast.error(err.response.data.message);
                setError({ general: err.response.data.message });
            } else {
                toast.error("Something went wrong with Google registration. Please try again later.");
                setError({ general: "Network error or unexpected issue." });
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleInput = (e) => {
        setRegister({
            ...registerInput,
            [e.target.name]: e.target.value,
        });
        setError({});
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const registerSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        const data = {
            name: registerInput.name,
            email: registerInput.email,
            phone: registerInput.phone, // Added phone to the data payload
            password: registerInput.password,
            password_confirmation: registerInput.password_confirmation,
        };

        axios
            .get("/sanctum/csrf-cookie")
            .then(() => {
                axios
                    .post(`/api/register`, data, {
                        headers: {
                            Accept: "application/json",
                        },
                    })
                    .then((res) => {
                        if (res.data.status === 200) {
                            localStorage.setItem("auth_token", res.data.token);
                            localStorage.setItem("auth_name", res.data.username);
                            localStorage.setItem("auth_email", res.data.email);
                            localStorage.setItem("auth_phone", res.data.phone); // Store phone number
                            localStorage.setItem("role", res.data.role);
                            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;

                            setError({});
                            toast.success(res.data.message);
                            navigate("/email/resend");
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
                        setLoading(false);
                    });
            })
            .catch((csrfError) => {
                setLoading(false);
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
            className="flex items-center justify-center min-h-screen p-5 pt-24 relative overflow-hidden
                         bg-gradient-to-br from-white to-gray-100
                         dark:bg-gradient-to-br dark:from-gray-950 dark:via-gray-950 dark:to-gray-900"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Subtle background glow/design elements for Dark Mode */}
            <div className="absolute top-[10%] right-[5%] w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl opacity-30 dark:block hidden"></div>
            <div className="absolute bottom-[15%] left-[10%] w-80 h-80 bg-purple-500/10 rounded-full blur-3xl opacity-30 dark:block hidden"></div>

            {/* Subtle background glow/design elements for Light Mode */}
            <div className="absolute top-[10%] right-[5%] w-72 h-72 bg-rose-200/50 rounded-full blur-3xl opacity-50 dark:hidden block"></div>
            <div className="absolute bottom-[15%] left-[10%] w-80 h-80 bg-sky-200/50 rounded-full blur-3xl opacity-50 dark:hidden block"></div>

            <motion.div
                className="mt-20 p-8 md:p-10 rounded-xl shadow-2xl w-full max-w-md relative z-10
                         bg-white border border-gray-200
                         dark:bg-gray-900 dark:border-gray-700 dark:shadow-2xl"
                variants={formVariants}
                initial="hidden"
                animate="visible"
            >
                <h1 className="text-4xl font-extrabold text-center mb-6 drop-shadow-md
                             text-indigo-600 dark:text-lime-400">
                    Join Us Today!
                </h1>
                <p className="text-center mb-8 text-lg
                           text-gray-600 dark:text-gray-400">
                    Create your account to unlock exclusive features.
                </p>
                <form onSubmit={registerSubmit} className="flex flex-col space-y-6">
                    {/* Name Input */}
                    <motion.div className="relative" variants={inputVariants}>
                        <User className="absolute left-4 top-1/2 -translate-y-1/2
                                         text-gray-400 dark:text-gray-500" size={20} />
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            aria-label="Full Name"
                            onChange={handleInput}
                            value={registerInput.name}
                            className="pl-12 pr-4 py-3 rounded-lg w-full focus:outline-none focus:ring-2 transition-colors
                                         bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500
                                         dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500 dark:focus:ring-blue-600"
                            required
                        />
                        {error.name && <small className="text-red-600 dark:text-red-400 mt-1 block">{error.name[0]}</small>}
                    </motion.div>

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
                            value={registerInput.email}
                            className="pl-12 pr-4 py-3 rounded-lg w-full focus:outline-none focus:ring-2 transition-colors
                                         bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500
                                         dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500 dark:focus:ring-blue-600"
                            required
                        />
                        {error.email && <small className="text-red-600 dark:text-red-400 mt-1 block">{error.email[0]}</small>}
                    </motion.div>

                    {/* Phone Number Input */}
                    <motion.div className="relative" variants={inputVariants}>
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2
                                         text-gray-400 dark:text-gray-500" size={20} />
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone Number"
                            aria-label="Phone Number"
                            onChange={handleInput}
                            value={registerInput.phone}
                            className="pl-12 pr-4 py-3 rounded-lg w-full focus:outline-none focus:ring-2 transition-colors
                                         bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500
                                         dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500 dark:focus:ring-blue-600"
                            required
                        />
                        {error.phone && <small className="text-red-600 dark:text-red-400 mt-1 block">{error.phone[0]}</small>}
                    </motion.div>

                    {/* Password Field with Toggle Icon */}
                    <motion.div className="relative" variants={inputVariants}>
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2
                                         text-gray-400 dark:text-gray-500" size={20} />
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            aria-label="Password"
                            onChange={handleInput}
                            value={registerInput.password}
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

                    {/* Confirm Password Field (also with Lock icon for consistency) */}
                    <motion.div className="relative" variants={inputVariants}>
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2
                                         text-gray-400 dark:text-gray-500" size={20} />
                        <input
                            type="password"
                            name="password_confirmation"
                            placeholder="Confirm Password"
                            aria-label="Confirm Password"
                            onChange={handleInput}
                            value={registerInput.password_confirmation}
                            className="pl-12 pr-4 py-3 rounded-lg w-full focus:outline-none focus:ring-2 transition-colors
                                         bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500
                                         dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500 dark:focus:ring-blue-600"
                            required
                        />
                        {error.password_confirmation && <small className="text-red-600 dark:text-red-400 mt-1 block">{error.password_confirmation[0]}</small>}
                    </motion.div>

                    {/* General Error Message (for non-field specific errors) */}
                    {error.general && <small className="text-red-600 dark:text-red-400 text-center mt-2 block">{error.general}</small>}

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        className="flex items-center justify-center font-bold py-3 rounded-lg w-full focus:outline-none focus:ring-2 active:scale-98 shadow-lg
                                         bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500
                                         dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700 dark:focus:ring-blue-500"
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

                {/* OR divider */}
                <div className="flex items-center my-6">
                    <div className="flex-grow border-t
                                     border-gray-300 dark:border-gray-700"></div>
                    <span className="mx-4
                                     text-gray-500 dark:text-gray-500">OR</span>
                    <div className="flex-grow border-t
                                     border-gray-300 dark:border-gray-700"></div>
                </div>

                {/* Google Sign-Up Button */}
                <div className="flex justify-center">
                    {googleLoading ? (
                        <Load />
                    ) : (
                        <div ref={googleButtonRef} className="w-full">
                            {/* Google button will render here */}
                        </div>
                    )}
                </div>

                {/* Login Link */}
                <p className="text-center mt-6
                                     text-gray-600 dark:text-gray-400">
                    Already have an account?{" "}
                    <Link to="/login" className="font-semibold
                                                 text-indigo-600 hover:underline
                                                 dark:text-blue-400 dark:hover:underline">
                        Login here
                    </Link>
                </p>
            </motion.div>
        </motion.div>
    );
};

export default Register;
