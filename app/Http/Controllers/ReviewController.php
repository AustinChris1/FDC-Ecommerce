<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Review;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    public function submitReview(Request $request, $productId)
    {
        // Log the initial request data for debugging
        Log::info('Review submission attempt', [
            'request_data' => $request->all(),
            'product_id'  => $productId,
            'email'       => Auth::check() ? Auth::user()->email : 'Not logged in'
        ]);

        // 1. Check if the user is authenticated.
        if (!Auth::check()) {
            Log::warning('Review submission failed: User not authenticated.');
            return response()->json([
                'status'  => 401,
                'message' => 'You must be logged in to submit a review.',
            ], 401);
        }

        // 2. Find the product
        $product   = Product::findOrFail($productId);
        $userEmail = Auth::user()->email;

        // 3. Check if the authenticated user has purchased this product.
        $orders = Order::where('email', $userEmail)
            ->where('status', 'completed')
            ->get();

        $hasPurchased = false;

        foreach ($orders as $order) {
            $items = json_decode($order->items_json, true);
            if (is_array($items)) {
                foreach ($items as $item) {
                    if ((int) $item['id'] === (int) $productId) {
                        $hasPurchased = true;
                        break 2;
                    }
                }
            }
        }

        Log::info('Purchase verification result', [
            'has_purchased' => $hasPurchased,
            'email'         => $userEmail,
        ]);

        if (!$hasPurchased) {
            Log::warning('Review submission failed: User has not purchased this product.');
            return response()->json([
                'status'  => 403,
                'message' => 'You can only review products you have purchased.',
            ], 403);
        }

        // 5. Validate request
        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            Log::error('Review validation failed.', ['errors' => $validator->messages()]);
            return response()->json([
                'status'  => 422,
                'message' => 'Validation failed.',
                'errors'  => $validator->messages(),
            ], 422);
        }

        // 6. Save review
        $review = Review::create([
            'user_id'    => Auth::id(),
            'product_id' => $product->id,
            'rating'     => $request->rating,
            'review'     => $request->review,
        ]);

        Log::info('Review submitted successfully!', ['review_id' => $review->id]);

        return response()->json([
            'status'  => 200,
            'message' => 'Review submitted successfully!',
            'review'  => $review,
        ]);
    }

    public function getReviews($productId)
    {
        $product = Product::findOrFail($productId);

        $reviews = $product->reviews()
            ->with('user')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'status'  => 200,
            'reviews' => $reviews,
        ]);
    }
}
