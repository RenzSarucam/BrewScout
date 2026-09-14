<?php

namespace App\Services;

use App\Support\Distance;

class LocationVerificationService
{
    /**
     * Whether a reported location is close enough to a place to count as a
     * "location-verified" visit. This only proves proximity — never that a
     * purchase happened — so callers must not describe it as a verified
     * customer or purchase.
     */
    public function verifyArrival(float $userLat, float $userLng, float $placeLat, float $placeLng): bool
    {
        return $this->distanceMeters($userLat, $userLng, $placeLat, $placeLng) <= $this->arrivalRadiusMeters();
    }

    public function distanceMeters(float $userLat, float $userLng, float $placeLat, float $placeLng): int
    {
        return (int) round(Distance::haversineMeters($userLat, $userLng, $placeLat, $placeLng));
    }

    public function arrivalRadiusMeters(): int
    {
        return config('location.arrival_radius_meters');
    }
}
