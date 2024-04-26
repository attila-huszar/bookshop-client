import { useAppDispatch } from '../hooks'
import { updateUser, uploadImage } from '../store/userSlice'
import { IUserUpdate } from '../interfaces'

export function useImageUpload() {
  const dispatch = useAppDispatch()

  const uploadAndSetImage = async ({ uuid, field, value }: IUserUpdate) => {
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
