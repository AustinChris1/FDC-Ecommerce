<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Category;
use App\Models\Review;
use App\Models\Location; // Ensure Location is imported

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
        'qty', // This is your online stock / global unallocated pool
        'image',
        'image2',
        'image3',
        'image4',
        'status',
        'featured',
        'popular',
        'brand',
        'specifications',
        'features',
        'is_new_arrival',
        'is_flash_sale',
        'flash_sale_price',
        'flash_sale_starts_at',
        'flash_sale_ends_at',
    ];

    protected $casts = [
        'is_new_arrival' => 'boolean',
        'is_flash_sale' => 'boolean',
        'flash_sale_price' => 'decimal:2',
        'flash_sale_starts_at' => 'datetime',
        'flash_sale_ends_at' => 'datetime',
        'specifications' => 'array',
        'features' => 'array',
    ];

    // Append this accessor to JSON output for easy access
    protected $appends = ['total_overall_quantity']; // Renamed from 'allQty' for convention

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

    // public function locations()
    // {
    //     return $this->belongsToMany(Location::class, 'product_location')
    //                 ->withPivot('quantity_in_store')
    //                 ->withTimestamps();
    // }
 public function locations()
    {
        return $this->belongsToMany(Location::class, 'product_location', 'product_id', 'location_id')
                    ->withPivot('quantity_in_store')
                    ->withTimestamps();
    }
    public function getTotalOverallQuantityAttribute()
    {
        // Sum quantities from all locations this product is attached to
        // Ensure 'locations' relationship is loaded before calling this accessor.
        // If not loaded, it will return 0 or cause N+1 query issues.
        $allocatedStoreQty = $this->locations->sum('pivot.quantity_in_store');

        // 'qty' is your online stock / global unallocated pool
        return $this->qty + $allocatedStoreQty;
    }
}