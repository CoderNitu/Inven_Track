from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from products.models import Product, Inventory

class NotificationSettings(models.Model):
    """User notification preferences"""
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    critical_stockout_alerts = models.BooleanField(default=True)
    reorder_point_alerts = models.BooleanField(default=True)
    purchase_order_updates = models.BooleanField(default=True)
    daily_summary = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    
    class Meta:
        verbose_name_plural = "Notification Settings"

class EmailNotification(models.Model):
    """Email notification records"""
    NOTIFICATION_TYPES = (
        ('critical_stockout', 'Critical Stockout'),
        ('reorder_point', 'Reorder Point Alert'),
        ('purchase_order', 'Purchase Order Update'),
        ('daily_summary', 'Daily Summary'),
        ('system_alert', 'System Alert'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
    )
    
    recipient = models.ForeignKey(User, on_delete=models.CASCADE)
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    related_product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']

class SMSNotification(models.Model):
    """SMS notification records"""
    NOTIFICATION_TYPES = (
        ('critical_stockout', 'Critical Stockout'),
        ('reorder_point', 'Reorder Point Alert'),
        ('purchase_order', 'Purchase Order Update'),
        ('system_alert', 'System Alert'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
    )
    
    recipient = models.ForeignKey(User, on_delete=models.CASCADE)
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    message = models.TextField()
    phone_number = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    related_product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = "SMS Notifications"

class AlertRule(models.Model):
    """Configurable alert rules"""
    name = models.CharField(max_length=100)
    description = models.TextField()
    is_active = models.BooleanField(default=True)
    alert_type = models.CharField(max_length=50, choices=EmailNotification.NOTIFICATION_TYPES)
    conditions = models.JSONField(default=dict)  # Store alert conditions as JSON
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name


