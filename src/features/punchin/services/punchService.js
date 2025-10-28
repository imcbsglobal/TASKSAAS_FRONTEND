import apiClient from '../../../services/apiClient';

export const PunchAPI = {
    getFirms: async () => {
        try {
            const response = await apiClient.get("/shop-location/firms/");
            return response;
        } catch (error) {
            console.error("Error fetching firms:", error);
            throw error;
        }
    },

    // Area Assignment APIs
    getAreas: async (userId) => {
        try {
            const response = await apiClient.get(`/get-areas/`);
            return response;
        } catch (error) {
            console.error("Error fetching user areas:", error);
            throw error;
        }
    },

    getUserAreas: async (userId) => {
        console.log("GET AREA Service ", userId)
        try {
            const response = await apiClient.get(`/get-user-area`, {
                params: { user_id: userId }
            });
            return response;
        } catch (error) {
            console.error("Error fetching user assigned areas details:", error);
            throw error;
        }
    },

    getUserAreaHistory: async (userId) => {
        try {
            const response = await apiClient.get(`/user-areas/${userId}/history/`);
            return response;
        } catch (error) {
            console.error("Error fetching user area history:", error);
            throw error;
        }
    },

    updateUserAreas: async (userId, areaIds) => {
        console.log("update service :", userId, areaIds)
        try {
            const response = await apiClient.post(`/update-area/`, {
                user_id: userId,
                area_codes: areaIds
            });
            return response;
        } catch (error) {
            console.error("Error updating user areas:", error);
            throw error;
        }
    },

    //post location
    AddShopLocation: async ({ firm_name, latitude, longitude }) => {
        try {
            const response = await apiClient.post("/shop-location/", {
                firm_name,
                latitude,
                longitude
            });
            return response;
        } catch (error) {
            console.error("Error updating shop location:", error);
            throw error;
        }
    },

    LocationTable: async (calendarDates) => {
        try {
            console.log("Srivice date", calendarDates)
            const res = await apiClient.get(`/shop-location/table/?start_date=${calendarDates[0]}&end_date=${calendarDates[1]}`)
            return res
        } catch (error) {
            console.error("Error fetching Location Update Table:", error);
            throw error;
        }
    },

    updateStatus: async (statusData) => {
        try {
            const response = await apiClient.post("/shop-location/status/", statusData);
            return response;
        } catch (error) {
            console.error("Error Updating location status:", error);
            throw error;
        }
    },

    //PUNCHIN Get Cloudinary upload signature
    getUploadSignature: async ({ customerName }) => {
        try {
            const response = await apiClient.get(`/punch-in/cloudinary-signature/?customerName=${encodeURIComponent(customerName)}`)
                ;
            return response.data;
        } catch (error) {
            console.error("Error getting upload signature:", error);
            throw error;
        }
    },

    // Upload image directly to Cloudinary - Production Ready
    uploadImageToCloudinary: async (imageFile, customerName, progressCallback = null) => {
        try {
            // Client-side validation
            const maxFileSize = 5 * 1024 * 1024; // 5MB
            if (imageFile.size > maxFileSize) {
                throw new Error('File size too large. Maximum size is 5MB');
            }

            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedTypes.includes(imageFile.type)) {
                throw new Error('Invalid file type. Only JPG, JPEG, and PNG are allowed.');
            }

            progressCallback?.(10);

            // Get upload signature from backend
            const signatureData = await PunchAPI.getUploadSignature({ customerName });

            // Check API key
            const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
            if (!apiKey) {
                throw new Error('Cloudinary configuration missing');
            }

            progressCallback?.(30);

            // Prepare form data for Cloudinary
            const formData = new FormData();
            formData.append('file', imageFile);
            formData.append('api_key', apiKey);
            formData.append('timestamp', signatureData.timestamp);
            formData.append('signature', signatureData.signature);

            // Add signed parameters
            if (signatureData.folder) formData.append('folder', signatureData.folder);
            if (signatureData.allowed_formats) formData.append('allowed_formats', signatureData.allowed_formats);
            if (signatureData.tags) formData.append('tags', signatureData.tags);
            if (signatureData.public_id) formData.append('public_id', signatureData.public_id);

            progressCallback?.(50);

            // Upload to Cloudinary with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

            const uploadResponse = await fetch(
                `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                    signal: controller.signal
                }
            );

            clearTimeout(timeoutId);
            progressCallback?.(80);

            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                throw new Error(`Upload failed: ${uploadResponse.status}`);
            }

            const result = await uploadResponse.json();
            progressCallback?.(100);

            return {
                success: true,
                url: result.secure_url,
                public_id: result.public_id,
                format: result.format,
                bytes: result.bytes
            };

        } catch (error) {
            progressCallback?.(0);
            if (error.name === 'AbortError') {
                throw new Error('Upload timeout - please try again');
            }
            throw error;
        }
    },

    // Enhanced punch-in with Cloudinary upload
    punchIn: async ({ customerCode, customerName, image, location, onProgress = null }) => {
        try {
            let photoUrl = null;

            // Upload image to Cloudinary if provided
            if (image) {
                const uploadResult = await PunchAPI.uploadImageToCloudinary(image, customerName, onProgress);
                photoUrl = uploadResult.url;
            }

            // Send punch-in data to backend
            const punchData = {
                customerCode,
                latitude: location?.latitude,
                longitude: location?.longitude,
                photo_url: photoUrl
            };

            const response = await apiClient.post("/punch-in/", punchData);

            return {
                success: true,
                data: response.data,
                photo_url: photoUrl
            };

        } catch (error) {
            throw error;
        }
    },

    // Punch-out functionality   
    punchOut: async (punchinId) => {
        try {
            if (!punchinId) {
                throw new Error('Punch ID is required');
            }
            const response = await apiClient.post(`/punch-out/${punchinId}/`);
            return {
                success: true,
                data: response.data || {}
            };
        } catch (error) {
            console.error("Error in punchOut:", error);
            throw new Error('Failed to punch out');
        }
    },

    // Get active punch-ins (not punched out yet)
    getActivePunchIns: async () => {
        try {
            const response = await apiClient.get('punch-status/');
            return {
                success: true,
                data: response.data || []
            };
        } catch (error) {
            console.error("Error Get active punch-ins:", error);
            throw new Error('Failed to check punch-in status');
        }
    },

    // Check current punch-in status (localStorage + API verification)
    checkPunchInStatus: async () => {
        try {
            // Check localStorage first for immediate feedback
            const stored = localStorage.getItem('activePunchIn');
            let localData = null;

            if (stored) {
                try {
                    localData = JSON.parse(stored);
                } catch (e) {
                    localStorage.removeItem('activePunchIn');
                }
            }

            // Verify with backend (source of truth)
            const response = await PunchAPI.getActivePunchIns();
            const activePunch = response.data.find(punch => !punch.punchout_time);

            if (activePunch) {
                // Update localStorage with fresh data
                localStorage.setItem('activePunchIn', JSON.stringify(activePunch));
                return {
                    isActive: true,
                    activePunchIn: activePunch,
                    source: 'api'
                };
            } else if (localData) {
                // Clear stale localStorage data
                localStorage.removeItem('activePunchIn');
            }

            return {
                isActive: false,
                activePunchIn: null,
                source: 'api'
            };
        } catch (error) {
            console.error('Failed to check punch-in status:', error);

            // Fallback to localStorage if API fails
            if (localData) {
                return {
                    isActive: true,
                    activePunchIn: localData,
                    source: 'localStorage'
                };
            }

            return {
                isActive: false,
                activePunchIn: null,
                source: 'fallback'
            };
        }
    },


    // Table punch-in/out records
    getPunchinTable: async (calendarDates) => {
        try {
            const response = await apiClient.get(`punch-in/table?start_date=${calendarDates[0]}&end_date=${calendarDates[1]}`);
            return response;
        } catch (error) {
            console.error("Error fetching punch records:", error);
            throw error;
        }
    },


};