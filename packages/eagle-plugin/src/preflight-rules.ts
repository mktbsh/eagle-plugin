import type { ManifestIssueCode } from "eagle-plugin-manifest";

export type PreflightErrorCode =
  | ManifestIssueCode
  | "release.manifest.missing"
  | "release.manifest.invalid_json"
  | "release.reference.unsafe"
  | "release.logo.missing"
  | "release.html.missing"
  | "release.entrypoint.missing"
  | "release.dev_tools.enabled"
  | "release.name.too_long"
  | "release.name.too_many_words"
  | "release.keywords.too_many"
  | "release.symlink.detected"
  | "release.development_artifact.detected"
  | "release.sensitive_file.detected"
  | "release.nested_archive.detected";

export type PreflightWarningCode =
  | "release.network_reference.detected"
  | "release.local_network_reference.detected"
  | "release.unencrypted_http.detected"
  | "release.binary.detected"
  | "release.dependency_directory.detected"
  | "release.system_command.detected"
  | "release.destructive_operation.detected"
  | "release.remote_code.detected"
  | "release.elevated_permission.detected"
  | "release.disclosure_candidate.detected";

export type ManualCheckCode =
  | "manual.functionality"
  | "manual.visual_assets"
  | "manual.cancellation_and_data_safety"
  | "manual.author_understanding"
  | "manual.fresh_install";

export type PreflightRuleCode =
  | PreflightErrorCode
  | PreflightWarningCode
  | ManualCheckCode;

export interface PreflightRuleReference {
  readonly sourceUrl: string;
  readonly checkedAt: "2026-08-01";
}

const manifestSource =
  "https://developer.eagle.cool/plugin-api/tutorial/manifest";
const configurationSource =
  "https://developer.eagle.cool/plugin-api/plugin-review/criteria/configuration-and-reviewability";
const listingSource =
  "https://developer.eagle.cool/plugin-api/plugin-review/criteria/store-listing-copy";
const developerPoliciesSource =
  "https://developer.eagle.cool/plugin-api/plugin-review/developer-policies";
const visualSource =
  "https://developer.eagle.cool/plugin-api/plugin-review/criteria/visual-assets";
const securitySource =
  "https://developer.eagle.cool/plugin-api/plugin-review/criteria/security-and-privacy";
const packageSource =
  "https://developer.eagle.cool/plugin-api/plugin-review/criteria/package-contents";
const functionalitySource =
  "https://developer.eagle.cool/plugin-api/plugin-review/criteria/functionality-and-policy";
const prepareSource =
  "https://developer.eagle.cool/plugin-api/publishing/prepare";

function reference(sourceUrl: string): PreflightRuleReference {
  return { sourceUrl, checkedAt: "2026-08-01" };
}

const manifestRule = reference(manifestSource);

const ruleCatalog: Readonly<
  Record<Exclude<PreflightRuleCode, ManifestIssueCode>, PreflightRuleReference>
> = {
  "release.manifest.missing": reference(configurationSource),
  "release.manifest.invalid_json": reference(configurationSource),
  "release.reference.unsafe": reference(configurationSource),
  "release.logo.missing": reference(manifestSource),
  "release.html.missing": reference(manifestSource),
  "release.entrypoint.missing": reference(manifestSource),
  "release.dev_tools.enabled": reference(configurationSource),
  "release.name.too_long": reference(listingSource),
  "release.name.too_many_words": reference(listingSource),
  "release.keywords.too_many": reference(developerPoliciesSource),
  "release.symlink.detected": reference(configurationSource),
  "release.development_artifact.detected": reference(packageSource),
  "release.sensitive_file.detected": reference(packageSource),
  "release.nested_archive.detected": reference(packageSource),
  "release.network_reference.detected": reference(securitySource),
  "release.local_network_reference.detected": reference(securitySource),
  "release.unencrypted_http.detected": reference(securitySource),
  "release.binary.detected": reference(packageSource),
  "release.dependency_directory.detected": reference(packageSource),
  "release.system_command.detected": reference(securitySource),
  "release.destructive_operation.detected": reference(securitySource),
  "release.remote_code.detected": reference(securitySource),
  "release.elevated_permission.detected": reference(securitySource),
  "release.disclosure_candidate.detected": reference(listingSource),
  "manual.functionality": reference(functionalitySource),
  "manual.visual_assets": reference(visualSource),
  "manual.cancellation_and_data_safety": reference(functionalitySource),
  "manual.author_understanding": reference(functionalitySource),
  "manual.fresh_install": reference(prepareSource),
};

export function preflightRuleReference(
  code: PreflightRuleCode,
): PreflightRuleReference {
  return code.startsWith("manifest.")
    ? manifestRule
    : ruleCatalog[code as Exclude<PreflightRuleCode, ManifestIssueCode>];
}
