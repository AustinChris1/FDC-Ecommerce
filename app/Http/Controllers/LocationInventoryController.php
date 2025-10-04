<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Location; 
use App\Models\Product;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class LocationInventoryController extends Controller
{
    public function getLocationInventory(Request $request, $locationId)
    {
        Log::info("Attempting to fetch inventory for location ID: {$locationId}");

        // Find the location
        $location = Location::find($locationId);

        if (!$location) {
            Log::warning("Location not found with ID: {$locationId}");
            return response()->json([
                'status' => 404,
                'message' => 'Location not found.',
            ], 404);
        }

        // Authorization Check:
        // 1. Super Admin (role_as == 1) can view any location's inventory.
        // 2. Location Admin (role_as == 2) can only view their assigned location's inventory.
        $user = Auth::user();
        if (!$user) {
            Log::warning("Unauthorized attempt to access location inventory (no authenticated user).");
            return response()->json([
                'status' => 401,
                'message' => 'Unauthorized.',
            ], 401);
        }

        if ($user->role_as == 2) { // Super Admin
            Log::info("Super admin (User ID: {$user->id}) accessing inventory for location ID: {$locationId}.");
        } elseif ($user->role_as == 1) { // Location Admin
            if ($user->location_id != $locationId) {
                Log::warning("Location admin (User ID: {$user->id}, Location ID: {$user->location_id}) attempted to access unauthorized location inventory (Target Location ID: {$locationId}).");
                return response()->json([
                    'status' => 403,
                    'message' => 'Forbidden: You do not have access to this location\'s inventory.',
                ], 403);
            }
            Log::info("Location admin (User ID: {$user->id}, Location ID: {$user->location_id}) accessing their assigned location inventory.");
        } else { // Regular User or other roles
            Log::warning("User (ID: {$user->id}, Role: {$user->role_as}) attempted to access location inventory without sufficient permissions.");
            return response()->json([
                'status' => 403,
                'message' => 'Forbidden: You do not have permission to view location inventory.',
            ], 403);
        }

        // Fetch products associated with this location, including their pivot quantity
        try {
            $products = $location->products()->with('category')->get();

            // Transform data for frontend
            $inventory = $products->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->brand,
                    'category' => $product->category->name ?? 'N/A',
                    'brand' => $product->brand,
                    'quantity_in_store' => $product->pivot->quantity_in_store,
                    'selling_price' => $product->selling_price,
                ];
            });

            Log::info("Successfully fetched inventory for location ID: {$locationId}. Found " . $inventory->count() . " products.");
            return response()->json([
                'status' => 200,
                'location_name' => $location->name,
                'location_address' => $location->address,
                'inventory' => $inventory,
            ]);
        } catch (\Exception $e) {
            Log::error("Error fetching inventory for location ID: {$locationId}. Error: " . $e->getMessage());
            return response()->json([
                'status' => 500,
                'message' => 'An error occurred while fetching location inventory.',
            ], 500);
        }
    }
}
