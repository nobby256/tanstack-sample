# Application State Foundation

## 概要

Router‑First SPA Architecture は **URL を中心にアプリケーション状態を表現する設計モデル**である。

本アーキテクチャでは次の原則を採用する。

```
URL = Application State
```

つまり URL は単なるナビゲーション情報ではなく、  
**画面状態を表すデータ構造**として扱われる。

この設計により

- 画面状態の再現
- 履歴操作
- リロード
- URL共有

を URL だけで実現できる。

---

# URL State Structure

URL は次の3種類の状態を表現する。

```
URL
├ path
├ search
└ _search
```

それぞれの役割は次の通りである。

| 部分 | 役割 |
|-----|------|
| path | 表示する画面 |
| search | サーバーデータ取得条件 |
| _search | UI状態 |

例

```
/orders/123?page=2&_tab=history
```

| 要素 | State |
|-----|------|
| /orders/123 | 表示画面 |
| page=2 | API引数 |
| _tab=history | UI状態 |

この構造により

```
画面状態 = URL
```

が成立する。

---

# Application State

アプリケーションの状態は次の3種類に分類される。

```
Application State
├ Server Data
├ UI State
└ Input State
```

| State | 説明 |
|------|------|
| Server Data | サーバーから取得するデータ |
| UI State | UI表示状態 |
| Input State | ユーザー入力 |

これら3つが揃うことで、アプリケーションの状態が成立する。

---

# Core Architecture

本アーキテクチャの Core は次の3つの仕組みで構成される。

```
Core Architecture
├ Server Data
├ UI State
└ User Input
```

それぞれ次の役割を持つ。

| Component | 役割 |
|----------|------|
| Server Data | URL からサーバーデータを取得する |
| UI State | UI状態を URL に保存する |
| User Input | ユーザー入力状態を保持する |

---

# Server Data

Server Data は **URL を起点にサーバーデータを取得するモデル**である。

```
URL
↓
Router
↓
Loader
↓
API
↓
Snapshot
↓
UI
```

画面は **URL が示す状態のサーバーデータスナップショット**として表示される。

---

# UI State

UI State は **UI表示状態**を表す。

例

- タブ
- モーダル
- 展開パネル
- 表示モード
- ソート
- ページ位置

本アーキテクチャでは

```
UI State = URL
```

として管理する。

例

```
/orders/123/edit?_tab=items&_panel=detail
```

この設計により

- 戻る操作
- リロード
- URL共有
- 画面状態復元

が自然に機能する。

---

# User Input

User Input は **ユーザー入力状態**である。

例

- フォーム入力
- 編集中データ

入力状態は通常 **フォームライブラリによって管理される。**

例

```
TanStack Form
```

User Input は

```
Snapshot State
Draft State
```

というモデルで扱われる。

---

# Application State Model

以上をまとめると、本アーキテクチャは次の構造を持つ。

```
Application State
│
├ Server Data
│   URL → Loader → API → Snapshot
│
├ UI State
│   UI state = URL
│
└ User Input
    Snapshot State + Draft State
```

このモデルにより

- URL Driven Navigation
- URL Driven UI State
- Form State

が統合された形でアプリケーションを構築できる。

---

# まとめ

Router‑First SPA Architecture は  
**アプリケーション状態を URL を中心に構築する SPA 設計モデル**である。

```
Application State
├ Server Data
├ UI State
└ User Input
```

この3種類の状態を組み合わせることで

- 画面状態の再現
- 履歴操作
- UI状態復元
- ユーザー入力保持

を実現できる。

これが **Router‑First SPA Architecture の基盤となる設計原則**である。
