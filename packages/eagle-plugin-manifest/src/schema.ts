import * as z from "zod";

const supportedLanguages = [
  "en",
  "ja_JP",
  "es_ES",
  "de_DE",
  "zh_TW",
  "zh_CN",
  "ko_KR",
  "ru_RU",
] as const;

const nonEmptyStringSchema = z.string().min(1);

const manifestBaseShape = {
  id: nonEmptyStringSchema,
  version: nonEmptyStringSchema,
  name: nonEmptyStringSchema,
  logo: nonEmptyStringSchema,
  keywords: z.array(z.string()),
  platform: z.enum(["all", "mac", "win"]).optional(),
  arch: z.enum(["all", "arm", "arm64", "x64"]).optional(),
  devTools: z.boolean().optional(),
  dependencies: z.array(nonEmptyStringSchema).optional(),
  fallbackLanguage: z.enum(supportedLanguages).optional(),
  languages: z.array(z.enum(supportedLanguages)).optional(),
};

export const manifestBaseSchema = z.strictObject(manifestBaseShape);

const windowMainShape = {
  url: nonEmptyStringSchema,
  width: z.number().optional(),
  height: z.number().optional(),
  minWidth: z.number().optional(),
  minHeight: z.number().optional(),
  maxWidth: z.number().optional(),
  maxHeight: z.number().optional(),
  alwaysOnTop: z.boolean().optional(),
  frame: z.boolean().optional(),
  fullscreenable: z.boolean().optional(),
  maximizable: z.boolean().optional(),
  minimizable: z.boolean().optional(),
  resizable: z.boolean().optional(),
  backgroundColor: z.string().optional(),
  childWindow: z.boolean().optional(),
  followCursor: z.boolean().optional(),
  multiple: z.boolean().optional(),
  runAfterInstall: z.boolean().optional(),
  vibrancy: z.boolean().optional(),
};

export const windowMainConfigSchema = z.strictObject(windowMainShape);

const windowPluginMainSchema = z.strictObject({
  ...windowMainShape,
  serviceMode: z.literal(false).optional(),
});

const servicePluginMainSchema = z.strictObject({
  ...windowMainShape,
  serviceMode: z.literal(true),
});

export const windowManifestSchema = z.strictObject({
  ...manifestBaseShape,
  main: windowPluginMainSchema,
  preview: z.never().optional(),
});

export const serviceManifestSchema = z.strictObject({
  ...manifestBaseShape,
  main: servicePluginMainSchema,
  preview: z.never().optional(),
});

export const thumbnailExtensionConfigSchema = z.strictObject({
  path: nonEmptyStringSchema,
  size: z.number().optional(),
  allowZoom: z.boolean().optional(),
});

export const viewerExtensionConfigSchema = z.strictObject({
  path: nonEmptyStringSchema,
});

export const inspectorExtensionConfigSchema = z.strictObject({
  path: nonEmptyStringSchema,
  height: z.number(),
  multiSelect: z.boolean(),
});

const thumbnailPreviewExtensionDefinitionSchema = z.strictObject({
  thumbnail: thumbnailExtensionConfigSchema,
  viewer: viewerExtensionConfigSchema.optional(),
  inspector: z.never().optional(),
});

const viewerPreviewExtensionDefinitionSchema = z.strictObject({
  thumbnail: thumbnailExtensionConfigSchema.optional(),
  viewer: viewerExtensionConfigSchema,
  inspector: z.never().optional(),
});

export const previewExtensionDefinitionSchema = z.union([
  thumbnailPreviewExtensionDefinitionSchema,
  viewerPreviewExtensionDefinitionSchema,
]);

export const inspectorExtensionDefinitionSchema = z.strictObject({
  thumbnail: thumbnailExtensionConfigSchema.optional(),
  viewer: viewerExtensionConfigSchema.optional(),
  inspector: inspectorExtensionConfigSchema,
});

const previewRecordSchema = z.record(
  nonEmptyStringSchema,
  previewExtensionDefinitionSchema,
);

const inspectorRecordSchema = z.record(
  nonEmptyStringSchema,
  z.union([
    previewExtensionDefinitionSchema,
    inspectorExtensionDefinitionSchema,
  ]),
);

export const previewManifestSchema = z.strictObject({
  ...manifestBaseShape,
  main: z.never().optional(),
  preview: previewRecordSchema,
});

export const inspectorManifestSchema = z.strictObject({
  ...manifestBaseShape,
  main: z.never().optional(),
  preview: inspectorRecordSchema,
});

export const manifestSchema = z.union([
  windowManifestSchema,
  serviceManifestSchema,
  previewManifestSchema,
  inspectorManifestSchema,
]);

export const manifestJsonSchema: Readonly<Record<string, unknown>> =
  Object.freeze({
    ...z.toJSONSchema(manifestSchema),
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: "https://github.com/mktbsh/eagle-plugin/manifest.schema.json",
    title: "Eagle Plugin Manifest",
  });

type ReadonlyDeep<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly (infer Item)[]
    ? readonly ReadonlyDeep<Item>[]
    : T extends object
      ? { readonly [Key in keyof T]: ReadonlyDeep<T[Key]> }
      : T;

export type ManifestBase = ReadonlyDeep<z.infer<typeof manifestBaseSchema>>;
export type WindowMainConfig = ReadonlyDeep<
  z.infer<typeof windowMainConfigSchema>
>;
export type WindowManifest = ReadonlyDeep<z.infer<typeof windowManifestSchema>>;
export type ServiceManifest = ReadonlyDeep<
  z.infer<typeof serviceManifestSchema>
>;
export type ThumbnailExtensionConfig = ReadonlyDeep<
  z.infer<typeof thumbnailExtensionConfigSchema>
>;
export type ViewerExtensionConfig = ReadonlyDeep<
  z.infer<typeof viewerExtensionConfigSchema>
>;
export type InspectorExtensionConfig = ReadonlyDeep<
  z.infer<typeof inspectorExtensionConfigSchema>
>;
export type PreviewExtensionDefinition = ReadonlyDeep<
  z.infer<typeof previewExtensionDefinitionSchema>
>;
export type InspectorExtensionDefinition = ReadonlyDeep<
  z.infer<typeof inspectorExtensionDefinitionSchema>
>;
export type PreviewManifest = ReadonlyDeep<
  z.infer<typeof previewManifestSchema>
>;
export type InspectorManifest = ReadonlyDeep<
  z.infer<typeof inspectorManifestSchema>
>;
export type ManifestJSON = ReadonlyDeep<z.infer<typeof manifestSchema>>;
