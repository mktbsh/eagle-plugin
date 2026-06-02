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
      readonly app: App;
      readonly os: OS;
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

    export interface Size {
      width: number;
      height: number;
    }

    export interface NativeImageLike {
      toPNG(options?: { scaleFactor?: number }): Promise<Buffer>;
      toJPEG(options?: { quality?: number }): Promise<Buffer>;
      toBitmap(options?: { scaleFactor?: number }): Promise<Buffer>;
      toDataURL(options?: { scaleFactor?: number }): Promise<string>;
      isEmpty(): boolean;
      getSize(scaleFactor?: number): Size;
    }
  }
}
