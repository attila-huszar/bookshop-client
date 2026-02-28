import ky from 'ky'

export const baseRequest = ky.create({
  prefixUrl: import.meta.env.PROD ? import.meta.env.VITE_SERVER_URL : '/api',
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
  timeout: 10000,
  retry: {
    limit: 3,
    statusCodes: [408, 413, 500, 502, 503, 504],
  },
})
