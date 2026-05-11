# Navigation Transaction Model

## 概要

本ドキュメントでは **画面遷移をトランザクションとして扱うモデル**を定義する。

Router‑First SPA Architecture では次の原則を採用する。

```
Navigation = Data Fetch Transaction
```

つまり画面遷移は単なる URL 変更ではなく  
**サーバーデータ取得を伴うトランザクション処理**として扱われる。

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

このモデルを **Navigation Transaction Model** と呼ぶ。

---

# 対象範囲

本モデルは **Navigation 操作のみ**を対象とする。

```
Navigation
→ Transaction
```

一方で

```
Event
```

（ボタン操作・更新処理など）は  
**Navigation とは別の概念**であり、このモデルの対象には含まれない。

Event API は単なるユーザー操作として扱われ、  
本ドキュメントで説明するトランザクションモデルとは独立している。

---

# Navigation Transaction

画面遷移は次のトランザクションとして扱われる。

```
Navigation Start
↓
Loader Execution
↓
Server Data Fetch
↓
Success → Commit Navigation
Failure → Rollback Navigation
```

つまり

```
成功 → 画面遷移
失敗 → 元画面維持
```

となる。

---

# Commit

データ取得が成功した場合、ナビゲーションは **Commit** される。

```
A (current screen)
↓
navigate("/orders")
↓
Loader
↓
API success
↓
Commit
↓
UI = orders page
```

Commit 時点で UI は **新しい Snapshot** に置き換えられる。

---

# Rollback

データ取得が失敗した場合、ナビゲーションは **Rollback** される。

```
A (current screen)
↓
navigate("/orders")
↓
Loader
↓
API error
↓
Rollback
↓
UI = A
```

ユーザー視点では

```
画面遷移がキャンセルされた
```

ように見える。

---

# Snapshot Restore

Rollback 時には **直前の Snapshot を復元**する。

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

この復元は **追加の通信を行わず**実行される。

---

# なぜトランザクションモデルが必要か

多くの SPA は次のようなデータ取得モデルを採用する。

```
Render
↓
Fetch
↓
Re-render
```

このモデルでは

```
表示されたデータが最新とは限らない
```

という問題がある。

例

```
navigate(A → B)
↓
B render
↓
B fetch error
↓
Broken UI
```

この状態では

- 不完全な画面
- 空画面
- エラー状態

が発生する可能性がある。

Navigation Transaction Model では

```
Fetch
↓
Render
```

を採用することで

```
不完全な画面表示を防ぐ
```

設計となっている。

---

# Router Loader との関係

Navigation Transaction Model は **Router Loader** をトランザクション境界として実装される。

```
Navigation
↓
Router Match
↓
Loader Execution
↓
API Fetch
↓
Commit / Rollback
```

Loader は **トランザクション処理の中心**となる。

---

# エラー通知

Rollback が発生した場合、ユーザーには **エラー通知が表示される。**

処理フロー

```
Navigation
↓
Loader
↓
Error
↓
Rollback
↓
Error Notification
```

重要な点は次である。

- フレームワークは **ロールバックを保証する**
- エラー通知は **カスタムハンドラで実装できる**
- フレームワークは **通知以外の自動復旧は行わない**

つまり

```
エラーの再試行
処理の継続
別画面への遷移
```

などの判断は **ユーザーまたはアプリケーション側の責務**となる。

---

# Navigation Transaction の利点

このモデルにより次の利点が得られる。

- 不完全な画面表示を防止  
- ナビゲーションの整合性保証  
- 通信失敗時の安全な復帰  
- 更新画面との整合性  

特に **通信が不安定な環境**において安定した UI を提供できる。

---

# まとめ

Navigation Transaction Model は画面遷移を **データ取得トランザクション**として扱う設計である。

```
Navigation
↓
Loader
↓
API
↓
Success → Commit
Failure → Rollback
```

このモデルにより

- Snapshot UI  
- URL Driven Navigation  
- Router Loader Architecture  

が一貫した形で統合される。
