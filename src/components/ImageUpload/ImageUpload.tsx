import { useEffect, useRef } from 'react'

export const ImageUpload = () => {
  const cloudinaryRef = useRef<any>()
  const widgetRef = useRef<any>()

  useEffect(() => {
    cloudinaryRef.current = window.cloudinary
    widgetRef.current = cloudinaryRef.current!.createUploadWidget(
      {
        cloudName: 'dckztkoyx',
        uploadPreset: 'bookstore',
      },
      (error, result) => {
        console.log(error, result)
      },
    )
  }, [])

  return (
    <div>
      <button onClick={() => widgetRef.current!.open()}>Upload</button>
    </div>
  )
}
