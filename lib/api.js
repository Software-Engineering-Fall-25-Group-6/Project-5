// lib/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '',           // same origin
  timeout: 10000,
  headers: { Accept: 'application/json' }
});

// Make errors look like your previous FetchModel rejects
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status ?? 0;
    const statusText = err?.response?.statusText ?? err?.message ?? 'Network error';
    return Promise.reject({ status, statusText });
  }
);

export default api;

