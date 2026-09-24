// Netlify Function for Brevo OTP Email Service
// Fruitingo Admin Password Verification

const https = require('https');

// In-memory OTP storage (Note: In production, use Redis or database)
const otpStorage = {};
const resendAttempts = {};
const verificationAttempts = {};

// Rate limiting configuration
const MAX_RESEND_ATTEMPTS = 3;
const MAX_VERIFICATION_ATTEMPTS = 5;
const RESEND_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Generate secure 6-digit OTP
 */
function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
}

/**
 * Clean up expired OTPs and old attempts
 */
function cleanupExpiredData() {
  const now = Date.now();
  
  // Clean expired OTPs
  for (const email in otpStorage) {
    if (now > otpStorage[email].expiresAt) {
      delete otpStorage[email];
    }
  }
  
  // Clean old resend attempts
  for (const email in resendAttempts) {
    const recentAttempts = resendAttempts[email].filter(
      timestamp => now - timestamp < RESEND_WINDOW_MS
    );
    if (recentAttempts.length === 0) {
      delete resendAttempts[email];
    } else {
      resendAttempts[email] = recentAttempts;
    }
  }
  
  // Clean old verification attempts
  for (const email in verificationAttempts) {
    const recentAttempts = verificationAttempts[email].filter(
      timestamp => now - timestamp < RESEND_WINDOW_MS
    );
    if (recentAttempts.length === 0) {
      delete verificationAttempts[email];
    } else {
      verificationAttempts[email] = recentAttempts;
    }
  }
}

/**
 * Send email using Brevo API
 */
function sendBrevoEmail(toEmail, otp) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.BREVO_API_KEY;
    const fromEmail = process.env.FROM_EMAIL || process.env.ADMIN_EMAIL;
    
    if (!apiKey) {
      return reject(new Error('BREVO_API_KEY not configured'));
    }
    
    if (!fromEmail) {
      return reject(new Error('FROM_EMAIL or ADMIN_EMAIL not configured'));
    }
    
    const data = JSON.stringify({
      sender: {
        name: 'Fruitingo Security Team',
        email: fromEmail
      },
      to: [{
        email: toEmail
      }],
      subject: 'Fruitingo Admin Password Verification Code',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #D4AF37;">Hello Admin,</h2>
          <p>Use the verification code below to continue changing your Fruitingo Admin password.</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #333; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          <p>This code expires in 5 minutes.</p>
          <p>If you did not request this change, please ignore this email.</p>
          <p style="margin-top: 30px;">Thank you,<br>Fruitingo Security Team</p>
        </div>
      `
    });
    
    const options = {
      hostname: 'api.brevo.com',
      port: 443,
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
        'Content-Length': Buffer.byteLength(data)
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, statusCode: res.statusCode, body: body });
        } else {
          reject(new Error(`Brevo API error: ${res.statusCode} - ${body}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
}

/**
 * Main handler function
 */
exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }
  
  try {
    const body = JSON.parse(event.body);
    const { email, action } = body;
    
    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email is required' })
      };
    }
    
    // Clean up expired data
    cleanupExpiredData();
    
    const adminEmail = process.env.ADMIN_EMAIL;
    
    if (action === 'send') {
      // Check if email matches admin email
      if (adminEmail && email.toLowerCase() !== adminEmail.toLowerCase()) {
        return {
          statusCode: 403,
          body: JSON.stringify({ 
            error: 'This email is not registered as Fruitingo Admin.',
            success: false 
          })
        };
      }
      
      // Check resend rate limit
      const now = Date.now();
      if (!resendAttempts[email]) {
        resendAttempts[email] = [];
      }
      
      // Filter attempts within the window
      resendAttempts[email] = resendAttempts[email].filter(
        timestamp => now - timestamp < RESEND_WINDOW_MS
      );
      
      if (resendAttempts[email].length >= MAX_RESEND_ATTEMPTS) {
        return {
          statusCode: 429,
          body: JSON.stringify({ 
            error: 'Maximum resend attempts reached. Please try again later.',
            success: false 
          })
        };
      }
      
      // Generate and store OTP
      const otp = generateOTP();
      const expiresAt = now + OTP_EXPIRY_MS;
      
      otpStorage[email] = {
        otp,
        createdAt: now,
        expiresAt,
        attempts: 0
      };
      
      // Record resend attempt
      resendAttempts[email].push(now);
      
      // Send email via Brevo
      try {
        await sendBrevoEmail(email, otp);
        
        return {
          statusCode: 200,
          body: JSON.stringify({ 
            success: true, 
            message: 'OTP sent successfully',
            expiresIn: OTP_EXPIRY_MS / 1000 // seconds
          })
        };
      } catch (emailError) {
        // Clean up OTP if email fails
        delete otpStorage[email];
        resendAttempts[email].pop();
        
        return {
          statusCode: 500,
          body: JSON.stringify({ 
            error: 'Failed to send OTP email',
            details: emailError.message,
            success: false 
          })
        };
      }
      
    } else if (action === 'verify') {
      const { otp } = body;
      
      if (!otp) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'OTP is required' })
        };
      }
      
      const storedOTP = otpStorage[email];
      
      if (!storedOTP) {
        return {
          statusCode: 400,
          body: JSON.stringify({ 
            error: 'OTP not found or expired',
            success: false 
          })
        };
      }
      
      // Check expiry
      if (Date.now() > storedOTP.expiresAt) {
        delete otpStorage[email];
        return {
          statusCode: 400,
          body: JSON.stringify({ 
            error: 'OTP has expired',
            success: false 
          })
        };
      }
      
      // Check verification attempts
      if (!verificationAttempts[email]) {
        verificationAttempts[email] = [];
      }
      
      if (storedOTP.attempts >= MAX_VERIFICATION_ATTEMPTS) {
        delete otpStorage[email];
        return {
          statusCode: 429,
          body: JSON.stringify({ 
            error: 'Maximum verification attempts reached',
            success: false 
          })
        };
      }
      
      // Verify OTP
      if (otp === storedOTP.otp) {
        delete otpStorage[email];
        delete verificationAttempts[email];
        
        return {
          statusCode: 200,
          body: JSON.stringify({ 
            success: true, 
            message: 'OTP verified successfully' 
          })
        };
      } else {
        storedOTP.attempts++;
        const attemptsRemaining = MAX_VERIFICATION_ATTEMPTS - storedOTP.attempts;
        
        return {
          statusCode: 400,
          body: JSON.stringify({ 
            error: 'Invalid OTP',
            attemptsRemaining,
            success: false 
          })
        };
      }
      
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid action. Use "send" or "verify"' })
      };
    }
    
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
};