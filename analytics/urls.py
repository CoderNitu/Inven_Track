from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DemandPredictionViewSet,
    PurchaseOrderViewSet,
    StockOutPredictionViewSet,
    SeasonalTrendViewSet,
    AnalyticsViewSet
)

router = DefaultRouter()
router.register(r'demand-predictions', DemandPredictionViewSet, basename='demand-prediction')
router.register(r'purchase-orders', PurchaseOrderViewSet, basename='purchase-order')
router.register(r'stockout-predictions', StockOutPredictionViewSet, basename='stockout-prediction')
router.register(r'seasonal-trends', SeasonalTrendViewSet, basename='seasonal-trend')
router.register(r'analytics', AnalyticsViewSet, basename='analytics')

urlpatterns = [
    path('', include(router.urls)),
]
