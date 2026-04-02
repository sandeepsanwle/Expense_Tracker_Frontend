import { Platform } from 'react-native';

//render api url
// const API_URLS = {
//   web: 'https://expense-tracker-backend-1a3f.onrender.com/api',
//   android: 'https://expense-tracker-backend-1a3f.onrender.com/api',
//   ios: 'https://expense-tracker-backend-1a3f.onrender.com/api',
// };

//railway api 
// const API_URL = 'https://expensetrackerbackend-production-2480.up.railway.app/api'

//localhost api
const API_URL = 'http://localhost:5000/api'

export const BASE_URL = API_URL;

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const COLORS = {
  primary: '#6C63FF',
  primaryLight: '#A29BFE',
  primaryDark: '#5A52D5',
  secondary: '#00B894',
  accent: '#FD79A8',
  background: '#F8F9FE',
  surface: '#FFFFFF',
  text: '#2D3436',
  textSecondary: '#636E72',
  border: '#E8E8E8',
  error: '#E74C3C',
  success: '#00B894',
  warning: '#FDCB6E',
  cardGradient1: '#6C63FF',
  cardGradient2: '#A29BFE',
};
