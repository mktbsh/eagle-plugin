---
title: 04 — Window 配布物を Preflight する
status: completed
date: 2026-08-01T03:20:41+09:00
completed: 2026-08-01T04:18:14+09:00
agent: Codex (GPT-5)
spec: 0001-eagle-plugin-framework
blocked_by:
  - 02-vanilla-window-production-build
---

# 04 — Window 配布物を Preflight する

**What to build:** Plugin Author が `eagle check` を実行し、Window release candidate の機械的な阻害要因、説明が必要な兆候、手動確認事項を区別して確認できる最小の Preflight を作る。

**Blocked by:** 02 — Vanilla Window を production build する。

- [x] 正常な Window release candidate に対して、人間向けの Preflight 結果を stdout へ表示する。
- [x] invalid manifest、存在しない entrypoint、存在しない logo または HTML、`devTools: true` を stable code 付きのエラーにする。
- [x] 結果は errors、warnings、manual checks を混同せずに表示する。
- [x] `eagle check --json` が同じ判定を documented machine-readable shape で返す。
- [x] mechanical error があれば nonzero、warning と manual check だけなら zero の終了コードを返す。
- [x] diagnostic と実行エラーは stderr、要求された通常結果は stdout へ出力する。
- [x] 成功時も、機械的な阻害要因を検出しなかっただけであり、手動確認と Eagle review が残ると明示する。
- [x] CLI process に release fixtures を渡すテストが、人間向け出力、JSON、stable code、stdout／stderr、終了コードを検証する。
