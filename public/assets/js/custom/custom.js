"use strict";

var $table = $("#table_list"); // "table" accordingly
var electiveSubjectGroupCounter = 1;
$(function () {
    $table.bootstrapTable('destroy').bootstrapTable({
        exportTypes: ['csv', 'excel', 'pdf', 'txt', 'json'],
    });

    $("#toolbar")
        .find("select")
        .change(function () {
            $table.bootstrapTable("refreshOptions", {
                exportDataType: $(this).val()
            });
        });

    //File Upload Custom Component
    $('.file-upload-browse').on('click', function () {
        var file = $(this).parent().parent().parent().find('.file-upload-default');
        file.trigger('click');
    });
    $('.file-upload-default').on('change', function () {

        $(this).parent().find('.form-control').val($(this).val().replace(/C:\\fakepath\\/i, ''));
    });
    tinymce.init({
        height: "400",
        selector: '#tinymce_message',
        menubar: 'file edit view formate tools',
        toolbar: [
            'styleselect fontselect fontsizeselect',
            'undo redo | cut copy paste | bold italic | alignleft aligncenter alignright alignjustify',
            'bullist numlist | outdent indent | blockquote autolink | lists |  code'
        ],
        plugins: 'autolink link image lists code'
    });

    $('.modal').on('hidden.bs.modal', function () {
        //Reset input file on modal close
        $('.file-upload-default').val('');
        $('.file-upload-info').val('');
    })
    /*simplemde editor*/
    if ($("#simpleMde").length) {
        var simplemde = new SimpleMDE({
            element: $("#simpleMde")[0],
            hideIcons: ["guide", "fullscreen", "image", "side-by-side"],
        });
    }

    //Color Picker Custom Component
    if ($(".color-picker").length) {
        $('.color-picker').asColorPicker();
    }
    //Date Picker
    if ($(".datepicker-popup").length) {
        $('.datepicker-popup').datepicker({
            enableOnReadonly: true,
            todayHighlight: true,
        });
    }
    //Added this for Dynamic Date Picker input Initialization
    $('body').on('focus', ".datepicker-popup", function () {
        $(this).datepicker();
    });

    //Time Picker
    if ($("#timepicker-example").length) {
        $('#timepicker-example').datetimepicker({
            format: 'LT'
        });
    }
    //Select
    if ($(".js-example-basic-single").length) {
        $(".js-example-basic-single").select2();
    }
    // form reapeater
    $('.repeater').repeater({
        // (Optional)
        // "defaultValues" sets the values of added items.  The keys of
        // defaultValues refer to the value of the input's name attribute.
        // If a default value is not specified for an input, then it will
        // have its value cleared.
        defaultValues: {
            'text-input': 'foo'
        },
        // (Optional)
        // "show" is called just after an item is added.  The item is hidden
        // at this point.  If a show callback is not given the item will
        // have $(this).show() called on it.
        show: function () {
            $(this).slideDown();
        },
        // (Optional)
        // "hide" is called when a user clicks on a data-repeater-delete
        // element.  The item is still visible.  "hide" is passed a function
        // as its first argument which will properly remove the item.
        // "hide" allows for a confirmation step, to send a delete request
        // to the server, etc.  If a hide callback is not given the item
        // will be deleted.
        hide: function (deleteElement) {
            // if (confirm('Are you sure you want to delete this element?')) {
            //     $(this).slideUp(deleteElement);
            // }
            Swal.fire({
                title: 'Are you sure?',
                text: "You won't to delete this element?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    if ($(this).find('input:first').val() != '') {
                        $.ajax({
                            url: location.protocol + "//" + location.hostname + (location.port && ":" + location.port) + "/timetable/" + $(this).find('input:first').val(),
                            type: "DELETE",
                            success: function (response) {
                                if (response['error'] == false) {
                                    showSuccessToast(response['message']);
                                    $(this).slideUp(deleteElement);
                                } else {
                                    showErrorToast(response['message']);
                                }
                            }
                        });
                    } else {
                        $(this).slideUp(deleteElement);
                    }
                }
            })
        },
        // (Optional)
        // Removes the delete button from the first list item,
        // defaults to false.
        isFirstItemUndeletable: true
    })
    $(document).on('click', '[data-toggle="lightbox"]', function (event) {
        event.preventDefault();
        $(this).ekkoLightbox();
    });
});
//Setup CSRF Token default in AJAX Request
$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
});

$('#create-form,.create-form').on('submit', function (e) {
    e.preventDefault();
    let formElement = $(this);
    let submitButtonElement = $(this).find(':submit');
    let url = $(this).attr('action');
    let data = new FormData(this);

    function successCallback() {
        formElement[0].reset();
        $('#table_list').bootstrapTable('refresh');
    }

    formAjaxRequest('POST', url, data, formElement, submitButtonElement, successCallback);
})

$('#edit-form,.editform').on('submit', function (e) {
    e.preventDefault();
    let formElement = $(this);
    let submitButtonElement = $(this).find(':submit');
    let data = new FormData(this);
    data.append("_method", "PUT");
    let url = $(this).attr('action') + "/" + data.get('edit_id');

    function successCallback(response) {
        $('#table_list').bootstrapTable('refresh');
        setTimeout(function () {
            $('#editModal').modal('hide');
        }, 1000)
    }

    formAjaxRequest('POST', url, data, formElement, submitButtonElement, successCallback);
})

$(document).on('click', '.delete-form', function (e) {
    e.preventDefault();
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
            let url = $(this).attr('href');
            let data = null;

            function successCallback(response) {
                $('#table_list').bootstrapTable('refresh');
                showSuccessToast(response.message);
            }

            function errorCallback(response) {
                showErrorToast(response.message);
            }

            ajaxRequest('DELETE', url, data, null, successCallback, errorCallback);
        }
    })
})
$('.edit-class-teacher-form').on('submit', function (e) {
    e.preventDefault();
    let formElement = $(this);
    let submitButtonElement = $(this).find(':submit');
    let data = new FormData(this);
    let url = $(this).attr('action');

    function successCallback(response) {
        $('#table_list').bootstrapTable('refresh');

        //Reset input file field
        $('.file-upload-default').val('');
        $('.file-upload-info').val('');
        setTimeout(function () {
            window.location.reload();
        }, 1000)
    }

    formAjaxRequest('POST', url, data, formElement, submitButtonElement, successCallback);
})

$('.add-new-core-subject').on('click', function (e) {
    e.preventDefault();
    let core_subject = cloneNewCoreSubjectTemplate();
    $(this).parent().parent().siblings('.edit-extra-core-subjects').append(core_subject);
});

$(document).on('click', '.remove-core-subject', function (e) {
    e.preventDefault();
    let $this = $(this);
    if ($(this).data('id')) {
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
                let id = $this.data('id');
                let url = baseUrl + '/class/subject/' + id;

                function successCallback() {
                    $('#table_list').bootstrapTable('refresh');
                    $this.parent().parent().remove();
                }

                ajaxRequest('DELETE', url, null, null, successCallback);
            }
        })
    } else {
        $(this).parent().parent().remove();
    }
});

$(document).on('click', '.add-new-elective-subject', function (e) {
    e.preventDefault();
    let subject_list = cloneNewElectiveSubject($(this));
    //Removed Class subject id because its new elective subject
    subject_list.find('.edit-elective-subject-class-id').remove();
    subject_list.find('.remove-elective-subject').removeAttr('data-id');
    let total_selectable_subject = $(this).parent().next().children().children('input')
    let max = $(this).siblings('.elective-subject-div').length;
    console.log(max);
    $(total_selectable_subject).rules("add", {
        max: max,
    });
    $(subject_list).insertBefore($(this));
});

$(document).on('click', '.remove-elective-subject', function (e) {
    e.preventDefault();
    let $this = $(this);
    let total_selectable_subject = $(this).parent().parent().next().children().children('input');
    if ($(this).data('id')) {
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
                let id = $this.data('id');
                let url = baseUrl + '/class/subject/' + id;

                function successCallback() {
                    let max = $this.parent().siblings('.elective-subject-div').length - 1;
                    console.log(max);
                    $(total_selectable_subject).rules("add", {
                        max: max,
                    });
                    $('#table_list').bootstrapTable('refresh');
                    $this.parent().prev('span').remove();
                    $this.parent().remove();
                }

                ajaxRequest('DELETE', url, null, null, successCallback);
            }
        })
    } else {
        let max = $(this).parent().siblings('.elective-subject-div').length - 1;
        $(total_selectable_subject).rules("add", {
            max: max,
        });
        $(this).parent().prev('span').remove();
        $(this).parent().remove();
    }
});

$(document).on('click', '.add-elective-subject-group', function (e) {
    e.preventDefault();
    let html = cloneNewElectiveSubjectGroup();
    html.appendTo('#edit-extra-elective-subject-group');
});

$(document).on('click', '.remove-elective-subject-group', function (e) {
    e.preventDefault();
    let $this = $(this);
    if ($(this).data('id')) {
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
                let id = $this.data('id');
                let url = baseUrl + '/class/subject-group/' + id;

                function successCallback() {
                    $('#table_list').bootstrapTable('refresh');
                    $this.parent().parent().remove();
                }

                ajaxRequest('DELETE', url, null, null, successCallback);
            }
        })
    } else {
        $(this).parent().parent().remove();
    }

});

$('#show-guardian-details').on('change', function () {
    if ($(this).is(':checked')) {
        $('#guardian_div').show();
        $('#guardian_div input,#guardian_div select').attr('disabled', false);
    } else {
        $('#guardian_div').hide();
        //Added this to prevent data submission while elective subject option is Off.
        $('#guardian_div input,#guardian_div select').attr('disabled', true);
    }
})

$('#show-edit-guardian-details').on('change', function () {
    if ($(this).is(':checked')) {
        $('#edit_guardian_div').show();
        $('#edit_guardian_div input,#edit_guardian_div select').attr('disabled', false);
    } else {
        $('#edit_guardian_div').hide();
        //Added this to prevent data submission while elective subject option is Off.
        $('#edit_guardian_div input,#edit_guardian_div select').attr('disabled', true);
    }
})

$(document).on('change', '.file_type', function () {
    var type = $(this).val();
    var parent = $(this).parent();
    if (type == "file_upload") {
        parent.siblings('#file_name_div').show();
        parent.siblings('#file_thumbnail_div').hide();
        parent.siblings('#file_div').show();
        parent.siblings('#file_link_div').hide();
    } else if (type == "video_upload") {
        parent.siblings('#file_name_div').show();
        parent.siblings('#file_thumbnail_div').show();
        parent.siblings('#file_div').show();
        parent.siblings('#file_link_div').hide();
    } else if (type == "youtube_link") {
        parent.siblings('#file_name_div').show();
        parent.siblings('#file_thumbnail_div').show();
        parent.siblings('#file_div').hide();
        parent.siblings('#file_link_div').show();
    } else if (type == "other_link") {
        parent.siblings('#file_name_div').show();
        parent.siblings('#file_thumbnail_div').show();
        parent.siblings('#file_div').hide();
        parent.siblings('#file_link_div').show();
    } else {
        parent.siblings('#file_name_div').hide();
        parent.siblings('#file_thumbnail_div').hide();
        parent.siblings('#file_div').hide();
        parent.siblings('#file_link_div').hide();
    }
})


$(document).on('click', '.add-lesson-file', function (e) {
    e.preventDefault();
    let html = $('.file_type_div:last').clone();
    html.find('.error').remove();
    html.find('.has-danger').removeClass('has-danger');
    // This function will replace the last index value and increment in the multidimensional name attribute
    html.find(':input').each(function (key, element) {
        console.log(this.name);
        this.name = this.name.replace(/\[(\d+)\]/, function (str, p1) {
            return '[' + (parseInt(p1, 10) + 1) + ']';
        });
    })
    html.find('.add-lesson-file i').addClass('fa-times').removeClass('fa-plus');
    html.find('.add-lesson-file').addClass('btn-inverse-danger remove-lesson-file').removeClass('btn-inverse-success add-lesson-file');
    $(this).parent().parent().siblings('.extra-files').append(html);
    // Trigger change only after the html is appended to DOM
    html.find('.file_type').val('').trigger('change');
    html.find('input').val('');
});

$(document).on('click', '.edit-lesson-file', function (e) {
    e.preventDefault();
    let html = $('.file_type_div:last').clone();
    html.find('.error').remove();
    html.find('.has-danger').removeClass('has-danger');
    // This function will replace the last index value and increment in the multidimensional name attribute
    html.find(':input').each(function (key, element) {
        this.name = this.name.replace(/\[(\d+)\]/, function (str, p1) {
            return '[' + (parseInt(p1, 10) + 1) + ']';
        });
    })
    html.find('.add-lesson-file i').addClass('fa-times').removeClass('fa-plus');
    html.find('.add-lesson-file').addClass('btn-inverse-danger remove-lesson-file').removeClass('btn-inverse-success add-lesson-file');
    $(this).parent().parent().siblings('.edit-extra-files').append(html);
    // Trigger change only after the html is appended to DOM
    html.find('.file_type').val('').trigger('change');
    html.find('input').val('');
});

$(document).on('click', '.remove-lesson-file', function (e) {
    e.preventDefault();
    var $this = $(this);
    // If button has Data ID then Call ajax function to delete file
    if ($(this).data('id')) {
        var file_id = $(this).data('id');

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
                let url = baseUrl + '/file/delete/' + file_id;
                let data = null;

                function successCallback(response) {
                    $this.parent().parent().remove();
                    $('#table_list').bootstrapTable('refresh');
                    showSuccessToast(response.message);
                }

                function errorCallback(response) {
                    showErrorToast(response.message);
                }

                ajaxRequest('DELETE', url, data, null, successCallback, errorCallback);
            }
        })
    } else {
        // If button don't have any Data Id then simply remove that row from DOM
        $(this).parent().parent().remove();
    }
});

$('#topic_class_section_id').on('change', function () {
    let html = "<option value=''>--Select Lesson--</option>";
    $('#topic_lesson_id').html(html);
    $('#topic_subect_id').trigger('change');
})

$('#topic_subject_id').on('change', function () {
    let url = baseUrl + '/search-lesson';
    let data = {
        'subject_id': $(this).val(),
        'class_section_id': $('#topic_class_section_id').val()
    };

    function successCallback(response) {
        let html = ""
        if (response.data.length > 0) {
            response.data.forEach(function (data) {
                html += "<option>--Select Lesson--</option>"
                html += "<option value='" + data.id + "'>" + data.name + "</option>";
            })
        } else {
            html = "<option value=''>No Data Found</option>";
        }
        $('#topic_lesson_id').html(html);
    }

    ajaxRequest('GET', url, data, null, successCallback, null, null, true);
})

$('#resubmission_allowed').on('change', function () {
    if ($(this).is(':checked')) {
        $(this).val(1);
        $('#extra_days_for_resubmission_div').show();
    } else {
        $(this).val(0);
        $('#extra_days_for_resubmission_div').hide();
    }
})

$('#edit_resubmission_allowed').on('change', function () {
    if ($(this).is(':checked')) {
        $(this).val(1);
        $('#edit_extra_days_for_resubmission_div').show();
    } else {
        $(this).val(0);
        $('#edit_extra_days_for_resubmission_div').hide();
    }
})

$('#edit_topic_class_section_id').on('change', function () {
    let html = "<option value=''>--Select Lesson--</option>";
    $('#topic_lesson_id').html(html);
    $('#topic_subect_id').trigger('change');
})

$('#edit_topic_subject_id').on('change', function () {
    let url = baseUrl + '/search-lesson';
    let data = {
        'subject_id': $(this).val(),
        'class_section_id': $('#edit_topic_class_section_id').val()
    };

    function successCallback(response) {
        let html = ""
        if (response.data.length > 0) {
            response.data.forEach(function (data) {
                html += "<option value='" + data.id + "'>" + data.name + "</option>";
            })
        } else {
            html = "<option value=''>No Data Found</option>";
        }
        $('#edit_topic_lesson_id').html(html);
    }

    ajaxRequest('GET', url, data, null, successCallback, null, null, true);
})

$(document).on('click', '.remove-assignment-file', function (e) {
    e.preventDefault();
    var $this = $(this);
    var file_id = $(this).data('id');

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
            let url = baseUrl + '/file/delete/' + file_id;
            let data = null;

            function successCallback(response) {
                $this.parent().remove();
                $('#table_list').bootstrapTable('refresh');
                showSuccessToast(response.message);
            }

            function errorCallback(response) {
                showErrorToast(response.message);
            }

            ajaxRequest('DELETE', url, data, null, successCallback, errorCallback);
        }
    })
});

$(document).on('click', '.add-exam-timetable', function (e) {
    e.preventDefault();
    let html = $('.exam_timetable:last').clone();
    html.find('.error').remove();
    html.find('.has-danger').removeClass('has-danger');
    // This function will replace the last index value and increment in the multidimensional name attribute
    html.find('.form-control').each(function (key, element) {
        this.name = this.name.replace(/\[(\d+)\]/, function (str, p1) {
            return '[' + (parseInt(p1, 10) + 1) + ']';
        });
    })
    html.find('.add-exam-timetable i').addClass('fa-times').removeClass('fa-plus');
    html.find('.add-exam-timetable').addClass('btn-inverse-danger remove-exam-timetable').removeClass('btn-inverse-success add-exam-timetable');
    $(this).parent().parent().siblings('.extra-timetable').append(html);
    html.find('.form-control').val('');
});

$(document).on('click', '.edit-exam-timetable', function (e) {
    e.preventDefault();
    let html = $('.exam_timetable:last').clone();
    html.find('.error').remove();
    html.find('.has-danger').removeClass('has-danger');
    // This function will replace the last index value and increment in the multidimensional name attribute
    html.find('.form-control').each(function (key, element) {
        this.name = this.name.replace(/\[(\d+)\]/, function (str, p1) {
            return '[' + (parseInt(p1, 10) + 1) + ']';
        });
    })
    html.find('.add-exam-timetable i').addClass('fa-times').removeClass('fa-plus');
    html.find('.add-exam-timetable').addClass('btn-inverse-danger remove-exam-timetable').removeClass('btn-inverse-success add-exam-timetable');
    $(this).parent().parent().siblings('.edit-extra-timetable').append(html);
    html.find('.form-control').val('');
});

$(document).on('click', '.remove-exam-timetable', function (e) {
    e.preventDefault();
    let $this = $(this);
    // If button has Data ID then Call ajax function to delete file
    if ($(this).data('id')) {
        let timetable_id = $(this).data('id');

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
                    $this.parent().parent().remove();
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
        // If button don't have any Data Id then simply remove that row from DOM
        $(this).parent().parent().remove();
    }
});

$('#exam_id').on('change', function () {
    let exam_id = $(this).val();
    $('#exam_class_section_id option').hide();
    // $('#exam_class_section_id').find('option[data-class=' + class_id + ']').show();

    let url = baseUrl + '/exams/get-exam-subjects/' + exam_id;

    function successCallback(response) {
        let html = ''
        html = '<option>No Subjects</option>';
        if (response.data) {
            html = '<option value="">Select Subject</option>';
            $.each(response.data, function (key, data) {
                html += '<option value=' + data.subject.id + '>' + data.subject.name + '</option>';
            });
        } else {
            html = '<option>No Subjects Found</option>';
        }
        $('#exam_subject_id').html(html);
    }

    ajaxRequest('GET', url, null, null, successCallback, null);
});

//Father Search
parentSearch($(".father-search"), baseUrl + "/parent/search", {'type': 'father'}, 'Search for Father Email', parentSearchSelect2DesignTemplate, function (repo) {
    if (!repo.text) {
        //Remove dynamic jquery validation
        $(".father-search").rules("remove", "email");
        $(".father_image").rules("remove", "required");
        $('#father_first_name').val(repo.first_name).attr('readonly', true);
        $('#father_last_name').val(repo.last_name).attr('readonly', true);
        $('#father_mobile').val(repo.mobile).attr('readonly', true);
        $('#father_occupation').val(repo.occupation).attr('readonly', true);
        $('#father_dob').val(repo.dob).attr('readonly', true);
        $('#father-image-tag').attr('src', repo.image);
    } else {
        //Add dynamic jquery validation
        $(".father-search").rules("add", {
            email: true,
        });

        $(".father_image").rules("add", {
            required: true,
        });
        $('#father_first_name').val('').attr('readonly', false);
        $('#father_last_name').val('').attr('readonly', false);
        $('#father_mobile').val('').attr('readonly', false);
        $('#father_occupation').val('').attr('readonly', false);
        $('#father_dob').val('').attr('readonly', false);
        $('#father-image-tag').attr('src', '');
    }
    return repo.email || repo.text;
});
parentSearch($(".mother-search"), baseUrl + "/parent/search", {'type': 'mother'}, 'Search for Mother Email', parentSearchSelect2DesignTemplate, function (repo) {
    if (!repo.text) {
        //Remove dynamic jquery validation
        $(".mother-search").rules("remove", "email");
        $(".mother_image").rules("remove", "required");
        $('#mother_first_name').val(repo.first_name).attr('readonly', true);
        $('#mother_last_name').val(repo.last_name).attr('readonly', true);
        $('#mother_mobile').val(repo.mobile).attr('readonly', true);
        $('#mother_occupation').val(repo.occupation).attr('readonly', true);
        $('#mother_dob').val(repo.dob).attr('readonly', true);
        $('#mother-image-tag').attr('src', repo.image);
    } else {
        //Add dynamic jquery validation
        $(".mother-search").rules("add", {
            email: true,
        });
        $(".mother_image").rules("add", {
            required: true,
        });
        $('#mother_first_name').val('').attr('readonly', false);
        $('#mother_last_name').val('').attr('readonly', false);
        $('#mother_mobile').val('').attr('readonly', false);
        $('#mother_occupation').val('').attr('readonly', false);
        $('#mother_dob').val('').attr('readonly', false);
        $('#mother-image-tag').attr('src', '');
    }
    return repo.email || repo.text;
});
//Father Search
parentSearch($(".guardian-search"), baseUrl + "/parent/search", null, 'Search for Guardian Email', parentSearchSelect2DesignTemplate, function (repo) {
    if (!repo.text) {
        //Remove dynamic jquery validation
        $(".guardian-search").rules("remove", "email");
        $(".guardian_image").rules("remove", "required");
        $('#guardian_first_name').val(repo.first_name).attr('readonly', true);
        $('#guardian_last_name').val(repo.last_name).attr('readonly', true);
        $('#guardian_mobile').val(repo.mobile).attr('readonly', true);
        $('#guardian_occupation').val(repo.occupation).attr('readonly', true);
        $('#guardian_dob').val(repo.dob).attr('readonly', true);
        $('#guardian-image-tag').attr('src', repo.image).attr('readonly', true);
    } else {
        //Add dynamic jquery validation
        $(".guardian-search").rules("add", {
            email: true,
        });

        $(".guardian_image").rules("add", {
            required: true,
        });
        $('#guardian_first_name').val('').attr('readonly', false);
        $('#guardian_last_name').val('').attr('readonly', false);
        $('#guardian_mobile').val('').attr('readonly', false);
        $('#guardian_occupation').val('').attr('readonly', false);
        $('#guardian_dob').val('').attr('readonly', false);
        $('#guardian-image-tag').attr('src', '').attr('readonly', false);
    }
    return repo.email || repo.text;
});

parentSearch($(".edit-father-search"), baseUrl + "/parent/search", {'type': 'father'}, 'Search for Father Email', parentSearchSelect2DesignTemplate, function (repo) {
    if (!repo.text) {
        //Remove dynamic jquery validation
        $(".edit-father-search").rules("remove", "email");
        $(".father_image").rules("remove", "required");
        $('#edit_father_first_name').val(repo.first_name).attr('readonly', true);
        $('#edit_father_last_name').val(repo.last_name).attr('readonly', true);
        $('#edit_father_mobile').val(repo.mobile).attr('readonly', true);
        $('#edit_father_occupation').val(repo.occupation).attr('readonly', true);
        $('#edit_father_dob').val(repo.dob).attr('readonly', true);
        $('#edit-father-image-tag').attr('src', repo.image);
        // } else if (repo.text !== "Search for Father Email") {
    } else {

        //Add dynamic jquery validation
        $(".edit-father-search").rules("add", {
            email: true,
        });

        $(".father_image").rules("add", {
            required: true,
        });
        $('#edit_father_first_name').val('').attr('readonly', false);
        $('#edit_father_last_name').val('').attr('readonly', false);
        $('#edit_father_mobile').val('').attr('readonly', false);
        $('#edit_father_occupation').val('').attr('readonly', false);
        $('#edit_father_dob').val('').attr('readonly', false);
        $('#edit-father-image-tag').attr('src', '');
    }
    // }
    return repo.email || repo.text;
});

parentSearch($(".edit-mother-search"), baseUrl + "/parent/search", {'type': 'mother'}, 'Search for Mother Email', parentSearchSelect2DesignTemplate, function (repo) {
    if (!repo.text) {
        //Remove dynamic jquery validation
        $(".edit-mother-search").rules("remove", "email");
        $(".mother_image").rules("remove", "required");
        $('#edit_mother_first_name').val(repo.first_name).attr('readonly', true);
        $('#edit_mother_last_name').val(repo.last_name).attr('readonly', true);
        $('#edit_mother_mobile').val(repo.mobile).attr('readonly', true);
        $('#edit_mother_occupation').val(repo.occupation).attr('readonly', true);
        $('#edit_mother_dob').val(repo.dob).attr('readonly', true);
        $('#edit-mother-image-tag').attr('src', repo.image);
    } else {
        //Add dynamic jquery validation
        $(".edit-mother-search").rules("add", {
            email: true,
        });
        $(".mother_image").rules("add", {
            required: true,
        });
        $('#edit_mother_first_name').val('').attr('readonly', false);
        $('#edit_mother_last_name').val('').attr('readonly', false);
        $('#edit_mother_mobile').val('').attr('readonly', false);
        $('#edit_mother_occupation').val('').attr('readonly', false);
        $('#edit_mother_dob').val('').attr('readonly', false);
        $('#edit-mother-image-tag').attr('src', '');
    }
    return repo.email || repo.text;
});

parentSearch($(".edit-guardian-search"), baseUrl + "/parent/search", null, 'Search for Guardian Email', parentSearchSelect2DesignTemplate, function (repo) {
    if (!repo.text) {
        //Remove dynamic jquery validation
        $(".edit-guardian-search").rules("remove", "email");
        $(".guardian_image").rules("remove", "required");
        $('#edit_guardian_first_name').val(repo.first_name).attr('readonly', true);
        $('#edit_guardian_last_name').val(repo.last_name).attr('readonly', true);
        $('#edit_guardian_mobile').val(repo.mobile).attr('readonly', true);
        $('#edit_guardian_occupation').val(repo.occupation).attr('readonly', true);
        $('#edit_guardian_dob').val(repo.dob).attr('readonly', true);
        $('#edit-guardian-image-tag').attr('src', repo.image).attr('readonly', true);
    } else {
        //Add dynamic jquery validation
        $(".edit-guardian-search").rules("add", {
            email: true,
        });
        $(".guardian_image").rules("add", {
            required: true,
        });
        $('#edit_guardian_first_name').val('').attr('readonly', false);
        $('#edit_guardian_last_name').val('').attr('readonly', false);
        $('#edit_guardian_mobile').val('').attr('readonly', false);
        $('#edit_guardian_occupation').val('').attr('readonly', false);
        $('#edit_guardian_dob').val('').attr('readonly', false);
        $('#edit-guardian-image-tag').attr('src', '').attr('readonly', false);
    }
    return repo.email || repo.text;
});
$(document).on('submit', '.setting-form', function (e) {
    e.preventDefault();
    var data = new FormData(this);
    var message = data.get('setting_message');
    var type = $('#type').val();
    var url = $(this).attr('action');
    $.ajax({
        type: "POST",
        url: url,
        data: {message: message, type: type},
        success: function (response) {
            if (response.error == false) {
                showSuccessToast(response.message);
            } else {
                showErrorToast(response.message);
            }
        }

    });
});

$('.general-setting').on('submit', function (e) {
    e.preventDefault();
    let formElement = $(this);
    let submitButtonElement = $(this).find(':submit');
    let url = $(this).attr('action');
    let data = new FormData(this);

    function successCallback() {
        setTimeout(function () {
            location.reload();
        }, 3000)
    }

    formAjaxRequest('POST', url, data, formElement, submitButtonElement, successCallback);
});

$('#timetable_class_section').on('change', function () {
    if ($(this).val() !== "") {
        $('#timetable-div').removeClass('d-none');
    } else {
        $('#timetable-div').addClass('d-none');
    }
});


$('.assign_student_class').on('submit', function (e) {
    e.preventDefault();
    let formElement = $(this);
    let submitButtonElement = $(this).find(':submit');
    let url = $(this).attr('action');
    let data = new FormData(this);

    function successCallback() {
        formElement[0].reset();
        $('#assign_table_list').bootstrapTable('refresh');
    }

    formAjaxRequest('POST', url, data, formElement, submitButtonElement, successCallback);
})
$('.class_section_id').on('change', function () {
    // let class_id = $(this).find(':selected').data('class');
    let class_section_id = $(this).val();
    let url = baseUrl + '/subject-by-class-section';
    let data = {class_section_id: class_section_id};

    function successCallback(response) {
        if (response.length > 0) {
            let html = '';
            html += '<option>--Select Subject--</option>';
            $.each(response, function (key, value) {
                html += '<option value="' + value.subject_id + '">' + value.subject.name + '</option>'
            });
            $('.subject_id').html(html);
        } else {
            $('.subject_id').html("<option value=''>--No data Found--</option>>");
        }
    }

    ajaxRequest('GET', url, data, null, successCallback, null, null, true)
})

$('#edit_class_section_id').on('change', function (e, subject_id) {
    // let class_id = $(this).find(':selected').data('class');
    let class_section_id = $(this).val();
    let url = baseUrl + '/subject-by-class-section';
    let data = {class_section_id: class_section_id};

    function successCallback(response) {
        if (response.length > 0) {
            let html = '';
            $.each(response, function (key, value) {
                html += '<option value="' + value.subject_id + '">' + value.subject.name + '</option>'
            });
            $('#edit_subject_id').html(html);
            if (subject_id) {
                $('#edit_subject_id').val(subject_id);
            }
        } else {
            $('#edit_subject_id').html("<option value=''>--No data Found--</option>>");
        }
    }

    ajaxRequest('GET', url, data, null, successCallback, null, null, true)
})

$(document).on('change', '.timetable_start_time', function () {
    let $this = $(this);
    let end_time = $(this).parent().siblings().children('.timetable_end_time');
    $(end_time).rules("add", {
        timeGreaterThan: $this,
    });
})

$('#system-update').on('submit', function (e) {
    e.preventDefault();
    let formElement = $(this);
    let submitButtonElement = $(this).find(':submit');
    let url = $(this).attr('action');
    let data = new FormData(this);

    function successCallback() {
        setTimeout(function () {
            window.location.reload();
        }, 1000)
    }

    formAjaxRequest('POST', url, data, formElement, submitButtonElement, successCallback);
})

$("#create-form").submit(function (e) {
    e.preventDefault();
    let form = new FormData();
    $.ajax({
        type: "post",
        url: "students/store_bulk",
        data: form,
        dataType: "json",
        success: function (response) {
            if (response.error == false) {
                showSuccessToast(response.message);
            } else {
                showErrorToast(response.message);
            }
        }
    });
});


// get classes on Drop down exam changes
$('#exam_options').on('change', function () {
    let exam_id = $(this).val();
    let url = baseUrl + '/exam/get-classes/' + exam_id;
    $.ajax({
        type: "get",
        url: url,
        success: function (response) {
            let html = ""
            if (response.data.length > 0) {
                html += "<option value='" + null + "'>--- Select ---</option>";
                $.each(response.data, function (key, data) {
                    html += "<option value='" + data.class_id + "'>" + data.class.name + ' ' + data.class.medium.name + "</option>";
                });
            } else {
                html = "<option value=''>No Data Found</option>";
            }
            $('#exam_classes_options').html(html);
        }
    });
});

// get Subjects on Drop down classes changes
$('#exam_classes_options').on('change', function () {
    let class_id = $(this).val();
    let url = baseUrl + '/exam/get-subjects/' + class_id;
    $.ajax({
        type: "get",
        url: url,
        success: function (response) {
            let html = ""
            if (response.data.length > 0) {
                $.each(response.data, function (key, data) {
                    html += "<option value='" + data.subject.id + "'>" + data.subject.name + "</option>";
                });
            } else {
                html = "<option value=''>No Data Found</option>";
            }
            $('.exam_subjects_options').html(html);
        }
    });
});


// add more subject in create exam timetable
$(document).on('click', '.add-exam-timetable-content', function (e) {
    e.preventDefault();
    let html = $('.exam_timetable_content:last').clone();
    html.find('.error').remove();
    html.find('.has-danger').removeClass('has-danger');
    // This function will replace the last index value and increment in the multidimensional name attribute
    html.find('.form-control').each(function (key, element) {
        this.name = this.name.replace(/\[(\d+)\]/, function (str, p1) {
            return '[' + (parseInt(p1, 10) + 1) + ']';
        });
    })
    html.find('.add-exam-timetable-content i').addClass('fa-times').removeClass('fa-plus');
    html.find('.add-exam-timetable-content').addClass('btn-inverse-danger remove-exam-timetable-content').removeClass('btn-inverse-success add-exam-timetable');
    $(this).parent().parent().parent().siblings('.extra-timetable').append(html);
    html.find('.form-control').val('');
});

// remove more subject in create exam timetable
$(document).on('click', '.remove-exam-timetable-content', function (e) {
    e.preventDefault();
    $(this).parent().parent().parent().remove();
});

$(".exam_class_filter").find("select").change(function () {
    $table.bootstrapTable("refreshOptions", {
        exportDataType: $(this).val()
    });
});

$("#edit_class_id").on('change', function () {
    let data = $(this).find(':selected').data("medium");
    let url = baseUrl + "/class-subject-list/" + data
    $.ajax({
        type: "GET",
        url: url,
        success: function (response) {
            let html = ""
            if (response.data.length > 0) {
                response.data.forEach(function (data) {
                    html += "<option value='" + data.id + "'>" + data.name + "</option>";
                })
            } else {
                html = "<option value=''>No Data Found</option>";
            }
            $('.core-subject-id').html(html);
            $('.elective-subject-name').html(html)
        }
    });
});

// According to Conditions Show the Button of Adding new row
function checkAddNewRowBtn() {
    if ($('.grade_content').find('.ending_range').length) {
        let chk_max = $(this).val();
        if (chk_max < 100 && chk_max != '') {
            $('.add-grade-content').prop('disabled', false);
        } else {
            $('.add-grade-content').prop('disabled', true);
        }
        $('.ending_range:last').keyup(function (e) {
            let chk_max = $(this).val();
            if (chk_max < 100 && chk_max != '') {
                $('.add-grade-content').prop('disabled', false);
            } else {
                $('.add-grade-content').prop('disabled', true);
            }
        });

    } else {
        $('.add-grade-content').prop('disabled', false);
    }
}

checkAddNewRowBtn();

// create grade ajax
$('#create-grades').on('submit', function (e) {
    e.preventDefault();
    let formElement = $(this);
    let submitButtonElement = $(this).find(':submit');
    let url = $(this).attr('action');
    let data = new FormData(this);

    function successCallback() {
        window.location.reload();
        checkAddNewRowBtn(); // calling the function of adding new row btn
    }

    formAjaxRequest('POST', url, data, formElement, submitButtonElement, successCallback);
})
$('.remove-grades').hide();
$('.grade_content:last').find('.remove-grades').show();
let value = parseInt($('.grade_content:last').find('.ending_range').val());
if (value >= 100) {
    $('.add-grade-content').prop('disabled', true);
} else {
    $('.add-grade-content').prop('disabled', false);
}
//adding new row for grade
$(document).on('click', '.add-grade-content', function (e) {
    e.preventDefault();
    let value = parseFloat($('.grade_content:last').find('.ending_range').val());
    if (value) {
        value = value + 1;
    } else {
        value = 0;
    }
    let html = $('.grade_content:last').clone();
    $('.grade_content:last').find('.remove-grades').hide();
    html.find('.error').remove();
    html.find('.temp_starting_range').removeClass('temp_starting_range').addClass('starting_range');
    html.find('.temp_ending_range').removeClass('temp_ending_range').addClass('ending_range');
    html.find('.temp_grade').removeClass('temp_grade').addClass('grade');
    html.css('display', 'block');
    html.find('.has-danger').removeClass('has-danger');
    html.find('.hidden').remove();
    html.find(".remove-grades").removeAttr('data-id');
    // This function will replace the last index value and increment in the multidimensional name attribute
    $(this).parent().siblings('.extra-grade-content').append(html);
    $('.add-grade-content').prop('disabled', true);
    html.find('.starting_range').val('')
    html.find('.ending_range').val('');
    html.find('.grade').val('');
    html.find('input').each(function (key, element) {
        this.name = this.name.replace(/\[(\d+)\]/, function (str, p1) {
            return '[' + (parseInt(p1, 10) + 1) + ']';
        });
    })
    let increment_stating_range = html.find('.starting_range').val(value);
    increment_stating_range.attr('min', value);
    let min_attr = parseInt(increment_stating_range.attr("min"));
    increment_stating_range.keyup(function () {
        if ($(this).val()) {
            if ($(this).val() < min_attr) {
                $('.add-grade-content').prop('disabled', true);
            }
        } else {
            $('.add-grade-content').prop('disabled', true);
        }
    });

    let ending_range = html.find('.ending_range');
    ending_range.attr('max', 100);
    ending_range.keyup(function () {
        if ($(this).val()) {
            if ($(this).val() <= min_attr) {
                $('.add-grade-content').prop('disabled', true);
            } else {
                if ($(this).val() < 100) {
                    $('.add-grade-content').prop('disabled', false);
                } else {
                    $('.add-grade-content').prop('disabled', true);
                }
            }
        } else {
            $('.add-grade-content').prop('disabled', true);
        }
    });
});
// remove more grade in create grade
$(document).on('click', '.remove-grades', function (e) {
    e.preventDefault();
    let $this = $(this);
    if ($(this).data('id')) {
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
                let id = $this.data('id');
                let url = baseUrl + '/destroy-grades/' + id;

                function successCallback() {
                    $this.parent().parent().remove();
                    window.location.reload();
                    checkAddNewRowBtn();
                }

                ajaxRequest('DELETE', url, null, null, successCallback);

            }
        })
    } else {
        $(this).parent().parent().parent().remove();
        $('.grade_content:last').find('.remove-grades').show();
        let last_ending_val = $('.grade_content:last').find('.ending_range').val();
        if (last_ending_val >= 100 && last_ending_val == '') {
            $('.add-grade-content').prop('disabled', true);
        } else {
            $('.add-grade-content').prop('disabled', false);
        }
        $('.ending_range:last').keyup(function (e) {
            let chk_max = $(this).val();
            if (chk_max < 100 && chk_max != '') {
                $('.add-grade-content').prop('disabled', false);
            } else {
                $('.add-grade-content').prop('disabled', true);
            }
        });
    }
});

$('.assign_subject_teacher').on('submit', function (e) {
    e.preventDefault();
    let formElement = $(this);
    let submitButtonElement = $(this).find(':submit');
    let url = $(this).attr('action');
    let data = new FormData(this);

    function successCallback() {
        formElement[0].reset();
        $('.select2-selection__rendered').html('');
        $('#table_list').bootstrapTable('refresh');
    }

    formAjaxRequest('POST', url, data, formElement, submitButtonElement, successCallback);
})
$('.student-registration-form').on('submit', function (e) {
    e.preventDefault();
    let formElement = $(this);
    let submitButtonElement = $(this).find(':submit');
    let url = $(this).attr('action');
    let data = new FormData(this);

    function successCallback() {
        window.location.reload();
    }

    formAjaxRequest('POST', url, data, formElement, submitButtonElement, successCallback);
})
$('#admin-profile-update').on('submit', function (e) {
    e.preventDefault();
    let formElement = $(this);
    let submitButtonElement = $(this).find(':submit');
    let url = $(this).attr('action');
    let data = new FormData(this);


    function successCallback() {
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }

    formAjaxRequest('POST', url, data, formElement, submitButtonElement, successCallback);
})
$('.edit_exam_result_marks_form').on('submit', function (e) {
    e.preventDefault();
    let formElement = $(this);
    let submitButtonElement = $(this).find(':submit');
    let url = $(this).attr('action');
    let data = new FormData(this);


    function successCallback() {
        $('#editModal').modal('hide');
        $('#table_list').bootstrapTable('refresh');
    }

    formAjaxRequest('POST', url, data, formElement, submitButtonElement, successCallback);
})
$('.create_exam_timetable_form').on('submit', function (e) {
    e.preventDefault();
    let formElement = $(this);
    let submitButtonElement = $(this).find(':submit');
    let url = $(this).attr('action');
    let data = new FormData(this);


    function successCallback() {
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }

    formAjaxRequest('POST', url, data, formElement, submitButtonElement, successCallback);
})
$('.add-new-timetable-data').click(function (e) {
    e.preventDefault();
    let html;
    if (!$('.edit-timetable-container:last').is(':empty')) {
        html = $('.edit-timetable-container').find('.edit_exam_timetable:last').clone();
    } else {
        html = $('.edit_exam_timetable_tamplate').clone();
    }
    html.css('display', 'block');
    html.find('.error').remove();
    html.removeClass('edit_exam_timetable_tamplate').addClass('edit_exam_timetable');
    html.find('.has-danger').removeClass('has-danger');
    html.find('.remove-edit-exam-timetable-content').removeAttr('data-timetable_id');
    // This function will replace the last index value and increment in the multidimensional name attribute
    html.find('.form-control').each(function (key, element) {
        this.name = this.name.replace(/\[(\d+)\]/, function (str, p1) {
            return '[' + (parseInt(p1, 10) + 1) + ']';
        });
    })
    $(this).parent().siblings('.edit-timetable-container').append(html);
    html.find('.form-control').val('');

});

$('.edit-form-timetable').on('submit', function (e) {
    e.preventDefault();
    let formElement = $(this);
    let submitButtonElement = $(this).find(':submit');
    let url = $(this).attr('action');
    let data = new FormData(this);


    function successCallback() {
        $('#editModal').modal('hide');
        $('#table_list').bootstrapTable('refresh');
    }

    formAjaxRequest('POST', url, data, formElement, submitButtonElement, successCallback);
})
$('.verify_email').on('submit', function (e) {
    e.preventDefault();
    let formElement = $(this);
    let submitButtonElement = $(this).find(':submit');
    let url = $(this).attr('action');
    let data = new FormData(this);


    function successCallback() {
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }

    formAjaxRequest('POST', url, data, formElement, submitButtonElement, successCallback);
});
