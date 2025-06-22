<!DOCTYPE html>
<html>
<head>
    <title>Verify Your Email Address</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style type="text/css">
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap'); /* Using Inter font */

        body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', Arial, sans-serif;
            line-height: 1.6;
            color: #E0E0E0; /* Light gray text for body */
            background-color: #1A1A2E; /* Deep dark background */
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }

        table {
            border-collapse: collapse;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }

        td {
            padding: 0;
            margin: 0;
        }

        a {
            text-decoration: none;
            color: #6366F1; /* Purple accent for links */
        }

        .email-container {
            max-width: 600px;
            margin: 30px auto;
            background: #242440; /* Slightly lighter dark background for container */
            border-radius: 12px; /* More rounded corners */
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4); /* Stronger, dark shadow */
        }

        .header {
            background-color: #3B82F6; /* Vibrant blue header */
            padding: 25px 20px;
            text-align: center;
            font-size: 28px; /* Larger header text */
            font-weight: 700; /* Bold */
            color: #FFFFFF;
            letter-spacing: 0.05em; /* A bit of letter spacing */
        }

        .content {
            padding: 30px 25px; /* More padding */
        }

        .content p {
            margin: 15px 0;
            font-size: 16px;
            color: #C0C0C0; /* Lighter grey for content text */
        }

        .email-button {
            display: inline-block;
            padding: 15px 30px; /* Larger padding for the button */
            margin-top: 25px;
            color: #ffffff;
            background-color: #10B981; /* Green button for action */
            text-decoration: none;
            border-radius: 8px; /* Rounded button */
            font-size: 18px; /* Larger font for CTA */
            font-weight: 700; /* Bolder button text */
            transition: background-color 0.3s ease;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); /* Subtle button shadow */
        }

        .email-button:hover {
            background-color: #059669; /* Darker green on hover */
        }

        .email-footer {
            background-color: #2D2D4F; /* Darker accent for footer */
            padding: 20px 25px;
            text-align: center;
            font-size: 13px;
            color: #A0A0A0; /* Slightly desaturated text for footer */
            border-top: 1px solid #3A3A5A; /* Subtle separator line */
            margin-top: 30px; /* More space above footer */
        }

        .email-footer a {
            color: #A855F7; /* Purple accent for footer links */
            font-weight: 600;
        }

        .username-highlight {
            color: #FFD700; /* Gold color for username */
            font-weight: 700;
        }

        /* Responsive styles */
        @media only screen and (max-width: 620px) {
            .email-container {
                margin: 15px;
                border-radius: 8px;
            }
            .header {
                font-size: 24px;
                padding: 20px 15px;
            }
            .content, .email-footer {
                padding: 20px 15px;
            }
            .email-button {
                padding: 12px 24px;
                font-size: 16px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            EMAIL VERIFICATION
        </div>
        <div class="content">
            <p style="font-size:18px; color:#FFFFFF; margin-bottom: 25px;">Hi <span class="username-highlight">{{ $username }}</span>!</p>
            <p>Thank you for registering your account with First Digit Communications. To complete your registration and unlock full access, please verify your email address by clicking the button below:</p>
            <div style="text-align: center;">
                <a href="{{ $verificationUrl }}" class="email-button">Verify Your Email</a>
            </div>
            <p style="margin-top: 25px;">If you did not create an account or initiate this request, please disregard this email. Your account will not be activated.</p>
            <p style="font-size:14px; color:#909090;">This link is valid for a limited time. If the button doesn't work, copy and paste the following URL into your web browser:</p>
            <p style="word-break: break-all; font-size:14px; color:#6366F1;">{{ $verificationUrl }}</p>
        </div>
        <div class="email-footer">
            <p>This email was sent to you by First Digit Communications. Please do not reply directly to this message.</p>
            <p style="margin-top:10px;">For any questions, visit our <a href="#" style="color:#A855F7;">Help Center</a> or <a href="mailto:support@firstdigit.com.ng" style="color:#A855F7;">contact support</a>.</p>
            <p style="margin-top:15px; color:#6B6B8A;">&copy; {{ date('Y') }} First Digit Communications. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
