---
status: accepted
date: 2026-08-01T02:49:52+09:00
updated: 2026-08-01T03:00:58+09:00
agent: Codex (GPT-5)
---

# Infer entrypoints from file layout

Plugin Author は entrypoint のパスを `eagle.config.ts` に列挙せず、`entrypoints/` 配下の規約化されたファイル配置でプラグインの実行面を表現する。ビルド module は配置を解析して配布用パスへ変換し、不正または曖昧な組み合わせを設定エラーとして報告する。

## Consequences

`eagle.config.ts` には名前、バージョン、対象拡張子などファイル配置から推論できない情報だけを記述する。配置規約は Plugin Author とビルド module が共有する外部 interface として扱う。

初版の配置規約は次の形とする。

```text
entrypoints/
├── window.ts | window.tsx
├── service.ts | service.tsx
└── formats/
    └── <group>/
        ├── thumbnail.ts
        ├── viewer.ts | viewer.tsx
        └── inspector.ts | inspector.tsx
```

`window`、`service`、`formats` は相互に排他とする。format group は `eagle.config.ts` の同名 key と結合し、対象拡張子と role 固有の設定だけを受け取る。HTML、出力パス、`serviceMode`、manifest key はビルド module が生成し、独自 HTML の差し替えは初版で提供しない。

## Considered Options

種別ごとに一つのディレクトリを置く案は、複数の format group が異なる実装を持てないため退けた。すべてを汎用的な scope と role の組で表す案は柔軟だが、一般的な Window プラグインに不要な概念を学ばせるため退けた。
