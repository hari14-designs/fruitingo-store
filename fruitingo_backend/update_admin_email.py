#!/usr/bin/env python
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fruitingo_backend.settings')
django.setup()

from fruitingo_app.models import AdminSecurity

# Get email from command line argument or environment variable
new_email = sys.argv[1] if len(sys.argv) > 1 else os.environ.get('ADMIN_EMAIL')

if not new_email:
    print('Error: Please provide email as argument or set ADMIN_EMAIL environment variable')
    print('Usage: python update_admin_email.py <email>')
    sys.exit(1)

# Update admin email
admin = AdminSecurity.objects.first()
if admin:
    old_email = admin.recovery_email
    admin.recovery_email = new_email
    admin.admin_email = new_email
    admin.save()
    print(f'Admin email updated successfully: {old_email} -> {new_email}')
else:
    print('No admin security record found. Creating new one...')
    admin = AdminSecurity.objects.create(
        username='admin',
        password='admin123',
        admin_email=new_email,
        recovery_email=new_email
    )
    print(f'Admin security record created with email: {new_email}')
