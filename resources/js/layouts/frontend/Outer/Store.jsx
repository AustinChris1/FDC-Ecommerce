import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../Components/Loader'; // Assuming this component exists
import { toast } from 'react-toastify';
import { ChevronDown, SlidersHorizontal, ArrowLeft, ArrowRight, X } from 'lucide-react'; // Added icons for better UI

const itemsPerPageOptions = [4, 8, 12, 16, 20]; // Added more options
const sortingOptions = [
  { value: 'alphaAsc', label: 'Alphabetically, A-Z' },
  { value: 'alphaDesc', label: 'Alphabetically, Z-A' },
  { value: 'featured', label: 'Featured' },
  { value: 'Popular', label: 'Popular' },
  { value: 'priceAsc', label: 'Price, low to high' }, // Added price sorting
  { value: 'priceDesc', label: 'Price, high to low' }, // Added price sorting
  { value: 'dateAsc', label: 'Date, old to new' },
  { value: 'dateDesc', label: 'Date, new to old' }
];

const Store = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 50000]); // Max price can be dynamic or a higher default
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8); // Increased default items per page
  const [sortOption, setSortOption] = useState('alphaAsc');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar

  useEffect(() => {
    let isMounted = true;
    document.title = `Shop | First Digits`;

    // Fetch categories
    axios.get(`/api/getCategory`).then(res => {
      if (isMounted) {
        if (res.data.status === 200) {
          setCategories([{ name: "All", link: "all" }, ...res.data.category]); // Added 'link' for "All" category for consistency
        } else {
          toast.error("Failed to fetch categories.");
        }
      }
    }).catch(err => {
      console.error("Error fetching categories:", err);
      toast.error("Network error fetching categories.");
    });

    const fetchProducts = () => {
      setLoading(true);
      axios.get(`/api/getProducts`, {
        params: {
          category: selectedCategory,
          min_price: priceRange[0],
          max_price: priceRange[1],
          sort: sortOption,
          itemsPerPage: itemsPerPage,
          page: currentPage,
        }
      }).then(res => {
        if (isMounted) {
          if (res.data.status === 200) {
            setProducts(res.data.products.data);
            setTotalPages(res.data.products.last_page);
            setLoading(false);
          } else if (res.data.status === 404) {
            // navigate('/'); // Removed redirect as per user's preference to keep backend functioning
            setProducts([]); // Clear products if 404
            setTotalPages(1);
            setLoading(false);
            toast.info(res.data.message || "No products found for this selection.");
          } else {
            setProducts([]);
            setTotalPages(1);
            setLoading(false);
            toast.error(res.data.message || "An error occurred while fetching products.");
          }
        }
      }).catch((err) => {
        console.error("Error fetching products:", err);
        setProducts([]);
        setTotalPages(1);
        setLoading(false);
        toast.error('Failed to fetch products. Please try again.');
      });
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [navigate, selectedCategory, priceRange, sortOption, itemsPerPage, currentPage]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category.name);
    setCurrentPage(1);
    setIsSidebarOpen(false); // Close sidebar on category select
  };

  const handlePriceChange = (e) => {
    setPriceRange([0, parseInt(e.target.value)]); // Assuming slider only controls max price
    setCurrentPage(1);
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(parseInt(event.target.value));
    setCurrentPage(1);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    hover: { scale: 1.03, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.4)", transition: { duration: 0.2 } }
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)" },
    tap: { scale: 0.95 }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 pt-24 px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
      {/* Mobile Filter Button */}
      <button
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 rounded-full shadow-lg flex items-center justify-center space-x-2 transition-all hover:scale-105"
        onClick={() => setIsSidebarOpen(true)}
        aria-label="Open Filters"
      >
        <SlidersHorizontal className="w-6 h-6" />
        <span>Filters</span>
      </button>

      {/* Sidebar (Desktop and Mobile Overlay) */}
      <AnimatePresence>
        {(isSidebarOpen || window.innerWidth >= 1024) && ( // Show on desktop, or if mobile sidebar is open
          <motion.div
            initial={window.innerWidth < 1024 ? { x: '-100%' } : {}}
            animate={window.innerWidth < 1024 ? { x: 0 } : {}}
            exit={window.innerWidth < 1024 ? { x: '-100%' } : {}}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`fixed lg:static top-0 left-0 h-full w-72 lg:w-1/4 bg-gray-900 z-50 lg:z-auto p-6 shadow-xl lg:shadow-none flex flex-col ${isSidebarOpen ? 'flex' : 'hidden lg:flex'}`}
          >
            <div className="flex justify-between items-center mb-6 lg:hidden">
              <h3 className="text-2xl font-bold text-gray-100">Filters</h3>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700"
                aria-label="Close Filters"
              >
                <X className="w-7 h-7" />
              </button>
            </div>

            {/* Categories */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-cyan-400">Categories</h3>
              <ul className="space-y-3 text-lg">
                {categories.map((category) => (
                  <motion.li
                    key={category.name}
                    className={`cursor-pointer px-4 py-2 rounded-lg transition-all duration-200
                                            ${selectedCategory === category.name
                        ? 'bg-blue-700 text-white font-semibold shadow-md'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-lime-400'
                      }`}
                    onClick={() => handleCategorySelect(category)}
                    whileTap={{ scale: 0.98 }}
                  >
                    {category.name}
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Price Range */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-cyan-400">Price Range</h3>
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-gray-300">₦{priceRange[0]}</span>
                <input
                  type="range"
                  min="0"
                  max="50000" // Example max price, adjust as needed
                  value={priceRange[1]}
                  onChange={handlePriceChange}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-gray-300">₦{priceRange[1]}</span>
              </div>
              <p className="text-sm text-gray-400">Filter up to ₦{priceRange[1]}.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 lg:ml-8"> {/* Adjusted margin for desktop */}
        <h2 className="text-4xl font-extrabold text-center lg:text-left mb-8 text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Our Products
        </h2>

        {/* Sorting and Items per Page */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <label htmlFor="sort" className="text-lg font-medium text-gray-300">Sort by:</label>
            <div className="relative w-full">
              <select
                id="sort"
                value={sortOption}
                onChange={handleSortChange}
                className="block w-full px-4 py-2 pr-10 text-gray-200 bg-gray-800 border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none transition-colors duration-200 cursor-pointer"
              >
                {sortingOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-gray-800 text-gray-200">
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <label htmlFor="itemsPerPage" className="text-lg font-medium text-gray-300">Show:</label>
            <div className="relative w-full">
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="block w-full px-4 py-2 pr-10 text-gray-200 bg-gray-800 border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none transition-colors duration-200 cursor-pointer"
              >
                {itemsPerPageOptions.map((option) => (
                  <option key={option} value={option} className="bg-gray-800 text-gray-200">
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {products.length > 0 ? (
            products.map((product, index) => (
              <motion.div
                key={product.id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                viewport={{ once: true, amount: 0.2 }} // Animate when 20% in view
                className="relative bg-gray-800 rounded-xl shadow-lg flex flex-col p-2 overflow-hidden border border-gray-700 group cursor-pointer"
              >
                <Link
                  to={`/collections/${product.category?.link || 'default-category'}/${product.link}`}
                  className="block h-full"
                >
                  <img
                    src={`/${product.image}`}
                    alt={product.name}
                    className="w-full h-48 object-contain rounded-md mb-2 transform group-hover:scale-105 transition-transform duration-300 ease-in-out"
                  />
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-gray-100 mb-2 truncate group-hover:text-cyan-400 transition-colors duration-200">
                      {product.name}
                    </h3>
                    {product.selling_price && (
                      <p className="text-lime-400 text-xl font-semibold mb-4">
                        ₦{product.selling_price.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <motion.button
                    className="mt-auto w-full bg-blue-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 opacity-90 hover:opacity-100 transition-all duration-300"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
              </motion.div>
            ))
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center text-gray-500 text-xl py-10"
            >
              No products found matching your criteria.
            </motion.p>
          )}
        </motion.div>

        {/* Pagination Controls */}
        <div className="mt-12 flex justify-center items-center space-x-4">
          <button
            className="px-5 py-2 bg-gray-800 text-gray-300 rounded-lg shadow-md hover:bg-gray-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Previous</span>
          </button>

          <span className="text-lg font-medium text-gray-300">
            Page {currentPage} of {totalPages}
          </span>

          <button
            className="px-5 py-2 bg-gray-800 text-gray-300 rounded-lg shadow-md hover:bg-gray-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <span>Next</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Store;