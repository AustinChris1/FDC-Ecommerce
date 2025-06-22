<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContactUsMail extends Mailable
{
    use Queueable, SerializesModels;

    public $details;

    public function __construct($details)
    {
        $this->details = $details;
    }

    public function build()
    {
        return $this->subject('New Contact Message')
                    ->view('emails.contact-us')
                    ->with('details', $this->details);
    }
}
