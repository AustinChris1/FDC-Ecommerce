<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Category;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;



class CategoryController extends Controller
{
    //Add
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

        // Add image validation
        $validator = Validator::make($request->all(), [
            'meta_title' => 'required|string|max:255',
            'link' => 'required|string|max:255|unique:categories,link',
            'name' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:8196',
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
            $destinationPath = 'uploads/categories';
            $file->move(public_path($destinationPath), $filename);
            $category->image = $destinationPath . "/" . $filename;
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
        } else {
            return response()->json([
                'status' => 200,
                'category' => $category,
            ], 200);
        }
    }
    // Update method for editing an existing category
    public function update(Request $request, $id)
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
            'meta_title' => 'required|string|max:255',
            'link' => 'required|string|max:255|unique:categories,link,' . $id,
            'name' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 422,
                'errors' => $validator->messages(),
            ], 422);
        }

        $category = Category::find($id);

        if ($category) {
            $category->meta_title = $request->input('meta_title');
            $category->link = $request->input('link');
            $category->description = $request->input('description');
            $category->meta_description = $request->input('meta_description');
            $category->meta_keywords = $request->input('meta_keywords');
            $category->name = $request->input('name');
            $category->status = $request->input('status') == true ? 1 : 0;

            if ($request->hasFile('image')) {
                $oldImagePath = $category->image;

                if ($oldImagePath && File::exists(public_path($oldImagePath))) {
                    File::delete(public_path($oldImagePath));
                }

                // Upload the new image
                $file = $request->file('image');
                $extension = $file->getClientOriginalExtension();
                $filename = time() . '.' . $extension;
                $destinationPath = 'uploads/categories';
                $file->move(public_path($destinationPath), $filename);
                $category->image = $destinationPath . "/" . $filename;
            } elseif ($request->input('image') === 'REMOVE_LOGO') {
                $oldImagePath = $category->image;
                if ($oldImagePath && File::exists(public_path($oldImagePath))) {
                    File::delete(public_path($oldImagePath));
                }
                $category->image = null;
            }

            $category->save();

            $response = [
                'status' => 200,
                'message' => 'Category updated successfully',
            ];
            if ($request->hasFile('image')) {
                $response['new_logo_path'] = $category->image;
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
        // Store admins should not be able to make changes
        $user = Auth::user();
        if (!$user || ($user && $user->location_id !== NULL)) {
            return new JsonResponse([
                'status' => 403,
                'message' => 'Forbidden. You do not have permission',
            ], 403);
        }

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
