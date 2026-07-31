---
title: 03 — Vanilla Window プロジェクトを生成する
status: completed
date: 2026-08-01T03:20:41+09:00
completed: 2026-08-01T04:07:51+09:00
agent: Codex (GPT-5)
spec: 0001-eagle-plugin-framework
blocked_by:
  - 02-vanilla-window-production-build
---

# 03 — Vanilla Window プロジェクトを生成する

**What to build:** Plugin Author が `pnpm create eagle-plugin` から Vanilla TypeScript の Window プロジェクトを生成し、生成直後に編集可能で build できる状態を得る。

**Blocked by:** 02 — Vanilla Window を production build する。

- [x] generator が出力先、Window topology、Vanilla TypeScript を対話的に選択できる。
- [x] 同じ選択を非対話実行で渡せるため、TTY のない検証環境でも生成できる。
- [x] 既存の非空ディレクトリを明示的な許可なしに上書きしない。
- [x] 生成結果に型付き設定、Window entrypoint、Eagle Plugin API の型参照、必要な package scripts と assets が含まれる。
- [x] 生成された package は pnpm install 後に typecheck と `eagle build` が成功する。
- [x] 生成された release candidate の manifest が共通の manifest trust boundary を通る。
- [x] generator の取消、入力エラー、file-system エラーが、部分的な成功と誤認されない表示と終了コードを返す。
- [x] isolated directory へ実際に生成する end-to-end test が、生成、install、typecheck、build を検証する。
