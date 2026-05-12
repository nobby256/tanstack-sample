import { RouterProvider } from "@tanstack/react-router"
import ReactDOM from "react-dom/client"
import { MockProvider } from "@/mocks/MockProvider"
import { createAppRouter, registerAppExitGuard } from "./lib/core/router"

export { routerContext } from "./routerContext"

import { notifyError } from "./features/notify/notify"
import { registerErrorNotifier } from "./lib/core/error"
import { routeTree } from "./routeTree.gen"

// if (import.meta.env.DEV) {
//   const { worker } = await import('./mocks/browser')
//   await worker.start()
// }

// アプリケーションの終了ガードを登録
registerAppExitGuard()
// ルーターを作成
const router = createAppRouter(routeTree)
// エラー通知を登録
registerErrorNotifier(notifyError)

const rootElement = document.getElementById("app")
if (!rootElement) {
	throw new Error("Root element #app not found")
}

const root = ReactDOM.createRoot(rootElement)

root.render(
	<MockProvider>
		<RouterProvider router={router} />
	</MockProvider>,
)

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router
	}
}

// Back‑Forward Cache（bfcache）に対応するため、ページがキャッシュから復元されたときにリロードする
window.addEventListener("pageshow", (event) => {
	if (event.persisted) {
		window.location.reload()
	}
})
