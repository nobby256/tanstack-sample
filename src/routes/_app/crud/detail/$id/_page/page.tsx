import { zodResolver } from "@hookform/resolvers/zod"
import { boundary, useLeaveGuard, useRouteNavigation } from "@router-framework"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Route } from "../route"
import { updateDetailItem } from "./api.event"
import type { DetailItem } from "./types"

type PageProps = {
	loaderData: DetailItem
}

const formSchema = z.object({
	name: z.string().min(1, "Name は必須です"),
	description: z.string().min(1, "Description は必須です"),
})

type FormValues = z.infer<typeof formSchema>

export function Page({ loaderData }: PageProps) {
	const {
		register,
		handleSubmit,
		reset,
		formState: { isDirty, errors },
	} = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: loaderData.name,
			description: loaderData.description,
		},
	})

	useLeaveGuard({
		when: isDirty,
		confirmLeave: () =>
			window.confirm("変更されています。入力内容を破棄してよろしいですか？"),
	})

	const navigation = useRouteNavigation(Route)

	/*
	 * 更新ボタンのハンドラ
	 */
	const submitUpdate1 = boundary(async (formValues: FormValues) => {
		await updateDetailItem({
			item: {
				id: loaderData.id,
				version: loaderData.version,
				name: formValues.name,
				description: formValues.description,
			},
		})
		alert("Update successful")

		// 初期値を現在の値に更新することで、dirtyフラグをリセット
		reset(formValues)
	})

	const submitUpdate2 = boundary(async (formValues: FormValues) => {
		await updateDetailItem({
			item: {
				id: loaderData.id,
				version: loaderData.version,
				name: formValues.name,
				description: formValues.description,
			},
		})

		// URLを変えずにloaderの再実行
		await navigation.invalidate()

		alert("Update successful")
	})

	/*
	 * 戻るボタンのハンドラ
	 */
	const onClickReturn1 = boundary(async () => {
		// loaderの呼び出し "なし" で遷移
		await navigation.navigate({
			href: navigation.search._returnTo,
			skipLoader: true,
		})
	})
	const onClickReturn2 = boundary(async () => {
		// loaderの呼び出し "あり" で遷移
		await navigation.navigate({
			href: navigation.search._returnTo,
			skipLoader: false,
		})
	})
	const onClickReturn3 = boundary(async () => {
		// loaderの呼び出し "あり" で遷移
		await navigation.back()
	})

	/*
	 * UIStateの変更ハンドラ
	 */
	const onChangeCheckbox1 = boundary(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			await navigation.patchUiState({
				_check1: e.target.checked,
			})
		},
	)
	const onChangeCheckbox2 = boundary(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			await navigation.patchUiState(
				{
					_check2: e.target.checked,
				},
				{ ignoreBlocker: false },
			)
		},
	)

	return (
		<div>
			<h2>Detail</h2>

			<form>
				<fieldset>
					<legend>入力データ</legend>
					<div>id: {loaderData.id}</div>
					<div>version: {loaderData.version}</div>
					<div>
						Name:
						<input {...register("name")} />
						{errors.name && (
							<span className="error-message">{errors.name.message}</span>
						)}
					</div>
					<div>
						Description:
						<input {...register("description")} />
						{errors.description && (
							<span className="error-message">
								{errors.description.message}
							</span>
						)}
					</div>
					<button
						type="button"
						onClick={handleSubmit(submitUpdate1)}
						disabled={!isDirty}
						style={{ display: "block" }}
					>
						更新（更新した内容を信用してformオブジェクトを更新、versionは変わらない）
					</button>
					<button
						type="button"
						onClick={handleSubmit(submitUpdate2)}
						disabled={!isDirty}
						style={{ display: "block" }}
					>
						更新（サーバーから最新情報を再読み込み、versionが変わる）
					</button>
				</fieldset>

				<fieldset>
					<legend>UIStateのバリエーション</legend>
					<div>
						<input
							type="checkbox"
							checked={navigation.uiState._check1 ?? false}
							onChange={onChangeCheckbox1}
						/>
						dirty時でもblockに反応しない
					</div>
					<div>
						<input
							type="checkbox"
							checked={navigation.uiState._check2 ?? false}
							onChange={onChangeCheckbox2}
						/>
						dirty時にはblockに反応する
					</div>
				</fieldset>

				<fieldset>
					<legend>戻るのバリエーション</legend>
					<div>
						<button type="button" onClick={onClickReturn1}>
							loader 呼び出し無し
						</button>
					</div>
					<div>
						<button type="button" onClick={onClickReturn2}>
							loader 呼び出しあり
						</button>
					</div>
					<div>
						<button type="button" onClick={onClickReturn3}>
							loader 呼び出しあり（history.back）
						</button>
					</div>
				</fieldset>
			</form>
		</div>
	)
}
