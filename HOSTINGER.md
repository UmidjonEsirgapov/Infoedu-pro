# Infoedu — Hostinger'ga deploy qilish (Vercel'dan ko‘chish)

Bu loyiha **Next.js 15 + FaustWP** (WordPress headless). Hostinger Node.js Web App qo‘llab-quvvatlaydi (Business yoki Cloud tariflar).

---

## 1. Hostinger talablari

- **Tarif:** Business Web Hosting yoki Cloud (Startup / Professional / Enterprise)
- **Node.js versiyalari:** 18.x, 20.x, 22.x, 24.x (loyiha 18+ bilan ishlaydi)
- **Framework:** Next.js qo‘llab-quvvatlanadi

---

## 2. Deploy usullari

### A) GitHub orqali (tavsiya etiladi)

1. **hPanel** → **Websites** → **Add Website**
2. **Node.js Apps** ni tanlang
3. **Import Git Repository** → GitHub’ga ulaning
4. Repozitoriyani tanlang (masalan: `Infoedu-pro`)
5. **Build sozlamalari**da quyidagilarni o‘rnating:

| Sozlama        | Qiymat           |
|----------------|------------------|
| **Install command** | `npm ci` yoki `npm install` |
| **Build command** | `npm run build`   |
| **Start command** | `npm start`       |
| **Node.js version** | 20.x yoki 22.x   |

6. **Deploy** bosing.

Har safar `main` (yoki tanlangan branch)ga push qilsangiz, Hostinger avtomatik qayta build qilishi mumkin (agar GitHub integration buni qo‘llab-quvvatlasa).

### B) ZIP fayl orqali

1. Loyihani ZIP qiling (`.git`, `node_modules`, `.next` kiritmaslik yaxshiroq; faqat kod).
2. **Node.js Apps** → **Upload your website files** → ZIP yuklang.
3. Build/Start command’larni yuqoridagidek o‘rnating.
4. **Deploy** bosing.

---

## 3. Muhim: Environment o‘zgaruvchilar

Hostinger’da sayt sozlamalari ichida **Environment variables** (yoki **Env**) bo‘limiga kirib, quyidagi o‘zgaruvchilarni **production** qiymatlar bilan to‘ldiring:

| O‘zgaruvchi | Tavsif | Misol |
|-------------|--------|--------|
| `NEXT_PUBLIC_WORDPRESS_URL` | WordPress backend manzili (oxirida `/` bo‘lmasin) | `https://infoedu.trafik.uz` |
| `FAUST_SECRET_KEY` | WordPress → Headless Faust sozlamasidagi secret key | (WordPress’dan nusxalang) |
| `NEXT_PUBLIC_URL` | Saytning public manzili (Hostinger’dagi domen) | `https://infoedu.uz` |
| `NEXT_PUBLIC_SITE_DIRECTION` | Til yo‘nalishi | `ltr` |
| `NEXT_PUBLIC_SITE_GEAR_ICON` | Gear icon | `false` |
| `NEXT_PUBLIC_SITE_API_METHOD` | API metodi | `GET` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics ID | `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_IMAGE_REMOTE_HOSTNAME_1` | Rasm hostname | `infoedu.uz` |
| `NEXT_PUBLIC_IMAGE_REMOTE_HOSTNAME_2` | Rasm hostname | `i0.wp.com` |
| `BUILD_SECRET` | Build vaqtida GraphQL so‘rovlariga qo‘shiladigan maxfiy qiymat (Cloudflare whitelist uchun) | (o‘zingiz belgilang) |

**Eslatma:** `FAUST_SECRET_KEY` va `NEXT_PUBLIC_WORDPRESS_URL` WordPress’dagi Headless/Faust sozlamalari bilan bir xil bo‘lishi kerak. `BUILD_SECRET` ni Hostinger env’da o‘rnating va Cloudflare’da build server IP/header bo‘yicha whitelist qiling — barcha chiquvchi GraphQL so‘rovlariga `x-build-secret` header qo‘shiladi.

---

## 4. Loyihadagi build / start

- **Build:** `npm run build` → ichida `faust build` va `next-sitemap` ishlaydi.
- **Start:** `npm start` → `faust start` (Next.js server).

Hostinger odatda `npm run build` va `npm start` ishlatadi; agar dropdown’da boshqa command bo‘lsa, yuqoridagilarni tanlang.

---

## 5. Domen ulash

- Avval sayt **vaqtinchalik subdomen**da deploy qilinadi.
- Keyin: **Websites** → saytingiz → **Domain** (yoki **Connect domain**) orqali o‘z domeningizni (masalan `infoedu.uz`) ulang.
- Hostinger qo‘llanmasi: [How to Connect a Preferred Domain Name Instead of a Temporary One](https://support.hostinger.com/articles/connecting-domain-to-nodejs-app).

---

## 6. Vercel’dan qolgan paketlar

Loyihada hozir:

- `@vercel/analytics`
- `@vercel/speed-insights`

Ular Vercel’da bo‘lmasa ham boshqa hostingda ishlashi mumkin. Agar Hostinger’da ularni ishlatishni xohlamasangiz, ularni o‘chirib, `_app.tsx` ichidagi `<Analytics />` va `<SpeedInsights />` komponentlarini ham olib tashlashingiz mumkin.

---

## 7. Xatoliklar va loglar

- **Build xatosi:** Hostinger’dagi **Deployment Details** / **Build logs** orqali ko‘ring.
- **Runtime xatosi:** **Logs** yoki **Node.js app logs** bo‘limini tekshiring.
- WordPress’ga ulanish muammosi bo‘lsa: `NEXT_PUBLIC_WORDPRESS_URL` va `FAUST_SECRET_KEY` ni WordPress va Hostinger’da bir xil ekanligini tekshiring.

---

## 8. Qisqa checklist

- [ ] Business yoki Cloud tarif
- [ ] Node.js App yaratildi (GitHub yoki ZIP)
- [ ] Build: `npm run build`, Start: `npm start`
- [ ] Barcha env o‘zgaruvchilar Hostinger’da o‘rnatildi
- [ ] `NEXT_PUBLIC_URL` = Hostinger’dagi yakuniy domen (masalan `https://infoedu.uz`)
- [ ] Domen ulandi (agar kerak bo‘lsa)
- [ ] WordPress’da Faust secret key va URL Hostinger’dagi bilan mos

Bundan keyin sayt Hostinger’da ishlashi kerak. Agar qaysidir qadamda xato chiqsa, build yoki runtime loglarini ko‘rib, aniq xabar bilan yozsangiz, yordam berish osonroq bo‘ladi.
