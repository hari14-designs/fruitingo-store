// EmailJS Service for Fruitingo Admin Email Verification
// This file is isolated for easy replacement with Django SMTP, Firebase, or Next.js API

class EmailService {
    constructor() {
        this.initialized = false;
        this.otpStorage = {};
    }

    async initialize() {
        try {
            // Check if EmailJS is loaded
            if (typeof emailjs === 'undefined') {
                console.error('❌ EmailJS SDK not loaded');
                return false;
            }

            // Check if configuration is available
            if (typeof EMAILJS_CONFIG === 'undefined') {
                console.error('❌ EmailJS configuration not found. Please set up email-config.js');
                return false;
            }

            // Initialize EmailJS
            await emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
            
            console.log('✅ EmailJS Initialized Successfully');
            console.log(`📧 Service ID: ${EMAILJS_CONFIG.SERVICE_ID}`);
            console.log(`📋 Template ID: ${EMAILJS_CONFIG.TEMPLATE_ID}`);
            
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('❌ EmailJS Initialization Failed:', error);
            return false;
        }
    }

    async sendOTP(email, otp, purpose) {
        try {
            // Ensure EmailJS is initialized
            if (!this.initialized) {
                const initSuccess = await this.initialize();
                if (!initSuccess) {
                    throw new Error('EmailJS initialization failed');
                }
            }

            console.log(`📧 Sending OTP to: ${email}`);
            console.log(`🔢 OTP: ${otp}`);
            console.log(`🎯 Purpose: ${purpose}`);

            // Generate OTP expiry time
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
            const expiryTime = expiresAt.toLocaleTimeString();

            // Store OTP for verification
            this.otpStorage[email] = {
                otp: otp,
                createdAt: new Date(),
                expiresAt: expiresAt,
                attempts: 0,
                verified: false
            };

            // Send email using EmailJS
            const response = await emailjs.send(
                EMAILJS_CONFIG.SERVICE_ID,
                EMAILJS_CONFIG.TEMPLATE_ID,
                {
                    to_email: email,
                    otp_code: otp,
                    expiry_time: expiryTime,
                    purpose: purpose
                }
            );

            console.log('✅ Email Sent Successfully:', response);
            
            return { 
                success: true, 
                message: 'OTP sent successfully',
                response: response 
            };
            
        } catch (error) {
            console.error('❌ EmailJS Sending Failed:', error);
            console.error('Error Details:', {
                message: error.message,
                stack: error.stack
            });
            
            return { 
                success: false, 
                error: error.message,
                details: 'Email service unavailable or network connection failed'
            };
        }
    }

    verifyOTP(email, enteredOTP) {
        const storedOTP = this.otpStorage[email];
        
        if (!storedOTP) {
            return { 
                success: false, 
                error: 'OTP not found or expired' 
            };
        }

        // Check if OTP has expired
        if (Date.now() > storedOTP.expiresAt.getTime()) {
            delete this.otpStorage[email];
            return { 
                success: false, 
                error: 'OTP has expired' 
            };
        }

        // Check verification attempts
        if (storedOTP.attempts >= 5) {
            delete this.otpStorage[email];
            return { 
                success: false, 
                error: 'Maximum verification attempts reached' 
            };
        }

        // Verify OTP
        if (enteredOTP === storedOTP.otp) {
            storedOTP.verified = true;
            delete this.otpStorage[email];
            return { success: true };
        } else {
            storedOTP.attempts++;
            return { 
                success: false, 
                error: 'Invalid OTP',
                attemptsRemaining: 5 - storedOTP.attempts
            };
        }
    }

    getEmailTemplate(otp, purpose) {
        if (purpose === 'admin email verification') {
            return `Hello Admin,
Use the verification code below to confirm your new admin email for Fruitingo.

Verification Code: ${otp}

This verification code expires in 5 minutes.
If you didn't request this email change, simply ignore this email.

Thank you,
Fruitingo Security Team`;
        } else if (purpose === 'password reset') {
            return `Hello Admin,
Use the verification code below to reset your Fruitingo Admin password.

Verification Code: ${otp}

This verification code expires in 5 minutes.
If you didn't request this password reset, simply ignore this email.

Thank you,
Fruitingo Security Team`;
        } else {
            return `Hello Admin,
Use the verification code below: ${otp}

This verification code expires in 5 minutes.

Thank you,
Fruitingo Security Team`;
        }
    }

    async sendAdminEmailOTP(email, otp) {
        return await this.sendOTP(email, otp, 'admin email verification');
    }

    async sendPasswordResetOTP(email, otp) {
        return await this.sendOTP(email, otp, 'password reset');
    }

    async sendRecoveryEmailOTP(email, otp) {
        return await this.sendOTP(email, otp, 'recovery email verification');
    }

    cleanupExpiredOTPs() {
        const now = Date.now();
        for (const email in this.otpStorage) {
            if (now > this.otpStorage[email].expiresAt.getTime()) {
                delete this.otpStorage[email];
                console.log(`🧹 Cleaned up expired OTP for: ${email}`);
            }
        }
    }
}

// Initialize Email Service
const emailService = new EmailService();

// Make it available globally
window.EmailService = emailService;

// Clean up expired OTPs periodically
setInterval(() => {
    emailService.cleanupExpiredOTPs();
}, 60 * 1000); // Every minute
