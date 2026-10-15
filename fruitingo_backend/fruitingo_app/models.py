from django.db import models
from django.utils import timezone
import json

class Customer(models.Model):
    customer_id = models.CharField(max_length=20, unique=True, primary_key=True)
    user_id = models.CharField(max_length=20, unique=True)
    mobile = models.CharField(max_length=15, unique=True)
    display_name = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    gender = models.CharField(max_length=20, blank=True, null=True)
    dob = models.DateField(blank=True, null=True)
    joined_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, default='Active')
    
    def __str__(self):
        return f"{self.customer_id} - {self.display_name or self.mobile}"

class SavedAddress(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='addresses')
    full_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15)
    street = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.customer.customer_id} - {self.city}"

class Product(models.Model):
    name = models.CharField(max_length=200)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=10, decimal_places=2)
    weight = models.CharField(max_length=50)
    calories = models.IntegerField(blank=True, null=True)
    protein = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    carbs = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    fibre = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    potassium = models.IntegerField(blank=True, null=True)
    iron = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    ingredients = models.TextField(blank=True, null=True)
    storage_instructions = models.TextField(blank=True, null=True)
    health_benefits = models.TextField(blank=True, null=True)
    usage_instructions = models.TextField(blank=True, null=True)
    image = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name

class Order(models.Model):
    order_id = models.CharField(max_length=20, unique=True, primary_key=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='orders')
    total = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    items = models.JSONField(default=list)  # Store order items as JSON
    
    def __str__(self):
        return f"{self.order_id} - {self.customer.customer_id}"

class Wishlist(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='wishlist')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='wishlist_items')
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('customer', 'product')
    
    def __str__(self):
        return f"{self.customer.customer_id} - {self.product.name}"

class Notification(models.Model):
    notification_id = models.AutoField(primary_key=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=50, choices=[
        ('Offer', 'Offer'),
        ('Order Update', 'Order Update'),
        ('Product Launch', 'Product Launch'),
        ('General Announcement', 'General Announcement'),
        ('Delivery Update', 'Delivery Update')
    ])
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} - {self.customer.customer_id if self.customer else 'All'}"

class Offer(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    discount_percentage = models.IntegerField()
    valid_from = models.DateField()
    valid_until = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} - {self.discount_percentage}%"

class AdminSecurity(models.Model):
    username = models.CharField(max_length=50, unique=True)
    password = models.CharField(max_length=255)  # Store hashed password
    admin_email = models.EmailField(default='fruitingonaturals@gmail.com')
    recovery_email = models.EmailField(default='fruitingonaturals@gmail.com')
    last_password_changed = models.DateTimeField(blank=True, null=True)
    password_change_count = models.IntegerField(default=0)
    password_reset_count = models.IntegerField(default=0)
    last_successful_login = models.DateTimeField(blank=True, null=True)
    failed_login_count = models.IntegerField(default=0)
    otp_enabled = models.BooleanField(default=False)
    last_email_updated = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.username

class SecurityActivity(models.Model):
    admin = models.ForeignKey(AdminSecurity, on_delete=models.CASCADE, related_name='security_activities')
    date = models.DateField()
    time = models.TimeField()
    action = models.CharField(max_length=100)
    status = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.admin.username} - {self.action} - {self.status}"

class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='Pending')
    
    def __str__(self):
        return f"{self.name} - {self.created_at}"
