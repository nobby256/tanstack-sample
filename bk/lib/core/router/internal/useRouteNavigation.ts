// useRouteNavigation.ts
import {
	type AnyRoute,
	type NavigateOptions,
	useNavigate,
	useRouter,
} from "@tanstack/react-router"
import {
	useNavigateWithoutDataLoad,
	useUIState,
} from "./useNavigateWithoutDataLoad"

type RouteWithSearch<TRoute extends AnyRoute = AnyRoute> = TRoute & {
	// biome-ignore lint/suspicious/noExplicitAny: TanStack Router 型 workaround
	types: { fullSearchSchema: any }
	useSearch: () => RouteSearch<TRoute>
	useParams: () => TRoute["types"]["allParams"]
}

type RouteSearch<TRoute> = TRoute extends {
	types: { fullSearchSchema: infer S }
}
	? S
	: never

export function useRouteNavigation<TRoute extends RouteWithSearch>(
	route: TRoute,
) {
	const router = useRouter()
	const navigate = useNavigate()
	const navigateWithoutDataLoad = useNavigateWithoutDataLoad()

	// search, params & UI state（すべて Route の型に乗せる）
	const search = route.useSearch()
	const params = route.useParams()
	const { uiState, patchUiState } = useUIState(route)

	const ui = {
		state: uiState,
		patch: patchUiState,
	}

	/**
	 * navigation.navigate
	 * -------------------------------------------------------------------------
	 * - 通常時: navigate(options)
	 * - skipLoader: true の場合だけ useNavigateWithoutDataLoad を利用
	 */
	async function navigateWithOptionalWithoutDataLoad(
		options: NavigateOptions & { skipLoader?: boolean },
	) {
		const { skipLoader = false, ...rest } = options
		if (skipLoader) {
			return navigateWithoutDataLoad(rest)
		}
		return navigate(rest)
	}

	/**
	 * navigation.back
	 * -------------------------------------------------------------------------
	 * async にして Promise<void> を返す。
	 * 実際には同期的に history.back() するだけだが、
	 * navigation.* を全て await 可能に揃えるためのラップ。
	 */
	async function back(): Promise<void> {
		router.history.back()
	}

	/**
	 * navigation.invalidate
	 * -------------------------------------------------------------------------
	 * 現在のこの Route だけの loader を再実行する。
	 * 親ルートには影響を与えない。
	 */
	async function invalidate(): Promise<void> {
		await router.invalidate({
			filter: (match) => match.routeId === route.id,
			sync: true,
		})
	}
	return {
		route,
		params,
		search,
		uiState,
		patchUiState,
		ui,
		navigate: navigateWithOptionalWithoutDataLoad,
		back,
		invalidate,
	}
}
