// OneSignal TypeScript declarations
declare global {
	interface Window {
		OneSignal?: {
			push: (callback: () => void) => void
			init: (options: { appId: string; allowLocalhostAsSecureOrigin?: boolean }) => Promise<void>
			emitter?: {
				on: (event: string, callback: (data?: any) => void) => void
				off: (event: string, callback?: (data?: any) => void) => void
			}
			EVENTS?: {
				NOTIFICATION_PERMISSION_CHANGED_AS_AS_STRING?: string
				[key: string]: string | undefined
			}
			Notifications?: {
				on: (event: string, callback: () => void) => void
			}
			[key: string]: any
		} | Array<() => void>
		OneSignalDeferred?: Array<(OneSignal: any) => void>
	}
}

export {}
