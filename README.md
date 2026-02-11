# Infoedu.uz - Ta'lim yangiliklari va foydali ma'lumotlar

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Faust.js](https://img.shields.io/badge/Faust.js-3.3-purple)](https://faustjs.org/)
[![WordPress](https://img.shields.io/badge/WordPress-Headless-blue)](https://wordpress.org/)

O'zbekiston ta'lim tizimiga oid yangiliklar, universitetlar, grantlar, imtihonlar va tanlovlar haqida to'liq va ishonchli ma'lumotlar manbai.

## 🚀 Xususiyatlar

- 📰 **Ta'lim yangiliklari** - Eng so'nggi ta'lim yangiliklari va e'lonlar
- 🎓 **Universitetlar ro'yxati** - O'zbekistondagi barcha oliygohlar haqida batafsil ma'lumot
- 📊 **Kvotalar va ballar** - Universitetlar bo'yicha kirish ballari va kvotalar
- 🔍 **Qidiruv tizimi** - Maqolalar, mualliflar va kategoriyalar bo'yicha qidiruv
- 👤 **Foydalanuvchi profili** - Shaxsiy kabinet, saqlangan maqolalar, sevimli mualliflar
- ✍️ **Maqola yozish** - Rich text editor bilan maqola yaratish va tahrirlash
- 📱 **Responsive dizayn** - Barcha qurilmalarda mukammal ishlash
- 🔐 **Autentifikatsiya** - WordPress headless autentifikatsiya tizimi
- 🎨 **Dark mode** - Qorong'u va yorug' mavzular
- 📈 **SEO optimizatsiya** - Schema.org markup va meta taglar
- 🗺️ **Breadcrumb navigation** - Navigatsiya qulayligi

## 🛠️ Texnologiyalar

### Frontend
- **Next.js 15.5** - React framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Redux Toolkit** - State management
- **Apollo Client** - GraphQL client
- **TipTap** - Rich text editor
- **Framer Motion** - Animatsiyalar
- **Lucide React** - Icon library

### Backend & CMS
- **WordPress** - Headless CMS
- **Faust.js** - WordPress + Next.js integratsiyasi
- **WPGraphQL** - GraphQL API
- **Atlas Content Modeler** - Custom post types

### Deployment & Tools
- **Vercel** - Hosting va deployment
- **GraphQL Code Generator** - Type-safe GraphQL
- **Next Sitemap** - Sitemap generation
- **Google Analytics** - Analytics tracking

## 📋 Talablar

- Node.js 18+ 
- npm yoki yarn
- WordPress backend (WPGraphQL plugin bilan)

## 🔧 O'rnatish

### 1. Repository ni klon qiling

```bash
git clone https://github.com/UmidjonEsirgapov/Infoedu-pro.git
cd Infoedu-pro
```

### 2. Dependencies ni o'rnating

```bash
npm install
```

### 3. Environment variables ni sozlang

`.env.local` faylini yarating va quyidagi o'zgaruvchilarni to'ldiring:

```env
NEXT_PUBLIC_WORDPRESS_URL=https://your-wordpress-site.com
NEXT_PUBLIC_URL=https://infoedu.uz
FAUST_SECRET_KEY=your-secret-key
```

### 4. GraphQL types generate qiling

```bash
npm run generate
```

### 5. Development serverini ishga tushiring

```bash
npm run dev
```

Yoki faust dev ishlatish:

```bash
npx faust dev
```

Sayt `http://localhost:3000` da ochiladi.

## 📜 NPM Scripts

```bash
# Development server
npm run dev              # Development server + codegen watch
npx faust dev            # Faust dev server

# Build
npm run build            # Production build
npm start                # Production server

# Code generation
npm run generate         # Generate GraphQL possible types
npm run codegen          # Generate TypeScript types
npm run watch-codegen    # Watch mode for codegen

# Utilities
npm run clean            # Clean .next folder
npm run tsc              # TypeScript type checking
```

## 📁 Loyiha strukturası

```
Infoedu-pro/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/        # React komponentlar
│   │   ├── oliygoh/      # Universitet komponentlari
│   │   └── ...
│   ├── container/         # Layout komponentlar
│   ├── pages/            # Next.js pages
│   │   └── api/          # API routes
│   ├── wp-templates/     # WordPress template'lar
│   │   └── universitet.tsx  # Universitet sahifasi
│   ├── stores/           # Redux store
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Utility funksiyalar
│   └── fragments/       # GraphQL fragments
├── public/              # Static fayllar
├── next.config.js       # Next.js konfiguratsiyasi
├── faust.config.js      # Faust.js konfiguratsiyasi
└── package.json
```

## 🎓 Universitetlar sahifasi

Universitetlar sahifasi quyidagi xususiyatlarga ega:

- **Breadcrumb navigation** - Bosh sahifa > Oliygohlar > Universitet nomi
- **Schema.org markup** - SEO uchun structured data (CollegeOrUniversity)
- **Kontakt ma'lumotlari** - Manzil, telefon, email, rasmiy sayt
- **Kvotalar jadvali** - Fakultetlar va yo'nalishlar bo'yicha kvotalar
- **Hero section** - Universitet rasmi va asosiy ma'lumotlar

## 🔐 Autentifikatsiya

Loyiha Faust.js autentifikatsiya tizimidan foydalanadi:

- WordPress headless autentifikatsiya
- Cookie-based session management
- Protected API routes
- User profile management

## 📈 SEO

- Schema.org JSON-LD markup
- Meta tags optimization
- Sitemap generation
- Open Graph tags
- Twitter Cards

## 🌐 Deployment

### Vercel (tayyor)

Loyiha Vercel uchun sozlangan: `vercel.json` va `npm run build` (faust build) ishlatiladi.

1. **GitHub repository ni Vercel'ga ulang** (Import Project).
2. **Environment variables** ni Vercel Dashboard → Project → Settings → Environment Variables da quyidagilarni kiriting:

| O'zgaruvchi | Majburiy | Tavsif |
|-------------|----------|--------|
| `NEXT_PUBLIC_WORDPRESS_URL` | ✅ | WordPress backend URL (oxirida `/` bo'lmasin) |
| `FAUST_SECRET_KEY` | ✅ | WordPress → Settings → Headless → Secret Key |
| `NEXT_PUBLIC_URL` | ✅ | Frontend domen (masalan `https://infoedu.uz`) |
| `BUILD_SECRET` | ⚪ | Build vaqtida GraphQL so'rovlari uchun (Cloudflare whitelist) |
| `NEXT_PUBLIC_SITE_DIRECTION` | ⚪ | `ltr` yoki `rtl` |
| `NEXT_PUBLIC_SITE_GEAR_ICON` | ⚪ | `true` / `false` |
| `NEXT_PUBLIC_SITE_API_METHOD` | ⚪ | `GET` yoki `POST` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | ⚪ | Google Analytics ID (G-XXXXXXXXXX) |

3. **Deploy** – Vercel `npm run build` (faust build) ni avtomatik ishlatadi.

**Xatolik chiqmasligi uchun:** Barcha majburiy env o'zgaruvchilar Production (va Preview kerak bo'lsa) uchun to'ldirilgan bo'lishi kerak.

## 🤝 Contributing

Contributions welcome! Iltimos:

1. Fork qiling
2. Feature branch yarating (`git checkout -b feature/AmazingFeature`)
3. Commit qiling (`git commit -m 'Add some AmazingFeature'`)
4. Push qiling (`git push origin feature/AmazingFeature`)
5. Pull Request yarating

## 📝 License

Bu loyiha private repository. Barcha huquqlar himoyalangan.

## 👨‍💻 Muallif

**Umidjon Esirgapov**

- Email: info@infoedu.uz
- Website: [infoedu.uz](https://infoedu.uz)
- GitHub: [@UmidjonEsirgapov](https://github.com/UmidjonEsirgapov)

## 🙏 Minnatdorchilik

- [Faust.js](https://faustjs.org/) - WordPress + Next.js integratsiyasi
- [Next.js](https://nextjs.org/) - React framework
- [WP Engine Atlas](https://wpengine.com/atlas/) - Headless WordPress platform
- [WPGraphQL](https://www.wpgraphql.com/) - GraphQL API

## 📚 Qo'shimcha ma'lumot

- [Faust.js Documentation](https://faustjs.org/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [WPGraphQL Documentation](https://www.wpgraphql.com/docs)

---

⭐ Agar loyiha sizga foydali bo'lsa, star qo'yishni unutmang!
