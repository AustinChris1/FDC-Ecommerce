<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Laravel\Sanctum\Http\Middleware\CheckAbilities;
use Laravel\Sanctum\Http\Middleware\CheckForAnyAbility;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'abilities' => CheckAbilities::class,
            'ability' => CheckForAnyAbility::class,
            'isApiAdmin' => \App\Http\Middleware\ApiAdminMiddleware::class,
            'auth:sanctum' => \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
            'api' => [
                \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
                'throttle:api',
                \Illuminate\Routing\Middleware\SubstituteBindings::class,
            ],
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // var_dump($exceptions);
        $exceptions->render(function (\Symfony\Component\Routing\Exception\RouteNotFoundException $e) {
            // var_dump($e);
            return response()->json(['error' => 'Unauthorized'], 401);
        });
    })
    ->create();
