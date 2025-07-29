import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner'; // Adjust path as needed
import {
    Store, // Icon for store
    Users, // Icon for store admins
    Package, // Icon for products
    Edit, // Icon for edit
    MapPin, // Icon for location
    UserCheck, // For assigned admin info
    AlertCircle // For error messages
} from 'lucide-react';

const StoreDashboard = () => {
    const { storeId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [storeDetails, setStoreDetails] = useState(null);
    const [storeAdmins, setStoreAdmins] = useState([]);
    const [storeProducts, setStoreProducts] = useState([]);
    const [authUserRole, setAuthUserRole] = useState(null);
    const [authUserLocationId, setAuthUserLocationId] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        document.title = `Store Dashboard - ${storeId}`;
        fetchDashboardData();
    }, [storeId]); // Re-fetch if storeId changes

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        const authToken = localStorage.getItem('auth_token');

        if (!authToken) {
            toast.error("Authentication token missing. Please log in.");
            navigate('/login');
            setLoading(false);
            return;
        }

        try {
            // First, fetch authenticated user's details for authorization
            const userRes = await axios.get('/api/user', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (userRes.data.status !== 200 || !userRes.data.user) {
                toast.error(userRes.data.message || "Failed to fetch user authentication details.");
                navigate('/admin/dashboard'); // Redirect if user details can't be fetched
                setLoading(false);
                return;
            }

            const user = userRes.data.user;
            setAuthUserRole(user.role_as);
            setAuthUserLocationId(user.location_id);

            // Authorization check:
            // Super Admin (role_as: 2) can view any store.
            // Location Admin (role_as: 1 with location_id) can only view their assigned store.
            if (user.role_as === 1 && user.location_id !== parseInt(storeId)) {
                setError("Unauthorized: You do not have permission to view this store's dashboard.");
                toast.error("You are not authorized to view this store's dashboard.");
                setLoading(false);
                return;
            }
            if (user.role_as === 0) { // Normal user
                setError("Unauthorized: You do not have permission to view admin dashboards.");
                toast.error("You are not authorized to view admin dashboards.");
                navigate('/dashboard'); // Redirect to user dashboard or home
                setLoading(false);
                return;
            }

            // Fetch all necessary data concurrently
            const [storeRes, adminsRes, productsRes] = await Promise.all([
                axios.get(`/api/admin/locations/${storeId}`, { headers: { 'Authorization': `Bearer ${authToken}` } }),
                axios.get(`/api/admin/stores/${storeId}/admins`, { headers: { 'Authorization': `Bearer ${authToken}` } }),
                axios.get(`/api/admin/stores/${storeId}/products`, { headers: { 'Authorization': `Bearer ${authToken}` } })
            ]);

            // Handle store details
            if (storeRes.data.status === 200 && storeRes.data.location) {
                setStoreDetails(storeRes.data.location);
            } else {
                toast.error(storeRes.data.message || "Failed to fetch store details.");
                setError("Failed to load store details.");
                setLoading(false);
                return;
            }

            // Handle store admins
            if (adminsRes.data.status === 200 && Array.isArray(adminsRes.data.admins)) {
                setStoreAdmins(adminsRes.data.admins);
            } else {
                toast.warn(adminsRes.data.message || "Failed to fetch store administrators.");
                setStoreAdmins([]);
            }

            // Handle store products
            if (productsRes.data.status === 200 && Array.isArray(productsRes.data.products)) {
                setStoreProducts(productsRes.data.products);
            } else {
                toast.warn(productsRes.data.message || "Failed to fetch store products.");
                setStoreProducts([]);
            }

        } catch (err) {
            console.error("Error fetching store dashboard data:", err.response?.data || err.message);
            const errorMessage = err.response?.data?.message || "An error occurred while fetching dashboard data.";
            toast.error(errorMessage);
            setError(errorMessage);
            // If it's a 403 or 404, redirect
            if (err.response?.status === 403 || err.response?.status === 404) {
                navigate('/admin/dashboard');
            }
        } finally {
            setLoading(false);
        }
    };

    // Framer Motion variants
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-100 text-gray-800 flex flex-col items-center justify-center">
                <AlertCircle className="w-20 h-20 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
                <p className="text-gray-700 mb-6">{error}</p>
                <Link
                    to="/admin/dashboard"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
                >
                    Go to Admin Dashboard
                </Link>
            </div>
        );
    }

    return (
        <motion.div
            className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-100 text-gray-800"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white rounded-xl shadow-md p-6">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 md:mb-0 flex items-center">
                    <Store className="w-8 h-8 mr-3 text-blue-600" />
                    {storeDetails ? `${storeDetails.name} Dashboard` : `Store Dashboard (ID: ${storeId})`}
                </h1>
                <Link
                    to="/admin/dashboard"
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
                >
                    Back to Admin Dashboard
                </Link>
            </header>

            {/* Store Details Section */}
            {storeDetails && (
                <motion.div
                    className="bg-white rounded-xl shadow-lg p-6 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                        <MapPin className="w-6 h-6 mr-2 text-indigo-600" /> Store Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                        <p><strong>Name:</strong> {storeDetails.name}</p>
                        <p><strong>Address:</strong> {storeDetails.address}</p>
                        <p><strong>Phone:</strong> {storeDetails.phone}</p>
                        <p><strong>Email:</strong> {storeDetails.email}</p>
                        <p><strong>Status:</strong> {storeDetails.is_active ? 'Active' : 'Inactive'}</p>
                    </div>
                </motion.div>
            )}

            {/* Store Admins Section */}
            <motion.div
                className="bg-white rounded-xl shadow-lg p-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <Users className="w-6 h-6 mr-2 text-green-600" /> Store Administrators
                </h2>
                {storeAdmins.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg overflow-hidden">
                            <thead className="bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <AnimatePresence>
                                    {storeAdmins.map(admin => (
                                        <motion.tr
                                            key={admin.id}
                                            variants={itemVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{admin.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{admin.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <Link
                                                    to={`/admin/users/edit/${admin.id}`}
                                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                                >
                                                    <Edit className="w-4 h-4 mr-2" /> Edit User
                                                </Link>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500 text-lg border border-dashed border-gray-300 rounded-lg">
                        <p>No administrators assigned to this store.</p>
                    </div>
                )}
            </motion.div>

            {/* Store Products Section */}
            <motion.div
                className="bg-white rounded-xl shadow-lg p-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <Package className="w-6 h-6 mr-2 text-orange-600" /> Store Products & Inventory
                </h2>
                {storeProducts.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg overflow-hidden">
                            <thead className="bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selling Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity in Store</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <AnimatePresence>
                                    {storeProducts.map(product => (
                                        <motion.tr
                                            key={product.id}
                                            variants={itemVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.brand || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">₦{parseFloat(product.selling_price).toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.stock_at_location}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <Link
                                                    to={`/admin/products/edit/${product.id}`}
                                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                                >
                                                    <Edit className="w-4 h-4 mr-2" /> Edit Product
                                                </Link>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500 text-lg border border-dashed border-gray-300 rounded-lg">
                        <p>No products found for this store.</p>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default StoreDashboard;
