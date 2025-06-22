import axios from 'axios';
import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../LoadingSpinner'; 

const Category = () => {
    // State to hold form input values
    const [categoryInput, setCategoryInput] = useState({
        name: '',
        link: '',
        description: '',
        status: false, // Checkbox status
        meta_title: '',
        meta_keywords: '',
        meta_description: '',
        image: null, // New state for selected image file
    });
    // State to hold validation errors from backend
    const [error, setError] = useState({});
    // State for main page loading (e.g., when fetching existing category for edit, not applicable for add)
    const [loading, setLoading] = useState(false);
    // State for submit button loading spinner
    const [updateLoading, setUpdateLoading] = useState(false);
    // New state to manage active tab
    const [activeTab, setActiveTab] = useState('home'); // 'home' or 'seo-tags'
    // State for image preview URL
    const [imagePreview, setImagePreview] = useState(null);

    // Handler for text, checkbox inputs
    const handleInput = (e) => {
        const { name, type, checked, value } = e.target;
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
            setImagePreview(null);
        }
    };

    // Handler for form submission
    const submitCategory = async (e) => {
        e.preventDefault();
        setUpdateLoading(true); // Show spinner on submit button

        // Create FormData to send both text data and the file
        const formData = new FormData();
        formData.append('name', categoryInput.name);
        formData.append('link', categoryInput.link);
        formData.append('description', categoryInput.description);
        formData.append('status', categoryInput.status ? 1 : 0); // Convert boolean to int
        formData.append('meta_title', categoryInput.meta_title);
        formData.append('meta_keywords', categoryInput.meta_keywords);
        formData.append('meta_description', categoryInput.meta_description);
        
        // Append the image file if it exists
        if (categoryInput.image) {
            formData.append('image', categoryInput.image);
        }

        try {
            const res = await axios.post('/api/category/store', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Axios handles this for FormData automatically, but explicit is fine
                },
            });

            if (res.data.status === 200) {
                setError({}); // Clear any previous errors
                toast.success(res.data.message);
                // Reset form fields after successful submission
                setCategoryInput({
                    name: '',
                    link: '',
                    description: '',
                    status: false,
                    meta_title: '',
                    meta_keywords: '',
                    meta_description: '',
                    image: null,
                });
                setImagePreview(null); // Clear image preview
            } else if (res.data.status === 400) {
                // Set validation errors received from backend
                setError(res.data.errors);
                toast.error('Please check the input fields for errors.');
            } else {
                toast.error(res.data.message || 'An unexpected error occurred.');
            }
        } catch (err) {
            if (err.response && err.response.status === 400) {
                setError(err.response.data.errors);
                toast.error('Please check the input fields for errors.');
            } else {
                console.error("Submission error:", err);
                toast.error('Something went wrong. Please try again later.');
            }
        } finally {
            setUpdateLoading(false); // Hide spinner on submit button regardless of outcome
        }
    };

    // Framer Motion variants for section entry
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    // If a full page loading spinner is needed (e.g., for edit mode fetching data), uncomment this
    // For "Add Category" where there's no initial fetch, `loading` state can remain false.
    // if (loading) {
    //     return <LoadingSpinner />;
    // }

    return (
        <motion.div
            className='min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-100 text-gray-800' // Lighter background
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header section with title and View Category button */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 md:mb-0">Add Category</h1> {/* Darker text for header */}
                <Link
                    to="/admin/category/view"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
                >
                    View Categories
                </Link>
            </header>

            {/* Form container */}
            <motion.form
                onSubmit={submitCategory}
                id='categoryForm'
                className='bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8' // White background for form card
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
                    <AnimatePresence mode='wait'> {/* Add AnimatePresence for smooth transitions between tabs */}
                        {activeTab === 'home' && (
                            <motion.div
                                key="homeTab" // Key is essential for AnimatePresence
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
                                        value={categoryInput.name}
                                        type="text"
                                        id="name"
                                        name="name"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                                    />
                                    <small className="text-red-500 text-sm mt-1 block">{error.name}</small>
                                </div>
                                <div className="mb-5">
                                    <label htmlFor="link" className="block text-gray-700 text-sm font-medium mb-2">Link</label>
                                    <input
                                        onChange={handleInput}
                                        value={categoryInput.link}
                                        type="text"
                                        id="link"
                                        name="link"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                                    />
                                    <small className="text-red-500 text-sm mt-1 block">{error.link}</small>
                                </div>
                                <div className="mb-5">
                                    <label htmlFor="description" className="block text-gray-700 text-sm font-medium mb-2">Description</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        onChange={handleInput}
                                        value={categoryInput.description}
                                        rows="4" // Added rows for better textarea appearance
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
                                    <small className="text-red-500 text-sm mt-1 block">{error.image}</small>

                                    {imagePreview && (
                                        <div className="mt-4 border border-gray-300 rounded-lg p-2 flex items-center space-x-4 bg-gray-50">
                                            <img src={imagePreview} alt="Image Preview" className="w-24 h-24 object-cover rounded-md" />
                                            <div>
                                                <p className="text-gray-700 text-sm font-medium">{categoryInput.image?.name}</p>
                                                <button
                                                    type="button"
                                                    onClick={() => { setCategoryInput(prev => ({ ...prev, image: null })); setImagePreview(null); }}
                                                    className="mt-2 text-red-600 hover:text-red-800 text-sm font-semibold transition-colors"
                                                >
                                                    Remove Image
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
                                            className="sr-only peer" // Hide original checkbox visually
                                        />
                                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-200 after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div> {/* Lighter inactive switch background */}
                                        <span className="ml-3 text-gray-700 text-sm font-medium">Status</span> {/* Darker label text */}
                                    </label>
                                </div>
                            </motion.div>
                        )}

                        {/* SEO Tags Tab Pane */}
                        {activeTab === 'seo-tags' && (
                            <motion.div
                                key="seoTab" // Key is essential for AnimatePresence
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
                                        value={categoryInput.meta_title}
                                        type="text"
                                        id="meta_title"
                                        name="meta_title"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                                    />
                                    <small className="text-red-500 text-sm mt-1 block">{error.meta_title}</small>
                                </div>
                                <div className="mb-5">
                                    <label htmlFor="meta_keywords" className="block text-gray-700 text-sm font-medium mb-2">Meta Keywords</label>
                                    <textarea
                                        id="meta_keywords"
                                        name="meta_keywords"
                                        onChange={handleInput}
                                        value={categoryInput.meta_keywords}
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
                                        value={categoryInput.meta_description}
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
                    name='submitCat'
                    disabled={updateLoading} // Disable button when loading
                >
                    {updateLoading ? (
                        <LoadingSpinner size="sm" /> // Use your styled LoadingSpinner component
                    ) : (
                        'Submit'
                    )}
                </button>
            </motion.form>
        </motion.div>
    );
};

export default Category;
