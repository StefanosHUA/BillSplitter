import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

// 1. REQUEST INTERCEPTOR: Attaches the token to every outgoing call
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('parea_token');
  
  // If we have a token, we attach it as a Bearer token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// 2. RESPONSE INTERCEPTOR: Handles errors like expired or tampered tokens (401)
axiosClient.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    // 401 Unauthorized means the JWT is invalid, expired, or tampered with
    if (error.response?.status === 401) {
      console.warn("Session invalid or expired. Cleaning up local storage...");
      
      // Wipe the local data so the authService and Dashboard know we're out
      localStorage.removeItem('parea_token');
      localStorage.removeItem('parea_user_id');
      localStorage.removeItem('parea_user');

      /** * Redirect to login with a query parameter. 
       * This allows the Login page to show a specific "Session Expired" alert.
       */
      window.location.href = '/login?expired=true';
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;