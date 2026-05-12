import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import {
	dynamicLoaderPolicy,
	extractQueryState,
	navigationTx,
	normalizeSearch,
} from "@/lib/core/router"
import { loadPage } from "./_api/api.load"
import { Page } from "./_page/page"

// URL schema
// `_` prefix は UI state
const searchSchema = z.strictObject({
	_returnTo: z.string(),
	_check1: z.boolean().optional(),
	_check2: z.boolean().optional(),
})

export const Route = createFileRoute("/_app/crud/$id")({
	// Loader Policy
	...dynamicLoaderPolicy,

	// validate + canonicalize URL
	validateSearch: (search) => normalizeSearch(searchSchema.parse(search)),

	// Query state（UI state を除外）
	loaderDeps: ({ search }) => extractQueryState(search),

	// Router transaction wrapper
	loader: (args) =>
		navigationTx(args, () => loadPage({ ...args.params, ...args.deps })),

	// Page Component
	component: PageComponent,
})

function PageComponent() {
	const loaderData = Route.useLoaderData()
	return (
		<Page
			key={`${loaderData.id}:${loaderData.version}`}
			loaderData={loaderData}
		/>
	)
}
