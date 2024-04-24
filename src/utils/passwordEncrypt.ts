export function passwordEncrypt(password: string): string {
  return password
    .split('')
    .map(function (char) {
      return (char.charCodeAt(0) + 7).toString(32)
    })
    .join('')
}
