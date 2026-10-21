import ky from 'ky'

/** Log uploads use this transport without the application's error logging hook. */
export const transport = ky.create({
  prefix: import.meta.env.PROD ? import.meta.env.VITE_SERVER_URL : '/api',
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
  timeout: 10000,
  retry: {
    limit: 3,
    statusCodes: [408, 413, 500, 502, 503, 504],
  },
})
