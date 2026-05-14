<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\CompletedReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

/**
 * CompletionController - Handles report completion by supervisors
 * 
 * When a supervisor physically visits a waste location:
 * 1. They capture a cleaned area photo
 * 2. Their GPS location is recorded
 * 3. System validates they're within 100m of original location
 * 4. Report is marked as completed
 * 
 * This prevents fake completions from different locations
 */
class CompletionController extends Controller
{
    /**
     * Calculate distance between two GPS coordinates
     * Using Haversine formula for accuracy
     * 
     * @param float $lat1 - Original latitude
     * @param float $lon1 - Original longitude
     * @param float $lat2 - Supervisor latitude
     * @param float $lon2 - Supervisor longitude
     * @return float - Distance in meters
     */
    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        // Haversine formula
        $earthRadiusKm = 6371;

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        $distanceKm = $earthRadiusKm * $c;

        // Convert to meters
        return $distanceKm * 1000;
    }

    /**
     * Validate supervisor location before completion
     * Checks if supervisor is within acceptable distance of original location
     * 
     * @param string $reportId - Report ID to validate
     * @param Request $request - Contains supervisor's current GPS location
     * @return \Illuminate\Http\JsonResponse
     */
    public function validateLocation($reportId, Request $request)
    {
        try {
            // Validate request
            $request->validate([
                'latitude' => 'required|numeric',      // Supervisor current latitude
                'longitude' => 'required|numeric',     // Supervisor current longitude
            ]);

            // Find the report
            $report = Report::find($reportId);
            if (!$report) {
                return response()->json([
                    'success' => false,
                    'message' => 'Report not found',
                ], 404);
            }

            // Get supervisor's current location
            $supervisorLat = $request->input('latitude');
            $supervisorLon = $request->input('longitude');

            // Calculate distance between original location and supervisor location
            $distance = $this->calculateDistance(
                $report->latitude,
                $report->longitude,
                $supervisorLat,
                $supervisorLon
            );

            // Acceptable distance: 100 meters (configurable)
            $acceptableDistance = 100;
            $isValid = $distance <= $acceptableDistance;

            return response()->json([
                'success' => true,
                'validated' => $isValid,
                'distance_meters' => round($distance, 2),
                'acceptable_distance_meters' => $acceptableDistance,
                'message' => $isValid 
                    ? 'Location validated. You can complete this report.' 
                    : "You are {$distance}m away. Must be within {$acceptableDistance}m to complete.",
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Location validation failed',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Complete a report
     * 
     * Supervisor submits:
     * - Cleaned area photo (proof of completion)
     * - Their current GPS location
     * 
     * System:
     * - Validates location (must be within 100m)
     * - Uploads proof photo to Cloudinary
     * - Creates CompletedReport record
     * - Updates Report status to 'completed'
     * 
     * @param string $reportId - Report to complete
     * @param Request $request - Contains cleaned image and GPS location
     * @return \Illuminate\Http\JsonResponse
     */
    public function completeReport($reportId, Request $request)
    {
        try {
            // Validate request
            $request->validate([
                'image' => 'required|string',          // Base64 encoded cleaned area photo
                'latitude' => 'required|numeric',      // Supervisor latitude
                'longitude' => 'required|numeric',     // Supervisor longitude
            ]);

            // Get supervisor
            $supervisor = $request->user();
            if (!$supervisor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 401);
            }

            // Find the report
            $report = Report::find($reportId);
            if (!$report) {
                return response()->json([
                    'success' => false,
                    'message' => 'Report not found',
                ], 404);
            }

            // Check if report is already completed
            if ($report->status === 'completed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Report is already completed',
                ], 400);
            }

            // Get supervisor's current location
            $supervisorLat = $request->input('latitude');
            $supervisorLon = $request->input('longitude');

            /**
             * Validate location
             * Supervisor must be within 100m of original waste location
             */
            $distance = $this->calculateDistance(
                $report->latitude,
                $report->longitude,
                $supervisorLat,
                $supervisorLon
            );

            $acceptableDistance = 100; // meters
            if ($distance > $acceptableDistance) {
                return response()->json([
                    'success' => false,
                    'message' => "You are {$distance}m away. Must be within {$acceptableDistance}m to complete.",
                    'distance_meters' => round($distance, 2),
                ], 400);
            }

            /**
             * Upload cleaned area photo to Cloudinary
             */
            try {
                $imageData = $request->input('image');
                $uploadedFile = cloudinary()->uploadApi()->upload($imageData, [
                    'folder' => env('CLOUDINARY_UPLOAD_FOLDER', 'waste_management/completions'),
                    'resource_type' => 'auto',
                ]);

                $cleanedImageUrl = $uploadedFile['secure_url'];

            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Proof image upload failed',
                    'error' => $e->getMessage(),
                ], 400);
            }

            /**
             * Create CompletedReport record
             * This stores the proof of completion with location validation
             */
            $completion = CompletedReport::create([
                'report_id' => $report->_id,
                'cleaned_image_url' => $cleanedImageUrl,
                'supervisor_latitude' => $supervisorLat,
                'supervisor_longitude' => $supervisorLon,
                'completed_by' => $supervisor->_id,
                'original_latitude' => $report->latitude,
                'original_longitude' => $report->longitude,
                'distance_validated' => true,
                'distance_meters' => $distance,
            ]);

            /**
             * Update original report status to 'completed'
             */
            $report->update([
                'status' => 'completed',
                'updated_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Report completed successfully',
                'completion' => [
                    'id' => $completion->_id,
                    'report_id' => $completion->report_id,
                    'cleaned_image_url' => $completion->cleaned_image_url,
                    'distance_meters' => round($completion->distance_meters, 2),
                    'completed_at' => $completion->completed_at,
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Report completion failed',
                'error' => $e->getMessage(),
            ], 400);
        }
    }
}
