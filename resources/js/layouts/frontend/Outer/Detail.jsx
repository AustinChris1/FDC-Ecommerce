import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Load from '../Components/Load'; // Assuming Load component handles loading states
import LoadingSpinner from '../Components/Loader'; // Assuming this component exists
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/free-mode';
import 'swiper/css/thumbs';
import { Navigation, Pagination, Autoplay, Thumbs, FreeMode } from 'swiper/modules';
import { motion, AnimatePresence } from 'framer-motion';
import StarRating from './StarRating'; // Assuming StarRating component exists
import { Helmet } from 'react-helmet-async';
import { ShoppingCart, Heart, X, ChevronRight, Share2, DollarSign, Plus, Minus, Send, ArrowLeft, ArrowRight, Package, ListChecks, Tag, Info, Lightbulb } from 'lucide-react';
import Twitter from '../assets/social/x.svg'; // Path to your Twitter icon
import Facebook from '../assets/social/facebook.svg'; // Path to your Facebook icon

import { useCart } from '../Components/CartContext'; // Assuming CartContext is set up
import { useWishlist } from '../Components/WishlistContext';

// Helper component for tab buttons
const TabButton = ({ icon, label, isActive, onClick }) => (
    <motion.button
        className={`flex items-center space-x-4 px-6 py-3 text-lg font-semibold rounded-t-lg transition-all duration-300
                    ${isActive ? 'bg-gray-800 text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800 border-b-2 border-transparent'}`}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
    >
        {icon}
        <span>{label}</span>
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
    const [activeTab, setActiveTab] = useState('description'); // State for active tab

    const { addToCart, cartItems } = useCart();
    const { addToWishlist, removeFromWishlist, isProductInWishlist } = useWishlist(); // Use wishlist hook

    const [currentPage, setCurrentPage] = useState(1);
    const reviewsPerPage = 3;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalImage, setModalImage] = useState('');

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const response = await axios.get(`/api/fetchProducts/${categoryLink}/${productLink}`);
                if (response.data.status === 200) {
                    setProduct(response.data.product);
                    fetchReviews(response.data.product.id);
                } else {
                    toast.error(response.data.message || 'Product not found.');
                    navigate('/shop');
                }
            } catch (error) {
                console.error("Error fetching product details:", error);
                toast.error('Failed to fetch product details.');
                navigate('/shop');
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetails();
    }, [categoryLink, productLink, navigate]);

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
            } else {
                toast.error('Failed to fetch reviews.');
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
            toast.error('Failed to fetch reviews.');
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

    const totalReviews = reviews.length;
    const totalPagesReviews = Math.ceil(totalReviews / reviewsPerPage);
    const startIndex = (currentPage - 1) * reviewsPerPage;
    const currentReviews = reviews.slice(startIndex, startIndex + reviewsPerPage);

    const changeReviewsPage = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPagesReviews) return;
        setCurrentPage(pageNumber);
        // Scroll to the reviews section when changing page
        window.scrollTo({ top: document.getElementById('reviews-section')?.offsetTop - 100, behavior: 'smooth' });
    };

    const openModal = (image) => {
        setModalImage(image);
        setIsModalOpen(true);
        document.body.style.overflow = 'hidden'; // Prevent scrolling background
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalImage('');
        document.body.style.overflow = 'auto'; // Re-enable scrolling
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
            setQuantity(prev => Math.max(1, prev - 1)); // Ensure quantity doesn't go below 1
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
        return <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-200">Product not found.</div>;
    }

    // Calculate average rating
    const averageRating = reviews.length > 0 ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length : 0;

    // Filter out null/empty image paths and ensure they are valid
    const images = [product.image, product.image2, product.image3, product.image4].filter(Boolean);

    // Parse specifications and features from product object (assuming they are JSON strings)
    const productSpecifications = product.specifications ? JSON.parse(product.specifications) : [];
    const productFeatures = product.features ? JSON.parse(product.features) : [];


    // Animation variants for Framer Motion
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const buttonVariants = {
        hover: { scale: 1.05, boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.4)" },
        tap: { scale: 0.95 }
    };

    return (
        <motion.div
            className="w-full min-h-screen bg-gray-950 text-gray-200 pt-24 pb-12 px-4 sm:px-6 lg:px-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <Helmet>
                <title>{product.name} - Your E-commerce shop</title>
                <meta name="description" content={product.description || `Explore ${product.name} in our shop.`} />
                <meta property="og:title" content={product.name} />
                <meta property="og:description" content={product.description || `High-quality ${product.name} available now.`} />
                <meta property="og:image" content={`/${images[0]}`} /> {/* Use the first image for OG image */}
                <meta property="og:type" content="product" />
                <meta property="og:url" content={`https://spx.firstdigit.com.ng/collections/${categoryLink}/${productLink}`} /> {/* Replace with your actual domain */}
            </Helmet>

            {/* Breadcrumb Navigation */}
            <motion.nav className="text-gray-400 text-sm mb-8" variants={itemVariants}>
                <ul className="flex items-center space-x-2">
                    <li>
                        <Link to="/" className="text-cyan-400 hover:text-cyan-300 transition-colors">Home</Link>
                    </li>
                    <li><ChevronRight className="w-4 h-4 text-gray-500" /></li>
                    <li>
                        <Link to="/shop" className="text-cyan-400 hover:text-cyan-300 transition-colors">Shop</Link>
                    </li>
                    <li><ChevronRight className="w-4 h-4 text-gray-500" /></li>
                    <li>
                        <Link to={`/collections/${product.category?.link}`} className="text-cyan-400 hover:text-cyan-300 transition-colors">
                            {product.category?.name || 'Category'}
                        </Link>
                    </li>
                    <li><ChevronRight className="w-4 h-4 text-gray-500" /></li>
                    <li className="text-gray-100">{product.name || 'Product'}</li>
                </ul>
            </motion.nav>

            <div className="flex flex-col lg:flex-row justify-center items-start gap-12 bg-gray-900 rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10 border border-gray-800">
                {/* Product Image Gallery */}
                <motion.div className="w-full lg:w-1/2 flex flex-col items-center" variants={itemVariants}>
                    <Swiper
                        spaceBetween={10}
                        navigation={{
                            nextEl: '.swiper-button-next-main',
                            prevEl: '.swiper-button-prev-main',
                        }}
                        pagination={{ clickable: true, dynamicBullets: true }}
                        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                        modules={[FreeMode, Navigation, Thumbs, Pagination, Autoplay]}
                        className="mySwiper2 w-full max-w-xl rounded-lg overflow-hidden shadow-lg border border-gray-700"
                        autoplay={{ delay: 4000, disableOnInteraction: false }}
                        loop={true}
                    >
                        {images.length > 0 ? (
                            images.map((image, index) => (
                                <SwiperSlide key={index}>
                                    <img
                                        src={`/${image}`}
                                        alt={`${product.name} Image ${index + 1}`}
                                        className="w-full h-auto max-h-[550px] object-contain cursor-zoom-in bg-gray-800 p-4"
                                        onClick={() => openModal(image)}
                                    />
                                </SwiperSlide>
                            ))
                        ) : (
                            <SwiperSlide>
                                <div className="w-full h-[300px] sm:h-[400px] flex items-center justify-center bg-gray-800 rounded-lg text-gray-500">
                                    No image available
                                </div>
                            </SwiperSlide>
                        )}
                        {/* Custom Navigation Arrows */}
                        <div className="swiper-button-prev-main absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white cursor-pointer hover:bg-black/70 transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </div>
                        <div className="swiper-button-next-main absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white cursor-pointer hover:bg-black/70 transition-colors">
                            <ArrowRight className="w-6 h-6" />
                        </div>
                    </Swiper>

                    {/* Thumbnail navigation */}
                    {images.length > 0 && (
                        <Swiper
                            onSwiper={setThumbsSwiper}
                            spaceBetween={10}
                            slidesPerView={4}
                            freeMode={true}
                            watchSlidesProgress={true}
                            modules={[FreeMode, Navigation, Thumbs]}
                            className="mySwiper w-full max-w-xl mt-4"
                            breakpoints={{
                                640: {
                                    slidesPerView: 5,
                                },
                                768: {
                                    slidesPerView: 6,
                                },
                                1024: {
                                    slidesPerView: images.length > 6 ? 6 : images.length,
                                },
                            }}
                        >
                            {images.map((image, index) => (
                                <SwiperSlide key={index} className="cursor-pointer border-2 border-transparent hover:border-blue-600 transition-colors duration-200 rounded-md overflow-hidden">
                                    <img
                                        src={`/${image}`}
                                        alt={`${product.name} Thumbnail ${index + 1}`}
                                        className="w-full h-20 object-cover rounded-md"
                                    />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    )}
                </motion.div>

                {/* Product Details */}
                <motion.div className="w-full lg:w-1/2" variants={itemVariants}>
                    <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 text-white bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600 leading-tight">
                        {product.name || 'Product Name'}
                    </h1>
                    <p className="text-gray-400 text-base mb-2 flex items-center gap-2"><Tag className="w-4 h-4 text-gray-500" />{`Brand: ${product.brand || 'Unknown'}`}</p>
                    <p className={`text-base font-semibold ${product.status === 0 && product.qty > 0 ? 'text-lime-400' : 'text-red-500'} mb-4 flex items-center gap-2`}>
                        <Package className="w-4 h-4" /> {product.status === 0 && product.qty > 0 ? 'In Stock' : 'Out of Stock'}
                    </p>

                    <div className="flex items-center mb-6">
                        <StarRating rating={averageRating} />
                        <span className="ml-3 text-gray-400 text-sm">
                            {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'} (Average: {averageRating.toFixed(1)})
                        </span>
                    </div>

                    {product.selling_price && (
                        <div className="mb-6">
                            <motion.div
                                className="flex items-center gap-4"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                            >
                                <p className="text-lime-400 text-5xl font-bold flex items-center">
                                    ₦{product.selling_price.toLocaleString()}
                                </p>

                                {product.original_price && product.original_price > product.selling_price && (
                                    <>
                                        <p className="text-gray-400 text-xl line-through">
                                            ₦{product.original_price.toLocaleString()}
                                        </p>

                                        <span className="bg-green-500 text-white text-sm font-semibold px-2 py-1 rounded-full">
                                            -
                                            {Math.round(
                                                ((product.original_price - product.selling_price) / product.original_price) * 100
                                            )}
                                            % OFF
                                        </span>
                                    </>
                                )}
                            </motion.div>
                        </div>
                    )}

                    {/* Quantity Selector */}
                    <div className="mb-6 flex items-center space-x-4">
                        <span className="text-gray-300 text-lg font-medium">Quantity:</span>
                        <div className="flex items-center bg-gray-800 rounded-lg border border-gray-700">
                            <motion.button
                                onClick={() => handleQuantityChange('decrease')}
                                className="p-3 rounded-l-lg text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                disabled={quantity <= 1}
                            >
                                <Minus className="w-5 h-5" />
                            </motion.button>
                            <span className="px-4 text-gray-100 font-semibold text-lg">{quantity}</span>
                            <motion.button
                                onClick={() => handleQuantityChange('increase')}
                                className="p-3 rounded-r-lg text-gray-300 hover:bg-gray-700 transition-colors"
                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                disabled={product.qty && quantity >= product.qty}
                            >
                                <Plus className="w-5 h-5" />
                            </motion.button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                        <motion.button
                            onClick={handleAddToCart}
                            className="flex-1 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            disabled={!(product.status === 0 && product.qty > 0)}
                        >
                            <ShoppingCart className="w-6 h-6" />
                            <span>{product.status === 0 && product.qty > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                        </motion.button>
                        <motion.button
                            onClick={handleAddToWishlist}
                            className={`flex-1 px-8 py-3 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg font-bold text-lg shadow-md hover:bg-gray-700 hover:text-red-400 transition-all duration-300 flex items-center justify-center space-x-2 ${inWishlist ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                }`}
                            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                        >
                            <Heart className="w-5 h-5" fill={inWishlist ? "currentColor" : "none"} />
                            <span>{inWishlist ? "Added to Wishlist" : "Add to Wishlist"}</span>
                        </motion.button>
                    </div>

                    <motion.div className="mt-8 pt-8 border-t border-gray-800" variants={itemVariants}>
                        <h3 className="text-3xl font-bold mb-6 text-cyan-400">Share This Product</h3>
                        <div className="flex space-x-4">
                            <motion.a href={`https://www.facebook.com/sharer/sharer.php?u=https://spx.firstdigit.com.ng/collections/${categoryLink}/${productLink}`} target="_blank" rel="noopener noreferrer"
                                className="bg-blue-700 text-white p-3 rounded-full hover:bg-blue-800 transition-colors"
                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            >
                                <img src={Facebook} className="w-6 h-6" alt="Facebook" />
                            </motion.a>
                            <motion.a href={`https://twitter.com/intent/tweet?url=https://spx.firstdigit.com.ng/collections/${categoryLink}/${productLink}&text=${encodeURIComponent(product.name)}`} target="_blank" rel="noopener noreferrer"
                                className="bg-gray-200 text-white p-3 rounded-full hover:bg-blue-500 transition-colors"
                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            >
                                <img src={Twitter} className="w-6 h-6" alt="Twitter" />
                            </motion.a>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Product Tabs Section */}
            <motion.div className="mt-16 bg-gray-900 rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10 border border-gray-800" variants={containerVariants}>
                <div className="flex flex-wrap justify-center mb-8 border-b border-gray-700">
                    <TabButton icon={<Info className="w-5 h-5" />} label="Description" isActive={activeTab === 'description'} onClick={() => setActiveTab('description')} />
                    <TabButton icon={<Package className="w-5 h-5" />} label="Specifications" isActive={activeTab === 'specifications'} onClick={() => setActiveTab('specifications')} />
                    <TabButton icon={<ListChecks className="w-5 h-5" />} label="Features" isActive={activeTab === 'features'} onClick={() => setActiveTab('features')} />
                    <TabButton icon={<Lightbulb className="w-5 h-5" />} label={`Reviews (${totalReviews})`} isActive={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')} />
                </div>

                <AnimatePresence mode='wait'>
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'description' && (
                            <div>
                                <h3 className="text-3xl font-bold mb-6 text-cyan-400 flex items-center gap-3"><Info className="w-8 h-8" />Product Description</h3>
                                <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-line">
                                    {product.description || 'No detailed description is available for this product yet. Please check back later!'}
                                </p>
                            </div>
                        )}

                        {activeTab === 'specifications' && (
                            <div>
                                <h3 className="text-3xl font-bold mb-6 text-cyan-400 flex items-center gap-3"><Package className="w-8 h-8" />Technical Specifications</h3>
                                {productSpecifications.length > 0 ? (
                                    <div className="overflow-x-auto rounded-lg border border-gray-700">
                                        <table className="w-full text-left text-gray-300">
                                            <thead className="text-xs text-gray-400 uppercase bg-gray-800">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3">Specification</th>
                                                    <th scope="col" className="px-6 py-3">Detail</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {productSpecifications.map((spec, index) => (
                                                    <tr key={index} className="bg-gray-900 border-b border-gray-700 hover:bg-gray-800 transition-colors duration-200">
                                                        <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{spec.feature}</td>
                                                        <td className="px-6 py-4">{spec.value}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-gray-400">No specifications available for this product.</p>
                                )}
                            </div>
                        )}


                        {activeTab === 'features' && (
                            <div>
                                <h3 className="text-3xl font-bold mb-6 text-cyan-400 flex items-center gap-3">
                                    <ListChecks className="w-8 h-8" />
                                    Key Features
                                </h3>

                                {productFeatures.length > 0 ? (
                                    <ul className="list-disc list-inside space-y-3 text-gray-300 text-lg ml-4">
                                        {productFeatures.map((item, index) => (
                                            <li key={index} className="flex items-start">
                                                <ChevronRight className="w-5 h-5 mt-1 mr-2 flex-shrink-0 text-cyan-400" />
                                                <span>{item.feature}</span> {/* ✅ Corrected here */}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-400">No features listed for this product.</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <motion.div
                                id="reviews-section"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="bg-gray-900 rounded-xl"
                            >
                                <h3 className="text-3xl font-bold mb-8 text-cyan-400">Customer Reviews ({totalReviews})</h3>

                                {/* Review Form */}
                                {localStorage.getItem('auth_token') ? (
                                    <motion.form
                                        onSubmit={handleReviewSubmit}
                                        className="mb-12 p-6 bg-gray-800 rounded-lg shadow-inner border border-gray-700"
                                    >
                                        <h4 className="text-xl font-semibold mb-4 text-white">Leave a Review</h4>
                                        <div className="flex items-center mb-5">
                                            <StarRating rating={rating} totalStars={5} onClick={setRating} isClickable={true} />
                                            <span className="ml-3 text-gray-400 text-sm">
                                                {rating > 0 ? `${rating} Star${rating > 1 ? 's' : ''}` : 'Select your rating'}
                                            </span>
                                        </div>
                                        <textarea
                                            placeholder="Share your thoughts on this product..."
                                            value={reviewText}
                                            onChange={(e) => setReviewText(e.target.value)}
                                            rows="5"
                                            className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-y"
                                        ></textarea>
                                        <motion.button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="mt-6 px-8 py-3 bg-gradient-to-r from-lime-500 to-lime-700 text-white rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {isSubmitting ? <Load size="sm" /> : <Send className="w-5 h-5" />}
                                            <span>{isSubmitting ? 'Submitting...' : 'Submit Review'}</span>
                                        </motion.button>
                                    </motion.form>
                                ) : (
                                    <p className="mt-4 text-base text-gray-400 p-4 bg-gray-800 rounded-lg border border-gray-700">
                                        Please <Link to="/login" className="text-blue-500 hover:underline">login</Link> to leave a review.
                                    </p>
                                )}

                                {/* Review List */}
                                {reviews.length > 0 ? (
                                    <>
                                        <div className="mt-10 space-y-8">
                                            {currentReviews.map((review) => (
                                                <motion.div
                                                    key={review.id}
                                                    className="p-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.4 }}
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-10 h-10 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                                                                {review.user?.name ? review.user.name.charAt(0).toUpperCase() : 'U'}
                                                            </div>
                                                            <div>
                                                                <p className="text-white font-semibold">{review.user?.name || 'Anonymous User'}</p>
                                                                <StarRating rating={review.rating} />
                                                            </div>
                                                        </div>
                                                        <span className="text-gray-400 text-sm">{formatDate(review.created_at)}</span>
                                                    </div>
                                                    <p className="text-gray-300 text-base leading-relaxed mt-3">{review.review}</p>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Pagination */}
                                        {totalPagesReviews > 1 && (
                                            <div className="flex justify-center items-center space-x-4 mt-10">
                                                <motion.button
                                                    onClick={() => changeReviewsPage(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                    className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Previous
                                                </motion.button>
                                                <span className="text-lg font-semibold text-gray-100">
                                                    Page {currentPage} of {totalPagesReviews}
                                                </span>
                                                <motion.button
                                                    onClick={() => changeReviewsPage(currentPage + 1)}
                                                    disabled={currentPage === totalPagesReviews}
                                                    className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Next
                                                </motion.button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-gray-400 mt-8 text-center p-4 bg-gray-800 rounded-lg border border-gray-700">
                                        Be the first to leave a review for this product!
                                    </p>
                                )}
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            {/* Image Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeModal}
                    >
                        <motion.img
                            src={`/${modalImage}`}
                            alt="Zoomed Product Image"
                            className="max-w-full max-h-full object-contain"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            transition={{ duration: 0.3 }}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <motion.button
                            className="absolute top-4 right-4 p-3 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                            onClick={closeModal}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <X className="w-8 h-8" />
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ProductDetail;