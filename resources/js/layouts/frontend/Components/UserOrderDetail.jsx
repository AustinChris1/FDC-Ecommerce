import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Load from './Load'; // Assuming Load.js exists and is your spinner
import {
    ShoppingCart,
    User,
    Calendar,
    MapPin,
    Phone,
    Mail,
    CheckCircle,
    Clock,
    XCircle,
    CreditCard,
    Package,
    ArrowLeft,
    DollarSign,
    Info,
    RefreshCw, // For retry payment
    Ban,
    Truck,
    Hourglass
} from 'lucide-react'; // Import necessary Lucide React icons
import { toast } from 'react-toastify';

const UserOrderDetail = () => {
    const { orderNumber } = useParams(); // Get orderNumber from URL
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState(null);
    const [error, setError] = useState(null);

    // Get the authenticated user's email from localStorage for client-side filtering
    const userEmail = localStorage.getItem('auth_email');
    const userLoggedInId = localStorage.getItem('auth_id'); // Assuming you store user ID too for more robust check

    const API_URL = import.meta.env.PROD
        ? 'https://spx.firstdigit.com.ng/api' // your Laravel backend domain or subdomain
        : 'http://localhost:8000/api';

    const fetchOrderDetails = useCallback(async () => {
        if (!orderNumber) {
            toast.error("Order number missing. Please go back to My Orders.");
            setError("Order number missing.");
            setLoading(false);
            return;
        }
        if (!userEmail) {
            toast.error("You must be logged in to view order details.");
            setError("Authentication required.");
            setLoading(false);
            navigate('/login'); // Redirect to login
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_URL}/orders/view/${orderNumber}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });

            if (res.data.status === 200 && res.data.order) {
                const fetchedOrder = res.data.order;

                const isAuthorized = fetchedOrder.email.toLowerCase() === userEmail.toLowerCase();

                if (isAuthorized) {
                    setOrder(fetchedOrder);
                } else {
                    toast.error("You are not authorized to view this order.");
                    setError("Unauthorized access.");
                    navigate('/user/orders'); // Redirect to My Orders
                }
            } else if (res.data.status === 404) {
                toast.error(res.data.message || "Order not found.");
                setError(res.data.message || "Order not found.");
            } else {
                toast.error(res.data.message || "Failed to fetch order details.");
                setError(res.data.message || "Failed to fetch order details.");
            }
        } catch (err) {
            console.error("Error fetching order details:", err.response?.data || err);
            const errorMessage = err.response?.data?.message || "Network error or server issue. Could not load order details.";
            toast.error(errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [orderNumber, userEmail, userLoggedInId, navigate, API_URL]);

    useEffect(() => {
        document.title = `Order Details: ${orderNumber || 'Loading...'}`;
        fetchOrderDetails();
    }, [fetchOrderDetails]);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.98 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-600';
            case 'pending_delivery': return 'bg-orange-500';
            case 'pending_payment': return 'bg-yellow-500';
            case 'processing_paystack_payment':
            case 'processing_bank_transfer_payment':
            case 'pending_confirmation':
            case 'processing_mock_payment':
            case 'processing': return 'bg-indigo-500';
            case 'cancelled':
            case 'payment_canceled': return 'bg-red-600';
            case 'payment_failed': return 'bg-pink-600';
            case 'shipped': return 'bg-purple-600';
            default: return 'bg-gray-600';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-4 h-4 mr-1" />;
            case 'pending_delivery': return <Truck className="w-4 h-4 mr-1" />;
            case 'pending_payment': return <Hourglass className="w-4 h-4 mr-1" />;
            case 'processing': return <Clock className="w-4 h-4 mr-1" />;
            case 'cancelled':
            case 'payment_canceled': return <XCircle className="w-4 h-4 mr-1" />;
            case 'payment_failed': return <Ban className="w-4 h-4 mr-1" />;
            case 'shipped': return <Truck className="w-4 h-4 mr-1" />;
            case 'processing_paystack_payment':
            case 'processing_bank_transfer_payment':
            case 'pending_confirmation':
            case 'processing_mock_payment': return <Clock className="w-4 h-4 mr-1" />;
            default: return <Package className="w-4 h-4 mr-1" />;
        }
    };

    // Retry Payment / Initiate Paystack again
    const handleRetryPayment = async () => {
        if (!order || order.status !== 'pending_payment' || order.payment_method !== 'paystack') {
            toast.info("This order cannot be retried for payment via Paystack.");
            return;
        }

        setLoading(true);
        try {
            // Re-initiate payment through your backend
            // You might need a specific backend endpoint for retrying payments,
            // or modify your placeOrder to handle re-attempts if the order is pending.
            // For now, we'll assume a direct call to Paystack.
            // In a real scenario, you'd likely hit an API endpoint that generates a new Paystack reference
            // or re-uses the existing one and initiates the transaction.
            
            // For now, we'll just redirect to checkout if the order is still pending.
            // A more robust solution would be to generate a new Paystack transaction
            // reference and open the modal directly from here.
            
            toast.info("Redirecting to checkout to retry payment...");
            navigate('/checkout', { state: { orderToRetry: order } }); // Pass order details if checkout can resume it

        } catch (err) {
            console.error("Error retrying payment:", err);
            toast.error("Failed to initiate payment retry. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <Load />
            </div>
        );
    }

    if (error || !order) {
        return (
            <motion.div
                className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-950 text-gray-200 flex items-center justify-center"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="bg-gray-900 rounded-xl shadow-lg p-8 text-center border border-gray-800">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-red-500 mb-4 leading-tight">
                        Order Details Not Found
                    </h1>
                    <p className="text-gray-300 text-lg mb-6">
                        {error || `We couldn't load the details for order number "${orderNumber}". It might be invalid, or an error occurred.`}
                    </p>
                    <Link
                        to="/user/orders"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
                    >
                        <ArrowLeft className="w-5 h-5 inline-block mr-2" /> Back to My Orders
                    </Link>
                </div>
            </motion.div>
        );
    }

    // Parse items_json from string to array
    let orderItems = [];
    try {
        orderItems = order.items_json ? JSON.parse(order.items_json) : [];
    } catch (e) {
        console.error("Failed to parse order items_json:", e);
        toast.error("Error parsing order items. Display might be incomplete.");
    }

    return (
        <motion.div
            className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-950 text-gray-200 pt-24"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <Helmet>
                <title>Order #{order.order_number} Details</title>
                <meta name="description" content={`Details for order number ${order.order_number}`} />
            </Helmet>

            {/* Header section with title and Back button */}
            <header className="flex mt-20 flex-col sm:flex-row justify-between items-start sm:items-center mb-8 bg-gray-900 rounded-xl shadow-md p-6 border border-gray-800">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 sm:mb-0">
                    Order Details: <span className="text-blue-400">#{order.order_number}</span>
                </h1>
                <div className="flex space-x-3 mt-4 sm:mt-0">
                    <Link
                        to="/user/orders"
                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 flex items-center"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" /> Back to My Orders
                    </Link>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Summary Card */}
                <motion.div
                    className="lg:col-span-2 bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                        <ShoppingCart className="w-6 h-6 mr-3 text-blue-400" />
                        Order Summary
                    </h2>
                    <div className="space-y-3 text-gray-300">
                        <p className="flex items-center">
                            <span className="font-semibold w-36 text-gray-400">Order Number:</span>
                            <span className="ml-2 text-yellow-300">#{order.order_number}</span>
                        </p>
                        <p className="flex items-center">
                            <span className="font-semibold w-36 text-gray-400">Status:</span>
                            <span className={`ml-2 px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full text-white ${getStatusColor(order.status)} flex items-center`}>
                                {getStatusIcon(order.status)}
                                {order.status.replace(/_/g, ' ')}
                            </span>
                        </p>
                        <p className="flex items-center">
                            <span className="font-semibold w-36 text-gray-400">Payment Method:</span>
                            <span className="ml-2 flex items-center">
                                <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
                                {order.payment_method.replace(/_/g, ' ')}
                            </span>
                        </p>
                        {order.paystack_reference && (
                            <p className="flex items-center">
                                <span className="font-semibold w-36 text-gray-400">Paystack Ref:</span>
                                <span className="ml-2 text-blue-400 font-medium">{order.paystack_reference}</span>
                            </p>
                        )}
                        <p className="flex items-center">
                            <span className="font-semibold w-36 text-gray-400">Order Date:</span>
                            <span className="ml-2 flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                                {new Date(order.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                            </span>
                        </p>
                        <p className="flex items-center text-xl font-bold text-emerald-400 pt-2">
                            <span className="font-semibold w-36">Grand Total:</span>
                            <span className="ml-2 flex items-center">
                                ₦{order.grand_total.toLocaleString()}
                            </span>
                        </p>
                        {order.status === 'pending_payment' && order.payment_method === 'paystack' && (
                             <div className="mt-4 pt-4 border-t border-gray-700">
                                <button
                                    onClick={handleRetryPayment}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 flex items-center justify-center w-full"
                                >
                                    <RefreshCw className="w-5 h-5 mr-2" /> Retry Payment
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Customer & Shipping Info Card */}
                <motion.div
                    className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.1 }}
                >
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                        <User className="w-6 h-6 mr-3 text-purple-400" />
                        Customer & Shipping
                    </h2>
                    <div className="space-y-3 text-gray-300">
                        <p className="flex items-center">
                            <span className="font-semibold w-24 text-gray-400">Name:</span>
                            <span className="ml-2">{order.full_name || 'N/A'}</span>
                        </p>
                        <p className="flex items-center">
                            <span className="font-semibold w-24 text-gray-400">Email:</span>
                            <span className="ml-2 flex items-center break-all">
                                <Mail className="w-4 h-4 mr-2 text-gray-500" />
                                {order.email || 'N/A'}
                            </span>
                        </p>
                        <p className="flex items-center">
                            <span className="font-semibold w-24 text-gray-400">Phone:</span>
                            <span className="ml-2 flex items-center">
                                <Phone className="w-4 h-4 mr-2 text-gray-500" />
                                {order.phone || 'N/A'}
                            </span>
                        </p>
                        {order.shipping_address1 && ( 
                            <p className="flex items-start">
                                <span className="font-semibold w-24 pt-1 text-gray-400">Address:</span>
                                <span className="ml-2 flex items-start flex-grow">
                                    <MapPin className="w-4 h-4 mr-2 mt-1 text-gray-500 flex-shrink-0" />
                                    <span>
                                        {order.shipping_address1}, {order.shipping_address2 && `${order.shipping_address2}, `}
                                        {order.city}, {order.state}, {order.zip_code}
                                    </span>
                                </span>
                            </p>
                        )}
                         {!order.shipping_address1 && order.is_pos_sale && (
                            <p className="text-gray-500 text-sm mt-4 italic">
                                This was a POS sale (no shipping address recorded).
                            </p>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Ordered Items Card */}
            <motion.div
                className="mt-6 bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }}
            >
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <Package className="w-6 h-6 mr-3 text-orange-400" />
                    Ordered Items
                </h2>
                {orderItems.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Product Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Quantity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price (per item)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {orderItems.map((item, index) => (
                                    <tr key={index} className="even:bg-gray-850 odd:bg-gray-900">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">{item.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.qty || item.quantity}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">₦{item.price.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-400">₦{(item.qty * item.price).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-400">No items found for this order.</p>
                )}
            </motion.div>
        </motion.div>
    );
};

export default UserOrderDetail;