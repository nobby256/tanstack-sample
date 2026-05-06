# Navigation Driven Cache Strategy  
（Master Data Cache Only）

## 概要

本アーキテクチャでは **キャッシュの用途を明確に限定する。**

```
マスタデータ → キャッシュする  
トランザクションデータ → キャッシュしない
```

つまり

```
Master Data Cache
+
Transaction Data No Cache
```

というキャッシュ戦略を採用する。

キャッシュは **データ整合性を保証する仕組みではなく、UX改善のための補助機構**として扱う。

---

# キャッシュの基本方針

本アーキテクチャでは次の方針を採用する。

- **マスタデータのみキャッシュする**
- **トランザクションデータはキャッシュしない**

業務システムでは次の特徴がある。

- データ更新が頻繁  
- 他ユーザーによる更新が存在  
- データ整合性が重要  

そのため

```
トランザクションデータは常に最新データを取得する
```

設計を採用する。

---

# Navigation Driven Data Fetch

本アーキテクチャでは次のデータ取得モデルを採用する。

```
Navigation
↓
Loader
↓
API
↓
Snapshot
↓
UI
```

つまり

```
画面 = サーバーデータのスナップショット
```

として扱う。

画面遷移が発生するたびに **最新データを取得する。**

このモデルにより

- データ整合性を維持
- キャッシュ整合性問題を回避

することができる。

---

# キャッシュの用途

キャッシュは **マスタデータのためだけに使用する。**

例

- ステータス一覧  
- カテゴリ一覧  
- コードマスタ  
- アプリ設定  
- Feature Flags  

これらは

- 更新頻度が低い  
- UI補助データである  

ためキャッシュと相性が良い。

---

# Cache Policies

本アーキテクチャではキャッシュ戦略を次の2種類に分類する。

```
staticCachePolicy
noCachePolicy
```

---

# staticCachePolicy

アプリケーション全体で共有される  
**グローバルマスタデータ**に使用する。

例

- ユーザープロファイル  
- Feature Flags  
- マスターデータ  
- アプリ設定  

設定例

```
shouldReload: false
gcTime: Infinity
loaderDeps: () => ({})
```

特徴

- 常にキャッシュを利用する  
- 全 URL で共有される  

---

# noCachePolicy

トランザクションデータを取得する画面で使用する。

例

- 一覧画面  
- 詳細画面  
- 更新画面  

設定例

```
shouldReload: true
staleReloadMode: "blocking"
gcTime: 0
```

動作

```
Navigation
↓
Loader
↓
API
↓
Snapshot
↓
UI
```

つまり **常に最新データを取得する。**

---

# キャッシュポリシーの適用単位

キャッシュポリシーは **URL（Route）単位で決定される。**

```
URL
↓
Route
↓
Cache Policy
```

例

```
/_app           → staticCachePolicy
/orders         → noCachePolicy
/orders/123     → noCachePolicy
/orders/create  → noCachePolicy
```

Router の階層構造によって  
親 Route のポリシーを子 Route に適用することもできる。

ただし設計上は

```
URL = Cache Policy
```

という関係を意識すればよい。

---

# 更新処理とキャッシュ

トランザクションデータをキャッシュしないため

```
複雑な invalidate 管理は不要
```

になる。

多くの SPA では

```
update
↓
invalidateQueries(...)
```

のような処理が必要になるが、

本アーキテクチャでは

```
Navigation = refresh
```

であるため、複雑なキャッシュ無効化設計は不要になる。

---

# Snapshot Cache との関係

本アーキテクチャでは **トランザクションデータのキャッシュは行わない。**

ただし Router は **直前の Snapshot** を内部的に保持している。

これは

```
Navigation Transaction Model
```

における **Rollback 時の画面復元**のために使用される。

```
A snapshot
↓
navigate(A → B)
↓
B loader error
↓
rollback
↓
restore A snapshot
```

この Snapshot は

```
キャッシュ戦略とは独立したトランザクション用スナップショット
```

として扱われる。

---

# 技術的背景

本アーキテクチャでは **トランザクションデータのキャッシュを採用していない。**

これは一般的な SPA で利用される

- SWR（Stale‑While‑Revalidate）
- クライアントエンティティキャッシュ

などの戦略を検討した上での設計判断である。

これらのキャッシュ戦略が業務システムと相性が良くない理由については  
次のドキュメントで詳しく説明している。

```
SWR Cache Model
Transaction Cache Considerations
```

---

# 設計原則

本アーキテクチャでは次の優先順位で設計する。

1. **データ整合性**
2. **ユーザー体験**
3. **キャッシュ**

キャッシュは **整合性の基盤ではなく最適化手段**として扱う。

---

# まとめ

本アーキテクチャのキャッシュ戦略は非常にシンプルである。

```
Master Data → Cache
Transaction Data → No Cache
```

つまり

**キャッシュはマスタのためだけに使う。**

この設計により

- データ整合性を維持
- キャッシュ設計の複雑さを排除
- invalidate の事故を防止

することができる。