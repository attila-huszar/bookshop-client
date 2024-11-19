function getEnvVar(key: string, defaultValue?: string | null): string {
  const importEnv = import.meta.env as Record<string, string>
  const value = importEnv[key]

  if (value === undefined || value === '') {
    if (defaultValue !== undefined) {
      console.warn(
        `Environment variable ${key} is not set. Using default: ${defaultValue}`,
      )

      return defaultValue ?? ''
    }

    throw new Error(`Critical error: Environment variable ${key} is not set.`)
  }

  return value
}

export const baseURL = getEnvVar('VITE_BASE_URL', 'http://localhost:5173')
export const serverUrl = getEnvVar('VITE_SERVER_URL', 'http://localhost:5000')
export const stripeKey = getEnvVar('VITE_STRIPE_PUBLIC_KEY')
export const cloudinaryName = getEnvVar('VITE_CLOUDINARY_NAME', null)
export const cloudinaryUpload = `${getEnvVar('VITE_CLOUDINARY_UPLOAD_URL', 'https://api.cloudinary.com/v1_1')}/${cloudinaryName}/upload`
export const cloudinaryApiKey = getEnvVar('VITE_CLOUDINARY_API_KEY', null)
export const cloudinaryUploadPreset = getEnvVar(
  'VITE_CLOUDINARY_UPLOAD_PRESET',
  'bookshop',
)
export const googleMapsKey = getEnvVar('VITE_GOOGLE_MAPS_KEY', null)
