import { authRequest } from './authRequest'
import { PATH } from './path'

export const uploadProductImage = (
  formData: FormData,
): Promise<{ url: string }> =>
  authRequest
    .post(PATH.cms.productImage, { body: formData })
    .json<{ url: string }>()
