// OneSignal TypeScript declarations
declare global {
	interface Window {
		OneSignal?: {
			push: (callback: () => void) => void
			init: (options: { appId: string; allowLocalhostAsSecureOrigin?: boolean }) => void
			Notifications?: {
				on: (event: string, callback: () => void) => void
			}
			[key: string]: any
		} | Array<() => void>
		OneSignalDeferred?: Array<(OneSignal: any) => void>
	}
}

export {}
