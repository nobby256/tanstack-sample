import { useRouter } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { safeHandler } from "@/features/error-handling/safeHandler"
import { useNavigateWithoutDataLoad } from "@/lib/core/router"
import { updateDetailItem } from "../_api/api.event"
import { Route } from "../route"

type FormValues = {
	name: string
	description: string
}

export function Page() {
	const router = useRouter()
	const search = Route.useSearch()
	const navigationWithoutDataLoad = useNavigateWithoutDataLoad()
	const item = Route.useLoaderData()
	const { register, handleSubmit } = useForm<FormValues>({
		defaultValues: {
			name: item.name,
			description: item.description,
		},
	})

	const submitUpdate = safeHandler(async (data: FormValues) => {
		await updateDetailItem({
			item: {
				id: item.id,
				name: data.name,
				description: data.description,
			},
		})

		alert("Update successful")

		// 履歴を使用して遷移する例（loaderの呼び出しあり）
		router.history.back()
	})
	const onClickCancel = safeHandler(async () => {
		// loaderの呼び出しなしで遷移する例
		await navigationWithoutDataLoad({
			href: search._returnTo,
		})
	})

	return (
		<div>
			<h2>Detail</h2>

			<form onSubmit={handleSubmit(submitUpdate)}>
				<div>ID: {item.id}</div>
				<div>
					Name:
					<input {...register("name")} />
				</div>
				<div>
					Description:
					<input {...register("description")} />
				</div>
				<button type="submit">Update</button>
				<button type="button" onClick={onClickCancel}>
					Cancel
				</button>
			</form>
		</div>
	)
}
