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
   
// Activity dashboard
    Route::get('/analytics/dashboard', [AnalyticsController::class, 'dashboard']);
Route::post('/analytics/track', [AnalyticsController::class, 'trackVisitor']);

// Route for placing an order
Route::post('/orders/place', [OrderController::class, 'placeOrder']);
Route::post('/orders/update-status/{identifier}', [OrderController::class, 'updateStatus']);

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

// Admin Routes (Protected by Sanctum and Role Middleware)
Route::middleware(['auth:sanctum', 'isApiAdmin'])->group(function () {
    // Auth Check
    Route::get('/check-auth', function () {
        return response()->json([
            'status' => 200,
            'message' => 'Authenticated',
        ]);
    });

    // Settings
    Route::get('/settings/general', [AdminSettingsController::class, 'getSettings']);
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
