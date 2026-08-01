---
title: 07 — Service を一貫して扱う
status: ready-for-agent
date: 2026-08-01T03:20:41+09:00
agent: Codex (GPT-5)
spec: 0001-eagle-plugin-framework
blocked_by:
  - 03-generate-vanilla-window-project
  - 04-preflight-window-release
  - 05-vanilla-window-development-loop
---

# 07 — Service を一貫して扱う

**What to build:** Plugin Author が Service project を生成し、Service 固有の manifest と実行形態を同じ `eagle` commands で build、Preflight、development できるようにする。

**Blocked by:** 03 — Vanilla Window プロジェクトを生成する、04 — Window 配布物を Preflight する、05 — Vanilla Window の開発ループを通す。

- [ ] generator が Service topology と、実際に対応する UI strategy を選択できる。
- [ ] Service entrypoint だけを持つ project を Service topology として解決し、Window または Formats との混在を拒否する。
- [ ] `eagle build` が Service role と service mode を正しく持つ検証済み manifest と compiled code を生成する。
- [ ] `eagle check` が Service の必須出力と参照先を検証し、Window 固有のファイルを要求しない。
- [ ] `eagle dev` が Service code を watch build し、Eagle で reload が必要なことを具体的に案内する。
- [ ] Service が status UI を持つ場合の React support は Eagle 4.0 実機で動作を確認できた組み合わせだけを generator に表示する。
- [ ] private reload IPC を使わず、未確認の Service HMR を対応済みと表示しない。
- [ ] generated Service project の install、typecheck、build、check、watch update を外部 interface から検証する。

