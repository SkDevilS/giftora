# Trendora Ventures Backend API

Complete backend system for Trendora Ventures e-commerce platform with admin dashboard.

## Features

- **User Management**: Customer registration, login, profile management
- **Admin Dashboard**: Complete admin panel for managing the entire platform
- **Product Management**: CRUD operations for products with image upload
- **Category Management**: Dynamic sections/categories
- **Navbar Management**: Customizable navigation menu from admin
- **Order Management**: Complete order processing with invoice generation
- **Cart & Wishlist**: User-specific cart and wishlist functionality
- **Address Management**: Multiple shipping addresses per user
- **Analytics**: Track views and clicks
- **JWT Authentication**: Secure token-based authentication
- **PDF Receipts**: Professional invoice generation

## Tech Stack

- **Framework**: Flask 3.0
- **Database**: MySQL (configurable for PostgreSQL/SQLite)
- **ORM**: SQLAlchemy
- **Authentication**: JWT (Flask-JWT-Extended)
- **File Upload**: Pillow for image processing
- **PDF Generation**: ReportLab
- **CORS**: Flask-CORS

## Installation

### Prerequisites

- Python 3.8+
- MySQL Server (or PostgreSQL/SQLite)
- pip

### Setup Steps

1. **Create Virtual Environment**
   ```bash
   python -m venv venv
   ```

2. **Activate Virtual Environment**
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - Linux/Mac:
     ```bash
     source venv/bin/activate
     ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment**
   - Copy `.env` file and update with your settings
   - Update database credentials in `.env`
   ```
   DB_NAME=trendoraventures_db
   DB_USER=root
   DB_PASSWORD=your_password
   ```

5. **Create Database**
   ```sql
   CREATE DATABASE trendoraventures_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

6. **Initialize Database**
   ```bash
   python init_db.py
   ```

7. **Run Application**
   ```bash
   python app.py
   ```

The API will be available at `http://localhost:5000`

## Default Admin Credentials

```
Email: admin@trendoraventures.in
Password: admin@123
```

**IMPORTANT**: Change the password immediately after first login!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Customer registration
- `POST /api/auth/login` - Customer login
- `POST /api/auth/admin/login` - Admin login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout

### Products (Public)
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products/slug/{slug}` - Get product by slug
- `GET /api/products/category/{slug}` - Get products by category
- `GET /api/products/featured` - Get featured products
- `GET /api/products/new-arrivals` - Get new arrivals

### Admin - User Management
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/{id}` - Get user by ID
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/{id}` - Update user
- `DELETE /api/admin/users/{id}` - Delete user
- `POST /api/admin/users/{id}/reset-password` - Reset user password
- `POST /api/admin/users/{id}/toggle-status` - Toggle user status

### Admin - Product Management
- `GET /api/admin/products` - Get all products (with pagination)
- `GET /api/admin/products/{id}` - Get product by ID
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/{id}` - Update product
- `DELETE /api/admin/products/{id}` - Delete product
- `POST /api/admin/products/{id}/toggle-status` - Toggle product status
- `POST /api/admin/upload-image` - Upload product image
- `POST /api/admin/bulk-upload-products` - Bulk upload products from Excel
- `POST /api/admin/bulk-upload-images` - Bulk upload images
- `GET /api/admin/download-product-template` - Download Excel template

### Admin - Section Management
- `GET /api/admin/sections` - Get all sections
- `POST /api/admin/sections` - Create section
- `PUT /api/admin/sections/{id}` - Update section
- `DELETE /api/admin/sections/{id}` - Delete section
- `POST /api/admin/sections/{id}/toggle-status` - Toggle section status

### Admin - Navbar Management
- `GET /api/admin/navbar` - Get all navbar items
- `POST /api/admin/navbar` - Create navbar item
- `PUT /api/admin/navbar/{id}` - Update navbar item
- `DELETE /api/admin/navbar/{id}` - Delete navbar item
- `POST /api/admin/navbar/{id}/toggle-status` - Toggle navbar status

### Admin - Order Management
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/orders/{id}` - Get order by ID
- `PUT /api/admin/orders/{id}/status` - Update order status
- `DELETE /api/admin/orders/{id}` - Delete order
- `GET /api/admin/orders/{id}/receipt` - Download order receipt
- `GET /api/admin/orders/stats` - Get order statistics

### Admin - Dashboard
- `GET /api/admin/stats` - Get dashboard statistics

### Cart (Authenticated)
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/{id}` - Update cart item
- `DELETE /api/cart/{id}` - Remove from cart
- `DELETE /api/cart/clear` - Clear cart

### Wishlist (Authenticated)
- `GET /api/wishlist` - Get wishlist items
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/{id}` - Remove from wishlist
- `DELETE /api/wishlist/product/{id}` - Remove by product ID
- `DELETE /api/wishlist/clear` - Clear wishlist
- `GET /api/wishlist/check/{id}` - Check if in wishlist

### Orders (Authenticated)
- `GET /api/orders` - Get user orders
- `GET /api/orders/{id}` - Get order by ID
- `POST /api/orders` - Create order
- `POST /api/orders/{id}/cancel` - Cancel order
- `GET /api/orders/{id}/receipt` - Download receipt

### Addresses (Authenticated)
- `GET /api/addresses` - Get all addresses
- `GET /api/addresses/{id}` - Get address by ID
- `POST /api/addresses` - Create address
- `PUT /api/addresses/{id}` - Update address
- `DELETE /api/addresses/{id}` - Delete address
- `POST /api/addresses/{id}/set-default` - Set default address

### Analytics
- `GET /api/analytics` - Get analytics
- `POST /api/analytics/view` - Increment view count
- `POST /api/analytics/click` - Increment click count
- `PUT /api/admin/analytics` - Update analytics (admin)

### Public
- `GET /api/sections` - Get active sections
- `GET /api/navbar` - Get navbar items
- `GET /api/health` - Health check

## Environment Variables

All configuration is done through environment variables in `.env` file:

```env
# Flask Settings
SECRET_KEY=your-secret-key
FLASK_DEBUG=True
FLASK_ENV=development

# JWT Settings
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ACCESS_TOKEN_EXPIRES=24
JWT_REFRESH_TOKEN_EXPIRES=720

# Database Settings
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=trendoraventures_db
DB_USER=root
DB_PASSWORD=your-password

# File Upload Settings
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216
ALLOWED_EXTENSIONS=png,jpg,jpeg,gif,webp

# Domain Configuration
MAIN_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
API_URL=http://localhost:5000
UPLOAD_BASE_URL=http://localhost:5000/uploads

# CORS Settings
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

## File Structure

```
backend/
├── app.py                 # Main application file
├── config.py              # Configuration management
├── models.py              # Database models
├── requirements.txt       # Python dependencies
├── init_db.py            # Database initialization script
├── .env                  # Environment variables
├── routes/               # API routes
│   ├── __init__.py
│   ├── auth.py          # Authentication routes
│   ├── admin.py         # Admin routes
│   ├── products.py      # Product routes
│   ├── cart.py          # Cart routes
│   ├── wishlist.py      # Wishlist routes
│   ├── orders.py        # Order routes
│   ├── addresses.py     # Address routes
│   ├── analytics.py     # Analytics routes
│   └── navbar.py        # Navbar routes
├── utils/               # Utility functions
│   ├── __init__.py
│   └── pdf_receipt_generator.py  # PDF generation
└── uploads/             # Uploaded files
    ├── products/        # Product images
    └── bulk_images/     # Bulk upload images
```

## Database Schema

### Users
- User authentication and profile management
- Roles: customer, admin
- Login tracking

### Products
- Complete product information
- Images, sizes, colors
- Stock management
- Analytics (views, clicks)

### Sections (Categories)
- Product categorization
- Display order management

### NavbarItems
- Dynamic navigation menu
- Hierarchical structure (parent-child)
- Custom URLs and icons

### Orders
- Order management
- Order items
- Payment details
- Status tracking

### Cart & Wishlist
- User-specific items
- Product variants (size, color)

### Addresses
- Multiple addresses per user
- Default address selection

### Analytics
- Site-wide metrics
- Views and clicks tracking

## Production Deployment

1. Update `.env.production` with production values
2. Set `FLASK_ENV=production`
3. Use a production WSGI server (gunicorn):
   ```bash
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```
4. Set up reverse proxy (Nginx/Apache)
5. Enable HTTPS
6. Configure database backups
7. Set up logging and monitoring

## Security Notes

- Change default admin password immediately
- Use strong SECRET_KEY and JWT_SECRET_KEY in production
- Enable HTTPS in production
- Regularly update dependencies
- Implement rate limiting
- Use environment-specific configurations
- Never commit `.env` file to version control

## Support

For issues or questions, contact: support@trendoraventures.in

## License

Proprietary - Trendora Ventures Private Limited
