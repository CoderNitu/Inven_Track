# Configuration file for Smart Inventory System
# Copy this file to config.py and fill in your actual credentials

# Email Configuration (Gmail)
EMAIL_CONFIG = {
    'EMAIL_HOST_USER': 'your-email@gmail.com',
    'EMAIL_HOST_PASSWORD': 'your-app-password',  # Use Gmail App Password, not regular password
    'DEFAULT_FROM_EMAIL': 'your-email@gmail.com',
}

# SMS Configuration (Twilio)
SMS_CONFIG = {
    'TWILIO_ACCOUNT_SID': 'your-twilio-account-sid',
    'TWILIO_AUTH_TOKEN': 'your-twilio-auth-token',
    'TWILIO_FROM_NUMBER': '+1234567890'  # Your Twilio phone number
}

# For other email providers:
# Outlook/Hotmail: smtp-mail.outlook.com, port 587
# Yahoo: smtp.mail.yahoo.com, port 587
# Custom SMTP: your-smtp-server.com, port 587 or 465

# For other SMS providers:
# AWS SNS, Vonage, MessageBird, etc.

# IMPORTANT SECURITY NOTES:
# 1. Never commit config.py to version control
# 2. Use environment variables in production
# 3. For Gmail, enable 2FA and use App Password
# 4. Keep your credentials secure
