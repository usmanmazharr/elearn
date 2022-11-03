@extends('layouts.master')

@section('title')
    {{ __('class_timetable') }}
@endsection

@section('content')
    <div class="content-wrapper">
        <div class="page-header">
            <h3 class="page-title">
                {{ __('manage').' '.__('class_timetable') }}
            </h3>
        </div>
        <div class="row">
            <div class="col-md-12 grid-margin stretch-card">
                <div class="card">
                    <div class="card-body">
                        <h4 class="card-title">
                            <div class="row">
                                <div class="form-group col-sm-12 col-md-6">
                                    <label>{{ __('class') }} {{ __('section') }} <span class="text-danger">*</span></label>
                                    <select required name="class_section_id" id="timetable_class_section" class="form-control select2" style="width:100%;" tabindex="-1" aria-hidden="true">
                                        <option value="">{{__('select')}}</option>
                                        @foreach($class_sections as $section)
                                            <option value="{{$section->id}}" data-class="{{$section->class->id}}" data-section="{{$section->section->id}}">{{$section->class->name.' '.$section->section->name.' - '.$section->class->medium->name}}</option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>
                        </h4>
                        <div class="row set_timetable"></div>
                    </div>
                </div>
            </div>

        </div>
    </div>
@endsection

@section('script')
    <script>
        $('#timetable_class_section').on('change', function (e) {
            var class_section_id = $(this).val();
            var class_id = $(this).find(':selected').attr('data-class');
            var section_id = $(this).find(':selected').attr('data-section');
            $.ajax({
                url: "{{url('gettimetablebyclass')}}",
                type: "GET",
                data: {class_section_id: class_section_id, class_id: class_id},
                success: function (response) {
                    var html = '';
                    for (let i = 0; i < response['days'].length; i++) {
                        html += '<div class="col-lg-2 col-md-2 col-sm-2 col-12 project-grid">';
                        html += '<div class="project-grid-inner">';
                        html += '<div class="wrapper">';
                        html += '<h5 class="card-header header-sm">' + response['days'][i]['day_name'] + '</h5>';
                        for (let j = 0; j < response['timetable'].length; j++) {
                            if (response['days'][i]['day'] == response['timetable'][j]['day']) {
                                html += '<p class="card-body">'
                                    + response['timetable'][j]['subject_teacher']['subject']['name']
                                    + '<br>' + response['timetable'][j]['subject_teacher']['teacher']['user']['first_name'] + ' ' + response['timetable'][j]['subject_teacher']['teacher']['user']['last_name']
                                    + '<br>start time: ' + response['timetable'][j]['start_time'] + '<br>end time: '
                                    + response['timetable'][j]['end_time'] + '</p>';

                            }
                        }
                        html += '</div>';
                        html += '</div>';
                        html += '</div>';
                        $('.set_timetable').html(html);
                    }
                }
            })
        });
    </script>
@endsection
