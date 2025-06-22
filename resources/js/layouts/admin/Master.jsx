import React, { useState, useEffect } from 'react';
import { Outlet, Route, Routes, useLocation } from 'react-router-dom'; // Import useLocation
import Navbar from './Navbar'; // Assuming these are in the same layouts folder
import Sidebar from './Sidebar'; // Assuming these are in the same layouts folder
import Footer from './Footer'; // Assuming these are in the same layouts folder

// Import your admin page components (adjust paths as needed)
import Dashboard from '../../components/admin/Dashboard';
import Profile from '../../components/admin/Profile';
import Category from '../../components/admin/Category/Category'; // Add Category
import ViewCategory from '../../components/admin/Category/ViewCategory'; // View Categories
import EditCategory from '../../components/admin/Category/EditCategory'; // Edit Category
import Products from '../../components/admin/Products/Products'; // Add Product
import ViewProducts from '../../components/admin/Products/ViewProducts'; // View Products
import EditProducts from '../../components/admin/Products/EditProducts'; // Edit Product
// import Reports from '../../components/admin/Reports/Reports'; // New: Reports/Analytics
// import Settings from '../../components/admin/Settings/Settings'; // New: General Settings
import NotFound from '../frontend/Components/404'; // Assuming your 404 page
import ViewOrders from '../../components/admin/ViewOrders';
import ViewOrderDetails from '../../components/admin/ViewOrderDetails';
import EditUser from '../../components/admin/EditUser';
import ViewUsers from '../../components/admin/ViewUsers';
import GeneralSettings from '../../components/admin/GeneralSetttings';
import Sales from '../../components/admin/Sales';
import Activity from '../../components/admin/Activity';
import ActivityDashboard from '../../components/admin/Activity';


const Master = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation(); // To trigger sidebar close on navigation

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Close sidebar on mobile navigation
    useEffect(() => {
        if (window.innerWidth < 1024 && isSidebarOpen) {
            setIsSidebarOpen(false); // Close sidebar when path changes on mobile
        }
    }, [location.pathname]); // Dependency on location.pathname


    return (
        <div className="flex min-h-screen bg-gray-100 font-sans antialiased text-gray-800">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Main Content Area */}
            <div
                className={`flex-1 flex flex-col transition-all duration-300 ease-in-out
                `} /* Adjust main content margin when sidebar is open on desktop */
            >
                {/* Navbar (fixed at top) */}
                <Navbar toggleSidebar={toggleSidebar} />

                {/* Main Content Area */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 mt-16"> {/* mt-16 to offset fixed navbar height */}
                    <Routes>
                        {/* Core Routes */}
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="profile" element={<Profile />} />

                        {/* Category Management */}
                        <Route path="category" element={<Category />} /> {/* Renamed from category */}
                        <Route path="category/view" element={<ViewCategory />} /> 
                        <Route path="category/edit/:id" element={<EditCategory />} />

                        {/* Product Management */}
                        <Route path="products/" element={<Products />} /> {/* Renamed from products */}
                        <Route path="products/view" element={<ViewProducts />} /> {/* Renamed from products/view */}
                        <Route path="products/edit/:id" element={<EditProducts />} />

                        {/* Order Management (New) */}
                        <Route path="orders/" element={<ViewOrders />} />
=                        <Route path="orders/view/:order_number" element={<ViewOrderDetails />} />


                        {/* User Management (New) */}
                        <Route path="users/view" element={<ViewUsers />} />
                        <Route path="users/edit/:id" element={<EditUser />} />

                        {/* Analytics & Settings (New/Expanded) */}
                        {/* <Route path="reports" element={<Reports />} /> */}
                        <Route path="settings" element={<GeneralSettings />} />
                        <Route path='activity' element={<ActivityDashboard />} />

                        <Route path='sales' element={<Sales />} />

                        {/* Catch-all for unknown admin routes */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                    {/* Outlet is used if this component itself is a parent route, but we're defining children directly */}
                    {/* <Outlet />  */}
                    {/* <Route path="/admin/*" element={<AdminLayout />}> */}
                </main>

                {/* Footer */}
                <Footer />
            </div>
        </div>
    );
};

export default Master;