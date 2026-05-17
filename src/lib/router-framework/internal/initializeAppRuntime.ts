import type { AnyRoute, ParsedLocation } from "@tanstack/react-router"
import { registerAppExitGuard, registerBfCacheReload } from "./browser"
import { type AppError, registerErrorNotifier } from "./error"
import { initNavigationTracker } from "./navigation"
import { createAppRouter } from "./router"

/**
 * アプリケーションランタイムの初期化オプションです。
 */
export type InitializeAppRuntimeOptions = {
	/**
	 * フレームワークで捕捉したアプリケーションエラーの通知先です。
	 *
	 * 省略した場合、エラー通知ハンドラは登録されません。
	 */
	errorNotifier?: (error: AppError) => void

	/**
	 * Router の既定のガベージコレクション時間です。
	 *
	 * `createAppRouter` にそのまま渡されます。
	 */
	defaultGcTime?: number

	/**
	 * スクロール位置の復元を有効にするかを指定します。
	 *
	 * `true` を指定すると既定の復元動作を有効にします。
	 * 関数を指定した場合は、現在の location をもとに復元可否を動的に判定します。
	 */
	scrollRestoration?:
		| boolean
		| ((opts: { location: ParsedLocation }) => boolean)

	/**
	 * アプリケーション終了ガードを有効にするかを指定します。
	 *
	 * 既定値は `true` です。
	 */
	enableAppExitGuard?: boolean

	/**
	 * bfcache からの復元時にページを再読み込みする処理を有効にするかを指定します。
	 *
	 * 既定値は `true` です。
	 */
	enableBfCacheReload?: boolean
}

/**
 * アプリケーションの共通ランタイムを初期化し、Router インスタンスを作成します。
 *
 * この関数は、アプリケーション終了ガード、bfcache 復元時の再読み込み、
 * エラー通知ハンドラの登録など、画面起動前に必要な共通初期化をまとめて行います。
 *
 * @typeParam TRoute - ルートツリーの型です。
 * @param routeTree - TanStack Router に渡すルートツリーです。
 * @param options - ランタイム初期化オプションです。
 * @returns 初期化済みの Router インスタンスを返します。
 *
 * @example
 * ```ts
 * const router = initializeAppRuntime(routeTree, {
 *   errorNotifier: notifyError,
 *   defaultGcTime: 0,
 *   scrollRestoration: true,
 * })
 * ```
 */
export function initializeAppRuntime<TRoute extends AnyRoute>(
	routeTree: TRoute,
	options?: InitializeAppRuntimeOptions,
) {
	if (options?.enableAppExitGuard ?? true) {
		registerAppExitGuard()
	}

	if (options?.enableBfCacheReload ?? true) {
		registerBfCacheReload()
	}

	if (options?.errorNotifier) {
		registerErrorNotifier(options.errorNotifier)
	}

	const router = createAppRouter(routeTree, {
		defaultGcTime: options?.defaultGcTime,
		scrollRestoration: options?.scrollRestoration,
	})

	initNavigationTracker(router)

	return router
}
