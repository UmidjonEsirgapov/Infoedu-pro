import { useEffect, useMemo, useState } from 'react'
import { MoonStar, X, Sunrise, Sunset, Clock } from 'lucide-react'

type RamadanDay = {
	date: string
	sahar: string
	iftar: string
}

const HIDDEN_UNTIL_KEY = 'ramadan_timer_banner_hidden_until'
const TASHKENT_OFFSET_HOURS = 5
const TASHKENT_OFFSET_MS = TASHKENT_OFFSET_HOURS * 60 * 60 * 1000
const HIDE_DURATION_MS = 24 * 60 * 60 * 1000

const RAMADAN_2026_TASHKENT: RamadanDay[] = [
	{ date: '2026-02-19', sahar: '05:54', iftar: '18:05' },
	{ date: '2026-02-20', sahar: '05:53', iftar: '18:07' },
	{ date: '2026-02-21', sahar: '05:51', iftar: '18:08' },
	{ date: '2026-02-22', sahar: '05:50', iftar: '18:09' },
	{ date: '2026-02-23', sahar: '05:49', iftar: '18:10' },
	{ date: '2026-02-24', sahar: '05:47', iftar: '18:11' },
	{ date: '2026-02-25', sahar: '05:46', iftar: '18:13' },
	{ date: '2026-02-26', sahar: '05:44', iftar: '18:14' },
	{ date: '2026-02-27', sahar: '05:43', iftar: '18:15' },
	{ date: '2026-02-28', sahar: '05:41', iftar: '18:16' },
	{ date: '2026-03-01', sahar: '05:40', iftar: '18:17' },
	{ date: '2026-03-02', sahar: '05:38', iftar: '18:19' },
	{ date: '2026-03-03', sahar: '05:37', iftar: '18:20' },
	{ date: '2026-03-04', sahar: '05:35', iftar: '18:21' },
	{ date: '2026-03-05', sahar: '05:34', iftar: '18:22' },
	{ date: '2026-03-06', sahar: '05:32', iftar: '18:23' },
	{ date: '2026-03-07', sahar: '05:31', iftar: '18:24' },
	{ date: '2026-03-08', sahar: '05:29', iftar: '18:25' },
	{ date: '2026-03-09', sahar: '05:27', iftar: '18:27' },
	{ date: '2026-03-10', sahar: '05:26', iftar: '18:28' },
	{ date: '2026-03-11', sahar: '05:24', iftar: '18:29' },
	{ date: '2026-03-12', sahar: '05:22', iftar: '18:30' },
	{ date: '2026-03-13', sahar: '05:21', iftar: '18:31' },
	{ date: '2026-03-14', sahar: '05:19', iftar: '18:32' },
	{ date: '2026-03-15', sahar: '05:17', iftar: '18:33' },
	{ date: '2026-03-16', sahar: '05:15', iftar: '18:34' },
	{ date: '2026-03-17', sahar: '05:14', iftar: '18:35' },
	{ date: '2026-03-18', sahar: '05:12', iftar: '18:37' },
	{ date: '2026-03-19', sahar: '05:10', iftar: '18:38' },
	{ date: '2026-03-20', sahar: '05:08', iftar: '18:39' },
]

function getTashkentDateParts(nowMs: number) {
	const tashkentDate = new Date(nowMs + TASHKENT_OFFSET_MS)
	const year = tashkentDate.getUTCFullYear()
	const month = String(tashkentDate.getUTCMonth() + 1).padStart(2, '0')
	const day = String(tashkentDate.getUTCDate()).padStart(2, '0')
	return {
		year,
		month,
		day,
		dateKey: `${year}-${month}-${day}`,
	}
}

function tashkentDateTimeToUtcMs(dateKey: string, hhmm: string) {
	const [yearStr, monthStr, dayStr] = dateKey.split('-')
	const [hourStr, minuteStr] = hhmm.split(':')
	const year = Number(yearStr)
	const month = Number(monthStr)
	const day = Number(dayStr)
	const hour = Number(hourStr)
	const minute = Number(minuteStr)
	return Date.UTC(year, month - 1, day, hour - TASHKENT_OFFSET_HOURS, minute, 0)
}

function formatCountdown(ms: number) {
	const totalSeconds = Math.max(0, Math.floor(ms / 1000))
	const hours = Math.floor(totalSeconds / 3600)
	const minutes = Math.floor((totalSeconds % 3600) / 60)
	const seconds = totalSeconds % 60

	return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export default function Banner() {
	const [mounted, setMounted] = useState(false)
	const [nowMs, setNowMs] = useState<number>(Date.now())
	const [hidden, setHidden] = useState(false)

	useEffect(() => {
		setMounted(true)
		const hiddenUntil = Number(localStorage.getItem(HIDDEN_UNTIL_KEY) || '0')
		if (hiddenUntil > Date.now()) {
			setHidden(true)
		}
	}, [])

	useEffect(() => {
		if (!mounted || hidden) return
		const timer = window.setInterval(() => {
			setNowMs(Date.now())
		}, 1000)
		return () => window.clearInterval(timer)
	}, [hidden, mounted])

	const bannerState = useMemo(() => {
		const today = getTashkentDateParts(nowMs).dateKey
		const todayIndex = RAMADAN_2026_TASHKENT.findIndex((item) => item.date === today)
		const firstDay = RAMADAN_2026_TASHKENT[0]
		const lastDay = RAMADAN_2026_TASHKENT[RAMADAN_2026_TASHKENT.length - 1]

		if (!firstDay || !lastDay) return null

		if (today < firstDay.date) {
			const targetMs = tashkentDateTimeToUtcMs(firstDay.date, firstDay.sahar)
			return {
				label: 'Saharlikgacha',
				targetMs,
				phase: 'before' as const,
				dayNumber: null,
				sahar: null,
				iftar: null,
			}
		}

		if (today > lastDay.date) {
			return null
		}

		if (todayIndex < 0) {
			return null
		}

		const currentDay = RAMADAN_2026_TASHKENT[todayIndex]
		const saharMs = tashkentDateTimeToUtcMs(currentDay.date, currentDay.sahar)
		const iftarMs = tashkentDateTimeToUtcMs(currentDay.date, currentDay.iftar)
		const dayNumber = todayIndex + 1

		if (nowMs < saharMs) {
			return {
				label: 'Saharlikgacha',
				targetMs: saharMs,
				phase: 'before_iftar' as const,
				dayNumber,
				sahar: currentDay.sahar,
				iftar: currentDay.iftar,
			}
		}

		if (nowMs < iftarMs) {
			return {
				label: 'Iftorgacha',
				targetMs: iftarMs,
				phase: 'until_iftar' as const,
				dayNumber,
				sahar: currentDay.sahar,
				iftar: currentDay.iftar,
			}
		}

		const nextDay = RAMADAN_2026_TASHKENT[todayIndex + 1]
		if (!nextDay) return null

		return {
			label: 'Saharlikgacha',
			targetMs: tashkentDateTimeToUtcMs(nextDay.date, nextDay.sahar),
			phase: 'after_iftar' as const,
			dayNumber,
			sahar: currentDay.sahar,
			iftar: currentDay.iftar,
		}
	}, [nowMs])

	if (!mounted || hidden || !bannerState) {
		return null
	}

	const countdown = formatCountdown(bannerState.targetMs - nowMs)

	const handleClose = () => {
		localStorage.setItem(HIDDEN_UNTIL_KEY, String(Date.now() + HIDE_DURATION_MS))
		setHidden(true)
	}

	return (
		<div className="Ncmaz_Banner relative isolate overflow-hidden border-b border-amber-500/30 bg-gradient-to-b from-emerald-900/95 via-emerald-800/95 to-teal-900/95 text-amber-50 shadow-md dark:border-amber-400/20 dark:from-emerald-950/98 dark:via-emerald-900/98 dark:to-teal-950/98">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(253,230,138,0.12),transparent)]" />
			<div className="relative mx-auto flex w-full max-w-7xl flex-col gap-3 px-3 py-2.5 pr-11 sm:pr-4 sm:flex-row sm:items-center sm:gap-4 sm:px-4 sm:py-2">
				{/* Left: icon + title + day */}
				<div className="flex min-w-0 flex-1 items-center gap-3">
					<div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-amber-400/40 bg-amber-500/20 shadow-inner">
						<MoonStar className="h-4 w-4 text-amber-200" aria-hidden="true" />
					</div>
					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
							<span className="text-xs font-semibold uppercase tracking-wider text-amber-200/90">
								Ramazon 2026
							</span>
							{bannerState.dayNumber != null && (
								<span className="rounded bg-amber-500/25 px-1.5 py-0.5 text-xs font-bold text-amber-100">
									{bannerState.dayNumber}-kun
								</span>
							)}
							<span className="hidden text-amber-300/70 sm:inline">· Toshkent</span>
						</div>
						{bannerState.sahar != null && bannerState.iftar != null && (
							<div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] sm:text-xs text-amber-100/90">
								<span className="inline-flex items-center gap-1">
									<Sunrise className="h-3 w-3 text-amber-300/80" />
									Sahar {bannerState.sahar}
								</span>
								<span className="inline-flex items-center gap-1">
									<Sunset className="h-3 w-3 text-amber-300/80" />
									Iftor {bannerState.iftar}
								</span>
							</div>
						)}
					</div>
				</div>

				{/* Center/Right: countdown */}
				<div className="flex flex-wrap items-center gap-2 sm:gap-3">
					<span className="flex items-center gap-1.5 text-xs font-medium text-amber-100/90">
						<Clock className="h-3.5 w-3.5 text-amber-300/80" />
						{bannerState.label}
					</span>
					<span
						className="inline-flex min-w-[4.5rem] justify-center rounded-lg border border-amber-400/40 bg-black/25 px-2.5 py-1.5 font-mono text-sm font-bold tabular-nums text-amber-50 shadow-inner sm:text-base"
						aria-live="polite"
					>
						{countdown}
					</span>
				</div>

				<button
					type="button"
					onClick={handleClose}
					className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 flex-shrink-0 items-center justify-center rounded-full border border-amber-400/30 bg-white/5 text-amber-200 transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 sm:relative sm:right-0 sm:top-0 sm:translate-y-0"
					aria-label="24 soat yashirish"
					title="24 soat yashirish"
				>
					<X className="h-4 w-4" />
				</button>
			</div>
		</div>
	)
}
