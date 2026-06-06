import type { Buffer } from "node:buffer";

/**
 * Type definitions for Eagle Plugin API.
 *
 * This package provides ambient global types only.
 * It does not ship runtime JavaScript.
 */

declare global {
  const eagle: Eagle.PluginAPI;

  namespace Eagle {
    export interface PluginAPI {
      readonly event: EventAPI;
      readonly item: ItemAPI;
      readonly folder: unknown;
      readonly smartFolder: unknown;
      readonly tag: TagAPI;
      readonly tagGroup: TagGroupAPI;
      readonly library: LibraryAPI;
      readonly window: WindowAPI;
      readonly app: AppAPI;
      readonly os: OSAPI;
      readonly screen: ScreenAPI;
      readonly notification: NotificationAPI;
      readonly contextMenu: ContextMenuAPI;
      readonly dialog: DialogAPI;
      readonly clipboard: ClipboardAPI;
      readonly drag: DragAPI;
      readonly shell: ShellAPI;
      readonly log: LoggerAPI;
    }

    type RequestablePath =
      | "home"
      | "appData"
      | "userData"
      | "temp"
      | "exe"
      | "desktop"
      | "documents"
      | "downloads"
      | "music"
      | "pictures"
      | "videos"
      | "recent"
      | (string & {});

    type PluginCreateCallback = (plugin: {
      manifest: ManifestJSON;
      path: string;
    }) => void;

    type LibraryChangedCallback = (libraryPath: string) => void;
    type ThemeChangedCallback = (theme: string) => void;

    export interface EventAPI {
      onPluginCreate(callback: PluginCreateCallback): void;
      onPluginRun(callback: VoidFunction): void;
      onPluginBeforeExit(callback: VoidFunction): void;
      onPluginShow(callback: VoidFunction): void;
      onPluginHide(callback: VoidFunction): void;
      onLibraryChanged(callback: LibraryChangedCallback): void;
      onThemeChanged(callback: ThemeChangedCallback): void;
    }

    export interface ItemAPI {
      get(options: {
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
        rating?: 0 | 1 | 2 | 3 | 4 | 5 | (number & {});
        url?: string;
        shape?:
          | "square"
          | "portrait"
          | "panoramic-portrait"
          | "landscape"
          | "panoramic-landscape";
        fields?: string[];
      }): Promise<Item[]>;
      getAll(): Promise<Item[]>;
      getById(itemId: string): Promise<Item>;
      getByIds(itemIds: string[]): Promise<Item[]>;
      getSelected(): Promise<Item[]>;
      getIdsWithModifiedAt(): Promise<{ id: string; modifiedAt: number }[]>;
      count(options: {
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
        rating?: 0 | 1 | 2 | 3 | 4 | 5 | (number & {});
        url?: string;
        shape?:
          | "square"
          | "portrait"
          | "panoramic-portrait"
          | "landscape"
          | "panoramic-landscape";
      }): Promise<number>;
      countAll(): Promise<number>;
      countSelected(): Promise<number>;
      select(itemIds: string[]): Promise<boolean>;
      addFromURL(
        url: string,
        options: {
          name?: string;
          website?: string;
          tags?: string[];
          folders?: string[];
          annotation?: string;
        },
      ): Promise<string>;
      addFromBase64(
        base64: string,
        options: {
          name?: string;
          website?: string;
          tags?: string[];
          folders?: string[];
          annotation?: string;
        },
      ): Promise<string>;
      addFromPath(
        path: string,
        options: {
          name?: string;
          website?: string;
          tags?: string[];
          folders?: string[];
          annotation?: string;
        },
      ): Promise<string>;
      addBookmark(
        url: string,
        options: {
          name?: string;
          base64?: string;
          tags?: string[];
          folders?: string[];
          annotation?: string;
        },
      ): Promise<string>;
      open(itemId: string, options?: { window?: boolean }): Promise<boolean>;
    }

    export interface Item {
      readonly id: string;
      name: string;
      readonly ext: string;
      readonly width: number;
      readonly height: number;
      url: string;
      readonly isDeleted: boolean;
      readonly annotation: string;
      tags: string[];
      folders: string[];
      readonly palettes: object[];
      readonly comments: Comment[];
      readonly size: number;
      star: 0 | 1 | 2 | 3 | 4 | 5 | (number & {});
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
      open(options?: { window?: boolean }): Promise<void>;
      select(): Promise<boolean>;
      addComment(commentData: CommentData): Promise<Comment>;
      updateComment(
        commentId: string,
        commentData: CommentData,
      ): Promise<Comment>;
      removeComment(commentId: string): Promise<boolean>;
    }

    export type CommentData = Partial<Omit<Comment, "id" | "lastModified">>;

    export interface Comment {
      readonly id: string;
      readonly x: number;
      readonly y: number;
      readonly width: number;
      readonly height: number;
      readonly annotation: string;
      readonly lastModified: number;
    }

    export interface SmartFolderAPI {
      readonly IconColor: SmartFolderIconColor;
    }

    interface SmartFolderIconColor {
      readonly Red: "red";
      readonly Orange: "orange";
      readonly Yellow: "yellow";
      readonly Green: "green";
      readonly Aqua: "aqua";
      readonly Blue: "blue";
      readonly Purple: "purple";
      readonly Pink: "pink";
    }

    export interface TagAPI {
      get(options?: { name?: string }): Promise<Tag[]>;
      getRecentTags(): Promise<Tag[]>;
      getStarredTags(): Promise<Tag[]>;
      merge(options: {
        source: string;
        target: string;
      }): Promise<{ affectedItems: number; sourceRemoved: boolean }>;
    }

    export interface Tag {
      name: string;
      readonly count: number;
      color: string;
      readonly groups: string[];
      readonly pinyin: string;
      save(): Promise<boolean>;
    }

    export interface TagGroupAPI {
      get(): Promise<TagGroup[]>;
      create(options: TagGroup): Promise<TagGroup>;
    }

    export interface TagGroup {
      name: string;
      color: string;
      tags: string[];
      description: string;
      save(): Promise<TagGroup>;
      remove(): Promise<boolean>;
      addTags(options: {
        tags: string[];
        /**
         * @description false: Only add tags, true: Move tags
         * @default false
         */
        removeFromSource?: boolean;
      }): Promise<TagGroup>;
      removeTags(options: { tags: string[] }): Promise<TagGroup>;
    }

    export interface LibraryAPI {
      info(): Promise<unknown>;
      readonly name: string;
      readonly path: string;
      readonly modificationTime: number;
    }

    export interface WindowAPI {
      show(): Promise<void>;
      showInactive(): Promise<void>;
      hide(): Promise<void>;
      focus(): Promise<void>;
      minimize(): Promise<void>;
      isMinimized(): Promise<boolean>;
      restore(): Promise<void>;
      maximize(): Promise<void>;
      unmaximize(): Promise<void>;
      isMaximized(): Promise<boolean>;
      setFullScreen(flag: boolean): Promise<void>;
      isFullScreen(): Promise<boolean>;
      setAspectRatio(aspectRatio: number): Promise<void>;
      setBackgroundColor(backgroundColor: string): Promise<void>;
      setSize(width: number, height: number): Promise<void>;
      getSize(): Promise<number[]>;
      setBounds(bounds: Bounds): Promise<void>;
      getBounds(): Promise<Bounds[]>;
      setResizable(resizable: boolean): Promise<void>;
      isResizable(): Promise<boolean>;
      setAlwaysOnTop(alwaysOnTop: boolean): Promise<void>;
      isAlwaysOnTop(): Promise<boolean>;
      setPosition(x: number, y: number): Promise<void>;
      getPosition(): Promise<[x: number, y: number]>;
      setOpacity(opacity: number): Promise<void>;
      getOpacity(): Promise<number>;
      flashFrame(flag: boolean): Promise<void>;
      setIgnoreMouseEvents(ignore: boolean): Promise<void>;
      capturePage(rect?: {
        x: number;
        y: number;
        width: number;
        height: number;
      }): Promise<NativeImageLike>;
      setReferer(url: string): Promise<void>;
    }

    export interface AppAPI {
      /**
       * @description the current Eagle application version
       */
      version: string;
      /**
       * @description the current Eagle application Build Number
       */
      build: number;
      /**
       * @description the current Eagle application interface language
       */
      locale: string;
      /**
       * @description the CPU architecture of the operating system
       * @example 'x64', 'arm64', 'x86'
       */
      arch: string;
      /**
       * @description a string identifying the operating system platform
       * @example 'win32', 'darwin', 'linux'
       */
      platform: string;
      /**
       * @description an object of environment variables
       * @example eagle.app.env['HOME']
       */
      env: Record<string, string | undefined>;
      /**
       * @description current application execution path
       */
      execPath: string;
      /**
       * @description current plugin process id
       */
      pid: number;
      /**
       * @description is the current operating system Windows
       */
      isWindows: boolean;
      /**
       * @description is the current operating system Mac
       */
      isMac: boolean;
      /**
       * @description when true it indicates that the current application is running in ARM64 runtime (e.g., macOS Rosetta Translator Environment or Windows WOW).
       */
      runningUnderARM64Translation: boolean;
      /**
       * @description the current theme color name
       * @example LIGHT, LIGHTGRAY, GRAY, DARK, BLUE, PURPLE
       */
      theme: string;
      /**
       * @description the path to the current user data directory
       */
      userDataPath: string;

      /**
       * @description Check if the current system is in dark (Dark) mode
       * @returns {boolean} Whether the current system is in Dark mode
       */
      isDarkColors(): boolean;

      /**
       * @description You can request the following paths by name
       * @param {RequestablePath} name
       */
      getPath(name: RequestablePath): Promise<string>;

      /**
       * @description Get the icon associated with the specified path file
       * @param path File path for which you want to get the icon
       */
      getFileIcon(
        path: string,
        options?: { size: "small" | "normal" | "large" },
      ): Promise<NativeImageLike>;

      /**
       * @description Get the icon associated with the file at the specified path
       * @param path The file path to get the thumbnail from
       * @param maxSize The maximum width and height (positive number) of the returned thumbnail
       */
      createThumbnailFromPath(
        path: string,
        maxSize: Size,
      ): Promise<NativeImageLike>;

      /**
       * @description Brings the Eagle main application window to the front and displays it on top
       */
      show(): Promise<boolean>;
    }

    /**
     * @description Similar to the os module in Node.js, provides some basic system operation functions.
     */
    export interface OSAPI {
      /**
       * @description the default temporary file path of the operating system
       */
      tmpdir(): string;
      /**
       * @description the string of the operating system kernel version
       */
      version(): string;
      /**
       * @description the name of the operating system
       */
      type(): string;
      /**
       * @description the release version of the operating system
       */
      release(): string;
      /**
       * @description the hostname of the operating system
       */
      hostname(): string;
      /**
       * @description the home directory of the current user
       */
      homedir(): string;
      /**
       * @description the CPU architecture of the operating system
       */
      arch(): string;
    }

    export interface LoggerAPI {
      debug(obj: object): void;
      info(obj: object): void;
      warn(obj: object): void;
      error(obj: object): void;
    }

    export interface ShellAPI {
      /**
       * @description Plays the system's beep sound.
       */
      beep(): Promise<void>;
      /**
       * @description Opens the specified URL using the system's default method. Note: This function will not have any effect if there is no default application set by the system.
       * @param url The URL to be opened
       */
      openExternal(url: string): Promise<void>;
      /**
       * @description Opens the specified path using the system's default method.
       */
      openPath(path: string): Promise<void>;
      /**
       * @description Shows the specified file or folder in the file manager
       */
      showItemInFolder(path: string): Promise<void>;
    }

    export interface ScreenAPI {
      getCursorScreenPoint(): Promise<Point>;
      getPrimaryDisplay(): Promise<DisplayLike>;
      getAllDisplays(): Promise<DisplayLike[]>;
      getDisplayNearestPoint(point: Point): Promise<DisplayLike>;
    }

    export interface NotificationAPI {
      show(options: {
        title: string;
        body: string;
        /**
         * @description URL/base64 string
         */
        icon?: string;
        mute?: boolean;
        /**
         * @description milliseconds
         */
        duration?: number;
      }): Promise<void>;
    }

    export interface ContextMenuAPI {
      open(menuItems: MenuItemLike[]): void;
    }

    export interface MenuItemLike {
      id: string;
      label: string;
      submenu?: MenuItemLike[];
      click?: (
        menuItem: MenuItemLike,
        window: unknown,
        event: KeyboardEvent,
      ) => void;
    }

    export interface DialogAPI {
      showOpenDialog(options: ShowOpenDialogOptions): Promise<DialogResult>;
      showSaveDialog(options: ShowSaveDialogOptions): Promise<DialogResult>;
      showMessageBox(options: {
        message: string;
        title?: string;
        detail?: string;
        type?: "none" | "info" | "error" | "question" | "warning";
        buttons?: string[];
      }): Promise<{ response: number }>;
      showErrorBox(title: string, content: string): Promise<void>;
    }

    export interface DialogResult {
      canceled: boolean;
      filePaths: string[];
    }

    export interface DialogOptionsBase {
      title?: string;
      defaultPath?: string;
      buttonLabel?: string;
      filters?: Array<{ name: string; extensions: string[] }>;
    }

    export interface ShowOpenDialogOptions {
      properties?: Array<
        | "openFile"
        | "openDirectory"
        | "multiSelections"
        | "showHiddenFiles"
        | "createDirectory"
        | "promptToCreate"
      >;
      message?: string;
    }

    export interface ShowSaveDialogOptions extends DialogOptionsBase {
      properties?: Array<
        "openDirectory" | "showHiddenFiles" | "createDirectory"
      >;
    }

    export interface ClipboardAPI {
      clear(): void;
      has(format: string): boolean;
      writeText(text: string): void;
      readText(): string;
      writeBuffer(format: string, buffer: Buffer): void;
      readBuffer(format: string): Buffer;
      writeImage(image: NativeImageLike): void;
      readImage(): NativeImageLike;
      writeHTML(html: string): void;
      readHTML(): string;
      copyFiles(paths: string[]): void;
    }

    export interface DragAPI {
      /**
       * @param filePaths
       * @see {@link https://www.electronjs.org/ja/docs/latest/api/web-contents#contentsstartdragitem}
       */
      startDrag(filePaths: string[]): Promise<void>;
    }

    export interface Size {
      width: number;
      height: number;
    }

    export interface Point {
      x: number;
      y: number;
    }

    export type Bounds = Point & Size;

    export interface ManifestJSON {
      readonly id: string;
      readonly version: string;
      readonly platform: "all" | "mac" | "win";
      readonly arch: "all" | "arm64" | "x64";
      readonly name: string;
      readonly logo: string;
      readonly keywords: string[];
      readonly devTools: boolean;
      readonly main: {
        readonly url: string;
        readonly width: number;
        readonly height: number;
        readonly minWidth: number;
        readonly minHeight: number;
        readonly maxWidth: number;
        readonly maxHeight: number;
        readonly alwaysOnTop: boolean;
        readonly frame: boolean;
        readonly fullscreenable: boolean;
        readonly maximizable: boolean;
        readonly minimizable: boolean;
        readonly resizable: boolean;
        readonly backgroundColor: string;
        readonly childWindow: boolean;
        readonly followCursor: boolean;
        readonly multiple: boolean;
        readonly runAfterInstall: boolean;
      };
    }

    export interface NativeImageLike {
      toPNG(options?: { scaleFactor?: number }): Promise<Buffer>;
      toJPEG(options?: { quality?: number }): Promise<Buffer>;
      toBitmap(options?: { scaleFactor?: number }): Promise<Buffer>;
      toDataURL(options?: { scaleFactor?: number }): Promise<string>;
      isEmpty(): boolean;
      getSize(scaleFactor?: number): Size;
    }

    // TODO: https://www.electronjs.org/docs/latest/api/structures/display
    export interface DisplayLike {
      accelerometerSupport: "available" | "unavailable" | "unknown";
      bounds: Bounds;
      colorDepth: number;
      colorSpace: string;
      depthPerComponent: number;
      detected: boolean;
      displayFrequency: number;
      id: number;
      internal: boolean;
      label: string;
      maximumCursorSize: Size;
      monochrome: boolean;
      nativeOrigin: Point;
      rotation: number;
      scaleFactor: number;
      size: Size;
      touchSupport: "available" | "unavailable" | "unknown";
      workArea: Bounds;
      workAreaSize: Size;
    }
  }
}
