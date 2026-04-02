import api from './api';

export const getGroups = async () => {
  const response = await api.get('/groups');
  return response.data;
};

export const createGroup = async (name, budget = 0) => {
  const response = await api.post('/groups', { name, budget });
  return response.data;
};

export const updateGroup = async (id, data) => {
  const response = await api.put(`/groups/${id}`, data);
  return response.data;
};

export const deleteGroup = async (id) => {
  const response = await api.delete(`/groups/${id}`);
  return response.data;
};
