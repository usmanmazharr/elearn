<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ClassSchool extends Model
{
    use SoftDeletes;
    use HasFactory;

    protected $table = 'classes';
    protected $hidden = ["deleted_at", "created_at", "updated_at"];

    public function announcement() {
        return $this->morphMany(Announcement::class, 'table');
    }

    public function medium() {
        return $this->belongsTo(Mediums::class)->select('name', 'id')->withTrashed();
    }

    public function sections() {
        return $this->belongsToMany(Section::class, 'class_sections', 'class_id', 'section_id')->wherePivot('deleted_at', null);
    }

    public function coreSubject() {
        return $this->hasMany(ClassSubject::class, 'class_id')->where('type', 'Compulsory')->with('subject');
    }

    public function electiveSubject() {
        return $this->hasMany(ClassSubject::class, 'class_id')->where('type', 'Elective')->with('subject', 'subjectGroup');
    }

    public function allSubjects() {
        return $this->hasMany(ClassSubject::class, 'class_id');
    }

    public function electiveSubjectGroup() {
        return $this->hasMany(ElectiveSubjectGroup::class, 'class_id');
    }
}
