import { $api } from "./$api"

/**
 * Query value type
 */
export type ApiQueryValue = string | number | boolean | null | undefined | Date

/**
 * Query parameters
 */
export type ApiQuery = Record<string, ApiQueryValue>

/**
 * Request body
 */
export type ApiBody = Record<string, unknown>

/**
 * API request options
 */
export interface ApiRequestOptions {
	headers?: Record<string, string>
	timeout?: number
	signal?: AbortSignal
}

/**
 * HTTP method
 */
type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

/**
 * 共通 request
 */
async function request<T>(
	method: ApiMethod,
	url: string,
	options: {
		query?: ApiQuery
		body?: ApiBody
	} & ApiRequestOptions = {},
): Promise<T> {
	return await $api<T>(url, {
		method,
		...options,
	})
}

/**
 * apiClient
 * ----------------------------------------------------------------------------
 * ofetch `$api` のシンプルなラッパー。
 *
 * 特徴
 *
 *   - HTTP メソッドごとに呼び出しを簡潔化
 *   - query / body を型安全に扱う
 */
export const apiClient = {
	get: async <T>(
		url: string,
		query?: ApiQuery,
		options?: ApiRequestOptions,
	): Promise<T> => {
		return await request<T>("GET", url, {
			...options,
			query,
		})
	},

	post<T>(
		url: string,
		body?: ApiBody,
		options?: ApiRequestOptions,
	): Promise<T> {
		return request<T>("POST", url, {
			...options,
			body,
		})
	},

	put<T>(url: string, body?: ApiBody, options?: ApiRequestOptions): Promise<T> {
		return request<T>("PUT", url, {
			...options,
			body,
		})
	},

	patch<T>(
		url: string,
		body?: ApiBody,
		options?: ApiRequestOptions,
	): Promise<T> {
		return request<T>("PATCH", url, {
			...options,
			body,
		})
	},

	delete<T>(
		url: string,
		query?: ApiQuery,
		options?: ApiRequestOptions,
	): Promise<T> {
		return request<T>("DELETE", url, {
			...options,
			query,
		})
	},
}
