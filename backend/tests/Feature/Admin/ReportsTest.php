<?php

namespace Tests\Feature\Admin;

use App\Models\Place;
use App\Models\Report;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportsTest extends TestCase
{
    use RefreshDatabase;

    private function makeReport(string $status = 'pending'): Report
    {
        $author = User::factory()->create(['name' => 'Review Author']);
        $reporter = User::factory()->create(['name' => 'Concerned User']);
        $place = Place::firstOrCreate(['google_place_id' => 'ChIJ_test']);
        $review = Review::create(['user_id' => $author->id, 'place_id' => $place->id, 'rating' => 1, 'comment' => 'Bad review']);

        return Report::create([
            'user_id' => $reporter->id,
            'review_id' => $review->id,
            'reason' => 'spam',
            'description' => 'Looks like spam.',
            'status' => $status,
        ]);
    }

    public function test_a_guest_cannot_list_reports(): void
    {
        $this->getJson('/api/v1/admin/reports')->assertStatus(401);
    }

    public function test_a_regular_user_cannot_list_reports(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->getJson('/api/v1/admin/reports')->assertStatus(403);
    }

    public function test_an_admin_can_list_reports(): void
    {
        $admin = User::factory()->admin()->create();
        $report = $this->makeReport();

        $response = $this->actingAs($admin)->getJson('/api/v1/admin/reports');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.0.id', $report->id)
            ->assertJsonPath('data.0.reason', 'spam')
            ->assertJsonPath('data.0.reporter.name', 'Concerned User')
            ->assertJsonPath('data.0.review.author.name', 'Review Author')
            ->assertJsonPath('data.0.review.place_id', 'ChIJ_test');
    }

    public function test_an_admin_can_filter_reports_by_status(): void
    {
        $admin = User::factory()->admin()->create();
        $this->makeReport('pending');
        $this->makeReport('dismissed');

        $response = $this->actingAs($admin)->getJson('/api/v1/admin/reports?status=dismissed');

        $response->assertStatus(200)->assertJsonCount(1, 'data')->assertJsonPath('data.0.status', 'dismissed');
    }

    public function test_a_guest_cannot_update_a_report_status(): void
    {
        $report = $this->makeReport();

        $this->patchJson("/api/v1/admin/reports/{$report->id}", ['status' => 'resolved'])->assertStatus(401);
    }

    public function test_a_regular_user_cannot_update_a_report_status(): void
    {
        $user = User::factory()->create();
        $report = $this->makeReport();

        $this->actingAs($user)->patchJson("/api/v1/admin/reports/{$report->id}", ['status' => 'resolved'])
            ->assertStatus(403);
    }

    public function test_an_admin_can_update_a_report_status(): void
    {
        $admin = User::factory()->admin()->create();
        $report = $this->makeReport();

        $response = $this->actingAs($admin)->patchJson("/api/v1/admin/reports/{$report->id}", ['status' => 'resolved']);

        $response->assertStatus(200)->assertJsonPath('data.status', 'resolved');
        $this->assertDatabaseHas('reports', ['id' => $report->id, 'status' => 'resolved']);
    }

    public function test_it_rejects_an_invalid_status(): void
    {
        $admin = User::factory()->admin()->create();
        $report = $this->makeReport();

        $this->actingAs($admin)->patchJson("/api/v1/admin/reports/{$report->id}", ['status' => 'not_a_status'])
            ->assertStatus(422);
    }

    public function test_an_admin_can_delete_the_reported_review(): void
    {
        $admin = User::factory()->admin()->create();
        $report = $this->makeReport();
        $reviewId = $report->review_id;

        $this->actingAs($admin)->deleteJson("/api/v1/reviews/{$reviewId}")->assertStatus(200);

        $this->assertDatabaseMissing('reviews', ['id' => $reviewId]);
        $this->assertDatabaseMissing('reports', ['id' => $report->id]);
    }
}
