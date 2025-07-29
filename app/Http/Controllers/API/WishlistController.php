<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Wishlist;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class WishlistController extends Controller
{
    public function index()
    {
        if (!Auth::check()) {
            return response()->json([
                'status' => 401,
                'message' => 'Unauthorized. Please log in.',
            ], 401);
        }

        // Eager load the 'product' relationship, and nested within that, the 'category' relationship
        $wishlistItems = Auth::user()->wishlists()->with('product.category')->get();

        return response()->json([
            'status' => 200,
            'wishlist' => $wishlistItems,
        ]);
    }

    public function add(Request $request)
    {
        if (!Auth::check()) {
            return response()->json([
                'status' => 401,
                'message' => 'Unauthorized. Please log in to add to wishlist.',
            ], 401);
        }

        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $product_id = $request->input('product_id');
        $user_id = Auth::id();
        Log::info("Adding product to wishlist", ['user_id' => $user_id, 'product_id' => $product_id]);

        // Check if the product is already in the wishlist
        $existingWishlistItem = Wishlist::where('user_id', $user_id)
                                         ->where('product_id', $product_id)
                                         ->first();

        if ($existingWishlistItem) {
            return response()->json([
                'status' => 409, // Conflict
                'message' => 'Product already in wishlist.',
            ], 409);
        }

        // Add to wishlist
        $wishlistItem = Wishlist::create([
            'user_id' => $user_id,
            'product_id' => $product_id,
        ]);

        // Load product details including its category for the newly added item
        // This ensures the frontend receives the full data structure immediately
        return response()->json([
            'status' => 200,
            'message' => 'Product added to wishlist successfully!',
            'wishlistItem' => $wishlistItem->load('product.category'), // Load product and its category
        ]);
    }

    public function remove($product_id)
    {
        if (!Auth::check()) {
            return response()->json([
                'status' => 401,
                'message' => 'Unauthorized. Please log in to remove from wishlist.',
            ], 401);
        }

        $user_id = Auth::id();

        $deletedCount = Wishlist::where('user_id', $user_id)
                                 ->where('product_id', $product_id)
                                 ->delete();

        if ($deletedCount > 0) {
            return response()->json([
                'status' => 200,
                'message' => 'Product removed from wishlist successfully!',
            ]);
        } else {
            return response()->json([
                'status' => 404, // Not Found
                'message' => 'Product not found in wishlist.',
            ], 404);
        }
    }
}