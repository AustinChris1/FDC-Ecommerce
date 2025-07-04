<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str; // Import the Str helper for slug generation
use Carbon\Carbon; // Import Carbon for date/time handling

class ProductController extends Controller
{
    /**
     * Store a new product.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'required|integer|exists:categories,id', // Added exists validation
            'meta_title' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'link' => 'required|string|max:255|unique:products,link', // Added unique validation
            'selling_price' => 'required|numeric',
            'original_price' => 'required|numeric',
            'qty' => 'required|integer',
            'image' => 'required|image|mimes:jpg,jpeg,png|max:4096',
            'image2' => 'nullable|image|mimes:jpg,jpeg,png|max:4096',
            'image3' => 'nullable|image|mimes:jpg,jpeg,png|max:4096',
            'image4' => 'nullable|image|mimes:jpg,jpeg,png|max:4096',
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
    public function index()
    {
        $products = Product::where('status', '0')->orderBy('created_at', 'desc')->get();
        return response()->json([
            'status' => 200,
            'products' => $products
        ]);
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
        $validator = Validator::make($request->all(), [
            'category_id' => 'required|integer|exists:categories,id',
            'meta_title' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'link' => 'required|string|max:255|unique:products,link,' . $id, // Unique check, excluding current product
            'selling_price' => 'required|numeric',
            'original_price' => 'required|numeric',
            'qty' => 'required|integer',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:4096', // Changed to nullable for update
            'image2' => 'nullable|image|mimes:jpg,jpeg,png|max:4096',
            'image3' => 'nullable|image|mimes:jpg,jpeg,png|max:4096',
            'image4' => 'nullable|image|mimes:jpg,jpeg,png|max:4096',
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

        $product = Product::find($id);

        if (!$product) {
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
            if ($oldPath && File::exists(public_path($oldPath))) {
                File::delete(public_path($oldPath));
            }
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
}