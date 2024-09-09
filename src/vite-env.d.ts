/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_CLOUDINARY_NAME: string
  readonly VITE_CLOUDINARY_UPLOAD_PRESET: string
  readonly VITE_EMAILJS_PUBLIC_KEY: string
  readonly VITE_EMAILJS_SERVICE_ID: string
  readonly VITE_EMAILJS_VERIFICATION_TEMPLATE_ID: string
  readonly VITE_EMAILJS_RESET_PASSWORD_TEMPLATE_ID: string
  readonly VITE_STRIPE_PUBLIC_KEY: string
  readonly VITE_GOOGLE_MAPS_KEY: string
}
