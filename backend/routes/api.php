<?php

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
});
