<?php

namespace Tests\Feature\Reviews;

use App\Models\Place;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ReviewsTest extends TestCase
{
    use RefreshDatabase;

    private function fakeGooglePlaceDetails(string $googlePlaceId, float $lat = 7.0735, float $lng = 125.6130): void
    {
        Http::fake([
            "*/places/{$googlePlaceId}" => Http::response([
                'id' => $googlePlaceId,
                'displayName' => ['text' => 'Common Grounds Coffee'],
                'formattedAddress' => '123 Rizal St, Davao City',
                'location' => ['latitude' => $lat, 'longitude' => $lng],
                'rating' => 4.8,
                'userRatingCount' => 1200,
                'currentOpeningHours' => ['openNow' => true],
                'photos' => [],
                'googleMapsUri' => 'https://maps.google.com/?cid=1',
            ], 200),
        ]);
    }

    public function test_index_returns_an_empty_list_for_a_place_with_no_reviews(): void
    {
        $response = $this->getJson('/api/v1/reviews?place_id=ChIJ_no_reviews');

        $response->assertStatus(200)->assertJsonPath('success', true)->assertJsonCount(0, 'data');
    }

    public function test_index_lists_reviews_for_a_place(): void
    {
        $user = User::factory()->create(['name' => 'Juan Dela Cruz']);
        $place = Place::create(['google_place_id' => 'ChIJ_test']);
        Review::create(['user_id' => $user->id, 'place_id' => $place->id, 'rating' => 5, 'comment' => 'Great coffee!']);

        $response = $this->getJson('/api/v1/reviews?place_id=ChIJ_test');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.0.rating', 5)
            ->assertJsonPath('data.0.comment', 'Great coffee!')
            ->assertJsonPath('data.0.user.name', 'Juan Dela Cruz');
    }

    public function test_index_requires_a_place_id(): void
    {
        $this->getJson('/api/v1/reviews')->assertStatus(422);
    }

    public function test_a_guest_cannot_submit_a_review(): void
    {
        $this->postJson('/api/v1/reviews', ['place_id' => 'ChIJ_test', 'rating' => 5])->assertStatus(401);
    }

    public function test_a_user_can_submit_a_review(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/reviews', [
            'place_id' => 'ChIJ_test',
            'rating' => 4,
            'comment' => 'Solid brew.',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.rating', 4)
            ->assertJsonPath('data.visit_verified', false);

        $place = Place::where('google_place_id', 'ChIJ_test')->first();
        $this->assertDatabaseHas('reviews', ['user_id' => $user->id, 'place_id' => $place->id, 'rating' => 4]);
    }

    public function test_a_review_is_marked_visit_verified_when_the_user_is_near_the_place(): void
    {
        $user = User::factory()->create();
        $this->fakeGooglePlaceDetails('ChIJ_test', 7.0735, 125.6130);

        $response = $this->actingAs($user)->postJson('/api/v1/reviews', [
            'place_id' => 'ChIJ_test',
            'rating' => 5,
            'lat' => 7.0735,
            'lng' => 125.6130,
        ]);

        $response->assertStatus(201)->assertJsonPath('data.visit_verified', true);
    }

    public function test_a_review_is_not_visit_verified_when_the_user_is_far_from_the_place(): void
    {
        $user = User::factory()->create();
        $this->fakeGooglePlaceDetails('ChIJ_test', 7.0735, 125.6130);

        $response = $this->actingAs($user)->postJson('/api/v1/reviews', [
            'place_id' => 'ChIJ_test',
            'rating' => 5,
            'lat' => 8.0,
            'lng' => 126.0,
        ]);

        $response->assertStatus(201)->assertJsonPath('data.visit_verified', false);
    }

    public function test_a_user_cannot_review_the_same_place_twice(): void
    {
        $user = User::factory()->create();
        $place = Place::create(['google_place_id' => 'ChIJ_test']);
        Review::create(['user_id' => $user->id, 'place_id' => $place->id, 'rating' => 3]);

        $response = $this->actingAs($user)->postJson('/api/v1/reviews', ['place_id' => 'ChIJ_test', 'rating' => 5]);

        $response->assertStatus(422)->assertJsonPath('success', false);
        $this->assertDatabaseCount('reviews', 1);
    }

    public function test_it_requires_a_rating_between_one_and_five(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/api/v1/reviews', ['place_id' => 'ChIJ_test', 'rating' => 6])
            ->assertStatus(422);
    }

    public function test_a_user_can_update_their_own_review(): void
    {
        $user = User::factory()->create();
        $place = Place::create(['google_place_id' => 'ChIJ_test']);
        $review = Review::create(['user_id' => $user->id, 'place_id' => $place->id, 'rating' => 3, 'comment' => 'Meh']);

        $response = $this->actingAs($user)->putJson("/api/v1/reviews/{$review->id}", ['rating' => 5, 'comment' => 'Actually great']);

        $response->assertStatus(200)->assertJsonPath('data.rating', 5);
        $this->assertDatabaseHas('reviews', ['id' => $review->id, 'rating' => 5, 'comment' => 'Actually great']);
    }

    public function test_a_user_cannot_update_another_users_review(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $place = Place::create(['google_place_id' => 'ChIJ_test']);
        $review = Review::create(['user_id' => $owner->id, 'place_id' => $place->id, 'rating' => 3]);

        $this->actingAs($otherUser)->putJson("/api/v1/reviews/{$review->id}", ['rating' => 1])->assertStatus(403);
    }

    public function test_a_user_can_delete_their_own_review(): void
    {
        $user = User::factory()->create();
        $place = Place::create(['google_place_id' => 'ChIJ_test']);
        $review = Review::create(['user_id' => $user->id, 'place_id' => $place->id, 'rating' => 3]);

        $this->actingAs($user)->deleteJson("/api/v1/reviews/{$review->id}")->assertStatus(200);

        $this->assertDatabaseCount('reviews', 0);
    }

    public function test_a_user_cannot_delete_another_users_review(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $place = Place::create(['google_place_id' => 'ChIJ_test']);
        $review = Review::create(['user_id' => $owner->id, 'place_id' => $place->id, 'rating' => 3]);

        $this->actingAs($otherUser)->deleteJson("/api/v1/reviews/{$review->id}")->assertStatus(403);
        $this->assertDatabaseCount('reviews', 1);
    }

    public function test_a_guest_cannot_list_their_own_reviews(): void
    {
        $this->getJson('/api/v1/reviews/mine')->assertStatus(401);
    }

    public function test_a_user_can_list_their_own_reviews(): void
    {
        $user = User::factory()->create();
        $this->fakeGooglePlaceDetails('ChIJ_test');
        $place = Place::create(['google_place_id' => 'ChIJ_test']);
        Review::create(['user_id' => $user->id, 'place_id' => $place->id, 'rating' => 4, 'comment' => 'Nice spot']);

        $response = $this->actingAs($user)->getJson('/api/v1/reviews/mine');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.0.rating', 4)
            ->assertJsonPath('data.0.place.place_id', 'ChIJ_test')
            ->assertJsonPath('data.0.place.name', 'Common Grounds Coffee');
    }

    public function test_listing_own_reviews_is_scoped_to_the_authenticated_user(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $place = Place::create(['google_place_id' => 'ChIJ_test']);
        Review::create(['user_id' => $owner->id, 'place_id' => $place->id, 'rating' => 4]);

        $response = $this->actingAs($otherUser)->getJson('/api/v1/reviews/mine');

        $response->assertStatus(200)->assertJsonCount(0, 'data');
    }

    public function test_a_guest_cannot_check_arrival(): void
    {
        $this->postJson('/api/v1/reviews/arrival-check', ['place_id' => 'ChIJ_test', 'lat' => 7.0735, 'lng' => 125.6130])
            ->assertStatus(401);
    }

    public function test_a_user_can_check_arrival_and_is_verified_when_near(): void
    {
        $user = User::factory()->create();
        $this->fakeGooglePlaceDetails('ChIJ_test', 7.0735, 125.6130);

        $response = $this->actingAs($user)->postJson('/api/v1/reviews/arrival-check', [
            'place_id' => 'ChIJ_test',
            'lat' => 7.0735,
            'lng' => 125.6130,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.verified', true)
            ->assertJsonPath('data.place_name', 'Common Grounds Coffee');
    }

    public function test_arrival_check_is_not_verified_when_far_away(): void
    {
        $user = User::factory()->create();
        $this->fakeGooglePlaceDetails('ChIJ_test', 7.0735, 125.6130);

        $response = $this->actingAs($user)->postJson('/api/v1/reviews/arrival-check', [
            'place_id' => 'ChIJ_test',
            'lat' => 8.0,
            'lng' => 126.0,
        ]);

        $response->assertStatus(200)->assertJsonPath('data.verified', false);
    }

    public function test_arrival_check_returns_404_when_the_place_cannot_be_found(): void
    {
        $user = User::factory()->create();
        Http::fake(['*/places/ChIJ_missing' => Http::response([], 404)]);

        $this->actingAs($user)->postJson('/api/v1/reviews/arrival-check', [
            'place_id' => 'ChIJ_missing',
            'lat' => 7.0735,
            'lng' => 125.6130,
        ])->assertStatus(404);
    }
}