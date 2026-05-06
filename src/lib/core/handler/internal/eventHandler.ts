import { type AppError, normalizeError } from "@/lib/core/error"

/**
 * eventHandler
 * ----------------------------------------------------------------------------
 * UI イベントハンドラ用のトランザクションラッパー。
 *
 * React の `onClick` / `onSubmit` などのイベントハンドラで
 * 非同期処理を安全に実行するために使用する。
 *
 * エラーが発生した場合は `notify` に委譲する。
 *
 *
 * エラー処理ポリシー
 * ----------------------------------------------------------------------------
 *
 *   fatal エラー
 *     → 再スロー（アプリケーション上位へ委譲）
 *
 *   recoverable エラー
 *     → notify(error) を呼び出す
 *
 *
 * 使用例
 * ----------------------------------------------------------------------------
 *
 *   const onClick = eventHandler(async () => {
 *     await saveUser()
 *   }, notifyEventError)
 *
 *   <button onClick={onClick}>Save</button>
 *
 *
 * @typeParam TArgs
 * イベントハンドラの引数型
 *
 * @param handler
 * 実行するイベントハンドラ
 *
 * @param notify
 * recoverable エラー通知関数（toast / dialog など）
 */
export function eventHandler<TArgs extends unknown[]>(
	handler: (...args: TArgs) => Promise<void>,
	notify: (error: AppError) => void,
) {
	return async (...args: TArgs): Promise<void> => {
		try {
			await handler(...args)
		} catch (error) {
			const appError = normalizeError(error)

			if (appError.fatal) {
				throw appError
			}

			notify(appError)
		}
	}
}
