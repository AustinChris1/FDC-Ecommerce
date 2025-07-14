import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import {
    Package,
    Truck,
    CheckCircle,
    XCircle,
    Clock,
    Hourglass,
    Calendar,
    MapPin,
    Hash,
    Search,
    RefreshCw,
    User,
    DollarSign,
    ShoppingCart,
    Info
} from 'lucide-react';
import Load from './Load'; // Assuming Load.jsx is in the same directory or accessible

const TrackOrder = () => {
    const [orderNumberInput, setOrderNumberInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [orderTrackingData, setOrderTrackingData] = useState(null);
    const [error, setError] = useState(null);

    const API_URL = import.meta.env.PROD
        ? 'https://spx.firstdigit.com.ng/api'
        : 'http://localhost:8000/api';

    const fetchOrderTracking = async (e) => {
        e.preventDefault(); // Prevent default form submission
        if (!orderNumberInput.trim()) {
            toast.error("Please enter an order number.");
            setError("Please enter an order number.");
            setOrderTrackingData(null);
            return;
        }

        setLoading(true);
        setError(null);
        setOrderTrackingData(null); // Clear previous data

        try {
            // Adjust this endpoint based on your actual backend tracking API
            // This example assumes a public tracking endpoint: /api/track-order/{orderNumber}
            // If your backend requires authentication even for tracking, you might need
            // to re-evaluate how the token is handled for public access, or assume
            // this page is accessed by a logged-in user who just wants to track *any* order.
            // For a truly public tracking, you would *not* send an Authorization header
            // unless it's a specific public API key.
            const res = await axios.get(`${API_URL}/track-order/${orderNumberInput.trim()}`, {
                // If this is meant to be a public tracking page, remove the Authorization header.
                // If your backend *does* require auth for tracking, you'd need a different strategy (e.g., public API key).
                // headers: {
                //     'Authorization': `Bearer ${localStorage.getItem('auth_token')}`, // Likely not for public tracking
                //     'Content-Type': 'application/json',
                // },
                // withCredentials: true, // Only if cookies are involved for cross-origin requests
            });

            if (res.data.status === 200 && res.data.order) {
                const order = res.data.order;
                const trackingHistory = [];

                // Always add Order Placed
                trackingHistory.push({
                    status: 'Order Placed',
                    date: order.created_at, // Use created_at for order placement
                    location: order.city || 'N/A',
                    description: `Order #${order.order_number} was placed.`
                });

                // Add Processing if status indicates it and it's not yet shipped
                if (order.status.includes('processing') || order.status.includes('pending_')) {
                    // Only add if there isn't a more specific timestamp already
                    const processingDate = order.created_at; // Or another appropriate timestamp for processing start
                    const hasMoreSpecificEvent = order.shipped_at || order.out_for_delivery_at || order.delivered_at || order.cancelled_at;
                    if (!hasMoreSpecificEvent || (order.shipped_at && new Date(processingDate) < new Date(order.shipped_at))) {
                        trackingHistory.push({
                            status: 'Processing',
                            date: processingDate,
                            location: 'Warehouse/Processing Center',
                            description: `Your order is being processed and prepared for shipment.`
                        });
                    }
                }

                // Add Shipped if status indicates it AND shipped_at is present
                if (order.shipped_at) { // Rely on the dedicated timestamp
                    trackingHistory.push({
                        status: 'Shipped',
                        date: order.shipped_at,
                        location: order.origin_location || 'Logistics Hub', // You might need an 'origin_location' field
                        description: `Your order has been shipped from ${order.origin_location || 'our facility'}.`
                    });
                }

                // Add Out for Delivery if status is pending_delivery AND out_for_delivery_at is present
                if (order.out_for_delivery_at) { // Rely on the dedicated timestamp
                    trackingHistory.push({
                        status: 'Out for Delivery',
                        date: order.out_for_delivery_at,
                        location: order.delivery_route_info || order.city, // You might need a 'delivery_route_info' field
                        description: `Your order is out for delivery in ${order.city}.`
                    });
                }

                // Add Delivered if status is completed AND delivered_at is present
                if (order.delivered_at) { // Rely on the dedicated timestamp
                    trackingHistory.push({
                        status: 'Delivered',
                        date: order.delivered_at,
                        location: order.delivery_address || 'Customer Address', // Use actual delivery address if available
                        description: `Your order has been successfully delivered to ${order.full_name}.`
                    });
                }

                // Add Cancelled/Failed if applicable AND cancelled_at is present
                if (order.cancelled_at) { // Rely on the dedicated timestamp
                    trackingHistory.push({
                        status: 'Cancelled/Failed',
                        date: order.cancelled_at,
                        location: 'N/A',
                        description: `Order has been ${order.status.replace(/_/g, ' ')}. Please contact support for details.`
                    });
                }

                // Sort history by date to ensure chronological order
                trackingHistory.sort((a, b) => new Date(a.date) - new Date(b.date));

                setOrderTrackingData({
                    ...order,
                    trackingHistory
                });
                toast.success("Order details fetched successfully!");
            } else if (res.data.status === 404) {
                toast.error(res.data.message || "Order not found. Please check the order number.");
                setError(res.data.message || "Order not found. Please check the order number.");
            } else {
                toast.error(res.data.message || "Failed to fetch order details.");
                setError(res.data.message || "Failed to fetch order details.");
            }
        } catch (err) {
            console.error("Error fetching order tracking:", err.response?.data || err);
            const errorMessage = err.response?.data?.message || "Network error or server issue. Could not track order.";
            toast.error(errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        document.title = "Order Tracking";
    }, []);

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
            case 'completed': return 'text-green-500';
            case 'pending_delivery': return 'text-orange-400';
            case 'pending_payment': return 'text-yellow-400';
            case 'processing_paystack_payment':
            case 'processing_bank_transfer_payment':
            case 'pending_confirmation':
            case 'processing_mock_payment':
            case 'processing': return 'text-indigo-400';
            case 'cancelled':
            case 'payment_canceled': return 'text-red-500';
            case 'payment_failed': return 'text-pink-500';
            case 'shipped': return 'text-purple-400';
            default: return 'text-gray-400';
        }
    };

    const getStatusBgColor = (status) => {
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
            case 'Order Placed': return <Calendar className="w-5 h-5 text-blue-400" />;
            case 'Processing': return <Clock className="w-5 h-5 text-indigo-400" />;
            case 'Shipped': return <Truck className="w-5 h-5 text-purple-400" />;
            case 'Out for Delivery': return <Truck className="w-5 h-5 text-orange-400" />;
            case 'Delivered': return <CheckCircle className="w-5 h-5 text-green-400" />;
            case 'Cancelled/Failed': return <XCircle className="w-5 h-5 text-red-400" />;
            default: return <Package className="w-5 h-5 text-gray-400" />;
        }
    };


    return (
        <motion.div
            className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-950 text-gray-200 pt-24"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <Helmet>
                <title>Order Tracking - First Digits</title>
                <meta name="description" content="Track your order status with First Digits. Enter your order number to get real-time updates on your delivery." />
            </Helmet>

            <header className="flex mt-20 flex-col sm:flex-row justify-between items-start sm:items-center mb-8 bg-gray-900 rounded-xl shadow-md p-6 border border-gray-800">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 sm:mb-0">
                    Track Your Order
                </h1>
                <form onSubmit={fetchOrderTracking} className="flex flex-col sm:flex-row w-full sm:w-auto space-y-3 sm:space-y-0 sm:space-x-3">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            value={orderNumberInput}
                            onChange={(e) => setOrderNumberInput(e.target.value)}
                            placeholder="Enter your order number (e.g., FD123456)"
                            className="w-full sm:min-w-80 px-4 py-3 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            aria-label="Order Number"
                        />
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Load size="sm" /> : <Search className="w-5 h-5 mr-2" />}
                        <span>{loading ? 'Tracking...' : 'Track Order'}</span>
                    </button>
                </form>
            </header>

            {error && (
                <motion.div
                    className="bg-red-900 bg-opacity-30 border border-red-700 text-red-300 p-4 rounded-lg flex items-center mb-6"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                >
                    <XCircle className="w-5 h-5 mr-3" />
                    <p className="font-medium">{error}</p>
                </motion.div>
            )}

            {orderTrackingData && (
                <motion.div
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Order Summary Card */}
                    <motion.div
                        className="lg:col-span-1 bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800 h-fit"
                        variants={cardVariants}
                    >
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                            <ShoppingCart className="w-6 h-6 mr-3 text-blue-400" />
                            Order Summary
                        </h2>
                        <div className="space-y-3 text-gray-300">
                            <p className="flex justify-between items-center">
                                <span className="font-semibold text-gray-400">Order Number:</span>
                                <span className="text-yellow-300">#{orderTrackingData.order_number}</span>
                            </p>
                            <p className="flex justify-between items-center">
                                <span className="font-semibold text-gray-400">Current Status:</span>
                                <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full text-white ${getStatusBgColor(orderTrackingData.status)}`}>
                                    {orderTrackingData.status.replace(/_/g, ' ')}
                                </span>
                            </p>
                            <p className="flex justify-between items-center">
                                <span className="font-semibold text-gray-400">Payment Method:</span>
                                <span className="flex items-center">
                                    <DollarSign className="w-4 h-4 mr-1 text-gray-500" />
                                    {orderTrackingData.payment_method.replace(/_/g, ' ')}
                                </span>
                            </p>
                            <p className="flex justify-between items-center">
                                <span className="font-semibold text-gray-400">Order Date:</span>
                                <span className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1 text-gray-500" />
                                    {new Date(orderTrackingData.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                                </span>
                            </p>
                            <p className="flex justify-between items-center text-xl font-bold text-emerald-400 pt-2 border-t border-gray-800 mt-4">
                                <span className="font-semibold">Grand Total:</span>
                                <span>₦{orderTrackingData.grand_total.toLocaleString()}</span>
                            </p>
                            <p className="flex justify-between items-center">
                                <span className="font-semibold text-gray-400">Customer Name:</span>
                                <span className="text-gray-300">{orderTrackingData.full_name ? orderTrackingData.full_name.split(' ')[0] + ' ' + orderTrackingData.full_name.split(' ')[1][0] + '.' : 'N/A'}</span>
                            </p>
                            {orderTrackingData.shipping_address1 && (
                                <p className="flex items-start">
                                    <span className="font-semibold w-24 pt-1 text-gray-400">Delivery To:</span>
                                    <span className="ml-2 flex items-start flex-grow">
                                        <MapPin className="w-4 h-4 mr-2 mt-1 text-gray-500 flex-shrink-0" />
                                        <span>
                                            {orderTrackingData.shipping_address1}, {orderTrackingData.city}, {orderTrackingData.state}
                                        </span>
                                    </span>
                                </p>
                            )}
                        </div>
                    </motion.div>

                    {/* Tracking Timeline Card */}
                    <motion.div
                        className="lg:col-span-2 bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800"
                        variants={cardVariants}
                        transition={{ delay: 0.1 }}
                    >
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <Truck className="w-6 h-6 mr-3 text-orange-400" />
                            Tracking Progress
                        </h2>
                        <div className="relative pl-6 border-l-2 border-gray-700 space-y-8">
                            {orderTrackingData.trackingHistory.length > 0 ? (
                                orderTrackingData.trackingHistory.map((event, index) => (
                                    <div key={index} className="relative mb-8 last:mb-0">
                                        <div className="absolute -left-3 top-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white">
                                            {getStatusIcon(event.status)}
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold text-white mb-1">
                                                {event.status}
                                            </h3>
                                            <p className="text-gray-400 text-sm mb-1">
                                                <Calendar className="inline w-3 h-3 mr-1" />
                                                {new Date(event.date).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                                            </p>
                                            {event.location && (
                                                <p className="text-gray-400 text-sm mb-1">
                                                    <MapPin className="inline w-3 h-3 mr-1" />
                                                    Location: {event.location}
                                                </p>
                                            )}
                                            {event.description && (
                                                <p className="text-gray-300 text-sm mt-1">
                                                    {event.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400 text-center py-4">No detailed tracking events available yet.</p>
                            )}
                        </div>
                    </motion.div>

                    {/* Ordered Items (Optional for Public Tracking - be mindful of data exposure) */}
                    {orderTrackingData.items_json && JSON.parse(orderTrackingData.items_json).length > 0 && (
                        <motion.div
                            className="lg:col-span-3 mt-6 bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800"
                            variants={cardVariants}
                            transition={{ delay: 0.2 }}
                        >
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                                <Package className="w-6 h-6 mr-3 text-emerald-400" />
                                Ordered Items (Summary)
                            </h2>
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
                                        {JSON.parse(orderTrackingData.items_json).map((item, index) => (
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
                        </motion.div>
                    )}
                </motion.div>
            )}

            {!loading && !orderTrackingData && !error && (
                <motion.div
                    className="bg-gray-900 rounded-xl shadow-lg p-8 text-center border border-gray-800 max-w-2xl mx-auto"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <Info className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-white mb-3">Welcome to Order Tracking</h2>
                    <p className="text-gray-300 text-lg">
                        Enter your order number above to get real-time updates on your shipment status and delivery information.
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
};

export default TrackOrder;