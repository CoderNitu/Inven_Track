import smtplib
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone
from .models import EmailNotification, SMSNotification, NotificationSettings
from products.models import Product, Inventory
from analytics.models import StockOutPrediction

class EmailService:
    """Service for sending email notifications"""
    
    @staticmethod
    def send_critical_stockout_alert(product, current_stock, predicted_stockout_date):
        """Send critical stockout alert email"""
        subject = f"🚨 CRITICAL: {product.name} Stockout Alert"
        
        message = f"""
        <html>
        <body>
            <h2>🚨 Critical Stockout Alert</h2>
            <p><strong>Product:</strong> {product.name} ({product.sku})</p>
            <p><strong>Current Stock:</strong> {current_stock} units</p>
            <p><strong>Predicted Stockout Date:</strong> {predicted_stockout_date}</p>
            <p><strong>Supplier:</strong> {product.supplier.name if product.supplier else 'No supplier assigned'}</p>
            <p><strong>Reorder Point:</strong> {product.reorder_point}</p>
            <p><strong>Reorder Quantity:</strong> {product.reorder_quantity}</p>
            
            <h3>Recommended Actions:</h3>
            <ul>
                <li>Immediately place purchase order with supplier</li>
                <li>Check if alternative suppliers are available</li>
                <li>Review demand forecasting for this product</li>
                <li>Consider emergency procurement if needed</li>
            </ul>
            
            <p><em>This is an automated alert from your Smart Inventory System.</em></p>
        </body>
        </html>
        """
        
        # Get all users with email notifications enabled
        users = NotificationSettings.objects.filter(
            email_notifications=True,
            critical_stockout_alerts=True
        ).values_list('user__email', flat=True)
        
        for email in users:
            if email:
                EmailService._send_email(email, subject, message, 'critical_stockout', product)
    
    @staticmethod
    def send_reorder_point_alert(product, current_stock):
        """Send reorder point alert email"""
        subject = f"⚠️ Reorder Alert: {product.name}"
        
        message = f"""
        <html>
        <body>
            <h2>⚠️ Reorder Point Alert</h2>
            <p><strong>Product:</strong> {product.name} ({product.sku})</p>
            <p><strong>Current Stock:</strong> {current_stock} units</p>
            <p><strong>Reorder Point:</strong> {product.reorder_point}</p>
            <p><strong>Recommended Order Quantity:</strong> {product.reorder_quantity}</p>
            <p><strong>Supplier:</strong> {product.supplier.name if product.supplier else 'No supplier assigned'}</p>
            
            <p>Please place a purchase order to replenish stock before it runs out.</p>
            
            <p><em>This is an automated alert from your Smart Inventory System.</em></p>
        </body>
        </html>
        """
        
        users = NotificationSettings.objects.filter(
            email_notifications=True,
            reorder_point_alerts=True
        ).values_list('user__email', flat=True)
        
        for email in users:
            if email:
                EmailService._send_email(email, subject, message, 'reorder_point', product)
    
    @staticmethod
    def send_purchase_order_update(po_number, status, supplier_name):
        """Send purchase order status update email"""
        subject = f"📋 Purchase Order Update: {po_number}"
        
        message = f"""
        <html>
        <body>
            <h2>📋 Purchase Order Status Update</h2>
            <p><strong>PO Number:</strong> {po_number}</p>
            <p><strong>Supplier:</strong> {supplier_name}</p>
            <p><strong>New Status:</strong> {status.upper()}</p>
            
            <p>Please review the updated purchase order status and take any necessary actions.</p>
            
            <p><em>This is an automated alert from your Smart Inventory System.</em></p>
        </body>
        </html>
        """
        
        users = NotificationSettings.objects.filter(
            email_notifications=True,
            purchase_order_updates=True
        ).values_list('user__email', flat=True)
        
        for email in users:
            if email:
                EmailService._send_email(email, subject, message, 'purchase_order')
    
    @staticmethod
    def _send_email(recipient_email, subject, message, notification_type, product=None):
        """Send email and log notification"""
        try:
            # Send email using Django's configured backend
            result = send_mail(
                subject=subject,
                message='',  # Plain text version
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient_email],
                html_message=message,
                fail_silently=False,
            )
            
            print(f"📧 Email sent to {recipient_email}: {result}")
            
            # Log successful email
            EmailNotification.objects.create(
                recipient=NotificationSettings.objects.get(user__email=recipient_email).user,
                notification_type=notification_type,
                subject=subject,
                message=message,
                status='sent',
                sent_at=timezone.now(),
                related_product=product
            )
            
        except Exception as e:
            # Log failed email
            try:
                user = NotificationSettings.objects.get(user__email=recipient_email).user
                EmailNotification.objects.create(
                    recipient=user,
                    notification_type=notification_type,
                    subject=subject,
                    message=message,
                    status='failed',
                    related_product=product
                )
            except:
                pass  # If we can't log it, just continue


class SMSService:
    """Service for sending SMS notifications"""
    
    # For demo purposes, we'll simulate SMS sending
    # In production, you'd integrate with services like Twilio, AWS SNS, etc.
    
    @staticmethod
    def send_critical_stockout_sms(product, current_stock, predicted_stockout_date):
        """Send critical stockout SMS"""
        message = f"🚨 CRITICAL: {product.name} stockout alert! Current: {current_stock}, Predicted stockout: {predicted_stockout_date}. Take immediate action!"
        
        users = NotificationSettings.objects.filter(
            sms_notifications=True,
            critical_stockout_alerts=True,
            phone_number__isnull=False
        ).exclude(phone_number='')
        
        for user_setting in users:
            SMSService._send_sms(user_setting.user, message, 'critical_stockout', product)
    
    @staticmethod
    def send_reorder_point_sms(product, current_stock):
        """Send reorder point SMS"""
        message = f"⚠️ Reorder alert: {product.name} stock is {current_stock} (reorder point: {product.reorder_point}). Please place order."
        
        users = NotificationSettings.objects.filter(
            sms_notifications=True,
            reorder_point_alerts=True,
            phone_number__isnull=False
        ).exclude(phone_number='')
        
        for user_setting in users:
            SMSService._send_sms(user_setting.user, message, 'reorder_point', product)
    
    @staticmethod
    def _send_sms(user, message, notification_type, product=None):
        """Send SMS and log notification"""
        try:
            user_setting = NotificationSettings.objects.get(user=user)
            phone_number = user_setting.phone_number
            
            # Real SMS integration using Twilio
            try:
                from twilio.rest import Client
                
                # Get Twilio credentials from Django settings
                from django.conf import settings
                account_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', 'your_account_sid')
                auth_token = getattr(settings, 'TWILIO_AUTH_TOKEN', 'your_auth_token')
                from_number = getattr(settings, 'TWILIO_FROM_NUMBER', 'your_twilio_phone_number')
                
                client = Client(account_sid, auth_token)
                
                # Send SMS
                message_sent = client.messages.create(
                    body=message,
                    from_=from_number,
                    to=phone_number
                )
                
                # Log successful SMS
                SMSNotification.objects.create(
                    recipient=user,
                    notification_type=notification_type,
                    message=message,
                    phone_number=phone_number,
                    status='sent',
                    sent_at=timezone.now(),
                    related_product=product,
                    external_id=message_sent.sid
                )
                
                print(f"SMS sent to {phone_number}: {message}")
                
            except ImportError:
                # Fallback to simulation if Twilio not installed
                print(f"SMS would be sent to {phone_number}: {message}")
                
                SMSNotification.objects.create(
                    recipient=user,
                    notification_type=notification_type,
                    message=message,
                    phone_number=phone_number,
                    status='sent',
                    sent_at=timezone.now(),
                    related_product=product
                )
            
        except Exception as e:
            # Log failed SMS
            try:
                user_setting = NotificationSettings.objects.get(user=user)
                SMSNotification.objects.create(
                    recipient=user,
                    notification_type=notification_type,
                    message=message,
                    phone_number=user_setting.phone_number,
                    status='failed',
                    error_message=str(e),
                    related_product=product
                )
            except:
                pass


class NotificationManager:
    """Main notification manager for coordinating alerts"""
    
    @staticmethod
    def check_and_send_alerts():
        """Check for conditions that require alerts and send them"""
        
        # Check for critical stockout predictions
        critical_predictions = StockOutPrediction.objects.filter(
            is_critical=True,
            predicted_stockout_date__gte=timezone.now().date()
        )
        
        for prediction in critical_predictions:
            # Send email alert
            EmailService.send_critical_stockout_alert(
                prediction.product,
                prediction.current_stock_level,
                prediction.predicted_stockout_date
            )
            
            # Send SMS alert
            SMSService.send_critical_stockout_sms(
                prediction.product,
                prediction.current_stock_level,
                prediction.predicted_stockout_date
            )
        
        # Check for products below reorder point
        for product in Product.objects.filter(is_active=True):
            try:
                inventory = Inventory.objects.get(product=product)
                if inventory.available_quantity <= product.reorder_point:
                    # Send email alert
                    EmailService.send_reorder_point_alert(product, inventory.available_quantity)
                    
                    # Send SMS alert
                    SMSService.send_reorder_point_sms(product, inventory.available_quantity)
            except Inventory.DoesNotExist:
                continue
