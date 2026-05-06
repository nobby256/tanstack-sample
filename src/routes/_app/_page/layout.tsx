import { Outlet } from "@tanstack/react-router"

export function Layout() {
	return (
		<div>
			<h1>Sample App</h1>
			<hr />
			<Outlet />
		</div>
	)
}
