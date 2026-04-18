const API_URL = "https://tasksas.com/api/settings/bank-qr/";

const getAuthToken = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Auth token not found");
  return token;
};

export const getBankQr = async () => {
  const token = getAuthToken();
  const res = await fetch(API_URL, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to load bank QR");
  return res.json(); // { bank_qr_url: "..." | null }
};

export const uploadBankQr = async (file) => {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append("bank_qr", file);

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
  if (!res.ok) throw new Error(data.error || "Failed to upload bank QR");
  return data; // { success, message, bank_qr_url }
};
