<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/**
 * GoogleAuthController - Handles Google OAuth authentication for students
 * 
 * Flow:
 * 1. Frontend sends Google ID token from browser
 * 2. Controller verifies the token
 * 3. Find or create user with Google ID
 * 4. Generate Sanctum API token
 * 5. Return token to frontend for authenticated API requests
 */
class GoogleAuthController extends Controller
{
    /**
     * Handle Google OAuth login
     * 
     * @param Request $request - Contains Google ID token from frontend
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        try {
            // Validate the request
            $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
                'token' => 'required|string',  // Google OAuth token (access_token)
                'name' => 'required|string',   // Student name
                'email' => 'required|email',   // Student email
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }

            // Extract data from request
            $token = $request->input('token');
            $name = $request->input('name');
            $email = $request->input('email');

            // Find existing user by email or create new one
            $user = User::where('email', $email)->first();

            if (!$user) {
                // Create new user account
                $user = User::create([
                    'name' => $name,
                    'email' => $email,
                    'google_id' => $token,
                    'role' => 'student',
                ]);
            } else {
                // Update Google ID if it changed (optional)
                $user->update(['google_id' => $token]);
            }

            // Generate API token using the custom createToken method in User model
            $apiToken = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'user' => [
                    'id' => (string) $user->_id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
                'token' => $apiToken,
            ], 200);

        } catch (\Exception $e) {
            // Detailed error reporting for debugging 400 Bad Request
            $errorResponse = [
                'success' => false,
                'message' => 'Login failed',
                'error' => $e->getMessage(),
                'error_type' => get_class($e),
                'request_data' => $request->all(),
            ];

            // If it's a validation exception (unlikely here but just in case)
            if ($e instanceof \Illuminate\Validation\ValidationException) {
                $errorResponse['errors'] = $e->errors();
            }

            return response()->json($errorResponse, 400);
        }
    }

    /**
     * Handle Google OAuth callback (if needed)
     * Some implementations may need a separate callback endpoint
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function handleCallback(Request $request)
    {
        // This can be used for server-side OAuth flow if needed
        // For now, the main login method handles everything
        return response()->json([
            'success' => false,
            'message' => 'Use /api/auth/google/login instead',
        ], 400);
    }
}
