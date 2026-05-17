import { apiClient } from "@/features/api/apiClient"
import type { DetailItem } from "./types"

export async function updateDetailItem(args: {
	item: DetailItem
}): Promise<void> {
	return apiClient.put(`/api/crud/detail/$(args.item.id}`, { ...args.item })
}
