const APP_ERROR = Symbol("AppError")

export type AppErrorData = unknown

/**
 * AppErrorOptions
 * ----------------------------------------------------------------------------
 * AppError を生成する際のオプション。
 */
export interface AppErrorOptions {
	statusCode?: number
	fatal?: boolean
	data?: AppErrorData
	cause?: unknown
}

/**
 * AppError
 * ----------------------------------------------------------------------------
 * アプリケーション共通エラークラス。
 *
 * 目的
 * ------------
 * すべての例外を統一された形式で扱うためのエラー。
 *
 * 主なプロパティ
 *
 *   message    : ユーザー表示可能なメッセージ
 *   statusCode : HTTP ステータスコード（デフォルト 500）
 *   data       : 業務エラー用追加データ
 *   fatal      : Router navigation を継続できないエラー
 *   cause      : 元の例外
 *
 * Java の `Throwable cause` と同じ概念を持つ。
 */
export class AppError extends Error {
	readonly [APP_ERROR] = true

	statusCode: number
	fatal: boolean
	data?: AppErrorData
	cause?: unknown

	constructor(message: string, options: AppErrorOptions = {}) {
		super(message, { cause: options.cause })

		this.name = "AppError"

		this.statusCode = options.statusCode ?? 500
		this.fatal = options.fatal ?? false
		this.data = options.data
		this.cause = options.cause
	}
}

/**
 * createAppError
 * ----------------------------------------------------------------------------
 * AppError を生成するヘルパー関数。
 */
export function createAppError(message: string, options?: AppErrorOptions) {
	return new AppError(message, options)
}

/**
 * isAppError
 * ----------------------------------------------------------------------------
 * AppError 型ガード。
 */
export function isAppError(error: unknown): error is AppError {
	if (!error || typeof error !== "object") {
		return false
	}

	return APP_ERROR in error
}
