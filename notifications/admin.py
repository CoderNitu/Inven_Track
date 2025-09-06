from django.contrib import admin
from .models import NotificationSettings, EmailNotification, SMSNotification, AlertRule

@admin.register(NotificationSettings)
class NotificationSettingsAdmin(admin.ModelAdmin):
    list_display = ('user', 'email_notifications', 'sms_notifications', 'critical_stockout_alerts', 'reorder_point_alerts')
    list_filter = ('email_notifications', 'sms_notifications', 'critical_stockout_alerts', 'reorder_point_alerts')
    search_fields = ('user__username', 'user__email')

@admin.register(EmailNotification)
class EmailNotificationAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'notification_type', 'subject', 'status', 'created_at', 'sent_at')
    list_filter = ('notification_type', 'status', 'created_at')
    search_fields = ('recipient__username', 'recipient__email', 'subject')
    readonly_fields = ('created_at', 'sent_at')
    ordering = ('-created_at',)

@admin.register(SMSNotification)
class SMSNotificationAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'notification_type', 'phone_number', 'status', 'created_at', 'sent_at')
    list_filter = ('notification_type', 'status', 'created_at')
    search_fields = ('recipient__username', 'phone_number')
    readonly_fields = ('created_at', 'sent_at')
    ordering = ('-created_at',)

@admin.register(AlertRule)
class AlertRuleAdmin(admin.ModelAdmin):
    list_display = ('name', 'alert_type', 'is_active', 'created_at')
    list_filter = ('alert_type', 'is_active', 'created_at')
    search_fields = ('name', 'description')


