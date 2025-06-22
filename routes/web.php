<?php

use Illuminate\Support\Facades\Route;

Route::get('{url}', function () {
    return view('spa');
})->where('url', '.*');