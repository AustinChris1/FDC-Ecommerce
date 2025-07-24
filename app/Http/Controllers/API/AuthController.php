<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth as Auth;
// use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;
use Google\Client as Google_Client;
use Carbon\Carbon;

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
                $email = $payload['email'];
                $name = $payload['name'];
                $googleId = $payload['sub']; // Google User ID

                // Find user by email
                $user = User::where('email', $email)->first();

                if ($user) {
                    // User exists, log them in
                    Auth::login($user);
                    $message = 'Logged in with Google successfully!';
                } else {
                    // User does not exist, create a new account
                    $user = User::create([
                        'name' => $name,
                        'email' => $email,
                        'password' => Hash::make(uniqid()),
                        'google_id' => $googleId,
                        'email_verified_at' => Carbon::now(), // Mark email as verified immediately
                    ]);
                    Auth::login($user);
                    event(new Verified($user)); // Trigger the Verified event
                    $message = 'Signed up with Google successfully! Email is verified.';
                }

                // Determine role and create Sanctum token
                $role = 'user'; // Default role
                $token = $user->createToken($user->email . '_Token', [''])->plainTextToken;

                // If you have a role_as column and logic for admin, you can add it here
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
                ]);
            } else {
                // Invalid ID Token
                return response()->json([
                    'status' => 401,
                    'message' => 'Invalid Google ID token.',
                ], 401);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 500,
                'message' => 'Google authentication failed: ' . $e->getMessage(),
            ], 500);
        }
    }
    // Email Verification Notice Handler
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
        $validator = Validator::make($request->all(), [  // Use $request->all()
            'email' => 'required|string|email|max:255',
            'password' => 'required|string|min:8',
        ]);
    
        if ($validator->fails()) {
            return response()->json([
                'validation_errors' => $validator->messages(),
            ], 422);  // Use 422 for validation errors
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
}
