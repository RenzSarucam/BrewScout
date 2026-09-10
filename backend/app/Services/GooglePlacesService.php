<?php

namespace App\Services;

use App\Exceptions\GooglePlacesException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GooglePlacesService
{
    private const BASE_URL = 'https://places.googleapis.com/v1';

    private const NEARBY_FIELD_MASK = [
        'places.id',
        'places.displayName',
        'places.formattedAddress',
        'places.location',
        'places.rating',
        'places.userRatingCount',
        'places.priceLevel',
        'places.currentOpeningHours.openNow',
        'places.photos',
        'places.googleMapsUri',
    ];

    private const DETAILS_FIELD_MASK = [
        'id',
        'displayName',
        'formattedAddress',
        'location',
        'rating',
        'userRatingCount',
        'priceLevel',
        'currentOpeningHours',
        'photos',
        'googleMapsUri',
        'internationalPhoneNumber',
        'websiteUri',
    ];

    private string $apiKey;

    public function __construct(?string $apiKey = null)
    {
        $this->apiKey = $apiKey ?? config('services.google.places_key') ?? '';
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function nearbySearch(
        float $lat,
        float $lng,
        int $radiusMeters,
        string $rankPreference = 'POPULARITY',
    ): array {
        $response = Http::withHeaders([
            'X-Goog-Api-Key' => $this->apiKey,
            'X-Goog-FieldMask' => implode(',', self::NEARBY_FIELD_MASK),
            'Content-Type' => 'application/json',
        ])->post(self::BASE_URL.'/places:searchNearby', [
            'includedTypes' => ['coffee_shop'],
            'maxResultCount' => 20,
            'rankPreference' => $rankPreference,
            'locationRestriction' => [
                'circle' => [
                    'center' => ['latitude' => $lat, 'longitude' => $lng],
                    'radius' => $radiusMeters,
                ],
            ],
        ]);

        if ($response->failed()) {
            Log::warning('Google Places nearbySearch failed', ['status' => $response->status(), 'body' => $response->body()]);
            throw new GooglePlacesException('Failed to search for nearby coffee shops.');
        }

        return $response->json('places', []);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function textSearch(
        string $keyword,
        float $lat,
        float $lng,
        int $radiusMeters,
    ): array {
        $response = Http::withHeaders([
            'X-Goog-Api-Key' => $this->apiKey,
            'X-Goog-FieldMask' => implode(',', self::NEARBY_FIELD_MASK),
            'Content-Type' => 'application/json',
        ])->post(self::BASE_URL.'/places:searchText', [
            'textQuery' => "{$keyword} coffee",
            'includedType' => 'coffee_shop',
            'locationBias' => [
                'circle' => [
                    'center' => ['latitude' => $lat, 'longitude' => $lng],
                    'radius' => $radiusMeters,
                ],
            ],
        ]);

        if ($response->failed()) {
            Log::warning('Google Places textSearch failed', ['status' => $response->status(), 'body' => $response->body()]);
            throw new GooglePlacesException('Failed to search for coffee shops.');
        }

        return $response->json('places', []);
    }

    /**
     * @return array<string, mixed>|null
     */
    public function getPlaceDetails(string $placeId): ?array
    {
        $response = Http::withHeaders([
            'X-Goog-Api-Key' => $this->apiKey,
            'X-Goog-FieldMask' => implode(',', self::DETAILS_FIELD_MASK),
        ])->get(self::BASE_URL."/places/{$placeId}");

        if ($response->status() === 404) {
            return null;
        }

        if ($response->failed()) {
            Log::warning('Google Places getPlaceDetails failed', ['status' => $response->status(), 'body' => $response->body()]);
            throw new GooglePlacesException('Failed to fetch coffee shop details.');
        }

        return $response->json();
    }

    public function photoUrl(string $photoName, int $maxWidthPx = 640): string
    {
        return self::BASE_URL."/{$photoName}/media?maxWidthPx={$maxWidthPx}&key={$this->apiKey}";
    }
}
