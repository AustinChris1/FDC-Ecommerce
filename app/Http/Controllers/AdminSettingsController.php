<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Setting; // Import the Setting model
use Illuminate\Support\Facades\File; // IMPORTANT: Changed from Storage to File facade
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule; // For conditional validation rules
use Illuminate\Validation\Rules\File as FileRule; // Alias File rule to avoid conflict with File facade
use Illuminate\Support\Facades\Log; // For logging errors/information

class AdminSettingsController extends Controller
{
    public function getSettings()
    {
        try {
            // Fetch all settings and convert them into an associative array (key => value)
            $settings = Setting::pluck('value', 'key')->all();

            // Construct the response data based on expected frontend fields
            $responseSettings = [
                'site_name' => $settings['site_name'] ?? '',
                'site_email' => $settings['site_email'] ?? '',
                'site_phone' => $settings['site_phone'] ?? '',
                'site_address' => $settings['site_address'] ?? '',
                'facebook_url' => $settings['facebook_url'] ?? '',
                'twitter_url' => $settings['twitter_url'] ?? '',
                'instagram_url' => $settings['instagram_url'] ?? '',
                'site_logo_path' => $settings['site_logo_path'] ?? '', // Path to the current logo
                'shipping_fee' => $settings['shipping_fee'] ?? 0, // New: Default to 0
            ];

            return response()->json([
                'status' => 200,
                'message' => 'Settings fetched successfully.',
                'settings' => $responseSettings
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching settings: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json([
                'status' => 500,
                'message' => 'Failed to fetch settings. An internal server error occurred.'
            ], 500);
        }
    }

    public function updateSettings(Request $request)
    {
        // Define validation rules
        $rules = [
            'site_name' => 'required|string|max:255',
            'site_email' => 'required|string|email|max:255',
            'site_phone' => 'nullable|string|max:50',
            'site_address' => 'nullable|string|max:500',
            'facebook_url' => 'nullable|url|max:255',
            'twitter_url' => 'nullable|url|max:255',
            'instagram_url' => 'nullable|url|max:255',
            'shipping_fee' => 'required|numeric|min:0|max:1000000', // Numeric validation for shipping fee
            'site_logo' => [
                'nullable', // Allows the field to be empty or not present
                // Conditionally apply rules based on whether a file is present or a string 'REMOVE_LOGO' is sent
                Rule::when($request->hasFile('site_logo'), [
                    FileRule::image()->max(2048), // Correct usage of aliased FileRule
                ]),
                Rule::when($request->input('site_logo') === 'REMOVE_LOGO', [
                    Rule::in(['REMOVE_LOGO']), // Ensures it's explicitly the 'REMOVE_LOGO' string
                ]),
            ],
        ];

        // Custom error messages for clarity
        $messages = [
            'site_logo.image' => 'The site logo must be an image (jpeg, png, bmp, gif, svg, webp).',
            'site_logo.max' => 'The site logo may not be greater than 2MB.',
            'facebook_url.url' => 'The Facebook URL must be a valid URL.',
            'twitter_url.url' => 'The Twitter URL must be a valid URL.',
            'instagram_url.url' => 'The Instagram URL must be a valid URL.',
            'shipping_fee.required' => 'The shipping fee is required.',
            'shipping_fee.numeric' => 'The shipping fee must be a number.',
            'shipping_fee.min' => 'The shipping fee must be at least 0.',
            'shipping_fee.max' => 'The shipping fee cannot exceed 1,000,000.',
        ];

        $validator = Validator::make($request->all(), $rules, $messages);

        if ($validator->fails()) {
            return response()->json([
                'status' => 422,
                'message' => 'Validation failed. Please correct the errors.',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $validatedData = $validator->validated();
            $newLogoPath = null; // To store the path of the new logo if uploaded
            
            // Get current logo path from settings table
            $oldLogoPath = Setting::where('key', 'site_logo_path')->value('value'); 

            // Handle site_logo upload or removal
            if ($request->hasFile('site_logo')) {
                // A new file was uploaded, delete old one if it exists
                if ($oldLogoPath && File::exists(public_path($oldLogoPath))) {
                    File::delete(public_path($oldLogoPath)); // Use File facade with public_path()
                    Log::info('Old logo deleted: ' . public_path($oldLogoPath));
                }
                
                $logo = $request->file('site_logo');
                $fileName = time() . '.' . $logo->getClientOriginalExtension();
                $destinationPath = '/uploads/settings'; // Directory within public/
                $logo->move(public_path($destinationPath), $fileName); // Move to public directory
                $newLogoPath = $destinationPath . "/" . $fileName; // Store the relative path in DB

                Log::info('New logo uploaded: ' . $newLogoPath);
            } elseif ($request->input('site_logo') === 'REMOVE_LOGO') {
                // Signal to remove the current logo
                if ($oldLogoPath && File::exists(public_path($oldLogoPath))) {
                    File::delete(public_path($oldLogoPath)); // Use File facade with public_path()
                    Log::info('Existing logo removed via REMOVE_LOGO signal: ' . public_path($oldLogoPath));
                }
                $newLogoPath = ''; // Set path to empty to indicate no logo
            } else {
                // No new logo uploaded and not signaled for removal, retain old path
                $newLogoPath = $oldLogoPath;
            }

            // Prepare settings for bulk update/creation
            $settingsToUpdate = [
                'site_name' => $validatedData['site_name'],
                'site_email' => $validatedData['site_email'],
                'site_phone' => $validatedData['site_phone'],
                'site_address' => $validatedData['site_address'],
                'facebook_url' => $validatedData['facebook_url'],
                'twitter_url' => $validatedData['twitter_url'],
                'instagram_url' => $validatedData['instagram_url'],
                'site_logo_path' => $newLogoPath, // Store the determined logo path
                'shipping_fee' => $validatedData['shipping_fee'], // Shipping Fee
            ];

            // Update or create each setting
            foreach ($settingsToUpdate as $key => $value) {
                Setting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $value]
                );
            }

            return response()->json([
                'status' => 200,
                'message' => 'Settings updated successfully!',
                'new_logo_path' => $newLogoPath // Return new logo path if applicable for frontend update
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating settings: ' . $e->getMessage(), ['exception' => $e, 'request_data' => $request->all()]);
            return response()->json([
                'status' => 500,
                'message' => 'Failed to save settings. An internal server error occurred.'
            ], 500);
        }
    }
}
