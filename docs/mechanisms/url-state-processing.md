# URL State Processing

## 概要

本プロジェクトでは **URL をアプリケーションの入力状態として扱う。**

基本原則

```
URL = Application State
```

URL は単なるナビゲーション情報ではなく、次の処理の入力として使用される。

- Router Loader の入力  
- BFF API の引数  
- Router Loader Cache のキー  

Router‑first SPA では **URL を中心としたデータフロー**を構築する。

URL がどのような状態構造を持つかについては  
**URL State Model** を参照する。

---

# URL Processing Flow

URL は Router を通して次の手順で処理される。

```
URL
↓
validateSearch
↓
normalizeSearch
↓
loaderDeps
↓
extractQueryState
↓
loader
↓
API
```

最終的に API には次のデータが渡される。

```
params + deps
```

つまり

- **params** → Resource State（Route Params）
- **deps** → Query State

である。

---

# URL State Structure

URL の状態構造は **URL State Model** によって定義される。

```
URL
├─ Route Params → Resource State
└─ Search Params
     ├─ Query State
     └─ Client State
          ├─ View State
          └─ Navigation Context
```

| State | 役割 |
|------|------|
| Resource State | リソース識別 |
| Query State | サーバーデータ取得条件 |
| Client State | クライアント UI 状態 |
| View State | UI 表示状態 |
| Navigation Context | ナビゲーション制御情報 |

このうち **Loader / API / Cache に影響するのは Resource State と Query State のみ**である。

---

# Route Params

Route Params は **URL パスに含まれる状態**であり  
Resource State を表す。

例

```
/orders/123
```

この場合

```
orderId = 123
```

が Resource State となる。

Router では次の形で取得される。

```
params
```

Resource State は

- Loader Input  
- API Input  
- Cache Key  

として使用される。

---

# Search Params

Search Params は **URL のクエリパラメータ**である。

例

```
/orders?page=2&status=OPEN
```

Router では次の形で取得される。

```
search
```

Search Params には次の2種類の状態が含まれる。

- Query State  
- Client State  

詳細は **URL State Model** を参照する。

---

# Query State

Query State は **サーバーデータ取得条件**を表す状態である。

例

```
keyword
page
status
category
```

Query State は

- Loader Input  
- API Request  
- Loader Cache Key  

として使用される。

---

# Client State

Client State は **クライアント UI のための状態**である。

Client State は

- Loader Input  
- API Request  
- Loader Cache Key  

には含まれない。

つまり

```
Client State = UI 専用状態
```

である。

Client State は次の2種類に分類される。

```
View State
Navigation Context
```

---

# View State

View State は **UI 表示状態**を表す。

例

```
_tab
_modal
_sort
_page
```

例

```
/orders?page=2&_tab=detail
```

| parameter | state |
|---|---|
| page | Query State |
| _tab | View State |

---

# Navigation Context

Navigation Context は **ナビゲーション制御のための状態**である。

例

```
_returnTo
```

例

```
/orders/123/edit?_returnTo=/orders?page=2
```

Navigation Context は

- Loader Input
- API Request
- Cache Key

には影響しない。

---

# Client State の命名規則

Client State は次の命名規則を使用する。

```
_ prefix
```

例

```
_tab
_modal
_sort
_page
_returnTo
```

この prefix は

```
Loader / API / Cache に影響しない
```

ことを意味する。

---

# Canonical URL

Router‑first SPA では

```
同じ状態を表す URL
→ 常に同じ形式
```

である必要がある。

そのため Search Params は **Canonical Form** に正規化される。

この処理を行うのが

```
normalizeSearch()
```

である。

---

# normalizeSearch

`normalizeSearch` は Search Params を正規化する関数である。

主な処理

- key のソート  
- undefined / null の削除  
- 空文字の削除  
- string の trim  
- 配列順序の正規化  

例

入力

```
{ status: ['closed','open'], keyword: '  foo  ' }
```

出力

```
{ keyword: 'foo', status: ['closed','open'] }
```

注意

Client State は削除されない。  
UI コンポーネントが `useSearch()` で参照するためである。

---

# loaderDeps

`loaderDeps` は **Loader の依存関係を定義する関数**である。

TanStack Router の Loader Cache Key は次の構造で決定される。

```
routeId + params + loaderDeps
```

本アーキテクチャでは

```
loaderDeps = Query State
```

として設計する。

つまり

```
CacheKey = Resource State + Query State
```

となる。

---

# extractQueryState

`extractQueryState` は Search Params から **Query State を抽出する関数**である。

処理内容

- `_` prefix を持つ Client State を除外  
- Query State のみ抽出  

例

```
/orders?page=1&_modal=true
```

Search

```
{ page: 1, _modal: true }
```

抽出結果

```
{ page: 1 }
```

Router ではこの値が

```
deps
```

として Loader に渡される。

---

# Loader Input

Loader には次の値が渡される。

```
params
deps
```

つまり

```
Resource State + Query State
```

である。

例

```
loader(args) {
  api({ ...args.params, ...args.deps })
}
```

---

# Loader Cache Key

TanStack Router の Loader Cache Key は次の要素で構成される。

```
routeId
params
loaderDeps
```

つまり

```
CacheKey = routeId + Resource State + Query State
```

この設計により次が統一される。

- URL State  
- API Input  
- Loader Cache Key  

---

# まとめ

本アーキテクチャでは URL は次の処理を経て API の入力となる。

```
URL
↓
validateSearch
↓
normalizeSearch
↓
extractQueryState
↓
loaderDeps
↓
Loader
↓
API
```

API には

```
Resource State + Query State
```

が渡される。

Client State（View State / Navigation Context）は  
UI 専用状態として扱われ、  
Loader / API / Cache には影響しない。

この仕組みにより

- URL State  
- API Request  
- Loader Cache Key  

が **一貫した形で管理される。**
