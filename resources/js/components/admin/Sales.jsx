import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import LoadingSpinner from './LoadingSpinner'; // Assuming you have this
import {
    Search,
    PlusCircle,
    MinusCircle,
    Trash2,
    ShoppingCart,
    DollarSign,
    Receipt,
    User,
    CreditCard,
    ArrowLeft,
    CheckCircle,
    XCircle,
    ClipboardCopy,
    Printer,
    RefreshCw,
    Package,
    Tag,
    MapPin, // New icon for location
    UserCheck, // For authenticated user details
    ChevronLeft, // For pagination
    ChevronRight, // For pagination
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Sales = () => {
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    // Cart item structure: { id, name, selling_price, qty, stock_at_location, brand, image }
    const [cart, setCart] = useState([]);
    const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '' });
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [amountPaid, setAmountPaid] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [processedOrder, setProcessedOrder] = useState(null);

    // State for locations and user's assigned location
    const [locations, setLocations] = useState([]);
    const [selectedLocationId, setSelectedLocationId] = useState('');
    const [isLocationsLoading, setIsLocationsLoading] = useState(true);
    const [authUserLocationId, setAuthUserLocationId] = useState(null);
    const [authUserRole, setAuthUserRole] = useState(null); // 0: user, 1: admin, 2: super admin

    // State for Suggested Products Pagination
    const [suggestedProducts, setSuggestedProducts] = useState([]);
    const [isSuggestedProductsLoading, setIsSuggestedProductsLoading] = useState(false);
    const [suggestedProductsCurrentPage, setSuggestedProductsCurrentPage] = useState(1);
    const [suggestedProductsTotalPages, setSuggestedProductsTotalPages] = useState(1);
    const SUGGESTED_PRODUCTS_PER_PAGE = 8; // Define how many suggested products per page


    const productSearchTimeout = useRef(null);
    const receiptRef = useRef(null);

    useEffect(() => {
        document.title = "POS Sales";
        fetchInitialData(); // Fetch user details and locations on component mount
    }, []);

    // Effect to fetch suggested products when selectedLocationId or current page changes
    useEffect(() => {
        if (selectedLocationId) {
            fetchSuggestedProducts(selectedLocationId, suggestedProductsCurrentPage);
        } else {
            setSuggestedProducts([]); // Clear suggested products if no location is selected
            setSuggestedProductsTotalPages(1);
            setSuggestedProductsCurrentPage(1);
        }
    }, [selectedLocationId, suggestedProductsCurrentPage]); // Added suggestedProductsCurrentPage as dependency

    // NEW: Effect to trigger receipt download immediately after a sale is processed
    useEffect(() => {
        if (processedOrder) {
            // Give a small delay to ensure the DOM has updated with the receipt content
            const timer = setTimeout(() => {
                printReceipt();
            }, 500); // Adjust delay if needed

            return () => clearTimeout(timer); // Cleanup timer
        }
    }, [processedOrder]); // Depend on processedOrder

    const fetchInitialData = async () => {
        setLoading(true);
        setIsLocationsLoading(true);
        const authToken = localStorage.getItem('auth_token');

        if (!authToken) {
            toast.error("Authentication token missing. Please log in.");
            setLoading(false);
            setIsLocationsLoading(false);
            // navigate('/login'); // Uncomment if you want to redirect to login
            return;
        }

        try {
            // Fetch authenticated user details
            const userResponse = await axios.get('/api/user', { // Assuming this endpoint returns user details
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (userResponse.data.status === 200 && userResponse.data.user) {
                const user = userResponse.data.user;
                setAuthUserRole(user.role_as);
                setAuthUserLocationId(user.location_id);

                // Fetch locations based on user role
                const locationsResponse = await axios.get('/api/locations', { // Using public locations endpoint
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });

                if (locationsResponse.data.status === 200 && Array.isArray(locationsResponse.data.locations)) {
                    setLocations(locationsResponse.data.locations);

                    // If user is a location admin, pre-select their location and disable the dropdown
                    if (user.role_as === 1 && user.location_id) {
                        setSelectedLocationId(user.location_id);
                    } else if (user.role_as === 2 && locationsResponse.data.locations.length > 0) {
                        // For Super Admins, default to the first location if available, otherwise leave blank
                        setSelectedLocationId(locationsResponse.data.locations[0].id);
                    } else {
                        // For General Admins (role_as 1, no location_id) or other roles, no location is pre-selected
                        setSelectedLocationId('');
                        if (user.role_as === 1 && !user.location_id) {
                            toast.warn("As a general admin, you must be assigned to a location to make sales.");
                        }
                    }
                } else {
                    toast.error("Failed to load locations.");
                }
            } else {
                toast.error(userResponse.data.message || "Failed to fetch user details.");
            }
        } catch (error) {
            console.error("Error fetching initial data:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Error loading initial data (user/locations).");
        } finally {
            setLoading(false);
            setIsLocationsLoading(false);
        }
    };

    // Fetch suggested products for the selected location with pagination
    const fetchSuggestedProducts = async (locationId, page) => {
        setIsSuggestedProductsLoading(true);
        try {
            const response = await axios.get(`/api/admin/pos/products/suggested/${locationId}`, {
                params: { page: page, per_page: SUGGESTED_PRODUCTS_PER_PAGE },
                headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
            });
            if (response.data.status === 200 && response.data.products) {
                setSuggestedProducts(response.data.products.data); // Laravel's paginate returns 'data' array
                setSuggestedProductsTotalPages(response.data.products.last_page); // Laravel's last_page
            } else {
                setSuggestedProducts([]);
                setSuggestedProductsTotalPages(1);
                toast.warn(response.data.message || "No suggested products found for this location.");
            }
        } catch (error) {
            console.error("Error fetching suggested products:", error.response?.data || error.message);
            setSuggestedProducts([]);
            setSuggestedProductsTotalPages(1);
            // Only show error if it's not a 403 (forbidden for non-admins)
            if (error.response?.status !== 403) {
                toast.error("Error loading suggested products.");
            }
        } finally {
            setIsSuggestedProductsLoading(false);
        }
    };

    // Pagination handlers for suggested products
    const handlePrevSuggestedPage = () => {
        setSuggestedProductsCurrentPage(prevPage => Math.max(1, prevPage - 1));
    };

    const handleNextSuggestedPage = () => {
        setSuggestedProductsCurrentPage(prevPage => Math.min(suggestedProductsTotalPages, prevPage + 1));
    };

    // --- Product Search & Selection ---
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchTerm(query);

        if (productSearchTimeout.current) {
            clearTimeout(productSearchTimeout.current);
        }

        const term = query.trim();
        if (term.length > 2 && selectedLocationId) { // Only search if location is selected
            productSearchTimeout.current = setTimeout(async () => {
                setLoading(true);
                try {
                    // Use the new POS-specific search endpoint
                    const response = await axios.get('/api/admin/pos/products/search', {
                        params: { query: term, location_id: selectedLocationId },
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                        },
                    });

                    if (response.data.status === 200 && Array.isArray(response.data.products) && response.data.products.length > 0) {
                        setSearchResults(response.data.products);
                    } else {
                        setSearchResults([]);
                    }
                } catch (error) {
                    console.error("Search error:", error);
                    toast.error(error.response?.data?.message || "Failed to search products.");
                    setSearchResults([]);
                } finally {
                    setLoading(false);
                }
            }, 300);
        } else if (term.length > 2 && !selectedLocationId) {
            toast.warn("Please select a store location first to search for products.");
            setSearchResults([]);
        } else {
            setSearchResults([]);
        }
    };

    const handleAddToCart = (product) => {
        setSearchResults([]);
        setSearchTerm('');

        // Use stock_at_location for validation
        const productStock = parseInt(product.stock_at_location);
        if (productStock === 0) {
            toast.error(`${product.name} is out of stock at this location.`);
            return;
        }

        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            if (existingItem.qty >= productStock) {
                toast.warn(`Cannot add more than available stock (${productStock}) for ${product.name} at this location.`);
                return;
            }
            setCart(cart.map(item =>
                item.id === product.id ? { ...item, qty: item.qty + 1 } : item
            ));
        } else {
            setCart([...cart, {
                id: product.id,
                name: product.name,
                price: parseFloat(product.selling_price), // Use selling_price for the price in cart
                qty: 1,
                stock_at_location: productStock, // Store location-specific stock
                brand: product.brand,
                image: product.image
            }]);
        }
        toast.success(`${product.name} added to cart.`);
    };

    const handleQuantityChange = (id, delta) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQty = item.qty + delta;
                if (newQty < 1) return null; // Mark for removal
                if (newQty > item.stock_at_location) { // Check against the stored location-specific stock
                    toast.warn(`Cannot add more than available stock (${item.stock_at_location}) for ${item.name} at this location.`);
                    return item;
                }
                return { ...item, qty: newQty };
            }
            return item;
        }).filter(Boolean));
    };

    const handleRemoveFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
        toast.info("Item removed from cart.");
    };

    // --- Calculations ---
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const grandTotal = Math.max(0, subtotal - parseFloat(discountAmount || 0));
    const changeDue = paymentMethod === 'cash' ? Math.max(0, parseFloat(amountPaid || 0) - grandTotal) : 0;

    // --- Payment Processing ---
    const handleProcessSale = async () => {
        // Frontend validation for general admin without assigned location
        if (authUserRole === 1 && authUserLocationId === null) {
            toast.error("As a general admin, you are not authorized to make sales without an assigned location.");
            return;
        }

        if (!selectedLocationId) {
            toast.error("Please select a store location to process the sale.");
            return;
        }
        if (cart.length === 0) {
            toast.error("Cart is empty. Please add products to proceed.");
            return;
        }

        if (paymentMethod === 'cash' && parseFloat(amountPaid || 0) < grandTotal) {
            toast.error("Amount paid is less than the grand total.");
            return;
        }

        setLoading(true);
        try {
            const saleData = {
                is_pos: 1, // <--- IMPORTANT: This flag tells the backend it's a POS sale
                location_id: selectedLocationId, // <--- NEW: Send the selected location ID
                customer_name: customerInfo.name || null,
                customer_email: customerInfo.email || null,
                customer_phone: customerInfo.phone || null,
                payment_method: paymentMethod, // 'cash', 'card_pos', 'bank_transfer'
                amount_paid: parseFloat(amountPaid || 0),
                discount_amount: parseFloat(discountAmount || 0),
                grand_total: grandTotal,
                items: cart.map(item => ({
                    id: item.id, // Use id
                    qty: item.qty, // Use quantity
                    price: item.price, // Price at the time of sale (selling_price)
                    name: item.name, // Also send product name for items_json
                }))
            };
            console.log("Sending sale data:", saleData); // For debugging
            const res = await axios.post('/api/orders/place', saleData, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
            });

            if (res.data.status === 200) { // Check res.data.status as per Laravel convention
                toast.success("Sale processed successfully!");
                // Store the returned order, including the location_id which should be returned by the backend
                setProcessedOrder({
                    ...res.data.order,
                    // Ensure location_id is available on the processed order for the receipt
                    location_id: selectedLocationId
                });
                // The useEffect will now handle the printReceipt call
            } else {
                toast.error(res.data.message || "Failed to process sale.");
            }
        } catch (error) {
            console.error("Error processing sale:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "An error occurred while processing the sale.");
        } finally {
            setLoading(false);
        }
    };

    const handleNewSale = () => {
        setProcessedOrder(null); // Clear processed order to show main POS interface
        setCart([]);
        setCustomerInfo({ name: '', email: '', phone: '' });
        setPaymentMethod('cash');
        setAmountPaid('');
        setDiscountAmount(0);
        setSearchTerm('');
        setSearchResults([]);
        // Keep selectedLocationId as it is, assuming admin stays at the same location
        // If you want to force re-selection, set setSelectedLocationId('');
    };

    // --- Receipt Printing ---
    const printReceipt = async () => {
        if (!receiptRef.current) {
            toast.error("Receipt content not available for printing.");
            return;
        }
        setLoading(true);
        try {
            const canvas = await html2canvas(receiptRef.current, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');

            const imgWidth = pdf.internal.pageSize.getWidth();
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const contentHeight = pdf.internal.pageSize.getHeight();

            let position = 0;
            let heightLeft = imgHeight;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= contentHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= contentHeight;
            }

            pdf.save(`receipt_${processedOrder.order_number}.pdf`);
            toast.success("Receipt downloaded successfully!");
        } catch (error) {
            console.error("Error generating receipt PDF:", error);
            toast.error("Failed to generate receipt PDF.");
        } finally {
            setLoading(false);
        }
    };

    if (loading || isLocationsLoading) {
        return <LoadingSpinner />;
    }

    // Determine if the location select should be disabled
    const isLocationSelectDisabled = isLocationsLoading || locations.length === 0 || (authUserRole === 1 && authUserLocationId !== null);

    // Determine if the "Process Sale" button should be disabled
    const isProcessSaleDisabled = cart.length === 0 || loading || !selectedLocationId || (authUserRole === 1 && authUserLocationId === null);


    // Framer Motion variants
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
    };

    return (
        <motion.div
            className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-100 text-gray-800"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 bg-white rounded-xl shadow-md p-6">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 sm:mb-0">Point of Sale (POS)</h1>
                <button
                    onClick={handleNewSale}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 flex items-center"
                >
                    <RefreshCw className="w-5 h-5 mr-2" /> New Sale
                </button>
            </header>

            {processedOrder ? (
                // --- Sale Confirmation / Receipt Display ---
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-lg p-8 mb-8 text-center"
                >
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Sale Processed Successfully!</h2>
                    <p className="text-lg text-gray-700 mb-6">Order Number: <span className="font-semibold text-blue-600">#{processedOrder.order_number}</span></p>

                    {/* Receipt Content for PDF */}
                    <div ref={receiptRef} className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-left print-area">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Sales Receipt</h3>
                        <div className="text-sm text-gray-700 mb-4">
                            <p><strong>Order No:</strong> #{processedOrder.order_number}</p>
                            <p><strong>Date:</strong> {new Date(processedOrder.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                            {processedOrder.customer_name && <p><strong>Customer:</strong> {processedOrder.customer_name}</p>}
                            {/* Safely access payment_method */}
                            <p><strong>Payment Method:</strong> {processedOrder.payment_method?.replace(/_/g, ' ') || 'N/A'}</p>
                            {/* Display location on receipt if available */}
                            {processedOrder.location_id && locations.find(loc => loc.id === processedOrder.location_id) && (
                                <p><strong>Location:</strong> {locations.find(loc => loc.id === processedOrder.location_id).name}</p>
                            )}
                        </div>
                        <div className="mb-4">
                            <h4 className="font-semibold mb-2">Items:</h4>
                            <ul className="divide-y divide-gray-200">
                                {/* Safely parse items_json */}
                                {(JSON.parse(processedOrder.items_json || '[]')).map((item, index) => (
                                    <li key={index} className="flex justify-between py-1">
                                        <span>{item.name} x {item.qty}</span>
                                        <span>₦{(item.qty * item.price).toLocaleString()}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="border-t border-gray-200 pt-4 text-right">
                            {/* Safely access grand_total and discount_amount */}
                            <p className="font-semibold text-lg">Subtotal: ₦{parseFloat((processedOrder.grand_total ?? 0) + (processedOrder.discount_amount ?? 0)).toLocaleString()}</p>
                            {(processedOrder.discount_amount ?? 0) > 0 && (
                                <p className="font-semibold text-red-600">Discount: -₦{parseFloat(processedOrder.discount_amount).toLocaleString()}</p>
                            )}
                            <p className="text-2xl font-bold text-emerald-700 mt-2">Grand Total: ₦{parseFloat(processedOrder.grand_total ?? 0).toLocaleString()}</p>
                            {paymentMethod === 'cash' && (
                                <>
                                    <p className="text-sm text-gray-600 mt-1">Amount Paid: ₦{parseFloat(amountPaid).toLocaleString()}</p>
                                    <p className="text-sm text-blue-600">Change: ₦{changeDue.toLocaleString()}</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-center space-x-4 mt-6">
                        <button
                            onClick={printReceipt}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 flex items-center"
                        >
                            <Printer className="w-5 h-5 mr-2" /> Print/Download Receipt
                        </button>
                        <button
                            onClick={handleNewSale}
                            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 flex items-center"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" /> Start New Sale
                        </button>
                    </div>
                </motion.div>
            ) : (
                // --- Main POS Interface ---
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Panel: Product Search & Cart */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 flex flex-col h-full">
                        <h2 className="text-2xl font-bold text-gray-900 mb-5 flex items-center">
                            <Package className="w-6 h-6 mr-3 text-orange-600" /> Products & Cart
                        </h2>

                        {/* Location Selection */}
                        <div className="mb-6">
                            <label htmlFor="location-select" className="block text-sm font-medium text-gray-700 mb-1">
                                <MapPin className="inline-block w-4 h-4 mr-1 text-blue-500" /> Select Store Location:
                            </label>
                            <select
                                id="location-select"
                                className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedLocationId}
                                onChange={(e) => {
                                    setSelectedLocationId(parseInt(e.target.value));
                                    setSuggestedProductsCurrentPage(1); // Reset page when location changes
                                }}
                                disabled={isLocationSelectDisabled}
                            >
                                {isLocationsLoading ? (
                                    <option value="">Loading locations...</option>
                                ) : locations.length === 0 ? (
                                    <option value="">No locations available</option>
                                ) : (
                                    <>
                                        {/* If user is a location admin with an assigned location, only show that option */}
                                        {(authUserRole === 1 && authUserLocationId !== null) ? (
                                            locations.filter(loc => loc.id === authUserLocationId).map(location => (
                                                <option key={location.id} value={location.id}>
                                                    {location.name} (Your Assigned Location)
                                                </option>
                                            ))
                                        ) : (
                                            // For Super Admins or General Admins, show all locations
                                            <>
                                                <option value="">-- Select a Location --</option>
                                                {locations.map(location => (
                                                    <option key={location.id} value={location.id}>
                                                        {location.name}
                                                    </option>
                                                ))}
                                            </>
                                        )}
                                    </>
                                )}
                            </select>
                            {(authUserRole === 1 && authUserLocationId !== null) && (
                                <p className="text-xs text-gray-500 mt-1 flex items-center">
                                    <UserCheck className="w-3 h-3 mr-1" /> You are assigned to this location.
                                </p>
                            )}
                            {locations.length === 0 && !isLocationsLoading && (
                                <p className="text-sm text-red-500 mt-2">
                                    No active locations found. Please add locations or ensure they are active.
                                </p>
                            )}
                            {(authUserRole === 1 && authUserLocationId === null) && (
                                <p className="text-sm text-red-500 mt-2">
                                    You must be assigned to a specific store location by a Super Admin to make sales.
                                </p>
                            )}
                        </div>

                        {/* Product Search */}
                        <div className="relative mb-6">
                            <input
                                type="text"
                                placeholder={selectedLocationId ? "Search products by name, SKU, or brand..." : "Select a location to search products"}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                disabled={!selectedLocationId || (authUserRole === 1 && authUserLocationId === null)} // Disable search if no location is selected or if general admin
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            {searchResults.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                                    <AnimatePresence>
                                        {searchResults.map(product => (
                                            <motion.li
                                                key={product.id}
                                                className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors"
                                                onClick={() => handleAddToCart(product)}
                                                variants={itemVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                            >
                                                <div className="flex items-center">
                                                    {product.image && (
                                                        <img
                                                            src={product.image.startsWith('http') ? product.image : `/${product.image}`}
                                                            alt={product.name}
                                                            className="w-10 h-10 object-cover rounded-md mr-3"
                                                            onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/40x40/cccccc/000000?text=No+Img`; }}
                                                        />
                                                    )}
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{product.name}</p>
                                                        <p className="text-sm text-gray-500">Brand: {product.brand || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-blue-600">₦{parseFloat(product.selling_price).toLocaleString()}</p>
                                                    {/* Display stock_at_location */}
                                                    <p className="text-xs text-gray-500">Stock: {product.stock_at_location}</p>
                                                </div>
                                            </motion.li>
                                        ))}
                                    </AnimatePresence>
                                </ul>
                            )}
                        </div>

                        {/* Suggested Products */}
                        {selectedLocationId && suggestedProducts.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                    <Tag className="w-5 h-5 mr-2 text-purple-600" /> Suggested Products
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {suggestedProducts.map(product => (
                                        <motion.div
                                            key={product.id}
                                            className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex flex-col items-center text-center cursor-pointer hover:bg-gray-100 transition-colors"
                                            onClick={() => handleAddToCart(product)}
                                            variants={itemVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                        >
                                            {product.image && (
                                                <img
                                                    src={product.image.startsWith('http') ? product.image : `/${product.image}`}
                                                    alt={product.name}
                                                    className="w-16 h-16 object-cover rounded-md mb-2"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/64x64/cccccc/000000?text=No+Img`; }}
                                                />
                                            )}
                                            <p className="font-medium text-gray-900 text-sm truncate w-full">{product.name}</p>
                                            <p className="text-blue-600 font-bold text-sm">₦{parseFloat(product.selling_price).toLocaleString()}</p>
                                            <p className="text-xs text-gray-500">Stock: {product.stock_at_location}</p>
                                        </motion.div>
                                    ))}
                                </div>
                                {/* Suggested Products Pagination */}
                                {suggestedProductsTotalPages > 1 && (
                                    <div className="flex justify-center items-center mt-4 space-x-2">
                                        <button
                                            onClick={handlePrevSuggestedPage}
                                            disabled={suggestedProductsCurrentPage === 1 || isSuggestedProductsLoading}
                                            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <span className="text-sm text-gray-700">
                                            Page {suggestedProductsCurrentPage} of {suggestedProductsTotalPages}
                                        </span>
                                        <button
                                            onClick={handleNextSuggestedPage}
                                            disabled={suggestedProductsCurrentPage === suggestedProductsTotalPages || isSuggestedProductsLoading}
                                            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Cart Display */}
                        <div className="flex-grow overflow-y-auto border-t border-gray-200 pt-6 mt-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                                <ShoppingCart className="w-6 h-6 mr-3 text-emerald-600" /> Cart ({cart.length} items)
                            </h3>
                            {cart.length === 0 ? (
                                <div className="text-center text-gray-500 py-10">
                                    <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg">Your cart is empty.</p>
                                    <p className="text-sm">Start by searching for products or selecting from suggestions.</p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-200">
                                    <AnimatePresence>
                                        {cart.map(item => (
                                            <motion.li
                                                key={item.id}
                                                className="flex items-center justify-between py-4"
                                                variants={itemVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                            >
                                                <div className="flex items-center flex-grow">
                                                    {item.image && (
                                                        <img
                                                            src={item.image.startsWith('http') ? item.image : `/${item.image}`}
                                                            alt={item.name}
                                                            className="w-12 h-12 object-cover rounded-md mr-3"
                                                            onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/48x48/cccccc/000000?text=No+Img`; }}
                                                        />
                                                    )}
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{item.name}</p>
                                                        <p className="text-sm text-gray-500">₦{item.price.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, -1)}
                                                        className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                                    >
                                                        <MinusCircle className="w-5 h-5" />
                                                    </button>
                                                    <span className="font-bold text-lg">{item.qty}</span>
                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, 1)}
                                                        className="p-1 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                                                    >
                                                        <PlusCircle className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemoveFromCart(item.id)}
                                                        className="p-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors ml-2"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </motion.li>
                                        ))}
                                    </AnimatePresence>
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Customer Info & Payment */}
                    <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 flex flex-col">
                        <h2 className="text-2xl font-bold text-gray-900 mb-5 flex items-center">
                            <User className="w-6 h-6 mr-3 text-blue-600" /> Customer & Payment
                        </h2>

                        {/* Customer Information */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Customer Details (Optional)</h3>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Customer Name"
                                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={customerInfo.name}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                />
                                <input
                                    type="email"
                                    placeholder="Customer Email"
                                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={customerInfo.email}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Customer Phone"
                                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={customerInfo.phone}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Discount */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Discount</h3>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                                <input
                                    type="number"
                                    placeholder="Discount Amount"
                                    className="w-full pl-8 p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={discountAmount}
                                    onChange={(e) => setDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment Method</h3>
                            <div className="flex space-x-3">
                                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer flex-grow has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 has-[:checked]:text-blue-700 transition-all duration-200">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cash"
                                        checked={paymentMethod === 'cash'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="mr-2 accent-blue-600"
                                    />
                                    <DollarSign className="w-5 h-5 mr-1" /> Cash
                                </label>
                                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer flex-grow has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 has-[:checked]:text-blue-700 transition-all duration-200">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="card_pos"
                                        checked={paymentMethod === 'card_pos'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="mr-2 accent-blue-600"
                                    />
                                    <CreditCard className="w-5 h-5 mr-1" /> Card (POS)
                                </label>
                            </div>
                            <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer mt-3 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 has-[:checked]:text-blue-700 transition-all duration-200">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="bank_transfer"
                                    checked={paymentMethod === 'bank_transfer'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="mr-2 accent-blue-600"
                                />
                                <ClipboardCopy className="w-5 h-5 mr-1" /> Bank Transfer
                            </label>
                        </div>

                        {/* Amount Paid (for cash) */}
                        {paymentMethod === 'cash' && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Amount Paid</h3>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                                    <input
                                        type="number"
                                        placeholder="Enter amount received"
                                        className="w-full pl-8 p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={amountPaid}
                                        onChange={(e) => setAmountPaid(parseFloat(e.target.value) || '')}
                                        min="0"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Totals */}
                        <div className="mt-auto pt-6 border-t border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-lg font-semibold text-gray-700">Subtotal:</span>
                                <span className="text-lg font-bold text-gray-900">₦{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-lg font-semibold text-gray-700">Discount:</span>
                                <span className="text-lg font-bold text-red-600">-₦{discountAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xl font-bold text-gray-800">Grand Total:</span>
                                <span className="text-3xl font-extrabold text-emerald-700">₦{grandTotal.toLocaleString()}</span>
                            </div>
                            {paymentMethod === 'cash' && (
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-lg font-semibold text-gray-700">Change Due:</span>
                                    <span className="text-xl font-bold text-blue-600">₦{changeDue.toLocaleString()}</span>
                                </div>
                            )}

                            <button
                                onClick={handleProcessSale}
                                disabled={isProcessSaleDisabled}
                                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <LoadingSpinner size="sm" /> : <Receipt className="w-5 h-5 mr-2" />}
                                <span>{loading ? 'Processing...' : 'Process Sale'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default Sales;
