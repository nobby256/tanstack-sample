type UrlParams = Record<string, unknown>
type UrlSearch = Record<string, unknown>

/**
 * normalizeObject
 *
 * 内部ユーティリティ関数。
 * URL 由来のオブジェクトを **canonical state** に正規化する。
 *
 * Purpose
 * -------
 * URL state は次の用途で使用される。
 *
 * - QueryKey
 * - API request parameters
 * - QueryParams (Zod schema input)
 *
 * そのため「同じ意味のURL状態」が必ず **同じオブジェクト形状** になる必要がある。
 *
 * Example
 * -------
 *
 * 入力
 *
 * { keyword: "react" }
 * { keyword: "react", category: undefined }
 * { keyword: "react", category: "" }
 * { keyword: " react " }
 *
 * 正規化後
 *
 * { keyword: "react" }
 *
 * Normalization Rules
 * -------------------
 * 1. undefined は削除する
 * 2. null は削除する
 * 3. 空文字 "" は削除する
 * 4. 文字列は trim() する
 * 5. trim 後に空文字になった場合は削除する
 * 6. 配列はそのまま保持する
 * 7. オブジェクトはそのまま保持する（トップレベルのみ処理）
 * 8. number / boolean はそのまま保持する
 *
 * Important
 * ---------
 * - 入力オブジェクトは変更しない（immutable）
 * - 新しいオブジェクトを返す
 */
function normalizeObject<T extends object>(input: T): T {
	const result: Record<string, unknown> = {}

	for (const [key, value] of Object.entries(input)) {
		// Rule 1 & 2:
		// undefined / null は削除
		if (value === undefined || value === null) {
			continue
		}

		// Rule 3,4,5:
		// 文字列は trim() して空なら削除
		if (typeof value === "string") {
			const trimmed = value.trim()

			if (trimmed === "") {
				continue
			}

			result[key] = trimmed
			continue
		}

		// Rule 6:
		// 配列はそのまま保持
		if (Array.isArray(value)) {
			result[key] = value
			continue
		}

		// Rule 7:
		// ネストオブジェクトはそのまま保持
		if (typeof value === "object") {
			result[key] = value
			continue
		}

		// Rule 8:
		// number / boolean などはそのままコピー
		result[key] = value
	}

	return result as T
}

/**
 * normalizeUrlState
 *
 * TanStack Router の URL state（params + search）を
 * **QueryParams（canonical state）に変換する関数**。
 *
 * Architecture Context
 * --------------------
 * URL Driven Query Architecture では
 *
 *     URL = QueryParams
 *
 * という原則を採用している。
 *
 * そのため URL state は Query 実行前に **canonical 化**する必要がある。
 *
 * Data Flow
 * ---------
 *
 *     URL
 *       ↓
 *     params + search
 *       ↓
 *     normalizeUrlState
 *       ↓
 *     QueryParams
 *       ↓
 *     Query
 *
 *
 * Example
 * -------
 *
 * URL
 *
 *     /employees/123?keyword= react &page=
 *
 * Router state
 *
 *     params
 *       { id: "123" }
 *
 *     search
 *       { keyword: " react ", page: "" }
 *
 * normalizeUrlState
 *
 *     { id: "123", keyword: "react" }
 *
 *
 * Compatibility
 * -------------
 * この関数は次の両方の search に対応する。
 *
 * 1. validateSearch **前**
 * 2. validateSearch **後**
 *
 * つまり
 *
 *     string values
 *     number values
 *     optional values
 *
 * のどちらでも安全に動作する。
 *
 *
 * QueryKey Stability
 * ------------------
 * QueryKey の canonical 化を保証する。
 *
 * 例
 *
 *     /employees/123
 *     /employees/123?keyword=
 *     /employees/123?keyword=
 *
 * すべて
 *
 *     { id: "123" }
 *
 * になる。
 *
 *
 * Design Rules
 * ------------
 *
 * - params と search を同じルールで正規化する
 * - params と search をマージする
 * - 入力オブジェクトは変更しない
 * - 新しい QueryParams オブジェクトを返す
 *
 *
 * Usage
 * -----
 *
 * Router
 *
 *     const params = useParams()
 *     const search = useSearch()
 *
 *     const queryParams = normalizeUrlState(params, search)
 *
 *
 * QueryKey
 *
 *     const queryKey = [
 *       'employee',
 *       'one',
 *       'fetchEmployeeDetail',
 *       queryParams
 *     ]
 *
 *
 * Zod
 *
 *     const queryParams = normalizeUrlState(params, search)
 *     const validated = schema.parse(queryParams)
 */
export function normalizeUrlState<P extends UrlParams, S extends UrlSearch>(
	params: P,
	search: S,
) {
	// params を正規化
	const normalizedParams = normalizeObject(params)

	// search を正規化
	const normalizedSearch = normalizeObject(search)

	// params + search を統合して QueryParams を生成
	return {
		...normalizedParams,
		...normalizedSearch,
	} as const
}
