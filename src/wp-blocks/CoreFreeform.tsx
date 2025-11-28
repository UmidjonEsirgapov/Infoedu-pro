import React from 'react'
import { replaceYearPlaceholder } from '@/utils/replaceYearPlaceholder'

//
const CoreFreeform = (props: any) => {
	const { renderedHtml } = props || {}

	let processedHtml = renderedHtml
	// Replace [year] with current year
	processedHtml = replaceYearPlaceholder(processedHtml)
	// kieemr tra xem renderedHtml có <Table> không,
	if (processedHtml.includes('<table')) {
		processedHtml = wrapTablesInDiv(processedHtml)
	}

	return (
		<div
			className="CoreFreeform overflow-hidden"
			dangerouslySetInnerHTML={{ __html: processedHtml || '' }}
		></div>
	)
}

export function wrapTablesInDiv(html: string): string {
	// Regex để tìm các thẻ <table> không nằm trong thẻ <code> và không đã được bao bọc bởi div.table-wrapper
	const tableRegex =
		/(?<!<code[^>]*>)(?<!<div class="table-wrapper">[\s\S]*?)(<table\b[^>]*>[\s\S]*?<\/table>)(?![^<]*<\/code>)/gi

	// Thay thế mỗi thẻ <table> phù hợp bằng một <div> bao quanh nó
	return html.replace(tableRegex, '<div class="table-wrapper">$1</div>')
}

CoreFreeform.displayName = 'CoreFreeform'
export default CoreFreeform
