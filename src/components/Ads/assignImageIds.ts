/**
 * Sahifadagi (yoki berilgan konteynerdagi) barcha <img> teglariga
 * dinamik id biriktiradi. In-Image (R-A-18660186-5) bloki ularni
 * renderTo orqali tanishi uchun kerak.
 *
 * @param container - Qidirish joyi (default: document.body)
 * @param prefix - id prefiksi (default: 'yandex_inimage')
 * @returns Id biriktirilgan img elementlari ro'yxati
 */
export function assignDynamicIdsToImages(
  container: HTMLElement | Document = document.body,
  prefix = 'yandex_inimage'
): HTMLImageElement[] {
  const root = container instanceof Document ? container.body : container
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
