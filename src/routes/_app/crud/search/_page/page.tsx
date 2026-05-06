import { useNavigate } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { safeHandler } from "@/features/error-handling/safeHandler"
import { useUIState } from "@/lib/core/router"
import { Route } from "../route"

type FormValues = {
	keyword: string
	category: string
}

export function Page() {
	const navigate = useNavigate()
	const { uiState, patchUiState } = useUIState(Route)
	const { register, handleSubmit } = useForm<FormValues>({
		defaultValues: {
			keyword: "",
			category: "",
		},
	})

	const onChangeCheckbox = safeHandler(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			await patchUiState({
				_check: e.target.checked,
			})
		},
	)

	const submitSearch = safeHandler(async (data: FormValues) => {
		await navigate({
			to: "/crud/summary",
			search: {
				keyword: data.keyword,
				category: data.category,
			},
		})
	})

	return (
		<div>
			<h2>Search</h2>
			<form onSubmit={handleSubmit(submitSearch)}>
				<input placeholder="keyword" {...register("keyword")} />
				<input placeholder="category" {...register("category")} />
				<input
					type="checkbox"
					checked={uiState._check ?? false}
					onChange={onChangeCheckbox}
				/>
				<button type="submit">Search</button>
			</form>
		</div>
	)
}
