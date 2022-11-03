@extends('layouts.master')

@section('title')
    {{ __('teacher_timetable') }}
@endsection

@section('content')
    <div class="content-wrapper">
        <div class="page-header">
            <h3 class="page-title">
                {{ __('list') . ' ' . __('teacher_timetable') }}
            </h3>
        </div>
        <div class="row">

            <div class="col-md-12 grid-margin stretch-card">
                <div class="card">
                    <div class="card-body">
                        <h4 class="card-title">
                            <div class="row">
                                <div class="form-group col-sm-12 col-md-6">
                                    <label>{{ __('teacher') }} <span class="text-danger">*</span></label>
                                    <select required name="class_section_id" id="teacher_id" class="form-control select2"
                                            style="width:100%;" tabindex="-1" aria-hidden="true">
                                        <option value="">{{ __('select') }}</option>
                                        @foreach ($teacher as $teacher)
                                            <option value="{{ $teacher->id }}">
                                                {{ $teacher->user->first_name . ' ' . $teacher->user->last_name }}
                                            </option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>
                        </h4>
                        <div class="row set_timetable">
                            <div class="col-lg-2 col-md-2 col-sm-2 col-12 project-grid">
                                <div class="project-grid-inner">
                                    <div class="wrapper">
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
@endsection

@section('script')
    <script>
        $('#teacher_id').on('change', function (e) {
            var teacher_id = $(this).val();
            $.ajax({
                url: "{{ url('gettimetablebyteacher') }}",
                type: "GET",
                data: {
                    teacher_id: teacher_id
                },
                success: function (response) {
                    var html = '';
                    console.log(response);
                    for (let n = 0; n < response['days'].length; n++) {

                        for (let i = 0; i < response['days'][n].length; i++) {
                            html += '<div class="col-lg-2 col-md-2 col-sm-2 col-12 project-grid">';
                            html += '<div class="project-grid-inner">';
                            html += '<div class="wrapper">';
                            html += '<h5 class="card-header header-sm">' + response['days'][n][i][
                                'day_name'
                                ] + '</h5>';
                            for (let m = 0; m < response['timetable'].length; m++) {
                                if (response['timetable'][m] != '') {
                                    for (let j = 0; j < response['timetable'][m].length; j++) {
                                        if (response['days'][n][i]['day'] == response['timetable'][m][j]['day']) {
                                            html += '<p class="card-body">Class: ' + response['timetable'][m][j]['class_section']['class']['name'] +
                                                ' - ' + response['timetable'][m][j]['class_section']['section']['name'] +
                                                '<br>Subject: ' + response['timetable'][m][j]['subject_teacher']['subject']['name'] +
                                                '<br>start time: ' + response['timetable'][m][j]['start_time'] +
                                                '<br>end time: ' + response['timetable'][m][j]['end_time'] + '</p>';
                                        }
                                    }
                                }
                            }
                            html += '</div>';
                            html += '</div>';
                            html += '</div>';
                            $('.set_timetable').html(html);
                        }
                    }
                }
            })
        });
    </script>
@endsection
