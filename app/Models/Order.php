<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        'full_name',
        'email',
        'phone',
        'shipping_address1',
        'shipping_address2',
        'city',
        'state',
        'zip_code',
        'subtotal',
        'shipping_cost',
        'grand_total',
        'payment_method',
        'paystack_reference',
        'status',
        'items_json',
    ];

    // Cast items_json to array/object automatically
    protected $casts = [
        'items_json' => 'array',
    ];

    // Define relationship with User model (if applicable)
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}