import { GetServerSideProps } from 'next'

/**
 * WordPress dagi darslik URL formatini Next.js darslik sahifasiga yo'naltiradi.
 * Masalan: /textbooks/8-sinf-ona-tili → /darsliklar/8/8-sinf-ona-tili
 * Shu sahifa ochilmasa, [...wordpressNode] umumiy sahifani ko'rsatardi.
 */
export default function TextbookRedirect() {
	return null
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const slug = (context.params?.slug as string) || ''
	// Slug format: "8-sinf-ona-tili", "11-sinf-kimyo" va h.k. — boshidagi raqam sinf
	const match = slug.match(/^(\d+)-sinf-/i)
	const sinf = match ? match[1] : null

	if (sinf && parseInt(sinf, 10) >= 1 && parseInt(sinf, 10) <= 11) {
		return {
			redirect: {
				destination: `/darsliklar/${sinf}/${slug}`,
				permanent: true, // 301 — SEO uchun doimiy yo'naltirish
			},
		}
	}

	// Slug format mos kelmasa darsliklar asosiy sahifasiga yuboramiz
	return {
		redirect: {
			destination: '/darsliklar',
			permanent: false, // 302
		},
	}
}
