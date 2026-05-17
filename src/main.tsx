import { initializeAppRuntime } from "@router-framework"
import { RouterProvider } from "@tanstack/react-router"
import ReactDOM from "react-dom/client"
import { notifyError } from "./features/notify"
import { routeTree } from "./routeTree.gen"

// ─────────────────────────────────────
// Framework Setting
// ─────────────────────────────────────

const router = initializeAppRuntime(routeTree, {
	errorNotifier: notifyError,
	defaultGcTime: 1_800_000, // 30分（tanstack routerのデフォルト値と同じ）
	scrollRestoration: true,
})

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router
	}
}

// ─────────────────────────────────────
// Bootstrap
// ─────────────────────────────────────

async function bootstrap() {
	if (import.meta.env.DEV) {
		const { worker } = await import("./mocks/browser")
		await worker.start({
			onUnhandledRequest(req, print) {
				if (req.url.startsWith("/api/")) {
					print.warning()
				}
			},
		})
	}

	const rootElement = document.getElementById("app")
	if (!rootElement) {
		throw new Error("Root element #app not found")
	}
	const root = ReactDOM.createRoot(rootElement)
	root.render(<RouterProvider router={router} />)
}

void bootstrap().catch((error) => {
	console.error("Bootstrap failed", error)
})
