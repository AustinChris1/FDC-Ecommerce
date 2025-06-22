<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;      // Assuming your User model is here
use App\Models\Order;     // Assuming your Order model is here
use App\Models\Product;   // Assuming your Product model is here
use App\Models\Category;  // Assuming your Category model is here
use Illuminate\Support\Facades\DB; // For potential aggregation queries
use Illuminate\Support\Facades\Log;

class AdminController extends Controller
{
    public function getTotalUsers()
    {
        try {
            $totalUsers = User::count(); // Count all users in the 'users' table
            return response()->json([
                'status' => 200,
                'totalUsers' => $totalUsers
            ]);
        } catch (\Exception $e) {
            // Log the error for debugging
            Log::error('Error fetching total users: ' . $e->getMessage());
            return response()->json([
                'status' => 500,
                'message' => 'Failed to retrieve total user count.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getTotalOrders()
    {
        try {
            $totalOrders = Order::count(); // Count all orders in the 'orders' table
            return response()->json([
                'status' => 200,
                'totalOrders' => $totalOrders
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching total orders: ' . $e->getMessage());
            return response()->json([
                'status' => 500,
                'message' => 'Failed to retrieve total order count.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getTotalProducts()
    {
        try {
            $totalProducts = Product::count(); // Count all products in the 'products' table
            return response()->json([
                'status' => 200,
                'totalProducts' => $totalProducts
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching total products: ' . $e->getMessage());
            return response()->json([
                'status' => 500,
                'message' => 'Failed to retrieve total product count.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getTotalCategories()
    {
        try {
            $totalCategories = Category::count(); // Count all categories in the 'categories' table
            return response()->json([
                'status' => 200,
                'totalCategories' => $totalCategories
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching total categories: ' . $e->getMessage());
            return response()->json([
                'status' => 500,
                'message' => 'Failed to retrieve total category count.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // You would integrate your existing methods here for:
    // - getRecentUsers() (for /api/admin/users/recent)
    // - getRecentOrders() (for /api/admin/orders/recent)
    // - makeAdmin() (for /api/admin/users/make-admin/{id})
    // - deleteUser() (for /api/admin/users/delete/{id})
    // - deleteTeam() (from your previous prompt, if it's managed by AdminController)

    /**
     * Get recent users. (Placeholder for your existing logic)
     * Corresponds to /api/admin/users/recent
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRecentUsers()
    {
        // Your existing logic for fetching recent users
        // Example:
        $recentUsers = User::latest()->take(5)->get(); // Adjust 'take(5)' as per your needs
        return response()->json([
            'status' => 200,
            'users' => $recentUsers
        ]);
    }

    /**
     * Get recent orders. (Placeholder for your existing logic)
     * Corresponds to /api/admin/orders/recent
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRecentOrders()
    {
        // Your existing logic for fetching recent orders
        // Example:
        $recentOrders = Order::latest()->take(5)->get(); // Adjust 'take(5)' as per your needs
        return response()->json([
            'status' => 200,
            'orders' => $recentOrders
        ]);
    }

    // ... (include your existing makeAdmin and deleteUser/deleteTeam methods here) ...
}
