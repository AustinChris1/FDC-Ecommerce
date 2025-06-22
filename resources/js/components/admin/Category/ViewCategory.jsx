import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ReactPaginate from 'react-paginate'; // Make sure to install this package: npm install react-paginate or yarn add react-paginate
import { motion, AnimatePresence } from 'framer-motion';
// --- IMPORTANT: Adjust this path based on your actual file structure ---
// This path assumes LoadingSpinner is in 'src/components/' and ViewCategory.jsx
// is likely nested two levels deep within 'src' (e.g., 'src/admin/pages/ViewCategory.jsx').
// If this path is still incorrect, please manually verify the exact relative path from
// your ViewCategory.jsx file to your LoadingSpinner component.
import LoadingSpinner from '../LoadingSpinner';
import { toast } from 'react-toastify';
import {
    Edit,       // Lucide icon for Edit
    Trash2,     // Lucide icon for Delete
    Tag,        // Lucide icon for Category Name
    LinkIcon,   // Lucide icon for Category Link
    CheckCircle, // Lucide icon for Active Status
    XCircle      // Lucide icon for Inactive Status
} from 'lucide-react'; // Import Lucide React icons

const ViewCategory = () => {
    const [loading, setLoading] = useState(true); // Manages full-page loading spinner
    const [categories, setCategories] = useState([]); // Stores fetched categories
    const [deleteLoading, setDeleteLoading] = useState({}); // Manages loading state per delete button
    const [currentPage, setCurrentPage] = useState(0); // Current page for pagination
    const itemsPerPage = 6; // Number of categories to display per page (adjusted for card layout)

    // Effect to fetch categories when the component mounts
    useEffect(() => {
        document.title = "Manage Categories"; // Set page title
        axios.get('/api/viewCategory')
            .then(res => {
                if (res.status === 200 && res.data.category) {
                    setCategories(res.data.category);
                } else {
                    toast.error(res.data.message || "Failed to fetch categories.");
                }
            })
            .catch(err => {
                console.error("Error fetching categories:", err);
                toast.error("Network error or server issue. Could not load categories.");
            })
            .finally(() => {
                setLoading(false); // Stop full-page loading spinner
            });
    }, []); // Empty dependency array ensures this runs once on mount

    // Function to handle category deletion
    const deleteCategory = (e, id) => {
        e.preventDefault();
        setDeleteLoading((prev) => ({ ...prev, [id]: true })); // Show loading spinner for specific button

        axios.post(`/api/category/delete/${id}`)
            .then(res => {
                if (res.data.status === 200) {
                    // Filter out the deleted category from the state
                    setCategories(prevCategories => prevCategories.filter(item => item.id !== id));
                    toast.success(res.data.message);
                } else if (res.data.status === 404) {
                    toast.error(res.data.message);
                } else {
                    toast.error(res.data.message || "Failed to delete category.");
                }
            })
            .catch(err => {
                console.error("Error deleting category:", err);
                toast.error(`Failed to delete category: ${err.message || "Network error"}`);
            })
            .finally(() => {
                setDeleteLoading((prev) => ({ ...prev, [id]: false })); // Hide loading spinner for specific button
            });
    };

    // Handler for page click in pagination
    const handlePageClick = (data) => {
        setCurrentPage(data.selected);
    };

    // Calculate categories to display for the current page
    const offset = currentPage * itemsPerPage;
    const displayedCategories = categories.slice(offset, offset + itemsPerPage);

    // If categories data is still loading, display the full-page spinner
    if (loading) {
        return <LoadingSpinner />;
    }

    // Framer Motion variants for main container entry
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    // Framer Motion variants for individual category cards
    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
        exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
        hover: { scale: 1.02, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }
    };

    return (
        <motion.div
            className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-100 text-gray-800" // Lighter background for admin panel
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header section with title and Add Category button */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 bg-white rounded-xl shadow-md p-6">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 sm:mb-0">Categories Management</h1>
                <Link
                    to="/admin/category"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
                >
                    Add Category
                </Link>
            </header>

            {/* Main content area for category cards */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                {displayedCategories.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Grid for cards */}
                        <AnimatePresence>
                            {displayedCategories.map((item) => (
                                <motion.div
                                    key={item.id}
                                    className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col transition-all duration-200"
                                    variants={cardVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    whileHover="hover"
                                >
                                    {/* Category Image */}
                                    <div className="w-full h-40 bg-gray-200 flex items-center justify-center overflow-hidden">
                                        <img
                                            src={`/${item.image || `https://placehold.co/400x200/e0e0e0/555555?text=Category+Image`}`} // Placeholder if no image_url
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x200/e0e0e0/555555?text=Category+Image`; }} // Fallback on error
                                        />
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-4 flex-grow">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                                            <Tag className="w-5 h-5 mr-2 text-blue-500" />
                                            {item.name}
                                        </h3>
                                        <p className="text-gray-600 mb-2 flex items-center">
                                            <LinkIcon className="w-4 h-4 mr-2 text-gray-400" />
                                            <span className="truncate">{item.link}</span>
                                        </p>
                                        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                                            {item.description || "No description provided."}
                                        </p>

                                        {/* Status Badge */}
                                        <div className="mb-4">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {item.status === 0 ? (
                                                    <span className="flex items-center">
                                                        <CheckCircle className="w-3 h-3 mr-1" /> Active
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center">
                                                        <XCircle className="w-3 h-3 mr-1" /> Inactive
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card Actions */}
                                    <div className="p-4 border-t border-gray-100 flex justify-end space-x-2 bg-gray-50">
                                        <Link
                                            to={`/admin/category/edit/${item.id}`}
                                            className="px-4 py-2 rounded-md text-blue-600 hover:bg-blue-100 hover:text-blue-800 transition-colors duration-200 flex items-center"
                                            title="Edit Category"
                                        >
                                            <Edit className="w-4 h-4 mr-1" /> Edit
                                        </Link>
                                        <button
                                            onClick={(e) => deleteCategory(e, item.id)}
                                            className="px-4 py-2 rounded-md text-red-600 hover:bg-red-100 hover:text-red-800 transition-colors duration-200 flex items-center"
                                            disabled={deleteLoading[item.id]}
                                            title="Delete Category"
                                        >
                                            {deleteLoading[item.id] ? (
                                                <LoadingSpinner size="sm" />
                                            ) : (
                                                <>
                                                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-10 text-gray-500 text-lg"
                    >
                        No categories found. Add a new category to get started!
                    </motion.div>
                )}

                {/* Pagination */}
                {categories.length > itemsPerPage && ( // Only show pagination if there are more items than itemsPerPage
                    <div className="mt-8 flex justify-center">
                        <ReactPaginate
                            previousLabel={"«"}
                            nextLabel={"»"}
                            breakLabel={"..."}
                            pageCount={Math.ceil(categories.length / itemsPerPage)}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={3} // Adjust to display fewer pages if desired
                            onPageChange={handlePageClick}
                            containerClassName={"flex space-x-1 items-center"} // Tailwind classes for overall container
                            pageClassName={"block"} // Ensure each page item is a block for padding
                            pageLinkClassName={"block px-4 py-2 leading-tight bg-white border border-gray-300 text-gray-700 hover:bg-gray-200 hover:text-gray-900 rounded-lg transition-colors duration-200"} // Base style for page links
                            previousClassName={"block"}
                            previousLinkClassName={"block px-4 py-2 leading-tight bg-white border border-gray-300 text-gray-700 hover:bg-gray-200 hover:text-gray-900 rounded-lg transition-colors duration-200"}
                            nextClassName={"block"}
                            nextLinkClassName={"block px-4 py-2 leading-tight bg-white border border-gray-300 text-gray-700 hover:bg-gray-200 hover:text-gray-900 rounded-lg transition-colors duration-200"}
                            breakClassName={"block"}
                            breakLinkClassName={"block px-4 py-2 leading-tight bg-white border border-gray-300 text-gray-700 rounded-lg"}
                            activeClassName={"!bg-blue-600 !text-white !border-blue-600 hover:!bg-blue-700"} // Active page style with !important overrides
                            disabledClassName={"opacity-50 cursor-not-allowed"} // Style for disabled prev/next buttons
                        />
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ViewCategory;
