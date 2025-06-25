import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Loader2 } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import axios from 'axios';
import { toast } from 'react-toastify';

// --- START: Embedded StarRating Component (FOR COMPILATION ONLY) ---
// In your actual project, uncomment your original import:
import StarRating from '../Outer/StarRating';


const FeaturedCategories = () => {
    // --- Data and State Management ---
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    // Using useInView for more robust scroll-triggered animation
    const { ref: sectionRef, inView: sectionInView } = useInView({
        triggerOnce: true,
        threshold: 0.05, // Trigger when 5% of the section is visible
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; // Number of items per page

    // Fetch categories and all products from the backend, then fetch reviews for each product
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Categories
                const categoryRes = await axios.get(`/api/getCategory`);
                if (categoryRes.data.status === 200) {
                    // Add an "All" option to the categories for filtering
                    setCategories([{ id: "All", name: "All", link: "/collections" }, ...categoryRes.data.category]);
                } else {
                    toast.error("Unable to fetch categories");
                    console.error("Backend error fetching categories:", categoryRes.data.message);
                }

                // Fetch All Products
                const productsRes = await axios.get(`/api/allProducts`);
                if (productsRes.data.status === 200) {
                    const productsFromApi = productsRes.data.products;

                    // Create promises to fetch reviews for each product
                    const productsWithReviewPromises = productsFromApi.map(async (product) => {
                        let averageRating = 0;
                        let reviewCount = 0;
                        try {
                            const reviewRes = await axios.get(`/api/products/${product.id}/reviews`);
                            if (reviewRes.data.status === 200 && Array.isArray(reviewRes.data.reviews)) {
                                reviewCount = reviewRes.data.reviews.length;
                                if (reviewCount > 0) {
                                    const totalRating = reviewRes.data.reviews.reduce((sum, review) => sum + parseFloat(review.rating), 0);
                                    averageRating = (totalRating / reviewCount).toFixed(1);
                                }
                            }
                        } catch (reviewError) {
                            console.warn(`Could not fetch reviews for product ${product.id}:`, reviewError);
                            // Default to 0 rating and 0 reviews if fetching fails
                        }

                        const originalPrice = product.original_price;
                        return {
                            ...product,
                            rating: parseFloat(averageRating),
                            num_reviews: reviewCount,
                            original_price: originalPrice
                        };
                    });

                    // Wait for all review fetches to complete
                    const productsWithReviews = await Promise.all(productsWithReviewPromises);
                    setProducts(productsWithReviews);

                } else {
                    toast.error("Unable to fetch products");
                    console.error("Backend error fetching products:", productsRes.data.message);
                }
            } catch (error) {
                console.error("Network or server error during data fetch:", error);
                toast.error("Failed to load data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- Product Filtering Logic ---
    const filteredProducts = selectedCategory === "All"
        ? products
        : products.filter(prod => prod.category_id === selectedCategory);

    // --- Pagination Logic ---
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        document.getElementById('product-grid-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // --- Framer Motion Variants ---
    const sectionTitleVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
    };

    const categoryCardVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 50 },
        visible: (i) => ({
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' },
        }),
    };

    const productCardVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 30 },
        visible: (i) => ({
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
        }),
    };

    return (
        <section
            ref={sectionRef} // Attach the ref for intersection observer for the whole section
            className="py-16 md:py-24 bg-gray-950 text-white relative overflow-hidden"
            style={{
                backgroundImage: `radial-gradient(at 20% 0%, rgba(20,20,50,0.4) 0%, transparent 50%),
                                 radial-gradient(at 80% 100%, rgba(50,20,20,0.4) 0%, transparent 50%)`,
                backgroundBlendMode: 'overlay',
            }}
        >
            {/* Subtle background abstract shapes/glows */}
            <motion.div
                className="absolute inset-0 pointer-events-none z-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: sectionInView ? 1 : 0 }}
                transition={{ duration: 1.5, delay: 0.5 }}
            >
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl opacity-30"></div>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl opacity-30"></div>
            </motion.div>

            <div className="container mx-auto px-4 relative z-10">
                {/* --- Section 1: Explore Our Top Categories --- */}
                <motion.div
                    className="text-center mb-12 md:mb-16"
                    variants={sectionTitleVariants}
                    initial="hidden"
                    animate={sectionInView ? "visible" : "hidden"}
                >
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 drop-shadow-lg leading-tight">
                        Explore Our <span className="text-cyan-400">Top Categories</span>
                    </h2>
                    <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                        Find the perfect tech for your needs from our expertly curated selections.
                    </p>
                </motion.div>

                {loading ? (
                    <div className="text-center py-20 flex flex-col items-center justify-center">
                        <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mb-4" />
                        <p className="text-xl text-gray-400">Loading categories...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                        {categories.filter(cat => cat.id !== "All").slice(0, 6).map((category, i) => ( // Display max 6 top categories
                            <motion.div
                                key={category.id}
                                className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl group relative cursor-pointer transform hover:scale-103 transition-transform duration-300 ease-out border border-transparent hover:border-blue-600"
                                variants={categoryCardVariants}
                                initial="hidden"
                                animate={sectionInView ? "visible" : "hidden"}
                                custom={i}
                            >
                                <Link to={`/collections/${category.link || 'default-category'}`}>
                                    <div className="relative pt-[70%] overflow-hidden"> {/* 7:10 Aspect ratio for categories */}
                                        <img
                                            src={category.image || `https://placehold.co/400x280/e0e0e0/555555?text=Category+Image`}
                                            alt={category.name}
                                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out opacity-80 group-hover:opacity-100"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    </div>
                                    <div className="p-6 text-left">
                                        <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-cyan-400 transition-colors duration-300">
                                            {category.name}
                                        </h3>
                                        <div
                                            className="inline-flex items-center text-blue-400 hover:text-blue-200 transition-colors duration-300 font-semibold group"
                                        >
                                            Shop Now
                                            <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* --- Section 2: Product Listing with Filtering and Pagination --- */}
                <div id="product-grid-section" className="mt-20">
                    <motion.div
                        className="text-center mb-12 md:mb-16"
                        variants={sectionTitleVariants}
                        initial="hidden"
                        animate={sectionInView ? "visible" : "hidden"}
                    >
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 drop-shadow-lg leading-tight">
                            Our Latest <span className="text-lime-400">Products</span>
                        </h2>
                        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                            Browse our extensive catalog of cutting-edge technology.
                        </p>
                    </motion.div>

                    {/* Category Filter Tabs */}
                    <motion.div
                        className="flex flex-wrap justify-center gap-4 mb-12"
                        initial="hidden"
                        animate={sectionInView ? "visible" : "hidden"}
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
                        }}
                    >
                        {categories.map((cat) => (
                            <motion.button
                                key={cat.id}
                                onClick={() => { setSelectedCategory(cat.id); setCurrentPage(1); }}
                                className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-md
                                    ${selectedCategory === cat.id
                                        ? 'bg-blue-600 text-white shadow-blue-500/50'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}
                            >
                                {cat.name}
                            </motion.button>
                        ))}
                    </motion.div>

                    {/* Product Grid */}
                    {loading ? (
                        <div className="text-center py-20 flex flex-col items-center justify-center">
                            <Loader2 className="w-12 h-12 animate-spin text-lime-400 mb-4" />
                            <p className="text-xl text-gray-400">Fetching products...</p>
                        </div>
                    ) : (
                        <>
                            {currentProducts.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {currentProducts.map((product, i) => (
                                        <motion.div
                                            key={product.id}
                                            className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl group relative cursor-pointer transform hover:scale-103 transition-transform duration-300 ease-out border border-transparent hover:border-lime-600"
                                            variants={productCardVariants}
                                            initial="hidden"
                                            animate={sectionInView ? "visible" : "hidden"}
                                            custom={i}
                                        >
                                            <Link to={`/collections/${product.category?.link || 'default-category'}/${product.link}`}>
                                                {/* Product Image */}
                                                <div className="relative pt-[85%] overflow-hidden"> 
                                                    <img
                                                        src={product.image || `https://placehold.co/400x340/374151/9CA3AF?text=Product+Image`}
                                                        alt={product.name}
                                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out opacity-80 group-hover:opacity-100"
                                                        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x340/374151/9CA3AF?text=${product.name.substring(0, 3)}`; }}
                                                    />
                                                    {/* Discount Badge */}
                                                    {product.original_price && parseFloat(product.original_price) > parseFloat(product.selling_price) && (
                                                        <span className="absolute top-3 right-3 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                                            -{Math.round(((parseFloat(product.original_price) - parseFloat(product.selling_price)) / parseFloat(product.original_price)) * 100)}%
                                                        </span>
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                                </div>

                                                {/* Product Details */}
                                                <div className="p-4 text-left flex flex-col justify-between"> 
                                                    <div>
                                                        <h3 className="text-xl font-bold mb-2 text-white group-hover:text-lime-400 transition-colors duration-300 line-clamp-2">
                                                            {product.name}
                                                        </h3>
                                                        <p className="text-gray-400 mb-3 text-sm line-clamp-2 min-h-[2.5rem]"> {/* min-h for consistent height */}
                                                            {product.description || 'No description available.'}
                                                        </p>
                                                        {/* Star Rating Display */}
                                                        {product.rating !== undefined && product.num_reviews !== undefined && (
                                                            <div className="mb-3">
                                                                <StarRating rating={parseFloat(product.rating)} iconSize={20} />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-col gap-2 mt-4">
                                                        {product.original_price && parseFloat(product.original_price) > parseFloat(product.selling_price) && (
                                                            <p className="text-sm text-gray-500 line-through flex items-center">
                                                                ₦{parseFloat(product.original_price).toLocaleString()}
                                                            </p>
                                                        )}
                                                        <p className="text-2xl font-bold text-cyan-400 flex items-center">
                                                            ₦{parseFloat(product.selling_price).toLocaleString()}
                                                        </p>
                                                        <div
                                            className="inline-flex items-center text-blue-400 hover:text-blue-200 transition-colors duration-300 font-semibold group"
                                        >
                                            Shop Now
                                            <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <p className="text-2xl text-gray-400">No products found in this category.</p>
                                </div>
                            )}
                        </>
                    )}


                    {/* Pagination Controls */}
                    {totalPages > 1 && !loading && (
                        <motion.div
                            className="flex justify-center items-center gap-4 mt-16"
                            initial="hidden"
                            animate={sectionInView ? "visible" : "hidden"}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
                            }}
                        >
                            {[...Array(totalPages)].map((_, index) => (
                                <motion.button
                                    key={index}
                                    onClick={() => handlePageChange(index + 1)}
                                    className={`w-10 h-10 rounded-full font-semibold transition-all duration-300 transform hover:scale-110
                                        ${currentPage === index + 1
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                    variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}
                                >
                                    {index + 1}
                                </motion.button>
                            ))}
                        </motion.div>
                    )}

                </div>
            </div>
        </section>
    );
};

export default FeaturedCategories;
