<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Location;
use Illuminate\Support\Facades\Validator;

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
        $productsInLocation = $location->products()->where('status', 0)->get(); // Assuming status 0 means active product

        return response()->json([
            'status' => 200,
            'location_id' => $locationId,
            'products' => $productsInLocation
        ]);
    }


    /**
     * Attach/Update a product's quantity at a specific location.
     * If the product is already attached to the location, its quantity will be updated.
     * Otherwise, it will be attached.
     * POST /api/products/{product_id}/locations
     * Request body: { "location_id": 1, "quantity_in_store": 50 }
     */
    public function attachOrUpdateProductLocation(Request $request, $productId)
    {
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
    public function detachProductLocation($productId, $locationId)
    {
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