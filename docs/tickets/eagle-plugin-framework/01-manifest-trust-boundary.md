---
title: 01 — Manifest の信頼境界を提供する
status: completed
date: 2026-08-01T03:20:41+09:00
completed: 2026-08-01T03:36:37+09:00
agent: Codex (GPT-5)
spec: 0001-eagle-plugin-framework
blocked_by: []
---

# 01 — Manifest の信頼境界を提供する

**What to build:** Eagle の公式 manifest を unknown の入力から検証済みデータへ変換し、後続の生成、build、Preflight が同じ判定を共有できる公開 interface を提供する。

**Blocked by:** None — can start immediately.

- [x] Window、Service、Preview、Inspector の公式サンプルと同等の manifest を実行時に受理する。
- [x] `parseManifest` は成功時に検証済み manifest を返し、失敗時は location、stable code、message を持つ問題を返すか送出する。
- [x] `validateManifest` は同じ規則を使い、呼び出し側が全問題を検査できる結果を返す。
- [x] `defineManifest` は型推論を保ったまま manifest を定義でき、実行時依存を暗黙に追加しない。
- [x] Window、Service、Formats の排他条件、必須値、role ごとの URL と設定の不正を検出する。
- [x] TypeScript の manifest 型と実行時検証が、公式の正常形について同じ入力を受理する。
- [x] 同じ規則から利用可能な JSON Schema を配布物へ含める。
- [x] 公式サンプル、代表的な不正入力、公開 package 内容を外部 interface から検証するテストが通る。
