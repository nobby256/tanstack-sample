import { ofetch } from "ofetch"

export const $api = ofetch.create({
	//baseURL: '/api',

	headers: {
		"Content-Type": "application/json",
		"X-Requested-With": "XMLHttpRequest",
	},

	retry: import.meta.env.DEV ? 0 : 2,
})
