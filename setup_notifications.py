#!/usr/bin/env python
"""
Setup script for configuring email and SMS notifications
Run this script to set up your notification credentials
"""

import os
import getpass

def setup_email_config():
    """Setup email configuration"""
    print("\n=== Email Configuration ===")
    print("For Gmail, you'll need to:")
    print("1. Enable 2-factor authentication")
    print("2. Generate an App Password")
    print("3. Use the App Password instead of your regular password")
    
    email = input("Enter your email address: ").strip()
    password = getpass.getpass("Enter your email password/app password: ")
    
    return {
        'EMAIL_HOST_USER': email,
        'EMAIL_HOST_PASSWORD': password,
        'DEFAULT_FROM_EMAIL': email,
    }

def setup_sms_config():
    """Setup SMS configuration"""
    print("\n=== SMS Configuration (Twilio) ===")
    print("To use SMS notifications, you need a Twilio account:")
    print("1. Sign up at https://www.twilio.com")
    print("2. Get your Account SID and Auth Token from the dashboard")
    print("3. Get a Twilio phone number")
    
    use_sms = input("Do you want to set up SMS notifications? (y/n): ").strip().lower()
    
    if use_sms == 'y':
        account_sid = input("Enter your Twilio Account SID: ").strip()
        auth_token = getpass.getpass("Enter your Twilio Auth Token: ")
        from_number = input("Enter your Twilio phone number (+1234567890): ").strip()
        
        return {
            'TWILIO_ACCOUNT_SID': account_sid,
            'TWILIO_AUTH_TOKEN': auth_token,
            'TWILIO_FROM_NUMBER': from_number,
        }
    else:
        return {
            'TWILIO_ACCOUNT_SID': 'your_account_sid',
            'TWILIO_AUTH_TOKEN': 'your_auth_token',
            'TWILIO_FROM_NUMBER': 'your_twilio_phone_number',
        }

def create_config_file():
    """Create the config.py file"""
    print("\n=== Setting up notification configuration ===")
    
    email_config = setup_email_config()
    sms_config = setup_sms_config()
    
    config_content = f'''# Configuration file for Smart Inventory System
# Generated automatically by setup_notifications.py

# Email Configuration (Gmail)
EMAIL_CONFIG = {{
    'EMAIL_HOST_USER': '{email_config['EMAIL_HOST_USER']}',
    'EMAIL_HOST_PASSWORD': '{email_config['EMAIL_HOST_PASSWORD']}',
    'DEFAULT_FROM_EMAIL': '{email_config['DEFAULT_FROM_EMAIL']}',
}}

# SMS Configuration (Twilio)
SMS_CONFIG = {{
    'TWILIO_ACCOUNT_SID': '{sms_config['TWILIO_ACCOUNT_SID']}',
    'TWILIO_AUTH_TOKEN': '{sms_config['TWILIO_AUTH_TOKEN']}',
    'TWILIO_FROM_NUMBER': '{sms_config['TWILIO_FROM_NUMBER']}',
}}

# For other email providers:
# Outlook/Hotmail: smtp-mail.outlook.com, port 587
# Yahoo: smtp.mail.yahoo.com, port 587
# Custom SMTP: your-smtp-server.com, port 587 or 465

# For other SMS providers:
# AWS SNS, Vonage, MessageBird, etc.
'''
    
    with open('config.py', 'w') as f:
        f.write(config_content)
    
    print("\n✅ Configuration file created successfully!")
    print("📧 Email notifications will be sent to:", email_config['EMAIL_HOST_USER'])
    if sms_config['TWILIO_ACCOUNT_SID'] != 'your_account_sid':
        print("📱 SMS notifications will be sent from:", sms_config['TWILIO_FROM_NUMBER'])
    else:
        print("📱 SMS notifications are not configured")
    
    print("\n⚠️  Important:")
    print("- Keep your config.py file secure and don't commit it to version control")
    print("- Add 'config.py' to your .gitignore file")
    print("- Test your notifications using the test buttons in the admin panel")

if __name__ == "__main__":
    create_config_file()


