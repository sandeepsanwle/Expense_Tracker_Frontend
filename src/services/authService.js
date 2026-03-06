import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const registerUser = async (name, email, password) => {
  const response = await api.post('/auth/register', { name, email, password });
  if (response.data.success) {
    await AsyncStorage.setItem('token', response.data.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.data));
  }
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.success) {
    await AsyncStorage.setItem('token', response.data.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.data));
  }
  return response.data;
};

export const logoutUser = async () => {
  await AsyncStorage.multiRemove(['token', 'user']);
};

export const getStoredUser = async () => {
  const user = await AsyncStorage.getItem('user');
  const token = await AsyncStorage.getItem('token');
  if (user && token) {
    return JSON.parse(user);
  }
  return null;
};
