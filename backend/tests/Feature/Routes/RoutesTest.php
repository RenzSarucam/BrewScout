<?php

namespace Tests\Feature\Routes;

use App\Models\Place;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class RoutesTest extends TestCase
{
    use RefreshDatabase;

    private const ROUTES_ENDPOINT = '*routes.googleapis.com/directions/v2:computeRoutes*';

    private function fakeGoogleRoute(int $distance = 1400, string $duration = '300s'): void
    {
        Http::fake([
            self::ROUTES_ENDPOINT => Http::response([
                'routes' => [[
                    'distanceMeters' => $distance,
                    'duration' => $duration,
                    'polyline' => ['encodedPolyline' => 'abc123encoded'],
                ]],
            ], 200),
        ]);
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'origin' => ['lat' => 7.0731, 'lng' => 125.6128],
            'destination' => ['lat' => 7.0800, 'lng' => 125.6200],
            'travel_mode' => 'TWO_WHEELER',
        ], $overrides);
    }

    public function test_it_computes_and_normalizes_a_route(): void
    {
        $this->fakeGoogleRoute(1400, '300s');

        $response = $this->postJson('/api/v1/routes', $this->payload());

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.distance_meters', 1400)
            ->assertJsonPath('data.duration_seconds', 300)
            ->assertJsonPath('data.polyline', 'abc123encoded')
            ->assertJsonPath('data.travel_mode', 'TWO_WHEELER');
    }

    public function test_it_records_a_route_session(): void
    {
        $this->fakeGoogleRoute();

        $this->postJson('/api/v1/routes', $this->payload())->assertStatus(200);

        $this->assertDatabaseCount('route_sessions', 1);
        $this->assertDatabaseHas('route_sessions', [
            'travel_mode' => 'TWO_WHEELER',
            'estimated_distance' => 1400,
            'estimated_duration' => 300,
            'user_id' => null,
        ]);
    }

    public function test_it_links_the_route_session_to_a_place_when_a_place_id_is_given(): void
    {
        $this->fakeGoogleRoute();

        $this->postJson('/api/v1/routes', $this->payload(['place_id' => 'ChIJ_test_place']))
            ->assertStatus(200);

        $place = Place::where('google_place_id', 'ChIJ_test_place')->first();
        $this->assertNotNull($place);
        $this->assertDatabaseHas('route_sessions', ['place_id' => $place->id]);
    }

    public function test_it_records_the_authenticated_user_on_the_route_session(): void
    {
        $this->fakeGoogleRoute();
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/api/v1/routes', $this->payload())->assertStatus(200);

        $this->assertDatabaseHas('route_sessions', ['user_id' => $user->id]);
    }

    public function test_it_supports_walk_two_wheeler_and_drive(): void
    {
        $this->fakeGoogleRoute();

        foreach (['WALK', 'TWO_WHEELER', 'DRIVE'] as $mode) {
            $this->postJson('/api/v1/routes', $this->payload(['travel_mode' => $mode]))
                ->assertStatus(200)
                ->assertJsonPath('data.travel_mode', $mode);
        }
    }

    public function test_it_rejects_an_invalid_travel_mode(): void
    {
        $response = $this->postJson('/api/v1/routes', $this->payload(['travel_mode' => 'TELEPORT']));

        $response->assertStatus(422);
    }

    public function test_it_requires_origin_and_destination(): void
    {
        $response = $this->postJson('/api/v1/routes', ['travel_mode' => 'WALK']);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['origin.lat', 'origin.lng', 'destination.lat', 'destination.lng']);
    }

    public function test_it_handles_google_api_failure_gracefully(): void
    {
        Http::fake([
            self::ROUTES_ENDPOINT => Http::response(['error' => 'boom'], 500),
        ]);

        $response = $this->postJson('/api/v1/routes', $this->payload());

        $response->assertStatus(502)->assertJsonPath('success', false);
        $this->assertStringNotContainsString('boom', $response->getContent());
        $this->assertDatabaseCount('route_sessions', 0);
    }

    public function test_it_handles_no_route_found(): void
    {
        Http::fake([
            self::ROUTES_ENDPOINT => Http::response(['routes' => []], 200),
        ]);

        $response = $this->postJson('/api/v1/routes', $this->payload());

        $response->assertStatus(502)->assertJsonPath('success', false);
    }
}
