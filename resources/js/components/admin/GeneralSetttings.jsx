import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner'; 
import {
    Settings,       // Main settings icon
    Globe,          // General site info
    Facebook,       // Social media icons
    Twitter,
    Instagram,
    Upload,         // For image upload
    Mail,           // For email
    Phone,          // For phone
    MapPin,         // For address
    Truck,          // For shipping fee (NEW ICON)
} from 'lucide-react'; // Import Lucide React icons

const GeneralSettings = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true); // Manages full-page loading for fetching settings
    const [saveLoading, setSaveLoading] = useState(false); // Manages loading state for the save button
    const [settingsInput, setSettingsInput] = useState({
        site_name: '',
        site_email: '',
        site_phone: '',
        site_address: '',
        facebook_url: '',
        twitter_url: '',
        instagram_url: '',
        site_logo: null, // File object for new logo upload
        current_site_logo_path: '', // Path to existing logo from backend
        shipping_fee: 0, // NEW STATE FOR SHIPPING FEE
    });
    const [error, setError] = useState({}); // Stores validation errors from backend
    const [logoPreview, setLogoPreview] = useState(null); // URL for logo image preview

    // Effect to fetch general settings data when component mounts
    useEffect(() => {
        document.title = "General Settings"; // Set page title
        axios.get('/api/settings/general') // Assuming this endpoint fetches general settings
            .then(res => {
                if (res.status === 200 && res.data.settings) {
                    const fetchedSettings = res.data.settings;
                    setSettingsInput({
                        site_name: fetchedSettings.site_name || '',
                        site_email: fetchedSettings.site_email || '',
                        site_phone: fetchedSettings.site_phone || '',
                        site_address: fetchedSettings.site_address || '',
                        facebook_url: fetchedSettings.facebook_url || '',
                        twitter_url: fetchedSettings.twitter_url || '',
                        instagram_url: fetchedSettings.instagram_url || '',
                        site_logo: null, // No file initially selected
                        current_site_logo_path: fetchedSettings.site_logo_path || '', // Set current logo path
                        shipping_fee: fetchedSettings.shipping_fee || 0, // Populate new state
                    });
                    // Set initial logo preview if an existing logo path is available
                    if (fetchedSettings.site_logo_path) {
                        setLogoPreview(fetchedSettings.site_logo_path);
                    }
                } else {
                    toast.error(res.data.message || "Failed to fetch settings.");
                }
            })
            .catch(err => {
                console.error("Error fetching settings:", err);
                toast.error("Network error or server issue. Could not load settings.");
            })
            .finally(() => {
                setLoading(false); // Stop full-page loading spinner
            });
    }, []); // Empty dependency array ensures this runs once on mount

    // Handler for text inputs
    const handleInput = (e) => {
        const { name, value, type } = e.target;
        // For number inputs, convert value to a number
        const newValue = type === 'number' ? parseFloat(value) : value;

        setSettingsInput(prev => ({
            ...prev,
            [name]: newValue
        }));
    };

    // Handler for site logo file input
    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSettingsInput(prev => ({ ...prev, site_logo: file }));
            setLogoPreview(URL.createObjectURL(file)); // Create URL for preview
            setError(prev => ({ ...prev, site_logo: '' })); // Clear any previous error
            setSettingsInput(prev => ({ ...prev, current_site_logo_path: '' })); // Clear old path state
        } else {
            setSettingsInput(prev => ({ ...prev, site_logo: null }));
            // If no new file, revert to current_site_logo_path for preview if exists
            // Or set to null if no current path either
            setLogoPreview(settingsInput.current_site_logo_path ? `/${settingsInput.current_site_logo_path}` : null);
        }
    };

    // Function to remove logo preview and file
    const removeLogo = () => {
        setSettingsInput(prev => ({ ...prev, site_logo: null, current_site_logo_path: '' }));
        setLogoPreview(null);
    };

    // Handler for saving settings
    const saveSettings = async (e) => {
        e.preventDefault();
        setSaveLoading(true); // Show spinner on save button

        const formData = new FormData();
        formData.append('_method', 'POST'); // Important for Laravel's PUT/PATCH method spoofing

        formData.append('site_name', settingsInput.site_name || '');
        formData.append('site_email', settingsInput.site_email || '');
        formData.append('site_phone', settingsInput.site_phone || '');
        formData.append('site_address', settingsInput.site_address || '');
        formData.append('facebook_url', settingsInput.facebook_url || '');
        formData.append('twitter_url', settingsInput.twitter_url || '');
        formData.append('instagram_url', settingsInput.instagram_url || '');
        formData.append('shipping_fee', settingsInput.shipping_fee.toString()); // Convert number to string for FormData

        // Handle site_logo
        if (settingsInput.site_logo) {
            formData.append('site_logo', settingsInput.site_logo);
        } else if (settingsInput.current_site_logo_path === '' && !logoPreview) {
            // If current path was cleared and no new logo, signal backend to delete old logo
            formData.append('site_logo', 'REMOVE_LOGO'); // Use a specific string to signal deletion
        }
        // If current_site_logo_path exists and no new logo selected, no need to append anything for 'site_logo'.
        // Backend should retain the old image by default if not provided a new file or 'REMOVE_LOGO'.

        try {
            const res = await axios.post('/api/settings/update', formData, { // Using POST with _method=PUT
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (res.data.status === 200) {
                toast.success(res.data.message);
                setError({}); // Clear errors on success
                // Update current_site_logo_path in state if a new logo was uploaded or removed
                if (res.data.new_logo_path !== undefined) { // Check if new_logo_path was explicitly sent (even if empty string)
                    setSettingsInput(prev => ({ ...prev, current_site_logo_path: res.data.new_logo_path }));
                    setLogoPreview(res.data.new_logo_path ? `/${res.data.new_logo_path}` : null);
                }
            } else if (res.data.status === 422) {
                setError(res.data.errors); // Validation errors from backend
                toast.error('Please check the input fields for errors.');
            } else {
                toast.error(res.data.message || 'An unexpected error occurred.');
            }
        } catch (err) {
            if (err.response && err.response.status === 422) {
                setError(err.response.data.errors);
                toast.error('Validation errors. Please check the form.');
            } else {
                console.error("Save settings error:", err);
                toast.error('Failed to save settings. Please try again later.');
            }
        } finally {
            setSaveLoading(false); // Hide spinner on save button
        }
    };

    // Framer Motion variants for main container entry
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    // Show full-page loading spinner while fetching settings
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
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 md:mb-0">General Settings</h1>
                <Link
                    to="/admin/dashboard"
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
                >
                    Back to Dashboard
                </Link>
            </header>

            {/* Settings Form Container */}
            <motion.form
                onSubmit={saveSettings}
                encType='multipart/form-data' // Important for file uploads
                id='settingsForm'
                className='bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8' // White background for form card
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                {/* General Site Information */}
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center border-b border-gray-200 pb-3">
                    <Globe className="w-6 h-6 mr-3 text-blue-600" /> Site Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <div className="mb-5">
                        <label htmlFor="site_name" className="block text-gray-700 text-sm font-medium mb-2">Site Name</label>
                        <input
                            onChange={handleInput}
                            value={settingsInput.site_name || ''}
                            type="text"
                            id="site_name"
                            name="site_name"
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                        />
                        <small className="text-red-500 text-sm mt-1 block">{error.site_name ? error.site_name[0] : ''}</small>
                    </div>
                    <div className="mb-5">
                        <label htmlFor="site_email" className="block text-gray-700 text-sm font-medium mb-2">Site Email</label>
                        <input
                            onChange={handleInput}
                            value={settingsInput.site_email || ''}
                            type="email"
                            id="site_email"
                            name="site_email"
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                        />
                        <small className="text-red-500 text-sm mt-1 block">{error.site_email ? error.site_email[0] : ''}</small>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <div className="mb-5">
                        <label htmlFor="site_phone" className="block text-gray-700 text-sm font-medium mb-2">Site Phone</label>
                        <input
                            onChange={handleInput}
                            value={settingsInput.site_phone || ''}
                            type="text"
                            id="site_phone"
                            name="site_phone"
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                        />
                        <small className="text-red-500 text-sm mt-1 block">{error.site_phone ? error.site_phone[0] : ''}</small>
                    </div>
                    <div className="mb-5">
                        <label htmlFor="site_address" className="block text-gray-700 text-sm font-medium mb-2">Site Address</label>
                        <textarea
                            onChange={handleInput}
                            value={settingsInput.site_address || ''}
                            id="site_address"
                            name="site_address"
                            rows="2"
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                        />
                        <small className="text-red-500 text-sm mt-1 block">{error.site_address ? error.site_address[0] : ''}</small>
                    </div>
                </div>
                
                {/* Shipping Fee Section (NEW) */}
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center border-t border-gray-200 pt-6">
                    <Truck className="w-6 h-6 mr-3 text-emerald-600" /> Shipping Settings
                </h2>
                <div className="mb-5">
                    <label htmlFor="shipping_fee" className="block text-gray-700 text-sm font-medium mb-2">Shipping Fee</label>
                    <input
                        onChange={handleInput}
                        value={settingsInput.shipping_fee} // Value should be number, not empty string
                        type="number"
                        step="0.01" // Allow decimal values for currency
                        min="0" // Shipping fee cannot be negative
                        id="shipping_fee"
                        name="shipping_fee"
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                        placeholder="e.g., 5.00"
                    />
                    <small className="text-red-500 text-sm mt-1 block">{error.shipping_fee ? error.shipping_fee[0] : ''}</small>
                </div>


                {/* Site Logo Upload */}
                <div className="mb-8 border-t border-gray-200 pt-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <Upload className="w-6 h-6 mr-3 text-orange-600" /> Site Logo
                    </h2>
                    <div className="mb-5">
                        <label htmlFor="site_logo" className="block text-gray-700 text-sm font-medium mb-2">Upload New Logo</label>
                        <input
                            type="file"
                            id="site_logo"
                            name="site_logo"
                            onChange={handleLogoChange}
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <small className="text-red-500 text-sm mt-1 block">{error.site_logo ? error.site_logo[0] : ''}</small>

                        {(logoPreview || settingsInput.current_site_logo_path) && (
                            <div className="mt-4 border border-gray-300 rounded-lg p-2 flex items-center space-x-4 bg-gray-50">
                                <img
                                    src={logoPreview || (settingsInput.current_site_logo_path ? `/${settingsInput.current_site_logo_path}` : null)} // Prioritize new preview
                                    alt="Site Logo Preview"
                                    className="w-24 h-24 object-contain rounded-md bg-white" // Use object-contain for logos
                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/96x96/e0e0e0/555555?text=No+Logo"; }}
                                />
                                <div>
                                    <p className="text-gray-700 text-sm font-medium">
                                        {settingsInput.site_logo ? settingsInput.site_logo.name : (settingsInput.current_site_logo_path ? 'Current Site Logo' : 'No Logo')}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={removeLogo}
                                        className="mt-2 text-red-600 hover:text-red-800 text-sm font-semibold transition-colors"
                                    >
                                        Remove Logo
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Social Media Links */}
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center border-t border-gray-200 pt-6">
                    <Facebook className="w-6 h-6 mr-3 text-purple-600" /> Social Media
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <div className="mb-5">
                        <label htmlFor="facebook_url" className="block text-gray-700 text-sm font-medium mb-2">Facebook URL</label>
                        <input
                            onChange={handleInput}
                            value={settingsInput.facebook_url || ''}
                            type="url" // Use url type for URLs
                            id="facebook_url"
                            name="facebook_url"
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                            placeholder="e.g., https://facebook.com/yoursite"
                        />
                        <small className="text-red-500 text-sm mt-1 block">{error.facebook_url ? error.facebook_url[0] : ''}</small>
                    </div>
                    <div className="mb-5">
                        <label htmlFor="twitter_url" className="block text-gray-700 text-sm font-medium mb-2">Twitter URL</label>
                        <input
                            onChange={handleInput}
                            value={settingsInput.twitter_url || ''}
                            type="url"
                            id="twitter_url"
                            name="twitter_url"
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                            placeholder="e.g., https://twitter.com/yoursite"
                        />
                        <small className="text-red-500 text-sm mt-1 block">{error.twitter_url ? error.twitter_url[0] : ''}</small>
                    </div>
                </div>
                <div className="mb-5">
                    <label htmlFor="instagram_url" className="block text-gray-700 text-sm font-medium mb-2">Instagram URL</label>
                    <input
                        onChange={handleInput}
                        value={settingsInput.instagram_url || ''}
                        type="url"
                        id="instagram_url"
                        name="instagram_url"
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
                        placeholder="e.g., https://instagram.com/yoursite"
                    />
                    <small className="text-red-500 text-sm mt-1 block">{error.instagram_url ? error.instagram_url[0] : ''}</small>
                </div>


                {/* Save Settings Button */}
                <button
                    className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 float-right"
                    type='submit'
                    disabled={saveLoading}
                >
                    {saveLoading ? (
                        <LoadingSpinner size="sm" />
                    ) : (
                        'Save Settings'
                    )}
                </button>
            </motion.form>
        </motion.div>
    );
};

export default GeneralSettings;
