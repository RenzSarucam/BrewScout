<?php

namespace Tests\Unit;

use App\Services\RecommendationService;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class RecommendationServiceTest extends TestCase
{
    private RecommendationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new RecommendationService;
    }

    private function place(array $overrides = []): array
    {
        return array_merge([
            'place_id' => 'place-'.uniqid(),
            'name' => 'Some Coffee Shop',
            'address' => '123 Main St',
            'rating' => 4.0,
            'review_count' => 50,
            'price_level' => 2,
            'open_now' => true,
            'distance_meters' => 1000,
            'location' => ['lat' => 7.07, 'lng' => 125.61],
            'photo' => 'https://example.com/photo.jpg',
        ], $overrides);
    }

    #[Test]
    public function it_returns_an_empty_array_for_no_places(): void
    {
        $this->assertSame([], $this->service->rank([], 5000));
    }

    #[Test]
    public function every_place_gets_a_recommendation_score_between_0_and_100(): void
    {
        $places = [
            $this->place(['rating' => 5.0, 'review_count' => 1000]),
            $this->place(['rating' => null, 'review_count' => 0, 'photo' => null, 'address' => null]),
        ];

        $ranked = $this->service->rank($places, 5000);

        foreach ($ranked as $place) {
            $this->assertGreaterThanOrEqual(0, $place['recommendation_score']);
            $this->assertLessThanOrEqual(100, $place['recommendation_score']);
        }
    }

    #[Test]
    public function higher_rated_places_score_higher_all_else_equal(): void
    {
        $great = $this->place(['rating' => 4.9]);
        $poor = $this->place(['rating' => 2.5]);

        $ranked = $this->service->rank([$poor, $great], 5000);

        $this->assertSame($great['place_id'], $ranked[0]['place_id']);
        $this->assertGreaterThan($ranked[1]['recommendation_score'], $ranked[0]['recommendation_score']);
    }

    #[Test]
    public function closer_places_score_higher_all_else_equal(): void
    {
        $near = $this->place(['distance_meters' => 200]);
        $far = $this->place(['distance_meters' => 4800]);

        $ranked = $this->service->rank([$far, $near], 5000);

        $this->assertSame($near['place_id'], $ranked[0]['place_id']);
    }

    #[Test]
    public function open_places_score_higher_than_closed_ones_all_else_equal(): void
    {
        $open = $this->place(['open_now' => true]);
        $closed = $this->place(['open_now' => false]);

        $ranked = $this->service->rank([$closed, $open], 5000);

        $this->assertSame($open['place_id'], $ranked[0]['place_id']);
    }

    #[Test]
    public function results_are_sorted_by_score_descending(): void
    {
        $places = [
            $this->place(['rating' => 3.0, 'review_count' => 10]),
            $this->place(['rating' => 4.8, 'review_count' => 900]),
            $this->place(['rating' => 4.2, 'review_count' => 200]),
        ];

        $ranked = $this->service->rank($places, 5000);
        $scores = array_column($ranked, 'recommendation_score');

        $sorted = $scores;
        rsort($sorted);

        $this->assertSame($sorted, $scores);
    }

    #[Test]
    public function the_top_result_is_labeled_best_overall(): void
    {
        $places = [
            $this->place(['rating' => 3.0]),
            $this->place(['rating' => 4.9]),
        ];

        $ranked = $this->service->rank($places, 5000);

        $this->assertSame('Best Overall', $ranked[0]['badge']);
    }

    #[Test]
    public function highest_rated_closest_and_most_popular_get_distinct_badges(): void
    {
        // A balanced all-rounder that wins "Best Overall" outright, plus three
        // specialists that are each weak everywhere except their one category —
        // otherwise the specialist would legitimately win Best Overall too and
        // (correctly) keep that badge instead of its category-specific one.
        $allRounder = $this->place(['rating' => 4.0, 'review_count' => 100, 'distance_meters' => 1000]);
        $highestRated = $this->place(['rating' => 5.0, 'review_count' => 1, 'distance_meters' => 4900]);
        $closest = $this->place(['rating' => 2.5, 'review_count' => 1, 'distance_meters' => 10]);
        $mostPopular = $this->place(['rating' => 2.0, 'review_count' => 5000, 'distance_meters' => 4900]);

        $ranked = $this->service->rank([$allRounder, $highestRated, $closest, $mostPopular], 5000);
        $badgesByPlaceId = array_column($ranked, 'badge', 'place_id');

        $this->assertSame('Best Overall', $badgesByPlaceId[$allRounder['place_id']]);
        $this->assertSame('Highest Rated', $badgesByPlaceId[$highestRated['place_id']]);
        $this->assertSame('Closest', $badgesByPlaceId[$closest['place_id']]);
        $this->assertSame('Popular Nearby', $badgesByPlaceId[$mostPopular['place_id']]);
    }

    #[Test]
    public function a_single_place_only_gets_the_best_overall_badge(): void
    {
        $ranked = $this->service->rank([$this->place()], 5000);

        $this->assertSame('Best Overall', $ranked[0]['badge']);
    }

    #[Test]
    public function it_never_labels_anything_as_an_official_google_score(): void
    {
        $ranked = $this->service->rank([$this->place(), $this->place()], 5000);

        foreach ($ranked as $place) {
            if ($place['badge'] !== null) {
                $this->assertStringNotContainsStringIgnoringCase('google', $place['badge']);
            }
        }
    }
}
