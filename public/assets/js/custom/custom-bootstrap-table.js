"use strict";
//Bootstrap actionEvents
window.lessonEvents = {
    'click .edit-data': function (e, value, row, index) {
        //Reset Values
        $('.edit-extra-files').html('')
        $('.edit_file_type_div').show();
        $('#edit_id').val(row.id);
        $('#edit_class_section_id').val(row.class_section_id);
        $('#edit_subject_id').val(row.subject_id);
        $('#edit_name').val(row.name);
        $('#edit_description').val(row.description);
        if (row.file.length > 0) {
            $.each(row.file, function (key, data) {
                let html = '';
                if (key == 0) {
                    html = $('.edit_file_type_div');
                } else {
                    html = $('.edit_file_type_div:last').clone().show();
                    $('.edit-extra-files').append(html);
                }
                html.removeAttr('id');
                html.find('.error').remove();
                html.find('.has-danger').removeClass('has-danger');
                // This function will replace the last index value and increment in the multidimensional name attribute
                html.find(':input').each(function (key, element) {
                    this.name = this.name.replace(/\[(\d+)\]/, function (str, p1) {
                        return '[' + (parseInt(p1, 10) + 1) + ']';
                    });
                })

                html.find('.edit-lesson-file i').addClass('fa-times').removeClass('fa-plus');
                html.find('.edit-lesson-file').addClass('btn-inverse-danger remove-lesson-file').removeClass('btn-inverse-success edit-lesson-file').attr('data-id', data.id);

                html.find('#edit_file_id').val(data.id);

                //1 = File Upload , 2 = Youtube Link , 3 = Uploaded Video , 4 = Other Link
                if (data.type == 1) {
                    // 1 = File Ulopad
                    html.find('#edit_file_type').val('file_upload').trigger('change');
                    html.find('#file_preview').attr('href', data.file_url).text(data.file_name);
                    //Used class name as a selector instead of id because of jquery dynamic field validation.
                    html.find('.file_name').val(data.file_name);
                } else if (data.type == 2) {
                    // 2 = Youtube Link
                    html.find('#edit_file_type').val('youtube_link').trigger('change');
                    html.find('#file_thumbnail_preview').attr('src', data.file_thumbnail);
                    html.find('.file_link').val(data.file_url);

                    html.find('.file_name').val(data.file_name);
                } else if (data.type == 3) {
                    // 3 = Uploaded Video
                    html.find('#edit_file_type').val('video_upload').trigger('change');
                    html.find('#file_thumbnail_preview').attr('src', data.file_thumbnail);
                    html.find('#file_preview').attr('src', data.file_url).text(data.file_name);

                    html.find('.file_name').val(data.file_name);
                } else if (data.type == 4) {
                    // 4 = Other Link
                    html.find('#edit_file_type').val('other_link').trigger('change');
                    html.find('#file_thumbnail_preview').attr('src', data.file_thumbnail);

                    html.find('.file_name').val(data.file_name);
                    html.find('.file_link').val(data.file_url);
                }
            })
        } else {
            $('.edit_file_type_div').hide();
        }
    }
};


window.topicEvents = {
    'click .edit-data': function (e, value, row, index) {
        //Reset Values
        $('.edit-extra-files').html('')
        $('.edit_file_type_div').show();
        $('#edit_id').val(row.id);
        $('#edit_topic_class_section_id').val(row.class_section_id).trigger('change');
        $('#edit_topic_subject_id').val(row.subject_id).trigger('change');
        $('#edit_topic_lesson_id').val(row.lesson_id);
        $('#edit_name').val(row.name);
        $('#edit_description').val(row.description);

        if (row.file.length > 0) {
            $.each(row.file, function (key, data) {
                let html = '';
                if (key == 0) {
                    html = $('.edit_file_type_div');
                } else {
                    html = $('.edit_file_type_div:last').clone().show();
                    $('.edit-extra-files').append(html);
                }
                html.removeAttr('id');
                html.find('.error').remove();
                html.find('.has-danger').removeClass('has-danger');
                // This function will replace the last index value and increment in the multidimensional name attribute
                html.find(':input').each(function (key, element) {
                    this.name = this.name.replace(/\[(\d+)\]/, function (str, p1) {
                        return '[' + (parseInt(p1, 10) + 1) + ']';
                    });
                })

                html.find('.edit-lesson-file i').addClass('fa-times').removeClass('fa-plus');
                html.find('.edit-lesson-file').addClass('btn-inverse-danger remove-lesson-file').removeClass('btn-inverse-success edit-lesson-file').attr('data-id', data.id);

                html.find('#edit_file_id').val(data.id);

                //1 = File Upload , 2 = Youtube Link , 3 = Uploaded Video , 4 = Other Link
                if (data.type == 1) {
                    // 1 = File Ulopad
                    html.find('#edit_file_type').val('file_upload').trigger('change');
                    html.find('#file_preview').attr('href', data.file_url).text(data.file_name);
                    //Used class name as a selector instead of id because of jquery dynamic field validation.
                    html.find('.file_name').val(data.file_name);
                } else if (data.type == 2) {
                    // 2 = Youtube Link
                    html.find('#edit_file_type').val('youtube_link').trigger('change');
                    html.find('#file_thumbnail_preview').attr('src', data.file_thumbnail);
                    html.find('.file_link').val(data.file_url);

                    html.find('.file_name').val(data.file_name);
                } else if (data.type == 3) {
                    // 3 = Uploaded Video
                    html.find('#edit_file_type').val('video_upload').trigger('change');
                    html.find('#file_thumbnail_preview').attr('src', data.file_thumbnail);
                    html.find('#file_preview').attr('src', data.file_url).text(data.file_name);

                    html.find('.file_name').val(data.file_name);
                } else if (data.type == 4) {
                    // 4 = Other Link
                    html.find('#edit_file_type').val('other_link').trigger('change');
                    html.find('#file_thumbnail_preview').attr('src', data.file_thumbnail);

                    html.find('.file_name').val(data.file_name);
                    html.find('.file_link').val(data.file_url);
                }
            })
        } else {
            $('.edit_file_type_div').hide();
        }
    }
};

window.examEvents = {
    'click .publish-exam-result': function (e, value, row, index) {
        e.preventDefault();
        // alert('working');
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirm!'
        }).then((result) => {
            if (result.isConfirmed) {
                let url = baseUrl + '/exams/publish/' + row.id;

                function successCallback(response) {
                    showSuccessToast(response.message);
                    $('#table_list').bootstrapTable('refresh');
                }
                function errorCallback(response) {
                    showErrorToast(response.message);
                }

                ajaxRequest('POST', url, null, null, successCallback, errorCallback);
            }
        })
    },
    'click .edit-data': function (e, value, row, index) {
        //Reset to Old Values
        $('.edit-extra-timetable').html('');
        $('.edit_exam_timetable').show();
        $('#edit_id').val(row.id);
        $('.edit_class_id').val(row.class_id);
        $('#edit_name').val(row.name);
        $('#edit_description').val(row.description);
    }
};

window.assignmentEvents = {
    'click .edit-data': function (e, value, row, index) {
        //Reset to Old Values
        var html_file = '';
        $('#edit_id').val(row.id);
        $('#edit_class_section_id').val(row.class_section_id);
        $('#edit_subject_id').val(row.subject_id);
        $('#edit_name').val(row.name);
        $('#edit_instructions').val(row.instructions);

        var dt = new Date(row.due_date);
        var Fromdatetime = dt.getFullYear() + "-" + ("0" + (dt.getMonth() + 1)).slice(-2) + "-" + ("0" + dt.getDate()).slice(-2) + "T" + ("0" + dt.getHours()).slice(-2) + ":" + ("0" + dt.getMinutes()).slice(-2) + ":" + ("0" + dt.getSeconds()).slice(-2);
        $('#edit_due_date').val(Fromdatetime);
        $('#edit_points').val(row.points);
        if (row.resubmission) {
            $('#edit_resubmission_allowed').prop('checked', true).trigger('change');
            $('#edit_extra_days_for_resubmission').val(row.extra_days_for_resubmission);
        } else {
            $('#edit_resubmission_allowed').prop('checked', false).trigger('change');
            $('#edit_extra_days_for_resubmission').val('');
        }

        if (row.file) {
            $.each(row.file, function (key, data) {
                html_file += '<div class="file"><a target="_blank" href="' + data.file_url + '" class="m-1">' + data.file_name + '</a> <span class="fa fa-times text-danger remove-assignment-file" data-id=' + data.id + '></span><br><br></div>'
            })

            $('#old_files').html(html_file);
        }
    }
};

window.announcementEvents = {
    'click .editdata': function (e, value, row, index) {
        var html_file = '';
        $('#id').val(row.id);
        $('#title').val(row.title);
        $('#description').val(row.description);
        if (row.assign == "Subject") {
            $('#edit_set_data').val('class_section').trigger('change', [row.get_data]);
            $('#edit_class_section_id').val(row.assign_to['class_section_id']).trigger('change', [row.assign_to['subject_id']]);
            // $('#edit_get_data').val(row.assign_to['subject_id']);
        } else {
            $('#edit_set_data').val(row.assign).trigger('change', [row.get_data])
        }
        if (row.file) {
            $.each(row.file, function (key, data) {
                html_file += '<div class="file"><a target="_blank" href="' + data.file_url + '" class="m-1">' + data.file_name + '</a> <span class="fa fa-times text-danger remove-assignment-file" data-id=' + data.id + '></span><br><br></div>'
            })

            $('#old_files').html(html_file);
        }
    }
};
window.classSubjectEvents = {
    'click .edit-data': function (e, value, row, index) {
        // Hide Medium wise Subjects
        $('.core-subject-id').find('option').hide();
        $('.core-subject-id').find('option[data-medium-id="' + row.medium_id + '"]').show();

        $('.elective-subject-name').find('option').hide();
        $('.elective-subject-name').find('option[data-medium-id="' + row.medium_id + '"]').show();

        $('.edit-core-subject-id').find('option').hide();
        $('.edit-core-subject-id').find('option[data-medium-id="' + row.medium_id + '"]').show();

        $('.edit-elective-subject-name').find('option').hide();
        $('.edit-elective-subject-name').find('option[data-medium-id="' + row.medium_id + '"]').show();

        //Reset to Old Values
        $('.edit-extra-core-subjects').html("");
        $('#edit-extra-elective-subject-group').html("");

        $('#edit_id').val(row.id);
        $('#edit_class_id').val(row.id);
        //Change the Name array attribute for jquery validation
        // and remove the error label from the main html so that duplicate error will not be shown
        $.each(row.core_subjects, function (key, value) {
            let core_subject = cloneOldCoreSubjectTemplate();
            //Fill the Values
            core_subject.find('.remove-core-subject').attr('data-id', value.id);
            core_subject.find('.edit-class-subject-id').val(value.id);
            core_subject.find('select').find("option[value = '" + value.subject_id + "']").attr("selected", "selected");
            $('.edit-extra-core-subjects').append(core_subject);
        })

        if (row.elective_subject_groups.length > 0) {
            //First loop will be used for Subject Group
            $.each(row.elective_subject_groups, function (key, group) {
                let subjectGroup = cloneOldElectiveSubjectGroup();
                $('#edit-extra-elective-subject-group').append(subjectGroup);
                //Fill the values in cloned element
                subjectGroup.find('.edit-total-selectable-subject').val(group.total_selectable_subjects);
                subjectGroup.find('.remove-elective-subject-group').attr('data-id', group.id);

                //Second loop will be used for Subjects inside Groups
                subjectGroup.find('.edit-elective-subject-group-id').val(group.id);
                $.each(group.elective_subjects, function (key, elective_subject) {
                    if (key === 0) {
                        subjectGroup.find('.edit-elective-subject-name:first').val(elective_subject.subject.id)
                        subjectGroup.find('.edit-elective-subject-name:first').siblings('.edit-elective-subject-class-id').val(elective_subject.id)
                    } else if (key === 1) {
                        subjectGroup.find('.edit-elective-subject-name:eq(1)').val(elective_subject.subject.id)
                        subjectGroup.find('.edit-elective-subject-name:eq(1)').siblings('.edit-elective-subject-class-id').val(elective_subject.id)
                    } else {
                        let electiveSubjectButton = subjectGroup.find('.add-new-elective-subject');
                        let electiveSubject = cloneNewElectiveSubject(electiveSubjectButton);
                        electiveSubject.insertBefore(subjectGroup.find('.add-new-elective-subject'));
                        electiveSubject.find('.edit-elective-subject-name').val(elective_subject.subject.id);
                        electiveSubject.find('.edit-elective-subject-name').siblings('.edit-elective-subject-class-id').val(elective_subject.id)
                        electiveSubject.find('.edit-elective-subject-name').siblings('.remove-elective-subject').attr('data-id', elective_subject.id)
                    }
                })

            })
        }
    }
};

window.parentEvents = {
    'click .editdata': function (e, value, row, index) {
        $('#edit_id').val(row.id);
        $('#first_name').val(row.first_name);
        $('#last_name').val(row.last_name);
        $('input[name=gender][value=' + row.gender + '].edit').prop('checked', true);
        $('#email').val(row.email);
        $('#mobile').val(row.mobile);
        $('#occupation').val(row.occupation);
        $('#dob').val(row.dob);
        if (row.current_address) {
            $('#current_address_div').show();
            $('#current_address').val(row.current_address);
        } else {
            $('#current_address_div').hide();
        }
        if (row.permanent_address) {
            $('#permanent_address_div').show();
            $('#permanent_address').val(row.permanent_address);
        } else {
            $('#permanent_address_div').hide();
        }
    }
};

window.studentEvents = {
    'click .editdata': function (e, value, row, index) {
        $('#edit_id').val(row.user_id);
        $('#edit_first_name').val(row.first_name);
        $('#edit_last_name').val(row.last_name);
        $('#edit_mobile').val(row.mobile);
        $('#edit_dob').val(row.dob);
        $('#edit_class_section_id').val(row.class_section_id);
        $('#edit_category_id').val(row.category_id);
        $('#edit_admission_no').val(row.admission_no);
        $('#edit_roll_number').val(row.roll_number);
        $('#edit_caste').val(row.caste);
        $('#edit_religion').val(row.religion);
        $('#edit_admission_date').val(row.admission_date);
        $('#edit_blood_group').val(row.blood_group);
        $('#edit_height').val(row.height);
        $('#edit_weight').val(row.weight);
        $('#edit_current_address').val(row.current_address);
        $('#edit_permanent_address').val(row.permanent_address);
        $('#edit-student-image-tag').attr('src', row.image_link);
        //Father Data
        $("#edit_father_email").select2("trigger", "select", {
            data: {
                id: row.father_id ? row.father_id : "",
                text: row.father_email ? row.father_email : "",
            }
        });
        //Adding delay to fill data so that select2 code and this code don't conflict each other
        setTimeout(function () {
            $('#edit_father_first_name').val(row.father_first_name).attr('readonly', true);
            $('#edit_father_last_name').val(row.father_last_name).attr('readonly', true);
            $('#edit_father_mobile').val(row.father_mobile).attr('readonly', true);
            $('#edit_father_dob').val(row.father_dob).attr('readonly', true);
            $('#edit_father_occupation').val(row.father_occupation).attr('readonly', true);
            $('#edit-father-image-tag').attr('src', row.father_image_link);
            $(".edit-father-search").rules("remove", "email");
            $(".father_image").rules("remove", "required");
        }, 500);


        //Mother Data
        $("#edit_mother_email").select2("trigger", "select", {
            data: {
                id: row.mother_id ? row.mother_id : "",
                text: row.mother_email ? row.mother_email : "",
            }
        });
        //Adding delay to fill data so that select2 code and this code don't conflict each other
        setTimeout(function () {
            $('#edit_mother_first_name').val(row.mother_first_name).attr('readonly', true);
            $('#edit_mother_last_name').val(row.mother_last_name).attr('readonly', true);
            $('#edit_mother_mobile').val(row.mother_mobile).attr('readonly', true);
            $('#edit_mother_dob').val(row.mother_dob).attr('readonly', true);
            $('#edit_mother_occupation').val(row.mother_occupation).attr('readonly', true);
            $('#edit-mother-image-tag').attr('src', row.mother_image_link);
            $(".edit-mother-search").rules("remove", "email");
            $(".mother_image").rules("remove", "required");
        }, 500);


        if (row.guardian_id) {
            $('#show-edit-guardian-details').attr('checked', true).trigger('change');
        } else {
            $('#show-edit-guardian-details').attr('checked', false).trigger('change');
        }

        // Guardian Data
        $("#edit_guardian_email").select2("trigger", "select", {
            data: {
                id: row.guardian_id ? row.guardian_id : "",
                text: row.guardian_email ? row.guardian_email : "",
                edit_data: true,
            }
        });

        //Adding delay to fill data so that select2 code and this code don't conflict each other
        setTimeout(function () {
            $('#edit_guardian_first_name').val(row.guardian_first_name).attr('readonly', true);
            $('#edit_guardian_last_name').val(row.guardian_last_name).attr('readonly', true);
            $('#edit_guardian_mobile').val(row.guardian_mobile).attr('readonly', true);
            $('#edit_guardian_dob').val(row.guardian_dob).attr('readonly', true);
            $('#edit_guardian_occupation').val(row.guardian_occupation).attr('readonly', true);
            $('#edit-guardian-image-tag').attr('src', row.guardian_image_link);
            $(".edit-guardian-search").rules("remove", "email");
            $(".guardian_image").rules("remove", "required");

        }, 500);
    }
};

window.assignmentSubmissionEvents = {
    'click .edit-data': function (e, value, row, index) {
        let file_html = "";
        console.log(row);
        $('#edit_id').val(row.id);
        $('#assignment_name').val(row.assignment_name);
        $('#subject').val(row.subject);
        $('#student_name').val(row.student_name);

        $.each(row.file, function (key, data) {
            file_html += " <a target='_blank' href='" + data.file_url + "'>" + data.file_name + "</a><br>";
        });

        $('#files').html(file_html);
        if (row.assignment_points) {
            $('#points_div').show();
            $('#assignment_points').text('/ ' + row.assignment_points);
            $('#points').prop('max', row.assignment_points);
            $('#points').val(row.points);
        } else {
            $('#points_div').hide();
            $('#assignment_points').text('');
        }
        $('#feedback').val(row.feedback);
        if (row.status === 1) {
            $('#status_accept').attr('checked', true);
        } else if (row.status === 2) {
            $('#status_reject').attr('checked', true);
        }
    }
};

window.examMarksEvents = {
    'click .edit-data': function (e, value, row, index) {
        $('.student_name').html(row.student_name);
        $('.subject_container').html('');
        var no = 0;
        $.each(row.data, function (key, data) {
            var html_data = '<div class="row"><input type="hidden" id="marks_id form-control" readonly name="edit[' + no + '][marks_id]" value="' + data.id + '"/><div class="row mx-2"><input type="hidden" id="marks_id form-control" readonly name="edit[' + no + '][exam_id]" value="' + data.timetable.exam_id + '"/><div class="row mx-2"><input type="hidden" id="marks_id form-control" readonly name="edit[' + no + '][student_id]" value="' + row.student_id + '"/><div class="row mx-2"><input type="hidden" id="marks_id form-control" readonly name="edit[' + no + '][passing_marks]" value="' + data.timetable.passing_marks + '"/><div class="form-group col-sm-12 col-md-4"><input type="text" class="subject_name form-control" readonly name="edit[' + no + '][subject_name]" value="' + data.subject.name + '" /></div><div class="form-group col-sm-12 col-md-4"><input type="text" class="total_marks form-control" readonly name="edit[' + no + '][total_marks]" value="' + data.timetable.total_marks + '" /></div><div class="form-group col-sm-12 col-md-4"><input type="text" class="obtained_marks form-control" name="edit[' + no + '][obtained_marks]" value="' + data.obtained_marks + '" /></div></div>';
            $('.subject_container').append(html_data);
            no++;
        });
    }
};

window.examTimetableEvents = {
    'click .edit-data': function (e, value, row, index) {
        $('.edit_timetable_exam_id').val(row.exam_id);
        $('.edit_timetable_class_id').val(row.class_id);
        $('.edit_timetable_session_year_id').val(row.session_year_id);

        $('.edit-timetable-container').html('');
        let select_subject_html = "";
        if (row.subjects.length > 0) {
            $.each(row.subjects, function (key, data) {
                select_subject_html += "<option value='" + data.id + "'>" + data.name + "</option>";
            });
        } else {
            select_subject_html = "<option value=''>No Data Found</option>";
        }
        $('.edit_exam_subjects_options').html(select_subject_html);
        if (row.timetable.length != 0) {
            $.each(row.timetable, function (key, value) {
                let html = '';
                if (!$('.edit-timetable-container:last').is(':empty')) {
                    html = $('.edit-timetable-container').find('.edit_exam_timetable:last').clone();
                } else {
                    html = $('.edit_exam_timetable_tamplate').clone();
                }
                html.addClass('edit_exam_timetable').removeClass('edit_exam_timetable_tamplate');
                html.css('display', 'block');
                html.find('.error').remove();
                html.find('.has-danger').removeClass('has-danger');
                // This function will replace the last index value and increment in the multidimensional name attribute
                html.find('.form-control').each(function (key, element) {
                    this.name = this.name.replace(/\[(\d+)\]/, function (str, p1) {
                        return '[' + (parseInt(p1, 10) + 1) + ']';
                    });
                })

                html.find('.remove-edit-exam-timetable-content').attr("data-timetable_id", value.id);

                html.find('.edit_timetable_id').val(value.id);

                html.find('.edit_timetable_exam_id').val(value.exam_id);

                html.find('.edit_timetable_class_id').val(value.class_id);

                html.find('.edit_exam_subjects_options').val(value.subject_id)

                html.find('.edit_total_marks').val(value.total_marks);

                html.find('.edit_passing_marks').val(value.passing_marks);

                html.find('.edit_start_time').val(value.start_time);

                html.find('.edit_end_time').val(value.end_time);

                var date = new Date(value.date),
                    yr = date.getFullYear(),
                    month = date.getMonth() < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1,
                    day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate(),
                    newDate = month + '/' + day + '/' + yr;

                html.find('.edit_date').val(newDate);
                $('.edit-timetable-container').append(html);
            });
            $(document).on('click', '.remove-edit-exam-timetable-content', function (e) {
                e.preventDefault();

                let $this = $(this);
                // If button has Data ID then Call ajax function to delete file
                let timetable_id = $(this).data('timetable_id');

                if (timetable_id) {
                    Swal.fire({
                        title: 'Are you sure?',
                        text: "You won't be able to revert this!",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Yes, delete it!'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            let url = baseUrl + '/exams/delete-timetable/' + timetable_id;

                            function successCallback(response) {
                                $this.parent().parent().parent().remove();
                                $('#editModal').modal('hide');
                                $('#table_list').bootstrapTable('refresh');
                                showSuccessToast(response.message);
                            }

                            function errorCallback(response) {
                                showErrorToast(response.message);
                            }

                            ajaxRequest('DELETE', url, null, null, successCallback, errorCallback);
                        }
                    })
                } else {
                    $(this).parent().parent().parent().remove();
                }

            });
        }
    }
}


// Bootstrap Custom Column Formatters
function fileFormatter(value, row) {
    let file_upload = "<br><h6>File Upload</h6>";
    let youtube_link = "<br><h6>Youtube Link</h6>";
    let video_upload = "<br><h6>Video Upload</h6>";
    let other_link = "<br><h6>Other Link</h6>";

    let file_upload_counter = 1;
    let youtube_link_counter = 1;
    let video_upload_counter = 1;
    let other_link_counter = 1;

    $.each(row.file, function (key, data) {
        //1 = File Upload , 2 = Youtube , 3 = Uploaded Video , 4 = Other
        if (data.type == 1) {
            // 1 = File Ulopad
            file_upload += "<a href='" + data.file_url + "' target='_blank' >" + file_upload_counter + ". " + data.file_name + "</a><br>";
            file_upload_counter++;
        } else if (data.type == 2) {
            // 2 = Youtube Link
            youtube_link += "<a href='" + data.file_url + "' target='_blank' >" + youtube_link_counter + ". " + data.file_name + "</a><br>";
            youtube_link_counter++;
        } else if (data.type == 3) {
            // 3 = Uploaded Video
            video_upload += "<a href='" + data.file_url + "' target='_blank' >" + video_upload_counter + ". " + data.file_name + "</a><br>";
            video_upload_counter++;
        } else if (data.type == 4) {
            // 4 = Other Link
            other_link += "<a href='" + data.file_url + "' target='_blank' >" + other_link_counter + ". " + data.file_name + "</a><br>";
            other_link_counter++;
        }
    })
    let html = "";
    if (file_upload_counter > 1) {
        html += file_upload;
    }

    if (youtube_link_counter > 1) {
        html += youtube_link;
    }

    if (video_upload_counter > 1) {
        html += video_upload;
    }

    if (other_link_counter > 1) {
        html += other_link;
    }

    return html;
}

function resubmissionFormatter(value, row) {
    let html = "";
    if (row.resubmission) {
        html = "<span class='alert alert-success'>YES</span>";
    } else {
        html = "<span class='alert alert-danger'>NO</span>";
    }
    return html;
}


function assignmentFileFormatter(value, row) {
    let html = "<a target='_blank' href='" + row.file + "'>" + row.name + "</a>";
    return html;
}


function assignmentSubmissionStatusFormatter(value, row) {
    let html = "";
    // 0 = Pending/In Review , 1 = Accepted , 2 = Rejected , 3 = Resubmitted
    if (row.status === 0) {
        html = "<span class='badge badge-warning'>Pending</span>";
    } else if (row.status === 1) {
        html = "<span class='badge badge-success'>Accepted</span>";
    } else if (row.status === 2) {
        html = "<span class='badge badge-danger'>Rejected</span>";
    } else if (row.status === 3) {
        html = "<span class='badge badge-warning'>Resubmitted</span>";
    }
    return html;
}

function imageFormatter(value, row) {
    return "<a data-toggle='lightbox' href='" + row.image + "'><img src='" + row.image + "' class='img-fluid'  alt='image'  /></a>";
}
function fatherImageFormatter(value, row) {
    return "<a data-toggle='lightbox' href='" + row.father_image + "'><img src='" + row.father_image + "' class='img-fluid'  alt='image'  /></a>";
}
function motherImageFormatter(value, row) {
    return "<a data-toggle='lightbox' href='" + row.mother_image + "'><img src='" + row.mother_image + "' class='img-fluid'  alt='image'  /></a>";
}

function examTimetableFormatter(value, row) {
    let html = []
    if (row.timetable.length != null) {
        $.each(row.timetable, function (key, timetable) {
            html.push('<p>' + timetable.subject.name + ' - ' + timetable.total_marks + '/' + timetable.passing_marks + ' - ' + timetable.start_time + ' - ' + timetable.end_time + ' - ' + timetable.date + '</p>')
        });
    }
    return html.join('')
}

function examSubjectFormatter(index, row) {
    if (row.subject_name) {
        return row.subject_name;
    } else {
        return $('#subject_id :selected').text();
    }
}

function examStudentNameFormatter(index, row) {
    return "<input type='hidden' name='exam_marks[" + row.no + "][student_id]' class='form-control' value='" + row.student_id + "' />" + row.student_name
}

function obtainedMarksFormatter(index, row) {
    if (row.obtained_marks) {
        return "<input type='hidden' name='exam_marks[" + row.no + "][exam_marks_id]' class='form-control' value='" + row.exam_marks_id + "' />" +
            "<input type='text' name='exam_marks[" + row.no + "][obtained_marks]' class='form-control' value='" + row.obtained_marks + "' />" + "<input type='hidden' name='exam_marks[" + row.no + "][total_marks]' class='form-control' value='" + parseInt(row.total_marks) + "' />"
    } else {
        return "<input type='text' name='exam_marks[" + row.no + "][obtained_marks]' class='form-control' value='" + ' ' + "' />" + "<input type='hidden' name='exam_marks[" + row.no + "][total_marks]' class='form-control' value='" + parseInt(row.total_marks) + "' />"
    }
}

function teacherReviewFormatter(index, row) {
    if (row.teacher_review) {
        return "<textarea name='exam_marks[" + row.no + "][teacher_review]' class='form-control'>" + row.teacher_review + "</textarea>"
    } else {
        return "<textarea name='exam_marks[" + row.no + "][teacher_review]' class='form-control'>" + ' ' + "</textarea>"
    }
}

function examPublishFormatter(index, row) {
    if (index == 0) {
        return "<span class='badge badge-danger'>No</span>"
    } else {
        return "<span class='badge badge-success'>Yes</span>"
    }
}

function coreSubjectFormatter(value, row) {
    let core_subject_count = 1;
    let html = "<div style='line-height: 20px;'>";
    $.each(row.core_subjects, function (key, value) {
        if (value.subject) {
            html += "<br>" + core_subject_count + ". " + value.subject.name
            core_subject_count++;
        }
    })
    html += "</div>";
    return html;
}

function electiveSubjectFormatter(value, row) {
    let html = "<div style='line-height: 20px;'>";
    $.each(row.elective_subject_groups, function (key, group) {
        let elective_subject_count = 1;
        html += "<b>Group " + (key + 1) + "</b><br>";
        $.each(group.elective_subjects, function (key, elective_subject) {
            html += elective_subject_count + ". " + elective_subject.subject.name + "<br>"
            elective_subject_count++;
        })
        html += "<b>Total Subjects : </b>" + group.total_subjects + "<br>"
        html += "<b>Total Selectable Subjects : </b>" + group.total_selectable_subjects + "<br><br>"
    })
    html += "</div>";
    return html;
}

function defaultYearFormatter(index, row) {
    if (index == 0) {
        return "<span class='badge badge-danger'>No</span>"
    } else {
        return "<span class='badge badge-success'>Yes</span>"
    }
}

/**
 * Table Query Params
 */
function classQueryParams(p) {
    return {
        limit: p.limit,
        sort: p.sort,
        order: p.order,
        offset: p.offset,
        search: p.search,
        medium_id: $('#filter_medium_id').val()
    };
}

function ExamClassQueryParams(p) {
    return {
        limit: p.limit,
        sort: p.sort,
        order: p.order,
        offset: p.offset,
        search: p.search,
        exam_id: $('#filter_exam_name').val(),
        class_id: $('#filter_class_name').val()
    };
}

function gradesQueryParams(p) {
    return {
        limit: p.limit,
        sort: p.sort,
        order: p.order,
        offset: p.offset,
        search: p.search,
    };
}

function getExamResult(p) {
    return {
        limit: p.limit,
        sort: p.sort,
        order: p.order,
        offset: p.offset,
        search: p.search,
        exam_id: $('.result_exam').val(),
    };
}

$('#filter_medium_id').on('change', function () {
    $('#table_list').bootstrapTable('refresh');
})

function SubjectQueryParams(p) {
    return {
        limit: p.limit,
        sort: p.sort,
        order: p.order,
        offset: p.offset,
        search: p.search,
        medium_id: $('#filter_subject_id').val()
    };
}

$('#filter_subject_id').on('change', function () {
    $('#table_list').bootstrapTable('refresh');
})

function AssignclassQueryParams(p) {
    return {
        limit: p.limit,
        sort: p.sort,
        order: p.order,
        offset: p.offset,
        search: p.search,
        medium_id: $('#filter_medium_id').val(),
    };

}

function AssignTeacherQueryParams(p) {
    return {
        limit: p.limit,
        sort: p.sort,
        order: p.order,
        offset: p.offset,
        search: p.search,
        class_id: $('#filter_class_id').val(),
    };
}

$('#filter_class_id').on('change', function () {
    $('#table_list').bootstrapTable('refresh');
})

function AssignSubjectTeacherQueryParams(p) {
    return {
        limit: p.limit,
        sort: p.sort,
        order: p.order,
        offset: p.offset,
        search: p.search,
        class_id: $('#filter_class_section_id').val(),
        teacher_id: $('#filter_teacher_id').val(),
        subject_id: $('#filter_subject_id').val(),
    };
}

$('#filter_class_section_id').on('change', function () {
    $('#table_list').bootstrapTable('refresh');
})

$('#filter_teacher_id').on('change', function () {
    $('#table_list').bootstrapTable('refresh');
})

$('#filter_subject_id').on('change', function () {
    $('#table_list').bootstrapTable('refresh');
})


function StudentDetailQueryParams(p) {
    return {
        limit: p.limit,
        sort: p.sort,
        order: p.order,
        offset: p.offset,
        search: p.search,
        class_id: $('#filter_class_section_id').val(),

    };
}


function AssignmentSubmissionQueryParams(p) {
    return {
        limit: p.limit,
        sort: p.sort,
        order: p.order,
        offset: p.offset,
        search: p.search,
        subject_id: $('#filter_subject_id').val(),

    };
}

function CreateAssignmentSubmissionQueryParams(p) {
    return {
        limit: p.limit,
        sort: p.sort,
        order: p.order,
        offset: p.offset,
        search: p.search,
        subject_id: $('#filter_subject_id').val(),
        class_id: $('#filter_class_section_id').val(),

    };
}

function CreateLessionQueryParams(p) {
    return {
        limit: p.limit,
        sort: p.sort,
        order: p.order,
        offset: p.offset,
        search: p.search,
        subject_id: $('#filter_subject_id').val(),
        class_id: $('#filter_class_section_id').val(),
        lesson_id: $('#filter_lesson_id').val()
    };
}

function CreateTopicQueryParams(p) {
    return {
        limit: p.limit,
        sort: p.sort,
        order: p.order,
        offset: p.offset,
        search: p.search,
        subject_id: $('#filter_subject_id').val(),
        class_id: $('#filter_class_section_id').val(),
        lesson_id: $('#filter_lesson_id').val()
    };
}

function gradesQueryParams(p) {
    return {
        limit: p.limit,
        sort: p.sort,
        order: p.order,
        offset: p.offset,
        search: p.search
    };
}

function uploadMarksqueryParams(p) {
    return {
        limit: p.limit,
        sort: p.sort,
        order: p.order,
        offset: p.offset,
        search: p.search,
        'class_id': $('#exam_class_id').val(),
        'subject_id': $('#exam_subject_id').val(),
        'exam_id': $('#exam_id').val(),
    };
}
