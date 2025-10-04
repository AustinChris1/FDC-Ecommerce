<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Setting; // Import the Setting model
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File as FileRule;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon; // Import Carbon for timestamps

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
                'bank_name' => $settings['bank_name'] ?? '',
                'acct_name' => $settings['acct_name'] ?? '',
                'acct_no' => $settings['acct_no'] ?? '',
                'facebook_url' => $settings['facebook_url'] ?? '',
                'twitter_url' => $settings['twitter_url'] ?? '',
                'instagram_url' => $settings['instagram_url'] ?? '',
                'site_logo_path' => $settings['site_logo_path'] ?? '',
                'shipping_fee' => $settings['shipping_fee'] ?? 0,
                // NEW: Notification settings
                'site_notification_message' => $settings['site_notification_message'] ?? '',
                'site_notification_active' => filter_var($settings['site_notification_active'] ?? false, FILTER_VALIDATE_BOOLEAN), // Convert to boolean
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
            'bank_name' => 'nullable|string|max:500',
            'acct_name' => 'nullable|string|max:500',
            'acct_no' => 'nullable|string|max:50',
            'facebook_url' => 'nullable|url|max:255',
            'twitter_url' => 'nullable|url|max:255',
            'instagram_url' => 'nullable|url|max:255',
            'shipping_fee' => 'required|numeric|min:0|max:1000000',
            'site_logo' => [
                'nullable',
                Rule::when($request->hasFile('site_logo'), [
                    FileRule::image()->max(2048),
                ]),
                Rule::when($request->input('site_logo') === 'REMOVE_LOGO', [
                    Rule::in(['REMOVE_LOGO']),
                ]),
            ],
            // NEW: Notification settings validation
            'site_notification_message' => 'nullable|string|max:1000',
            'site_notification_active' => 'required|boolean', // Expects true/false or 0/1
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
            'site_notification_active.required' => 'The notification active status is required.',
            'site_notification_active.boolean' => 'The notification active status must be true or false.',
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
            $newLogoPath = null;
            
            $oldLogoPath = Setting::where('key', 'site_logo_path')->value('value'); 

            // Handle site_logo upload or removal
            if ($request->hasFile('site_logo')) {
                if ($oldLogoPath && File::exists(public_path($oldLogoPath))) {
                    File::delete(public_path($oldLogoPath));
                    Log::info('Old logo deleted: ' . public_path($oldLogoPath));
                }
                
                $logo = $request->file('site_logo');
                $fileName = time() . '.' . $logo->getClientOriginalExtension();
                $destinationPath = '/uploads/settings';
                $logo->move(public_path($destinationPath), $fileName);
                $newLogoPath = $destinationPath . "/" . $fileName;

                Log::info('New logo uploaded: ' . $newLogoPath);
            } elseif ($request->input('site_logo') === 'REMOVE_LOGO') {
                if ($oldLogoPath && File::exists(public_path($oldLogoPath))) {
                    File::delete(public_path($oldLogoPath));
                    Log::info('Existing logo removed via REMOVE_LOGO signal: ' . public_path($oldLogoPath));
                }
                $newLogoPath = '';
            } else {
                $newLogoPath = $oldLogoPath;
            }

            // Prepare settings for bulk update/creation
            $settingsToUpdate = [
                'site_name' => $validatedData['site_name'],
                'site_email' => $validatedData['site_email'],
                'site_phone' => $validatedData['site_phone'],
                'site_address' => $validatedData['site_address'],
                'bank_name' => $validatedData['bank_name'],
                'acct_name' => $validatedData['acct_name'],
                'acct_no' => $validatedData['acct_no'],
                'facebook_url' => $validatedData['facebook_url'],
                'twitter_url' => $validatedData['twitter_url'],
                'instagram_url' => $validatedData['instagram_url'],
                'site_logo_path' => $newLogoPath,
                'shipping_fee' => $validatedData['shipping_fee'],
                // NEW: Notification settings
                'site_notification_message' => $validatedData['site_notification_message'] ?? '', // Use ?? '' for nullable
                'site_notification_active' => $validatedData['site_notification_active'], // Boolean value (true/false)
            ];

            // Update or create each setting
            foreach ($settingsToUpdate as $key => $value) {
                // Ensure boolean values are stored as '1' or '0' in the database if your 'value' column is string
                $dbValue = is_bool($value) ? ($value ? '1' : '0') : $value;
                Setting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $dbValue]
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