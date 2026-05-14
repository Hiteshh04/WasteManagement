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
            $request->validate([
                'token' => 'required|string',  // Google OAuth token from browser
                'name' => 'required|string',   // Student name
                'email' => 'required|email',   // Student email
            ]);

            // Extract data from request
            $token = $request->input('token');
            $name = $request->input('name');
            $email = $request->input('email');

            // IMPORTANT: In production, verify the token with Google API
            // For now, we'll use email as the identifier
            // In production, add token verification here using Google's API

            /**
             * Find existing user by email or create new one
             * - If user exists, just return their existing data
             * - If new user, create account with Google ID
             */
            $user = User::where('email', $email)->first();

            if (!$user) {
                // Create new user account
                $user = User::create([
                    'name' => $name,
                    'email' => $email,
                    'google_id' => $token,  // Store Google ID for future reference
                    'role' => 'student',    // Set role as student
                ]);
            }

            // Generate API token for authenticated requests
            // This token is used in header: "Authorization: Bearer {token}"
            $apiToken = $user->createToken('auth_token')->plainTextToken;

            // Return success response with token
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
            // Return error response
            return response()->json([
                'success' => false,
                'message' => 'Login failed',
                'error' => $e->getMessage(),
            ], 400);
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
