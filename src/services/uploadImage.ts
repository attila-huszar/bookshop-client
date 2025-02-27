import axios from 'axios'
import { toast } from 'react-hot-toast'
import { cloudinaryUpload, cloudinaryUploadPreset } from '@/constants'

export const uploadImage = async (img: File, folder: 'public' | 'avatars') => {
  const formData = new FormData()
  formData.append('upload_preset', cloudinaryUploadPreset)
  formData.append('folder', `/${cloudinaryUploadPreset}/${folder}`)
  formData.append('file', img)

  try {
    const { data }: { data: { url: string } } = await axios.post(
      cloudinaryUpload,
      formData,
    )

    return data
  } catch {
    toast.error("Couldn't upload image, please try again later")
  }
}
