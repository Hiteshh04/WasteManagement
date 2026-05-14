<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use MongoDB\Laravel\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

/**
 * Supervisor Model - Represents a supervisor in the system
 * 
 * Supervisors can:
 * - Login with username and password
 * - View pending waste reports
 * - View completed reports
 * - Complete reports by capturing cleaned area photos
 * - Validate geolocation before marking reports complete
 */
class Supervisor extends Authenticatable
{
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
    protected $collection = 'supervisors';

    /**
     * The primary key associated with the model
     * @var string
     */
    protected $primaryKey = '_id';

    /**
     * The attributes that are mass assignable
     * 
     * @var list<string>
     */
    protected $fillable = [
        'username',      // Supervisor login username
        'password',      // Hashed password
        'name',          // Supervisor name
        'email',         // Supervisor email
        'phone',         // Contact number
        'created_at',    // Account creation timestamp
        'updated_at',    // Last update timestamp
    ];

    /**
     * The attributes that should be hidden for serialization
     * 
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get all completions submitted by this supervisor
     * One supervisor can complete many reports
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function completions()
    {
        return $this->hasMany(CompletedReport::class, 'completed_by', '_id');
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
