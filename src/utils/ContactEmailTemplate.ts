import { TContact } from "../app/modules/Contact/Contact.interface";


export const ContactEmailTemplate = (payload: TContact) => {
  return `
   <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>New Contact Message - SHift Work</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
        
        body {
            font-family: 'Poppins', sans-serif;
            background-color: #f0f4f8;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            border: 1px solid #e2e8f0;
        }

        .header {
            background-image: linear-gradient(to right, #0D9125, #32B34B);
            padding: 30px;
            text-align: center;
            position: relative;
        }

        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            color: #ffffff;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }
        
        .brand {
            font-size: 16px;
            font-weight: 600;
            letter-spacing: 2px;
            color: #e6f7e9;
            text-transform: uppercase;
            margin-top: 8px;
        }

        .icon {
            font-size: 48px;
            color: #e6f7e9;
            line-height: 1;
        }

        .content {
            padding: 30px;
        }
        
        .section-title {
            font-size: 20px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 20px;
        }

        .section-title span {
            display: inline-block;
            border-bottom: 2px solid #0D9125;
            padding-bottom: 5px;
        }
        
        .info-card {
            background-color: #f7fafc;
            border-left: 5px solid #0D9125;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
        }

        .info-item {
            display: block;
            margin-bottom: 10px;
        }

        .info-label {
            font-weight: 600;
            color: #4a5568;
            font-size: 14px;
            display: inline-block;
            width: 70px;
        }

        .info-value {
            font-size: 15px;
            color: #2d3748;
        }

        .message-box {
            background: #ffffff;
            border: 1px solid #cbd5e0;
            padding: 20px;
            border-radius: 8px;
            font-size: 15px;
            line-height: 1.7;
            color: #4a5568;
            white-space: pre-line;
        }

        .footer {
            background-color: #edf2f7;
            text-align: center;
            font-size: 12px;
            color: #718096;
            padding: 20px;
            border-top: 1px solid #e2e8f0;
        }

    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="icon">📩</div>
            <h1>New Contact Message</h1>
            <div class="brand">Nexbiz Market</div>
        </div>

        <div class="content">
            <h2 class="section-title"><span>Message Details</span></h2>
            <div class="info-card">
                <p class="info-item">
                    <span class="info-label">Name:</span>
                    <span class="info-value">${payload.firstName} ${payload.lastName}</span>
                </p>
                <p class="info-item">
                    <span class="info-label">Phone Number:</span>
                    <span class="info-value">${payload.phoneNumber}</span>
                </p>
                <p class="info-item">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${payload.email}</span>
                </p>
            </div>
            
            <h2 class="section-title"><span>Message</span></h2>
            <div class="message-box">
              ${payload.message}
            </div>
        </div>

        <div class="footer">
            <p>This message was sent from the SHift Work contact form.</p>
            <p>© ${new Date().getFullYear()} SHift Work. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
};
