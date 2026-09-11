<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Places\GeocodeRequest;
use App\Http\Requests\Places\NearbyPlacesRequest;
use App\Services\GoogleGeocodingService;
use App\Services\GooglePlacesService;
use App\Services\RecommendationService;
use App\Support\PlaceNormalizer;
use Illuminate\Http\JsonResponse;

class PlacesController extends Controller
{
    public function __construct(
        private readonly GooglePlacesService $places,
        private readonly GoogleGeocodingService $geocoding,
        private readonly RecommendationService $recommendations,
    ) {}

    public function geocode(GeocodeRequest $request): JsonResponse
    {
        $result = $this->geocoding->geocode($request->string('query')->toString());

        if (! $result) {
            return response()->json([
                'success' => false,
                'message' => 'We couldn\'t find that location.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    public function nearby(NearbyPlacesRequest $request): JsonResponse
    {
        $lat = (float) $request->input('lat');
        $lng = (float) $request->input('lng');
        $radius = (int) $request->input('radius', 5000);
        $keyword = $request->string('keyword')->toString();

        $rawPlaces = $keyword !== ''
            ? $this->places->textSearch($keyword, $lat, $lng, $radius)
            : $this->places->nearbySearch($lat, $lng, $radius);

        $results = collect($rawPlaces)
            ->map(fn (array $place) => PlaceNormalizer::summary($place, $this->places, $lat, $lng));

        if ($request->filled('min_rating')) {
            $minRating = (float) $request->input('min_rating');
            $results = $results->filter(fn (array $place) => ($place['rating'] ?? 0) >= $minRating);
        }

        if ($request->boolean('open_now')) {
            $results = $results->filter(fn (array $place) => $place['open_now'] === true);
        }

        $ranked = $this->recommendations->rank($results->values()->all(), $radius);

        return response()->json([
            'success' => true,
            'data' => $ranked,
        ]);
    }

    public function show(string $googlePlaceId): JsonResponse
    {
        $place = $this->places->getPlaceDetails($googlePlaceId);

        if (! $place) {
            return response()->json([
                'success' => false,
                'message' => 'Coffee shop not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => PlaceNormalizer::details($place, $this->places),
        ]);
    }
}
