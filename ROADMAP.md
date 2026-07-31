# Roadmap

## 目的

このリポジトリでは、Eagle プラグインの開発、検証、雛形作成を支援するライブラリとツールを整備する。

各パッケージは同じ仕様を個別に実装せず、manifest と Plugin API の型を共有する。

実装対象の仕様は [Eagle Plugin framework and tooling](./docs/specs/0001-eagle-plugin-framework.md) にまとめる。

## 現在地

### `eagle-plugin-dts`

Core Plugin API と manifest の型定義は整備済みである。

型定義は公式ドキュメントを根拠とし、Electron 由来の型は Eagle が公開する範囲だけをローカルに定義する。

次の作業は manifest の実行時検証を提供するパッケージである。

## Plugin Author interface

新規プロジェクトは `pnpm create eagle-plugin` で生成する。生成後の日常操作は `eagle-plugin` package が提供する一つの command surface に集約する。

```sh
eagle dev
eagle build
eagle check
```

manifest、Vite、React の低レベル module はこの interface の内側で共有し、Plugin Author に同じ判断を繰り返させない。

## 実装順

### 1. `eagle-plugin-manifest`

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

### 2. `create-eagle-plugin`

公式の4種類のプラグイン構成から、新規プロジェクトを生成する。

生成する manifest は `eagle-plugin-manifest` で検証し、生成直後に型チェックが通る状態にする。

最初の版では、テンプレートの種類、出力先、UI 実装方式を選択対象とする。

UI 実装方式はフレームワークなしの TypeScript と React に限定する。ほかの UI フレームワークは、Eagle 上での実行互換性を確認してから追加する。

次の条件を満たした時点で完了とする。

- Window、Service、Preview、Inspector のプロジェクトを生成できる。
- 生成結果に必要な entrypoint、manifest、型参照が含まれる。
- 生成した全テンプレートで install、typecheck、build が成功する。

### 3. `eagle check`

既存プロジェクトに対する公開前の Preflight を提供する。Eagle による審査の合格判定は行わない。

結果を次の三種類に分ける。

- エラー: manifest、entrypoint、アセット、`devTools: true`、秘密情報、開発用ファイル、安全でないパス、入れ子のアーカイブ、掲載文の文字数制限など、客観的に判定できる公開阻害要因
- 警告: バイナリ、外部通信、localhost、システムコマンド、削除、リモートコード、権限、開示事項など、用途や説明の文脈が必要な兆候
- 手動チェックリスト: 機能説明の正確性、画像、キャンセルとデータ保護、Plugin Author 自身の理解、生成した `.eagleplugin` の新規インストール確認

検証結果は人間向けの表示と機械処理向けの終了コードを持つ。成功時も「機械的な阻害要因は検出されなかった。手動確認と Eagle による審査は残っている」と明示する。

### 4. Vite 連携

開発サーバーと production build に、manifest 検証とプラグイン用ファイルの配置を組み込む。

`eagle dev` と `eagle build` は同じ設定解決と entrypoint 解析を使い、開発時と production build の解釈を一致させる。

`eagle dev` は開発用プラグインディレクトリにローカル HTML bridge を生成し、そこから Vite 開発サーバーへ接続する。Plugin Author はこのディレクトリを Eagle へ一度読み込み、UI は HMR、非 UI entrypoint と設定変更は watch build と明示的な再読み込みで反映する。

自動再読み込みのために Eagle の非公開 IPC は利用しない。HMR は Eagle 上の実機プロトタイプで成功した組み合わせだけを対応対象とする。

Vite 固有の実装は、manifest とプロジェクト検証のロジックを持たず、既存パッケージの adapter として実装する。

Plugin Author は型付きの `eagle.config.ts` を唯一の入力として編集し、配布用の `manifest.json` はビルド時に生成する。

entrypoint のパスは `eagle.config.ts` に列挙せず、`entrypoints/` 配下の規約化されたファイル配置から推論する。

Window は `entrypoints/window.*`、Service は `entrypoints/service.*`、Preview と Inspector は `entrypoints/formats/<group>/` 配下の `thumbnail.*`、`viewer.*`、`inspector.*` で表現する。これらのプラグイン種別は同じプロジェクト内で混在させない。

共通のビルド処理は React に依存させず、React を選択したプロジェクトだけが React 用の Vite adapter を利用する。

### 5. Extra Module の型定義

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
