export function enforceMinMax(el: EventTarget & HTMLInputElement) {
  if (Number(el.value) < Number(el.min)) {
    el.value = el.min
  }
  if (Number(el.value) > Number(el.max)) {
    el.value = el.max
  }

  return Number(el.value)
}
