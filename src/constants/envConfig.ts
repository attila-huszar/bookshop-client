export const baseURL = import.meta.env.VITE_BASE_URL

export const cloudinaryName = import.meta.env.VITE_CLOUDINARY_NAME
export const cloudinaryUpload = `${import.meta.env.VITE_CLOUDINARY_UPLOAD_URL}/${cloudinaryName}/upload`
export const cloudinaryUploadPreset = import.meta.env
  .VITE_CLOUDINARY_UPLOAD_PRESET

export const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY
export const googleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_KEY
