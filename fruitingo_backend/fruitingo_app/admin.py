from django.contrib import admin
from .models import Customer, Product, Order, Wishlist, Notification, Offer, AdminSecurity, SecurityActivity, ContactMessage

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['customer_id', 'user_id', 'mobile', 'display_name', 'email', 'status', 'joined_date']
    search_fields = ['customer_id', 'mobile', 'display_name', 'email']
    list_filter = ['status', 'joined_date']

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'sale_price', 'original_price', 'weight', 'is_published', 'created_at']
    search_fields = ['name']
    list_filter = ['is_published', 'created_at']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_id', 'customer', 'total', 'status', 'created_at']
    search_fields = ['order_id', 'customer__customer_id']
    list_filter = ['status', 'created_at']

@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ['customer', 'product', 'added_at']
    search_fields = ['customer__customer_id', 'product__name']

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['customer', 'title', 'notification_type', 'is_read', 'created_at']
    search_fields = ['title', 'customer__customer_id']
    list_filter = ['notification_type', 'is_read', 'created_at']

@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = ['title', 'discount_percentage', 'valid_from', 'valid_until', 'is_active']
    search_fields = ['title']
    list_filter = ['is_active', 'valid_from', 'valid_until']

@admin.register(AdminSecurity)
class AdminSecurityAdmin(admin.ModelAdmin):
    list_display = ['username', 'recovery_email', 'last_successful_login', 'failed_login_count', 'otp_enabled']
    search_fields = ['username', 'recovery_email']

@admin.register(SecurityActivity)
class SecurityActivityAdmin(admin.ModelAdmin):
    list_display = ['admin', 'date', 'time', 'action', 'status', 'created_at']
    search_fields = ['action', 'status']
    list_filter = ['action', 'status', 'created_at']

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone', 'status', 'created_at']
    search_fields = ['name', 'email', 'phone']
    list_filter = ['status', 'created_at']
