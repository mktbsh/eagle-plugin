# Roadmap

## 目的

このリポジトリでは、Eagle プラグインの開発、検証、雛形作成を支援するライブラリとツールを整備する。

各パッケージは同じ仕様を個別に実装せず、manifest と Plugin API の型を共有する。

実装対象の仕様は [Eagle Plugin framework and tooling](./docs/specs/0001-eagle-plugin-framework.md) にまとめる。

## 現在地

### `eagle-plugin-dts`

Core Plugin API と manifest の型定義は整備済みである。

型定義は公式ドキュメントを根拠とし、Electron 由来の型は Eagle が公開する範囲だけをローカルに定義する。

manifest の実行時検証、TypeScript 型、JSON Schema は `eagle-plugin-manifest` の strict schema から提供する。

Vanilla Window は `pnpm create eagle-plugin` で生成し、`eagle build` で production build できる。

`eagle dev` のローカル bridge、watch 更新、reload 案内は自動検証済みであり、Eagle 4.0.0 の「Plugin > Import Local Project」による基本接続とVanilla WindowのHMRも確認済みである。次はReact Window（Ticket 6）へ進める。

## Plugin Author interface

新規プロジェクトは `pnpm create eagle-plugin` で生成する。生成後の日常操作は `eagle-plugin` package が提供する一つの command surface に集約する。

```sh
eagle dev
eagle build
eagle check
```

manifest、Vite、React の低レベル module はこの interface の内側で共有し、Plugin Author に同じ判断を繰り返させない。

## 実装順

### 1. `eagle-plugin-manifest`（完了）

manifest の型、実行時検証、JSON Schema を一つの source of truth から提供する。

このパッケージは、後続の雛形作成、CLI、ビルド連携が共有する seam になる。

最初の公開 interface は次の三つとする。

```ts
defineManifest(manifest)
parseManifest(input)
validateManifest(input)
```

提供物は次のとおりとする。

- Window、Service、Preview、Inspector の manifest schema
- エディター補完に利用できる JSON Schema
- `main` と `preview` の排他検証
- `{ path, code, message }` 形式の検証エラー
- `eagle-plugin-dts` と共有する `ManifestJSON`
- 公式サンプルを利用した正常系テスト
- 不正な entrypoint、型、必須値を検出する異常系テスト

次の条件を満たした時点で完了とする。

- 公式の4種類の manifest サンプルが検証を通過する。
- 型定義と実行時検証が同じ入力を受理する。
- 不正な入力から、問題箇所を特定できる検証エラーを返す。
- JSON Schema を package の配布物に含める。

### 2. `eagle build`（完了）

型付きの `eagle.config.ts` と規約化された entrypoint から、Eagle が読み込める production build を生成する。

Plugin Author は `eagle.config.ts` を唯一の入力として編集し、配布用の `manifest.json` はビルド時に生成する。

entrypoint のパスは設定に列挙せず、`entrypoints/` 配下のファイル配置から推論する。Window は `window.*`、Service は `service.*`、Formats は名前付き group 配下の `thumbnail.*`、`viewer.*`、`inspector.*` で表現し、Window、Service、Formats は相互に排他とする。

最初の tracer bullet は Vanilla TypeScript の Window plugin とし、Eagle 4.0.0 の Electron 22／Chromium 108 で実行できる target、相対 URL、clean output を外部 command から検証する。

Vite 固有の実装は manifest と project topology の規則を持たず、共通 build module の adapter とする。

### 3. `create-eagle-plugin`（Vanilla Window 完了）

公式の4種類のプラグイン構成から、新規プロジェクトを生成する。

生成する manifest は `eagle-plugin-manifest` で検証し、生成直後に型チェックが通る状態にする。

最初の版では、テンプレートの種類、出力先、UI 実装方式を選択対象とする。

Vanilla TypeScript の Window project は、対話実行と非対話実行の両方から生成できる。生成結果は install、typecheck、production build、共通 manifest 検証まで自動テストする。

UI 実装方式はフレームワークなしの TypeScript と React に限定する。ほかの UI フレームワークは、Eagle 上での実行互換性を確認してから追加する。

次の条件を満たした時点で完了とする。

- Window、Service、Preview、Inspector のプロジェクトを生成できる。
- 生成結果に必要な entrypoint、manifest、型参照が含まれる。
- 生成した全テンプレートで install、typecheck、build が成功する。

### 4. `eagle check`（公開基準版完了）

既存プロジェクトに対する公開前の Preflight を提供する。Eagle による審査の合格判定は行わない。

Vanilla Window の最小版では、manifest、HTML、compiled entrypoint、logo、`devTools` を機械的エラーとして検査する。ネットワーク参照は説明が必要な警告に留め、手動チェックリストと JSON 出力を同じ判定から生成する。

結果を次の三種類に分ける。

- エラー: manifest、entrypoint、アセット、`devTools: true`、秘密情報、開発用ファイル、安全でないパス、入れ子のアーカイブ、掲載文の文字数制限など、客観的に判定できる公開阻害要因
- 警告: バイナリ、外部通信、localhost、システムコマンド、削除、リモートコード、権限、開示事項など、用途や説明の文脈が必要な兆候
- 手動チェックリスト: 機能説明の正確性、画像、キャンセルとデータ保護、Plugin Author 自身の理解、生成した `.eagleplugin` の新規インストール確認

検証結果は人間向けの表示と機械処理向けの終了コードを持つ。成功時も「機械的な阻害要因は検出されなかった。手動確認と Eagle による審査は残っている」と明示する。

各 rule は根拠となる公式 URL と確認日を持つ。公開基準は 2026-08-01 に再確認し、機械的 error、文脈依存の warning、手動チェックを同じ schema v2 の判定から人間向け表示と JSON へ出力する。

入れ子のアーカイブと symbolic link は Eagle が常に拒否するという意味ではなく、初期 template が必要としないため framework 固有の release directory contract で禁止する。

### 5. `eagle dev`（Eagle 4.0 実機確認済み）

開発サーバーに、production build と同じ manifest 検証、設定解決、entrypoint 解析を組み込む。

`eagle dev` と `eagle build` は同じ設定解決と entrypoint 解析を使い、開発時と production build の解釈を一致させる。

`eagle dev` は開発用プラグインディレクトリにローカル HTML bridge を生成し、そこから Vite 開発サーバーへ接続する。Plugin Author はこのディレクトリを Eagle へ一度読み込み、Vanilla Windowのmodule変更がEagle 4.0上でHMR反映されることを確認済みである。非 UI entrypoint と設定変更は watch build と明示的な再読み込みで反映する。

自動再読み込みのために Eagle の非公開 IPC は利用しない。HMR は Eagle 上の実機プロトタイプで成功した組み合わせだけを対応対象とする。

共通のビルド処理は React に依存させず、React を選択したプロジェクトだけが React 用の Vite adapter を利用する。

### 6. React と残りのプラグイン形態

Vanilla Window の生成、build、Preflight、development loop が通った後に React Window を追加する。HMR は Eagle 4.0 実機で成功した role だけを対応対象とする。

その後、同じ command surface を Service、Format Preview、Inspector、複合 format group へ拡張する。各形態は生成から build、Preflight、development までを通す tracer bullet として追加する。

### 7. Extra Module の型定義

FFmpeg、AI SDK、AI Search の型定義は Core 向けツール群の後に追加する。

Extra Module は Core Plugin API より変更頻度が高いため、公開済みの機能と未公開の機能を区別して扱う。

型定義を追加するときは、依存プラグインの有無と Eagle の最低ビルド要件を JSDoc に記録する。

## 保留事項

### Eagle による `.eagleplugin` の生成と提出

最初の版では `.eagleplugin` を自動生成しない。

ツールは production build と提出前検証までを担当する。Plugin Author は Eagle アプリ内の「Pack Plugin」で `.eagleplugin` を生成し、Eagle Plugin Center の画面から提出する。

公式のパッケージ形式と提出 interface が公開された場合に限り、自動化を再検討する。

## 参照資料

- [Eagle Plugin API](https://developer.eagle.cool/plugin-api/api/)
- [manifest.json Configuration](https://developer.eagle.cool/plugin-api/tutorial/manifest)
- [Official Plugin Examples](https://github.com/eagle-app/eagle-plugin-examples)
- [Package Plugin](https://developer.eagle.cool/plugin-api/publishing/package)
- [Plugin Review Criteria](https://developer.eagle.cool/plugin-api/plugin-review/criteria)
- [Plugin API Changelog](https://developer.eagle.cool/plugin-api/changelog)
