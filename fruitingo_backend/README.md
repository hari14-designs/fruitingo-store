# Fruitingo Django Backend Integration

## Project Overview
This Django backend replaces the LocalStorage-based Fruitingo website with a proper database-driven system while keeping the frontend completely unchanged.

## Setup Instructions

### 1. Install Dependencies
```bash
pip install django
```

### 2. Database Migration
```bash
python manage.py makemigrations
python manage.py migrate
```

### 3. Create Admin User
```bash
python manage.py createsuperuser
```

### 4. Run Development Server
```bash
python manage.py runserver
```

## Default Credentials

### Django Admin
- Username: `admin`
- Password: `admin123`

### Fruitingo Admin Security
- Username: `admin`
- Password: `admin123`
- Recovery Email: `hari12348ahdy@gmail.com`

## Database Models

### Customer
- Customer ID, User ID, Mobile, Display Name, Email, Gender, DOB, Status

### Product
- Name, Sale Price, Original Price, Weight, Nutrition Details, Ingredients, Storage Instructions

### Order
- Order ID, Customer, Total, Status, Items (JSON)

### Wishlist
- Customer, Product, Added At

### Notification
- Customer, Title, Message, Type, Read Status

### AdminSecurity
- Username, Password, Recovery Email, Security Activity Tracking

### SecurityActivity
- Admin, Date, Time, Action, Status

### ContactMessage
- Name, Email, Phone, Message, Status

## API Endpoints

### Customer APIs
- `POST /api/customer/register/` - Register new customer
- `POST /api/customer/login/` - Customer login
- `GET /api/customer/profile/<customer_id>/` - Get customer profile
- `POST /api/customer/update/` - Update customer profile

### Product APIs
- `GET /api/products/` - Get all published products
- `POST /api/product/create/` - Create new product

### Order APIs
- `POST /api/order/create/` - Create new order
- `GET /api/orders/<customer_id>/` - Get customer orders

### Wishlist APIs
- `POST /api/wishlist/add/` - Add to wishlist
- `GET /api/wishlist/<customer_id>/` - Get customer wishlist
- `DELETE /api/wishlist/remove/<customer_id>/<product_id>/` - Remove from wishlist

### Notification APIs
- `GET /api/notifications/<customer_id>/` - Get customer notifications
- `POST /api/notification/read/` - Mark notification as read

### Admin APIs
- `POST /api/admin/login/` - Admin login
- `GET /api/admin/security/` - Get admin security data
- `POST /api/admin/password/update/` - Update admin password
- `POST /api/admin/recovery-email/update/` - Update recovery email
- `GET /api/admin/customers/` - Get all customers

### Contact APIs
- `POST /api/contact/submit/` - Submit contact message
- `GET /api/contact/messages/` - Get all contact messages

## Frontend Integration

The frontend has been updated to use Django API calls instead of LocalStorage:

1. **Template Updates**: All HTML files converted to Django templates with static file loading
2. **API Integration**: New `api.js` file provides functions for all backend operations
3. **Session Management**: Uses sessionStorage for current customer and admin sessions
4. **No UI Changes**: The frontend remains completely unchanged visually

## Email Configuration

For production, configure Django email backend in `settings.py`:

```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.brevo.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-brevo-api-key'
EMAIL_HOST_PASSWORD = 'your-brevo-secret-key'
DEFAULT_FROM_EMAIL = 'noreply@fruitingo.in'
```

## Future Enhancements

1. **Password Hashing**: Implement proper password hashing using Django's make_password()
2. **Email OTP**: Configure Brevo email backend for OTP verification
3. **Authentication**: Use Django's built-in authentication system
4. **CSRF Protection**: Add CSRF tokens to API calls
5. **API Versioning**: Implement API versioning for future updates
6. **CORS Configuration**: Add CORS for cross-origin requests if needed

## Notes

- The frontend UI remains 100% unchanged as per requirements
- All LocalStorage operations replaced with Django API calls
- SQLite database used for simplicity (can be migrated to PostgreSQL/MySQL)
- Static files and templates configured for Django serving
- Admin interface available at `/admin/` for database management
