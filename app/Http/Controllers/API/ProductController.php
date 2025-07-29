<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str; // Import the Str helper for slug generation
use Carbon\Carbon; // Import Carbon for date/time handling
use Illuminate\Support\Facades\Log; // Import Log facade for logging
use App\Models\Location;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;


class ProductController extends Controller
{
    /**
     * Store a new product.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'required|integer|exists:categories,id', // Added exists validation
            'meta_title' => 'nullable|string|max:255',
            'name' => 'required|string|max:255',
            'link' => 'required|string|max:255|unique:products,link', // Added unique validation
            'selling_price' => 'required|numeric',
            'original_price' => 'required|numeric',
            'qty' => 'required|integer',
            'image' => 'required|image|mimes:jpg,jpeg,png',
            'image2' => 'nullable|image|mimes:jpg,jpeg,png',
            'image3' => 'nullable|image|mimes:jpg,jpeg,png',
            'image4' => 'nullable|image|mimes:jpg,jpeg,png',
            'brand' => 'required|string|max:255', // Added max length
            'description' => 'nullable|string',
            'meta_description' => 'nullable|string|max:1000', // Added max length
            'meta_keywords' => 'nullable|string|max:1000',     // Added max length
            'specifications' => 'nullable|json',
            'features' => 'nullable|json',
            'is_new_arrival' => 'boolean', // Validation for new arrival
            'is_flash_sale' => 'boolean',  // Validation for flash sale
            'flash_sale_price' => 'nullable|numeric|lt:original_price|required_if:is_flash_sale,true', // Must be less than original price, required if flash sale
            'flash_sale_starts_at' => 'nullable|date|required_if:is_flash_sale,true', // Required if flash sale
            'flash_sale_ends_at' => 'nullable|date|after:flash_sale_starts_at|required_if:is_flash_sale,true', // Required if flash sale, must be after start
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 422,
                'errors' => $validator->messages(),
            ], 422);
        }

        $product = new Product();

        $product->category_id = $request->input('category_id');
        $product->meta_title = trim($request->input('meta_title'));
        $product->name = trim($request->input('name'));
        $product->link = Str::slug($request->input('link'));
        $product->description = trim($request->input('description')) ?? null;
        $product->meta_description = trim($request->input('meta_description')) ?? null;
        $product->meta_keywords = trim($request->input('meta_keywords')) ?? null;
        $product->selling_price = $request->input('selling_price');
        $product->original_price = $request->input('original_price');
        $product->qty = $request->input('qty');
        $product->brand = trim($request->input('brand'));

        // Handle boolean fields from checkboxes
        $product->featured = $request->boolean('featured');
        $product->popular = $request->boolean('popular');
        $product->status = $request->boolean('status');

        // New: Handle new arrival and flash sale flags
        $product->is_new_arrival = $request->boolean('is_new_arrival');
        $product->is_flash_sale = $request->boolean('is_flash_sale');

        // New: Handle flash sale details
        if ($product->is_flash_sale) {
            $product->flash_sale_price = $request->input('flash_sale_price');
            // Ensure dates are parsed correctly, Carbon is ideal here
            $product->flash_sale_starts_at = Carbon::parse($request->input('flash_sale_starts_at'));
            $product->flash_sale_ends_at = Carbon::parse($request->input('flash_sale_ends_at'));
        } else {
            // Reset flash sale fields if it's not a flash sale
            $product->flash_sale_price = null;
            $product->flash_sale_starts_at = null;
            $product->flash_sale_ends_at = null;
        }

        // Handle specifications and features (same logic as before)
        $specificationsData = json_decode($request->input('specifications'), true);
        $filteredSpecifications = array_filter($specificationsData, function ($spec) {
            return !empty($spec['feature']) || !empty($spec['value']);
        });
        $product->specifications = json_encode(array_values($filteredSpecifications));

        $featuresData = json_decode($request->input('features'), true);
        $filteredFeatures = array_filter($featuresData, function ($feat) {
            return !empty($feat['feature']) || !empty($feat['value']);
        });
        $product->features = json_encode(array_values($filteredFeatures));

        // Handle image uploads (refactored for clarity and consistency)
        $baseDestinationPath = 'uploads/products';
        $saveImage = function ($file, $subfolder) use ($baseDestinationPath) {
            $extension = $file->getClientOriginalExtension();
            $filename = time() . '_' . Str::random(10) . '.' . $extension; // More robust unique name
            $destinationPath = public_path($baseDestinationPath . '/' . $subfolder);

            if (!File::isDirectory($destinationPath)) {
                File::makeDirectory($destinationPath, 0777, true, true);
            }

            $file->move($destinationPath, $filename);
            return $baseDestinationPath . '/' . $subfolder . '/' . $filename;
        };

        if ($request->hasFile('image')) {
            $product->image = $saveImage($request->file('image'), 'main');
        }
        if ($request->hasFile('image2')) {
            $product->image2 = $saveImage($request->file('image2'), 'secondary');
        }
        if ($request->hasFile('image3')) {
            $product->image3 = $saveImage($request->file('image3'), 'third');
        }
        if ($request->hasFile('image4')) {
            $product->image4 = $saveImage($request->file('image4'), 'fourth');
        }

        $product->save();

        return response()->json([
            'status' => 200,
            'message' => 'Product stored successfully',
        ], 200);
    }

    /**
     * Retrieve all products.
     */
    public function index(): JsonResponse
    {
        try {
            // Eager load 'category' and 'locations' relationships
            // The 'locations' relationship will include 'quantity_in_store' from the pivot table
            $products = Product::with(['category', 'locations'])->get();

            return new JsonResponse([
                'status' => 200,
                'products' => $products,
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'status' => 500,
                'message' => 'Failed to fetch products.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Retrieve products marked as New Arrivals.
     * New Arrivals are typically recent products. You might want to define "recent"
     * by `created_at` or a specific flag. Here, we'll use `is_new_arrival`.
     */
    public function newArrivals()
    {
        $newArrivals = Product::where('is_new_arrival', true)
            ->where('status', 0) // Assuming 0 means active
            ->orderBy('created_at', 'desc')
            ->take(20) // Limit to a reasonable number
            ->get();

        return response()->json([
            'status' => 200,
            'products' => $newArrivals
        ]);
    }

    /**
     * Retrieve products marked as Flash Sales.
     * Filter by `is_flash_sale` and ensure the current time is within the sale period.
     */
    public function flashSales()
    {
        $flashSales = Product::where('is_flash_sale', true)
            ->where('status', 0) // Assuming 0 means active
            ->where('flash_sale_starts_at', '<=', Carbon::now())
            ->where('flash_sale_ends_at', '>=', Carbon::now())
            ->orderBy('flash_sale_ends_at', 'asc') // Order by end time to show soonest ending sales
            ->get();

        return response()->json([
            'status' => 200,
            'products' => $flashSales
        ]);
    }

    /**
     * Fetch a product for editing.
     */
    public function edit($id)
    {
        $product = Product::find($id); // Changed variable name to follow convention
        if (!$product) {
            return response()->json([
                'status' => 404,
                'message' => 'Product not found',
            ], 404);
        } else {
            return response()->json([
                'status' => 200,
                'Product' => $product, // Kept 'Product' as per your original response structure
            ], 200);
        }
    }

    /**
     * Update an existing product.
     */
    public function update(Request $request, $id)
    {
        // --- LOGGING START ---
        Log::info('Product update request received.', ['product_id' => $id, 'request_data' => $request->all()]);

        // Log files specifically
        foreach ($request->allFiles() as $key => $file) {
            if ($file->isValid()) {
                Log::info("File received: $key", [
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                ]);
            } else {
                Log::warning("Invalid file received for field: $key");
            }
        }
        // --- LOGGING END ---

        $validator = Validator::make($request->all(), [
            'category_id' => 'required|integer|exists:categories,id',
            'meta_title' => 'nullable|string|max:255',
            'name' => 'required|string|max:255',
            'link' => 'required|string|max:255|unique:products,link,' . $id,
            'selling_price' => 'required|numeric',
            'original_price' => 'required|numeric',
            'qty' => 'required|integer',
            'image' => 'nullable|image|mimes:jpg,jpeg,png',
            'image2' => 'nullable|image|mimes:jpg,jpeg,png',
            'image3' => 'nullable|image|mimes:jpg,jpeg,png',
            'image4' => 'nullable|image|mimes:jpg,jpeg,png',
            'brand' => 'required|string|max:255',
            'description' => 'nullable|string',
            'meta_description' => 'nullable|string|max:1000',
            'meta_keywords' => 'nullable|string|max:1000',
            'specifications' => 'nullable|json',
            'features' => 'nullable|json',
            'is_new_arrival' => 'boolean',
            'is_flash_sale' => 'boolean',
            'flash_sale_price' => 'nullable|numeric|lt:original_price|required_if:is_flash_sale,true',
            'flash_sale_starts_at' => 'nullable|date|required_if:is_flash_sale,true',
            'flash_sale_ends_at' => 'nullable|date|after:flash_sale_starts_at|required_if:is_flash_sale,true',
        ]);

        if ($validator->fails()) {
            // --- LOGGING START ---
            Log::error('Product update validation failed.', ['errors' => $validator->errors()->toArray()]);
            // --- LOGGING END ---
            return response()->json([
                'status' => 422,
                'errors' => $validator->messages(),
            ], 422);
        }

        $product = Product::find($id);

        if (!$product) {
            // --- LOGGING START ---
            Log::warning('Product not found for update.', ['product_id' => $id]);
            // --- LOGGING END ---
            return response()->json([
                'status' => 404,
                'message' => 'Product not found',
            ], 404);
        }

        // Update Product fields
        $product->category_id = $request->input('category_id');
        $product->meta_title = trim($request->input('meta_title'));
        $product->name = trim($request->input('name'));
        $product->link = Str::slug($request->input('link'));
        $product->description = trim($request->input('description')) ?? null;
        $product->meta_description = trim($request->input('meta_description')) ?? null;
        $product->meta_keywords = trim($request->input('meta_keywords')) ?? null;
        $product->selling_price = $request->input('selling_price');
        $product->original_price = $request->input('original_price');
        $product->qty = $request->input('qty');
        $product->brand = trim($request->input('brand'));

        // Handle boolean fields
        $product->status = $request->boolean('status');
        $product->featured = $request->boolean('featured');
        $product->popular = $request->boolean('popular');

        // New: Update new arrival and flash sale flags
        $product->is_new_arrival = $request->boolean('is_new_arrival');
        $product->is_flash_sale = $request->boolean('is_flash_sale');

        // New: Update flash sale details
        if ($product->is_flash_sale) {
            $product->flash_sale_price = $request->input('flash_sale_price');
            $product->flash_sale_starts_at = Carbon::parse($request->input('flash_sale_starts_at'));
            $product->flash_sale_ends_at = Carbon::parse($request->input('flash_sale_ends_at'));
        } else {
            // Reset flash sale fields if it's no longer a flash sale
            $product->flash_sale_price = null;
            $product->flash_sale_starts_at = null;
            $product->flash_sale_ends_at = null;
        }

        // Handle specifications and features
        $specificationsData = json_decode($request->input('specifications'), true);
        $filteredSpecifications = array_filter($specificationsData, function ($spec) {
            return !empty($spec['feature']) || !empty($spec['value']);
        });
        $product->specifications = json_encode(array_values($filteredSpecifications));

        $featuresData = json_decode($request->input('features'), true);
        $filteredFeatures = array_filter($featuresData, function ($feat) {
            return !empty($feat['feature']) || !empty($feat['value']);
        });
        $product->features = json_encode(array_values($filteredFeatures));

        // Refactored image update logic to be more generic and cleaner
        $baseDestinationPath = 'uploads/products';
        $updateImage = function ($file, $oldPath, $subfolder) use ($baseDestinationPath) {
            // Log for image processing
            Log::info("Attempting to update image for subfolder: $subfolder");
            if ($oldPath && File::exists(public_path($oldPath))) {
                File::delete(public_path($oldPath));
                Log::info("Deleted old image: $oldPath");
            }
            $extension = $file->getClientOriginalExtension();
            $filename = time() . '_' . Str::random(10) . '.' . $extension;
            $destinationPath = public_path($baseDestinationPath . '/' . $subfolder);

            if (!File::isDirectory($destinationPath)) {
                File::makeDirectory($destinationPath, 0777, true, true);
                Log::info("Created directory: $destinationPath");
            }

            $file->move($destinationPath, $filename);
            $newPath = $baseDestinationPath . '/' . $subfolder . '/' . $filename;
            Log::info("New image saved: $newPath");
            return $newPath;
        };

        // --- Important: Only process file if it actually exists in the request ---
        if ($request->hasFile('image')) {
            $product->image = $updateImage($request->file('image'), $product->image, 'main');
        }
        if ($request->hasFile('image2')) {
            $product->image2 = $updateImage($request->file('image2'), $product->image2, 'secondary');
        }
        if ($request->hasFile('image3')) { // This is the specific one you asked about
            $product->image3 = $updateImage($request->file('image3'), $product->image3, 'third');
        }
        if ($request->hasFile('image4')) {
            $product->image4 = $updateImage($request->file('image4'), $product->image4, 'fourth');
        }

        $product->save();

        // --- LOGGING START ---
        Log::info('Product updated successfully.', ['product_id' => $product->id]);
        // --- LOGGING END ---

        return response()->json([
            'status' => 200,
            'message' => 'Product updated successfully',
        ]);
    }
    /**
     * Delete a product.
     */
    public function destroy($id)
    {
        $product = Product::find($id);
        if ($product) {
            // Delete associated images before deleting the product record
            $imagePaths = [$product->image, $product->image2, $product->image3, $product->image4];
            foreach ($imagePaths as $path) {
                if ($path && File::exists(public_path($path))) {
                    File::delete(public_path($path));
                }
            }

            $product->delete();
            return response()->json([
                'status' => 200,
                'message' => 'Product deleted successfully',
            ]);
        } else {
            return response()->json([
                'status' => 404,
                'message' => 'Product not found',
            ], 404);
        }
    }

    public function posSearch(Request $request)
    {
        $query = $request->input('query');
        $locationId = $request->input('location_id');

        if (!$locationId) {
            return response()->json([
                'status' => 400,
                'message' => 'Location ID is required for POS product search.'
            ], 400);
        }

        // Fetch products that are active and associated with the given location
        $products = Product::where('status', 0)
            ->where(function ($q) use ($query) {
                $q->where('name', 'LIKE', '%' . $query . '%')
                    ->orWhere('brand', 'LIKE', '%' . $query . '%')
                    // Add other searchable fields like SKU if you have them
                    ->orWhere('link', 'LIKE', '%' . $query . '%');
            })
            ->whereHas('locations', function ($q) use ($locationId) {
                $q->where('locations.id', $locationId);
            })
            ->with([
                'locations' => function ($q) use ($locationId) {
                    $q->where('locations.id', $locationId)
                        ->select('locations.id', 'locations.name') // Select only necessary location fields
                        ->withPivot('quantity_in_store'); // Crucially get the pivot quantity
                }
            ])
            ->get();

        // Transform products to include the specific location's stock directly
        // and ensure the 'stock' field in the frontend cart refers to this.
        $transformedProducts = $products->map(function ($product) use ($locationId) {
            $locationPivot = $product->locations->firstWhere('id', $locationId);
            $stockAtLocation = $locationPivot ? $locationPivot->pivot->quantity_in_store : 0;

            return [
                'id' => $product->id,
                'name' => $product->name,
                'selling_price' => $product->selling_price,
                'brand' => $product->brand,
                'image' => $product->image,
                'stock_at_location' => $stockAtLocation, // This is the key change for frontend
                // You might also include product.qty (online stock) if the frontend needs to see it
                'online_stock' => $product->qty,
                // 'total_overall_quantity' => $product->total_overall_quantity, // If accessor is appended and needed
            ];
        });

        return response()->json([
            'status' => 200,
            'products' => $transformedProducts
        ]);
    }

    public function getSuggestedPosProducts(Request $request, $locationId): JsonResponse
    {
        // Basic authorization check: Only admins (role_as 1 or 2) can view suggested products
        $user = Auth::user();
        if (!$user || !in_array($user->role_as, [1, 2])) {
            return new JsonResponse([ // Explicitly use new JsonResponse
                'status' => 403,
                'message' => 'Forbidden. You do not have permission to view products for this location.',
            ], 403);
        }

        // Optional: If a location admin, ensure they are only requesting their assigned location
        if ($user->role_as === 1 && $user->location_id !== (int)$locationId) {
            return new JsonResponse([ // Explicitly use new JsonResponse
                'status' => 403,
                'message' => 'Forbidden. You can only view products for your assigned location.',
            ], 403);
        }

        $location = Location::find($locationId);
        if (!$location) {
            return new JsonResponse([ // Explicitly use new JsonResponse
                'status' => 404,
                'message' => 'Location not found.',
            ], 404);
        }

        try {
            // Get pagination parameters from the request
            $perPage = $request->input('per_page', 8); // Default to 8 items per page, matching frontend constant

            // Fetch products with their quantity_in_store for the specified location
            // Use paginate() instead of get() to return paginated data
            $products = Product::select('products.id', 'products.name', 'products.selling_price', 'products.brand', 'products.image', 'product_location.quantity_in_store as stock_at_location')
                ->join('product_location', 'products.id', '=', 'product_location.product_id')
                ->where('product_location.location_id', $locationId)
                ->where('products.status', 0) // Assuming 0 means active product
                ->where('product_location.quantity_in_store', '>', 0) // Only show in-stock products
                ->orderBy('products.name') // Order by name, or by a more relevant metric like 'sales_count' if you track it
                ->paginate($perPage); // Paginate the results

            return new JsonResponse([ // Explicitly use new JsonResponse
                'status' => 200,
                'products' => $products, // This will now be a Paginator instance, which has 'data', 'last_page', etc.
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([ // Explicitly use new JsonResponse
                'status' => 500,
                'message' => 'Failed to fetch suggested products.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

        public function getStoreProducts($locationId): JsonResponse
    {
        $user = Auth::user();

        // Authorization: Only Super Admin (role_as 2) or the assigned Location Admin (role_as 1)
        if (!$user || ($user->role_as === 0)) { // Regular users cannot access
            return new JsonResponse([
                'status' => 403,
                'message' => 'Unauthorized. You do not have permission to view store products.',
            ], 403);
        }

        // Additional check for Location Admin: can only view products for their assigned location
        if ($user->role_as === 1 && $user->location_id !== (int)$locationId) {
            return new JsonResponse([
                'status' => 403,
                'message' => 'Forbidden. You are not authorized to view products for this location.',
            ], 403);
        }

        $location = Location::find($locationId);
        if (!$location) {
            return new JsonResponse([
                'status' => 404,
                'message' => 'Location not found.',
            ], 404);
        }

        try {
            // Join products with product_location to get quantity_in_store for the specific location
            $products = Product::select(
                                'products.id',
                                'products.name',
                                'products.brand',
                                'products.selling_price',
                                'products.image',
                                'product_location.quantity_in_store as stock_at_location'
                            )
                            ->join('product_location', 'products.id', '=', 'product_location.product_id')
                            ->where('product_location.location_id', $locationId)
                            ->where('products.status', 0) // Assuming 0 means active product
                            ->orderBy('products.name')
                            ->get();

            return new JsonResponse([
                'status' => 200,
                'products' => $products,
            ]);
        } catch (\Exception $e) {
            Log::error("Error fetching store products for location ID {$locationId}: " . $e->getMessage());
            return new JsonResponse([
                'status' => 500,
                'message' => 'Failed to fetch store products.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

}