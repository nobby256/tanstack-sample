import type { AnyRoute, ParsedLocation } from "@tanstack/react-router"
import { createRouter } from "@tanstack/react-router"
import { createAppError, normalizeError } from "../error"

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
		defaultGcTime: options?.defaultGcTime ?? 0,
		defaultNotFoundComponent: defaultNotFoundHandler,
		defaultErrorComponent: defaultErrorHandler,
	})

	return router
}

function defaultNotFoundHandler() {
	const error = createAppError("NOT_FOUND", {
		statusCode: 404,
		fatal: true,
	})
	return defaultErrorHandler({ error })
}

function defaultErrorHandler({ error }: { error: unknown }) {
	const appError = normalizeError(error)
	const statusCode = appError.statusCode
	window.location.href = `/error?status=${statusCode}`

	return undefined
}
