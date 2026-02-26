# Push bildirishnomalar (OneSignal) — deploy oldin tekshirish

Agar push bildirishnomalar ishlamasa, quyidagilarni tekshiring.

## 1. OneSignal Dashboard

- **Settings → Platforms → Web Push** (yoki Web Configuration):
  - **Site URL** production domeningizga to‘g‘ri kiriting (masalan `https://infoedu.uz`).
  - **Default URL** — bildirishnoma bosilganda ochiladigan sahifa.
- **Settings → All Browsers** (yoki Web): brauzerlar yoqilgan bo‘lsin.
- Safari ishlatilsa: **Safari Web Push** sozlamalari va certificate qo‘shilgan bo‘lishi kerak.

## 2. Sayt (production)

- **HTTPS** ishlatilishi shart (localhost bundan mustasno).
- **Service worker**: brauzerda `https://SIZNING-DOMEN/OneSignalSDKWorker.js` ochilsa, fayl yuklanishi kerak (404 bo‘lmasin). Fayl loyihada `public/OneSignalSDKWorker.js` da.
- Boshqa service worker (`sw.js`, `service-worker.js`) root scope (`/`) da ro‘yxatdan o‘tkazilmasin; bitta scope da faqat bitta SW faol bo‘ladi.

## 3. Brauzer

- Foydalanuvchi **bildirishnoma ruxsatini** bergan bo‘lishi kerak (brauzer so‘rovchi oynasi yoki sayt sozlamalari).
- Brauzerda sayt uchun “Notifications blocked” bo‘lmasin (Site settings → Notifications).

## 4. Loyihadagi o‘zgarishlar (tuzatishlar)

- **`_document.tsx`**: `window.OneSignal = window.OneSignal || []` — SDK yuklanishidan oldin queue mavjud bo‘lishi uchun qo‘shildi.
- **`_app.tsx`**: `serviceWorkerPath: "/OneSignalSDKWorker.js"` — worker yo‘li aniq ko‘rsatildi.
- **CSP**: `worker-src 'self' https://cdn.onesignal.com` — worker skriptlari uchun ruxsat.

Console’da `OneSignal SDK script loaded` va `OneSignal Notifications API is available` (yoki emitter) chiqsa, SDK yuklangan. Ruxsat so‘ralmagan bo‘lsa, OneSignal odatda o‘zi prompt ko‘rsatadi; agar ko‘rinmasa, brauzer/sayt ruxsatini yuqoridagi bo‘limlardan tekshiring.
