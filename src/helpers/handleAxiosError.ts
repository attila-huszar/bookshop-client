import { AxiosError } from 'axios'

export function handleAxiosError(error: unknown, message: string): Error {
  return new Error(message, {
    cause: error instanceof AxiosError ? error.message : error,
  })
}
