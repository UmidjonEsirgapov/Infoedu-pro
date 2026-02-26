/**
 * Sahifadagi (yoki berilgan konteynerdagi) barcha <img> teglariga
 * dinamik id biriktiradi. In-Image (R-A-18660186-5) bloki ularni
 * renderTo orqali tanishi uchun kerak.
 * SSR/build da document yo'q bo'lganda bo'sh massiv qaytaradi.
 *
 * @param container - Qidirish joyi (berilmasa: document.body, faqat client da)
 * @param prefix - id prefiksi (default: 'yandex_inimage')
 * @returns Id biriktirilgan img elementlari ro'yxati
 */
export function assignDynamicIdsToImages(
  container?: HTMLElement | Document | null,
  prefix = 'yandex_inimage'
): HTMLImageElement[] {
  if (typeof document === 'undefined') return []
  const resolved =
    container instanceof Document ? container.body : container ?? document.body
  if (!resolved) return []
  const root = resolved as HTMLElement
  const images = Array.from(root.querySelectorAll<HTMLImageElement>('img'))
  const usedIds = new Set<string>()

  function uniqueId(): string {
    let id: string
    do {
      id = `${prefix}_${Math.random().toString(36).slice(2, 11)}`
    } while (usedIds.has(id))
    usedIds.add(id)
    return id
  }

  images.forEach((img) => {
    if (!img.id || img.id.startsWith(prefix)) {
      img.id = uniqueId()
    }
  })

  return images
}
