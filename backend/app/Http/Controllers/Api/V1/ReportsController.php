<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Reports\StoreReportRequest;
use App\Models\Report;
use Illuminate\Http\JsonResponse;

class ReportsController extends Controller
{
    public function store(StoreReportRequest $request): JsonResponse
    {
        $report = Report::create([
            'user_id' => $request->user()->id,
            'review_id' => $request->integer('review_id'),
            'reason' => $request->string('reason')->toString(),
            'description' => $request->input('description'),
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $report->id,
                'status' => $report->status,
            ],
        ], 201);
    }
}
