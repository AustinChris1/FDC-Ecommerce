import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Loader2, Timer, Star } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import axios from 'axios';
import { toast } from 'react-toastify';
import LoadingSpinner from './Loader';
import { useCart } from './CartContext';
import CountdownTimer from './hooks/CountdownTimer';
import ProductCard from './hooks/ProductCard';

const ProductShowcase = () => {
    // --- State Management ---
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("All"); // For the main product grid
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const { addToCart } = useCart();

    // useInView hooks for section animations
    const { ref: categoriesRef, inView: categoriesInView } = useInView({
        triggerOnce: true,
        threshold: 0.05,
    });
    const { ref: flashSaleRef, inView: flashSaleInView } = useInView({
        triggerOnce: true,
        threshold: 0.05,
    });
    const { ref: newArrivalsRef, inView: newArrivalsInView } = useInView({
        triggerOnce: true,
        threshold: 0.05,
    });
    const { ref: popularProductsRef, inView: popularProductsInView } = useInView({
        triggerOnce: true,
        threshold: 0.05,
    });
    const { ref: featuredProductsRef, inView: featuredProductsInView } = useInView({
        triggerOnce: true,
        threshold: 0.05,
    });
    const { ref: limitedStockRef, inView: limitedStockInView } = useInView({
        triggerOnce: true,
        threshold: 0.05,
    });
    const { ref: allProductsRef, inView: allProductsInView } = useInView({
        triggerOnce: true,
        threshold: 0.05,
    });


    // --- Data Fetching ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Categories
                const categoryRes = await axios.get(`/api/getCategory`);
                if (categoryRes.data.status === 200) {
                    // Prepend "All" category
                    setCategories([{ id: "All", name: "All", link: "all" }, ...categoryRes.data.category]);
                } else {
                    toast.error("Unable to fetch categories.");
                    console.error("Backend error fetching categories:", categoryRes.data.message);
                }

                // Fetch All Products and their reviews
                const productsRes = await axios.get(`/api/allProducts`);
                if (productsRes.data.status === 200) {
                    const productsFromApi = productsRes.data.products;

                    // Fetch reviews for each product concurrently
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
                            console.warn(`Could not fetch reviews for product ${product.name} (ID: ${product.id}):`, reviewError);
                            // It's okay if reviews fail, product should still load
                        }

                        // Use actual 'is_new_arrival', 'is_flash_sale' directly from your backend.
                        // Ensure date fields are properly parsed.
                        const flashSaleEndsAt = product.flash_sale_ends_at ? new Date(product.flash_sale_ends_at) : null;
                        const flashSaleStartsAt = product.flash_sale_starts_at ? new Date(product.flash_sale_starts_at) : null;
                        const now = new Date();

                        // A product is on flash sale if is_flash_sale is true AND
                        // the current time is between flash_sale_starts_at and flash_sale_ends_at
                        const isCurrentlyFlashSale = product.is_flash_sale && flashSaleStartsAt && flashSaleEndsAt &&
                                                    now >= flashSaleStartsAt && now <= flashSaleEndsAt;

                        return {
                            ...product,
                            rating: parseFloat(averageRating),
                            num_reviews: reviewCount,
                            // Directly use the booleans from the backend
                            is_new_arrival: product.is_new_arrival || false,
                            is_flash_sale: isCurrentlyFlashSale || false,
                            // Ensure these fields are passed through
                            flash_sale_price: product.flash_sale_price,
                            flash_sale_starts_at: product.flash_sale_starts_at,
                            flash_sale_ends_at: product.flash_sale_ends_at,
                            // Keep original price for reference
                            original_price: product.original_price,
                            selling_price: product.selling_price // This might be the regular price when not on flash sale
                        };
                    });

                    const productsWithReviews = await Promise.all(productsWithReviewPromises);
                    setProducts(productsWithReviews);

                } else {
                    toast.error("Unable to fetch products.");
                    console.error("Backend error fetching products:", productsRes.data.message);
                }
            } catch (error) {
                console.error("Network or server error during data fetch:", error);
                toast.error("Failed to load data. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []); // Empty dependency array means this runs once on mount

    // --- Product Filtering and Sorting for Sections (Memoized for performance) ---
    const flashSaleProducts = useMemo(() =>
        products.filter(p =>
            p.is_flash_sale &&
            p.flash_sale_ends_at &&
            new Date(p.flash_sale_ends_at) > new Date() && // Ensure sale is still active
            p.qty > 0
        ).sort((a, b) => new Date(a.flash_sale_ends_at).getTime() - new Date(b.flash_sale_ends_at).getTime()) // Sort by earliest end date
        .slice(0, 8),
        [products]
    );

    const newArrivalsProducts = useMemo(() =>
        products.filter(p => p.is_new_arrival && p.qty > 0)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // Sort by latest creation date
            .slice(0, 8),
        [products]
    );

    const popularProducts = useMemo(() =>
        products.filter(p => p.popular === 1 && p.qty > 0) 
            .sort((a, b) => b.sales_count - a.sales_count) 
            .slice(0, 8),
        [products]
    );

    const featuredProducts = useMemo(() =>
        products.filter(p => p.featured === 1 && p.qty > 0)
            .slice(0, 8),
        [products]
    );

    const limitedStockProducts = useMemo(() =>
        products.filter(product => product.qty > 0 && product.qty <= 5).slice(0, 4),
        [products]
    );

    // Determine the earliest flash sale end date for the global countdown
    const globalFlashSaleEndDate = useMemo(() => {
        if (flashSaleProducts.length === 0) return null;
        const activeSales = flashSaleProducts
            .map(p => new Date(p.flash_sale_ends_at).getTime())
            .filter(timestamp => timestamp > new Date().getTime());
        return activeSales.length > 0 ? Math.min(...activeSales) : null;
    }, [flashSaleProducts]);


    // --- Pagination Logic for main Product Grid ---
    const filteredProducts = useMemo(() => {
        if (selectedCategory === "All") {
            return products;
        }
        // Assuming category_id from product matches category.id
        return products.filter(prod => prod.category_id === selectedCategory);
    }, [products, selectedCategory]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        document.getElementById('product-grid-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // --- Add to Cart Function ---
    const handleAddToCart = (product) => {
        const quantity = 1;

        if (product.status == 1 || product.qty <= 0) { 
            toast.error(`${product.name} is currently out of stock or unavailable.`);
            return;
        }

        if (quantity > product.qty) {
            toast.error(`Cannot add ${quantity} of ${product.name}. Only ${product.qty} in stock.`);
            return;
        }

        addToCart(product, quantity);
    };

    // --- Framer Motion Variants ---
    const sectionTitleVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
    };

    return (
        <section
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
                animate={{ opacity: (categoriesInView || flashSaleInView || newArrivalsInView || popularProductsInView || featuredProductsInView || limitedStockInView || allProductsInView) ? 1 : 0 }}
                transition={{ duration: 1.5, delay: 0.5 }}
            >
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl opacity-30"></div>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl opacity-30"></div>
            </motion.div>

            <div className="container mx-auto px-4 relative z-10">
                {/* --- Section: Flash Sales with Countdown --- */}
                {flashSaleProducts.length > 0 && (
                    <>
                        <motion.div
                            ref={flashSaleRef}
                            className="text-center mb-12 md:mb-16"
                            variants={sectionTitleVariants}
                            initial="hidden"
                            animate={flashSaleInView ? "visible" : "hidden"}
                        >
                            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 drop-shadow-lg leading-tight text-purple-400">
                                <Timer className="inline-block mr-3 w-10 h-10 align-middle" />
                                Flash Sales! Don't Miss Out!
                            </h2>
                            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                                Incredible deals available for a limited time.
                            </p>
                            {/* Use dynamic target date from the earliest ending flash sale product */}
                            {globalFlashSaleEndDate && (
                                <div className="mt-8">
                                    <CountdownTimer targetDate={globalFlashSaleEndDate} />
                                </div>
                            )}
                        </motion.div>

                        {loading ? (
                            <div className="text-center py-20 flex flex-col items-center justify-center">
                                <Loader2 className="w-12 h-12 animate-spin text-purple-400 mb-4" />
                                <p className="text-xl text-gray-400">Loading flash deals...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-20">
                                {flashSaleProducts.map((product, i) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        handleAddToCart={handleAddToCart}
                                        inView={flashSaleInView}
                                        customDelay={i * 0.08}
                                        // Pass flash sale specific props
                                        isFlashSale={product.is_flash_sale}
                                        flashSalePrice={product.flash_sale_price}
                                        flashSaleEndsAt={product.flash_sale_ends_at}
                                    />
                                ))}
                            </div>
                        )}
                        <hr className="my-16 border-gray-800" />
                    </>
                )}

                {/* --- Section: Limited Stock Products --- */}
                {limitedStockProducts.length > 0 && (
                    <>
                        <motion.div
                            ref={limitedStockRef}
                            className="text-center mb-12 md:mb-16"
                            variants={sectionTitleVariants}
                            initial="hidden"
                            animate={limitedStockInView ? "visible" : "hidden"}
                        >
                            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 drop-shadow-lg leading-tight text-red-500">
                                Hurry Now! Limited Stock!
                            </h2>
                            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                                These popular items are flying off the shelves. Grab them before they're gone!
                            </p>
                        </motion.div>

                        {loading ? (
                            <div className="text-center py-20 flex flex-col items-center justify-center">
                                <Loader2 className="w-12 h-12 animate-spin text-red-400 mb-4" />
                                <p className="text-xl text-gray-400">Finding hot deals...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
                                {limitedStockProducts.map((product, i) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        handleAddToCart={handleAddToCart}
                                        inView={limitedStockInView}
                                        customDelay={i * 0.08}
                                        isFlashSale={product.is_flash_sale}
                                        flashSalePrice={product.flash_sale_price}
                                        flashSaleEndsAt={product.flash_sale_ends_at}
                                    />
                                ))}
                            </div>
                        )}
                        <hr className="my-16 border-gray-800" />
                    </>
                )}

                {/* --- Section: Popular Products (from is_popular=1 in DB) --- */}
                {popularProducts.length > 0 && (
                    <>
                        <motion.div
                            ref={popularProductsRef}
                            className="text-center mb-12 md:mb-16"
                            variants={sectionTitleVariants}
                            initial="hidden"
                            animate={popularProductsInView ? "visible" : "hidden"}
                        >
                            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 drop-shadow-lg leading-tight text-orange-400">
                                <span className="text-white">Customer Favorites:</span> Popular Products
                            </h2>
                            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                                See what everyone else is loving right now.
                            </p>
                        </motion.div>

                        {loading ? (
                            <div className="text-center py-20 flex flex-col items-center justify-center">
                                <Loader2 className="w-12 h-12 animate-spin text-orange-400 mb-4" />
                                <p className="text-xl text-gray-400">Finding popular items...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-20">
                                {popularProducts.map((product, i) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        handleAddToCart={handleAddToCart}
                                        inView={popularProductsInView}
                                        customDelay={i * 0.08}
                                        isFlashSale={product.is_flash_sale}
                                        flashSalePrice={product.flash_sale_price}
                                        flashSaleEndsAt={product.flash_sale_ends_at}
                                    />
                                ))}
                            </div>
                        )}
                        <hr className="my-16 border-gray-800" />
                    </>
                )}

                {/* --- Section: Featured Products (from is_featured=1 in DB) --- */}
                {featuredProducts.length > 0 && (
                    <>
                        <motion.div
                            ref={featuredProductsRef}
                            className="text-center mb-12 md:mb-16"
                            variants={sectionTitleVariants}
                            initial="hidden"
                            animate={featuredProductsInView ? "visible" : "hidden"}
                        >
                            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 drop-shadow-lg leading-tight text-pink-400">
                                Specially <span className="text-white">Featured</span> For You
                            </h2>
                            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                                Handpicked items our experts recommend.
                            </p>
                        </motion.div>

                        {loading ? (
                            <div className="text-center py-20 flex flex-col items-center justify-center">
                                <Loader2 className="w-12 h-12 animate-spin text-pink-400 mb-4" />
                                <p className="text-xl text-gray-400">Curating top picks...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-20">
                                {featuredProducts.map((product, i) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        handleAddToCart={handleAddToCart}
                                        inView={featuredProductsInView}
                                        customDelay={i * 0.08}
                                        isFlashSale={product.is_flash_sale}
                                        flashSalePrice={product.flash_sale_price}
                                        flashSaleEndsAt={product.flash_sale_ends_at}
                                    />
                                ))}
                            </div>
                        )}
                        <hr className="my-16 border-gray-800" />
                    </>
                )}

                {/* --- Section: New Arrivals (sorted by creation_date) --- */}
                {newArrivalsProducts.length > 0 && (
                    <>
                        <motion.div
                            ref={newArrivalsRef}
                            className="text-center mb-12 md:mb-16"
                            variants={sectionTitleVariants}
                            initial="hidden"
                            animate={newArrivalsInView ? "visible" : "hidden"}
                        >
                            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 drop-shadow-lg leading-tight text-teal-400">
                                Fresh Off The Truck! <span className="text-white">New Arrivals</span>
                            </h2>
                            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                                Discover the latest and greatest tech products just added to our inventory.
                            </p>
                        </motion.div>

                        {loading ? (
                            <div className="text-center py-20 flex flex-col items-center justify-center">
                                <Loader2 className="w-12 h-12 animate-spin text-teal-400 mb-4" />
                                <p className="text-xl text-gray-400">Discovering new items...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-20">
                                {newArrivalsProducts.map((product, i) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        handleAddToCart={handleAddToCart}
                                        inView={newArrivalsInView}
                                        customDelay={i * 0.08}
                                        isFlashSale={product.is_flash_sale}
                                        flashSalePrice={product.flash_sale_price}
                                        flashSaleEndsAt={product.flash_sale_ends_at}
                                    />
                                ))}
                            </div>
                        )}
                        <hr className="my-16 border-gray-800" />
                    </>
                )}

                {/* --- Section: Explore Our Top Categories (Now positioned at the bottom of the sections, before the main product grid) --- */}
                <motion.div
                    ref={categoriesRef}
                    className="text-center mb-12 md:mb-16"
                    variants={sectionTitleVariants}
                    initial="hidden"
                    animate={categoriesInView ? "visible" : "hidden"}
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
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-20">
                        {categories.filter(cat => cat.id !== "All").slice(0, 6).map((category, i) => (
                            <motion.div
                                key={category.id}
                                className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl group relative cursor-pointer transform hover:scale-105 transition-transform duration-300 ease-out border border-transparent hover:border-blue-600 aspect-square flex flex-col justify-end"
                                variants={sectionTitleVariants} // Re-using for simpler animation, or you can create a new one
                                initial="hidden"
                                animate={categoriesInView ? "visible" : "hidden"}
                                custom={i}
                            >
                                <Link to={`/collections/${category.link || 'default-category'}`} className="block h-full w-full relative">
                                    <img
                                        src={category.image || `https://placehold.co/180x180/e0e0e0/555555?text=${category.name}`}
                                        alt={category.name}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out opacity-80 group-hover:opacity-100"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                    <div className="p-4 text-left absolute bottom-0 left-0 right-0">
                                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors duration-300 line-clamp-1">
                                            {category.name}
                                        </h3>
                                        <div
                                            className="inline-flex items-center text-blue-400 hover:text-blue-200 transition-colors duration-300 font-semibold text-sm mt-1"
                                        >
                                            Shop Now
                                            <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" />
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
                <hr className="my-16 border-gray-800" />

                {/* --- Section: Main Product Listing with Filtering and Pagination --- */}
                <div id="product-grid-section" className="mt-20">
                    <motion.div
                        ref={allProductsRef}
                        className="text-center mb-12 md:mb-16"
                        variants={sectionTitleVariants}
                        initial="hidden"
                        animate={allProductsInView ? "visible" : "hidden"}
                    >
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 drop-shadow-lg leading-tight">
                            All Our <span className="text-lime-400">Products</span>
                        </h2>
                        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                            Browse our extensive catalog of cutting-edge technology.
                        </p>
                    </motion.div>

                    {/* Category Filter Tabs */}
                    <motion.div
                        className="flex flex-wrap justify-center gap-3 mb-12"
                        initial="hidden"
                        animate={allProductsInView ? "visible" : "hidden"}
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
                        }}
                    >
                        {categories.map((cat) => (
                            <motion.button
                                key={cat.id}
                                onClick={() => { setSelectedCategory(cat.id); setCurrentPage(1); }}
                                className={`px-5 py-2 text-sm rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-md
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
                                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                                {currentProducts.map((product, i) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            handleAddToCart={handleAddToCart}
                                            inView={allProductsInView}
                                            customDelay={i * 0.08}
                                            isFlashSale={product.is_flash_sale}
                                            flashSalePrice={product.flash_sale_price}
                                            flashSaleEndsAt={product.flash_sale_ends_at}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <p className="text-lg text-gray-400">No products found for this category.</p>
                                </div>
                            )}

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center mt-12 space-x-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>
                                    {[...Array(totalPages)].map((_, index) => (
                                        <button
                                            key={index + 1}
                                            onClick={() => handlePageChange(index + 1)}
                                            className={`px-4 py-2 rounded-lg font-semibold transition-colors
                                                ${currentPage === index + 1
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                }`}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ProductShowcase;