import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
    MapPin,
    Package,
    Save,
    X,
    Loader,
    CheckCircle,
    MinusCircle,
    PlusCircle,
    Trash2
} from 'lucide-react';

const ProductLocationInventory = ({ productId }) => {
    const [locations, setLocations] = useState([]);
    const [productLocations, setProductLocations] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [productName, setProductName] = useState('');

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [locationToDetach, setLocationToDetach] = useState(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const locationsRes = await axios.get('/api/locations', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
            });

            if (locationsRes.data.status !== 200) {
                toast.error(locationsRes.data.message || "Failed to load locations.");
                return;
            }
            const fetchedLocations = locationsRes.data.locations;
            setLocations(fetchedLocations);

            const productLocationsRes = await axios.get(`/api/admin/products/${productId}/locations`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
            });

            if (productLocationsRes.data.status === 200) {
                const fetchedProductLocations = {};
                productLocationsRes.data.locations.forEach(loc => {
                    fetchedProductLocations[loc.id] = loc.pivot.quantity_in_store;
                });
                setProductLocations(fetchedProductLocations);

                const productRes = await axios.get(`/api/products/edit/${productId}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
                });
                if (productRes.data.status === 200 && productRes.data.Product) {
                    setProductName(productRes.data.Product.name);
                }
            } else {
                toast.error(productLocationsRes.data.message || "Failed to load product location data.");
            }
        } catch (error) {
            console.error("Error fetching inventory data:", error.response?.data || error.message);
            toast.error("An error occurred while loading inventory data.");
        } finally {
            setIsLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        if (productId) {
            fetchData();
        }
    }, [productId, fetchData]);

    const handleQuantityChange = (locationId, value) => {
        // Allow empty string if user clears the input, but treat as 0 for submission
        const parsedValue = parseInt(value, 10);
        setProductLocations(prev => ({
            ...prev,
            [locationId]: isNaN(parsedValue) ? '' : Math.max(0, parsedValue) // Ensure quantity is >= 0
        }));
    };

    const handleQuantityButton = (locationId, delta) => {
        setProductLocations(prev => {
            // Get current quantity, default to 0 if undefined or empty string
            const currentQty = parseInt(prev[locationId] || 0, 10);
            const newQty = Math.max(0, currentQty + delta);
            return {
                ...prev,
                [locationId]: newQty
            };
        });
    };

    const handleSaveInventory = async () => {
        setIsSaving(true);
        setFormErrors({});
        let hasError = false;

        const updates = [];
        locations.forEach(location => {
            // Get the current quantity from state.
            // If it's undefined (no existing stock) or an empty string (user cleared it), treat it as 0.
            let quantity = productLocations[location.id];
            if (quantity === undefined || quantity === null || quantity === '') {
                quantity = 0; // Default to 0 for unset or empty inputs
            }

            const parsedQuantity = parseInt(quantity, 10);

            // Validate the parsed quantity: must be a non-negative number
            if (isNaN(parsedQuantity) || parsedQuantity < 0) {
                setFormErrors(prev => ({
                    ...prev,
                    [location.id]: ['Quantity must be a non-negative number.']
                }));
                hasError = true;
            } else {
                // If valid, add to updates array
                updates.push({
                    location_id: location.id,
                    quantity_in_store: parsedQuantity, // Use the parsed (and potentially defaulted) quantity
                });
            }
        });

        if (hasError) {
            toast.error("Please correct the invalid quantities.");
            setIsSaving(false);
            return;
        }

        try {
            // Send updates for all locations (including those set to 0)
            for (const update of updates) {
                await axios.post(`/api/admin/products/${productId}/locations`, update, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
                });
            }
            toast.success("Product inventory updated across locations!");
            // Re-fetch data to ensure UI reflects latest state after saving
            fetchData();
        } catch (error) {
            console.error("Error saving inventory:", error.response?.data || error.message);
            if (error.response && error.response.status === 422) {
                setFormErrors(error.response.data.errors);
                toast.error("Validation failed. Please check your inputs.");
            } else {
                toast.error(error.response?.data?.message || "An error occurred while saving inventory.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const confirmDetach = (location) => {
        setLocationToDetach(location);
        setShowDeleteConfirm(true);
    };

    const cancelDetach = () => {
        setLocationToDetach(null);
        setShowDeleteConfirm(false);
    };

    const handleDetachConfirmed = async () => {
        if (!locationToDetach) return;

        setIsSaving(true);
        setShowDeleteConfirm(false);

        try {
            await axios.delete(`/api/admin/products/${productId}/locations/${locationToDetach.id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
            });
            toast.success(`Product "${productName}" removed from "${locationToDetach.name}".`);
            fetchData();
        } catch (error) {
            console.error("Error detaching product from location:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Failed to remove product from location.");
        } finally {
            setIsSaving(false);
            setLocationToDetach(null);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 260, damping: 20 } },
        exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-40">
                <Loader className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <motion.div
            className="bg-white rounded-xl shadow-lg p-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <h2 className="text-2xl font-bold text-gray-900 mb-5 flex items-center border-b pb-3">
                <Package className="w-6 h-6 mr-3 text-purple-600" /> Inventory for "{productName || 'Product'}"
            </h2>

            {locations.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-lg border border-dashed border-gray-300 rounded-lg">
                    <p>No active store locations found. Please add locations first to manage product inventory by store.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {location.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleQuantityButton(location.id, -1)}
                                                    className="p-1 text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
                                                    title="Decrement quantity"
                                                    disabled={isSaving}
                                                >
                                                    <MinusCircle className="w-5 h-5" />
                                                </button>
                                                <input
                                                    type="number"
                                                    // Display 0 if current state is undefined or null, otherwise show the actual value
                                                    value={productLocations[location.id] ?? 0}
                                                    onChange={(e) => handleQuantityChange(location.id, e.target.value)}
                                                    className={`w-24 p-2 border rounded-md text-center focus:outline-none focus:ring-2 ${formErrors[location.id] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                                                    min="0"
                                                    disabled={isSaving}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleQuantityButton(location.id, 1)}
                                                    className="p-1 text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
                                                    title="Increment quantity"
                                                    disabled={isSaving}
                                                >
                                                    <PlusCircle className="w-5 h-5" />
                                                </button>
                                            </div>
                                            {formErrors[location.id] && <p className="text-red-500 text-xs mt-1">{formErrors[location.id][0]}</p>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                                            <button
                                                type="button"
                                                onClick={() => confirmDetach(location)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Remove product from this location (set stock to 0)"
                                                disabled={isSaving}
                                            >
                                                <Trash2 className="w-5 h-5 inline-block mr-1" /> Remove
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            )}

            <div className="flex justify-end mt-6">
                <button
                    onClick={handleSaveInventory}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center"
                    disabled={isSaving || isLoading}
                >
                    {isSaving ? <Loader className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                    Save Inventory Changes
                </button>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && locationToDetach && (
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
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Removal</h3>
                            <p className="text-gray-700 mb-6">
                                Are you sure you want to remove all stock of "<span className="font-semibold">{productName}</span>" from "<span className="font-semibold">{locationToDetach.name}</span>"?
                                This action will set its quantity to 0 at this location.
                            </p>
                            <div className="flex justify-center space-x-4">
                                <button
                                    type="button"
                                    onClick={cancelDetach}
                                    className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDetachConfirmed}
                                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold transition-colors"
                                >
                                    Remove Stock
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ProductLocationInventory;
