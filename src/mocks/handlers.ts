import { delay, HttpResponse, http } from "msw"
import type { DetailItem } from "@/routes/_app/crud/detail/$id/_page/types"
import type { SummaryItem } from "@/routes/_app/crud/summary/_page/types"

let versionCounter = 1

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

	http.get("/api/crud/detail/:id", async ({ params }) => {
		//return errorResponse(500, 'INTERNAL SERVER ERROR')
		const id = String(params.id)

		return HttpResponse.json<DetailItem>(
			{
				id,
				name: `Item ${id}`,
				description: `This is detail for item ${id}`,
				version: versionCounter,
			},
			{
				status: 200,
			},
		)
	}),

	http.put("/api/crud/detail/:id", async ({ params, request: _request }) => {
		// return HttpResponse.json(
		// 	{ message: "INTERNAL SERVER ERROR" },
		// 	{ status: 500 },
		// )
		const _id = String(params.id)
		versionCounter++
		return HttpResponse.json<DetailItem>(undefined, { status: 204 })
	}),

	http.get("/api/crud/summary", async ({ request }) => {
		await delay(2000) // 2秒の遅延をシミュレート
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
