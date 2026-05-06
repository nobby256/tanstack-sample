import { TanStackDevtools } from "@tanstack/react-devtools"
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import type { RouterContext } from "@/lib/router"
import { Spinner } from "@/ui/spinner/Spinner"

import "../styles.css"

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootComponent,
	pendingComponent: Spinner, // buforeLoadで遷移がpendingになったときに表示するコンポーネント
	pendingMs: 200, // 200ms後にpendingComponentを表示
	pendingMinMs: 500, // pendingComponentは最低でも500ms表示する
})

function RootComponent() {
	return (
		<>
			<Outlet />
			<TanStackDevtools
				config={{
					position: "bottom-right",
				}}
				plugins={[
					{
						name: "TanStack Router",
						render: <TanStackRouterDevtoolsPanel />,
					},
				]}
			/>
		</>
	)
}
