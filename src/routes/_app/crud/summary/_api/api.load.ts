import { apiClient } from "@/lib/network/api"
import type { SummaryItem } from "./api.types"

export interface LoadPageParams {
	keyword?: string
	category?: string
}

export async function loadPage(params: LoadPageParams) {
	return await apiClient.get<SummaryItem[]>(`/api/summary`, { ...params })
}
