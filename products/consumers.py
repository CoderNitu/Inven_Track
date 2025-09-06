import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Product, Inventory, StockTransaction


class InventoryConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Join the inventory group
        await self.channel_layer.group_add(
            "inventory_updates",
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave the inventory group
        await self.channel_layer.group_discard(
            "inventory_updates",
            self.channel_name
        )

    async def receive(self, text_data):
        # Handle incoming messages (if needed)
        pass

    async def inventory_update(self, event):
        # Send inventory update to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'inventory_update',
            'data': event['data']
        }))

    async def stock_transaction(self, event):
        # Send stock transaction to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'stock_transaction',
            'data': event['data']
        }))

    async def low_stock_alert(self, event):
        # Send low stock alert to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'low_stock_alert',
            'data': event['data']
        }))


class DashboardConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Join the dashboard group
        await self.channel_layer.group_add(
            "dashboard_updates",
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave the dashboard group
        await self.channel_layer.group_discard(
            "dashboard_updates",
            self.channel_name
        )

    async def receive(self, text_data):
        # Handle incoming messages (if needed)
        pass

    async def dashboard_update(self, event):
        # Send dashboard update to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'dashboard_update',
            'data': event['data']
        }))
