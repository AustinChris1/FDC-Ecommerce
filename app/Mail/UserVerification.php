<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UserVerification extends Mailable
{
    use Queueable, SerializesModels;

    public $verificationUrl;
    public $username;

    /**
     * Create a new message instance.
     */
    public function __construct($verificationUrl, $username)
    {
        $this->verificationUrl = $verificationUrl;
        $this->username = $username;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Verify Your Email Address',
            replyTo: [
                new Address('noreply@firstdigit.com.ng', 'First Digit'),
            ]
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.verify',
        );
    }
}
