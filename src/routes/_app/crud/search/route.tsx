import {
	dynamicLoaderPolicy,
	extractQueryState,
	navigationTx,
	normalizeSearch,
} from "@router-framework"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { Page } from "./_page/page"

// URL schema
// `_` prefix は UI state
const searchSchema = z.strictObject({
	_check: z.boolean().optional(),
})

// ─────────────────────────────────────
// Route Definition
// ─────────────────────────────────────

export const Route = createFileRoute("/_app/crud/search")({
	// Loader Policy
	...dynamicLoaderPolicy,

	// validate + canonicalize URL
	validateSearch: (search) => normalizeSearch(searchSchema.parse(search)),

	// Query state（UI state を除外）
	loaderDeps: ({ search }) => extractQueryState(search),

	// Router transaction
	loader: (args) =>
		navigationTx(args, async () => {
			const data = undefined
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
