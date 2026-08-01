---
title: 09 — Inspector と複合 format group を扱う
status: ready-for-agent
date: 2026-08-01T03:20:41+09:00
agent: Codex (GPT-5)
spec: 0001-eagle-plugin-framework
blocked_by:
  - 08-format-preview-end-to-end
---

# 09 — Inspector と複合 format group を扱う

**What to build:** Plugin Author が Inspector project を生成でき、同じ format group に Preview と Inspector の role が存在する合法な状態も一つの設定と command surface で扱えるようにする。

**Blocked by:** 08 — Format Preview を一貫して扱う。

- [ ] generator が Inspector role、format group key、対象 extensions、Vanilla または React UI strategy を入力できる。
- [ ] Inspector だけの group と、Thumbnail／Viewer／Inspector を組み合わせた group を合法な Formats topology として解決する。
- [ ] role に必要な entrypoint の欠落、未知の role、group 間の不整合を build 前に拒否する。
- [ ] `eagle build` が Inspector HTML、compiled entrypoint、role-specific options を検証済み manifest へ生成する。
- [ ] `eagle check` が Inspector と複合 group の全参照先を検証する。
- [ ] `eagle dev` が Inspector bridge を提供し、topology または configuration の変更では Eagle reload を案内する。
- [ ] Inspector HMR は Eagle 4.0 実機で確認できた UI strategy だけを対応済みと表示する。
- [ ] Inspector-only と combined format group の generated projects が install、typecheck、build、check、development test を通る。

