from django.db import models
from django.utils import timezone
from products.models import Product, Supplier


class DemandPrediction(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='demand_predictions')
    predicted_date = models.DateField()
    predicted_demand = models.IntegerField()
    confidence_level = models.DecimalField(max_digits=5, decimal_places=2)  # 0-100%
    model_version = models.CharField(max_length=50, default='v1.0')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-predicted_date', '-created_at']
        unique_together = ['product', 'predicted_date']

    def __str__(self):
        return f"{self.product.name} - {self.predicted_date}: {self.predicted_demand} units"


class PurchaseOrder(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('sent', 'Sent to Supplier'),
        ('confirmed', 'Confirmed by Supplier'),
        ('shipped', 'Shipped'),
        ('received', 'Received'),
        ('cancelled', 'Cancelled'),
    )

    po_number = models.CharField(max_length=50, unique=True)
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='purchase_orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    order_date = models.DateTimeField(auto_now_add=True)
    expected_delivery_date = models.DateField()
    actual_delivery_date = models.DateField(null=True, blank=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    is_automated = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-order_date']

    def __str__(self):
        return f"PO-{self.po_number} - {self.supplier.name}"

    def save(self, *args, **kwargs):
        if not self.po_number:
            # Generate PO number
            last_po = PurchaseOrder.objects.order_by('-id').first()
            if last_po:
                last_number = int(last_po.po_number.split('-')[1])
                self.po_number = f"PO-{last_number + 1:06d}"
            else:
                self.po_number = "PO-000001"
        super().save(*args, **kwargs)


class PurchaseOrderItem(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    
    class Meta:
        unique_together = ['purchase_order', 'product']

    def __str__(self):
        return f"{self.product.name} - {self.quantity} units"

    def save(self, *args, **kwargs):
        if not self.total_price:
            self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)


class StockOutPrediction(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stockout_predictions')
    predicted_stockout_date = models.DateField()
    current_stock_level = models.IntegerField()
    daily_consumption_rate = models.DecimalField(max_digits=8, decimal_places=2)
    confidence_level = models.DecimalField(max_digits=5, decimal_places=2)
    is_critical = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['predicted_stockout_date']

    def __str__(self):
        return f"{self.product.name} - Stockout on {self.predicted_stockout_date}"


class SeasonalTrend(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='seasonal_trends')
    month = models.IntegerField()  # 1-12
    average_demand = models.DecimalField(max_digits=8, decimal_places=2)
    trend_factor = models.DecimalField(max_digits=5, decimal_places=2)  # Multiplier for seasonal effect
    confidence_level = models.DecimalField(max_digits=5, decimal_places=2)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['product', 'month']
        ordering = ['month']

    def __str__(self):
        return f"{self.product.name} - Month {self.month}: {self.average_demand} units"
