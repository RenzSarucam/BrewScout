<?php

namespace App\Http\Requests\Places;

use Illuminate\Foundation\Http\FormRequest;

class NearbyPlacesRequest extends FormRequest
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
            'lat' => ['required', 'numeric', 'between:-90,90'],
            'lng' => ['required', 'numeric', 'between:-180,180'],
            'radius' => ['sometimes', 'integer', 'min:100', 'max:50000'],
            'min_rating' => ['sometimes', 'numeric', 'min:0', 'max:5'],
            'open_now' => ['sometimes', 'boolean'],
            'keyword' => ['sometimes', 'string', 'max:255'],
        ];
    }
}
