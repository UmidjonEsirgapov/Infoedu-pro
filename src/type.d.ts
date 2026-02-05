// OneSignal TypeScript declarations
declare global {
	interface Window {
		OneSignal?: any[]
		OneSignalDeferred?: Array<(OneSignal: any) => void>
	}
}

export {}
