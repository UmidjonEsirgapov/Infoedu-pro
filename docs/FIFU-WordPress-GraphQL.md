# FIFU rasmini Featured Image qilib ko‘rsatish (GraphQL)

**Maqsad:** Post meta’dagi **`_fifu_image_url`** (yoki `fifu_image_url`) dagi rasmni frontendda **Featured Image** sifatida ko‘rsatish. Boshqa hech qanday rasm bo‘lmasa — **oxirgi imkoniyat** sifatida shu URL ishlatiladi.

Frontendda tartib:
1. **featuredImage** (WordPress Media)
2. **seo.openGraph.image** (RankMath og:image)
3. **editorBlocks** — birinchi FifuImage blokidagi URL (to‘liq post yuklanganda)
4. **fifuImageUrl** — post meta **`_fifu_image_url`** (oxirgi imkoniyat)

Ro‘yxat/kartochkalarda ham FIFU rasmini ko‘rsatish uchun **WordPress’da** quyidagi maydonni GraphQL’ga qo‘shing.

## WordPress’da _fifu_image_url ni GraphQL’ga qo‘shish

Theme’ning `functions.php` ga yoki kichik plugin ga quyidagi kodni qo‘shing:

```php
<?php
/**
 * Post meta _fifu_image_url ni GraphQL orqali chiqarish.
 * Frontend boshqa rasm yo‘q bo‘lsa buni Featured Image sifatida ishlatadi (oxirgi imkoniyat).
 */
add_action('graphql_register_types', function () {
    register_graphql_field('Post', 'fifuImageUrl', [
        'type'        => 'String',
        'description' => __('FIFU featured image URL from post meta (_fifu_image_url). Frontend uses as last resort.', 'your-textdomain'),
        'resolve'     => function ($post) {
            $id = (int) $post->databaseId;
            $url = get_post_meta($id, '_fifu_image_url', true);
            if (empty($url)) {
                $url = get_post_meta($id, 'fifu_image_url', true);
            }
            return ! empty($url) ? $url : null;
        },
    ]);
});
```

Keyin loyihada:

1. **Codegen** ishga tushiring (schema yangilangan bo‘ladi):
   ```bash
   npm run codegen
   ```

2. **Fragmentlarga** `fifuImageUrl` qo‘shing — loyihada allaqachon qo‘shilgan (`NcmazFcPostFullFields`, `PostCardFieldsNOTNcmazMEDIA`, `NcmazFcPostCardFieldsNOTNcmazGalleryImgs`).

3. **Codegen** ishga tushiring: `npm run codegen`.

Frontend avtomatik ravishda `fifuImageUrl` ni oxirgi imkoniyat sifatida ishlatadi va rasm chiqadi.

## Meta kaliti

Kod avval **`_fifu_image_url`**, bo‘sh bo‘lsa **`fifu_image_url`** ni tekshiradi. Boshqa kalit ishlatilsa, `get_post_meta(..., '_fifu_image_url', true)` (yoki o‘zingizning kalitingiz) ni o‘zgartiring.
