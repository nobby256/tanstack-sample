import { useForm } from "react-hook-form"
import { boundary } from "@/lib/core/handler"
import { useRouteNavigation } from "@/lib/core/router"
import { Route } from "../route"

type PageProps = {
	loaderData: undefined
}

type FormValues = {
	keyword: string
	category: string
}

export function Page({ loaderData: _loaderData }: PageProps) {
	const navigation = useRouteNavigation(Route)

	const { register, handleSubmit } = useForm<FormValues>({
		defaultValues: {
			keyword: "",
			category: "",
		},
	})

	const onChangeCheckbox = boundary(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			await navigation.patchUiState({
				_check: e.target.checked,
			})
		},
	)

	const submitSearch = boundary(async (data: FormValues) => {
		await navigation.navigate({
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
					checked={navigation.uiState._check ?? false}
					onChange={onChangeCheckbox}
				/>
				<button type="submit">Search</button>
			</form>
		</div>
	)
}
