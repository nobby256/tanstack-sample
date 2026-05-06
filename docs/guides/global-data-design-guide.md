# Global Data Design Guide

## 概要

本ドキュメントでは **アプリケーション全体で共有されるデータ（Global Data）** の取得・共有・更新方法を説明する。

Router‑First SPA Architecture では **Router Loader Data をグローバル状態として利用する。**

これにより次の効果が得られる。

- グローバルストアを導入する必要がない  
- Router‑first Architecture と整合する  
- データ取得タイミングを Navigation に統一できる  

また本アーキテクチャでは **トランザクションデータはキャッシュしない**ため、  
キャッシュを利用するのは主に **マスタデータなどの共有データ**である。

---

# 設計原則

本アーキテクチャでは次の原則を採用する。

```
Global Data = Router Loader Data
```

つまり、アプリケーション全体で共有するデータも  
通常の画面データと同様に **Router Snapshot Model** によって取得・共有される。

---

# Global Data の取得モデル

Global Data は Router の階層 Loader を利用して取得する。

```
Navigation
↓
_app Loader
↓
Global Snapshot
↓
Page Loader
↓
Page Snapshot
↓
UI
```

つまり

```
Global Data
+
Page Data
```

の両方が **Navigation Transaction の中で取得される。**

この構造により

- データ取得タイミングが Navigation に統一される  
- キャッシュ整合性問題を回避できる  
- 状態管理が単純化される  

---

# Global Data に適したデータ

Global Data には **アプリケーション全体で共有されるデータ**を配置する。

例

- ユーザープロファイル  
- Feature Flags  
- マスターデータ  
- アプリ設定  

これらのデータは

- 更新頻度が低い  
- UI 全体で参照される  
- Navigation 単位で更新しても問題がない  

という特徴を持つ。

---

# Global Data に適さないデータ

次のようなデータは Global Data に含めない。

- 一覧データ  
- 検索結果  
- トランザクションデータ  
- 一時的な UI 状態  

これらは **ページデータとして Loader で取得する。**

---

# Router 階層

グローバルデータは **`_app` ルート**で取得する。

Router 構造

```
__root
  ↓
_app
  ↓
domain
  ↓
page
```

このうち

```
_app
```

が **Global Data の取得ポイント**になる。

---

# グローバルデータ取得

グローバルデータは **`_app` の loader**で取得する。

例

```ts
export const Route = createFileRoute('/_app')({
  loader: async () => {
    return await loadGlobalData()
  }
})
```

取得されたデータは **Router Loader Data** として保持される。

---

# データ共有

取得したデータは **Router Loader Data** として  
アプリケーション全体で共有される。

```
Global Data = Loader Data
```

---

# コンポーネントからの取得

コンポーネントからは `useLoaderData('/_app')` を直接使用せず、  
専用の Hook を通して取得する。

例

```ts
export function useAppData() {
  return useLoaderData({ from: '/_app' })
}
```

---

# Hook の配置

Global Data 用の Hook は

```
src/feature/global
```

に配置する。

例

```
feature/global
 ├ useAppData.ts
 ├ useUser.ts
 └ useFeatureFlags.ts
```

例

```ts
export function useUser() {
  const data = useAppData()
  return data.user
}
```

この設計により **Router API への依存を Hook 層に隔離**できる。

---

# 複数データの扱い

複数のグローバルデータは **BFF 側で1つのレスポンスに集約**する。

例

```
GlobalAppResponse
{
  user,
  featureFlags,
  masterData
}
```

クライアントでは用途に応じて分離して使用する。

例

- `useUser()`
- `useFeatureFlags()`
- `useMasterData()`

---

# データの不変性

Router Loader Data は **immutable（不変）データ**として扱う。

理由

```
Loader Data = Snapshot
```

であるためである。

Loader Data を直接変更すると

- UI状態  
- キャッシュ状態  

の不整合が発生する可能性がある。

---

# グローバルデータ更新

グローバルデータ更新は次の手順で行う。

```
更新 API 呼び出し
↓
router.invalidate('/_app')
↓
loader 再実行
↓
グローバルデータ再取得
```

例

```ts
await updateProfile(payload

router.invalidate({ to: '/_app' })
```

---

# 大きなグローバルデータ

グローバルデータが大きく **再取得コストが高い**場合は  
Router 階層を分割する。

例

```
_app
  マスターデータ

_user
  ユーザープロファイル
```

これにより **invalidate の影響範囲（scope）** を限定できる。

---

# まとめ

グローバルデータ管理の基本ルール

取得  
`_app loader`

共有  
`Router Loader Data`

参照  
`feature/global Hook`

更新  
`API → router.invalidate`

不変  
`immutable snapshot`

この設計により

- グローバルストア不要  
- Router‑first Architecture と整合  
- シンプルな状態共有  

を実現できる。
