// Example: How to integrate AreaAssign into your application

// ============================================
// 1. Import the component in App.jsx
// ============================================

import { AreaAssign } from './features/punchin';

// ============================================
// 2. Add the route to your router configuration
// ============================================

<Routes>
  {/* ... other routes ... */}
  
  {/* Area Assignment - Admin Only */}
  <Route
    path="/area-assign"
    element={
      <ProtectedRoute allowedRoles={['Admin']}>
        <AreaAssign />
      </ProtectedRoute>
    }
  />
  
  {/* ... other routes ... */}
</Routes>

// ============================================
// 3. Add to Menu Configuration (menuConfig.js)
// ============================================

export const MENU_CONFIG = [
  // ... other menu items ...
  
  {
    id: 'area-assign',
    label: 'Area Assignment',
    path: '/area-assign',
    icon: 'fa-map-marked-alt',
    category: 'Settings',
    allowedRoles: ['Admin'],
    description: 'Assign areas to users'
  },
  
  // ... other menu items ...
];

// ============================================
// 4. Add to constants/index.js (optional)
// ============================================

export const ROUTES = {
  // ... other routes ...
  AREA_ASSIGN: '/area-assign',
  // ... other routes ...
};

// ============================================
// 5. Backend API Requirements
// ============================================

/*
  Ensure your backend has these endpoints:
  
  1. GET /get-users/
     Response: { users: [...] }
  
  2. GET /shop-location/firms/
     Response: { firms: [...] }
  
  3. GET /user-areas/:userId/
     Response: { user_id: 1, area_ids: [1, 2, 3] }
  
  4. POST /user-areas/:userId/
     Body: { area_ids: [1, 2, 3] }
     Response: { success: true, message: "..." }
*/

// ============================================
// 6. Update AreaAssign.jsx with real API calls
// ============================================

// In AreaAssign.jsx, uncomment these sections:

// Fetch user's assigned areas
const fetchUserAreas = async (userId) => {
    try {
        setLoading(true);
        const response = await PunchAPI.getUserAreas(userId);
        setSelectedAreas(response.area_ids || []);
    } catch (error) {
        console.error('Error fetching user areas:', error);
        toast.error('Failed to fetch user areas');
    } finally {
        setLoading(false);
    }
};

// Save area assignments
const handleSaveAssignments = async () => {
    if (!selectedUser) {
        toast.error('Please select a user first');
        return;
    }

    try {
        setSaving(true);
        await PunchAPI.updateUserAreas(selectedUser.id, selectedAreas);
        toast.success(`Areas assigned to ${selectedUser.username} successfully`);
    } catch (error) {
        console.error('Error saving area assignments:', error);
        toast.error('Failed to save area assignments');
    } finally {
        setSaving(false);
    }
};

// ============================================
// 7. Test the feature
// ============================================

/*
  Testing checklist:
  
  ✅ Navigate to /area-assign
  ✅ Select a user from the list
  ✅ Search and filter users
  ✅ Select multiple areas
  ✅ Use Select All / Clear All buttons
  ✅ Toggle between grid and list views
  ✅ Save assignments
  ✅ Test on mobile devices
  ✅ Test with different user roles
*/

// ============================================
// 8. Security Considerations
// ============================================

/*
  Backend Security:
  - Verify user is admin before allowing area assignments
  - Validate user_id and area_ids exist
  - Log all assignment changes for audit
  - Prevent unauthorized access to endpoints
  
  Frontend Security:
  - Use ProtectedRoute wrapper
  - Check user role before rendering
  - Validate data before sending to API
  - Handle errors gracefully
*/

// ============================================
// 9. Optional Enhancements
// ============================================

/*
  Future improvements:
  
  1. Add debounce to search inputs:
     import { useDebounce } from '@hooks';
     const debouncedSearchUser = useDebounce(searchUser, 300);
  
  2. Add toast notifications:
     Already implemented with react-toastify
  
  3. Add confirmation dialog before saving:
     <ConfirmModal
       isOpen={showConfirm}
       onConfirm={handleSaveAssignments}
       title="Confirm Assignment"
       message={`Assign ${selectedAreas.length} areas to ${selectedUser?.username}?`}
     />
  
  4. Add area grouping/categories:
     Filter areas by region, type, or custom categories
  
  5. Add assignment history:
     Track and display who assigned what and when
  
  6. Add bulk user assignment:
     Assign same areas to multiple users at once
  
  7. Add export functionality:
     Export assignments to CSV or PDF
*/

// ============================================
// 10. Troubleshooting
// ============================================

/*
  Common Issues:
  
  Issue: Users not loading
  Solution: Check API endpoint and authentication token
  
  Issue: Areas not displaying
  Solution: Verify getFirms() returns correct data structure
  
  Issue: Save not working
  Solution: Uncomment API calls in handleSaveAssignments
  
  Issue: Styles not applied
  Solution: Ensure SCSS file is imported in component
  
  Issue: Mobile layout broken
  Solution: Check breakpoints and responsive utilities
  
  Issue: Search not working
  Solution: Verify filteredUsers and filteredAreas useMemo hooks
*/

export default null; // This file is for documentation only
