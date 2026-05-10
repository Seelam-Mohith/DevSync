import axios from "axios";

// Determine API base URL
const apiBaseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

console.log("[API] Initializing axios client", {
  baseURL: apiBaseURL,
  timeout: 10000,
  withCredentials: true,
});

const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 10000,
  withCredentials: true, // CRITICAL: Allow cookies with requests
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let onUnauthorized = null;

export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

// Request interceptor: Add token and log requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("devsync_token");
    const fullURL = `${config.baseURL}${config.url}`;

    // Add authorization token if available
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("[API] → REQUEST", {
      method: config.method.toUpperCase(),
      url: fullURL,
      hasToken: !!token,
      hasBody: !!Object.keys(config.data || {}).length,
    });

    return config;
  },
  (error) => {
    console.error("[API] ✗ Request Error:", error.message);
    return Promise.reject(error);
  }
);

// Response interceptor: Handle responses and errors
api.interceptors.response.use(
  (response) => {
    console.log("[API] ← RESPONSE (Success)", {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      dataKeys: Object.keys(response.data || {}).slice(0, 3),
    });
    return response;
  },
  (error) => {
    // Network error (no response from server)
    if (!error.response) {
      console.error("[API] ✗ NETWORK ERROR:", {
        message: error.message,
        baseURL: error.config?.baseURL,
        url: error.config?.url,
        code: error.code,
      });
      console.error("[API] Network Error Possible Causes:");
      console.error("  1. Backend server not running (npm run dev in /server)");
      console.error("  2. Backend on wrong port (should be 5000)");
      console.error("  3. CORS misconfigured on backend");
      console.error("  4. Frontend API base URL incorrect");
      return Promise.reject(error);
    }

    const status = error.response.status;
    const data = error.response.data;
    const message = data?.message || error.message;

    console.error("[API] ← RESPONSE (Error)", {
      status,
      statusText: error.response.statusText,
      message,
      url: error.config.url,
    });

    // Handle specific status codes
    if (status === 401) {
      console.warn("[API] Unauthorized (401) - Token invalid or expired");
      if (onUnauthorized) {
        onUnauthorized();
      }
    }

    if (status === 400) {
      console.warn("[API] Bad request (400) - Check request payload");
    }

    if (status === 404) {
      console.error("[API] Not found (404) - Endpoint does not exist");
    }

    if (status === 500) {
      console.error("[API] Server error (500) - Backend issue");
    }

    return Promise.reject(error);
  }
);

export default api;
