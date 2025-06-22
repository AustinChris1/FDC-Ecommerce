<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">

    <link rel="icon" href="{{ Vite::asset('resources/js/layouts/frontend/assets/fdcLogo.png') }}" />
    <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;700&display=swap" rel="stylesheet" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>First Digits Communications</title>
</head>

<body>
    <div id="root"></div>

    @viteReactRefresh
    @vite('resources/js/main.jsx')
</body>

</html>
