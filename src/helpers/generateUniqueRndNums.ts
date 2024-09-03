export function generateUniqueRndNums(count: number, total: number): number[] {
  if (count > total) {
    throw new Error('Count cannot be greater than total amount')
  } else if (count <= 0 || total <= 0) {
    return []
  }

  const uniqueValues = new Set<number>()

  while (uniqueValues.size < count) {
    uniqueValues.add(Math.floor(Math.random() * total) + 1)
  }

  return Array.from(uniqueValues)
}
