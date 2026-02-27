# 401 / 500 va login — avval hozirgi holatni to‘g‘rilash

## Token exchange 500 (Authorization code olindi, keyin 500)

Agar login paytida **authorization code** chiqsa, lekin “Waiting for token exchange...” dan keyin **500** chiqsa:

1. **Diagnostika:** Brauzerda oching: **http://localhost:3000/api/test-wordpress-rest** (yoki production’da `https://infoedu.uz/api/test-wordpress-rest`).
2. Javobda **tests.faustAuthEndpointPOST** va **summary.recommendations** ga qarang. **response** ichida WordPress’dan kelgan xato matni bo‘lishi mumkin.
3. **Tekshiruvlar:**
   - **FAUST_SECRET_KEY** — WordPress: **Settings > Headless (yoki Faust)** dagi Secret Key bilan loyihadagi `.env` (yoki `.env.local`) dagi `FAUST_SECRET_KEY` **bir xil** bo‘lishi kerak (bo‘sh joy, qo‘shtirnoq yo‘q).
   - **Front-end URL** — WordPress’da Faust sozlamalarida “Front-end site URL” to‘g‘ri: production uchun `https://infoedu.uz`, local uchun `http://localhost:3000`.
   - **Plugin versiya** — FaustWP va WPGraphQL yangilangan; kerak bo‘lsa pluginlarni o‘chirib qayta yoqing.
   - **PHP xato** — WordPress serverida PHP error logda 500 sababi yozilgan bo‘lishi mumkin (hosting panel yoki `wp-content/debug.log`).

Bundan keyin ham 500 ketmasa, quyida yozilgan **boshqa plugin (NextAuth va h.k.)** yechimiga o‘tish mumkin.

---

## Hozirgi holat (Faust.js)

- Auth **Faust.js** orqali: WordPress’dagi **Faust.js (Headless)** plugin + Next.js’dagi `@faustwp/core` (useLogin, useAuth).
- Login: GraphQL `generateAuthorizationCode` → keyin token **/api/faust/auth/token** orqali WordPress’dagi `/wp-json/faustwp/v1/auth/token` ga yuboriladi.
- **401** odatda: token yo‘q, cookie domain noto‘g‘ri, yoki secret/versiya noto‘g‘ri. **500** odatda: WordPress’da PHP xato yoki secret/URL noto‘g‘ri.

### WordPress’da faqat `/authorize` bo‘lsa (eski FaustWP)

Agar `/api/test-wordpress-rest` da **hasAuthTokenRoute: false** va **hasAuthorizeRoute: true** chiqsa, WordPress’da eski FaustWP o‘rnatilgan (`/auth/token` yo‘q, faqat `/authorize` bor). Loyihada buning uchun **fallback** qo‘yilgan: so‘rovlar **/api/faust/auth/token** ga kelsa, Next.js ularni WordPress’dagi **/wp-json/faustwp/v1/authorize** (POST, `code` + `x-faustwp-secret`) ga yo‘naltiradi. Plugin yangilanishi shart emas — login qayta sinab ko‘ring.

---

## Ha — boshqa plaginga o‘tish yechim bo‘ladi

Agar Faust bilan hamma narsani qilib ko‘rgan bo‘lsangiz ham 401 ketmasa, **boshqa auth yechimiga o‘tish** mantiqiy.

### Variant A: NextAuth.js + WordPress REST API (tavsiya)

- **NextAuth.js** o‘rnating, **Credentials** provider qo‘ying.
- Login: foydalanuvchi login/parolni Next.js’ga yuboradi → sizning API route WordPress **REST** yoki **Application Passwords** orqali tekshiradi.
- WordPress tomonda: **Application Passwords** (WP 5.6+) yoki **JWT Authentication for WP REST API** plugin.
- Session Next.js’da (JWT yoki database). Faust token endpoint’ga umuman bog‘lanmaysiz, shuning uchun 401 muammosi bo‘lmaydi.

**Qisqa qadamlar:**

1. `npm install next-auth`
2. `pages/api/auth/[...nextauth].ts` — Credentials provider, ichida WordPress’ga POST (masalan `wp-json/wp/v2/users/me` yoki custom login endpoint).
3. Login va Sign-up sahifalarini NextAuth’ning `signIn()` va session tekshiruviga ulang.
4. Himoyalangan sahifalarda `getServerSession` yoki `useSession` ishlating.

### Variant B: Faqat WordPress REST + JWT

- WordPress’da **JWT Authentication for WP-API** (yoki boshqa JWT plugin) o‘rnating.
- Next.js’da login form: POST `wp-json/jwt-auth/v1/token` (login + password) → JWT qaytadi.
- JWT ni cookie yoki localStorage’da saqlang, har so‘rovda `Authorization: Bearer <token>` yuboring.
- Registratsiya: WordPress’dagi odatdagi ro‘yxatdan o‘tish (REST yoki form) + kerak bo‘lsa JWT login.

### Variant C: Faust’ni to‘g‘rilab ishlatish (sondan keyin boshqa plaginga o‘tsangiz ham foydali)

- WordPress: **Faust.js** plugin yangi versiyada va **Headless** sozlamalarida **Secret Key** Next.js `.env` dagi `FAUST_SECRET_KEY` bilan **bir xil**.
- Domen: production’da cookie domain (masalan `.infoedu.uz`) to‘g‘ri bo‘lishi kerak.
- WordPress’da **Permalink** “Post name” bo‘lishi kerak (REST yo‘llari ochiq bo‘lishi uchun).
- Brauzerda `/wp-json/faustwp/v1/auth/token` ni to‘g‘ridan-to‘g‘ri ochib tekshiring: 401 (token yo‘q) — normal; 404 — plugin/yo‘l muammosi.

---

## Xulosa

| Yondashuv | 401 muammosi | Login/registr | Qiyinlik |
|-----------|---------------|----------------|----------|
| Faust.js (hozirgi) | Plugin/secret/domain noto‘g‘ri bo‘lsa 401 | Plugin’ga bog‘liq | O‘zgartirish kam |
| **NextAuth + WP REST** | Token endpoint ishlatilmaydi, 401 yo‘q | To‘liq qo‘lda, ishonchli | O‘rtacha |
| JWT + WP REST | JWT noto‘g‘ri bo‘lsa 401 | Oddiy | O‘rtacha |

**Tavsiya:** 401 va login/registratsiya ishlamasa, **NextAuth.js + WordPress (Credentials + Application Passwords yoki REST login)** ga o‘tish aniq yechim bo‘ladi; Faust auth’dan butunlay voz kechishingiz shart emas, faqat login/session qismini NextAuth’ga ko‘chiramaniz.
