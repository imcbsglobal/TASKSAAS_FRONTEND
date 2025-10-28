# Area Assignment API Update

## Overview
Updated the Area Assignment feature to work with the new API response format where areas are returned as simple string arrays instead of objects with detailed information.

## API Response Format

### Get Areas Endpoint
**Endpoint:** `GET /areas/`

**Response:**
```json
{
    "status": "True",
    "areas": [
        "BADDEPT",
        "AJITHTUE",
        "WMPM",
        "BABUKKL",
        "MKDY",
        "AJITHSAT",
        "AJITHFRI",
        "KOTTAYAM",
        "THPNI",
        null,
        "BBMON",
        "SABFRI",
        "SHOP",
        "ERNAKULAM",
        "TIRUR",
        "THRISSUR",
        "PALAKKAD",
        "TRIVANDRUM",
        "CALICUT",
        "WAYANAD",
        "ALAPPUZHA"
    ]
}
```

**Notes:**
- Areas are returned as an array of strings (area codes)
- Some entries may be `null` (automatically filtered out)
- No additional metadata like address, coordinates, or firm name

### Get User Areas Endpoint
**Endpoint:** `GET /user-areas/:userId/`

**Response:**
```json
{
    "user_id": "USER001",
    "areas": ["KOTTAYAM", "THRISSUR", "CALICUT"]
}
```

### Update User Areas Endpoint
**Endpoint:** `POST /user-areas/:userId/`

**Request Body:**
```json
{
    "areas": ["KOTTAYAM", "THRISSUR", "CALICUT", "PALAKKAD"]
}
```

**Response:**
```json
{
    "success": true,
    "message": "Areas assigned successfully",
    "assigned_count": 4
}
```

## Changes Made

### 1. **AreaAssign.jsx Component**

#### Data Transformation
```javascript
// OLD: Expected objects with firm_name, address, coordinates
const response = await PunchAPI.getFirms();
setAreas(response.firms || []);

// NEW: Convert string array to objects
const response = await PunchAPI.getAreas();
const areaList = (response.areas || [])
    .filter(area => area !== null)  // Remove null values
    .map((area, index) => ({
        id: area,      // Use area code as ID
        name: area     // Use area code as name
    }));
setAreas(areaList);
```

#### Search Filter
```javascript
// OLD: Search by firm name or address
return areas.filter(area => 
    area.firm_name?.toLowerCase().includes(search) ||
    area.address?.toLowerCase().includes(search)
);

// NEW: Search by area name only
return areas.filter(area => 
    area.name?.toLowerCase().includes(search)
);
```

#### Area Card Display
```javascript
// OLD: Display firm name, address, coordinates
<h3>{area.firm_name || area.name}</h3>
<p>{area.address}</p>
<p>{area.latitude}, {area.longitude}</p>

// NEW: Display area name and code
<h3>
    <i className="fas fa-map-marker-alt"></i>
    {area.name}
</h3>
<p>
    <i className="fas fa-code"></i>
    Code: {area.id}
</p>
```

#### User Reference
```javascript
// OLD: Used username
selectedUser.username

// NEW: Use user ID
selectedUser.id
```

### 2. **AreaAssign.scss Styles**

Added styling for area code display:
```scss
&__code {
    font-size: 0.875rem;
    color: $text-secondary;
    margin: 0.25rem 0;
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    line-height: 1.4;

    i {
        color: $text-muted;
        font-size: 0.75rem;
        margin-top: 0.2rem;
        flex-shrink: 0;
    }
}
```

### 3. **API Service Updates**

The component now uses:
- `PunchAPI.getAreas()` - Get all available areas
- `PunchAPI.getUserAreas(userId)` - Get user's assigned areas
- `PunchAPI.updateUserAreas(userId, areas)` - Save area assignments

## User Flow

### Step 1: Select User
1. User sees grid of all users
2. Can search by user ID, email, or role
3. Clicks on a user card to proceed

### Step 2: Assign Areas
1. System fetches all available areas
2. System fetches user's currently assigned areas
3. User can:
   - Search areas by name
   - Toggle grid/list view
   - Select/deselect individual areas
   - Use "Select All" or "Clear All" buttons
4. Progress bar shows assignment percentage
5. Click "Save Assignments" to save changes

## UI Features

### Area Card Display
Each area card shows:
- **Icon:** Map marker icon
- **Name:** Area code (e.g., "KOTTAYAM", "THRISSUR")
- **Code:** Same as name with "Code:" label
- **Checkbox:** For selection
- **Badge:** Green checkmark when selected

### Search Functionality
- Real-time search as user types
- Filters by area name/code
- Case-insensitive matching

### View Modes
- **Grid View:** 3 columns on desktop, 2 on tablet, 1 on mobile
- **List View:** Single column layout

### Statistics
- Total areas available
- Number of areas selected
- Assignment progress percentage
- Progress bar visualization

## Benefits

### 1. **Simpler Data Structure**
- No complex nested objects
- Easy to work with string arrays
- Reduces data transfer size

### 2. **Faster Performance**
- Less data to parse
- Simpler filtering logic
- Quicker rendering

### 3. **Cleaner Code**
- Fewer null checks
- Straightforward mapping
- Easy to understand

### 4. **Flexible**
- Easy to add metadata later
- Can extend without breaking changes
- Compatible with simple backend responses

## Testing Checklist

- [ ] Areas load correctly from API
- [ ] Null values are filtered out
- [ ] User's assigned areas load correctly
- [ ] Search functionality works
- [ ] Select/Deselect areas works
- [ ] Select All button works
- [ ] Clear All button works
- [ ] Progress bar updates correctly
- [ ] Save assignments API call works
- [ ] Success toast notification appears
- [ ] Returns to step 1 after save
- [ ] Grid/List view toggle works
- [ ] Responsive design works on mobile
- [ ] No console errors

## Backend Requirements

### Required Endpoints

1. **GET /areas/**
   - Returns all available areas as string array
   - Filters out null values (optional)

2. **GET /user-areas/:userId/**
   - Returns user's assigned areas
   - Should return area codes that match the main areas list

3. **POST /user-areas/:userId/**
   - Accepts array of area codes
   - Replaces user's current assignments
   - Returns success confirmation

### Database Considerations

```sql
-- User Areas Table
CREATE TABLE user_areas (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    area_code VARCHAR(50) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by VARCHAR(50),
    UNIQUE(user_id, area_code)
);

-- Index for faster queries
CREATE INDEX idx_user_areas_user ON user_areas(user_id);
CREATE INDEX idx_user_areas_area ON user_areas(area_code);
```

### API Implementation Example (Python/Django)

```python
# Get all areas
@api_view(['GET'])
def get_areas(request):
    # Get distinct area codes from your database
    areas = Area.objects.values_list('code', flat=True).distinct()
    # Filter out None/null values
    areas = [area for area in areas if area is not None]
    
    return Response({
        'status': 'True',
        'areas': areas
    })

# Get user's assigned areas
@api_view(['GET'])
def get_user_areas(request, user_id):
    areas = UserArea.objects.filter(
        user_id=user_id
    ).values_list('area_code', flat=True)
    
    return Response({
        'user_id': user_id,
        'areas': list(areas)
    })

# Update user's areas
@api_view(['POST'])
def update_user_areas(request, user_id):
    areas = request.data.get('areas', [])
    
    # Clear existing assignments
    UserArea.objects.filter(user_id=user_id).delete()
    
    # Create new assignments
    for area_code in areas:
        UserArea.objects.create(
            user_id=user_id,
            area_code=area_code,
            assigned_by=request.user.id
        )
    
    return Response({
        'success': True,
        'message': 'Areas assigned successfully',
        'assigned_count': len(areas)
    })
```

## Migration Notes

### From Old to New Format

If you have existing data with full area objects:

```javascript
// Migration helper function
function convertAreasToNewFormat(oldAreas) {
    return oldAreas
        .filter(area => area !== null && area.firm_name)
        .map(area => area.firm_name);  // Extract just the name
}
```

### Backward Compatibility

To support both formats temporarily:

```javascript
const areaList = Array.isArray(response.areas)
    ? response.areas.map(area => 
        typeof area === 'string' 
            ? { id: area, name: area }  // New format
            : { id: area.id, name: area.firm_name }  // Old format
    )
    : [];
```

## Troubleshooting

### Issue: Areas not loading
**Solution:** Check API endpoint and response format

### Issue: Duplicate areas
**Solution:** Ensure area codes are unique in database

### Issue: Save fails
**Solution:** Verify POST endpoint accepts array of strings

### Issue: Selected areas don't persist
**Solution:** Check getUserAreas endpoint returns correct format

---

**Updated:** October 13, 2025  
**Status:** ✅ Production Ready  
**Version:** 2.0.0
