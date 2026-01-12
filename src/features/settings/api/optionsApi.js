const API_URL = "http://127.0.0.1:8000/api/settings/options/";

const getAuthToken = () => {
  // 🔴 CHANGE THIS IF YOUR KEY NAME IS DIFFERENT
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Auth token not found");
  }
  return token;
};

export const getSettingsOptions = async () => {
  const token = getAuthToken();

  const res = await fetch(API_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to load settings options");
  }

  return res.json();
};

export const saveSettingsOptions = async (payload) => {
  const token = getAuthToken();

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to save settings options");
  }

  return res.json();
};
