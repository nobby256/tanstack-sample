import { apiClient } from "@/features/api/apiClient"
import type { DetailItem } from "./api.types"

export async function updateDetailItem(args: {
	item: DetailItem
}): Promise<void> {
	return apiClient.put(`/api/detail/$(args.item.id}`, { ...args.item })
}
