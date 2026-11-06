import { authRequest } from './authRequest'
import { PATH } from './path'

export const uploadProductImage = (formData: FormData) =>
  authRequest
    .post(PATH.cms.productImage, { body: formData })
    .json<{ url: string }>()
