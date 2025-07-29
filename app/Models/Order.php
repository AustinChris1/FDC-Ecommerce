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
        'discount_amount',
        'grand_total',
        'payment_method',
        'paystack_reference',
        'amount_paid',
        'status',
        'items_json',
        'is_pos_sale',
        'location_id',
    ];

    protected $casts = [
        'items_json' => 'array',
        'is_pos_sale' => 'boolean',
        'subtotal' => 'float',
        'discount_amount' => 'float',
        'amount_paid' => 'float',
        'grand_total' => 'float',
        'shipping_cost' => 'float',
        'location_id' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }
}