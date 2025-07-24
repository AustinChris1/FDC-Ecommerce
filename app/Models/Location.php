<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'address',
        'phone',
        'email',
        'latitude',
        'longitude',
        'is_active',
    ];

    /**
     * A location can have many products through the product_location pivot table.
     */
    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_location')
                    ->withPivot('quantity_in_store') // Include the quantity column from the pivot table
                    ->withTimestamps(); // If you want to use the timestamps on the pivot table
    }
}