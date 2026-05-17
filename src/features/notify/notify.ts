import { normalizeError } from "@router-framework"

export function notifyError(error: unknown) {
	const appError = normalizeError(error)
	const message = appError.message
	alert(message)
}
