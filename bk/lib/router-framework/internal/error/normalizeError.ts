import { type AppError, createAppError, isAppError } from "./AppError"

/**
 * fatal 判定
 *
 * Router navigation を壊す可能性のあるステータスコード。
 */
function isFatalStatus(code: number) {
	return code === 401
}

function hasStatusCode(error: Error): error is Error & { statusCode: number } {
	return (
		"statusCode" in error &&
		typeof (error as { statusCode?: unknown }).statusCode === "number"
	)
}

function hasStatusMessage(
	error: Error,
): error is Error & { statusMessage: string } {
	return (
		"statusMessage" in error &&
		typeof (error as { statusMessage?: unknown }).statusMessage === "string"
	)
}

function hasData(error: Error): error is Error & { data: unknown } {
	return "data" in error
}

/**
 * normalizeError
 * ----------------------------------------------------------------------------
 * 任意の例外を AppError に正規化する。
 *
 * 対応例外
 *
 *   - AppError
 *   - Error
 *   - unknown
 *
 * Error の派生型で statusCode を持つ場合は、それを利用する。
 * statusCode === 422 の場合は、error.data を AppError.data に格納する。
 */
export function normalizeError(error: unknown): AppError {
	if (isAppError(error)) {
		return error
	}

	if (error instanceof Error) {
		const statusCode = hasStatusCode(error) ? error.statusCode : undefined
		const message = hasStatusMessage(error)
			? error.statusMessage
			: error.message || "INTERNAL_SERVER_ERROR"

		const data = statusCode === 422 && hasData(error) ? error.data : undefined

		return createAppError(message, {
			statusCode,
			fatal: statusCode != null ? isFatalStatus(statusCode) : false,
			data,
			cause: error,
		})
	}

	return createAppError(String(error), {
		cause: error,
	})
}
