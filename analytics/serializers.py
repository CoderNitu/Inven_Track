from rest_framework import serializers
from .models import (
    DemandPrediction, 
    PurchaseOrder, 
    PurchaseOrderItem, 
    StockOutPrediction, 
    SeasonalTrend
)
from products.serializers import ProductSerializer, SupplierSerializer


class DemandPredictionSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = DemandPrediction
        fields = '__all__'


class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = PurchaseOrderItem
        fields = '__all__'


class PurchaseOrderSerializer(serializers.ModelSerializer):
    supplier = SupplierSerializer(read_only=True)
    supplier_id = serializers.IntegerField(write_only=True)
    items = PurchaseOrderItemSerializer(many=True, read_only=True)
    items_data = serializers.ListField(write_only=True, required=False)
    
    class Meta:
        model = PurchaseOrder
        fields = '__all__'
    
    def create(self, validated_data):
        items_data = validated_data.pop('items_data', [])
        po = PurchaseOrder.objects.create(**validated_data)
        
        for item_data in items_data:
            PurchaseOrderItem.objects.create(purchase_order=po, **item_data)
        
        return po


class StockOutPredictionSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = StockOutPrediction
        fields = '__all__'


class SeasonalTrendSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = SeasonalTrend
        fields = '__all__'


class AnalyticsSummarySerializer(serializers.Serializer):
    total_products = serializers.IntegerField()
    products_below_reorder_point = serializers.IntegerField()
    critical_stockout_risk = serializers.IntegerField()
    pending_purchase_orders = serializers.IntegerField()
    total_predicted_demand = serializers.IntegerField()
    average_confidence_level = serializers.FloatField()
