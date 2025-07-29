import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import LoadingSpinner from './LoadingSpinner'; // Assuming this path is correct
import { Link } from 'react-router-dom';

import {
    MapPin,
    Plus,
    Edit,
    Trash2,
    Save,
    X,
    Building, // Icon for locations list
    Loader,
    CheckCircle,
    XCircle,
    Eye,
} from 'lucide-react';

const LocationManagement = () => {
    const [locations, setLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormSubmitting, setIsFormSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false); // Controls visibility of add/edit form
    const [currentLocation, setCurrentLocation] = useState(null); // Data for editing, null for adding
    const [formErrors, setFormErrors] = useState({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [locationToDelete, setLocationToDelete] = useState(null);

    // Initial form state for adding/editing a location
    const initialFormState = {
        name: '',
        address: '',
        phone: '',
        email: '',
        latitude: '',
        longitude: '',
        is_active: true,
    };
    const [formData, setFormData] = useState(initialFormState);

    // Fetch all locations
    const fetchLocations = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/api/admin/locations', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
            });
            if (response.data.status === 200) {
                setLocations(response.data.locations);
            } else {
                toast.error(response.data.message || "Failed to fetch locations.");
            }
        } catch (error) {
            console.error("Error fetching locations:", error.response?.data || error.message);
            toast.error("An error occurred while fetching locations.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        document.title = "Admin - Manage Locations";
        fetchLocations();
    }, [fetchLocations]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    // Open form for adding a new location
    const handleAddLocationClick = () => {
        setCurrentLocation(null); // Clear current location to indicate 'add' mode
        setFormData(initialFormState); // Reset form fields
        setFormErrors({}); // Clear any previous errors
        setShowForm(true);
    };

    // Open form for editing an existing location
    const handleEditLocationClick = (location) => {
        setCurrentLocation(location); // Set location to be edited
        setFormData({
            name: location.name,
            address: location.address,
            phone: location.phone || '',
            email: location.email || '',
            latitude: location.latitude || '',
            longitude: location.longitude || '',
            is_active: location.is_active,
        });
        setFormErrors({});
        setShowForm(true);
    };

    // Handle form submission (Add or Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsFormSubmitting(true);
        setFormErrors({}); // Clear previous errors

        const payload = {
            ...formData,
            // Ensure numeric fields are numbers, not empty strings
            latitude: formData.latitude === '' ? null : parseFloat(formData.latitude),
            longitude: formData.longitude === '' ? null : parseFloat(formData.longitude),
        };

        try {
            let response;
            if (currentLocation) {
                // Update existing location
                response = await axios.post(`/api/admin/locations/${currentLocation.id}`, payload, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
                });
            } else {
                // Add new location
                response = await axios.post('/api/admin/locations', payload, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
                });
            }

            if (response.data.status === 200) {
                toast.success(response.data.message);
                setShowForm(false); // Hide form
                fetchLocations(); // Refresh list
            } else if (response.data.status === 422) {
                setFormErrors(response.data.errors);
                toast.error("Validation failed. Please check your inputs.");
            } else {
                toast.error(response.data.message || "Operation failed.");
            }
        } catch (error) {
            console.error("Form submission error:", error.response?.data || error.message);
            if (error.response && error.response.status === 422) {
                setFormErrors(error.response.data.errors);
                toast.error("Validation failed. Please check your inputs.");
            } else {
                toast.error("An error occurred during submission.");
            }
        } finally {
            setIsFormSubmitting(false);
        }
    };

    // Confirm deletion
    const confirmDelete = (location) => {
        setLocationToDelete(location);
        setShowDeleteConfirm(true);
    };

    // Execute deletion
    const handleDelete = async () => {
        if (!locationToDelete) return;

        setIsLoading(true); // Show global loading while deleting
        setShowDeleteConfirm(false); // Hide confirmation modal

        try {
            const response = await axios.delete(`/api/admin/locations/${locationToDelete.id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
            });
            if (response.data.status === 200) {
                toast.success(response.data.message);
                fetchLocations(); // Refresh list
            } else {
                toast.error(response.data.message || "Failed to delete location.");
            }
        } catch (error) {
            console.error("Delete error:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "An error occurred while deleting the location.");
        } finally {
            setIsLoading(false);
            setLocationToDelete(null); // Clear location to delete
        }
    };

    // Framer Motion variants (reused from Sales.jsx for consistency)
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
    };

    // Modal variants for confirmation dialog
    const modalVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 260, damping: 20 } },
        exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <motion.div
            className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-100 text-gray-800"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 bg-white rounded-xl shadow-md p-6">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 sm:mb-0">
                    <MapPin className="inline-block w-8 h-8 mr-3 text-blue-600" /> Manage Store Locations
                </h1>
                {!showForm && (
                    <button
                        onClick={handleAddLocationClick}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 flex items-center"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Add New Location
                    </button>
                )}
            </header>

            <AnimatePresence mode="wait">
                {showForm ? (
                    // --- Add/Edit Location Form ---
                    <motion.div
                        key="location-form"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={containerVariants} // Reusing container variants for entrance/exit
                        className="bg-white rounded-xl shadow-lg p-6 mb-8"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3">
                            {currentLocation ? 'Edit Location' : 'Add New Location'}
                        </h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Location Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${formErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                                    placeholder="e.g., Abuja Main Store"
                                />
                                {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name[0]}</p>}
                            </div>
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${formErrors.address ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                                    placeholder="e.g., 123 Main St, City, State"
                                />
                                {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address[0]}</p>}
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${formErrors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                                    placeholder="e.g., +2348012345678"
                                />
                                {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone[0]}</p>}
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${formErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                                    placeholder="e.g., info@store.com"
                                />
                                {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email[0]}</p>}
                            </div>
                            <div>
                                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">Latitude (Optional)</label>
                                <input
                                    type="number"
                                    id="latitude"
                                    name="latitude"
                                    value={formData.latitude}
                                    onChange={handleInputChange}
                                    step="any"
                                    className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${formErrors.latitude ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                                    placeholder="e.g., 9.0765"
                                />
                                {formErrors.latitude && <p className="text-red-500 text-sm mt-1">{formErrors.latitude[0]}</p>}
                            </div>
                            <div>
                                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">Longitude (Optional)</label>
                                <input
                                    type="number"
                                    id="longitude"
                                    name="longitude"
                                    value={formData.longitude}
                                    onChange={handleInputChange}
                                    step="any"
                                    className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${formErrors.longitude ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                                    placeholder="e.g., 7.3986"
                                />
                                {formErrors.longitude && <p className="text-red-500 text-sm mt-1">{formErrors.longitude[0]}</p>}
                            </div>
                            <div className="md:col-span-2 flex items-center mt-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleInputChange}
                                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="is_active" className="ml-2 block text-sm font-medium text-gray-700">Is Active?</label>
                            </div>
                            <div className="md:col-span-2 flex justify-end space-x-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg shadow-md transition-all duration-300"
                                    disabled={isFormSubmitting}
                                >
                                    <X className="w-5 h-5 inline-block mr-2" /> Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center"
                                    disabled={isFormSubmitting}
                                >
                                    {isFormSubmitting ? <Loader className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                                    {currentLocation ? 'Update Location' : 'Add Location'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                ) : (
                    // --- Locations List ---
                    <motion.div
                        key="locations-list"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={containerVariants} // Reusing container variants for entrance/exit
                        className="bg-white rounded-xl shadow-lg p-6"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-5 flex items-center">
                            <Building className="w-6 h-6 mr-3 text-emerald-600" /> All Locations
                        </h2>
                        {locations.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 text-lg border border-dashed border-gray-300 rounded-lg">
                                <p>No locations found. Click "Add New Location" to get started!</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        <AnimatePresence>
                                            {locations.map((location) => (
                                                <motion.tr
                                                    key={location.id}
                                                    variants={itemVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="exit"
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{location.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{location.address}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{location.phone || 'N/A'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{location.email || 'N/A'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        {location.is_active ? (
                                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                                        ) : (
                                                            <XCircle className="w-5 h-5 text-red-500" />
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <Link
                                                            to={`/admin/store/${location.id}`}
                                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                        >
                                                            <Eye className="w-5 h-5 inline-block" />
                                                        </Link>

                                                        <button
                                                            onClick={() => handleEditLocationClick(location)}
                                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                            title="Edit Location"
                                                        >
                                                            <Edit className="w-5 h-5 inline-block" />
                                                        </button>
                                                        <button
                                                            onClick={() => confirmDelete(location)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Delete Location"
                                                        >
                                                            <Trash2 className="w-5 h-5 inline-block" />
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm text-center"
                        >
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Deletion</h3>
                            <p className="text-gray-700 mb-6">
                                Are you sure you want to delete location "<span className="font-semibold">{locationToDelete?.name}</span>"?
                                This action cannot be undone.
                            </p>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default LocationManagement;
