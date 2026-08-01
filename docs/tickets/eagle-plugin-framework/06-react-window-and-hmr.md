---
title: 06 — React Window と HMR を追加する
status: ready-for-agent
date: 2026-08-01T03:20:41+09:00
agent: Codex (GPT-5)
spec: 0001-eagle-plugin-framework
blocked_by:
  - 03-generate-vanilla-window-project
  - 04-preflight-window-release
  - 05-vanilla-window-development-loop
---

# 06 — React Window と HMR を追加する

**What to build:** Plugin Author が generator で React Window を選択し、Vanilla と同じ command surface で typecheck、production build、Preflight、Eagle development を行えるようにする。

**Blocked by:** 03 — Vanilla Window プロジェクトを生成する、04 — Window 配布物を Preflight する、05 — Vanilla Window の開発ループを通す。

- [ ] generator が Window の UI strategy として React を選択できる。
- [ ] React template が Eagle Plugin API types と React の strict TypeScript 設定を持ち、生成直後に typecheck できる。
- [ ] React integration は framework-neutral build calculation の adapter とし、Vanilla build に React dependency を持ち込まない。
- [ ] `eagle build` が相対参照を持つ React Window release candidate を生成し、`eagle check` が成功する。
- [ ] `eagle dev` が React development client を local bridge 経由で読み込む。
- [ ] Eagle 4.0 実機で state を含む React UI の HMR と error recovery を確認する。
- [ ] 実機確認に失敗した HMR behavior は対応済みと表示せず、watch build と明示的な reload guidance へ戻す。
- [ ] isolated generated project の install、typecheck、build、check と、development bridge の外部テストが通る。

