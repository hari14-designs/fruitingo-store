# EmailJS Setup Guide for Fruitingo Admin OTP System

## Overview
This guide explains how to configure EmailJS to send real OTP emails for the Fruitingo Admin Forgot Password and Email Settings features.

## Prerequisites
- EmailJS account (free tier available at https://www.emailjs.com/)
- Admin email address (e.g., fruitingonaturals@gmail.com)

## Step 1: Create EmailJS Account

1. Go to https://www.emailjs.com/
2. Click "Sign Up" and create a free account
3. Verify your email address
4. Log in to the EmailJS dashboard

## Step 2: Create Email Service

1. In EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose an email provider:
   - **Gmail** (recommended for testing)
   - **Outlook**
   - **Custom SMTP** (for production)
4. Follow the provider-specific setup instructions
5. Copy the **Service ID** (you'll need this later)

### For Gmail Setup:
- Enable 2-factor authentication on your Gmail account
- Generate an App Password:
  - Go to Google Account > Security
  - Enable 2-Step Verification
  - Generate App Password
  - Use this App Password in EmailJS

## Step 3: Create Email Template

1. In EmailJS dashboard, go to "Email Templates"
2. Click "Create New Template"
3. Configure the template:

### Template Settings:
- **Template Name**: Fruitingo Admin OTP
- **Subject**: Fruitingo Admin Verification Code

### Template Content (HTML):
```html
<h2>Fruitingo Admin Verification</h2>
<p>Hello Admin,</p>
<p>Use the verification code below to {{purpose}}.</p>
<h1 style="font-size: 32px; color: #184C3A; background: #EEF8F1; padding: 20px; text-align: center; border-radius: 8px;">
  {{otp_code}}
</h1>
<p>This verification code expires in 5 minutes.</p>
<p>If you didn't request this, simply ignore this email.</p>
<p>Thank you,<br>Fruitingo Security Team</p>
```

### Template Variables:
Add these variables in the template editor:
- `to_email` - Recipient email address
- `otp_code` - 6-digit verification code
- `expiry_time` - Expiry time
- `purpose` - Purpose of OTP (e.g., "admin email verification")

4. Click "Save Template"
5. Copy the **Template ID** (you'll need this later)

## Step 4: Get Public Key

1. In EmailJS dashboard, go to "Account" > "General"
2. Copy the **Public Key** (also called API Key)
3. This key is safe to use in frontend code

## Step 5: Configure Fruitingo

1. Open `email-config.js` in the Fruitingo project
2. Replace the placeholder values:

```javascript
const EMAILJS_CONFIG = {
    // Replace with your actual EmailJS Public Key
    PUBLIC_KEY: 'YOUR_EMAILJS_PUBLIC_KEY',
    
    // Replace with your actual Service ID
    SERVICE_ID: 'YOUR_EMAILJS_SERVICE_ID',
    
    // Replace with your actual Template ID
    TEMPLATE_ID: 'YOUR_EMAILJS_TEMPLATE_ID',
    
    OPTIONS: {
        timeout: 5000,
        secure: true
    }
};
```

3. Save the file

## Step 6: Test the Configuration

1. Open `AdminHomepage.html` in a browser
2. Log in as admin
3. Go to Security Settings
4. Click "Send Verification OTP" in Admin Email Settings
5. Check the browser console for debug output:
   - ✅ EmailJS Initialized Successfully
   - 📧 Sending OTP to: [email]
   - 🔢 OTP: [6-digit code]
   - ✅ Email Sent Successfully

6. Check your email inbox for the OTP

## Troubleshooting

### Issue: "EmailJS SDK not loaded"
**Solution**: Ensure the EmailJS CDN script is loaded before `email-service.js`
```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
```

### Issue: "EmailJS configuration not found"
**Solution**: Ensure `email-config.js` is loaded before `email-service.js`
```html
<script src="email-config.js"></script>
<script src="email-service.js"></script>
```

### Issue: "Email service unavailable"
**Solution**: 
- Check if Service ID and Template ID are correct
- Verify EmailJS account is active
- Check if email provider is properly configured

### Issue: "Network connection failed"
**Solution**:
- Check internet connection
- Verify no ad blockers are blocking EmailJS
- Check if CORS is enabled in EmailJS settings

### Issue: "Email not received"
**Solution**:
- Check spam/junk folder
- Verify recipient email address is correct
- Check EmailJS dashboard for delivery status
- Verify email provider credentials

### Issue: "Template configuration error"
**Solution**:
- Ensure template variables match exactly
- Check template syntax is valid HTML
- Verify template is published (not draft)

## Security Best Practices

1. **Public Key**: The EmailJS Public Key is safe to use in frontend code
2. **Private Key**: Never expose the EmailJS Private Key in frontend code
3. **Rate Limiting**: EmailJS has rate limits - consider implementing retry logic
4. **Email Validation**: Always validate email format before sending
5. **OTP Expiry**: Ensure OTPs expire after 5 minutes
6. **Attempt Limits**: Limit OTP verification attempts to prevent brute force

## Production Deployment

### For GitHub Pages:
1. Commit the configured `email-config.js` to your repository
2. EmailJS works with GitHub Pages (no CORS issues)
3. Ensure the script is loaded from HTTPS

### For Custom Domain:
1. Add your domain to EmailJS allowed origins
2. Use HTTPS for all requests
3. Configure proper DNS settings

### For Django Backend:
EmailJS can be replaced with Django email backend:
```python
# settings.py
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.brevo.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
```

## Cost Considerations

### EmailJS Free Tier:
- 200 emails per month
- 2 email services
- Unlimited email templates
- Sufficient for testing and small projects

### EmailJS Paid Plans:
- Bronze: $15/month - 1,000 emails
- Silver: $30/month - 5,000 emails
- Gold: $60/month - 15,000 emails

### Alternative Solutions:
- **Brevo SMTP**: Free tier (300 emails/day)
- **SendGrid**: Free tier (100 emails/day)
- **Mailgun**: Pay-as-you-go
- **Django Email Backend**: Free with your own SMTP server

## Support

- EmailJS Documentation: https://www.emailjs.com/docs/
- EmailJS Support: support@emailjs.com
- Fruitingo Documentation: See project README.md

## Next Steps

After successful EmailJS configuration:
1. Test the complete Forgot Password flow
2. Test Admin Email Settings with OTP verification
3. Verify security history logging
4. Test on GitHub Pages deployment
5. Plan for Django backend migration (if needed)
