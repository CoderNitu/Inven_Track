from django.contrib import admin

from .models import Supplier, Category, Location, Product, Inventory, StockTransaction


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ('name', 'contact_email', 'phone', 'lead_time_days', 'is_active')
    search_fields = ('name', 'contact_email', 'phone')
    list_filter = ('is_active',)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('name', 'contact_person', 'phone', 'email', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name', 'contact_person')


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'sku', 'name', 'category', 'supplier', 'barcode', 'unit',
        'price', 'reorder_point', 'reorder_quantity', 'is_active',
    )
    list_filter = ('category', 'supplier', 'is_active')
    search_fields = ('sku', 'name', 'barcode')


@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ('product', 'quantity_on_hand', 'quantity_reserved', 'location')
    search_fields = ('product__sku', 'product__name', 'location')


@admin.register(StockTransaction)
class StockTransactionAdmin(admin.ModelAdmin):
    list_display = ('product', 'quantity_change', 'reason', 'reference', 'created_at')
    list_filter = ('reason', 'created_at')
    search_fields = ('product__sku', 'product__name', 'reference')
