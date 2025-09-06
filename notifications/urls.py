from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NotificationSettingsViewSet,
    EmailNotificationViewSet,
    SMSNotificationViewSet,
    AlertRuleViewSet,
    NotificationViewSet
)

router = DefaultRouter()
router.register(r'notification-settings', NotificationSettingsViewSet, basename='notification-settings')
router.register(r'email-notifications', EmailNotificationViewSet, basename='email-notification')
router.register(r'sms-notifications', SMSNotificationViewSet, basename='sms-notification')
router.register(r'alert-rules', AlertRuleViewSet, basename='alert-rule')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
]


