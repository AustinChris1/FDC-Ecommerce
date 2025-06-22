<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\ContactUsMail;
use App\Models\ContactMessage; // Ensure the model is imported
use Illuminate\Support\Facades\Log;

class ContactMessageController extends Controller
{
    public function store(Request $request)
    {
        // Validate the request data
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'subject' => 'required|string',
            'message' => 'required|string',
        ]);

        // Store the contact message in the database
        // Ensure `ContactMessage` model exists and is properly configured
        $contactMessage = ContactMessage::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'subject' => $validated['subject'],
            'message' => $validated['message'],
        ]);

        // Send an email with the contact details
        Mail::to('help@firstdigit.com.ng')->send(new ContactUsMail($validated));

        // Return a successful response
        return response()->json([
            'status' => 200,
            'message' => 'Thank you for contacting us!',
            'data' => $contactMessage,
        ], 200); // Use 200 for created resources
    }
}
