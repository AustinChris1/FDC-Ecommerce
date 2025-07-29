import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence, useInView } from 'framer-motion'; // Added useInView
import LoadingSpinner from '../Components/Loader'; // Assuming this component exists
import { toast } from 'react-toastify';
import { ChevronDown, SlidersHorizontal, ArrowLeft, ArrowRight, X, ShoppingCart, Eye, ShoppingBag, Loader2, Timer } from 'lucide-react'; // Added icons for better UI

// Import the StarRating component and useCart hook
import StarRating from './StarRating'; // Assuming StarRating component exists
import { useCart } from '../Components/CartContext'; // Assuming CartContext is set up

// Helper to format currency (moved here for reusability)
const formatCurrency = (amount) => {
    return `₦${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

// --- ProductCard Component (Extracted and Enhanced) ---
const ProductCard = ({ product, handleAddToCart, customDelay = 0 }) => {
    const [isHovered, setIsHovered] = useState(false); // State to track hover
    const ref = React.useRef(null);
    const inView = useInView(ref, { once: true, amount: 0.2 }); // Animate when 20% in view

    const discountPercentage = product.original_price && parseFloat(product.original_price) > parseFloat(product.selling_price)
        ? Math.round(((parseFloat(product.original_price) - parseFloat(product.selling_price)) / parseFloat(product.original_price)) * 100)
        : 0;

    // Assuming product.qty for stock and product.status for active/inactive (0 for active, 1 for inactive)
    const outOfStock = (product.quantity <= 0) || (product.status === 1); // Using product.quantity as per ViewProducts
    const limitedStock = product.quantity > 0 && product.quantity <= 5;

    return (
        <motion.div
            ref={ref} // Attach ref for useInView
            className="mx-auto w-full max-w-xs sm:max-w-sm md:max-w-md bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-lg dark:shadow-2xl group relative transform hover:scale-103 transition-transform duration-300 ease-out border border-gray-200 dark:border-transparent hover:border-blue-400 dark:hover:border-lime-600 flex flex-col"
            style={{ maxWidth: '280px', maxHeight: '400px' }} // Adjusted max-width and height for smaller cards
            variants={{
                hidden: { opacity: 0, scale: 0.9, y: 30 }, // Slightly smaller initial scale
                visible: (i) => ({
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    transition: { delay: i * 0.08 + customDelay, duration: 0.5, ease: 'easeOut' },
                }),
            }}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            custom={customDelay}
            onMouseEnter={() => setIsHovered(true)} // Set hover state to true
            onMouseLeave={() => setIsHovered(false)} // Set hover state to false
        >
            <Link to={`/collections/${product.category?.link || 'default-category'}/${product.link}`} className="block">
                <div className="relative pt-[70%] overflow-hidden">
                    {/* Primary Image */}
                    <motion.img
                        src={product.image ? `/${product.image}` : `https://placehold.co/300x210/D1D5DB/4B5563?text=${product.name.substring(0, Math.min(product.name.length, 15))}`}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-100 transition-opacity duration-500 ease-out"
                        initial={false} // Prevent initial animation on render
                        animate={{ opacity: isHovered && product.image2 ? 0 : 1 }} // Fade out primary image on hover if image2 exists
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/300x210/D1D5DB/4B5563?text=${product.name.substring(0, Math.min(product.name.length, 15))}`; }}
                    />

                    {/* Secondary Image with slide-up animation */}
                    <AnimatePresence>
                        {isHovered && product.image2 && (
                            <motion.img
                                src={`/${product.image2}`} // Assuming image2 is also local
                                alt={`${product.name} - alternate view`}
                                className="absolute inset-0 w-full h-full object-cover"
                                initial={{ y: '100%' }} // Start from bottom
                                animate={{ y: '0%' }} // Slide up to position
                                exit={{ y: '100%' }} // Slide down on exit
                                transition={{ duration: 0.4, ease: 'easeOut' }}
                            />
                        )}
                    </AnimatePresence>

                    {discountPercentage > 0 && (
                        <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-md dark:bg-green-600 dark:shadow-lg">
                            -{discountPercentage}%
                        </span>
                    )}
                    {outOfStock ? (
                        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-md dark:bg-red-600 dark:shadow-lg">
                            Out of Stock
                        </span>
                    ) : limitedStock && (
                        <span className="absolute top-3 left-3 bg-orange-400 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-md dark:bg-orange-500 dark:shadow-lg">
                            Limited Stock ({product.quantity})
                        </span>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent dark:from-black/50"></div>
                </div>
            </Link>

            <div className="p-3 flex flex-col flex-grow">
                <Link to={`/collections/${product.category?.link || 'default-category'}/${product.link}`} className="block">
                    <h3 className="text-sm font-bold mb-1 text-gray-800 group-hover:text-blue-600 dark:text-white dark:group-hover:text-lime-400 transition-colors duration-300 line-clamp-2">
                        {product.name}
                    </h3>
                    <p className="text-gray-500 mb-2 text-xs line-clamp-2 min-h-[2rem] dark:text-gray-400">
                        {product.description || 'No description available.'}
                    </p>
                    {/* Use product.average_rating if available, otherwise fallback to product.rating */}
                    {(product.average_rating !== undefined || product.rating !== undefined) && (
                        <div className="mb-2 flex items-center">
                            <StarRating rating={parseFloat(product.average_rating || product.rating || 0)} iconSize={14} /> {/* Slightly reduced icon size */}
                            {product.num_reviews !== undefined && (
                                <span className="text-gray-500 text-xs ml-1 dark:text-gray-400">({product.num_reviews})</span>
                            )}
                        </div>
                    )}
                </Link>

                <div className="mt-auto pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div>
                        {discountPercentage > 0 && (
                            <p className="text-xs text-gray-400 line-through dark:text-gray-500">
                                {formatCurrency(product.original_price)}
                            </p>
                        )}
                        <p className={`text-base font-bold ${limitedStock ? 'text-red-500 dark:text-red-400' : 'text-blue-600 dark:text-cyan-400'}`}> {/* Adjusted text size */}
                            {formatCurrency(product.selling_price)}
                        </p>
                    </div>

                    <button
                        onClick={(e) => { e.preventDefault(); handleAddToCart(product); }}
                        className={`p-2 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center text-sm
                            ${outOfStock
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-70 dark:bg-gray-700 dark:text-gray-400'
                                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-md dark:bg-lime-600 dark:hover:bg-lime-700'
                            }`}
                        disabled={outOfStock}
                        aria-label={`Add ${product.name} to cart`}
                    >
                        <ShoppingBag className="w-4 h-4" />
                    </button>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none dark:from-lime-500/10">
                </div>
            </div>
        </motion.div>
    );
};
// --- End ProductCard Component ---


const itemsPerPageOptions = [4, 8, 12, 16, 20]; // Added more options
const sortingOptions = [
    { value: 'alphaAsc', label: 'Alphabetically, A-Z' },
    { value: 'alphaDesc', label: 'Alphabetically, Z-A' },
    { value: 'featured', label: 'Featured' },
    { value: 'popular', label: 'Popular' }, // Corrected 'Popular' to 'popular' for consistency
    { value: 'priceAsc', label: 'Price, low to high' },
    { value: 'priceDesc', label: 'Price, high to low' },
    { value: 'ratingDesc', label: 'Average Rating, high to low' }, // NEW: Added rating sorting
    { value: 'dateAsc', label: 'Date, old to new' },
    { value: 'dateDesc', label: 'Date, new to old' }
];

const Store = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart(); // Destructure addToCart from useCart hook

    const [selectedCategory, setSelectedCategory] = useState('All');
    const [maxPriceFilter, setMaxPriceFilter] = useState(0); // Initialize to 0, will be updated by maxPossiblePrice
    const [maxPossiblePrice, setMaxPossiblePrice] = useState(50000); // Dynamic max for slider, based on all products

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8); // Increased default items per page
    const [sortOption, setSortOption] = useState('dateDesc'); // Changed default sort to dateDesc for 'new to old'
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar

    // Function to handle adding a product to the cart (passed to ProductCard)
    const handleAddToCartInStore = (product) => {
        // Check product stock before adding to cart
        if (product.quantity <= 0 || product.status === 1) {
            toast.error("This product is currently out of stock or unavailable.");
            return;
        }
        addToCart(product, 1);
        toast.success(`${product.name} added to cart!`);
    };

    // Effect to fetch categories and determine max possible price on initial mount
    useEffect(() => {
        document.title = `Shop | First Digits`;

        const fetchInitialData = async () => {
            try {
                // Fetch categories
                const categoryRes = await axios.get(`/api/getCategory`);
                if (categoryRes.data.status === 200) {
                    setCategories([{ name: "All", link: "all" }, ...categoryRes.data.category]);
                } else {
                    toast.error("Failed to fetch categories.");
                }

                // Fetch all products to determine the true maximum price for the slider
                const allProductsRes = await axios.get(`/api/allProducts`);
                let highestOverallPrice = 0;
                if (allProductsRes.data.status === 200 && allProductsRes.data.products.length > 0) {
                    const allPrices = allProductsRes.data.products.map(p => parseFloat(p.selling_price || 0));
                    highestOverallPrice = Math.max(...allPrices);
                }
                // Set maxPossiblePrice to be slightly higher than the highest overall product price, rounded up
                const newMax = Math.ceil((highestOverallPrice + 1000) / 1000) * 1000; // Round up to nearest 1000
                const finalMaxPossiblePrice = Math.max(newMax, 50000); // Ensure a reasonable minimum max
                setMaxPossiblePrice(finalMaxPossiblePrice);
                // Set maxPriceFilter initially to the highest possible price to show all products
                setMaxPriceFilter(finalMaxPossiblePrice);

            } catch (err) {
                console.error("Error fetching initial data (categories/max price):", err.response?.data || err.message);
                toast.error("Network error fetching initial data.");
                // Fallback to default max price if API fails
                setMaxPossiblePrice(50000);
                setMaxPriceFilter(50000);
            }
        };
        fetchInitialData();
    }, []); // Empty dependency array means this runs once on mount

    // Memoized function to fetch products based on filters and pagination
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            // Now, fetch products for the current view with filters
            const res = await axios.get(`/api/getProducts`, { // Using /api/products as per backend changes
                params: {
                    category: selectedCategory === 'All' ? null : selectedCategory, // Send null for 'All' category
                    min_price: 0, // Always send 0 for min_price with single slider
                    max_price: maxPriceFilter, // Use the single slider's value as max_price
                    sort: sortOption,
                    itemsPerPage: itemsPerPage,
                    page: currentPage,
                }
            });

            if (res.data.status === 200) {
                setProducts(res.data.products.data);
                setTotalPages(res.data.products.last_page);
            } else if (res.data.status === 404) {
                setProducts([]); // Clear products if 404
                setTotalPages(1);
                toast.info(res.data.message || "No products found for this selection.");
            } else {
                setProducts([]);
                setTotalPages(1);
                toast.error(res.data.message || "An error occurred while fetching products.");
            }
        } catch (err) {
            console.error("Error fetching products:", err.response?.data || err.message);
            setProducts([]);
            setTotalPages(1);
            toast.error('Failed to fetch products. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [selectedCategory, maxPriceFilter, sortOption, itemsPerPage, currentPage]);

    // Effect to trigger product fetch when filters or pagination change
    useEffect(() => {
        // Only fetch products if maxPossiblePrice has been determined (initial data loaded)
        if (maxPossiblePrice > 0 || maxPriceFilter > 0) { // Check if initial price data is set
            fetchProducts();
        }
    }, [fetchProducts, maxPossiblePrice]); // Dependency on fetchProducts memoized function and maxPossiblePrice

    const handleCategorySelect = (category) => {
        setSelectedCategory(category.name);
        setCurrentPage(1); // Reset to first page on category change
        setIsSidebarOpen(false); // Close sidebar on category select
    };

    // Single handler for the max price slider
    const handleMaxPriceFilterChange = (e) => {
        const value = parseInt(e.target.value, 10);
        setMaxPriceFilter(value);
        setCurrentPage(1); // Reset to first page on price change
    };

    const handleSortChange = (event) => {
        setSortOption(event.target.value);
        setCurrentPage(1); // Reset to first page on sort change
    };

    const handleItemsPerPageChange = (event) => {
        setItemsPerPage(parseInt(event.target.value, 10));
        setCurrentPage(1); // Reset to first page on items per page change
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 pt-28 px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8 dark:bg-gray-950 dark:text-gray-200">
            {/* Mobile Filter Button */}
            <button
                className="lg:hidden fixed bottom-6 right-6 z-40
                        bg-gradient-to-r from-blue-500 to-purple-600 text-white
                        dark:from-blue-600 dark:to-indigo-700
                        p-4 rounded-full shadow-lg flex items-center justify-center space-x-2 transition-all hover:scale-105"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open Filters"
            >
                <SlidersHorizontal className="w-6 h-6" />
                <span>Filters</span>
            </button>

            {/* Sidebar (Desktop and Mobile Overlay) */}
            <AnimatePresence>
                {(isSidebarOpen || window.innerWidth >= 1024) && ( // Show on desktop, or if mobile sidebar is open
                    <motion.div
                        initial={window.innerWidth < 1024 ? { x: '-100%' } : {}}
                        animate={window.innerWidth < 1024 ? { x: 0 } : {}}
                        exit={window.innerWidth < 1024 ? { x: '-100%' } : {}}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className={`fixed lg:static top-0 left-0 h-full w-72 lg:w-1/4
                                 bg-gray-100 dark:bg-gray-900 z-50 lg:z-auto p-6
                                 shadow-xl lg:shadow-none flex flex-col ${isSidebarOpen ? 'flex' : 'hidden lg:flex'}`}
                    >
                        <div className="flex justify-between items-center mb-6 lg:hidden">
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Filters</h3>
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-200
                                        dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
                                aria-label="Close Filters"
                            >
                                <X className="w-7 h-7" />
                            </button>
                        </div>

                        {/* Categories */}
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold mb-4 text-blue-600 dark:text-cyan-400">Categories</h3>
                            <ul className="space-y-3 text-lg">
                                {categories.map((category) => (
                                    <motion.li
                                        key={category.name}
                                        className={`cursor-pointer px-4 py-2 rounded-lg transition-all duration-200
                                                ${selectedCategory === category.name
                                                ? 'bg-blue-600 text-white font-semibold shadow-md dark:bg-blue-700'
                                                : 'text-gray-700 hover:bg-gray-200 hover:text-blue-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-lime-400'
                                            }`}
                                        onClick={() => handleCategorySelect(category)}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {category.name}
                                    </motion.li>
                                ))}
                            </ul>
                        </div>

                        {/* Price Range (Single Slider) */}
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold mb-4 text-blue-600 dark:text-cyan-400">Max Price</h3>
                            <div className="flex items-center space-x-3 mb-3">
                                <span className="text-gray-700 dark:text-gray-300">₦0</span>
                                <input
                                    type="range"
                                    min="0"
                                    max={maxPossiblePrice} // Dynamic max
                                    value={maxPriceFilter}
                                    onChange={handleMaxPriceFilterChange}
                                    className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600
                                            dark:bg-gray-700"
                                />
                                <span className="text-700 dark:text-gray-300">₦{maxPriceFilter.toLocaleString()}</span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Showing products up to ₦{maxPriceFilter.toLocaleString()}.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 lg:ml-8"> {/* Adjusted margin for desktop */}
                <h2 className="text-4xl font-extrabold text-center lg:text-left mb-8
                               text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-700
                               dark:text-white dark:from-blue-400 dark:to-purple-600">
                    Our Products
                </h2>

                {/* Sorting and Items per Page */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                        <label htmlFor="sort" className="text-lg font-medium text-gray-700 dark:text-gray-300">Sort by:</label>
                        <div className="relative w-full">
                            <select
                                id="sort"
                                value={sortOption}
                                onChange={handleSortChange}
                                className="block w-full px-4 py-2 pr-10
                                        text-gray-700 bg-gray-100 border border-gray-300 rounded-lg shadow-sm
                                        focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-colors duration-200 cursor-pointer
                                        dark:text-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:focus:ring-blue-600"
                            >
                                {sortingOptions.map((option) => (
                                    <option key={option.value} value={option.value}
                                        className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                        <label htmlFor="itemsPerPage" className="text-lg font-medium text-gray-700 dark:text-gray-300">Show:</label>
                        <div className="relative w-full">
                            <select
                                id="itemsPerPage"
                                value={itemsPerPage}
                                onChange={handleItemsPerPageChange}
                                className="block w-full px-4 py-2 pr-10
                                        text-gray-700 bg-gray-100 border border-gray-300 rounded-lg shadow-sm
                                        focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-colors duration-200 cursor-pointer
                                        dark:text-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:focus:ring-blue-600"
                            >
                                {itemsPerPageOptions.map((option) => (
                                    <option key={option} value={option}
                                        className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                                        {option}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: {
                            transition: {
                                staggerChildren: 0.1
                            }
                        }
                    }}
                >
                    {products.length > 0 ? (
                        products.map((product, index) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                handleAddToCart={handleAddToCartInStore} // Pass the store-level handler
                                customDelay={index * 0.05} // Stagger animation for each card
                            />
                        ))
                    ) : (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full text-center text-gray-500 text-xl py-10"
                        >
                            No products found matching your criteria.
                        </motion.p>
                    )}
                </motion.div>

                {/* Pagination Controls */}
                <div className="mt-12 flex justify-center items-center space-x-4">
                    <button
                        className="px-5 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed
                                bg-gray-200 text-gray-700 hover:bg-gray-300
                                dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Previous</span>
                    </button>

                    <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                        Page {currentPage} of {totalPages}
                    </span>

                    <button
                        className="px-5 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed
                                bg-gray-200 text-gray-700 hover:bg-gray-300
                                dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        <span>Next</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Store;
