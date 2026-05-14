<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

/**
 * CompletedReport Model - Represents the completion record of a waste report
 * 
 * When a supervisor cleans a waste location:
 * - They capture a photo of the cleaned area (stored on Cloudinary)
 * - Their geolocation is recorded
 * - The report status changes to 'completed'
 * - Geolocation proximity is validated before saving
 */
class CompletedReport extends Model
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
    protected $collection = 'completed_reports';

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
        'report_id',              // Reference to the Report being completed (MongoDB ObjectId)
        'cleaned_image_url',      // Cloudinary URL of cleaned area photo
        'supervisor_latitude',    // Supervisor's GPS latitude at time of completion
        'supervisor_longitude',   // Supervisor's GPS longitude at time of completion
        'completed_by',           // Supervisor ID who completed the report (MongoDB ObjectId)
        'original_latitude',      // Original report latitude (for validation)
        'original_longitude',     // Original report longitude (for validation)
        'distance_validated',     // Boolean: was geolocation proximity validated? (true/false)
        'distance_meters',        // Distance in meters between supervisor and original location
        'completed_at',           // Timestamp when report was marked complete
        'created_at',             // Record creation timestamp
        'updated_at',             // Last update timestamp
    ];

    /**
     * The attributes that should be cast
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'supervisor_latitude' => 'float',
            'supervisor_longitude' => 'float',
            'original_latitude' => 'float',
            'original_longitude' => 'float',
            'distance_validated' => 'boolean',
            'distance_meters' => 'float',
            'completed_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the report that was completed
     * Each completion belongs to one report
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function report()
    {
        return $this->belongsTo(Report::class, 'report_id', '_id');
    }

    /**
     * Get the supervisor who completed the report
     * Each completion belongs to one supervisor
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function supervisor()
    {
        return $this->belongsTo(Supervisor::class, 'completed_by', '_id');
    }

    /**
     * Check if the supervisor was within acceptable distance (100 meters)
     * This prevents fake completions from different locations
     * 
     * @return bool
     */
    public function isWithinAcceptableDistance(): bool
    {
        // Acceptable distance: 100 meters (can be configured)
        $acceptableDistance = 100;
        return $this->distance_meters <= $acceptableDistance && $this->distance_validated;
    }
}
