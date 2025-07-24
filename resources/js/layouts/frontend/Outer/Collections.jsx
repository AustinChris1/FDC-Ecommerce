import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Load from '../Components/Load';
import LoadingSpinner from '../Components/Loader';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import { useCart } from '../Components/CartContext';

const Collections = () => {
    const { categoryLink } = useParams();
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedCategoryName, setSelectedCategoryName] = useState('Products');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Pagination State ---
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(12);
    const { addToCart } = useCart();

    // --- Data Fetching: Fetch all products and categories once ---
    useEffect(() => {
        const fetchCategoriesAndProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const productsRes = await axios.get(`/api/allProducts`);
                if (productsRes.data.status === 200) {
                    setProducts(productsRes.data.products);
                    setCategories(productsRes.data.categories);
                } else {
                    toast.error(productsRes.data.message || 'Unable to fetch products');
                    setError(productsRes.data.message || 'Failed to load products.');
                }
            } catch (err) {
                console.error("Error fetching products and categories:", err);
                toast.error('Something went wrong fetching data.');
                setError('Could not load products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchCategoriesAndProducts();
    }, []);

    // --- Filtering Products and Setting Page Title based on URL parameter ---
    useEffect(() => {
        if (!loading && products.length > 0 && categories.length > 0) {
            const currentCategory = categories.find(cat => cat.link === categoryLink);

            if (currentCategory) {
                const filtered = products.filter(product => product.category_id === currentCategory.id);
                setFilteredProducts(filtered);
                setSelectedCategoryName(currentCategory.name);
                document.title = `${currentCategory.name} - Shop`;
            } else {
                setFilteredProducts([]);
                setSelectedCategoryName('Category Not Found');
                document.title = 'Category Not Found - Shop';
            }
            setCurrentPage(1); // Reset to first page whenever filtered products change
        } else if (!loading && products.length === 0 && categories.length === 0) {
            setSelectedCategoryName('No Categories or Products Available');
            document.title = 'No Data - Shop';
        }
    }, [categoryLink, products, categories, loading]);

    // --- Pagination Logic ---
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Framer Motion Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 10,
            },
        },
    };

    const cardHoverVariants = {
        hover: {
            scale: 1.04,
            boxShadow: "0px 15px 30px rgba(0, 0, 0, 0.2)", // Softer shadow for light mode
            transition: {
                duration: 0.3,
                ease: "easeInOut",
            },
        },
        tap: {
            scale: 0.98,
        },
    };

    const imageHoverVariants = {
        hover: {
            scale: 1.15,
            transition: {
                duration: 0.4,
                ease: "easeInOut",
            },
        },
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-zinc-950">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <motion.div
            className="w-full min-h-screen p-6 text-gray-800 bg-gradient-to-br from-gray-100 to-gray-200
                       dark:text-gray-200 dark:bg-gradient-to-br dark:from-zinc-900 dark:to-zinc-950"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="mt-24"></div> {/* Spacer for Navbar */}

            {/* Breadcrumb - Always visible */}
            <motion.nav
                className="text-gray-500 text-sm mb-5 dark:text-gray-400"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                <ul className="flex space-x-2">
                    <li>
                        <Link to="/" className="text-blue-600 hover:underline dark:text-blue-400">Home</Link>
                    </li>
                    <li>/</li>
                    <li>
                        <Link to="/shop" className="text-blue-600 hover:underline dark:text-blue-400">Shop</Link>
                    </li>
                    <li>/</li>
                    <li className="text-gray-800 dark:text-gray-100">{categoryLink || 'Category'}</li>
                </ul>
            </motion.nav>

            {/* Page Title - Always visible */}
            <motion.h1
                className="text-3xl font-bold text-center mb-8 mt-8 text-blue-700 dark:text-blue-400"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
            >
                Collections - {selectedCategoryName}
            </motion.h1>

            {error ? (
                <div className="text-center py-20">
                    <h2 className="text-3xl font-bold text-red-600 mb-4 dark:text-red-500">Error</h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400">{error}</p>
                </div>
            ) : filteredProducts.length === 0 ? (
                <motion.p
                    className="text-center text-xl text-gray-600 dark:text-gray-500"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    No products found for this category.
                </motion.p>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        <AnimatePresence>
                            {currentProducts.map((product) => {
                                const handleAddToCart = (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();

                                    // Check product availability
                                    if (product.status !== 0 || product.qty <= 0) {
                                        toast.error("This product is currently out of stock.");
                                        return;
                                    }

                                    addToCart(product, 1);
                                };

                                return (
                                    <motion.div
                                        key={product.id}
                                        className="group relative border rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 transform hover:scale-105
                                                   bg-white border-gray-200
                                                   dark:bg-gray-800 dark:border-gray-700"
                                        variants={itemVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                    >
                                        <Link to={`/collections/${categoryLink}/${product.link}`} className="block">
                                            <motion.img
                                                src={`/${product.image}`}
                                                alt={product.name}
                                                className="w-full h-56 object-contain transition duration-300"
                                                variants={imageHoverVariants}
                                                initial={false}
                                                whileHover="hover"
                                            />
                                            <div className="p-4 bg-gray-50 dark:bg-gray-900">
                                                <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">{product.name}</h3>
                                                <p className="text-sm text-gray-600 mt-2 dark:text-gray-300">
                                                    {product.description.length > 100
                                                        ? `${product.description.slice(0, 100)}...`
                                                        : product.description}
                                                </p>
                                                <div className="flex justify-between items-center mt-4">
                                                    <span className="text-green-600 font-extrabold text-xl dark:text-lime-400">
                                                        ₦{product.selling_price.toLocaleString()}
                                                    </span>
                                                    <button
                                                        onClick={handleAddToCart}
                                                        className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-colors transform hover:scale-105
                                                                   dark:bg-blue-700 dark:hover:bg-blue-600"
                                                    >
                                                        <ShoppingCart className="w-5 h-5 mr-2" />
                                                    </button>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* --- Pagination Controls --- */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-2 mt-12 mb-8">
                            <motion.button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                    currentPage === 1
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-600'
                                }`}
                                whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                                whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
                            >
                                Previous
                            </motion.button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                                <motion.button
                                    key={number}
                                    onClick={() => paginate(number)}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                        currentPage === number
                                            ? 'bg-blue-500 text-white dark:bg-blue-500'
                                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300'
                                    }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {number}
                                </motion.button>
                            ))}
                            <motion.button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                    currentPage === totalPages
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-600'
                                }`}
                                whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
                                whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
                            >
                                Next
                            </motion.button>
                        </div>
                    )}
                </>
            )}
        </motion.div>
    );
};

export default Collections;