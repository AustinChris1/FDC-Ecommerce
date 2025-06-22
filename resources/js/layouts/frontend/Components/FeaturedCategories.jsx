import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Loader2, DollarSign } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import axios from 'axios';
import { toast } from 'react-toastify'; // Ensure toast is imported if you're using it

const FeaturedCategories = () => {
    // --- Data and State Management (from your query) ---
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

    // Fetch categories and all products from the backend
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
                    setProducts(productsRes.data.products);
                } else {
                    toast.error("Unable to fetch products");
                    console.error("Backend error fetching products:", productsRes.data.message);
                }
            } catch (error) {
                console.error("Network or server error:", error);
                toast.error("Failed to load data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []); // Empty dependency array means this runs once on mount

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
        // Optional: Scroll to the top of the product grid when changing page
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
                                <div className="relative pt-[70%] overflow-hidden">
                                    <img
                                            src={category.image || `https://placehold.co/400x200/e0e0e0/555555?text=Category+Image`} // Placeholder if no image_url
                                            alt={category.name}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out opacity-80 group-hover:opacity-100"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                </div>
                                <div className="p-6 text-left">
                                    <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-cyan-400 transition-colors duration-300">
                                        {category.name}
                                    </h3>
                                    <Link
                                        to={`/collections/${category.link}`}
                                        className="inline-flex items-center text-blue-400 hover:text-blue-200 transition-colors duration-300 font-semibold group"
                                    >
                                        Shop Now
                                        <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                                    </Link>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
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
                                            {/* Product Image */}
                                            <div className="relative pt-[100%] overflow-hidden"> {/* 1:1 Aspect ratio */}
                                                <img
                                                    src={`/${product.image}`} // Use actual image path
                                                    alt={product.name}
                                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out opacity-80 group-hover:opacity-100"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                            </div>

                                            {/* Product Details */}
                                            <div className="p-6 text-left">
                                                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-lime-400 transition-colors duration-300 line-clamp-2">
                                                    {product.name}
                                                </h3>
                                                <p className="text-gray-400 mb-3 text-sm line-clamp-2">
                                                    {product.description || 'No description available.'}
                                                </p>
                                                <div className="flex items-center justify-between mt-4">
                                                    <p className="text-2xl font-bold text-cyan-400 flex items-center">
                                                        ₦{product.selling_price}
                                                    </p>
                                                    <Link
                                                        to={`/collections/${product.category?.link || 'default-category'}/${product.link}`}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 flex items-center"
                                                    >
                                                        Details
                                                        <ArrowRight className="w-4 h-4 ml-1" />
                                                    </Link>
                                                </div>
                                            </div>
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