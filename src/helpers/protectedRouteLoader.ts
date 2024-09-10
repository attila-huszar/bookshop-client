import { checkUserLoggedIn } from '@/api/rest'

export const protectedRouteLoader = async () => {
  const uuid: string | null = localStorage.getItem('uuid')
  return uuid && (await checkUserLoggedIn(uuid))
}
