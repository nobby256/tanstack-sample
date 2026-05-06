# User Input  
（ユーザー入力状態モデル）

## 概要

本ドキュメントでは **アプリケーション状態のうち User Input（ユーザー入力）をどのように扱うか**を説明する。

Router‑First SPA Architecture ではアプリケーション状態を次の3種類に分類する。

```
Application State
├ Server Data
├ UI State
└ User Input
```

この文書では **User Input の状態モデル**を定義する。

本アーキテクチャではフォーム状態管理に  
**TanStack Form の利用を想定している。**

ただし本ドキュメントで説明する User Input モデルは  
**特定のフォームライブラリに依存しない概念モデル**である。

---

# User Input Model

ユーザー入力は **Draft State（編集中の状態）**として扱う。

```
Server Data
↓
Snapshot
↓
Form Initial State
↓
User Edit
↓
Draft State
```

ここで重要な原則は次である。

```
Snapshot ≠ Draft
```

| State | 説明 |
|------|------|
| Snapshot | サーバーから取得した初期データ |
| Draft | ユーザーが編集中の入力状態 |

---

# Snapshot と Draft

画面表示時、フォームは **Snapshot** を初期値として生成される。

```
Load API
↓
Snapshot
↓
Form Initial
```

ユーザーが入力を開始すると、その状態は **Draft State** になる。

```
User Input
↓
Draft State
```

Draft State は **サーバーデータとは独立した状態**である。

---

# Draft State の特徴

Draft State は通常 **コンポーネント状態**として管理される。

```
Component State
↓
User Input
↓
Draft State
```

そのため次の特徴を持つ。

- URL を跨ぐナビゲーションで消える  
- コンポーネントの寿命に依存する  

例

```
Page A
↓ Navigation
Page B
↓ Back
Page A
```

この場合

```
Draft State は復元されない
```

---

# Draft Lifecycle

Draft State は次のライフサイクルを持つ。

```
Load
↓
Snapshot
↓
Form Initial
↓
User Input
↓
Draft State
↓
Submit
```

つまり

```
Draft = 一時状態
```

である。

---

# Draft Persistence（補足）

場合によっては Draft State を保存する必要がある。

例

- 長い入力フォーム  
- 入力途中でのリロード  
- 一時保存  

この場合

```
Session Storage
Local Storage
```

などを利用して Draft State を保存できる。

ただし Draft Persistence は **必須ではない。**

必要な画面のみで適用することを推奨する。

---

# Update Screen Design

更新画面では **1 URL を 1 編集セッションとして扱う。**

例

```
/orders/123/edit
```

この URL は

```
注文 123 を編集する
```

という単一の編集操作を意味する。

そのため更新画面は **1 URL 内で完結する設計**を推奨する。

---

## なぜこの設計が必要か

複数画面をまたぐ更新フローを設計すると  
入力状態を画面間で保持する必要がある。

これは次の問題を生む。

- 状態共有のためのストアが必要になる  
- 業務チェックのタイミングが曖昧になる  
- エラー時の再入力導線が複雑になる  

そのため本アーキテクチャでは

```
更新処理は画面単位で完結する設計
```

を推奨する。

---

## 巨大更新との関係

巨大更新処理が必要な場合は  
**Draft Table を利用した Edit Session モデル**を採用する。

詳細は **Large Update Workflow** を参照する。

---

# Server Data との関係

Server Data は

```
URL
↓
Load API
↓
Snapshot
```

として取得される。

一方 User Input は

```
User Edit
↓
Draft State
```

として管理される。

つまり

```
Server Data ≠ User Input
```

である。

---

# UI State との関係

UI State は URL に保存される。

```
UI State = URL
```

一方 User Input は通常

```
Draft State
```

としてコンポーネント状態に保持される。

つまり

```
Application State
├ Server Data (Snapshot)
├ UI State (URL)
└ User Input (Draft)
```

という構造になる。

---

# まとめ

Router‑First SPA Architecture では  
ユーザー入力は **Draft State** として扱う。

```
Server Data → Snapshot
User Input → Draft
```

Draft State は

- 一時的な状態  
- コンポーネント寿命に依存  

であり、必要に応じて **Persistence** を追加できる。

このモデルにより

- Server Data  
- UI State  
- User Input  

という **3種類のアプリケーション状態**を明確に分離できる。