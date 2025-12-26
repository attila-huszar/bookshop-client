export function splitFullName(fullName: string): {
  firstName: string | null
  lastName: string | null
} {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .map((p) => p.trim())
    .filter(Boolean)

  if (parts.length === 0) {
    return { firstName: null, lastName: null }
  }

  const firstName = parts[0] ?? null
  const lastName = parts.length > 1 ? parts.slice(1).join(' ') : null

  return {
    firstName: firstName && firstName.length >= 2 ? firstName : null,
    lastName: lastName && lastName.length >= 2 ? lastName : null,
  }
}
