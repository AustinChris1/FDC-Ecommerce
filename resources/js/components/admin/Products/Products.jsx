import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../LoadingSpinner'; 

const Products = () => {
    // State to hold fetched categories for the dropdown
    const [category, setCategory] = useState([]);
    // State to hold form input values for the product
    const [productsInput, setProductsInput] = useState({
        category_id: '',
        name: '',
        link: '',
        description: '',
        meta_title: '',
        meta_keywords: '',
        meta_description: '',
        selling_price: '',
        original_price: '',
        qty: '',
        brand: '',
        featured: false,
        popular: false,
        status: false
    });
    // States for image files and their previews
    const [picture, setPicture] = useState(null);
    const [picture2, setPicture2] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [image2Preview, setImage2Preview] = useState(null);

    // State for validation errors from backend
    const [error, setError] = useState({});
    // State for submit button loading spinner
    const [addLoading, setAddLoading] = useState(false);

    // State to manage active tab: 'home', 'seo-tags', or 'otherdetails'
    const [activeTab, setActiveTab] = useState('home');

    // Effect to fetch categories when the component mounts
    useEffect(() => {
        axios.get('/api/allCategory')
            .then(res => {
                if (res.status === 200 && res.data.category) {
                    setCategory(res.data.category);
                } else {
                    toast.error(res.data.message || 'Failed to fetch categories.');
                }
            })
            .catch(err => {
                console.error('Error fetching category:', err);
                toast.error('Network error or server issue. Could not load categories.');
            });
    }, []); // Empty dependency array means this runs once on mount

    // Handler for text, select, and checkbox inputs
    const handleInput = (e) => {
        const { name, type, value, checked } = e.target;
        setProductsInput(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    // Handler for image file inputs
    const handleImage = (e) => {
        const { name, files } = e.target;
        const file = files[0];

        if (name === 'image') {
            setPicture(file);
            setImagePreview(file ? URL.createObjectURL(file) : null);
            setError(prev => ({ ...prev, image: '' })); // Clear specific error
        } else if (name === 'image2') {
            setPicture2(file);
            setImage2Preview(file ? URL.createObjectURL(file) : null);
            setError(prev => ({ ...prev, image2: '' })); // Clear specific error
        }
    };

    // Function to remove image preview and file
    const removeImage = (imageNumber) => {
        if (imageNumber === 1) {
            setPicture(null);
            setImagePreview(null);
        } else if (imageNumber === 2) {
            setPicture2(null);
            setImage2Preview(null);
        }
    };

    // Handler for product form submission
    const productsForm = async (e) => {
        e.preventDefault();
        setAddLoading(true); // Show spinner on submit button

        const formData = new FormData();
        // Append all product data to FormData
        formData.append('category_id', productsInput.category_id || '');
        formData.append('name', productsInput.name || '');
        formData.append('link', productsInput.link || '');
        formData.append('description', productsInput.description || '');
        formData.append('meta_title', productsInput.meta_title || '');
        formData.append('meta_keywords', productsInput.meta_keywords || '');
        formData.append('meta_description', productsInput.meta_description || '');
        
        // Ensure numerical fields are numbers, default to 0 if empty
        formData.append('selling_price', parseFloat(productsInput.selling_price) || 0);
        formData.append('original_price', parseFloat(productsInput.original_price) || 0);
        formData.append('qty', parseInt(productsInput.qty) || 0);
        formData.append('brand', productsInput.brand || '');
        
        // Convert checkboxes to 1 or 0
        formData.append('featured', productsInput.featured ? 1 : 0);
        formData.append('popular', productsInput.popular ? 1 : 0);
        formData.append('status', productsInput.status ? 1 : 0);

        // Append image files if they exist
        if (picture) {
            formData.append('image', picture);
        }
        if (picture2) {
            formData.append('image2', picture2);
        }

        try {
            const res = await axios.post('/api/products/store', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data' // Axios handles this for FormData automatically, but explicit is fine
                }
            });

            if (res.data.status === 200) {
                setError({}); // Clear any previous errors
                toast.success(res.data.message);
                // Reset form fields after successful submission
                setProductsInput({
                    category_id: '',
                    name: '',
                    link: '',
                    description: '',
                    meta_title: '',
                    meta_keywords: '',
                    meta_description: '',
                    selling_price: '',
                    original_price: '',
                    qty: '',
                    brand: '',
                    featured: false,
                    popular: false,
                    status: false
                });
                // Clear image states and previews
                setPicture(null);
                setPicture2(null);
                setImagePreview(null);
                setImage2Preview(null);
            } else if (res.data.status === 400) {
                setError(res.data.errors); // Set validation errors from backend
                toast.error('Please check the input fields for errors.');
            } else {
                toast.error(res.data.message || 'An unexpected error occurred.');
            }
        } catch (err) {
            if (err.response && err.response.status === 422) {
                setError(err.response.data.errors);
                toast.error('Please check the input fields.');
            } else {
                console.error("Submission error:", err);
                toast.error('Something went wrong. Please try again later.');
            }
        } finally {
            setAddLoading(false); // Hide spinner on submit button
        }
    };

    // Framer Motion variants for section entry
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    // If a full page loading spinner is needed (e.g., for initial data fetch if any)
    // if (loading) { // assuming a 'loading' state for initial fetches not just addLoading
    //     return <LoadingSpinner />;
    // }

    return (
        <motion.div
            className='min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-100 text-gray-800' // Lighter background
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header section with title and View Products button */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 md:mb-0">Add Product</h1> {/* Darker text for header */}
                <Link
                    to="/admin/products/view"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
                >
                    View Products
                </Link>
            </header>

            {/* Form container */}
            <motion.form
                onSubmit={productsForm}
                encType='multipart/form-data' // Important for file uploads
                id='productsForm'
                className='bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8' // White background for form card
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                {/* Tab Navigation */}
                <ul className="flex flex-wrap space-x-2 md:space-x-4 border-b border-gray-300 mb-6" role="tablist">
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
                    <li className="nav-item" role="presentation">
                        <button
                            className={`px-5 py-3 text-lg font-semibold border-b-2 border-transparent transition-colors duration-300 ${activeTab === 'otherdetails' ? 'text-blue-600 border-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
                            onClick={() => setActiveTab('otherdetails')}
                            type="button"
                            role="tab"
                            aria-controls="otherdetails"
                            aria-selected={activeTab === 'otherdetails'}
                        >
                            Other Details
                        </button>
                    </li>
                </ul>

                {/* Tab Content */}
                <div className="tab-content">
                    <AnimatePresence mode='wait'>
                        {/* Home Tab Pane */}
                        {activeTab === 'home' && (
                            <motion.div
                                key="homeTab"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="tab-pane bg-white rounded-lg p-6 border border-gray-200"
                                role="tabpanel"
                                aria-labelledby="home-tab"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                    <div className="mb-5">
                                        <label htmlFor="category_id" className="block text-gray-700 text-sm font-medium mb-2">Category</label>
                                        <select
                                            onChange={handleInput}
                                            value={productsInput.category_id || ''}
                                            id="category_id"
                                            name="category_id"
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                                        >
                                            <option value="">Select Category</option>
                                            {category.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <small className="text-red-500 text-sm mt-1 block">{error.category_id ? error.category_id[0] : ''}</small>
                                    </div>
                                    <div className="mb-5">
                                        <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-2">Name</label>
                                        <input
                                            onChange={handleInput}
                                            value={productsInput.name || ''}
                                            type="text"
                                            id="name"
                                            name="name"
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                                        />
                                        <small className="text-red-500 text-sm mt-1 block">{error.name ? error.name[0] : ''}</small>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                    <div className="mb-5">
                                        <label htmlFor="link" className="block text-gray-700 text-sm font-medium mb-2">Link</label>
                                        <input
                                            onChange={handleInput}
                                            value={productsInput.link || ''}
                                            type="text"
                                            id="link"
                                            name="link"
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                                        />
                                        <small className="text-red-500 text-sm mt-1 block">{error.link ? error.link[0] : ''}</small>
                                    </div>
                                    <div className="mb-5">
                                        <label htmlFor="brand" className="block text-gray-700 text-sm font-medium mb-2">Brand</label>
                                        <input
                                            onChange={handleInput}
                                            value={productsInput.brand || ''}
                                            type="text"
                                            id="brand"
                                            name="brand"
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                                        />
                                        <small className="text-red-500 text-sm mt-1 block">{error.brand ? error.brand[0] : ''}</small>
                                    </div>
                                </div>
                                <div className="mb-5">
                                    <label htmlFor="description" className="block text-gray-700 text-sm font-medium mb-2">Description</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        onChange={handleInput}
                                        value={productsInput.description || ''}
                                        rows="4"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                                    />
                                    <small className="text-red-500 text-sm mt-1 block">{error.description ? error.description[0] : ''}</small>
                                </div>

                                {/* Images Upload */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                    <div className="mb-5">
                                        <label htmlFor="image" className="block text-gray-700 text-sm font-medium mb-2">Image 1</label>
                                        <input
                                            onChange={handleImage}
                                            type="file"
                                            id="image"
                                            name="image"
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                        <small className="text-red-500 text-sm mt-1 block">{error.image ? error.image[0] : ''}</small>
                                        {imagePreview && (
                                            <div className="mt-2 border border-gray-300 rounded-lg p-2 flex items-center space-x-4 bg-gray-50">
                                                <img src={imagePreview} alt="Image 1 Preview" className="w-20 h-20 object-cover rounded-md" />
                                                <button type="button" onClick={() => removeImage(1)} className="text-red-600 hover:text-red-800 text-sm font-semibold">Remove</button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mb-5">
                                        <label htmlFor="image2" className="block text-gray-700 text-sm font-medium mb-2">Image 2</label>
                                        <input
                                            onChange={handleImage}
                                            type="file"
                                            id="image2"
                                            name="image2"
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                        <small className="text-red-500 text-sm mt-1 block">{error.image2 ? error.image2[0] : ''}</small>
                                        {image2Preview && (
                                            <div className="mt-2 border border-gray-300 rounded-lg p-2 flex items-center space-x-4 bg-gray-50">
                                                <img src={image2Preview} alt="Image 2 Preview" className="w-20 h-20 object-cover rounded-md" />
                                                <button type="button" onClick={() => removeImage(2)} className="text-red-600 hover:text-red-800 text-sm font-semibold">Remove</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* SEO Tags Tab */}
                        {activeTab === 'seo-tags' && (
                            <motion.div
                                key="seoTab"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="tab-pane bg-white rounded-lg p-6 border border-gray-200"
                                role="tabpanel"
                                aria-labelledby="seo-tags-tab"
                            >
                                <div className="mb-5">
                                    <label htmlFor="meta_title" className="block text-gray-700 text-sm font-medium mb-2">Meta Title</label>
                                    <input
                                        onChange={handleInput}
                                        value={productsInput.meta_title || ''}
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
                                        value={productsInput.meta_keywords || ''}
                                        rows="4"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                                    />
                                    <small className="text-red-500 text-sm mt-1 block">{error.meta_keywords ? error.meta_keywords[0] : ''}</small>
                                </div>
                                <div className="mb-5">
                                    <label htmlFor="meta_description" className="block text-gray-700 text-sm font-medium mb-2">Meta Description</label>
                                    <textarea
                                        id="meta_description"
                                        name="meta_description"
                                        onChange={handleInput}
                                        value={productsInput.meta_description || ''}
                                        rows="4"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                                    />
                                    <small className="text-red-500 text-sm mt-1 block">{error.meta_description ? error.meta_description[0] : ''}</small>
                                </div>
                            </motion.div>
                        )}

                        {/* Other Details Tab */}
                        {activeTab === 'otherdetails' && (
                            <motion.div
                                key="otherDetailsTab"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="tab-pane bg-white rounded-lg p-6 border border-gray-200"
                                role="tabpanel"
                                aria-labelledby="otherdetails-tab"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                    <div className="mb-5">
                                        <label htmlFor="selling_price" className="block text-gray-700 text-sm font-medium mb-2">Selling Price</label>
                                        <input
                                            onChange={handleInput}
                                            value={productsInput.selling_price || ''}
                                            type="number" // Changed to number type for prices
                                            id="selling_price"
                                            name="selling_price"
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                                        />
                                        <small className="text-red-500 text-sm mt-1 block">{error.selling_price ? error.selling_price[0] : ''}</small>
                                    </div>
                                    <div className="mb-5">
                                        <label htmlFor="original_price" className="block text-gray-700 text-sm font-medium mb-2">Original Price</label>
                                        <input
                                            onChange={handleInput}
                                            value={productsInput.original_price || ''}
                                            type="number" // Changed to number type for prices
                                            id="original_price"
                                            name="original_price"
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                                        />
                                        <small className="text-red-500 text-sm mt-1 block">{error.original_price ? error.original_price[0] : ''}</small>
                                    </div>
                                </div>
                                <div className="mb-5">
                                    <label htmlFor="qty" className="block text-gray-700 text-sm font-medium mb-2">Quantity</label>
                                    <input
                                        onChange={handleInput}
                                        value={productsInput.qty || ''}
                                        type="number" // Changed to number type for quantity
                                        id="qty"
                                        name="qty"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                                    />
                                    <small className="text-red-500 text-sm mt-1 block">{error.qty ? error.qty[0] : ''}</small>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6">
                                    <div className="mb-5">
                                        <label htmlFor="featured" className="relative inline-flex items-center cursor-pointer mr-3">
                                            <input
                                                onChange={handleInput}
                                                checked={productsInput.featured}
                                                type='checkbox'
                                                id="featured"
                                                name="featured"
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-200 after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
                                            <span className="ml-3 text-gray-700 text-sm font-medium">Featured</span>
                                        </label>
                                        <small className="text-red-500 text-sm mt-1 block">{error.featured ? error.featured[0] : ''}</small>
                                    </div>
                                    <div className="mb-5">
                                        <label htmlFor="popular" className="relative inline-flex items-center cursor-pointer mr-3">
                                            <input
                                                onChange={handleInput}
                                                checked={productsInput.popular}
                                                type='checkbox'
                                                id="popular"
                                                name="popular"
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-200 after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
                                            <span className="ml-3 text-gray-700 text-sm font-medium">Popular</span>
                                        </label>
                                        <small className="text-red-500 text-sm mt-1 block">{error.popular ? error.popular[0] : ''}</small>
                                    </div>
                                    <div className="mb-5">
                                        <label htmlFor="status" className="relative inline-flex items-center cursor-pointer mr-3">
                                            <input
                                                onChange={handleInput}
                                                checked={productsInput.status}
                                                type='checkbox'
                                                id="status"
                                                name="status"
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-200 after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
                                            <span className="ml-3 text-gray-700 text-sm font-medium">Status</span>
                                        </label>
                                        <small className="text-red-500 text-sm mt-1 block">{error.status ? error.status[0] : ''}</small>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Submit Button */}
                <button
                    className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 float-right"
                    type='submit'
                    disabled={addLoading}
                >
                    {addLoading ? (
                        <LoadingSpinner size="sm" />
                    ) : (
                        'Add Product'
                    )}
                </button>
            </motion.form>
        </motion.div>
    );
};

export default Products;
