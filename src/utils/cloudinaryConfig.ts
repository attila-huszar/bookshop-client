import { CloudConfig } from '@cloudinary/url-gen'
import { cloudName } from '../lib/envVariables'

export const cloudConfig = new CloudConfig({ cloudName })
