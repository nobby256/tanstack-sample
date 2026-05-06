import type { AnyRoute } from "@tanstack/react-router"
import { createRouter } from "@tanstack/react-router"
import { setupNavigationTracker } from "./navigationTracker"

/**
 * createAppRouter
 * ----------------------------------------------------------------------------
 * アプリケーション用 Router の初期化処理。
 *
 * Router instance を生成し、
 * navigationTracker などの Router setup を行う。
 *
 * Router-first SPA では URL = Application State であるため、
 * Router 初期化処理はこの関数に集約する。
 */
export function createAppRouter<TRoute extends AnyRoute>(routeTree: TRoute) {
	const router = createRouter({
		routeTree,
		context: {},
		// Router configuration
		scrollRestoration: true,
		defaultPreload: false,
		trailingSlash: "never",
	})

	// navigation 履歴の追跡を開始
	setupNavigationTracker(router)

	/**
	 * DEV 環境のみ
	 *
	 * ブラウザコンソールから router を操作できるようにする。
	 *
	 * 例:
	 *   router.state
	 *   router.navigate({ to: '/orders' })
	 */
	if (import.meta.env.DEV) {
		window.__router = router
	}

	return router
}

declare global {
	interface Window {
		__router?: unknown
	}
}
