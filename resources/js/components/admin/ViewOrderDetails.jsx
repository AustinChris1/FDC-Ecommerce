import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';
import { toast } from 'react-toastify';
import html2canvas from 'html2canvas'; // Import html2canvas
import jsPDF from 'jspdf';           // Import jspdf

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
    Edit, // For editing status
    Download, // For receipt download
    Save // For saving status
} from 'lucide-react'; // Import additional Lucide React icons

const ViewOrderDetails = () => {
    const { order_number } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState(null);
    const [error, setError] = useState(null);
    const [isEditingStatus, setIsEditingStatus] = useState(false); // New state for status editing
    const [selectedStatus, setSelectedStatus] = useState(''); // New state for selected status

    const contentRef = useRef(null); // Ref for the content to be printed

    const fetchOrderDetails = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/orders/view/${order_number}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`, // Ensure auth header is sent
                }
            });
            if (res.status === 200 && res.data.order) {
                setOrder(res.data.order);
                setSelectedStatus(res.data.order.status); // Initialize selectedStatus
                document.title = `Order: ${res.data.order.order_number}`;
            } else if (res.status === 404) {
                toast.error(res.data.message || "Order not found.");
                navigate('/admin/orders');
            } else {
                toast.error(res.data.message || "Failed to fetch order details.");
            }
        } catch (err) {
            console.error("Error fetching order details:", err);
            setError("Failed to load order details. Please check network/server.");
            toast.error("Network error or server issue. Could not load order details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [order_number, navigate]); // Depend on order_number and navigate

    // Function to handle updating the payment status
    const handleUpdatePaymentStatus = async () => {
        if (!order || !selectedStatus) {
            toast.error("No order or status selected.");
            return;
        }

        if (selectedStatus === order.status) {
            setIsEditingStatus(false);
            return; // No change, just close editing
        }

        try {
            const res = await axios.post(`/api/orders/update-status/${order.order_number}`, {
                status: selectedStatus
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`, // Ensure auth header is sent
                }
            });
            console.log(selectedStatus); // Log the response for debugging
            console.log("Response from update-status:", res.data); // Log the response data
            if (res.status === 200) {
                toast.success(res.data.message || "Order status updated successfully!");
                setOrder(prevOrder => ({ ...prevOrder, status: selectedStatus })); // Optimistic update
                setIsEditingStatus(false);
                // Re-fetch order details to ensure all related data (e.g., timestamps) are fresh
                fetchOrderDetails();
            } else {
                toast.error(res.data.message || "Failed to update order status.");
            }
        } catch (err) {
            console.error("Error updating order status:", err);
            toast.error(err.response?.data?.message || "Network error or server issue. Could not update order status.");
        }
    };

    // Function to generate PDF receipt
    const generateReceiptPdf = async () => {
        if (!contentRef.current) {
            toast.error("Content not available for printing.");
            return;
        }

        setLoading(true); // Show loading spinner during PDF generation
        try {
            // Options for html2canvas
            const options = {
                scale: 2, // Increase scale for better resolution
                useCORS: true, // If you have images from other domains
                logging: false // Disable logging
            };

            const canvas = await html2canvas(contentRef.current, options);
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4'); // 'p' for portrait, 'mm' for millimeters, 'a4' size

            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = canvas.height * imgWidth / canvas.width;
            let heightLeft = imgHeight;
            let position = 0; // Y position on page

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`order_${order.order_number}_receipt.pdf`);
            toast.success("Receipt generated successfully!");
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast.error("Failed to generate receipt. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.98 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error || !order) {
        return (
            <motion.div
                className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-100 text-gray-800 flex items-center justify-center"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <p className="text-red-600 text-xl font-semibold mb-4">{error || "Order details could not be loaded."}</p>
                    <Link
                        to="/admin/orders"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
                    >
                        Back to All Orders
                    </Link>
                </div>
            </motion.div>
        );
    }

    let orderItems = [];
    try {
        orderItems = order.items_json ? JSON.parse(order.items_json) : [];
    } catch (e) {
        console.error("Failed to parse order items_json:", e);
        toast.error("Error parsing order items. Display might be incomplete.");
    }

    // Define all possible payment statuses your system might use
    // Make sure these match your backend's expected values
    const paymentStatuses = [
        'pending_payment',
        'completed',
        'processing_bank_transfer_payment',
        'payment_failed',
        'cancelled',
        'refunded', // Example of another status
        'shipped',
        'delivered'
    ];

    return (
        <motion.div
            className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-100 text-gray-800"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header section with title, Back, and Download buttons */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 bg-white rounded-xl shadow-md p-6">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 sm:mb-0">Order Details: #{order.order_number}</h1>
                <div className="flex space-x-3 mt-4 sm:mt-0">
                    <button
                        onClick={generateReceiptPdf}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 flex items-center"
                        title="Download Receipt"
                    >
                        <Download className="w-5 h-5 mr-2" /> Download Receipt
                    </button>
                    <Link
                        to="/admin/orders"
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 flex items-center"
                    >
                        Back to All Orders
                    </Link>
                </div>
            </header>

            {/* Content to be printed (ref for html2canvas) */}
            <div ref={contentRef} className="bg-gray-100 p-4 sm:p-6 lg:p-8 rounded-xl" /* Keep this div as a wrapper to control printable area */>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Order Summary Card */}
                    <motion.div
                        className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6"
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <ShoppingCart className="w-6 h-6 mr-3 text-blue-600" />
                            Order Summary
                        </h2>
                        <div className="space-y-3 text-gray-700">
                            <p className="flex items-center">
                                <span className="font-semibold w-32">Order Number:</span>
                                <span className="ml-2">#{order.order_number}</span>
                            </p>
                            <p className="flex items-center">
                                <span className="font-semibold w-32">Status:</span>
                                {isEditingStatus ? (
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="ml-2 px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {paymentStatuses.map(status => (
                                            <option key={status} value={status}>
                                                {status.replace(/_/g, ' ')}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <span className={`ml-2 px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            order.status === 'pending_delivery' ? 'bg-orange-100 text-orange-800' :
                                                order.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-800' :
                                                    order.status.includes('processing') ? 'bg-indigo-100 text-indigo-800' :
                                                        order.status === 'cancelled' || order.status === 'payment_canceled' ? 'bg-red-100 text-red-800' :
                                                            order.status === 'payment_failed' ? 'bg-pink-100 text-pink-800' :
                                                                order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                                                    'bg-gray-100 text-gray-800'
                                        }`}>
                                        {order.status.replace(/_/g, ' ')}
                                    </span>
                                )}
                                {!isEditingStatus ? (
                                    <button
                                        onClick={() => setIsEditingStatus(true)}
                                        className="ml-3 p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors duration-200"
                                        title="Edit Status"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleUpdatePaymentStatus}
                                        className="ml-3 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center transition-colors duration-200"
                                        title="Save Status"
                                    >
                                        <Save className="w-4 h-4 mr-1" /> Save
                                    </button>
                                )}
                            </p>
                            <p className="flex items-center">
                                <span className="font-semibold w-32">Payment Method:</span>
                                <span className="ml-2 flex items-center">
                                    <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
                                    {order.payment_method.replace(/_/g, ' ')}
                                </span>
                            </p>
                            {order.paystack_reference && (
                                <p className="flex items-center">
                                    <span className="font-semibold w-32">Paystack Ref:</span>
                                    <span className="ml-2 text-blue-600 font-medium">{order.paystack_reference}</span>
                                </p>
                            )}
                            <p className="flex items-center">
                                <span className="font-semibold w-32">Order Date:</span>
                                <span className="ml-2 flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                                    {new Date(order.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                                </span>
                            </p>
                            <p className="flex items-center text-xl font-bold text-emerald-700 pt-2">
                                <span className="font-semibold w-32">Grand Total:</span>
                                <span className="ml-2 flex items-center">
                                    ₦{order.grand_total.toLocaleString()}
                                </span>
                            </p>
                        </div>
                    </motion.div>

                    {/* Customer & Shipping Info Card */}
                    <motion.div
                        className="bg-white rounded-xl shadow-lg p-6"
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.1 }}
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <User className="w-6 h-6 mr-3 text-purple-600" />
                            Customer & Shipping
                        </h2>
                        <div className="space-y-3 text-gray-700">
                            <p className="flex items-center">
                                <span className="font-semibold w-24">Name:</span>
                                <span className="ml-2">{order.full_name}</span>
                            </p>
                            <p className="flex items-center">
                                <span className="font-semibold w-24">Email:</span>
                                <span className="ml-2 flex items-center break-all">
                                    <Mail className="w-4 h-4 mr-2 text-gray-500" />
                                    {order.email}
                                </span>
                            </p>
                            <p className="flex items-center">
                                <span className="font-semibold w-24">Phone:</span>
                                <span className="ml-2 flex items-center">
                                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                                    {order.phone}
                                </span>
                            </p>
                            <p className="flex items-start">
                                <span className="font-semibold w-24 pt-1">Address:</span>
                                <span className="ml-2 flex items-start flex-grow">
                                    <MapPin className="w-4 h-4 mr-2 mt-1 text-gray-500 flex-shrink-0" />
                                    <span>
                                        {order.shipping_address1}, {order.shipping_address2 && `${order.shipping_address2}, `}
                                        {order.city}, {order.state}, {order.zip_code}
                                    </span>
                                </span>
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Ordered Items Card */}
                <motion.div
                    className="mt-6 bg-white rounded-xl shadow-lg p-6"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                        <Package className="w-6 h-6 mr-3 text-orange-600" />
                        Ordered Items
                    </h2>
                    {orderItems.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (per item)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {orderItems.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.qty}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">₦{item.price.toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₦{(item.qty * item.price).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500">No items found for this order.</p>
                    )}
                </motion.div>
            </div> {/* End of contentRef wrapper */}
        </motion.div>
    );
};

export default ViewOrderDetails;