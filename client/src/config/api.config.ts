export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  ENDPOINTS: {
    AUTH: {
      SIGN_IN: '/auth/login',
      SIGN_UP: '/auth/register',
    },
    DASHBOARD: {
      GET_DATA: '/dashboard',
    },
    CUSTOMER: {
      CREATE: '/customers',
      LIST: '/customers',
      SURVEY: '/survey',
    },
  },
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

export const getAuthHeader = (token: string) => ({
  Authorization: `Bearer ${token}`,
}); 