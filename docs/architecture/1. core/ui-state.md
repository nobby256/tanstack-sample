# UI State
（URL による UI 状態管理モデル）

## 概要

本アーキテクチャでは **UI 状態を URL によって管理する。**

基本原則は次の通りである。

```
UI State = URL
```

つまり UI の状態は

- React state  
- Global Store  

ではなく **URL の一部として保持する。**

---

# 背景

React の state には次の制約がある。

```
Component State
↓
Navigation
↓
Component Unmount
↓
State Destroy
```

つまり

```
画面を跨ぐナビゲーションでは UI 状態は保持されない
```

この問題を解決するため、多くの SPA では

```
Global Store
```

を導入する。

しかし Global Store には次の問題がある。

- 状態の寿命が曖昧  
- URL と状態が分離する  
- 履歴復元が難しい  
- 状態共有が難しい  

このアーキテクチャでは **UI 状態を URL に保存することでこれらの問題を解決する。**

---

# UI State の保存方法

UI 状態は URL の **Search Params** に保存する。

例

```
/orders/123/edit?_tab=items&_panel=detail
```

| parameter | state |
|-----------|------|
| `_tab` | 表示タブ |
| `_panel` | 展開パネル |

この状態は

```
戻る
リロード
URL共有
```

によって復元される。

---

# URL State Model との関係

URL State Model では URL を次の3種類に分類する。

```
URL
├ Resource State
├ Query State
└ UI State
```

UI State は

```
Client State
```

の一種であり

```
Loader Input
API Request
Cache Key
```

には影響しない。

つまり

```
UI State = 表示状態のみ
```

である。

---

# 命名規則

UI State は **`_` prefix** を使用する。

例

```
_tab
_panel
_dialog
_mode
```

この prefix は

```
UI state
```

であることを示す。

---

# UI State の特徴

UI State は次の特徴を持つ。

- Loader Input に含まれない  
- API Request に含まれない  
- Loader Cache Key に含まれない  

つまり

```
URL change ≠ data change
```

である。

---

# UI State の利点

UI State を URL に保存することで次の利点が得られる。

### 戻る操作

```
Back
↓
URL restore
↓
UI state restore
```

---

### リロード

```
F5
↓
URL restore
↓
UI state restore
```

---

### URL 共有

```
URL copy
↓
同じ UI 状態
```

---

### Store 不要

UI 状態保持のための

```
Global Store
```

は不要になる。

---

# 適用範囲

UI State として URL に保存する例

- タブ状態  
- アコーディオン  
- モーダル  
- 表示モード  
- ソート  
- ページ位置  

保存しないもの

- フォーム入力値  
- 機密情報  
- 大量データ  

---

# 更新画面との関係

更新画面でも UI State は URL に保存できる。

例

```
/orders/123/edit?_tab=items
```

ただし

```
Query State
```

を変更しないことが重要である。

```
loaderDeps change
```

が発生すると

```
Snapshot change
↓
Form reset
```

が発生する。

---

# 補足

一般的な Router の設定では URL が変更されると Loader が再実行される。

本アーキテクチャでは **UI State の変更による Loader 実行を抑制するユーティリティ**を提供する。

詳細は **Router Integration Guide** を参照する。

---

# まとめ

URL Driven UIState Architecture は

```
UI state = URL
```

というモデルで UI 状態を管理する。

この設計により

- 履歴復元  
- リロード耐性  
- URL共有  
- Store削減  

を実現できる。

これは Router‑First SPA Architecture における **重要な設計要素**である。
