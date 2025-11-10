<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Configure rate limiters
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('public_products', function (Request $request) {
            return Limit::perMinute(120)->by($request->ip());
        });

        // Email verification resend rate limiter
        // (Note: This is already handled by the throttle in your routes, 
        // but we define it here for consistency)
        RateLimiter::for('verification.send', function (Request $request) {
            return Limit::perMinute(6)->by($request->user()?->id ?: $request->ip());
        });
    }
}