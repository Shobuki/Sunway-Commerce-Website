// src/utils/axios.js
import axios from "axios";

// Request Interceptor: Inject token ONLY on client
axios.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    try {
      const token = window.localStorage.getItem("token");
      console.log("[AXIOS] token sent:", token);
      if (token) config.headers.Authorization = `Bearer ${token}`;
      const adminId = window.localStorage.getItem("adminId");
      if (adminId) config.headers["x-admin-id"] = adminId;
    } catch (e) {}
  }
  return config;
});

// Response Interceptor: Handle expired session & GLOBAL ERROR POPUP
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined") {
      const code = error.response?.status;
      const backendMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Unknown error";
      // GLOBAL ERROR DISPATCH
      if (code !== 401 && code !== 403) {
        window.dispatchEvent(
          new CustomEvent("global-error", { detail: { message: backendMsg, code } })
        );
      }
      // Custom logic for session expired
      if (code === 401 || code === 403) {
        alert("Session expired or unauthorized. Please login again.");
        try {
          // window.localStorage.clear();
        } catch {}
        // window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axios;
