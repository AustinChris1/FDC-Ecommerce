<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
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
            $users = User::all();
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
    
            // Check if the authenticated user is authorized
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
    
            // Toggle user role
            if ($user->role_as === 1) {
                $user->role_as = 0; // Set user role back to standard user
                $message = 'User is now a standard user';
            } else {
                $user->role_as = 1; // Set user role to admin
                $message = 'User is now an admin';
            }
    
            $user->save();
    
            return response()->json([
                'status' => 200,
                'message' => $message,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 500,
                'message' => 'Failed to update user role',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    
    public function editUser($id): JsonResponse{
        $user = User::find($id);
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
    
        // Check if the authenticated user is authorized
        if (!$authUser || !in_array($authUser->role_as, [1, 2])) {
            return response()->json([
                'status' => 403,
                'message' => 'Unauthorized. Only admins can perform this action.',
            ], 403);
        }
    
        // Validate the incoming request
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'password' => 'nullable|string|min:8', // Validate password only if provided
        ]);
    
        if ($validator->fails()) {
            return response()->json([
                'status' => 422,
                'errors' => $validator->messages(),
            ], 422);
        }
    
        // Find the user to be updated
        $user = User::find($id);
    
        if (!$user) {
            return response()->json([
                'status' => 404,
                'message' => 'User not found',
            ], 404);
        }
    
        // Update user details
        $user->name = $request->input('name');
        $user->email = $request->input('email');
    
        // Update password if provided
        if ($request->filled('password')) {
            $user->password = Hash::make($request->input('password'));
        }
    
        // Only Super Admin can update `role_as`
        if ($authUser->role_as === 2 && $request->has('role_as')) {
            $user->role_as = $request->input('role_as');
        }
    
        $user->save();
    
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
}
