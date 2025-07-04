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
        status: false,
        // NEW: Add states for new fields
        is_new_arrival: false,
        is_flash_sale: false,
        flash_sale_price: '',
        flash_sale_starts_at: '',
        flash_sale_ends_at: ''
    });
    // States for image files and their previews - NOW SUPPORTING 4 IMAGES
    const [picture, setPicture] = useState(null);
    const [picture2, setPicture2] = useState(null);
    const [picture3, setPicture3] = useState(null);
    const [picture4, setPicture4] = useState(null);

    const [imagePreview, setImagePreview] = useState(null);
    const [image2Preview, setImage2Preview] = useState(null);
    const [image3Preview, setImage3Preview] = useState(null);
    const [image4Preview, setImage4Preview] = useState(null);

    // NEW: State for specifications (array of objects {feature: '', value: ''})
    const [specifications, setSpecifications] = useState([{ feature: '', value: '' }]);
    const [feature, setFeature] = useState([{ feature: '' }]);

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

    // Handler for image file inputs - UPDATED FOR 4 IMAGES
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
        } else if (name === 'image3') { // Handle third image
            setPicture3(file);
            setImage3Preview(file ? URL.createObjectURL(file) : null);
            setError(prev => ({ ...prev, image3: '' }));
        } else if (name === 'image4') { // Handle fourth image
            setPicture4(file);
            setImage4Preview(file ? URL.createObjectURL(file) : null);
            setError(prev => ({ ...prev, image4: '' }));
        }
    };

    // Function to remove image preview and file - UPDATED FOR 4 IMAGES
    const removeImage = (imageNumber) => {
        if (imageNumber === 1) {
            setPicture(null);
            setImagePreview(null);
        } else if (imageNumber === 2) {
            setPicture2(null);
            setImage2Preview(null);
        } else if (imageNumber === 3) {
            setPicture3(null);
            setImage3Preview(null);
        } else if (imageNumber === 4) {
            setPicture4(null);
            setImage4Preview(null);
        }
    };

    // NEW: Handlers for features
    const handleFeatureChange = (index, e) => {
        const { name, value } = e.target;
        const newFeature = [...feature];
        newFeature[index][name] = value;
        setFeature(newFeature);
    };

    const addFeature = () => {
        setFeature([...feature, { feature: '' }]);
    };

    const removeFeature = (index) => {
        const newFeature = feature.filter((_, i) => i !== index);
        setFeature(newFeature);
    };

    // NEW: Handlers for specifications
    const handleSpecificationChange = (index, e) => {
        const { name, value } = e.target;
        const newSpecifications = [...specifications];
        newSpecifications[index][name] = value;
        setSpecifications(newSpecifications);
    };

    const addSpecification = () => {
        setSpecifications([...specifications, { feature: '', value: '' }]);
    };

    const removeSpecification = (index) => {
        const newSpecifications = specifications.filter((_, i) => i !== index);
        setSpecifications(newSpecifications);
    };

    // Handler for product form submission - UPDATED FOR 4 IMAGES & SPECIFICATIONS
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

        // NEW: Append new product flags and flash sale details
        formData.append('is_new_arrival', productsInput.is_new_arrival ? 1 : 0);
        formData.append('is_flash_sale', productsInput.is_flash_sale ? 1 : 0);
        
        if (productsInput.is_flash_sale) {
            formData.append('flash_sale_price', parseFloat(productsInput.flash_sale_price) || 0);
            formData.append('flash_sale_starts_at', productsInput.flash_sale_starts_at || '');
            formData.append('flash_sale_ends_at', productsInput.flash_sale_ends_at || '');
        }


        // Append image files if they exist
        if (picture) {
            formData.append('image', picture);
        }
        if (picture2) {
            formData.append('image2', picture2);
        }
        if (picture3) {
            formData.append('image3', picture3);
        }
        if (picture4) {
            formData.append('image4', picture4);
        }

        // NEW: Append specifications as a JSON string
        formData.append('specifications', JSON.stringify(specifications.filter(s => s.feature && s.value)));

        // NEW: Append features as a JSON string
        formData.append('features', JSON.stringify(feature.filter(s => s.feature)));


        try {
            const res = await axios.post('/api/products/store', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
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
                    status: false,
                    is_new_arrival: false,
                    is_flash_sale: false,
                    flash_sale_price: '',
                    flash_sale_starts_at: '',
                    flash_sale_ends_at: ''
                });
                // Clear image states and previews
                setPicture(null);
                setPicture2(null);
                setPicture3(null);
                setPicture4(null);
                setImagePreview(null);
                setImage2Preview(null);
                setImage3Preview(null);
                setImage4Preview(null);
                // NEW: Reset specifications
                setSpecifications([{ feature: '', value: '' }]);
                setFeature([{ feature: '' }]);

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

    return (
        <motion.div
            className='min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-100 text-gray-800'
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 md:mb-0">Add Product</h1>
                <Link
                    to="/admin/products/view"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
                >
                    View Products
                </Link>
            </header>

            <motion.form
                onSubmit={productsForm}
                encType='multipart/form-data'
                id='productsForm'
                className='bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8'
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
                                        <label htmlFor="category_id" className="block text-gray-700 text-sm font-medium mb-2">Category <span className="text-red-500">*</span></label>
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
                                        <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-2">Name <span className="text-red-500">*</span></label>
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
                                        <label htmlFor="link" className="block text-gray-700 text-sm font-medium mb-2">Link <span className="text-red-500">*</span></label>
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
                                        <label htmlFor="brand" className="block text-gray-700 text-sm font-medium mb-2">Brand <span className="text-red-500">*</span></label>
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
                                        <label htmlFor="image" className="block text-gray-700 text-sm font-medium mb-2">Image 1 <span className="text-red-500">*</span></label>
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
                                    <div className="mb-5">
                                        <label htmlFor="image3" className="block text-gray-700 text-sm font-medium mb-2">Image 3</label>
                                        <input
                                            onChange={handleImage}
                                            type="file"
                                            id="image3"
                                            name="image3"
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                        <small className="text-red-500 text-sm mt-1 block">{error.image3 ? error.image3[0] : ''}</small>
                                        {image3Preview && (
                                            <div className="mt-2 border border-gray-300 rounded-lg p-2 flex items-center space-x-4 bg-gray-50">
                                                <img src={image3Preview} alt="Image 3 Preview" className="w-20 h-20 object-cover rounded-md" />
                                                <button type="button" onClick={() => removeImage(3)} className="text-red-600 hover:text-red-800 text-sm font-semibold">Remove</button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mb-5">
                                        <label htmlFor="image4" className="block text-gray-700 text-sm font-medium mb-2">Image 4</label>
                                        <input
                                            onChange={handleImage}
                                            type="file"
                                            id="image4"
                                            name="image4"
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                        <small className="text-red-500 text-sm mt-1 block">{error.image4 ? error.image4[0] : ''}</small>
                                        {image4Preview && (
                                            <div className="mt-2 border border-gray-300 rounded-lg p-2 flex items-center space-x-4 bg-gray-50">
                                                <img src={image4Preview} alt="Image 4 Preview" className="w-20 h-20 object-cover rounded-md" />
                                                <button type="button" onClick={() => removeImage(4)} className="text-red-600 hover:text-red-800 text-sm font-semibold">Remove</button>
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
                                    <label htmlFor="meta_title" className="block text-gray-700 text-sm font-medium mb-2">Meta Title <span className="text-red-500">*</span></label>
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
                                        <label htmlFor="selling_price" className="block text-gray-700 text-sm font-medium mb-2">Selling Price <span className="text-red-500">*</span></label>
                                        <input
                                            onChange={handleInput}
                                            value={productsInput.selling_price || ''}
                                            type="number"
                                            id="selling_price"
                                            name="selling_price"
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                                        />
                                        <small className="text-red-500 text-sm mt-1 block">{error.selling_price ? error.selling_price[0] : ''}</small>
                                    </div>
                                    <div className="mb-5">
                                        <label htmlFor="original_price" className="block text-gray-700 text-sm font-medium mb-2">Original Price <span className="text-red-500">*</span></label>
                                        <input
                                            onChange={handleInput}
                                            value={productsInput.original_price || ''}
                                            type="number"
                                            id="original_price"
                                            name="original_price"
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                                        />
                                        <small className="text-red-500 text-sm mt-1 block">{error.original_price ? error.original_price[0] : ''}</small>
                                    </div>
                                </div>
                                <div className="mb-5">
                                    <label htmlFor="qty" className="block text-gray-700 text-sm font-medium mb-2">Quantity <span className="text-red-500">*</span></label>
                                    <input
                                        onChange={handleInput}
                                        value={productsInput.qty || ''}
                                        type="number"
                                        id="qty"
                                        name="qty"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                                    />
                                    <small className="text-red-500 text-sm mt-1 block">{error.qty ? error.qty[0] : ''}</small>
                                </div>

                                {/* Product Flags */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
                                    <div className="flex items-center mb-5">
                                        <input
                                            onChange={handleInput}
                                            checked={productsInput.featured}
                                            type="checkbox"
                                            id="featured"
                                            name="featured"
                                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="featured" className="ml-3 block text-gray-700 text-sm font-medium">Featured Product</label>
                                    </div>
                                    <div className="flex items-center mb-5">
                                        <input
                                            onChange={handleInput}
                                            checked={productsInput.popular}
                                            type="checkbox"
                                            id="popular"
                                            name="popular"
                                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="popular" className="ml-3 block text-gray-700 text-sm font-medium">Popular Product</label>
                                    </div>
                                    <div className="flex items-center mb-5">
                                        <input
                                            onChange={handleInput}
                                            checked={productsInput.status}
                                            type="checkbox"
                                            id="status"
                                            name="status"
                                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="status" className="ml-3 block text-gray-700 text-sm font-medium">Status (Hidden/Shown)</label>
                                    </div>
                                    {/* New Arrival Checkbox */}
                                    <div className="flex items-center mb-5">
                                        <input
                                            onChange={handleInput}
                                            checked={productsInput.is_new_arrival}
                                            type="checkbox"
                                            id="is_new_arrival"
                                            name="is_new_arrival"
                                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="is_new_arrival" className="ml-3 block text-gray-700 text-sm font-medium">New Arrival</label>
                                    </div>
                                    {/* Flash Sale Checkbox */}
                                    <div className="flex items-center mb-5">
                                        <input
                                            onChange={handleInput}
                                            checked={productsInput.is_flash_sale}
                                            type="checkbox"
                                            id="is_flash_sale"
                                            name="is_flash_sale"
                                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="is_flash_sale" className="ml-3 block text-gray-700 text-sm font-medium">Flash Sale</label>
                                    </div>
                                </div>

                                {/* Flash Sale Details (conditionally rendered) */}
                                {productsInput.is_flash_sale && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="border-t border-gray-200 pt-6 mt-6"
                                    >
                                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Flash Sale Details</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6">
                                            <div className="mb-5">
                                                <label htmlFor="flash_sale_price" className="block text-gray-700 text-sm font-medium mb-2">Flash Sale Price <span className="text-red-500">*</span></label>
                                                <input
                                                    onChange={handleInput}
                                                    value={productsInput.flash_sale_price || ''}
                                                    type="number"
                                                    id="flash_sale_price"
                                                    name="flash_sale_price"
                                                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                                                />
                                                <small className="text-red-500 text-sm mt-1 block">{error.flash_sale_price ? error.flash_sale_price[0] : ''}</small>
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="flash_sale_starts_at" className="block text-gray-700 text-sm font-medium mb-2">Sale Start Date <span className="text-red-500">*</span></label>
                                                <input
                                                    onChange={handleInput}
                                                    value={productsInput.flash_sale_starts_at || ''}
                                                    type="datetime-local"
                                                    id="flash_sale_starts_at"
                                                    name="flash_sale_starts_at"
                                                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                                                />
                                                <small className="text-red-500 text-sm mt-1 block">{error.flash_sale_starts_at ? error.flash_sale_starts_at[0] : ''}</small>
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="flash_sale_ends_at" className="block text-gray-700 text-sm font-medium mb-2">Sale End Date <span className="text-red-500">*</span></label>
                                                <input
                                                    onChange={handleInput}
                                                    value={productsInput.flash_sale_ends_at || ''}
                                                    type="datetime-local"
                                                    id="flash_sale_ends_at"
                                                    name="flash_sale_ends_at"
                                                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                                                />
                                                <small className="text-red-500 text-sm mt-1 block">{error.flash_sale_ends_at ? error.flash_sale_ends_at[0] : ''}</small>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Features Section */}
                                <div className="border-t border-gray-200 pt-6 mt-6">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex justify-between items-center">
                                        Product Features
                                        <button
                                            type="button"
                                            onClick={addFeature}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300"
                                        >
                                            Add Feature
                                        </button>
                                    </h3>
                                    {feature.map((feat, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-x-6 items-end mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <div className="md:col-span-2">
                                                <label htmlFor={`feature-${index}`} className="block text-gray-700 text-sm font-medium mb-2">Feature Name</label>
                                                <input
                                                    type="text"
                                                    id={`feature-${index}`}
                                                    name="feature"
                                                    value={feat.feature}
                                                    onChange={(e) => handleFeatureChange(index, e)}
                                                    className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                                                    placeholder="e.g., Color, Material"
                                                />
                                            </div>
                                            <div className="mt-4 md:mt-0 flex justify-end">
                                                {feature.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFeature(index)}
                                                        className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 w-full"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <small className="text-red-500 text-sm mt-1 block">{error.features ? error.features[0] : ''}</small>
                                </div>

                                {/* Specifications Section */}
                                <div className="border-t border-gray-200 pt-6 mt-6">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex justify-between items-center">
                                        Product Specifications
                                        <button
                                            type="button"
                                            onClick={addSpecification}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300"
                                        >
                                            Add Specification
                                        </button>
                                    </h3>
                                    {specifications.map((spec, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-x-6 items-end mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <div>
                                                <label htmlFor={`spec-feature-${index}`} className="block text-gray-700 text-sm font-medium mb-2">Specification Feature</label>
                                                <input
                                                    type="text"
                                                    id={`spec-feature-${index}`}
                                                    name="feature"
                                                    value={spec.feature}
                                                    onChange={(e) => handleSpecificationChange(index, e)}
                                                    className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                                                    placeholder="e.g., Screen Size"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor={`spec-value-${index}`} className="block text-gray-700 text-sm font-medium mb-2">Specification Value</label>
                                                <input
                                                    type="text"
                                                    id={`spec-value-${index}`}
                                                    name="value"
                                                    value={spec.value}
                                                    onChange={(e) => handleSpecificationChange(index, e)}
                                                    className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                                                    placeholder="e.g., 6.7 inches"
                                                />
                                            </div>
                                            <div className="mt-4 md:mt-0 flex justify-end">
                                                {specifications.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSpecification(index)}
                                                        className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 w-full"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <small className="text-red-500 text-sm mt-1 block">{error.specifications ? error.specifications[0] : ''}</small>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        type="submit"
                        className="px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center min-w-[120px]"
                        disabled={addLoading}
                    >
                        {addLoading ? <LoadingSpinner /> : 'Add Product'}
                    </button>
                </div>
            </motion.form>
        </motion.div>
    );
};

export default Products;