import { CloudConfig } from '@cloudinary/url-gen'
import { cloudinaryName as cloudName } from '@/constants'

export const cloudinaryConfig = new CloudConfig({ cloudName })
