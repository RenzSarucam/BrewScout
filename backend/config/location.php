<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Arrival Verification Radius
    |--------------------------------------------------------------------------
    |
    | How close (in meters) a user's reported location must be to a coffee
    | shop for "I'm Here" to consider the visit location-verified. This only
    | proves proximity, never an actual purchase — see LocationVerificationService.
    |
    */

    'arrival_radius_meters' => (int) env('ARRIVAL_RADIUS_METERS', 100),

];
