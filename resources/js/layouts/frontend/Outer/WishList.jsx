// src/Wishlist.js
import React, { useEffect } from 'react';
import { useWishlist } from '../Components/WishlistContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Load from '../Components/Load'; // Assuming you have a Load component
import { Heart, ShoppingCart, XCircle, ArrowRight } from 'lucide-react'; // Icons

const Wishlist = () => {
    const { wishlistItems, loadingWishlist, removeFromWishlist, fetchWishlist } = useWishlist();

    useEffect(() => {
        // Optionally refetch wishlist on mount if it might be stale
        // fetchWishlist();
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
            boxShadow: "0px 15px 30px rgba(0, 0, 0, 0.4)",
            transition: { duration: 0.3, ease: 'easeOut' },
        },
        tap: { scale: 0.98 },
    };

    if (loadingWishlist) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-zinc-950">
                <Load />
            </div>
        );
    }

    return (
        <motion.div
            className="w-full min-h-screen p-6 text-gray-200"
            style={{ backgroundImage: 'linear-gradient(to bottom right, #0a0a0a, #1a1a1a, #0a0a0a)' }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="mt-24"></div> {/* Spacer for Navbar */}

            <motion.h1
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-8 text-center leading-tight drop-shadow-lg"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                Your <span className="text-red-400">Wishlist</span>
            </motion.h1>

            {wishlistItems.length === 0 ? (
                <motion.div
                    className="text-center py-20"
                    initial="hidden"
                    animate="visible"
                    variants={itemVariants}
                >
                    <Heart className="w-20 h-20 text-gray-500 mx-auto mb-6" />
                    <h3 className="text-3xl font-bold text-white mb-4">Your Wishlist is Empty</h3>
                    <p className="text-xl text-gray-400 max-w-xl mx-auto">
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
                                className="bg-gray-800 rounded-xl shadow-xl overflow-hidden relative group border border-gray-700"
                                variants={cardHoverVariants}
                                whileHover="hover"
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
                                    <div className="p-4 bg-gray-900">
                                        <h3 className="text-xl font-bold text-white mb-2 truncate">{item.product.name}</h3>
                                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{item.product.description}</p>
                                        <div className="flex justify-between items-center mt-4">
                                            <span className="text-lime-400 font-extrabold text-2xl">
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