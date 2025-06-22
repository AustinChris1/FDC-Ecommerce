<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Visit extends Model
{
    protected $fillable = [
        'ip', 'country', 'city', 'device', 'platform', 'visited_at'
    ];

    public $timestamps = true;
}