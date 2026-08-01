---
status: accepted
date: 2026-08-01T04:46:39+09:00
agent: Codex (GPT-5)
---

# Use a strict framework release directory contract

## Context

Eagle の [Package Contents](https://developer.eagle.cool/plugin-api/plugin-review/criteria/package-contents) と [Release Configuration and Reviewability](https://developer.eagle.cool/plugin-api/plugin-review/criteria/configuration-and-reviewability) では、入れ子のアーカイブや package 内を指す symbolic link は、存在だけで一律に不合格になるとは限らない。
用途、内容、展開先、出所を人が確認する余地がある。
公開基準と実装境界は [Eagle Plugin 公開 Preflight 規則の一次資料調査](../research/2026-08-01-eagle-plugin-preflight-rules.md) に記録する。

一方、このフレームワークが初期対応する template の release candidate は、静的な HTML、JavaScript、CSS、画像、manifest だけで完結する。
入れ子のアーカイブ、installer、symbolic link を必要とする対応済みユースケースはない。
これらを warning にすると、意図しない build artifact と package 外参照を提出直前まで残せてしまう。

## Decision

`eagle check` は、フレームワークが管理する release directory に入れ子のアーカイブ、installer、symbolic link を許可しない。
検出時は Eagle の一律禁止ではなく、framework release contract への違反を表す error として報告する。

Native binary、runtime dependency directory、network、localhost、system command、削除、remote code、権限、開示候補は、存在だけで不適切とは判断できないため warning のままにする。
警告には検出箇所を付け、Plugin Author が用途と提出時の説明を判断できるようにする。

将来、対応する template が archive や symbolic link を実際に必要とした場合に限り、対象を限定した契約を新しい ADR で設計する。

## Consequences

- 初期 template の release candidate は、検査可能な通常ファイルだけで構成される。
- 誤って残った backup、installer、package 外参照を機械的に停止できる。
- `eagle check` の error は Eagle の公開基準そのものと framework 固有の配布契約を message で区別する必要がある。
- 任意の既存 Eagle plugin directory に対する汎用 validator ではなく、framework が生成・支援する release candidate の Preflight になる。
