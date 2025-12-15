import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Loader2, Timer, Clock } from 'lucide-react';
import StarRating from '../../Outer/StarRating';
import { getEffectivePrice, isFlashSaleActive, getDiscountPercentage, formatPrice } from '../../utils/priceHelper';

const ProductCard = ({ product, handleAddToCart, inView, customDelay }) => {
    const [isHovered, setIsHovered] = useState(false);

    // Use price helper functions for consistency
    const effectivePrice = getEffectivePrice(product);
    const isFlashSale = isFlashSaleActive(product);
    const discountPercentage = getDiscountPercentage(product);

    const outOfStock = product.qty <= 0 || product.status === 1;
    const limitedStock = product.qty > 0 && product.qty <= 5;

    const getCategoryLink = () => {
        if (product.category && product.category.link) {
            return product.category.link;
        }
        if (product.link) {
            return product.link;
        }
        return 'shop';
    };

    const categoryLink = getCategoryLink();
    const productLink = product.link || product.product_link || '';

    return (
        <motion.div
            className="mx-auto w-full max-w-xs sm:max-w-sm md:max-w-md bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-lg dark:shadow-2xl group relative transform hover:scale-103 transition-transform duration-300 ease-out border border-gray-200 dark:border-transparent hover:border-blue-400 dark:hover:border-lime-600 flex flex-col"
            style={{ maxWidth: '280px', maxHeight: '400px' }}
            variants={{
                hidden: { opacity: 0, scale: 0.9, y: 30 },
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
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link to={`/collections/${categoryLink}/${productLink}`} className="block">
                <div className="relative pt-[70%] overflow-hidden">
                    {/* Primary Image */}
                    <motion.img
                        src={product.image || `https://placehold.co/300x210/D1D5DB/4B5563?text=${product.name.substring(0, 15)}`}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-100 transition-opacity duration-500 ease-out"
                        initial={false}
                        animate={{ opacity: isHovered && product.image2 ? 0 : 1 }}
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/300x210/D1D5DB/4B5563?text=${product.name.substring(0, 15)}`; }}
                    />

                    {/* Secondary Image with slide-up animation */}
                    <AnimatePresence>
                        {isHovered && product.image2 && (
                            <motion.img
                                src={product.image2}
                                alt={`${product.name} - alternate view`}
                                className="absolute inset-0 w-full h-full object-cover"
                                initial={{ y: '100%' }}
                                animate={{ y: '0%' }}
                                exit={{ y: '100%' }}
                                transition={{ duration: 0.4, ease: 'easeOut' }}
                            />
                        )}
                    </AnimatePresence>

                    {/* Flash Sale Badge */}
                    {isFlashSale && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-md dark:bg-red-600 dark:shadow-lg animate-pulse flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            FLASH SALE
                        </span>
                    )}

                    {/* Discount Badge */}
                    {discountPercentage > 0 && (
                        <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-md dark:bg-green-600 dark:shadow-lg">
                            -{discountPercentage}%
                        </span>
                    )}

                    {/* Stock Status Badges */}
                    {outOfStock ? (
                        <span className="absolute bottom-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-md dark:bg-red-600 dark:shadow-lg">
                            Out of Stock
                        </span>
                    ) : limitedStock && (
                        <span className="absolute bottom-3 left-3 bg-orange-400 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-md dark:bg-orange-500 dark:shadow-lg">
                            Limited Stock ({product.qty})
                        </span>
                    )}

                    {/* New Arrival Badge */}
                    {product.is_new_arrival && !isFlashSale && (
                        <span className="absolute top-3 left-3 bg-blue-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-md dark:bg-blue-600 dark:shadow-lg">
                            NEW
                        </span>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent dark:from-black/50"></div>
                </div>
            </Link>

            <div className="p-3 flex flex-col flex-grow">
                <Link to={`/collections/${categoryLink}/${productLink}`} className="block">
                    <h3 className="text-sm font-bold mb-1 text-gray-800 group-hover:text-blue-600 dark:text-white dark:group-hover:text-lime-400 transition-colors duration-300 line-clamp-2">
                        {product.name}
                    </h3>
                    <p className="text-gray-500 mb-2 text-xs line-clamp-2 min-h-[2rem] dark:text-gray-400">
                        {product.description || 'No description available.'}
                    </p>
                    {product.rating !== undefined && product.num_reviews !== undefined && (
                        <div className="mb-2 flex items-center">
                            <StarRating rating={parseFloat(product.rating)} iconSize={14} />
                            <span className="text-gray-500 text-xs ml-1 dark:text-gray-400">({product.num_reviews})</span>
                        </div>
                    )}
                </Link>

                <div className="mt-auto pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div>
                        {/* Original Price (if there's a discount) */}
                        {product.original_price && product.original_price > effectivePrice && (
                            <p className="text-xs text-gray-400 line-through dark:text-gray-500">
                                {formatPrice(product.original_price)}
                            </p>
                        )}
                        
                        {/* Effective Price (uses flash sale price if active, otherwise selling price) */}
                        <div className="flex items-center gap-1">
                            <p className={`text-base font-bold ${
                                isFlashSale 
                                    ? 'text-red-600 dark:text-red-400' 
                                    : limitedStock 
                                        ? 'text-orange-500 dark:text-orange-400' 
                                        : 'text-blue-600 dark:text-cyan-400'
                            }`}>
                                {formatPrice(effectivePrice)}
                            </p>
                            
                            {/* Flash Sale Indicator */}
                            {isFlashSale && (
                                <Timer className="w-3 h-3 text-red-600 dark:text-red-400 animate-pulse" />
                            )}
                        </div>

                        {/* Flash Sale End Time */}
                        {isFlashSale && product.flash_sale_ends_at && (
                            <p className="text-[10px] text-red-500 dark:text-red-400 mt-0.5">
                                Ends: {new Date(product.flash_sale_ends_at).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={(e) => { e.preventDefault(); handleAddToCart(product); }}
                        className={`p-2 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center text-sm
                            ${outOfStock
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-70 dark:bg-gray-700 dark:text-gray-400'
                                : isFlashSale
                                    ? 'bg-red-600 text-white hover:bg-red-700 active:scale-95 shadow-md dark:bg-red-600 dark:hover:bg-red-700'
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

export default ProductCard;