<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\FrontendController;
use App\Http\Controllers\API\UsersController;
use App\Http\Controllers\API\TeamController;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ContactMessageController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\API\AdminController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\AdminSettingsController;
use App\Http\Controllers\API\WishlistController;
use App\Http\Controllers\LocationController; // Import LocationController
use App\Http\Controllers\ProductLocationController;
use App\Http\Controllers\LocationInventoryController;

// NEW: Public Location Routes (e.g., for "Find a Store" page)
Route::get('locations', [LocationController::class, 'index']); // Get all active locations


Route::middleware('auth:sanctum')->group(function () {
    // Wishlist Routes
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist/add', [WishlistController::class, 'add']);
    Route::delete('/wishlist/remove/{product_id}', [WishlistController::class, 'remove']);
});

// Activity dashboard
Route::get('/analytics/dashboard', [AnalyticsController::class, 'dashboard']);
Route::post('/analytics/track', [AnalyticsController::class, 'trackVisitor']);

// Route for placing an order
Route::post('/orders/place', [OrderController::class, 'placeOrder']);
Route::post('/orders/update-status/{identifier}', [OrderController::class, 'updateStatus']);
Route::get('/track-order/{orderNumber}', [OrderController::class, 'trackOrder']);

Route::post('/paystack-webhook', [OrderController::class, 'handleWebhook']);
Route::get('/allOrders', [OrderController::class, 'viewOrders']);
Route::get('/orders/view/{order_number}', [OrderController::class, 'viewOrderDetails']);
Route::post('/orders/{orderNumber}/update', [OrderController::class, 'updateOrder']);

Route::post('/contact-us', [ContactMessageController::class, 'store']);

Route::middleware('auth:sanctum')->post('/products/{productId}/submit', [ReviewController::class, 'submitReview']);
Route::get('/products/{productId}/reviews', [ReviewController::class, 'getReviews']);

// Auth Routes
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);
Route::post('auth/google', [AuthController::class, 'googleAuth']);

Route::middleware('auth:sanctum')->post('logout', [AuthController::class, 'logout']);

Route::get('/email/verify', [AuthController::class, 'verifyEmailNotice'])->name('verification.notice');

// Email Verification Handler route
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmailHandler'])->middleware('signed')->name('verification.verify');


Route::match(['get', 'post'], '/email/resend', [AuthController::class, 'verifyEmailResend'])->middleware(['auth:sanctum', 'throttle:6,1'])->name('verification.send');

// Public Frontend Routes
Route::get('allProducts', [FrontendController::class, 'allProducts']);
Route::get('getCategory', [FrontendController::class, 'category']);
Route::get('getProducts', [FrontendController::class, 'products']);
Route::get('fetchProducts/{categoryLink}/{productLink}', [FrontendController::class, 'fetchProducts']);
Route::get('/search', [FrontendController::class, 'search']);
Route::get('/team/view', [TeamController::class, 'index']);
Route::get('/settings/general', [AdminSettingsController::class, 'getSettings']);

Route::post('forgot-password', [AuthController::class, 'sendResetLinkEmail']);
Route::post('reset-password', [AuthController::class, 'resetPassword']);
// NEW: Public Location Routes (e.g., for "Find a Store" page)
Route::get('locations', [LocationController::class, 'index']); // Get all active locations

// Admin Routes (Protected by Sanctum and Role Middleware)
Route::middleware(['auth:sanctum', 'isApiAdmin'])->group(function () {
    // Auth Check
    Route::get('/check-auth', function () {
        return response()->json([
            'status' => 200,
            'message' => 'Authenticated',
        ]);
    });
        // ---  ROUTE FOR THE AUTHENTICATED USER'S DETAILS ---
    Route::get('/user', function (Request $request) {
        // Eager load the location relationship for the authenticated user
        $user = $request->user()->load('location'); 
        return response()->json([
            'status' => 200,
            'user' => $user,
        ]);
    });

    Route::get('admin/pos/products/search', [ProductController::class, 'posSearch']);
    
     Route::get('/admin/pos/products/suggested/{locationId}', [ProductController::class, 'getSuggestedPosProducts']);
    Route::get('/admin/locations/{locationId}/inventory', [LocationInventoryController::class, 'getLocationInventory']);

    // NEW: Location Management Routes (Admin Only)
    Route::get('admin/locations', [LocationController::class, 'allLocationsForAdmin']); // Get all locations including inactive
    Route::post('admin/locations', [LocationController::class, 'store']);
    Route::get('admin/locations/{id}', [LocationController::class, 'show']);
    Route::post('admin/locations/{id}', [LocationController::class, 'update']);
    Route::delete('admin/locations/{id}', [LocationController::class, 'destroy']);
    Route::get('locations/all', [LocationController::class, 'allLocations']);

        // NEW: Store Dashboard Specific Routes
    Route::get('/admin/stores/{locationId}/admins', [UsersController::class, 'getStoreAdmins']); // Get admins for a specific store
    Route::get('/admin/stores/{locationId}/products', [ProductController::class, 'getStoreProducts']); // Get products for a specific store


    // Get stock for a specific product across all locations
    Route::get('admin/products/{product_id}/locations', [ProductLocationController::class, 'getProductLocations']);
    // Attach or update stock for a product at a specific location
    Route::post('admin/products/{product_id}/locations', [ProductLocationController::class, 'attachOrUpdateProductLocation']);
    // Detach product from a specific location
    Route::delete('admin/products/{product_id}/locations/{location_id}', [ProductLocationController::class, 'detachProductLocation']);
    // Get all products at a specific location with their quantities
    Route::get('admin/locations/{location_id}/products', [ProductLocationController::class, 'getLocationProducts']);

    // Settings
    Route::post('/settings/update', [AdminSettingsController::class, 'updateSettings']);

    // Category Management
    Route::post('/category/store', [CategoryController::class, 'store']);
    Route::get('/viewCategory', [CategoryController::class, 'index']);
    Route::get('/category/edit/{id}', [CategoryController::class, 'edit']);
    Route::post('/category/update/{id}', [CategoryController::class, 'update']);
    Route::post('/category/delete/{id}', [CategoryController::class, 'destroy']);
    Route::get('/allCategory', [CategoryController::class, 'allCategory']);

    // Product Management
    Route::post('/products/store', [ProductController::class, 'store']);
    Route::get('/products/view', [ProductController::class, 'index']);
    Route::get('/products/edit/{id}', [ProductController::class, 'edit']);
    Route::post('/products/update/{id}', [ProductController::class, 'update']);
    Route::post('/products/delete/{id}', [ProductController::class, 'destroy']);

    // User Management
    Route::get('/users/view', [UsersController::class, 'allUsers']);
    Route::post('/users/make-admin/{id}', [UsersController::class, 'makeAdmin']);
    Route::post('/users/delete/{id}', [UsersController::class, 'deleteUser']);
    Route::get('/users/edit/{id}', [UsersController::class, 'editUser']);
    Route::post('/users/update/{id}', [UsersController::class, 'updateUser']);
    Route::post('/users/change-password/{id}', [UsersController::class, 'changePassword']);
    // Team Management
    Route::post('/team/store', [TeamController::class, 'store']);
    Route::get('/team/edit/{id}', [TeamController::class, 'edit']);
    Route::post('/team/update/{id}', [TeamController::class, 'update']);
    Route::post('/team/delete/{id}', [TeamController::class, 'destroy']);
});
