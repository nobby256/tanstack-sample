import {
	dynamicLoaderPolicy,
	extractQueryState,
	navigationTx,
	normalizeSearch,
} from "@router-framework"

import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import { apiClient } from "@/features/api/apiClient"
import { Page } from "./_page/page"
import type { DetailItem } from "./_page/types"

// ─────────────────────────────────────────────
// URL Schema
// `_` prefix = UI state
// ─────────────────────────────────────────────

const searchSchema = z.strictObject({
	_returnTo: z.string(),
	_check1: z.boolean().optional(),
	_check2: z.boolean().optional(),
})

// ─────────────────────────────────────
// Route Definition
// ─────────────────────────────────────

export const Route = createFileRoute("/_app/crud/detail/$id")({
	// Loader Policy
	...dynamicLoaderPolicy,

	// validate + canonicalize URL
	validateSearch: (search) => normalizeSearch(searchSchema.parse(search)),

	// Query state（UI state を除外）
	loaderDeps: ({ search }) => extractQueryState(search),

	// Router transaction
	loader: (args) =>
		navigationTx(args, async () => {
			const { id } = args.params
			const data = await apiClient.get<DetailItem>(`/api/crud/detail/${id}`)
			return { data, pageKey: crypto.randomUUID() }
		}),

	// Page Adapter
	component: RouteComponent,
})

// ─────────────────────────────────────
// Page Adapter
// ─────────────────────────────────────

function RouteComponent() {
	const result = Route.useLoaderData()
	return <Page key={result.pageKey} loaderData={result.data} />
}
