# Local: npm run dev

## Talablar

- **Node 18+** (`node -v`)
- **.env** ildizda, ichida: `NEXT_PUBLIC_WORDPRESS_URL`, `FAUST_SECRET_KEY`, `NEXT_PUBLIC_URL=http://localhost:3000`

## Qadamlar

```bash
npm install
copy .env.example .env   # keyin .env ni to'ldiring
npm run generate         # WordPress dan schema (bir marta yoki schema o'zgarganda)
npm run dev
```

Brauzer: **http://localhost:3000**

---

## npm run dev tez tugab qolsa

`npm run dev` da avval `generate`, keyin `faust dev` + `watch-codegen` ishlaydi. **`faust dev` ba’zan darhol tugab ketadi** (masalan WordPress’ga ulanishda muammo bo‘lsa). Serverni doim ishlatish uchun:

**Variant 1 — faqat Next.js (WordPress’siz, tez):**

```bash
npm run dev:next
```

Bu `next dev` + codegen. Sahifa ochiladi, ma’lumotlar bo‘lmasa bo‘sh/404 bo‘lishi mumkin.

**Variant 2 — to‘liq (faust dev) ishlashi uchun:**

1. `.env` da `NEXT_PUBLIC_WORDPRESS_URL` to‘g‘ri va sayt internetdan ochiladimi tekshiring.
2. Avval alohida: `npm run generate` (muvaffaqiyatli tugashini kuting).
3. Keyin: `npm run dev`. Agar yana tez tugasa, terminaldagi xatoni o‘qing — odatda WordPress/GraphQL yoki `possibleTypes.json` bilan bog‘liq.

---

## Tez tekshiruvlar

| Muammo | Qilish |
|--------|--------|
| Port 3000 band | `set PORT=3001 && npm run dev` |
| Generate xato | .env bor va `NEXT_PUBLIC_WORDPRESS_URL` to‘g‘ri mi? |
| Serverni baribir ishga tushirish | `npm run dev:next` |
