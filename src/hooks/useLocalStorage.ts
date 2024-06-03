export const useLocalStorage = () => {
  const getFromLocalStorage = <T>(key: string): T | null => {
    const storedValue = localStorage.getItem(key)

    if (!storedValue) {
      return null
    }

    try {
      return JSON.parse(storedValue) as T
    } catch {
      return storedValue as T
    }
  }

  const setToLocalStorage = <T>(key: string, value: T): void => {
    let stringValue: string

    if (typeof value === 'object' && value !== null) {
      stringValue = JSON.stringify(value)
    } else {
      stringValue = String(value)
    }

    localStorage.setItem(key, stringValue)
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
