---
title: 02 — Vanilla Window を production build する
status: ready-for-agent
date: 2026-08-01T03:20:41+09:00
agent: Codex (GPT-5)
spec: 0001-eagle-plugin-framework
blocked_by:
  - 01-manifest-trust-boundary
---

# 02 — Vanilla Window を production build する

**What to build:** Plugin Author が型付き設定と Vanilla TypeScript の Window entrypoint を用意し、`eagle build` を実行すると、Eagle 4.0 で読み込める release candidate を得られる最小の end-to-end 経路を作る。

**Blocked by:** 01 — Manifest の信頼境界を提供する。

- [ ] `eagle` command が `build` subcommand と、引数なしの場合の簡潔な help を提供する。
- [ ] 型付き設定を唯一の authored manifest source として読み込み、外部入力として検証する。
- [ ] Vanilla TypeScript の Window entrypoint を規約から発見し、Window topology として解決する。
- [ ] Service または Formats と混在する曖昧な topology を、build 開始前の設定エラーにする。
- [ ] release candidate に検証済み `manifest.json`、生成 HTML、compiled entrypoint、必要な assets を出力する。
- [ ] HTML と assets はローカルディレクトリから読み込める相対参照を使う。
- [ ] JavaScript は少なくとも Eagle 4.0.0 の Electron 22／Chromium 108 で実行可能な target へ build する。
- [ ] framework-owned output は毎回再生成され、前回の不要ファイルが残らない。
- [ ] 正常な fixture と不正な topology を、`eagle build` の process、生成物、stderr、終了コードから検証する。

