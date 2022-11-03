<?php

namespace App\Http\Controllers;

use PDO;
use Exception;
use Throwable;
use App\Models\User;
use App\Models\Parents;
use App\Models\Category;
use App\Models\Students;
use App\Models\ClassSchool;
use App\Models\SessionYear;
use App\Models\ClassSection;
use Illuminate\Http\Request;
use App\Imports\StudentsImport;
use App\Models\StudentSessions;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class StudentController extends Controller
{
    public function index() {
        if (!Auth::user()->can('student-list')) {
            $response = array(
                'message' => trans('no_permission_message')
            );
            return redirect(route('home'))->withErrors($response);
        }
        $class_section = ClassSection::with('class', 'section')->get();
        $category = Category::where('status', 1)->get();
        return view('students.details', compact('class_section', 'category'));
    }

    public function create() {
        if (!Auth::user()->can('student-create')) {
            $response = array(
                'message' => trans('no_permission_message')
            );
            return redirect(route('home'))->withErrors($response);
        }

        $class_section = ClassSection::with('class', 'section')->get();
        $category = Category::where('status', 1)->get();
        $data = getSettings('session_year');
        $session_year = SessionYear::select('name')->where('id', $data['session_year'])->pluck('name')->first();
        $get_student = Students::select('id')->latest('id')->pluck('id')->first();
        $admission_no = $session_year . ($get_student + 1);
        return view('students.index', compact('class_section', 'category', 'admission_no'));
    }

    public function createBulkData() {
        if (!Auth::user()->can('student-create')) {
            $response = array(
                'message' => trans('no_permission_message')
            );
            return redirect(route('home'))->withErrors($response);
        }
        $class_section = ClassSection::with('class', 'section')->get();
        // $category = Category::where('status', 1)->get();
        // $data = getSettings('session_year');
        // $session_year = SessionYear::select('name')->where('id', $data['session_year'])->pluck('name')->first();
        // $get_student = Students::select('id')->latest('id')->pluck('id')->first();
        // $admission_no = $session_year . ($get_student + 1);

        return view('students.add_bulk_data', compact('class_section'));
    }

    public function storeBulkData(Request $request) {
        if (!Auth::user()->can('student-create') || !Auth::user()->can('student-edit')) {
            $response = array(
                'message' => trans('no_permission_message')
            );
            return response()->json($response);
        }
        $validator = Validator::make($request->all(), [
            'class_section_id' => 'required',
            'file' => 'required|mimes:csv'
        ]);
        if ($validator->fails()) {
            $response = array(
                'error' => true,
                'message' => $validator->errors()->first()
            );
            return response()->json($response);
        }
        try {
            $class_section_id = $request->class_section_id;
            Excel::import(new StudentsImport($class_section_id), $request->file);
            $response = [
                'error' => false,
                'message' => trans('data_store_successfully')
            ];
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            $response = array(
                'error' => true,
                'message' => trans('error_occurred'),
                'data' => $e->failures()
            );
        }
        return response()->json($response);
    }

    public function update(Request $request) {
        if (!Auth::user()->can('student-create') || !Auth::user()->can('student-edit')) {
            $response = array(
                'message' => trans('no_permission_message')
            );
            return response()->json($response);
        }

        $request->validate([
            'first_name' => 'required',
            'last_name' => 'required',
            'mobile' => 'nullable|regex:/^([0-9\s\-\+\(\)]*)$/',
            'image' => 'mimes:jpeg,png,jpg|image|max:2048',
            'dob' => 'required',
            'class_section_id' => 'required',
            'category_id' => 'required',
            'admission_no' => 'required|unique:users,email,' . $request->edit_id,
            'roll_number' => 'required',
            //            'caste' => 'required',
            //            'religion' => 'required',
            'admission_date' => 'required',
            'height' => 'required',
            'weight' => 'required',
            'current_address' => 'required',
            'permanent_address' => 'required',
            'father_email' => 'required',
            'father_first_name' => 'required',
            'father_mobile' => 'required',
            'father_occupation' => 'required',
            'mother_first_name' => 'required',
            'mother_last_name' => 'required',
            'mother_mobile' => 'required',
            'mother_occupation' => 'required',
        ]);
        if (!intval($request->father_email)) {
            $request->validate([
                'father_email' => 'required|email|unique:users,email,' . $request->father_email,
                'father_image' => 'required|mimes:jpeg,png,jpg|image|max:2048',
            ]);
        }

        if (!intval($request->mother_email)) {
            $request->validate([
                'mother_email' => 'required|email|unique:users,email,' . $request->mother_email . '|unique:parents,email,' . $request->mother_email,
                'mother_image' => 'required|mimes:jpeg,png,jpg|image|max:2048',
            ]);
        }

        if (isset($request->guardian_email)) {
            if (!intval($request->guardian_email)) {
                $request->validate([
                    'guardian_email' => 'required|email|unique:parents,email,' . $request->guardian_email,
                    'guardian_image' => 'required|mimes:jpeg,png,jpg|image|max:2048',
                ]);
            }
        }

        try {
            //Add Father in User and Parent table data
            if (!intval($request->father_email)) {
                $father_user = new User();
                $father_user->image = $request->file('father_image')->store('parents', 'public');
                $father_user->password = Hash::make(str_replace('/', '', $request->father_dob));
                $father_user->first_name = $request->father_first_name;
                $father_user->last_name = $request->father_last_name;
                $father_user->email = $request->father_email;
                $father_user->mobile = $request->father_mobile;
                $father_user->dob = date('Y-m-d', strtotime($request->father_dob));
                $father_user->gender = 'Male';
                $father_user->save();

                $father_parent = new Parents();
                $father_parent->user_id = $father_user->id;
                $father_parent->first_name = $request->father_first_name;
                $father_parent->last_name = $request->father_last_name;
                $father_parent->image = $father_user->getRawOriginal('image');
                $father_parent->occupation = $request->father_occupation;
                $father_parent->mobile = $request->father_mobile;
                $father_parent->email = $request->father_email;
                $father_parent->dob = date('Y-m-d', strtotime($request->father_dob));
                $father_parent->gender = 'Male';
                $father_parent->save();
                $father_parent_id = $father_parent->id;
            } else {
                $father_parent_id = $request->father_email;
            }

            //Add Mother in User and Parent table data
            if (!intval($request->mother_email)) {
                $mother_user = new User();
                $mother_user->image = $request->file('mother_image')->store('parents', 'public');
                $mother_user->password = Hash::make(str_replace('/', '', $request->mother_dob));
                $mother_user->first_name = $request->mother_first_name;
                $mother_user->last_name = $request->mother_last_name;
                $mother_user->email = $request->mother_email;
                $mother_user->mobile = $request->mother_mobile;
                $mother_user->dob = date('Y-m-d', strtotime($request->mother_dob));
                $mother_user->gender = 'Female';
                $mother_user->save();

                $mother_parent = new Parents();
                $mother_parent->user_id = 0;
                $mother_parent->first_name = $request->mother_first_name;
                $mother_parent->last_name = $request->mother_last_name;
                $mother_parent->image = $mother_user->getRawOriginal('image');
                $mother_parent->occupation = $request->mother_occupation;
                $mother_parent->mobile = $request->mother_mobile;
                $mother_parent->email = $request->mother_email;
                $mother_parent->dob = date('Y-m-d', strtotime($request->mother_dob));
                $mother_parent->gender = 'Female';
                $mother_parent->save();
                $mother_parent_id = $mother_parent->id;
            } else {
                $mother_parent_id = $request->mother_email;
            }

            if (isset($request->guardian_email)) {
                if (!intval($request->mother_email)) {
                    $guardian_parent = new Parents();
                    $guardian_parent->user_id = 0;
                    $guardian_parent->first_name = $request->guardian_first_name;
                    $guardian_parent->last_name = $request->guardian_last_name;
                    $guardian_parent->image = $request->file('guardian_image')->store('parents', 'public');;
                    $guardian_parent->occupation = $request->guardian_occupation;
                    $guardian_parent->mobile = $request->guardian_mobile;
                    $guardian_parent->email = $request->guardian_email;
                    $guardian_parent->dob = date('Y-m-d', strtotime($request->guardian_dob));
                    $guardian_parent->gender = $request->guardian_gender;
                    $guardian_parent->save();
                    $guardian_parent_id = $guardian_parent->id;
                } else {
                    $guardian_parent_id = $request->guardian_email;
                }
            } else {
                $guardian_parent_id = 0;
            }

            //Create Student User First
            $user = User::find($request->edit_id);
//            $user->password = Hash::make(str_replace('/', '', $request->dob));
            $user->first_name = $request->first_name;
            $user->last_name = $request->last_name;
            //            $user->email = (isset($request->email)) ? $request->email : "";
//            $user->email = $request->admission_no;
            $user->mobile = (isset($request->mobile)) ? $request->mobile : "";
            $user->dob = date('Y-m-d', strtotime($request->dob));
            $user->current_address = $request->current_address;
            $user->permanent_address = $request->permanent_address;
            $user->gender = $request->gender;

            //If Image exists then upload new image and delete the old image
            if ($request->hasFile('image')) {
                if (Storage::disk('public')->exists($user->image)) {
                    Storage::disk('public')->delete($user->image);
                }
                $user->image = $request->file('image')->store('students', 'public');
            }
            $user->save();

            $student = Students::where('user_id', $user->id)->firstOrFail();
            $student->class_section_id = $request->class_section_id;
            $student->category_id = $request->category_id;
//            $student->admission_no = $request->admission_no;
            $student->roll_number = $request->roll_number;
            $student->caste = $request->caste;
            $student->religion = $request->religion;
            $student->admission_date = date('Y-m-d', strtotime($request->admission_date));
            $student->blood_group = $request->blood_group;
            $student->height = $request->height;
            $student->weight = $request->weight;
            $student->father_id = $father_parent_id;
            $student->mother_id = $mother_parent_id;
            $student->guardian_id = $guardian_parent_id;
            $student->save();

            $response = [
                'error' => false,
                'message' => trans('data_store_successfully')
            ];
        } catch (Exception $e) {
            $response = array(
                'error' => true,
                'message' => trans('error_occurred'),
                'data' => $e
            );
        }
        return response()->json($response);
    }

    public function store(Request $request) {
        if (!Auth::user()->can('student-create') || !Auth::user()->can('student-edit')) {
            $response = array(
                'message' => trans('no_permission_message')
            );
            return response()->json($response);
        }

        $request->validate([
            'first_name' => 'required',
            'last_name' => 'required',
            'mobile' => 'nullable|regex:/^([0-9\s\-\+\(\)]*)$/',
            'image' => 'mimes:jpeg,png,jpg|image|max:2048',
            'dob' => 'required',
            'class_section_id' => 'required',
            'category_id' => 'required',
            'admission_no' => 'required|unique:users,email',
            'roll_number' => 'required',
            //            'caste' => 'required',
            //            'religion' => 'required',
            'admission_date' => 'required',
            'height' => 'required',
            'weight' => 'required',
            'current_address' => 'required',
            'permanent_address' => 'required',

            'father_first_name' => 'required',
            'father_last_name' => 'required',
            'father_mobile' => 'required',
            'father_occupation' => 'required',

            'mother_first_name' => 'required',
            'mother_last_name' => 'required',
            'mother_mobile' => 'required',
            'mother_occupation' => 'required',
        ]);
        if (!intval($request->father_email)) {
            $request->validate([
                'father_email' => 'required|email|unique:users,email|unique:parents,email',
                'father_image' => 'required|mimes:jpeg,png,jpg|image|max:2048',
            ]);
        }

        if (!intval($request->mother_email)) {
            $request->validate([
                'mother_email' => 'required|email|unique:users,email|unique:parents,email',
                'mother_image' => 'required|mimes:jpeg,png,jpg|image|max:2048',
            ]);
        }

        if (isset($request->guardian_email)) {
            $request->validate([
                'guardian_email' => 'required|email|unique:parents,email',
                'guardian_image' => 'required|mimes:jpeg,png,jpg|image|max:2048',
            ]);
        }
        $response = array();
        try {
            $parentRole = Role::where('name', 'Parent')->first();
            $studentRole = Role::where('name', 'Student')->first();
            //Add Father in User and Parent table data
            $father_plaintext_password = str_replace('-', '', date('d-m-Y', strtotime($request->father_dob)));
            if (!intval($request->father_email)) {
                $father_email = $request->father_email;
                $father_user = new User();
                $father_user->image = $request->file('father_image')->store('parents', 'public');
                $father_user->password = Hash::make($father_plaintext_password);
                $father_user->first_name = $request->father_first_name;
                $father_user->last_name = $request->father_last_name;
                $father_user->email = $father_email;
                $father_user->mobile = $request->father_mobile;
                $father_user->dob = date('Y-m-d', strtotime($request->father_dob));
                $father_user->gender = 'Male';
                $father_user->save();
                $father_user->assignRole($parentRole);

                $father_parent = new Parents();
                $father_parent->user_id = $father_user->id;
                $father_parent->first_name = $request->father_first_name;
                $father_parent->last_name = $request->father_last_name;
                $father_parent->image = $father_user->getRawOriginal('image');
                $father_parent->occupation = $request->father_occupation;
                $father_parent->mobile = $request->father_mobile;
                $father_parent->email = $request->father_email;
                $father_parent->dob = date('Y-m-d', strtotime($request->father_dob));
                $father_parent->gender = 'Male';
                $father_parent->save();
                $father_parent_id = $father_parent->id;
                $father_email = $request->father_email;
                $father_name = $request->father_first_name;
            } else {
                $father_parent_id = $request->father_email;
                $father_email = Parents::where('id', $request->father_email)->pluck('email')->first();
                $father_name = Parents::where('id', $request->father_email)->pluck('first_name')->first();
            }

            //Add Mother in User and Parent table data
            $mother_plaintext_password = str_replace('-', '', date('d-m-Y', strtotime($request->mother_dob)));
            if (!intval($request->mother_email)) {
                $mother_email = $request->mother_email;
                $mother_user = new User();
                $mother_user->image = $request->file('mother_image')->store('parents', 'public');
                $mother_user->password = Hash::make($mother_plaintext_password);
                $mother_user->first_name = $request->mother_first_name;
                $mother_user->last_name = $request->mother_last_name;
                $mother_user->email = $mother_email;
                $mother_user->mobile = $request->mother_mobile;
                $mother_user->dob = date('Y-m-d', strtotime($request->mother_dob));
                $mother_user->gender = 'Female';
                $mother_user->save();
                $mother_user->assignRole($parentRole);

                $mother_parent = new Parents();
                $mother_parent->user_id = $mother_user->id;
                $mother_parent->first_name = $request->mother_first_name;
                $mother_parent->last_name = $request->mother_last_name;
                $mother_parent->image = $mother_user->getRawOriginal('image');
                $mother_parent->occupation = $request->mother_occupation;
                $mother_parent->mobile = $request->mother_mobile;
                $mother_parent->email = $request->mother_email;
                $mother_parent->dob = date('Y-m-d', strtotime($request->mother_dob));
                $mother_parent->gender = 'Female';
                $mother_parent->save();
                $mother_parent_id = $mother_parent->id;
                $mother_email = $request->mother_email;
                $mother_name = $request->mother_first_name;
            } else {
                $mother_parent_id = $request->mother_email;
                $mother_email = Parents::where('id', $request->mother_email)->pluck('email')->first();
                $mother_name = Parents::where('id', $request->mother_email)->pluck('first_name')->first();
            }

            if (isset($request->guardian_email)) {
                if (!intval($request->guardian_email)) {
                    $guardian_email = $request->guardian_email;
                    $guardian_parent = new Parents();
                    $guardian_parent->user_id = 0;
                    $guardian_parent->first_name = $request->guardian_first_name;
                    $guardian_parent->last_name = $request->guardian_last_name;
                    $guardian_parent->image = $request->file('guardian_image')->store('parents', 'public');;
                    $guardian_parent->occupation = $request->guardian_occupation;
                    $guardian_parent->mobile = $request->guardian_mobile;
                    $guardian_parent->email = $guardian_email;
                    $guardian_parent->dob = date('Y-m-d', strtotime($request->guardian_dob));
                    $guardian_parent->gender = $request->guardian_gender;
                    $guardian_parent->save();
                    $guardian_parent_id = $guardian_parent->id;
                    $guardian_name = $request->guardian_first_name;
                } else {
                    $guardian_parent_id = $request->guardian_email;
                }
            } else {
                $guardian_parent_id = 0;
            }

            //Create Student User First

            $user = new User();
            $child_plaintext_password = str_replace('-', '', date('d-m-Y', strtotime($request->dob)));
            $user->image = $request->file('image')->store('students', 'public');
            $user->password = Hash::make($child_plaintext_password);
            $user->first_name = $request->first_name;
            $user->last_name = $request->last_name;
            //            $user->email = (isset($request->email)) ? $request->email : "";
            $user->email = $request->admission_no;
            $user->gender = $request->gender;
            $user->mobile = $request->mobile;
            $user->dob = date('Y-m-d', strtotime($request->dob));
            $user->current_address = $request->current_address;
            $user->permanent_address = $request->permanent_address;
            $user->save();
            $user->assignRole($studentRole);

            $student = new Students();
            $student->user_id = $user->id;
            $student->class_section_id = $request->class_section_id;
            $student->category_id = $request->category_id;
            $student->admission_no = $request->admission_no;
            $student->roll_number = $request->roll_number;
            $student->caste = $request->caste;
            $student->religion = $request->religion;
            $student->admission_date = date('Y-m-d', strtotime($request->admission_date));
            $student->blood_group = $request->blood_group;
            $student->height = $request->height;
            $student->weight = $request->weight;
            $student->father_id = $father_parent_id;
            $student->mother_id = $mother_parent_id;
            $student->guardian_id = $guardian_parent_id;
            $student->save();

            //Send User Credentials via Email
            $school_name = getSettings('school_name');
            $father_data = [
                'subject' => 'Welcome to ' . $school_name['school_name'],
                'email' => $father_email,
                'name' => ' ' . $father_name,
                'username' => ' ' . $father_email,
                'password' => ' ' . $father_plaintext_password,
                'child_name' => ' ' . $request->first_name,
                'child_grnumber' => ' ' . $request->admission_no,
                'child_password' => ' ' . $child_plaintext_password,
            ];

            Mail::send('students.email', $father_data, function ($message) use ($father_data) {
                $message->to($father_data['email'])->subject($father_data['subject']);
            });

            $mother_data = [
                'subject' => 'Welcome to ' . $school_name['school_name'],
                'email' => $mother_email,
                'name' => ' ' . $mother_name,
                'username' => ' ' . $mother_email,
                'password' => ' ' . $mother_plaintext_password,
                'child_name' => ' ' . $request->first_name,
                'child_grnumber' => ' ' . $request->admission_no,
                'child_password' => ' ' . $child_plaintext_password,
            ];

            Mail::send('students.email', $mother_data, function ($message) use ($mother_data) {
                $message->to($mother_data['email'])->subject($mother_data['subject']);
            });
            $response = [
                'error' => false,
                'message' => trans('data_store_successfully')
            ];
        } catch (Throwable $e) {
            $response = array(
                'error' => true,
                'message' => trans('error_occurred'),
                'data' => $e
            );
        }
        return response()->json($response);
    }

    /**
     * Display the specified resource.
     *
     * @param int $id
     * @return \Illuminate\Http\Response
     */

    public function show() {
        if (!Auth::user()->can('student-list')) {
            $response = array(
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

        $sql = Students::with('user', 'class_section', 'category', 'father', 'mother', 'guardian')->ofTeacher();
        if (isset($_GET['search']) && !empty($_GET['search'])) {
            $search = $_GET['search'];
            $sql->where('id', 'LIKE', "%$search%")
                ->orWhere('user_id', 'LIKE', "%$search%")
                ->orWhere('class_section_id', 'LIKE', "%$search%")
                ->orWhere('category_id', 'LIKE', "%$search%")
                ->orWhere('admission_no', 'LIKE', "%$search%")
                ->orWhere('roll_number', 'LIKE', "%$search%")
                ->orWhere('caste', 'LIKE', "%$search%")
                ->orWhere('religion', 'LIKE', "%$search%")
                ->orWhere('admission_date', 'LIKE', date('Y-m-d', strtotime("%$search%")))
                ->orWhere('blood_group', 'LIKE', "%$search%")
                ->orWhere('height', 'LIKE', "%$search%")
                ->orWhere('weight', 'LIKE', "%$search%")
                ->orWhere('is_new_admission', 'LIKE', "%$search%")
                ->orWhereHas('user', function ($q) use ($search) {
                    $q->where('first_name', 'LIKE', "%$search%")
                        ->orwhere('last_name', 'LIKE', "%$search%")
                        ->orwhere('email', 'LIKE', "%$search%")
                        ->orwhere('dob', 'LIKE', "%$search%");
                })
                ->orWhereHas('father', function ($q) use ($search) {
                    $q->where('first_name', 'LIKE', "%$search%")
                        ->orwhere('last_name', 'LIKE', "%$search%")
                        ->orwhere('email', 'LIKE', "%$search%")
                        ->orwhere('mobile', 'LIKE', "%$search%")
                        ->orwhere('occupation', 'LIKE', "%$search%")
                        ->orwhere('dob', 'LIKE', "%$search%");
                })
                ->orWhereHas('mother', function ($q) use ($search) {
                    $q->where('first_name', 'LIKE', "%$search%")
                        ->orwhere('last_name', 'LIKE', "%$search%")
                        ->orwhere('email', 'LIKE', "%$search%")
                        ->orwhere('mobile', 'LIKE', "%$search%")
                        ->orwhere('occupation', 'LIKE', "%$search%")
                        ->orwhere('dob', 'LIKE', "%$search%");
                })
                ->orWhereHas('category', function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%$search%");
                });
        }
        if (isset($_GET['class_id']) && !empty($_GET['class_id'])) {
            $sql = $sql->where('class_section_id', $_GET['class_id']);
        }
        $total = $sql->count();

        $sql->orderBy($sort, $order)->skip($offset)->take($limit);
        $res = $sql->get();

        $bulkData = array();
        $bulkData['total'] = $total;
        $rows = array();
        $tempRow = array();
        $no = 1;
        $data = getSettings('date_formate');
        foreach ($res as $row) {
            $operate = '';
            if (Auth::user()->can('student-edit')) {
                $operate .= '<a class="btn btn-xs btn-gradient-primary btn-rounded btn-icon editdata" data-id=' . $row->id . ' data-url=' . url('students') . ' title="Edit" data-toggle="modal" data-target="#editModal"><i class="fa fa-edit"></i></a>&nbsp;&nbsp;';
            }

            if (Auth::user()->can('student-delete')) {
                $operate .= '<a class="btn btn-xs btn-gradient-danger btn-rounded btn-icon deletedata" data-id=' . $row->id . ' data-user_id=' . $row->user_id . ' data-url=' . url('students', $row->user_id) . ' title="Delete"><i class="fa fa-trash"></i></a>';
            }

            $tempRow['id'] = $row->id;
            $tempRow['no'] = $no++;
            $tempRow['user_id'] = $row->user_id;
            $tempRow['first_name'] = $row->user->first_name;
            $tempRow['last_name'] = $row->user->last_name;
            $tempRow['email'] = $row->user->email;
            $tempRow['dob'] = date($data['date_formate'], strtotime($row->user->dob));
            $tempRow['mobile'] = $row->user->mobile;
            $tempRow['image'] = $row->user->image;
            $tempRow['image_link'] = $row->user->image;
            $tempRow['class_section_id'] = $row->class_section_id;
            $tempRow['class_section_name'] = $row->class_section->class->name . "-" . $row->class_section->section->name;
            $tempRow['category_id'] = $row->category_id;
            $tempRow['category_name'] = $row->category->name;
            $tempRow['admission_no'] = $row->admission_no;
            $tempRow['roll_number'] = $row->roll_number;
            $tempRow['caste'] = $row->caste;
            $tempRow['religion'] = $row->religion;
            $tempRow['admission_date'] = date($data['date_formate'], strtotime($row->admission_date));
            $tempRow['blood_group'] = $row->blood_group;
            $tempRow['height'] = $row->height;
            $tempRow['weight'] = $row->weight;
            $tempRow['current_address'] = $row->user->current_address;
            $tempRow['permanent_address'] = $row->user->permanent_address;
            $tempRow['is_new_admission'] = $row->is_new_admission;

            if (!empty($row->father)) {
                //Father Data
                $tempRow['father_id'] = $row->father->id;
                $tempRow['father_email'] = $row->father->email;
                $tempRow['father_first_name'] = $row->father->first_name;
                $tempRow['father_last_name'] = $row->father->last_name;
                $tempRow['father_mobile'] = $row->father->mobile;
                $tempRow['father_dob'] = $row->father->dob;
                $tempRow['father_occupation'] = $row->father->occupation;
                $tempRow['father_image'] = $row->father->image;
                $tempRow['father_image_link'] = $row->father->image;
            }

            if (!empty($row->mother)) {
                //Mother Data
                $tempRow['mother_id'] = $row->mother->id;
                $tempRow['mother_email'] = $row->mother->email;
                $tempRow['mother_first_name'] = $row->mother->first_name;
                $tempRow['mother_last_name'] = $row->mother->last_name;
                $tempRow['mother_mobile'] = $row->mother->mobile;
                $tempRow['mother_dob'] = $row->mother->dob;
                $tempRow['mother_occupation'] = $row->mother->occupation;
                $tempRow['mother_image'] = $row->mother->image;
                $tempRow['mother_image_link'] = $row->mother->image;
            }

            if (!empty($row->guardian)) {
                //Father Data
                $tempRow['guardian_id'] = $row->guardian->id;
                $tempRow['guardian_email'] = $row->guardian->email;
                $tempRow['guardian_first_name'] = $row->guardian->first_name;
                $tempRow['guardian_last_name'] = $row->guardian->last_name;
                $tempRow['guardian_mobile'] = $row->guardian->mobile;
                $tempRow['guardian_dob'] = $row->guardian->dob;
                $tempRow['guardian_occupation'] = $row->guardian->occupation;
                $tempRow['guardian_image'] = $row->guardian->image;
                $tempRow['guardian_image_link'] = $row->guardian->image;
            }

            $tempRow['operate'] = $operate;
            $rows[] = $tempRow;
        }

        $bulkData['rows'] = $rows;
        return response()->json($bulkData);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id) {
        if (!Auth::user()->can('student-delete')) {
            $response = array(
                'message' => trans('no_permission_message')
            );
            return response()->json($response);
        }
        try {
            $user = User::find($id);
            if ($user->image != "" && Storage::disk('public')->exists($user->image)) {
                Storage::disk('public')->delete($user->image);
            }
            $user->delete();

            $student_id = Students::select('id')->where('user_id', $id)->pluck('id')->first();
            $student = Students::find($student_id);
            if ($student->father_image != "" && Storage::disk('public')->exists($student->father_image)) {
                Storage::disk('public')->delete($student->father_image);
            }
            if ($student->mother_image != "" && Storage::disk('public')->exists($student->mother_image)) {
                Storage::disk('public')->delete($student->mother_image);
            }
            $student->delete();

            $response = [
                'error' => false,
                'message' => trans('data_delete_successfully')
            ];
        } catch (Throwable $e) {
            $response = array(
                'error' => true,
                'message' => trans('error_occurred')
            );
        }
        return response()->json($response);
    }


    public function reset_password() {
        if (!Auth::user()->can('reset-password-list')) {
            $response = array(
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

        $sql = User::where('reset_request', 1);
        if (isset($_GET['search']) && !empty($_GET['search'])) {
            $search = $_GET['search'];
            $sql->where('id', 'LIKE', "%$search%")->orwhere('email', 'LIKE', "%$search%")
                ->orwhere('first_name', 'LIKE', "%$search%")
                ->orwhere('last_name', 'LIKE', "%$search%")
                ->orWhereRaw("concat(users.first_name,' ',users.last_name) LIKE '%" . $search . "%'");
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
            $operate = '<button class="btn btn-xs btn-gradient-primary btn-action btn-rounded btn-icon reset_password" data-id=' . $row->id . ' title="Reset-Password"><i class="fa fa-edit"></i></button>&nbsp;&nbsp;';

            $tempRow['id'] = $row->id;
            $tempRow['no'] = $no++;
            $tempRow['name'] = $row->first_name . ' ' . $row->last_name;
            $tempRow['dob'] = $row->dob;
            $tempRow['email'] = $row->email;
            $tempRow['operate'] = $operate;
            $rows[] = $tempRow;
        }

        $bulkData['rows'] = $rows;
        return response()->json($bulkData);
    }

    public function change_password(Request $request) {
        if (!Auth::user()->can('student-change-password')) {
            $response = array(
                'message' => trans('no_permission_message')
            );
            return response()->json($response);
        }
        try {
            $dob = date('mdY', strtotime($request->dob));
            $user = User::find($request->id);
            $user->reset_request = 0;
            $user->password = Hash::make($dob);
            $user->save();

            $response = [
                'error' => false,
                'message' => trans('data_update_successfully')
            ];
        } catch (Throwable $e) {
            $response = array(
                'error' => true,
                'message' => trans('error_occurred')
            );
        }
        return response()->json($response);
    }

    public function assignClass() {
        //        if (!Auth::user()->can('student-list')) {
        //            $response = array(
        //                'message' => trans('no_permission_message')
        //            );
        //            return redirect(route('home'))->withErrors($response);
        //        }
        $class_section = ClassSection::with('class', 'section')->get();
        $class = ClassSchool::with('medium')->get();
        $category = Category::where('status', 1)->get();
        return view('students.assign-class', compact('class_section', 'class', 'category'));
    }

    public function newStudentList(Request $request) {
        //        if (!Auth::user()->can('student-list')) {
        //            $response = array(
        //                'message' => trans('no_permission_message')
        //            );
        //            return response()->json($response);
        //        }
        $sort = 'id';
        $order = 'DESC';

        $class_id = $request->class_id;
        $get_class_section_id = ClassSection::select('id')->where('class_id', $class_id)->get()->pluck('id');
        $sql = Students::with('user:id,first_name,last_name,image', 'class_section')->whereIn('class_section_id', $get_class_section_id)->where('is_new_admission', 1);
        if (isset($_GET['search']) && !empty($_GET['search'])) {
            $search = $_GET['search'];
            $sql->where('id', 'LIKE', "%$search%")
                ->orWhere('user_id', 'LIKE', "%$search%")
                ->orWhere('class_section_id', 'LIKE', "%$search%")
                ->orWhere('is_new_admission', 'LIKE', "%$search%")
                ->orWhereHas('user', function ($q) use ($search) {
                    $q->where('first_name', 'LIKE', "%$search%")
                        ->orwhere('last_name', 'LIKE', "%$search%");
                });
        }
        $total = $sql->count();
        $res = $sql->orderBy($sort, $order)->get();

        $bulkData = array();
        $bulkData['total'] = $total;
        $rows = array();
        $tempRow = array();
        $no = 1;
        foreach ($res as $row) {
            $assign_student = '<input type="checkbox" class="assign_student"  name="assign_student" value=' . $row->id . '>';
            $data = getSettings('date_formate');
            $tempRow['chk'] = $assign_student;
            $tempRow['id'] = $row->id;
            $tempRow['no'] = $no++;
            $tempRow['user_id'] = $row->user_id;
            $tempRow['first_name'] = $row->user->first_name;
            $tempRow['last_name'] = $row->user->last_name;
            $tempRow['image'] = $row->user->image;
            $tempRow['class_section_id'] = $row->class_section_id;
            $tempRow['class_section_name'] = $row->class_section->class->name . "-" . $row->class_section->section->name . ' ' . $row->class_section->class->medium->name;
            $tempRow['admission_no'] = $row->admission_no;
            $tempRow['roll_number'] = $row->roll_number;
            $tempRow['admission_date'] = date($data['date_formate'], strtotime($row->admission_date));
            $rows[] = $tempRow;
        }

        $bulkData['rows'] = $rows;
        return response()->json($bulkData);
    }


    public function assignClass_store(Request $request) {
        //        if (!Auth::user()->can('student-list')) {
        //            $response = array(
        //                'message' => trans('no_permission_message')
        //            );
        //            return redirect(route('home'))->withErrors($response);
        //        }
        $validator = Validator::make($request->all(), [
            'class_section_id' => 'required',
            'selected_id' => 'required',
        ]);
        if ($validator->fails()) {
            $response = array(
                'error' => true,
                'message' => $validator->errors()->first()
            );
            return response()->json($response);
        }
        try {
            $selected_student = explode(',', $request->selected_id);
            $class_section_id = $request->class_section_id;
            $session_year = getSettings('session_year');
            for ($i = 0; $i < count($selected_student); $i++) {
                $student = Students::find($selected_student[$i]);
                $student->class_section_id = $class_section_id;
                $student->is_new_admission = 0;
                $student->save();
                $student_session = new StudentSessions;
                $student_session->student_id = $student->id;
                $student_session->class_section_id = $class_section_id;
                $student_session->session_year_id = $session_year['session_year'];
                $student_session->status = 1;
                $student_session->save();
            }
            $response = [
                'error' => false,
                'message' => trans('data_store_successfully')
            ];
        } catch (Exception $e) {
            $response = array(
                'error' => true,
                'message' => trans('error_occurred'),
                'data' => $e
            );
        }
        return response()->json($response);
    }
}
