# Simple JWT Authentication for WPGraphQL - O'rnatish va Sozlash

## 1. WordPress'da Plugin'ni O'rnatish

### Variant A: WordPress Dashboard orqali
1. WordPress Dashboard → **Plugins** → **Add New**
2. Qidiruv maydoniga **"Simple JWT Authentication for WPGraphQL"** yozing
3. Plugin'ni topib, **Install Now** → **Activate** tugmasini bosing

### Variant B: Manual o'rnatish
1. Plugin'ni GitHub'dan yuklab oling: https://github.com/wp-graphql/wp-graphql-jwt-authentication
2. WordPress'ning `wp-content/plugins/` papkasiga yuklang
3. WordPress Dashboard → **Plugins** → Plugin'ni **Activate** qiling

## 2. wp-config.php'ni Sozlash

WordPress server'ida `wp-config.php` faylini oching va quyidagi kodlarni qo'shing:

```php
// Simple JWT Authentication Settings
define('JWT_AUTH_SECRET_KEY', '99ba1210-e717-473c-853e-cea2ef917dd7');
define('JWT_AUTH_CORS_ENABLE', true);
```

**Muhim:**
- `JWT_AUTH_SECRET_KEY` - Bu sizning secret key'ingiz. Xavfsiz va noyob bo'lishi kerak.
- Xavfsiz key yaratish uchun: https://api.wordpress.org/secret-key/1.1/salt/ dan foydalaning
- Bu key `.env.local` faylidagi `FAUST_SECRET_KEY` bilan bir xil bo'lishi kerak!

## 3. WordPress Plugin Sozlamalari

1. WordPress Dashboard → **Settings** → **Simple JWT Authentication**
2. Quyidagi sozlamalarni tekshiring:
   - ✅ **Enable JWT Authentication** - Yoqilgan bo'lishi kerak
   - ✅ **WPGraphQL Authorization** - Yoqilgan bo'lishi kerak
   - ✅ **CORS Enabled** - Yoqilgan bo'lishi kerak

## 4. Server Sozlamalari

### Apache Server (.htaccess)
`.htaccess` fayliga quyidagi kodni qo'shing:

```apache
# JWT Authentication uchun
SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1
```

### NGINX Server (nginx.conf)
`nginx.conf` fayliga quyidagi kodni qo'shing:

```nginx
fastcgi_param HTTP_AUTHORIZATION $http_authorization;
```

## 5. Frontend Environment Variables

`.env.local` faylida quyidagilar bo'lishi kerak:

```env
NEXT_PUBLIC_WORDPRESS_URL=https://infoedu.trafik.uz
FAUST_SECRET_KEY=99ba1210-e717-473c-853e-cea2ef917dd7
```

**Muhim:** `FAUST_SECRET_KEY` `wp-config.php` dagi `JWT_AUTH_SECRET_KEY` bilan bir xil bo'lishi kerak!

## 6. Eski Plugin'ni O'chirish (Agar kerak bo'lsa)

Agar sizda "WPGraphQL JWT Authentication" yoki "Headless Login for WPGraphQL" plugin'i o'rnatilgan bo'lsa:

1. WordPress Dashboard → **Plugins**
2. Eski plugin'ni **Deactivate** qiling
3. Keyin **Delete** qiling (ixtiyoriy)

## 7. Tekshirish

### WordPress'da:
1. WordPress Dashboard → **GraphQL** → **GraphiQL IDE**
2. Quyidagi mutation'ni ishlatib sinab ko'ring:

```graphql
mutation Login {
  login(input: {
    username: "your-username"
    password: "your-password"
  }) {
    authToken
    user {
      id
      name
      email
    }
  }
}
```

### Frontend'da:
1. Development server'ni qayta ishga tushiring:
   ```bash
   npm run dev
   ```
2. Login qilib ko'ring
3. Browser console'da xatoliklar yo'qligini tekshiring

## 8. Muammolarni Hal Qilish

### 401 Unauthorized xatosi:
- `wp-config.php` va `.env.local` dagi secret key'lar bir xil ekanligini tekshiring
- WordPress server'ni restart qiling
- Browser cache'ni tozalang

### Plugin topilmayapti:
- Plugin to'g'ri o'rnatilganligini tekshiring
- WordPress versiyasi mos kelishini tekshiring (5.0+)

### CORS xatosi:
- `JWT_AUTH_CORS_ENABLE` `true` bo'lishini tekshiring
- Server sozlamalarini tekshiring

## 9. Qo'shimcha Ma'lumot

- Plugin GitHub: https://github.com/wp-graphql/wp-graphql-jwt-authentication
- Faust.js Documentation: https://faustjs.org
- WPGraphQL Documentation: https://www.wpgraphql.com

