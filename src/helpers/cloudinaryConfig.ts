import { CloudConfig } from '@cloudinary/url-gen'
import { cloudName } from 'lib'

export const cloudConfig = new CloudConfig({ cloudName })
