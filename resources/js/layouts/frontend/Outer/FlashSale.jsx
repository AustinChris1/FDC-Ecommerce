import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingSpinner from '../Components/Loader';
import { ShoppingCart, Star, ArrowRight, Zap, Clock } from 'lucide-react'; // Added Clock for timer icon
import { useCart } from '../Components/CartContext';
import CountdownTimer from '../Components/hooks/CountdownTimer'; // Import the new CountdownTimer component
import StarRating from './StarRating'; // Assuming this path is correct
import { Helmet } from 'react-helmet-async'; // Import Helmet

const FlashSale = () => {
    const [flashSaleProducts, setFlashSaleProducts] = useState([]); // Renamed for clarity
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addToCart } = useCart(); // Destructure addToCart from useCart

    useEffect(() => {
        const fetchFlashSaleProducts = async () => { // Renamed function for clarity
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get('/api/allProducts'); // Adjust API endpoint as needed

                if (response.data.status === 200 && response.data.products) {
                    const now = new Date(); // Current time for comparison
                    const activeFlashSales = response.data.products
                        .filter(product => {
                            // Ensure product has flash sale specific properties
                            if (product.is_flash_sale === true &&
                                product.flash_sale_price !== null &&
                                product.flash_sale_starts_at &&
                                product.flash_sale_ends_at) {

                                const startsAt = new Date(product.flash_sale_starts_at);
                                const endsAt = new Date(product.flash_sale_ends_at);

                                // Check if the current time is within the flash sale period
                                return now >= startsAt && now <= endsAt;
                            }
                            return false; // Not a flash sale product or not currently active
                        })
                        .sort((a, b) => new Date(a.flash_sale_ends_at) - new Date(b.flash_sale_ends_at)) // Sort by end time
                        .slice(0, 8); // Limit to top 8 active flash sale products

                    setFlashSaleProducts(activeFlashSales);
                } else {
                    toast.error(response.data.message || 'Unable to fetch flash sale products.');
                    setError('Failed to load flash sale products.');
                }
            } catch (err) {
                console.error("Error fetching flash sale products:", err);
                toast.error('Something went wrong fetching flash sale data.');
                setError('Could not load flash sale products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchFlashSaleProducts();

        // Optional: Refresh flash sales periodically if they are very short-lived,
        // but for typical flash sales, a single fetch on mount is usually sufficient.
        // const interval = setInterval(fetchFlashSaleProducts, 60000); // Fetch every minute
        // return () => clearInterval(interval);

    }, []); // Empty dependency array means this runs once on mount

    // Framer Motion Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 50, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
    };

    const cardHoverVariants = {
        hover: {
            scale: 1.03, // Slightly less aggressive scale
            boxShadow: "0px 15px 35px rgba(0, 0, 0, 0.6)", // Deeper shadow
            y: -5, // Slight lift
            transition: { duration: 0.3, ease: 'easeOut' },
        },
        tap: { scale: 0.98 },
    };

    const imageHoverVariants = {
        hover: {
            scale: 1.1, // Subtle zoom on image
            transition: { duration: 0.4, ease: 'easeOut' },
        },
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center
                            bg-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:via-black dark:to-gray-900">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <motion.section
            className="min-h-screen py-28 px-4 sm:px-6 lg:px-8
                       bg-gray-100 text-gray-900
                       dark:bg-gradient-to-br dark:from-gray-900 dark:via-black dark:to-gray-900 dark:text-gray-200"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <Helmet>
                <title>Flash Sales - FirstSmart Mart</title>
                <meta name="description" content="Discover limited-time flash sales and grab amazing deals on your favorite products at FirstSmart Mart." />
            </Helmet>

            <div className="container mx-auto max-w-7xl">
                <motion.div className="text-center mb-16" variants={itemVariants}>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight drop-shadow-lg
                                   text-gray-800 dark:text-orange-400 flex items-center justify-center gap-4">
                        <Zap className="w-12 h-12 text-orange-500" />
                        Flash Sales
                        <Zap className="w-12 h-12 text-orange-500 rotate-180" />
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto dark:text-gray-400">
                        Grab these limited-time deals before they're gone! Unbeatable prices on hot products.
                    </p>
                </motion.div>

                {error ? (
                    <div className="text-center py-20">
                        <h3 className="text-3xl font-bold text-red-600 dark:text-red-500 mb-4">Error</h3>
                        <p className="text-xl text-gray-600 dark:text-gray-400">{error}</p>
                    </div>
                ) : flashSaleProducts.length === 0 ? ( // Use flashSaleProducts here
                    <motion.div
                        className="text-center py-20"
                        initial="hidden"
                        animate="visible"
                        variants={itemVariants}
                    >
                        <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">No Active Flash Sales Right Now</h3>
                        <p className="text-xl text-gray-600 dark:text-gray-400">
                            Our extraordinary flash sales appear and disappear quickly. Check back soon for more incredible deals!
                        </p>
                        <Link to="/shop" className="mt-8 inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-full transition-colors transform hover:scale-105 shadow-lg">
                            Browse All Products
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        <AnimatePresence>
                            {flashSaleProducts.map((product) => { // Use flashSaleProducts here
                                const handleAddToCart = (e) => {
                                    e.preventDefault(); // Prevent default link behavior
                                    e.stopPropagation(); // Stop event bubbling

                                    // Check product status and quantity more robustly
                                    if (product.status === 1 || product.qty <= 0) {
                                        toast.error("This product is currently out of stock or unavailable.");
                                        return;
                                    }

                                    // Add to cart with flash_sale_price if active, else selling_price
                                    const priceToAdd = product.is_flash_sale === true &&
                                        new Date() >= new Date(product.flash_sale_starts_at) &&
                                        new Date() <= new Date(product.flash_sale_ends_at)
                                        ? product.flash_sale_price : product.selling_price;

                                    addToCart({ ...product, price: priceToAdd }, 1); // Pass product with correct price
                                };

                                return (
                                    <motion.div
                                        key={product.id}
                                        className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer border border-gray-200 relative group
                                                   dark:bg-gray-800 dark:shadow-xl dark:border-gray-700"
                                        variants={cardHoverVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                        initial="hidden" // Add initial to individual items for stagger effect
                                        animate="visible" // Add animate to individual items for stagger effect
                                        exit="hidden" // Add exit for AnimatePresence fade out
                                    >
                                        {/* Flash Sale Badge */}
                                        <motion.div
                                            className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase z-10 flex items-center shadow-md"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2, duration: 0.3 }}
                                        >
                                            <Zap className="w-4 h-4 mr-1" /> FLASH SALE
                                        </motion.div>

                                        <Link to={`/collections/${product.category?.link}/${product.link}`} className="block">
                                            <motion.div className="overflow-hidden"> {/* Added a div for image overflow */}
                                                <motion.img
                                                    src={`/${product.image}`}
                                                    alt={product.name}
                                                    className="w-full h-64 object-cover transform transition-transform duration-300"
                                                    variants={imageHoverVariants}
                                                    initial={false}
                                                    whileHover="hover"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300/cccccc/000000?text=Image+Error'; }} // Fallback image
                                                />
                                            </motion.div>
                                            <div className="p-6 bg-white dark:bg-gray-900">
                                                <h3 className="text-xl font-bold text-gray-800 mb-2 truncate dark:text-white">{product.name}</h3>
                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2 dark:text-gray-400">{product.description}</p>

                                                {/* Price Display */}
                                                <div className="flex items-baseline mb-2">
                                                    <span className="text-orange-600 font-extrabold text-3xl mr-2 dark:text-orange-400">
                                                        ₦{product.flash_sale_price?.toLocaleString()}
                                                    </span>
                                                    {/* Strikethrough original price */}
                                                    <span className="text-gray-500 line-through text-lg">
                                                        ₦{product.selling_price?.toLocaleString()}
                                                    </span>
                                                </div>

                                                {/* Countdown Timer */}
                                                <div className="flex items-center justify-between text-gray-500 text-sm mb-4 dark:text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                                                        Time Left:
                                                    </span>
                                                    <CountdownTimer targetDate={product.flash_sale_ends_at} className='w-6 h-6' />
                                                </div>

                                                {/* Rating Placeholder (if you implement ratings later) */}
                                                {product.rating !== undefined && product.num_reviews !== undefined && (
                                                    <div className="mb-2 flex items-center">
                                                        <StarRating rating={parseFloat(product.rating)} iconSize={14} /> {/* Slightly reduced icon size */}
                                                        <span className="text-gray-500 text-xs ml-1 dark:text-gray-400">({product.num_reviews})</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-center mt-4">
                                                    <button
                                                        onClick={handleAddToCart}
                                                        className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-colors transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        disabled={product.status === 1 || product.qty <= 0 || !product.flash_sale_price}
                                                    >
                                                        <ShoppingCart className="w-5 h-5 mr-2" />
                                                        Add to Cart
                                                    </button>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </motion.section>
    );
};

export default FlashSale;