import type { AppError } from "./AppError"

/**
 * isFatalError
 * ----------------------------------------------------------------------------
 * fatal フラグを持つ AppError かどうか判定する。
 */
export function isFatalError(error: unknown): error is AppError {
	return (
		typeof error === "object" &&
		error !== null &&
		"fatal" in error &&
		(error as AppError).fatal === true
	)
}

/**
 * getErrorMessage
 * ----------------------------------------------------------------------------
 * 任意の例外からユーザー表示用メッセージを取得する。
 *
 * AppError / Error / unknown を安全に扱える。
 */
export function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message
	}

	return String(error)
}

/**
 * getErrorChain
 * ----------------------------------------------------------------------------
 * cause チェーンを辿りエラーのスタックを配列として取得する。
 *
 * Java の `Throwable#getCause()` と同様の用途。
 */
export function getErrorChain(error: unknown): unknown[] {
	const chain: unknown[] = []

	let current: unknown = error

	while (current instanceof Error) {
		chain.push(current)
		current = current.cause
	}

	return chain
}

/**
 * toLogObject
 * ----------------------------------------------------------------------------
 * 任意の例外をログ出力用オブジェクトに変換する。
 *
 * AppError / Error / unknown を安全に扱い、
 * cause チェーンも含めて出力できる。
 */
export function toLogObject(error: unknown) {
	const chain = getErrorChain(error)

	return chain.map((e) => {
		if (e instanceof Error) {
			return {
				name: e.name,
				message: e.message,
				stack: e.stack,
			}
		}

		return {
			value: e,
		}
	})
}
