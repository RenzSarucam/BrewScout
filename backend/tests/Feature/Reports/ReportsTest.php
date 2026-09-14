<?php

namespace Tests\Feature\Reports;

use App\Models\Place;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportsTest extends TestCase
{
    use RefreshDatabase;

    private function makeReview(): Review
    {
        $author = User::factory()->create();
        $place = Place::create(['google_place_id' => 'ChIJ_test']);

        return Review::create(['user_id' => $author->id, 'place_id' => $place->id, 'rating' => 1, 'comment' => 'Bad review']);
    }

    public function test_a_guest_cannot_report_a_review(): void
    {
        $review = $this->makeReview();

        $this->postJson('/api/v1/reports', ['review_id' => $review->id, 'reason' => 'spam'])->assertStatus(401);
    }

    public function test_a_user_can_report_a_review(): void
    {
        $user = User::factory()->create();
        $review = $this->makeReview();

        $response = $this->actingAs($user)->postJson('/api/v1/reports', [
            'review_id' => $review->id,
            'reason' => 'harassment',
            'description' => 'This is abusive.',
        ]);

        $response->assertStatus(201)->assertJsonPath('success', true)->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('reports', [
            'user_id' => $user->id,
            'review_id' => $review->id,
            'reason' => 'harassment',
            'status' => 'pending',
        ]);
    }

    public function test_it_rejects_an_invalid_reason(): void
    {
        $user = User::factory()->create();
        $review = $this->makeReview();

        $this->actingAs($user)->postJson('/api/v1/reports', ['review_id' => $review->id, 'reason' => 'not_a_reason'])
            ->assertStatus(422);
    }

    public function test_it_requires_the_review_to_exist(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/api/v1/reports', ['review_id' => 999999, 'reason' => 'spam'])
            ->assertStatus(422);
    }
}