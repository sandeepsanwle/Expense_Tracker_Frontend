import { MONTHS } from './constants';

export const formatCurrency = (amount) => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

export const formatDateShort = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const getCurrentMonth = () => new Date().getMonth() + 1;
export const getCurrentYear = () => new Date().getFullYear();

// Generate year options from 2020 to current year + 1
export const getYearOptions = () => {
  const currentYear = getCurrentYear();
  const years = [];
  for (let y = currentYear + 1; y >= 2020; y--) {
    years.push(y);
  }
  return years;
};

// Group expenses by date for tree view
export const groupExpensesByDate = (expenses) => {
  const grouped = {};
  expenses.forEach((expense) => {
    const date = new Date(expense.date);
    const key = `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
    if (!grouped[key]) {
      grouped[key] = { expenses: [], total: 0 };
    }
    grouped[key].expenses.push(expense);
    grouped[key].total += expense.amount;
  });
  return grouped;
};

// Group expenses by month for tree view
export const groupExpensesByMonth = (expenses) => {
  const grouped = {};
  expenses.forEach((expense) => {
    const date = new Date(expense.date);
    const key = `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
    if (!grouped[key]) {
      grouped[key] = { expenses: [], total: 0 };
    }
    grouped[key].expenses.push(expense);
    grouped[key].total += expense.amount;
  });
  return grouped;
};
