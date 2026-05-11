# Error Handling Strategy

本ドキュメントでは **Router‑First SPA Architecture におけるエラー処理方針**を定義する。

本アプリケーションは SPA であり、通信が不安定な環境での利用も想定している。  
そのためエラー処理は **ユーザー体験とナビゲーション整合性を保つこと**を目的として設計される。

この文書では次の内容を定義する。

- エラーの分類  
- 実行フェーズごとのエラー処理  
- ナビゲーションロールバックとの関係  
- エラー通知の責務  
- Business Error の扱い  

---

# エラー処理の目的

本アーキテクチャのエラー処理は次の問題を防ぐために存在する。

- 通信エラーによる画面崩壊  
- ナビゲーション不整合  
- ユーザー操作の失敗  

エラー発生箇所ごとに処理を分離することで次を向上させる。

- ユーザー体験  
- アプリケーションの安定性  
- デバッグ容易性  

---

# Navigation Transaction との関係

本アプリケーションでは

```
Navigation = Data Fetch Transaction
```

という設計を採用している。

そのため Router Phase のエラーは

```
通信失敗
↓
ナビゲーションロールバック
↓
元画面へ復帰
↓
エラー通知
```

として処理される。

つまり

```
通信成功 → 画面遷移
通信失敗 → 元画面復帰
```

が保証される。

---

# Error Classification

本フレームワークが特別扱いするエラーは **HTTP 401 のみ**である。

```
HTTP 401
↓
Fatal Error
↓
ログアウト
↓
ログイン
↓
SPA 再起動
```

それ以外のエラーは原因を特定せず  
**アプリケーションの通知ハンドラに委譲される。**

---

# Error Handling Phases

エラー処理は **実行フェーズ単位**で整理する。

| Phase | 挙動 |
|------|------|
| Render | 致命的エラー → SPA 再起動 |
| Router | ナビゲーションロールバック |
| Event | ユーザー再操作 |
| Effect | ログ出力 |

---

# Render Phase

React のレンダリング中に発生した例外。

例

- JSX エラー  
- undefined access  
- render logic error  

Render Phase のエラーは **アプリケーション整合性が失われた状態**とみなす。

```
Render Error
↓
Fatal Error
↓
BFF Fatal Error Screen
↓
Logout
↓
Login
↓
SPA 再起動
```

この処理はフレームワークが自動的に行う。

---

# Router Phase

Router の `beforeLoad / loader` 中に発生したエラー。

例

- ナビゲーション検証失敗  
- ページデータ取得失敗  
- API通信失敗  

Router Phase のエラーは

```
ナビゲーションロールバック
↓
遷移前の画面へ復帰
↓
エラー通知
```

として処理する。

---

# Router Phase のロールバック条件

| 条件 | 挙動 |
|-----|------|
| 初回アクセス時のエラー | Fatal Error |
| HTTP 401 | Fatal Error |
| その他エラー | Navigation Rollback |

---

## 初回アクセス時のエラー

初回アクセスでは **遷移前の画面が存在しない。**

そのためロールバックは不可能であり、  
すべて **致命的エラー**として扱う。

```
初回 navigation
↓
loader error
↓
Fatal Error
↓
BFF Fatal Error Screen
```

---

# Event Phase

ユーザーイベント中に発生したエラー。

例

- mutation  
- button click  
- form submit  

この場合は

```
エラー通知
↓
ユーザー再操作
```

として扱う。

Event Phase のエラーは **回復可能なエラー**である。

---

# Error Notification

Router Phase および Event Phase のエラーは  
**通知ハンドラ（Notification Handler）**を通じてユーザーへ通知される。

```
Error
↓
Navigation / Event Handler
↓
Notification Handler
↓
UI 表示
```

既定の挙動は

```
Alert 表示
```

である。

ただし通知方法は **アプリケーション側で自由にカスタマイズできる。**

例

- Toast  
- Modal  
- Custom UI  

---

# Notification Handler の責務

Notification Handler は **単なる表示処理ではない。**

次の責務を持つ。

- エラー内容の判定  
- 表示メッセージの整形  
- Business Error の解析  
- BFF レスポンスフォーマットの解釈  

つまり **エラーの意味付けはアプリケーション側が行う。**

---

# Business Error Handling

業務処理の結果として発生する Business Error は通常 **HTTP 422** として返される。

レスポンス例

```
{
  "messages": [
    {
      "type": "ERROR",
      "code": "ORDER_NOT_FOUND",
      "text": "注文が存在しません"
    }
  ]
}
```

この Business Error を表すステータスコードやJSON フォーマットは  
**BFF と SPA 間の契約としてアプリケーション独自で定義して良い。**

重要な点

- フレームワークは Business Error の意味を解釈しない  
- Business Error の判別と表示は Notification Handler の責務である  

つまり

```
業務エラーの意味付け
```

は **アプリケーション側が自由に定義できる。**

---

# 通信不安定時の画面復帰

通信状態が不安定な環境では次の問題が発生する可能性がある。

```
A → B
↓
B loader error
↓
rollback(A)
↓
A loader error
```

この場合

```
進めない
戻れない
```

という状態になる。

本アプリケーションでは

```
直前 Snapshot
```

を利用して画面復元する。

---

# Snapshot Restore

ロールバック時は **直前の Snapshot を復元する。**

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

この復元は **追加通信なし**で実行される。

---

# 設計上の保証

この仕組みにより次を保証する。

```
通信成功 → 次画面へ遷移
通信失敗 → 元画面へ復帰
```

つまり

```
進めない
戻れない
```

という状態が発生しない。

---

# まとめ

Router‑First SPA Architecture のエラー処理は

```
Navigation Transaction Model
```

を前提に設計されている。

- Render エラー → Fatal  
- Router エラー → Rollback  
- Event エラー → 再操作  
- Effect エラー → ログ  

さらに

```
Notification Handler
```

によって

- エラー分類  
- Business Error 判別  
- UI 表示  

が行われる。

この設計により

- 通信不安定環境でも操作可能  
- UI 崩壊の防止  
- 業務エラーの明確な表示  

を実現する。
