const OY_NOMLARI = [
	'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
	'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
]

/**
 * ISO sana matnini chiroyli ko'rinishga keltiradi (masalan: 3-aprel 2026).
 */
export function formatImtihonSana(isoSana: string | null | undefined): string {
	if (!isoSana || typeof isoSana !== 'string') return ''
	const d = new Date(isoSana)
	if (Number.isNaN(d.getTime())) return ''
	const kun = d.getDate()
	const oy = OY_NOMLARI[d.getMonth()]
	const yil = d.getFullYear()
	return `${kun}-${oy} ${yil}`
}
