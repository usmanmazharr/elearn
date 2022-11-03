<?php

namespace App\Http\Controllers;

use App\Models\ClassSchool;
use App\Models\Mediums;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class SubjectController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index() {
        $subjects = Subject::orderBy('id', 'DESC')->get();
        $mediums = Mediums::orderBy('id', 'DESC')->get();
        return response(view('subject.index', compact('subjects', 'mediums')));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id) {
        $validator = Validator::make($request->all(), [
            'medium_id' => 'required|numeric',
            'name' => 'required',
            'type' => 'required|in:Practical,Theory',
            'bg_color' => 'required',
            'image' => 'mimes:jpeg,png,jpg,svg|image|max:2048',
        ])->setAttributeNames(
            ['bg_color' => 'Background Color'],
        );;

        if ($validator->fails()) {
            $response = array(
                'error' => true,
                'message' => $validator->errors()->first()
            );
            return response()->json($response);
        }

        try {
            $subject = Subject::find($id);
            $subject->medium_id = $request->medium_id;
            $subject->name = $request->name;
            $subject->bg_color = $request->bg_color;
            $subject->code = $request->code;
            $subject->type = $request->type;

            if ($request->hasFile('image')) {
                if (Storage::disk('public')->exists($subject->image)) {
                    Storage::disk('public')->delete($subject->image);
                }
                $subject->image = $request->file('image')->store('subjects', 'public');
            }
            $subject->save();

            $response = array(
                'error' => false,
                'message' => trans('data_update_successfully'),
            );
        } catch (\Throwable $e) {
            $response = array(
                'error' => true,
                'message' => trans('error_occurred'),
                'data' => $e
            );
        }
        return response()->json($response);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request) {
        $validator = Validator::make($request->all(), [
            'medium_id' => 'required|numeric',
            'name' => 'required',
            'type' => 'required|in:Practical,Theory',
            'bg_color' => 'required',
            'image' => 'required|mimes:jpeg,png,jpg,svg|image|max:2048',
        ])->setAttributeNames(
            ['bg_color' => 'Background Color'],
        );

        if ($validator->fails()) {
            $response = array(
                'error' => true,
                'message' => $validator->errors()->first()
            );
            return response()->json($response);
        }

        try {
            $path = $request->file('image')->store('subjects', 'public');

            $subject = new Subject();
            $subject->medium_id = $request->medium_id;
            $subject->name = $request->name;
            $subject->bg_color = $request->bg_color;
            $subject->code = $request->code;
            $subject->type = $request->type;
            $subject->image = $path;
            $subject->save();

            $response = array(
                'error' => false,
                'message' => trans('data_store_successfully'),
            );
        } catch (\Throwable $e) {
            $response = array(
                'error' => true,
                'message' => trans('error_occurred'),
                'data' => $e
            );
        }
        return response()->json($response);
    }

    /**
     * Remove the specified resource from storage.
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id) {
        try {
            $subject = Subject::find($id);
            $subject->delete();
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

    public function show() {
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

        $sql = Subject::where('id', '!=', 0);
        if (isset($_GET['search']) && !empty($_GET['search'])) {
            $search = $_GET['search'];
            $sql = $sql->where('id', 'LIKE', "%$search%")->orwhere('name', 'LIKE', "%$search%")->orwhere('code', 'LIKE', "%$search%")->orwhere('type', 'LIKE', "%$search%");
        }
        if (isset($_GET['medium_id'])) {
            $sql = $sql->where('medium_id', $_GET['medium_id']);
        }


        $total = $sql->count();

        $sql = $sql->orderBy($sort, $order)->skip($offset)->take($limit);
        $res = $sql->get();


        $bulkData = array();
        $bulkData['total'] = $total;
        $rows = array();
        $tempRow = array();
        $no = 1;

        foreach ($res as $row) {
            $operate = '<a href=' . route('subject.edit', $row->id) . ' class="btn btn-xs btn-gradient-primary btn-rounded btn-icon edit-data" data-id=' . $row->id . ' title="Edit" data-toggle="modal" data-target="#editModal"><i class="fa fa-edit"></i></a>&nbsp;&nbsp;';
            $operate .= '<a href=' . route('subject.destroy', $row->id) . ' class="btn btn-xs btn-gradient-danger btn-rounded btn-icon delete-form" data-id=' . $row->id . '><i class="fa fa-trash"></i></a>';

            $tempRow['id'] = $row->id;
            $tempRow['no'] = $no++;
            $tempRow['name'] = $row->name;
            $tempRow['code'] = $row->code;
            $tempRow['bg_color'] = $row->bg_color;

            $tempRow['image'] = $row->image;

            $tempRow['medium_id'] = $row->medium_id;
            $tempRow['medium_name'] = $row->medium->name;
            $tempRow['type'] = $row->type;
            $tempRow['created_at'] = $row->created_at;
            $tempRow['updated_at'] = $row->updated_at;
            $tempRow['operate'] = $operate;
            $rows[] = $tempRow;
        }

        $bulkData['rows'] = $rows;
        return response()->json($bulkData);
    }
}
