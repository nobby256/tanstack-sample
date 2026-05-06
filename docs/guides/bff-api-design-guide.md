# BFF API Design Guidelines

## 概要

本ドキュメントでは、SPA クライアントと相性の良い **BFF API の構造設計指針**を定義する。

本アーキテクチャでは BFF API を次の3種類に分類する。

```
BFF API
├ Page API
├ Global API
└ Event API
```

この分類により、SPA の Router / Loader / Event 処理と API の責務を明確に分離する。

---

# Page API（画面データ取得）

Page API は **画面表示に必要なデータを取得する API**である。

本アーキテクチャでは次の原則を採用する。

```
1 Screen = 1 Page API
```

例

```
/orders
↓
GET /api/orders/summary
```

```
/orders/123
↓
GET /api/orders/detail
```

データ取得フロー

```
URL
↓
Router Loader
↓
Page API
↓
Snapshot
↓
UI
```

このモデルにより

- クライアントはデータ合成を行わない
- 画面データは BFF 側で構築される

---

# Page API の設計

Page API では **画面表示に必要なデータをまとめて返す**。

例

orders summary page

必要データ

- orders
- status master
- user profile

BFF

```
orders
+ status master
+ user
↓
Page Response
```

クライアントは **複数APIを呼び分けない**。

---

# Global API（共有データ）

アプリ全体で共有されるデータは Global API として提供する。

例

```
GET /api/global/master
GET /api/global/settings
GET /api/global/profile
```

Global API は

```
_app loader
```

から取得される。

対象データ

- マスターデータ
- Feature Flags
- アプリ設定
- ユーザープロファイル

---

# Event API（更新処理）

更新処理や画面内操作は Event API として設計する。

例

```
POST /api/orders/create
POST /api/orders/update
POST /api/orders/delete
```

Event API は

```
Router Loader
```

とは独立した **ユーザー操作API**である。

---

# URL 設計指針

BFF API は **SPA の URL 構造と対応させる**。

例

```
SPA URL
/orders
/orders/123

Page API
/api/orders/summary
/api/orders/detail
```

このルールにより

```
URL
↓
Router
↓
Loader
↓
Page API
```

という構造が明確になる。

---

# 設計指針まとめ

BFF API は次の方針で設計する。

- Page API を基本とする  
- URL と API を対応させる  
- 画面データは BFF 側で合成する  
- 共有データは Global API として提供する  
- 更新処理は Event API として設計する  

この構造により

```
Router + BFF + Snapshot
```

という SPA アーキテクチャと自然に統合できる。
