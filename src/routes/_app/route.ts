/**
 * Route Layer: App
 */

import { createFileRoute } from "@tanstack/react-router"
import { initialLoaderPolicy } from "@/lib/core/router"
import { Layout } from "./_page/layout"

export const Route = createFileRoute("/_app")({
	...initialLoaderPolicy,

	loaderDeps: () => ({}),

	component: Layout,
})
