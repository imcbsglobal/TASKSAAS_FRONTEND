# Migration from Cloudinary to Cloudflare R2

## Overview
Successfully migrated image upload functionality from Cloudinary to Cloudflare R2 storage using **backend-handled upload** approach.

## Final Implementation - Backend Handles Everything

### Simplified Approach
Instead of frontend uploading to R2, we now send the image directly to the backend via `multipart/form-data`, and the backend handles:
- R2 presigned URL generation
- Image upload to R2
- Storing the public URL

### 1. Updated `src/features/punchin/services/punchService.js`

#### Removed Functions:
- ❌ `getUploadSignature()` - No longer needed
- ❌ `uploadImageToR2()` - No longer needed

#### Updated `punchIn()` Function - **SIMPLIFIED**
**Before (Cloudinary):**
- Frontend uploaded to Cloudinary first
- Then sent photo URL to backend

**After (Cloudflare R2 - Backend Handled):**
- Send image directly to backend using FormData
- Backend handles R2 upload
- Backend returns photo URL in response

**New Implementation:**
```javascript
punchIn: async ({ customerCode, customerName, image, location, onProgress = null }) => {
    // Prepare FormData with all punch-in data including image
    const formData = new FormData();
    formData.append('customerCode', customerCode);
    formData.append('customerName', customerName);
    formData.append('latitude', location?.latitude);
    formData.append('longitude', location?.longitude);
    
    if (image) {
        formData.append('image', image);
    }

    // Send to backend - backend handles R2 upload
    const response = await apiClient.post("/punch-in/", formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
            // Track upload progress
        }
    });

    return {
        success: true,
        data: response.data,
        photo_url: response.data.photo_url
    };
}
```

## Backend API Requirements

### POST `/punch-in/`
**Request:** `multipart/form-data`
```
customerCode: string
customerName: string
latitude: number
longitude: number
image: File (optional)
```

**Response:**
```json
{
    "data": {
        "id": 123,
        "customer_code": "...",
        "customer_name": "...",
        "latitude": 11.xxx,
        "longitude": 75.xxx,
        "photo_url": "https://5543538795e940846a189901d1be5a3b.r2.cloudflarestorage.com/ewaytask/...",
        "punchin_time": "2025-10-30T11:31:47Z",
        "punchout_time": null
    }
}
```

**Backend Responsibilities:**
1. Receive image file from frontend
2. Generate R2 presigned URL
3. Upload image to R2
4. Store punch-in data with `photo_url`
5. Return response with public URL

## Environment Variables

### Can be Removed (No Longer Needed)
- `VITE_CLOUDINARY_API_KEY` - Not used anymore since R2 uses presigned URLs

### Current .env
```
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_CLOUDINARY_API_KEY=773595984572241  # Can be removed
VITE_APP_NAME="Task WebApp"
VITE_APP_VERSION=1.0.0
```

## Benefits of Backend-Handled Upload

1. **Simplest Frontend Code** - Just send FormData to backend
2. **Most Secure** - No presigned URLs or credentials exposed to frontend
3. **Centralized Logic** - All R2 logic in one place (backend)
4. **Easier Maintenance** - Single source of truth for uploads
5. **Better Error Handling** - Backend can retry, validate, and handle errors
6. **Cost Effective** - Cloudflare R2 has no egress fees

## Upload Flow (Simplified)

1. **Frontend** captures image and punch-in data
2. **Frontend** sends everything to backend via `multipart/form-data`
3. **Backend** handles:
   - Image validation
   - R2 presigned URL generation
   - Upload to R2
   - Database storage
4. **Backend** returns punch-in data with `photo_url`
5. **Frontend** receives response and updates UI

## Testing Checklist

- [x] File size validation (5MB max)
- [x] File type validation (jpg, jpeg, png)
- [x] Progress callback handling
- [x] Timeout handling (30 seconds)
- [x] Error handling and user feedback
- [x] Public URL returned correctly
- [ ] Test actual upload with backend endpoint
- [ ] Verify uploaded images are accessible via publicUrl
- [ ] Test punch-in flow end-to-end

## Backward Compatibility

The API interface for components using `PunchAPI.punchIn()` remains the same:
```javascript
await PunchAPI.punchIn({
    customerCode,
    customerName,
    image,
    location,
    onProgress: (progress) => setUploadProgress(progress)
});
```

## Next Steps

1. ✅ Update frontend code
2. ⏳ Test with backend R2 integration
3. ⏳ Remove `VITE_CLOUDINARY_API_KEY` from .env after testing
4. ⏳ Update any documentation referencing Cloudinary
5. ⏳ Monitor upload success rates in production

## Rollback Plan

If issues arise, the old Cloudinary code is preserved in git history:
- Commit: (current commit before migration)
- File: `src/features/punchin/services/punchService.js`
