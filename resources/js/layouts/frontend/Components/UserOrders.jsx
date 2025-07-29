import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Load from './Load'; // Assuming this is your loading spinner component
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
    User,
    RefreshCw // Added for a potential refresh button, though not implemented in this version
} from 'lucide-react';

const UserOrders = () => {
    const [loading, setLoading] = useState(true);
    const [userOrders, setUserOrders] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage] = useState(7); // Number of orders to display per page

    const userEmail = localStorage.getItem('auth_email');
    const authToken = localStorage.getItem('auth_token');

    // useCallback to memoize the fetchOrders function
    const fetchOrders = useCallback(async () => {
        if (!userEmail || !authToken) {
            toast.error("You must be logged in to view your orders.");
            setLoading(false);
            setError("Authentication required. Please log in to view your orders.");
            navigate('/login'); // Redirect to login if not authenticated
            return;
        }

        setLoading(true);
        setError(null); // Clear previous errors
        try {
            // IMPORTANT NOTE FOR OPTIMIZATION AND SECURITY:
            // Fetching ALL orders and then filtering on the client-side (as currently done)
            // is inefficient and potentially insecure if 'allOrders' contains sensitive data
            // for other users.
            //
            // RECOMMENDATION: Implement a backend endpoint like '/api/user/orders'
            // that returns ONLY the orders for the authenticated user.
            // This would significantly improve performance and security.
            const res = await axios.get('/api/allOrders', {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json' // Ensure JSON response is requested
                }
            });

            if (res.status === 200 && Array.isArray(res.data.orders)) {
                const fetchedOrders = res.data.orders;

                // Filter orders by the authenticated user's email
                // This client-side filtering should ideally be done on the backend.
                let filtered = fetchedOrders.filter(
                    order => order.email && order.email.toLowerCase() === userEmail.toLowerCase()
                );

                // Sort orders by creation date in descending order (newest first)
                filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                // Deduplicate orders based on order_number and grand_total
                // This helps in case of duplicate entries from the backend for the same order
                const uniqueOrdersMap = new Map();
                filtered.forEach(order => {
                    // Using order_number and grand_total as a composite key for uniqueness
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
                // Handle cases where status is 200 but data structure is unexpected
                toast.warn(res.data.message || "No orders found or unexpected data format.");
                setUserOrders([]); // Ensure orders are cleared
            }
        } catch (err) {
            console.error("Error fetching orders:", err.response?.data || err.message || err);
            let errorMessage = "An unexpected error occurred. Could not load orders.";
            if (err.response) {
                if (err.response.status === 401 || err.response.status === 403) {
                    errorMessage = "Authentication failed. Please log in again.";
                    navigate('/login'); // Redirect to login on auth failure
                } else {
                    errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
                }
            } else if (err.request) {
                errorMessage = "Network error. Please check your internet connection.";
            }
            toast.error(errorMessage);
            setError(errorMessage);
            setUserOrders([]); // Clear orders on error
        } finally {
            setLoading(false);
        }
    }, [userEmail, authToken, navigate]); // Dependencies for useCallback

    // useEffect to fetch orders on component mount and when fetchOrders changes
    useEffect(() => {
        document.title = "My Orders - First Digits";
        fetchOrders();
    }, [fetchOrders]);

    // Memoize pagination calculations for performance
    const { currentOrders, pageCount } = useMemo(() => {
        const offset = currentPage * itemsPerPage;
        const current = userOrders.slice(offset, offset + itemsPerPage);
        const count = Math.ceil(userOrders.length / itemsPerPage);
        return { currentOrders: current, pageCount: count };
    }, [userOrders, currentPage, itemsPerPage]);

    // Handler for page change in pagination
    const handlePageClick = (event) => {
        setCurrentPage(event.selected);
    };

    // Helper function to determine status badge color
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

    // Helper function to determine status icon
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

    // Framer Motion variants for container and table rows
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const rowVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    };

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
                                            // Adjusted classes for better light/dark mode distinction
                                            className="bg-white dark:bg-gray-900 even:bg-gray-50 dark:even:bg-gray-850 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                                            variants={rowVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="hidden"
                                            // Dynamically set hover color based on a class that determines the mode
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
                                                {order.payment_method?.replace(/_/g, ' ') || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)} flex items-center justify-center`}>
                                                    {getStatusIcon(order.status)}
                                                    {order.status?.replace(/_/g, ' ') || 'Unknown'}
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
