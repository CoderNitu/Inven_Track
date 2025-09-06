# Smart Inventory Frontend

A React frontend for the Smart Inventory & Supply Chain Tracker system.

## Features

- **Dashboard**: Overview of inventory statistics and low stock alerts
- **Product Management**: CRUD operations for products with categories and suppliers
- **Inventory Management**: Real-time stock levels and stock transaction recording
- **Transaction History**: Complete audit trail of all stock movements
- **Responsive Design**: Modern UI with Bootstrap-inspired styling

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Django backend running on http://localhost:8000

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will open in your browser at http://localhost:3000

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## API Integration

The frontend communicates with the Django backend through REST API endpoints:

- **Products**: `/api/products/`
- **Inventory**: `/api/inventory/`
- **Transactions**: `/api/transactions/`
- **Categories**: `/api/categories/`
- **Suppliers**: `/api/suppliers/`

## Components

- **Dashboard**: Main overview with statistics and alerts
- **ProductList**: Product management with search and CRUD operations
- **InventoryList**: Stock level monitoring and transaction recording
- **TransactionList**: Complete transaction history with filtering
- **ProductModal**: Form for creating/editing products
- **StockTransactionModal**: Form for recording stock movements

## Styling

The app uses custom CSS with a modern, clean design inspired by Bootstrap. All styles are in `src/index.css` and include:

- Responsive grid system
- Card-based layouts
- Form styling
- Table styling
- Modal components
- Alert components
- Button variants

## Development

The app is configured with a proxy to the Django backend, so API calls to `/api/` will be forwarded to `http://localhost:8000/api/`.

Make sure your Django backend is running before starting the React development server.



