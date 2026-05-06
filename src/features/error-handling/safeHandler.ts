import { type AppError, getErrorMessage } from "@/lib/core/error"
import { eventHandler } from "@/lib/core/handler"

export const safeHandler = <TArgs extends unknown[]>(
	handler: (...args: TArgs) => Promise<void>,
) => {
	return eventHandler(handler, notifyError)
}

function notifyError(error: AppError) {
	const message = getErrorMessage(error)
	alert(message)
}
