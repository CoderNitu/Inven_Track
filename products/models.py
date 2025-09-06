from django.db import models
from django.utils import timezone


class Supplier(models.Model):
    name = models.CharField(max_length=255)
    contact_email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    lead_time_days = models.PositiveIntegerField(default=7)
    is_active = models.BooleanField(default=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.00)
    total_orders = models.PositiveIntegerField(default=0)
    on_time_deliveries = models.PositiveIntegerField(default=0)
    last_order_date = models.DateTimeField(blank=True, null=True)

    def __str__(self) -> str:
        return self.name

    @property
    def on_time_delivery_rate(self):
        if self.total_orders == 0:
            return 100.0
        return (self.on_time_deliveries / self.total_orders) * 100

    @property
    def performance_score(self):
        # Calculate performance score based on rating and delivery rate
        delivery_weight = 0.7
        rating_weight = 0.3
        return (self.on_time_delivery_rate * delivery_weight) + (float(self.rating) * 20 * rating_weight)


class Location(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField(blank=True, null=True)
    contact_person = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.name

    class Meta:
        ordering = ['name']


class Category(models.Model):
    name = models.CharField(max_length=120, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self) -> str:
        return self.name


class Product(models.Model):
    sku = models.CharField(max_length=64, unique=True)
    name = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products')
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, related_name='products', null=True, blank=True)
    barcode = models.CharField(max_length=128, unique=True, blank=True, null=True)
    qr_code = models.CharField(max_length=200, unique=True, blank=True, null=True)
    unit = models.CharField(max_length=32, default='pcs')
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    reorder_point = models.PositiveIntegerField(default=10)
    reorder_quantity = models.PositiveIntegerField(default=50)
    is_active = models.BooleanField(default=True)

    def __str__(self) -> str:
        return f"{self.sku} - {self.name}"

    def save(self, *args, **kwargs):
        # Generate barcode if not provided
        if not self.barcode:
            self.barcode = f"PROD{self.sku}"
        
        # Generate QR code if not provided
        if not self.qr_code:
            self.qr_code = f"https://smart-inventory.com/product/{self.sku}"
        
        super().save(*args, **kwargs)


class Inventory(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='inventory')
    quantity_on_hand = models.IntegerField(default=0)
    quantity_reserved = models.IntegerField(default=0)
    location = models.CharField(max_length=120, blank=True, null=True)

    def __str__(self) -> str:
        return f"Inventory({self.product.sku}): {self.quantity_on_hand}"

    @property
    def available_quantity(self) -> int:
        return int(self.quantity_on_hand) - int(self.quantity_reserved)

    @property
    def is_below_reorder_point(self) -> bool:
        return self.available_quantity <= self.product.reorder_point


class StockTransaction(models.Model):
    REASON_CHOICES = (
        ('purchase', 'Purchase Inbound'),
        ('sale', 'Sale Outbound'),
        ('adjustment', 'Manual Adjustment'),
        ('return', 'Return'),
        ('transfer', 'Transfer'),
    )

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stock_transactions')
    quantity_change = models.IntegerField(help_text='Positive for inbound, negative for outbound')
    reason = models.CharField(max_length=20, choices=REASON_CHOICES)
    reference = models.CharField(max_length=120, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self) -> str:
        return f"{self.product.sku} {self.quantity_change} ({self.reason})"

    def apply_to_inventory(self) -> None:
        inventory, _ = Inventory.objects.get_or_create(product=self.product)
        inventory.quantity_on_hand = int(inventory.quantity_on_hand) + int(self.quantity_change)
        inventory.save(update_fields=['quantity_on_hand'])

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new:
            self.apply_to_inventory()
            # Send WebSocket notification
            try:
                from .websocket_utils import send_stock_transaction
                send_stock_transaction(self)
            except:
                pass  # Don't fail if WebSocket is not available
