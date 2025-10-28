/**
 * Test User Access Levels
 * 
 * Use these functions in the browser console to test different user access scenarios
 * Open browser console (F12) and paste the function you want to test
 */

// Test Admin User (Full Access)
function testAdminUser() {
    const adminUser = {
        id: 1,
        username: "admin_test",
        email: "admin@test.com",
        role: "Admin",
        allowedRoutes: [
            "/dashboard",
            "/item-details",
            "/cash-book",
            "/bank-book",
            "/debtors",
            "/company",
            "/punch-in",
            "/punch-in/location",
            "/master/users",
            "/settings"
        ]
    };
    localStorage.setItem('user', JSON.stringify(adminUser));
    console.log('✅ Admin user set! Reloading page...');
    window.location.reload();
}

// Test Sales Rep (Limited Access)
function testSalesRep() {
    const salesUser = {
        id: 2,
        username: "sales_test",
        email: "sales@test.com",
        role: "Sales Rep",
        allowedRoutes: [
            "/dashboard",
            "/item-details",
            "/debtors",
            "/punch-in",
            "/punch-in/location"
        ]
    };
    localStorage.setItem('user', JSON.stringify(salesUser));
    console.log('✅ Sales Rep user set! Reloading page...');
    window.location.reload();
}

// Test Accountant (Finance Only)
function testAccountant() {
    const accountantUser = {
        id: 3,
        username: "accountant_test",
        email: "accountant@test.com",
        role: "Accountant",
        allowedRoutes: [
            "/dashboard",
            "/cash-book",
            "/bank-book",
            "/debtors"
        ]
    };
    localStorage.setItem('user', JSON.stringify(accountantUser));
    console.log('✅ Accountant user set! Reloading page...');
    window.location.reload();
}

// Test Regular User (Minimal Access)
function testRegularUser() {
    const regularUser = {
        id: 4,
        username: "user_test",
        email: "user@test.com",
        role: "user",
        allowedRoutes: [
            "/dashboard",
            "/punch-in",
            "/punch-in/location"
        ]
    };
    localStorage.setItem('user', JSON.stringify(regularUser));
    console.log('✅ Regular user set! Reloading page...');
    window.location.reload();
}

// Test Custom User with specific routes
function testCustomUser(username, allowedRoutes) {
    const customUser = {
        id: 999,
        username: username || "custom_test",
        email: "custom@test.com",
        role: "Custom",
        allowedRoutes: allowedRoutes || ["/dashboard"]
    };
    localStorage.setItem('user', JSON.stringify(customUser));
    console.log('✅ Custom user set! Reloading page...');
    window.location.reload();
}

// Check current user
function checkCurrentUser() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        console.log('👤 Current User:', user.username);
        console.log('🎭 Role:', user.role);
        console.log('🔑 Allowed Routes:', user.allowedRoutes);
        return user;
    } else {
        console.log('❌ No user found in localStorage');
        return null;
    }
}

// Clear user data
function clearUser() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    console.log('✅ User data cleared!');
    window.location.reload();
}

// Display all available test functions
console.log(`
🧪 User Access Test Functions Available:

1. testAdminUser()       - Test with full admin access
2. testSalesRep()        - Test with sales representative access
3. testAccountant()      - Test with accountant access
4. testRegularUser()     - Test with basic user access
5. testCustomUser(username, [routes]) - Test with custom routes
6. checkCurrentUser()    - Check currently logged in user
7. clearUser()          - Clear user data and logout

Example Usage:
--------------
testAdminUser();
testSalesRep();
checkCurrentUser();
testCustomUser("john", ["/dashboard", "/item-details"]);
`);
