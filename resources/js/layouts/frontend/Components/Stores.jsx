import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import LoadingSpinner from './Loader';
import { MapPin, Phone, Clock, Search, Building } from 'lucide-react';

const Stores = () => {
    const [locations, setLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedState, setSelectedState] = useState('');

    const extractStateFromAddress = (name, address) => {
        const combinedText = `${name || ''} ${address || ''}`.toLowerCase();

        const nigerianStates = [
            'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
            'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo',
            'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
            'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
            'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT'
        ];

        // Check for specific states first
        if (combinedText.includes('fct') || combinedText.includes('abuja')) {
            return 'FCT';
        }

        for (const state of nigerianStates) {
            if (state && combinedText.includes(state.toLowerCase())) {
                return state;
            }
        }
        return 'Other';
    };

    // Fetch locations data
    const fetchLocations = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/api/locations');
            if (response.data.status === 200) {
                const processedLocations = response.data.locations.map(loc => ({
                    ...loc,
                    parsedState: extractStateFromAddress(loc.name, loc.address),
                    working_hours: loc.working_hours || 'Mon-Fri: 9 AM - 5 PM, Sat: 10 AM - 3 PM'
                }));
                setLocations(processedLocations);
            } else {
                toast.error(response.data.message || "Failed to load store locations.");
            }
        } catch (error) {
            console.error("Error fetching locations:", error.response?.data || error.message);
            toast.error("An error occurred while loading store locations.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        document.title = "Our Physical Outlets";
        fetchLocations();
    }, [fetchLocations]);

    // Get unique states for the dropdown filter
    const uniqueStates = useMemo(() => {
        const states = new Set(locations.map(loc => loc.parsedState));
        return ['All States', ...Array.from(states).sort()];
    }, [locations]);

    // Filtered and searched locations
    const filteredLocations = useMemo(() => {
        let currentLocations = locations;

        // Filter by selected state
        if (selectedState && selectedState !== 'All States') {
            currentLocations = currentLocations.filter(loc => loc.parsedState === selectedState);
        }

        // Filter by search term
        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            currentLocations = currentLocations.filter(loc =>
                loc.name.toLowerCase().includes(lowerSearchTerm) ||
                loc.address.toLowerCase().includes(lowerSearchTerm) ||
                (loc.phone && loc.phone.includes(lowerSearchTerm)) ||
                (loc.email && loc.email.toLowerCase().includes(lowerSearchTerm))
            );
        }
        return currentLocations;
    }, [locations, selectedState, searchTerm]);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    // Framer Motion variants
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 10,
                duration: 0.5
            }
        },
        hover: {
            scale: 1.03,
            boxShadow: "0px 12px 24px rgba(0,0,0,0.15)",
            transition: { duration: 0.2 }
        },
        tap: { scale: 0.98 },
        exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
    };

    const inputVariants = {
        hover: { borderColor: '#60A5FA' }, // blue-400
        focus: { borderColor: '#3B82F6', boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.5)' }, // blue-500 with ring
        tap: { scale: 0.99 },
    };

    return (
        <motion.div
            className="min-h-screen p-4 mt-28 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-200 text-gray-800
                       dark:from-gray-900 dark:to-gray-950 dark:text-gray-200"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8
                               bg-white rounded-2xl shadow-xl p-8
                               dark:bg-gray-800">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-red-900 mb-4 sm:mb-0
                               dark:text-lime-400">
                    <Building className="inline-block w-8 h-8 mr-3 text-blue-600 dark:text-blue-400" /> Our Physical Outlets
                </h1>
            </header>

            {/* Filter and Search Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 flex flex-col md:flex-row gap-4
                            dark:bg-gray-800">
                <motion.div
                    className="flex-1 relative"
                    whileTap="tap"
                    variants={inputVariants}
                >
                    <input
                        type="text"
                        placeholder="Search stores by name, address, or contact..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900
                                   focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200
                                   dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-blue-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </motion.div>
                <motion.div
                    className="relative"
                    whileTap="tap"
                    variants={inputVariants}
                >
                    <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="w-full md:w-48 px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900
                                   focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 appearance-none pr-8
                                   dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-400"
                    >
                        {uniqueStates.map(state => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </motion.div>
            </div>

            {/* Store Listings */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {filteredLocations.length > 0 ? (
                        filteredLocations.map(store => (
                            <motion.div
                                key={store.id}
                                className="bg-white rounded-2xl shadow-xl p-6 flex flex-col border border-gray-200
                                           transform transition-transform duration-200 ease-in-out
                                           dark:bg-gray-800 dark:border-gray-700"
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                whileHover="hover"
                                whileTap="tap"
                                exit="exit"
                            >
                                <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center
                                           dark:text-white">
                                    <MapPin className="w-6 h-6 mr-3 text-red-900 dark:text-lime-400" /> {store.name}
                                </h3>
                                <p className="text-gray-700 mb-2 flex items-start
                                           dark:text-gray-300">
                                    <MapPin className="w-4 h-4 mr-2 mt-1 text-gray-500 dark:text-gray-400" /> {store.address || 'N/A'}
                                </p>
                                <p className="text-gray-700 mb-2 flex items-center
                                           dark:text-gray-300">
                                    <Phone className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" /> {store.phone || 'N/A'}
                                </p>
                                <p className="text-gray-700 mb-2 flex items-center
                                           dark:text-gray-300">
                                    <Clock className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" /> {store.working_hours}
                                </p>
                                {store.email && (
                                    <p className="text-gray-700 mb-2 flex items-center
                                               dark:text-gray-300">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
                                            <path d="M22 6L12 13L2 6"></path>
                                        </svg>
                                        {store.email}
                                    </p>
                                )}
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="md:col-span-3 text-center py-10 text-gray-500 text-lg border border-dashed border-gray-300 rounded-lg
                                       dark:text-gray-400 dark:border-gray-600"
                        >
                            <p>No stores found matching your criteria.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default Stores;
