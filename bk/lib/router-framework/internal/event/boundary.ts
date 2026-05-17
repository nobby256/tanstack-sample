import { notifyError } from "@/lib/core/error"

// biome-ignore lint/suspicious/noExplicitAny: イベントハンドラの可変長引数を型パラメータで扱うため any[] を許容する
type Handler<TArgs extends any[] = any[]> = (
	...args: TArgs
) => void | Promise<void>

/**
 * Event Phase 用のエラーバウンダリ関数。
 *
 * React のイベントハンドラをラップし、ハンドラ内部で発生した例外を捕捉して
 * `notifyError` に委譲する。
 *
 * この関数は次の目的で使用する。
 *
 * - イベントハンドラごとに `try/catch` を書く必要をなくす
 * - 同期例外 / 非同期例外の両方を捕捉する
 * - 通信エラーなどをユーザー通知へ統一的に接続する
 *
 * ハンドラは同期関数・非同期関数のどちらでも使用できる。
 *
 * 例:
 *
 * ```ts
 * const onClick = boundary(async () => {
 *   await updateItem()
 * })
 * ```
 *
 * ```ts
 * const onChange = boundary((e: React.ChangeEvent<HTMLInputElement>) => {
 *   setValue(e.target.value)
 * })
 * ```
 *
 * @param handler 実行するイベントハンドラ
 * @returns React のイベントハンドラとして使用できる関数
 */
// biome-ignore lint/suspicious/noExplicitAny: 可変長引数のイベントハンドラ型を表現するため any[] を使用
export function boundary<TArgs extends any[]>(handler: Handler<TArgs>) {
	return (...args: TArgs): void => {
		try {
			const result = handler.apply(null, args)

			if (result instanceof Promise) {
				result.catch((error) => {
					try {
						notifyError(error)
					} catch (notifyErrorError) {
						console.error("notifyError failed", notifyErrorError)
					}
				})
			}
		} catch (error) {
			try {
				notifyError(error)
			} catch (notifyErrorError) {
				console.error("notifyError failed", notifyErrorError)
			}
		}
	}
}
