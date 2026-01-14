import { log } from '@/libs'

function getEnvVar(key: string, defaultValue?: string | null): string {
  const importEnv = import.meta.env as Record<string, string>
  const value = importEnv[key]

  if (value === undefined || value === '') {
    if (defaultValue !== undefined) {
      void log.warning(
        `Environment variable ${key} is not set. Using default: ${defaultValue}`,
      )

      return defaultValue ?? ''
    }

    throw new Error(`Critical error: Environment variable ${key} is not set.`)
  }

  return value
}

export const baseURL = getEnvVar('VITE_BASE_URL')
export const serverUrl = getEnvVar('VITE_SERVER_URL')
export const stripeKey = getEnvVar('VITE_STRIPE_PUBLIC_KEY')
export const googleMapsKey = getEnvVar('VITE_GOOGLE_MAPS_KEY', null)
export const logbullHost = getEnvVar('VITE_LOGBULL_HOST')
export const logbullProjectId = getEnvVar('VITE_LOGBULL_PROJECT_ID', '')
export const logbullApiKey = getEnvVar('VITE_LOGBULL_API_KEY', '')
