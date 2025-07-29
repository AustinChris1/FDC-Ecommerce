import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Load from './Load'; // Using the user's provided Load component
import {
    ShoppingCart,
    User,
    Calendar,
    MapPin,
    Phone,
    Mail,
    CheckCircle,
    Clock,
    XCircle,
    CreditCard,
    Package,
    ArrowLeft,
    DollarSign,
    Info,
    RefreshCw,
    Ban,
    Truck,
    Hourglass,
    Download // Added Download icon
} from 'lucide-react';
import { toast } from 'react-toastify';
import html2canvas from 'html2canvas'; // Using direct import as requested
import jsPDF from 'jspdf';             // Using direct import as requested


const UserOrderDetail = () => {
    const { orderNumber } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState(null);
    const [error, setError] = useState(null);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false); // State for PDF download loading
    const contentRef = useRef(null); // Ref to the content that will be converted to PDF

    const userEmail = localStorage.getItem('auth_email');
    // const userLoggedInId = localStorage.getItem('auth_id'); // Not directly used for authorization here, email is primary
    const authToken = localStorage.getItem('auth_token');

    // Define API_URL using environment variables
    const API_URL = import.meta.env.PROD
        ? 'https://spx.firstdigit.com.ng/api' // your Laravel backend domain or subdomain
        : 'http://localhost:8000/api';

    const fetchOrderDetails = useCallback(async () => {
        if (!orderNumber) {
            toast.error("Order number missing. Please go back to My Orders.");
            setError("Order number missing.");
            setLoading(false);
            return;
        }
        if (!userEmail || !authToken) { // Check for authToken too
            toast.error("You must be logged in to view order details.");
            setError("Authentication required.");
            setLoading(false);
            navigate('/login'); // Redirect to login if not authenticated
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_URL}/orders/view/${orderNumber}`, { // Use API_URL here
                headers: {
                    'Authorization': `Bearer ${authToken}`, // Use authToken
                    'Content-Type': 'application/json',
                    'Accept': 'application/json' // Request JSON response
                },
                withCredentials: true,
            });

            if (res.data.status === 200 && res.data.order) {
                const fetchedOrder = res.data.order;

                // Authorization check: Ensure the order belongs to the logged-in user's email
                // For POS sales, the order might not have a customer email if it was a walk-in,
                // but for a user to view it, their email must match.
                const isAuthorized = fetchedOrder.email && fetchedOrder.email.toLowerCase() === userEmail.toLowerCase();

                if (isAuthorized) {
                    setOrder(fetchedOrder);
                } else {
                    toast.error("You are not authorized to view this order.");
                    setError("Unauthorized access. This order does not belong to your account.");
                    navigate('/user/orders'); // Redirect back to user orders
                }
            } else if (res.data.status === 404) {
                toast.error(res.data.message || "Order not found.");
                setError(res.data.message || "Order not found.");
            } else {
                toast.error(res.data.message || "Failed to fetch order details.");
                setError(res.data.message || "Failed to fetch order details.");
            }
        } catch (err) {
            console.error("Error fetching order details:", err.response?.data || err.message || err);
            let errorMessage = "Network error or server issue. Could not load order details.";
            if (err.response) {
                if (err.response.status === 401 || err.response.status === 403) {
                    errorMessage = "Authentication failed. Please log in again.";
                    navigate('/login');
                } else {
                    errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
                }
            } else if (err.request) {
                errorMessage = "Network error. Please check your internet connection.";
            }
            toast.error(errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [orderNumber, userEmail, authToken, navigate, API_URL]); // Added authToken and API_URL to dependencies

    useEffect(() => {
        document.title = `Order Details: ${orderNumber || 'Loading...'}`;
        fetchOrderDetails();
    }, [fetchOrderDetails, orderNumber]);

    // Function to handle PDF download using html2canvas and jspdf
    const handleDownloadPdf = useCallback(async () => {
        if (!contentRef.current || !order) {
            toast.error("Order details not loaded or content for PDF not available. Please try again.");
            return;
        }

        setIsDownloadingPdf(true);
        toast.info("Generating PDF receipt...", { autoClose: 3000 });

        const element = contentRef.current;

        // Clone the element and apply specific styles to the clone for PDF generation
        // This prevents flickering on the actual page and ensures consistent styling in PDF
        const clonedElement = element.cloneNode(true);
        // Apply light background styles to the cloned element and its children
        clonedElement.style.backgroundColor = '#FFFFFF'; // White background for the entire receipt
        clonedElement.style.color = '#333333'; // Dark text color for the entire receipt
        clonedElement.style.padding = '1.5rem';
        clonedElement.style.width = 'fit-content';
        clonedElement.style.margin = 'auto';
        clonedElement.style.boxShadow = 'none';
        clonedElement.style.border = 'none';
        clonedElement.style.position = 'absolute';
        clonedElement.style.left = '-9999px';
        clonedElement.style.top = '-9999px';

        // Override specific Tailwind-like classes for light theme in the cloned element
        // This ensures the PDF always has a light background regardless of current theme
        clonedElement.querySelectorAll('.dark\\:bg-gray-950').forEach(el => el.style.backgroundColor = '#FFFFFF');
        clonedElement.querySelectorAll('.dark\\:bg-gray-900').forEach(el => el.style.backgroundColor = '#F8F8F8');
        clonedElement.querySelectorAll('.dark\\:bg-gray-850').forEach(el => el.style.backgroundColor = '#F2F2F2');
        clonedElement.querySelectorAll('.dark\\:bg-gray-800').forEach(el => el.style.backgroundColor = '#E9E9E9');

        clonedElement.querySelectorAll('.dark\\:text-gray-200').forEach(el => el.style.color = '#333333');
        clonedElement.querySelectorAll('.dark\\:text-gray-300').forEach(el => el.style.color = '#555555');
        clonedElement.querySelectorAll('.dark\\:text-gray-400').forEach(el => el.style.color = '#777777');
        clonedElement.querySelectorAll('.dark\\:text-white').forEach(el => el.style.color = '#333333');

        clonedElement.querySelectorAll('.dark\\:text-blue-400').forEach(el => el.style.color = '#0066CC');
        clonedElement.querySelectorAll('.dark\\:text-yellow-300').forEach(el => el.style.color = '#CC9900');
        clonedElement.querySelectorAll('.dark\\:text-emerald-400').forEach(el => el.style.color = '#008000');
        clonedElement.querySelectorAll('.dark\\:text-purple-400').forEach(el => el.style.color = '#800080');
        clonedElement.querySelectorAll('.dark\\:text-orange-400').forEach(el => el.style.color = '#FF8C00');

        // Status pill backgrounds and text for PDF
        clonedElement.querySelectorAll('.dark\\:bg-green-600').forEach(el => { el.style.backgroundColor = '#D4EDDA'; el.style.color = '#155724'; });
        clonedElement.querySelectorAll('.dark\\:bg-orange-500').forEach(el => { el.style.backgroundColor = '#FFF3CD'; el.style.color = '#856404'; });
        clonedElement.querySelectorAll('.dark\\:bg-yellow-500').forEach(el => { el.style.backgroundColor = '#FFF3CD'; el.style.color = '#856404'; });
        clonedElement.querySelectorAll('.dark\\:bg-indigo-500').forEach(el => { el.style.backgroundColor = '#CCE5FF'; el.style.color = '#004085'; });
        clonedElement.querySelectorAll('.dark\\:bg-red-600').forEach(el => { el.style.backgroundColor = '#F8D7DA'; el.style.color = '#721C24'; });
        clonedElement.querySelectorAll('.dark\\:bg-pink-600').forEach(el => { el.style.backgroundColor = '#F8D7DA'; el.style.color = '#721C24'; });
        clonedElement.querySelectorAll('.dark\\:bg-purple-600').forEach(el => { el.style.backgroundColor = '#E2BBEB'; el.style.color = '#4A005B'; });
        clonedElement.querySelectorAll('.dark\\:bg-gray-600').forEach(el => { el.style.backgroundColor = '#E2E6EA'; el.style.color = '#495057'; });

        clonedElement.querySelectorAll('.dark\\:border-gray-800').forEach(el => el.style.borderColor = '#DDDDDD');
        clonedElement.querySelectorAll('.dark\\:divide-gray-700').forEach(el => el.style.borderColor = '#EEEEEE');

        // Make the PDF header visible
        const pdfHeader = clonedElement.querySelector('.pdf-header');
        if (pdfHeader) {
            pdfHeader.style.display = 'block';
        }

        // Append clone to body temporarily to measure/render correctly
        document.body.appendChild(clonedElement);

        try {
            const canvas = await html2canvas(clonedElement, {
                scale: 2, // Higher scale for better resolution
                logging: false, // Turn off logging for cleaner console
                useCORS: true, // Needed if you have images from other domains
                windowWidth: clonedElement.offsetWidth, // Use offsetWidth for current rendered width
                windowHeight: clonedElement.offsetHeight, // Use offsetHeight for current rendered height
            });

            const imgData = canvas.toDataURL('image/jpeg', 1.0); // Convert canvas to image data (quality 0-1)
            const pdf = new jsPDF('p', 'mm', 'a4'); // 'p' for portrait, 'mm' for millimeters, 'a4' format

            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) { // Changed condition to > 0 to avoid adding an empty page
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`receipt-order-${orderNumber}.pdf`);
            toast.success("Receipt downloaded successfully!");
        } catch (pdfError) {
            console.error("Error generating PDF:", pdfError);
            toast.error("Failed to generate PDF receipt. Please try again.");
        } finally {
            setIsDownloadingPdf(false);
            // Remove the cloned element from the DOM
            if (clonedElement.parentNode) {
                clonedElement.parentNode.removeChild(clonedElement);
            }
        }
    }, [order, orderNumber]);


    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.98 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-600 dark:text-white';
            case 'pending_delivery': return 'bg-orange-100 text-orange-800 dark:bg-orange-500 dark:text-white';
            case 'pending_payment': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500 dark:text-white';
            case 'processing_paystack_payment':
            case 'processing_bank_transfer_payment':
            case 'pending_confirmation':
            case 'processing_mock_payment':
            case 'processing': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500 dark:text-white';
            case 'cancelled':
            case 'payment_canceled': return 'bg-red-100 text-red-800 dark:bg-red-600 dark:text-white';
            case 'payment_failed': return 'bg-pink-100 text-pink-800 dark:bg-pink-600 dark:text-white';
            case 'shipped': return 'bg-purple-100 text-purple-800 dark:bg-purple-600 dark:text-white';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-white';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-4 h-4 mr-1" />;
            case 'pending_delivery': return <Truck className="w-4 h-4 mr-1" />;
            case 'pending_payment': return <Hourglass className="w-4 h-4 mr-1" />;
            case 'processing': return <Clock className="w-4 h-4 mr-1" />;
            case 'cancelled':
            case 'payment_canceled': return <XCircle className="w-4 h-4 mr-1" />;
            case 'payment_failed': return <Ban className="w-4 h-4 mr-1" />;
            case 'shipped': return <Truck className="w-4 h-4 mr-1" />;
            case 'processing_paystack_payment': return <Hourglass className="w-4 h-4 mr-1" />;
            case 'processing_bank_transfer_payment':
            case 'pending_confirmation':
            case 'processing_mock_payment': return <Clock className="w-4 h-4 mr-1" />;
            default: return <Package className="w-4 h-4 mr-1" />;
        }
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
                <Load />
            </div>
        );
    }

    if (error || !order) {
        return (
            <motion.div
                className="min-h-screen p-4 sm:p-6 lg:p-8 bg-white text-gray-800 dark:bg-gray-950 dark:text-gray-200 flex items-center justify-center"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-red-600 dark:text-red-500 mb-4 leading-tight">
                        Order Details Not Found
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">
                        {error || `We couldn't load the details for order number "${orderNumber}". It might be invalid, or an error occurred.`}
                    </p>
                    <Link
                        to="/user/orders"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
                    >
                        <ArrowLeft className="w-5 h-5 inline-block mr-2" /> Back to My Orders
                    </Link>
                </div>
            </motion.div>
        );
    }

    // Parse items_json from string to array
    let orderItems = [];
    try {
        orderItems = order.items_json ? JSON.parse(order.items_json) : [];
    } catch (e) {
        console.error("Failed to parse order items_json:", e);
        toast.error("Error parsing order items. Display might be incomplete.");
    }

    return (
        <motion.div
            className="min-h-screen p-4 sm:p-6 lg:p-8 bg-white text-gray-800 dark:bg-gray-950 dark:text-gray-200 pt-24"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <Helmet>
                <title>Order #{order.order_number} Details</title>
                <meta name="description" content={`Details for order number ${order.order_number}`} />
            </Helmet>

            {/* Header section with title and Back/Download buttons */}
            <header className="flex mt-20 flex-col sm:flex-row justify-between items-start sm:items-center mb-8 bg-white rounded-xl shadow-md p-6 border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 sm:mb-0">
                    Order Details: <span className="text-blue-700 dark:text-blue-400">#{order.order_number}</span>
                </h1>
                <div className="flex space-x-3 mt-4 sm:mt-0">
                    <button
                        onClick={handleDownloadPdf}
                        disabled={isDownloadingPdf}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDownloadingPdf ? <Load size="sm" /> : <Download className="w-5 h-5 mr-2" />}
                        <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download Receipt'}</span>
                    </button>
                    <Link
                        to="/user/orders"
                        className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 flex items-center
                        dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" /> Back to My Orders
                    </Link>
                </div>
            </header>

            {/* Content to be included in PDF - wrapped in a div with ref */}
            <div ref={contentRef} className="printable-receipt-content"> {/* Use a distinct class for PDF content */}
                {/* Add a header for the PDF itself, not shown on the main page */}
                <div style={{ display: 'none', textAlign: 'center', marginBottom: '1rem', padding: '1rem', borderBottom: '1px solid #DDDDDD', color: '#333333', backgroundColor: '#FFFFFF' }} className="pdf-header">
                    <h1 style={{ color: '#333333', fontSize: '24px', fontWeight: 'bold' }}>First Digits E-Commerce Receipt</h1>
                    <p style={{ color: '#555555', fontSize: '14px' }}>Order: #{order.order_number}</p>
                    <p style={{ color: '#555555', fontSize: '14px' }}>Date: {new Date(order.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    {order.is_pos_sale && order.location_name && (
                        <p style={{ color: '#555555', fontSize: '14px' }}>Location: {order.location_name}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Order Summary Card */}
                    <motion.div
                        className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-gray-200 dark:bg-gray-900 dark:border-gray-800"
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                            <ShoppingCart className="w-6 h-6 mr-3 text-blue-700 dark:text-blue-400" />
                            Order Summary
                        </h2>
                        <div className="space-y-3 text-gray-700 dark:text-gray-300">
                            <p className="flex items-center">
                                <span className="font-semibold w-36 text-gray-600 dark:text-gray-400">Order Number:</span>
                                <span className="ml-2 text-yellow-700 dark:text-yellow-300">#{order.order_number}</span>
                            </p>
                            <p className="flex items-center">
                                <span className="font-semibold w-36 text-gray-600 dark:text-gray-400">Status:</span>
                                <span className={`ml-2 px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(order.status)} flex items-center`}>
                                    {getStatusIcon(order.status)}
                                    {order.status?.replace(/_/g, ' ') || 'Unknown'}
                                </span>
                            </p>
                            <p className="flex items-center">
                                <span className="font-semibold w-36 text-gray-600 dark:text-gray-400">Payment Method:</span>
                                <span className="ml-2 flex items-center">
                                    <CreditCard className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-500" />
                                    {order.payment_method?.replace(/_/g, ' ') || 'N/A'}
                                </span>
                            </p>
                            {order.paystack_reference && (
                                <p className="flex items-center">
                                    <span className="font-semibold w-36 text-gray-600 dark:text-gray-400">Paystack Ref:</span>
                                    <span className="ml-2 text-blue-700 dark:text-blue-400 font-medium">{order.paystack_reference}</span>
                                </p>
                            )}
                            <p className="flex items-center">
                                <span className="font-semibold w-36 text-gray-600 dark:text-gray-400">Order Date:</span>
                                <span className="ml-2 flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-500" />
                                    {order.created_at ? new Date(order.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                                </span>
                            </p>
                            <p className="flex items-center text-xl font-bold text-emerald-700 dark:text-emerald-400 pt-2">
                                <span className="font-semibold w-36">Grand Total:</span>
                                <span className="ml-2 flex items-center">
                                    ₦{order.grand_total ? order.grand_total.toLocaleString() : '0'}
                                </span>
                            </p>
                        </div>
                    </motion.div>

                    {/* Customer & Shipping Info Card */}
                    <motion.div
                        className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 dark:bg-gray-900 dark:border-gray-800"
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.1 }}
                    >
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                            <User className="w-6 h-6 mr-3 text-purple-700 dark:text-purple-400" />
                            Customer & {order.is_pos_sale ? 'Store Location' : 'Shipping'} Info
                        </h2>
                        <div className="space-y-3 text-gray-700 dark:text-gray-300">
                            <p className="flex items-center">
                                <span className="font-semibold w-24 text-gray-600 dark:text-gray-400">Name:</span>
                                <span className="ml-2">{order.full_name || 'N/A'}</span>
                            </p>
                            <p className="flex items-center">
                                <span className="font-semibold w-24 text-gray-600 dark:text-gray-400">Email:</span>
                                <span className="ml-2 flex items-center break-all">
                                    <Mail className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-500" />
                                    {order.email || 'N/A'}
                                </span>
                            </p>
                            <p className="flex items-center">
                                <span className="font-semibold w-24 text-gray-600 dark:text-gray-400">Phone:</span>
                                <span className="ml-2 flex items-center">
                                    <Phone className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-500" />
                                    {order.phone || 'N/A'}
                                </span>
                            </p>

                            {/* Conditional rendering for Shipping Address vs. POS Location */}
                            {order.is_pos_sale ? (
                                <>
                                    <p className="flex items-start">
                                        <span className="font-semibold w-24 pt-1 text-gray-600 dark:text-gray-400">Location:</span>
                                        <span className="ml-2 flex items-start flex-grow">
                                            <MapPin className="w-4 h-4 mr-2 mt-1 text-gray-500 dark:text-gray-500 flex-shrink-0" />
                                            <span>
                                                {order.location_name || 'N/A'}
                                                {order.location_address && `, ${order.location_address}`}
                                                {order.location_phone && ` (Phone: ${order.location_phone})`}
                                            </span>
                                        </span>
                                    </p>
                                    <p className="text-gray-500 dark:text-gray-500 text-sm mt-4 italic flex items-center">
                                        <Info className="w-4 h-4 mr-1 flex-shrink-0" /> This was a Point of Sale (POS) transaction.
                                    </p>
                                </>
                            ) : (
                                order.shipping_address1 ? (
                                    <p className="flex items-start">
                                        <span className="font-semibold w-24 pt-1 text-gray-600 dark:text-gray-400">Address:</span>
                                        <span className="ml-2 flex items-start flex-grow">
                                            <MapPin className="w-4 h-4 mr-2 mt-1 text-gray-500 dark:text-gray-500 flex-shrink-0" />
                                            <span>
                                                {order.shipping_address1}, {order.shipping_address2 && `${order.shipping_address2}, `}
                                                {order.city}, {order.state}, {order.zip_code}
                                            </span>
                                        </span>
                                    </p>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-500 text-sm mt-4 italic">
                                        No shipping address recorded for this order.
                                    </p>
                                )
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Ordered Items Card */}
                <motion.div
                    className="mt-6 bg-white rounded-xl shadow-lg p-6 border border-gray-200 dark:bg-gray-900 dark:border-gray-800"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Package className="w-6 h-6 mr-3 text-orange-700 dark:text-orange-400" />
                        Ordered Items
                    </h2>
                    {orderItems.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-100 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Product Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Price (per item)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {orderItems.map((item, index) => (
                                        <tr key={index} className="even:bg-gray-50 odd:bg-white dark:even:bg-gray-850 dark:odd:bg-gray-900">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">{item.name || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{item.qty || item.quantity || '0'}</td> {/* Handle both 'qty' and 'quantity' */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">₦{(item.price || 0).toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-700 dark:text-emerald-400">₦{((item.qty || item.quantity || 0) * (item.price || 0)).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-600 dark:text-gray-400">No items found for this order.</p>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
};

export default UserOrderDetail;
