import { redirect } from "@tanstack/react-router"
import type { RouterContext } from "@/lib/router"

export const routerContext: RouterContext = {
	notifyLoadError,
	redirectOnNavigationLoop,
}

/**
 * loader / beforeLoad で発生したエラーを UI に通知する。
 *
 * Router 層は UI フレームワークに依存しないため、
 * トースト表示やダイアログ表示などの UI 処理は
 * RouterContext 経由でアプリ側から注入する。
 *
 * @param error 発生した例外
 */
function notifyLoadError(error: unknown) {
	let message: string
	if (error instanceof Error) {
		message = error.message
	} else {
		message = String(error)
	}
	// ここでは簡易的に alert を使用
	alert(message)
}

/**
 * navigation ループ検出時の fallback redirect
 *
 * navigationTx では
 *
 *   A → B → error → A → error → A
 *
 * のような無限リダイレクトを検出した場合、
 * この関数を呼び出して遷移先を決定する。
 */
function redirectOnNavigationLoop(): never {
	throw redirect({
		to: "/network-error",
		replace: true,
	})
}
