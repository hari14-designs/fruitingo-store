from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from django.contrib.auth import authenticate
from .models import Customer, Product, Order, Wishlist, Notification, AdminSecurity, SecurityActivity, ContactMessage
import json
import random
from datetime import datetime

# Template Views
def index(request):
    products = Product.objects.filter(is_published=True)
    return render(request, 'index.html', {'products': products})

def about(request):
    return render(request, 'about.html')

def product(request):
    products = Product.objects.filter(is_published=True)
    return render(request, 'product.html', {'products': products})

def contact(request):
    return render(request, 'contact.html')

def checkout(request):
    return render(request, 'checkout.html')

def admin_homepage(request):
    return render(request, 'AdminHomepage.html')

def my_account(request):
    return render(request, 'my-account.html')

# API Views
@csrf_exempt
@require_http_methods(["POST"])
def customer_register(request):
    try:
        data = json.loads(request.body)
        mobile = data.get('mobile')
        
        # Generate customer ID and user ID
        customer_count = Customer.objects.count()
        customer_id = f"FR-{str(customer_count + 1).zfill(4)}"
        user_id = f"USER {random.randint(1, 999)}"
        
        customer = Customer.objects.create(
            customer_id=customer_id,
            user_id=user_id,
            mobile=mobile,
            display_name=data.get('display_name', ''),
            email=data.get('email', ''),
            gender=data.get('gender', ''),
            dob=data.get('dob', None),
            status='Active'
        )
        
        return JsonResponse({
            'success': True,
            'customer_id': customer.customer_id,
            'user_id': customer.user_id,
            'mobile': customer.mobile
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def customer_login(request):
    try:
        data = json.loads(request.body)
        mobile = data.get('mobile')
        
        customer = Customer.objects.filter(mobile=mobile).first()
        if customer:
            return JsonResponse({
                'success': True,
                'customer_id': customer.customer_id,
                'user_id': customer.user_id,
                'mobile': customer.mobile,
                'display_name': customer.display_name,
                'email': customer.email,
                'gender': customer.gender,
                'dob': str(customer.dob) if customer.dob else '',
                'joined_date': str(customer.joined_date),
                'status': customer.status
            })
        else:
            return JsonResponse({'success': False, 'error': 'Customer not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["GET"])
def get_customer_profile(request, customer_id):
    try:
        customer = get_object_or_404(Customer, customer_id=customer_id)
        return JsonResponse({
            'success': True,
            'customer_id': customer.customer_id,
            'user_id': customer.user_id,
            'mobile': customer.mobile,
            'display_name': customer.display_name,
            'email': customer.email,
            'gender': customer.gender,
            'dob': str(customer.dob) if customer.dob else '',
            'joined_date': str(customer.joined_date),
            'status': customer.status
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def update_customer_profile(request):
    try:
        data = json.loads(request.body)
        customer_id = data.get('customer_id')
        customer = get_object_or_404(Customer, customer_id=customer_id)
        
        customer.display_name = data.get('display_name', customer.display_name)
        customer.email = data.get('email', customer.email)
        customer.gender = data.get('gender', customer.gender)
        if data.get('dob'):
            customer.dob = data.get('dob')
        customer.save()
        
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["GET"])
def get_products(request):
    try:
        products = Product.objects.filter(is_published=True)
        products_data = []
        for product in products:
            products_data.append({
                'id': product.id,
                'name': product.name,
                'sale_price': str(product.sale_price),
                'original_price': str(product.original_price),
                'weight': product.weight,
                'calories': product.calories,
                'protein': str(product.protein) if product.protein else None,
                'carbs': str(product.carbs) if product.carbs else None,
                'fibre': str(product.fibre) if product.fibre else None,
                'potassium': product.potassium,
                'iron': str(product.iron) if product.iron else None,
                'ingredients': product.ingredients,
                'storage_instructions': product.storage_instructions,
                'health_benefits': product.health_benefits,
                'usage_instructions': product.usage_instructions,
                'image': product.image
            })
        return JsonResponse({'success': True, 'products': products_data})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def create_order(request):
    try:
        data = json.loads(request.body)
        customer_id = data.get('customer_id')
        customer = get_object_or_404(Customer, customer_id=customer_id)
        
        order_count = Order.objects.count()
        order_id = f"ORD-{str(order_count + 1).zfill(6)}"
        
        order = Order.objects.create(
            order_id=order_id,
            customer=customer,
            total=data.get('total'),
            items=data.get('items', [])
        )
        
        return JsonResponse({
            'success': True,
            'order_id': order.order_id,
            'total': str(order.total),
            'status': order.status,
            'created_at': str(order.created_at)
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["GET"])
def get_customer_orders(request, customer_id):
    try:
        customer = get_object_or_404(Customer, customer_id=customer_id)
        orders = Order.objects.filter(customer=customer)
        orders_data = []
        for order in orders:
            orders_data.append({
                'order_id': order.order_id,
                'total': str(order.total),
                'status': order.status,
                'created_at': str(order.created_at),
                'items': order.items
            })
        return JsonResponse({'success': True, 'orders': orders_data})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def add_to_wishlist(request):
    try:
        data = json.loads(request.body)
        customer_id = data.get('customer_id')
        product_id = data.get('product_id')
        
        customer = get_object_or_404(Customer, customer_id=customer_id)
        product = get_object_or_404(Product, id=product_id)
        
        wishlist_item, created = Wishlist.objects.get_or_create(
            customer=customer,
            product=product
        )
        
        return JsonResponse({'success': True, 'created': created})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["GET"])
def get_customer_wishlist(request, customer_id):
    try:
        customer = get_object_or_404(Customer, customer_id=customer_id)
        wishlist_items = Wishlist.objects.filter(customer=customer).select_related('product')
        wishlist_data = []
        for item in wishlist_items:
            wishlist_data.append({
                'product_id': item.product.id,
                'name': item.product.name,
                'sale_price': str(item.product.sale_price),
                'original_price': str(item.product.original_price),
                'weight': item.product.weight,
                'image': item.product.image,
                'added_at': str(item.added_at)
            })
        return JsonResponse({'success': True, 'wishlist': wishlist_data})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["DELETE"])
def remove_from_wishlist(request, customer_id, product_id):
    try:
        customer = get_object_or_404(Customer, customer_id=customer_id)
        product = get_object_or_404(Product, id=product_id)
        wishlist_item = Wishlist.objects.filter(customer=customer, product=product).first()
        
        if wishlist_item:
            wishlist_item.delete()
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'success': False, 'error': 'Item not in wishlist'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["GET"])
def get_customer_notifications(request, customer_id):
    try:
        customer = get_object_or_404(Customer, customer_id=customer_id)
        notifications = Notification.objects.filter(customer=customer).order_by('-created_at')
        notifications_data = []
        for notification in notifications:
            notifications_data.append({
                'id': notification.notification_id,
                'title': notification.title,
                'message': notification.message,
                'type': notification.notification_type,
                'is_read': notification.is_read,
                'created_at': str(notification.created_at)
            })
        return JsonResponse({'success': True, 'notifications': notifications_data})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def mark_notification_read(request):
    try:
        data = json.loads(request.body)
        notification_id = data.get('notification_id')
        notification = get_object_or_404(Notification, notification_id=notification_id)
        notification.is_read = True
        notification.save()
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

# Admin API Views
@csrf_exempt
@require_http_methods(["POST"])
def admin_login(request):
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        admin = AdminSecurity.objects.filter(username=username).first()
        if admin and admin.password == password:  # In production, use proper password hashing
            admin.last_successful_login = timezone.now()
            admin.save()
            
            # Log successful login
            SecurityActivity.objects.create(
                admin=admin,
                date=timezone.now().date(),
                time=timezone.now().time(),
                action='Admin Login',
                status='Success'
            )
            
            return JsonResponse({'success': True})
        else:
            # Log failed login
            if admin:
                admin.failed_login_count += 1
                admin.save()
                SecurityActivity.objects.create(
                    admin=admin,
                    date=timezone.now().date(),
                    time=timezone.now().time(),
                    action='Failed Login Attempt',
                    status='Failed'
                )
            
            return JsonResponse({'success': False, 'error': 'Invalid credentials'}, status=401)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["GET"])
def get_admin_security(request):
    try:
        admin = AdminSecurity.objects.first()
        if admin:
            security_activities = SecurityActivity.objects.filter(admin=admin).order_by('-created_at')[:50]
            activities_data = []
            for activity in security_activities:
                activities_data.append({
                    'date': str(activity.date),
                    'time': str(activity.time),
                    'action': activity.action,
                    'status': activity.status
                })
            
            return JsonResponse({
                'success': True,
                'username': admin.username,
                'recovery_email': admin.recovery_email,
                'last_email_updated': str(admin.last_email_updated) if admin.last_email_updated else None,
                'otp_enabled': admin.otp_enabled,
                'last_password_changed': str(admin.last_password_changed) if admin.last_password_changed else None,
                'password_change_count': admin.password_change_count,
                'password_reset_count': admin.password_reset_count,
                'last_successful_login': str(admin.last_successful_login) if admin.last_successful_login else None,
                'failed_login_count': admin.failed_login_count,
                'security_activities': activities_data
            })
        else:
            return JsonResponse({'success': False, 'error': 'Admin not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def update_admin_password(request):
    try:
        data = json.loads(request.body)
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        admin = AdminSecurity.objects.first()
        if admin and admin.password == current_password:
            admin.password = new_password
            admin.last_password_changed = timezone.now()
            admin.password_change_count += 1
            admin.save()
            
            SecurityActivity.objects.create(
                admin=admin,
                date=timezone.now().date(),
                time=timezone.now().time(),
                action='Password Changed',
                status='Success'
            )
            
            return JsonResponse({'success': True})
        else:
            SecurityActivity.objects.create(
                admin=admin,
                date=timezone.now().date(),
                time=timezone.now().time(),
                action='Password Change Failed',
                status='Failed'
            )
            return JsonResponse({'success': False, 'error': 'Current password incorrect'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def update_recovery_email(request):
    try:
        data = json.loads(request.body)
        current_password = data.get('current_password')
        new_email = data.get('new_email')
        
        admin = AdminSecurity.objects.first()
        if admin and admin.password == current_password:
            admin.recovery_email = new_email
            admin.last_email_updated = timezone.now()
            admin.otp_enabled = True
            admin.save()
            
            SecurityActivity.objects.create(
                admin=admin,
                date=timezone.now().date(),
                time=timezone.now().time(),
                action='Recovery Email Changed',
                status='Success'
            )
            
            return JsonResponse({'success': True})
        else:
            SecurityActivity.objects.create(
                admin=admin,
                date=timezone.now().date(),
                time=timezone.now().time(),
                action='Recovery Email Update Failed',
                status='Failed'
            )
            return JsonResponse({'success': False, 'error': 'Current password incorrect'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def create_product(request):
    try:
        data = json.loads(request.body)
        product = Product.objects.create(
            name=data.get('name'),
            sale_price=data.get('sale_price'),
            original_price=data.get('original_price'),
            weight=data.get('weight'),
            calories=data.get('calories'),
            protein=data.get('protein'),
            carbs=data.get('carbs'),
            fibre=data.get('fibre'),
            potassium=data.get('potassium'),
            iron=data.get('iron'),
            ingredients=data.get('ingredients'),
            storage_instructions=data.get('storage_instructions'),
            health_benefits=data.get('health_benefits'),
            usage_instructions=data.get('usage_instructions'),
            image=data.get('image'),
            is_published=True
        )
        return JsonResponse({'success': True, 'product_id': product.id})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["GET"])
def get_all_customers(request):
    try:
        customers = Customer.objects.all()
        customers_data = []
        for customer in customers:
            customers_data.append({
                'customer_id': customer.customer_id,
                'user_id': customer.user_id,
                'mobile': customer.mobile,
                'display_name': customer.display_name,
                'email': customer.email,
                'joined_date': str(customer.joined_date),
                'status': customer.status
            })
        return JsonResponse({'success': True, 'customers': customers_data})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def submit_contact_message(request):
    try:
        data = json.loads(request.body)
        message = ContactMessage.objects.create(
            name=data.get('name'),
            email=data.get('email'),
            phone=data.get('phone'),
            message=data.get('message')
        )
        return JsonResponse({'success': True, 'message_id': message.id})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["GET"])
def get_contact_messages(request):
    try:
        messages = ContactMessage.objects.all().order_by('-created_at')
        messages_data = []
        for msg in messages:
            messages_data.append({
                'id': msg.id,
                'name': msg.name,
                'email': msg.email,
                'phone': msg.phone,
                'message': msg.message,
                'created_at': str(msg.created_at),
                'status': msg.status
            })
        return JsonResponse({'success': True, 'messages': messages_data})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)
