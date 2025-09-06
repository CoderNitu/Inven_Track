from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .serializers import InventorySerializer, StockTransactionSerializer


def send_inventory_update(inventory):
    """Send inventory update to all connected clients"""
    channel_layer = get_channel_layer()
    data = InventorySerializer(inventory).data
    
    async_to_sync(channel_layer.group_send)(
        "inventory_updates",
        {
            "type": "inventory_update",
            "data": data
        }
    )


def send_stock_transaction(transaction):
    """Send stock transaction to all connected clients"""
    channel_layer = get_channel_layer()
    data = StockTransactionSerializer(transaction).data
    
    async_to_sync(channel_layer.group_send)(
        "inventory_updates",
        {
            "type": "stock_transaction",
            "data": data
        }
    )


def send_low_stock_alert(product, current_quantity):
    """Send low stock alert to all connected clients"""
    channel_layer = get_channel_layer()
    
    async_to_sync(channel_layer.group_send)(
        "inventory_updates",
        {
            "type": "low_stock_alert",
            "data": {
                "product_id": product.id,
                "product_name": product.name,
                "sku": product.sku,
                "current_quantity": current_quantity,
                "reorder_point": product.reorder_point,
                "message": f"Low stock alert: {product.name} (SKU: {product.sku}) has only {current_quantity} units remaining"
            }
        }
    )


def send_dashboard_update(stats):
    """Send dashboard update to all connected clients"""
    channel_layer = get_channel_layer()
    
    async_to_sync(channel_layer.group_send)(
        "dashboard_updates",
        {
            "type": "dashboard_update",
            "data": stats
        }
    )
