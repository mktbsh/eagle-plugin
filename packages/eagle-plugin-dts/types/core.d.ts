declare namespace Eagle {
  interface PluginDetails {
    readonly manifest: ManifestJSON;
    readonly path: string;
  }

  type PluginCreateCallback = (plugin: PluginDetails) => void;
  type LibraryChangedCallback = (libraryPath: string) => void;
  type ThemeChangedCallback = (theme: ThemeName) => void;

  /**
   * Lifecycle events exposed directly on the global `eagle` object.
   *
   * @see https://developer.eagle.cool/plugin-api/api/event
   */
  interface EventAPI {
    onPluginCreate(callback: PluginCreateCallback): void;
    onPluginRun(callback: () => void): void;
    onPluginBeforeExit(callback: () => void): void;
    onPluginShow(callback: () => void): void;
    onPluginHide(callback: () => void): void;
    onLibraryChanged(callback: LibraryChangedCallback): void;
    onThemeChanged(callback: ThemeChangedCallback): void;
  }

  interface PluginAPI extends EventAPI {
    readonly item: ItemAPI;
    readonly folder: FolderAPI;
    readonly smartFolder: SmartFolderAPI;
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
}
