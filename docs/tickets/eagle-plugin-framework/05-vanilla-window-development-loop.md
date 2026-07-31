---
title: 05 — Vanilla Window の開発ループを通す
status: ready-for-agent
date: 2026-08-01T03:20:41+09:00
agent: Codex (GPT-5)
spec: 0001-eagle-plugin-framework
blocked_by:
  - 02-vanilla-window-production-build
---

# 05 — Vanilla Window の開発ループを通す

**What to build:** Plugin Author が `eagle dev` で Vanilla Window の開発を開始し、Eagle へ一度読み込む安定した plugin directory と、Vite server に接続する local HTML bridge を使って変更を確認できるようにする。

**Blocked by:** 02 — Vanilla Window を production build する。

- [ ] `eagle dev` が production と同じ設定解決、topology discovery、manifest generation を使う。
- [ ] 開発実行ごとに同じ安定した development-plugin directory を生成または更新する。
- [ ] development manifest の URL は plugin directory 内の local HTML bridge を参照し、absolute HTTP URL を直接設定しない。
- [ ] bridge が Vite development server へ接続し、Vanilla Window の変更を反映できる。
- [ ] 起動表示が Eagle へ読み込む directory、server address、現在の反映方式、reload が必要な変更を具体的に示す。
- [ ] configuration または topology の変更を検出し、watch build 後に Eagle reload が必要だと案内する。
- [ ] private Eagle IPC を呼び出さない。
- [ ] server startup failure、port failure、invalid project が actionable diagnostic と nonzero exit になる。
- [ ] automated test が bridge、manifest、server connection、watch update、reload guidance を外部から検証し、Eagle 4.0 で基本接続を手動確認する。

