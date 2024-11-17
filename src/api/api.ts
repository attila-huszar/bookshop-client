import ky from 'ky'

export const api = ky.create({
  prefixUrl: import.meta.env.VITE_NODE_API_URL,
  headers: {
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': 'application/json',
  },
})

export const authApi = api.extend({
  hooks: {
    beforeRequest: [
      (request) => {
        request.headers.set('Authorization', `Bearer ${'token'}`)
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        if (response.status === 401) {
          await refreshToken()
          return ky(request)
        }
      },
    ],
  },
})

async function refreshToken() {
  await ky.post('/auth/refresh').json()
}
