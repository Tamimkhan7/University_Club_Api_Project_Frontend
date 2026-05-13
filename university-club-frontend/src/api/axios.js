import axios from "axios";

// Use port 5000 (matches your backend's http profile)
const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("Response Error:", error);
    
    if (error.code === "ERR_NETWORK") {
      console.error("❌ Cannot connect to backend!");
      if (!window._networkAlertShown) {
        window._networkAlertShown = true;
        alert("Cannot connect to backend. Please make sure backend is running on http://localhost:5000");
        setTimeout(() => { window._networkAlertShown = false; }, 5000);
      }
    }
    //setTimeOut(()=> {window._networkAlertShown = false;}, 5000);
    
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    
    return Promise.reject(error);
  }
);

export default api;