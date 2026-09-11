<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\PlacesController;
use App\Http\Controllers\Api\V1\RoutesController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/ping', function (Request $request) {
        return response()->json([
            'success' => true,
            'data' => [
                'app' => config('app.name'),
                'status' => 'ok',
            ],
        ]);
    });

    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/me', [AuthController::class, 'me']);
        });
    });

    Route::prefix('places')->group(function () {
        Route::get('/nearby', [PlacesController::class, 'nearby']);
        Route::get('/geocode', [PlacesController::class, 'geocode']);
        Route::get('/{googlePlaceId}', [PlacesController::class, 'show']);
    });

    Route::post('/routes', [RoutesController::class, 'store']);
});
