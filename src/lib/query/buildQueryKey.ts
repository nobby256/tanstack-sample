/**
 * QueryKey
 * ----------------------------------------------------------------------------
 * React Query で使用する QueryKey の型。
 *
 * 本プロジェクトでは QueryKey を次の4階層で定義する。
 *
 *   [entity]
 *   [entity, scope]
 *   [entity, scope, queryName]
 *   [entity, scope, queryName, QueryParams]
 *
 *
 * entity
 * ----------------------------------------------------------------------------
 * キャッシュ破棄の単位。
 *
 * 例
 *
 *   employee
 *   order
 *   customer
 *
 *
 * scope
 * ----------------------------------------------------------------------------
 * データ取得の粒度。
 *
 * 基本値
 *
 *   one
 *   many
 *
 * 拡張例
 *
 *   stats
 *   preview
 *   export
 *
 *
 * queryName
 * ----------------------------------------------------------------------------
 * Query の識別名。
 *
 * 通常は
 *
 *   fetchEmployeeDetail
 *   fetchEmployeeSearch
 *
 * のように Action + Entity + Purpose で命名する。
 *
 *
 * QueryParams
 * ----------------------------------------------------------------------------
 * Query の入力パラメータ。
 *
 * QueryParams は次の特徴を持つ。
 *
 * - URL state 由来
 * - normalizeUrlState によって canonical 化されている
 * - API Request と同一オブジェクト
 *
 *
 * QueryKey Examples
 * ----------------------------------------------------------------------------
 *
 * entity only
 *
 *   ['employee']
 *
 * entity + scope
 *
 *   ['employee','many']
 *
 * entity + scope + queryName
 *
 *   ['employee','many','fetchEmployeeSearch']
 *
 * full key
 *
 *   ['employee','many','fetchEmployeeSearch',{ keyword:'react' }]
 */
export type QueryKey<
	Entity extends string,
	Scope extends string,
	Name extends string,
	Params = undefined,
> =
	| readonly [Entity]
	| readonly [Entity, Scope]
	| readonly [Entity, Scope, Name]
	| readonly [Entity, Scope, Name, Params]

/**
 * buildQueryKey
 * ----------------------------------------------------------------------------
 * QueryKey を生成するユーティリティ。
 *
 * 目的
 *
 *   - QueryKey の手書きを防ぐ
 *   - 型安全を保証する
 *   - QueryKey 構造を統一する
 *
 *
 * request canonicalization
 * ----------------------------------------------------------------------------
 *
 * QueryParams は
 *
 *   normalizeRequest
 *
 * によって canonical state に変換される。
 *
 *
 * サポートする呼び出し形式
 * ----------------------------------------------------------------------------
 *
 * entity
 *
 *   buildQueryKey('employee')
 *
 * entity + scope
 *
 *   buildQueryKey('employee','many')
 *
 * entity + scope + queryName
 *
 *   buildQueryKey('employee','many','fetchEmployeeSearch')
 *
 * entity + scope + queryName + params
 *
 *   buildQueryKey('employee','many','fetchEmployeeSearch', params)
 */

/**
 * overload
 * entity
 */
export function buildQueryKey<E extends string>(entity: E): readonly [E]

/**
 * overload
 * entity + scope
 */
export function buildQueryKey<E extends string, S extends string>(
	entity: E,
	scope: S,
): readonly [E, S]

/**
 * overload
 * entity + scope + queryName
 */
export function buildQueryKey<
	E extends string,
	S extends string,
	N extends string,
>(entity: E, scope: S, name: N): readonly [E, S, N]

/**
 * overload
 * full key
 */
export function buildQueryKey<
	E extends string,
	S extends string,
	N extends string,
	P extends object,
>(entity: E, scope: S, name: N, params: P): readonly [E, S, N, Partial<P>]

export function buildQueryKey(
	entity: string,
	scope?: string,
	name?: string,
	params?: object,
) {
	// entity only
	if (scope === undefined) {
		return [entity] as const
	}

	// entity + scope
	if (name === undefined) {
		return [entity, scope] as const
	}

	// entity + scope + name
	if (params === undefined) {
		return [entity, scope, name] as const
	}

	// params が空になった場合
	if (Object.keys(params).length === 0) {
		return [entity, scope, name] as const
	}

	// full key
	return [entity, scope, name, params] as const
}
