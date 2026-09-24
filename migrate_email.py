import os
import re

files = [
    r'c:\Users\hari1\OneDrive\Desktop\new\AdminHomepage.html',
    r'c:\Users\hari1\OneDrive\Desktop\new\fruitingo_backend\templates\AdminHomepage.html'
]

migration_code = '''
            // Email Migration
            let adminSecurityData = getAdminSecurity();
            let needsUpdate = false;
            
            if (adminSecurityData.recoveryEmail === 'fruitingonaturals@gmail.com') {
                adminSecurityData.recoveryEmail = 'hari12348ahdy@gmail.com';
                needsUpdate = true;
            }
            if (adminSecurityData.adminEmail === 'fruitingonaturals@gmail.com') {
                adminSecurityData.adminEmail = 'hari12348ahdy@gmail.com';
                needsUpdate = true;
            }
            
            if (needsUpdate) {
                adminSecurityData.lastEmailUpdated = new Date().toLocaleString();
                if (!adminSecurityData.loginHistory) adminSecurityData.loginHistory = [];
                adminSecurityData.loginHistory.unshift({
                    date: new Date().toLocaleDateString(),
                    time: new Date().toLocaleTimeString(),
                    action: 'Admin Email Updated',
                    status: 'Success',
                    timestamp: new Date().toLocaleString()
                });
                
                if (adminSecurityData.loginHistory.length > 50) {
                    adminSecurityData.loginHistory = adminSecurityData.loginHistory.slice(0, 50);
                }
                saveAdminSecurity(adminSecurityData);
            }
'''

for filepath in files:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # We look for the DOMContentLoaded event listener where we initialize security
        # Specifically: saveAdminSecurity(adminSecurity); }
        pattern = r'(saveAdminSecurity\(adminSecurity\);\s*\})'
        if 'Email Migration' not in content:
            new_content = re.sub(pattern, r'\1' + migration_code, content, count=1)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filepath}")
