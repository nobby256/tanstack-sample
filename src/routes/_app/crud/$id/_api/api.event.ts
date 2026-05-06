import { apiClient } from "@/lib/network/api"
import type { DetailItem } from "./api.types"

export async function updateDetailItem(args: {
	item: DetailItem
}): Promise<void> {
	return apiClient.put(`/api/detail/$(args.item.id}`, { ...args.item })
}
