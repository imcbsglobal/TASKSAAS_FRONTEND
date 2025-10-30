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

    // Punch-in with image upload - Backend handles R2 upload
    punchIn: async ({ customerCode, customerName, image, location, onProgress = null }) => {
        console.log(customerCode, customerName, image, location)
        try {
            // Client-side validation
            if (image) {
                const maxFileSize = 5 * 1024 * 1024; // 5MB
                if (image.size > maxFileSize) {
                    throw new Error('File size too large. Maximum size is 5MB');
                }

                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
                if (!allowedTypes.includes(image.type)) {
                    throw new Error('Invalid file type. Only JPG, JPEG, and PNG are allowed.');
                }
            }

            onProgress?.(20);

            // Prepare FormData to send to backend
            const formData = new FormData();
            formData.append('customerCode', customerCode);
            formData.append('customerName', customerName);
            formData.append('latitude', location?.latitude);
            formData.append('longitude', location?.longitude);
            
            if (image) {
                formData.append('image', image);
            }

            onProgress?.(40);

            // Send everything to backend - backend handles R2 upload
            const response = await apiClient.post("/punch-in/", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress?.(40 + (percentCompleted * 0.6)); // 40% to 100%
                    }
                }
            });

            onProgress?.(100);

            return {
                success: true,
                data: response.data,
                photo_url: response.data.photo_url || null
            };

        } catch (error) {
            onProgress?.(0);
            console.error('Punch-in error:', error);
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