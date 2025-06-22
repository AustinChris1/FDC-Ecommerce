import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../LoadingSpinner'; 

const EditCategory = () => {
    const { id } = useParams(); // Get category ID from URL parameters
    const navigate = useNavigate(); // For navigation
    const [loading, setLoading] = useState(true); // Manages full-page loading for fetching category data
    const [editLoading, setEditLoading] = useState(false); // Manages loading state for the submit button
    const [categoryInput, setCategoryInput] = useState({
        name: '',
        link: '',
        description: '',
        status: false, // Checkbox status
        meta_title: '',
        meta_keywords: '',
        meta_description: '',
        image: null, // New state for selected image file (File object)
        image: '' // To store the path of the existing image from backend
    });
    const [error, setError] = useState({}); // Stores validation errors from backend
    const [activeTab, setActiveTab] = useState('home'); // State to manage active tab: 'home' or 'seo-tags'
    const [imagePreview, setImagePreview] = useState(null); // State for image preview URL

    // Effect to fetch category data when component mounts or ID changes
    useEffect(() => {
        document.title = "Edit Category"; // Set page title
        axios.get(`/api/category/edit/${id}`)
            .then(res => {
                if (res.status === 200 && res.data.category) {
                    const categoryData = res.data.category;
                    setCategoryInput({
                        name: categoryData.name || '',
                        link: categoryData.link || '',
                        description: categoryData.description || '',
                        status: categoryData.status === 1 ? true : false, // Convert int to boolean
                        meta_title: categoryData.meta_title || '',
                        meta_keywords: categoryData.meta_keywords || '',
                        meta_description: categoryData.meta_description || '',
                        image: null, // No file initially selected for edit
                        image: categoryData.image_url || '' // Set current image path
                    });
                    // If there's an existing image, set it for preview
                    if (categoryData.image_url) {
                        setImagePreview(categoryData.image_url);
                    }
                } else if (res.status === 404) {
                    toast.error(res.data.message);
                    navigate('/admin/category/view'); // Redirect if category not found
                } else {
                    toast.error(res.data.message || 'Failed to fetch category details.');
                }
            })
            .catch(err => {
                console.error("Error fetching category:", err);
                toast.error('Failed to fetch category details. Please check network/server.');
                navigate('/admin/category/view'); // Redirect on network error
            })
            .finally(() => {
                setLoading(false); // Stop full-page loading spinner
            });
    }, [id, navigate]); // Dependencies: re-run if ID or navigate function changes

    // Handler for text and checkbox inputs
    const handleInput = (e) => {
        const { name, type, value, checked } = e.target;
        setCategoryInput(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handler for image file input
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCategoryInput(prev => ({ ...prev, image: file }));
            setImagePreview(URL.createObjectURL(file)); // Create a URL for image preview
            setError(prev => ({ ...prev, image: '' })); // Clear any previous image errors
        } else {
            setCategoryInput(prev => ({ ...prev, image: null }));
            // If no new file selected, revert to image for preview if exists
            setImagePreview(categoryInput.image || null);
        }
    };

    // Function to handle category update
    const editCategory = async (e) => {
        e.preventDefault();
        setEditLoading(true); // Show spinner on submit button

        // Create FormData to send both text data and the file
        const formData = new FormData();
        formData.append('_method', 'POST'); // Important for Laravel's PUT/PATCH method spoofing
        formData.append('name', categoryInput.name);
        formData.append('link', categoryInput.link);
        formData.append('description', categoryInput.description);
        formData.append('status', categoryInput.status ? 1 : 0); // Convert boolean to int for backend
        formData.append('meta_title', categoryInput.meta_title);
        formData.append('meta_keywords', categoryInput.meta_keywords);
        formData.append('meta_description', categoryInput.meta_description);

        // Append the image file if a new one is selected
        if (categoryInput.image) {
            formData.append('image', categoryInput.image);
        } else if (categoryInput.image && !imagePreview) {
            // If no new image but current image was removed via preview, send a signal to delete old image
            formData.append('image', ''); // Send empty string or a specific flag
        }

        try {
            const res = await axios.post(`/api/category/update/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Axios handles this for FormData automatically
                },
            });

            if (res.data.status === 200) {
                toast.success(res.data.message);
                setError({}); // Clear errors on success
                navigate('/admin/category/view'); // Navigate back to view categories
            } else if (res.data.status === 422) {
                setError(res.data.errors); // Validation errors from backend
                toast.error('Please check the input fields for errors.');
            } else if (res.data.status === 404) {
                toast.error(res.data.message);
                navigate('/admin/category/view'); // Redirect if category not found on update
            } else {
                toast.error(res.data.message || 'An unexpected error occurred during update.');
            }
        } catch (err) {
            if (err.response && err.response.status === 422) {
                setError(err.response.data.errors);
                toast.error('Please check the input fields for errors.');
            } else {
                console.error("Update error:", err);
                toast.error('Failed to update category, try again.');
            }
        } finally {
            setEditLoading(false); // Hide submit button spinner
        }
    };

    // Framer Motion variants for section entry
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    // Show full-page loading spinner while fetching category details
    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <motion.div
            className='min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-100 text-gray-800' // Lighter background
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header section with title and Back button */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 md:mb-0">Edit Category</h1>
                <Link
                    to="/admin/category/view"
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
                >
                    Back to Categories
                </Link>
            </header>

            {/* Form container */}
            <motion.form
                onSubmit={editCategory}
                id='categoryForm'
                className='bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8'
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                {/* Tab Navigation */}
                <ul className="flex space-x-2 md:space-x-4 border-b border-gray-300 mb-6" role="tablist">
                    <li className="nav-item" role="presentation">
                        <button
                            className={`px-5 py-3 text-lg font-semibold border-b-2 border-transparent transition-colors duration-300 ${activeTab === 'home' ? 'text-blue-600 border-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
                            onClick={() => setActiveTab('home')}
                            type="button"
                            role="tab"
                            aria-controls="home"
                            aria-selected={activeTab === 'home'}
                        >
                            Home
                        </button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button
                            className={`px-5 py-3 text-lg font-semibold border-b-2 border-transparent transition-colors duration-300 ${activeTab === 'seo-tags' ? 'text-blue-600 border-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
                            onClick={() => setActiveTab('seo-tags')}
                            type="button"
                            role="tab"
                            aria-controls="seo-tags"
                            aria-selected={activeTab === 'seo-tags'}
                        >
                            SEO Tags
                        </button>
                    </li>
                </ul>

                {/* Tab Content */}
                <div className="tab-content">
                    {/* Home Tab Pane */}
                    <AnimatePresence mode='wait'>
                        {activeTab === 'home' && (
                            <motion.div
                                key="homeTab"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="tab-pane bg-white rounded-lg p-6 border border-gray-200 show active"
                                role="tabpanel"
                                aria-labelledby="home-tab"
                            >
                                <div className="mb-5">
                                    <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-2">Name</label>
                                    <input
                                        onChange={handleInput}
                                        value={categoryInput.name || ''}
                                        type="text"
                                        id="name"
                                        name="name"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                                    />
                                    <small className="text-red-500 text-sm mt-1 block">{error.name ? error.name[0] : ''}</small>
                                </div>
                                <div className="mb-5">
                                    <label htmlFor="link" className="block text-gray-700 text-sm font-medium mb-2">Link</label>
                                    <input
                                        onChange={handleInput}
                                        value={categoryInput.link || ''}
                                        type="text"
                                        id="link"
                                        name="link"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                                    />
                                    <small className="text-red-500 text-sm mt-1 block">{error.link ? error.link[0] : ''}</small>
                                </div>
                                <div className="mb-5">
                                    <label htmlFor="description" className="block text-gray-700 text-sm font-medium mb-2">Description</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        onChange={handleInput}
                                        value={categoryInput.description || ''}
                                        rows="4"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                                    />
                                </div>

                                {/* Category Image Upload */}
                                <div className="mb-5">
                                    <label htmlFor="image" className="block text-gray-700 text-sm font-medium mb-2">Category Image</label>
                                    <input
                                        type="file"
                                        id="image"
                                        name="image"
                                        onChange={handleImageChange}
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                    <small className="text-red-500 text-sm mt-1 block">{error.image ? error.image[0] : ''}</small>

                                    {(imagePreview || categoryInput.image) && (
                                        <div className="mt-4 border border-gray-300 rounded-lg p-2 flex items-center space-x-4 bg-gray-50">
                                            <img
                                                src={imagePreview || `/${categoryInput.image}`} // Prioritize new preview, then current path
                                                alt="Category Image Preview"
                                                className="w-24 h-24 object-cover rounded-md"
                                                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/96x96/e0e0e0/555555?text=No+Image"; }}
                                            />
                                            <div>
                                                <p className="text-gray-700 text-sm font-medium">
                                                    {categoryInput.image ? categoryInput.image.name : (categoryInput.image ? 'Current Image' : 'No Image')}
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => { setCategoryInput(prev => ({ ...prev, image: null, image: '' })); setImagePreview(null); }}
                                                    className="mt-2 text-red-600 hover:text-red-800 text-sm font-semibold transition-colors"
                                                >
                                                    Remove/Clear Image
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center mb-5">
                                    <label htmlFor="status" className="relative inline-flex items-center cursor-pointer mr-3">
                                        <input
                                            onChange={handleInput}
                                            checked={categoryInput.status}
                                            type='checkbox'
                                            id="status"
                                            name="status"
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-200 after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
                                        <span className="ml-3 text-gray-700 text-sm font-medium">Status</span>
                                    </label>
                                </div>
                            </motion.div>
                        )}

                        {/* SEO Tags Tab Pane */}
                        {activeTab === 'seo-tags' && (
                            <motion.div
                                key="seoTab"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="tab-pane bg-white rounded-lg p-6 border border-gray-200 show active"
                                role="tabpanel"
                                aria-labelledby="seo-tags-tab"
                            >
                                <div className="mb-5">
                                    <label htmlFor="meta_title" className="block text-gray-700 text-sm font-medium mb-2">Meta Title</label>
                                    <input
                                        onChange={handleInput}
                                        value={categoryInput.meta_title || ''}
                                        type="text"
                                        id="meta_title"
                                        name="meta_title"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                                    />
                                    <small className="text-red-500 text-sm mt-1 block">{error.meta_title ? error.meta_title[0] : ''}</small>
                                </div>
                                <div className="mb-5">
                                    <label htmlFor="meta_keywords" className="block text-gray-700 text-sm font-medium mb-2">Meta Keywords</label>
                                    <textarea
                                        id="meta_keywords"
                                        name="meta_keywords"
                                        onChange={handleInput}
                                        value={categoryInput.meta_keywords || ''}
                                        rows="4"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                                    />
                                </div>
                                <div className="mb-5">
                                    <label htmlFor="meta_description" className="block text-gray-700 text-sm font-medium mb-2">Meta Description</label>
                                    <textarea
                                        id="meta_description"
                                        name="meta_description"
                                        onChange={handleInput}
                                        value={categoryInput.meta_description || ''}
                                        rows="4"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Submit Button */}
                <button
                    className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 float-right"
                    type='submit'
                    disabled={editLoading}
                >
                    {editLoading ? (
                        <LoadingSpinner size="sm" />
                    ) : (
                        'Update Category'
                    )}
                </button>
            </motion.form>
        </motion.div>
    );
};

export default EditCategory;
