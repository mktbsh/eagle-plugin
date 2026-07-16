# Roadmap

## 目的

このリポジトリでは、Eagle プラグインの開発、検証、雛形作成を支援するライブラリとツールを整備する。

各パッケージは同じ仕様を個別に実装せず、manifest と Plugin API の型を共有する。

## 現在地

### `eagle-plugin-dts`

Core Plugin API と manifest の型定義は整備済みである。

型定義は公式ドキュメントを根拠とし、Electron 由来の型は Eagle が公開する範囲だけをローカルに定義する。

次の作業は manifest の実行時検証を提供するパッケージである。

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

最初の版では、テンプレートの種類と出力先だけを選択対象とする。

依存ライブラリや UI フレームワークの選択肢は、利用実績が集まってから追加する。

次の条件を満たした時点で完了とする。

- Window、Service、Preview、Inspector のプロジェクトを生成できる。
- 生成結果に必要な entrypoint、manifest、型参照が含まれる。
- 生成した全テンプレートで install、typecheck、build が成功する。

### 3. `eagle-plugin-cli check`

既存プロジェクトを配布前に検証するコマンドを提供する。

最初の版では次の項目を検証する。

- manifest の構造
- manifest から参照される entrypoint の存在
- logo、thumbnail、viewer、inspector の参照先
- プラグイン種別ごとの必須ファイル
- package に含めるべきでない開発用ファイル

検証結果は人間向けの表示と機械処理向けの終了コードを持つ。

### 4. Vite 連携

開発サーバーと production build に、manifest 検証とプラグイン用ファイルの配置を組み込む。

Vite 固有の実装は、manifest とプロジェクト検証のロジックを持たず、既存パッケージの adapter として実装する。

### 5. Extra Module の型定義

FFmpeg、AI SDK、AI Search の型定義は Core 向けツール群の後に追加する。

Extra Module は Core Plugin API より変更頻度が高いため、公開済みの機能と未公開の機能を区別して扱う。

型定義を追加するときは、依存プラグインの有無と Eagle の最低ビルド要件を JSDoc に記録する。

## 保留事項

### `.eagleplugin` の自動生成

packager はファイル形式を確認できるまで実装しない。

公式ドキュメントは Eagle アプリ内の「Pack Plugin」を利用する手順を案内しているが、`.eagleplugin` のファイル形式は公開していない。

仕様が公開されるか、複数バージョンで互換性を検証できた時点で、CLI への追加を再検討する。

## 参照資料

- [Eagle Plugin API](https://developer.eagle.cool/plugin-api/api/)
- [manifest.json Configuration](https://developer.eagle.cool/plugin-api/tutorial/manifest)
- [Official Plugin Examples](https://github.com/eagle-app/eagle-plugin-examples)
- [Package Plugin](https://developer.eagle.cool/plugin-api/distribution/package)
- [Plugin API Changelog](https://developer.eagle.cool/plugin-api/changelog)
