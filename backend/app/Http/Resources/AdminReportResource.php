<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminReportResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reason' => $this->reason,
            'description' => $this->description,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'reporter' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ],
            'review' => $this->review ? [
                'id' => $this->review->id,
                'rating' => $this->review->rating,
                'comment' => $this->review->comment,
                'author' => [
                    'id' => $this->review->user->id,
                    'name' => $this->review->user->name,
                ],
                'place_id' => $this->review->place->google_place_id,
            ] : null,
        ];
    }
}
