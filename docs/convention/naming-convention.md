# Naming Convention

## 概要

本ドキュメントでは **API 関数の命名規則**を定義する。

本アーキテクチャは **Router‑first / Page Module Architecture** を採用しており、  
データ取得および更新処理の大部分は **BFF API 呼び出し**として実装される。

そのため本命名規則は **API 関数およびその型の命名**を対象とする。

対象

```
API関数
API関数の引数型
API関数の戻り値型
```

---

# 基本語彙

APIの命名では次の語彙を使用する。

```
Action
PageName
Data
```

---

## Action

Action は **処理を表す動詞**である。

例

```
load
fetch
search
create
update
delete
preview
download
```

Action は API 関数の先頭に使用する。

---

## PageName

PageName は **画面の論理名**である。

PageName は設計書に定義された画面名称を基準とする。

例

```
OrderSummary
OrderDetail
CustomerSearch
```

PageName は主に **Loader API の命名**に使用する。

---

## Data

Data は **画面コンテキスト内で扱うデータの名称**である。

この名称は

```
Entity
REST Resource
DDD Aggregate
```

などに厳密に一致する必要はない。

重要なのは

```
その画面の文脈で意味が通じること
```

である。

例

```
orders
summary
history
profile
settings
```

---

# API関数

API関数は次の命名形式を使用する。

```
<Action><Data>
```

例

```
fetchOrders
searchCustomers
updateOrder
deleteItem
```

---

## Loader API

ページ初期データ取得 API は次の命名形式を使用する。

```
load<PageName>Page
```

例

```
loadOrderSummaryPage
loadOrderDetailPage
loadCustomerSearchPage
```

`load` は **Router loader から呼ばれる API**を意味する。

---

## 更新処理

更新処理は次の Action のみを使用する。

```
create
update
delete
```

例

```
createOrder
updateOrder
deleteOrder
```

---

## データ取得

データ取得の代表的な Action は次とする。

```
fetch
```

例

```
fetchOrders
fetchCustomerHistory
```

ただし

```
load
create
update
delete
```

以外の名前ならば **状況に応じて任意の名前を使用してよい。**

例

```
searchCustomers
previewDocument
downloadReport
```

HTTP メソッド名

```
get
post
put
patch
```

などは使用しない。

これは **HTTP 実装に依存しない抽象的な命名**を維持するためである。

---

# API関数の引数型

API関数の引数は **named type を使用する。**

命名形式

```
<ApiFunctionName>Params
```

例

```
type UpdateOrderParams
type FetchOrdersParams
type LoadOrderSummaryPageParams
```

インライン型は使用しない。

API関数の引数は **必ず object parameter とする。**

例

```
updateOrder(params: UpdateOrderParams)
```

プロパティが1つであっても **必ずオブジェクト形式とする。**

---

# API関数の戻り値型

API関数の戻り値型については **命名規則を設けない。**

一般的には

```
データ名に関連する型
```

を使用するが、厳密なルールは設けない。

例

```
OrderSummary[]
CustomerProfile
DocumentPreview
```

---

# まとめ

API命名の基本ルール

```
Action + Data
```

Loader API

```
load<PageName>Page
```

更新処理

```
create / update / delete
```

取得処理

```
fetch（代表例）
```

引数型

```
<ApiName>Params
```

戻り値型

```
命名規則なし
```

この命名規則により

```
画面コンテキスト
API
実装コード
```

の語彙をシンプルに統一する。
