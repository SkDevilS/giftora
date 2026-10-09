# Trendora Ventures Backend - Quick Setup Guide

## Prerequisites

1. **Python 3.8 or higher**
   - Check: `python --version`
   - Download from: https://www.python.org/downloads/

2. **MySQL Server**
   - Download from: https://dev.mysql.com/downloads/mysql/
   - Or use XAMPP/WAMP for Windows

3. **pip (Python package manager)**
   - Usually comes with Python
   - Check: `pip --version`

## Step-by-Step Setup

### 1. Create Database

Open MySQL command line or phpMyAdmin and run:

```sql
CREATE DATABASE trendoraventures_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Configure Environment

Edit the `.env` file in the `backend` folder and update these settings:

```env
# Database Settings - UPDATE THESE
DB_NAME=trendoraventures_db
DB_USER=root
DB_PASSWORD=your_mysql_password_here

# Keep these as is for development
DB_HOST=localhost
DB_PORT=3306
```

### 3. Create Virtual Environment

Open terminal/command prompt in the `backend` folder:

```bash
# Create virtual environment
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate

# On Mac/Linux:
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt.

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

This will install all required packages (Flask, SQLAlchemy, JWT, etc.)

### 5. Initialize Database

```bash
python init_db.py
```

This will:
- Create all database tables
- Create default admin user
- Create default categories
- Create default navbar items

### 6. Start the Server

```bash
python app.py
```

The API will start at: `http://localhost:5000`

You should see:
```
* Running on http://0.0.0.0:5000
* Database tables created successfully!
```

### 7. Test the API

Open your browser and visit:
- Health Check: http://localhost:5000/api/health
- Sections: http://localhost:5000/api/sections

You should see JSON responses.

## Default Admin Credentials

```
Email: admin@trendoraventures.in
Password: admin@123
```

**IMPORTANT**: Change this password immediately after first login!

## Common Issues & Solutions

### Issue: "No module named 'flask'"
**Solution**: Make sure virtual environment is activated and run `pip install -r requirements.txt`

### Issue: "Access denied for user 'root'@'localhost'"
**Solution**: Update `DB_PASSWORD` in `.env` file with your MySQL password

### Issue: "Unknown database 'trendoraventures_db'"
**Solution**: Create the database first using the SQL command in Step 1

### Issue: "Port 5000 is already in use"
**Solution**: 
- Stop other applications using port 5000
- Or change port in `app.py`: `app.run(port=5001)`

### Issue: "ModuleNotFoundError: No module named 'pymysql'"
**Solution**: Run `pip install pymysql`

## Testing the Admin Login

You can test the admin login using curl or Postman:

```bash
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@trendoraventures.in","password":"admin@123"}'
```

You should receive a response with `access_token` and `refresh_token`.

## Next Steps

1. **Change Admin Password**
   - Login to admin dashboard
   - Go to profile settings
   - Change password

2. **Add Products**
   - Use admin dashboard
   - Or use bulk upload feature

3. **Configure Sections**
   - Customize categories
   - Set display order

4. **Setup Navbar**
   - Add custom menu items
   - Configure navigation

5. **Test Orders**
   - Create test customer account
   - Add products to cart
   - Place test order

## Production Deployment

For production deployment:

1. Copy `.env.production` to `.env`
2. Update all production values
3. Set `FLASK_ENV=production`
4. Use gunicorn: `gunicorn -w 4 -b 0.0.0.0:5000 app:app`
5. Setup Nginx reverse proxy
6. Enable HTTPS
7. Configure firewall

## API Documentation

Full API documentation is available in `README.md`

## Support

For issues or questions:
- Email: support@trendoraventures.in
- Check `README.md` for detailed documentation

## File Structure

```
backend/
├── app.py                    # Main application
├── config.py                 # Configuration
├── models.py                 # Database models
├── init_db.py               # Database setup script
├── requirements.txt          # Dependencies
├── .env                     # Environment variables
├── routes/                  # API endpoints
│   ├── auth.py             # Authentication
│   ├── admin.py            # Admin panel
│   ├── products.py         # Products
│   ├── cart.py             # Shopping cart
│   ├── wishlist.py         # Wishlist
│   ├── orders.py           # Orders
│   ├── addresses.py        # Addresses
│   ├── analytics.py        # Analytics
│   └── navbar.py           # Navigation
├── utils/                   # Utilities
│   └── pdf_receipt_generator.py
└── uploads/                 # Uploaded files
    ├── products/           # Product images
    └── bulk_images/        # Bulk uploads
```

## Development Tips

1. **Auto-reload**: Flask auto-reloads when you save files (in debug mode)
2. **Database Changes**: After model changes, you may need to recreate tables
3. **Logs**: Check terminal for error messages
4. **Testing**: Use Postman or curl to test API endpoints
5. **CORS**: Already configured for localhost:5173 and localhost:5174

## Security Checklist

- [ ] Change default admin password
- [ ] Update SECRET_KEY in production
- [ ] Update JWT_SECRET_KEY in production
- [ ] Enable HTTPS in production
- [ ] Set FLASK_DEBUG=False in production
- [ ] Configure proper CORS origins
- [ ] Regular database backups
- [ ] Keep dependencies updated

---

**Ready to start building!** 🚀
