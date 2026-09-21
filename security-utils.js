// Security Utilities for Fruitingo Admin
// Password hashing, OTP management, and security functions

class SecurityUtils {
    // Simple hash function for password (in production, use bcrypt or similar)
    static hashPassword(password) {
        // This is a simple hash for demonstration
        // In production, use bcrypt.js or similar library
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return 'hash_' + Math.abs(hash).toString(16);
    }

    // Verify password against hash
    static verifyPassword(password, hash) {
        const inputHash = this.hashPassword(password);
        return inputHash === hash;
    }

    // Generate secure random string
    static generateSecureToken(length = 32) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const randomValues = new Uint32Array(length);
        window.crypto.getRandomValues(randomValues);
        
        for (let i = 0; i < length; i++) {
            result += chars[randomValues[i] % chars.length];
        }
        return result;
    }

    // Generate secure 6-digit OTP
    static generateOTP() {
        const otp = new Uint32Array(1);
        window.crypto.getRandomValues(otp);
        return (otp[0] % 900000 + 100000).toString();
    }

    // Sanitize input to prevent XSS
    static sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    // Validate email format
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate password strength
    static validatePasswordStrength(password) {
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        
        const passed = Object.values(checks).filter(Boolean).length;
        return {
            checks,
            passed,
            isStrong: passed === 5
        };
    }

    // Rate limiting helper
    static createRateLimiter(maxAttempts, windowMs) {
        const attempts = [];
        
        return {
            check() {
                const now = Date.now();
                // Remove attempts outside the time window
                while (attempts.length > 0 && attempts[0] < now - windowMs) {
                    attempts.shift();
                }
                
                if (attempts.length >= maxAttempts) {
                    return false;
                }
                
                attempts.push(now);
                return true;
            },
            
            reset() {
                attempts.length = 0;
            },
            
            getRemainingAttempts() {
                const now = Date.now();
                while (attempts.length > 0 && attempts[0] < now - windowMs) {
                    attempts.shift();
                }
                return maxAttempts - attempts.length;
            }
        };
    }

    // Secure storage wrapper
    static secureStorage = {
        setItem(key, value) {
            try {
                // In production, encrypt the value before storing
                const jsonValue = JSON.stringify(value);
                localStorage.setItem(key, jsonValue);
                return true;
            } catch (error) {
                console.error('Secure storage set error:', error);
                return false;
            }
        },
        
        getItem(key) {
            try {
                const value = localStorage.getItem(key);
                if (!value) return null;
                // In production, decrypt the value after retrieving
                return JSON.parse(value);
            } catch (error) {
                console.error('Secure storage get error:', error);
                return null;
            }
        },
        
        removeItem(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Secure storage remove error:', error);
                return false;
            }
        },
        
        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.error('Secure storage clear error:', error);
                return false;
            }
        }
    };

    // OTP storage with automatic cleanup
    static otpStorage = {
        store: {},
        
        set(email, otp, expiryMinutes = 5) {
            const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
            this.store[email] = {
                otp,
                createdAt: new Date(),
                expiresAt,
                attempts: 0,
                verified: false
            };
        },
        
        get(email) {
            return this.store[email];
        },
        
        verify(email, enteredOTP) {
            const stored = this.store[email];
            
            if (!stored) {
                return { success: false, error: 'OTP not found' };
            }
            
            // Check expiry
            if (Date.now() > stored.expiresAt.getTime()) {
                delete this.store[email];
                return { success: false, error: 'OTP expired' };
            }
            
            // Check attempts
            if (stored.attempts >= 5) {
                delete this.store[email];
                return { success: false, error: 'Maximum attempts reached' };
            }
            
            // Verify OTP
            if (enteredOTP === stored.otp) {
                stored.verified = true;
                delete this.store[email];
                return { success: true };
            } else {
                stored.attempts++;
                return { 
                    success: false, 
                    error: 'Invalid OTP',
                    attemptsRemaining: 5 - stored.attempts
                };
            }
        },
        
        remove(email) {
            delete this.store[email];
        },
        
        cleanupExpired() {
            const now = Date.now();
            for (const email in this.store) {
                if (now > this.store[email].expiresAt.getTime()) {
                    delete this.store[email];
                }
            }
        }
    };
}

// Initialize OTP cleanup interval
setInterval(() => {
    SecurityUtils.otpStorage.cleanupExpired();
}, 60 * 1000); // Every minute

// Make available globally
window.SecurityUtils = SecurityUtils;
