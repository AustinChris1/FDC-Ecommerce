import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Load from './Load';
import { toast } from 'react-toastify';
import ReactPaginate from 'react-paginate';
import {
    Heart,
    ShoppingCart,
    Package,
    Clock,
    DollarSign,
    Eye,
    Home,
    XCircle,
    CheckCircle,
    Hourglass,
    Ban,
    Truck,
    User
} from 'lucide-react';

const UserOrders = () => {
    const [loading, setLoading] = useState(true);
    const [userOrders, setUserOrders] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage] = useState(7);

    const userEmail = localStorage.getItem('auth_email');

    const fetchOrders = useCallback(async () => {
        if (!userEmail) {
            toast.error("You must be logged in to view your orders.");
            setLoading(false);
            setError("Authentication required.");
            navigate('/login');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const res = await axios.get('/api/allOrders', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                }
            });

            if (res.status === 200 && res.data.orders) {
                const fetchedOrders = res.data.orders;
                let filtered = fetchedOrders.filter(
                    order => order.email && order.email.toLowerCase() === userEmail.toLowerCase()
                );

                filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                const uniqueOrdersMap = new Map();

                filtered.forEach(order => {
                    const key = `${order.order_number}-${order.grand_total}`;
                    if (!uniqueOrdersMap.has(key)) {
                        uniqueOrdersMap.set(key, order);
                    }
                });

                const processedOrders = Array.from(uniqueOrdersMap.values());

                setUserOrders(processedOrders);
                if (processedOrders.length === 0) {
                    toast.info("No orders found for your account.");
                }
            } else {
                toast.error(res.data.message || "Failed to fetch orders.");
                setError(res.data.message || "Failed to fetch orders.");
            }
        } catch (err) {
            console.error("Error fetching orders:", err.response?.data || err);
            const errorMessage = err.response?.data?.message || "Network error or server issue. Could not load orders.";
            toast.error(errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [userEmail, navigate]);

    useEffect(() => {
        document.title = "My Orders - First Digits";
        fetchOrders();
    }, [fetchOrders]);

    const offset = currentPage * itemsPerPage;
    const currentOrders = userOrders.slice(offset, offset + itemsPerPage);
    const pageCount = Math.ceil(userOrders.length / itemsPerPage);

    const handlePageClick = (event) => {
        setCurrentPage(event.selected);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-600 text-white';
            case 'pending_delivery': return 'bg-orange-500 text-white';
            case 'pending_payment': return 'bg-yellow-500 text-gray-900';
            case 'processing': return 'bg-indigo-500 text-white';
            case 'cancelled':
            case 'payment_canceled': return 'bg-red-600 text-white';
            case 'payment_failed': return 'bg-pink-600 text-white';
            case 'shipped': return 'bg-purple-600 text-white';
            default: return 'bg-gray-600 text-white';
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
            default: return <Package className="w-4 h-4 mr-1" />;
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const rowVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
        // Light mode hover (bg-gray-200), Dark mode hover (bg-gray-800)
        hover: { backgroundColor: "var(--hover-bg-color)" }
    };

    // Use a state or context to determine the current theme if you have one
    // For this example, I'll assume you switch between light/dark classes directly.
    // You might need to adjust this if you have a theme provider.
    // For Framer Motion hover, we'll need to dynamically set the color.

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center">
                <Load />
            </div>
        );
    }

    if (error) {
        return (
            <motion.div
                className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-100 dark:bg-gray-950 text-gray-800 dark:text-gray-200 flex items-center justify-center"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center border border-gray-200 dark:border-gray-700">
                    <p className="text-red-600 dark:text-red-500 text-xl font-semibold mb-4">{error}</p>
                    <Link
                        to="/"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
                    >
                        <Home className="w-5 h-5 inline-block mr-2" /> Go to Homepage
                    </Link>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">My Orders</h1>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    <Link
                        to="/user/profile"
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-md transition-transform duration-300 transform hover:scale-105 flex items-center"
                    >
                        <User className="w-5 h-5 mr-2" />
                        View Profile
                    </Link>

                    <Link
                        to="/wishlist"
                        className="px-6 py-3 bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-semibold rounded-xl shadow-md transition-transform duration-300 transform hover:scale-105 flex items-center"
                    >
                        <Heart className="w-5 h-5 mr-2" />
                        View Wishlist
                    </Link>
                </div>
            </header>

            {userOrders.length > 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-4">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Order #
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Payment Method
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                <AnimatePresence>
                                    {currentOrders.map((order) => (
                                        <motion.tr
                                            key={order.id}
                                            className="bg-white even:bg-gray-50 dark:even:bg-gray-850 dark:odd:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                                            variants={rowVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="hidden"
                                            // Dynamically set hover color based on a class that determines the mode
                                            // For simplicity, I'm using a direct style, but you might have a global theme toggle
                                            whileHover={{ backgroundColor: document.documentElement.classList.contains('dark') ? '#2D3748' : '#F3F4F6' }}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                                                {order.order_number}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                {new Date(order.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                                                ₦{order.grand_total ? order.grand_total.toLocaleString() : '0'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                {order.payment_method.replace(/_/g, ' ') || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)} flex items-center justify-center`}>
                                                    {getStatusIcon(order.status)}
                                                    {order.status.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    to={`/user/order/${order.order_number}`}
                                                    className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors flex items-center justify-end"
                                                    title="View Order Details"
                                                >
                                                    <Eye className="w-4 h-4 mr-1" /> View
                                                </Link>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {pageCount > 1 && (
                        <div className="mt-6 flex justify-center">
                            <ReactPaginate
                                previousLabel={"Previous"}
                                nextLabel={"Next"}
                                breakLabel={"..."}
                                pageCount={pageCount}
                                marginPagesDisplayed={2}
                                pageRangeDisplayed={3}
                                onPageChange={handlePageClick}
                                containerClassName={"flex space-x-2 items-center"}
                                pageClassName={"block"}
                                // Light mode classes for pagination
                                pageLinkClassName={"block px-4 py-2 leading-tight bg-gray-200 border border-gray-300 text-gray-700 hover:bg-gray-300 hover:text-gray-900 rounded-md transition-colors duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"}
                                previousClassName={"block"}
                                previousLinkClassName={"block px-4 py-2 leading-tight bg-gray-200 border border-gray-300 text-gray-700 hover:bg-gray-300 hover:text-gray-900 rounded-md transition-colors duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"}
                                nextClassName={"block"}
                                nextLinkClassName={"block px-4 py-2 leading-tight bg-gray-200 border border-gray-300 text-gray-700 hover:bg-gray-300 hover:text-gray-900 rounded-md transition-colors duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"}
                                breakClassName={"block"}
                                breakLinkClassName={"block px-4 py-2 leading-tight bg-gray-200 border border-gray-300 text-gray-700 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"}
                                activeClassName={"!bg-blue-600 !text-white !border-blue-600"}
                                disabledClassName={"opacity-50 cursor-not-allowed"}
                            />
                        </div>
                    )}
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-10 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800"
                >
                    <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">You haven't placed any orders yet.</p>
                    <Link to="/shop" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105">
                        <ShoppingCart className="w-5 h-5 mr-2" /> Start Shopping
                    </Link>
                </motion.div>
            )}
        </motion.div>
    );
};

export default UserOrders;