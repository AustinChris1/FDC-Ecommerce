<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Location;
use Illuminate\Support\Facades\Validator;

class LocationController extends Controller
{
    /**
     * Display a listing of the resource (all active locations for frontend).
     */
    public function index()
    {
        $locations = Location::where('is_active', true)->orderBy('name')->get();
        return response()->json([
            'status' => 200,
            'locations' => $locations
        ]);
    }

    /**
     * Display a listing of all resources (including inactive, for admin).
     */
    public function allLocationsForAdmin()
    {
        $locations = Location::orderBy('name')->get();
        return response()->json([
            'status' => 200,
            'locations' => $locations
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
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
    public function show($id)
    {
        $location = Location::find($id);
        if ($location) {
            return response()->json([
                'status' => 200,
                'location' => $location
            ]);
        }
        return response()->json([
            'status' => 404,
            'message' => 'Location not found'
        ], 404);
    }

    /**
     * Update the specified resource in storage.
     */
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

    /**
     * Remove the specified resource from storage.
     */
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