// src/Components/CartSidebar.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Trash2, Plus, Minus, DollarSign, ArrowRight } from 'lucide-react';
import { useCart } from './CartContext';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate

const CartSidebar = () => {
    const navigate = useNavigate(); // Initialize useNavigate
    const {
        cartItems,
        totalCartItems,
        totalCartPrice,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        toggleCart,
        setIsCartOpen
    } = useCart();

    const sidebarVariants = {
        hidden: { x: '100%' },
        visible: { x: 0 },
        exit: { x: '100%' },
    };

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
    };

    const handleCheckoutClick = () => {
        setIsCartOpen(false); // Close sidebar on checkout
        navigate('/checkout'); // Navigate to your checkout page
    };

    const buttonVariants = {
        hover: { scale: 1.05, boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.4)" },
        tap: { scale: 0.95 }
    };

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-70 z-40"
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={toggleCart}
                    />

                    {/* Sidebar */}
                    <motion.div
                        className="fixed top-0 right-0 h-full w-full lg:w-1/2 xl:w-1/3 bg-gray-950 shadow-2xl z-50 flex flex-col p-6 sm:p-8 border-l border-gray-800"
                        variants={sidebarVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center pb-6 border-b border-gray-800 mb-6">
                            <h2 className="text-3xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
                                Your Cart ({totalCartItems})
                            </h2>
                            <motion.button
                                onClick={toggleCart}
                                className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800"
                                aria-label="Close Cart"
                                whileHover={{ rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <X className="w-8 h-8" />
                            </motion.button>
                        </div>

                        {/* Cart Items List */}
                        {cartItems.length > 0 ? (
                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                {cartItems.map(item => (
                                    <motion.div
                                        key={item.id}
                                        className="flex items-center bg-gray-900 rounded-lg shadow-md p-4 mb-4 border border-gray-800"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <img
                                            src={`/${item.image}`}
                                            alt={item.name}
                                            className="w-20 h-20 object-cover rounded-md mr-4 border border-gray-700"
                                        />
                                        <div className="flex-1">
                                            <Link
                                                to={`/collections/${item.category?.link || 'default-category'}/${item.link}`}
                                                onClick={toggleCart}
                                                className="text-lg font-semibold text-gray-100 hover:text-cyan-400 transition-colors"
                                            >
                                                {item.name}
                                            </Link>
                                            <p className="text-lime-400 font-bold mt-1">₦{(item.selling_price * item.quantity).toLocaleString()}</p>
                                            <div className="flex items-center mt-3 space-x-2">
                                                <motion.button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="p-1 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50"
                                                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </motion.button>
                                                <span className="text-gray-100 font-medium">{item.quantity}</span>
                                                <motion.button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="p-1 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                                                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </motion.button>
                                                <motion.button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="ml-auto p-2 rounded-full bg-red-700 text-white hover:bg-red-600 transition-colors"
                                                    aria-label="Remove item"
                                                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <motion.div
                                className="flex-1 flex flex-col items-center justify-center text-gray-400 text-center"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <ShoppingCart className="w-20 h-20 mb-4 text-gray-600" />
                                <p className="text-xl font-semibold">Your cart is empty!</p>
                                <Link
                                    to="/shop"
                                    onClick={toggleCart}
                                    className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                >
                                    <span>Start Shopping</span>
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </motion.div>
                        )}

                        {/* Footer - Total and Checkout */}
                        {cartItems.length > 0 && (
                            <div className="pt-6 border-t border-gray-800 mt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <p className="text-xl font-semibold text-gray-100">Subtotal:</p>
                                    <p className="text-3xl font-bold text-lime-400">₦{totalCartPrice.toLocaleString()}</p>
                                </div>
                                <motion.button
                                    onClick={handleCheckoutClick}
                                    className="w-full py-4 bg-gradient-to-r from-lime-500 to-lime-700 text-white rounded-lg font-bold text-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3"
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                >
                                    <span>Proceed to Checkout</span>
                                    <ArrowRight className="w-6 h-6" />
                                </motion.button>
                                <motion.button
                                    onClick={clearCart}
                                    className="w-full mt-3 py-3 bg-gray-800 text-gray-400 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                >
                                    Clear Cart
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartSidebar;