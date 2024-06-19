export function generateUniqueRndNums(count: number, max: number): number[] {
  const uniqueValues = new Set<number>()

  while (uniqueValues.size < count) {
    uniqueValues.add(Math.floor(Math.random() * max) + 1)
  }

  return Array.from(uniqueValues)
}
