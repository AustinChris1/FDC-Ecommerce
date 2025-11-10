import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import LoadingSpinner from '../Components/Loader';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/free-mode';
import 'swiper/css/thumbs';
import { Navigation, Pagination, Autoplay, Thumbs, FreeMode } from 'swiper/modules';
import { motion, AnimatePresence } from 'framer-motion';
import StarRating from './StarRating';
import { Helmet } from 'react-helmet-async';
import { ShoppingCart, Heart, X, ChevronRight, Share2, DollarSign, Plus, Minus, Send, ArrowLeft, ArrowRight, Package, ListChecks, Tag, Info, Lightbulb } from 'lucide-react';
import Twitter from '../assets/social/x.svg';
import Facebook from '../assets/social/facebook.svg';

import { useCart } from '../Components/CartContext';
import { useWishlist } from '../Components/WishlistContext';

// Helper component for tab buttons
const TabButton = ({ icon, label, isActive, onClick }) => (
    <motion.button
        className={`flex items-center space-x-2 sm:space-x-3 px-3 py-2 sm:px-5 md:px-6 sm:py-2.5 md:py-3 text-sm sm:text-base md:text-lg font-semibold rounded-t-lg transition-all duration-300 text-black
                    dark:bg-gray-800 dark:text-cyan-400 
                    ${isActive ? 'bg-gray-200 text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-300 border-b-2 border-transparent'}`}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
    >
        <span className="flex-shrink-0">{icon}</span>
        <span className="hidden sm:inline">{label}</span>
    </motion.button>
);

const ProductDetail = () => {
    const navigate = useNavigate();
    const { categoryLink, productLink } = useParams();
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');

    const { addToCart, cartItems } = useCart();
    const { addToWishlist, removeFromWishlist, isProductInWishlist } = useWishlist();

    const [currentPage, setCurrentPage] = useState(1);
    const reviewsPerPage = 3;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalImage, setModalImage] = useState('');
    
    const isFetchingRef = useRef(false);
    const abortControllerRef = useRef(null);

    useEffect(() => {
        const fetchProductDetails = async () => {
            // Prevent duplicate requests
            if (isFetchingRef.current) {
                console.log('Already fetching, skipping duplicate request');
                return;
            }
            
            // Cancel any pending request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            isFetchingRef.current = true;
            setLoading(true);
            
            // Create new abort controller for this request
            abortControllerRef.current = new AbortController();
            
            try {
                const response = await axios.get(
                    `/api/fetchProducts/${categoryLink}/${productLink}`,
                    { signal: abortControllerRef.current.signal }
                );
                
                if (response.data.status === 200) {
                    setProduct(response.data.product);
                    if (response.data.product.reviews) {
                        setReviews(response.data.product.reviews);
                    }
                }
            } catch (error) {
                if (axios.isCancel(error)) {
                    console.log('Request cancelled');
                } else {
                    console.error("Error fetching product details:", error);
                }
            } finally {
                setLoading(false);
                isFetchingRef.current = false;
            }
        };
        
        fetchProductDetails();

        // Cleanup function to cancel request on unmount
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            isFetchingRef.current = false;
        };
    }, [categoryLink, productLink]);

    useEffect(() => {
        if (product) {
            document.title = `${product.name} - Your E-commerce shop`;
        }
    }, [product]);

    useEffect(() => {
        if (product) {
            const itemInCart = cartItems.find(item => item.id === product.id);
            if (itemInCart) {
                setQuantity(itemInCart.quantity);
            } else {
                setQuantity(1);
            }
        }
    }, [product, cartItems]);

    const fetchReviews = async (productId) => {
        try {
            const response = await axios.get(`/api/products/${productId}/reviews`);
            if (response.data.status === 200) {
                setReviews(response.data.reviews);
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();

        if (!localStorage.getItem('auth_token')) {
            toast.info('Please login to leave a review.');
            navigate('/login');
            return;
        }

        if (!rating || !reviewText.trim()) {
            toast.error('Please provide both a rating and a review.');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axios.post(`/api/products/${product.id}/submit`, {
                rating,
                review: reviewText,
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });

            if (response.data.status === 200) {
                toast.success('Your review has been submitted!');
                setRating(0);
                setReviewText('');
                fetchReviews(product.id);
            } else {
                toast.error(response.data.message || 'Failed to submit review.');
            }
        } catch (error) {
            console.error("Review submission error:", error.response || error);
            const errorMessage = error.response?.data?.message || 'Failed to submit your review. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (product) {
            let recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];

            const isProductInList = recentlyViewed.some(p => p.id === product.id);

            if (!isProductInList) {
                // Use the actual category link from the product object, not the URL parameter
                const actualCategoryLink = product.category?.link || categoryLink;
                const actualProductLink = product.link || productLink;
                
                // Only save if we have a valid category link (not default-category)
                if (actualCategoryLink && actualCategoryLink !== 'default-category') {
                    recentlyViewed.unshift({
                        id: product.id,
                        name: product.name,
                        image: product.image,
                        category_link: actualCategoryLink,
                        product_link: actualProductLink,
                    });

                    recentlyViewed = recentlyViewed.slice(0, 8);

                    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
                }
            }
        }
    }, [product, categoryLink, productLink]); 

    const totalReviews = reviews.length;
    const totalPagesReviews = Math.ceil(totalReviews / reviewsPerPage);
    const startIndex = (currentPage - 1) * reviewsPerPage;
    const currentReviews = reviews.slice(startIndex, startIndex + reviewsPerPage);

    const changeReviewsPage = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPagesReviews) return;
        setCurrentPage(pageNumber);
        window.scrollTo({ top: document.getElementById('reviews-section')?.offsetTop - 100, behavior: 'smooth' });
    };

    const openModal = (image) => {
        setModalImage(image);
        setIsModalOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalImage('');
        document.body.style.overflow = 'auto';
    };

    const handleAddToCart = () => {
        if (product.status !== 0 || product.qty <= 0) {
            toast.error("This product is currently out of stock.");
            return;
        }
        addToCart(product, quantity);
    };

    const handleAddToWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!product) return;

        if (isProductInWishlist(product.id)) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };
    
    const inWishlist = product ? isProductInWishlist(product.id) : false;

    const handleQuantityChange = (type) => {
        if (type === 'increase') {
            setQuantity(prev => prev + 1);
        } else {
            setQuantity(prev => Math.max(1, prev - 1));
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', options);
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!product) {
        return <div className="min-h-screen flex items-center justify-center dark:bg-gray-950 dark:text-gray-200 bg-gray-50 text-gray-800">Product not found.</div>;
    }

    // Calculate average rating
    const averageRating = reviews.length > 0 ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length : 0;

    // Filter out null/empty image paths
    const images = [product.image, product.image2, product.image3, product.image4].filter(Boolean);

    // Parse specifications and features
    const productSpecifications = product.specifications ? JSON.parse(product.specifications) : [];
    const productFeatures = product.features ? JSON.parse(product.features) : [];

    // Get the correct category link - prefer product.category.link over URL param
    const correctCategoryLink = product.category?.link || categoryLink;
    const correctProductLink = product.link || productLink;

    return (
        <motion.div
            className="w-full min-h-screen dark:bg-gray-950 dark:text-gray-200 bg-gray-50 text-gray-800 pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-12 px-3 sm:px-4 md:px-6 lg:px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <Helmet>
                <title>{product.name} - Your E-commerce shop</title>
                <meta name="description" content={product.description || `Explore ${product.name} in our shop.`} />
            </Helmet>

            {/* Breadcrumb Navigation - Using correct category link */}
            <nav className="dark:text-gray-400 text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6 md:mb-8 overflow-x-auto">
                <ul className="flex items-center space-x-1 sm:space-x-2 whitespace-nowrap">
                    <li>
                        <Link to="/" className="dark:text-cyan-400 dark:hover:text-cyan-300 text-blue-600 hover:text-blue-500 transition-colors">Home</Link>
                    </li>
                    <li><ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 dark:text-gray-500 text-gray-400" /></li>
                    <li>
                        <Link to="/shop" className="dark:text-cyan-400 dark:hover:text-cyan-300 text-blue-600 hover:text-blue-500 transition-colors">Shop</Link>
                    </li>
                    <li><ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 dark:text-gray-500 text-gray-400" /></li>
                    <li>
                        <Link to={`/collections/${correctCategoryLink}`} className="dark:text-cyan-400 dark:hover:text-cyan-300 text-blue-600 hover:text-blue-500 transition-colors">
                            {product.category?.name || 'Category'}
                        </Link>
                    </li>
                    <li><ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 dark:text-gray-500 text-gray-400" /></li>
                    <li className="dark:text-gray-100 text-gray-800 truncate max-w-[150px] sm:max-w-none">{product.name || 'Product'}</li>
                </ul>
            </nav>

            <div className="flex flex-col lg:flex-row justify-center items-start gap-6 sm:gap-8 lg:gap-12 dark:bg-gray-900 bg-white rounded-lg sm:rounded-xl shadow-xl sm:shadow-2xl p-4 sm:p-6 md:p-8 lg:p-10 dark:border dark:border-gray-800 border border-gray-200">
                {/* Product Image Gallery */}
                <div className="w-full lg:w-1/2 flex flex-col items-center">
                    <Swiper
                        spaceBetween={10}
                        navigation={{
                            nextEl: '.swiper-button-next-main',
                            prevEl: '.swiper-button-prev-main',
                        }}
                        pagination={{ clickable: true, dynamicBullets: true }}
                        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                        modules={[FreeMode, Navigation, Thumbs, Pagination, Autoplay]}
                        className="mySwiper2 w-full max-w-xl rounded-lg overflow-hidden shadow-lg dark:border dark:border-gray-700 border border-gray-300"
                        autoplay={{ delay: 4000, disableOnInteraction: false }}
                        loop={true}
                    >
                        {images.length > 0 ? (
                            images.map((image, index) => (
                                <SwiperSlide key={index}>
                                    <img
                                        src={`/${image}`}
                                        alt={`${product.name} Image ${index + 1}`}
                                        className="w-full h-auto max-h-[300px] sm:max-h-[400px] md:max-h-[500px] lg:max-h-[550px] object-contain cursor-zoom-in dark:bg-gray-800 bg-gray-100 p-3 sm:p-4"
                                        onClick={() => openModal(image)}
                                    />
                                </SwiperSlide>
                            ))
                        ) : (
                            <SwiperSlide>
                                <div className="w-full h-[250px] sm:h-[350px] md:h-[400px] flex items-center justify-center dark:bg-gray-800 bg-gray-100 rounded-lg dark:text-gray-500 text-gray-400">
                                    No image available
                                </div>
                            </SwiperSlide>
                        )}
                        <div className="swiper-button-prev-main absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 p-1.5 sm:p-2 rounded-full dark:bg-black/50 dark:text-white bg-gray-800/50 text-white cursor-pointer dark:hover:bg-black/70 hover:bg-gray-800 transition-colors">
                            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                        </div>
                        <div className="swiper-button-next-main absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 p-1.5 sm:p-2 rounded-full dark:bg-black/50 dark:text-white bg-gray-800/50 text-white cursor-pointer dark:hover:bg-black/70 hover:bg-gray-800 transition-colors">
                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                        </div>
                    </Swiper>

                    {/* Thumbnail navigation */}
                    {images.length > 0 && (
                        <Swiper
                            onSwiper={setThumbsSwiper}
                            spaceBetween={8}
                            slidesPerView={3}
                            freeMode={true}
                            watchSlidesProgress={true}
                            modules={[FreeMode, Navigation, Thumbs]}
                            className="mySwiper w-full max-w-xl mt-3 sm:mt-4"
                            breakpoints={{
                                480: { slidesPerView: 4 },
                                640: { slidesPerView: 5 },
                                768: { slidesPerView: 6 },
                                1024: { slidesPerView: images.length > 6 ? 6 : images.length },
                            }}
                        >
                            {images.map((image, index) => (
                                <SwiperSlide key={index} className="cursor-pointer border-2 border-transparent hover:border-blue-600 transition-colors duration-200 rounded-md overflow-hidden">
                                    <img
                                        src={`/${image}`}
                                        alt={`${product.name} Thumbnail ${index + 1}`}
                                        className="w-full h-16 sm:h-20 object-cover rounded-md"
                                    />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    )}
                </div>

                {/* Product Details */}
                <div className="w-full lg:w-1/2">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 sm:mb-4 dark:text-white text-gray-900 leading-tight">
                        {product.name || 'Product Name'}
                    </h1>
                    <p className="dark:text-gray-400 text-gray-600 text-sm sm:text-base mb-2 flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 dark:text-gray-500 text-gray-400" />
                        {`Brand: ${product.brand || 'Unknown'}`}
                    </p>
                    <p className={`text-sm sm:text-base font-semibold ${product.status === 0 && product.qty > 0 ? 'dark:text-lime-400 text-green-600' : 'dark:text-red-500 text-red-600'} mb-3 sm:mb-4 flex items-center gap-2`}>
                        <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {product.status === 0 && product.qty > 0 ? 'In Stock' : 'Out of Stock'}
                    </p>

                    <div className="flex items-center mb-4 sm:mb-6">
                        <StarRating rating={averageRating} />
                        <span className="ml-2 sm:ml-3 dark:text-gray-400 text-gray-600 text-xs sm:text-sm">
                            {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'} (Average: {averageRating.toFixed(1)})
                        </span>
                    </div>

                    {product.selling_price && (
                        <div className="mb-4 sm:mb-6">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4">
                                <p className="dark:text-lime-400 text-blue-600 text-3xl sm:text-4xl md:text-5xl font-bold flex items-center">
                                    ₦{product.selling_price.toLocaleString()}
                                </p>

                                {product.original_price && product.original_price > product.selling_price && (
                                    <>
                                        <p className="dark:text-gray-400 text-gray-500 text-base sm:text-lg md:text-xl line-through">
                                            ₦{product.original_price.toLocaleString()}
                                        </p>

                                        <span className="bg-green-500 text-white text-xs sm:text-sm font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full whitespace-nowrap">
                                            -{Math.round(((product.original_price - product.selling_price) / product.original_price) * 100)}% OFF
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Quantity Selector */}
                    <div className="mb-4 sm:mb-6 flex flex-wrap items-center gap-2 sm:gap-4">
                        <span className="dark:text-gray-300 text-gray-700 text-base sm:text-lg font-medium">Quantity:</span>
                        <div className="flex items-center dark:bg-gray-800 bg-gray-100 rounded-lg dark:border dark:border-gray-700 border border-gray-300">
                            <motion.button
                                onClick={() => handleQuantityChange('decrease')}
                                className="p-2 sm:p-3 rounded-l-lg dark:text-gray-300 text-gray-700 dark:hover:bg-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                disabled={quantity <= 1}
                            >
                                <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                            </motion.button>
                            <span className="px-3 sm:px-4 dark:text-gray-100 text-gray-900 font-semibold text-base sm:text-lg">{quantity}</span>
                            <motion.button
                                onClick={() => handleQuantityChange('increase')}
                                className="p-2 sm:p-3 rounded-r-lg dark:text-gray-300 text-gray-700 dark:hover:bg-gray-700 hover:bg-gray-200 transition-colors"
                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                disabled={product.qty && quantity >= product.qty}
                            >
                                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                            </motion.button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
                        <motion.button
                            onClick={handleAddToCart}
                            className="flex-1 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 dark:bg-gradient-to-r dark:from-blue-600 dark:to-blue-800 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={!(product.status === 0 && product.qty > 0)}
                        >
                            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                            <span className="text-sm sm:text-base md:text-lg">{product.status === 0 && product.qty > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                        </motion.button>
                        <motion.button
                            onClick={handleAddToWishlist}
                            className={`flex-1 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-lg font-bold text-base sm:text-lg shadow-md transition-all duration-300 flex items-center justify-center space-x-2 ${
                                inWishlist 
                                    ? 'dark:bg-red-500 dark:hover:bg-red-600 dark:text-white bg-red-500 hover:bg-red-600 text-white' 
                                    : 'dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 bg-gray-200 hover:bg-gray-300 text-gray-700'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Heart className="w-4 h-4 sm:w-5 sm:h-5" fill={inWishlist ? "currentColor" : "none"} />
                            <span className="text-sm sm:text-base md:text-lg hidden sm:inline">{inWishlist ? "In Wishlist" : "Add to Wishlist"}</span>
                            <span className="text-sm sm:hidden">{inWishlist ? "Saved" : "Save"}</span>
                        </motion.button>
                    </div>

                    <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 dark:border-t dark:border-gray-800 border-t border-gray-200">
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 dark:text-cyan-400 text-blue-700">Share This Product</h3>
                        <div className="flex space-x-3 sm:space-x-4">
                            <motion.a 
                                href={`https://www.facebook.com/sharer/sharer.php?u=https://spx.firstdigit.com.ng/collections/${correctCategoryLink}/${correctProductLink}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-blue-700 text-white p-2.5 sm:p-3 rounded-full hover:bg-blue-800 transition-colors"
                                whileHover={{ scale: 1.1 }} 
                                whileTap={{ scale: 0.9 }}
                            >
                                <img src={Facebook} className="w-5 h-5 sm:w-6 sm:h-6" alt="Facebook" />
                            </motion.a>
                            <motion.a 
                                href={`https://twitter.com/intent/tweet?url=https://spx.firstdigit.com.ng/collections/${correctCategoryLink}/${correctProductLink}&text=${encodeURIComponent(product.name)}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="dark:bg-gray-200 bg-gray-700 text-white p-2.5 sm:p-3 rounded-full hover:bg-blue-500 transition-colors"
                                whileHover={{ scale: 1.1 }} 
                                whileTap={{ scale: 0.9 }}
                            >
                                <img src={Twitter} className="w-5 h-5 sm:w-6 sm:h-6" alt="Twitter" />
                            </motion.a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Tabs Section - Rest of the component remains the same */}
            {/* ... keeping the tabs section unchanged for brevity ... */}
        </motion.div>
    );
};

export default ProductDetail;