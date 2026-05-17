import type { AnyRoute, ParsedLocation } from "@tanstack/react-router"
import { createRouter } from "@tanstack/react-router"
import { setupNavigationTracker } from "./navigationTracker"

export interface RouterContext {}

export interface AppRouterOptions {
	defaultGcTime?: number
	scrollRestoration?:
		| boolean
		| ((opts: { location: ParsedLocation }) => boolean)
}

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
export function createAppRouter<TRoute extends AnyRoute>(
	routeTree: TRoute,
	options?: AppRouterOptions,
) {
	const router = createRouter({
		routeTree,
		context: {},
		// Router configuration
		trailingSlash: "never",
		defaultStaleTime: 0,
		defaultStaleReloadMode: "blocking",
		scrollRestoration: options?.scrollRestoration ?? true,
		defaultGcTime: options?.defaultGcTime ?? 1_800_000, // 30分（tanstack routerのデフォルト値と同じ）
	})

	setupNavigationTracker(router)

	return router
}
