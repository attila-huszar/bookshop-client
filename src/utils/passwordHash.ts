export function passwordEncrypt(password: string): string {
  return password
    .split('')
    .map(function (char) {
      return (char.charCodeAt(0) + 7).toString(32)
    })
    .join('')
}

export function passwordDecrypt(hash: string): string {
  if (!hash) return ''

  const decoded = hash.match(/.{2}/g)!.map(function (value) {
    return parseInt(value, 32) - 7
  })

  return String.fromCharCode(...decoded)
}
