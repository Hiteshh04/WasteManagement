<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Auth\SupervisorAuthController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\CompletionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes - No authentication required
Route::group(['prefix' => 'auth'], function () {
    // Google OAuth
    Route::post('/google/login', [GoogleAuthController::class, 'login']);
    Route::get('/google/callback', [GoogleAuthController::class, 'handleCallback']);
    
    // Supervisor Authentication
    Route::post('/supervisor/login', [SupervisorAuthController::class, 'login']);
});

// Student API Routes - Protected with Sanctum
Route::group(['middleware' => ['auth:sanctum']], function () {
    // Student logout
    Route::post('/auth/logout', function (Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    });
    
    // User info
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    Route::prefix('reports')->group(function () {
        Route::post('/create', [ReportController::class, 'create']); // Create new report
        Route::get('/my-reports', [ReportController::class, 'getUserReports']); // Get user's reports
        Route::get('/{id}', [ReportController::class, 'getReport']); // Get single report
        Route::delete('/{id}', [ReportController::class, 'destroy']); // Revoke report
    });
});

// Supervisor API Routes - Protected with Sanctum token
Route::group(['prefix' => 'supervisor', 'middleware' => ['auth:sanctum']], function () {
    // Supervisor logout
    Route::post('/logout', [SupervisorAuthController::class, 'logout']);
    
    // Dashboard data
    Route::get('/dashboard', function () {
        // Get stats: pending count, completed count
        return response()->json([
            'pending_count' => \App\Models\Report::where('status', 'pending')->count(),
            'completed_count' => \App\Models\Report::where('status', 'completed')->count(),
        ]);
    });
    
    // Pending reports
    Route::prefix('reports')->group(function () {
        Route::get('/pending', [ReportController::class, 'getPendingReports']); // Get pending reports sorted by oldest first
        Route::get('/completed', [ReportController::class, 'getCompletedReports']); // Get completed reports
        Route::get('/{id}', [ReportController::class, 'getReport']); // Get single report
    });
    
    // Complete a report
    Route::prefix('completion')->group(function () {
        Route::post('/{report_id}', [CompletionController::class, 'completeReport']); // Complete report with proof image
        Route::post('/{report_id}/validate-location', [CompletionController::class, 'validateLocation']); // Validate supervisor location
    });
});

// Public endpoints - No authentication
Route::prefix('reports')->group(function () {
    Route::get('/all', [ReportController::class, 'getAllReports']); // Get all reports (for analytics/dashboard)
    Route::get('/pending', [ReportController::class, 'getPendingReports']); // Get pending reports
});
