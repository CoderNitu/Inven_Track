import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          Smart Inventory
        </Link>
        <ul className="navbar-nav">
          <li>
            <Link 
              to="/" 
              className={location.pathname === '/' ? 'active' : ''}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link 
              to="/products" 
              className={location.pathname === '/products' ? 'active' : ''}
            >
              Products
            </Link>
          </li>
          <li>
            <Link 
              to="/inventory" 
              className={location.pathname === '/inventory' ? 'active' : ''}
            >
              Inventory
            </Link>
          </li>
          <li>
            <Link 
              to="/transactions" 
              className={location.pathname === '/transactions' ? 'active' : ''}
            >
              Transactions
            </Link>
          </li>
          <li>
            <Link 
              to="/suppliers" 
              className={location.pathname === '/suppliers' ? 'active' : ''}
            >
              Suppliers
            </Link>
          </li>
                      <li>
                <Link
                to="/locations"
                className={location.pathname === '/locations' ? 'active' : ''}
                >
                Locations
                </Link>
            </li>
            <li>
                <Link
                to="/analytics"
                className={location.pathname === '/analytics' ? 'active' : ''}
                >
                🤖 Analytics
                </Link>
            </li>
            <li>
                <Link
                to="/notifications"
                className={location.pathname === '/notifications' ? 'active' : ''}
                >
                🔔 Notifications
                </Link>
            </li>
            <li>
                <Link
                to="/reports"
                className={location.pathname === '/reports' ? 'active' : ''}
                >
                📊 Reports
                </Link>
            </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

