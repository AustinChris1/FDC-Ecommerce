import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../LoadingSpinner'; // Assuming LoadingSpinner exists
import { toast } from 'react-toastify';
import {
    Edit,
    Trash2,
    Package,
    Tag,
    CheckCircle,
    XCircle,
    Search,
    Boxes,
    Calculator,
    DollarSign,
    AlertTriangle,
    Sparkles,
    Zap,
    MapPin, // For indicating location-based inventory
    Warehouse, // For overall stock icon
    Globe // New: For online stock icon
} from 'lucide-react';

const ViewProducts = () => {
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    // FIX: Correctly initialize deleteLoading as an empty object using useState
    const [deleteLoading, setDeleteLoading] = useState({});
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage] = useState(6);
    const [searchTerm, setSearchTerm] = useState('');

    const lowStockThreshold = 10; // Define your low stock threshold here

    // Function to calculate the total quantity for a product across all locations
    // If no locations are present or location data is not structured, it defaults to 0
    const calculateTotalProductQuantity = (product) => {
        // Check if product has a 'locations' array and it's not empty
        if (Array.isArray(product.locations) && product.locations.length > 0) {
            return product.locations.reduce((sum, location) => {
                // Safely access quantity_in_store from pivot, default to 0 if undefined/null
                const qty = parseInt(location.pivot?.quantity_in_store, 10);
                return sum + (isNaN(qty) ? 0 : qty); // Add 0 if parsing results in NaN
            }, 0);
        }
        // If no location-specific inventory, return 0 for this calculation
        return 0;
    };

    // Effect to fetch products when the component mounts
    useEffect(() => {
        document.title = "Manage Products";
        axios.get('/api/products/view', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` } // Ensure auth token is sent
        })
            .then(res => {
                if (res.data.status === 200 && Array.isArray(res.data.products)) { // Ensure products is an array
                    setProducts(res.data.products);
                } else {
                    toast.error(res.data.message || "Failed to fetch products or data format is incorrect.");
                    setProducts([]); // Ensure products is always an array
                }
            })
            .catch(err => {
                console.error("Error fetching products:", err);
                toast.error("Network error or server issue. Could not load products.");
                setProducts([]); // Ensure products is always an array on error
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // Function to handle product deletion
    const deleteProducts = (e, id) => {
        e.preventDefault();
        setDeleteLoading((prev) => ({ ...prev, [id]: true }));

        axios.post(`/api/products/delete/${id}`, {}, { // Empty data object, but needed for POST
            headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
        })
            .then(res => {
                if (res.data.status === 200) {
                    setProducts(prevProducts => prevProducts.filter(item => item.id !== id));
                    toast.success(res.data.message);
                } else if (res.data.status === 404) {
                    toast.error(res.data.message);
                } else {
                    toast.error(res.data.message || "Failed to delete product.");
                }
            })
            .catch(err => {
                console.error("Error deleting product:", err);
                toast.error(`Failed to delete product: ${err.message || "Network error"}`);
            })
            .finally(() => {
                setDeleteLoading((prev) => ({ ...prev, [id]: false }));
            });
    };

    // Handler for page click in pagination
    const handlePageClick = (data) => {
        setCurrentPage(data.selected);
    };

    // Handler for search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(0); // Reset to first page on new search
    };

    // Filter products based on search term (using useMemo for performance)
    const filteredProducts = useMemo(() => {
        return products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) || // Check if brand exists
            (product.category?.name && product.category.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [products, searchTerm]);

    // Calculate products to display for the current page
    const offset = currentPage * itemsPerPage;
    const displayedProducts = filteredProducts.slice(offset, offset + itemsPerPage);

    // Dashboard Calculations (using useMemo for performance)
    const dashboardStats = useMemo(() => {
        const totalProducts = products.length;
        let totalAggregatedStock = 0; // Sum of stock across all locations
        let totalOnlineStock = 0; // Sum of product.quantity (global/online stock)
        let totalStockValue = 0;
        let lowAggregatedStockItems = 0; // Low stock based on aggregated quantity
        let lowOnlineStockItems = 0; // Low stock based on product.quantity
        let newArrivals = 0;
        let activeFlashSales = 0;

        const now = new Date();

        products.forEach(product => {
            const aggregatedQty = calculateTotalProductQuantity(product); // Sum of location quantities
            const onlineQty = parseInt(product.qty, 10) || 0; // Global/online quantity

            const sellingPrice = parseFloat(product.selling_price) || 0; // Ensure selling_price is a number, default to 0

            totalAggregatedStock += aggregatedQty;
            totalOnlineStock += onlineQty;

            // For total stock value, sum the value of both aggregated and online stock
            totalStockValue += (aggregatedQty + onlineQty) * sellingPrice;

            if (aggregatedQty <= lowStockThreshold) {
                lowAggregatedStockItems++;
            }
            if (onlineQty <= lowStockThreshold) {
                lowOnlineStockItems++;
            }

            if (product.is_new_arrival) {
                newArrivals++;
            }

            if (product.is_flash_sale && product.flash_sale_starts_at && product.flash_sale_ends_at) {
                const startsAt = new Date(product.flash_sale_starts_at);
                const endsAt = new Date(product.flash_sale_ends_at);
                if (now >= startsAt && now <= endsAt) {
                    activeFlashSales++;
                }
            }
        });

        return {
            totalProducts,
            totalAggregatedStock,
            totalOnlineStock, // New stat
            totalStockValue,
            lowAggregatedStockItems, // Renamed
            lowOnlineStockItems, // New stat
            newArrivals,
            activeFlashSales,
        };
    }, [products, lowStockThreshold]);
    // End Dashboard Calculations


    if (loading) {
        return <LoadingSpinner />;
    }

    // Framer Motion variants for main container entry
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    // Framer Motion variants for individual product cards
    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
        exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
        hover: { scale: 1.02, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }
    };

    // Framer Motion variants for dashboard cards
    const dashboardCardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", delay: 0.2 } },
    };

    return (
        <motion.div
            className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-100 text-gray-800"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header section with title and Add Product button */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 bg-white rounded-xl shadow-md p-6">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 sm:mb-0">Products Management</h1>
                <Link
                    to="/admin/products"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
                >
                    Add Product
                </Link>
            </header>

            {/* Dashboard Section */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6 mt-8">Inventory Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Products Card */}
                <motion.div
                    className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center border border-gray-200"
                    variants={dashboardCardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.1 }}
                >
                    <Boxes className="w-10 h-10 text-blue-500 mb-3" />
                    <h3 className="text-xl font-semibold text-gray-700">Total Products</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardStats.totalProducts}</p>
                </motion.div>

                {/* Total Aggregated Stock Card */}
                <motion.div
                    className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center border border-gray-200"
                    variants={dashboardCardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.2 }}
                >
                    <Warehouse className="w-10 h-10 text-green-500 mb-3" />
                    <h3 className="text-xl font-semibold text-gray-700">Total Physical Stock</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardStats.totalAggregatedStock.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">Sum across all locations</p>
                </motion.div>

                {/* Total Online Stock Card (New) */}
                <motion.div
                    className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center border border-gray-200"
                    variants={dashboardCardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.3 }}
                >
                    <Globe className="w-10 h-10 text-indigo-500 mb-3" />
                    <h3 className="text-xl font-semibold text-gray-700">Total Online Stock</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardStats.totalOnlineStock.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">Global product quantity</p>
                </motion.div>

                {/* Total Stock Value Card */}
                <motion.div
                    className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center border border-gray-200"
                    variants={dashboardCardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.4 }}
                >
                    <DollarSign className="w-10 h-10 text-emerald-500 mb-3" />
                    <h3 className="text-xl font-semibold text-gray-700">Total Stock Value</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">₦{dashboardStats.totalStockValue.toLocaleString()}</p>
                </motion.div>

                {/* Low Physical Stock Items Card (Renamed) */}
                <motion.div
                    className={`bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center border ${dashboardStats.lowAggregatedStockItems > 0 ? 'border-red-400' : 'border-gray-200'}`}
                    variants={dashboardCardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.5 }}
                >
                    <AlertTriangle className={`w-10 h-10 mb-3 ${dashboardStats.lowAggregatedStockItems > 0 ? 'text-red-500' : 'text-orange-500'}`} />
                    <h3 className="text-xl font-semibold text-gray-700">Low Physical Stock</h3>
                    <p className={`text-3xl font-bold mt-2 ${dashboardStats.lowAggregatedStockItems > 0 ? 'text-red-600' : 'text-gray-900'}`}>{dashboardStats.lowAggregatedStockItems}</p>
                    {dashboardStats.lowAggregatedStockItems > 0 && (
                        <p className="text-sm text-red-500 mt-2">Threshold: {lowStockThreshold} units</p>
                    )}
                </motion.div>

                {/* Low Online Stock Items Card (New) */}
                <motion.div
                    className={`bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center border ${dashboardStats.lowOnlineStockItems > 0 ? 'border-red-400' : 'border-gray-200'}`}
                    variants={dashboardCardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.6 }}
                >
                    <AlertTriangle className={`w-10 h-10 mb-3 ${dashboardStats.lowOnlineStockItems > 0 ? 'text-red-500' : 'text-orange-500'}`} />
                    <h3 className="text-xl font-semibold text-gray-700">Low Online Stock</h3>
                    <p className={`text-3xl font-bold mt-2 ${dashboardStats.lowOnlineStockItems > 0 ? 'text-red-600' : 'text-gray-900'}`}>{dashboardStats.lowOnlineStockItems}</p>
                    {dashboardStats.lowOnlineStockItems > 0 && (
                        <p className="text-sm text-red-500 mt-2">Threshold: {lowStockThreshold} units</p>
                    )}
                </motion.div>

                {/* New Arrivals Card */}
                <motion.div
                    className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center border border-gray-200"
                    variants={dashboardCardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.7 }}
                >
                    <Sparkles className="w-10 h-10 text-yellow-500 mb-3" />
                    <h3 className="text-xl font-semibold text-gray-700">New Arrivals</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardStats.newArrivals}</p>
                </motion.div>

                {/* Active Flash Sales Card */}
                <motion.div
                    className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center border border-gray-200"
                    variants={dashboardCardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.8 }}
                >
                    <Zap className="w-10 h-10 text-orange-500 mb-3" />
                    <h3 className="text-xl font-semibold text-gray-700">Active Flash Sales</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardStats.activeFlashSales}</p>
                </motion.div>
            </div>


            {/* Search Bar */}
            <div className="relative mb-8 bg-white rounded-xl shadow-md p-4">
                <input
                    type="text"
                    placeholder="Search products by name, brand, or category..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            {/* Main content area for product cards */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                {displayedProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {displayedProducts.map((item) => {
                                // Define hasLocationInventory first
                                const hasLocationInventory = Array.isArray(item.locations) && item.locations.length > 0;

                                const totalAggregatedStock = calculateTotalProductQuantity(item); // Sum of location quantities
                                const totalOnlineStock = parseInt(item.quantity, 10) || 0; // Global/online quantity

                                // Determine which stock to display for the card, prioritize aggregated if available
                                const displayStock = hasLocationInventory ? totalAggregatedStock : totalOnlineStock;
                                // Determine which stock to use for low stock warning on the card
                                const lowStockCheck = hasLocationInventory ? totalAggregatedStock : totalOnlineStock;


                                return (
                                    <motion.div
                                        key={item.id}
                                        className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col transition-all duration-200 relative"
                                        variants={cardVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        whileHover="hover"
                                    >
                                        {/* Badges for New Arrival and Flash Sale */}
                                        {(item.is_new_arrival || item.is_flash_sale) && (
                                            <div className="absolute top-2 right-2 flex space-x-2 z-10">
                                                {item.is_new_arrival && (
                                                    <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                                                        <Sparkles className="w-3 h-3 mr-1" /> New
                                                    </span>
                                                )}
                                                {item.is_flash_sale && (
                                                    <span className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                                                        <Zap className="w-3 h-3 mr-1" /> Flash Sale
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Product Image */}
                                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                                            <img
                                                src={item.image ? `/${item.image}` : `https://placehold.co/400x240/e0e0e0/555555?text=Product+Image`}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x240/e0e0e0/555555?text=Product+Image`; }}
                                            />
                                        </div>

                                        {/* Card Content */}
                                        <div className="p-4 flex-grow">
                                            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                                                <Package className="w-5 h-5 mr-2 text-blue-500" />
                                                {item.name}
                                            </h3>
                                            <p className="text-gray-600 mb-2 flex items-center">
                                                <Tag className="w-4 h-4 mr-2 text-gray-400" />
                                                <span className="truncate">{item.category?.name || 'N/A'}</span>
                                            </p>

                                            {/* Prices & Quantity */}
                                            <div className="mb-2">
                                                {item.is_flash_sale && item.flash_sale_price ? (
                                                    <>
                                                        <p className="text-lg font-semibold text-purple-600 flex items-center">
                                                            ₦{parseFloat(item.flash_sale_price).toLocaleString()}
                                                            <span className="ml-2 text-sm text-gray-500 line-through">
                                                                ₦{parseFloat(item.original_price || item.selling_price || 0).toLocaleString()}
                                                            </span>
                                                        </p>
                                                        <p className="text-xs text-orange-500 mt-1">
                                                            Flash Sale Ends: {item.flash_sale_ends_at ? new Date(item.flash_sale_ends_at).toLocaleDateString() : 'N/A'}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <p className="text-lg font-semibold text-emerald-600 flex items-center">
                                                        ₦{parseFloat(item.selling_price || 0).toLocaleString()}
                                                        {item.original_price && parseFloat(item.original_price) > parseFloat(item.selling_price || 0) && (
                                                            <span className="ml-2 text-sm text-gray-500 line-through">
                                                                ₦{parseFloat(item.original_price).toLocaleString()}
                                                            </span>
                                                        )}
                                                    </p>
                                                )}
                                                <p className={`text-sm mt-1 flex items-center ${lowStockCheck <= lowStockThreshold ? 'text-red-500 font-semibold' : 'text-gray-600'}`}>
                                                    <Boxes className="w-4 h-4 mr-2" />
                                                    Stock: {displayStock} {lowStockCheck <= lowStockThreshold && '(Low Stock!)'}
                                                    {hasLocationInventory ? (
                                                        <MapPin className="w-4 h-4 ml-2 text-indigo-500" title="Inventory managed by locations" />
                                                    ) : (
                                                        <Globe className="w-4 h-4 ml-2 text-gray-500" title="Global online quantity" />
                                                    )}
                                                </p>
                                                {hasLocationInventory && totalOnlineStock > 0 && (
                                                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                                                        <Globe className="w-3 h-3 mr-1" />
                                                        Online Qty: {totalOnlineStock}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Status Badge */}
                                            <div className="mb-4">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {item.status === 0 ? (
                                                        <span className="flex items-center">
                                                            <CheckCircle className="w-3 h-3 mr-1" /> Active
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center">
                                                            <XCircle className="w-3 h-3 mr-1" /> Hidden
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Card Actions */}
                                        <div className="p-4 border-t border-gray-100 flex justify-end space-x-2 bg-gray-50">
                                            <Link
                                                to={`/admin/products/edit/${item.id}`}
                                                className="px-4 py-2 rounded-md text-blue-600 hover:bg-blue-100 hover:text-blue-800 transition-colors duration-200 flex items-center"
                                                title="Edit Product"
                                            >
                                                <Edit className="w-4 h-4 mr-1" /> Edit
                                            </Link>
                                            <button
                                                onClick={(e) => deleteProducts(e, item.id)}
                                                className="px-4 py-2 rounded-md text-red-600 hover:bg-red-100 hover:text-red-800 transition-colors duration-200 flex items-center"
                                                disabled={deleteLoading[item.id]}
                                                title="Delete Product"
                                            >
                                                {deleteLoading[item.id] ? (
                                                    <LoadingSpinner size="sm" />
                                                ) : (
                                                    <>
                                                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-10 text-gray-500 text-lg"
                    >
                        {searchTerm ? `No products found matching "${searchTerm}".` : "No products found. Add a new product to get started!"}
                    </motion.div>
                )}

                {/* Pagination */}
                {filteredProducts.length > itemsPerPage && (
                    <div className="mt-8 flex justify-center">
                        <ReactPaginate
                            previousLabel={"«"}
                            nextLabel={"»"}
                            breakLabel={"..."}
                            pageCount={Math.ceil(filteredProducts.length / itemsPerPage)}
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

export default ViewProducts;
