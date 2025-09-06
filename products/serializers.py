from rest_framework import serializers

from .models import Supplier, Category, Location, Product, Inventory, StockTransaction


class SupplierSerializer(serializers.ModelSerializer):
    on_time_delivery_rate = serializers.ReadOnlyField()
    performance_score = serializers.ReadOnlyField()
    
    class Meta:
        model = Supplier
        fields = [
            'id', 'name', 'contact_email', 'phone', 'address', 
            'lead_time_days', 'is_active', 'rating', 'total_orders',
            'on_time_deliveries', 'last_order_date', 'on_time_delivery_rate',
            'performance_score'
        ]


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source='category', read_only=True)
    supplier_detail = SupplierSerializer(source='supplier', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'sku', 'name', 'category', 'category_detail', 'supplier',
            'supplier_detail', 'barcode', 'qr_code', 'unit', 'price', 'reorder_point',
            'reorder_quantity', 'is_active',
        ]


class InventorySerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source='product', read_only=True)
    available_quantity = serializers.IntegerField(read_only=True)
    is_below_reorder_point = serializers.BooleanField(read_only=True)

    class Meta:
        model = Inventory
        fields = [
            'id', 'product', 'product_detail', 'quantity_on_hand',
            'quantity_reserved', 'location', 'available_quantity',
            'is_below_reorder_point',
        ]


class StockTransactionSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source='product', read_only=True)

    class Meta:
        model = StockTransaction
        fields = [
            'id', 'product', 'product_detail', 'quantity_change', 'reason',
            'reference', 'created_at',
        ]
        read_only_fields = ['created_at']
