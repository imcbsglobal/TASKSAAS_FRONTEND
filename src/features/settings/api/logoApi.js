const API_URL = "https://tasksas.com/api/settings/logo/";

const getAuthToken = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Auth token not found");
  return token;
};

export const getLogo = async () => {
  const token = getAuthToken();
  const res = await fetch(API_URL, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to load logo");
  return res.json(); // { logo_url: "..." | null }
};

export const uploadLogo = async (file) => {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append("logo", file);

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  // Safely parse — server may return HTML on 500 errors
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(`Server error (${res.status}). Please try a different image format.`);
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to upload logo");
  return data; // { success, message, logo_url }
};
