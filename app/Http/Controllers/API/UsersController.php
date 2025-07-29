<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class UsersController extends Controller
{
    /**
     * Display a listing of all users.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function allUsers(): JsonResponse
    {
        try {
            // Eager load the 'location' relationship to get location names if available
            $users = User::with('location')->get(); // Assumes User model has a 'location' relationship
            return response()->json([
                'status' => 200,
                'users' => $users,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 500,
                'message' => 'Failed to fetch users',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function makeAdmin(int $id): JsonResponse
    {
        try {
            // Get the authenticated user
            $authUser = Auth::user();
        
            // Check if the authenticated user is authorized (only Super Admin role_as = 2)
            if (!$authUser || $authUser->role_as !== 2) {
                return response()->json([
                    'status' => 403,
                    'message' => 'Unauthorized. Only Super Admin can perform this action.',
                ], 403);
            }
        
            // Find the user to be updated
            $user = User::find($id);
        
            if (!$user) {
                return response()->json([
                    'status' => 404,
                    'message' => 'User not found',
                ], 404);
            }
            if ($user->role_as === 1) {
                $user->role_as = 0; // Set user role back to standard user
                $user->location_id = null; // Important: Clear location_id if no longer an admin
                $message = 'User is now a standard user';
            } else {
                $user->role_as = 1; // Set user role to general admin (location_id will be null initially)
                $message = 'User is now an admin';
            }
        
            $user->save();
        
            return response()->json([
                'status' => 200,
                'message' => $message,
            ]);
        } catch (\Exception $e) {
            Log::error("Error toggling admin role for user ID {$id}: " . $e->getMessage(), ['exception' => $e]);
            return response()->json([
                'status' => 500,
                'message' => 'Failed to update user role',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    
    public function editUser($id): JsonResponse{
        $user = User::with('location')->find($id); // Eager load location for frontend
        if (!$user) {
            return response()->json([
                'status' => 404,
                'message' => 'User not found',
            ], 404);
        } else {
            return response()->json([
                'status' => 200,
                'user' => $user,
            ], 200);
        }
    }

    public function updateUser(Request $request, $id): JsonResponse
    {
        // Get the authenticated user
        $authUser = Auth::user();
    
        // Check if the authenticated user is authorized to update users
        // Only Super Admin (role_as 2) or Admin (role_as 1) can access this endpoint.
        if (!$authUser || !in_array($authUser->role_as, [1, 2])) {
            return response()->json([
                'status' => 403,
                'message' => 'Unauthorized. Only admins can perform this action.',
            ], 403);
        }

        // Find the user to be updated
        $user = User::find($id);
    
        if (!$user) {
            return response()->json([
                'status' => 404,
                'message' => 'User not found',
            ], 404);
        }

        // Prevent a user from changing their own role_as or location_id
        // Super admin should ideally not edit their own role/location this way.
        if ($authUser->id === $user->id && $authUser->role_as !== 2) {
             return response()->json([
                'status' => 403,
                'message' => 'You cannot change your own role or location assignment.',
            ], 403);
        }
        
        // Define validation rules
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id, // Email must be unique, exclude current user's ID
            'password' => 'nullable|string|min:8', // Validate password only if provided
        ];

        // Flag to track if role/location changes were attempted by a non-Super Admin
        $unauthorizedRoleLocationChangeAttempt = false;

        // Conditional validation and update logic for role_as and location_id
        if ($authUser->role_as === 2) { // If authenticated user is a Super Admin
            $rules['role_as'] = 'required|integer|in:0,1,2'; // Must be 0, 1, or 2
            
            // If the target user's role is being set to 'Admin' (1)
            if ($request->input('role_as') == 1) {
                $rules['location_id'] = 'nullable|integer|exists:locations,id';
            } else {
                // If role_as is 0 (normal user) or 2 (super admin), location_id MUST be null
                $rules['location_id'] = 'nullable|in:null'; // Enforce null if present
            }
        } else { // If authenticated user is NOT a Super Admin (e.g., role_as 1 - general admin)
            // Check if they are attempting to change role_as or location_id
            if ($request->has('role_as') && $request->input('role_as') != $user->role_as) {
                $unauthorizedRoleLocationChangeAttempt = true;
            }
            if ($request->has('location_id') && $request->input('location_id') != $user->location_id) {
                $unauthorizedRoleLocationChangeAttempt = true;
            }

            // If an unauthorized attempt was made, return a 403 immediately
            if ($unauthorizedRoleLocationChangeAttempt) {
                Log::warning("Unauthorized attempt by Admin ID {$authUser->id} to change role_as or location_id for User ID {$id}.");
                return response()->json([
                    'status' => 403,
                    'message' => 'You do not have permission to change user roles or assign locations. Only Super Admins can do this.',
                ], 403);
            }
        }
    
        // Validate the incoming request
        $validator = Validator::make($request->all(), $rules);
    
        if ($validator->fails()) {
            Log::warning("User update validation failed for ID {$id}: ", $validator->errors()->toArray());
            return response()->json([
                'status' => 422,
                'errors' => $validator->messages(),
            ], 422);
        }
    
        // Update user details
        $user->name = $request->input('name');
        $user->email = $request->input('email');
    
        // Update password if provided
        if ($request->filled('password')) {
            $user->password = Hash::make($request->input('password'));
        }
    
        // Only Super Admin can update `role_as` and `location_id`
        if ($authUser->role_as === 2) {
            $user->role_as = $request->input('role_as');
            
            // Handle location_id based on selected role
            if ($user->role_as == 1) { // If setting to Admin role
                // If a location_id is provided, use it; otherwise, set to null for general admin
                $user->location_id = $request->filled('location_id') ? $request->input('location_id') : null;
            } else { // If setting to Normal User (0) or Super Admin (2)
                $user->location_id = null; // Clear location_id if not a location admin
            }
        }
    
        $user->save();
        
        Log::info("User ID {$id} updated successfully by Admin ID {$authUser->id}. New Role: {$user->role_as}, Location: {$user->location_id}");
        return response()->json([
            'status' => 200,
            'message' => 'User updated successfully',
        ], 200);
    }
            
// Delete
public function deleteUser($id)
{
    // Get the authenticated user
    $authUser = Auth::user();

    // Check if the authenticated user is authorized
    if (!$authUser || $authUser->role_as !== 2) {
        return response()->json([
            'status' => 403,
            'message' => 'Unauthorized. Only Super Admin can perform this action.',
        ], 403);
    }

    // Prevent a user from deleting themselves
    if ($authUser->id == $id) {
        return response()->json([
            'status' => 403,
            'message' => 'You cannot delete yourself.',
        ], 403);
    }

    // Find the user to delete
    $user = User::find($id);
    if ($user) {
        $user->delete();
        return response()->json([
            'status' => 200,
            'message' => 'User deleted successfully',
        ]);
    } else {
        return response()->json([
            'status' => 404,
            'message' => 'User not found',
        ], 404);
    }
}

public function changePassword(Request $request, $id)
{
    // 1. Validate the incoming request data
    $validator = Validator::make($request->all(), [
        'current_password' => 'required|string',
        'new_password' => 'required|string|min:8|confirmed', // 'confirmed' checks against new_password_confirmation field
        'new_password_confirmation' => 'required|string', // Explicitly included for clarity, but 'confirmed' handles its match
    ]);

    if ($validator->fails()) {
        Log::warning("Password change validation failed for user ID {$id}: ", $validator->errors()->toArray());
        return response()->json([
            'status' => 422,
            'message' => 'Validation failed.',
            'errors' => $validator->errors()
        ], 422);
    }

    try {
        // Find the user by ID
        $user = User::find($id);

        // Check if user exists
        if (!$user) {
            Log::warning("Attempted password change for non-existent user ID: {$id}");
            return response()->json([
                'status' => 404,
                'message' => 'User not found.'
            ], 404);
        }

        // Ensure the authenticated user is authorized to change this password
        // This is a critical security check. The current authenticated user must be the owner of the profile.
        // If using Laravel Sanctum, Auth::id() will give the ID of the logged-in user.
        if (Auth::id() != $user->id) {
            Log::warning("Unauthorized password change attempt. Authenticated user ID: " . Auth::id() . ", Target user ID: {$id}");
            return response()->json([
                'status' => 403, // Forbidden
                'message' => 'You are not authorized to change this user\'s password.'
            ], 403);
        }

        // 2. Verify the current password
        if (!Hash::check($request->current_password, $user->password)) {
            Log::info("Password change failed for user ID {$id}: Incorrect current password.");
            return response()->json([
                'status' => 401, // Unauthorized
                'message' => 'The current password you provided is incorrect.'
            ], 401);
        }

        // 3. Update the password
        $user->password = Hash::make($request->new_password);
        $user->save();

        Log::info("Password successfully changed for user ID: {$id}");
        return response()->json([
            'status' => 200,
            'message' => 'Password changed successfully!'
        ], 200);

    } catch (\Exception $e) {
        Log::error("Error changing password for user ID {$id}: " . $e->getMessage(), ['exception' => $e]);
        return response()->json([
            'status' => 500,
            'message' => 'An error occurred while changing your password. Please try again later.'
        ], 500);
    }
}

    public function getStoreAdmins($locationId): JsonResponse
    {
        $user = Auth::user();

        // Authorization: Only Super Admin (role_as 2) or the assigned Location Admin (role_as 1)
        if (!$user || ($user->role_as === 0)) { // Regular users cannot access
            return new JsonResponse([
                'status' => 403,
                'message' => 'Unauthorized. You do not have permission to view store administrators.',
            ], 403);
        }

        // Additional check for Location Admin: can only view admins for their assigned location
        if ($user->role_as === 1 && $user->location_id !== (int)$locationId) {
            return new JsonResponse([
                'status' => 403,
                'message' => 'Forbidden. You are not authorized to view administrators for this location.',
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
            $admins = User::where('role_as', 1) // Admins
                          ->where('location_id', $locationId) // Assigned to this location
                          ->select('id', 'name', 'email', 'role_as', 'location_id') // Select only necessary fields
                          ->get();

            return new JsonResponse([
                'status' => 200,
                'admins' => $admins,
            ]);
        } catch (\Exception $e) {
            Log::error("Error fetching store admins for location ID {$locationId}: " . $e->getMessage());
            return new JsonResponse([
                'status' => 500,
                'message' => 'Failed to fetch store administrators.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

}
