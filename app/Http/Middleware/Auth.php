<?php

namespace App\Http\Middleware;

use Closure;

class ApiAuthenticate
{
    public function handle($request, Closure $next, ...$guards)
    {
        if (!auth()->check()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }
    
        return $next($request);
    }
    }
