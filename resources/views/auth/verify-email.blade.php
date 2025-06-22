<!DOCTYPE html>
<html>
<head>
    <title>Verify Your Email Address</title>
</head>
<body>
    <h1>Hi there!</h1>
<p>Didn't get the email?</p>    
<form method="POST" action="{{ route('verification.send') }}">
    @csrf
    <button type="submit" style="display: inline-block; padding: 10px 20px; color: white; background-color: blue; text-decoration: none; border-radius: 5px;">
        Resend Email
    </button>
</body>
</html>
