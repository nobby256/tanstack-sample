"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"

export function MockProvider({ children }: { children: ReactNode }) {
	const [isReady, setIsReady] = useState(process.env.NODE_ENV !== "development")

	useEffect(() => {
		const enableMocks = async () => {
			if (process.env.NODE_ENV !== "development") {
				setIsReady(true)
				return
			}

			const { worker } = await import("@/mocks/browser")

			await worker.start({
				onUnhandledRequest: "bypass",
			})

			setIsReady(true)
		}

		void enableMocks()
	}, [])

	if (!isReady) {
		return null
	}

	return <>{children}</>
}
