// src/Components/WishlistContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Heart } from 'lucide-react';

const WishlistContext = createContext();

export const useWishlist = () => {
    return useContext(WishlistContext);
};

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loadingWishlist, setLoadingWishlist] = useState(true);


    const handleAuthError = () => {
        localStorage.removeItem('auth_token');
        setWishlistItems([]);
        toast.error("Your session has expired. Please log in again.");
    };

    const fetchWishlist = useCallback(async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            setLoadingWishlist(false);
            setWishlistItems([]);
            return;
        }

        try {
            const response = await axios.get('/api/wishlist', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.data.status === 200) {
                setWishlistItems(response.data.wishlist);
            } else if (response.data.status === 401) {
                handleAuthError();
            } else {
                toast.error(response.data.message || "Failed to fetch wishlist.");
            }
        } catch (error) {
            console.error("Error fetching wishlist:", error);
            if (error.response && error.response.status === 401) {
                handleAuthError();
            } else {
                console.error("Could not load wishlist. Please try again.");
            }
        } finally {
            setLoadingWishlist(false);
        }
    }, []);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const addToWishlist = async (product) => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            toast.error("Please log in to add items to your wishlist.", {
                icon: <Heart className="text-red-400" />
            });
            return;
        }

        const existingItem = wishlistItems.find(item => item.product_id === product.id);
        if (existingItem) {
            toast.info(`${product.name} is already in your wishlist!`, {
                icon: <Heart className="text-red-400" />
            });
            return;
        }

        try {
            const response = await axios.post('/api/wishlist/add', { product_id: product.id }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.status === 200) {
                setWishlistItems(prevItems => [...prevItems, response.data.wishlistItem]);
                toast.success(`${product.name} added to wishlist!`, {
                    icon: <Heart className="text-red-400" />
                });
            } else if (response.data.status === 409) {
                toast.info(response.data.message, {
                    icon: <Heart className="text-red-400" />
                });
            } else {
                toast.error(response.data.message || `Failed to add ${product.name} to wishlist.`);
            }
        } catch (error) {
            console.error("Error adding to wishlist:", error);
            toast.error("Failed to add product to wishlist. Please try again.");
        }
    };

    const removeFromWishlist = async (productId) => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            toast.error("Please log in to manage your wishlist.");
            return;
        }

        try {
            const response = await axios.delete(`/api/wishlist/remove/${productId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.status === 200) {
                setWishlistItems(prevItems => prevItems.filter(item => item.product_id !== productId));
                toast.success("Product removed from wishlist.", {
                    icon: <Heart className="text-red-400" />
                });
            } else {
                toast.error(response.data.message || "Failed to remove product from wishlist.");
            }
        } catch (error) {
            console.error("Error removing from wishlist:", error);
            toast.error("Failed to remove product from wishlist. Please try again.");
        }
    };

    const isProductInWishlist = (productId) => {
        return wishlistItems.some(item => item.product_id === productId);
    };

    const value = {
        wishlistItems,
        loadingWishlist,
        addToWishlist,
        removeFromWishlist,
        isProductInWishlist,
        fetchWishlist
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};