import apiClient from '../../../services/apiClient';

export const SettingsApi = {
    getUsers: async () => {
        try {
            const response = await apiClient.get("/get-users/");
            return response;
        } catch (error) {
            console.error("Error fetching users:", error);
            throw error;
        }
    },

    getUserMenus: async (userId) => {
        try {
            const response = await apiClient.get(`get-user-menus/`,
                {
                    params: { user_id: userId }
                }
            );
            return response;
        } catch (error) {
            console.error("Error fetching user permissions:", error);
            throw error;
        }
    },

    updateUserMenus: async (userId, menuIds) => {
                    console.log("service",userId,menuIds)
        
        try {
            const response = await apiClient.post(`/update-menu/`, {
                "allowedMenuIds": menuIds,
                "user_id": userId
            });
            return response;
        } catch (error) {
            console.error("Error updating user menus:", error);
            throw error;
        }
    }
};