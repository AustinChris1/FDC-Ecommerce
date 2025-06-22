import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, ShoppingCart, Banknote, ClipboardCopy, Home, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const OrderConfirmation = () => {
    const { orderNumber } = useParams();
    const navigate = useNavigate();

    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchOrderDetails = useCallback(async () => {
        if (!orderNumber) {
            toast.error("No order number provided. Redirecting to shop.");
            setError(true);
            setLoading(false);
            navigate('/shop');
            return;
        }

        try {
            setLoading(true);
            setError(false);
            // Fetch order details from your backend API
            const response = await axios.get(`/api/orders/view/${orderNumber}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                }
            });

            if (response.data.status === 200 && response.data.order) {
                setOrderDetails(response.data.order);
            } else {
                toast.error(response.data.message || "Failed to load order details.");
                setError(true);
            }
        } catch (err) {
            console.error("Error fetching order details:", err);
            const errorMessage = err.response?.data?.message || "An error occurred while loading order details.";
            toast.error(errorMessage);
            setError(true);
        } finally {
            setLoading(false);
            localStorage.removeItem('lastPaymentMethod');
        }
    }, [orderNumber, navigate]);

    useEffect(() => {
        document.title = "Order Confirmed - First Digits";
        fetchOrderDetails();
    }, [fetchOrderDetails]);

    // Animation variants (kept as is, they look good)
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                delay: 0.2,
                duration: 0.5,
                when: "beforeChildren",
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const copyToClipboard = (text) => {
        if (!navigator.clipboard) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            toast.success("Copied to clipboard! (Fallback)");
            return;
        }

        navigator.clipboard.writeText(text)
            .then(() => {
                toast.success(
                    <div className="flex items-center">
                        <ClipboardCopy className="text-green-400 mr-2" />
                        <span>Copied to clipboard!</span>
                    </div>,
                    { icon: false }
                );
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
                toast.error(
                    <div className="flex items-center">
                        <span>Failed to copy. Please copy manually.</span>
                    </div>
                );
            });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 text-gray-200 flex items-center justify-center p-4"> {/* Added p-4 for padding on small screens */}
                <Loader className="w-12 h-12 animate-spin text-lime-400" />
                <p className="ml-4 text-lg">Loading order details...</p>
            </div>
        );
    }

    if (error || !orderDetails) {
        return (
            <div className="min-h-screen bg-gray-950 text-gray-200 pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center text-center">
                <Helmet>
                    <title>Order Error - First Digits</title>
                    <meta name="description" content="There was an issue loading your order details." />
                </Helmet>
                <motion.div
                    className="bg-gray-900 rounded-2xl shadow-2xl p-8 sm:p-10 lg:p-12 max-w-lg w-full border border-gray-800"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-red-500 mb-4 leading-tight"> {/* Adjusted font sizes */}
                        Order Not Found
                    </h1>
                    <p className="text-base sm:text-lg mb-6"> {/* Adjusted font sizes */}
                        We couldn't load the details for order number "{orderNumber}". It might be invalid, or an error occurred.
                    </p>
                    <Link
                        to="/shop"
                        className="flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-base sm:text-lg" // Added text size for responsiveness
                    >
                        <ShoppingCart className="w-5 h-5 mr-2" /> Back to Shop
                    </Link>
                </motion.div>
            </div>
        );
    }

    const { grand_total, payment_method } = orderDetails;

    return (
        <motion.div
            className="min-h-screen bg-gray-950 text-gray-200 pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <Helmet>
                <title>Order Confirmed - First Digits</title>
                <meta name="description" content="Your order has been successfully placed." />
            </Helmet>

            <motion.div
                className="bg-gray-900 rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 lg:p-12 text-center max-w-lg w-full border border-gray-800" // Adjusted padding for smaller screens
                variants={itemVariants}
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="mb-4 sm:mb-6 flex justify-center" // Adjusted margin for smaller screens
                >
                    <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-lime-400" /> {/* Adjusted icon size for smaller screens */}
                </motion.div>

                <motion.h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3 sm:mb-4 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-lime-400 to-green-600" variants={itemVariants}> {/* Adjusted font sizes */}
                    Order Confirmed!
                </motion.h1>

                <motion.p className="text-base sm:text-lg mb-5 sm:mb-6" variants={itemVariants}> {/* Adjusted font sizes and margins */}
                    Thank you for your purchase. Your order has been successfully placed.
                </motion.p>

                {orderNumber && (
                    <motion.div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-gray-800 rounded-lg border border-gray-700 inline-block w-full max-w-xs sm:max-w-none" variants={itemVariants}> {/* Adjusted padding and added width control */}
                        <p className="text-gray-400 text-sm sm:text-base mb-1 sm:mb-2">Your Order Number:</p> {/* Adjusted font size */}
                        <div className="flex items-center justify-center space-x-2">
                            <motion.span
                                className="text-yellow-300 text-2xl sm:text-3xl font-bold tracking-wide break-all" // Adjusted font size and added break-all for long order numbers
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                            >
                                {orderNumber}
                            </motion.span>
                            <button
                                onClick={() => copyToClipboard(orderNumber)}
                                className="text-gray-500 hover:text-white transition-colors p-1.5 sm:p-2 rounded-full hover:bg-gray-700" // Adjusted padding
                                title="Copy Order Number"
                            >
                                <ClipboardCopy className="w-4 h-4 sm:w-5 sm:h-5" /> {/* Adjusted icon size */}
                            </button>
                        </div>
                    </motion.div>
                )}

                {payment_method === 'bank_transfer' || payment_method === 'bank_transfer_pos' ? (
                    <motion.div
                        className="mt-5 sm:mt-6 p-5 sm:p-6 bg-gray-800 rounded-xl border border-blue-700 shadow-md text-left" // Adjusted padding and margin
                        variants={itemVariants}
                    >
                        <h3 className="text-xl sm:text-2xl font-bold text-blue-400 mb-3 sm:mb-4 flex items-center"> {/* Adjusted font size */}
                            <Banknote className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3" /> Bank Transfer Details {/* Adjusted icon size and margin */}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-300 mb-2 sm:mb-3"> {/* Adjusted font size and margin */}
                            Please complete your transfer of <span className="font-bold text-cyan-400">₦{grand_total ? grand_total.toLocaleString() : 'N/A'}</span> using the Order Number provided above.
                            Your order will be processed once payment is confirmed.
                        </p>
                        <div className="space-y-1.5 sm:space-y-2 text-gray-200 text-sm sm:text-base"> {/* Adjusted spacing and font size */}
                            <p><span className="font-semibold text-gray-400">Bank Name:</span> Fidelity Bank</p>
                            <p><span className="font-semibold text-gray-400">Account Name:</span> First Digits Ltd</p>
                            <p><span className="font-semibold text-gray-400">Account Number:</span> 0123456789</p>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-400 mt-3 sm:mt-4"> {/* Adjusted font size and margin */}
                            Remember to include your **Order Number** in the transaction description.
                        </p>
                    </motion.div>
                ) : (
                    <motion.p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8" variants={itemVariants}> {/* Adjusted font size and margin */}
                        Your payment has been processed successfully. We've sent a confirmation email to your registered email address.
                    </motion.p>
                )}

                <motion.div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4 mt-6 sm:mt-8" variants={itemVariants}> {/* Adjusted spacing and margin */}
                    <Link
                        to="/shop"
                        className="flex items-center justify-center w-full px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-base sm:text-lg" // Adjusted padding and font size
                    >
                        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Continue Shopping
                    </Link>
                    <Link
                        to="/user/orders"
                        className="flex items-center justify-center w-full px-5 py-2.5 sm:px-6 sm:py-3 bg-gray-700 text-gray-200 font-semibold rounded-lg shadow-md hover:bg-gray-600 transition-colors duration-300 hover:scale-105 text-base sm:text-lg" // Adjusted padding and font size
                    >
                        <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> View My Orders
                    </Link>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default OrderConfirmation;