<!DOCTYPE html>
<html>
<head>
    <title>New Contact Message</title>
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

        .footer {
            background-color: #2D2D4F; /* Darker accent for footer */
            padding: 20px 25px;
            text-align: center;
            font-size: 13px;
            color: #A0A0A0; /* Slightly desaturated text for footer */
            border-top: 1px solid #3A3A5A; /* Subtle separator line */
        }

        .footer a {
            color: #A855F7; /* Purple accent for footer links */
            font-weight: 600;
        }

        .detail-label {
            color: #7B7B9E; /* Muted label color */
            font-weight: 600;
            display: inline-block;
            min-width: 70px; /* Align labels */
        }

        .highlight-value {
            color: #34D399; /* Bright green for highlighted values */
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
            .content, .footer {
                padding: 20px 15px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            NEW CONTACT MESSAGE
        </div>
        <div class="content">
            <p style="font-size:18px; font-weight:600; color:#FFFFFF;">A new message has been submitted:</p>
            <p><span class="detail-label">Name:</span> <span class="highlight-value">{{ $details['name'] }}</span></p>
            <p><span class="detail-label">Email:</span> <span class="highlight-value">{{ $details['email'] }}</span></p>
            <p><span class="detail-label">Subject:</span> <span class="highlight-value">{{ $details['subject'] }}</span></p>
            <p style="margin-top: 25px; margin-bottom: 10px; font-weight: 600; color:#FFFFFF;">Message:</p>
            <p style="background-color: #1A1A2E; padding: 15px; border-radius: 8px; color: #E0E0E0; border: 1px solid #3A3A5A;">{{ $details['message'] }}</p>
        </div>
        <div class="footer">
            <p>This email was generated automatically by your website's contact form.</p>
            <p>Please do not reply directly to this email. For assistance, contact <a href="mailto:help@firstdigit.com.ng">help@firstdigit.com.ng</a></p>
            <p style="margin-top:15px; color:#6B6B8A;">&copy; 2025 FirstSmart Mart. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
