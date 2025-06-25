import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Load from '../Components/Load'; // Assuming this exists
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination, Autoplay, Thumbs, FreeMode } from 'swiper/modules';
import { motion, AnimatePresence } from 'framer-motion';
import StarRating from './StarRating'; // Import StarRating component
import { Helmet } from 'react-helmet-async';
import { ShoppingCart, Heart, X, ChevronRight, Share2, DollarSign, Plus, Minus, Send, ArrowLeft, ArrowRight } from 'lucide-react'; // Added Plus, Minus icons
import Twitter from '../assets/social/x.svg';
import Facebook from '../assets/social/facebook.svg';

// Import the useCart hook from your CartContext
import { useCart } from '../Components/CartContext';

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
    const [quantity, setQuantity] = useState(1); // State for product quantity

    // Destructure addToCart from useCart()
    const { addToCart, cartItems } = useCart();

    // Pagination state for reviews
    const [currentPage, setCurrentPage] = useState(1);
    const reviewsPerPage = 3;

    // Modal state for image zoom
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

    // Update quantity state if product is already in cart
    useEffect(() => {
        if (product) {
            const itemInCart = cartItems.find(item => item.id === product.id);
            if (itemInCart) {
                setQuantity(itemInCart.quantity);
            } else {
                setQuantity(1); // Reset to 1 if not in cart
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

    // Calculate pagination for reviews
    const totalReviews = reviews.length;
    const totalPagesReviews = Math.ceil(totalReviews / reviewsPerPage);
    const startIndex = (currentPage - 1) * reviewsPerPage;
    const currentReviews = reviews.slice(startIndex, startIndex + reviewsPerPage);

    const changeReviewsPage = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPagesReviews) return;
        setCurrentPage(pageNumber);
        window.scrollTo({ top: document.getElementById('reviews-section').offsetTop - 100, behavior: 'smooth' });
    };

    // Modal functions for image zoom
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
        console.log("Add to Cart button clicked."); // Add this
        if (product.status !== 0) {
            toast.error("This product is currently out of stock.");
            console.log("Product out of stock."); // Add this
            return;
        }
        console.log("Calling addToCart with product:", product, "and quantity:", quantity); // Add this
        addToCart(product, quantity);
    };

    const handleAddToWishlist = () => {
        toast.success('Product added to wishlist!', {
            icon: <Heart className="text-red-400" />
        });
        // Implement actual add to wishlist logic here
    };

    const handleQuantityChange = (type) => {
        if (type === 'increase') {
            setQuantity(prev => prev + 1);
        } else {
            setQuantity(prev => Math.max(1, prev - 1)); // Don't go below 1
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', options);
    };

    if (loading) {
        return <Load />;
    }

    if (!product) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-200">Product not found.</div>;
    }

    const averageRating = reviews.length > 0 ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length : 0;

    const images = [product.image, product.image2, product.image3, product.image4].filter(Boolean);

    // Animation variants
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
                <meta property="og:image" content={`/${product.image}`} />
                <meta property="og:type" content="product" />
                <meta property="og:url" content={`https://yourshop.com/collections/${categoryLink}/${productLink}`} />
            </Helmet>

            {/* Breadcrumb */}
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
                        navigation={true}
                        pagination={{ clickable: true }}
                        modules={[FreeMode, Navigation, Thumbs, Pagination, Autoplay]}
                        className="mySwiper2 w-full max-w-xl rounded-lg overflow-hidden shadow-lg border border-gray-700"
                        onSwiper={setThumbsSwiper}
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
                    </Swiper>

                    {/* Thumbnail navigation */}
                    {images.length > 1 && (
                        <Swiper
                            onSwiper={setThumbsSwiper}
                            spaceBetween={10}
                            slidesPerView={images.length > 4 ? 4 : images.length}
                            freeMode={true}
                            watchSlidesProgress={true}
                            modules={[FreeMode, Navigation, Thumbs]}
                            className="mySwiper w-full max-w-xl mt-4"
                            breakpoints={{
                                640: {
                                    slidesPerView: images.length > 5 ? 5 : images.length,
                                },
                                768: {
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
                    <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                        {product.description || 'A stunning product with unparalleled features, designed to exceed your expectations. Experience innovation and quality in every detail.'}
                    </p>
                    <p className="text-gray-400 text-base mb-2">{`Brand: ${product.brand || 'Unknown'}`}</p>
                    <p className={`text-base font-semibold ${product.status || product.quantity === 0 ? 'text-lime-400' : 'text-red-500'} mb-4`}>
                        {product.status || product.quantity === 0 ? 'In Stock' : 'Out of Stock'}
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
            <p className="text-lime-400 text-5xl font-bold">
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
                            disabled={product.status || product.quantity !== 0}
                        >
                            <ShoppingCart className="w-6 h-6" />
                            <span>{product.status || product.quantity === 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                        </motion.button>
                        <motion.button
                            onClick={handleAddToWishlist}
                            className="flex-1 px-8 py-3 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg font-bold text-lg shadow-md hover:bg-gray-700 hover:text-red-400 transition-all duration-300 flex items-center justify-center space-x-2"
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                        >
                            <Heart className="w-6 h-6" />
                            <span>Add to Wishlist</span>
                        </motion.button>
                    </div>

                    <motion.div className="mt-8 pt-8 border-t border-gray-800" variants={itemVariants}>
                        <h3 className="text-3xl font-bold mb-6 text-cyan-400">Share This Product</h3>
                        <div className="flex space-x-4">
                            <motion.a href={`https://www.facebook.com/sharer/sharer.php?u=https://spx.firstdigit.com.ng/collections/${categoryLink}/${productLink}`} target="_blank" rel="noopener noreferrer"
                                className="bg-blue-700 text-white p-3 rounded-full hover:bg-blue-800 transition-colors"
                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            >
                                <img src={Facebook} className="w-6 h-6" />
                            </motion.a>
                            <motion.a href={`https://twitter.com/intent/tweet?url=https://spx.firstdigit.com.ng/collections/${categoryLink}/${productLink}&text=${encodeURIComponent(product.name)}`} target="_blank" rel="noopener noreferrer"
                                className="bg-gray-200 text-white p-3 rounded-full hover:bg-blue-500 transition-colors"
                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            >
                                <img src={Twitter} className="w-6 h-6" />
                            </motion.a>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Reviews Section */}
            <motion.div id="reviews-section" className="mt-16 bg-gray-900 rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10 border border-gray-800" variants={containerVariants}>
                <h3 className="text-3xl font-bold mb-8 text-cyan-400">Customer Reviews ({totalReviews})</h3>

                {/* Review Form */}
                {localStorage.getItem('auth_token') ? (
                    <motion.form onSubmit={handleReviewSubmit} className="mb-12 p-6 bg-gray-800 rounded-lg shadow-inner border border-gray-700" variants={itemVariants}>
                        <h4 className="text-xl font-semibold mb-4 text-white">Leave a Review</h4>
                        <div className="flex items-center mb-5">
                            <StarRating rating={rating} totalStars={5} onClick={setRating} isClickable={true} />
                            <span className="ml-3 text-gray-400 text-sm">{rating > 0 ? `${rating} Star${rating > 1 ? 's' : ''}` : 'Select your rating'}</span>
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
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                        >
                            {isSubmitting ? <Load size="sm" /> : <Send className="w-5 h-5" />}
                            <span>{isSubmitting ? 'Submitting...' : 'Submit Review'}</span>
                        </motion.button>
                    </motion.form>
                ) : (
                    <motion.p className="mt-4 text-base text-gray-400 p-4 bg-gray-800 rounded-lg border border-gray-700" variants={itemVariants}>
                        Please <Link to="/login" className="text-blue-500 hover:underline">login</Link> to leave a review.
                    </motion.p>
                )}

                {reviews.length > 0 ? (
                    <>
                        <div className="mt-10 space-y-8">
                            {currentReviews.map((review, index) => (
                                <motion.div
                                    key={review.id || index}
                                    className="p-6 bg-gray-800 rounded-lg shadow-md border border-gray-700"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.4 }}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <h5 className="text-white text-lg font-semibold">{review.user?.name || 'Anonymous User'}</h5>
                                        </div>
                                        <StarRating rating={review.rating} isClickable={false} />
                                    </div>
                                    <p className="mt-2 text-gray-300 leading-relaxed italic">"{review.review}"</p>
                                    <p className="mt-3 text-xs text-gray-500">Reviewed on {formatDate(review.created_at)}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Reviews Pagination */}
                        {totalPagesReviews > 1 && (
                            <div className="mt-10 flex justify-center items-center space-x-4">
                                <motion.button
                                    className="px-5 py-2 bg-gray-800 text-gray-300 rounded-lg shadow-md hover:bg-gray-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => changeReviewsPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    <span>Previous</span>
                                </motion.button>

                                <span className="text-lg font-medium text-gray-300">
                                    Page {currentPage} of {totalPagesReviews}
                                </span>

                                <motion.button
                                    className="px-5 py-2 bg-gray-800 text-gray-300 rounded-lg shadow-md hover:bg-gray-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => changeReviewsPage(currentPage + 1)}
                                    disabled={currentPage === totalPagesReviews}
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                >
                                    <span>Next</span>
                                    <ArrowRight className="w-5 h-5" />
                                </motion.button>
                            </div>
                        )}
                    </>
                ) : (
                    <motion.p className="mt-6 text-base text-gray-400 p-4 bg-gray-800 rounded-lg border border-gray-700" variants={itemVariants}>
                        Be the first to review this product!
                    </motion.p>
                )}
            </motion.div>

            {/* Image Zoom Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeModal}
                    >
                        <motion.div
                            className="relative bg-gray-900 rounded-lg shadow-2xl p-6"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={closeModal}
                                className="absolute top-3 right-3 text-gray-300 hover:text-white transition-colors text-3xl rounded-full p-2 bg-gray-800 hover:bg-gray-700"
                                aria-label="Close image modal"
                            >
                                <X className="w-8 h-8" />
                            </button>
                            <img src={`/${modalImage}`} alt="Zoomed Product" className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ProductDetail;