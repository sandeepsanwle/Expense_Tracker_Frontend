import api from './api';

export const getExpenses = async (month, year, groupId) => {
  const params = {};
  if (month) params.month = month;
  if (year) params.year = year;
  if (groupId !== undefined && groupId !== null && groupId !== '') {
    params.groupId = groupId;
  }
  const response = await api.get('/expenses', { params });
  return response.data;
};

export const createExpense = async (title, amount, date, groupId) => {
  const body = { title, amount };
  if (date) body.date = date;
  if (groupId) body.group = groupId;
  const response = await api.post('/expenses', body);
  return response.data;
};

export const updateExpense = async (id, data) => {
  const response = await api.put(`/expenses/${id}`, data);
  return response.data;
};

export const deleteExpense = async (id) => {
  const response = await api.delete(`/expenses/${id}`);
  return response.data;
};

export const getAnalytics = async (year) => {
  const response = await api.get('/expenses/analytics', { params: { year } });
  return response.data;
};
