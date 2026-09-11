<?php

namespace App\Services;

use App\Exceptions\GoogleRoutesException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GoogleRoutesService
{
    private const BASE_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';

    private const FIELD_MASK = 'routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline';

    /** Travel modes that support Google's traffic-aware routing preference. */
    private const TRAFFIC_AWARE_MODES = ['DRIVE', 'TWO_WHEELER'];

    private string $apiKey;

    public function __construct(?string $apiKey = null)
    {
        $this->apiKey = $apiKey ?? config('services.google.routes_key') ?? '';
    }

    /**
     * @param  array{lat: float, lng: float}  $origin
     * @param  array{lat: float, lng: float}  $destination
     * @return array{distance_meters: int, duration_seconds: int, polyline: string, travel_mode: string}
     */
    public function computeRoute(array $origin, array $destination, string $travelMode): array
    {
        $payload = [
            'origin' => [
                'location' => ['latLng' => ['latitude' => $origin['lat'], 'longitude' => $origin['lng']]],
            ],
            'destination' => [
                'location' => ['latLng' => ['latitude' => $destination['lat'], 'longitude' => $destination['lng']]],
            ],
            'travelMode' => $travelMode,
        ];

        if (in_array($travelMode, self::TRAFFIC_AWARE_MODES, true)) {
            $payload['routingPreference'] = 'TRAFFIC_AWARE';
        }

        $response = Http::withHeaders([
            'X-Goog-Api-Key' => $this->apiKey,
            'X-Goog-FieldMask' => self::FIELD_MASK,
            'Content-Type' => 'application/json',
        ])->post(self::BASE_URL, $payload);

        if ($response->failed()) {
            Log::warning('Google Routes computeRoutes failed', ['status' => $response->status(), 'body' => $response->body()]);
            throw new GoogleRoutesException('Failed to calculate a route.');
        }

        $route = $response->json('routes.0');

        if (! $route) {
            throw new GoogleRoutesException('No route could be found between those two points.');
        }

        return [
            'distance_meters' => (int) ($route['distanceMeters'] ?? 0),
            'duration_seconds' => (int) rtrim($route['duration'] ?? '0s', 's'),
            'polyline' => $route['polyline']['encodedPolyline'] ?? '',
            'travel_mode' => $travelMode,
        ];
    }
}
