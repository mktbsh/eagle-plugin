declare namespace Eagle {
  type Rating = 0 | 1 | 2 | 3 | 4 | 5;

  type ItemShape =
    | "square"
    | "portrait"
    | "panoramic-portrait"
    | "landscape"
    | "panoramic-landscape";

  interface ItemQueryOptions {
    id?: string;
    ids?: string[];
    isSelected?: boolean;
    isUntagged?: boolean;
    isUnfiled?: boolean;
    keywords?: string[];
    tags?: string[];
    folders?: string[];
    ext?: string;
    annotation?: string;
    rating?: Rating;
    url?: string;
    shape?: ItemShape;
    /** Only supported by `item.get()`. */
    fields?: string[];
  }

  type ItemCountOptions = Omit<ItemQueryOptions, "fields">;

  interface ItemAddOptions {
    name?: string;
    website?: string;
    tags?: string[];
    folders?: string[];
    annotation?: string;
  }

  interface BookmarkAddOptions {
    name?: string;
    base64?: string;
    tags?: string[];
    folders?: string[];
    annotation?: string;
  }

  interface ItemOpenOptions {
    /** @since Eagle 4.0 build12 */
    window?: boolean;
  }

  /** @see https://developer.eagle.cool/plugin-api/api/item */
  interface ItemAPI {
    get(options: ItemQueryOptions): Promise<Item[]>;
    getAll(): Promise<Item[]>;
    getById(itemId: string): Promise<Item>;
    getByIds(itemIds: string[]): Promise<Item[]>;
    getSelected(): Promise<Item[]>;
    getIdsWithModifiedAt(): Promise<ItemModification[]>;
    count(options: ItemCountOptions): Promise<number>;
    countAll(): Promise<number>;
    countSelected(): Promise<number>;
    /** @since Eagle 4.0 build12 */
    select(itemIds: string[]): Promise<boolean>;
    addFromURL(url: string, options: ItemAddOptions): Promise<string>;
    addFromBase64(base64: string, options: ItemAddOptions): Promise<string>;
    addFromPath(path: string, options: ItemAddOptions): Promise<string>;
    addBookmark(url: string, options: BookmarkAddOptions): Promise<string>;
    open(itemId: string, options?: ItemOpenOptions): Promise<boolean>;
  }

  interface ItemModification {
    readonly id: string;
    readonly modifiedAt: number;
  }

  interface Item {
    readonly id: string;
    name: string;
    readonly ext: string;
    width: number;
    height: number;
    url: string;
    readonly isDeleted: boolean;
    annotation: string;
    tags: string[];
    folders: string[];
    readonly palettes: readonly Record<string, unknown>[];
    /** @since Eagle 4.0 build22 */
    readonly comments: readonly Comment[];
    readonly size: number;
    star: Rating;
    /** Writable since Eagle 4.0 build18. */
    importedAt: number;
    readonly modifiedAt: number;
    readonly noThumbnail: boolean;
    readonly noPreview: boolean;
    readonly filePath: string;
    readonly fileURL: `file:///${string}`;
    readonly thumbnailPath: string;
    readonly thumbnailURL: `file:///${string}`;
    readonly metadataFilePath: string;
    save(): Promise<boolean>;
    moveToTrash(): Promise<boolean>;
    replaceFile(filePath: string): Promise<boolean>;
    refreshThumbnail(): Promise<boolean>;
    setCustomThumbnail(thumbnailPath: string): Promise<boolean>;
    open(options?: ItemOpenOptions): Promise<void>;
    /** @since Eagle 4.0 build12 */
    select(): Promise<boolean>;
    /** @since Eagle 4.0 build22 */
    addComment(commentData: CommentCreateData): Promise<Comment>;
    /** @since Eagle 4.0 build22 */
    updateComment(
      commentId: string,
      updateData: CommentUpdateData,
    ): Promise<Comment>;
    /** @since Eagle 4.0 build22 */
    removeComment(commentId: string): Promise<boolean>;
  }

  interface CommentCreateData {
    annotation?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    duration?: number;
  }

  interface CommentUpdateData {
    annotation?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    duration?: number;
  }

  interface Comment {
    readonly id: string;
    readonly annotation: string;
    readonly x?: number;
    readonly y?: number;
    readonly width?: number;
    readonly height?: number;
    readonly duration?: number;
    readonly lastModified: number;
  }

  type FolderIconColor =
    | "red"
    | "orange"
    | "yellow"
    | "green"
    | "aqua"
    | "blue"
    | "purple"
    | "pink";

  interface FolderIconColorConstants {
    readonly Red: "red";
    readonly Orange: "orange";
    readonly Yellow: "yellow";
    readonly Green: "green";
    readonly Aqua: "aqua";
    readonly Blue: "blue";
    readonly Purple: "purple";
    readonly Pink: "pink";
  }

  interface FolderCreateOptions {
    name: string;
    description?: string;
    parent?: string;
  }

  interface SubfolderCreateOptions {
    name: string;
    description?: string;
  }

  interface FolderQueryOptions {
    id?: string;
    ids?: string[];
    isSelected?: boolean;
    isRecent?: boolean;
  }

  /** @see https://developer.eagle.cool/plugin-api/api/folder */
  interface FolderAPI {
    readonly IconColor: FolderIconColorConstants;
    create(options: FolderCreateOptions): Promise<Folder>;
    createSubfolder(
      parentId: string,
      options: SubfolderCreateOptions,
    ): Promise<Folder>;
    get(options: FolderQueryOptions): Promise<Folder[]>;
    getAll(): Promise<Folder[]>;
    getById(folderId: string): Promise<Folder>;
    getByIds(folderIds: string[]): Promise<Folder[]>;
    getSelected(): Promise<Folder[]>;
    getRecents(): Promise<Folder[]>;
    open(folderId: string): Promise<void>;
  }

  interface Folder {
    readonly id: string;
    name: string;
    description: string;
    readonly icon: string;
    /** Writable since Eagle 4.0 build12. */
    iconColor: FolderIconColor;
    readonly createdAt: number;
    /** Writable since Eagle 4.0 build12. */
    parent: string | null;
    readonly children: readonly Folder[];
    save(): Promise<void>;
    open(): Promise<void>;
  }

  type SmartFolderMatch = "AND" | "OR";
  type SmartFolderBoolean = "TRUE" | "FALSE";

  interface SmartFolderRule {
    readonly property: string;
    readonly method: string;
    readonly value?: unknown;
  }

  interface SmartFolderRuleConstructor {
    new (property: string, method: string, value?: unknown): SmartFolderRule;
  }

  interface SmartFolderRuleBuilder {
    readonly [method: string]: (value?: unknown) => SmartFolderRule;
  }

  interface SmartFolderCondition {
    readonly match: SmartFolderMatch;
    readonly rules: SmartFolderRule[];
    readonly boolean?: SmartFolderBoolean;
  }

  interface SmartFolderConditionConstructor {
    create(
      match: SmartFolderMatch,
      rules: SmartFolderRule[],
      boolean?: SmartFolderBoolean,
    ): SmartFolderCondition;
  }

  interface SmartFolderRuleSchema {
    readonly methods: string[];
    readonly valueType: string;
    readonly options?: unknown[];
    /** Additional schema metadata is not documented by Eagle. */
    readonly [key: string]: unknown;
  }

  type SmartFolderRules = Record<string, SmartFolderRuleSchema>;

  interface SmartFolderCreateOptions {
    name: string;
    conditions: SmartFolderCondition[];
    description?: string;
    iconColor?: FolderIconColor;
    parent?: string;
  }

  interface SmartFolderQueryOptions {
    id?: string;
    ids?: string[];
  }

  interface SmartFolderItemsOptions {
    orderBy?: string;
    fields?: string[];
  }

  /**
   * @since Eagle 4.0 build22
   * @see https://developer.eagle.cool/plugin-api/api/smart-folder
   */
  interface SmartFolderAPI {
    readonly IconColor: FolderIconColorConstants;
    readonly Rule: SmartFolderRuleConstructor;
    readonly Condition: SmartFolderConditionConstructor;
    create(options: SmartFolderCreateOptions): Promise<SmartFolder>;
    get(options: SmartFolderQueryOptions): Promise<SmartFolder[]>;
    getAll(): Promise<SmartFolder[]>;
    getById(smartFolderId: string): Promise<SmartFolder>;
    getByIds(smartFolderIds: string[]): Promise<SmartFolder[]>;
    remove(smartFolderId: string): Promise<boolean>;
    getRules(): Promise<SmartFolderRules>;
    rule(property: string): SmartFolderRuleBuilder;
  }

  interface SmartFolder {
    readonly id: string;
    name: string;
    conditions: SmartFolderCondition[];
    description: string;
    readonly icon: string;
    iconColor: FolderIconColor;
    readonly modificationTime: number;
    readonly children: readonly SmartFolder[];
    readonly parent: string | null;
    readonly imageCount: number;
    save(): Promise<SmartFolder>;
    getItems(options?: SmartFolderItemsOptions): Promise<Item[]>;
  }

  interface TagQueryOptions {
    /** @since Eagle 4.0 build12 */
    name?: string;
  }

  interface TagMergeOptions {
    source: string;
    target: string;
  }

  interface TagMergeResult {
    readonly affectedItems: number;
    readonly sourceRemoved: boolean;
  }

  /** @see https://developer.eagle.cool/plugin-api/api/tag */
  interface TagAPI {
    get(options?: TagQueryOptions): Promise<Tag[]>;
    getRecentTags(): Promise<Tag[]>;
    /** @since Eagle 4.0 build18 */
    getStarredTags(): Promise<Tag[]>;
    /** @since Eagle 4.0 build18 */
    merge(options: TagMergeOptions): Promise<TagMergeResult>;
  }

  interface Tag {
    name: string;
    readonly count: number;
    color: string;
    readonly groups: readonly string[];
    readonly pinyin: string;
    /** @since Eagle 4.0 build12 */
    save(): Promise<boolean>;
  }

  interface TagGroupCreateOptions {
    name: string;
    color: FolderIconColor;
    tags: string[];
    /** @since Eagle 4.0 build18 */
    description?: string;
  }

  interface TagGroupAddTagsOptions {
    tags: string[];
    /** When true, move the tags from their source groups. @default false */
    removeFromSource?: boolean;
  }

  interface TagGroupRemoveTagsOptions {
    tags: string[];
  }

  /** @see https://developer.eagle.cool/plugin-api/api/tag-group */
  interface TagGroupAPI {
    get(): Promise<TagGroup[]>;
    create(options: TagGroupCreateOptions): Promise<TagGroup>;
  }

  interface TagGroup {
    name: string;
    color: FolderIconColor;
    tags: string[];
    /** @since Eagle 4.0 build18 */
    description: string;
    save(): Promise<TagGroup>;
    remove(): Promise<boolean>;
    /** @since Eagle 4.0 build18 */
    addTags(options: TagGroupAddTagsOptions): Promise<TagGroup>;
    /** @since Eagle 4.0 build18 */
    removeTags(options: TagGroupRemoveTagsOptions): Promise<TagGroup>;
  }

  /** @see https://developer.eagle.cool/plugin-api/api/library */
  interface LibraryAPI {
    /** The official documentation does not specify the returned object's fields. */
    info(): Promise<Record<string, unknown>>;
    readonly name: string;
    readonly path: string;
    readonly modificationTime: number;
  }
}
