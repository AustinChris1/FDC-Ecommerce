<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product; // Assuming you have a Product model
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth; // To get authenticated user ID
use Illuminate\Support\Facades\Log; // For logging errors
use Symfony\Component\HttpFoundation\Response; // For correct HTTP responses
use Illuminate\Support\Str; // Import Str for order number generation
use Telegram\Bot\Laravel\Facades\Telegram;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail; // Import the Mail facade
use App\Mail\OrderStatusNotification;


class OrderController extends Controller
{
    public function placeOrder(Request $request)
    {
        // Determine if this is a POS sale based on the 'is_pos' flag from the frontend
        $isPosSale = boolval($request->input('is_pos'));

        // 1. Define validation rules based on whether it's a POS sale or an online order
        $rules = [
            'items' => 'required|array',
            // For items, the frontend now sends 'id' as product_id and 'qty' as quantity
            'items.*.id' => 'required|integer|exists:products,id', // Matches frontend 'item.id'
            'items.*.name' => 'required|string|max:255', // Added for item_json
            'items.*.qty' => 'required|integer|min:1',    // Matches frontend 'item.qty'
            'items.*.price' => 'required|numeric|min:0', // Matches frontend 'item.selling_price'

            'grand_total' => 'required|numeric|min:0',
            'payment_method' => 'required|string', // General rule, refined below
        ];

        // Add rules specific to POS or Online
        if ($isPosSale) {
            // POS-specific validations
            $rules['customer_name'] = 'nullable|string|max:255';
            $rules['customer_email'] = 'nullable|email|max:255';
            $rules['customer_phone'] = 'nullable|string|max:20';
            // Ensure discount_amount and amount_paid are validated as numeric
            $rules['discount_amount'] = 'nullable|numeric|min:0'; // Discount is always applicable now for POS
            $rules['amount_paid'] = 'nullable|numeric|min:0';      // For cash payments in POS
            $rules['payment_method'] = 'required|string|in:cash,card_pos,bank_transfer'; // Strict POS payment methods
        } else {
            // Online-specific validations
            $rules['user_info.fullName'] = 'required|string|max:255';
            $rules['user_info.email'] = 'required|email|max:255';
            $rules['user_info.phone'] = 'required|string|max:20';
            $rules['shipping_address.address1'] = 'required|string|max:255';
            $rules['shipping_address.address2'] = 'nullable|string|max:255';
            $rules['shipping_address.city'] = 'required|string|max:255';
            $rules['shipping_address.state'] = 'required|string|max:255';
            $rules['shipping_address.zipCode'] = 'required|string|max:20';
            $rules['grand_total'] = 'required|numeric|min:0'; // Subtotal for online orders
            $rules['shipping_cost'] = 'required|numeric|min:0';
            $rules['payment_method'] = 'required|string|in:paystack,bank_transfer,credit_card,cash_on_delivery'; // Strict online payment methods
            $rules['paystack_reference'] = 'nullable|string|max:255'; // Frontend no longer sends this initially, backend might generate/assign later
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            Log::warning('Order Validation Failed:', $validator->errors()->toArray());
            return response()->json([
                'status' => 400,
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            Log::info('Order Data Received (Full Request):', $request->all());
            $user = Auth::user(); // Get the authenticated user (could be null for POS if not logged in)

            // Calculate subtotal - ensure all values are treated as floats
            $grandTotal = floatval($request->grand_total);
            $discountAmount = floatval($request->input('discount_amount', 0));
            $subtotal = $isPosSale ? ($grandTotal + $discountAmount) : $grandTotal;

            // Generate a unique order number
            $orderNumber = 'FDC-' . date('YmdHis') . Str::random(4);

            // Determine initial order status
            $status = 'pending'; // Default status
            $paystackReference = null; // Default to null, set if Paystack is used

            $amountPaid = floatval($request->input('amount_paid', 0.00));


            if ($isPosSale) {
                // POS-specific status logic
                if ($request->payment_method === 'cash' || $request->payment_method === 'card_pos') {
                    $status = 'completed'; // Direct completion for cash/card POS
                } elseif ($request->payment_method === 'bank_transfer') {
                    $status = 'pending_confirmation'; // For POS bank transfers
                }
            } else {
                // Online order specific status logic
                if ($request->payment_method === 'paystack') {
                    $status = 'processing_paystack_payment';
                    // If paystack_reference is sent from frontend, use that, otherwise default to orderNumber
                    $paystackReference = $request->input('paystack_reference', $orderNumber);
                } elseif ($request->payment_method === 'bank_transfer') {
                    $status = 'processing_bank_transfer_payment';
                } elseif ($request->payment_method === 'cash_on_delivery') {
                    $status = 'completed';
                } elseif ($request->payment_method === 'credit_card') {
                    $status = 'processing_mock_payment';
                }
            }

            // Prepare data for Order creation
            $orderData = [
                'order_number' => $orderNumber, // Use the server-generated order number
                'user_id' => $user ? $user->id : null,
                'full_name' => $isPosSale ? ($request->customer_name ?? 'Walk-in Customer') : $request->input('user_info.fullName'),
                'email' => $isPosSale ? $request->customer_email : $request->input('user_info.email'),
                'phone' => $isPosSale ? $request->customer_phone : $request->input('user_info.phone'),
                'shipping_address1' => $isPosSale ? null : $request->input('shipping_address.address1'),
                'shipping_address2' => $isPosSale ? null : $request->input('shipping_address.address2'),
                'city' => $isPosSale ? null : $request->input('shipping_address.city'),
                'state' => $isPosSale ? null : $request->input('shipping_address.state'),
                'zip_code' => $isPosSale ? null : $request->input('shipping_address.zipCode'),
                'subtotal' => $subtotal, // Correctly calculated based on POS or online
                'shipping_cost' => $isPosSale ? 0.00 : floatval($request->input('shipping_cost', 0.00)), // Ensure float conversion and default
                'discount_amount' => $discountAmount, // Correctly retrieved and converted to float
                'grand_total' => $grandTotal, // Correctly retrieved and converted to float
                'payment_method' => $request->payment_method,
                'paystack_reference' => $paystackReference, // Use the server-determined reference
                'amount_paid' => $amountPaid, // Correctly retrieved and converted to float
                'status' => $status,
                'items_json' => json_encode($request->items), // Store items as JSON string
                'is_pos_sale' => $isPosSale, // Correctly determined boolean (will be 0 or 1 in DB)
            ];

            Log::debug('Order Data for Eloquent Create:', $orderData);

            // 2. Create the Order record
            $order = Order::create($orderData);

            // 3. Reduce quantity of products
            foreach ($request->items as $item) {
                // Ensure correct key names for product data ('id' and 'qty' from frontend)
                $product = Product::find($item['id']);

                if (!$product) {
                    throw new \Exception("Product with ID {$item['id']} not found.");
                }

                // Check if enough stock is available
                if ($product->qty < $item['qty']) {
                    throw new \Exception("Not enough stock for product '{$product->name}'. Available: {$product->qty}, Requested: {$item['qty']}.");
                }

                // Reduce the product qty
                $product->qty -= $item['qty'];
                $product->save();
            }

            // Return the server-generated order_number and Paystack reference
            return response()->json([
                'status' => 200,
                'message' => 'Order initiated successfully!',
                'order_number' => $order->order_number, // The server-generated unique order number
                'paystack_reference' => $order->paystack_reference, // The server-generated Paystack reference
            ], 200);

        } catch (\Exception $e) {
            Log::error('Order creation failed: ' . $e->getMessage(), ['trace' => $e->getTraceAsString(), 'request_data' => $request->all()]);
            return response()->json([
                'status' => 500,
                'message' => $e->getMessage() ?: 'An error occurred while processing your order. Please try again.',
            ], 500);
        }
    }
    // Update payment status
public function updateStatus($identifier, Request $request)
{
    // 1. Validate incoming request data
    $validator = Validator::make($request->all(), [
        'status' => 'required|string|max:255',
        'payment_method' => 'nullable|string|max:255',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'status' => 400,
            'message' => 'Validation Error',
            'errors' => $validator->errors()
        ], 400);
    }

    try {
        // Find the order by order_number OR paystack_reference
        $order = Order::where('order_number', $identifier)
                      ->orWhere('paystack_reference', $identifier)
                      ->first();

        if (!$order) {
            return response()->json([
                'status' => 404,
                'message' => 'Order not found.'
            ], 404);
        }

        $oldStatus = $order->status; // Store old status
        $newStatus = $request->input('status'); // Get the new status from request

        // Assign the new status
        $order->status = $newStatus;

        // Optional: update payment_method
        if ($request->filled('payment_method')) {
            $order->payment_method = $request->input('payment_method');
        }

        $order->save();

        $newStatusLower = strtolower($newStatus);
        $oldStatusLower = strtolower($oldStatus);

        // Send email notification to customer
        // Only send if the status has actually changed to 'completed' or 'pending_confirmation'
        if (($newStatusLower === 'completed' || $newStatusLower === 'pending_confirmation') && $newStatusLower !== $oldStatusLower) {
            // Ensure the order has an email directly, or retrieve from a related user if applicable
            // Based on your previous log, $order->email seems to be available and working for sending.
            if ($order->email) {
                try {
                    Mail::to($order->email)->send(new OrderStatusNotification($order));
                    Log::info("Order status email sent to {$order->email} for order {$order->order_number}. New status: {$order->status}");
                } catch (\Exception $mailException) {
                    Log::error("Failed to send order status email for order {$order->order_number} to {$order->email}: " . $mailException->getMessage());
                    // Email failure won't stop the main response.
                }
            } else {
                Log::warning("Could not send order status email for order {$order->order_number}: Order email not found.");
            }
        }

        // Send Telegram notification to admin (isolated in its own try-catch)
        // This ensures Telegram failure doesn't affect the main API response
        if ($newStatusLower === 'completed' || $newStatusLower === 'pending_confirmation') {
            try {
                $this->sendTelegramNotificationToAdmin($order);
                Log::info("Telegram notification sent for order {$order->order_number}. Status: {$order->status}");
            } catch (\Exception $telegramException) {
                Log::error("Failed to send Telegram notification for order {$order->order_number}: " . $telegramException->getMessage());
                // Telegram failure won't stop the main response, only logs an error.
            }
        }


        // Always return a 200 OK response if the order update and email dispatch were successful,
        // even if the Telegram notification failed.
        return response()->json([
            'status' => 200,
            'message' => "Order {$order->order_number} status updated to '{$order->status}' successfully.",
            'order' => $order,
        ], 200);

    } catch (\Exception $e) {
        // This catch block will now only be hit if something fails before or during
        // order saving or email sending (if email sending itself throws an unhandled error).
        Log::error('An unhandled error occurred in updateStatus: ' . $e->getMessage());
        return response()->json([
            'status' => 500,
            'message' => $e->getMessage() ?: 'An unexpected error occurred while updating the order status.',
        ], 500);
    }
}

// 🔔 Telegram Notification Sender (can also move this to a service class later)
protected function sendTelegramNotificationToAdmin($order)
{
    $botToken = env('TELEGRAM_BOT_TOKEN'); // Add this to your .env
    $chatId = env('TELEGRAM_ADMIN_CHAT_ID'); // Add this to your .env

    $message = "✅ *New Completed Order*\n"
             . "*Order No:* {$order->order_number}\n"
             . "*Name:* {$order->full_name}\n"
             . "*Email:* {$order->email}\n"
             . "*Phone:* {$order->phone}\n"
             . "*Total:* ₦" . number_format($order->grand_total, 2) . "\n"
             . "*Payment:* {$order->payment_method}\n"
             . "*Status:* {$order->status}\n"
             ."🔗 [View Order in Admin Panel](" . url("https://spx.firstdigit.com.ng/admin/orders/view/{$order->order_number}") . ")";

    Http::post("https://api.telegram.org/bot{$botToken}/sendMessage", [
        'chat_id' => $chatId,
        'text' => $message,
        'parse_mode' => 'Markdown',
        'disable_web_page_preview' => true,

    ]);
}

public function updateOrder($orderNumber, Request $request)
{
    // 1. Find the order
    $order = Order::where('order_number', $orderNumber)->first();

    if (!$order) {
        return response()->json([
            'status' => 404,
            'message' => 'Order not found.'
        ], 404);
    }

    // 2. Define validation rules based on how data is stored in the database
    $rules = [
        'user_info.fullName' => 'required|string|max:255',
        'user_info.email' => 'required|email|max:255',
        'user_info.phone' => 'required|string|max:20',
        'shipping_address.address1' => 'required|string|max:255',
        'shipping_address.address2' => 'nullable|string|max:255',
        'shipping_address.city' => 'required|string|max:255',
        'shipping_address.state' => 'required|string|max:255',
        'shipping_address.zipCode' => 'required|string|max:20',
        'items' => 'required|array|min:1',
        'items.*.id' => 'required|integer|exists:products,id',
        'items.*.name' => 'required|string',
        'items.*.qty' => 'required|integer|min:1',
        'items.*.price' => 'required|numeric|min:0',
        'grand_total' => 'required|numeric|min:0',
        'shipping_cost' => 'required|numeric|min:0',
        'grand_total' => 'required|numeric|min:0',
        'payment_method' => 'required|string|in:paystack,bank_transfer,credit_card,cash_on_delivery', // Align with placeOrder's online methods
    ];

    $validator = Validator::make($request->all(), $rules);

    if ($validator->fails()) {
        Log::warning('Order Update Validation Failed:', $validator->errors()->toArray());
        return response()->json([
            'status' => 400,
            'message' => 'Validation Error',
            'errors' => $validator->errors()
        ], 400);
    }

    // 3. Check if order status allows updates
    $unmodifiableStatuses = ['completed', 'shipped', 'cancelled'];
    if (in_array($order->status, $unmodifiableStatuses)) {
        return response()->json([
            'status' => 403,
            'message' => "Order with status '{$order->status}' cannot be modified."
        ], 403);
    }

    try {
        $oldPaymentMethod = $order->payment_method;

        // 4. Update individual order details to match database columns
        // Customer Info
        $order->full_name = $request->input('user_info.fullName');
        $order->email = $request->input('user_info.email');
        $order->phone = $request->input('user_info.phone');

        // Shipping Address
        $order->shipping_address1 = $request->input('shipping_address.address1');
        $order->shipping_address2 = $request->input('shipping_address.address2');
        $order->city = $request->input('shipping_address.city');
        $order->state = $request->input('shipping_address.state');
        $order->zip_code = $request->input('shipping_address.zipCode');

        // Order Totals and Method
        $order->items_json = json_encode($request->input('items')); // Store items as JSON string
        $order->grand_total = $request->input('grand_total');
        $order->shipping_cost = $request->input('shipping_cost');
        $order->grand_total = $request->input('grand_total');
        $order->payment_method = $request->input('payment_method');
        $order->created_at = now(); // Update timestamp to now, or keep original if you want to preserve it

        // Handle Paystack reference if payment method changes
        if ($oldPaymentMethod === 'paystack' && $request->input('payment_method') === 'bank_transfer') {
            $order->paystack_reference = null; // Clear if switching from Paystack to bank transfer
        } elseif ($oldPaymentMethod === 'bank_transfer' && $request->input('payment_method') === 'paystack') {
            // If switching from bank transfer to Paystack, re-use existing order number as reference
            // or generate a new one if you need unique references for each Paystack attempt
            $order->paystack_reference = $order->order_number; // Or generate a new one if necessary
        }

        $order->save();

        return response()->json([
            'status' => 200,
            'message' => 'Order updated successfully.',
            'order_number' => $order->order_number,
            'paystack_reference' => $order->paystack_reference,
        ], 200);

    } catch (\Exception $e) {
        Log::error("Order Update Error for {$orderNumber}: " . $e->getMessage() . " on line " . $e->getLine() . " in " . $e->getFile());
        return response()->json([
            'status' => 500,
            'message' => 'An error occurred while updating the order.',
        ], 500);
    }
}
    //Add paystack webhook endpoint
    public function handleWebhook(Request $request)
    {
        // 1. Verify the Paystack Signature
        // Get the secret key from your environment variables
        $secretKey = env('PAYSTACK_SECRET_KEY');

        // Paystack sends the signature in the 'x-paystack-signature' header
        $paystackSignature = $request->header('x-paystack-signature');

        // Calculate HMAC SHA512 hash of the request body with the secret key
        $input = $request->getContent(); // Get the raw request body
        $expectedSignature = hash_hmac('sha512', $input, $secretKey);

        if ($paystackSignature !== $expectedSignature) {
            Log::warning('Paystack Webhook: Invalid signature', ['received_signature' => $paystackSignature]);
            // Respond with 400 Bad Request if signature is invalid
            return response()->json(['message' => 'Invalid signature'], Response::HTTP_BAD_REQUEST);
        }

        // 2. Process the event
        $event = json_decode($input, true); // Decode the raw JSON input

        // Log the event for debugging (remove or restrict in production)
        Log::info('Paystack Webhook Received:', $event);

        // Check the event type
        switch ($event['event']) {
            case 'charge.success':
                // Payment was successful
                $data = $event['data'];
                $reference = $data['reference']; // This is your paystack_reference
                $amount = $data['amount'] / 100; // Amount in Naira (Paystack returns in kobo)
                $status = $data['status']; // Should be 'success'
                $currency = $data['currency']; // Should be 'NGN'

                // Extract any metadata you sent (e.g., your internal order number)
                $appOrderNumber = $data['metadata']['app_order_number'] ?? null;

                // 3. Find the corresponding order in your database
                // It's best to look up by `paystack_reference` first
                // or `order_number` if you reliably passed it in metadata.
                $order = Order::where('paystack_reference', $reference)->first();

                // If not found by reference, try by app_order_number if available (less reliable as primary key)
                if (!$order && $appOrderNumber) {
                    $order = Order::where('order_number', $appOrderNumber)->first();
                }

                if ($order) {
                    // Check if the order is already marked as completed to ensure idempotency
                    if ($order->status === 'completed' || $order->status === 'fulfilled') {
                        Log::info("Paystack Webhook: Order {$order->order_number} (Ref: {$reference}) already completed. Event ignored.");
                        return response()->json(['message' => 'Order already completed'], Response::HTTP_OK);
                    }

                    // Perform additional checks (e.g., verify amount)
                    if ($order->grand_total != $amount || $currency !== 'NGN') {
                        Log::error("Paystack Webhook: Amount or currency mismatch for order {$order->order_number} (Ref: {$reference}). Expected {$order->grand_total} NGN, Got {$amount} {$currency}.");
                        // You might want to flag this order for manual review
                        $order->status = 'payment_mismatch_error'; // Custom status for review
                        $order->save();
                        return response()->json(['message' => 'Amount or currency mismatch'], Response::HTTP_BAD_REQUEST);
                    }

                    // Update order status to 'completed' or 'processing'
                    $order->status = 'completed'; // Or 'processing' if you have further fulfillment steps
                    $order->status = 'paid'; // Add a status column if you want more granular control
                    $order->save();

                    Log::info("Paystack Webhook: Order {$order->order_number} (Ref: {$reference}) successfully updated to 'completed'.");

                } else {
                    Log::error("Paystack Webhook: Order not found for reference: {$reference} and app_order_number: {$appOrderNumber}.");
                    // Important: If an order isn't found, it might indicate an issue.
                    // You might want to create a new order here if it's a first-time receipt
                    // or queue it for manual investigation.
                    // For now, respond with OK to prevent Paystack from retrying.
                }
                break;

            case 'charge.failed':
                // Payment failed
                $data = $event['data'];
                $reference = $data['reference'];
                $order = Order::where('paystack_reference', $reference)->first();
                if ($order) {
                    $order->status = 'failed_payment';
                    $order->save();
                    Log::info("Paystack Webhook: Order {$order->order_number} (Ref: {$reference}) updated to 'failed_payment'.");
                } else {
                    Log::warning("Paystack Webhook: Failed charge for unknown order reference: {$reference}.");
                }
                break;

            // Add other event types you want to handle (e.g., 'transfer.success', 'refund.success')
            default:
                Log::info("Paystack Webhook: Unhandled event type '{$event['event']}' received.");
                break;
        }

        // Respond with 200 OK to acknowledge receipt of the webhook
        // This is crucial, otherwise Paystack will keep retrying.
        return response()->json(['message' => 'Webhook received'], Response::HTTP_OK);
    }
    
    public function viewOrders()
    {
        try {
            $orders = Order::orderBy('created_at', 'desc')->get(); // Fetch all orders for frontend filtering/pagination


            if ($orders->isEmpty()) {
                return response()->json([
                    'status' => 200,
                    'message' => 'No orders found.',
                    'orders' => []
                ]);
            }

            return response()->json([
                'status' => 200,
                'orders' => $orders
            ]);

        } catch (\Exception $e) {
            // Log the error for debugging purposes
            Log::error("Error fetching orders: " . $e->getMessage());

            return response()->json([
                'status' => 500,
                'message' => 'Failed to retrieve orders.',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function viewOrderDetails($order_number)
    {
        try {
            // Find the order by order_number
            // You might want to eager load relationships if you need them (e.g., user who placed it)
            $order = Order::where('order_number', $order_number)->first();

            if (!$order) {
                return response()->json([
                    'status' => 404,
                    'message' => 'Order not found.'
                ], 404);
            }

            return response()->json([
                'status' => 200,
                'order' => $order
            ], 200);

        } catch (\Exception $e) {
            // Log the error for debugging purposes
            Log::error("Error fetching order details for order_number: {$order_number}. Error: " . $e->getMessage());

            return response()->json([
                'status' => 500,
                'message' => 'Failed to retrieve order details.',
                'error' => $e->getMessage()
            ], 500);
        }
    }


}
