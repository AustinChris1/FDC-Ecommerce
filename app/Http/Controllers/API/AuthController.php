<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth as Auth;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;
use Google\Client as Google_Client;
use Carbon\Carbon;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;
use App\Notifications\CustomResetPasswordNotification; // Ensure this is imported

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // Validate the incoming request
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed', // password confirmation
        ]);

        // Return validation errors if they exist
        if ($validator->fails()) {
            return response()->json([
                'validation_errors' => $validator->messages(),
            ], 422);
        }

        // Create the user
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Log the user in immediately
        Auth::login($user);

        // Create a token for the user
        $token = $user->createToken($user->email . '_Token')->plainTextToken;

        // Trigger the registration event (e.g., sending email verification)
        event(new Registered($user));

        // Respond with success and the necessary data
        return response()->json([
            'status' => 200,
            'username' => $user->name,
            'email' => $user->email,
            'token' => $token,
            'role' => 'user',
            'message' => 'Check your email to verify your account.',
        ]);
    }

 public function googleAuth(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 422,
                'validation_errors' => $validator->messages(),
            ], 422);
        }

        $idToken = $request->input('id_token');

        try {
            $client = new Google_Client(['client_id' => env('VITE_GOOGLE_CLIENT_ID')]);
            $payload = $client->verifyIdToken($idToken);

            if ($payload) {
                // Ensure the email is verified by Google itself
                if (!isset($payload['email_verified']) || $payload['email_verified'] !== true) {
                    return response()->json([
                        'status' => 401,
                        'message' => 'Google email is not marked as verified by Google. Cannot proceed with sign-in.',
                    ], 401);
                }

                $email = $payload['email'];
                $name = $payload['name'];
                $googleId = $payload['sub']; // Google User ID

                // Attempt to get phone number (requires 'phone' scope on frontend)
                $phone = $payload['phone_number'] ?? null;

                // Find user by Google ID first for linked accounts
                $user = User::where('google_id', $googleId)->first();

                if (!$user) {
                    // If no user found by google_id, try by email
                    $user = User::where('email', $email)->first();
                }

                $message = '';
                $isNewUser = false;

                if ($user) {
                    // User exists, update details if necessary
                    $message = 'Logged in with Google successfully!';
                    $hasUpdates = false;

                    // Link Google ID if missing
                    if (empty($user->google_id)) {
                        $user->google_id = $googleId;
                        $hasUpdates = true;
                    }

                    // Mark email as verified if it's currently null
                    if (is_null($user->email_verified_at)) {
                        $user->email_verified_at = Carbon::now();
                        $hasUpdates = true;
                        event(new Verified($user));
                    }

                    // Update phone number if provided and different
                    if ($phone && $user->phone !== $phone) {
                        $user->phone = $phone;
                        $hasUpdates = true;
                    }

                    if ($hasUpdates) {
                        $user->save();
                    }

                } else {
                    // User does not exist, create a new account
                    $isNewUser = true;
                    $message = 'Signed up with Google successfully!';

                    $user = User::create([
                        'name' => $name,
                        'email' => $email,
                        'password' => Hash::make(uniqid(true) . bin2hex(random_bytes(8))), // More robust unique password
                        'google_id' => $googleId,
                        'email_verified_at' => Carbon::now(), // Mark email as verified immediately
                        'phone' => $phone, // Save phone number if available
                    ]);

                    event(new Verified($user));

                }

                // Log the user in
                Auth::login($user);

                // Determine role and create Sanctum token
                $role = 'user'; // Default role
                $token = $user->createToken($user->email . '_Token', [''])->plainTextToken;

                if (isset($user->role_as) && ($user->role_as == 1 || $user->role_as == 2)) {
                    $role = 'admin';
                    $token = $user->createToken($user->email . '_AdminToken', ['server:admin'])->plainTextToken;
                }

                return response()->json([
                    'status' => 200,
                    'username' => $user->name,
                    'email' => $user->email,
                    'token' => $token,
                    'role' => $role,
                    'message' => $message,
                    'is_new_user' => $isNewUser, // Useful for frontend
                ]);
            } else {
                // Invalid ID Token
                return response()->json([
                    'status' => 401,
                    'message' => 'Invalid Google ID token or token could not be verified.',
                ], 401);
            }
        } catch (\Exception $e) {
            Log::error("Google authentication failed: " . $e->getMessage() . " on line " . $e->getLine() . " in " . $e->getFile());

            return response()->json([
                'status' => 500,
                'message' => 'An internal server error occurred during Google authentication. Please try again later.',
            ], 500);
        }
    }    // Email Verification Notice Handler
    public function verifyEmailNotice()
    {
        // Return the view to inform the user to verify their email
        return view('auth.verify-email');
    }
    
    // Email Verification Handler
    public function verifyEmailHandler(string $id, string $hash)
    {
        // Find the user by ID
        $user = User::findOrFail($id);
    
        // Validate the hash with the one generated for the user's email
        if (!hash_equals($hash, sha1($user->getEmailForVerification()))) {
            return redirect(env('FRONTEND_URL') . '/email/verify?status=400&message=Email+verification+failed');
        }
    
        // Mark email as verified
        $user->markEmailAsVerified();
    
        // Trigger the email verified event
        event(new Verified($user));
    
        // Log the user in after email verification
        Auth::login($user);
    
        // Redirect to the frontend with a success message
        return redirect(env('FRONTEND_URL') . '/email/verify?status=200&message=Email+verified+successfully');
    }
    
    // Resend Verification Link
    public function verifyEmailResend(Request $request)
    {
        // Ensure the user is authenticated
        $user = $request->user();
    
        if (!$user) {
            return response()->json(['status' => 401, 'message' => 'User not authenticated.'], 401);
        }
    
        // Send a verification email to the user
        $user->sendEmailVerificationNotification();
    
        // Return a success message
        return response()->json(['status' => 200, 'message' => 'Verification email sent successfully!'], 200);
    }
        
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [   // Use $request->all()
            'email' => 'required|string|email|max:255',
            'password' => 'required|string|min:8',
        ]);
    
        if ($validator->fails()) {
            return response()->json([
                'validation_errors' => $validator->messages(),
            ], 422);   // Use 422 for validation errors
        } else {
            $user = User::where('email', $request->email)->first();
    
            // Check if the user exists and the password is correct
            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'status' => 401,
                    'message' => 'Invalid credentials',
                ]);
            }
    
            // Check if the user is verified
            if (!$user->email_verified_at) {
                return response()->json([
                    'status' => 401,
                    'message' => 'Please verify your email address before logging in.',
                ]);
            }
    
            // Determine the role and assign appropriate token
            if ($user->role_as == 1 || $user->role_as == 2) { // 1 == admin
                $role = 'admin';
                $message = 'Admin logged in successfully';
                $token = $user->createToken($user->email . '_AdminToken', ['server:admin'])->plainTextToken;
            } else {
                $role = 'user';
                $message = 'User logged in successfully';
                $token = $user->createToken($user->email . '_Token', [''])->plainTextToken;
            }
    
            return response()->json([
                'status' => 200,
                'username' => $user->name,
                'email' => $user->email,
                'token' => $token,
                'message' => $message,
                'role' => $role,
            ]);
        }
    }
    
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'status' => 200,
            'message' => 'User logged out successfully',
        ]);
    }

    /**
     * Send a password reset link to the given user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendResetLinkEmail(Request $request)
    {
        Log::info('sendResetLinkEmail method called.');
        Log::info('Request data: ' . json_encode($request->all()));

        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            Log::warning('Validation failed for sendResetLinkEmail: ' . json_encode($validator->messages()));
            return response()->json([
                'status' => 422,
                'errors' => $validator->messages(),
            ], 422);
        }

        Log::info('Validation passed for sendResetLinkEmail. Attempting to send reset link for email: ' . $request->email);

        // Find the user by email
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            // According to Laravel's default behavior, we should not disclose if the email exists.
            // We return success to prevent email enumeration attacks.
            Log::info('User not found for email: ' . $request->email . '. Returning success to prevent enumeration.');
            return response()->json([
                'status' => 200,
                'message' => 'If your email address exists in our database, a password reset link will be sent to it.',
            ]);
        }

        // Create a password reset token
        // This handles the throttling automatically and stores the token in the database
        $token = Password::broker()->createToken($user);
        Log::info('Generated password reset token for user ' . $user->id . '. Token: ' . $token); // Log token (for debugging, be cautious in production)

        try {
            // Manually send our custom notification
            $user->notify(new CustomResetPasswordNotification($token));
            Log::info('CustomResetPasswordNotification sent successfully for email: ' . $request->email);

            return response()->json([
                'status' => 200,
                'message' => 'Password reset link sent to your email address.',
            ]);
        } catch (\Exception $e) {
            Log::error('Error sending CustomResetPasswordNotification for email: ' . $request->email . '. Error: ' . $e->getMessage());
            return response()->json([
                'status' => 500,
                'message' => 'Failed to send password reset link. Please try again later.',
            ], 500);
        }
    }

    /**
     * Reset the given user's password.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function resetPassword(Request $request)
    {
        Log::info('resetPassword method called.');
        Log::info('Request data: ' . json_encode($request->all()));

        $validator = Validator::make($request->all(), [
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            Log::warning('Validation failed for resetPassword: ' . json_encode($validator->messages()));
            return response()->json([
                'status' => 422,
                'errors' => $validator->messages(),
            ], 422);
        }

        Log::info('Validation passed for resetPassword. Attempting to reset password for email: ' . $request->email);

        $response = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                Log::info('Password reset callback executed for user ID: ' . $user->id);
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => \Illuminate\Support\Str::random(60),
                ])->save();
                Log::info('User password updated and remember_token regenerated for user ID: ' . $user->id);

                Auth::login($user);
                Log::info('User logged in after password reset for user ID: ' . $user->id);
            }
        );

        Log::info('Password::reset response: ' . $response);

        if ($response == Password::PASSWORD_RESET) {
            Log::info('Password successfully reset for email: ' . $request->email);
            return response()->json([
                'status' => 200,
                'message' => 'Password has been reset successfully.',
            ]);
        }

        // If the password reset attempt was unsuccessful, we will redirect back
        // to the password reset form with an error message.
        Log::error('Failed to reset password for email: ' . $request->email . '. Response: ' . $response);
        return response()->json([
            'status' => 400,
            'message' => 'Failed to reset password. The token might be invalid or expired.',
            'errors' => ['email' => [trans($response)]] // Provide specific error message for email field
        ], 400);
    }
}
