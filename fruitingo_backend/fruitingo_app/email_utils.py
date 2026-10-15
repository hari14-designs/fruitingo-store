from django.core.mail import send_mail
from django.conf import settings
import random

def generate_otp():
    """Generate a 6-digit OTP"""
    return str(random.randint(100000, 999999))

def send_otp_email(email, otp, purpose='password reset'):
    """Send OTP email using Django email backend"""
    subject = f'Fruitingo Admin {purpose.capitalize()} Verification Code'
    
    if purpose == 'password reset':
        message = f'''Hello Admin,
Use the verification code below to reset your Fruitingo Admin password.

Verification Code: {otp}

This verification code expires in 5 minutes.
If you didn't request this password reset, simply ignore this email.

Thank you,
Fruitingo Security Team'''
    elif purpose == 'email verification':
        message = f'''Hello Admin,
Use the verification code below to confirm your new recovery email for Fruitingo Admin password recovery.

Verification Code: {otp}

This verification code expires in 5 minutes.
If you didn't request this email change, simply ignore this email.

Thank you,
Fruitingo Security Team'''
    else:
        message = f'''Hello Admin,
Use the verification code below: {otp}

This verification code expires in 5 minutes.

Thank you,
Fruitingo Security Team'''
    
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Email sending failed: {e}")
        return False