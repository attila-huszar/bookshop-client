export const generateFilterArray = (
  filterMin: number,
  filterMax: number,
  filterMinInitial: number,
  filterMaxInitial: number,
) => {
  if (filterMin === filterMinInitial && filterMax === filterMaxInitial) {
    return []
  } else if (filterMin === filterMinInitial && filterMax !== filterMaxInitial) {
    return [null, filterMax]
  } else if (filterMin !== filterMinInitial && filterMax === filterMaxInitial) {
    return [filterMin, null]
  } else {
    return [filterMin, filterMax]
  }
}
