---
status: accepted
date: 2026-08-01T03:11:06+09:00
agent: Codex (GPT-5)
---

# Use a local bridge for development

`eagle dev` は安定した開発用プラグインディレクトリを生成し、ローカル HTML bridge から Vite 開発サーバーへ接続する。Eagle 4.0.0 は `manifest.main.url` をプラグインディレクトリ内のローカルファイルとして解決するため、manifest に開発サーバー URL を直接書かず、Eagle の非公開 IPC にも依存しない。

## Consequences

Plugin Author は開発用プラグインディレクトリを Eagle へ一度読み込む。Window、Viewer、Inspector の UI は実機プロトタイプで確認できた場合だけ HMR を保証し、Service、Thumbnail、設定、entrypoint 構造の変更は watch build 後に Eagle での再読み込みを案内する。HMR の検証に失敗しても `eagle dev` は watch build と具体的な再読み込み案内を提供する。
