/**
 * Type definitions for Eagle Plugin API.
 *
 * This package provides ambient global types only.
 * It does not ship runtime JavaScript.
 */

declare global {
  const eagle: Eagle.PluginAPI;

  namespace Eagle {
    interface PluginAPI {
      readonly app: App;
    }

    interface App {
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
    }
  }
}

export {};
