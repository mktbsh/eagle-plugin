---
title: Eagle Plugin 公開 Preflight 規則の一次資料調査
status: complete
date: 2026-08-01T04:36:33+09:00
checked_at: 2026-08-01
agent: Codex (GPT-5)
scope: Eagle Plugin Center review criteria, packaging, and manifest
---

# Eagle Plugin 公開 Preflight 規則の一次資料調査

## 結論

Eagle の公開審査基準は 2026-07-21 から、新規提出と更新の両方に適用される。
審査は initial scan と human review の二段階であり、initial scan を通過しても公開承認ではない。
また、内部の検出方法と判定閾値は公開されていないため、`eagle check` が保証できるのは公開情報から再現できる機械的阻害要因を検出しなかったことまでである。

Preflight の分類は次の境界にすると、公式基準の意味を保てる。

- `error`: 入力だけで違反を再現でき、用途の説明によって結論が変わらないもの。
- `warning`: コードやファイルに審査対象となる兆候があるが、正当な用途、開示、保護策によって結論が変わるもの。
- `manual`: 実際の機能、表示品質、ユーザーの理解、データへの影響など、実行または人の判断が必要なもの。

根拠は [Review Criteria](https://developer.eagle.cool/plugin-api/plugin-review/criteria) と [Review Process](https://developer.eagle.cool/plugin-api/plugin-review/review) である。
いずれも 2026-08-01 に確認した。

## 機械的な error

| Rule | 判定対象 | 公式 URL | 確認日 | 要約 | 判定境界 |
| --- | --- | --- | --- | --- | --- |
| `package.invalid` | 壊れた、展開不能、または別形式を改名した `.eagleplugin` | [Release Configuration and Reviewability](https://developer.eagle.cool/plugin-api/plugin-review/criteria/configuration-and-reviewability) | 2026-08-01 | 提出物は Eagle が生成した有効な最終パッケージであり、完全に展開できなければならない。 | アーカイブ自体を受け取る検査でのみ error にできる。release directory の検査だけでは判定しない。 |
| `package.path.duplicate` | アーカイブ中の重複 path | [Release Configuration and Reviewability](https://developer.eagle.cool/plugin-api/plugin-review/criteria/configuration-and-reviewability) | 2026-08-01 | 同じ展開先を持つ複数 entry は安全なパッケージとして受理されない。 | 正規化後の path が重複したときに error。 |
| `package.path.unsafe` | absolute path、path traversal、plugin directory 外への展開 | [Release Configuration and Reviewability](https://developer.eagle.cool/plugin-api/plugin-review/criteria/configuration-and-reviewability) | 2026-08-01 | 展開によって plugin directory 外へ書き込める path は提出を阻害する。 | POSIX absolute、Windows drive/UNC、正規化後の `..` escape を error。単に名前に `..` を含むだけでは error にしない。 |
| `package.link.unsafe` | unsafe link、symlink escape | [Release Configuration and Reviewability](https://developer.eagle.cool/plugin-api/plugin-review/criteria/configuration-and-reviewability) | 2026-08-01 | plugin directory 外を指す link を含むパッケージは安全に展開できない。 | link の解決先が package root 外なら error。root 内 symlink の全面禁止は公式基準からは導けない。 |
| `release.manifest.missing` | root の `manifest.json` 欠落 | [Release Configuration and Reviewability](https://developer.eagle.cool/plugin-api/plugin-review/criteria/configuration-and-reviewability) | 2026-08-01 | `manifest.json` は plugin root に必要である。 | root 直下に無ければ error。サブディレクトリの同名 file は代用しない。 |
| `release.manifest.invalid` | JSON object でない manifest、空の `id` / `name`、plugin type と矛盾する field | [Release Configuration and Reviewability](https://developer.eagle.cool/plugin-api/plugin-review/criteria/configuration-and-reviewability) | 2026-08-01 | manifest は有効な JSON object であり、必須値と実際の plugin type が一致する必要がある。 | 共通 manifest parser が拒否した入力を error。Preflight で別の manifest contract を再実装しない。 |
| `release.dev_tools.enabled` | release の `devTools: true` | [Release Configuration and Reviewability](https://developer.eagle.cool/plugin-api/plugin-review/criteria/configuration-and-reviewability) | 2026-08-01 | developer tools を有効にした release は提出を阻害する。 | 値が厳密に `true` なら error。 |
| `release.reference.missing` | manifest entrypoint、logo、runtime asset の欠落 | [Release Configuration and Reviewability](https://developer.eagle.cool/plugin-api/plugin-review/criteria/configuration-and-reviewability) | 2026-08-01 | release は開発元の directory、service、環境変数なしでインストール後に動作する必要がある。 | package 内の静的参照先が無い場合は error。コード中の任意文字列から動的依存を断定しない。 |
| `release.logo.format` | `logo` が `png`、`jpg`、`webp` 以外 | [manifest.json Configuration](https://developer.eagle.cool/plugin-api/tutorial/manifest) | 2026-08-01 | manifest の logo は公開されている三形式だけが対応対象である。 | path の拡張子を case-insensitive に正規化して判定する。画像の真正性は別途検査する。 |
| `release.secret.file` | `.env` とその派生、実 private key、credential file | [Package Contents](https://developer.eagle.cool/plugin-api/plugin-review/criteria/package-contents) | 2026-08-01 | package に実 credential や private key を含めてはならず、`.env`、`.pem`、`.key`、`.p12`、`.pfx`、`credentials.json`、`secrets.json`、token 入り `.npmrc` は重点確認対象である。 | `.env` 系、`credentials.json`、`secrets.json` は clean release contract の error にできる。証明書拡張子や `.npmrc` は名前だけでは秘密と断定せず、private-key marker や token を確認する。 |
| `release.vcs_metadata` | `.git/`、`.svn/`、`.hg/`、`.bzr/` | [Package Contents](https://developer.eagle.cool/plugin-api/plugin-review/criteria/package-contents) | 2026-08-01 | version-control metadata は final package から除外する。 | path component が完全一致した場合に error。 |
| `release.editor_metadata` | `.idea/`、`.vscode/` | [Package Contents](https://developer.eagle.cool/plugin-api/plugin-review/criteria/package-contents) | 2026-08-01 | editor settings は final package から除外する。 | path component が完全一致した場合に error。 |
| `release.cache_or_environment` | `__pycache__/`、`.pytest_cache/`、`.venv/`、`venv/` | [Package Contents](https://developer.eagle.cool/plugin-api/plugin-review/criteria/package-contents) | 2026-08-01 | cache と virtual environment は final package に含めない。 | 公開されている directory 名への完全一致を error。汎用名 `cache` だけで拒否しない。 |
| `release.temporary_file` | `.DS_Store`、`Thumbs.db`、`desktop.ini`、`.log`、`.tmp`、`.swp`、`.swo` | [Package Contents](https://developer.eagle.cool/plugin-api/plugin-review/criteria/package-contents) | 2026-08-01 | system file と runtime に不要な一時 file は clean release から除外する。 | framework-owned output では列挙された名前・拡張子を error にできる。任意の外部 package では runtime 必須かという文脈が残る。 |
| `release.malware.confirmed` | 既知 malware または安全でないと確定した実行物 | [File Safety](https://developer.eagle.cool/plugin-api/plugin-review/criteria/file-safety) | 2026-08-01 | malware、危険な downloader、無関係な unsafe executable は human review 前に提出を阻害する。 | 信頼できる scanner の確定結果がある場合だけ error。拡張子や未知性だけで malware と断定しない。 |

### 掲載情報の hard limits

| Rule | 公式 URL | 確認日 | 要約 | 判定境界 |
| --- | --- | --- | --- | --- |
| `listing.name.code_points` | [Store Listing Copy](https://developer.eagle.cool/plugin-api/plugin-review/criteria/store-listing-copy) | 2026-08-01 | plugin name は最大 30 Unicode code points。 | 31 code points 以上を error。UTF-16 code units や grapheme 数では数えない。JavaScript では `Array.from(value).length` 相当になる。 |
| `listing.name.words` | [Store Listing Copy](https://developer.eagle.cool/plugin-api/plugin-review/criteria/store-listing-copy) | 2026-08-01 | 空白で単語を区切る言語では、name は最大 6 words。 | 7 words 以上を error。公式は tokenizer を公開していないため、Unicode whitespace で区切った非空 run を数える実装規則を明記する。日本語など空白分割を前提としない言語へ適用しない。 |
| `listing.description.en` | [Store Listing Copy](https://developer.eagle.cool/plugin-api/plugin-review/criteria/store-listing-copy) | 2026-08-01 | English short description は最大 200 Unicode code points。 | locale が English のとき、201 code points 以上を error。文数 2 以下は推奨であり error にしない。 |
| `listing.description.zh_cn` | [Store Listing Copy](https://developer.eagle.cool/plugin-api/plugin-review/criteria/store-listing-copy) | 2026-08-01 | Simplified Chinese short description は最大 100 Unicode code points。 | locale が Simplified Chinese のとき、101 code points 以上を error。他 locale の description 上限は公開されていない。 |
| `listing.keywords.count` | [Developer Policies](https://developer.eagle.cool/plugin-api/plugin-review/developer-policies) | 2026-08-01 | plugin keyword は 6 個の単語を超えず、plugin と関係する必要がある。 | 7 entries 以上は機械的に error にできる。各 entry が「single word」かの tokenizer は未公開であり、関連性は manual。manifest の `keywords` 配列と submission form の keyword が同一入力かは公式文書で明示されていない。 |

公開資料から確認できた hard length limit は上記だけである。
Introduction、changelog、日本語を含むその他 locale の short description、cover の pixel 寸法、package file size の hard limit は公開されていないため、値を推測して error にしてはならない。

## 文脈依存の warning

| Rule | 判定する兆候 | 公式 URL | 確認日 | 要約と境界 |
| --- | --- | --- | --- | --- |
| `release.nested_archive` | `.zip`、`.rar`、`.7z`、`.tar`、`.tgz`、`.gz`、`.dmg`、`.iso` | [Package Contents](https://developer.eagle.cool/plugin-api/plugin-review/criteria/package-contents) | 2026-08-01 | 無関係な archive、過去 installer、backup、plugin 全体の二重梱包は阻害要因になり得る。一方、runtime に必要なら内容、出所、用途の説明で許容され得るため、存在だけなら公式分類は warning。 |
| `release.binary` | `.exe`、`.dll`、`.msi`、`.dylib`、`.so`、`.app`、`.pkg`、`.bin` | [Package Contents](https://developer.eagle.cool/plugin-api/plugin-review/criteria/package-contents) | 2026-08-01 | binary は追加審査対象だが、形式だけでは不合格ではない。出所、再配布権、用途、platform / architecture、system 変更の説明が必要。 |
| `behavior.external_network` | `fetch`、HTTP client、socket、外部 SDK、analytics host | [Security and Privacy](https://developer.eagle.cool/plugin-api/plugin-review/criteria/security-and-privacy) | 2026-08-01 | network 利用自体は許容される。宛先と送信値が目的に必要で、期待可能で、最小限で、重要な外部処理を開示しているかを人が判断する。 |
| `behavior.local_network` | localhost、loopback、private、link-local address | [Security and Privacy](https://developer.eagle.cool/plugin-api/plugin-review/criteria/security-and-privacy) | 2026-08-01 | local integration という明確な目的と開示を要する兆候であり、address の存在だけでは禁止ではない。 |
| `behavior.insecure_transport` | unencrypted HTTP、credential を含む URL、異常 port、紛らわしい Punycode | [Security and Privacy](https://developer.eagle.cool/plugin-api/plugin-review/criteria/security-and-privacy) | 2026-08-01 | 特別な注意が必要な兆候。実際に sensitive data を平文送信すると確認できれば blocker だが、文字列の検出段階は warning。 |
| `behavior.system_command` | child process、system command、外部 application 起動 | [Security and Privacy](https://developer.eagle.cool/plugin-api/plugin-review/criteria/security-and-privacy) | 2026-08-01 | core function に必要で、scope が狭く、影響が説明されているかを審査する。API の利用だけでは自動拒否しない。 |
| `behavior.destructive_change` | delete、overwrite、move、bulk modification | [Security and Privacy](https://developer.eagle.cool/plugin-api/plugin-review/criteria/security-and-privacy) | 2026-08-01 | 必要性、事前説明、user confirmation、可能な範囲の preview / cancellation / recovery で許否が変わる。静的検出は warning。 |
| `behavior.remote_code` | install 後に executable script、dynamic module、worker を download / execute | [Security and Privacy](https://developer.eagle.cool/plugin-api/plugin-review/criteria/security-and-privacy) | 2026-08-01 | remote code は supply-chain protection と必要性を強く問われるが、検出した参照だけで実行を断定しない。実行と危険性が確定した場合は blocker になり得る。 |
| `behavior.permission_or_settings` | elevated permission、Eagle / OS setting 変更 | [Security and Privacy](https://developer.eagle.cool/plugin-api/plugin-review/criteria/security-and-privacy) | 2026-08-01 | core function に不要な権限は認められず、必要な変更も user awareness と consent を要する。要求の兆候は warning。 |
| `behavior.data_disclosure` | user data、path、file content、identifier の外部送信候補 | [Security and Privacy](https://developer.eagle.cool/plugin-api/plugin-review/criteria/security-and-privacy) | 2026-08-01 | data type、destination、purpose、consent、最小化、retention 等を確認する。AST や文字列 scan の候補だけで漏えいと断定しない。 |
| `review.disclosure_required` | sign-in、API key、paid plan、companion software、platform / Eagle / format 制限 | [Store Listing Copy](https://developer.eagle.cool/plugin-api/plugin-review/criteria/store-listing-copy) | 2026-08-01 | core use に影響する条件は listing で開示が必要。ただしコード上の兆候だけでは必須条件かを確定できないため、根拠 path と識別子を添えた warning にする。 |
| `release.dependency_directory` | `node_modules/` 等 | [Package Contents](https://developer.eagle.cool/plugin-api/plugin-review/criteria/package-contents) | 2026-08-01 | runtime に必要な dependency directory は許容される。不要な development dependency、重複 package、無関係 platform の artifact が問題であり、directory 名だけでは error にしない。 |

Warning には、検出した file、行、host、API 名などの evidence を必ず付ける。
「binary を含む」「network API を使う」と「不正・危険である」を同じ message にしてはならない。

## Manual check

| Check | 公式 URL | 確認日 | 確認する内容と境界 |
| --- | --- | --- | --- |
| `manual.functional_truth` | [Functionality and Policy Compliance](https://developer.eagle.cool/plugin-api/plugin-review/criteria/functionality-and-policy) | 2026-08-01 | 現在の release で listing が明示する主要機能を再現でき、placeholder や未実装の主張がない。静的解析では機能の真偽を判定しない。 |
| `manual.listing_and_disclosure` | [Store Listing Copy](https://developer.eagle.cool/plugin-api/plugin-review/criteria/store-listing-copy) | 2026-08-01 | 各 locale が独立して理解でき、目的、workflow、入出力、認証、支払い、外部転送、破壊操作、主要制限を正確に説明している。minor grammar や宣伝語だけで阻害扱いにしない。 |
| `manual.visual_assets` | [Visual Assets](https://developer.eagle.cool/plugin-api/plugin-review/criteria/visual-assets) | 2026-08-01 | required icon と locale cover があり、正方形、safe space、縮小時の可読性、実機能との一致、歪みや重大な crop の不存在を表示 size で確認する。128 x 128 icon は [File Structure Overview](https://developer.eagle.cool/plugin-api/get-started/anatomy-of-an-extension) の提供目安だが、審査基準は exact pixel size を hard limit にしていない。 |
| `manual.cancellation_and_errors` | [Functionality and Policy Compliance](https://developer.eagle.cool/plugin-api/plugin-review/criteria/functionality-and-policy) | 2026-08-01 | cancellation、未選択、invalid input、service unavailable、permission failure で停止、data damage、偽の成功表示が起きない。 |
| `manual.data_safety` | [Functionality and Policy Compliance](https://developer.eagle.cool/plugin-api/plugin-review/criteria/functionality-and-policy) | 2026-08-01 | Eagle data、local file、system setting の変更が目的と一致し、無関係な data を暗黙変更せず、bulk / irreversible change を事前説明・確認する。 |
| `manual.uninstall_cleanup` | [Functionality and Policy Compliance](https://developer.eagle.cool/plugin-api/plugin-review/criteria/functionality-and-policy) | 2026-08-01 | disable / uninstall 後に未開示 background process を残さず、user-created file や Eagle data を削除しない。cache、helper、setting の保持と削除方法を説明する。 |
| `manual.review_access` | [Release Configuration and Reviewability](https://developer.eagle.cool/plugin-api/plugin-review/criteria/configuration-and-reviewability) | 2026-08-01 | account、token、license、server、third-party app、特定 file、payment が必要なら、再現可能な手順と有効な review account を submission page で提供する。実 credential を package に入れない。 |
| `manual.author_understanding` | [Functionality and Policy Compliance](https://developer.eagle.cool/plugin-api/plugin-review/criteria/functionality-and-policy) | 2026-08-01 | AI 生成部分を含め、author が core logic、dependency、external connection、data transfer、file operation、system command を読み、説明できる。UI が動くことだけでは満たさない。 |
| `manual.dependency_provenance` | [File Safety](https://developer.eagle.cool/plugin-api/plugin-review/criteria/file-safety) | 2026-08-01 | third-party component を信頼できる source から固定し、実際の release version と binary の出所、必要性、更新状況を確認する。未知 file の存在だけで malware と判定しない。 |
| `manual.fresh_install` | [Prepare Plugin](https://developer.eagle.cool/plugin-api/publishing/prepare) | 2026-08-01 | Eagle の Pack Plugin で最終 `.eagleplugin` を生成し、元 project から離した artifact を新規 install して起動と core flow を確認する。build directory の直接実行は代用しない。 |
| `manual.support_and_policy` | [Publish Plugin](https://developer.eagle.cool/plugin-api/publishing/publish) | 2026-08-01 | submission に support contact を追加し、content、privacy、security、payment、user rights を含む Developer Policies を確認する。Preflight は適法性や policy 全体の合格を自動判定しない。 |

## Ticket 10 へ反映するときの注意

1. Nested archive は、公式基準上は存在だけで一律不合格ではない。
   Framework が runtime archive をサポートしない方針で error にすることはできるが、その場合は「公式審査で常に禁止」ではなく「framework の release contract」として code と message を分ける。
2. Secret-like filename も実 secret の確定とは限らない。
   `.env` や credential file は clean release error にできる一方、certificate、`.npmrc`、token らしい文字列は内容の根拠を添えて判定する。
3. Binary、network、localhost、system command、delete、remote code、permission、data transfer は warning とする。
   公式文書は、これらの存在だけで自動拒否しないと明記している。
4. Visual quality、copy の真実性、author の理解、実行時の cancellation と data safety は manual のまま残す。
5. Package 作成は Eagle の `Pack Plugin` action が公式経路である。
   `.eagleplugin` の private archive implementation を推測して framework が自動生成してはならない。
6. `--json` と human output は同じ rule record から生成し、`severity`、stable `code`、`evidence`、`sourceUrl`、`checkedAt` を共有する。
7. Criteria は変更され得る。
   Rule metadata の `checkedAt` はこの調査の 2026-08-01 とし、source URL ごとに追跡する。

## 公式資料

- [Review Criteria](https://developer.eagle.cool/plugin-api/plugin-review/criteria)
- [Review Process](https://developer.eagle.cool/plugin-api/plugin-review/review)
- [Release Configuration and Reviewability](https://developer.eagle.cool/plugin-api/plugin-review/criteria/configuration-and-reviewability)
- [Store Listing Copy](https://developer.eagle.cool/plugin-api/plugin-review/criteria/store-listing-copy)
- [Visual Assets](https://developer.eagle.cool/plugin-api/plugin-review/criteria/visual-assets)
- [Security and Privacy](https://developer.eagle.cool/plugin-api/plugin-review/criteria/security-and-privacy)
- [Package Contents](https://developer.eagle.cool/plugin-api/plugin-review/criteria/package-contents)
- [File Safety](https://developer.eagle.cool/plugin-api/plugin-review/criteria/file-safety)
- [Functionality and Policy Compliance](https://developer.eagle.cool/plugin-api/plugin-review/criteria/functionality-and-policy)
- [Developer Policies](https://developer.eagle.cool/plugin-api/plugin-review/developer-policies)
- [Prepare Plugin](https://developer.eagle.cool/plugin-api/publishing/prepare)
- [Package Plugin](https://developer.eagle.cool/plugin-api/publishing/package)
- [Publish Plugin](https://developer.eagle.cool/plugin-api/publishing/publish)
- [manifest.json Configuration](https://developer.eagle.cool/plugin-api/tutorial/manifest)
- [File Structure Overview](https://developer.eagle.cool/plugin-api/get-started/anatomy-of-an-extension)
