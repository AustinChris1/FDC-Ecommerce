// components/ProductCardBox.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProductCardBox = ({ title, products, linkHref, linkText = "Shop now", inView, customDelay }) => {
    const itemVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.98 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94],
                delay: customDelay
            }
        },
    };

    return (
        <motion.div
            className="dark:bg-black bg-white p-4 rounded-lg shadow-2xl flex flex-col justify-between
                       dark:text-gray-50 text-gray-800
                       dark:border-gray-700 border-gray-200
                       hover:border-lime-500 transition-colors duration-300 relative overflow-hidden
                       h-[320px] sm:h-[350px] md:h-[380px] lg:h-[400px]" // Adjusted responsive fixed heights
            variants={itemVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
        >
            {/* Gradient Overlay for subtle effect - adjusted for dual mode */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent dark:to-lime-950/10 to-gray-200/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            <h3 className="text-xl font-bold mb-4 text-left dark:text-white text-gray-900 tracking-wide">
                {title}
            </h3>

            {/* Changed flex-grow to a fixed height to better control image area */}
            <div className="grid grid-cols-2 gap-3 h-[calc(100%-80px)]"> {/* Adjusted height to account for title and link area */}
                {products.slice(0, 4).map((product, index) => (
                    <Link
                        to={`/collections/${product.category?.link || 'default-category'}/${product.link}`}
                        key={product.id || index}
                        className="group block relative overflow-hidden rounded-md
                                   dark:border-gray-700 border-gray-200
                                   hover:border-lime-600 transition-colors duration-300"
                    >
                        {/* Removed aspect-w/h and used flexbox for image sizing within its container */}
                        <div className="w-full h-full flex items-center justify-center dark:bg-gray-950 bg-gray-50"> {/* Added bg-gray-800 for placeholders */}
                            <img
                                src={product.image || `https://placehold.co/150x150/2d3748/cbd5e0?text=${product.name.substring(0, Math.min(product.name.length, 10))}`} // Adjusted placeholder text length
                                alt={product.name}
                                className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300 ease-in-out" // Changed object-cover to object-contain
                                onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/150x150/2d3748/cbd5e0?text=${product.name.substring(0, Math.min(product.name.length, 10))}`; }}
                            />
                        </div>
                        <div className="absolute inset-0 dark:bg-black dark:bg-opacity-40 bg-gray-900 bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-1">
                            <span className="text-white text-xs text-center line-clamp-2">{product.name}</span>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="mt-4 text-left"> {/* Slightly reduced margin-top */}
                <Link
                    to={linkHref}
                    className="dark:text-lime-400 text-lime-700
                               dark:hover:text-lime-300 hover:text-lime-600
                               hover:underline text-sm font-semibold flex items-center group"
                >
                    {linkText}
                    <motion.span
                        className="ml-1"
                        initial={{ x: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </motion.span>
                </Link>
            </div>
        </motion.div>
    );
};

export default ProductCardBox;