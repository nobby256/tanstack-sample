/**
 * Route Layer: App
 */

import { createFileRoute } from "@tanstack/react-router"
import { staticCachePolicy } from "@/lib/core/router"
import { Layout } from "./_page/layout"

export const Route = createFileRoute("/_app")({
	...staticCachePolicy,

	loaderDeps: () => ({}),

	component: Layout,
})
