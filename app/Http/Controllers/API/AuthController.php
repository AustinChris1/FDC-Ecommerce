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
use App\Notifications\CustomResetPasswordNotification;
class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'phone' => ['required', 'string', 'max:20', 'unique:users,phone', 'regex:/^\+?(\d[\d\s-]+\d)$/'], 
        ]);

        if ($validator->fails()) {
            return response()->json([
                'validation_errors' => $validator->messages(),
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
        ]);

        Auth::login($user);

        $token = $user->createToken($user->email . '_Token')->plainTextToken;

        event(new Registered($user));

        return response()->json([
            'status' => 200,
            'username' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
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
                if (!isset($payload['email_verified']) || $payload['email_verified'] !== true) {
                    return response()->json([
                        'status' => 401,
                        'message' => 'Google email is not marked as verified by Google. Cannot proceed with sign-in.',
                    ], 401);
                }

                $email = $payload['email'];
                $name = $payload['name'];
                $googleId = $payload['sub'];

                $phone = $payload['phone_number'] ?? null;

                $user = User::where('google_id', $googleId)->first();

                if (!$user) {
                    $user = User::where('email', $email)->first();
                }

                $message = '';
                $isNewUser = false;

                if ($user) {
                    $message = 'Logged in with Google successfully!';
                    $hasUpdates = false;

                    if (empty($user->google_id)) {
                        $user->google_id = $googleId;
                        $hasUpdates = true;
                    }

                    if (is_null($user->email_verified_at)) {
                        $user->email_verified_at = Carbon::now();
                        $hasUpdates = true;
                        event(new Verified($user));
                    }

                    if ($phone && $user->phone !== $phone) {
                        $user->phone = $phone;
                        $hasUpdates = true;
                    }

                    if ($hasUpdates) {
                        $user->save();
                    }
                } else {
                    $isNewUser = true;
                    $message = 'Signed up with Google successfully!';

                    $user = User::create([
                        'name' => $name,
                        'email' => $email,
                        'password' => Hash::make(uniqid(true) . bin2hex(random_bytes(8))),
                        'google_id' => $googleId,
                        'email_verified_at' => Carbon::now(),
                        'phone' => $phone,
                    ]);

                    event(new Verified($user));
                }

                Auth::login($user);

                $role = 'user';
                $token = $user->createToken($user->email . '_Token', [''])->plainTextToken;

                if (isset($user->role_as) && ($user->role_as == 1 || $user->role_as == 2)) {
                    $role = 'admin';
                    $token = $user->createToken($user->email . '_AdminToken', ['server:admin'])->plainTextToken;
                }

                return response()->json([
                    'status' => 200,
                    'username' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'token' => $token,
                    'role' => $role,
                    'message' => $message,
                    'is_new_user' => $isNewUser,
                ]);
            } else {
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
    }
    public function verifyEmailNotice()
    {
        return view('auth.verify-email');
    }

    // Email Verification Handler
    public function verifyEmailHandler(string $id, string $hash)
    {
        $user = User::findOrFail($id);

        // Validate the hash with the one generated for the user's email
        if (!hash_equals($hash, sha1($user->getEmailForVerification()))) {
            return redirect(env('FRONTEND_URL') . '/email/verify?status=400&message=Email+verification+failed');
        }

        // Mark email as verified
        $user->markEmailAsVerified();

        event(new Verified($user));

        Auth::login($user);

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
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email|max:255',
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'validation_errors' => $validator->messages(),
            ], 422);
        } else {
            $user = User::where('email', $request->email)->first();

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
            if ($user->role_as == 1 || $user->role_as == 2) {
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
            Log::info('User not found for email: ' . $request->email . '. Returning success to prevent enumeration.');
            return response()->json([
                'status' => 200,
                'message' => 'If your email address exists in our database, a password reset link will be sent to it.',
            ]);
        }

        // Create a password reset token
        $token = Password::broker()->createToken($user);
        Log::info('Generated password reset token for user ' . $user->id . '. Token: ' . $token);

        try {
            // Send custom notification
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

        Log::error('Failed to reset password for email: ' . $request->email . '. Response: ' . $response);
        return response()->json([
            'status' => 400,
            'message' => 'Failed to reset password. The token might be invalid or expired.',
            'errors' => ['email' => [trans($response)]] 
        ], 400);
    }
}
