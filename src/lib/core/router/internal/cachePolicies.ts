import { isInNavigationRollback } from "./navigationTracker"
import { shouldReloadForNavigation } from "./useNavigateWithoutDataLoad"

/**
 * noCachePolicy
 * ----------------------------------------------------------------------------
 * キャッシュを使用せず常に最新を取得するポリシー。
 *
 * 全ての画面の基本ポリシー。
 */
export const noCachePolicy = {
	staleReloadMode: "blocking",
	staleTime: 0,
	shouldReload: ({
		cause,
		location,
	}: {
		cause: "enter" | "stay" | "preload"
		location: { href?: string }
	}) => {
		if (cause === "preload") {
			return true
		}
		// 画面遷移キャンセルが発生し元の画面に戻ってきた流れの場合はloaderは呼び出さない
		if (cause === "stay" && isInNavigationRollback()) {
			return false
		}
		// 次の navigation だけ loader をスキップさせる要求がある場合は、loader を呼び出さない
		if (!shouldReloadForNavigation({ location })) {
			return false
		}
		return true
	},
} as const

/**
 * globalCachePolicy
 * ----------------------------------------------------------------------------
 * 常にキャッシュし再読み込みを行わないポリシー。
 *
 * 例:
 *   - ユーザー情報
 *   - マスターデータ
 *   - Feature flags
 */
export const staticCachePolicy = {
	staleReloadMode: "blocking",
	staleTime: Infinity,
	gcTime: Infinity,
	shouldReload: () => false,
} as const
