<?php

namespace App\Services;

use App\Exceptions\GoogleGeocodingException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GoogleGeocodingService
{
    private const BASE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

    private string $apiKey;

    public function __construct(?string $apiKey = null)
    {
        $this->apiKey = $apiKey ?? config('services.google.geocoding_key') ?? '';
    }

    /**
     * @return array{formatted_address: string, lat: float, lng: float}|null
     */
    public function geocode(string $address): ?array
    {
        $response = Http::get(self::BASE_URL, [
            'address' => $address,
            'key' => $this->apiKey,
        ]);

        if ($response->failed()) {
            Log::warning('Google Geocoding request failed', ['status' => $response->status(), 'body' => $response->body()]);
            throw new GoogleGeocodingException('Failed to look up that location.');
        }

        $payload = $response->json();
        $status = $payload['status'] ?? null;

        if ($status === 'ZERO_RESULTS') {
            return null;
        }

        if ($status !== 'OK' || empty($payload['results'][0])) {
            Log::warning('Google Geocoding returned a non-OK status', ['status' => $status, 'body' => $response->body()]);
            throw new GoogleGeocodingException('Failed to look up that location.');
        }

        $result = $payload['results'][0];

        return [
            'formatted_address' => $result['formatted_address'],
            'lat' => $result['geometry']['location']['lat'],
            'lng' => $result['geometry']['location']['lng'],
        ];
    }
}
