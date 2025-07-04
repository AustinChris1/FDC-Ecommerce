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
    Boxes,          // For Total Products
    Calculator,     // For Total Quantity
    DollarSign,      // Replaced DollarSign with DollarSign
    AlertTriangle,  // For Low Stock
    Sparkles,       // For New Arrival
    Zap             // For Flash Sale
} from 'lucide-react'; // Import Lucide React icons, including DollarSign, Sparkles, and Zap

const ViewProducts = () => {
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [deleteLoading, setDeleteLoading] = useState({});
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage] = useState(6);
    const [searchTerm, setSearchTerm] = useState('');

    const lowStockThreshold = 10; // Define your low stock threshold here

    // Effect to fetch products when the component mounts
    useEffect(() => {
        document.title = "Manage Products";
        axios.get('/api/products/view')
            .then(res => {
                if (res.data.status === 200 && res.data.products) {
                    setProducts(res.data.products);
                } else {
                    toast.error(res.data.message || "Failed to fetch products.");
                }
            })
            .catch(err => {
                console.error("Error fetching products:", err);
                toast.error("Network error or server issue. Could not load products.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // Function to handle product deletion
    const deleteProducts = (e, id) => {
        e.preventDefault();
        setDeleteLoading((prev) => ({ ...prev, [id]: true }));

        axios.post(`/api/products/delete/${id}`)
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
        setCurrentPage(0);
    };

    // Filter products based on search term
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.category?.name && product.category.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Calculate products to display for the current page
    const offset = currentPage * itemsPerPage;
    const displayedProducts = filteredProducts.slice(offset, offset + itemsPerPage);

    // Dashboard Calculations (using useMemo for performance)
    const dashboardStats = useMemo(() => {
        const totalProducts = products.length;
        let totalQuantity = 0;
        let totalStockValue = 0;
        let lowStockItems = 0;
        let newArrivals = 0;
        let activeFlashSales = 0;

        const now = new Date();

        products.forEach(product => {
            const qty = parseInt(product.qty, 10) || 0; // Convert qty to an integer, default to 0
            const sellingPrice = product.selling_price || 0; // Ensure selling_price is a number, default to 0

            totalQuantity += qty;
            totalStockValue += qty * sellingPrice;

            if (qty <= lowStockThreshold) {
                lowStockItems++;
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
            totalQuantity,
            totalStockValue,
            lowStockItems,
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

                {/* Total Quantity Card */}
                <motion.div
                    className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center border border-gray-200"
                    variants={dashboardCardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.2 }}
                >
                    <Calculator className="w-10 h-10 text-green-500 mb-3" />
                    <h3 className="text-xl font-semibold text-gray-700">Total Quantity</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardStats.totalQuantity.toLocaleString()}</p>
                </motion.div>

                {/* Total Stock Value Card */}
                <motion.div
                    className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center border border-gray-200"
                    variants={dashboardCardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.3 }}
                >
                    <DollarSign className="w-10 h-10 text-purple-500 mb-3" />
                    <h3 className="text-xl font-semibold text-gray-700">Total Stock Value</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">₦{dashboardStats.totalStockValue.toLocaleString()}</p>
                </motion.div>

                {/* Low Stock Items Card */}
                <motion.div
                    className={`bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center border ${dashboardStats.lowStockItems > 0 ? 'border-red-400' : 'border-gray-200'}`}
                    variants={dashboardCardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.4 }}
                >
                    <AlertTriangle className={`w-10 h-10 mb-3 ${dashboardStats.lowStockItems > 0 ? 'text-red-500' : 'text-orange-500'}`} />
                    <h3 className="text-xl font-semibold text-gray-700">Low Stock Items</h3>
                    <p className={`text-3xl font-bold mt-2 ${dashboardStats.lowStockItems > 0 ? 'text-red-600' : 'text-gray-900'}`}>{dashboardStats.lowStockItems}</p>
                    {dashboardStats.lowStockItems > 0 && (
                        <p className="text-sm text-red-500 mt-2">Threshold: {lowStockThreshold} units</p>
                    )}
                </motion.div>

                {/* New Arrivals Card */}
                <motion.div
                    className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center border border-gray-200"
                    variants={dashboardCardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.5 }}
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
                    transition={{ delay: 0.6 }}
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
                            {displayedProducts.map((item) => (
                                <motion.div
                                    key={item.id}
                                    className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col transition-all duration-200 relative" // Added relative for absolute positioning of badges
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
                                                        ₦{item.flash_sale_price.toLocaleString()}
                                                        <span className="ml-2 text-sm text-gray-500 line-through">
                                                            ₦{item.original_price ? item.original_price.toLocaleString() : item.selling_price?.toLocaleString() || '0'}
                                                        </span>
                                                    </p>
                                                    <p className="text-xs text-orange-500 mt-1">
                                                        Flash Sale Ends: {item.flash_sale_ends_at ? new Date(item.flash_sale_ends_at).toLocaleDateString() : 'N/A'}
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="text-lg font-semibold text-emerald-600 flex items-center">
                                                    ₦{item.selling_price ? item.selling_price.toLocaleString() : '0'}
                                                    {item.original_price && item.original_price > item.selling_price && (
                                                        <span className="ml-2 text-sm text-gray-500 line-through">
                                                            ₦{item.original_price.toLocaleString()}
                                                        </span>
                                                    )}
                                                </p>
                                            )}
                                            <p className={`text-sm mt-1 flex items-center ${item.qty <= lowStockThreshold ? 'text-red-500 font-semibold' : 'text-gray-600'}`}>
                                                <Boxes className="w-4 h-4 mr-2" />
                                                Quantity: {item.qty} {item.qty <= lowStockThreshold && '(Low Stock!)'}
                                            </p>
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
                            ))}
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