export const useLocalStorage = () => {
  const localStore = (key: string): string | null => {
    return JSON.parse(localStorage.getItem(key) as string)
  }

  const setLocalStore = (
    key: string,
    value: string | number | boolean,
  ): void => {
    localStorage.setItem(key, JSON.stringify(value))
  }

  const removeLocalStore = (key: string): void => {
    localStorage.removeItem(key)
  }

  return { localStore, setLocalStore, removeLocalStore }
}
