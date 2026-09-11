<?php

namespace App\Http\Requests\SavedPlaces;

use Illuminate\Foundation\Http\FormRequest;

class SavePlaceRequest extends FormRequest
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
            'place_id' => ['required', 'string', 'max:255'],
        ];
    }
}
