const serializeValue = <T>(value: T): string => {
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value)
  }
  return String(value)
}

const deserializeValue = <T>(storedValue: string): T | null => {
  if (!storedValue) {
    return null
  }

  try {
    return JSON.parse(storedValue) as T
  } catch {
    return storedValue as T
  }
}

const createStorageAdapter = (storage: Storage) => ({
  get: <T>(key: string): T | null => {
    const storedValue = storage.getItem(key)
    return deserializeValue<T>(storedValue ?? '')
  },
  set: <T>(key: string, value: T): void => {
    storage.setItem(key, serializeValue(value))
  },
  remove: (key: string): void => {
    storage.removeItem(key)
  },
})

export const localStorageAdapter = createStorageAdapter(localStorage)
export const sessionStorageAdapter = createStorageAdapter(sessionStorage)
