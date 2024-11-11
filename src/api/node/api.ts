import ky from 'ky'

export const api = ky.create({
  headers: {
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': 'application/json',
  },
  prefixUrl: import.meta.env.VITE_NODE_API_URL,
})
