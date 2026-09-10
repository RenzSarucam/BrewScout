<?php

namespace App\Support;

use App\Services\GooglePlacesService;

class PlaceNormalizer
{
    private const PRICE_LEVELS = [
        'PRICE_LEVEL_FREE' => 0,
        'PRICE_LEVEL_INEXPENSIVE' => 1,
        'PRICE_LEVEL_MODERATE' => 2,
        'PRICE_LEVEL_EXPENSIVE' => 3,
        'PRICE_LEVEL_VERY_EXPENSIVE' => 4,
    ];

    /**
     * Normalize a single result from Places nearbySearch into the shape used
     * by CoffeeCard on the frontend.
     *
     * @param  array<string, mixed>  $place
     * @return array<string, mixed>
     */
    public static function summary(array $place, GooglePlacesService $service, float $userLat, float $userLng): array
    {
        $lat = $place['location']['latitude'] ?? null;
        $lng = $place['location']['longitude'] ?? null;

        return [
            'place_id' => $place['id'] ?? null,
            'name' => $place['displayName']['text'] ?? null,
            'address' => $place['formattedAddress'] ?? null,
            'rating' => $place['rating'] ?? null,
            'review_count' => $place['userRatingCount'] ?? 0,
            'price_level' => self::PRICE_LEVELS[$place['priceLevel'] ?? ''] ?? null,
            'open_now' => $place['currentOpeningHours']['openNow'] ?? null,
            'distance_meters' => $lat !== null && $lng !== null
                ? (int) round(Distance::haversineMeters($userLat, $userLng, $lat, $lng))
                : null,
            'location' => $lat !== null && $lng !== null ? ['lat' => $lat, 'lng' => $lng] : null,
            'photo' => self::firstPhotoUrl($place, $service),
        ];
    }

    /**
     * Normalize a full Places details response into the shape returned by
     * GET /api/v1/places/{googlePlaceId}.
     *
     * @param  array<string, mixed>  $place
     * @return array<string, mixed>
     */
    public static function details(array $place, GooglePlacesService $service): array
    {
        $lat = $place['location']['latitude'] ?? null;
        $lng = $place['location']['longitude'] ?? null;

        return [
            'place_id' => $place['id'] ?? null,
            'name' => $place['displayName']['text'] ?? null,
            'address' => $place['formattedAddress'] ?? null,
            'rating' => $place['rating'] ?? null,
            'review_count' => $place['userRatingCount'] ?? 0,
            'price_level' => self::PRICE_LEVELS[$place['priceLevel'] ?? ''] ?? null,
            'phone' => $place['internationalPhoneNumber'] ?? null,
            'website' => $place['websiteUri'] ?? null,
            'location' => $lat !== null && $lng !== null ? ['lat' => $lat, 'lng' => $lng] : null,
            'open_now' => $place['currentOpeningHours']['openNow'] ?? null,
            'opening_hours' => $place['currentOpeningHours']['weekdayDescriptions'] ?? [],
            'photos' => self::photoUrls($place, $service, 8),
            'google_maps_url' => $place['googleMapsUri'] ?? null,
        ];
    }

    private static function firstPhotoUrl(array $place, GooglePlacesService $service): ?string
    {
        $photos = self::photoUrls($place, $service, 1);

        return $photos[0] ?? null;
    }

    /**
     * @return list<string>
     */
    private static function photoUrls(array $place, GooglePlacesService $service, int $limit): array
    {
        return collect($place['photos'] ?? [])
            ->take($limit)
            ->map(fn (array $photo) => $service->photoUrl($photo['name']))
            ->values()
            ->all();
    }
}
