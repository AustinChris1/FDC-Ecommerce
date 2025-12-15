import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ShoppingCart } from 'lucide-react';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const localCart = localStorage.getItem('cartItems');
            return localCart ? JSON.parse(localCart) : [];
        } catch (error) {
            console.error("Failed to parse cart from localStorage", error);
            return [];
        }
    });

    const [isCartOpen, setIsCartOpen] = useState(false);

    // Helper function to get the effective selling price
    const getEffectivePrice = (product) => {
        // Check if flash sale is active
        if (product.is_flash_sale && product.flash_sale_price) {
            const now = new Date();
            const startDate = product.flash_sale_starts_at ? new Date(product.flash_sale_starts_at) : null;
            const endDate = product.flash_sale_ends_at ? new Date(product.flash_sale_ends_at) : null;

            // Validate flash sale is within date range
            const isWithinDateRange = 
                (!startDate || now >= startDate) && 
                (!endDate || now <= endDate);

            if (isWithinDateRange) {
                return Number(product.flash_sale_price);
            }
        }
        
        // Return regular selling price if no active flash sale
        return Number(product.selling_price) || 0;
    };

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
        
        // Get the effective price for this product
        const effectivePrice = getEffectivePrice(product);
        
        // Store the product with its effective price
        const productWithEffectivePrice = {
            ...product,
            selling_price: effectivePrice, // Override with effective price
            original_selling_price: product.selling_price, // Keep original for reference
        };

        if (existingItemIndex > -1) {
            const updatedCartItems = cartItems.map((item, index) =>
                index === existingItemIndex
                    ? { 
                        ...item, 
                        quantity: item.quantity + quantity,
                        selling_price: effectivePrice, // Update price in case flash sale changed
                    }
                    : item
            );
            setCartItems(updatedCartItems);
            toast.info(`Updated quantity for ${product.name} in cart!`, {
                icon: <ShoppingCart className="text-blue-400" />
            });
        } else {
            setCartItems([...cartItems, { ...productWithEffectivePrice, quantity }]);
            toast.success(`${product.name} added to cart!`, {
                icon: <ShoppingCart className="text-lime-400" />
            });
        }
        setIsCartOpen(true);
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
        setIsCartOpen(false);
    };

    // Function to toggle cart sidebar
    const toggleCart = () => {
        setIsCartOpen(prev => !prev);
    };

    // Calculate total items in cart (for Navbar count)
    const totalCartItems = cartItems.reduce((total, item) => total + item.quantity, 0);

    // Calculate total price using effective prices
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
        isCartOpen, 
        toggleCart, 
        setIsCartOpen,
        getEffectivePrice, // Export for use in other components
    };

    return (
        <CartContext.Provider value={cartContextValue}>
            {children}
        </CartContext.Provider>
    );
};