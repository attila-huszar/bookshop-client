import ky from 'ky'

export const baseRequest = ky.create({
  prefixUrl: import.meta.env.PROD ? import.meta.env.VITE_SERVER_URL : '/api',
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
  timeout: 5000,
  retry: 3,
})
