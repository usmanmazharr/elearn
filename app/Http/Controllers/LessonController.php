<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Support\Facades\Auth;
use Throwable;
use App\Models\File;
use App\Models\Lesson;
use App\Models\Subject;
use App\Models\ClassSchool;
use App\Models\ClassSection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Controller;
use App\Models\Students;
use App\Rules\YouTubeUrl;
use phpDocumentor\Reflection\Types\Nullable;

class LessonController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        if (!Auth::user()->can('lesson-list')) {
            $response = array(
                'message' => trans('no_permission_message')
            );
            return redirect(route('home'))->withErrors($response);
        }
        $class_section = ClassSection::SubjectTeacher()->with('class.medium', 'section')->get();
        $subjects = Subject::SubjectTeacher()->orderBy('id', 'ASC')->get();
        $lessons = Lesson::get();

        return response(view('lessons.index', compact('class_section', 'subjects', 'lessons')));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        if (!Auth::user()->can('lesson-create')) {
            $response = array(
                'error' => true,
                'message' => trans('no_permission_message')
            );
            return response()->json($response);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|unique:lessons,name',
            'description' => 'required',
            'class_section_id' => 'required|numeric',
            'subject_id' => 'required|numeric',

            'file' => 'nullable|array',
            'file.*.type' => 'nullable|in:file_upload,youtube_link,video_upload,other_link',
            'file.*.name' => 'required_with:file.*.type',
            'file.*.thumbnail' => 'required_if:file.*.type,youtube_link,video_upload,other_link',
            'file.*.file' => 'required_if:file.*.type,file_upload,video_upload',
            // 'file.*.link' => 'required_if:file.*.type,youtube_link,other_link',
            //Regex for Youtube Link
            'file.*.link' => ['required', new YouTubeUrl, 'nullable'],
            //Regex for Other Link
            // 'file.*.link'=>'required_if:file.*.type,other_link|url'
        ],
        [
            'name.unique'=>trans('lesson_alredy_exists')
        ]);

        if ($validator->fails()) {
            $response = array(
                'error' => true,
                'message' => $validator->errors()->first(),
            );
            return response()->json($response);
        }
        try {
            $lesson = new Lesson();
            $lesson->name = $request->name;
            $lesson->description = $request->description;
            $lesson->class_section_id = $request->class_section_id;
            $lesson->subject_id = $request->subject_id;
            $lesson->save();

            foreach ($request->file as $key => $file) {
                if ($file['type']) {
                    $lesson_file = new File();
                    $lesson_file->file_name = $file['name'];
                    $lesson_file->modal()->associate($lesson);

                    if ($file['type'] == "file_upload") {
                        $lesson_file->type = 1;
                        $lesson_file->file_url = $file['file']->store('lessons', 'public');
                    } elseif ($file['type'] == "youtube_link") {
                        $lesson_file->type = 2;
                        $lesson_file->file_thumbnail = $file['thumbnail']->store('lessons', 'public');
                        $lesson_file->file_url = $file['link'];
                    } elseif ($file['type'] == "video_upload") {
                        $lesson_file->type = 3;
                        $lesson_file->file_thumbnail = $file['thumbnail']->store('lessons', 'public');
                        $lesson_file->file_url = $file['file']->store('lessons', 'public');
                    } elseif ($file['type'] == "other_link") {
                        $lesson_file->type = 4;
                        $lesson_file->file_thumbnail = $file['thumbnail']->store('lessons', 'public');
                        $lesson_file->file_url = $file['link'];
                    }
                    $lesson_file->save();
                }
            }

            $response = array(
                'error' => false,
                'message' => trans('data_store_successfully')
            );
        } catch (Throwable $e) {
            $response = array(
                'error' => true,
                'message' => trans('error_occurred'),
                'exception' => $e
            );
        }
        return response()->json($response);
    }

    /**
     * Display the specified resource.
     *
     * @param \App\Models\SubjectLesson $subjectLesson
     * @return \Illuminate\Http\Response
     */
    public function show()
    {
        if (!Auth::user()->can('lesson-list')) {
            $response = array(
                'error' => true,
                'message' => trans('no_permission_message')
            );
            return response()->json($response);
        }
        $offset = 0;
        $limit = 10;
        $sort = 'id';
        $order = 'DESC';

        if (isset($_GET['offset']))
            $offset = $_GET['offset'];
        if (isset($_GET['limit']))
            $limit = $_GET['limit'];

        if (isset($_GET['sort']))
            $sort = $_GET['sort'];
        if (isset($_GET['order']))
            $order = $_GET['order'];

        $sql = Lesson::lessonteachers()->with('subject', 'class_section', 'topic');
        if (isset($_GET['search']) && !empty($_GET['search'])) {
            $search = $_GET['search'];
            $sql->where('id', 'LIKE', "%$search%")
                ->orwhere('name', 'LIKE', "%$search%")
                ->orwhere('description', 'LIKE', "%$search%")
                ->orwhere('created_at', 'LIKE', "%" . date('Y-m-d H:i:s', strtotime($search)) . "%")
                ->orwhere('updated_at', 'LIKE', "%" . date('Y-m-d H:i:s', strtotime($search)) . "%")
                ->orWhereHas('class_section.section', function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%$search%");
                })
                ->orWhereHas('class_section.class', function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%$search%");
                })->orWhereHas('subject', function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%$search%");
                });
        }
        if ($_GET['subject_id']) {
            $sql = $sql->where('subject_id', $_GET['subject_id']);
        }
        if ($_GET['class_id']) {
            $sql = $sql->where('class_section_id', $_GET['class_id']);
        }
        if ($_GET['lesson_id']) {
            $sql = $sql->where('id', $_GET['lesson_id']);
        }
        $total = $sql->count();

        $sql->orderBy($sort, $order)->skip($offset)->take($limit);
        $res = $sql->get();
        $bulkData = array();
        $bulkData['total'] = $total;
        $rows = array();
        $tempRow = array();
        $no = 1;
        foreach ($res as $row) {

            $row = (object)$row;
            $operate = '<a href=' . route('lesson.edit', $row->id) . ' class="btn btn-xs btn-gradient-primary btn-rounded btn-icon edit-data" data-id=' . $row->id . ' title="Edit" data-toggle="modal" data-target="#editModal"><i class="fa fa-edit"></i></a>&nbsp;&nbsp;';
            $operate .= '<a href=' . route('lesson.destroy', $row->id) . ' class="btn btn-xs btn-gradient-danger btn-rounded btn-icon delete-form" data-id=' . $row->id . '><i class="fa fa-trash"></i></a>';

            $tempRow['id'] = $row->id;
            $tempRow['no'] = $no++;
            $tempRow['name'] = $row->name;
            $tempRow['description'] = $row->description;
            $tempRow['class_section_id'] = $row->class_section_id;
            $tempRow['class_section_name'] = $row->class_section->class->name . ' ' . $row->class_section->section->name;
            $tempRow['subject_id'] = $row->subject_id;
            $tempRow['subject_name'] = $row->subject->name;
            $tempRow['topic'] = $row->topic;
            $tempRow['file'] = $row->file;
            $tempRow['created_at'] = $row->created_at;
            $tempRow['updated_at'] = $row->updated_at;
            $tempRow['operate'] = $operate;
            $rows[] = $tempRow;
        }

        $bulkData['rows'] = $rows;
        return response()->json($bulkData);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param \Illuminate\Http\Request $request
     * @param \App\Models\SubjectLesson $subjectLesson
     * @return \Illuminate\Http\Response
     */

    public function update(Request $request, $id)
    {
        if (!Auth::user()->can('lesson-edit')) {
            $response = array(
                'error' => true,
                'message' => trans('no_permission_message')
            );
            return response()->json($response);
        }
        $validator = Validator::make($request->all(), [
            'edit_id' => 'required|numeric',
            'name' => 'required|unique:lessons,name,'.$request->edit_id,
            'description' => 'required',
            'class_section_id' => 'required|numeric',
            'subject_id' => 'required|numeric',

            'edit_file' => 'nullable|array',
            'edit_file.*.type' => 'nullable|in:file_upload,youtube_link,video_upload,other_link',
            'edit_file.*.name' => 'required_with:edit_file.*.type',
            'edit_file.*.link' => 'required_if:edit_file.*.type,youtube_link,other_link',

            // for Youtube Link
            'edit_file.*.link' => ['required', new YouTubeUrl, 'nullable'],

            'file' => 'nullable|array',
            'file.*.type' => 'nullable|in:file_upload,youtube_link,video_upload,other_link',
            'file.*.name' => 'required_with:file.*.type',
            'file.*.thumbnail' => 'required_if:file.*.type,youtube_link,video_upload,other_link',
            'file.*.file' => 'required_if:file.*.type,file_upload,video_upload',
            'file.*.link' => 'required_if:file.*.type,youtube_link,other_link',

            //Regex for Youtube Link
            'file.*.link' => ['required', new YouTubeUrl, 'nullable'],
            //Regex for Other Link
            // 'file.*.link'=>'required_if:file.*.type,other_link|url'
        ],
        [
            'name.unique'=>trans('lesson_alredy_exists')
        ]);
        if ($validator->fails()) {
            $response = array(
                'error' => true,
                'message' => $validator->errors()->first(),
            );
            return response()->json($response);
        }
        try {
            $lesson = Lesson::find($request->edit_id);
            $lesson->name = $request->name;
            $lesson->description = $request->description;
            $lesson->class_section_id = $request->class_section_id;
            $lesson->subject_id = $request->subject_id;
            $lesson->save();

            // Update the Old Files
            foreach ($request->edit_file as $file) {
                if ($file['type']) {
                    $lesson_file = File::find($file['id']);
                    $lesson_file->file_name = $file['name'];

                    if ($file['type'] == "file_upload") {
                        $lesson_file->type = 1;
                        if (!empty($file['file'])) {
                            if (Storage::disk('public')->exists($lesson_file->getRawOriginal('file_url'))) {
                                Storage::disk('public')->delete($lesson_file->getRawOriginal('file_url'));
                            }
                            $lesson_file->file_url = $file['file']->store('lessons', 'public');
                        }
                    } elseif ($file['type'] == "youtube_link") {
                        $lesson_file->type = 2;
                        if (!empty($file['thumbnail'])) {
                            if (Storage::disk('public')->exists($lesson_file->getRawOriginal('file_url'))) {
                                Storage::disk('public')->delete($lesson_file->getRawOriginal('file_url'));
                            }
                            $lesson_file->file_thumbnail = $file['thumbnail']->store('lessons', 'public');
                        }

                        $lesson_file->file_url = $file['link'];
                    } elseif ($file['type'] == "video_upload") {
                        $lesson_file->type = 3;
                        if (!empty($file['file'])) {
                            if (Storage::disk('public')->exists($lesson_file->getRawOriginal('file_url'))) {
                                Storage::disk('public')->delete($lesson_file->getRawOriginal('file_url'));
                            }
                            $lesson_file->file_url = $file['file']->store('lessons', 'public');
                        }

                        if (!empty($file['thumbnail'])) {
                            if (Storage::disk('public')->exists($lesson_file->getRawOriginal('file_url'))) {
                                Storage::disk('public')->delete($lesson_file->getRawOriginal('file_url'));
                            }
                            $lesson_file->file_thumbnail = $file['thumbnail']->store('lessons', 'public');
                        }
                    } elseif ($file['type'] == "other_link") {
                        $lesson_file->type = 4;
                        if (!empty($file['thumbnail'])) {
                            if (Storage::disk('public')->exists($lesson_file->getRawOriginal('file_url'))) {
                                Storage::disk('public')->delete($lesson_file->getRawOriginal('file_url'));
                            }
                            $lesson_file->file_thumbnail = $file['thumbnail']->store('lessons', 'public');
                        }
                        $lesson_file->file_url = $file['link'];
                    }

                    $lesson_file->save();
                }
            }

            //Add the new Files
            if ($request->file) {
                foreach ($request->file as $key => $file) {
                    if ($file['type']) {
                        $lesson_file = new File();
                        $lesson_file->file_name = $file['name'];
                        $lesson_file->modal()->associate($lesson);

                        if ($file['type'] == "file_upload") {
                            $lesson_file->type = 1;
                            $lesson_file->file_url = $file['file']->store('lessons', 'public');
                        } elseif ($file['type'] == "youtube_link") {
                            $lesson_file->type = 2;
                            $lesson_file->file_thumbnail = $file['thumbnail']->store('lessons', 'public');
                            $lesson_file->file_url = $file['link'];
                        } elseif ($file['type'] == "video_upload") {
                            $lesson_file->type = 3;
                            $lesson_file->file_url = $file['file']->store('lessons', 'public');
                            $lesson_file->file_thumbnail = $file['thumbnail']->store('lessons', 'public');
                        } elseif ($file['type'] == "other_link") {
                            $lesson_file->type = 4;
                            $lesson_file->file_thumbnail = $file['thumbnail']->store('lessons', 'public');
                            $lesson_file->file_url = $file['link'];
                        }
                        $lesson_file->save();
                    }
                }
            }
            $response = array(
                'error' => false,
                'message' => trans('data_store_successfully')
            );
        } catch (Throwable $e) {
            $response = array(
                'error' => true,
                'message' => trans('error_occurred'),
                'exception' => $e
            );
        }
        return response()->json($response);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param \App\Models\SubjectLesson $subjectLesson
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        if (!Auth::user()->can('lesson-delete')) {
            $response = array(
                'error' => true,
                'message' => trans('no_permission_message')
            );
            return response()->json($response);
        }
        try {
            $lesson = Lesson::find($id);
            if ($lesson->file) {
                foreach ($lesson->file as $file) {
                    if (Storage::disk('public')->exists($file->file_url)) {
                        Storage::disk('public')->delete($file->file_url);
                    }
                }
            }
            $lesson->file()->delete();
            $lesson->delete();
            $response = array(
                'error' => false,
                'message' => trans('data_delete_successfully')
            );
        } catch (\Throwable $e) {
            $response = array(
                'error' => true,
                'message' => trans('error_occurred')
            );
        }
        return response()->json($response);
    }


    public function search(Request $request)
    {
        $lesson = new Lesson;
        if (isset($request->subject_id)) {
            $lesson = $lesson->where('subject_id', $request->subject_id);
        }

        if (isset($request->class_section_id)) {
            $lesson = $lesson->where('class_section_id', $request->class_section_id);
        }
        $lesson = $lesson->get();
        $response = array(
            'error' => false,
            'data' => $lesson,
            'message' => 'Lesson fetched successfully'
        );
        return response()->json($response);
    }

    public function deleteFile($id)
    {
        try {
            $file = File::findOrFail($id);
            if (Storage::disk('public')->exists($file->file_url)) {
                Storage::disk('public')->delete($file->file_url);
            }
            $file->delete();
            $response = array(
                'error' => false,
                'message' => trans('data_delete_successfully')
            );
        } catch (\Throwable $e) {
            $response = array(
                'error' => true,
                'message' => trans('error_occurred')
            );
        }
        return response()->json($response);
    }
}
