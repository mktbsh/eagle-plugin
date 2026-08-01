---
title: 11 — 配布パッケージと実機受け入れを完成させる
status: ready-for-agent
date: 2026-08-01T03:20:41+09:00
agent: Codex (GPT-5)
spec: 0001-eagle-plugin-framework
blocked_by:
  - 06-react-window-and-hmr
  - 07-service-end-to-end
  - 08-format-preview-end-to-end
  - 09-inspector-and-combined-format-groups
  - 10-complete-publication-preflight
---

# 11 — 配布パッケージと実機受け入れを完成させる

**What to build:** Plugin Author が workspace の偶然に依存しない配布 package から全対応 project を生成でき、Eagle 4.0 で公式の Pack Plugin と fresh install まで完了できる release-ready な利用経路を作る。

**Blocked by:** 06 — React Window と HMR を追加する、07 — Service を一貫して扱う、08 — Format Preview を一貫して扱う、09 — Inspector と複合 format group を扱う、10 — 公開基準に沿った Preflight を完成させる。

- [ ] framework、generator、公開する低レベル package の dry pack が意図した runtime、types、schema、templates、documentation だけを含む。
- [ ] isolated consumer が local package tarballs を install し、`pnpm create eagle-plugin` と `eagle` commands を workspace link なしで実行できる。
- [ ] Window、Service、Preview、Inspector、combined format group と、各 role で対応する Vanilla／React の全 template matrix が生成、install、typecheck、build、check を通る。
- [ ] CLI help、non-interactive behavior、stdout／stderr、終了コード、取消と失敗時の cleanup を package consumer として検証する。
- [ ] Eagle 4.0 実機で各 topology の development-plugin import、主要 behavior、宣言した HMR または reload flow を確認する。
- [ ] release candidate を Eagle の Pack Plugin で `.eagleplugin` にし、その fresh install と主要 behavior を確認する。
- [ ] build と Preflight の成功後に、Pack Plugin、fresh install、Plugin Center submission の手順を案内する。
- [ ] 文書が対応 topology、React の実機確認範囲、minimum Eagle runtime、Preflight の限界、manual packaging boundary を正確に説明する。
- [ ] npm publish、Plugin Center submission、tag、release、visibility change を実行せず、実施する場合は別途 Plugin Author の明示承認を必要とする。
