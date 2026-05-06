了解です。  
今の設計での **`navigationTx` と `eventTx` の使い方を、実際の利用場所ごとに整理してまとめます。**  
目的は

```
・どこで使うか
・どう書くか
・何が起きるか
```

を一目で分かるようにすることです。

---

# 全体構造

あなたのアプリではトランザクションは2種類あります。

```
Router navigation
UI event
```

それぞれ対応するラッパーが

```
navigationTx
eventTx
```

です。

---

# navigationTx

## 目的

```
beforeLoad / loader の例外を Router ポリシーに従って処理する
```

処理内容

```
redirect / notFound → 再throw
preload error → 無視
navigation loop → redirectOnNavigationLoop
通常エラー → notifyLoadError
→ redirect(previous)
```

---

## 使用場所

```
loader
beforeLoad
```

---

## 例

```ts
loader: (args) =>
  navigationTx(args,
    () => loadDetailPage({ ...args.params, ...args.deps })
  )
```

---

## beforeLoad 例

```ts
beforeLoad: (args) =>
  navigationTx(args, async () => {
    await checkPermission(args.params.id)
  })
```

---

## 実行フロー

```
loader
↓
navigationTx
↓
runTransaction
↓
handleNavigationError
↓
Router policy
```

---

# eventTx

## 目的

```
UIイベントの例外を UI ポリシーで処理する
```

処理内容

```
normalizeError
fatal → throw
recoverable → notifyEventError
```

---

## 使用場所

```
onClick
onSubmit
onChange
```

など

---

## 例

```tsx
<button
  onClick={eventTx(async () => {
    await saveUser()
  }, notifyEventError)}
>
  Save
</button>
```

---

## event object を使う場合

```tsx
<button
  onClick={eventTx(async (e) => {
    console.log(e.currentTarget)
    await saveUser()
  }, notifyEventError)}
>
```

---

# notifyEventError

```ts
function notifyEventError(error: AppError) {
  toast.error(error.message)
}
```

---

# navigationTx と eventTx の関係

```
runTransaction
   ↑
   ├ navigationTx
   └ eventTx
```

つまり

```
共通トランザクション
＋
policy
```

で構成されています。

---

# Router側

Router 側は

```
RouterContext
```

で UI を注入します。

```ts
const router = createAppRouter(routeTree, {
  notifyLoadError,
  redirectOnNavigationLoop
})
```

---

# UI側

```ts
function notifyLoadError(error: unknown) {
  alert(error)
}
```

---

# まとめ

|用途|ラッパー|使用場所|
|---|---|---|
Router navigation|`navigationTx`|loader / beforeLoad|
UIイベント|`eventTx`|onClick / onSubmit|

---

# 使い分けのルール

```
Router navigation → navigationTx
UIイベント → eventTx
```

---

# 最後に

この構造は

```
Router-first SPA
```

としてかなり良いパターンです。

理由

```
Router policy
UI policy
transaction core
```

がすべて分離されているからです。

---

もし希望があれば、  
**この設計を README に書くならどう説明するか**もまとめます。