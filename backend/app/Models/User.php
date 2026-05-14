<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use MongoDB\Laravel\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

/**
 * User Model - Represents a student user in the system
 * 
 * Students can:
 * - Sign up with Google OAuth
 * - Report waste
 * - View their own reports
 * - Provide device geolocation
 */
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * Connection name for MongoDB
     * @var string
     */
    protected $connection = 'mongodb';

    /**
     * Collection name in MongoDB
     * @var string
     */
    protected $collection = 'users';

    /**
     * The primary key associated with the model (MongoDB uses _id by default)
     * @var string
     */
    protected $primaryKey = '_id';

    /**
     * The attributes that are mass assignable.
     * These fields can be filled when creating or updating users
     * 
     * @var list<string>
     */
    protected $fillable = [
        'name',           // Student name
        'email',          // Student email
        'google_id',      // Google OAuth ID
        'role',           // User role (e.g., 'student')
        'created_at',     // Account creation timestamp
        'updated_at',     // Last update timestamp
    ];

    /**
     * The attributes that should be hidden for serialization
     * These sensitive fields won't be included in JSON responses
     * 
     * @var list<string>
     */
    protected $hidden = [
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     * Converts data types automatically
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get all reports submitted by this user
     * One user can have many reports
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function reports()
    {
        return $this->hasMany(Report::class, 'reported_by', '_id');
    }

    /**
     * Override createToken to bypass Sanctum's strict type hint that requires PDO models
     */
    public function createToken(string $name, array $abilities = ['*'], ?\DateTimeInterface $expiresAt = null)
    {
        $plainTextToken = \Illuminate\Support\Str::random(40);

        $token = $this->tokens()->create([
            'name' => $name,
            'token' => hash('sha256', $plainTextToken),
            'abilities' => $abilities,
            'expires_at' => $expiresAt,
        ]);

        return new class($token, $token->getKey().'|'.$plainTextToken) {
            public $accessToken;
            public $plainTextToken;
            public function __construct($accessToken, $plainTextToken) {
                $this->accessToken = $accessToken;
                $this->plainTextToken = $plainTextToken;
            }
        };
    }
}

