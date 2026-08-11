import axios from 'axios';

// Desktop (Electron) builds can't use the Vite dev proxy, so they fall back to
// the production API over HTTPS. The web keeps its existing VITE_API_URL || '/api'
// behaviour unchanged.
const isDesktop = typeof window !== 'undefined' && !!window.godwinshopDesktop?.isDesktop;
const baseURL = isDesktop
  ? import.meta.env.VITE_API_URL || 'https://godwinshop-api.onrender.com/api'
  : import.meta.env.VITE_API_URL || '/api';

const client = axios.create({
  baseURL,
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