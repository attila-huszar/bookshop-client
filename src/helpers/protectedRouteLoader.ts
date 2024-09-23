import { apiHandler } from '@/api/apiHandler'

export const protectedRouteLoader = async () => {
  const uuid: string | null = localStorage.getItem('uuid')
  return uuid && (await apiHandler.checkUserLoggedIn(uuid))
}
