import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true, // ✅ Automatically send cookies
  //headers: {"Content-Type": "application/json",},
});

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

API.interceptors.request.use((config) => {
  const publicEndpoints = ['/register/', '/login/', '/token/refresh/', '/services/', '/team/', '/contactus/', '/reviews/'];
  const isPublicEndpoint = publicEndpoints.some(endpoint => 
    config.url.includes(endpoint));
  if (!isPublicEndpoint){
    const accessToken = sessionStorage.getItem("accessToken"); // ✅ Store in sessionStorage (not localStorage)
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  }
  
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(API(originalRequest)); // Retry request after refresh
          });
        });
      }

      isRefreshing = true;

      try {
        const response = await API.post("token/refresh/", null, {
          withCredentials: true
        }); // ✅ No need to send refresh token manually
        const newAccessToken = response.data.access_token;
        sessionStorage.setItem("accessToken", newAccessToken); // ✅ Store access token temporarily
        API.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        isRefreshing = false;
        onRefreshed(newAccessToken);
        return API(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        isRefreshing = false;
        sessionStorage.removeItem("accessToken"); // 🔴 Clear session if refresh fails
        window.location.href = "/login"; // Redirect to login page
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
