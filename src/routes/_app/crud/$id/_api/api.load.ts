import { apiClient } from "@/features/api/apiClient"
import type { DetailItem } from "./api.types"

export interface LoadPageParams {
	id: string
}

export async function loadPage(params: LoadPageParams) {
	return apiClient.get<DetailItem>(`/api/detail/${params.id}`)
}
