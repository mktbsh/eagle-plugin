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
      readonly event: unknown;
      readonly item: unknown;
      readonly folder: unknown;
      readonly smartFolder: unknown;
      readonly tag: unknown;
      readonly tagGroup: unknown;
      readonly library: unknown;
      readonly window: unknown;
      readonly app: App;
      readonly os: OS;
      readonly screen: Screen;
      readonly notification: unknown;
      readonly contextMenu: unknown;
      readonly dialog: Dialog;
      readonly clipboard: Clipboard;
      readonly drag: Drag;
      readonly shell: Shell;
      readonly log: Logger;
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

    export interface App {
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
    export interface OS {
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

    export interface Logger {
      debug(obj: object): void;
      info(obj: object): void;
      warn(obj: object): void;
      error(obj: object): void;
    }

    export interface Shell {
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

    export interface Screen {
      getCursorScreenPoint(): Promise<Point>;
      getPrimaryDisplay(): Promise<DisplayLike>;
      getAllDisplays(): Promise<DisplayLike[]>;
      getDisplayNearestPoint(point: Point): Promise<DisplayLike>;
    }

    export interface Dialog {
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

    export interface Clipboard {
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

    export interface Drag {
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
      bounds: Point & Size;
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
      workArea: Point & Size;
      workAreaSize: Size;
    }
  }
}
