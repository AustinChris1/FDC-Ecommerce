import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../LoadingSpinner';

const EditProducts = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [editLoading, setEditLoading] = useState(false);
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

    // States for image files (for new uploads)
    const [picture, setPicture] = useState(null);
    const [picture2, setPicture2] = useState(null);
    const [picture3, setPicture3] = useState(null);
    const [picture4, setPicture4] = useState(null);

    // States for image previews (can be new file or existing URL)
    const [imagePreview, setImagePreview] = useState(null);
    const [image2Preview, setImage2Preview] = useState(null);
    const [image3Preview, setImage3Preview] = useState(null);
    const [image4Preview, setImage4Preview] = useState(null);

    // No longer need currentImagePath states if preview handles existing images.
    // Instead, the fetch logic will set the initial preview from existing paths.

    const [specifications, setSpecifications] = useState([{ feature: '', value: '' }]);
    const [feature, setFeature] = useState([{ feature: '' }]);

    const [error, setError] = useState({});
    const [activeTab, setActiveTab] = useState('home');

    // Handlers for image file inputs
    const handleImage = (e, setImageFile, setImagePrev) => {
        const file = e.target.files[0];
        setImageFile(file);
        setImagePrev(file ? URL.createObjectURL(file) : null);
        // Clear specific error for this image field
        setError(prev => ({ ...prev, [e.target.name]: '' }));
    };

    // Function to remove image preview and associated file
    const removeImage = (setImageFile, setImagePrev, inputName) => {
        setImageFile(null); // Clear the file
        setImagePrev(null); // Clear the preview
        // Optionally, clear the file input value visually
        const fileInput = document.querySelector(`input[name=${inputName}]`);
        if (fileInput) fileInput.value = '';
    };

    // Handler for text, select, and checkbox inputs
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

    // Handlers for specifications
    const handleSpecificationChange = (index, event) => {
        const { name, value } = event.target;
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

    // Handlers for feature
    const handleFeatureChange = (index, event) => {
        const { name, value } = event.target;
        const newfeature = [...feature];
        newfeature[index][name] = value;
        setFeature(newfeature);
    };

    const addFeature = () => {
        setFeature([...feature, { feature: '' }]);
    };

    const removeFeature = (index) => {
        const newfeature = feature.filter((_, i) => i !== index);
        setFeature(newfeature);
    };

    // Effect to fetch categories and product data on component mount/id change
    useEffect(() => {
        document.title = "Edit Product";

        axios.get('/api/allCategory')
            .then(res => {
                if (res.status === 200 && res.data.category) {
                    setCategory(res.data.category);
                } else {
                    toast.error(res.data.message || 'Failed to load categories.');
                }
            })
            .catch(err => {
                console.error('Error fetching categories:', err);
                toast.error('Network error or server issue. Could not load categories.');
            });

        axios.get(`/api/products/edit/${id}`)
            .then(res => {
                if (res.status === 200 && res.data.Product) {
                    const productData = res.data.Product;
                    setProductsInput({
                        category_id: productData.category_id || '',
                        name: productData.name || '',
                        link: productData.link || '',
                        description: productData.description || '',
                        meta_title: productData.meta_title || '',
                        meta_keywords: productData.meta_keywords || '',
                        meta_description: productData.meta_description || '',
                        selling_price: productData.selling_price || '',
                        original_price: productData.original_price || '',
                        qty: productData.qty || '',
                        brand: productData.brand || '',
                        featured: productData.featured === 1 ? true : false,
                        popular: productData.popular === 1 ? true : false,
                        status: productData.status === 1 ? true : false,
                        is_new_arrival: productData.is_new_arrival === 1 ? true : false,
                        is_flash_sale: productData.is_flash_sale === 1 ? true : false,
                        flash_sale_price: productData.flash_sale_price || '',
                        flash_sale_starts_at: productData.flash_sale_starts_at ? new Date(productData.flash_sale_starts_at).toISOString().split('T')[0] : '',
                        flash_sale_ends_at: productData.flash_sale_ends_at ? new Date(productData.flash_sale_ends_at).toISOString().split('T')[0] : ''
                    });

                    // Set initial image previews from existing product data paths
                    setImagePreview(productData.image ? `/${productData.image}` : null);
                    setImage2Preview(productData.image2 ? `/${productData.image2}` : null);
                    setImage3Preview(productData.image3 ? `/${productData.image3}` : null);
                    setImage4Preview(productData.image4 ? `/${productData.image4}` : null);

                    if (productData.specifications) {
                        try {
                            const parsedSpecs = JSON.parse(productData.specifications);
                            setSpecifications(parsedSpecs.length > 0 ? parsedSpecs : [{ feature: '', value: '' }]);
                        } catch (parseError) {
                            console.error("Error parsing specifications JSON:", parseError);
                            setSpecifications([{ feature: '', value: '' }]);
                        }
                    } else {
                        setSpecifications([{ feature: '', value: '' }]);
                    }

                    if (productData.features) {
                        try {
                            const parsedFeatures = typeof productData.features === 'string'
                                ? JSON.parse(productData.features)
                                : productData.features;

                            setFeature(Array.isArray(parsedFeatures) && parsedFeatures.length > 0 ? parsedFeatures : [{ feature: '' }]);
                        } catch (parseError) {
                            console.error("Error parsing Feature JSON:", parseError);
                            setFeature([{ feature: '' }]);
                        }
                    } else {
                        setFeature([{ feature: '' }]);
                    }

                } else if (res.status === 404) {
                    toast.error(res.data.message);
                    navigate('/admin/products/view');
                } else {
                    toast.error(res.data.message || 'Failed to fetch product details.');
                }
            })
            .catch(err => {
                console.error('Error fetching product details:', err);
                toast.error('Failed to fetch product details. Please check network/server.');
                navigate('/admin/products/view');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id, navigate]);

    // Function to handle product update
    const editProducts = async (e) => {
        e.preventDefault();
        setEditLoading(true);

        const formData = new FormData();
        formData.append('_method', 'POST'); // Important for Laravel's PUT/PATCH method spoofing

        // Append all productsInput fields
        for (const key in productsInput) {
            // Handle booleans: convert true/false to 1/0
            if (typeof productsInput[key] === 'boolean') {
                formData.append(key, productsInput[key] ? 1 : 0);
            } else if (productsInput[key] !== null && productsInput[key] !== undefined) {
                formData.append(key, productsInput[key]);
            }
        }

        // --- CORRECTED IMAGE HANDLING LOGIC ---
        // Only append image files if a new file has been selected (picture state is not null)
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
        // If picture state is null, it means no new file was selected for that slot.
        // We do NOT append the field to FormData at all.
        // Laravel's 'nullable' validation will then correctly treat it as "not present" and ignore it.

        // If you need explicit "remove image" functionality, you'd add a separate flag
        // For example:
        // if (!imagePreview && !picture) { // If both current and new are null/cleared
        //     formData.append('remove_image1', 'true');
        // }
        // ... and then handle this `remove_image1` flag in your Laravel backend controller.
        // For now, removing `REMOVE_IMAGE` string is the priority.


        // Append specifications as a JSON string
        formData.append('specifications', JSON.stringify(specifications.filter(s => s.feature && s.value)));

        // Append feature as a JSON string
        formData.append('features', JSON.stringify(feature.filter(s => s.feature)));

        try {
            const res = await axios.post(`/api/products/update/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (res.data.status === 200) {
                toast.success(res.data.message);
                setError({});
                navigate('/admin/products/view');
            } else if (res.data.status === 422) {
                setError(res.data.errors);
                Object.values(res.data.errors).forEach(errArr => {
                    errArr.forEach(err => toast.error(err));
                });
            } else if (res.data.status === 404) {
                toast.error(res.data.message);
                navigate('/admin/products/view');
            } else {
                toast.error(res.data.message || 'An unexpected error occurred during update.');
            }
        } catch (err) {
            if (err.response && err.response.status === 422) {
                setError(err.response.data.errors);
                Object.values(err.response.data.errors).forEach(errArr => {
                    errArr.forEach(err => toast.error(err));
                });
            } else {
                console.error("Update error:", err);
                toast.error('Failed to update product, try again.');
            }
        } finally {
            setEditLoading(false);
        }
    };

    // Framer Motion variants for main container entry
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <motion.div
            className='min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-100 text-gray-800'
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 md:mb-0">Edit Product</h1>
                <Link
                    to="/admin/products/view"
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
                >
                    Back to Products
                </Link>
            </header>

            <motion.form
                onSubmit={editProducts}
                encType='multipart/form-data'
                id='productsForm'
                className='bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8'
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
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
                    <li className="nav-item" role="presentation">
                        <button
                            className={`px-5 py-3 text-lg font-semibold border-b-2 border-transparent transition-colors duration-300 ${activeTab === 'specifications' ? 'text-blue-600 border-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
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

                <div className="tab-content">
                    <AnimatePresence mode='wait'>
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

                                {/* Images Upload and Preview */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                    {/* Image 1 */}
                                    <div className="mb-5">
                                        <label htmlFor="image" className="block text-gray-700 text-sm font-medium mb-2">Image 1</label>
                                        <input
                                            type="file"
                                            id="image"
                                            name="image"
                                            onChange={(e) => handleImage(e, setPicture, setImagePreview)}
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                        <small className="text-red-500 text-sm mt-1 block">{error.image ? error.image[0] : ''}</small>
                                        {(imagePreview) && ( // Display preview if available
                                            <div className="mt-2 border border-gray-300 rounded-lg p-2 flex items-center space-x-4 bg-gray-50">
                                                <img
                                                    src={imagePreview}
                                                    alt="Image 1 Preview"
                                                    className="w-20 h-20 object-cover rounded-md"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/80x80/e0e0e0/000000?text=No+Image"; }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(setPicture, setImagePreview, 'image')}
                                                    className="text-red-500 hover:text-red-700 text-sm font-semibold"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Image 2 */}
                                    <div className="mb-5">
                                        <label htmlFor="image2" className="block text-gray-700 text-sm font-medium mb-2">Image 2</label>
                                        <input
                                            type="file"
                                            id="image2"
                                            name="image2"
                                            onChange={(e) => handleImage(e, setPicture2, setImage2Preview)}
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                        <small className="text-red-500 text-sm mt-1 block">{error.image2 ? error.image2[0] : ''}</small>
                                        {(image2Preview) && (
                                            <div className="mt-2 border border-gray-300 rounded-lg p-2 flex items-center space-x-4 bg-gray-50">
                                                <img
                                                    src={image2Preview}
                                                    alt="Image 2 Preview"
                                                    className="w-20 h-20 object-cover rounded-md"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/80x80/e0e0e0/000000?text=No+Image"; }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(setPicture2, setImage2Preview, 'image2')}
                                                    className="text-red-500 hover:text-red-700 text-sm font-semibold"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {/* Image 3 */}
                                    <div className="mb-5">
                                        <label htmlFor="image3" className="block text-gray-700 text-sm font-medium mb-2">Image 3</label>
                                        <input
                                            type="file"
                                            id="image3"
                                            name="image3"
                                            onChange={(e) => handleImage(e, setPicture3, setImage3Preview)}
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                        <small className="text-red-500 text-sm mt-1 block">{error.image3 ? error.image3[0] : ''}</small>
                                        {(image3Preview) && (
                                            <div className="mt-2 border border-gray-300 rounded-lg p-2 flex items-center space-x-4 bg-gray-50">
                                                <img
                                                    src={image3Preview}
                                                    alt="Image 3 Preview"
                                                    className="w-20 h-20 object-cover rounded-md"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/80x80/e0e0e0/000000?text=No+Image"; }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(setPicture3, setImage3Preview, 'image3')}
                                                    className="text-red-500 hover:text-red-700 text-sm font-semibold"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {/* Image 4 */}
                                    <div className="mb-5">
                                        <label htmlFor="image4" className="block text-gray-700 text-sm font-medium mb-2">Image 4</label>
                                        <input
                                            type="file"
                                            id="image4"
                                            name="image4"
                                            onChange={(e) => handleImage(e, setPicture4, setImage4Preview)}
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                        <small className="text-red-500 text-sm mt-1 block">{error.image4 ? error.image4[0] : ''}</small>
                                        {(image4Preview) && (
                                            <div className="mt-2 border border-gray-300 rounded-lg p-2 flex items-center space-x-4 bg-gray-50">
                                                <img
                                                    src={image4Preview}
                                                    alt="Image 4 Preview"
                                                    className="w-20 h-20 object-cover rounded-md"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/80x80/e0e0e0/000000?text=No+Image"; }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(setPicture4, setImage4Preview, 'image4')}
                                                    className="text-red-500 hover:text-red-700 text-sm font-semibold"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div> {/* End of Image grid */}

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
                                        onChange={handleInput}
                                        value={productsInput.meta_keywords || ''}
                                        id="meta_keywords"
                                        name="meta_keywords"
                                        rows="3"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                                    />
                                    <small className="text-red-500 text-sm mt-1 block">{error.meta_keywords ? error.meta_keywords[0] : ''}</small>
                                </div>
                                <div className="mb-5">
                                    <label htmlFor="meta_description" className="block text-gray-700 text-sm font-medium mb-2">Meta Description</label>
                                    <textarea
                                        onChange={handleInput}
                                        value={productsInput.meta_description || ''}
                                        id="meta_description"
                                        name="meta_description"
                                        rows="3"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                                    />
                                    <small className="text-red-500 text-sm mt-1 block">{error.meta_description ? error.meta_description[0] : ''}</small>
                                </div>
                            </motion.div>
                        )}

                        {/* Other Details Tab Pane */}
                        {activeTab === 'otherdetails' && (
                            <motion.div
                                key="otherdetailsTab"
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
                                            type="number"
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
                                            type="number"
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
                                        type="number"
                                        id="qty"
                                        name="qty"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                                    />
                                    <small className="text-red-500 text-sm mt-1 block">{error.qty ? error.qty[0] : ''}</small>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6">
                                    <div className="mb-5 flex items-center">
                                        <input
                                            onChange={handleInput}
                                            checked={productsInput.featured}
                                            type="checkbox"
                                            id="featured"
                                            name="featured"
                                            className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="featured" className="ml-2 block text-gray-700 text-sm font-medium">Featured (shown on homepage)</label>
                                    </div>
                                    <div className="mb-5 flex items-center">
                                        <input
                                            onChange={handleInput}
                                            checked={productsInput.popular}
                                            type="checkbox"
                                            id="popular"
                                            name="popular"
                                            className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="popular" className="ml-2 block text-gray-700 text-sm font-medium">Popular (hot products)</label>
                                    </div>
                                    <div className="mb-5 flex items-center">
                                        <input
                                            onChange={handleInput}
                                            checked={productsInput.status}
                                            type="checkbox"
                                            id="status"
                                            name="status"
                                            className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="status" className="ml-2 block text-gray-700 text-sm font-medium">Status (checked=hidden)</label>
                                    </div>
                                </div>
                                <hr className="my-6 border-gray-300" />
                                {/* NEW: New Arrival and Flash Sale Fields */}
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">Promotional Settings</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                    <div className="mb-5 flex items-center">
                                        <input
                                            onChange={handleInput}
                                            checked={productsInput.is_new_arrival}
                                            type="checkbox"
                                            id="is_new_arrival"
                                            name="is_new_arrival"
                                            className="h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                        />
                                        <label htmlFor="is_new_arrival" className="ml-2 block text-gray-700 text-sm font-medium">Is New Arrival?</label>
                                        <small className="text-red-500 text-sm mt-1 block">{error.is_new_arrival ? error.is_new_arrival[0] : ''}</small>
                                    </div>
                                    <div className="mb-5 flex items-center">
                                        <input
                                            onChange={handleInput}
                                            checked={productsInput.is_flash_sale}
                                            type="checkbox"
                                            id="is_flash_sale"
                                            name="is_flash_sale"
                                            className="h-5 w-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                        />
                                        <label htmlFor="is_flash_sale" className="ml-2 block text-gray-700 text-sm font-medium">Is Flash Sale?</label>
                                        <small className="text-red-500 text-sm mt-1 block">{error.is_flash_sale ? error.is_flash_sale[0] : ''}</small>
                                    </div>
                                </div>

                                {/* Conditional Flash Sale Fields */}
                                {productsInput.is_flash_sale && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="mt-4 p-4 border border-purple-300 rounded-lg bg-purple-50"
                                    >
                                        <h4 className="text-lg font-semibold text-purple-800 mb-4">Flash Sale Details</h4>
                                        <div className="mb-5">
                                            <label htmlFor="flash_sale_price" className="block text-gray-700 text-sm font-medium mb-2">Flash Sale Price</label>
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                            <div className="mb-5">
                                                <label htmlFor="flash_sale_starts_at" className="block text-gray-700 text-sm font-medium mb-2">Flash Sale Start Date</label>
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
                                                <label htmlFor="flash_sale_ends_at" className="block text-gray-700 text-sm font-medium mb-2">Flash Sale End Date</label>
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
                            </motion.div>
                        )}

                        {/* Specifications & Features Tab Pane */}
                        {activeTab === 'specifications' && (
                            <motion.div
                                key="specificationsTab"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="tab-pane bg-white rounded-lg p-6 border border-gray-200"
                                role="tabpanel"
                                aria-labelledby="specifications-tab"
                            >
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">Product Specifications</h3>
                                {specifications.map((spec, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 items-center">
                                        <div className="md:col-span-2">
                                            <label htmlFor={`feature-${index}`} className="block text-gray-700 text-sm font-medium mb-1">Feature</label>
                                            <input
                                                type="text"
                                                id={`feature-${index}`}
                                                name="feature"
                                                value={spec.feature}
                                                onChange={(e) => handleSpecificationChange(index, e)}
                                                className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                                                placeholder="e.g., Color"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label htmlFor={`value-${index}`} className="block text-gray-700 text-sm font-medium mb-1">Value</label>
                                            <input
                                                type="text"
                                                id={`value-${index}`}
                                                name="value"
                                                value={spec.value}
                                                onChange={(e) => handleSpecificationChange(index, e)}
                                                className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                                                placeholder="e.g., Red"
                                            />
                                        </div>
                                        <div className="md:col-span-1 flex items-end justify-end">
                                            <button
                                                type="button"
                                                onClick={() => removeSpecification(index)}
                                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addSpecification}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 mb-8"
                                >
                                    Add Specification
                                </button>

                                <hr className="my-8 border-gray-300" />

                                <h3 className="text-xl font-semibold text-gray-800 mb-4">Product Features</h3>
                                {feature.map((feat, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 items-center">
                                        <div className="md:col-span-4">
                                            <label htmlFor={`single-feature-${index}`} className="block text-gray-700 text-sm font-medium mb-1">Feature</label>
                                            <input
                                                type="text"
                                                id={`single-feature-${index}`}
                                                name="feature"
                                                value={feat.feature}
                                                onChange={(e) => handleFeatureChange(index, e)}
                                                className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                                                placeholder="e.g., 5.5-inch display"
                                            />
                                        </div>
                                        <div className="md:col-span-1 flex items-end justify-end">
                                            <button
                                                type="button"
                                                onClick={() => removeFeature(index)}
                                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addFeature}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                                >
                                    Add Feature
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Submit Button */}
                <div className="mt-8 flex justify-end">
                    <button
                        type="submit"
                        className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-3 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center"
                        disabled={editLoading}
                    >
                        {editLoading ? (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : null}
                        {editLoading ? 'Updating...' : 'Update Product'}
                    </button>
                </div>
            </motion.form>
        </motion.div>
    );
}

export default EditProducts;