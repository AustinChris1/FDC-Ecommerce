import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner'; // Ensure this is your new styled spinner
import { toast } from 'react-toastify';
import {
    Users,           // For Total Users/Customers
    ShoppingCart,    // For Total Orders
    Package,         // For Total Products
    HardDrive,       // For Total Categories
    Eye,             // View icon
    Edit,            // Edit icon
    Trash2,          // Delete icon
    UserCheck,       // Make Admin / Admin Role
    UserX,           // Revoke Admin / User Role
    Clock,           // Recent Orders/Users time
} from 'lucide-react'; // Import Lucide React icons

const Dashboard = () => {
    // Correctly initialize all summary properties to avoid 'undefined' issues
    const [summary, setSummary] = useState({
        totalUsers: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalCategories: 0,
        recentUsers: [], // Ensure recentUsers is an array
        recentOrders: [], // Ensure recentOrders is an array
    });
    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState({});
    const [adminLoading, setAdminLoading] = useState({});

    // Pagination states for users and orders
    const [currentPageUsers, setCurrentPageUsers] = useState(1);
    const [currentPageOrders, setCurrentPageOrders] = useState(1);
    const [usersPerPage] = useState(5);
    const [ordersPerPage] = useState(5);

    useEffect(() => {
        document.title = "Admin Dashboard";
        fetchDashboardData();
        // You'll also need to fetch the total counts for the widgets.
        // If these come from separate endpoints, call them here:
        fetchTotalCounts(); // Added function call for total counts
    }, []);

    const fetchDashboardData = async () => {
        // Only set loading for the tables, as total counts might be fetched separately.
        // We will manage overall loading with a combined approach.
        try {
            const usersRes = await axios.get('/api/users/view');
            const ordersRes = await axios.get('/api/allOrders');

            // Update summary state with fetched recent data
            setSummary(prev => ({
                ...prev,
                recentUsers: usersRes.data.users || [], // Ensure it's an array
                recentOrders: ordersRes.data.orders || [], // Ensure it's an array
            }));

        } catch (error) {
            console.error("Error fetching recent data:", error);
            toast.error("Failed to load recent data.");
        }
        // setLoading(false); // This will be set by the overall loading logic
    };

    const fetchTotalCounts = async () => {
        try {
            // Fetch total users
            const totalUsersRes = await axios.get('/api/users/view'); // Assuming an endpoint for total users
            // Fetch total orders
            const totalOrdersRes = await axios.get('/api/allOrders'); // Assuming an endpoint for total orders
            // Fetch total products
            const totalProductsRes = await axios.get('/api/allProducts'); // Assuming an endpoint for total products
            // Fetch total categories
            const totalCategoriesRes = await axios.get('/api/getCategory'); // Assuming an endpoint for total categories

            setSummary(prev => ({
              ...prev,
              // Calculate totals from the length of the fetched arrays
              totalUsers: totalUsersRes.data.users ? totalUsersRes.data.users.length : 0,
              totalOrders: totalOrdersRes.data.orders ? totalOrdersRes.data.orders.length : 0, // Assuming allOrdersRes.data.orders
              totalProducts: totalProductsRes.data.products ? totalProductsRes.data.products.length : 0, // Assuming allProductsRes.data.products
              totalCategories: totalCategoriesRes.data.category ? totalCategoriesRes.data.category.length : 0, // Assuming categoriesRes.data.category

              // Set recent data
              recentUsers: totalUsersRes.data.users || [],
              recentOrders: totalOrdersRes.data.orders || [],
          }));
      } catch (error) {
            console.error("Error fetching total counts:", error);
            toast.error("Failed to load summary counts.");
        } finally {
            setLoading(false); // Set overall loading to false after all fetches
        }
    };


    const toggleLoadingState = (id, setLoadingFunc) => {
        setLoadingFunc(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleAdminToggle = async (e, id, currentRole) => {
        e.preventDefault();
        toggleLoadingState(id, setAdminLoading);

        try {
            const { data } = await axios.post(`/api/users/make-admin/${id}`, {}, {
                validateStatus: (status) => status < 500,
                headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
            });

            if (data.status === 200) {
                setSummary(prev => ({
                    ...prev,
                    recentUsers: prev.recentUsers.map(user =>
                        user.id === id ? { ...user, role_as: currentRole === 1 ? 0 : 1 } : user
                    )
                }));
                toast.success(data.message);
            } else if (data.status === 403) {
                toast.error(data.message);
            } else {
                toast.error(data.message || "Failed to update user role.");
            }
        } catch (error) {
            console.error("Error updating user role:", error);
            toast.error("Failed to update user role");
        } finally {
            toggleLoadingState(id, setAdminLoading);
        }
    };

    const handleDeleteUser = async (e, id) => {
        e.preventDefault();
        toggleLoadingState(id, setDeleteLoading);

        try {
            const { data } = await axios.post(`/api/users/delete/${id}`, {}, {
                validateStatus: (status) => status < 500,
                headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
            });

            if (data.status === 200) {
                setSummary(prev => ({
                    ...prev,
                    recentUsers: prev.recentUsers.filter((user) => user.id !== id),
                    totalUsers: Math.max(0, prev.totalUsers - 1) // Ensure totalUsers doesn't go below 0
                }));
                toast.success(data.message);
            } else if (data.status === 403) {
                toast.error(data.message);
            } else {
                toast.error(data.message || "Failed to delete user.");
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error(`Failed to delete user`);
        } finally {
            toggleLoadingState(id, setDeleteLoading);
        }
    };

    // --- Pagination Logic for Users ---
    // Ensure summary.recentUsers is always an array before slicing
    const paginatedUsers = summary.recentUsers || [];
    const indexOfLastUser = currentPageUsers * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = paginatedUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPagesUsers = Math.ceil(paginatedUsers.length / usersPerPage);
    const handlePageChangeUsers = (pageNumber) => setCurrentPageUsers(pageNumber);

    // --- Pagination Logic for Orders ---
    // Ensure summary.recentOrders is always an array before slicing
    const paginatedOrders = summary.recentOrders || [];
    const indexOfLastOrder = currentPageOrders * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = paginatedOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPagesOrders = Math.ceil(paginatedOrders.length / ordersPerPage);
    const handlePageChangeOrders = (pageNumber) => setCurrentPageOrders(pageNumber);

    // Framer Motion Variants (unchanged)
    const widgetVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
        hover: { scale: 1.03, boxShadow: "0px 10px 20px rgba(0,0,0,0.15)" }
    };

    const sectionVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.08 } }
    };

    const tableRowVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
        exit: { opacity: 0, x: 20 }
    };

    const buttonVariants = {
        hover: { scale: 1.05 },
        tap: { scale: 0.95 }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <header className="mb-8">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Admin Dashboard</h1>
                <p className="text-gray-600 text-lg">Your central hub for managing your e-commerce operations.</p>
            </header>

            {/* Admin Widgets / Key Metrics */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {/* Each widget uses the summary data */}
                <motion.div
                    className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between border-l-4 border-blue-500"
                    variants={widgetVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    transition={{ delay: 0.1 }}
                >
                    <div>
                        <p className="text-sm text-gray-500 font-medium uppercase">Total Users</p>
                        <h2 className="text-3xl font-bold text-gray-900">{summary.totalUsers.toLocaleString()}</h2>
                    </div>
                    <Users className="w-10 h-10 text-blue-500 opacity-70" />
                </motion.div>

                <motion.div
                    className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between border-l-4 border-emerald-500"
                    variants={widgetVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    transition={{ delay: 0.2 }}
                >
                    <div>
                        <p className="text-sm text-gray-500 font-medium uppercase">Total Orders</p>
                        <h2 className="text-3xl font-bold text-gray-900">{summary.totalOrders.toLocaleString()}</h2>
                    </div>
                    <ShoppingCart className="w-10 h-10 text-emerald-500 opacity-70" />
                </motion.div>

                <motion.div
                    className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between border-l-4 border-orange-500"
                    variants={widgetVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    transition={{ delay: 0.3 }}
                >
                    <div>
                        <p className="text-sm text-gray-500 font-medium uppercase">Total Products</p>
                        <h2 className="text-3xl font-bold text-gray-900">{summary.totalProducts.toLocaleString()}</h2>
                    </div>
                    <Package className="w-10 h-10 text-orange-500 opacity-70" />
                </motion.div>

                <motion.div
                    className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between border-l-4 border-purple-500"
                    variants={widgetVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    transition={{ delay: 0.4 }}
                >
                    <div>
                        <p className="text-sm text-gray-500 font-medium uppercase">Total Categories</p>
                        <h2 className="text-3xl font-bold text-gray-900">{summary.totalCategories.toLocaleString()}</h2>
                    </div>
                    <HardDrive className="w-10 h-10 text-purple-500 opacity-70" />
                </motion.div>
            </section>

            {/* Recent Users and Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Users Table */}
                <motion.section
                    className="bg-white rounded-xl shadow-md p-6"
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Recent Users</h2>
                        <Link to="/admin/users/view" className="text-blue-600 hover:underline text-sm font-medium">View All Users</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <AnimatePresence>
                                    {currentUsers.length > 0 ? (
                                        currentUsers.map(user => (
                                            <motion.tr
                                                key={user.id}
                                                variants={tableRowVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role_as === 1 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {user.role_as === 0 ? "User" : "Admin"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex items-center">
                                                        <Clock className="w-4 h-4 mr-1 text-gray-400" />
                                                        {new Date(user.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center space-x-2">
                                                        <Link to={`/admin/users/edit/${user.id}`} className="text-indigo-600 hover:text-indigo-900 p-2 rounded-md hover:bg-indigo-50 transition-colors" title="Edit User">
                                                            <Edit className="w-5 h-5" />
                                                        </Link>
                                                        <motion.button
                                                            onClick={e => handleAdminToggle(e, user.id, user.role_as)}
                                                            className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50 transition-colors"
                                                            disabled={adminLoading[user.id]}
                                                            title={user.role_as === 1 ? "Demote to User" : "Promote to Admin"}
                                                            variants={buttonVariants}
                                                            whileHover="hover"
                                                            whileTap="tap"
                                                        >
                                                            {adminLoading[user.id] ? <LoadingSpinner size="sm" /> : (user.role_as === 1 ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />)}
                                                        </motion.button>
                                                        <motion.button
                                                            onClick={e => handleDeleteUser(e, user.id)}
                                                            className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 transition-colors"
                                                            disabled={deleteLoading[user.id]}
                                                            title="Delete User"
                                                            variants={buttonVariants}
                                                            whileHover="hover"
                                                            whileTap="tap"
                                                        >
                                                            {deleteLoading[user.id] ? <LoadingSpinner size="sm" /> : <Trash2 className="w-5 h-5" />}
                                                        </motion.button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full">
                                            <td colSpan="7" className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">No recent users found.</td>
                                        </motion.tr>
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                    {totalPagesUsers > 1 && (
                        <div className="mt-6 flex justify-center items-center space-x-2">
                            {Array.from({ length: totalPagesUsers }, (_, index) => (
                                <motion.button
                                    key={index + 1}
                                    onClick={() => handlePageChangeUsers(index + 1)}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${currentPageUsers === index + 1 ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                    whileHover="hover"
                                    whileTap="tap"
                                    variants={buttonVariants}
                                >
                                    {index + 1}
                                </motion.button>
                            ))}
                        </div>
                    )}
                </motion.section>

                {/* Recent Orders Table (New) */}
                <motion.section
                    className="bg-white rounded-xl shadow-md p-6"
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Recent Orders</h2>
                        <Link to="/admin/orders/" className="text-blue-600 hover:underline text-sm font-medium">View All Orders</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <AnimatePresence>
                                    {currentOrders.length > 0 ? (
                                        currentOrders.map(order => (
                                            <motion.tr
                                                key={order.id}
                                                variants={tableRowVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.order_number}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.full_name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">₦{order.grand_total.toLocaleString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        order.status === 'processing_bank_transfer_payment' ? 'bg-indigo-100 text-indigo-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {order.status.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex items-center">
                                                        <Clock className="w-4 h-4 mr-1 text-gray-400" />
                                                        {new Date(order.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link to={`/admin/orders/view/${order.order_number}`} className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50 transition-colors" title="View Order Details">
                                                        <Eye className="w-5 h-5" />
                                                    </Link>
                                                </td>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full">
                                            <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">No recent orders found.</td>
                                        </motion.tr>
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                    {totalPagesOrders > 1 && (
                        <div className="mt-6 flex justify-center items-center space-x-2">
                            {Array.from({ length: totalPagesOrders }, (_, index) => (
                                <motion.button
                                    key={index + 1}
                                    onClick={() => handlePageChangeOrders(index + 1)}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${currentPageOrders === index + 1 ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                    whileHover="hover"
                                    whileTap="tap"
                                    variants={buttonVariants}
                                >
                                    {index + 1}
                                </motion.button>
                            ))}
                        </div>
                    )}
                </motion.section>
            </div>
        </div>
    );
};

export default Dashboard;