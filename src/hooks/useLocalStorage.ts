export const useLocalStorage = () => {
  const getFromLocalStorage = (key: string): string | null => {
    return JSON.parse(localStorage.getItem(key) as string)
  }

  const setToLocalStorage = (
    key: string,
    value: string | number | boolean,
  ): void => {
    localStorage.setItem(key, JSON.stringify(value))
  }

  const removeFromLocalStorage = (key: string): void => {
    localStorage.removeItem(key)
  }

  return {
    getFromLocalStorage,
    setToLocalStorage,
    removeFromLocalStorage,
  }
}
