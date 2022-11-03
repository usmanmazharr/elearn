<!DOCTYPE html>
@php
    $lang = Session::get('language');
@endphp
@if($lang)
    @if ($lang->is_rtl)
        <html lang="en" dir="rtl">
    @else
        <html lang="en">
    @endif
@else
    <html lang="en">
@endif
<head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>@yield('title') || {{ config('app.name') }}</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    @include('layouts.include')
    @yield('css')

</head>
<body class="sidebar-fixed">
<div class="container-scroller">

    {{-- header --}}
    @include('layouts.header')

    <div class="container-fluid page-body-wrapper">

        {{-- siderbar --}}
        @include('layouts.sidebar')

        <div class="main-panel">

            @yield('content')

            {{-- footer --}}
            @include('layouts.footer')

        </div>

    </div>

</div>

@include('layouts.footer_js')

@yield('js')

@yield('script')

</body>

</html>
