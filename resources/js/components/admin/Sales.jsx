import React, { useState, useEffect, useRef } from 'react';
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
    Tag, // For SKU/Brand if needed
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Sales = () => {
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    // Cart item structure: { id, name, selling_price, qty, stock, brand, image }
    const [cart, setCart] = useState([]);
    const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '' });
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [amountPaid, setAmountPaid] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [processedOrder, setProcessedOrder] = useState(null);

    const productSearchTimeout = useRef(null);
    const receiptRef = useRef(null);

    useEffect(() => {
        document.title = "POS Sales";
    }, []);

    // --- Product Search & Selection ---
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchTerm(query);

        if (productSearchTimeout.current) {
            clearTimeout(productSearchTimeout.current);
        }

        const term = query.trim();
        if (term.length > 2) {
            productSearchTimeout.current = setTimeout(async () => {
                setLoading(true);
                try {
                    const response = await axios.get('/api/search', { // Using your existing /api/search
                        params: { query: term },
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
                    toast.error("Failed to search products.");
                    setSearchResults([]);
                } finally {
                    setLoading(false);
                }
            }, 300);
        } else {
            setSearchResults([]);
        }
    };

    const handleAddToCart = (product) => {
        setSearchResults([]);
        setSearchTerm('');

        // Ensure product.qty (from backend) is correctly treated as stock
        const productStock = parseInt(product.qty);
        if (productStock === 0) {
            toast.error(`${product.name} is out of stock.`);
            return;
        }

        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            if (existingItem.qty >= productStock) {
                toast.warn(`Cannot add more than available stock (${productStock}) for ${product.name}.`);
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
                stock: productStock, // Store backend's qty as stock
                brand: product.brand, // Using brand as a proxy for SKU/Identifier
                image: product.image // Assuming product.image exists from /api/search response
            }]);
        }
        toast.success(`${product.name} added to cart.`);
    };

    const handleQuantityChange = (id, delta) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQty = item.qty + delta;
                if (newQty < 1) return null; // Mark for removal
                if (newQty > item.stock) { // Check against the stored stock
                    toast.warn(`Cannot add more than available stock (${item.stock}) for ${item.name}.`);
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
            customer_name: customerInfo.name || null,
            customer_email: customerInfo.email || null,
            customer_phone: customerInfo.phone || null,
            payment_method: paymentMethod, // 'cash', 'card_pos', 'bank_transfer'
            amount_paid: parseFloat(amountPaid || 0),
            discount_amount: parseFloat(discountAmount || 0),
            grand_total: grandTotal,
            items: cart.map(item => ({
                id: item.id, // Use id
                qty: item.qty,         // Use quantity
                price: item.price,          // Price at the time of sale (selling_price)
                name: item.name,            // Also send product name for items_json
            }))
        };

        const res = await axios.post('/api/orders/place', saleData, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
        });

        if (res.status === 200) {
            toast.success("Sale processed successfully!");
            setProcessedOrder(res.data.order); // Store the returned order
            setCart([]); // Clear cart
            setCustomerInfo({ name: '', email: '', phone: '' }); // Clear customer info
            setAmountPaid(''); // Clear amount paid
            setDiscountAmount(0); // Clear discount
            setSearchResults([]); // Clear search results
        } else {
            toast.error(res.data.message || "Failed to process sale.");
        }
    } catch (error) {
        console.error("Error processing sale:", error.response?.data || error.message);
        toast.error(error.response?.data?.message || "An error occurred while processing the sale.");
    } finally {
        setLoading(false);
    }
};    const handleNewSale = () => {
        setProcessedOrder(null);
        setCart([]);
        setCustomerInfo({ name: '', email: '', phone: '' });
        setPaymentMethod('cash');
        setAmountPaid('');
        setDiscountAmount(0);
        setSearchTerm('');
        setSearchResults([]);
    };

    // --- Receipt Printing ---
    const printReceipt = async () => {
        if (!receiptRef.current) {
            toast.error("Receipt content not available.");
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

    if (loading) {
        return <LoadingSpinner />;
    }

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
                            <p><strong>Payment Method:</strong> {processedOrder.payment_method.replace(/_/g, ' ')}</p>
                        </div>
                        <div className="mb-4">
                            <h4 className="font-semibold mb-2">Items:</h4>
                            <ul className="divide-y divide-gray-200">
                                {JSON.parse(processedOrder.items_json || '[]').map((item, index) => (
                                    <li key={index} className="flex justify-between py-1">
                                        <span>{item.name} x {item.qty}</span>
                                        <span>₦{(item.qty * item.price).toLocaleString()}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="border-t border-gray-200 pt-4 text-right">
                            <p className="font-semibold text-lg">Subtotal: ₦{parseFloat(processedOrder.grand_total + processedOrder.discount_amount).toLocaleString()}</p>
                            {processedOrder.discount_amount > 0 && (
                                <p className="font-semibold text-red-600">Discount: -₦{parseFloat(processedOrder.discount_amount).toLocaleString()}</p>
                            )}
                            <p className="text-2xl font-bold text-emerald-700 mt-2">Grand Total: ₦{parseFloat(processedOrder.grand_total).toLocaleString()}</p>
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

                        {/* Product Search */}
                        <div className="relative mb-6">
                            <input
                                type="text"
                                placeholder="Search products by name, SKU, or brand..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                                value={searchTerm}
                                onChange={handleSearchChange}
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
                                                    {product.image && ( // Assuming product.image exists
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
                                                    <p className="text-xs text-gray-500">Stock: {product.qty}</p>
                                                </div>
                                            </motion.li>
                                        ))}
                                    </AnimatePresence>
                                </ul>
                            )}
                        </div>

                        {/* Cart Display */}
                        <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                            <ShoppingCart className="w-5 h-5 mr-2 text-blue-600" /> Your Cart ({cart.length} items)
                        </h3>
                        {cart.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 text-lg border border-dashed border-gray-300 rounded-lg">
                                <p>Your cart is empty. Search for products to add!</p>
                            </div>
                        ) : (
                            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                                <AnimatePresence>
                                    {cart.map(item => (
                                        <motion.div
                                            key={item.id}
                                            className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3"
                                            variants={itemVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                        >
                                            <div className="flex items-center">
                                                {item.image && (
                                                    <img
                                                        src={item.image.startsWith('http') ? item.image : `/${item.image}`}
                                                        alt={item.name}
                                                        className="w-12 h-12 object-cover rounded-md mr-3"
                                                        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/40x40/cccccc/000000?text=No+Img`; }}
                                                    />
                                                )}
                                                <div>
                                                    <p className="font-semibold text-gray-900">{item.name}</p>
                                                    <p className="text-sm text-gray-600">₦{item.price.toLocaleString()} / item</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <div className="flex items-center border border-gray-300 rounded-md">
                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, -1)}
                                                        className="p-1 text-gray-600 hover:bg-gray-200 rounded-l-md transition-colors"
                                                    >
                                                        <MinusCircle className="w-5 h-5" />
                                                    </button>
                                                    <span className="px-3 text-lg font-medium">{item.qty}</span>
                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, 1)}
                                                        className="p-1 text-gray-600 hover:bg-gray-200 rounded-r-md transition-colors"
                                                    >
                                                        <PlusCircle className="w-5 h-5" />
                                                    </button>
                                                </div>
                                                <span className="font-bold text-lg text-emerald-600 w-24 text-right">
                                                    ₦{(item.price * item.qty).toLocaleString()}
                                                </span>
                                                <button
                                                    onClick={() => handleRemoveFromCart(item.id)}
                                                    className="p-1 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                                                    title="Remove item"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Customer, Payment & Totals */}
                    <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 flex flex-col">
                        <h2 className="text-2xl font-bold text-gray-900 mb-5 flex items-center">
                            <DollarSign className="w-6 h-6 mr-3 text-green-600" /> Checkout
                        </h2>

                        {/* Customer Information (Optional) */}
                        <div className="mb-6 border-b pb-4 border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                                <User className="w-5 h-5 mr-2 text-purple-600" /> Customer Info (Optional)
                            </h3>
                            <input
                                type="text"
                                placeholder="Customer Name"
                                className="w-full p-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                                value={customerInfo.name}
                                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                            />
                            <input
                                type="email"
                                placeholder="Customer Email"
                                className="w-full p-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                                value={customerInfo.email}
                                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                            />
                            <input
                                type="tel"
                                placeholder="Customer Phone"
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                                value={customerInfo.phone}
                                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                            />
                        </div>

                        {/* Payment Method */}
                        <div className="mb-6 border-b pb-4 border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                                <CreditCard className="w-5 h-5 mr-2 text-red-600" /> Payment Method
                            </h3>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setPaymentMethod('cash')}
                                    className={`flex-1 p-3 rounded-lg border transition-colors ${
                                        paymentMethod === 'cash' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
                                    }`}
                                >
                                    Cash
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('card_pos')}
                                    className={`flex-1 p-3 rounded-lg border transition-colors ${
                                        paymentMethod === 'card_pos' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
                                    }`}
                                >
                                    Card (POS)
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('bank_transfer')}
                                    className={`flex-1 p-3 rounded-lg border transition-colors ${
                                        paymentMethod === 'bank_transfer' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
                                    }`}
                                >
                                    Bank Transfer
                                </button>
                            </div>

                            {paymentMethod === 'cash' && (
                                <div className="mt-4">
                                    <label htmlFor="amountPaid" className="block text-sm font-medium text-gray-700 mb-1">Amount Paid:</label>
                                    <input
                                        type="number"
                                        id="amountPaid"
                                        placeholder="0.00"
                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                                        value={amountPaid}
                                        onChange={(e) => setAmountPaid(e.target.value)}
                                        step="0.01"
                                        min="0"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Discount */}
                        <div className="mb-6 border-b pb-4 border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                                <DollarSign className="w-5 h-5 mr-2 text-yellow-600" /> Discount
                            </h3>
                            <input
                                type="number"
                                placeholder="Discount Amount (₦)"
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                                value={discountAmount}
                                onChange={(e) => setDiscountAmount(e.target.value)}
                                step="0.01"
                                min="0"
                            />
                        </div>


                        {/* Totals */}
                        <div className="mt-auto pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center text-lg mb-2">
                                <span>Subtotal:</span>
                                <span className="font-semibold">₦{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-lg mb-2 text-red-600">
                                <span>Discount:</span>
                                <span className="font-semibold">-₦{parseFloat(discountAmount).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-2xl font-bold text-emerald-700 mb-4">
                                <span>Grand Total:</span>
                                <span>₦{grandTotal.toLocaleString()}</span>
                            </div>

                            {paymentMethod === 'cash' && (
                                <>
                                    <div className="flex justify-between items-center text-lg mb-2 text-gray-600">
                                        <span>Amount Paid:</span>
                                        <span className="font-semibold">₦{parseFloat(amountPaid || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xl font-bold text-blue-600 mb-4">
                                        <span>Change Due:</span>
                                        <span>₦{changeDue.toLocaleString()}</span>
                                    </div>
                                </>
                            )}

                            <button
                                onClick={handleProcessSale}
                                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-xl rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={cart.length === 0 || (paymentMethod === 'cash' && parseFloat(amountPaid || 0) < grandTotal)}
                            >
                                <Receipt className="w-6 h-6 mr-3" /> Process Sale
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default Sales;