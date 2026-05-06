# Router Loader Cache Model

## 概要

本ドキュメントでは **TanStack Router の Loader Cache の仕組み**を説明する。

この文章は **Navigation Driven Cache Strategy** で説明しているキャッシュ戦略を理解するための補助資料である。

目的は次の点を理解することである。

- TanStack Router の Loader がどのようにキャッシュを生成するのか  
- どのようにキャッシュが利用されるのか  

つまり **Router のキャッシュ内部仕様を理解するための資料**である。

そのため本ドキュメントでは

- アーキテクチャ固有の設定  
- プロジェクト固有のキャッシュ戦略  

ではなく

**TanStack Router の基本仕様**

を中心に説明する。

URL がどのような状態構造を持つかについては  
**URL State Model** を参照する。

---

# Loader Cache Key

TanStack Router の Loader Cache は  
**URLそのものではなく Loader の依存関係によってキャッシュキーが決まる。**

概念的には次のようになる。

```
Cache Key = (routeId, params, loaderDeps)
```

つまり

- routeId  
- params  
- loaderDeps  

の組み合わせでキャッシュエントリーが生成される。

URL State Model の観点では

```
Cache Key = Resource State + Query State
```

である。

Client State（View State / Navigation Context）は Cache Key に含まれない。

---

# loaderDeps の役割

`loaderDeps` は **Loader の入力データを定義する関数**である。

Loader の結果に影響を与える値はすべて `loaderDeps` に含める必要がある。

この設計により次の関係が成立する。

```
URL
↓
validateSearch
↓
extractQueryState
↓
loaderDeps
↓
Cache Key
```

つまり

```
loaderDeps = Query State
```

となる。

---

# routeId

`routeId` は Router の route 定義を識別する ID である。

各 route の Loader は

```
独立したキャッシュ領域
```

を持つ。

そのため

- 異なる route

は

- 別キャッシュ

として扱われる。

---

# params

`params` は URL の **Route Params** である。

URL State Model では

```
Resource State
```

を表す。

例

```
/orders/123
/orders/456
```

この場合

```
params = { orderId: 123 }
params = { orderId: 456 }
```

となり、それぞれ別キャッシュになる。

---

# loaderDeps

`loaderDeps` は Loader の入力データを定義する関数である。

本アーキテクチャでは

```
Query State
```

を `loaderDeps` に含める。

例

```
loaderDeps: ({ search }) => ({
  page: search.page,
  keyword: search.keyword
})
```

この場合キャッシュキーは次のようになる。

```
(routeId, params, { page: 1, keyword: 'abc' })
(routeId, params, { page: 2, keyword: 'abc' })
```

つまり

- Query State が変わると  
- 別キャッシュになる。

---

# validateSearch の役割

`validateSearch` は

- URL の検証  
- URL の正規化  

を行う機能である。

処理の流れは次の通り。

```
URL
↓
validateSearch
↓
normalized search
↓
extractQueryState
↓
loaderDeps
↓
Cache Key
```

`validateSearch` は URL の正規化を行うことで **Cache Key の安定性**にも寄与する。

---

# Loader Execution Flow

Navigation が発生すると Router は次の順序で処理を行う。

```
Navigation
↓
Route Match
↓
beforeLoad 実行
↓
Cache Key 計算
↓
Cache Hit 判定
↓
shouldReload 判定
↓
Loader 実行 or Cache 使用
```

ここで重要なのは

```
beforeLoad はキャッシュとは無関係に毎回実行される
```

という点である。

Loader Cache の対象になるのは **loader の戻り値のみ**である。

---

# Cache Hit

Cache Key が一致するキャッシュが存在する場合

```
Cache Hit
```

となる。

この場合

- shouldReload  
- staleReloadMode  
- staleTime  

の判定によって

- Loader を再実行するか  
- キャッシュを使用するか  

が決まる。

---

# Cache Miss

Cache Key が一致するキャッシュが存在しない場合

```
Cache Miss
```

となる。

この場合

```
Loader 実行
↓
Snapshot 生成
↓
Cache 保存
```

となる。

---

# shouldReload

`shouldReload` は

**Cache Hit の場合に Loader を再実行するかどうか**

を制御する関数である。

```
shouldReload = true  → loader を再実行
shouldReload = false → cache を使用
```

この設定は **staleTime 判定より優先される**ため、キャッシュ戦略の主要な制御手段として使用される。

---

# staleReloadMode

`staleReloadMode` は **loader を再実行する場合の実行タイミング**を制御する。

存在するモードは次の2種類である。

- background  
- blocking  

### background

```
キャッシュを先に表示
↓
バックグラウンドで loader 実行
```

UX を優先する場合に使用する。

### blocking

```
loader 完了まで待つ
↓
画面表示
```

常に最新データを必要とする場合に使用する。

---

# staleTime（参考情報）

TanStack Router には `staleTime` という設定が存在する。

これは

```
キャッシュが fresh か stale か
```

を判定するための値である。

```
staleTime = X秒
```

の場合

- ロードから X 秒以内 → fresh  
- ロードから X 秒以上 → stale  

となる。

一般的な SPA では

- fresh → cache 使用  
- stale → loader 再実行  

というキャッシュ戦略が採用される。

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

は **キャッシュ制御の主要手段としては使用しない。**

つまり

```
Router の仕様として存在するが補助的な情報として扱う
```

---

# router.invalidate()

`router.invalidate()` は

**キャッシュを無効化し Loader を再評価する API**である。

```
router.invalidate()
```

が呼ばれると

- navigation が発生しなくても  
- Loader は再実行される

---

# Navigation Driven Cache

TanStack Router の Loader Cache は

```
navigation driven cache
```

である。

つまり

- React の再レンダリング  
- state の変更  

は Loader Cache に影響しない。

```
navigation が発生しない限り
Loader は再評価されない
```

また

```
キャッシュも増減しない
```

という特徴を持つ。

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