# Login muammosi

Salom! Ncmaz shablonida login bilan muammo bor. 

**Purchase Code:** 5d58e47c-61d1-4a7d-bdba-7fdbdb801610

## Muammo

Login qilganda "Login successful" deb chiqadi, lekin aslida login bo'lmaydi. Browser console'da quyidagi xatolik ko'rinadi:

```
GET https://www.infoedu.uz/api/faust/auth/token/ 401 (Unauthorized)
```

Ya'ni, foydalanuvchi parol va username kiritadi, "muvaffaqiyatli" deb chiqadi, lekin login bo'lmaydi.

## Nima qildim

1. **Simple JWT Authentication for WPGraphQL** plugin'ini o'rnatdim va sozladim
2. `wp-config.php` ga qo'shdim:
   ```php
   define('JWT_AUTH_SECRET_KEY', '99ba1210-e717-473c-853e-cea2ef917dd7');
   define('JWT_AUTH_CORS_ENABLE', true);
   ```
3. `.env.local` da:
   ```env
   NEXT_PUBLIC_WORDPRESS_URL=https://infoedu.trafik.uz
   FAUST_SECRET_KEY=99ba1210-e717-473c-853e-cea2ef917dd7
   ```
4. Plugin sozlamalarida "Authenticate user to WPGraphQL" ni yoqdim
5. Token source'larini sozladim (Header: Authorization, REQUEST: JWT)

**Texnik ma'lumotlar:**
- Next.js: 15.5.3
- React: 19.1.1
- Faust.js: 3.3.1
- WordPress: https://infoedu.trafik.uz
- Frontend: https://infoedu.uz

## Savollar

1. Qaysi authentication plugin'ini ishlatish kerak? Simple JWT Authentication to'g'rimi?
2. `FAUST_SECRET_KEY` va `JWT_AUTH_SECRET_KEY` qanday bo'lishi kerak?
3. Next.js 15.5.3 va Faust.js 3.3.1 o'rtasida muammo bormi?

Yordam bering, iltimos! 🙏

