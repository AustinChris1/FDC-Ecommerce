<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Location;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
class ProductLocationController extends Controller
{
    /**
     * Get all locations for a specific product with their quantities.
     * GET /api/products/{product_id}/locations
     */
    public function getProductLocations($productId)
    {
        $product = Product::find($productId);

        if (!$product) {
            return response()->json([
                'status' => 404,
                'message' => 'Product not found.'
            ], 404);
        }

        // Eager load locations with pivot data
        $locationsWithStock = $product->locations()->where('is_active', true)->get();

        return response()->json([
            'status' => 200,
            'product_id' => $productId,
            'locations' => $locationsWithStock
        ]);
    }

    /**
     * Get all products available at a specific location with their quantities.
     * GET /api/locations/{location_id}/products
     */
    public function getLocationProducts($locationId)
    {
        $location = Location::find($locationId);

        if (!$location) {
            return response()->json([
                'status' => 404,
                'message' => 'Location not found.'
            ], 404);
        }

        // Eager load products with pivot data
        // Assuming status 0 means active product, and you want to show only active
        $productsInLocation = $location->products()->where('status', 0)->get();

        return response()->json([
            'status' => 200,
            'location_id' => $locationId,
            'location_name' => $location->name, // Add location name for frontend
            'products' => $productsInLocation->map(function ($product) {
                // Flatten the pivot data into the main product object for easier frontend consumption
                $product->quantity_in_store = $product->pivot->quantity_in_store;
                unset($product->pivot); // Remove the pivot object if you don't need it
                return $product;
            })
        ]);
    }

    public function attachOrUpdateProductLocation(Request $request, $productId): JsonResponse
    {
        // Check if the authenticated user is a super admin
        if (!Auth::check() || Auth::user()->role_as !== 2) { // Assuming 'role' 2 is for super admin
            return response()->json([
                'status' => 403,
                'message' => 'Unauthorized: Only super administrators can manage product locations.'
            ], 403);
        }

        $product = Product::find($productId);
        if (!$product) {
            return response()->json([
                'status' => 404,
                'message' => 'Product not found.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'location_id' => 'required|integer|exists:locations,id',
            'quantity_in_store' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 422,
                'errors' => $validator->messages()
            ], 422);
        }

        $locationId = $request->input('location_id');
        $quantity = $request->input('quantity_in_store');

        // Use syncWithoutDetaching to update or attach without detaching others
        // Or use updateExistingPivot for updating if exists, and attach if not.
        // For individual updates, `updateExistingPivot` or `attach` is more explicit.
        $product->locations()->syncWithoutDetaching([
            $locationId => ['quantity_in_store' => $quantity]
        ]);

        return response()->json([
            'status' => 200,
            'message' => 'Product quantity updated for location successfully.'
        ]);
    }

    /**
     * Detach a product from a specific location.
     * DELETE /api/products/{product_id}/locations/{location_id}
     */
    public function detachProductLocation($productId, $locationId): JsonResponse
    {
        // Check if the authenticated user is a super admin
        if (!Auth::check() || Auth::user()->role_as !== 2) { // Assuming 'role' 2 is for super admin
            return response()->json([
                'status' => 403,
                'message' => 'Unauthorized: Only super administrators can manage product locations.'
            ], 403);
        }

        $product = Product::find($productId);
        if (!$product) {
            return response()->json([
                'status' => 404,
                'message' => 'Product not found.'
            ], 404);
        }

        $location = Location::find($locationId);
        if (!$location) {
            return response()->json([
                'status' => 404,
                'message' => 'Location not found.'
            ], 404);
        }

        if ($product->locations()->detach($locationId)) {
            return response()->json([
                'status' => 200,
                'message' => 'Product detached from location successfully.'
            ]);
        } else {
            return response()->json([
                'status' => 400,
                'message' => 'Product was not associated with this location.'
            ], 400);
        }
    }
}
