import { useRouter } from "@tanstack/react-router"
import { useNavigateWithoutDataLoad } from "./useNavigateWithoutDataLoad"

/**
 * `_` prefix UI state
 */
type UIStateKeys<T> = {
	[K in keyof T]: K extends `_${string}` ? K : never
}[keyof T]

/**
 * UI state を読み取るための型。
 * `_` で始まるキーだけを抽出。
 * `_` で始まるキーが無い場合は `{}`。
 */
type UIState<T> =
	UIStateKeys<T> extends never
		? // biome-ignore lint/complexity/noBannedTypes: UIState の空ケースは {} で表現したい
			{}
		: {
				[K in UIStateKeys<T>]: T[K]
			}

/**
 * UI state を更新するための patch 型。
 * `_` で始まるキーだけを許可。
 * `_` が無い場合は全てのキーを不許可。
 */
type UIStatePatch<T> =
	UIStateKeys<T> extends never
		? Record<string, never>
		: {
				[K in UIStateKeys<T>]?: T[K] | undefined
			}

type RouteSearch<TRoute> = TRoute extends {
	types: { fullSearchSchema: infer S }
}
	? S
	: never

/**
 * 検索オブジェクトから `_` prefix の UI state だけを抽出
 */
function pickUIState<T extends Record<string, unknown>>(search: T): UIState<T> {
	const entries = Object.entries(search).filter(([key]) => key.startsWith("_"))
	return Object.fromEntries(entries) as UIState<T>
}

type PatchUiStateOptions = {
	ignoreBlocker?: boolean
	replace?: boolean
}

/**
 * useUIState
 * ---------------------------------------------------------------------------
 * `_` prefix UI state だけ変更。
 * 戻り値として:
 *   - uiState: `_` prefix の UI state 部分だけを抜き出したオブジェクト
 *              （`_` が無い場合は `{}`）
 *   - patchUiState: `_` prefix UI state のみを部分更新する関数
 */
export function useUIState<
	TRoute extends {
		// biome-ignore lint/suspicious/noExplicitAny: TanStack Router 型 workaround
		types: { fullSearchSchema: any }
		useSearch: () => RouteSearch<TRoute>
	},
>(route: TRoute) {
	const router = useRouter()
	const navigate = useNavigateWithoutDataLoad()

	type Search = RouteSearch<TRoute>
	type UiState = UIState<Search>

	// Route の search から `_` prefix だけを抽出して UI state として返す
	const search = route.useSearch()
	const uiState = pickUIState(search as Record<string, unknown>) as UiState

	async function patchUiState(
		patch: UIStatePatch<Search>,
		options: PatchUiStateOptions = {},
	): Promise<void> {
		const current = router.state.location.search as Search

		await navigate({
			to: ".",
			search: {
				...current,
				...patch,
			},
			replace: options.replace ?? true,
			ignoreBlocker: options.ignoreBlocker ?? true,
		})
	}

	return {
		uiState,
		patchUiState,
	}
}
