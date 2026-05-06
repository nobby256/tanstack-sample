# Directory Structure Convention

## 概要

本プロジェクトでは **Router‑first SPA Architecture** を前提としたディレクトリ構造を採用する。

本構造は次のアーキテクチャと整合するよう設計されている。

- URL Driven Navigation Architecture  
- Router Cache Strategy  
- Global Data Architecture  

ディレクトリ構造は単なる整理ではなく、次の設計原則を反映する。

- URL構造と実装構造を一致させる  
- ページ単位でデータ取得ロジックを管理する  
- 業務共通ロジックとページ実装を分離する  
- フレームワーク共通コードを分離する  

---

# 全体構造

本プロジェクトの基本ディレクトリ構造は次の通り。

```
src/
├ routes/
│  ├ __root.ts
│  │
│  └ _app/
│     ├ route.ts
│     ├ layout.tsx
│     │
│     ├ _api/
│     │  ├ api.load.ts
│     │  └ api.types.ts
│     │
│     └ <domain>/
│        ├ route.ts
│        ├ layout.tsx
│        │
│        └ <page>/
│           ├ route.ts
│           ├ layout.tsx
│           │
│           ├ _page/
│           │  └ page.tsx
│           │
│           └ _api/
│              ├ api.load.ts
│              ├ api.event.ts
│              └ api.types.ts
│
├ feature/
│  ├ entities/
│  │  └ <domain>.types.ts
│  │
│  ├ global/
│  │  ├ useAppData.ts
│  │  ├ useUser.ts
│  │  └ useFeatureFlags.ts
│  │
│  └ <feature-module>/
│
└ lib/
   ├ core/
   └ network/
```

それぞれの役割は次の通り。

| ディレクトリ | 役割 |
|--------------|------|
| routes | URLとページ実装 |
| feature | 業務共通ロジック |
| lib | フレームワーク共通 |

---

# Router階層構造

`routes` ディレクトリは次の階層構造で設計されている。

```
__root
  ↓
_app
  ↓
domain
  ↓
page
```

| 層 | 役割 |
|---|---|
| __root | Routerルート定義 |
| _app | アプリ共通処理 |
| domain | 機能単位 |
| page | 画面単位 |

---

# URL と Page Module

Router‑first SPAでは

```
URL = Page Module
```

という関係を持つ。

例

URL

```
/orders/summary
```

Directory

```
routes/_app/orders/summary
```

Page Module

```
summary/
 ├ route.ts
 ├ _page/
 │  └ page.tsx
 └ _api/
    ├ api.load.ts
    ├ api.event.ts
    └ api.types.ts
```

図

```
URL
 ↓
Router
 ↓
Page Module
 ├ route.ts
 ├ _page/
 └ _api/
```

---

# __root

`routes/__root.ts` は Router のルート定義を行う。

主な役割

- RouterProvider  
- アプリ全体レイアウト  
- ErrorBoundary  

---

# _app

`routes/_app` は **アプリケーション共通ルート**である。

ここでは次の役割を持つ。

1. アプリ共通データ取得  
2. Navigation 時のサーバー確認  

---

## グローバルデータ取得

`_app route loader` では **アプリ全体で共有されるデータ**を取得する。

例

- ユーザープロファイル  
- Feature Flags  
- マスターデータ  
- アプリ設定  

取得されたデータは **Router Loader Data** として保持される。

コンポーネントからは

```
feature/global の Hook
```

を通して参照する。

---

## Navigation 検証

`_app.beforeLoad` では **ナビゲーション時のサーバー確認処理**を実行する。

例

- セッション状態確認  
- アカウント状態確認  
- 利用可能機能確認  

これらはキャッシュされるデータではなく、  
**ナビゲーションのたびにサーバー確認が必要な検証処理**である。

---

# domain

```
routes/_app/<domain>
```

は URL の機能単位を表す。

例

- orders  
- customers  
- products  

ここでいう `domain` は

```
業務機能のグルーピング
```

であり DDD のドメインモデルとは必ずしも一致しない。

例

- 注文管理  
- 顧客管理  
- 商品管理  

---

# Page Module

各 URL は **Page Module** として実装する。

Page Module は次の構成を持つ。

```
<page>/
├ route.ts
├ _page/
│  └ page.tsx
└ _api/
   ├ api.load.ts
   ├ api.event.ts
   └ api.types.ts
```

| ファイル / ディレクトリ | 役割 |
|---|---|
| route.ts | Router設定 / loader / URL validation |
| _page/page.tsx | UIコンポーネント |
| _api/api.load.ts | Loader用 Page API |
| _api/api.event.ts | Event API |
| _api/api.types.ts | API DTO型 |

---

# _page ディレクトリ

```
_page
```

は **ページ UI 実装を配置するディレクトリ**である。

本アーキテクチャでは

```
page.tsx
```

のみを必須ファイルとして定義する。

例

```
_page/
 └ page.tsx
```

実際のプロジェクトでは UI が増えるため  
次のような構成になることもある。

例

```
_page/
 ├ page.tsx
 ├ OrderTable.tsx
 ├ SearchForm.tsx
 ├ useOrders.ts
 └ useSearchState.ts
```

ただし **本アーキテクチャが規定するのは `page.tsx` のみ**であり、  
その他の構造はプロジェクトごとに自由に定義できる。

---

# _api ディレクトリ

```
_api
```

は **ページ専用 API を配置するディレクトリ**である。

API は次の3つの固定ファイルで管理する。

```
_api/
 ├ api.load.ts
 ├ api.event.ts
 └ api.types.ts
```

| ファイル | 役割 |
|---|---|
| api.load.ts | Loader用 Page API |
| api.event.ts | Event API |
| api.types.ts | API DTO型 |

---

## api.load.ts

Loader から呼び出される Page API を定義する。

通常 **1ページにつき1つの API** を定義する。

例

```
export async function loadPage()
```

---

## api.event.ts

画面操作によって呼び出される Event API を定義する。

例

```
export async function updateOrder()
export async function cancelOrder()
export async function exportReport()
```

Event API は **複数定義されることがあるが同一ファイルにまとめる。**

---

## api.types.ts

API の DTO 型を定義する。

例

```
FetchSummaryResponse
UpdateOrderRequest
```

DTO 型が少量であれば api.load.ts / api.event.ts 内に定義してもよい。

型定義が増えた場合に **api.types.ts**へ分離する。
---

# route.ts と page.tsx の分離

TanStack Router のチュートリアルでは  
Route定義とPageコンポーネントを **1つのファイルに記述する例**が多い。

本プロジェクトでは次の理由により  
**route.ts と page.tsx を分離することを推奨する。**

- 責務の分離  
- Pageコンポーネント肥大化の防止  
- Router設定の可読性向上  

---

# feature

```
src/feature
```

は **業務共通ロジック**を配置するディレクトリである。

構成は **プロジェクトごとに自由に定義できる。**

---

# entities

```
feature/entities/<domain>.types.ts
```

には **業務ドメインの共通型**を定義する。

例

- order.types.ts  
- customer.types.ts  

これらは **複数ページで共有される型**である。

---

# global

```
feature/global
```

には **グローバルデータ参照用 Hook** を配置する。

これらの Hook は

```
_app route loader
```

で取得された **Global Data** を参照するためのアダプタである。

例

```
feature/global
 ├ useAppData.ts
 ├ useUser.ts
 └ useFeatureFlags.ts
```

この構造により

```
Router API への直接依存
```

を隔離できる。

---

# lib

```
src/lib
```

は **フレームワーク共通ユーティリティ**を配置する。

例

```
lib/
 ├ core/
 └ network/
```

---

# Dependency Rule

本プロジェクトでは依存方向を固定する。

```
routes → feature → lib
```

---

# routes の依存ルール

許可

```
routes → feature
routes → lib
```

禁止

```
feature → routes
lib → routes
```

---

# Page Module の独立性

各 Page Module は **独立したモジュール**として扱う。

重要ルール

```
他のページのコードを import してはいけない
```

禁止例

```
routes/orders/summary → routes/orders/$id
routes/customers/search → routes/orders/summary
```

---

# Page Module 内の依存

役割

```
route.ts → Router orchestration
_api → BFF communication
_page → UI rendering
```

許可

```
route.ts → _api/
route.ts → _page/
_page/ → _api/
_page/ → route.ts（useRoute(Route) などの参照のみ）
```

禁止

```
_api/ → route.ts
_api/ → _page/
```

---

# feature の依存ルール

許可

```
feature → lib
```

禁止

```
feature → routes
```

---

# lib の依存ルール

許可

```
lib → external libraries
```

禁止

```
lib → routes
lib → feature
```

---

# まとめ

本ディレクトリ構造は次の原則を反映している。

- Route = URL構造  
- Page Module = URL単位の実装  
- feature = 業務ロジック  
- lib = フレームワーク共通  
- routes → feature → lib  
- Page Module 同士の import 禁止  
- Global Data は Router Loader Data で共有  

これにより

- Router-first SPA  
- BFF architecture  
- Global Data Architecture  

を安全に実装できる。