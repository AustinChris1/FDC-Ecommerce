<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str; // Import the Str helper for slug generation

class ProductController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'required|integer',
            'meta_title' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'link' => 'required|string|max:255',
            'selling_price' => 'required|numeric', // Ensure it's numeric
            'original_price' => 'required|numeric', // Ensure it's numeric
            'qty' => 'required|integer', // Ensure it's an integer
            'image' => 'required|image|mimes:jpg,jpeg,png|max:2048',   // Validate image as a file
            'brand' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 422,
                'errors' => $validator->messages(),
            ], 422);
        } else {
            $product = new Product();

            // Trim and sanitize inputs
            $product->category_id = $request->input('category_id');
            $product->meta_title = trim($request->input('meta_title'));
            $product->name = trim($request->input('name'));
            
            // Ensure the link is properly formatted as a slug
            $product->link = Str::slug($request->input('link'));

            // Trim and sanitize other text inputs
            $product->description = trim($request->input('description'));
            $product->meta_description = trim($request->input('meta_description'));
            $product->meta_keywords = trim($request->input('meta_keywords'));
            $product->selling_price = $request->input('selling_price');
            $product->original_price = $request->input('original_price');
            $product->qty = $request->input('qty');
            $product->status = $request->input('status') == true ? 1 : 0;
            $product->featured = $request->input('featured') == true ? 1 : 0;
            $product->popular = $request->input('popular') == true ? 1 : 0;
            $product->brand = trim($request->input('brand'));

            // Handle first image upload
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $name = time().'.'.$image->getClientOriginalExtension(); // Fixed extension concatenation
                $destinationPath = 'uploads/products1';
                $image->move($destinationPath, $name);
                $newName1 = $destinationPath."/".$name;
                $product->image = $newName1;
            }

            // Handle second image upload
            if ($request->hasFile('image2')) {
                $image2 = $request->file('image2');
                $name2 = time().'.'.$image2->getClientOriginalExtension(); // Fixed extension concatenation
                $destinationPath2 = 'uploads/products2';
                $newName2 = $destinationPath2."/".$name2;
                $image2->move($destinationPath2, $name2);
                $product->image2 = $newName2;
            }

            $product->save();

            return response()->json([
                'status' => 200,
                'message' => 'Product stored successfully',
            ], 200); 
        }
    }

    public function index(){
    
        $products = Product::all();
        return response()->json([
            'status' => 200,
            'products' => $products
        ]);
    }

    // Fetch for edit
    public function edit($id)
    {
        $Product = Product::find($id);
        if (!$Product) {
            return response()->json([
                'status' => 404,
                'message' => 'Product not found',
            ], 404);
        } else {
            return response()->json([
                'status' => 200,
                'Product' => $Product,
            ], 200);
        }
    }

    // Edit
    public function update(Request $request, $id)
    {
        // Validate the incoming request
        $validator = Validator::make($request->all(), [
            'category_id' => 'required|integer',
            'meta_title' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'link' => 'required|string|max:255',
        ]);

        // Return validation errors
        if ($validator->fails()) {
            return response()->json([
                'status' => 422,
                'errors' => $validator->messages(),
            ], 422);
        }

        // Find the Product by ID
        $product = Product::find($id);

        if ($product) {
            // Update Product fields with formatting
            $product->category_id = $request->input('category_id');
            $product->meta_title = trim($request->input('meta_title'));
            $product->name = trim($request->input('name'));

            // Ensure the link is a valid slug
            $product->link = Str::slug($request->input('link'));

            $product->description = trim($request->input('description'));
            $product->meta_description = trim($request->input('meta_description'));
            $product->meta_keywords = trim($request->input('meta_keywords'));
            $product->selling_price = $request->input('selling_price');
            $product->original_price = $request->input('original_price');
            $product->qty = $request->input('qty');
            $product->status = $request->input('status') == true ? 1 : 0;
            $product->featured = $request->input('featured') == true ? 1 : 0;
            $product->popular = $request->input('popular') == true ? 1 : 0;
            $product->brand = trim($request->input('brand'));

            // Handle first image upload
            if ($request->hasFile('image')) {
                $path = $product->image;
                if (File::exists($path)) {
                    File::delete($path);
                }
                $image = $request->file('image');
                $name = time().'.'.$image->getClientOriginalExtension(); // Fixed extension concatenation
                $destinationPath = 'uploads/products1';
                $image->move($destinationPath, $name);
                $newName1 = $destinationPath."/".$name;
                $product->image = $newName1;
            }

            // Handle second image upload
            if ($request->hasFile('image2')) {
                $path = $product->image2;
                if (File::exists($path)) {
                    File::delete($path);
                }
                $image2 = $request->file('image2');
                $name2 = time().'.'.$image2->getClientOriginalExtension();
                $destinationPath2 = 'uploads/products2'; // Correct destination path here
                $image2->move($destinationPath2, $name2);
                $newName2 = $destinationPath2."/".$name2; // Correct path reference here
                $product->image2 = $newName2;
            }

            // Save the updated Product
            $product->save();

            return response()->json([
                'status' => 200,
                'message' => 'Product updated successfully',
            ]);
        } else {
            return response()->json([
                'status' => 404,
                'message' => 'Product not found',
            ], 404);
        }
    }

    // Delete
    public function destroy($id)
    {
        $Product = Product::find($id);
        if ($Product) {
            $Product->delete();
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
