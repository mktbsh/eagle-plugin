---
title: 10 — 公開基準に沿った Preflight を完成させる
status: ready-for-agent
date: 2026-08-01T03:20:41+09:00
agent: Codex (GPT-5)
spec: 0001-eagle-plugin-framework
blocked_by:
  - 04-preflight-window-release
---

# 10 — 公開基準に沿った Preflight を完成させる

**What to build:** Plugin Author が Eagle Plugin Center へ提出する前に、公開された審査基準から機械的に判定できる阻害要因を検出し、説明が必要な兆候と人手確認を分離して受け取れるようにする。

**Blocked by:** 04 — Window 配布物を Preflight する。

- [ ] Preflight rule が根拠となる公式基準と最終確認日を追跡できる。
- [ ] secret-like files、version-control metadata、editor files、cache、development artifacts を release error として検出する。
- [ ] absolute path、path traversal、symlink escape、nested archive など、安全でない package 内容を release error として検出する。
- [ ] 設定から判定可能な掲載情報について、公式の hard length limits を release error として検出する。
- [ ] binary、external network、localhost、system command、deletion、remote code、permission、disclosure candidate を warning として報告する。
- [ ] warning detection は検出根拠を示し、文脈だけで許否が変わる behavior を自動的な error にしない。
- [ ] manual checklist が機能説明の正確性、visual assets、cancellation、data safety、Plugin Author の理解、fresh artifact installation を含む。
- [ ] 人間向け出力と JSON が同じ findings、severity、stable codes、evidence、manual checks を表す。
- [ ] complete fixtures と一項目だけ違う fixtures により、各 rule の positive／negative behavior と exit status を CLI process から検証する。

