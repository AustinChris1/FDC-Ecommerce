import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import { HelmetProvider } from 'react-helmet-async';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LoadingSpinner from './layouts/frontend/Components/Loader';
import AboutUs from './layouts/frontend/Outer/AboutUs';
import ContactUs from './layouts/frontend/Outer/ContactUs';
import FAQ from './layouts/frontend/Outer/FAQ';
import Collections from './layouts/frontend/Outer/Collections';
import ResendEmail from './layouts/frontend/auth/Verification';
import VerifyEmail from './layouts/frontend/auth/Verify';
import { CartProvider } from './layouts/frontend/Components/CartContext';
import CartSidebar from './layouts/frontend/Components/CartSidebar';
import { WishlistProvider } from './layouts/frontend/Components/WishlistContext';
import Checkout from './layouts/frontend/Components/Checkout';
import TrendingProducts from './layouts/frontend/Outer/TrendingProducts';
import ShippingReturns from './layouts/frontend/Outer/ShippingReturns';
import Warranty from './layouts/frontend/Outer/Warranty';
import PrivacyPolicy from './layouts/frontend/Outer/PrivacyPolicy';
import TermsOfServicePage from './layouts/frontend/Outer/TermsOfService';
import OrderConfirmation from './layouts/frontend/Components/OrderConfirmation';
import UserOrders from './layouts/frontend/Components/UserOrders';
import UserOrderDetail from './layouts/frontend/Components/UserOrderDetail';
import UserProfile from './layouts/frontend/Components/Profile';
import Wishlist from './layouts/frontend/Outer/WishList';
import TrackOrder from './layouts/frontend/Components/TrackOrder';
import FlashSale from './layouts/frontend/Outer/FlashSale';
import ScrollToTopButton from './layouts/frontend/Components/hooks/ScrollToTopButton';
import ChatSupportButton from './layouts/frontend/Components/ChatSupportButton';
import SiteNotification from './layouts/frontend/Components/SiteNotification';
import SubNavbar from './layouts/frontend/Components/SubNavbar';


const Master = lazy(() => import('./layouts/admin/Master'));
const Register = lazy(() => import('./layouts/frontend/auth/Register'));
const Login = lazy(() => import('./layouts/frontend/auth/Login'));
const AdminPrivateRoute = lazy(() => import('./AdminPrivateRoute'));
const Navbar = lazy(() => import('./layouts/frontend/Components/Navbar'));
const Top = lazy(() => import('./layouts/frontend/Components/Top'));
const ProductShowcase = lazy(() => import('./layouts/frontend/Components/ProductShowcase'));
const Products = lazy(() => import('./layouts/frontend/Components/Products'));
const CustomerTestimonials = lazy(() => import('./layouts/frontend/Components/CustomerTestimonials'));
const CallToActionNewsletter = lazy(() => import('./layouts/frontend/Components/CallToActionNewsletter'));
const Footer = lazy(() => import('./layouts/frontend/Components/Footer'));
const Store = lazy(() => import('./layouts/frontend/Outer/Store'));
const ProductDetail = lazy(() => import('./layouts/frontend/Outer/Detail'));
const NotFound = lazy(() => import('./layouts/frontend/Components/404'));
const Forbidden = lazy(() => import('./layouts/frontend/Components/403'));
const ScrollToTop = lazy(() => import('./layouts/frontend/Components/ScrollToTop'));


axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;
axios.defaults.baseURL = '/';
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.post['Accept'] = 'application/json';

axios.interceptors.request.use(function (config) {
    const token = localStorage.getItem('auth_token');
    config.headers.Authorization = token ? `Bearer ${token}` : '';
    return config;
});

// Home component from the initial app
function Home() {
    return (
        <>
            <Top />
            <ProductShowcase />
            <Products />
            <CustomerTestimonials />
            <CallToActionNewsletter />
        </>
    );
}

function Layout() {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

    const ProtectedRoute = ({ element }) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            return <Navigate to="/" replace />;
        }
        return element;
    };

    return (
        <>
            {!isAdminRoute && <Navbar />}
            {!isAdminRoute && <SubNavbar />}
            {!isAdminRoute && <SiteNotification />}
            <CartSidebar />
            <Routes>
                <Route
                    path="/admin/*"
                    element={
                        <AdminPrivateRoute>
                            <Master />
                        </AdminPrivateRoute>
                    }
                />
                <Route path="/" element={<Home />} />
                <Route path='/track-order' element={<TrackOrder />} />
                <Route path='/flash-sales' element={<FlashSale />} />
                <Route path='order-confirmation/:orderNumber' element={<OrderConfirmation />} />
                <Route path='/user/orders' element={<UserOrders />} />
                <Route path="/user/order/:orderNumber" element={<UserOrderDetail />} />
                <Route path='/user/profile' element={<UserProfile />} />
                <Route path="/shop" element={<Store />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/trending" element={<TrendingProducts />} />
                <Route path='/wishlist' element={<Wishlist />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/support/warranty" element={<Warranty />} />
                <Route path="/support/faq" element={<FAQ />} />
                <Route path="/support/shipping-returns" element={<ShippingReturns />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfServicePage />} />
                <Route path="/collections/:categoryLink" element={<Collections />} />
                <Route path="/collections/:categoryLink/:productLink" element={<ProductDetail />} />
                <Route path="/403" element={<Forbidden />} />
                <Route path="/login" element={<ProtectedRoute element={<Login />} />} />
                <Route path="/register" element={<ProtectedRoute element={<Register />} />} />
                <Route path="/email/resend" element={<ResendEmail />} />
                <Route path="/email/verify" element={<VerifyEmail />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
            {!isAdminRoute && <Footer />}
        </>
    );
}

function App() {
    const [appLoading, setAppLoading] = useState(true);

    useEffect(() => {
        const trackVisitorAndPreload = async () => {
            try {
                await axios.post('/api/analytics/track');
            } catch (error) {
                console.error("Initial load error:", error);
            } finally {
                setTimeout(() => {
                    setAppLoading(false);
                }, 1000);
            }
        };

        trackVisitorAndPreload();
    }, []);

    return (
        <div className="App font-raleway">
            <HelmetProvider>
                <Router>
                    <CartProvider>
                        <WishlistProvider>
                            <ScrollToTop />
                            {/* Global loading spinner */}
                            {appLoading ? (
                                <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-[9999]">
                                    <LoadingSpinner />
                                </div>
                            ) : (
                                <Suspense fallback={<LoadingSpinner />}> 
                                    <Layout />
                                    <ScrollToTopButton/>
                                    {/* <ChatSupportButton/> */}
                                </Suspense>
                            )}
                        </WishlistProvider>
                    </CartProvider>
                </Router>
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="dark"
                    className="custom-toast-container"
                    toastClassName="custom-toast"
                    bodyClassName="custom-toast-body"
                    progressClassName="custom-toast-progress"
                />
            </HelmetProvider>
        </div>
    );
}

export default App;