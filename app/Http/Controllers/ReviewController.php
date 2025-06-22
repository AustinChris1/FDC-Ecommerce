<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Review;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    // Allow only logged-in users to submit a review
    public function submitReview(Request $request, $productId)
    {
        if (!Auth::check()) {
            return response()->json([
                'status' => 401,
                'message' => 'You must be logged in to submit a review.',
            ], 401);
        }

        // Check if the product exists
        $product = Product::findOrFail($productId);

        // Check if the user has already reviewed this product
        $existingReview = Review::where('user_id', Auth::id())
                                ->where('product_id', $productId)
                                ->first();

        if ($existingReview) {
            return response()->json([
                'status' => 403,
                'message' => 'You have already reviewed this product.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',  // Rating should be between 1 and 5
            'review' => 'required|string|max:1000',     // Review content should be provided
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 422,
                'message' => 'Validation failed.',
                'errors' => $validator->messages(),
            ], 422);
        }

        // Create the review
        $review = Review::create([
            'user_id' => Auth::id(), // Logged-in user's ID
            'product_id' => $product->id,
            'rating' => $request->rating,
            'review' => $request->review,
        ]);

        return response()->json([
            'status' => 200,
            'message' => 'Review submitted successfully!',
            'review' => $review,
        ]);
    }

    // Get reviews for a product
    public function getReviews($productId)
    {
        $product = Product::findOrFail($productId);
        $reviews = $product->reviews()->with('user')->orderBy('id', 'desc')->get(); // Get reviews with user info
        $user = User::whereIn('id', $reviews->pluck('id'))->get();

        return response()->json([
            'status' => 200,
            'reviews' => $reviews,
            'user' => $user,
        ]);
    }
}
