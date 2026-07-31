---
title: 08 — Format Preview を一貫して扱う
status: ready-for-agent
date: 2026-08-01T03:20:41+09:00
agent: Codex (GPT-5)
spec: 0001-eagle-plugin-framework
blocked_by:
  - 03-generate-vanilla-window-project
  - 04-preflight-window-release
  - 05-vanilla-window-development-loop
---

# 08 — Format Preview を一貫して扱う

**What to build:** Plugin Author が拡張子に対応する format group と Thumbnail／Viewer を持つ Preview project を生成し、build、Preflight、development まで一つの流れで扱えるようにする。

**Blocked by:** 03 — Vanilla Window プロジェクトを生成する、04 — Window 配布物を Preflight する、05 — Vanilla Window の開発ループを通す。

- [ ] generator が Preview project、format group key、対象 extensions、Viewer の UI strategy を入力できる。
- [ ] entrypoint の format group key と typed configuration の同名 group を結合する。
- [ ] 存在しない設定 group、孤立した entrypoint group、重複または無効な extensions を build 前に拒否する。
- [ ] `eagle build` が Thumbnail と Viewer の role、extensions、生成 HTML、compiled entrypoints を持つ検証済み manifest を生成する。
- [ ] Thumbnail は framework-neutral な logic entrypoint とし、Viewer は Vanilla と React の対応済み UI strategy を利用できる。
- [ ] `eagle check` が Preview の必須 role、HTML、assets、extensions を検証する。
- [ ] `eagle dev` が Viewer の bridge と Thumbnail の watch build を提供し、Thumbnail 変更後の Eagle reload を案内する。
- [ ] Viewer HMR は Eagle 4.0 実機で確認できた strategy だけを対応済みと表示する。
- [ ] generated Preview project の install、typecheck、build、check、development behavior を外部から検証する。

