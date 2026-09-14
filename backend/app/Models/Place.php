<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Place extends Model
{
    protected $fillable = [
        'google_place_id',
    ];

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}
