<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Supervisor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/**
 * SupervisorAuthController - Handles supervisor authentication
 * 
 * Supervisors login with username and password
 * They get an API token to access supervisor-only endpoints
 */
class SupervisorAuthController extends Controller
{
    /**
     * Handle supervisor login with username and password
     * 
     * @param Request $request - Contains username and password
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        try {
            // Validate the request
            $request->validate([
                'username' => 'required|string',     // Supervisor username
                'password' => 'required|string',     // Supervisor password
            ]);

            // Extract username and password
            $username = $request->input('username');
            $password = $request->input('password');

            // Find supervisor by username
            $supervisor = Supervisor::where('username', $username)->first();

            // Check if supervisor exists
            if (!$supervisor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials',
                ], 401);
            }

            /**
             * Verify password
             * The password is stored hashed using bcrypt
             * Hash::check() compares plain password with hashed version
             */
            if (!Hash::check($password, $supervisor->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials',
                ], 401);
            }

            // Generate API token for authenticated requests
            // Use 'supervisor' ability to distinguish from student tokens
            $apiToken = $supervisor->createToken('supervisor_token', ['supervisor'])->plainTextToken;

            // Return success response with token
            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'supervisor' => [
                    'id' => (string) $supervisor->_id,
                    'username' => $supervisor->username,
                    'name' => $supervisor->name,
                    'email' => $supervisor->email,
                    'role' => 'supervisor',
                ],
                'token' => $apiToken,
            ], 200);

        } catch (\Exception $e) {
            // Return error response
            return response()->json([
                'success' => false,
                'message' => 'Login failed',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Handle supervisor logout
     * Revokes the API token so it can't be used anymore
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        try {
            // Delete the current API token
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Logout successful',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout failed',
                'error' => $e->getMessage(),
            ], 400);
        }
    }
}
