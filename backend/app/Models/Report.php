<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

/**
 * Report Model - Represents a waste report submitted by a student
 * 
 * Each report contains:
 * - Image of waste (stored on Cloudinary)
 * - Geolocation of the waste
 * - Details about the waste (type, severity, smell, notes)
 * - Status tracking (pending -> completed)
 * - Timestamp of report creation
 */
class Report extends Model
{
    use HasFactory;

    /**
     * Connection name for MongoDB
     * @var string
     */
    protected $connection = 'mongodb';

    /**
     * Collection name in MongoDB
     * @var string
     */
    protected $collection = 'reports';

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
        'image_url',      // Cloudinary URL of waste image
        'latitude',       // GPS latitude of waste location
        'longitude',      // GPS longitude of waste location
        'waste_type',     // Type of waste (e.g., 'plastic', 'paper', 'food', etc.)
        'smell',          // Boolean: does the waste smell (true/false)
        'severity',       // Severity level (e.g., 'low', 'medium', 'high')
        'note',           // Additional notes from student
        'status',         // Report status ('pending', 'completed', 'rejected')
        'reported_by',    // User ID who submitted the report (MongoDB ObjectId)
        'created_at',     // Report submission timestamp
        'updated_at',     // Last update timestamp
    ];

    /**
     * The attributes that should be cast
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'smell' => 'boolean',      // Cast to boolean
            'latitude' => 'float',     // Geolocation precision
            'longitude' => 'float',    // Geolocation precision
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the student who submitted this report
     * Each report belongs to one user
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'reported_by', '_id');
    }

    /**
     * Get the completion record for this report (if completed)
     * Each report can have one completion record
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function completion()
    {
        return $this->hasOne(CompletedReport::class, 'report_id', '_id');
    }

    /**
     * Local scope - Get only pending reports
     * Usage: Report::pending()->get()
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Local scope - Get only completed reports
     * Usage: Report::completed()->get()
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Local scope - Sort by oldest first
     * Usage: Report::oldest()->get()
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeOldest($query)
    {
        return $query->orderBy('created_at', 'asc');
    }
}
