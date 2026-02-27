/**
 * GraphQL user_id (Int) uchun viewer.databaseId ni raqamga aylantiradi.
 * Agar databaseId email yoki boshqa non-numeric bo'lsa, undefined qaytaradi (xato bermaslik uchun).
 */
export function getViewerDatabaseIdAsNumber(viewer: {
	databaseId?: number | string | null
	userId?: number | string | null
} | null): number | undefined {
	if (!viewer) return undefined
	const raw = viewer.databaseId ?? viewer.userId
	if (raw == null) return undefined
	if (typeof raw === 'number' && Number.isInteger(raw)) return raw
	if (typeof raw === 'string') {
		const n = parseInt(raw, 10)
		return Number.isNaN(n) ? undefined : n
	}
	return undefined
}
