from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    SupplierViewSet,
    CategoryViewSet,
    LocationViewSet,
    ProductViewSet,
    InventoryViewSet,
    StockTransactionViewSet,
)


router = DefaultRouter()
router.register(r'suppliers', SupplierViewSet, basename='supplier')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'locations', LocationViewSet, basename='location')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'inventory', InventoryViewSet, basename='inventory')
router.register(r'transactions', StockTransactionViewSet, basename='transaction')


urlpatterns = [
    path('', include(router.urls)),
]


