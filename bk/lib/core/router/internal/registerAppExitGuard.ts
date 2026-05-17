/**
 * アプリ離脱ガードの設定です。
 */
export interface AppExitGuardOptions {
	/**
	 * 離脱確認を有効にするかどうかです。
	 *
	 * 既定値は `true` です。
	 */
	enabled?: boolean
}

/**
 * document unload を伴うアプリ離脱ガードを登録します。
 *
 * 対象:
 * - タブクローズ
 * - リロード
 * - URL 直接入力
 * - 外部サイト遷移など document unload を伴う遷移
 *
 * ブラウザ標準の確認ダイアログが表示され、文言はカスタマイズできません。
 *
 * 戻り値として解除関数を返します。
 */
export function registerAppExitGuard({
	enabled = true,
}: AppExitGuardOptions = {}): () => void {
	if (!enabled) {
		return () => undefined
	}

	const handleBeforeUnload = (event: BeforeUnloadEvent) => {
		event.preventDefault()
	}

	window.addEventListener("beforeunload", handleBeforeUnload)

	return () => {
		window.removeEventListener("beforeunload", handleBeforeUnload)
	}
}
