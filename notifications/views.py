from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from datetime import datetime, timedelta

from .models import NotificationSettings, EmailNotification, SMSNotification, AlertRule
from .serializers import (
    NotificationSettingsSerializer,
    EmailNotificationSerializer,
    SMSNotificationSerializer,
    AlertRuleSerializer,
    NotificationSummarySerializer
)
from .services import NotificationManager

class NotificationSettingsViewSet(viewsets.ModelViewSet):
    queryset = NotificationSettings.objects.all()
    serializer_class = NotificationSettingsSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['user__username', 'user__email']
    ordering_fields = ['user__username']

    @action(detail=False, methods=['post'])
    def check_alerts(self, request):
        """Manually trigger alert checking"""
        try:
            NotificationManager.check_and_send_alerts()
            return Response({
                'message': 'Alert checking completed successfully',
                'status': 'success'
            })
        except Exception as e:
            return Response({
                'message': f'Error checking alerts: {str(e)}',
                'status': 'error'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EmailNotificationViewSet(viewsets.ModelViewSet):
    queryset = EmailNotification.objects.all()
    serializer_class = EmailNotificationSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['recipient__username', 'recipient__email', 'subject']
    ordering_fields = ['created_at', 'sent_at', 'status']

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent email notifications"""
        days = int(request.query_params.get('days', 7))
        start_date = timezone.now().date() - timedelta(days=days)
        
        recent_emails = EmailNotification.objects.filter(
            created_at__date__gte=start_date
        ).order_by('-created_at')[:50]
        
        serializer = self.get_serializer(recent_emails, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def failed(self, request):
        """Get failed email notifications"""
        failed_emails = EmailNotification.objects.filter(
            status='failed'
        ).order_by('-created_at')
        
        serializer = self.get_serializer(failed_emails, many=True)
        return Response(serializer.data)

class SMSNotificationViewSet(viewsets.ModelViewSet):
    queryset = SMSNotification.objects.all()
    serializer_class = SMSNotificationSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['recipient__username', 'phone_number']
    ordering_fields = ['created_at', 'sent_at', 'status']

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent SMS notifications"""
        days = int(request.query_params.get('days', 7))
        start_date = timezone.now().date() - timedelta(days=days)
        
        recent_sms = SMSNotification.objects.filter(
            created_at__date__gte=start_date
        ).order_by('-created_at')[:50]
        
        serializer = self.get_serializer(recent_sms, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def failed(self, request):
        """Get failed SMS notifications"""
        failed_sms = SMSNotification.objects.filter(
            status='failed'
        ).order_by('-created_at')
        
        serializer = self.get_serializer(failed_sms, many=True)
        return Response(serializer.data)

class AlertRuleViewSet(viewsets.ModelViewSet):
    queryset = AlertRule.objects.all()
    serializer_class = AlertRuleSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']

class NotificationViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get notification summary statistics"""
        today = timezone.now().date()
        
        summary = {
            'total_emails': EmailNotification.objects.count(),
            'total_sms': SMSNotification.objects.count(),
            'pending_emails': EmailNotification.objects.filter(status='pending').count(),
            'pending_sms': SMSNotification.objects.filter(status='pending').count(),
            'failed_emails': EmailNotification.objects.filter(status='failed').count(),
            'failed_sms': SMSNotification.objects.filter(status='failed').count(),
            'critical_alerts_today': EmailNotification.objects.filter(
                notification_type='critical_stockout',
                created_at__date=today
            ).count()
        }
        
        serializer = NotificationSummarySerializer(summary)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def test_email(self, request):
        """Send a test email notification"""
        from .services import EmailService
        
        try:
            # Get the first product for testing
            from products.models import Product
            product = Product.objects.first()
            
            if product:
                EmailService.send_critical_stockout_alert(
                    product, 
                    5,  # Low stock for testing
                    timezone.now().date() + timedelta(days=2)
                )
                return Response({
                    'message': 'Test email sent successfully',
                    'status': 'success'
                })
            else:
                return Response({
                    'message': 'No products available for testing',
                    'status': 'error'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'message': f'Error sending test email: {str(e)}',
                'status': 'error'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def test_sms(self, request):
        """Send a test SMS notification"""
        from .services import SMSService
        
        try:
            # Get the first product for testing
            from products.models import Product
            product = Product.objects.first()
            
            if product:
                SMSService.send_critical_stockout_sms(
                    product, 
                    5,  # Low stock for testing
                    timezone.now().date() + timedelta(days=2)
                )
                return Response({
                    'message': 'Test SMS sent successfully',
                    'status': 'success'
                })
            else:
                return Response({
                    'message': 'No products available for testing',
                    'status': 'error'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'message': f'Error sending test SMS: {str(e)}',
                'status': 'error'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


