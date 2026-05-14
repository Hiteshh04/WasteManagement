<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

/**
 * ReportController - Handles waste report operations
 * 
 * Responsibilities:
 * - Create new waste reports with image upload
 * - Retrieve reports (by user, pending, completed, all)
 * - Get single report details
 */
class ReportController extends Controller
{
    /**
     * Create a new waste report
     * 
     * Student submits:
     * - Image file (base64 or file upload)
     * - Geolocation (latitude, longitude)
     * - Waste details (type, smell, severity, notes)
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function create(Request $request)
    {
        try {
            // Validate the request
            $request->validate([
                'image' => 'required|string',              // Base64 encoded image or file
                'latitude' => 'required|numeric',          // GPS latitude
                'longitude' => 'required|numeric',         // GPS longitude
                'waste_type' => 'required|string',         // Type of waste
                'smell' => 'required|boolean',             // Is there smell?
                'severity' => 'required|in:low,medium,high,critical', // Severity level
                'note' => 'nullable|string|max:500',       // Additional notes
            ]);

            // Get current user
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 401);
            }

            /**
             * Upload image to Cloudinary
             * 
             * The image comes as base64 from browser camera capture
             * We upload to Cloudinary and get a secure URL
             */
            try {
                // Convert base64 to uploadable format
                $imageData = $request->input('image');
                
                // Upload to Cloudinary with public_id and folder
                $uploadedFile = cloudinary()->uploadApi()->upload($imageData, [
                    'folder' => env('CLOUDINARY_UPLOAD_FOLDER', 'waste_management/reports'),
                    'resource_type' => 'auto',
                ]);

                $imageUrl = $uploadedFile['secure_url'];

            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Image upload failed',
                    'error' => $e->getMessage(),
                ], 400);
            }

            /**
             * Create the report in MongoDB
             * Status starts as 'pending' - supervisor will change it to 'completed'
             */
            $report = Report::create([
                'image_url' => $imageUrl,
                'latitude' => $request->input('latitude'),
                'longitude' => $request->input('longitude'),
                'waste_type' => $request->input('waste_type'),
                'smell' => $request->input('smell'),
                'severity' => $request->input('severity'),
                'note' => $request->input('note'),
                'status' => 'pending',  // Initially pending
                'reported_by' => $user->_id,  // Store user's MongoDB ID
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Report created successfully',
                'report' => [
                    'id' => $report->_id,
                    'image_url' => $report->image_url,
                    'latitude' => $report->latitude,
                    'longitude' => $report->longitude,
                    'waste_type' => $report->waste_type,
                    'smell' => $report->smell,
                    'severity' => $report->severity,
                    'status' => $report->status,
                    'created_at' => $report->created_at,
                ],
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Report creation failed',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get all reports by current user (student)
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUserReports(Request $request)
    {
        try {
            // Get current user
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 401);
            }

            /**
             * Fetch all reports submitted by this user
             * Order by newest first
             */
            $reports = Report::where('reported_by', $user->_id)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'count' => count($reports),
                'reports' => $reports,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch reports',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get single report by ID
     * Both students and supervisors can view
     * 
     * @param string $id - Report MongoDB ID
     * @return \Illuminate\Http\JsonResponse
     */
    public function getReport($id)
    {
        try {
            // Find report by MongoDB ID
            $report = Report::find($id);

            if (!$report) {
                return response()->json([
                    'success' => false,
                    'message' => 'Report not found',
                ], 404);
            }

            // Include completion info if report is completed
            $response = $report->toArray();
            if ($report->status === 'completed' && $report->completion) {
                $response['completion'] = $report->completion;
            }

            return response()->json([
                'success' => true,
                'report' => $response,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch report',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get all pending reports (for supervisors)
     * Sorted by oldest first (oldest reports prioritized)
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPendingReports()
    {
        try {
            // Fetch pending reports ordered by oldest first
            $reports = Report::where('status', 'pending')
                ->orderBy('created_at', 'asc')  // Oldest first
                ->get();

            return response()->json([
                'success' => true,
                'count' => count($reports),
                'reports' => $reports,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch pending reports',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get all completed reports (for supervisors)
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCompletedReports()
    {
        try {
            // Fetch completed reports
            $reports = Report::where('status', 'completed')
                ->with('completion')  // Include completion data
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'count' => count($reports),
                'reports' => $reports,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch completed reports',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get all reports (public or for analytics)
     * This might be used for public dashboard or statistics
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAllReports()
    {
        try {
            // Fetch all reports with counts by status
            $reports = Report::orderBy('created_at', 'desc')->get();
            
            $stats = [
                'total' => count($reports),
                'pending' => Report::where('status', 'pending')->count(),
                'completed' => Report::where('status', 'completed')->count(),
            ];

            return response()->json([
                'success' => true,
                'stats' => $stats,
                'reports' => $reports,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch reports',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Revoke (delete) a report
     * Only the reporter can revoke their own report, and only if it's still pending.
     * 
     * @param string $id - Report ID
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id, Request $request)
    {
        try {
            $user = $request->user();
            $report = Report::find($id);

            if (!$report) {
                return response()->json([
                    'success' => false,
                    'message' => 'Report not found',
                ], 404);
            }

            // Check if user is the owner
            if ($report->reported_by !== $user->_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. You can only revoke your own reports.',
                ], 403);
            }

            // Check if report is already completed
            if ($report->status === 'completed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot revoke a report that has already been completed.',
                ], 400);
            }

            // Delete the report
            $report->delete();

            return response()->json([
                'success' => true,
                'message' => 'Report revoked successfully.',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to revoke report',
                'error' => $e->getMessage(),
            ], 400);
        }
    }
}
