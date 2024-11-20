import { authRequest } from '@/api'
import { toast } from 'react-hot-toast'
import { cloudinaryUpload, cloudinaryUploadPreset } from '@/constants'

export const uploadImage = async (img: File, folder: 'public' | 'avatars') => {
  const formData = new FormData()
  formData.append('upload_preset', cloudinaryUploadPreset)
  formData.append('folder', `/${cloudinaryUploadPreset}/${folder}`)
  formData.append('file', img)

  try {
    const uploadResponse = await authRequest
      .post(cloudinaryUpload, { body: formData })
      .json<{ url: string }>()

    return uploadResponse
  } catch {
    toast.error("Couldn't upload image, please try again later")
  }
}
