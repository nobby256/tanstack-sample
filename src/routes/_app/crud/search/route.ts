import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import {
	extractQueryState,
	navigationTx,
	noCachePolicy,
	normalizeSearch,
} from "@/lib/core/router"

import { loadPage } from "./_api/api.load"
import { Page } from "./_page/page"

// URL schema
// `_` prefix は UI state
const searchSchema = z
	.object({
		_check: z.boolean().optional(),
	})
	.default({})

export const Route = createFileRoute("/_app/crud/search")({
	// Cache Policy
	...noCachePolicy,

	// validate + canonicalize URL
	validateSearch: (search) => normalizeSearch(searchSchema.parse(search)),

	// Query state（UI state を除外）
	loaderDeps: ({ search }) => extractQueryState(search),

	// Router transaction wrapper
	loader: (args) =>
		navigationTx(args, () => loadPage({ ...args.params, ...args.deps })),

	// Page Component
	component: Page,
})
