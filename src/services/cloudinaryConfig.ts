import { CloudConfig } from '@cloudinary/url-gen'
import { cloudinaryName as cloudName } from './configKeys'

export const cloudinaryConfig = new CloudConfig({ cloudName })
