// Web-compatible AsyncStorage shim using localStorage
const AsyncStorage = {
  getItem: async (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // quota exceeded or private browsing
    }
  },
  removeItem: async (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      // ignore
    }
  },
  multiRemove: async (keys) => {
    try {
      keys.forEach((key) => localStorage.removeItem(key));
    } catch (e) {
      // ignore
    }
  },
  clear: async () => {
    try {
      localStorage.clear();
    } catch (e) {
      // ignore
    }
  },
  getAllKeys: async () => {
    try {
      return Object.keys(localStorage);
    } catch (e) {
      return [];
    }
  },
};

export default AsyncStorage;
