# Loader Execution Policy

## 概要

本ドキュメントでは、本アーキテクチャにおける **Router Loader の実行ポリシー**を定義する。

本アーキテクチャではキャッシュの有無によって挙動を決めるのではなく、  
**loader を実行するかどうか**によってデータ取得の挙動を制御する。

つまりデータ取得の基本モデルは次の通りである。

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

キャッシュは常に存在するが、  
それを利用するかどうかは **loader の実行制御**によって決まる。

---

# 基本前提

本アーキテクチャでは次の Router 設定を基本とする。

```
staleTime = 0
staleReloadMode = "blocking"
```

意味は次の通り。

- **staleTime = 0**  
  すべてのデータは常に stale とみなされる

- **staleReloadMode = "blocking"**  
  loader が完了するまで画面遷移を確定させない

この設定は **Navigation Transaction Model** を保証するために必要である。

```
Navigation
↓
Loader
↓
Success → Commit
Failure → Rollback
```

つまり

```
データ取得成功
↓
画面遷移確定
```

を保証する。

また、本アーキテクチャは **更新頻度の高い業務システム**を前提としているため、  
常に最新データを取得することを基本動作とする。

---

# Loader Execution Policy

Router のルート階層によって  
**loader の実行ポリシーを切り替える。**

Router の階層構造

```
__root
  ↓
_app
  ↓
domain
  ↓
page
```

---

# `_app` ルート

`_app` ルートでは **グローバルデータ**を取得する。

例

- ユーザープロファイル
- Feature Flags
- マスターデータ
- アプリ設定

これらは

- 更新頻度が低い
- アプリ全体で共有される

という特徴を持つ。

そのため `_app` では次のポリシーを採用する。

```
shouldReload = false
gcTime = Infinity
```

意味

```
初回のみ loader 実行
以降は Snapshot Cache を利用
```

つまり `_app` の loader は

```
Initial Load Only
```

のポリシーで動作する。

---

# `page` ルート

業務データを取得する `page` ルートでは  
**loader を通常は実行する**。

基本ポリシー

```
shouldReload = true
```

つまり

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

が通常動作である。

これは

- 他ユーザー更新
- 同時更新
- 楽観的排他ロック

といった業務システム特有の整合性問題を回避するためである。

---

# Loader Skip

特定の遷移では **loader を実行せず Snapshot Cache を利用する。**

例

```
navigation.navigate({
  to: "...",
  skipLoader: true
})
```

この場合

```
shouldReload = false
```

として扱われる。

```
Navigation
↓
Loader Skip
↓
Snapshot Cache
↓
UI
```

となる。

---

# Snapshot Cache

TanStack Router は loader の実行結果を内部にキャッシュする。

```
Loader
↓
API
↓
Snapshot
↓
Router Cache
```

この Snapshot は `gcTime` によって一定時間保持される。

```
gcTime = Snapshot 保持時間
```

重要な点

- Snapshot Cache は **常に存在する**
- ただし **必ず存在するとは限らない**

つまり

```
Cache Hit  → Snapshot 再利用
Cache Miss → Loader 実行
```

となる。

---

# `page` ルートの gcTime

`page` ルートでは Snapshot Cache を  
**loader skip 遷移のために利用する。**

そのため `gcTime` は

```
gcTime > 0
```

とする。

値は

- 画面滞在時間
- キャッシュ量
- メモリ使用量

などを考慮して設定する。

重要なのは次の点である。

```
キャッシュが無くても正常に動作する
```

つまり

```
Cache Hit → 高速表示
Cache Miss → Loader 実行
```

という扱いとする。

---

# まとめ

本アーキテクチャの Loader Execution Policy は次の通り。

共通設定

```
staleTime = 0
staleReloadMode = "blocking"
```

ルート別ポリシー

```
_app
  shouldReload = false
  gcTime = Infinity

page
  shouldReload = dynamic
  gcTime = finite
```

動作

```
通常遷移 → Loader 実行
特殊遷移 → Loader Skip
```

この設計により

- 更新頻度の高い業務データは常に最新状態を取得
- グローバルデータはキャッシュを利用して高速化
- ナビゲーション単位でデータ取得を制御

という **Navigation Driven Data Fetch** を実現する。
