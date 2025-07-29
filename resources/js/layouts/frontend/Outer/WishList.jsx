// src/Wishlist.js
import React, { useEffect } from 'react';
import { useWishlist } from '../Components/WishlistContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../Components/Loader'; // Assuming this is your global LoadingSpinner
import { Heart, ShoppingCart, XCircle, ArrowRight } from 'lucide-react'; // Icons
import { Helmet } from 'react-helmet-async'; // Import Helmet for SEO

const Wishlist = () => {
    const { wishlistItems, loadingWishlist, removeFromWishlist, fetchWishlist } = useWishlist();

    useEffect(() => {
        // Optionally refetch wishlist on mount if it might be stale
        // fetchWishlist(); // Uncomment if you want to always refetch on component mount
    }, [fetchWishlist]);

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
            scale: 1.03,
            boxShadow: "0px 15px 30px rgba(0, 0, 0, 0.2)", // Lighter shadow for light mode
            transition: { duration: 0.3, ease: 'easeOut' },
        },
        darkHover: { // Dark mode specific hover shadow
            boxShadow: "0px 15px 30px rgba(0, 0, 0, 0.4)",
        },
        tap: { scale: 0.98 },
    };

    if (loadingWishlist) {
        return (
            <div
                className="min-h-screen flex justify-center items-center
                           bg-gray-50 dark:bg-gradient-to-br dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
            >
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <motion.div
            className="w-full min-h-screen p-6
                       bg-gray-50 text-gray-900
                       dark:bg-gradient-to-br dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 dark:text-gray-200"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <Helmet>
                <title>Your Wishlist - FirstSmart Mart</title>
                <meta name="description" content="View and manage your saved products in your wishlist at FirstSmart Mart. Shop your favorite items later!" />
            </Helmet>

            <div className="mt-24"></div> {/* Spacer for Navbar */}

            <motion.h1
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-8 text-center leading-tight drop-shadow-lg
                           text-gray-800 dark:text-white"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                Your <span className="text-pink-600 dark:text-red-400">Wishlist</span>
            </motion.h1>

            {wishlistItems.length === 0 ? (
                <motion.div
                    className="text-center py-28"
                    initial="hidden"
                    animate="visible"
                    variants={itemVariants}
                >
                    <Heart className="w-20 h-20 text-gray-400 mx-auto mb-6 dark:text-gray-500" />
                    <h3 className="text-3xl font-bold text-gray-800 mb-4 dark:text-white">Your Wishlist is Empty</h3>
                    <p className="text-xl text-gray-600 max-w-xl mx-auto dark:text-gray-400">
                        It looks like you haven't added any products to your wishlist yet.
                        Start Browse our amazing collection!
                    </p>
                    <Link to="/shop" className="mt-8 inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition-colors transform hover:scale-105">
                        Start Shopping
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
                    <AnimatePresence>
                        {wishlistItems.map((item) => (
                            <motion.div
                                key={item.product.id} // Use product.id as key for stable rendering
                                className="bg-white rounded-xl shadow-md overflow-hidden relative group border border-gray-200
                                           dark:bg-gray-800 dark:shadow-xl dark:border-gray-700"
                                variants={cardHoverVariants}
                                whileHover={["hover", "darkHover"]} // Apply both hover variants
                                whileTap="tap"
                                layout // For smooth removal animations
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <button
                                    onClick={() => removeFromWishlist(item.product.id)}
                                    className="absolute top-3 right-3 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                                    aria-label="Remove from wishlist"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>

                                <Link to={`/collections/${item.product.category?.link}/${item.product.link}`} className="block">
                                    <img
                                        src={`/${item.product.image}`}
                                        alt={item.product.name}
                                        className="w-full h-56 object-contain transition-transform duration-300 transform group-hover:scale-110"
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300/cccccc/000000?text=Image+Error'; }}
                                    />
                                    <div className="p-4 bg-white dark:bg-gray-900">
                                        <h3 className="text-xl font-bold text-gray-800 mb-2 truncate dark:text-white">{item.product.name}</h3>
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2 dark:text-gray-400">{item.product.description}</p>
                                        <div className="flex justify-between items-center mt-4">
                                            <span className="text-blue-600 font-extrabold text-2xl dark:text-lime-400">
                                                ₦{item.product.selling_price.toLocaleString()}
                                            </span>
                                            {/* You might want an "Add to Cart" button here as well */}
                                            {/* For simplicity, this example doesn't include it, but you could add: */}
                                            {/* <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    // Implement add to cart logic for this product
                                                    // useCart().addToCart(item.product, 1);
                                                    // toast.success(`${item.product.name} added to cart!`);
                                                }}
                                                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-colors transform hover:scale-105"
                                            >
                                                <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
                                            </button> */}
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
};

export default Wishlist;