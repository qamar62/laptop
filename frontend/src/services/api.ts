import axios from 'axios';

// Create an axios instance with default config
// Extract just the domain part (without any paths)
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ? 
  process.env.NEXT_PUBLIC_API_URL.replace(/(\/api\/v1|\/api).*$/, '') : '';

const api = axios.create({
  baseURL: apiBaseUrl ? `${apiBaseUrl}/api/v1` : '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the JWT token to requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Only attach Authorization header if token exists
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If there's no response, just reject the promise
    if (!error.response) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    
    // If the error is 401 and we haven't retried yet and we have a refresh token
    if (error.response.status === 401 && !originalRequest._retry) {
      // Check if we have a refresh token before attempting to refresh
      const refreshToken = localStorage.getItem('refreshToken');
      
      // Only attempt to refresh if we have a refresh token
      if (refreshToken) {
        originalRequest._retry = true;
        
        try {
          const response = await axios.post(`${apiBaseUrl}/api/v1/users/token/refresh/`, {
            refresh: refreshToken,
          });
          
          // Save the new token
          const { access } = response.data as { access: string };
          localStorage.setItem('token', access);
          
          // Update the failed request with the new token and retry
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access}`;
          }
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh fails, clear tokens but don't force redirect
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          // Don't redirect automatically - let the component handle auth state
          return Promise.reject(refreshError);
        }
      }
    }
    
    // For all other errors, just reject the promise
    return Promise.reject(error);
  }
);

export default api;
