/**
 * Route Layer: App
 */

import { initialLoaderPolicy } from "@router-framework"
import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_app")({
	// Loader Policy
	...initialLoaderPolicy,

	loaderDeps: () => ({}),

	component: RouteComponent,
})

function RouteComponent() {
	return (
		<div>
			<h1>Sample App</h1>
			<hr />
			<Outlet />
		</div>
	)
}
