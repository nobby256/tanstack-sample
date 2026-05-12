import { normalizeError } from "@/lib/core/error"

export function notifyError(error: unknown) {
	const appError = normalizeError(error)
	const message = appError.message
	alert(message)
}
