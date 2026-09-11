<?php

namespace App\Http\Requests\Routes;

use Illuminate\Foundation\Http\FormRequest;

class ComputeRouteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'origin' => ['required', 'array'],
            'origin.lat' => ['required', 'numeric', 'between:-90,90'],
            'origin.lng' => ['required', 'numeric', 'between:-180,180'],
            'destination' => ['required', 'array'],
            'destination.lat' => ['required', 'numeric', 'between:-90,90'],
            'destination.lng' => ['required', 'numeric', 'between:-180,180'],
            'travel_mode' => ['required', 'string', 'in:WALK,TWO_WHEELER,DRIVE'],
            'place_id' => ['sometimes', 'string', 'max:255'],
        ];
    }
}
