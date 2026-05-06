# Router Cache Lifecycle

## 概要

本ドキュメントでは **TanStack Router の Loader Cache のライフサイクル**を説明する。

この文書は次のドキュメントを理解するための補助資料である。

- Navigation Driven Cache Strategy  
- Router Loader Cache Model  

ここでは TanStack Router において

- キャッシュが **いつ生成されるのか**  
- **どのように利用されるのか**  
- **いつ削除されるのか**

という **キャッシュのライフサイクル**を説明する。

また、本アーキテクチャでは **Global Data Architecture** により `_app loader` で取得されるグローバルデータも Router Cache に含まれる。

URL の状態構造については **URL State Model** を参照する。

---

# Router Cache の前提

Router Cache は **Navigation Driven Cache** である。

つまり

- React の再レンダリング  
- コンポーネント状態変更  

は Loader Cache に影響しない。

Loader の再評価が行われるのは次の場合のみである。

- Navigation が発生した場合  
- `router.invalidate()` が呼ばれた場合  
- `router.reload()` が呼ばれた場合  

ただし本アーキテクチャでは

```
router.reload()
```

の使用は禁止する。

理由は

```
URL = Navigation
```

という原則を維持するためである。

そのため Loader 再評価には

```
router.invalidate()
```

を使用する。

---

# Loader 再評価のトリガー

Loader の再評価は次のイベントで発生する。

- Navigation  
- router.invalidate()  
- router.reload()  

意味は次の通り。

### Navigation

URL変更による画面遷移

### router.invalidate()

キャッシュを無効化して Loader を再評価

### router.reload()

URL変更なしの Navigation

---

# Cache Creation

キャッシュは **Loader が実行されたときに生成される。**

基本フロー

```
Navigation
↓
Loader 実行
↓
Snapshot 生成
↓
Cache 保存
```

重要なポイントは次である。

Loader が実行された場合のみキャッシュが生成される。

このキャッシュには

- ページデータ  
- `_app loader` で取得されるグローバルデータ  

の両方が含まれる。

---

# Cache State

Router Cache のエントリは次の2つの状態を持つ。

- active  
- inactive  

---

## active cache

active cache は

**現在表示中の URL に対応するキャッシュ**

である。

つまり

現在表示されている route の snapshot が active cache となる。

active cache の場合は次の設定が評価される。

- shouldReload  
- staleReloadMode  

---

## inactive cache

inactive cache は

**現在の URL に対応していないキャッシュ**

である。

つまり

履歴に残っている snapshot が inactive cache となる。

inactive cache の場合は

- gcTime

による削除判定が行われる。

---

# staleTime（参考情報）

TanStack Router には

```
staleTime
```

という設定が存在する。

これはキャッシュが

- fresh  
- stale  

のどちらであるかを判定するための値である。

例

```
staleTime = X 秒
```

の場合

- ロードから X 秒以内 → fresh  
- ロードから X 秒以上 → stale  

となる。

一般的な SPA では

- fresh → キャッシュ使用  
- stale → Loader 再実行  

という戦略が採用される。

---

## 本アーキテクチャでの扱い

本アーキテクチャでは

- shouldReload  
- staleReloadMode  

によってキャッシュ戦略を制御する。

そのため

```
staleTime
```

は主要なキャッシュ制御手段としては使用しない。

Router の仕様として存在するが **補助的な情報として扱う。**

---

# shouldReload

shouldReload は

**Cache Hit 時に Loader を再実行するかどうか**

を制御する設定である。

挙動は次の通り。

```
shouldReload = true
→ Loader を再実行

shouldReload = false
→ キャッシュを使用
```

shouldReload は staleTime 判定よりも優先されるため  
キャッシュ戦略の主要な制御手段となる。

---

# staleReloadMode

staleReloadMode は

**Loader を再実行する場合の実行タイミング**

を制御する。

存在するモードは次の2つ。

- background  
- blocking  

---

## background

```
キャッシュを先に表示
↓
バックグラウンドで Loader 実行
```

UX を優先する場合に使用する。

---

## blocking

```
Loader 完了まで待つ
↓
画面表示
```

常に最新データが必要な場合に使用する。

---

# gcTime

gcTime は

**キャッシュが inactive になってから削除されるまでの時間**

を表す。

例

```
gcTime = X 秒
```

の場合

```
inactive から X 秒
↓
Cache 削除
```

となる。

---

## gcTime の設計

キャッシュの目的が

**履歴操作の UX 改善**

である場合、次のケースを考慮する必要がある。

```
検索結果
↓
詳細画面
↓
戻る
```

この場合

検索結果画面のキャッシュが残っている必要がある。

gcTime のカウントは

```
cache が inactive になった瞬間
```

から開始される。

---

# Cache Lifecycle

Router Cache は次のライフサイクルで動作する。

```
Navigation
↓
Loader 実行
↓
Snapshot 生成
↓
Cache 保存
↓
active / inactive 判定
↓
GC による削除
```

---

# Cache Explosion

Router Cache のキーは

```
Resource State + Query State
```

で決定される。

つまり Navigation が増えるほどキャッシュ数も増える。

例

```
/orders?page=1
/orders?page=2
/orders?page=3
/orders?page=4
/orders?page=5
```

ここで

- `orders` → Resource State  
- `page` → Query State  

である。

Client State（View State / Navigation Context）は  
キャッシュキーに含まれない。

---

# replace navigation の役割

replace navigation の役割は

**履歴数の制御**

である。

例

```
/orders?page=1   push
/orders?page=2   replace
/orders?page=3   replace
/orders?page=4   replace
```

履歴は

```
A → D
```

のように圧縮される。

---

# replace navigation の効果

履歴が少ないほど

active cache が減る。

結果として

inactive cache が増え、  
GC の削除対象が増える。

つまり

- キャッシュサイズ  
- メモリ使用量  

を適切に制御できる。

---

# まとめ

TanStack Router の Loader Cache は

```
routeId
Resource State (params)
Query State (loaderDeps)
```

によってキャッシュキーが決まり、

```
Navigation
```

を起点として

```
Loader 実行
Cache 保存
Cache 利用
```

が行われる。

Client State（View State / Navigation Context）は  
Loader / API / Cache に影響しない。

つまり

```
Resource State + Query State
```

によってキャッシュが決定される  
**Navigation Driven Cache Model**である。