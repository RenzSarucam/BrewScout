<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\SavedPlaces\SavePlaceRequest;
use App\Models\Place;
use App\Models\SavedPlace;
use App\Services\GooglePlacesService;
use App\Services\RecommendationService;
use App\Support\PlaceNormalizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SavedPlacesController extends Controller
{
    /** Used only to keep badge/scoring behavior consistent with search results. */
    private const DEFAULT_RANKING_RADIUS = 5000;

    public function __construct(
        private readonly GooglePlacesService $places,
        private readonly RecommendationService $recommendations,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $savedPlaces = $request->user()
            ->savedPlaces()
            ->with('place')
            ->latest('created_at')
            ->get();

        $results = $savedPlaces
            ->map(function (SavedPlace $savedPlace) {
                $raw = $this->places->getPlaceDetails($savedPlace->place->google_place_id);

                return $raw ? PlaceNormalizer::summary($raw, $this->places) : null;
            })
            ->filter()
            ->values()
            ->all();

        $ranked = $this->recommendations->rank($results, self::DEFAULT_RANKING_RADIUS);

        return response()->json([
            'success' => true,
            'data' => $ranked,
        ]);
    }

    public function store(SavePlaceRequest $request): JsonResponse
    {
        $place = Place::firstOrCreate(['google_place_id' => $request->string('place_id')->toString()]);

        SavedPlace::firstOrCreate([
            'user_id' => $request->user()->id,
            'place_id' => $place->id,
        ]);

        return response()->json([
            'success' => true,
            'data' => null,
        ], 201);
    }

    public function destroy(Request $request, string $googlePlaceId): JsonResponse
    {
        $place = Place::where('google_place_id', $googlePlaceId)->first();

        if ($place) {
            SavedPlace::where('user_id', $request->user()->id)
                ->where('place_id', $place->id)
                ->delete();
        }

        return response()->json([
            'success' => true,
            'data' => null,
        ]);
    }
}
