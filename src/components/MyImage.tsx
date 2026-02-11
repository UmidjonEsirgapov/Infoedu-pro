import Image, { ImageProps } from 'next/image'
import { FC } from 'react'

export interface Props extends ImageProps {
	enableDefaultPlaceholder?: boolean
	defaultPlaceholderDataUrl?: string
}

const MyImage: FC<Props> = ({
	enableDefaultPlaceholder = false,
	defaultPlaceholderDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8+vx1PQAIqAM4jZDFJQAAAABJRU5ErkJggg==',
	...props
}) => {
	// Tashqi (WordPress) rasmlar uchun unoptimized — Vercel Image Optimization limitini tejash
	const src = props.src || '/images/placeholder.png'
	const isExternal =
		typeof src === 'string' &&
		(src.startsWith('http://') || src.startsWith('https://'))
	const unoptimized = props.unoptimized ?? isExternal

	return (
		<Image
			{...props}
			src={src}
			unoptimized={unoptimized}
			className={`${props.className} ${
				props.src ? '' : 'dark:brightness-75 dark:filter'
			}`}
		/>
	)
}

export default MyImage
