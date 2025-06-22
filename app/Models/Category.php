<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;
    protected $table = 'categories';
    protected $fillable = [
        'meta_title',
        'link',
        'description',
        'meta_description',
        'meta_keywords',
        'name',
        'status',
    ];
}
