<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\Location; // Import Location model
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Str;
use Telegram\Bot\Laravel\Facades\Telegram;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderStatusNotification;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    public function placeOrder(Request $request)
    {
        $isPosSale = boolval($request->input('is_pos'));

        // 1. Define validation rules based on whether it's a POS sale or an online order
        $rules = [
            'items' => 'required|array',
            'items.*.id' => 'required|integer|exists:products,id',
            'items.*.name' => 'required|string|max:255',
            'items.*.qty' => 'required|integer|min:1', // This is the quantity being ordered
            'items.*.price' => 'required|numeric|min:0',

            'grand_total' => 'required|numeric|min:0',
            'payment_method' => 'required|string',
        ];

        if ($isPosSale) {
            // POS-specific validations
            $rules['customer_name'] = 'nullable|string|max:255';
            $rules['customer_email'] = 'nullable|email|max:255';
            $rules['customer_phone'] = 'nullable|string|max:20';
            $rules['discount_amount'] = 'nullable|numeric|min:0';
            $rules['amount_paid'] = 'nullable|numeric|min:0';
            $rules['payment_method'] = 'required|string|in:cash,card_pos,bank_transfer';
            $rules['location_id'] = 'required|integer|exists:locations,id'; // NEW: Location ID for POS sales
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
            $rules['shipping_cost'] = 'required|numeric|min:0';
            $rules['payment_method'] = 'required|string|in:paystack,bank_transfer,credit_card,cash_on_delivery';
            $rules['paystack_reference'] = 'nullable|string|max:255';
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

        DB::beginTransaction(); // Start database transaction
        try {
            Log::info('Order Data Received (Full Request):', $request->all());
            $user = Auth::user();

            $grandTotal = floatval($request->grand_total);
            $discountAmount = floatval($request->input('discount_amount', 0));
            $subtotal = $isPosSale ? ($grandTotal + $discountAmount) : $grandTotal;

            $orderNumber = 'FDC-' . date('YmdHis') . Str::random(4);

            $status = 'pending';
            $paystackReference = null;
            $amountPaid = floatval($request->input('amount_paid', 0.00));
            $locationId = $isPosSale ? $request->input('location_id') : null; // Get location_id for POS sales

            if ($isPosSale) {
                if ($request->payment_method === 'cash' || $request->payment_method === 'card_pos') {
                    $status = 'completed';
                } elseif ($request->payment_method === 'bank_transfer') {
                    $status = 'pending_confirmation';
                }
            } else {
                if ($request->payment_method === 'paystack') {
                    $status = 'processing_paystack_payment';
                    $paystackReference = $request->input('paystack_reference', $orderNumber);
                } elseif ($request->payment_method === 'bank_transfer') {
                    $status = 'processing_bank_transfer_payment';
                } elseif ($request->payment_method === 'cash_on_delivery') {
                    $status = 'completed';
                } elseif ($request->payment_method === 'credit_card') {
                    $status = 'processing_mock_payment';
                }
            }

            $orderData = [
                'order_number' => $orderNumber,
                'user_id' => $user ? $user->id : null,
                'full_name' => $isPosSale ? ($request->customer_name ?? 'Walk-in Customer') : $request->input('user_info.fullName'),
                'email' => $isPosSale ? $request->customer_email : $request->input('user_info.email'),
                'phone' => $isPosSale ? $request->customer_phone : $request->input('user_info.phone'),
                'shipping_address1' => $isPosSale ? null : $request->input('shipping_address.address1'),
                'shipping_address2' => $isPosSale ? null : $request->input('shipping_address.address2'),
                'city' => $isPosSale ? null : $request->input('shipping_address.city'),
                'state' => $isPosSale ? null : $request->input('shipping_address.state'),
                'zip_code' => $isPosSale ? null : $request->input('shipping_address.zipCode'),
                'subtotal' => $subtotal,
                'shipping_cost' => $isPosSale ? 0.00 : floatval($request->input('shipping_cost', 0.00)),
                'discount_amount' => $discountAmount,
                'grand_total' => $grandTotal,
                'payment_method' => $request->payment_method,
                'paystack_reference' => $paystackReference,
                'amount_paid' => $amountPaid,
                'status' => $status,
                'items_json' => json_encode($request->items),
                'is_pos_sale' => $isPosSale,
                'location_id' => $locationId, // Store the location_id for POS sales
            ];

            Log::debug('Order Data for Eloquent Create:', $orderData);

            // 2. Create the Order record
            $order = Order::create($orderData);

            // Eager load the location relationship for the newly created order
            // This ensures the 'location' data is available when the order is returned to the frontend
            $order->load('location');

            // 3. Reduce quantity of products based on sale type
            foreach ($request->items as $item) {
                // Use lockForUpdate to prevent race conditions during inventory updates
                // Eager load locations to use the accessor for total_overall_quantity
                $product = Product::with('locations')->lockForUpdate()->find($item['id']);

                if (!$product) {
                    throw new \Exception("Product with ID {$item['id']} not found.");
                }

                $quantityRequested = $item['qty'];

                if ($isPosSale) {
                    // POS Sale: ONLY reduce from specific location's quantity_in_store
                    $productLocation = $product->locations()->where('location_id', $locationId)->first();

                    // Validate stock at specific location
                    if (!$productLocation || $productLocation->pivot->quantity_in_store < $quantityRequested) {
                        throw new \Exception("Insufficient stock at store for product '{$product->name}'. Available at store: " . ($productLocation->pivot->quantity_in_store ?? 0) . ", Requested: {$quantityRequested}.");
                    }

                    // Decrement stock at specific location
                    $product->locations()->updateExistingPivot($locationId, [
                        'quantity_in_store' => $productLocation->pivot->quantity_in_store - $quantityRequested
                    ]);

                    // IMPORTANT: For POS sales, we DO NOT touch the product->qty (online/master stock).
                    // This ensures POS sales are separate from online inventory.

                } else {
                    // Online Sale: Only reduce from product.qty (online stock)
                    if ($product->qty < $quantityRequested) {
                        throw new \Exception("Not enough online stock for product '{$product->name}'. Available: {$product->qty}, Requested: {$quantityRequested}.");
                    }
                    $product->decrement('qty', $quantityRequested); // Use decrement for atomic update
                }
            }

            DB::commit(); // Commit the transaction

            // Return the server-generated order_number and Paystack reference
            // IMPORTANT: Return the full order object so the frontend has all details for the receipt
            return response()->json([
                'status' => 200,
                'message' => 'Order initiated successfully!',
                'order_number' => $order->order_number,
                'paystack_reference' => $order->paystack_reference,
                'order' => $order // <--- THIS IS THE CRUCIAL ADDITION
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack(); // Rollback on error
            Log::error('Order creation failed: ' . $e->getMessage(), ['trace' => $e->getTraceAsString(), 'request_data' => $request->all()]);
            return response()->json([
                'status' => 500,
                'message' => $e->getMessage() ?: 'An error occurred while processing your order. Please try again.',
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
            . "*Status:* {$order->status}\n";

        // Add POS sale and location info if applicable
        if ($order->is_pos_sale) {
            $message .= "*Sale Type:* POS Sale\n";
            if ($order->location) {
                $message .= "*Location:* {$order->location->name}";
                if ($order->location->address) {
                    $message .= " ({$order->location->address})\n";
                } else {
                    $message .= "\n";
                }
            }
        } else {
            $message .= "*Sale Type:* Online Order\n";
        }

        $message .= "🔗 [View Order in Admin Panel](" . url("https://spx.firstdigit.com.ng/admin/orders/view/{$order->order_number}") . ")";

        Http::post("https://api.telegram.org/bot{$botToken}/sendMessage", [
            'chat_id' => $chatId,
            'text' => $message,
            'parse_mode' => 'Markdown',
            'disable_web_page_preview' => true,
        ]);
    }

    public function updateOrder($orderNumber, Request $request)
    {
        // 1. Find the order, eager load location
        $order = Order::where('order_number', $orderNumber)->with('location')->first();

        if (!$order) {
            return response()->json([
                'status' => 404,
                'message' => 'Order not found.'
            ], 404);
        }

        // 2. Define validation rules.
        // Adjust validation based on whether it's a POS sale or online order
        $rules = [
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|integer|exists:products,id',
            'items.*.name' => 'required|string',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'grand_total' => 'required|numeric|min:0',
            'payment_method' => 'required|string',
            'status' => 'required|string',
            'subtotal' => 'nullable|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'is_pos_sale' => 'boolean', // Allow updating is_pos_sale (though less common after creation)
            'location_id' => 'nullable|integer|exists:locations,id', // Allow updating location_id
        ];

        if ($request->input('is_pos_sale')) {
            $rules['full_name'] = 'nullable|string|max:255'; // For POS, customer_name maps to full_name
            $rules['email'] = 'nullable|email|max:255';
            $rules['phone'] = 'nullable|string|max:20';
            $rules['shipping_address1'] = 'nullable|string|max:255'; // Should be null for POS
            $rules['shipping_address2'] = 'nullable|string|max:255';
            $rules['city'] = 'nullable|string|max:255';
            $rules['state'] = 'nullable|string|max:255';
            $rules['zip_code'] = 'nullable|string|max:20';
            $rules['shipping_cost'] = 'nullable|numeric|min:0'; // Should be 0 for POS
        } else {
            // Online-specific fields
            $rules['full_name'] = 'required|string|max:255';
            $rules['email'] = 'required|email|max:255';
            $rules['phone'] = 'required|string|max:20';
            $rules['shipping_address1'] = 'required|string|max:255';
            $rules['shipping_address2'] = 'nullable|string|max:255';
            $rules['city'] = 'required|string|max:255';
            $rules['state'] = 'required|string|max:255';
            $rules['zip_code'] = 'required|string|max:20';
            $rules['shipping_cost'] = 'required|numeric|min:0';
        }

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
        $finalizedStatuses = ['completed', 'shipped', 'cancelled', 'payment_canceled', 'delivered', 'payment_failed'];
        if (in_array($order->status, $finalizedStatuses) && $request->input('status') !== $order->status) {
            return response()->json([
                'status' => 403,
                'message' => "Order with status '{$order->status}' cannot be modified by a user in checkout."
            ], 403);
        }

        DB::beginTransaction();
        try {
            $oldPaymentMethod = $order->payment_method;
            $oldStatus = $order->status; // Store old status to check for changes

            // Update individual order details to match database columns
            $order->full_name = $request->input('full_name');
            $order->email = $request->input('email');
            $order->phone = $request->input('phone');

            $order->shipping_address1 = $request->input('shipping_address1');
            $order->shipping_address2 = $request->input('shipping_address2');
            $order->city = $request->input('city');
            $order->state = $request->input('state');
            $order->zip_code = $request->input('zip_code');

            $order->items_json = json_encode($request->input('items'));
            $order->subtotal = $request->input('subtotal', $order->subtotal);
            $order->discount_amount = $request->input('discount_amount', $order->discount_amount ?? 0);
            $order->shipping_cost = $request->input('shipping_cost', $order->shipping_cost);
            $order->grand_total = $request->input('grand_total');
            $order->payment_method = $request->input('payment_method');
            $order->is_pos_sale = $request->input('is_pos_sale'); // Update is_pos_sale
            $order->location_id = $request->input('location_id'); // Update location_id

            // Handle Paystack reference if payment method changes
            if ($oldPaymentMethod === 'paystack' && $request->input('payment_method') === 'bank_transfer') {
                $order->paystack_reference = null; // Clear if switching from Paystack to bank transfer
            } elseif ($oldPaymentMethod === 'bank_transfer' && $request->input('payment_method') === 'paystack') {
                if (is_null($order->paystack_reference)) {
                    $order->paystack_reference = 'FDC-' . time() . '-' . rand(1000, 9999);
                }
            }

            $newStatus = $request->input('status');
            if ($newStatus !== $oldStatus) {
                $order->status = $newStatus; // Update the status

                switch ($newStatus) {
                    case 'shipped':
                        $order->shipped_at = $order->shipped_at ?? Carbon::now();
                        $order->out_for_delivery_at = null;
                        $order->delivered_at = null;
                        $order->cancelled_at = null;
                        break;
                    case 'pending_delivery':
                        $order->out_for_delivery_at = $order->out_for_delivery_at ?? Carbon::now();
                        $order->shipped_at = $order->shipped_at ?? Carbon::now();
                        $order->delivered_at = null;
                        $order->cancelled_at = null;
                        break;
                    case 'completed':
                        $order->delivered_at = $order->delivered_at ?? Carbon::now();
                        $order->shipped_at = $order->shipped_at ?? Carbon::now();
                        $order->out_for_delivery_at = $order->out_for_delivery_at ?? Carbon::now();
                        $order->cancelled_at = null;
                        break;
                    case 'cancelled':
                    case 'payment_canceled':
                    case 'payment_failed':
                        $order->cancelled_at = $order->cancelled_at ?? Carbon::now();
                        $order->shipped_at = null;
                        $order->out_for_delivery_at = null;
                        $order->delivered_at = null;
                        break;
                    case 'pending_payment':
                    case 'processing_paystack_payment':
                    case 'processing_bank_transfer_payment':
                    case 'pending_confirmation':
                    case 'processing':
                        $order->shipped_at = null;
                        $order->out_for_delivery_at = null;
                        $order->delivered_at = null;
                        $order->cancelled_at = null;
                        break;
                }
            }

            $order->save();
            DB::commit();

            $newStatusLower = strtolower($newStatus);
            $oldStatusLower = strtolower($oldStatus);

            // Send email notification to customer if status changed
            if (($newStatusLower === 'completed' || $newStatusLower === 'pending_confirmation' || $newStatusLower === 'shipped' || $newStatusLower === 'pending_delivery' || $newStatusLower === 'cancelled' || $newStatusLower === 'payment_canceled' || $newStatusLower === 'payment_failed' || $newStatusLower === 'processing') && $newStatusLower !== $oldStatusLower) {
                if ($order->email) {
                    try {
                        // Re-fetch order with location to ensure the Mailable has access to it
                        $order->load('location');
                        Mail::to($order->email)->send(new OrderStatusNotification($order));
                        Log::info("Order status email sent to {$order->email} for order {$order->order_number}. New status: {$order->status}");
                    } catch (\Exception $mailException) {
                        Log::error("Failed to send order status email for order {$order->order_number} to {$order->email}: " . $mailException->getMessage());
                    }
                } else {
                    Log::warning("Could not send order status email for order {$order->order_number}: Order email not found.");
                }
            }

            // Send Telegram notification to admin (isolated in its own try-catch)
            if (($newStatusLower === 'completed' || $newStatusLower === 'pending_confirmation' || $newStatusLower === 'shipped' || $newStatusLower === 'pending_delivery') && $newStatusLower !== $oldStatusLower) {
                try {
                    // Re-fetch order with location to ensure the Telegram sender has access to it
                    $order->load('location');
                    $this->sendTelegramNotificationToAdmin($order);
                    Log::info("Telegram notification sent for order {$order->order_number}. Status: {$order->status}");
                } catch (\Exception $telegramException) {
                    Log::error("Failed to send Telegram notification for order {$order->order_number}: " . $telegramException->getMessage());
                }
            }

            // Prepare response including location details
            $responseOrder = $order->toArray(); // Get all attributes
            $responseOrder['is_pos_sale'] = (bool) $order->is_pos_sale; // Ensure boolean
            $responseOrder['location_name'] = $order->location ? $order->location->name : null;
            $responseOrder['location_address'] = $order->location ? $order->location->address : null;
            $responseOrder['location_phone'] = $order->location ? $order->location->phone : null;


            return response()->json([
                'status' => 200,
                'message' => 'Order updated successfully.',
                'order' => $responseOrder,
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Order Update Error for {$orderNumber}: " . $e->getMessage() . " on line " . $e->getLine() . " in " . $e->getFile());
            return response()->json([
                'status' => 500,
                'message' => 'An error occurred while updating the order.',
            ], 500);
        }
    }

    public function updateStatus($identifier, Request $request)
    {
        // 1. Validate incoming request data
        $validator = Validator::make($request->all(), [
            'status' => 'required|string|max:255',
            'payment_method' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            Log::warning('Order Status Update Validation Failed:', $validator->errors()->toArray());
            return response()->json([
                'status' => 400,
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            // Find the order by order_number OR paystack_reference, eager load location
            $order = Order::where('order_number', $identifier)
                ->orWhere('paystack_reference', $identifier)
                ->with('location') // Eager load location for response
                ->first();

            if (!$order) {
                return response()->json([
                    'status' => 404,
                    'message' => 'Order not found.'
                ], 404);
            }

            $oldStatus = $order->status;
            $newStatus = $request->input('status');

            if ($newStatus !== $oldStatus) {
                $order->status = $newStatus;

                switch ($newStatus) {
                    case 'shipped':
                        if (is_null($order->shipped_at)) { $order->shipped_at = now(); }
                        $order->out_for_delivery_at = null;
                        $order->delivered_at = null;
                        $order->cancelled_at = null;
                        break;
                    case 'pending_delivery':
                        if (is_null($order->out_for_delivery_at)) { $order->out_for_delivery_at = now(); }
                        if (is_null($order->shipped_at)) { $order->shipped_at = now(); }
                        $order->delivered_at = null;
                        $order->cancelled_at = null;
                        break;
                    case 'completed':
                        if (is_null($order->delivered_at)) { $order->delivered_at = now(); }
                        $order->shipped_at = $order->shipped_at ?? now();
                        $order->out_for_delivery_at = $order->out_for_delivery_at ?? now();
                        $order->cancelled_at = null;
                        break;
                    case 'cancelled':
                    case 'payment_canceled':
                    case 'payment_failed':
                        if (is_null($order->cancelled_at)) { $order->cancelled_at = now(); }
                        $order->shipped_at = null;
                        $order->out_for_delivery_at = null;
                        $order->delivered_at = null;
                        break;
                    case 'pending_payment':
                    case 'processing_paystack_payment':
                    case 'processing_bank_transfer_payment':
                    case 'pending_confirmation':
                    case 'processing':
                        $order->shipped_at = null;
                        $order->out_for_delivery_at = null;
                        $order->delivered_at = null;
                        $order->cancelled_at = null;
                        break;
                }
            }

            if ($request->filled('payment_method')) {
                $order->payment_method = $request->input('payment_method');
            }

            $order->save();

            $newStatusLower = strtolower($newStatus);
            $oldStatusLower = strtolower($oldStatus);

            // Send email notification to customer if status changed
            if (($newStatusLower === 'completed' || $newStatusLower === 'pending_confirmation' || $newStatusLower === 'shipped' || $newStatusLower === 'pending_delivery' || $newStatusLower === 'cancelled' || $newStatusLower === 'payment_canceled' || $newStatusLower === 'payment_failed' || $newStatusLower === 'processing') && $newStatusLower !== $oldStatusLower) {
                if ($order->email) {
                    try {
                        // Re-fetch order with location to ensure the Mailable has access to it
                        $order->load('location');
                        Mail::to($order->email)->send(new OrderStatusNotification($order));
                        Log::info("Order status email sent to {$order->email} for order {$order->order_number}. New status: {$order->status}");
                    } catch (\Exception $mailException) {
                        Log::error("Failed to send order status email for order {$order->order_number} to {$order->email}: " . $mailException->getMessage());
                    }
                } else {
                    Log::warning("Could not send order status email for order {$order->order_number}: Order email not found.");
                }
            }

            // Send Telegram notification to admin (isolated in its own try-catch)
            if (($newStatusLower === 'completed' || $newStatusLower === 'pending_confirmation' || $newStatusLower === 'shipped' || $newStatusLower === 'pending_delivery') && $newStatusLower !== $oldStatusLower) {
                try {
                    // Re-fetch order with location to ensure the Telegram sender has access to it
                    $order->load('location');
                    $this->sendTelegramNotificationToAdmin($order);
                    Log::info("Telegram notification sent for order {$order->order_number}. Status: {$order->status}");
                } catch (\Exception $telegramException) {
                    Log::error("Failed to send Telegram notification for order {$order->order_number}: " . $telegramException->getMessage());
                }
            }

            // Prepare response including location details
            $responseOrder = $order->toArray(); // Get all attributes
            $responseOrder['is_pos_sale'] = (bool) $order->is_pos_sale; // Ensure boolean
            $responseOrder['location_name'] = $order->location ? $order->location->name : null;
            $responseOrder['location_address'] = $order->location ? $order->location->address : null;
            $responseOrder['location_phone'] = $order->location ? $order->location->phone : null;

            return response()->json([
                'status' => 200,
                'message' => "Order {$order->order_number} status updated to '{$order->status}' successfully.",
                'order' => $responseOrder,
            ], 200);

        } catch (\Exception $e) {
            Log::error('An unhandled error occurred in updateStatus: ' . $e->getMessage() . ' on line ' . $e->getLine() . ' in ' . $e->getFile());
            return response()->json([
                'status' => 500,
                'message' => $e->getMessage() ?: 'An unexpected error occurred while updating the order status.',
            ], 500);
        }
    }

    public function viewOrders()
    {
        try {
            // Eager load the 'location' relationship for all orders
            $orders = Order::with('location')->orderBy('created_at', 'desc')->get();

            if ($orders->isEmpty()) {
                return response()->json([
                    'status' => 200,
                    'message' => 'No orders found.',
                    'orders' => []
                ]);
            }

            // Manually append location details and is_pos_sale to each order
            $formattedOrders = $orders->map(function ($order) {
                $orderArray = $order->toArray();
                $orderArray['is_pos_sale'] = (bool) $order->is_pos_sale; // Ensure boolean
                $orderArray['location_name'] = $order->location ? $order->location->name : null;
                $orderArray['location_address'] = $order->location ? $order->location->address : null;
                $orderArray['location_phone'] = $order->location ? $order->location->phone : null;
                return $orderArray;
            });


            return response()->json([
                'status' => 200,
                'orders' => $formattedOrders
            ]);
        } catch (\Exception $e) {
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
            // Find the order by order_number, eager load location
            $order = Order::where('order_number', $order_number)->with('location')->first();

            if (!$order) {
                return response()->json([
                    'status' => 404,
                    'message' => 'Order not found.'
                ], 404);
            }

            // Prepare response including location details
            $responseOrder = $order->toArray(); // Get all attributes
            $responseOrder['is_pos_sale'] = (bool) $order->is_pos_sale; // Ensure boolean
            $responseOrder['location_name'] = $order->location ? $order->location->name : null;
            $responseOrder['location_address'] = $order->location ? $order->location->address : null;
            $responseOrder['location_phone'] = $order->location ? $order->location->phone : null;


            return response()->json([
                'status' => 200,
                'order' => $responseOrder
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error fetching order details for order_number: {$order_number}. Error: " . $e->getMessage());

            return response()->json([
                'status' => 500,
                'message' => 'Failed to retrieve order details.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Your existing trackOrder function (moved to the correct alphabetical position for clarity)
    public function trackOrder(string $orderNumber): JsonResponse
    {
        try {
            // Eager load the 'location' relationship
            $order = Order::where('order_number', $orderNumber)
                          ->with('location') // Eager load the associated location
                          ->first();

            if (!$order) {
                return response()->json([
                    'status' => 404,
                    'message' => 'Order not found. Please verify the order number and try again.'
                ], 404);
            }

            // Prepare the response data, including location details
            $responseOrder = [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'full_name' => $order->full_name,
                'email' => $order->email,
                'phone' => $order->phone,
                'shipping_address1' => $order->shipping_address1,
                'shipping_address2' => $order->shipping_address2,
                'city' => $order->city,
                'state' => $order->state,
                'zip_code' => $order->zip_code,
                'subtotal' => $order->subtotal,
                'shipping_cost' => $order->shipping_cost,
                'discount_amount' => $order->discount_amount,
                'grand_total' => $order->grand_total,
                'amount_paid' => $order->amount_paid,
                'payment_method' => $order->payment_method,
                'paystack_reference' => $order->paystack_reference,
                'status' => $order->status,
                'shipped_at' => $order->shipped_at,
                'out_for_delivery_at' => $order->out_for_delivery_at,
                'delivered_at' => $order->delivered_at,
                'cancelled_at' => $order->cancelled_at,
                'is_pos_sale' => (bool) $order->is_pos_sale, // Ensure it's a boolean
                'items_json' => $order->items_json, // Already cast to array by model
                'created_at' => $order->created_at,
                'updated_at' => $order->updated_at,
                // --- NEW: Include location details if available ---
                'location_id' => $order->location_id, // Include the ID
                'location_name' => $order->location ? $order->location->name : null,
                'location_address' => $order->location ? $order->location->address : null,
                'location_phone' => $order->location ? $order->location->phone : null,
            ];

            Log::info("Order tracking details for {$orderNumber} fetched successfully.", [
                'order' => $responseOrder
            ]);

            return response()->json([
                'status' => 200,
                'message' => 'Order details fetched successfully.',
                'order' => $responseOrder
            ], 200);

        } catch (\Exception $e) {
            Log::error("Error tracking order {$orderNumber}: " . $e->getMessage(), [
                'exception' => $e,
                'order_number' => $orderNumber
            ]);
            return response()->json([
                'status' => 500,
                'message' => 'An unexpected error occurred while processing your request. Please try again later.'
            ], 500);
        }
    }
}
