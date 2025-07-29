import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { toast } from 'react-toastify';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../LoadingSpinner';

const Products = () => {
    const navigate = useNavigate(); // Initialize navigate hook
    const [category, setCategory] = useState([]);
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
        qty: '', // This is still your online/master quantity
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
    const [picture, setPicture] = useState(null);
    const [picture2, setPicture2] = useState(null);
    const [picture3, setPicture3] = useState(null);
    const [picture4, setPicture4] = useState(null);

    const [imagePreview, setImagePreview] = useState(null);
    const [image2Preview, setImage2Preview] = useState(null);
    const [image3Preview, setImage3Preview] = useState(null);
    const [image4Preview, setImage4Preview] = useState(null);

    const [specifications, setSpecifications] = useState([{ feature: '', value: '' }]);
    const [feature, setFeature] = useState([{ feature: '' }]);

    const [error, setError] = useState({});
    const [addLoading, setAddLoading] = useState(false);

    // No 'inventory-by-location' tab for Add Product
    const [activeTab, setActiveTab] = useState('home');

    useEffect(() => {
        document.title = "Add Product"; // Set page title
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
    }, []);

    const handleInput = (e) => {
        const { name, type, value, checked } = e.target;
        setProductsInput(prev => {
            const newState = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };

            if (name === 'is_flash_sale' && !checked) {
                newState.flash_sale_price = '';
                newState.flash_sale_starts_at = '';
                newState.flash_sale_ends_at = '';
                setError(prevErrors => {
                    const newErrors = { ...prevErrors };
                    delete newErrors.flash_sale_price;
                    delete newErrors.flash_sale_starts_at;
                    delete newErrors.flash_sale_ends_at;
                    return newErrors;
                });
            }
            return newState;
        });
    };

    const handleImage = (e) => {
        const { name, files } = e.target;
        const file = files[0];

        if (name === 'image') {
            setPicture(file);
            setImagePreview(file ? URL.createObjectURL(file) : null);
            setError(prev => ({ ...prev, image: '' }));
        } else if (name === 'image2') {
            setPicture2(file);
            setImage2Preview(file ? URL.createObjectURL(file) : null);
            setError(prev => ({ ...prev, image2: '' }));
        } else if (name === 'image3') {
            setPicture3(file);
            setImage3Preview(file ? URL.createObjectURL(file) : null);
            setError(prev => ({ ...prev, image3: '' }));
        } else if (name === 'image4') {
            setPicture4(file);
            setImage4Preview(file ? URL.createObjectURL(file) : null);
            setError(prev => ({ ...prev, image4: '' }));
        }
    };

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

    const productsForm = async (e) => {
        e.preventDefault();
        setAddLoading(true);

        const formData = new FormData();
        formData.append('category_id', productsInput.category_id || '');
        formData.append('name', productsInput.name || '');
        formData.append('link', productsInput.link || '');
        formData.append('description', productsInput.description || '');
        formData.append('meta_title', productsInput.meta_title || '');
        formData.append('meta_keywords', productsInput.meta_keywords || '');
        formData.append('meta_description', productsInput.meta_description || '');

        formData.append('selling_price', parseFloat(productsInput.selling_price) || 0);
        formData.append('original_price', parseFloat(productsInput.original_price) || 0);
        formData.append('qty', parseInt(productsInput.qty) || 0);
        formData.append('brand', productsInput.brand || '');

        formData.append('featured', productsInput.featured ? 1 : 0);
        formData.append('popular', productsInput.popular ? 1 : 0);
        formData.append('status', productsInput.status ? 1 : 0);

        formData.append('is_new_arrival', productsInput.is_new_arrival ? 1 : 0);
        formData.append('is_flash_sale', productsInput.is_flash_sale ? 1 : 0);

        if (productsInput.is_flash_sale) {
            formData.append('flash_sale_price', parseFloat(productsInput.flash_sale_price) || 0);
            formData.append('flash_sale_starts_at', productsInput.flash_sale_starts_at || '');
            formData.append('flash_sale_ends_at', productsInput.flash_sale_ends_at || '');
        }

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

        formData.append('specifications', JSON.stringify(specifications.filter(s => s.feature && s.value)));
        formData.append('features', JSON.stringify(feature.filter(s => s.feature)));

        try {
            const res = await axios.post('/api/products/store', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`, // Add auth token
                }
            });

            if (res.data.status === 200) {
                setError({});
                toast.success(res.data.message);
                // NEW: Redirect to the Edit Product page for the newly created product
                if (res.data.product && res.data.product.id) {
                    navigate(`/admin/products/edit/${res.data.product.id}`);
                } else {
                    // Fallback if product ID is not returned (should not happen with good backend)
                    navigate('/admin/products/view');
                }
            } else if (res.data.status === 400 || res.data.status === 422) { // Combined 400 and 422
                setError(res.data.errors);
                // Display all errors from the backend
                Object.values(res.data.errors).forEach(errArr => {
                    errArr.forEach(err => toast.error(err));
                });
                toast.error('Please correct the input fields for errors.');
            } else {
                toast.error(res.data.message || 'An unexpected error occurred.');
            }
        } catch (err) {
            if (err.response && (err.response.status === 400 || err.response.status === 422)) {
                setError(err.response.data.errors);
                Object.values(err.response.data.errors).forEach(errArr => {
                    errArr.forEach(err => toast.error(err));
                });
                toast.error('Please check the input fields.');
            } else {
                console.error("Submission error:", err);
                toast.error('Something went wrong. Please try again later.');
            }
        } finally {
            setAddLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    return (
        <motion.div
            className='min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white rounded-xl shadow-md p-6 dark:bg-gray-800 dark:text-gray-100">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 md:mb-0 dark:text-white">Add Product</h1>
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
                className='bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8 dark:bg-gray-800 dark:text-gray-100'
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                {/* Tab Navigation */}
                <ul className="flex flex-wrap space-x-2 md:space-x-4 border-b border-gray-300 mb-6 dark:border-gray-700" role="tablist">
                    <li className="nav-item" role="presentation">
                        <button
                            className={`px-5 py-3 text-lg font-semibold border-b-2 border-transparent transition-colors duration-300 ${activeTab === 'home' ? 'text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'}`}
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
                            className={`px-5 py-3 text-lg font-semibold border-b-2 border-transparent transition-colors duration-300 ${activeTab === 'seo-tags' ? 'text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'}`}
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
                            className={`px-5 py-3 text-lg font-semibold border-b-2 border-transparent transition-colors duration-300 ${activeTab === 'otherdetails' ? 'text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'}`}
                            onClick={() => setActiveTab('otherdetails')}
                            type="button"
                            role="tab"
                            aria-controls="otherdetails"
                            aria-selected={activeTab === 'otherdetails'}
                        >
                            Other Details
                        </button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button
                            className={`px-5 py-3 text-lg font-semibold border-b-2 border-transparent transition-colors duration-300 ${activeTab === 'specifications' ? 'text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'}`}
                            onClick={() => setActiveTab('specifications')}
                            type="button"
                            role="tab"
                            aria-controls="specifications"
                            aria-selected={activeTab === 'specifications'}
                        >
                            Specifications & Features
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
                                className="tab-pane bg-white rounded-lg p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                                role="tabpanel"
                                aria-labelledby="home-tab"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                    <div className="mb-5">
                                        <label htmlFor="category_id" className="block text-gray-700 text-sm font-medium mb-2 dark:text-gray-300">Category <span className="text-red-500">*</span></label>
                                        <select
                                            onChange={handleInput}
                                            value={productsInput.category_id || ''}
                                            id="category_id"
                                            name="category_id"
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-400"
                                        >
                                            <option value="">Select Category</option>
                                            {category.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <small className="text-red-500 text-sm mt-1 block">{error.category_id ? error.category_id[0] : ''}</small>
                                    </div>
                                    <div className="mb-5">
                                        <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-2 dark:text-gray-300">Name <span className="text-red-500">*</span></label>
                                        <input
                                            onChange={handleInput}
                                            value={productsInput.name || ''}
                                            type="text"
                                            id="name"
                                            name="name"
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-blue-400"
                                        />
                                        <small className="text-red-500 text-sm mt-1 block">{error.name ? error.name[0] : ''}</small>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                    <div className="mb-5">
                                        <label htmlFor="link" className="block text-gray-700 text-sm font-medium mb-2 dark:text-gray-300">Link <span className="text-red-500">*</span></label>
                                        <input
                                            onChange={handleInput}
                                            value={productsInput.link || ''}
                                            type="text"
                                            id="link"
                                            name="link"
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-blue-400"
                                        />
                                        <small className="text-red-500 text-sm mt-1 block">{error.link ? error.link[0] : ''}</small>
                                    </div>
                                    <div className="mb-5">
                                        <label htmlFor="brand" className="block text-gray-700 text-sm font-medium mb-2 dark:text-gray-300">Brand <span className="text-red-500">*</span></label>
                                        <input
                                            onChange={handleInput}
                                            value={productsInput.brand || ''}
                                            type="text"
                                            id="brand"
                                            name="brand"
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-blue-400"
                                        />
                                        <small className="text-red-500 text-sm mt-1 block">{error.brand ? error.brand[0] : ''}</small>
                                    </div>
                                </div>
                                <div className="mb-5">
                                    <label htmlFor="description" className="block text-gray-700 text-sm font-medium mb-2 dark:text-gray-300">Description</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        onChange={handleInput}
                                        value={productsInput.description || ''}
                                        rows="4"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-blue-400"
                                    />
                                    <small className="text-red-500 text-sm mt-1 block">{error.description ? error.description[0] : ''}</small>
                                </div>

                                {/* Images Upload */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6">
                                    <div className="mb-5">
                                        <label htmlFor="image" className="block text-gray-700 text-sm font-medium mb-2 dark:text-gray-300">Image 1 (Main) <span className="text-red-500">*</span></label>
                                        <input
                                            onChange={handleImage}
                                            type="file"
                                            id="image"
                                            name="image"
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:file:bg-blue-900 dark:file:text-blue-200 dark:hover:file:bg-blue-800"
                                        />
                                        <small className="text-red-500 text-sm mt-1 block">{error.image ? error.image[0] : ''}</small>
                                        {imagePreview && (
                                            <div className="mt-2 border border-gray-300 rounded-lg p-2 flex items-center space-x-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                                                <img src={imagePreview} alt="Image 1 Preview" className="w-20 h-20 object-cover rounded-md" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/80x80/e0e0e0/000000?text=No+Image"; }} />
                                                <button type="button" onClick={() => removeImage(1)} className="text-red-600 hover:text-red-800 text-sm font-semibold dark:text-red-400 dark:hover:text-red-300">Remove</button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mb-5">
                                        <label htmlFor="image2" className="block text-gray-700 text-sm font-medium mb-2 dark:text-gray-300">Image 2</label>
                                        <input
                                            onChange={handleImage}
                                            type="file"
                                            id="image2"
                                            name="image2"
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:file:bg-blue-900 dark:file:text-blue-200 dark:hover:file:bg-blue-800"
                                        />
                                        <small className="text-red-500 text-sm mt-1 block">{error.image2 ? error.image2[0] : ''}</small>
                                        {image2Preview && (
                                            <div className="mt-2 border border-gray-300 rounded-lg p-2 flex items-center space-x-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                                                <img src={image2Preview} alt="Image 2 Preview" className="w-20 h-20 object-cover rounded-md" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/80x80/e0e0e0/000000?text=No+Image"; }} />
                                                <button type="button" onClick={() => removeImage(2)} className="text-red-600 hover:text-red-800 text-sm font-semibold dark:text-red-400 dark:hover:text-red-300">Remove</button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mb-5">
                                        <label htmlFor="image3" className="block text-gray-700 text-sm font-medium mb-2 dark:text-gray-300">Image 3</label>
                                        <input
                                            onChange={handleImage}
                                            type="file"
                                            id="image3"
                                            name="image3"
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:file:bg-blue-900 dark:file:text-blue-200 dark:hover:file:bg-blue-800"
                                        />
                                        <small className="text-red-500 text-sm mt-1 block">{error.image3 ? error.image3[0] : ''}</small>
                                        {image3Preview && (
                                            <div className="mt-2 border border-gray-300 rounded-lg p-2 flex items-center space-x-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                                                <img src={image3Preview} alt="Image 3 Preview" className="w-20 h-20 object-cover rounded-md" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/80x80/e0e0e0/000000?text=No+Image"; }} />
                                                <button type="button" onClick={() => removeImage(3)} className="text-red-600 hover:text-red-800 text-sm font-semibold dark:text-red-400 dark:hover:text-red-300">Remove</button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mb-5">
                                        <label htmlFor="image4" className="block text-gray-700 text-sm font-medium mb-2 dark:text-gray-300">Image 4</label>
                                        <input
                                            onChange={handleImage}
                                            type="file"
                                            id="image4"
                                            name="image4"
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:file:bg-blue-900 dark:file:text-blue-200 dark:hover:file:bg-blue-800"
                                        />
                                        <small className="text-red-500 text-sm mt-1 block">{error.image4 ? error.image4[0] : ''}</small>
                                        {image4Preview && (
                                            <div className="mt-2 border border-gray-300 rounded-lg p-2 flex items-center space-x-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                                                <img src={image4Preview} alt="Image 4 Preview" className="w-20 h-20 object-cover rounded-md" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/80x80/e0e0e0/000000?text=No+Image"; }} />
                                                <button type="button" onClick={() => removeImage(4)} className="text-red-600 hover:text-red-800 text-sm font-semibold dark:text-red-400 dark:hover:text-red-300">Remove</button>
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
                                className="tab-pane bg-white rounded-lg p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                                role="tabpanel"
                                aria-labelledby="seo-tags-tab"
                            >
                                <div className="mb-5">
                                    <label htmlFor="meta_title" className="block text-gray-700 text-sm font-medium mb-2 dark:text-gray-300">Meta Title <span className="text-red-500">*</span></label>
                                    <input
                                        onChange={handleInput}
                                        value={productsInput.meta_title || ''}
                                        type="text"
                                        id="meta_title"
                                        name="meta_title"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-blue-400"
                                    />
                                    <small className="text-red-500 text-sm mt-1 block">{error.meta_title ? error.meta_title[0] : ''}</small>
                                </div>
                                <div className="mb-5">
                                    <label htmlFor="meta_keywords" className="block text-gray-700 text-sm font-medium mb-2 dark:text-gray-300">Meta Keywords</label>
                                    <textarea
                                        onChange={handleInput}
                                        value={productsInput.meta_keywords || ''}
                                        id="meta_keywords"
                                        name="meta_keywords"
                                        rows="4"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-blue-400"
                                    />
                                    <small className="text-red-500 text-sm mt-1 block">{error.meta_keywords ? error.meta_keywords[0] : ''}</small>
                                </div>
                                <div className="mb-5">
                                    <label htmlFor="meta_description" className="block text-gray-700 text-sm font-medium mb-2 dark:text-gray-300">Meta Description</label>
                                    <textarea
                                        onChange={handleInput}
                                        value={productsInput.meta_description || ''}
                                        id="meta_description"
                                        name="meta_description"
                                        rows="4"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-blue-400"
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
                                className="tab-pane bg-white rounded-lg p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                                role="tabpanel"
                                aria-labelledby="otherdetails-tab"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                    <div className="mb-5">
                                        <label htmlFor="selling_price" className="block text-gray-700 text-sm font-medium mb-2 dark:text-gray-300">Selling Price <span className="text-red-500">*</span></label>
                                        <input
                                            onChange={handleInput}
                                            value={productsInput.selling_price || ''}
                                            type="number"
                                            id="selling_price"
                                            name="selling_price"
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-blue-400"
                                        />
                                        <small className="text-red-500 text-sm mt-1 block">{error.selling_price ? error.selling_price[0] : ''}</small>
                                    </div>
                                    <div className="mb-5">
                                        <label htmlFor="original_price" className="block text-gray-700 text-sm font-medium mb-2 dark:text-gray-300">Original Price <span className="text-red-500">*</span></label>
                                        <input
                                            onChange={handleInput}
                                            value={productsInput.original_price || ''}
                                            type="number"
                                            id="original_price"
                                            name="original_price"
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-blue-400"
                                        />
                                        <small className="text-red-500 text-sm mt-1 block">{error.original_price ? error.original_price[0] : ''}</small>
                                    </div>
                                </div>
                                <div className="mb-5">
                                    <label htmlFor="qty" className="block text-gray-700 text-sm font-medium mb-2 dark:text-gray-300">Quantity (Online/Main Warehouse Stock) <span className="text-red-500">*</span></label>
                                    <input
                                        onChange={handleInput}
                                        value={productsInput.qty || ''}
                                        type="number"
                                        id="qty"
                                        name="qty"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-blue-400"
                                    />
                                    <small className="text-red-500 text-sm mt-1 block">{error.qty ? error.qty[0] : ''}</small>
                                    <p className="text-gray-500 text-xs mt-1 dark:text-gray-400">
                                        This quantity is for online sales and your main unallocated stock.
                                        Store-specific inventory can be managed after product creation on the "Edit Product" page.
                                    </p>
                                </div>

                                {/* Checkboxes for product status */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                                    <div className="mb-5 flex items-center">
                                        <input
                                            type="checkbox"
                                            onChange={handleInput}
                                            checked={productsInput.featured}
                                            id="featured"
                                            name="featured"
                                            className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:checked:bg-blue-400"
                                        />
                                        <label htmlFor="featured" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Featured (Show on homepage)</label>
                                    </div>
                                    <div className="mb-5 flex items-center">
                                        <input
                                            type="checkbox"
                                            onChange={handleInput}
                                            checked={productsInput.popular}
                                            id="popular"
                                            name="popular"
                                            className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:checked:bg-blue-400"
                                        />
                                        <label htmlFor="popular" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Popular (Highlight)</label>
                                    </div>
                                    <div className="mb-5 flex items-center">
                                        <input
                                            type="checkbox"
                                            onChange={handleInput}
                                            checked={productsInput.status}
                                            id="status"
                                            name="status"
                                            className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:checked:bg-blue-400"
                                        />
                                        <label htmlFor="status" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Status (0=Hidden, 1=Visible)</label>
                                    </div>
                                    <div className="mb-5 flex items-center">
                                        <input
                                            type="checkbox"
                                            onChange={handleInput}
                                            checked={productsInput.is_new_arrival}
                                            id="is_new_arrival"
                                            name="is_new_arrival"
                                            className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:checked:bg-blue-400"
                                        />
                                        <label htmlFor="is_new_arrival" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">New Arrival</label>
                                    </div>
                                    <div className="mb-5 flex items-center">
                                        <input
                                            type="checkbox"
                                            onChange={handleInput}
                                            checked={productsInput.is_flash_sale}
                                            id="is_flash_sale"
                                            name="is_flash_sale"
                                            className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:checked:bg-blue-400"
                                        />
                                        <label htmlFor="is_flash_sale" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Flash Sale</label>
                                    </div>
                                </div>

                                {/* Flash Sale Details (Conditional Render) */}
                                {productsInput.is_flash_sale && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 mt-4 p-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                                        <div className="mb-5">
                                            <label htmlFor="flash_sale_price" className="block text-blue-800 text-sm font-medium mb-2 dark:text-blue-200">Flash Sale Price <span className="text-red-500">*</span></label>
                                            <input
                                                onChange={handleInput}
                                                value={productsInput.flash_sale_price || ''}
                                                type="number"
                                                id="flash_sale_price"
                                                name="flash_sale_price"
                                                className="w-full px-4 py-3 rounded-lg bg-blue-100 border border-blue-300 text-blue-900 placeholder-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-100 dark:placeholder-blue-400 dark:focus:ring-blue-400"
                                            />
                                            <small className="text-red-500 text-sm mt-1 block">{error.flash_sale_price ? error.flash_sale_price[0] : ''}</small>
                                        </div>
                                        <div className="mb-5">
                                            <label htmlFor="flash_sale_starts_at" className="block text-blue-800 text-sm font-medium mb-2 dark:text-blue-200">Sale Starts At <span className="text-red-500">*</span></label>
                                            <input
                                                onChange={handleInput}
                                                value={productsInput.flash_sale_starts_at || ''}
                                                type="date"
                                                id="flash_sale_starts_at"
                                                name="flash_sale_starts_at"
                                                className="w-full px-4 py-3 rounded-lg bg-blue-100 border border-blue-300 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-100 dark:focus:ring-blue-400"
                                            />
                                            <small className="text-red-500 text-sm mt-1 block">{error.flash_sale_starts_at ? error.flash_sale_starts_at[0] : ''}</small>
                                        </div>
                                        <div className="mb-5">
                                            <label htmlFor="flash_sale_ends_at" className="block text-blue-800 text-sm font-medium mb-2 dark:text-blue-200">Sale Ends At <span className="text-red-500">*</span></label>
                                            <input
                                                onChange={handleInput}
                                                value={productsInput.flash_sale_ends_at || ''}
                                                type="date"
                                                id="flash_sale_ends_at"
                                                name="flash_sale_ends_at"
                                                className="w-full px-4 py-3 rounded-lg bg-blue-100 border border-blue-300 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-100 dark:focus:ring-blue-400"
                                            />
                                            <small className="text-red-500 text-sm mt-1 block">{error.flash_sale_ends_at ? error.flash_sale_ends_at[0] : ''}</small>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Specifications & Features Tab */}
                        {activeTab === 'specifications' && (
                            <motion.div
                                key="specsTab"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="tab-pane bg-white rounded-lg p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                                role="tabpanel"
                                aria-labelledby="specifications-tab"
                            >
                                <h3 className="text-xl font-bold text-gray-900 mb-4 dark:text-white">Product Specifications</h3>
                                {specifications.map((spec, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-center">
                                        <div>
                                            <label htmlFor={`spec-feature-${index}`} className="block text-gray-700 text-sm font-medium mb-1 dark:text-gray-300">Feature</label>
                                            <input
                                                type="text"
                                                id={`spec-feature-${index}`}
                                                name="feature"
                                                value={spec.feature}
                                                onChange={(e) => handleSpecificationChange(index, e)}
                                                className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-400"
                                                placeholder="e.g., Processor"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor={`spec-value-${index}`} className="block text-gray-700 text-sm font-medium mb-1 dark:text-gray-300">Value</label>
                                            <input
                                                type="text"
                                                id={`spec-value-${index}`}
                                                name="value"
                                                value={spec.value}
                                                onChange={(e) => handleSpecificationChange(index, e)}
                                                className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-400"
                                                placeholder="e.g., Intel Core i7"
                                            />
                                        </div>
                                        <div className="flex items-end h-full">
                                            {specifications.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeSpecification(index)}
                                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors w-full md:w-auto"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addSpecification}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors mt-2"
                                >
                                    Add Specification
                                </button>

                                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4 dark:text-white">Product Features</h3>
                                {feature.map((feat, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-center">
                                        <div>
                                            <label htmlFor={`feature-item-${index}`} className="block text-gray-700 text-sm font-medium mb-1 dark:text-gray-300">Feature Item</label>
                                            <input
                                                type="text"
                                                id={`feature-item-${index}`}
                                                name="feature"
                                                value={feat.feature}
                                                onChange={(e) => handleFeatureChange(index, e)}
                                                className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-400"
                                                placeholder="e.g., Water Resistant"
                                            />
                                        </div>
                                        <div className="flex items-end h-full">
                                            {feature.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeFeature(index)}
                                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors w-full md:w-auto"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addFeature}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors mt-2"
                                >
                                    Add Feature
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex justify-end mt-8">
                    <button
                        type="submit"
                        form="productsForm"
                        className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                        disabled={addLoading}
                    >
                        {addLoading ? (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : null}
                        {addLoading ? 'Adding Product...' : 'Add Product'}
                    </button>
                </div>
            </motion.form>
        </motion.div>
    );
};

export default Products;
