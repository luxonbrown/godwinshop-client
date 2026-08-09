import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true
});

let onUnauthorized = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

client.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      if (onUnauthorized) onUnauthorized();
    }
    const message =
      error.response?.data?.message ||
      (error.code === 'ERR_NETWORK'
        ? 'Cannot reach the server. Make sure the backend is running.'
        : 'Something went wrong. Please try again.');
    const code = error.response?.data?.code;
    const errors = error.response?.data?.errors;
    return Promise.reject({ message, code, errors, status });
  }
);

export default client;