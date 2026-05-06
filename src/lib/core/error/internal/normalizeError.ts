import { FetchError } from "ofetch"
import { type AppError, createAppError, isAppError } from "./AppError"

/**
 * fatal 判定
 *
 * Router navigation を壊す可能性のあるステータスコード。
 */
function isFatalStatus(code: number) {
	return code === 401
}

/**
 * normalizeError
 * ----------------------------------------------------------------------------
 * 任意の例外を AppError に正規化する。
 *
 * 対応例外
 *
 *   - AppError
 *   - FetchError (ofetch)
 *   - Error
 *   - unknown
 *
 * FetchError の場合
 *
 *   statusCode === 422
 *
 * を業務エラーとして扱い
 * `error.data` を `AppError.data` に格納する。
 */
export function normalizeError(error: unknown): AppError {
	if (isAppError(error)) {
		return error
	}

	/**
	 * FetchError
	 */
	if (error instanceof FetchError) {
		const statusCode = error.statusCode ?? 500

		const message =
			error.statusMessage ?? error.message ?? "INTERNAL_SERVER_ERROR"

		const data = statusCode === 422 ? error.data : undefined

		return createAppError(message, {
			statusCode,
			fatal: isFatalStatus(statusCode),
			data,
			cause: error,
		})
	}

	/**
	 * Error
	 */
	if (error instanceof Error) {
		return createAppError(error.message, {
			cause: error,
		})
	}

	/**
	 * unknown
	 */
	return createAppError(String(error), {
		cause: error,
	})
}
