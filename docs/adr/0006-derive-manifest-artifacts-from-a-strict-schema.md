---
status: accepted
date: 2026-08-01T03:36:37+09:00
agent: Codex (GPT-5)
---

# Derive manifest artifacts from a strict schema

## Context

Manifest の TypeScript 型、実行時検証、JSON Schema を別々に保守すると、同じ入力に対する受理結果がずれる。外部 JSON を検証する際に未知フィールドを削除すると、Plugin Author の typo と Eagle が新しく追加したフィールドも区別できないまま build が進む。

## Decision

`eagle-plugin-manifest` の strict runtime schema を manifest の唯一の source とし、公開 TypeScript 型と JSON Schema をそこから導出する。`eagle-plugin-dts` の manifest 型はこの公開型を参照し、別の構造を再定義しない。

未知フィールドは削除せず、location と stable code を持つ検証エラーにする。Eagle の公式フィールドが追加された場合は、公式仕様と実例を確認して runtime schema を更新する。

## Consequences

- Runtime validation、TypeScript、JSON Schema が同じ合法状態を表現する。
- Manifest の typo は trust boundary で停止し、生成物へ伝播しない。
- 新しい Eagle manifest field への対応には framework の更新が必要になる。
- `eagle-plugin-dts` は manifest 型の解決に `eagle-plugin-manifest` を依存先として持つ。
