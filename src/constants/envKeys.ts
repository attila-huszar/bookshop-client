export const baseURL = import.meta.env.VITE_BASE_URL
export const apiChoice = import.meta.env.VITE_API_CHOICE
export const elasticPath = import.meta.env.VITE_ELASTIC_PATH
export const jsonServerPath = import.meta.env.VITE_JSON_SERVER_PATH
export const cloudinaryName = import.meta.env.VITE_CLOUDINARY_NAME
export const cloudinaryUpload = `${import.meta.env.VITE_CLOUDINARY_UPLOAD_URL}/${cloudinaryName}/upload`
export const cloudinaryUploadPreset = import.meta.env
  .VITE_CLOUDINARY_UPLOAD_PRESET
export const emailjsKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
export const emailjsService = import.meta.env.VITE_EMAILJS_SERVICE_ID
export const emailjsVerificationTemplate = import.meta.env
  .VITE_EMAILJS_VERIFICATION_TEMPLATE_ID
export const emailjsResetPasswordTemplate = import.meta.env
  .VITE_EMAILJS_RESET_PASSWORD_TEMPLATE_ID
export const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY
export const stripeURL = import.meta.env.VITE_STRIPE_CLOUD_FUNCTION_URL
export const googleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_KEY
