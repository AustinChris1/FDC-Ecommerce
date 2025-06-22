<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Category;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\File;    // Import for file deletion
use Illuminate\Support\Facades\Storage; // Import for file storage



class CategoryController extends Controller
{
    //Add
    public function store(Request $request)
    {
        // Add image validation
        $validator = Validator::make($request->all(), [
            'meta_title' => 'required|string|max:255',
            'link' => 'required|string|max:255|unique:categories,link', // Ensure link is unique
            'name' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Image validation: optional, image file, allowed types, max 2MB
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 400,
                'errors' => $validator->messages(),
            ], 400);
        }

        $category = new Category();
        $category->meta_title = $request->input('meta_title');
        $category->link = $request->input('link');
        $category->description = $request->input('description');
        $category->meta_description = $request->input('meta_description');
        $category->meta_keywords = $request->input('meta_keywords');
        $category->name = $request->input('name');
        $category->status = $request->input('status') == true ? 1 : 0;

        // Handle image upload
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $extension = $file->getClientOriginalExtension();
            $filename = time() . '.' . $extension;
            // Store image in 'public' disk under 'uploads/categories' directory
            $path = $file->storeAs('uploads/categories', $filename, 'public');
            $category->image = 'uploads/categories/' . $filename; // Save relative path to DB
        }

        $category->save();

        return response()->json([
            'status' => 200,
            'message' => 'Category stored successfully',
        ], 200);
    }

    //View
    public function index()
    {
        $category = Category::all();
        return response()->json([
            'status' => 200,
            'category' => $category,
        ], 200);
    }
//Fetch for edit
    public function edit($id)
    {
        $category = Category::find($id);
        if (!$category) {
            return response()->json([
                'status' => 404,
                'message' => 'Category not found',
            ], 404);
        }else{
        return response()->json([
            'status' => 200,
            'category' => $category,
        ], 200);
    }
    }
    // Update method for editing an existing category
    public function update(Request $request, $id)
    {
        // Add image validation
        $validator = Validator::make($request->all(), [
            'meta_title' => 'required|string|max:255',
            'link' => 'required|string|max:255|unique:categories,link,' . $id, // Unique link except for current category
            'name' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Image validation
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 422,
                'errors' => $validator->messages(),
            ], 422);
        }

        $category = Category::find($id);

        if ($category) {
            // Update category fields
            $category->meta_title = $request->input('meta_title');
            $category->link = $request->input('link');
            $category->description = $request->input('description');
            $category->meta_description = $request->input('meta_description');
            $category->meta_keywords = $request->input('meta_keywords');
            $category->name = $request->input('name');
            $category->status = $request->input('status') == true ? 1 : 0;

            // Handle image update/deletion using your preferred method
            if ($request->hasFile('image')) {
                // Get the old image path
                $oldImagePath = $category->image; 
                
                // If an old image exists, delete it
                if ($oldImagePath && File::exists(public_path($oldImagePath))) {
                    File::delete(public_path($oldImagePath));
                }

                // Upload the new image
                $file = $request->file('image');
                $extension = $file->getClientOriginalExtension();
                $filename = time() . '.' . $extension;
                $destinationPath = 'uploads/categories'; // Your desired destination folder in public directory
                $file->move(public_path($destinationPath), $filename); // Move to public path
                $category->image = $destinationPath . "/" . $filename; // Save relative path to DB

            } elseif ($request->input('image') === 'REMOVE_LOGO') {
                // If frontend sends 'REMOVE_LOGO' signal (for explicit deletion without new upload)
                $oldImagePath = $category->image;
                if ($oldImagePath && File::exists(public_path($oldImagePath))) {
                    File::delete(public_path($oldImagePath));
                }
                $category->image = null; // Set image path to null in DB
            }
            // If no new image is uploaded and 'REMOVE_LOGO' signal is not sent,
            // the existing $category->image value will be retained by default.

            $category->save();

            // Optionally return new logo path if updated
            $response = [
                'status' => 200,
                'message' => 'Category updated successfully',
            ];
            if ($request->hasFile('image')) {
                $response['new_logo_path'] = $category->image; // Return the new image path
            }
            return response()->json($response);

        } else {
            return response()->json([
                'status' => 404,
                'message' => 'Category not found',
            ], 404);
        }
    }

//Delete
    public function destroy($id)
    {
        $category = Category::find($id);
        if ($category) {
            $category->delete();
            return response()->json([
                'status' => 200,
                'message' => 'Category deleted successfully',
            ]);
        } else {
            return response()->json([
                'status' => 404,
                'message' => 'Category not found',
            ], 404);
        }
    }

    public function allCategory()
    {
        $category = Category::where('status', 0)->get();
        return response()->json([
            'status' => 200,
            'category' => $category,
        ], 200);
    }
    
}
