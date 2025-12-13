<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Order;
use App\Models\User;

class SuperAdminPosNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $order;
    public $cashier;

    /**
     * Create a new message instance.
     */
    public function __construct(Order $order, $cashier = null)
    {
        $this->order = $order;
        $this->cashier = $cashier;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $statusLabel = $this->getStatusLabel($this->order->status);
        
        return new Envelope(
            subject: "💰 POS Sale Alert - Order {$this->order->order_number}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        // Get cashier details
        $cashierName = 'System';
        $cashierEmail = 'N/A';
        
        if ($this->cashier) {
            $cashierName = $this->cashier->name ?? 'Unknown User';
            $cashierEmail = $this->cashier->email ?? 'N/A';
        }

        return new Content(
            view: 'emails.super-admin-pos-notification',
            with: [
                'order' => $this->order,
                'cashier' => $this->cashier,
                'items' => json_decode($this->order->items_json, true),
                'statusLabel' => $this->getStatusLabel($this->order->status),
                'statusColor' => $this->getStatusColor($this->order->status),
                'adminUrl' => url("https://spx.firstdigit.com.ng/admin/orders/view/{$this->order->order_number}"),
                'cashierName' => $cashierName,
                'cashierEmail' => $cashierEmail,
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

    /**
     * Get human-readable status label
     */
    private function getStatusLabel($status)
    {
        $labels = [
            'pending_payment' => 'Pending Payment',
            'processing_paystack_payment' => 'Processing Payment',
            'processing_bank_transfer_payment' => 'Processing Bank Transfer',
            'pending_confirmation' => 'Pending Confirmation',
            'processing' => 'Processing',
            'shipped' => 'Shipped',
            'pending_delivery' => 'Out for Delivery',
            'completed' => 'Completed',
            'delivered' => 'Delivered',
            'cancelled' => 'Cancelled',
            'payment_canceled' => 'Payment Cancelled',
            'payment_failed' => 'Payment Failed',
        ];

        return $labels[$status] ?? ucfirst(str_replace('_', ' ', $status));
    }

    /**
     * Get status color for styling
     */
    private function getStatusColor($status)
    {
        $colors = [
            'pending_payment' => '#FFA500',
            'processing_paystack_payment' => '#FFA500',
            'processing_bank_transfer_payment' => '#FFA500',
            'pending_confirmation' => '#17A2B8',
            'processing' => '#17A2B8',
            'shipped' => '#007BFF',
            'pending_delivery' => '#6F42C1',
            'completed' => '#28A745',
            'delivered' => '#28A745',
            'cancelled' => '#DC3545',
            'payment_canceled' => '#DC3545',
            'payment_failed' => '#DC3545',
        ];

        return $colors[$status] ?? '#6C757D';
    }
}