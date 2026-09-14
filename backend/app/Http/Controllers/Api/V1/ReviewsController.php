<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Reviews\ArrivalCheckRequest;
use App\Http\Requests\Reviews\StoreReviewRequest;
use App\Http\Requests\Reviews\UpdateReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Place;
use App\Models\Review;
use App\Services\GooglePlacesService;
use App\Services\LocationVerificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewsController extends Controller
{
    public function __construct(
        private readonly GooglePlacesService $places,
        private readonly LocationVerificationService $verification,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $request->validate(['place_id' => ['required', 'string', 'max:255']]);

        $place = Place::where('google_place_id', $request->query('place_id'))->first();
        $reviews = $place
            ? $place->reviews()->with('user')->latest()->get()
            : collect();

        return response()->json([
            'success' => true,
            'data' => ReviewResource::collection($reviews),
        ]);
    }

    public function store(StoreReviewRequest $request): JsonResponse
    {
        $place = Place::firstOrCreate(['google_place_id' => $request->string('place_id')->toString()]);

        if (Review::where('user_id', $request->user()->id)->where('place_id', $place->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'You already reviewed this coffee shop. Edit your existing review instead.',
            ], 422);
        }

        $visitVerified = $this->checkVisitVerified($request, $place);

        $review = Review::create([
            'user_id' => $request->user()->id,
            'place_id' => $place->id,
            'rating' => $request->integer('rating'),
            'comment' => $request->input('comment'),
            'visit_verified' => $visitVerified,
        ]);

        return response()->json([
            'success' => true,
            'data' => new ReviewResource($review->load('user')),
        ], 201);
    }

    public function mine(Request $request): JsonResponse
    {
        $reviews = $request->user()->reviews()->with('place')->latest()->get();

        $data = $reviews->map(function (Review $review) {
            $raw = $this->places->getPlaceDetails($review->place->google_place_id);

            return [
                'id' => $review->id,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'visit_verified' => $review->visit_verified,
                'created_at' => $review->created_at,
                'place' => [
                    'place_id' => $review->place->google_place_id,
                    'name' => $raw['displayName']['text'] ?? 'Coffee shop',
                ],
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data->values(),
        ]);
    }

    public function update(UpdateReviewRequest $request, Review $review): JsonResponse
    {
        $this->authorize('update', $review);

        $review->update($request->only('rating', 'comment'));

        return response()->json([
            'success' => true,
            'data' => new ReviewResource($review->load('user')),
        ]);
    }

    public function destroy(Request $request, Review $review): JsonResponse
    {
        $this->authorize('delete', $review);

        $review->delete();

        return response()->json([
            'success' => true,
            'data' => null,
        ]);
    }

    public function checkArrival(ArrivalCheckRequest $request): JsonResponse
    {
        $raw = $this->places->getPlaceDetails($request->string('place_id')->toString());

        if (! $raw || ! isset($raw['location'])) {
            return response()->json([
                'success' => false,
                'message' => 'Coffee shop not found.',
            ], 404);
        }

        $distance = $this->verification->distanceMeters(
            (float) $request->input('lat'),
            (float) $request->input('lng'),
            (float) $raw['location']['latitude'],
            (float) $raw['location']['longitude'],
        );

        return response()->json([
            'success' => true,
            'data' => [
                'verified' => $distance <= $this->verification->arrivalRadiusMeters(),
                'distance_meters' => $distance,
                'place_name' => $raw['displayName']['text'] ?? null,
            ],
        ]);
    }

    private function checkVisitVerified(Request $request, Place $place): bool
    {
        if (! $request->filled('lat') || ! $request->filled('lng')) {
            return false;
        }

        $raw = $this->places->getPlaceDetails($place->google_place_id);

        if (! $raw || ! isset($raw['location'])) {
            return false;
        }

        return $this->verification->verifyArrival(
            (float) $request->input('lat'),
            (float) $request->input('lng'),
            (float) $raw['location']['latitude'],
            (float) $raw['location']['longitude'],
        );
    }
}
