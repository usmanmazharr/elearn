<?php

namespace App\Http\Controllers;

use Throwable;
use App\Models\User;
use App\Models\Parents;
use App\Models\Teacher;
use App\Models\Students;
use App\Models\Announcement;
use App\Models\ClassSection;
use App\Models\ClassSubject;
use Illuminate\Http\Request;
use App\Models\SubjectTeacher;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class HomeController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct() {
        $this->middleware('auth');
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function login() {
        if (Auth::user()) {
            return redirect('/');
        } else {
            return view('auth.login');
        }
    }


    public function resetpassword() {
        return view('settings.reset_password');
    }

    public function checkPassword(Request $request) {
        $old_password = $request->old_password;
        $password = User::where('id', Auth::id())->first();
        if (Hash::check($old_password, $password->password)) {
            return response()->json(1);
        } else {
            return response()->json(0);
        }
    }

    public function changePassword(request $request) {
        $id = Auth::id();
        $request->validate([
            'old_password' => 'required',
            'new_password' => 'required|min:8',
            'confirm_password' => 'required|same:new_password',
        ]);
        try {
            $data['password'] = Hash::make($request->new_password);
            User::where('id', $id)->update($data);
            $response = array(
                'error' => false,
                'message' => trans('data_update_successfully')
            );
        } catch (\Throwable $e) {
            $response = array(
                'error' => true,
                'message' => trans('error_occurred')
            );
        }
        return response()->json($response);
    }


    public function index() {
        $teacher = null;
        $student = null;
        $parent = null;
        $teachers = null;
        $boys = 0;
        $girls = 0;
        if (Auth::user()->hasRole('Super Admin')) {
            $teacher = Teacher::count();
            $student = Students::count();
            $parent = Parents::count();

            $teachers = Teacher::with('user:id,first_name,last_name,image')->get();
            if ($student > 0) {
                $boys_count = Students::whereHas('user', function ($query) {
                    $query->where('gender', 'male');
                })->count();
                $girls_count = Students::whereHas('user', function ($query) {
                    $query->where('gender', 'female');
                })->count();

                $boys = round((($boys_count * 100) / $student), 2);
                $girls = round(($girls_count * 100) / $student, 2);
            }
        }
        $announcement = Announcement::where('table_type', "")->limit(5)->get();
        return view('home', compact('teacher', 'parent', 'student', 'announcement', 'teachers', 'boys', 'girls'));
    }

    public function logout(Request $request) {
        Auth::logout();
        $request->session()->flush();
        $request->session()->regenerate();
        return redirect('/');
    }

    public function getSubjectByClassSection(Request $request) {
        $class_section = ClassSection::select('class_id')->where('id', $request->class_section_id)->first();
        $subjects = ClassSubject::SubjectTeacher()->where('class_id', $class_section->class_id)->with('subject')->get();
        return response($subjects);
    }

    function resetPasswordView() {
        $class_section = ClassSection::with('class', 'section')->get();
        return view('students.reset_password', compact('class_section'));
    }


    public function editProfile() {
        $admin_data = Auth::user();
        return view('settings.update_profile', compact('admin_data'));
    }

    public function updateProfile(Request $request) {
        $validator = Validator::make($request->all(), [
            'id' => 'required',
            'first_name' => 'required',
            'last_name' => 'required',
            'mobile' => 'required|digits:10',
            'gender' => 'required',
            'dob' => 'required',
            'current_address' => 'required',
            'permanent_address' => 'required',
        ]);
        if ($validator->fails()) {
            $response = array(
                'error' => true,
                'message' => $validator->errors()->first()
            );
            return response()->json($response);
        }
        try {
            $user_db = User::find($request->id);
            $user_db->first_name = $request->first_name;
            $user_db->last_name = $request->last_name;
            $user_db->mobile = $request->mobile;
            $user_db->gender = $request->gender;
            $user_db->dob = date('Y-m-d', strtotime($request->dob));
            $user_db->current_address = $request->current_address;
            $user_db->permanent_address = $request->permanent_address;
            if (!empty($request->image)) {
                if (Storage::disk('public')->exists($user_db->getRawOriginal('image'))) {
                    Storage::disk('public')->delete($user_db->getRawOriginal('image'));
                }
                $user_db->image = $request->image->store('user', 'public');
            }
            $user_db->save();
            $response = array(
                'error' => false,
                'message' => trans('data_update_successfully')
            );
        } catch (Throwable $e) {
            $response = array(
                'error' => true,
                'message' => trans('error_occurred')
            );
        }
        return response()->json($response);
    }
}
