export function passwordEncrypt(password: string): string {
  return password
    .split('')
    .map((char) => (char.charCodeAt(0) + 7).toString(32))
    .join('')
}
