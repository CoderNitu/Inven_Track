#!/usr/bin/env python
"""
Setup script for user notification settings
Run this script to configure your phone number and email for notifications
"""

import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'supply_inventory.settings')
django.setup()

from django.contrib.auth.models import User
from notifications.models import NotificationSettings

def setup_user_notifications():
    """Setup notification settings for the user"""
    print("\n=== User Notification Setup ===")
    
    # Get or create the user (using 'admin' as default)
    try:
        user = User.objects.get(username='admin')
    except User.DoesNotExist:
        print("User 'admin' not found. Creating...")
        user = User.objects.create_user(
            username='admin',
            email='nitualam07@gmail.com',
            password='admin123',
            is_staff=True,
            is_superuser=True
        )
    
    # Get or create notification settings
    notification_settings, created = NotificationSettings.objects.get_or_create(
        user=user,
        defaults={
            'email_notifications': True,
            'sms_notifications': True,
            'critical_stockout_alerts': True,
            'reorder_point_alerts': True,
            'purchase_order_updates': True,
            'phone_number': '+18638154902',  # Your phone number with country code
        }
    )
    
    if created:
        print(f"✅ Created notification settings for user: {user.username}")
    else:
        print(f"✅ Updated notification settings for user: {user.username}")
    
    # Update phone number
    notification_settings.phone_number = '+18638154902'
    notification_settings.save()
    
    print(f"📧 Email: {user.email}")
    print(f"📱 Phone: {notification_settings.phone_number}")
    print(f"🔔 Email notifications: {notification_settings.email_notifications}")
    print(f"📱 SMS notifications: {notification_settings.sms_notifications}")
    print(f"🚨 Critical alerts: {notification_settings.critical_stockout_alerts}")
    print(f"📦 Reorder alerts: {notification_settings.reorder_point_alerts}")
    print(f"📋 Purchase order updates: {notification_settings.purchase_order_updates}")
    print(f"📊 Daily summary: {notification_settings.daily_summary}")
    
    print("\n✅ User notification setup completed!")
    print("🔧 You can now test notifications using the test buttons in the admin panel")
    
    return user, notification_settings

def test_notifications():
    """Test email and SMS notifications"""
    print("\n=== Testing Notifications ===")
    
    from notifications.services import EmailService, SMSService
    from products.models import Product
    
    # Get a test product
    try:
        product = Product.objects.first()
        if not product:
            print("❌ No products found. Please create some products first.")
            return
        
        print(f"🧪 Testing with product: {product.name}")
        
        # Test email
        print("📧 Testing email notification...")
        EmailService.send_reorder_point_alert(product, 5)
        print("✅ Email test completed")
        
        # Test SMS
        print("📱 Testing SMS notification...")
        SMSService.send_reorder_point_sms(product, 5)
        print("✅ SMS test completed")
        
    except Exception as e:
        print(f"❌ Error testing notifications: {e}")

if __name__ == "__main__":
    user, settings = setup_user_notifications()
    test_notifications()


