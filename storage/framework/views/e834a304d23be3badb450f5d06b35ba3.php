<!DOCTYPE html>
<html lang="<?php echo e(str_replace('_', '-', app()->getLocale())); ?>">

<head>
    <meta charset="utf-8">

    <link rel="icon" href="<?php echo e(Vite::asset('resources/js/layouts/frontend/assets/fdcLogo.png')); ?>" />
    <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;700&display=swap" rel="stylesheet" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>First Digit Communications</title>
</head>

<body>
    <div id="root"></div>

    <?php echo app('Illuminate\Foundation\Vite')->reactRefresh(); ?>
    <?php echo app('Illuminate\Foundation\Vite')('resources/js/main.jsx'); ?>
</body>

</html>
<?php /**PATH C:\Users\Admin\Desktop\Sites\Ecom\resources\views/spa.blade.php ENDPATH**/ ?>