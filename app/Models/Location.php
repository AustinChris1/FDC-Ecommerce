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

    // Define the many-to-many relationship with Product using the 'product_location' pivot table
    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_location', 'location_id', 'product_id')
            ->withPivot('quantity_in_store') // Crucial for getting the quantity
            ->withTimestamps(); // If you have created_at/updated_at in pivot
    }

    // A location can have multiple users (admins) assigned to it
    public function users()
    {
        return $this->hasMany(User::class, 'location_id');
    }
}
