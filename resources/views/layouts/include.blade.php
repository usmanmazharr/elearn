@php
    $lang = Session::get('language');
@endphp
<link rel="stylesheet" href="{{ asset('/assets/css/vendor.bundle.base.css') }}">

<link rel="stylesheet" href="{{ asset('/assets/fonts/font-awesome.min.css') }}"/>
<link rel="stylesheet" href="{{ asset('/assets/select2/select2.min.css') }}">
<link rel="stylesheet" href="{{ asset('/assets/jquery-toast-plugin/jquery.toast.min.css') }}">
<link rel="stylesheet" href="{{ asset('/assets/color-picker/color.min.css') }}">
@if ($lang)
    @if ($lang->is_rtl)
        <link rel="stylesheet" href="{{ asset('/assets/css/rtl.css') }}">
    @else
        <link rel="stylesheet" href="{{ asset('/assets/css/style.css') }}">
    @endif
@else
    <link rel="stylesheet" href="{{ asset('/assets/css/style.css') }}">
@endif
<link rel="stylesheet" href="{{ asset('/assets/css/datepicker.min.css') }}">
<link rel="stylesheet" href="{{ asset('/assets/css/ekko-lightbox.css') }}">

<link rel="stylesheet" href="{{ asset('/assets/bootstrap-table/bootstrap-table.min.css') }}">
<link rel="stylesheet" href="{{ asset('/assets/bootstrap-table/fixed-columns.min.css') }}">

{{-- <link rel="shortcut icon" href="{{asset(config('global.LOGO_SM')) }}" /> --}}
<link rel="shortcut icon" href="{{ url(Storage::url(env('FAVICON'))) }}"/>

@php
    $theme_color = getSettings('theme_color');
    // echo json_encode($theme_color);
    $theme_color = $theme_color['theme_color'];
@endphp
<style>
    :root {
        --theme-color: <?=$theme_color ?>;
    }
</style>
<script>
    var baseUrl = "{{ URL::to('/') }}";
</script>
