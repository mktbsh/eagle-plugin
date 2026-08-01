---
status: accepted
date: 2026-08-01T03:04:14+09:00
agent: Codex (GPT-5)
---

# Use one eagle command surface

Plugin Author の日常操作は `eagle-plugin` package が提供する `eagle` command に集約し、`eagle dev`、`eagle build`、`eagle check` を一貫した subcommand として提供する。新規プロジェクトだけは package manager の `create` 規約に合わせて `create-eagle-plugin` から生成し、manifest、Vite、React の低レベル module は通常の操作で直接扱わせない。

## Consequences

`eagle` を引数なしで実行した場合は、簡潔なヘルプと代表的な次の操作を表示する。人間向け出力と機械向け出力、終了コード、TTY 非依存の動作は全 subcommand で共通化する。
