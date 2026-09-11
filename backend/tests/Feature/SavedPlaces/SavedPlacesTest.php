<?php

namespace Tests\Feature\SavedPlaces;

use App\Models\Place;
use App\Models\SavedPlace;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SavedPlacesTest extends TestCase
{
    use RefreshDatabase;

    private function fakeGooglePlaceDetails(string $googlePlaceId, string $name = 'Common Grounds Coffee'): void
    {
        Http::fake([
            "*/places/{$googlePlaceId}" => Http::response([
                'id' => $googlePlaceId,
                'displayName' => ['text' => $name],
                'formattedAddress' => '123 Rizal St, Davao City',
                'location' => ['latitude' => 7.0735, 'longitude' => 125.6130],
                'rating' => 4.8,
                'userRatingCount' => 1200,
                'currentOpeningHours' => ['openNow' => true],
                'photos' => [['name' => "places/{$googlePlaceId}/photos/abc"]],
                'googleMapsUri' => 'https://maps.google.com/?cid=1',
            ], 200),
        ]);
    }

    public function test_a_guest_cannot_view_saved_places(): void
    {
        $this->getJson('/api/v1/saved-places')->assertStatus(401);
    }

    public function test_a_guest_cannot_save_a_place(): void
    {
        $this->postJson('/api/v1/saved-places', ['place_id' => 'ChIJ_test'])->assertStatus(401);
    }

    public function test_a_user_can_save_a_place(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/saved-places', ['place_id' => 'ChIJ_test']);

        $response->assertStatus(201)->assertJsonPath('success', true);

        $place = Place::where('google_place_id', 'ChIJ_test')->first();
        $this->assertNotNull($place);
        $this->assertDatabaseHas('saved_places', ['user_id' => $user->id, 'place_id' => $place->id]);
    }

    public function test_saving_the_same_place_twice_does_not_create_a_duplicate(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/api/v1/saved-places', ['place_id' => 'ChIJ_test'])->assertStatus(201);
        $this->actingAs($user)->postJson('/api/v1/saved-places', ['place_id' => 'ChIJ_test'])->assertStatus(201);

        $this->assertDatabaseCount('saved_places', 1);
    }

    public function test_a_user_can_list_their_saved_places(): void
    {
        $user = User::factory()->create();
        $this->fakeGooglePlaceDetails('ChIJ_test');

        $this->actingAs($user)->postJson('/api/v1/saved-places', ['place_id' => 'ChIJ_test'])->assertStatus(201);

        $response = $this->actingAs($user)->getJson('/api/v1/saved-places');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.0.place_id', 'ChIJ_test')
            ->assertJsonPath('data.0.name', 'Common Grounds Coffee');
    }

    public function test_saved_places_are_scoped_to_the_authenticated_user(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $place = Place::create(['google_place_id' => 'ChIJ_owner_only']);
        SavedPlace::create(['user_id' => $owner->id, 'place_id' => $place->id]);

        $response = $this->actingAs($otherUser)->getJson('/api/v1/saved-places');

        $response->assertStatus(200)->assertJsonCount(0, 'data');
    }

    public function test_a_user_can_unsave_a_place(): void
    {
        $user = User::factory()->create();
        $place = Place::create(['google_place_id' => 'ChIJ_test']);
        SavedPlace::create(['user_id' => $user->id, 'place_id' => $place->id]);

        $response = $this->actingAs($user)->deleteJson('/api/v1/saved-places/ChIJ_test');

        $response->assertStatus(200)->assertJsonPath('success', true);
        $this->assertDatabaseCount('saved_places', 0);
    }

    public function test_unsaving_a_place_that_was_never_saved_is_a_no_op(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->deleteJson('/api/v1/saved-places/ChIJ_never_saved');

        $response->assertStatus(200)->assertJsonPath('success', true);
    }

    public function test_a_user_cannot_unsave_another_users_saved_place(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $place = Place::create(['google_place_id' => 'ChIJ_owner_only']);
        SavedPlace::create(['user_id' => $owner->id, 'place_id' => $place->id]);

        $this->actingAs($otherUser)->deleteJson('/api/v1/saved-places/ChIJ_owner_only')->assertStatus(200);

        $this->assertDatabaseHas('saved_places', ['user_id' => $owner->id, 'place_id' => $place->id]);
    }

    public function test_it_requires_a_place_id_to_save(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/api/v1/saved-places', [])->assertStatus(422);
    }
}
