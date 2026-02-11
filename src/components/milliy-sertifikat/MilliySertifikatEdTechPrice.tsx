'use client'

import { motion } from 'framer-motion'
import { MILLIY_SERTIFIKAT_PRICE } from '@/data/milliy-sertifikat-types'

export default function MilliySertifikatEdTechPrice() {
	return (
		<motion.div
			className="relative flex justify-center px-4 py-8"
			initial={{ opacity: 0, scale: 0.96 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ delay: 0.2, duration: 0.5 }}
		>
			<div className="relative rounded-2xl border border-indigo-500/30 bg-slate-900/80 px-8 py-8 shadow-2xl backdrop-blur sm:px-12 sm:py-10 md:px-16 md:py-12">
				{/* Glow orqada */}
				<div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 blur-xl" />
				<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-transparent" />
				<div className="relative">
					<p className="text-center text-sm font-medium uppercase tracking-wider text-slate-400">
						Imtihon narxi
					</p>
					<p
						className="mt-2 text-center text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
						style={{
							background: 'linear-gradient(135deg, #a5b4fc 0%, #c4b5fd 50%, #a78bfa 100%)',
							WebkitBackgroundClip: 'text',
							WebkitTextFillColor: 'transparent',
							backgroundClip: 'text',
							textShadow: '0 0 40px rgba(129, 140, 248, 0.3)',
							filter: 'drop-shadow(0 0 24px rgba(129, 140, 248, 0.4))',
						}}
					>
						{MILLIY_SERTIFIKAT_PRICE}
					</p>
				</div>
			</div>
		</motion.div>
	)
}
