<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SavedPlace extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'place_id',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
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
