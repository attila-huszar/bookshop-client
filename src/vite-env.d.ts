/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL: URL['href']
  readonly VITE_API_CHOICE: 'NODE' | 'ELASTIC' | 'JSON_SERVER'
  readonly VITE_NODE_API_URL: URL['href']
  readonly VITE_JSON_SERVER_URL: URL['href']
  readonly VITE_JSON_SERVER_PATH: string
  readonly VITE_ELASTIC_URL: URL['href']
  readonly VITE_ELASTIC_PATH: string
  readonly VITE_ELASTIC_API_KEY: string
  readonly VITE_CLOUDINARY_NAME: string
  readonly VITE_CLOUDINARY_UPLOAD_URL: URL['href']
  readonly VITE_CLOUDINARY_API_KEY: string
  readonly VITE_CLOUDINARY_UPLOAD_PRESET: string
  readonly VITE_EMAILJS_PUBLIC_KEY: string
  readonly VITE_EMAILJS_SERVICE_ID: string
  readonly VITE_EMAILJS_VERIFICATION_TEMPLATE_ID: string
  readonly VITE_EMAILJS_RESET_PASSWORD_TEMPLATE_ID: string
  readonly VITE_STRIPE_PUBLIC_KEY: string
  readonly VITE_STRIPE_CLOUD_FUNCTION_URL: URL['href']
  readonly VITE_GOOGLE_MAPS_KEY: string
}
