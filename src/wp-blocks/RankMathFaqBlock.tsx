'use client'

import React, { useMemo, useState } from 'react'
import { WordPressBlock } from '@faustwp/blocks'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

type FaqItem = { id?: string; title?: string; content?: string; visible?: boolean }

type RankMathFaqBlockProps = {
	__typename?: string
	clientId?: string | null
	parentClientId?: string | null
	attributes?: {
		questions?: unknown
	} | null
}

const parseQuestions = (questions: unknown): FaqItem[] => {
	if (!questions) return []
	const list = Array.isArray(questions) ? questions : []
	const result: FaqItem[] = []
	for (const q of list) {
		let obj: FaqItem | null = null
		if (typeof q === 'string') {
			try {
				obj = JSON.parse(q) as FaqItem
			} catch {
				continue
			}
		} else if (q && typeof q === 'object') {
			obj = q as FaqItem
		}
		if (obj && (obj.visible !== false) && (obj.title || obj.content)) {
			result.push(obj)
		}
	}
	return result
}

const RankMathFaqBlock: WordPressBlock<RankMathFaqBlockProps> = (props) => {
	const { attributes } = props || {}
	const items = useMemo(() => parseQuestions(attributes?.questions), [attributes?.questions])
	const [openIndex, setOpenIndex] = useState<number | null>(0)

	if (!items.length) return null

	return (
		<section
			className="not-prose my-8 sm:my-10"
			aria-label="Tez-tez beriladigan savollar"
		>
			<div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 shadow-sm dark:border-neutral-700 dark:bg-neutral-800/50">
				{items.map((item, index) => {
					const isOpen = openIndex === index
					const title = item.title || ''
					const content = item.content || ''

					return (
						<div
							key={item.id || index}
							className="border-b border-neutral-200 last:border-b-0 dark:border-neutral-700"
						>
							<button
								type="button"
								className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left font-semibold text-neutral-800 transition-colors duration-100 hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-700/50 sm:px-5 sm:py-5"
								onClick={() => setOpenIndex(isOpen ? null : index)}
								aria-expanded={isOpen}
								aria-controls={`faq-answer-${index}`}
								id={`faq-question-${index}`}
							>
								<span className="pr-2">{title}</span>
								<ChevronDownIcon
									className={`h-5 w-5 shrink-0 text-neutral-500 transition-transform duration-150 ease-out ${isOpen ? 'rotate-180' : ''}`}
									aria-hidden
								/>
							</button>
							<div
								id={`faq-answer-${index}`}
								role="region"
								aria-labelledby={`faq-question-${index}`}
								className="grid transition-[grid-template-rows] duration-150 ease-out"
								style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
							>
								<div className="min-h-0 overflow-hidden">
									<div
										className="prose prose-neutral max-w-none border-t border-neutral-200 bg-white px-4 pb-4 pt-2 dark:border-neutral-700 dark:bg-neutral-800/30 dark:prose-invert sm:px-5 sm:pb-5 sm:pt-3 prose-p:my-2 prose-ul:my-2 prose-li:my-0 prose-code:rounded prose-code:bg-neutral-200 prose-code:px-1 prose-code:py-0.5 dark:prose-code:bg-neutral-700"
										dangerouslySetInnerHTML={{ __html: content }}
									/>
								</div>
							</div>
						</div>
					)
				})}
			</div>
		</section>
	)
}

RankMathFaqBlock.displayName = 'RankMathFaqBlock'
export default RankMathFaqBlock
