import { API_BASE_URL } from "../../../services/apiClient";

export const clearTableAction = async (action) => {
    const token = localStorage.getItem("token"); // Correctly retrieve token

    if (!token) throw new Error("No token found. Please log in again.");

    const response = await fetch(`${API_BASE_URL}/settings/developer-options/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to execute action");
    }

    return data;
};
