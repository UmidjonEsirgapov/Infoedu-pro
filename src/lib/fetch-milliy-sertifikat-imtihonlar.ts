import type {
	MilliySertifikatImtihon,
	ImtihonNodeRaw,
	FanItem,
	FanItemRaw,
} from '@/data/milliy-sertifikat-types'

const WP_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL?.replace(/\/$/, '') || ''
const REVALIDATE_SECONDS = 3600

const IMTIHONLAR_QUERY = `
  query GetMilliySertifikatImtihonlar {
    imtihonlar {
      nodes {
        title
        imtihonTafsilotlari {
          royxatSana
          tolovSana
          imtihonSanalari
          fanlar
        }
      }
    }
  }
`

/** fanlar: massiv [{ fan_nomi }] yoki string (eski) — normalizatsiya qilingan FanItem[] */
function parseFanlar(raw: unknown): FanItem[] {
	if (!raw) return []
	if (Array.isArray(raw)) {
		return raw
			.map((f): FanItem | null => {
				if (typeof f === 'string' && f.trim()) return { fan_nomi: f.trim() }
				if (typeof f === 'object' && f && 'fan_nomi' in f) {
					const n = (f as FanItemRaw).fan_nomi
					return n ? { fan_nomi: String(n).trim() } : null
				}
				return null
			})
			.filter((x): x is FanItem => Boolean(x?.fan_nomi))
	}
	if (typeof raw === 'string') {
		const trimmed = raw.trim()
		if (trimmed.startsWith('[')) {
			try {
				const arr = JSON.parse(trimmed) as unknown[]
				return parseFanlar(arr)
			} catch {
				// fallback: vergul bilan ajratilgan
			}
		}
		return trimmed
			.split(/[,;]\s*|\n/)
			.map((s) => s.trim())
			.filter(Boolean)
			.map((fan_nomi) => ({ fan_nomi }))
	}
	return []
}

export async function fetchMilliySertifikatImtihonlar(): Promise<
	MilliySertifikatImtihon[]
> {
	const url = `${WP_URL}/graphql`
	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ query: IMTIHONLAR_QUERY }),
		next: { revalidate: REVALIDATE_SECONDS },
	})

	if (!res.ok) {
		throw new Error(
			`GraphQL xato: ${res.status} ${res.statusText} — ${url}`
		)
	}

	const json = (await res.json()) as {
		data?: { imtihonlar?: { nodes?: ImtihonNodeRaw[] } }
		errors?: unknown[]
	}
	if (json.errors?.length) {
		console.error('GraphQL errors:', json.errors)
		return []
	}

	const nodes = json.data?.imtihonlar?.nodes ?? []
	if (!Array.isArray(nodes)) return []

	const list: MilliySertifikatImtihon[] = nodes.map((node, index) => {
		const t = node.imtihonTafsilotlari
		return {
			id: index + 1,
			title: node.title ?? '',
			royxatSana: t?.royxatSana ?? '',
			tolovSana: t?.tolovSana ?? '',
			imtihonSanalari: t?.imtihonSanalari ?? '',
			fanlar: parseFanlar((t as { fanlar?: unknown })?.fanlar),
		}
	})

	list.sort((a, b) => {
		if (!a.royxatSana) return 1
		if (!b.royxatSana) return -1
		return new Date(a.royxatSana).getTime() - new Date(b.royxatSana).getTime()
	})

	return list
}
