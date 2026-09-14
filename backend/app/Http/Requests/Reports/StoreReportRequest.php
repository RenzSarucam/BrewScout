<?php

namespace App\Http\Requests\Reports;

use Illuminate\Foundation\Http\FormRequest;

class StoreReportRequest extends FormRequest
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
            'review_id' => ['required', 'integer', 'exists:reviews,id'],
            'reason' => ['required', 'string', 'in:spam,harassment,fake_content,offensive_content,other'],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
