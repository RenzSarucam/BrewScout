<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Routes\ComputeRouteRequest;
use App\Models\Place;
use App\Models\RouteSession;
use App\Services\GoogleRoutesService;
use Illuminate\Http\JsonResponse;

class RoutesController extends Controller
{
    public function __construct(private readonly GoogleRoutesService $routes) {}

    public function store(ComputeRouteRequest $request): JsonResponse
    {
        $origin = $request->input('origin');
        $destination = $request->input('destination');
        $travelMode = $request->string('travel_mode')->toString();

        $route = $this->routes->computeRoute($origin, $destination, $travelMode);

        $placeId = null;
        if ($request->filled('place_id')) {
            $placeId = Place::firstOrCreate(['google_place_id' => $request->string('place_id')->toString()])->id;
        }

        RouteSession::create([
            'user_id' => $request->user()?->id,
            'place_id' => $placeId,
            'travel_mode' => $travelMode,
            'origin_lat' => $origin['lat'],
            'origin_lng' => $origin['lng'],
            'destination_lat' => $destination['lat'],
            'destination_lng' => $destination['lng'],
            'estimated_distance' => $route['distance_meters'],
            'estimated_duration' => $route['duration_seconds'],
            'started_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $route,
        ]);
    }
}
