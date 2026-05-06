import type { RouterToast } from "@/lib/router/RouterToast"

export const routerToast: RouterToast = {
	error(error: unknown) {
		alert(error)
	},
	dismiss() {
		// no-op
	},
}
