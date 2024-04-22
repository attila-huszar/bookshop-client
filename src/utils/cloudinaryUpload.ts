import { Cloudinary } from '@cloudinary/url-gen'

const cld = new Cloudinary({
  cloud: {
    cloudName: 'dckztkoyx',
    apiKey: '435266956861432',
  },
})

export const cldImg = cld.image('avatar')

const cloudName = import.meta.env.VITE_CLOUD_NAME
const unsignedUploadPreset = import.meta.env.VITE_UNSIGNED_UPLOAD_PRESET

function uploadFile(file) {
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`
  const fd = new FormData()
  fd.append('upload_preset', unsignedUploadPreset)
  fd.append('tags', 'browser_upload')
  fd.append('file', file)

  fetch(url, {
    method: 'POST',
    body: fd,
  })
    .then((response) => response.json())
    .then((data) => {
      const urlRes = data.secure_url
      // Create a thumbnail of the uploaded image, with 150px width
      const tokens = urlRes.split('/')
      tokens.splice(-3, 0, 'w_150,c_scale')
      const img = new Image()
      img.src = tokens.join('/')
      img.alt = data.public_id
      return img
    })
    .catch((error) => {
      console.error('Error uploading the file:', error)
    })
}
