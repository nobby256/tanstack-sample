import type { ParsedLocation } from "@tanstack/react-router"
import { isNotFound, isRedirect, redirect } from "@tanstack/react-router"
import { normalizeError } from "../error"
import { beginRedirect, getLastResolvedUrl } from "./navigationTracker"

/**
 * navigationHandler
 * ----------------------------------------------------------------------------
 * Router navigation 用トランザクションラッパー。
 *
 * beforeLoad / loader で発生する例外を
 * Router Transaction Architecture のポリシーに従って処理する。
 *
 * @typeParam T
 * loader / beforeLoad の戻り値型
 *
 * @param ctx
 * Router navigation コンテキスト
 *
 * @param fn
 * 実行する loader / beforeLoad 処理
 */
export async function navigationTx<
	C extends { location: ParsedLocation; cause: "enter" | "stay" | "preload" },
	T,
>(ctx: C, fn: () => Promise<T>): Promise<T> {
	try {
		return await fn()
	} catch (error) {
		/**
		 * preload navigation は UI に影響させない
		 */
		if (ctx.cause === "preload") {
			// preload 時のエラーは画面遷移ではないので再スローしていい
			throw error
		}

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

		const prev = getLastResolvedUrl()
		const firstAccess = prev === undefined

		/**
		 * 初回アクセスなど戻る先が存在しない場合
		 */
		if (firstAccess) {
			appError.fatal = true
			throw appError
		}

		/**
		 * リダイレクト開始
		 */
		beginRedirect(appError)

		/**
		 * 疑似 navigation cancel
		 */
		throw redirect({
			to: prev,
			replace: true,
		})
	}
}
