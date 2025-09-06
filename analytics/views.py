from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db import models
from django.utils import timezone
from datetime import datetime, timedelta

from .models import (
    DemandPrediction, 
    PurchaseOrder, 
    PurchaseOrderItem, 
    StockOutPrediction, 
    SeasonalTrend
)
from .serializers import (
    DemandPredictionSerializer,
    PurchaseOrderSerializer,
    PurchaseOrderItemSerializer,
    StockOutPredictionSerializer,
    SeasonalTrendSerializer,
    AnalyticsSummarySerializer
)
from .ml_services import (
    DemandPredictionService, 
    SeasonalAnalysisService, 
    AutomatedPurchaseOrderService
)
from products.models import Product, Inventory


class DemandPredictionViewSet(viewsets.ModelViewSet):
    queryset = DemandPrediction.objects.all().order_by('-predicted_date')
    serializer_class = DemandPredictionSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['product__name', 'product__sku']
    ordering_fields = ['predicted_date', 'predicted_demand', 'confidence_level']

    @action(detail=False, methods=['post'])
    def generate_predictions(self, request):
        """Generate demand predictions for all products"""
        service = DemandPredictionService()
        results = []
        
        for product in Product.objects.filter(is_active=True):
            try:
                predictions, confidence = service.predict_demand(product, days_ahead=30)
                if predictions:
                    service.save_predictions(product, predictions, confidence)
                    results.append({
                        'product': product.name,
                        'status': 'success',
                        'predictions_generated': len(predictions),
                        'confidence': confidence
                    })
                else:
                    results.append({
                        'product': product.name,
                        'status': 'failed',
                        'message': 'Insufficient data'
                    })
            except Exception as e:
                results.append({
                    'product': product.name,
                    'status': 'error',
                    'message': str(e)
                })
        
        return Response({
            'message': 'Demand predictions generated',
            'results': results
        })

    @action(detail=False, methods=['get'])
    def product_predictions(self, request):
        """Get predictions for a specific product"""
        product_id = request.query_params.get('product_id')
        if not product_id:
            return Response(
                {'error': 'product_id parameter required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            product = Product.objects.get(id=product_id)
            predictions = DemandPrediction.objects.filter(
                product=product,
                predicted_date__gte=timezone.now().date()
            ).order_by('predicted_date')[:30]
            
            serializer = self.get_serializer(predictions, many=True)
            return Response(serializer.data)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all().order_by('-order_date')
    serializer_class = PurchaseOrderSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['po_number', 'supplier__name']
    ordering_fields = ['order_date', 'expected_delivery_date', 'total_amount']

    @action(detail=False, methods=['post'])
    def generate_automated_orders(self, request):
        """Generate automated purchase orders for products below reorder point"""
        service = AutomatedPurchaseOrderService()
        results = service.process_automated_orders()
        
        return Response({
            'message': 'Automated purchase orders processed',
            'results': results
        })

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update purchase order status"""
        po = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(PurchaseOrder.STATUS_CHOICES):
            return Response(
                {'error': 'Invalid status'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        po.status = new_status
        if new_status == 'received':
            po.actual_delivery_date = timezone.now().date()
        po.save()
        
        serializer = self.get_serializer(po)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pending_orders(self, request):
        """Get pending purchase orders"""
        pending_orders = PurchaseOrder.objects.filter(
            status__in=['draft', 'sent', 'confirmed', 'shipped']
        ).order_by('expected_delivery_date')
        
        serializer = self.get_serializer(pending_orders, many=True)
        return Response(serializer.data)


class StockOutPredictionViewSet(viewsets.ModelViewSet):
    queryset = StockOutPrediction.objects.all().order_by('predicted_stockout_date')
    serializer_class = StockOutPredictionSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['product__name', 'product__sku']
    ordering_fields = ['predicted_stockout_date', 'confidence_level']

    @action(detail=False, methods=['post'])
    def generate_predictions(self, request):
        """Generate stockout predictions for all products"""
        service = DemandPredictionService()
        results = []
        
        for product in Product.objects.filter(is_active=True):
            try:
                prediction = service.predict_stockout(product)
                if prediction:
                    # Save or update prediction
                    StockOutPrediction.objects.update_or_create(
                        product=product,
                        defaults=prediction
                    )
                    results.append({
                        'product': product.name,
                        'status': 'success',
                        'predicted_stockout_date': prediction['predicted_stockout_date'],
                        'is_critical': prediction['is_critical']
                    })
                else:
                    results.append({
                        'product': product.name,
                        'status': 'no_prediction',
                        'message': 'Insufficient data'
                    })
            except Exception as e:
                results.append({
                    'product': product.name,
                    'status': 'error',
                    'message': str(e)
                })
        
        return Response({
            'message': 'Stockout predictions generated',
            'results': results
        })

    @action(detail=False, methods=['get'])
    def critical_risks(self, request):
        """Get critical stockout risks"""
        critical_risks = StockOutPrediction.objects.filter(
            is_critical=True,
            predicted_stockout_date__gte=timezone.now().date()
        ).order_by('predicted_stockout_date')
        
        serializer = self.get_serializer(critical_risks, many=True)
        return Response(serializer.data)


class SeasonalTrendViewSet(viewsets.ModelViewSet):
    queryset = SeasonalTrend.objects.all().order_by('product__name', 'month')
    serializer_class = SeasonalTrendSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['product__name', 'product__sku']
    ordering_fields = ['month', 'average_demand', 'trend_factor']

    @action(detail=False, methods=['post'])
    def analyze_trends(self, request):
        """Analyze seasonal trends for all products"""
        service = SeasonalAnalysisService()
        results = []
        
        for product in Product.objects.filter(is_active=True):
            try:
                success = service.analyze_seasonal_trends(product)
                results.append({
                    'product': product.name,
                    'status': 'success' if success else 'insufficient_data'
                })
            except Exception as e:
                results.append({
                    'product': product.name,
                    'status': 'error',
                    'message': str(e)
                })
        
        return Response({
            'message': 'Seasonal trends analyzed',
            'results': results
        })


class AnalyticsViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['get'])
    def dashboard_summary(self, request):
        """Get analytics dashboard summary"""
        # Count products below reorder point
        products_below_reorder = 0
        for product in Product.objects.filter(is_active=True):
            try:
                inventory = Inventory.objects.get(product=product)
                if inventory.quantity_on_hand <= product.reorder_point:
                    products_below_reorder += 1
            except Inventory.DoesNotExist:
                continue
        
        # Count critical stockout risks
        critical_risks = StockOutPrediction.objects.filter(
            is_critical=True,
            predicted_stockout_date__gte=timezone.now().date()
        ).count()
        
        # Count pending purchase orders
        pending_orders = PurchaseOrder.objects.filter(
            status__in=['draft', 'sent', 'confirmed', 'shipped']
        ).count()
        
        # Calculate total predicted demand
        total_predicted_demand = DemandPrediction.objects.filter(
            predicted_date__gte=timezone.now().date(),
            predicted_date__lte=timezone.now().date() + timedelta(days=30)
        ).aggregate(total=models.Sum('predicted_demand'))['total'] or 0
        
        # Calculate average confidence level
        avg_confidence = DemandPrediction.objects.filter(
            predicted_date__gte=timezone.now().date()
        ).aggregate(avg=models.Avg('confidence_level'))['avg'] or 0
        
        summary = {
            'total_products': Product.objects.filter(is_active=True).count(),
            'products_below_reorder_point': products_below_reorder,
            'critical_stockout_risk': critical_risks,
            'pending_purchase_orders': pending_orders,
            'total_predicted_demand': total_predicted_demand,
            'average_confidence_level': round(avg_confidence, 2) if avg_confidence else 0
        }
        
        serializer = AnalyticsSummarySerializer(summary)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def demand_forecast(self, request):
        """Get demand forecast for next 30 days"""
        days = int(request.query_params.get('days', 30))
        
        predictions = DemandPrediction.objects.filter(
            predicted_date__gte=timezone.now().date(),
            predicted_date__lte=timezone.now().date() + timedelta(days=days)
        ).order_by('predicted_date')
        
        # Group by date
        forecast_data = {}
        for prediction in predictions:
            date_str = prediction.predicted_date.strftime('%Y-%m-%d')
            if date_str not in forecast_data:
                forecast_data[date_str] = {
                    'date': date_str,
                    'total_demand': 0,
                    'products_count': 0,
                    'avg_confidence': 0
                }
            
            forecast_data[date_str]['total_demand'] += prediction.predicted_demand
            forecast_data[date_str]['products_count'] += 1
            forecast_data[date_str]['avg_confidence'] += prediction.confidence_level
        
        # Calculate averages
        for date_data in forecast_data.values():
            if date_data['products_count'] > 0:
                date_data['avg_confidence'] = round(
                    date_data['avg_confidence'] / date_data['products_count'], 2
                )
        
        return Response(list(forecast_data.values()))
