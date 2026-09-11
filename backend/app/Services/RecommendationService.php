<?php

namespace App\Services;

class RecommendationService
{
    private const WEIGHT_RATING = 0.35;

    private const WEIGHT_REVIEW_COUNT = 0.15;

    private const WEIGHT_DISTANCE = 0.20;

    private const WEIGHT_POPULARITY = 0.10;

    private const WEIGHT_OPEN_STATUS = 0.05;

    private const WEIGHT_TRAVEL_TIME = 0.10;

    private const WEIGHT_DATA_QUALITY = 0.05;

    /** Review counts at or above this are treated as "maxed out" for scoring. */
    private const REVIEW_COUNT_CAP = 500;

    /**
     * Score and sort a set of normalized place summaries, then attach a
     * handful of "Brew Scout Recommendation" labels (never an official
     * Google score) to the standout results.
     *
     * @param  array<int, array<string, mixed>>  $places
     * @return array<int, array<string, mixed>>
     */
    public function rank(array $places, int $searchRadiusMeters): array
    {
        if (empty($places)) {
            return [];
        }

        $maxReviewCount = max(array_map(fn (array $p) => $p['review_count'] ?? 0, $places)) ?: 1;

        $scored = array_map(
            fn (array $place) => $this->score($place, $searchRadiusMeters, $maxReviewCount),
            $places
        );

        usort($scored, fn (array $a, array $b) => $b['recommendation_score'] <=> $a['recommendation_score']);

        return $this->assignBadges($scored);
    }

    /**
     * @param  array<string, mixed>  $place
     * @return array<string, mixed>
     */
    private function score(array $place, int $searchRadiusMeters, int $maxReviewCount): array
    {
        $ratingScore = $this->ratingScore($place['rating'] ?? null);
        $reviewScore = $this->reviewScore($place['review_count'] ?? 0);
        $distanceScore = $this->distanceScore($place['distance_meters'] ?? null, $searchRadiusMeters);
        $popularityScore = $this->popularityScore($place['review_count'] ?? 0, $maxReviewCount);
        $openScore = $this->openScore($place['open_now'] ?? null);
        // Real travel time comes from the Routes API (a later phase). Distance
        // is a reasonable stand-in until then — closer places are faster to
        // reach on foot or by car in the vast majority of cases.
        $travelScore = $distanceScore;
        $dataQualityScore = $this->dataQualityScore($place);

        $finalScore = $ratingScore * self::WEIGHT_RATING
            + $reviewScore * self::WEIGHT_REVIEW_COUNT
            + $distanceScore * self::WEIGHT_DISTANCE
            + $popularityScore * self::WEIGHT_POPULARITY
            + $openScore * self::WEIGHT_OPEN_STATUS
            + $travelScore * self::WEIGHT_TRAVEL_TIME
            + $dataQualityScore * self::WEIGHT_DATA_QUALITY;

        $place['recommendation_score'] = round($finalScore, 2);
        $place['badge'] = null;

        return $place;
    }

    private function ratingScore(?float $rating): float
    {
        if ($rating === null) {
            return 0.0;
        }

        return $this->clamp(($rating / 5) * 100);
    }

    private function reviewScore(int $reviewCount): float
    {
        if ($reviewCount <= 0) {
            return 0.0;
        }

        $capped = min($reviewCount, self::REVIEW_COUNT_CAP);

        return $this->clamp((log10($capped + 1) / log10(self::REVIEW_COUNT_CAP + 1)) * 100);
    }

    private function distanceScore(?int $distanceMeters, int $searchRadiusMeters): float
    {
        if ($distanceMeters === null || $searchRadiusMeters <= 0) {
            return 50.0;
        }

        return $this->clamp(100 - ($distanceMeters / $searchRadiusMeters) * 100);
    }

    private function popularityScore(int $reviewCount, int $maxReviewCount): float
    {
        if ($reviewCount <= 0 || $maxReviewCount <= 0) {
            return 0.0;
        }

        return $this->clamp(($reviewCount / $maxReviewCount) * 100);
    }

    private function openScore(?bool $openNow): float
    {
        return match ($openNow) {
            true => 100.0,
            false => 0.0,
            default => 50.0,
        };
    }

    /**
     * @param  array<string, mixed>  $place
     */
    private function dataQualityScore(array $place): float
    {
        $checks = [
            ! empty($place['photo']),
            ! empty($place['address']),
            ($place['rating'] ?? null) !== null,
            ($place['review_count'] ?? 0) > 0,
        ];

        $present = count(array_filter($checks));

        return $this->clamp(($present / count($checks)) * 100);
    }

    private function clamp(float $value, float $min = 0, float $max = 100): float
    {
        return max($min, min($max, $value));
    }

    /**
     * @param  array<int, array<string, mixed>>  $places
     * @return array<int, array<string, mixed>>
     */
    private function assignBadges(array $places): array
    {
        if (empty($places)) {
            return $places;
        }

        $bestOverallIndex = 0;

        $highestRatedIndex = $this->indexOfMax($places, fn (array $p) => $p['rating'] ?? -1);
        $closestIndex = $this->indexOfMin($places, fn (array $p) => $p['distance_meters'] ?? PHP_INT_MAX);
        $popularIndex = $this->indexOfMax($places, fn (array $p) => $p['review_count'] ?? 0);

        $places[$bestOverallIndex]['badge'] = 'Best Overall';

        if ($highestRatedIndex !== null && $places[$highestRatedIndex]['badge'] === null && ($places[$highestRatedIndex]['rating'] ?? null) !== null) {
            $places[$highestRatedIndex]['badge'] = 'Highest Rated';
        }

        if ($closestIndex !== null && $places[$closestIndex]['badge'] === null && ($places[$closestIndex]['distance_meters'] ?? null) !== null) {
            $places[$closestIndex]['badge'] = 'Closest';
        }

        if ($popularIndex !== null && $places[$popularIndex]['badge'] === null && ($places[$popularIndex]['review_count'] ?? 0) > 0) {
            $places[$popularIndex]['badge'] = 'Popular Nearby';
        }

        return $places;
    }

    /**
     * @param  array<int, array<string, mixed>>  $places
     * @param  callable(array<string, mixed>): (int|float)  $value
     */
    private function indexOfMax(array $places, callable $value): ?int
    {
        $bestIndex = null;
        $bestValue = -INF;

        foreach ($places as $index => $place) {
            $current = $value($place);
            if ($current > $bestValue) {
                $bestValue = $current;
                $bestIndex = $index;
            }
        }

        return $bestIndex;
    }

    /**
     * @param  array<int, array<string, mixed>>  $places
     * @param  callable(array<string, mixed>): (int|float)  $value
     */
    private function indexOfMin(array $places, callable $value): ?int
    {
        $bestIndex = null;
        $bestValue = INF;

        foreach ($places as $index => $place) {
            $current = $value($place);
            if ($current < $bestValue) {
                $bestValue = $current;
                $bestIndex = $index;
            }
        }

        return $bestIndex;
    }
}
