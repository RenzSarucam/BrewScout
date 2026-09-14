<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateReportStatusRequest;
use App\Http\Resources\AdminReportResource;
use App\Models\Report;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'status' => ['sometimes', 'string', 'in:pending,reviewed,resolved,dismissed'],
        ]);

        $reports = Report::with(['user', 'review.user', 'review.place'])
            ->when($request->query('status'), fn ($query, $status) => $query->where('status', $status))
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => AdminReportResource::collection($reports),
        ]);
    }

    public function update(UpdateReportStatusRequest $request, Report $report): JsonResponse
    {
        $report->update(['status' => $request->string('status')->toString()]);

        return response()->json([
            'success' => true,
            'data' => new AdminReportResource($report->load(['user', 'review.user', 'review.place'])),
        ]);
    }
}
