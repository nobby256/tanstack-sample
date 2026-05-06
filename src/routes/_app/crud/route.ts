/**
 * Route Layer: Domain
 * URL Segment: /crud
 */

import { createFileRoute } from "@tanstack/react-router"
import { Layout } from "./_page/layout"

export const Route = createFileRoute("/_app/crud")({
	component: Layout,
})
