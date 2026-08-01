declare namespace Eagle {
  type ThemeName =
    | "Auto"
    | "LIGHT"
    | "LIGHTGRAY"
    | "GRAY"
    | "DARK"
    | "BLUE"
    | "PURPLE";

  type AppLocale =
    | "en"
    | "zh_CN"
    | "zh_TW"
    | "ja_JP"
    | "ko_KR"
    | "es_ES"
    | "de_DE"
    | "ru_RU";

  type Architecture = "x64" | "arm64" | "x86";
  type Platform = "darwin" | "win32";

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
    | "recent";

  interface Point {
    x: number;
    y: number;
  }

  interface Size {
    width: number;
    height: number;
  }

  interface Rectangle extends Point, Size {}

  /** @see https://developer.eagle.cool/plugin-api/api/window */
  interface WindowAPI {
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
    getSize(): Promise<[width: number, height: number]>;
    setBounds(bounds: Partial<Rectangle>): Promise<void>;
    getBounds(): Promise<Rectangle>;
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
    capturePage(rect?: Rectangle): Promise<NativeImage>;
    setReferer(url: string): void;
  }

  interface FileIconOptions {
    size: "small" | "normal" | "large";
  }

  /** @see https://developer.eagle.cool/plugin-api/api/app */
  interface AppAPI {
    readonly version: string;
    readonly build: number;
    readonly locale: AppLocale;
    readonly arch: Architecture;
    readonly platform: Platform;
    readonly env: Readonly<Record<string, string | undefined>>;
    readonly execPath: string;
    readonly pid: number;
    readonly isWindows: boolean;
    readonly isMac: boolean;
    readonly runningUnderARM64Translation: boolean;
    readonly theme: ThemeName;
    /** @since Eagle 4.0 build12 */
    readonly userDataPath: string;
    isDarkColors(): boolean;
    getPath(name: RequestablePath): Promise<string>;
    getFileIcon(path: string, options?: FileIconOptions): Promise<NativeImage>;
    createThumbnailFromPath(path: string, maxSize: Size): Promise<NativeImage>;
    /** @since Eagle 4.0 build18 */
    show(): Promise<boolean>;
  }

  /** @see https://developer.eagle.cool/plugin-api/api/os */
  interface OSAPI {
    tmpdir(): string;
    version(): string;
    type(): string;
    release(): string;
    hostname(): string;
    homedir(): string;
    arch(): Architecture;
  }

  /** @see https://developer.eagle.cool/plugin-api/api/screen */
  interface ScreenAPI {
    getCursorScreenPoint(): Promise<Point>;
    getPrimaryDisplay(): Promise<Display>;
    getAllDisplays(): Promise<Display[]>;
    getDisplayNearestPoint(point: Point): Promise<Display>;
  }

  interface Display {
    accelerometerSupport: "available" | "unavailable" | "unknown";
    bounds: Rectangle;
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
    workArea: Rectangle;
    workAreaSize: Size;
  }

  interface NotificationOptions {
    title: string;
    body: string;
    /** URL or base64-encoded image data. */
    icon?: string;
    mute?: boolean;
    /** Auto-hide duration in milliseconds. */
    duration?: number;
  }

  /** @see https://developer.eagle.cool/plugin-api/api/notification */
  interface NotificationAPI {
    show(options: NotificationOptions): Promise<void>;
  }

  interface ContextMenuItem {
    id: string;
    label: string;
    submenu?: ContextMenuItem[];
    click?: () => void;
  }

  /** @see https://developer.eagle.cool/plugin-api/api/context-menu */
  interface ContextMenuAPI {
    open(menuItems: ContextMenuItem[]): void;
  }

  interface FileFilter {
    name: string;
    extensions: string[];
  }

  interface DialogOptionsBase {
    title?: string;
    defaultPath?: string;
    buttonLabel?: string;
    filters?: FileFilter[];
  }

  interface ShowOpenDialogOptions extends DialogOptionsBase {
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

  interface ShowSaveDialogOptions extends DialogOptionsBase {
    properties?: Array<"openDirectory" | "showHiddenFiles" | "createDirectory">;
  }

  interface OpenDialogResult {
    readonly canceled: boolean;
    readonly filePaths: string[];
  }

  interface SaveDialogResult {
    readonly canceled: boolean;
    readonly filePath: string | undefined;
  }

  interface MessageBoxOptions {
    message: string;
    title?: string;
    detail?: string;
    type?: "none" | "info" | "error" | "question" | "warning";
    buttons?: string[];
  }

  interface MessageBoxResult {
    readonly response: number;
  }

  /** @see https://developer.eagle.cool/plugin-api/api/dialog */
  interface DialogAPI {
    showOpenDialog(options: ShowOpenDialogOptions): Promise<OpenDialogResult>;
    showSaveDialog(options: ShowSaveDialogOptions): Promise<SaveDialogResult>;
    showMessageBox(options: MessageBoxOptions): Promise<MessageBoxResult>;
    showErrorBox(title: string, content: string): Promise<void>;
  }

  /** @see https://developer.eagle.cool/plugin-api/api/clipboard */
  interface ClipboardAPI {
    clear(): void;
    has(format: string): boolean;
    writeText(text: string): void;
    readText(): string;
    writeBuffer(format: string, buffer: Buffer): void;
    readBuffer(format: string): Buffer;
    writeImage(image: NativeImage): void;
    readImage(): NativeImage;
    writeHTML(html: string): void;
    readHTML(): string;
    copyFiles(paths: string[]): void;
  }

  /** @see https://developer.eagle.cool/plugin-api/api/drag */
  interface DragAPI {
    startDrag(filePaths: string[]): Promise<void>;
  }

  /** @see https://developer.eagle.cool/plugin-api/api/shell */
  interface ShellAPI {
    beep(): Promise<void>;
    openExternal(url: string): Promise<void>;
    openPath(path: string): Promise<void>;
    showItemInFolder(path: string): Promise<void>;
  }

  /** @see https://developer.eagle.cool/plugin-api/api/log */
  interface LoggerAPI {
    debug(value: unknown): void;
    info(value: unknown): void;
    warn(value: unknown): void;
    error(value: unknown): void;
  }

  interface NativeImage {
    toPNG(options?: { scaleFactor?: number }): Buffer;
    toJPEG(quality: number): Buffer;
    toBitmap(options?: { scaleFactor?: number }): Buffer;
    toDataURL(options?: { scaleFactor?: number }): string;
    isEmpty(): boolean;
    getSize(scaleFactor?: number): Size;
  }

  /** @deprecated Use `Rectangle`. */
  type Bounds = Rectangle;
  /** @deprecated Use `Display`. */
  type DisplayLike = Display;
  /** @deprecated Use `NativeImage`. */
  type NativeImageLike = NativeImage;
  /** @deprecated Use `ContextMenuItem`. */
  type MenuItemLike = ContextMenuItem;
}
