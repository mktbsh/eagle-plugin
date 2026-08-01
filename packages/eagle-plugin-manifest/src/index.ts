import type * as z from "zod";
import type { ManifestJSON } from "./schema.js";
import {
  inspectorManifestSchema,
  previewManifestSchema,
  serviceManifestSchema,
  windowManifestSchema,
} from "./schema.js";

export type {
  InspectorExtensionConfig,
  InspectorExtensionDefinition,
  InspectorManifest,
  ManifestBase,
  ManifestJSON,
  PreviewExtensionDefinition,
  PreviewManifest,
  ServiceManifest,
  ThumbnailExtensionConfig,
  ViewerExtensionConfig,
  WindowMainConfig,
  WindowManifest,
} from "./schema.js";
export { manifestJsonSchema } from "./schema.js";

export type ManifestIssueCode =
  | "manifest.topology.conflict"
  | "manifest.topology.missing"
  | "manifest.invalid_type"
  | "manifest.invalid_value"
  | "manifest.invalid_size"
  | "manifest.invalid_format"
  | "manifest.invalid_key"
  | "manifest.invalid_union"
  | "manifest.unknown_key"
  | "manifest.constraint";

export interface ManifestIssue {
  readonly path: readonly (string | number)[];
  readonly code: ManifestIssueCode;
  readonly message: string;
}

export type ManifestValidationResult =
  | { readonly success: true; readonly data: ManifestJSON }
  | { readonly success: false; readonly issues: readonly ManifestIssue[] };

export class ManifestValidationError extends Error {
  readonly issues: readonly ManifestIssue[];

  constructor(issues: readonly ManifestIssue[]) {
    super("Invalid Eagle plugin manifest");
    this.name = "ManifestValidationError";
    this.issues = issues;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOwn(value: Record<string, unknown>, key: string): boolean {
  return Object.hasOwn(value, key);
}

function normalizePath(
  path: readonly PropertyKey[],
): readonly (string | number)[] {
  return path.map((segment) =>
    typeof segment === "symbol" ? String(segment) : segment,
  );
}

function mapSchemaIssue(issue: z.core.$ZodIssue): readonly ManifestIssue[] {
  const path = normalizePath(issue.path);

  if (issue.code === "unrecognized_keys") {
    return issue.keys.map((key) => ({
      path: [...path, key],
      code: "manifest.unknown_key",
      message: `Unknown manifest field: ${key}`,
    }));
  }

  const code: ManifestIssueCode = (() => {
    switch (issue.code) {
      case "invalid_type":
        return "manifest.invalid_type";
      case "invalid_value":
      case "not_multiple_of":
        return "manifest.invalid_value";
      case "too_big":
      case "too_small":
        return "manifest.invalid_size";
      case "invalid_format":
        return "manifest.invalid_format";
      case "invalid_key":
      case "invalid_element":
        return "manifest.invalid_key";
      case "invalid_union":
        return "manifest.invalid_union";
      default:
        return "manifest.constraint";
    }
  })();

  return [{ path, code, message: issue.message }];
}

function validateWith(
  schema:
    | typeof windowManifestSchema
    | typeof serviceManifestSchema
    | typeof previewManifestSchema
    | typeof inspectorManifestSchema,
  input: unknown,
): ManifestValidationResult {
  const result = schema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      issues: result.error.issues.flatMap(mapSchemaIssue),
    };
  }

  return { success: true, data: result.data };
}

function containsInspector(preview: unknown): boolean {
  if (!isRecord(preview)) {
    return false;
  }

  return Object.values(preview).some(
    (definition) => isRecord(definition) && hasOwn(definition, "inspector"),
  );
}

export function validateManifest(input: unknown): ManifestValidationResult {
  if (!isRecord(input)) {
    return validateWith(windowManifestSchema, input);
  }

  const hasMain = hasOwn(input, "main");
  const hasPreview = hasOwn(input, "preview");

  if (hasMain && hasPreview) {
    return {
      success: false,
      issues: [
        {
          path: [],
          code: "manifest.topology.conflict",
          message: "A manifest cannot contain both main and preview",
        },
      ],
    };
  }

  if (!hasMain && !hasPreview) {
    return {
      success: false,
      issues: [
        {
          path: [],
          code: "manifest.topology.missing",
          message: "A manifest must contain either main or preview",
        },
      ],
    };
  }

  if (hasMain) {
    const main = input.main;
    const isService = isRecord(main) && main.serviceMode === true;
    return validateWith(
      isService ? serviceManifestSchema : windowManifestSchema,
      input,
    );
  }

  return validateWith(
    containsInspector(input.preview)
      ? inspectorManifestSchema
      : previewManifestSchema,
    input,
  );
}

export function parseManifest(input: unknown): ManifestJSON {
  const result = validateManifest(input);

  if (!result.success) {
    throw new ManifestValidationError(result.issues);
  }

  return result.data;
}

export function defineManifest<const T extends ManifestJSON>(manifest: T): T {
  return manifest;
}
