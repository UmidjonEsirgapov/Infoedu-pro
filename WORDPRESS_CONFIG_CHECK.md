# WordPress wp-config.php Tekshirish Qo'llanmasi

## ⚠️ 401 Unauthorized Muammosi

308 Redirect muammosi hal bo'ldi (trailing slash ishlayapti), lekin 401 Unauthorized hali ham bor. Bu WordPress backend'idagi autentifikatsiya sozlamalarini tekshirish kerakligini anglatadi.

## 🔍 1-ish: wp-config.php Kod Joylashuvini Tekshirish

### Muammo
Agar autentifikatsiya kodi `wp-config.php` faylining **eng oxirida** bo'lsa, u ishlamaydi.

### To'g'ri Joylashuv

Kod quyidagi joyda bo'lishi **SHART**:

```php
<?php
// ... WordPress sozlamalari ...

// ✅ TO'G'RI: Bu yerda bo'lishi kerak
// DB_NAME, DB_USER, DB_PASSWORD sozlamalaridan keyin
// Lekin /* That's all, stop editing! */ dan TEPADA

// Autentifikatsiya kodi bu yerda bo'lishi kerak
// ... sizning kod ...

/* That's all, stop editing! Happy publishing. */

require_once ABSPATH . 'wp-settings.php';
```

### ❌ NOTO'G'RI Joylashuv

```php
<?php
// ... WordPress sozlamalari ...

/* That's all, stop editing! Happy publishing. */

require_once ABSPATH . 'wp-settings.php';

// ❌ XATO: Bu yerda bo'lmasligi kerak!
// Kod bu yerda bo'lsa, WordPress yuklangandan keyin ishlaydi
// va autentifikatsiya ishlamaydi
```

## 📝 Tekshirish Qadamlari

### 1. WordPress backend'iga kirish
- FTP, SSH yoki hosting panel orqali WordPress papkasiga kiring
- `wp-config.php` faylini toping (WordPress root papkasida)

### 2. Faylni ochish va tekshirish
- `wp-config.php` faylini oching
- Quyidagi qatorni qidiring:
  ```php
  /* That's all, stop editing! Happy publishing. */
  ```

### 3. Kod joylashuvini tekshirish
- Autentifikatsiya kodingiz (Authorization header'ni qayta yuborish kodi) qayerda ekanligini tekshiring
- Agar u `require_once ABSPATH . 'wp-settings.php';` qatoridan **pastda** bo'lsa, uni **yuqoriga** ko'chiring

### 4. To'g'ri joyga ko'chirish
Kodni quyidagi joyga ko'chiring:

```php
<?php
// ... WordPress sozlamalari ...

define('DB_NAME', 'database_name');
define('DB_USER', 'database_user');
define('DB_PASSWORD', 'database_password');
define('DB_HOST', 'localhost');

// ... boshqa sozlamalar ...

// ✅ AUTENTIFIKATSIYA KODI BU YERDA BO'LISHI KERAK
// 308 Redirect uchun Authorization header'ni qayta yuborish
if (isset($_SERVER['REDIRECT_STATUS']) && $_SERVER['REDIRECT_STATUS'] == '308') {
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $_SERVER['HTTP_AUTHORIZATION'] = $_SERVER['HTTP_AUTHORIZATION'];
    }
}

/* That's all, stop editing! Happy publishing. */

require_once ABSPATH . 'wp-settings.php';
```

## 🔧 2-ish: Vercel Logs Tekshirish

Agar kod joylashuvi to'g'ri bo'lsa ham muammo bo'lsa:

1. Vercel Dashboard'ga kiring
2. Loyihangizni tanlang
3. "Logs" bo'limiga o'ting
4. `/api/faust/auth/token/` so'rovini qidiring
5. Xatolik xabarlarini ko'ring

## 🐛 Qo'shimcha Tekshirishlar

### WordPress Plugin Tekshirish
- Faust.js WordPress plugin o'rnatilgan va faollashtirilganligini tekshiring
- WPGraphQL plugin o'rnatilgan va faollashtirilganligini tekshiring

### Environment Variables
WordPress backend'ida quyidagi sozlamalar to'g'ri ekanligini tekshiring:
- `FAUST_SECRET_KEY` - Next.js va WordPress'da bir xil bo'lishi kerak
- `NEXT_PUBLIC_WORDPRESS_URL` - WordPress URL to'g'ri ekanligini tekshiring

### CORS Sozlamalari
WordPress backend'ida CORS sozlamalari to'g'ri ekanligini tekshiring.

## 📞 Yordam

Agar muammo davom etsa:
1. Vercel Logs'dan to'liq xatolik xabarini ko'ring
2. WordPress debug log'larini tekshiring
3. Browser Network tab'dan so'rov/response detaillarini ko'ring
