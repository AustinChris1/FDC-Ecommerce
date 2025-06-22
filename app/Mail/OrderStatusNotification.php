<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Order; // Import the Order model
use Illuminate\Support\Facades\Log; // For logging if decoding fails

class OrderStatusNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $order;
    public $orderedItems; // New public property for decoded items

    public function __construct(Order $order)
    {
        $this->order = $order;

        try {
            $this->orderedItems = json_decode($order->items_json, true);
            if (!is_array($this->orderedItems)) {
                $this->orderedItems = []; // Default to empty array if decoding fails
                Log::error("Malformed JSON in items_json for order {$order->order_number}. Original: {$order->items_json}");
            }
        } catch (\Exception $e) {
            $this->orderedItems = []; // Default to empty array on any decoding error
            Log::error("Exception decoding items_json for order {$order->order_number}: " . $e->getMessage());
        }
    }

    public function envelope(): Envelope
    {
        $subject = '';
        switch (strtolower($this->order->status)) {
            case 'completed':
                $subject = "Your Order #{$this->order->order_number} is Completed!";
                break;
            case 'pending_confirmation':
                $subject = "Your Order #{$this->order->order_number} Waiting For Confirmation";
                break;
            default:
                $subject = "Update for your Order #{$this->order->order_number}";
                break;
        }

        return new Envelope(
            subject: $subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.orders.status_update',
            with: [
                'order' => $this->order,
                'orderedItems' => $this->orderedItems,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}