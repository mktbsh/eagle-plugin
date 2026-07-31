---
title: Eagle Plugin framework and tooling
status: ready-for-agent
date: 2026-08-01T03:16:07+09:00
agent: Codex (GPT-5)
---

# Eagle Plugin framework and tooling

## Problem Statement

Plugin Author が Eagle プラグインを作るには、公式 manifest、複数のプラグイン形態、Eagle 固有の実行環境、Vite の設定、配布物の安全性、Plugin Center の審査項目を個別に理解して組み合わせる必要がある。公式サンプルは実行形態の理解には役立つが、新規プロジェクトの生成から日常的な開発、production build、公開前の確認までを一つの流れとしては提供しない。

このため、TypeScript と Vite を使える開発者でも、Eagle プラグイン固有の定型作業を繰り返し、開発時と配布時で異なる設定を持ち、動かない manifest や審査前に発見できた問題を作り込みやすい。UI フレームワークを導入すると、Eagle の埋め込みブラウザーとの互換性や開発サーバーへの接続方法も Plugin Author 自身の責任になる。

## Solution

新規作成から公開準備までを、`pnpm create eagle-plugin` と `eagle dev`、`eagle build`、`eagle check` という一つの流れで扱える開発基盤を提供する。

Plugin Author は型付き設定と規約化された entrypoint だけを管理する。ツールはプロジェクト形態を解析し、公式 manifest と HTML を生成し、Eagle の実行環境に合わせて build する。開発時は Eagle が読み込める安定したローカルプラグインと Vite 開発サーバーの bridge を提供し、利用可能な UI では HMR を使う。配布前は Preflight により、機械的な阻害要因、説明が必要な兆候、手動確認事項を分けて提示する。

最終的な `.eagleplugin` の生成と Plugin Center への提出は、公開された自動化 interface がないため Eagle アプリと公式画面で Plugin Author が行う。

## User Stories

1. As a Plugin Author, I want to create a new Eagle plugin with one package-manager command, so that I can start without assembling a toolchain myself.
2. As a Plugin Author, I want the generator to ask for an output directory, so that I can create the project in the intended location.
3. As a Plugin Author, I want to choose an official plugin form, so that the generated project matches the Eagle feature I am building.
4. As a Plugin Author, I want to choose plain TypeScript for UI entrypoints, so that I can build a plugin without a UI framework.
5. As a Plugin Author, I want to choose React for supported UI entrypoints, so that I can use a familiar component model.
6. As a Plugin Author, I want unsupported UI framework choices to be absent, so that an unverified combination is not presented as working.
7. As a Plugin Author, I want every generated template to typecheck immediately, so that the starting point is known to be valid.
8. As a Plugin Author, I want every generated template to build immediately, so that I can distinguish template defects from my later changes.
9. As a Plugin Author, I want Eagle Plugin API types to be configured automatically, so that the `eagle` global is typed without runtime imports.
10. As a Plugin Author, I want one typed configuration source, so that development and production cannot silently drift between separate manifest files.
11. As a Plugin Author, I want the distribution manifest to be generated, so that I do not need to maintain derived paths and plugin-form details.
12. As a Plugin Author, I want configuration errors to identify the invalid field and reason, so that I can correct them without reading framework internals.
13. As a Plugin Author, I want entrypoints to be discovered from a documented file convention, so that I do not repeat their paths in configuration.
14. As a Plugin Author, I want a Window entrypoint to imply a Window plugin, so that the common case has minimal configuration.
15. As a Plugin Author, I want a Service entrypoint to imply a Service plugin, so that background behavior is represented directly by the project structure.
16. As a Plugin Author, I want format groups to associate file extensions with Thumbnail, Viewer, and Inspector roles, so that related format behavior stays together.
17. As a Plugin Author, I want ambiguous combinations of Window, Service, and format entrypoints to fail, so that one project cannot represent an illegal topology.
18. As a Plugin Author, I want missing entrypoints required by my selected format roles to fail early, so that Eagle never receives an incomplete plugin.
19. As a Plugin Author, I want generated HTML and output paths to follow the framework convention, so that I do not configure Vite and manifest paths separately.
20. As a Plugin Author, I want a production build suited to the supported Eagle runtime, so that modern build defaults do not emit unsupported JavaScript.
21. As a Plugin Author, I want static assets and module URLs to work from a local plugin directory, so that the production build does not assume an HTTP origin.
22. As a Plugin Author, I want `eagle dev` to produce a stable development-plugin directory, so that I only need to import it into Eagle once.
23. As a Plugin Author, I want the development plugin to connect through a local HTML bridge, so that Eagle can retain its required file-based manifest URL.
24. As a Plugin Author, I want React UI changes to use HMR where real Eagle testing proves it works, so that UI iteration is fast without overstating support.
25. As a Plugin Author, I want development to continue with watch builds when HMR is unavailable, so that every supported entrypoint remains usable.
26. As a Plugin Author, I want explicit reload guidance after Service, Thumbnail, configuration, or topology changes, so that I know when Eagle still holds old code.
27. As a Plugin Author, I want development tooling to avoid private Eagle IPC, so that it does not rely on an undocumented internal contract.
28. As a Plugin Author, I want development and production commands to share configuration and entrypoint resolution, so that a successful development run predicts the production build.
29. As a Plugin Author, I want `eagle build` to recreate its output deterministically, so that stale generated files cannot enter the release candidate.
30. As a Plugin Author, I want build failures to use nonzero exit codes and concise diagnostics, so that local scripts and CI can stop correctly.
31. As a Plugin Author, I want `eagle check` to find invalid manifest references and missing assets, so that objective packaging problems are found before Eagle packaging.
32. As a Plugin Author, I want `eagle check` to reject development-only settings and unsafe release contents, so that obvious review blockers do not reach the package.
33. As a Plugin Author, I want secret-like files, unsafe paths, and nested archives to be reported as errors, so that risky content is not silently distributed.
34. As a Plugin Author, I want hard Plugin Center listing limits to be checked mechanically, so that deterministic submission failures are caught locally.
35. As a Plugin Author, I want binaries, external connections, system commands, deletion, remote code, permissions, and disclosure candidates to be warnings, so that legitimate uses can be explained instead of being rejected unconditionally.
36. As a Plugin Author, I want a manual checklist for functional truth, visual assets, cancellation, and data safety, so that human review work remains visible.
37. As a Plugin Author, I want to be reminded to understand and test AI-assisted code, so that the release process matches Eagle's author-responsibility requirement.
38. As a Plugin Author, I want to be reminded to install a freshly generated `.eagleplugin`, so that I test the actual artifact rather than only the source workspace.
39. As a Plugin Author, I want human-readable Preflight output by default, so that I can act on results in a terminal.
40. As a Plugin Author, I want machine-readable Preflight output and stable exit behavior, so that CI can consume the same assessment.
41. As a Plugin Author, I want a successful Preflight to state that manual review remains, so that I do not mistake it for Plugin Center approval.
42. As a Plugin Author, I want the command without a subcommand to show concise help and next actions, so that I can recover without consulting separate documentation.
43. As a Plugin Author, I want errors on stderr and ordinary results on stdout, so that shell composition behaves predictably.
44. As a Plugin Author, I want commands to work without an interactive terminal when all required inputs are supplied, so that automated execution is possible.
45. As a framework maintainer, I want manifest rules, entrypoint resolution, and release inspection to have one shared implementation, so that commands and templates do not diverge.
46. As a framework maintainer, I want UI framework integration to be an adapter around a framework-neutral build core, so that React does not become a requirement for plain TypeScript plugins.
47. As a framework maintainer, I want external JSON and configuration results parsed into validated states, so that invalid data cannot proceed as a buildable project.
48. As a framework maintainer, I want official manifest examples to remain compatibility fixtures, so that changes preserve the published Eagle contract.
49. As a framework maintainer, I want runtime support to be based on verified Eagle versions, so that Vite's changing browser defaults do not silently change compatibility.
50. As a framework maintainer, I want the manual packaging boundary documented beside successful output, so that future automation is not inferred from Eagle's private implementation.

## Implementation Decisions

- The primary actor is a Plugin Author who can use TypeScript and Vite but may be new to Eagle plugin development. A no-code or non-developer workflow is not part of the initial product.
- The public workflow consists of `pnpm create eagle-plugin`, `eagle dev`, `eagle build`, and `eagle check`. The `eagle` executable is provided by the main framework package. Lower-level manifest, build, Vite, and React modules remain behind this command surface during normal use.
- Project topology is a validated state. A project is exactly one of Window, Service, or Formats. Window, Service, and Formats are mutually exclusive; discovery of more than one is an error rather than a precedence rule.
- The typed Eagle configuration is the only authored manifest source. The official `manifest.json` is generated output and is never required as a second source file.
- Configuration contains facts that cannot be derived from entrypoints, including identity, version, display metadata, format extensions, and role-specific options. HTML names, generated output paths, service mode, and manifest role keys are derived.
- Entrypoint discovery is a public convention. Window uses a `window` TypeScript or TSX entrypoint, Service uses a `service` TypeScript or TSX entrypoint, and Formats use named groups containing supported Thumbnail, Viewer, and Inspector role entrypoints. A format group joins to a configuration group with the same key.
- The initial UI strategies are plain TypeScript and React. The build core is framework-neutral; only React projects add the React adapter. React is offered only for roles whose Eagle runtime behavior has been proven.
- Custom HTML replacement is not supported initially. The framework owns the minimal HTML needed for UI build output and the development bridge.
- Configuration resolution, topology discovery, manifest generation, HTML generation, and target selection form one build calculation shared by development and production. Side effects such as file reads, file writes, server startup, and terminal output consume that resolved build plan.
- The production build uses relative URLs suitable for a locally loaded plugin. Its JavaScript target is chosen from the minimum supported Eagle runtime rather than inherited from the current Vite default. The initial compatibility baseline must include Eagle 4.0.0's Electron 22 and Chromium 108 environment.
- `eagle build` starts from a clean framework-owned output directory and emits only the generated manifest, HTML, compiled entrypoints, and required assets. It validates the release candidate before reporting success.
- `eagle dev` generates a stable development-plugin directory containing a valid local manifest and HTML bridge. The bridge connects UI entrypoints to the Vite development server without placing an absolute HTTP URL in `manifest.main.url`.
- Window, Viewer, Inspector, and Service UI HMR are supported only after a prototype succeeds inside the supported Eagle application. If a role cannot use HMR reliably, it remains supported through watch build and explicit reload guidance.
- Service logic, Thumbnail logic, configuration changes, and entrypoint topology changes use watch build and a clear Eagle reload instruction. The framework does not call Eagle's private reload IPC.
- Development startup reports the directory to import, server address, HMR capability for the discovered roles, and the conditions that require reload. A server startup failure or invalid project exits with an actionable diagnostic.
- Preflight is an assessment, not review approval. Errors are limited to objective mechanical blockers. Warnings identify context that may require explanation. Manual checklist items preserve decisions that require human judgment.
- Preflight errors include invalid generated manifest data, missing entrypoints or assets, development tools enabled for release, secret-like or development-only contents, unsafe archive paths, nested archives, and hard listing-field limits.
- Preflight warnings include detected binaries, network or localhost access, system commands, deletion behavior, remote-code behavior, elevated permissions, and disclosure candidates. Detection does not imply automatic rejection.
- The manual checklist covers truthful functionality and listing copy, relevant visual assets, cancellation and data-change safety, the Plugin Author's understanding of the code, and fresh installation of the packaged artifact.
- Human-readable Preflight output is the default. `eagle check --json` returns a documented machine-readable result. Mechanical errors produce a nonzero exit status; warnings and remaining manual review do not make a mechanically valid candidate fail.
- A successful Preflight explicitly says that no mechanical blockers were detected and that manual checks and Eagle review remain. It never uses approval or certification language.
- The manifest module parses external input as unknown, returns validated manifest data, and reports structured issues containing a location, stable code, and message. Type declarations and runtime validation must accept the same official shapes.
- Framework modules share the existing Eagle Plugin API types rather than reproducing manifest contracts. The current type-only package remains runtime-free.
- Implementation proceeds as vertical tracer bullets in dependency order: validated manifest contract, minimal generated project, minimal production build, Preflight through the command surface, development bridge, React support, then the full official-form and template matrix.
- Packaging remains an explicit handoff. After a successful build and Preflight, the command explains how to use Eagle's Pack Plugin action, install the resulting artifact afresh, and submit it through Plugin Center.

## Testing Decisions

- Tests assert external behavior at the highest practical seam. A generated project and the public commands are preferred over direct tests of private helpers. Pure lower-level tests are retained only where they make trust-boundary failures or compatibility fixtures substantially clearer.
- The primary end-to-end seam invokes the project generator in an isolated directory, installs with the repository's pnpm toolchain, and runs the generated typecheck, `eagle build`, and `eagle check`. The matrix covers all supported official forms and both plain TypeScript and React wherever the role supports UI.
- Production-build tests invoke `eagle build` as a process and inspect its release output. They verify the generated manifest, relative HTML and asset references, compiled entrypoints, clean-output behavior, and the supported runtime target without depending on private module structure.
- Manifest compatibility tests accept the official examples for Window, Service, Preview, and Inspector and reject malformed or mutually incompatible inputs. Runtime validation and the shared TypeScript contract are checked against the same fixture intent.
- Preflight tests pass complete release-candidate fixtures through `eagle check`. They verify human-readable output, JSON output, stable issue codes, error and warning separation, manual checklist presence, stdout and stderr use, and exit statuses.
- Development tests start `eagle dev` against a generated fixture and verify the stable plugin directory, local manifest, HTML bridge, Vite connection, watch rebuild behavior, and reload guidance. Electron 22 is used for automated bridge compatibility where feasible.
- HMR support is gated by an actual Eagle 4.0 test for each claimed role and UI strategy. An automated browser or plain Vite success is not sufficient evidence for claiming Eagle HMR compatibility.
- Final release acceptance is manual: build the plugin, run Preflight, use Eagle's Pack Plugin action, install the newly generated `.eagleplugin`, and exercise the core flow for each official form. The result records what was manually verified and does not convert that run into a guarantee of Plugin Center approval.
- Existing repository practice provides the initial prior art: package-level tests run through pnpm, the type package uses its public TypeScript surface as its test seam, and package contents are inspected with a dry pack. New tests extend that external-package approach to generated projects and CLI processes.
- Fixtures are immutable input data. Tests create isolated working directories and compare normalized outputs so that timestamps, ports, and machine-specific paths do not make the suite nondeterministic.

## Out of Scope

- UI frameworks other than plain TypeScript and React.
- A no-code interface or support for Plugin Authors who cannot work with TypeScript and command-line tools.
- Arbitrary custom HTML templates in the initial version.
- Projects that mix Window, Service, and Formats topologies.
- Automatic use of Eagle's private IPC or internal reload implementation.
- Automatic creation of `.eagleplugin` archives based on Eagle's private implementation.
- Automatic submission to Eagle Plugin Center.
- A claim that Preflight predicts or guarantees review approval.
- Automated judgment of listing truthfulness, visual quality, legitimate data behavior, or the author's understanding of generated code.
- FFmpeg, AI SDK, AI Search, and other optional Extra Module type definitions.
- Support for package managers other than pnpm in the initial generator workflow.
- Backward-compatibility layers for an unreleased framework interface.

## Further Notes

- Eagle 4.0.0 currently resolves the Window manifest URL as a file inside the plugin directory. The local HTML bridge is therefore a compatibility requirement, not an optional development convenience.
- Eagle 4.0.0 embeds Electron 22 and Chromium 108. The supported-Eagle matrix must be rechecked before raising the build target or changing the minimum Eagle version.
- The official package and submission flows are manual as of this specification. Automation may be reconsidered only if Eagle publishes a stable archive or submission interface.
- Review criteria can change independently of the framework. Preflight rules should record their source and last verification date when implemented, while keeping errors limited to conditions that remain mechanically decidable.
