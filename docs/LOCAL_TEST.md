# Localda test qilish (Vercel limitdan qochish)

## 1. .env sozlash

Loyiha ildizida `.env` fayl bor bo‘lishi kerak (`.env.example` dan nusxa olib to‘ldiring):

- `NEXT_PUBLIC_WORDPRESS_URL` — WordPress/GraphQL manzili (masalan `https://infoedu.trafik.uz`)
- `FAUST_SECRET_KEY` — Faust plugin secret
- `NEXT_PUBLIC_URL` — local uchun `http://localhost:3000` qo‘yishingiz mumkin

## 2. Tez test (dev server)

Maqolalar, reklama, dark mode va boshqa sahifalarni brauzerda tekshirish uchun:

```bash
npm run dev
```

- Birinchi marta `npm run generate` va `faust dev` ishlaydi, bir oz vaqt oladi.
- Brauzerda: **http://localhost:3000**
- Biror maqola: **http://localhost:3000/post-slug/** (WordPress’dagi haqiqiy slug).
- Post ichidagi reklama va Console’dagi `[InlinePostAd]` logini shu rejimda ko‘rasiz.

## 3. Productionga o‘xshash test (build + start)

Deploy’dan oldin build xatosiz bo‘lishini tekshirish:

```bash
npm run build
npm run start
```

- Keyin **http://localhost:3000** da production build ishlaydi.
- Vercel’ga push qilmasdan localda xatolarni aniqlash uchun qulay.

## 4. Qisqacha

| Maqsad              | Buyruq           | Manzil              |
|---------------------|------------------|----------------------|
| Kundalik ishlab chiqish, tez tekshirish | `npm run dev`    | http://localhost:3000 |
| Deploy’dan oldin build tekshirish       | `npm run build && npm run start` | http://localhost:3000 |

**Reklama (Yandex RTB) localhost’da ko‘rinmasligi normal:** Console’da `WRONG_DOMAIN Current domain is not allowed on the page "18660186"` va `403` (yandex.ru/ads) chiqsa — Yandex reklama faqat Yandex’da ro‘yxatdan o‘tgan domen (masalan infoedu.uz) da ishlaydi. Local’da faqat **joylashuv** (post ichidagi blok, `[InlinePostAd]` log) tekshiriladi; reklama to‘ldirilishi production’da ishlaydi.
