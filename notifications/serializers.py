from rest_framework import serializers
from .models import NotificationSettings, EmailNotification, SMSNotification, AlertRule
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class NotificationSettingsSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = NotificationSettings
        fields = '__all__'

class EmailNotificationSerializer(serializers.ModelSerializer):
    recipient = UserSerializer(read_only=True)
    related_product_name = serializers.CharField(source='related_product.name', read_only=True)
    
    class Meta:
        model = EmailNotification
        fields = '__all__'

class SMSNotificationSerializer(serializers.ModelSerializer):
    recipient = UserSerializer(read_only=True)
    related_product_name = serializers.CharField(source='related_product.name', read_only=True)
    
    class Meta:
        model = SMSNotification
        fields = '__all__'

class AlertRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlertRule
        fields = '__all__'

class NotificationSummarySerializer(serializers.Serializer):
    total_emails = serializers.IntegerField()
    total_sms = serializers.IntegerField()
    pending_emails = serializers.IntegerField()
    pending_sms = serializers.IntegerField()
    failed_emails = serializers.IntegerField()
    failed_sms = serializers.IntegerField()
    critical_alerts_today = serializers.IntegerField()


