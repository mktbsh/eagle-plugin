---
status: accepted
date: 2026-08-01T02:47:12+09:00
agent: Codex (GPT-5)
---

# Generate manifest from typed config

Plugin Author は公式形式の `manifest.json` を直接編集せず、型付きの `eagle.config.ts` を唯一の入力として扱う。ビルド module がプラグイン種別の制約、開発・公開設定、対象実行環境を解決して配布用 `manifest.json` を生成することで、小さな interface の内側に Eagle 固有の複雑さを集約する。

## Consequences

生成された `manifest.json` はビルド成果物であり、編集対象ではない。公式形式との互換性は生成結果と公式サンプルを使って検証する。
