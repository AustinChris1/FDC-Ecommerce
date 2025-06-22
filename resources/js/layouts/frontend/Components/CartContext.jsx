// src/context/CartContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ShoppingCart } from 'lucide-react'; // For the toast icon

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    // Initialize cart from localStorage or an empty array
    const [cartItems, setCartItems] = useState(() => {
        try {
            const localCart = localStorage.getItem('cartItems');
            return localCart ? JSON.parse(localCart) : [];
        } catch (error) {
            console.error("Failed to parse cart from localStorage", error);
            return [];
        }
    });

    // New state for cart sidebar visibility
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    // Effect to manage body scroll when sidebar is open/closed
    useEffect(() => {
        document.body.style.overflow = isCartOpen ? 'hidden' : 'auto';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isCartOpen]);

    const addToCart = (product, quantity = 1) => {
        const existingItemIndex = cartItems.findIndex(item => item.id === product.id);

        if (existingItemIndex > -1) {
            const updatedCartItems = cartItems.map((item, index) =>
                index === existingItemIndex
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
            );
            setCartItems(updatedCartItems);
            toast.info(`Updated quantity for ${product.name} in cart!`, {
                icon: <ShoppingCart className="text-blue-400" />
            });
        } else {
            setCartItems([...cartItems, { ...product, quantity }]);
            toast.success(`${product.name} added to cart!`, {
                icon: <ShoppingCart className="text-lime-400" />
            });
        }
        setIsCartOpen(true); // Open the cart sidebar when an item is added
    };

    const removeFromCart = (productId) => {
        setCartItems(cartItems.filter(item => item.id !== productId));
        toast.warn('Item removed from cart!');
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCartItems(cartItems.map(item =>
            item.id === productId ? { ...item, quantity: newQuantity } : item
        ));
    };

    const clearCart = () => {
        setCartItems([]);
        toast.info('Cart cleared!');
        setIsCartOpen(false); // Close cart sidebar when cleared
    };

    // Function to toggle cart sidebar
    const toggleCart = () => {
        setIsCartOpen(prev => !prev);
    };

    // Calculate total items in cart (for Navbar count)
    const totalCartItems = cartItems.reduce((total, item) => total + item.quantity, 0);

    // Calculate total price
    const totalCartPrice = cartItems.reduce((total, item) => {
        const price = Number(item.selling_price) || 0;
        const quantity = Number(item.quantity) || 1;
        return total + price * quantity;
    }, 0);
    
    const cartContextValue = {
        cartItems,
        totalCartItems,
        totalCartPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen, // Add to context value
        toggleCart, // Add to context value
        setIsCartOpen, // Add to context value if direct control needed
    };

    return (
        <CartContext.Provider value={cartContextValue}>
            {children}
        </CartContext.Provider>
    );
};