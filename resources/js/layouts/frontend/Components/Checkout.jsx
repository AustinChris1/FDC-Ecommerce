import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useCart } from './CartContext';
import Load from '../Components/Load';
import {
    ShoppingCart,
    Package,
    CreditCard,
    Banknote,
    CheckCircle,
    XCircle,
    Info,
    ReceiptText,
    ArrowRight,
    ArrowLeft, // Add ArrowLeft for back button
} from 'lucide-react';
import { PaystackButton } from 'react-paystack';

const Checkout = () => {
    const navigate = useNavigate();
    const { cartItems, totalCartPrice, clearCart } = useCart();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [siteSettings, setSiteSettings] = useState(null);
    const [errorSettings, setErrorSettings] = useState(false);

    // Form states
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address1, setAddress1] = useState('');
    const [address2, setAddress2] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('paystack'); // Default to Paystack

    // These will now be populated by the backend after successful order initiation
    const [orderNumber, setOrderNumber] = useState('');
    const [paystackReference, setPaystackReference] = useState('');
    // State to hold the order total for the persisted order, to check against cart total
    const [persistedOrderTotal, setPersistedOrderTotal] = useState(0);
    // State to hold the payment method of the persisted order for comparison
    const [persistedPaymentMethod, setPersistedPaymentMethod] = useState('');
    // NEW STATE: To store the current order status fetched from backend or a default
    const [currentOrderStatus, setCurrentOrderStatus] = useState('pending_payment'); // Default initial status

    useEffect(() => {
        setLoading(true);
        axios.get('/api/settings/general')
            .then(res => {
                if (res.status === 200) {
                    setSiteSettings(res.data.settings);
                } else {
                    toast.error(res.data.message || "Failed to load site settings.");
                }
            })
            .catch(err => {
                toast.error("Network error or server issue. Could not load site settings.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const paystack_key = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

    // --- Fetch Site Settings on Component Mount (duplicate from above, can be merged) ---
    // This fetches the shipping fee and other general settings
    // I'm keeping your existing structure, but note this useEffect is redundant if the above does the same.
    useEffect(() => {
        setLoading(true);
        setErrorSettings(false);
        axios.get(`/api/settings/general`) // Fetch from API endpoint
            .then(res => {
                if (res.status === 200 && res.data.settings) {
                    setSiteSettings(res.data.settings);
                } else {
                    toast.error(res.data.message || "Failed to load site settings.");
                    setErrorSettings(true);
                }
            })
            .catch(err => {
                console.error("Error fetching site settings:", err);
                toast.error("Network error or server issue. Could not load site settings.");
                setErrorSettings(true);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const shippingCost = useMemo(() => {
        return parseFloat(siteSettings?.shipping_fee ?? 0);
    }, [siteSettings]);

    const grandTotal = useMemo(() => {
        return parseFloat(totalCartPrice) + shippingCost;
    }, [totalCartPrice, shippingCost]); 

    // --- Persist and Load Order Details from localStorage ---
    useEffect(() => {
        document.title = "Checkout - First Digits";

        // Load authenticated user's name and email if available
        const authName = localStorage.getItem('auth_name');
        const authEmail = localStorage.getItem('auth_email');
        if (authName) setFullName(authName);
        if (authEmail) setEmail(authEmail);

        // Redirect if cart is empty, unless we are resuming an order
        if (cartItems.length === 0 && !localStorage.getItem('checkout_order_number')) {
            setLoading(false); // Ensure loading state is false if redirecting
            toast.info("Your cart is empty. Please add items before checking out.");
            navigate('/shop');
            return; // Exit early
        }

        // Attempt to load existing order details from localStorage
        const storedOrderNumber = localStorage.getItem('checkout_order_number');
        const storedPaystackReference = localStorage.getItem('checkout_paystack_reference');
        const storedOrderTotal = parseFloat(localStorage.getItem('checkout_order_total'));
        const storedPaymentMethod = localStorage.getItem('checkout_payment_method');
        const storedOrderStatus = localStorage.getItem('checkout_order_status');


        // Logic to resume or re-evaluate previous checkout session
        if (storedOrderNumber) {
            setOrderNumber(storedOrderNumber);
            setPaystackReference(storedPaystackReference || storedOrderNumber);
            setPersistedOrderTotal(storedOrderTotal);
            setPersistedPaymentMethod(storedPaymentMethod);
            setCurrentOrderStatus(storedOrderStatus || 'pending_payment');

            // Check if cart total or payment method has changed from the persisted order
            if (totalCartPrice === storedOrderTotal && paymentMethod === storedPaymentMethod) {
                setCurrentStep(2);
                toast.info("Resumed previous checkout session.");
            } else {
                setCurrentStep(1); // If inconsistent, stay on step 1 for review/update
                if (totalCartPrice !== storedOrderTotal) {
                    toast.warn("Your cart items have changed. Please review details.");
                } else if (storedPaymentMethod !== paymentMethod) {
                    toast.warn("Payment method changed. Please confirm details.");
                } else {
                    toast.info("Resuming checkout. Review your details.");
                }
            }
        }
        setLoading(false);
    }, [cartItems, navigate, grandTotal, paymentMethod, totalCartPrice]);

    // Effect to save order details to localStorage whenever they change
    useEffect(() => {
        if (orderNumber) {
            localStorage.setItem('checkout_order_number', orderNumber);
            localStorage.setItem('checkout_order_total', totalCartPrice.toString());
            localStorage.setItem('checkout_payment_method', paymentMethod);
            // NEW: Persist the current order status
            localStorage.setItem('checkout_order_status', currentOrderStatus);
            if (paystackReference) {
                localStorage.setItem('checkout_paystack_reference', paystackReference);
            }
        }
    }, [orderNumber, paystackReference, totalCartPrice, paymentMethod, currentOrderStatus]);

    // Function to fetch order details from the backend
    const fetchOrderDetails = useCallback(async (orderNum) => {
        if (!orderNum) return;
        try {
            const res = await axios.get(`/api/orders/${orderNum}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                },
                withCredentials: true,
            });
            if (res.data.status === 200 && res.data.order) {
                // Update state with fetched order details
                const fetchedOrder = res.data.order;
                setFullName(fetchedOrder.full_name || '');
                setEmail(fetchedOrder.email || '');
                setPhone(fetchedOrder.phone || '');
                setAddress1(fetchedOrder.shipping_address1 || '');
                setAddress2(fetchedOrder.shipping_address2 || '');
                setCity(fetchedOrder.city || '');
                setState(fetchedOrder.state || '');
                setZipCode(fetchedOrder.zip_code || '');
                setPaymentMethod(fetchedOrder.payment_method || 'paystack');
                setOrderNumber(fetchedOrder.order_number);
                setPaystackReference(fetchedOrder.paystack_reference || fetchedOrder.order_number);
                setPersistedOrderTotal(fetchedOrder.grand_total); // Use grand_total for persistence
                setPersistedPaymentMethod(fetchedOrder.payment_method);
                setCurrentOrderStatus(fetchedOrder.status); // Set the dynamic status
                toast.info("Order details loaded from server.");
            } else {
                toast.error(res.data.message || "Failed to load existing order details.");
                // Clear local storage if order not found on backend
                localStorage.removeItem('checkout_order_number');
                localStorage.removeItem('checkout_paystack_reference');
                localStorage.removeItem('checkout_order_total');
                localStorage.removeItem('checkout_payment_method');
                localStorage.removeItem('checkout_order_status');
            }
        } catch (error) {
            console.error("Error fetching order details:", error.response?.data || error);
            toast.error("Failed to fetch order details from server.");
            // Clear local storage on error
            localStorage.removeItem('checkout_order_number');
            localStorage.removeItem('checkout_paystack_reference');
            localStorage.removeItem('checkout_order_total');
            localStorage.removeItem('checkout_payment_method');
            localStorage.removeItem('checkout_order_status');
        }
    }, []);

    useEffect(() => {
        const storedOrderNumber = localStorage.getItem('checkout_order_number');
        if (storedOrderNumber && !orderNumber) {
            // If there's a stored order number but it's not yet in state, fetch it
            setOrderNumber(storedOrderNumber);
            fetchOrderDetails(storedOrderNumber);
        } else if (orderNumber && !isSubmitting) {
        }
    }, [orderNumber, fetchOrderDetails, isSubmitting]);


    // Updated: getOrderPayload now uses the dynamic `currentOrderStatus`
    const getOrderPayload = useCallback((method) => ({
        user_info: { fullName, email, phone },
        shipping_address: { address1, address2, city, state, zipCode },
        items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            qty: item.quantity,
            price: item.selling_price
        })),
        total_price: totalCartPrice, // This will map to 'subtotal' on backend if you choose
        shipping_cost: shippingCost,
        grand_total: grandTotal,
        payment_method: method,
        status: currentOrderStatus, // Pass the dynamic status
    }), [fullName, email, phone, address1, address2, city, state, zipCode, cartItems, totalCartPrice, shippingCost, grandTotal, currentOrderStatus]);

    // Initiates a new order on the backend.
    const placeNewOrder = async (method) => {
        setIsSubmitting(true);
        try {
            // When placing a NEW order, its initial status is 'pending_payment'
            const orderData = { ...getOrderPayload(method), status: 'pending_payment' };
            const res = await axios.post(`/api/orders/place`, orderData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                },
                withCredentials: true,
            });

            if (res.data.status === 200 && res.data.order_number) {
                toast.success("New order initiated. Proceeding to payment...");
                setOrderNumber(res.data.order_number);
                setCurrentOrderStatus(res.data.updated_order_status || 'pending_payment'); // Update status from response
                if (method === 'paystack') {
                    setPaystackReference(res.data.paystack_reference || res.data.order_number);
                }
                return res.data;
            } else {
                toast.error(
                    <div className="flex items-center">
                        <XCircle className="dark:text-red-400 text-red-600 mr-2" />
                        <span>{res.data.message || "Failed to initiate new order. Please try again."}</span>
                    </div>,
                    { icon: false }
                );
                return null;
            }
        } catch (error) {
            console.error("New order initiation error:", error.response?.data || error);
            const errorMessage = error.response?.data?.message || "An error occurred while preparing your new order. Please try again later.";
            toast.error(
                <div className="flex items-center">
                    <XCircle className="dark:text-red-400 text-red-600 mr-2" />
                    <span>{errorMessage}</span>
                </div>,
                { icon: false }
            );
            return null;
        } finally {
            setIsSubmitting(false);
        }
    };

    //Updates an existing order on the backend.
    const updateExistingOrder = async (method) => {
        setIsSubmitting(true);
        try {
            const orderData = getOrderPayload(method);
            const res = await axios.post(`/api/orders/${orderNumber}/update`, orderData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                },
                withCredentials: true,
            });

            if (res.data.status === 200 && res.data.order_number) {
                toast.success("Order updated successfully. Proceeding to payment...");
                setOrderNumber(res.data.order_number); // Should be the same
                setCurrentOrderStatus(res.data.updated_order_status || currentOrderStatus); // Update status from response
                if (method === 'paystack') {
                    setPaystackReference(res.data.paystack_reference || res.data.order_number);
                } else {
                    setPaystackReference(''); // Clear if switching to bank transfer
                }
                return res.data;
            } else {
                console.log("Error response data:", res.data);
                toast.error(
                    <div className="flex items-center">
                        <XCircle className="dark:text-red-400 text-red-600 mr-2" />
                        <span>{res.data.message || "Failed to update order. Please try again."}</span>
                    </div>,
                    { icon: false }
                );
                return null;
            }
        } catch (error) {
            console.error("Order update error:", error.response?.data || error);
            const errorMessage = error.response?.data?.message || "An error occurred while updating your order. Please try again later.";
            toast.error(
                <div className="flex items-center">
                    <XCircle className="dark:text-red-400 text-red-600 mr-2" />
                    <span>{errorMessage}</span>
                </div>,
                { icon: false }
            );
            return null;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePaystackSuccess = useCallback(async (res) => {
        if (res.status === 'success' && res.transaction && orderNumber) {
            try {
                // Ensure the payment reference from Paystack matches the one from our initiated order
                if (res.reference !== paystackReference) {
                    toast.error("Payment reference mismatch. Please contact support.");
                    setIsSubmitting(false);
                    return;
                }

                // IMPORTANT: This is where the status changes based on payment success
                const newStatus = 'completed';
                const updateRes = await axios.post(`/api/orders/update-status/${orderNumber}`, {
                    status: newStatus,
                    transaction_id: res.transaction,
                    payment_method: 'paystack',
                }, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                        'Content-Type': 'application/json',
                    }
                });

                if (updateRes.data.status === 200) {
                    toast.success(
                        <div className="flex items-center">
                            <CheckCircle className="dark:text-green-400 text-green-600 mr-2" />
                            <span>Payment successful and order confirmed!</span>
                        </div>,
                        { icon: false }
                    );
                    clearCart();
                    localStorage.removeItem('checkout_order_number');
                    localStorage.removeItem('checkout_paystack_reference');
                    localStorage.removeItem('checkout_order_total');
                    localStorage.removeItem('checkout_payment_method');
                    localStorage.removeItem('checkout_order_status'); 
                    localStorage.setItem('lastPaymentMethod', 'paystack');
                    setCurrentOrderStatus(newStatus);
                    navigate(`/order-confirmation/${orderNumber}`);
                } else {
                    toast.error(
                        <div className="flex items-center">
                            <XCircle className="dark:text-red-400 text-red-600 mr-2" />
                            <span>Payment successful, but order confirmation failed. Please contact support.</span>
                        </div>,
                        { icon: false }
                    );
                }
            } catch (error) {
                console.error("Order status update error:", error.response?.data || error);
                toast.error(
                    <div className="flex items-center">
                        <XCircle className="dark:text-red-400 text-red-600 mr-2" />
                        <span>An error occurred while confirming your order. Please contact support.</span>
                    </div>,
                    { icon: false }
                );
            }
        } else {
            toast.error(
                <div className="flex items-center">
                    <XCircle className="dark:text-red-400 text-red-600 mr-2" />
                    <span>Paystack transaction did not complete successfully or order number missing.</span>
                </div>,
                { icon: false }
            );
        }
        setIsSubmitting(false);
    }, [clearCart, navigate, orderNumber, paystackReference, setCurrentOrderStatus]); // Added setCurrentOrderStatus

    // Handles Paystack payment modal closing
    const handlePaystackClose = useCallback(async () => {
        toast.info(
            <div className="flex items-center">
                <Info className="dark:text-blue-400 text-blue-600 mr-2" />
                <span>Payment was cancelled. Please try again.</span>
            </div>,
            { icon: false }
        );

        if (orderNumber) {
            try {
                await axios.post(`/api/orders/update-status/${orderNumber}`, {
                    status: 'cancelled',
                    payment_method: 'paystack', // Still relevant context
                }, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                        'Content-Type': 'application/json',
                    }
                });
                setCurrentOrderStatus('cancelled'); // Update frontend state
            } catch (error) {
                console.error("Error updating status to payment_canceled:", error);
            }
        }

        // Clear stored reference and generate a new one
        const newRef = `FDC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        setPaystackReference(newRef);
        localStorage.setItem('checkout_paystack_reference', newRef);

        setIsSubmitting(false);
    }, [orderNumber, setCurrentOrderStatus]); // Added orderNumber, setCurrentOrderStatus

    // Configuration for PaystackButton (using useMemo for optimization)
    const paystackConfig = useMemo(() => ({
        email: email?.trim() || '',
        amount: parseInt(grandTotal) * 100, // Amount in kobo
        publicKey: paystack_key,
        reference: paystackReference,
        metadata: {
            customer_name: fullName?.trim(),
            customer_phone: phone?.trim(),
            order_items_summary: cartItems.map(item => `${item.name} x${item.quantity}`).join(', '),
            app_order_number: orderNumber
        },
        text: "Pay Now",
        onSuccess: handlePaystackSuccess,
        onClose: handlePaystackClose,
    }), [email, grandTotal, fullName, phone, cartItems, orderNumber, paystackReference, handlePaystackSuccess, handlePaystackClose]);


    /**
     * Handles the "Next" button click for Step 1 (Shipping).
     * Validates inputs and initiates/updates the order with the backend.
     */
    const handleNextStep = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!fullName || !email || !phone || !address1 || !city || !state || !zipCode) {
            toast.error("Please fill in all required shipping details.");
            setIsSubmitting(false);
            return;
        }
        if (cartItems.length === 0) {
            toast.error("Your cart is empty. Cannot place order.");
            setIsSubmitting(false);
            navigate('/shop');
            return;
        }

        let orderActionSuccessful = false;

        // Condition 1: No existing order, or existing order is null/invalid
        if (!orderNumber) {
            const orderRes = await placeNewOrder(paymentMethod);
            if (orderRes) {
                orderActionSuccessful = true;
            }
        }
        // Condition 2: Existing order, but cart total or payment method has changed
        // Also consider if basic shipping details changed for an existing order
        else if (
            totalCartPrice !== persistedOrderTotal ||
            paymentMethod !== persistedPaymentMethod ||
            false // Placeholder for additional checks if needed
        ) {
            const orderRes = await updateExistingOrder(paymentMethod);
            if (orderRes) {
                orderActionSuccessful = true;
            } else {
                toast.error("Failed to update existing order. Please try again or contact support.");
                setIsSubmitting(false);
                return;
            }
        }
        // Condition 3: Existing order, and details are consistent. Just proceed.
        else {
            console.log("Existing order details are consistent. Proceeding to payment step.");
            toast.info("Order already initiated. Proceeding to payment.");
            orderActionSuccessful = true;
        }

        if (orderActionSuccessful) {
            setCurrentStep(2);
        }
        setIsSubmitting(false);
    };

    const handleBackStep = () => {
        setCurrentStep(1);
    };


    const handleBankTransferConfirmation = async () => {
        setIsSubmitting(true);
        if (!orderNumber) {
            toast.error("Order number not available. Please go back to shipping details and try again.");
            setIsSubmitting(false);
            return;
        }
        try {
            console.log('Confirming bank transfer for order:', orderNumber);
            // IMPORTANT: This is where the status changes for bank transfer
            const newStatus = 'pending_confirmation'; // or 'processing_bank_transfer_payment'
            const res = await axios.post(`/api/orders/update-status/${orderNumber}`, {
                status: newStatus, // Send the new status
                payment_method: 'bank_transfer',
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json',
                }
            });

            if (res.data.status === 200) {
                toast.success(
                    <div className="flex items-center">
                        <CheckCircle className="dark:text-green-400 text-green-600 mr-2" />
                        <span>Bank transfer noted. Your order is pending confirmation.</span>
                    </div>,
                    { icon: false }
                );
                clearCart();
                localStorage.removeItem('checkout_order_number');
                localStorage.removeItem('checkout_paystack_reference');
                localStorage.removeItem('checkout_order_total');
                localStorage.removeItem('checkout_payment_method');
                localStorage.removeItem('checkout_order_status'); // Clear persisted status
                localStorage.setItem('lastPaymentMethod', 'bank_transfer');
                setCurrentOrderStatus(newStatus); // Update frontend state
                navigate(`/order-confirmation/${orderNumber}`);
            } else {
                toast.error(
                    <div className="flex items-center">
                        <XCircle className="dark:text-red-400 text-red-600 mr-2" />
                        <span>Failed to confirm bank transfer. Please try again or contact support.</span>
                    </div>,
                    { icon: false }
                );
            }
        } catch (error) {
            console.error("Bank transfer confirmation error:", error.response?.data || error);
            toast.error(
                <div className="flex items-center">
                    <XCircle className="dark:text-red-400 text-red-600 mr-2" />
                    <span>An error occurred confirming transfer.</span>
                </div>,
                { icon: false }
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Animation variants for buttons
    const buttonVariants = {
        hover: { scale: 1.03, boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.5)" },
        tap: { scale: 0.97 }
    };

    if (loading || (cartItems.length === 0 && !loading)) {
        return <Load />;
    }

    return (
        <motion.div
            className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-950 dark:text-gray-200 pt-28 pb-12 px-4 sm:px-6 lg:px-8"
            initial="hidden"
            animate="visible"
        >
            <Helmet>
                <title>Checkout - First Digits</title>
                <meta name="description" content="Complete your purchase on our secure checkout page." />
            </Helmet>

            <motion.h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-12 text-blue-800 dark:text-white bg-clip-text dark:text-transparent dark:bg-gradient-to-r dark:from-cyan-400 dark:to-blue-600 leading-tight">
                Secure Checkout
            </motion.h1>

            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col lg:flex-row gap-10 lg:gap-16 max-w-7xl mx-auto">
                {/* Shipping Information & Payment Method Selection (Step 1) */}
                <AnimatePresence mode='wait'>
                    {currentStep === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.5 }}
                            className="flex-1 bg-white rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10 border border-gray-200 dark:bg-gray-900 dark:border-gray-800"
                        >
                            <h2 className="text-3xl font-bold mb-8 text-green-600 dark:text-lime-400 flex items-center space-x-3">
                                <Package className="w-8 h-8" />
                                <span>Shipping Information</span>
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                                <div>
                                    <label htmlFor="fullName" className="block text-gray-700 text-sm font-medium mb-2 dark:text-gray-300">Full Name</label>
                                    <input type="text" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500 dark:focus:ring-blue-600" required />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2 dark:text-gray-300">Email</label>
                                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500 dark:focus:ring-blue-600" required />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-gray-700 text-sm font-medium mb-2 dark:text-gray-300">Phone</label>
                                    <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500 dark:focus:ring-blue-600" required />
                                </div>
                                <div>
                                    <label htmlFor="address1" className="block text-gray-700 text-sm font-medium mb-2 dark:text-gray-300">Address Line 1</label>
                                    <input type="text" id="address1" value={address1} onChange={(e) => setAddress1(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500 dark:focus:ring-blue-600" required />
                                </div>
                                <div>
                                    <label htmlFor="address2" className="block text-gray-700 text-sm font-medium mb-2 dark:text-gray-300">Address Line 2 (Optional)</label>
                                    <input type="text" id="address2" value={address2} onChange={(e) => setAddress2(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500 dark:focus:ring-blue-600" />
                                </div>
                                <div>
                                    <label htmlFor="city" className="block text-gray-700 text-sm font-medium mb-2 dark:text-gray-300">City</label>
                                    <input type="text" id="city" value={city} onChange={(e) => setCity(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500 dark:focus:ring-blue-600" required />
                                </div>
                                <div>
                                    <label htmlFor="state" className="block text-gray-700 text-sm font-medium mb-2 dark:text-gray-300">State / Province</label>
                                    <input type="text" id="state" value={state} onChange={(e) => setState(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500 dark:focus:ring-blue-600" required />
                                </div>
                                <div>
                                    <label htmlFor="zipCode" className="block text-gray-700 text-sm font-medium mb-2 dark:text-gray-300">Zip / Postal Code</label>
                                    <input type="text" id="zipCode" value={zipCode} onChange={(e) => setZipCode(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500 dark:focus:ring-blue-600" required />
                                </div>
                            </div>

                            <h2 className="text-3xl font-bold mb-8 text-green-600 dark:text-lime-400 flex items-center space-x-3 mt-12 border-t pt-8 border-gray-200 dark:border-gray-800">
                                <CreditCard className="w-8 h-8" />
                                <span>Payment Method</span>
                            </h2>

                            <div className="space-y-4">
                                <label className="flex items-center bg-gray-100 p-4 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="paystack"
                                        checked={paymentMethod === 'paystack'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="form-radio h-5 w-5 text-green-500 bg-gray-200 border-gray-400 focus:ring-green-400 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-green-400"
                                    />
                                    <span className="ml-3 text-lg font-medium text-gray-800 dark:text-gray-200">Paystack (Card, Bank, USSD, etc.)</span>
                                </label>

                                <label className="flex items-center bg-gray-100 p-4 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="bank_transfer"
                                        checked={paymentMethod === 'bank_transfer'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="form-radio h-5 w-5 text-blue-500 bg-gray-200 border-gray-400 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-400"
                                    />
                                    <span className="ml-3 text-lg font-medium text-gray-800 dark:text-gray-200">Bank Transfer</span>
                                </label>
                            </div>

                            <motion.button
                                type="button"
                                onClick={handleNextStep}
                                disabled={isSubmitting || cartItems.length === 0}
                                className="w-full py-4 mt-8 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-bold text-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed dark:from-purple-600 dark:to-pink-700"
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                            >
                                {isSubmitting ? <Load size="sm" /> : <ArrowRight className="w-6 h-6" />}
                                <span>{isSubmitting ? 'Processing...' : 'Next'}</span>
                            </motion.button>
                        </motion.div>
                    )}

                    {/* Payment Execution (Step 2) */}
                    {currentStep === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            transition={{ duration: 0.5 }}
                            className="flex-1 bg-white rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10 border border-gray-200 dark:bg-gray-900 dark:border-gray-800"
                        >
                            <h2 className="text-3xl font-bold mb-8 text-green-600 dark:text-lime-400 flex items-center space-x-3">
                                <CreditCard className="w-8 h-8" />
                                <span>Complete Payment</span>
                            </h2>
                            <p className="text-gray-600 mb-6 dark:text-gray-300">
                                Current Payment Method: <span className="font-semibold text-blue-600 dark:text-cyan-400 capitalize">{paymentMethod.replace('_', ' ')}</span>
                            </p>

                            {paymentMethod === 'paystack' ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex flex-col items-center justify-center" // Added flex for centering loader
                                >
                                    <p className="text-gray-600 mb-6 dark:text-gray-300">Click the button below to pay securely with Paystack.</p>

                                    {/* Conditional Rendering: Show Loader if submitting, otherwise show Paystack Button */}
                                    {isSubmitting ? (
                                        <div className="flex items-center justify-center py-4 text-blue-700 dark:text-white">
                                            <Load className="w-8 h-8 animate-spin text-blue-500 mr-3 dark:text-blue-400" /> {/* Larger loader icon */}
                                            <span className="text-xl font-bold">Redirecting to Paystack...</span>
                                        </div>
                                    ) : (
                                        <PaystackButton
                                            className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-bold text-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3 dark:from-blue-600 dark:to-indigo-700"
                                            {...paystackConfig}
                                            disabled={!orderNumber || !paystackReference} // Only disable if order data is missing, not by isSubmitting
                                        >
                                            <CreditCard className="w-6 h-6" />
                                            <span>Pay Now with Paystack</span>
                                        </PaystackButton>
                                    )}
                                </motion.div>) : paymentMethod === 'bank_transfer' && orderNumber ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                        className="mt-8 bg-gray-100 p-6 rounded-lg border border-blue-300 shadow-md dark:bg-gray-800 dark:border-blue-700"
                                    >
                                        <h3 className="text-xl font-bold text-blue-600 mb-4 flex items-center dark:text-blue-400">
                                            <Banknote className="w-6 h-6 mr-2" /> Complete Your Bank Transfer
                                        </h3>
                                        <p className="text-gray-700 mb-3 dark:text-gray-300">
                                            Please transfer the exact amount of <span className="font-bold text-indigo-700 dark:text-cyan-400">₦{grandTotal.toLocaleString()}</span> to the account below.
                                            Your order will be processed upon confirmation of payment.
                                        </p>
                                        <div className="space-y-2 text-gray-700 dark:text-gray-200">
                                            <p><span className="font-semibold text-gray-500 dark:text-gray-400">Bank Name:</span> Zenith Bank</p>
                                            <p><span className="font-semibold text-gray-500 dark:text-gray-400">Account Name:</span> First Digit Communications Limited</p>
                                            <p><span className="font-semibold text-gray-500 dark:text-gray-400">Account Number:</span> 1310110966</p>
                                            <p className="flex items-center"><span className="font-semibold text-gray-500 mr-2 dark:text-gray-400">Order Number:</span> <ReceiptText className="w-5 h-5 mr-1" /> <span className="font-bold text-lg text-yellow-600 dark:text-yellow-300">{orderNumber}</span></p>
                                            <p><span className="font-semibold text-gray-500 dark:text-gray-400">Amount:</span> ₦{grandTotal.toLocaleString()}</p>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-4 dark:text-gray-400">
                                            <Info className="inline w-4 h-4 mr-1 text-blue-500 dark:text-blue-400" />
                                            Please include your **Order Number** in the transfer description. Funds must be received within 24 hours.
                                        </p>
                                        <motion.button
                                            type="button"
                                            onClick={handleBankTransferConfirmation}
                                            disabled={isSubmitting || !orderNumber}
                                            className="w-full py-4 mt-6 bg-gradient-to-r from-green-500 to-lime-600 text-white rounded-lg font-bold text-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed dark:from-green-600 dark:to-lime-700"
                                            variants={buttonVariants}
                                            whileHover="hover"
                                            whileTap="tap"
                                        >
                                            {isSubmitting ? <Load size="sm" /> : <CheckCircle className="w-6 h-6" />}
                                            <span>{isSubmitting ? 'Confirming...' : 'I Have Made Payment'}</span>
                                        </motion.button>
                                    </motion.div>
                                ) : (
                                    <p className="text-red-600 dark:text-red-400">Please select a payment method and go back to shipping details if needed.</p>
                                )}

                            {/* Back Button for Step 2 */}
                            <motion.button
                                type="button"
                                onClick={handleBackStep}
                                disabled={isSubmitting}
                                className="w-full py-3 mt-8 bg-gray-300 text-gray-800 rounded-lg font-bold text-lg shadow-md hover:bg-gray-400 transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span>Go Back to Shipping</span>
                            </motion.button>

                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Order Summary (Always Visible) */}
                <motion.div className="lg:w-1/3 bg-white rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10 border border-gray-200 flex flex-col dark:bg-gray-900 dark:border-gray-800">
                    <h2 className="text-3xl font-bold mb-8 text-indigo-700 dark:text-cyan-400 flex items-center space-x-3">
                        <ShoppingCart className="w-8 h-8" />
                        <span>Order Summary</span>
                    </h2>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {cartItems.map(item => (
                            <div key={item.id} className="flex items-center mb-5 pb-5 border-b border-gray-200 last:border-b-0 last:pb-0 dark:border-gray-800">
                                <img
                                    src={`/${item.image}`}
                                    alt={item.name}
                                    className="w-20 h-20 object-cover rounded-md mr-4 border border-gray-300 dark:border-gray-700"
                                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/80x80/e5e7eb/374151?text=No+Image`; }}
                                />
                                <div className="flex-1">
                                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{item.name}</p>
                                    <p className="text-gray-500 text-sm dark:text-gray-400">Quantity: {item.quantity}</p>
                                    <p className="text-green-600 font-bold mt-1 dark:text-lime-400">₦{(item.selling_price * item.quantity).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex justify-between items-center text-xl mb-3">
                            <span className="text-gray-700 dark:text-gray-300">Subtotal:</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-100">₦{totalCartPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xl mb-5">
                            <span className="text-gray-700 dark:text-gray-300">Shipping:</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-100">₦{shippingCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-3xl font-bold text-blue-700 mb-8 dark:text-white">
                            <span className="text-green-600 dark:text-lime-400">Grand Total:</span>
                            <span className="text-green-600 dark:text-lime-400">₦{grandTotal.toLocaleString()}</span>
                        </div>
                    </div>
                </motion.div>
            </form>
        </motion.div>
    );
};

export default Checkout;