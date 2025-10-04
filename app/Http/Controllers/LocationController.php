<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Location;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
class LocationController extends Controller
{
    public function index()
    {
        $locations = Location::where('is_active', true)->orderBy('name')->get();
        return response()->json([
            'status' => 200,
            'locations' => $locations
        ]);
    }

    public function allLocationsForAdmin()
    {
        $locations = Location::orderBy('name')->get();
        return response()->json([
            'status' => 200,
            'locations' => $locations
        ]);
    }

    public function allLocations(): JsonResponse
    {
        $user = Auth::user();

        // Only Super Admin (2) or Admin (1) can see all locations
        if (!$user || ($user->role_as !== 1 && $user->role_as !== 2)) {
            return response()->json([
                'status' => 403,
                'message' => 'Forbidden. You do not have permission to view all locations.',
            ], 403);
        }

        try {
            $locations = Location::where('is_active', true)->get(['id', 'name']);
            return response()->json([
                'status' => 200,
                'locations' => $locations,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 500,
                'message' => 'Failed to fetch locations.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:locations,name',
            'address' => 'required|string|max:500',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 422,
                'errors' => $validator->messages(),
            ], 422);
        }

        $location = Location::create($request->all());

        return response()->json([
            'status' => 200,
            'message' => 'Location added successfully',
            'location' => $location
        ]);
    }

    /**
     * Display the specified resource.
     */
    // public function show($id)
    // {
    //     $location = Location::find($id);
    //     if ($location) {
    //         return response()->json([
    //             'status' => 200,
    //             'location' => $location
    //         ]);
    //     }
    //     return response()->json([
    //         'status' => 404,
    //         'message' => 'Location not found'
    //     ], 404);
    // }

        public function show($id): JsonResponse
    {
        $user = Auth::user();

        // Authorization: Only Super Admin (role_as 2) or the assigned Location Admin (role_as 1)
        if (!$user || ($user->role_as === 0)) { // Regular users cannot access
            return new JsonResponse([
                'status' => 403,
                'message' => 'Unauthorized. You do not have permission to view store details.',
            ], 403);
        }

        $location = Location::find($id);

        if (!$location) {
            return new JsonResponse([
                'status' => 404,
                'message' => 'Location not found.',
            ], 404);
        }

        // Additional check for Location Admin: can only view their assigned location
        if ($user->role_as === 1 && $user->location_id !== (int)$id) {
            return new JsonResponse([
                'status' => 403,
                'message' => 'Forbidden. You are not authorized to view this location.',
            ], 403);
        }

        return new JsonResponse([
            'status' => 200,
            'location' => $location,
        ]);
    }

    public function update(Request $request, $id)
    {
        $location = Location::find($id);
        if (!$location) {
            return response()->json([
                'status' => 404,
                'message' => 'Location not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:locations,name,' . $id,
            'address' => 'required|string|max:500',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 422,
                'errors' => $validator->messages(),
            ], 422);
        }

        $location->update($request->all());

        return response()->json([
            'status' => 200,
            'message' => 'Location updated successfully',
            'location' => $location
        ]);
    }

    public function destroy($id)
    {
        $location = Location::find($id);
        if ($location) {
            $location->delete();
            return response()->json([
                'status' => 200,
                'message' => 'Location deleted successfully'
            ]);
        }
        return response()->json([
            'status' => 404,
            'message' => 'Location not found'
        ], 404);
    }
}