from django.contrib import admin
from .models import (
    DemandPrediction, 
    PurchaseOrder, 
    PurchaseOrderItem, 
    StockOutPrediction, 
    SeasonalTrend
)


@admin.register(DemandPrediction)
class DemandPredictionAdmin(admin.ModelAdmin):
    list_display = ('product', 'predicted_date', 'predicted_demand', 'confidence_level', 'model_version')
    list_filter = ('predicted_date', 'model_version', 'confidence_level')
    search_fields = ('product__name', 'product__sku')
    ordering = ('-predicted_date',)


class PurchaseOrderItemInline(admin.TabularInline):
    model = PurchaseOrderItem
    extra = 1


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ('po_number', 'supplier', 'status', 'order_date', 'expected_delivery_date', 'total_amount', 'is_automated')
    list_filter = ('status', 'is_automated', 'order_date', 'expected_delivery_date')
    search_fields = ('po_number', 'supplier__name')
    ordering = ('-order_date',)
    inlines = [PurchaseOrderItemInline]
    readonly_fields = ('po_number',)


@admin.register(PurchaseOrderItem)
class PurchaseOrderItemAdmin(admin.ModelAdmin):
    list_display = ('purchase_order', 'product', 'quantity', 'unit_price', 'total_price')
    list_filter = ('purchase_order__status',)
    search_fields = ('product__name', 'purchase_order__po_number')


@admin.register(StockOutPrediction)
class StockOutPredictionAdmin(admin.ModelAdmin):
    list_display = ('product', 'predicted_stockout_date', 'current_stock_level', 'daily_consumption_rate', 'is_critical', 'confidence_level')
    list_filter = ('is_critical', 'predicted_stockout_date', 'confidence_level')
    search_fields = ('product__name', 'product__sku')
    ordering = ('predicted_stockout_date',)


@admin.register(SeasonalTrend)
class SeasonalTrendAdmin(admin.ModelAdmin):
    list_display = ('product', 'month', 'average_demand', 'trend_factor', 'confidence_level')
    list_filter = ('month', 'confidence_level')
    search_fields = ('product__name', 'product__sku')
    ordering = ('product__name', 'month')
