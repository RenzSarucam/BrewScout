<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = [
        'user_id',
        'place_id',
        'rating',
        'comment',
        'visit_verified',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'visit_verified' => 'boolean',
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

    public function reports()
    {
        return $this->hasMany(Report::class);
    }
}
