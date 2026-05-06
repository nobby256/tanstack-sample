import { delay, HttpResponse, http } from "msw"
import type { DetailItem } from "@/routes/_app/crud/$id/_api/api.types"
import type { SummaryItem } from "@/routes/_app/crud/summary/_api/api.types"

export const handlers = [
	// http.get('/api/profile', () => {
	//   //return errorResponse(500, 'INTERNAL SERVER ERROR')
	//   return HttpResponse.json({
	//     userId: 'user-001',
	//     userName: 'demo-user',
	//     tenantId: 'tenant-001',
	//   })
	// }),

	// http.get('/api/app-data', async () => {
	//   //return errorResponse(500, 'INTERNAL SERVER ERROR')
	//   await delay(2000) // 2秒の遅延をシミュレート

	//   return HttpResponse.json({
	//     masterA: ['A001', 'A002', 'A003'],
	//     masterB: [
	//       { code: 'B001', name: 'マスタB-1' },
	//       { code: 'B002', name: 'マスタB-2' },
	//     ],
	//   })
	// }),

	http.get("/api/detail/:id", async ({ params }) => {
		await delay(2000) // 2秒の遅延をシミュレート
		//return errorResponse(500, 'INTERNAL SERVER ERROR')
		const id = String(params.id)

		return HttpResponse.json<DetailItem>(
			{
				id,
				name: `Item ${id}`,
				description: `This is detail for item ${id}`,
			},
			{
				status: 200,
			},
		)
	}),

	http.put("/api/detail/:id", async ({ params, request: _request }) => {
		await delay(2000) // 2秒の遅延をシミュレート
		//return errorResponse(500, 'INTERNAL SERVER ERROR')
		const _id = String(params.id)

		return HttpResponse.json<DetailItem>(undefined, { status: 204 })
	}),

	http.get("/api/summary", ({ request }) => {
		//return new HttpResponse(null, { status: 500 })
		const url = new URL(request.url)
		const keyword = url.searchParams.get("keyword") ?? ""
		const category = url.searchParams.get("category") ?? ""

		return HttpResponse.json<SummaryItem[]>([
			{
				id: "1",
				name: `${keyword || "サンプル"}-${category || "all"}-1`,
			},
			{
				id: "2",
				name: `${keyword || "サンプル"}-${category || "all"}-2`,
			},
		])
	}),

	// http.get('/api/ui-permissions', () => {
	//   //return errorResponse(500, 'INTERNAL SERVER ERROR')
	//   return HttpResponse.json({
	//     screens: ['top', 'detail.view', 'report.list'],
	//     actions: ['detail.update', 'detail.delete', 'report.export'],
	//   })
	// }),
]
