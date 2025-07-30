import * as Yup from 'yup'

const MAX_FILE_SIZE = 512000
const validFileExtensions = {
  image: ['jpg', 'jpeg', 'gif', 'png', 'svg', 'webp'],
}

export const imageSchema = Yup.mixed()
  .test('is-valid-type', 'Invalid image type', (file) =>
    isValidFileType(file as File, 'image'),
  )
  .test('is-valid-size', 'Max size is 500KB', (file) =>
    isValidFileSize(file as File, MAX_FILE_SIZE),
  )
  .nullable()

function isValidFileType(
  file: File,
  fileType: keyof typeof validFileExtensions,
) {
  if (file instanceof File) {
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    return fileExtension
      ? validFileExtensions[fileType].includes(fileExtension)
      : false
  } else {
    return true
  }
}

function isValidFileSize(file: File, fileSize: number) {
  if (file instanceof File) {
    return file.size <= fileSize
  } else {
    return true
  }
}
