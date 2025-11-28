/**
 * Replaces [year] placeholder with the current year
 * @param text - Text that may contain [year] placeholder
 * @returns Text with [year] replaced by current year
 */
export function replaceYearPlaceholder(text: string | null | undefined): string {
	if (!text) return ''
	const currentYear = new Date().getFullYear()
	return text.replace(/\[year\]/g, currentYear.toString())
}

