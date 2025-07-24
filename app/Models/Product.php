<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Category;
use App\Models\Review;

class Product extends Model
{
    use HasFactory;
    protected $table = 'products';
    protected $fillable = [
        'category_id',
        'meta_title',
        'name',
        'link',
        'description',
        'meta_description',
        'meta_keywords',
        'selling_price',
        'original_price',
        'qty',
        'image',
        'image2',
        'image3',
        'image4',
        'status',
        'featured',
        'popular',
        'brand',
        'specifications', // NEW: Added specifications
        'features', // NEW: Added features
        'is_new_arrival',
        'is_flash_sale',
        'flash_sale_price',
        'flash_sale_starts_at',
        'flash_sale_ends_at',
    ];

    // NEW: Cast the 'specifications' attribute to array
    // This will automatically convert the JSON string from the DB to a PHP array/object
    // and convert PHP arrays/objects to JSON string when saving to DB.
    protected $casts = [
        'is_new_arrival' => 'boolean',
        'is_flash_sale' => 'boolean',
        'flash_sale_price' => 'decimal:2',
        'flash_sale_starts_at' => 'datetime',
        'flash_sale_ends_at' => 'datetime',
        'specifications' => 'array', // Assuming you want to cast these JSON columns to arrays
        'features' => 'array',
    ];

    protected $with = ['category'];

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function wishlists()
    {
        return $this->hasMany(Wishlist::class);
    }

     public function locations()
    {
        return $this->belongsToMany(Location::class, 'product_location')
                    ->withPivot('quantity_in_store') // Include the quantity column from the pivot table
                    ->withTimestamps(); // If you want to use the timestamps on the pivot table
    }
}
