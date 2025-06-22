<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Category;


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
        'status',
        'featured',
        'popular',
        'brand',
    ];

    protected $with = ['category'];
    public function category(){
        return $this->belongsTo(Category::class, 'category_id', 'id');
    }
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}
