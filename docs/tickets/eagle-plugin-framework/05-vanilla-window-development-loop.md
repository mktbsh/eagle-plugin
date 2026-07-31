---
title: 05 — Vanilla Window の開発ループを通す
status: needs-manual-verification
date: 2026-08-01T03:20:41+09:00
updated: 2026-08-01T04:30:28+09:00
agent: Codex (GPT-5)
spec: 0001-eagle-plugin-framework
blocked_by:
  - 02-vanilla-window-production-build
---

# 05 — Vanilla Window の開発ループを通す

**What to build:** Plugin Author が `eagle dev` で Vanilla Window の開発を開始し、Eagle へ一度読み込む安定した plugin directory と、Vite server に接続する local HTML bridge を使って変更を確認できるようにする。

**Blocked by:** 02 — Vanilla Window を production build する。

- [x] `eagle dev` が production と同じ設定解決、topology discovery、manifest generation を使う。
- [x] 開発実行ごとに同じ安定した development-plugin directory を生成または更新する。
- [x] development manifest の URL は plugin directory 内の local HTML bridge を参照し、absolute HTTP URL を直接設定しない。
- [x] bridge が Vite development server へ接続し、Vanilla Window の変更を反映できる。
- [x] 起動表示が Eagle へ読み込む directory、server address、現在の反映方式、reload が必要な変更を具体的に示す。
- [x] configuration または topology の変更を検出し、watch build 後に Eagle reload が必要だと案内する。
- [x] private Eagle IPC を呼び出さない。
- [x] server startup failure、port failure、invalid project が actionable diagnostic と nonzero exit になる。
- [x] automated test が bridge、manifest、server connection、watch update、reload guidance を外部から検証する。
- [ ] Eagle 4.0 で local project を読み込み、Window 表示と基本的な更新を手動確認する。

## Manual verification

`/Applications/Eagle.app` の `CFBundleShortVersionString` が `4.0.0` であることは確認済み。生成プロジェクトで `pnpm dev` を実行し、表示された `.eagle-plugin-dev` directory を Eagle の `Plugin > Import Local Project` から読み込む。Window が表示され、`entrypoints/window.ts` の変更が反映されることを確認した後、この ticket を完了へ更新する。
