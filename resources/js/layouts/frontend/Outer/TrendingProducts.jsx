import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Load from '../Components/Load'; // Assuming you have a Load component for spinners
import { ShoppingCart, Star, ArrowRight } from 'lucide-react'; // Icons for cart, rating, and arrow

const TrendingProducts = () => {
    const [trendingProducts, setTrendingProducts] = useState([]);
    const [category, setCategory] = useState([]); // This state will hold the list of categories
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTrendingProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get('/api/allProducts');

                if (response.data.status === 200 && response.data.products) {
                    // Filter products where featured == 1 and limit to first 8
                    const featuredProducts = response.data.products
                        .filter(product => product.featured === 1)
                        .slice(0, 8);
                    
                    setTrendingProducts(featuredProducts);
                } else {
                    toast.error(response.data.message || 'Unable to fetch trending products.');
                    setError('Failed to load trending products.');
                }
            } catch (err) {
                console.error("Error fetching trending products:", err);
                toast.error('Something went wrong fetching trending data.');
                setError('Could not load trending products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchTrendingProducts();
    }, []);

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
            scale: 1.05,
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
            <div className="min-h-screen flex justify-center items-center" style={{ backgroundImage: 'linear-gradient(to bottom right, #0a0a0a, #1a1a1a, #0a0a0a)' }}>
                <Load />
            </div>
        );
    }

    return (
        <motion.section
            className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 text-gray-200"
            style={{ backgroundImage: 'linear-gradient(to bottom right, #0a0a0a, #1a1a1a, #0a0a0a)' }} // Very dark background
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="container mx-auto max-w-7xl">
                <motion.div className="text-center mb-16" variants={itemVariants}>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight drop-shadow-lg">
                        <span className="text-lime-400">Trending</span> Now
                    </h2>
                    <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
                        Don't miss out on what's hot and in demand. Explore our most popular products!
                    </p>
                </motion.div>

                {error ? (
                    <div className="text-center py-20">
                        <h3 className="text-3xl font-bold text-red-500 mb-4">Error</h3>
                        <p className="text-xl text-gray-400">{error}</p>
                    </div>
                ) : trendingProducts.length === 0 ? (
                    <motion.div
                        className="text-center py-20"
                        initial="hidden"
                        animate="visible"
                        variants={itemVariants}
                    >
                        <h3 className="text-3xl font-bold text-white mb-4">No Trending Products</h3>
                        <p className="text-xl text-gray-400">
                            Looks like nothing's trending right now. Check back later!
                        </p>
                        <Link to="/shop" className="mt-8 inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition-colors transform hover:scale-105">
                            Browse All Products
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        <AnimatePresence>
                            {trendingProducts.map((product) => (
                                <motion.div
                                    key={product.id}
                                    className="bg-gray-800 rounded-xl shadow-xl overflow-hidden cursor-pointer border border-gray-700 relative group"
                                    variants={cardHoverVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                >
                                    {/* Trending Badge */}
                                    <motion.div
                                        className="absolute top-4 left-4 bg-lime-500 text-gray-900 px-3 py-1 rounded-full text-xs font-bold uppercase z-10 flex items-center"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5, duration: 0.3 }}
                                    >
                                        <Star className="w-3 h-3 mr-1" fill="currentColor" /> Trending
                                    </motion.div>

                                    <Link to={`/collections/${product.category?.link}`} className="block">
                                        <motion.img
                                            src={`/${product.image}`} 
                                            alt={product.name}
                                            className="w-full h-64 object-cover transform transition-transform duration-300"
                                            variants={imageHoverVariants}
                                            initial={false}
                                            whileHover="hover"
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300/cccccc/000000?text=Image+Error'; }} // Fallback image
                                        />
                                        <div className="p-6 bg-gray-900">
                                            <h3 className="text-xl font-bold text-white mb-2 truncate">{product.name}</h3>
                                            <p className="text-sm text-gray-400 mb-3 line-clamp-2">{product.description}</p>
                                            <div className="flex justify-between items-center mt-4">
                                                <span className="text-lime-400 font-extrabold text-2xl">
                                                    ₦{product.selling_price.toLocaleString()} {/* Format price */}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault(); 
                                                        e.stopPropagation();
                                                    }}
                                                    className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-colors transform hover:scale-105"
                                                >
                                                    <ShoppingCart className="w-5 h-5 mr-2" /> Details
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </motion.section>
    );
};

export default TrendingProducts;
