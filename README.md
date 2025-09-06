# Smart Inventory Management System

A comprehensive inventory management system with real-time notifications, barcode scanning, and analytics.

## Features

- 📦 **Product Management**: Add, edit, and track products with barcode/QR code support
- 📊 **Inventory Tracking**: Real-time stock levels and transaction history
- 🔔 **Smart Notifications**: Email and SMS alerts for low stock and critical situations
- 📱 **Barcode/QR Scanner**: Mobile-friendly scanning interface
- 📈 **Analytics**: ML-powered demand forecasting and stockout predictions
- 🏪 **Supplier Management**: Track supplier performance and manage relationships
- 📍 **Location Management**: Organize inventory by locations
- 📋 **Reports**: Generate PDF and Excel reports

## Tech Stack

### Backend
- Django 5.2.5
- Django REST Framework
- Django Channels (WebSocket)
- SQLite (development)
- Celery (background tasks)

### Frontend
- React 18
- Bootstrap 5
- Chart.js
- QuaggaJS (barcode scanning)

### External Services
- Gmail SMTP (email notifications)
- Twilio (SMS notifications)

## Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd smart-inventory
```

### 2. Backend Setup
```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Setup notifications
python setup_user_notifications.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### 4. Configuration
1. Copy `config.example.py` to `config.py`
2. Fill in your email and SMS credentials
3. For Gmail, enable 2FA and use App Password

### 5. Run the Application
```bash
# Backend (from project root)
python manage.py runserver

# Frontend (from frontend directory)
npm start
```

## Configuration

### Email Setup (Gmail)
1. Enable 2-Factor Authentication
2. Generate App Password
3. Update `config.py` with App Password

### SMS Setup (Twilio)
1. Create Twilio account
2. Get Account SID and Auth Token
3. Purchase phone number
4. Update `config.py` with credentials

## Project Structure

```
smart-inventory/
├── analytics/          # ML analytics and predictions
├── frontend/           # React frontend
├── notifications/      # Email/SMS notification system
├── products/          # Product and inventory management
├── reports/           # Report generation
├── supply_inventory/  # Django project settings
├── config.py          # Configuration (not in git)
├── config.example.py  # Configuration template
└── manage.py          # Django management script
```

## API Endpoints

- `/api/products/` - Product management
- `/api/inventory/` - Inventory tracking
- `/api/notifications/` - Notification settings
- `/api/analytics/` - Analytics and predictions
- `/api/reports/` - Report generation

## Development

### Running Tests
```bash
python manage.py test
```

### Database Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### Frontend Development
```bash
cd frontend
npm run build  # Production build
npm test       # Run tests
```

## Production Deployment

1. Set environment variables for sensitive data
2. Use PostgreSQL for production database
3. Configure proper SMTP settings
4. Set up Redis for Celery
5. Use nginx and gunicorn for serving

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue on GitHub.
