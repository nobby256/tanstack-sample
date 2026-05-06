import { isNotFound, isRedirect } from "@tanstack/react-router"
import { type AppError, normalizeError } from "@/lib/core/error"

/**
 * runTransaction
 * ----------------------------------------------------------------------------
 * 非同期処理を安全に実行するためのトランザクションラッパー。
 *
 * Router navigation / UI event / data mutation など、
 * 非同期処理で発生する例外を統一的に扱うために使用する。
 *
 * 処理フロー
 * ----------------------------------------------------------------------------
 *
 *   fn 実行
 *     ↓
 *   error 発生
 *     ↓
 *   Router control flow 判定
 *     ↓
 *   AppError に正規化
 *     ↓
 *   fatal 判定
 *     ↓
 *   recoverable エラーを policy に委譲
 *
 *
 * Router control flow
 * ----------------------------------------------------------------------------
 *
 * TanStack Router では
 *
 *   throw redirect(...)
 *   throw notFound(...)
 *
 * のような例外を navigation 制御に使用する。
 *
 * これらはエラーではないため、
 * transaction では捕捉せずそのまま再スローする。
 *
 *
 * AppError
 * ----------------------------------------------------------------------------
 *
 * すべての例外は `normalizeError` によって `AppError` に変換される。
 *
 *   fatal        → 再スロー
 *   recoverable  → policy に委譲
 *
 *
 * Policy
 * ----------------------------------------------------------------------------
 *
 * `onError` は recoverable エラーの処理ポリシーを定義する。
 *
 * 例:
 *   - navigation fallback
 *   - toast 表示
 *   - dialog 表示
 *
 *
 * @typeParam T
 * 非同期処理の戻り値型
 *
 * @param fn
 * 実行する非同期処理
 *
 * @param onError
 * recoverable エラーを処理するポリシー関数
 *
 * @returns
 * fn の実行結果
 */
export async function runTransaction<T>(
	fn: () => Promise<T>,
	onError: (error: AppError) => never,
): Promise<T> {
	try {
		return await fn()
	} catch (error) {
		/**
		 * Router control flow
		 *
		 * redirect / notFound は navigation 制御のための例外なので
		 * transaction では処理せずそのまま再スローする。
		 */
		if (isRedirect(error) || isNotFound(error)) {
			throw error
		}

		const appError = normalizeError(error)

		/**
		 * fatal エラーはアプリケーション上位に委譲
		 */
		if (appError.fatal) {
			throw appError
		}

		/**
		 * recoverable エラーは policy に委譲
		 */
		onError(appError)
	}
}
