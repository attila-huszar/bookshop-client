import { checkUserLoggedIn } from '../api/fetchData'

export const protectedRouteLoader = async () => {
  const uuid: string | null = JSON.parse(localStorage.getItem('uuid') || 'null')
  return uuid ? await checkUserLoggedIn(uuid) : false
}
