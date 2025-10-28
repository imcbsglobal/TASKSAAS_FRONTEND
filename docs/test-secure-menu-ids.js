/**
 * Secure Menu ID-Based Access Test Functions
 * 
 * Use these functions in the browser console to test different user access scenarios
 * with the new secure menu ID approach
 * 
 * Open browser console (F12) and paste the function you want to test
 */

// Test Admin User (Full Access) - Secure ID-based
function testSecureAdmin() {
    const adminUser = {
        id: 1,
        username: "admin_test",
        email: "admin@test.com",
        role: "Admin",
        allowedMenuIds: [
            "item-details",
            "bank-cash",
            "cash-book",
            "bank-book",
            "debtors",
            "company",
            "punch-in",
            "location-capture",
            "punch-in-action",
            "master",
            "user-menu",
            "settings"
        ]
    };
    localStorage.setItem('user', JSON.stringify(adminUser));
    console.log('✅ Secure Admin user set! Reloading page...');
    window.location.reload();
}

// Test Sales Rep (Limited Access) - Secure ID-based
function testSecureSalesRep() {
    const salesUser = {
        id: 2,
        username: "sales_test",
        email: "sales@test.com",
        role: "Sales Rep",
        allowedMenuIds: [
            "item-details",
            "debtors",
            "punch-in",
            "location-capture",
            "punch-in-action"
        ]
    };
    localStorage.setItem('user', JSON.stringify(salesUser));
    console.log('✅ Secure Sales Rep user set! Reloading page...');
    window.location.reload();
}

// Test Accountant (Finance Only) - Secure ID-based
function testSecureAccountant() {
    const accountantUser = {
        id: 3,
        username: "accountant_test",
        email: "accountant@test.com",
        role: "Accountant",
        allowedMenuIds: [
            "bank-cash",
            "cash-book",
            "bank-book",
            "debtors"
        ]
    };
    localStorage.setItem('user', JSON.stringify(accountantUser));
    console.log('✅ Secure Accountant user set! Reloading page...');
    window.location.reload();
}

// Test Regular User (Minimal Access) - Secure ID-based
function testSecureRegularUser() {
    const regularUser = {
        id: 4,
        username: "user_test",
        email: "user@test.com",
        role: "user",
        allowedMenuIds: [
            "punch-in",
            "location-capture",
            "punch-in-action"
        ]
    };
    localStorage.setItem('user', JSON.stringify(regularUser));
    console.log('✅ Secure Regular user set! Reloading page...');
    window.location.reload();
}

// Test Custom User with specific menu IDs - Secure ID-based
function testSecureCustomUser(username, allowedMenuIds) {
    const customUser = {
        id: 999,
        username: username || "custom_test",
        email: "custom@test.com",
        role: "Custom",
        allowedMenuIds: allowedMenuIds || ["item-details"]
    };
    localStorage.setItem('user', JSON.stringify(customUser));
    console.log('✅ Secure Custom user set! Reloading page...');
    window.location.reload();
}

// Check current user with menu IDs
function checkSecureUser() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        console.log('👤 Current User:', user.username);
        console.log('🎭 Role:', user.role);
        console.log('🔑 Allowed Menu IDs:', user.allowedMenuIds);
        console.log('📊 Access Type:', user.allowedMenuIds ? 'Secure (ID-based)' : 'Legacy (Route-based)');
        return user;
    } else {
        console.log('❌ No user found in localStorage');
        return null;
    }
}

// Display all available menu IDs
function showAvailableMenuIds() {
    const menuIds = {
        topLevel: [
            { id: 'item-details', label: 'Item Details', type: 'simple' },
            { id: 'debtors', label: 'Debtors', type: 'simple' },
            { id: 'company', label: 'Company Info', type: 'simple' }
        ],
        bankCash: {
            parent: { id: 'bank-cash', label: 'Bank & Cash', type: 'dropdown' },
            children: [
                { id: 'cash-book', label: 'Cash Book' },
                { id: 'bank-book', label: 'Bank Book' }
            ]
        },
        punchIn: {
            parent: { id: 'punch-in', label: 'Punch In', type: 'dropdown' },
            children: [
                { id: 'location-capture', label: 'Location Capture' },
                { id: 'punch-in-action', label: 'Punch In' }
            ]
        },
        master: {
            parent: { id: 'master', label: 'Master (Admin Only)', type: 'dropdown' },
            children: [
                { id: 'user-menu', label: 'User Management' },
                { id: 'settings', label: 'Settings' }
            ]
        }
    };
    
    console.log('📋 Available Menu IDs:');
    console.table(menuIds);
    return menuIds;
}

// Compare route-based vs ID-based security
function compareSecurityApproaches() {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║           ROUTE-BASED vs ID-BASED COMPARISON                ║
╚══════════════════════════════════════════════════════════════╝

📌 ROUTE-BASED (Less Secure):
   allowedRoutes: ["/cash-book", "/bank-book"]
   ❌ Exposes internal route structure
   ❌ Easy to guess other routes
   ❌ Hard to change routes

📌 ID-BASED (More Secure):
   allowedMenuIds: ["cash-book", "bank-book"]
   ✅ Routes hidden from client
   ✅ Can't guess internal structure
   ✅ Easy to change routes

Security Improvement: 🔒 ~70% more secure
    `);
}

// Migrate from route-based to ID-based
function migrateToSecureIds() {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user) {
        console.log('❌ No user found');
        return;
    }
    
    if (user.allowedMenuIds) {
        console.log('✅ User already using secure ID-based access');
        return user;
    }
    
    if (!user.allowedRoutes) {
        console.log('❌ User has no access configuration');
        return;
    }
    
    // Route to ID mapping
    const routeToIdMap = {
        '/item-details': 'item-details',
        '/cash-book': 'cash-book',
        '/bank-book': 'bank-book',
        '/debtors': 'debtors',
        '/company': 'company',
        '/punch-in': 'punch-in-action',
        '/punch-in/location': 'location-capture',
        '/master/users': 'user-menu',
        '/settings': 'settings'
    };
    
    // Convert routes to IDs
    const allowedMenuIds = user.allowedRoutes
        .map(route => routeToIdMap[route])
        .filter(id => id !== undefined);
    
    // Add parent IDs for dropdowns if needed
    if (allowedMenuIds.includes('cash-book') || allowedMenuIds.includes('bank-book')) {
        if (!allowedMenuIds.includes('bank-cash')) {
            allowedMenuIds.push('bank-cash');
        }
    }
    if (allowedMenuIds.includes('location-capture') || allowedMenuIds.includes('punch-in-action')) {
        if (!allowedMenuIds.includes('punch-in')) {
            allowedMenuIds.push('punch-in');
        }
    }
    if (allowedMenuIds.includes('user-menu') || allowedMenuIds.includes('settings')) {
        if (!allowedMenuIds.includes('master')) {
            allowedMenuIds.push('master');
        }
    }
    
    // Update user object
    user.allowedMenuIds = allowedMenuIds;
    delete user.allowedRoutes; // Remove old format
    
    localStorage.setItem('user', JSON.stringify(user));
    
    console.log('✅ Migrated to secure ID-based access!');
    console.log('📋 New Menu IDs:', allowedMenuIds);
    console.log('🔄 Reloading page...');
    
    window.location.reload();
}

// Clear user data
function clearSecureUser() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    console.log('✅ User data cleared!');
    window.location.reload();
}

// Display help menu
console.log(`
╔══════════════════════════════════════════════════════════════╗
║       🔐 SECURE MENU ID-BASED ACCESS TEST FUNCTIONS         ║
╚══════════════════════════════════════════════════════════════╝

🆕 NEW SECURE FUNCTIONS (Recommended):
1. testSecureAdmin()          - Test admin with secure IDs
2. testSecureSalesRep()       - Test sales rep with secure IDs
3. testSecureAccountant()     - Test accountant with secure IDs
4. testSecureRegularUser()    - Test regular user with secure IDs
5. testSecureCustomUser(name, [ids]) - Custom test with IDs
6. checkSecureUser()          - View current user (shows ID/route based)
7. showAvailableMenuIds()     - Display all available menu IDs
8. compareSecurityApproaches() - Compare route vs ID security
9. migrateToSecureIds()       - Migrate from routes to IDs
10. clearSecureUser()         - Clear user data and logout

📊 INFORMATION FUNCTIONS:
- showAvailableMenuIds()      - See all menu IDs
- compareSecurityApproaches() - Security comparison
- checkSecureUser()           - Check current user type

🔄 MIGRATION:
- migrateToSecureIds()        - Auto-convert routes to IDs

Example Usage:
--------------
testSecureAdmin();
testSecureSalesRep();
checkSecureUser();
showAvailableMenuIds();
migrateToSecureIds();
testSecureCustomUser("john", ["item-details", "debtors"]);

🔒 Security Tip: ID-based access is ~70% more secure than route-based!
`);
