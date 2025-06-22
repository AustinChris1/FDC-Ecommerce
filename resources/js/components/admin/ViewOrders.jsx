import React, { useState, useEffect, useMemo } from 'react'; // Import useMemo
import { Link } from 'react-router-dom';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';
import { toast } from 'react-toastify';
import {
    ShoppingCart,
    User,
    CheckCircle,
    Clock,
    XCircle,
    Eye,
    Search,
    Package,
    Hourglass, // For processing
    Loader, // For pending_payment_gateway_confirmation
    Ban, // For payment_failed or canceled
    Truck, // For shipped
    DollarSign // For paid orders total
} from 'lucide-react'; // Import additional Lucide React icons

const ViewOrders = () => {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage] = useState(6);
    const [searchTerm, setSearchTerm] = useState('');

    // State for dashboard counts
    const [statusCounts, setStatusCounts] = useState({
        total: 0,
        completed: 0,
        pending: 0, // This could be 'pending_payment', 'pending_delivery', etc.
        processing: 0, // General processing, could include 'processing_paystack_payment', 'pending_bank_transfer_verification'
        cancelled: 0,
        failed: 0, // payment_failed or similar
        shipped: 0,
        totalRevenue: 0, // Sum of grand_total for completed orders
    });

    // Effect to fetch orders when the component mounts
    useEffect(() => {
        document.title = "Manage Orders";
        axios.get('/api/allOrders', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`, // Ensure auth header is sent
            }
        })
            .then(res => {
                if (res.status === 200 && res.data.orders) {
                    setOrders(res.data.orders);
                } else {
                    toast.error(res.data.message || "Failed to fetch orders.");
                }
            })
            .catch(err => {
                console.error("Error fetching orders:", err);
                toast.error("Network error or server issue. Could not load orders.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // Memoized calculation of status counts whenever 'orders' changes
    useMemo(() => {
        const counts = {
            total: orders.length,
            completed: 0,
            pending: 0,
            processing: 0,
            cancelled: 0,
            failed: 0,
            shipped: 0,
            totalRevenue: 0,
        };

        orders.forEach(order => {
            const status = order.status;
            switch (status) {
                case 'completed':
                    counts.completed++;
                    counts.totalRevenue += parseFloat(order.grand_total || 0);
                    break;
                case 'pending_payment':
                case 'pending_delivery':
                case 'pending_confirmation':
                    counts.pending++;
                    break;
                case 'processing_paystack_payment':
                    case 'pending_bank_transfer_payment':
                        counts.processing++;
                    break;
                case 'cancelled':
                case 'payment_canceled':
                    counts.cancelled++;
                    break;
                case 'payment_failed':
                    counts.failed++;
                    break;
                case 'shipped':
                    counts.shipped++;
                    counts.completed++; // Shipped orders are also completed from a payment perspective
                    counts.totalRevenue += parseFloat(order.grand_total || 0);
                    break;
                default:
                    // Fallback for any other status you might have
                    // Consider logging unknown statuses if they appear unexpectedly
                    break;
            }
        });
        setStatusCounts(counts);
    }, [orders]); // Recalculate whenever the 'orders' array changes

    const handlePageClick = (data) => {
        setCurrentPage(data.selected);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(0);
    };

    const filteredOrders = orders.filter(order =>
        order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const offset = currentPage * itemsPerPage;
    const displayedOrders = filteredOrders.slice(offset, offset + itemsPerPage);

    if (loading) {
        return <LoadingSpinner />;
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
        exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
        hover: { scale: 1.02, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }
    };

    // Dashboard Card component for reusability and styling
    const DashboardCard = ({ title, count, icon: Icon, colorClass, isCurrency = false }) => (
        <motion.div
            className={`flex flex-col items-center justify-center p-6 rounded-xl shadow-md text-gray-600 border-l-4 ${colorClass}`}
            whileHover={{ scale: 1.05, boxShadow: "0px 12px 24px rgba(0,0,0,0.2)" }}
            transition={{ duration: 0.2 }}
        >
            <Icon className="w-12 h-12 mb-3" />
            <h3 className="text-xl font-semibold mb-1">{title}</h3>
            <p className="text-4xl font-bold">
                {isCurrency ? `₦${count.toLocaleString('en-GB')}` : count}
            </p>
        </motion.div>
    );

    return (
        <motion.div
            className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-100 text-gray-800"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 bg-white rounded-xl shadow-md p-6">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 sm:mb-0">Orders Management</h1>
            </header>

            {/* --- Dashboard Summary --- */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6 mt-4">Order Summary Dashboard</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-10">
                <DashboardCard
                    title="Total Orders"
                    count={statusCounts.total}
                    icon={ShoppingCart}
                    colorClass="border-blue-500"
                />
                <DashboardCard
                    title="Completed Orders"
                    count={statusCounts.completed}
                    icon={CheckCircle}
                    colorClass="border-green-600"
                />
                <DashboardCard
                    title="Pending Orders"
                    count={statusCounts.pending}
                    icon={Clock}
                    colorClass="border-yellow-600"
                />
                <DashboardCard
                    title="Processing Payments"
                    count={statusCounts.processing}
                    icon={Hourglass}
                    colorClass="border-indigo-600"
                />
                <DashboardCard
                    title="Cancelled/Failed"
                    count={statusCounts.cancelled + statusCounts.failed} // Combined for simplicity
                    icon={XCircle}
                    colorClass="border-red-600"
                />
                {/* Add more specific cards if you have more detailed status types */}
                {/* Example:
                <DashboardCard
                    title="Shipped Orders"
                    count={statusCounts.shipped}
                    icon={Truck}
                    colorClass="bg-purple-600"
                />
                <DashboardCard
                    title="Total Revenue"
                    count={statusCounts.totalRevenue}
                    icon={DollarSign}
                    colorClass="bg-emerald-600"
                    isCurrency={true}
                />
                */}
            </div>
            {/* --- End Dashboard Summary --- */}

            <div className="relative mb-8 bg-white rounded-xl shadow-md p-4">
                <input
                    type="text"
                    placeholder="Search orders by number, customer, or status..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
                {filteredOrders.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {displayedOrders.map((order) => (
                                <motion.div
                                    key={order.id}
                                    className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col transition-all duration-200"
                                    variants={cardVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    whileHover="hover"
                                >
                                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                            <ShoppingCart className="w-5 h-5 mr-2 text-blue-500" />
                                            Order #{order.order_number}
                                        </h3>
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            order.status === 'pending_delivery' ? 'bg-orange-100 text-orange-800' :
                                            order.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-800' :
                                            order.status === 'processing_bank_transfer_verification' || order.status === 'processing_paystack_payment' ? 'bg-indigo-100 text-indigo-800' :
                                            order.status === 'cancelled' || order.status === 'payment_canceled' ? 'bg-red-100 text-red-800' :
                                            order.status === 'payment_failed' ? 'bg-pink-100 text-pink-800' : // Distinct color for failed
                                            order.status === 'shipped' ? 'bg-purple-100 text-purple-800' : // Distinct color for shipped
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {order.status.replace(/_/g, ' ')}
                                        </span>
                                    </div>

                                    <div className="p-4 flex-grow">
                                        <p className="text-gray-700 mb-2 flex items-center">
                                            <User className="w-4 h-4 mr-2 text-gray-500" />
                                            Customer: {order.full_name || 'N/A'}
                                        </p>
                                        <p className="text-lg font-semibold text-emerald-600 mb-2 flex items-center">
                                            Total: ₦{order.grand_total ? order.grand_total.toLocaleString() : '0'}
                                        </p>
                                        <p className="text-sm text-gray-500 flex items-center">
                                            <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                            Order Date: {new Date(order.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                                        </p>
                                    </div>

                                    <div className="p-4 border-t border-gray-100 flex justify-end space-x-2 bg-gray-50">
                                        <Link
                                            to={`/admin/orders/view/${order.order_number}`}
                                            className="px-4 py-2 rounded-md text-blue-600 hover:bg-blue-100 hover:text-blue-800 transition-colors duration-200 flex items-center"
                                            title="View Order Details"
                                        >
                                            <Eye className="w-4 h-4 mr-1" /> View Details
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-10 text-gray-500 text-lg"
                    >
                        {searchTerm ? `No orders found matching "${searchTerm}".` : "No orders found. Add new orders to get started!"}
                    </motion.div>
                )}

                {filteredOrders.length > itemsPerPage && (
                    <div className="mt-8 flex justify-center">
                        <ReactPaginate
                            previousLabel={"«"}
                            nextLabel={"»"}
                            breakLabel={"..."}
                            pageCount={Math.ceil(filteredOrders.length / itemsPerPage)}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={3}
                            onPageChange={handlePageClick}
                            containerClassName={"flex space-x-1 items-center"}
                            pageClassName={"block"}
                            pageLinkClassName={"block px-4 py-2 leading-tight bg-white border border-gray-300 text-gray-700 hover:bg-gray-200 hover:text-gray-900 rounded-lg transition-colors duration-200"}
                            previousClassName={"block"}
                            previousLinkClassName={"block px-4 py-2 leading-tight bg-white border border-gray-300 text-gray-700 hover:bg-gray-200 hover:text-gray-900 rounded-lg transition-colors duration-200"}
                            nextClassName={"block"}
                            nextLinkClassName={"block px-4 py-2 leading-tight bg-white border border-gray-300 text-gray-700 hover:bg-gray-200 hover:text-gray-900 rounded-lg transition-colors duration-200"}
                            breakClassName={"block"}
                            breakLinkClassName={"block px-4 py-2 leading-tight bg-white border border-gray-300 text-gray-700 rounded-lg"}
                            activeClassName={"!bg-blue-600 !text-white !border-blue-600 hover:!bg-blue-700"}
                            disabledClassName={"opacity-50 cursor-not-allowed"}
                        />
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ViewOrders;