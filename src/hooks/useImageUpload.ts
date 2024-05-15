import { useAppDispatch } from '../hooks'
import { updateUser, uploadImage } from '../store/userSlice'

export function useImageUpload() {
  const dispatch = useAppDispatch()

  const uploadAndSetImage = async ({
    uuid,
    field,
    value,
  }: {
    uuid: string
    field: string
    value: File
  }) => {
    const imageResponse = await dispatch(uploadImage(value))

    dispatch(
      updateUser({
        uuid,
        fields: {
          [field]: imageResponse.payload.url,
        },
      }),
    )
  }

  return { uploadAndSetImage }
}
