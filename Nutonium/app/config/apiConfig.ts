import { Platform } from 'react-native';

// Get your computer's IP address by running: 
// Mac/Linux: ifconfig | grep "inet " | grep -v 127.0.0.1
// Windows: ipconfig | findstr "IPv4"
const getBaseUrl = () => {
  if (__DEV__) {
    // For development - use your computer's IP address
    const DEV_IP = '192.168.1.4'; // Replace with your actual IP address
    
    // FIXED: Use port 3010 as defined in docker-compose.yml
    const PORT = '3010'; // This matches your docker-compose.yml port mapping
    
    if (Platform.OS === 'android') {
      // For Android emulator, you can also try: '10.0.2.2'
      return `http://${DEV_IP}:${PORT}/api`;
    }
    // For iOS simulator and physical devices
    return `http://${DEV_IP}:${PORT}/api`;
  }
  
  // For production
  return 'https://your-production-api.com/api';
};

const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  ENDPOINTS: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    VERIFY_PHONE: '/auth/verify-phone',
  },
  TIMEOUT: 30000, // 30 seconds
};

export const makeApiCall = async (endpoint: string, method: string = 'GET', body?: any) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  console.log(`Making API call to: ${url}`);
  
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
    console.log('Request body:', body);
  }

  try {
    // Add timeout with AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    
    config.signal = controller.signal;
    
    const response = await fetch(url, config);
    
    clearTimeout(timeoutId);
    console.log(`Response status: ${response.status}`);
    
    const data = await response.json();
    console.log('Response data:', data);
    
    return { 
      success: response.ok, 
      data, 
      status: response.status 
    };
  } catch (error: any) {
    console.error('API call error:', error);
    
    if (error.name === 'AbortError') {
      return { 
        success: false, 
        data: { message: 'Request timeout. Please try again.' },
        status: 0 
      };
    }
    
    return { 
      success: false, 
      data: { 
        message: error.message.includes('Network request failed') 
          ? `Unable to connect to server at ${url}. Please check your network connection and ensure the server is running on port 3010.` 
          : 'Network error. Please check your connection.' 
      },
      status: 0 
    };
  }
};

// Helper function to get the current IP for debugging
export const getCurrentApiUrl = () => API_CONFIG.BASE_URL;

// Debug helper
export const testConnection = async () => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL.replace('/api', '')}/health`);
    const data = await response.json();
    console.log('Health check result:', data);
    return { success: true, data };
  } catch (error: unknown) {
    console.error('Health check failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
};

export default API_CONFIG;