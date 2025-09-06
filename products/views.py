from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Supplier, Category, Location, Product, Inventory, StockTransaction
from .serializers import (
    SupplierSerializer,
    CategorySerializer,
    LocationSerializer,
    ProductSerializer,
    InventorySerializer,
    StockTransactionSerializer,
)
from .utils import generate_qr_code


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all().order_by('name')
    serializer_class = SupplierSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'contact_email', 'phone']
    ordering_fields = ['name', 'lead_time_days']


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name']


class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all().order_by('name')
    serializer_class = LocationSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'contact_person']
    ordering_fields = ['name']


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('category', 'supplier').all().order_by('name')
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['sku', 'name', 'barcode']
    ordering_fields = ['name', 'sku', 'price']

    @action(detail=True, methods=['get'])
    def inventory(self, request, pk=None):
        product = self.get_object()
        inventory, _ = Inventory.objects.get_or_create(product=product)
        data = InventorySerializer(inventory).data
        return Response(data)

    @action(detail=True, methods=['post'])
    def transact(self, request, pk=None):
        product = self.get_object()
        payload = request.data.copy()
        payload['product'] = product.id
        serializer = StockTransactionSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        transaction = serializer.save()
        return Response(StockTransactionSerializer(transaction).data)

    @action(detail=False, methods=['get'])
    def lookup_by_code(self, request):
        """Lookup product by barcode or QR code"""
        code = request.query_params.get('code', '').strip()
        
        if not code:
            return Response({'error': 'Code parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Try to find by barcode first
            product = Product.objects.get(barcode=code)
        except Product.DoesNotExist:
            try:
                # Try to find by QR code directly
                product = Product.objects.get(qr_code=code)
            except Product.DoesNotExist:
                try:
                    # Try to extract SKU from QR code URL
                    if code.startswith('https://smart-inventory.com/product/'):
                        sku = code.split('/')[-1]
                        product = Product.objects.get(sku=sku)
                    else:
                        # Try to find by SKU if the code looks like an SKU
                        product = Product.objects.get(sku=code)
                except Product.DoesNotExist:
                    return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.get_serializer(product)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def qr_code(self, request, pk=None):
        """Generate QR code for a product"""
        product = self.get_object()
        qr_data = product.qr_code or f"https://smart-inventory.com/product/{product.sku}"
        qr_image = generate_qr_code(qr_data)
        
        return Response({
            'product_id': product.id,
            'product_name': product.name,
            'qr_code': qr_image,
            'qr_data': qr_data
        })


class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.select_related('product').all()
    serializer_class = InventorySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['product__sku', 'product__name']
    ordering_fields = ['quantity_on_hand']
    
    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            # Allow updating reserved quantity and location only
            from rest_framework import serializers
            class InventoryUpdateSerializer(serializers.ModelSerializer):
                class Meta:
                    model = Inventory
                    fields = ['quantity_reserved', 'location']
            return InventoryUpdateSerializer
        return InventorySerializer


class StockTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StockTransaction.objects.select_related('product').all().order_by('-created_at')
    serializer_class = StockTransactionSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['product__sku', 'product__name', 'reference', 'reason']
    ordering_fields = ['created_at', 'quantity_change']
