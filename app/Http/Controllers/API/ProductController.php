<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use App\Models\Location;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;


class ProductController extends Controller
{
    public function store(Request $request)
    {
        // Store admins should not be able to make changes
        $user = Auth::user();
        if (!$user || ($user && $user->location_id !== NULL)) {
            return new JsonResponse([
                'status' => 403,
                'message' => 'Forbidden. You do not have permission',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'category_id' => 'required|integer|exists:categories,id',
            'meta_title' => 'nullable|string|max:255',
            'name' => 'required|string|max:255',
            'link' => 'required|string|max:255|unique:products,link',
            'selling_price' => 'required|numeric',
            'original_price' => 'required|numeric',
            'qty' => 'required|integer',
            'image' => 'required|image|mimes:jpg,jpeg,png|max:8096',
            'image2' => 'nullable|image|mimes:jpg,jpeg,png|max:8096',
            'image3' => 'nullable|image|mimes:jpg,jpeg,png|max:8096',
            'image4' => 'nullable|image|mimes:jpg,jpeg,png|max:8096',
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

        $product->is_new_arrival = $request->boolean('is_new_arrival');
        $product->is_flash_sale = $request->boolean('is_flash_sale');

        if ($product->is_flash_sale) {
            $product->flash_sale_price = $request->input('flash_sale_price');
            $product->flash_sale_starts_at = Carbon::parse($request->input('flash_sale_starts_at'));
            $product->flash_sale_ends_at = Carbon::parse($request->input('flash_sale_ends_at'));
        } else {
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

        // Handle image uploads
        $baseDestinationPath = 'uploads/products';
        $saveImage = function ($file, $subfolder) use ($baseDestinationPath) {
            $extension = $file->getClientOriginalExtension();
            $filename = time() . '_' . Str::random(10) . '.' . $extension;
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

    public function index(): JsonResponse
    {
        try {
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

    public function newArrivals()
    {
        $newArrivals = Product::where('is_new_arrival', true)
            ->where('status', 0)
            ->orderBy('created_at', 'desc')
            ->take(20)
            ->get();

        return response()->json([
            'status' => 200,
            'products' => $newArrivals
        ]);
    }

    public function flashSales()
    {
        $flashSales = Product::where('is_flash_sale', true)
            ->where('status', 0)
            ->where('flash_sale_starts_at', '<=', Carbon::now())
            ->where('flash_sale_ends_at', '>=', Carbon::now())
            ->orderBy('flash_sale_ends_at', 'asc')
            ->get();

        return response()->json([
            'status' => 200,
            'products' => $flashSales
        ]);
    }

    public function edit($id)
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json([
                'status' => 404,
                'message' => 'Product not found',
            ], 404);
        } else {
            return response()->json([
                'status' => 200,
                'Product' => $product,
            ], 200);
        }
    }

    public function update(Request $request, $id)
    {
        Log::info('Product update request received.', ['product_id' => $id, 'request_data' => $request->all()]);

        // Store admins should not be able to make changes
        $user = Auth::user();
        if (!$user || ($user && $user->location_id !== NULL)) {
            return new JsonResponse([
                'status' => 403,
                'message' => 'Forbidden. You do not have permission',
            ], 403);
        }
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

        $validator = Validator::make($request->all(), [
            'category_id' => 'required|integer|exists:categories,id',
            'meta_title' => 'nullable|string|max:255',
            'name' => 'required|string|max:255',
            'link' => 'required|string|max:255|unique:products,link,' . $id,
            'selling_price' => 'required|numeric',
            'original_price' => 'required|numeric',
            'qty' => 'required|integer',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:8096',
            'image2' => 'nullable|image|mimes:jpg,jpeg,png|max:8096',
            'image3' => 'nullable|image|mimes:jpg,jpeg,png|max:8096',
            'image4' => 'nullable|image|mimes:jpg,jpeg,png|max:8096',
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
            Log::error('Product update validation failed.', ['errors' => $validator->errors()->toArray()]);
            return response()->json([
                'status' => 422,
                'errors' => $validator->messages(),
            ], 422);
        }

        $product = Product::find($id);

        if (!$product) {
            Log::warning('Product not found for update.', ['product_id' => $id]);
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

        if ($request->hasFile('image')) {
            $product->image = $updateImage($request->file('image'), $product->image, 'main');
        }
        if ($request->hasFile('image2')) {
            $product->image2 = $updateImage($request->file('image2'), $product->image2, 'secondary');
        }
        if ($request->hasFile('image3')) {
            $product->image3 = $updateImage($request->file('image3'), $product->image3, 'third');
        }
        if ($request->hasFile('image4')) {
            $product->image4 = $updateImage($request->file('image4'), $product->image4, 'fourth');
        }

        $product->save();

        Log::info('Product updated successfully.', ['product_id' => $product->id]);

        return response()->json([
            'status' => 200,
            'message' => 'Product updated successfully',
        ]);
    }

    public function destroy($id)
    {
        // Store admins should not be able to make changes
        $user = Auth::user();
        if (!$user || ($user && $user->location_id !== NULL)) {
            return new JsonResponse([
                'status' => 403,
                'message' => 'Forbidden. You do not have permission',
            ], 403);
        }

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
                    ->orWhere('link', 'LIKE', '%' . $query . '%');
            })
            ->whereHas('locations', function ($q) use ($locationId) {
                $q->where('locations.id', $locationId);
            })
            ->with([
                'locations' => function ($q) use ($locationId) {
                    $q->where('locations.id', $locationId)
                        ->select('locations.id', 'locations.name')
                        ->withPivot('quantity_in_store');
                }
            ])
            ->get();

        $transformedProducts = $products->map(function ($product) use ($locationId) {
            $locationPivot = $product->locations->firstWhere('id', $locationId);
            $stockAtLocation = $locationPivot ? $locationPivot->pivot->quantity_in_store : 0;

            return [
                'id' => $product->id,
                'name' => $product->name,
                'selling_price' => $product->selling_price,
                'brand' => $product->brand,
                'image' => $product->image,
                'stock_at_location' => $stockAtLocation,
                'online_stock' => $product->qty,
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
            return new JsonResponse([
                'status' => 403,
                'message' => 'Forbidden. You do not have permission to view products for this location.',
            ], 403);
        }

        // Optional: If a location admin, ensure they are only requesting their assigned location
        if ($user->role_as === 1 && $user->location_id !== (int)$locationId) {
            return new JsonResponse([
                'status' => 403,
                'message' => 'Forbidden. You can only view products for your assigned location.',
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
            $perPage = $request->input('per_page', 8);

            // Fetch products with their quantity_in_store for the specified location
            $products = Product::select('products.id', 'products.name', 'products.selling_price', 'products.brand', 'products.image', 'product_location.quantity_in_store as stock_at_location')
                ->join('product_location', 'products.id', '=', 'product_location.product_id')
                ->where('product_location.location_id', $locationId)
                ->where('products.status', 0)
                ->where('product_location.quantity_in_store', '>', 0)
                ->orderBy('products.name')
                ->paginate($perPage);

            return new JsonResponse([
                'status' => 200,
                'products' => $products,
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
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
        if (!$user || ($user->role_as === 0)) {
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
                ->where('products.status', 0)
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
