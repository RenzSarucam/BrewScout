<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RouteSession extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'place_id',
        'travel_mode',
        'origin_lat',
        'origin_lng',
        'destination_lat',
        'destination_lng',
        'estimated_distance',
        'estimated_duration',
        'started_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function place()
    {
        return $this->belongsTo(Place::class);
    }
}
