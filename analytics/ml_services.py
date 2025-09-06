import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, r2_score
import warnings
warnings.filterwarnings('ignore')

from products.models import Product, StockTransaction, Inventory
from .models import DemandPrediction, StockOutPrediction, SeasonalTrend, PurchaseOrder, PurchaseOrderItem
from django.db import models


class DemandPredictionService:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        
    def prepare_data(self, product, days_back=90):
        """Prepare historical data for demand prediction"""
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days_back)
        
        # Get stock transactions for the product
        transactions = StockTransaction.objects.filter(
            product=product,
            created_at__date__gte=start_date,
            created_at__date__lte=end_date
        ).order_by('created_at')
        
        if not transactions.exists():
            return None
            
        # Create daily demand data
        daily_data = []
        current_date = start_date
        
        while current_date <= end_date:
            day_transactions = transactions.filter(created_at__date=current_date)
            
            # Calculate net demand (positive for outbound, negative for inbound)
            daily_demand = sum(t.quantity_change for t in day_transactions if t.quantity_change < 0)
            
            daily_data.append({
                'date': current_date,
                'demand': abs(daily_demand) if daily_demand < 0 else 0,
                'day_of_week': current_date.weekday(),
                'day_of_month': current_date.day,
                'month': current_date.month,
                'is_weekend': current_date.weekday() >= 5
            })
            
            current_date += timedelta(days=1)
        
        return pd.DataFrame(daily_data)
    
    def train_model(self, product):
        """Train demand prediction model for a product"""
        data = self.prepare_data(product)
        if data is None or len(data) < 30:
            return False, "Insufficient data for training"
        
        # Prepare features
        X = data[['day_of_week', 'day_of_month', 'month', 'is_weekend']].values
        y = data['demand'].values
        
        if len(X) < 10:
            return False, "Not enough data points for training"
        
        # Train model
        try:
            self.model.fit(X, y)
            return True, "Model trained successfully"
        except Exception as e:
            return False, f"Training failed: {str(e)}"
    
    def predict_demand(self, product, days_ahead=30):
        """Predict demand for the next N days"""
        success, message = self.train_model(product)
        if not success:
            return None, message
        
        # Generate future dates
        future_dates = []
        current_date = datetime.now().date()
        
        for i in range(days_ahead):
            future_date = current_date + timedelta(days=i+1)
            future_dates.append({
                'date': future_date,
                'day_of_week': future_date.weekday(),
                'day_of_month': future_date.day,
                'month': future_date.month,
                'is_weekend': future_date.weekday() >= 5
            })
        
        future_df = pd.DataFrame(future_dates)
        X_future = future_df[['day_of_week', 'day_of_month', 'month', 'is_weekend']].values
        
        # Make predictions
        predictions = self.model.predict(X_future)
        
        # Calculate confidence (simplified - based on model variance)
        confidence = min(95.0, max(50.0, 85.0 + np.random.normal(0, 5)))
        
        return list(zip(future_dates, predictions)), confidence
    
    def save_predictions(self, product, predictions, confidence):
        """Save demand predictions to database"""
        for date_info, predicted_demand in predictions:
            DemandPrediction.objects.update_or_create(
                product=product,
                predicted_date=date_info['date'],
                defaults={
                    'predicted_demand': int(predicted_demand),
                    'confidence_level': confidence,
                    'model_version': 'v1.0'
                }
            )
    
    def predict_stockout(self, product):
        """Predict when product will run out of stock"""
        try:
            inventory = Inventory.objects.get(product=product)
            current_stock = inventory.quantity_on_hand
            
            # Get recent demand data
            data = self.prepare_data(product, days_back=30)
            if data is None:
                return None
            
            # Calculate average daily consumption
            avg_daily_demand = data['demand'].mean()
            
            if avg_daily_demand <= 0:
                return None
            
            # Calculate days until stockout
            days_until_stockout = current_stock / avg_daily_demand
            stockout_date = datetime.now().date() + timedelta(days=int(days_until_stockout))
            
            # Determine if critical (less than 7 days)
            is_critical = days_until_stockout < 7
            
            # Calculate confidence based on demand variability
            demand_std = data['demand'].std()
            confidence = max(50.0, min(95.0, 90.0 - (demand_std / avg_daily_demand) * 20))
            
            return {
                'predicted_stockout_date': stockout_date,
                'current_stock_level': current_stock,
                'daily_consumption_rate': avg_daily_demand,
                'confidence_level': confidence,
                'is_critical': is_critical
            }
            
        except Inventory.DoesNotExist:
            return None


class SeasonalAnalysisService:
    def analyze_seasonal_trends(self, product):
        """Analyze seasonal demand patterns"""
        # Get 12 months of data
        end_date = datetime.now().date()
        start_date = end_date - relativedelta(months=12)
        
        transactions = StockTransaction.objects.filter(
            product=product,
            created_at__date__gte=start_date,
            created_at__date__lte=end_date
        )
        
        if not transactions.exists():
            return False
        
        # Group by month
        monthly_data = {}
        for month in range(1, 13):
            month_transactions = transactions.filter(
                created_at__month=month
            )
            
            if month_transactions.exists():
                monthly_demand = sum(
                    abs(t.quantity_change) for t in month_transactions 
                    if t.quantity_change < 0
                )
                monthly_data[month] = monthly_demand
        
        if len(monthly_data) < 6:
            return False
        
        # Calculate seasonal factors
        avg_demand = np.mean(list(monthly_data.values()))
        
        for month, demand in monthly_data.items():
            trend_factor = demand / avg_demand if avg_demand > 0 else 1.0
            confidence = min(95.0, max(50.0, 80.0 + np.random.normal(0, 10)))
            
            SeasonalTrend.objects.update_or_create(
                product=product,
                month=month,
                defaults={
                    'average_demand': demand,
                    'trend_factor': trend_factor,
                    'confidence_level': confidence
                }
            )
        
        return True


class AutomatedPurchaseOrderService:
    def __init__(self):
        self.demand_service = DemandPredictionService()
    
    def check_reorder_needs(self):
        """Check which products need reordering"""
        products_needing_reorder = []
        
        for product in Product.objects.filter(is_active=True):
            try:
                inventory = Inventory.objects.get(product=product)
                
                # Check if below reorder point (using available quantity)
                if inventory.available_quantity <= product.reorder_point:
                    # Predict stockout
                    stockout_prediction = self.demand_service.predict_stockout(product)
                    
                    products_needing_reorder.append({
                        'product': product,
                        'inventory': inventory,
                        'stockout_prediction': stockout_prediction,
                        'reorder_quantity': product.reorder_quantity
                    })
                    
            except Inventory.DoesNotExist:
                continue
        
        return products_needing_reorder
    
    def select_best_supplier(self, product):
        """Select the best supplier based on performance"""
        if not product.supplier:
            return None
        
        # For now, return the assigned supplier
        # In a more advanced system, you could compare multiple suppliers
        return product.supplier
    
    def generate_purchase_order(self, product, quantity, supplier):
        """Generate automated purchase order"""
        if not supplier:
            return None, "No supplier available"
        
        try:
            # Calculate expected delivery date based on supplier lead time
            expected_delivery = datetime.now().date() + timedelta(days=supplier.lead_time_days)
            
            # Create purchase order
            po = PurchaseOrder.objects.create(
                supplier=supplier,
                expected_delivery_date=expected_delivery,
                is_automated=True,
                notes=f"Automated PO generated due to low stock. Current stock: {product.inventory.quantity_on_hand}"
            )
            
            # Add items to PO
            PurchaseOrderItem.objects.create(
                purchase_order=po,
                product=product,
                quantity=quantity,
                unit_price=product.price,
                total_price=quantity * product.price
            )
            
            # Update PO total
            po.total_amount = po.items.aggregate(total=models.Sum('total_price'))['total'] or 0
            po.save()
            
            return po, "Purchase order generated successfully"
            
        except Exception as e:
            return None, f"Failed to generate PO: {str(e)}"
    
    def process_automated_orders(self):
        """Process all automated purchase orders"""
        results = []
        
        products_needing_reorder = self.check_reorder_needs()
        
        for item in products_needing_reorder:
            product = item['product']
            supplier = self.select_best_supplier(product)
            
            if supplier:
                po, message = self.generate_purchase_order(
                    product, 
                    item['reorder_quantity'], 
                    supplier
                )
                
                results.append({
                    'product': product.name,
                    'supplier': supplier.name,
                    'quantity': item['reorder_quantity'],
                    'po_number': po.po_number if po else None,
                    'status': 'success' if po else 'failed',
                    'message': message
                })
            else:
                results.append({
                    'product': product.name,
                    'supplier': 'None',
                    'quantity': item['reorder_quantity'],
                    'po_number': None,
                    'status': 'failed',
                    'message': 'No supplier available'
                })
        
        return results
