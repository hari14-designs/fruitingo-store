"""
URL configuration for fruitingo_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from fruitingo_app import views

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Template Views
    path('', views.index, name='index'),
    path('about.html', views.about, name='about'),
    path('product.html', views.product, name='product'),
    path('contact.html', views.contact, name='contact'),
    path('checkout.html', views.checkout, name='checkout'),
    path('AdminHomepage.html', views.admin_homepage, name='admin_homepage'),
    path('my-account.html', views.my_account, name='my_account'),
    
    # API Views - Customer
    path('api/customer/register/', views.customer_register, name='customer_register'),
    path('api/customer/login/', views.customer_login, name='customer_login'),
    path('api/customer/profile/<str:customer_id>/', views.get_customer_profile, name='get_customer_profile'),
    path('api/customer/update/', views.update_customer_profile, name='update_customer_profile'),
    
    # API Views - Products
    path('api/products/', views.get_products, name='get_products'),
    path('api/product/create/', views.create_product, name='create_product'),
    
    # API Views - Orders
    path('api/order/create/', views.create_order, name='create_order'),
    path('api/orders/<str:customer_id>/', views.get_customer_orders, name='get_customer_orders'),
    
    # API Views - Wishlist
    path('api/wishlist/add/', views.add_to_wishlist, name='add_to_wishlist'),
    path('api/wishlist/<str:customer_id>/', views.get_customer_wishlist, name='get_customer_wishlist'),
    path('api/wishlist/remove/<str:customer_id>/<int:product_id>/', views.remove_from_wishlist, name='remove_from_wishlist'),
    
    # API Views - Notifications
    path('api/notifications/<str:customer_id>/', views.get_customer_notifications, name='get_customer_notifications'),
    path('api/notification/read/', views.mark_notification_read, name='mark_notification_read'),
    
    # API Views - Admin
    path('api/admin/login/', views.admin_login, name='admin_login'),
    path('api/admin/security/', views.get_admin_security, name='get_admin_security'),
    path('api/admin/password/update/', views.update_admin_password, name='update_admin_password'),
    path('api/admin/recovery-email/update/', views.update_recovery_email, name='update_recovery_email'),
    
    # API Views - Contact
    path('api/contact/submit/', views.submit_contact_message, name='submit_contact_message'),
    path('api/contact/messages/', views.get_contact_messages, name='get_contact_messages'),
    
    # API Views - Customers for Admin
    path('api/admin/customers/', views.get_all_customers, name='get_all_customers'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
