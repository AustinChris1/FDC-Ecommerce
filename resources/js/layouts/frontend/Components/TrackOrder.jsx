import React, { useState } from 'react';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Helper function to format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
    }).format(amount);
};

const fetchOrderDetails = async (orderNumber) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real application, you'd make an actual API request here:
    const response = await fetch(`/api/orders/view/${orderNumber}`);
    if (!response.ok) {
        throw new Error('Order not found or an error occurred.');
    }
    const data = await response.json();
    return data;

};

const TrackOrder = () => {
    const [orderNumber, setOrderNumber] = useState('');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrackOrder = async (e) => {
        e.preventDefault();
        setError('');
        setOrder(null);
        setLoading(true);

        if (!orderNumber) {
            setError('Please enter an order number.');
            setLoading(false);
            return;
        }

        try {
            const data = await fetchOrderDetails(orderNumber);
            if (data) {
                // Parse items_json from string to array
                let parsedItems = [];
                if (typeof data.items_json === 'string' && data.items_json.length > 0) {
                    try {
                        parsedItems = JSON.parse(data.items_json);
                    } catch (parseError) {
                        console.error('Error parsing items_json:', parseError);
                        setError('Failed to process order items. Data format error.');
                        setLoading(false);
                        return; // Stop processing if parsing fails
                    }
                } else if (Array.isArray(data.items_json)) {
                    // If, by chance, it's already an array (e.g., in development or direct data access)
                    parsedItems = data.items_json;
                }

                setOrder({ ...data, items_json: parsedItems });
            } else {
                setError('Order not found. Please check the number and try again.');
            }
        } catch (err) {
            console.error('Error fetching order:', err);
            setError('Failed to fetch order details. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-6 h-6 text-yellow-500" />;
            case 'processing':
                return <Package className="w-6 h-6 text-blue-500" />;
            case 'shipped':
                return <Truck className="w-6 h-6 text-purple-500" />;
            case 'delivered':
                return <CheckCircle className="w-6 h-6 text-green-500" />;
            case 'cancelled':
                return <Clock className="w-6 h-6 text-red-500 transform rotate-180" />;
            default:
                return <Package className="w-6 h-6 text-gray-500" />;
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8 min-h-[60vh]">
            <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-gray-100 mb-8">
                Track Your Order
            </h1>

            <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 md:p-8 border border-gray-200 dark:border-gray-700">
                <form onSubmit={handleTrackOrder} className="flex flex-col sm:flex-row gap-4 mb-6">
                    <input
                        type="text"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value)}
                        placeholder="Enter your order number (e.g., ORD12345)"
                        className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 placeholder-gray-400"
                        aria-label="Order Number"
                    />
                    <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? 'Tracking...' : 'Track Order'}
                    </button>
                </form>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative mb-4"
                            role="alert"
                        >
                            <strong className="font-bold">Error:</strong>
                            <span className="block sm:inline ml-2">{error}</span>
                        </motion.div>
                    )}

                    {order && (
                        <motion.div
                            key={order.order_number}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.5 }}
                            className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center justify-between">
                                Order #{order.order_number}
                                <span className="flex items-center text-lg font-medium">
                                    {getStatusIcon(order.status)}
                                    <span className={`ml-2 ${
                                        order.status === 'delivered' ? 'text-green-600 dark:text-green-400' :
                                        order.status === 'cancelled' ? 'text-red-600 dark:text-red-400' :
                                        'text-indigo-600 dark:text-indigo-400'
                                    }`}>
                                        {order.status}
                                    </span>
                                </span>
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">
                                <span className="font-semibold">Placed On:</span> {new Date(order.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                <span className="font-semibold">Recipient:</span> {order.full_name} ({order.email})
                            </p>

                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Shipping Address:</h3>
                                <p className="text-gray-600 dark:text-gray-300">{order.shipping_address1}</p>
                                {order.shipping_address2 && <p className="text-gray-600 dark:text-gray-300">{order.shipping_address2}</p>}
                                <p className="text-gray-600 dark:text-gray-300">{order.city}, {order.state} {order.zip_code}</p>
                            </div>

                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Order Summary:</h3>
                                <ul className="space-y-2">
                                    {/* The map now operates on the parsed array */}
                                    {order.items_json && Array.isArray(order.items_json) && order.items_json.map((item, idx) => (
                                        <li key={idx} className="flex items-center justify-between text-gray-700 dark:text-gray-300">
                                            <div className="flex items-center">
                                                {/* Note: Your `items_json` doesn't include 'image', so this might be empty */}
                                                {/* You'll need to add `image` to your stored item structure if you want images to display */}
                                                {item.image && (
                                                    <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-md mr-3" />
                                                )}
                                                <span>{item.name} x {item.qty}</span>
                                            </div>
                                            {/* Parse item.price to a number before multiplication */}
                                            <span>{formatCurrency(parseFloat(item.price) * item.qty)}</span>
                                        </li>
                                    ))}
                                    {order.items_json && order.items_json.length === 0 && (
                                        <li className="text-gray-500 dark:text-gray-400">No items found for this order.</li>
                                    )}
                                </ul>
                                <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600 space-y-1">
                                    <p className="flex justify-between text-gray-700 dark:text-gray-200">
                                        <span>Subtotal:</span>
                                        <span>{formatCurrency(order.subtotal)}</span>
                                    </p>
                                    <p className="flex justify-between text-gray-700 dark:text-gray-200">
                                        <span>Shipping:</span>
                                        <span>{formatCurrency(order.shipping_cost)}</span>
                                    </p>
                                    {order.discount_amount > 0 && (
                                        <p className="flex justify-between text-red-500 font-medium">
                                            <span>Discount:</span>
                                            <span>-{formatCurrency(order.discount_amount)}</span>
                                        </p>
                                    )}
                                    <p className="flex justify-between text-lg font-bold text-gray-900 dark:text-gray-100">
                                        <span>Grand Total:</span>
                                        <span>{formatCurrency(order.grand_total)}</span>
                                    </p>
                                    <p className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                                        <span>Payment Method:</span>
                                        <span>{order.payment_method}</span>
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TrackOrder;