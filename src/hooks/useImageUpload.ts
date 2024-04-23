import { useAppDispatch } from '../hooks'
import { updateUser, uploadImage } from '../store/userSlice'
import { IUpdateUser } from '../interfaces'

export function useImageUpload() {
  const dispatch = useAppDispatch()

  const uploadAndSetImage = async ({ uuid, field, value }: IUpdateUser) => {
    const imageResponse = await dispatch(uploadImage(value as File))

    dispatch(
      updateUser({
        uuid,
        field,
        value: imageResponse.payload.url,
      }),
    )
  }

  return { uploadAndSetImage }
}
