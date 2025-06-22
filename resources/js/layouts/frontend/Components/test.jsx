import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useCart } from './CartContext'; // Import useCart
import Load from '../Components/Load'; // Assuming this exists
import {
    ShoppingCart,
    Package,
    CreditCard,
    Banknote,
    CheckCircle,
    XCircle,
    Info,
    ReceiptText, // New icon for order number
} from 'lucide-react';
import { usePaystackPayment, PaystackButton } from 'react-paystack';

const Checkout = () => {
    const navigate = useNavigate();
    const { cartItems, totalCartPrice, clearCart } = useCart();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const [orderNumber, setOrderNumber] = useState(''); // State for the generated order number

    const shippingCost = 1500; // Mock shipping cost in Naira
    const grandTotal = totalCartPrice + shippingCost; // Total in Naira

    // Function to generate a simple unique order number (e.g., for bank transfers)
    const generateOrderNumber = useCallback(() => {
        const timestamp = new Date().getTime();
        const randomSuffix = Math.floor(Math.random() * 100000); // Random 5-digit number
        return `ORD-${timestamp}-${randomSuffix}`;
    }, []);

    const ref = new Date().getTime().toString();

    useEffect(() => {
        document.title = "Checkout - First Digits";

        const authName = localStorage.getItem('auth_name');
        const authEmail = localStorage.getItem('auth_email');
        if (authName) setFullName(authName);
        if (authEmail) setEmail(authEmail);

        // Generate order number only for bank transfer and if not already generated
        if (paymentMethod === 'bank_transfer' && !orderNumber) {
            setOrderNumber(generateOrderNumber());
        } else if (paymentMethod !== 'bank_transfer' && orderNumber) {
            setOrderNumber(''); // Clear order number if not bank transfer
        }

        const timer = setTimeout(() => {
            setLoading(false);
            if (cartItems.length === 0) {
                toast.info("Your cart is empty. Please add items before checking out.");
                navigate('/shop');
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [cartItems, navigate, loading, paymentMethod, orderNumber, generateOrderNumber]);


    // Function to place the order on the backend
    const placeOrder = async (method, transactionRef = null) => {
        if (!fullName || !email || !phone || !address1 || !city || !state || !zipCode) {
            toast.error("Please fill in all required shipping details.");
            return; // Don't proceed
        }
        if (cartItems.length === 0) {
            toast.error("Your cart is empty. Cannot place order.");
            navigate('/shop');
            return; // Don't proceed
        }

        // Prepare order data to send to Laravel backend
        const orderData = {
            order_number: paymentMethod === 'bank_transfer' ? orderNumber : paystackConfig.reference,
            user_info: { fullName, email, phone },
            shipping_address: { address1, address2, city, state, zipCode },
            items: cartItems.map(item => ({
                id: item.id,
                name: item.name,
                qty: item.quantity,
                price: item.selling_price // Include price for backend calculation/verification
            })),
            total_price: totalCartPrice,
            shipping_cost: shippingCost,
            grand_total: grandTotal,
            payment_method: method,
            paystack_reference: transactionRef,
        };

        try {
            // Send order data to your Laravel API endpoint
            const response = await axios.post('/api/orders', orderData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.data.status === 200) {
                toast.success(
                    <div className="flex items-center">
                        <CheckCircle className="text-green-400 mr-2" />
                        <span>{response.data.message || "Order Placed Successfully!"}</span>
                    </div>,
                    { icon: false }
                );
                clearCart();
                navigate(`/order-confirmation/${orderData.order_number}`);
            } else {
                // Backend responded, but with an error status
                toast.error(
                    <div className="flex items-center">
                        <XCircle className="text-red-400 mr-2" />
                        <span>{response.data.message || "Failed to place order. Please try again."}</span>
                    </div>,
                    { icon: false }
                );
            }
        } catch (error) {
            // Network error or server-side exception
            console.error("Order placement error:", error.response?.data || error);
            const errorMessage = error.response?.data?.message || "An error occurred while placing your order. Please try again later.";
            toast.error(
                <div className="flex items-center">
                    <XCircle className="text-red-400 mr-2" />
                    <span>{errorMessage}</span>
                </div>,
                { icon: false }
            );
        } finally {
            // Ensure spinner is always hidden regardless of success or failure
            setIsSubmitting(false);
        }
    };
    const handlePaystackSuccess = async (response) => {
        console.log('Paystack Success Response:', response);
        if (response.status === 'success' && response.transaction && response.reference) {
            // Call placeOrder after Paystack confirms payment
            await placeOrder('paystack', response.reference);
        } else {
            toast.error(
                <div className="flex items-center">
                    <XCircle className="text-red-400 mr-2" />
                    <span>Paystack transaction did not complete successfully.</span>
                </div>,
                { icon: false }
            );
        }
        setIsSubmitting(false); // Crucial: Hide spinner if Paystack flow completes but backend order fails or Paystack itself wasn't 'success'
    };

    // Handles Paystack payment modal closing
    const handlePaystackClose = () => {
        console.log('Paystack Payment Closed');
        toast.info(
            <div className="flex items-center">
                <Info className="text-blue-400 mr-2" />
                <span>Payment window closed. You can try again or choose another method.</span>
            </div>,
            { icon: false }
        );
        setIsSubmitting(false); // Crucial: Hide spinner if user closes Paystack modal
    };
   const paystackConfig = {
        email: email,
        amount: grandTotal * 100,
        publicKey: 'pk_test_bb934e0c3cd0b8367a18dca1a48247cc9d2d109a',
        reference: new Date().getTime().toString(),
        metadata: {
          customer_name: fullName,
          customer_phone: phone,
          order_items_summary: cartItems.map(item => `${item.name} x${item.quantity}`).join(', '),
        },
        text: "Pay Now",
        onSuccess: handlePaystackSuccess,  // ✅ Use existing function
        onClose: handlePaystackClose       // ✅ Use existing function
      };


    // Main form submission handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true); // Show spinner as soon as form is submitted

        // Perform basic client-side validation before attempting payment/order
        if (!fullName || !email || !phone || !address1 || !city || !state || !zipCode) {
            toast.error("Please fill in all required shipping details.");
            setIsSubmitting(false); // Hide spinner on validation error
            return;
        }
        if (cartItems.length === 0) {
            toast.error("Your cart is empty. Cannot place order.");
            setIsSubmitting(false); // Hide spinner if cart is empty
            navigate('/shop');
            return;
        }

        if (paymentMethod === 'paystack') {
        } else if (paymentMethod === 'bank_transfer') {
            // For bank transfer, placeOrder directly handles setIsSubmitting(false)
            await placeOrder('bank_transfer', orderNumber);
        } else {
            // For other mock methods, placeOrder directly handles setIsSubmitting(false)
            toast.info(
                <div className="flex items-center">
                    <Info className="text-blue-400 mr-2" />
                    <span>Simulating order placement for {paymentMethod.replace('_', ' ').toUpperCase()}.</span>
                </div>,
                { icon: false }
            );
            await placeOrder(paymentMethod);
        }
        // No setIsSubmitting(false) here, as it's handled by specific payment flows or placeOrder()
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const buttonVariants = {
        hover: { scale: 1.03, boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.5)" },
        tap: { scale: 0.97 }
    };

    // Show loading spinner if initial data is loading OR if cart is empty (and no longer loading)
    if (loading || (cartItems.length === 0 && !loading)) {
        return <Load />;
    }

    return (
        <motion.div
            className="min-h-screen bg-gray-950 text-gray-200 pt-24 pb-12 px-4 sm:px-6 lg:px-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <Helmet>
                <title>Checkout - First Digits</title>
                <meta name="description" content="Complete your purchase on our secure checkout page." />
            </Helmet>

            <motion.h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-12 text-white bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600 leading-tight" variants={itemVariants}>
                Secure Checkout
            </motion.h1>

            <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-10 lg:gap-16 max-w-7xl mx-auto">
                {/* Shipping Information & Payment */}
                <div className="flex-1 bg-gray-900 rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10 border border-gray-800">
                    <motion.h2 className="text-3xl font-bold mb-8 text-lime-400 flex items-center space-x-3" variants={itemVariants}>
                        <Package className="w-8 h-8" />
                        <span>Shipping Information</span>
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                        <motion.div variants={itemVariants}>
                            <label htmlFor="fullName" className="block text-gray-300 text-sm font-medium mb-2">Full Name</label>
                            <input
                                type="text"
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
                                required
                            />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <label htmlFor="email" className="block text-gray-300 text-sm font-medium mb-2">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
                                required
                            />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <label htmlFor="phone" className="block text-gray-300 text-sm font-medium mb-2">Phone</label>
                            <input
                                type="tel"
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
                                required
                            />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <label htmlFor="address1" className="block text-gray-300 text-sm font-medium mb-2">Address Line 1</label>
                            <input
                                type="text"
                                id="address1"
                                value={address1}
                                onChange={(e) => setAddress1(e.target.value)}
                                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
                                required
                            />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <label htmlFor="address2" className="block text-gray-300 text-sm font-medium mb-2">Address Line 2 (Optional)</label>
                            <input
                                type="text"
                                id="address2"
                                value={address2}
                                onChange={(e) => setAddress2(e.target.value)}
                                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
                            />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <label htmlFor="city" className="block text-gray-300 text-sm font-medium mb-2">City</label>
                            <input
                                type="text"
                                id="city"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
                                required
                            />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <label htmlFor="state" className="block text-gray-300 text-sm font-medium mb-2">State / Province</label>
                            <input
                                type="text"
                                id="state"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
                                required
                            />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <label htmlFor="zipCode" className="block text-gray-300 text-sm font-medium mb-2">Zip / Postal Code</label>
                            <input
                                type="text"
                                id="zipCode"
                                value={zipCode}
                                onChange={(e) => setZipCode(e.target.value)}
                                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
                                required
                            />
                        </motion.div>
                    </div>

                    <motion.h2 className="text-3xl font-bold mb-8 text-lime-400 flex items-center space-x-3 mt-12 border-t pt-8 border-gray-800" variants={itemVariants}>
                        <CreditCard className="w-8 h-8" />
                        <span>Payment Method</span>
                    </motion.h2>

                    <motion.div className="space-y-4" variants={itemVariants}>
                        <label className="flex items-center bg-gray-800 p-4 rounded-lg border border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="paystack"
                                checked={paymentMethod === 'paystack'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="form-radio h-5 w-5 text-green-500 bg-gray-700 border-gray-600 focus:ring-green-400"
                            />
                            <span className="ml-3 text-lg font-medium text-gray-200">Paystack (Card, Bank, USSD, etc.)</span>
                        </label>

                        <label className="flex items-center bg-gray-800 p-4 rounded-lg border border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="bank_transfer"
                                checked={paymentMethod === 'bank_transfer'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="form-radio h-5 w-5 text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-400"
                            />
                            <span className="ml-3 text-lg font-medium text-gray-200">Bank Transfer</span>
                        </label>

                    </motion.div>

                    {paymentMethod === 'bank_transfer' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-8 bg-gray-800 p-6 rounded-lg border border-blue-700 shadow-md"
                        >
                            <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center">
                                <Banknote className="w-6 h-6 mr-2" /> Complete Your Bank Transfer
                            </h3>
                            <p className="text-gray-300 mb-3">
                                Please transfer the exact amount of <span className="font-bold text-cyan-400">₦{grandTotal.toLocaleString()}</span> to the account below.
                                Your order will be processed upon confirmation of payment.
                            </p>
                            <div className="space-y-2 text-gray-200">
                                <p><span className="font-semibold text-gray-400">Bank Name:</span> Fidelity Bank</p>
                                <p><span className="font-semibold text-gray-400">Account Name:</span> First Digits Ltd</p>
                                <p><span className="font-semibold text-gray-400">Account Number:</span> 0123456789</p>
                                <p className="flex items-center"><span className="font-semibold text-gray-400 mr-2">Order Number:</span> <ReceiptText className="w-5 h-5 mr-1" /> <span className="font-bold text-lg text-yellow-300">{orderNumber}</span></p>
                                <p><span className="font-semibold text-gray-400">Amount:</span> ₦{grandTotal.toLocaleString()}</p>
                            </div>
                            <p className="text-sm text-gray-400 mt-4">
                                <Info className="inline w-4 h-4 mr-1 text-blue-400" />
                                Please include your **Order Number** in the transfer description. Funds must be received within 24 hours.
                            </p>
                        </motion.div>
                    )}

                    <motion.p className="mt-6 text-gray-400 text-sm" variants={itemVariants}>
                        By placing your order, you agree to our <Link to="/terms-of-service" className="text-blue-500 hover:underline">Terms of Service</Link> and <Link to="/privacy-policy" className="text-blue-500 hover:underline">Privacy Policy</Link>.
                    </motion.p>
                </div>

                {/* Order Summary */}
                <motion.div className="lg:w-1/3 bg-gray-900 rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10 border border-gray-800 flex flex-col" variants={itemVariants}>
                    <h2 className="text-3xl font-bold mb-8 text-cyan-400 flex items-center space-x-3">
                        <ShoppingCart className="w-8 h-8" />
                        <span>Order Summary</span>
                    </h2>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {cartItems.map(item => (
                            <div key={item.id} className="flex items-center mb-5 pb-5 border-b border-gray-800 last:border-b-0 last:pb-0">
                                <img
                                    src={`/${item.image}`} // Ensure this path is correct, or use placeholder if image is external
                                    alt={item.name}
                                    className="w-20 h-20 object-cover rounded-md mr-4 border border-gray-700"
                                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/80x80/0d1117/cbd5e1?text=No+Image`; }} // Placeholder fallback
                                />
                                <div className="flex-1">
                                    <p className="text-lg font-semibold text-gray-100">{item.name}</p>
                                    <p className="text-gray-400 text-sm">Quantity: {item.quantity}</p>
                                    <p className="text-lime-400 font-bold mt-1">₦{(item.selling_price * item.quantity).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-800">
                        <div className="flex justify-between items-center text-xl mb-3">
                            <span className="text-gray-300">Subtotal:</span>
                            <span className="font-semibold text-gray-100">₦{totalCartPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xl mb-5">
                            <span className="text-gray-300">Shipping:</span>
                            <span className="font-semibold text-gray-100">₦{shippingCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-3xl font-bold text-white mb-8">
                            <span className="text-lime-400">Grand Total:</span>
                            <span className="text-lime-400">₦{grandTotal.toLocaleString()}</span>
                        </div>

                        {/* <motion.button
                            type="submit"
                            disabled={isSubmitting || cartItems.length === 0}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg font-bold text-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                        >
                            {isSubmitting ? <Load size="sm" /> : <CheckCircle className="w-6 h-6" />}
                            <span>{isSubmitting ? 'Processing Payment...' : 'Place Order & Pay'}</span>
                        </motion.button> */}
                        <PaystackButton {...paystackConfig} 
                        onclick={handleSubmit}
                                                    disabled={isSubmitting || cartItems.length === 0}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg font-bold text-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"

                        />
                    </div>
                </motion.div>
            </form>
        </motion.div>
    );
};

export default Checkout;