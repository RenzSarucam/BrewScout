<?php

namespace Tests\Feature\Places;

use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PlacesTest extends TestCase
{
    private const NEARBY_ENDPOINT = '/places:searchNearby';

    public function test_nearby_search_returns_normalized_results(): void
    {
        Http::fake([
            '*'.self::NEARBY_ENDPOINT => Http::response([
                'places' => [
                    [
                        'id' => 'place-1',
                        'displayName' => ['text' => 'Common Grounds Coffee'],
                        'formattedAddress' => '123 Rizal St, Davao City',
                        'location' => ['latitude' => 7.0735, 'longitude' => 125.6130],
                        'rating' => 4.8,
                        'userRatingCount' => 1200,
                        'priceLevel' => 'PRICE_LEVEL_MODERATE',
                        'currentOpeningHours' => ['openNow' => true],
                        'photos' => [['name' => 'places/place-1/photos/abc']],
                        'googleMapsUri' => 'https://maps.google.com/?cid=1',
                    ],
                ],
            ], 200),
        ]);

        $response = $this->getJson('/api/v1/places/nearby?lat=7.0731&lng=125.6128&radius=5000');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.0.place_id', 'place-1')
            ->assertJsonPath('data.0.name', 'Common Grounds Coffee')
            ->assertJsonPath('data.0.rating', 4.8)
            ->assertJsonPath('data.0.price_level', 2)
            ->assertJsonPath('data.0.open_now', true);

        $this->assertIsInt($response->json('data.0.distance_meters'));
    }

    public function test_nearby_search_filters_by_minimum_rating(): void
    {
        Http::fake([
            '*'.self::NEARBY_ENDPOINT => Http::response([
                'places' => [
                    ['id' => 'high', 'displayName' => ['text' => 'High Rated'], 'rating' => 4.7, 'location' => ['latitude' => 7.07, 'longitude' => 125.61]],
                    ['id' => 'low', 'displayName' => ['text' => 'Low Rated'], 'rating' => 3.2, 'location' => ['latitude' => 7.07, 'longitude' => 125.61]],
                ],
            ], 200),
        ]);

        $response = $this->getJson('/api/v1/places/nearby?lat=7.0731&lng=125.6128&min_rating=4.5');

        $response->assertStatus(200);
        $ids = collect($response->json('data'))->pluck('place_id');
        $this->assertTrue($ids->contains('high'));
        $this->assertFalse($ids->contains('low'));
    }

    public function test_nearby_search_filters_by_open_now(): void
    {
        Http::fake([
            '*'.self::NEARBY_ENDPOINT => Http::response([
                'places' => [
                    ['id' => 'open', 'displayName' => ['text' => 'Open'], 'currentOpeningHours' => ['openNow' => true], 'location' => ['latitude' => 7.07, 'longitude' => 125.61]],
                    ['id' => 'closed', 'displayName' => ['text' => 'Closed'], 'currentOpeningHours' => ['openNow' => false], 'location' => ['latitude' => 7.07, 'longitude' => 125.61]],
                ],
            ], 200),
        ]);

        $response = $this->getJson('/api/v1/places/nearby?lat=7.0731&lng=125.6128&open_now=1');

        $ids = collect($response->json('data'))->pluck('place_id');
        $this->assertTrue($ids->contains('open'));
        $this->assertFalse($ids->contains('closed'));
    }

    public function test_nearby_search_requires_coordinates(): void
    {
        $response = $this->getJson('/api/v1/places/nearby');

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_nearby_search_rejects_out_of_range_coordinates(): void
    {
        $response = $this->getJson('/api/v1/places/nearby?lat=999&lng=125.6128');

        $response->assertStatus(422);
    }

    public function test_nearby_search_handles_google_api_failure_gracefully(): void
    {
        Http::fake([
            '*'.self::NEARBY_ENDPOINT => Http::response(['error' => 'boom'], 500),
        ]);

        $response = $this->getJson('/api/v1/places/nearby?lat=7.0731&lng=125.6128');

        $response->assertStatus(502)->assertJsonPath('success', false);
        $this->assertStringNotContainsString('boom', $response->getContent());
    }

    public function test_show_returns_normalized_place_details(): void
    {
        Http::fake([
            '*/places/place-1' => Http::response([
                'id' => 'place-1',
                'displayName' => ['text' => 'Common Grounds Coffee'],
                'formattedAddress' => '123 Rizal St, Davao City',
                'location' => ['latitude' => 7.0735, 'longitude' => 125.6130],
                'rating' => 4.8,
                'userRatingCount' => 1200,
                'priceLevel' => 'PRICE_LEVEL_MODERATE',
                'internationalPhoneNumber' => '+63 82 123 4567',
                'websiteUri' => 'https://commongrounds.example.com',
                'currentOpeningHours' => [
                    'openNow' => true,
                    'weekdayDescriptions' => ['Monday: 7:00 AM - 10:00 PM'],
                ],
                'photos' => [['name' => 'places/place-1/photos/abc']],
                'googleMapsUri' => 'https://maps.google.com/?cid=1',
            ], 200),
        ]);

        $response = $this->getJson('/api/v1/places/place-1');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.place_id', 'place-1')
            ->assertJsonPath('data.name', 'Common Grounds Coffee')
            ->assertJsonPath('data.phone', '+63 82 123 4567')
            ->assertJsonPath('data.website', 'https://commongrounds.example.com')
            ->assertJsonCount(1, 'data.opening_hours')
            ->assertJsonCount(1, 'data.photos');
    }

    public function test_show_returns_404_for_missing_place(): void
    {
        Http::fake([
            '*/places/missing' => Http::response([], 404),
        ]);

        $response = $this->getJson('/api/v1/places/missing');

        $response->assertStatus(404)->assertJsonPath('success', false);
    }

    public function test_geocode_returns_coordinates_for_a_known_place(): void
    {
        Http::fake([
            '*maps.googleapis.com/maps/api/geocode*' => Http::response([
                'status' => 'OK',
                'results' => [[
                    'formatted_address' => 'Davao City, Davao del Sur, Philippines',
                    'geometry' => ['location' => ['lat' => 7.0731, 'lng' => 125.6128]],
                ]],
            ], 200),
        ]);

        $response = $this->getJson('/api/v1/places/geocode?query=Davao+City');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.lat', 7.0731)
            ->assertJsonPath('data.lng', 125.6128);
    }

    public function test_geocode_returns_404_when_google_finds_nothing(): void
    {
        Http::fake([
            '*maps.googleapis.com/maps/api/geocode*' => Http::response(['status' => 'ZERO_RESULTS', 'results' => []], 200),
        ]);

        $response = $this->getJson('/api/v1/places/geocode?query=asdkjhaskjdh');

        $response->assertStatus(404)->assertJsonPath('success', false);
    }

    public function test_geocode_surfaces_a_service_error_instead_of_a_false_not_found(): void
    {
        Http::fake([
            '*maps.googleapis.com/maps/api/geocode*' => Http::response([
                'status' => 'REQUEST_DENIED',
                'error_message' => 'You must use an API key...',
                'results' => [],
            ], 200),
        ]);

        $response = $this->getJson('/api/v1/places/geocode?query=Davao');

        $response->assertStatus(502)->assertJsonPath('success', false);
    }

    public function test_geocode_requires_a_query(): void
    {
        $response = $this->getJson('/api/v1/places/geocode');

        $response->assertStatus(422);
    }
}
