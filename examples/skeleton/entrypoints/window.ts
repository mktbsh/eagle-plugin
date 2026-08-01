import "./window.css";

const app = document.querySelector<HTMLDivElement>("#app");

if (app !== null) {
  app.innerHTML = `<main>
    <h1>Eagle Plugin Skeleton</h1>
    <button type="button" data-action="increment">Click me</button>
    <p data-role="status">Clicks: 0</p>
    <section class="panel">
      <h2>Eagle API probe</h2>
      <p>Read-only API calls from this Window:</p>
      <button type="button" data-action="refresh-probes">
        Refresh read-only probes
      </button>
      <pre class="api-output"><code data-role="api-probes">Loading…</code></pre>
    </section>
    <section class="panel">
      <h2>Safe API sweep</h2>
      <p>Read-only calls. User data is summarized, not displayed.</p>
      <button type="button" data-action="safe-sweep">Run safe API sweep</button>
      <pre class="api-output"><code data-role="safe-probes">Not run.</code></pre>
    </section>
    <section class="panel">
      <h2>Action API probe</h2>
      <p>Click a button to run one non-destructive UI API:</p>
      <div class="action-row">
        <button type="button" data-action="notification">Notification</button>
        <button type="button" data-action="dialog">Dialog</button>
        <button type="button" data-action="open-dialog">Open dialog</button>
        <button type="button" data-action="save-dialog">Save dialog</button>
        <button type="button" data-action="error-dialog">Error dialog</button>
        <button type="button" data-action="context-menu">Context menu</button>
        <button type="button" data-action="clipboard-has">
          Clipboard has text
        </button>
        <button type="button" data-action="clipboard-read">
          Read clipboard length
        </button>
        <button type="button" data-action="clipboard-read-extra">
          Read clipboard formats
        </button>
        <button type="button" data-action="clipboard-formats">
          Check clipboard formats
        </button>
        <button type="button" data-action="shell-beep">Shell beep</button>
        <button type="button" data-action="item-select">
          Select selected item
        </button>
        <button type="button" data-action="item-open">Open selected item</button>
        <button type="button" data-action="folder-open">
          Open selected folder
        </button>
      </div>
      <pre class="api-output"><code data-role="action-result">Ready.</code></pre>
    </section>
    <section class="panel">
      <h2>Lifecycle events</h2>
      <pre class="api-output"><code data-role="lifecycle-events">Registering…</code></pre>
    </section>
    <section class="panel">
      <h2>Desktop API actions</h2>
      <p>Explicit UI actions. Minimize and maximize change this Window state.</p>
      <div class="action-row">
        <button type="button" data-action="app-show">App show</button>
        <button type="button" data-action="window-show">Window show</button>
        <button type="button" data-action="window-hide">Window hide</button>
        <button type="button" data-action="window-focus">Window focus</button>
        <button type="button" data-action="window-minimize">Minimize</button>
        <button type="button" data-action="window-restore">Restore</button>
        <button type="button" data-action="window-maximize">Maximize</button>
        <button type="button" data-action="window-unmaximize">
          Unmaximize
        </button>
        <button type="button" data-action="window-show-inactive">
          Show inactive
        </button>
        <button type="button" data-action="window-roundtrip">
          Window setter roundtrip
        </button>
        <button type="button" data-action="fullscreen-roundtrip">
          Fullscreen roundtrip
        </button>
        <button type="button" data-action="window-flash">Flash frame</button>
        <button type="button" data-action="capture-page">Capture page</button>
        <button type="button" data-action="file-icon">
          Get file icon for selected item
        </button>
        <button type="button" data-action="thumbnail">
          Create thumbnail for selected item
        </button>
        <button type="button" data-action="write-log">Write log entries</button>
      </div>
      <pre class="api-output"><code data-role="desktop-result">Ready.</code></pre>
    </section>
  </main>`;

  const button = app.querySelector<HTMLButtonElement>(
    '[data-action="increment"]',
  );
  const status = app.querySelector<HTMLParagraphElement>(
    '[data-role="status"]',
  );
  let clickCount = 0;

  button?.addEventListener("click", () => {
    clickCount += 1;
    if (status !== null) {
      status.textContent = `Clicks: ${clickCount}`;
    }
  });

  const actionResult = app.querySelector<HTMLElement>(
    '[data-role="action-result"]',
  );
  const desktopResult = app.querySelector<HTMLElement>(
    '[data-role="desktop-result"]',
  );
  const runAction = async (
    label: string,
    action: () => unknown | Promise<unknown>,
    output: HTMLElement | null = actionResult,
  ): Promise<void> => {
    if (output === null) {
      return;
    }
    try {
      const result = await action();
      output.textContent = `${label} = ${
        result === undefined ? "completed" : formatValue(result)
      }`;
    } catch (error) {
      output.textContent = `${label} = Error: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  };

  const notificationButton = app.querySelector<HTMLButtonElement>(
    '[data-action="notification"]',
  );
  notificationButton?.addEventListener("click", () => {
    void runAction("eagle.notification.show()", () =>
      eagle.notification.show({
        title: "Eagle API probe",
        body: "Notification API is working.",
        duration: 3000,
      }),
    );
  });

  const dialogButton = app.querySelector<HTMLButtonElement>(
    '[data-action="dialog"]',
  );
  dialogButton?.addEventListener("click", () => {
    void runAction("eagle.dialog.showMessageBox()", async () => {
      const result = await eagle.dialog.showMessageBox({
        title: "Eagle API probe",
        message: "Dialog API is working.",
        type: "info",
        buttons: ["OK"],
      });
      return `response=${result.response}`;
    });
  });

  const openDialogButton = app.querySelector<HTMLButtonElement>(
    '[data-action="open-dialog"]',
  );
  openDialogButton?.addEventListener("click", () => {
    void runAction("eagle.dialog.showOpenDialog()", async () => {
      const result = await eagle.dialog.showOpenDialog({
        title: "Eagle API probe",
        properties: ["openFile", "multiSelections"],
      });
      return `canceled=${result.canceled}, files=${result.filePaths.length}`;
    });
  });

  const saveDialogButton = app.querySelector<HTMLButtonElement>(
    '[data-action="save-dialog"]',
  );
  saveDialogButton?.addEventListener("click", () => {
    void runAction("eagle.dialog.showSaveDialog()", async () => {
      const result = await eagle.dialog.showSaveDialog({
        title: "Eagle API probe",
      });
      return `canceled=${result.canceled}, path=${
        result.canceled || result.filePath === undefined
          ? "(none)"
          : "(selected)"
      }`;
    });
  });

  const errorDialogButton = app.querySelector<HTMLButtonElement>(
    '[data-action="error-dialog"]',
  );
  errorDialogButton?.addEventListener("click", () => {
    void runAction("eagle.dialog.showErrorBox()", () =>
      eagle.dialog.showErrorBox(
        "Eagle API probe",
        "Error dialog API is working.",
      ),
    );
  });

  const contextMenuButton = app.querySelector<HTMLButtonElement>(
    '[data-action="context-menu"]',
  );
  contextMenuButton?.addEventListener("click", () => {
    void runAction("eagle.contextMenu.open()", () => {
      eagle.contextMenu.open([
        {
          id: "probe",
          label: "Eagle API probe works",
        },
      ]);
    });
  });

  const clipboardHasButton = app.querySelector<HTMLButtonElement>(
    '[data-action="clipboard-has"]',
  );
  clipboardHasButton?.addEventListener("click", () => {
    void runAction('eagle.clipboard.has("text/plain")', () =>
      eagle.clipboard.has("text/plain"),
    );
  });

  const clipboardReadButton = app.querySelector<HTMLButtonElement>(
    '[data-action="clipboard-read"]',
  );
  clipboardReadButton?.addEventListener("click", () => {
    void runAction(
      "eagle.clipboard.readText() length",
      () => `length=${eagle.clipboard.readText().length}`,
    );
  });

  const clipboardReadExtraButton = app.querySelector<HTMLButtonElement>(
    '[data-action="clipboard-read-extra"]',
  );
  clipboardReadExtraButton?.addEventListener("click", () => {
    void runAction("eagle.clipboard.readHTML/readBuffer/readImage()", () => {
      const html = eagle.clipboard.readHTML();
      const buffer = eagle.clipboard.readBuffer("text/plain");
      const image = eagle.clipboard.readImage();
      const imageSize = image.getSize();
      return [
        `readHTML length=${html.length}`,
        `readBuffer(text/plain) length=${buffer.length}`,
        `readImage empty=${image.isEmpty()}, size=${imageSize.width} × ${imageSize.height}`,
      ].join("\n");
    });
  });

  const clipboardFormatsButton = app.querySelector<HTMLButtonElement>(
    '[data-action="clipboard-formats"]',
  );
  clipboardFormatsButton?.addEventListener("click", () => {
    void runAction("eagle.clipboard.has(format)", () => {
      const formats = [
        "string",
        "text",
        "text/plain",
        "text/html",
        "image",
        "application/octet-stream",
      ];
      return formats
        .map((format) => `${format} = ${eagle.clipboard.has(format)}`)
        .join("\n");
    });
  });

  const shellBeepButton = app.querySelector<HTMLButtonElement>(
    '[data-action="shell-beep"]',
  );
  shellBeepButton?.addEventListener("click", () => {
    void runAction("eagle.shell.beep()", () => eagle.shell.beep());
  });

  const itemSelectButton = app.querySelector<HTMLButtonElement>(
    '[data-action="item-select"]',
  );
  itemSelectButton?.addEventListener("click", () => {
    void runAction("eagle.item.select()", async () => {
      const items = await eagle.item.getSelected();
      if (items.length === 0) {
        return "no selected item";
      }
      return `result=${await eagle.item.select([items[0].id])}`;
    });
  });

  const itemOpenButton = app.querySelector<HTMLButtonElement>(
    '[data-action="item-open"]',
  );
  itemOpenButton?.addEventListener("click", () => {
    void runAction("eagle.item.open()", async () => {
      const items = await eagle.item.getSelected();
      if (items.length === 0) {
        return "no selected item";
      }
      return `result=${await eagle.item.open(items[0].id)}`;
    });
  });

  const folderOpenButton = app.querySelector<HTMLButtonElement>(
    '[data-action="folder-open"]',
  );
  folderOpenButton?.addEventListener("click", () => {
    void runAction("eagle.folder.open()", async () => {
      const folders = await eagle.folder.getSelected();
      if (folders.length === 0) {
        return "no selected folder";
      }
      await eagle.folder.open(folders[0].id);
      return "completed";
    });
  });

  const appShowButton = app.querySelector<HTMLButtonElement>(
    '[data-action="app-show"]',
  );
  appShowButton?.addEventListener("click", () => {
    void runAction("eagle.app.show()", () => eagle.app.show(), desktopResult);
  });

  const windowActions: ReadonlyArray<
    readonly [string, string, () => unknown | Promise<unknown>]
  > = [
    ["window-show", "eagle.window.show()", () => eagle.window.show()],
    ["window-hide", "eagle.window.hide()", () => eagle.window.hide()],
    ["window-focus", "eagle.window.focus()", () => eagle.window.focus()],
    [
      "window-minimize",
      "eagle.window.minimize()",
      async () => {
        await eagle.window.minimize();
        return `isMinimized=${await eagle.window.isMinimized()}`;
      },
    ],
    [
      "window-restore",
      "eagle.window.restore()",
      async () => {
        await eagle.window.restore();
        return `isMinimized=${await eagle.window.isMinimized()}`;
      },
    ],
    [
      "window-maximize",
      "eagle.window.maximize()",
      async () => {
        await eagle.window.maximize();
        return `isMaximized=${await eagle.window.isMaximized()}`;
      },
    ],
    [
      "window-unmaximize",
      "eagle.window.unmaximize()",
      async () => {
        await eagle.window.unmaximize();
        return `isMaximized=${await eagle.window.isMaximized()}`;
      },
    ],
  ];

  for (const [action, label, run] of windowActions) {
    const actionButton = app.querySelector<HTMLButtonElement>(
      `[data-action="${action}"]`,
    );
    actionButton?.addEventListener("click", () => {
      void runAction(label, run, desktopResult);
    });
  }

  const showInactiveButton = app.querySelector<HTMLButtonElement>(
    '[data-action="window-show-inactive"]',
  );
  showInactiveButton?.addEventListener("click", () => {
    void runAction(
      "eagle.window.showInactive()",
      () => eagle.window.showInactive(),
      desktopResult,
    );
  });

  const windowRoundtripButton = app.querySelector<HTMLButtonElement>(
    '[data-action="window-roundtrip"]',
  );
  windowRoundtripButton?.addEventListener("click", () => {
    void runAction(
      "eagle.window setter roundtrip",
      async () => {
        const initialSize = await eagle.window.getSize();
        const initialBounds = await eagle.window.getBounds();
        const initialPosition = await eagle.window.getPosition();
        const initialResizable = await eagle.window.isResizable();
        const initialAlwaysOnTop = await eagle.window.isAlwaysOnTop();
        const initialOpacity = await eagle.window.getOpacity();

        try {
          await eagle.window.setSize(initialSize[0] + 40, initialSize[1] + 20);
          await eagle.window.setBounds({
            x: initialBounds.x + 10,
            y: initialBounds.y + 10,
            width: initialBounds.width + 20,
            height: initialBounds.height + 20,
          });
          await eagle.window.setPosition(
            initialPosition[0] + 10,
            initialPosition[1] + 10,
          );
          await eagle.window.setResizable(!initialResizable);
          await eagle.window.setAlwaysOnTop(!initialAlwaysOnTop);
          await eagle.window.setOpacity(Math.max(0.5, initialOpacity - 0.1));
          return "temporary setters completed";
        } finally {
          await eagle.window.setSize(initialSize[0], initialSize[1]);
          await eagle.window.setBounds(initialBounds);
          await eagle.window.setPosition(
            initialPosition[0],
            initialPosition[1],
          );
          await eagle.window.setResizable(initialResizable);
          await eagle.window.setAlwaysOnTop(initialAlwaysOnTop);
          await eagle.window.setOpacity(initialOpacity);
        }
      },
      desktopResult,
    );
  });

  const flashButton = app.querySelector<HTMLButtonElement>(
    '[data-action="window-flash"]',
  );
  flashButton?.addEventListener("click", () => {
    void runAction(
      "eagle.window.flashFrame()",
      () => eagle.window.flashFrame(true),
      desktopResult,
    );
  });

  const fullscreenRoundtripButton = app.querySelector<HTMLButtonElement>(
    '[data-action="fullscreen-roundtrip"]',
  );
  fullscreenRoundtripButton?.addEventListener("click", () => {
    void runAction(
      "eagle.window fullscreen roundtrip",
      async () => {
        const initial = await eagle.window.isFullScreen();
        try {
          await eagle.window.setFullScreen(!initial);
          return `temporary=${await eagle.window.isFullScreen()}`;
        } finally {
          await eagle.window.setFullScreen(initial);
        }
      },
      desktopResult,
    );
  });

  const fileIconButton = app.querySelector<HTMLButtonElement>(
    '[data-action="file-icon"]',
  );
  fileIconButton?.addEventListener("click", () => {
    void runAction(
      "eagle.app.getFileIcon()",
      async () => {
        const items = await eagle.item.getSelected();
        if (items.length === 0) {
          return "no selected item";
        }
        const image = await eagle.app.getFileIcon(items[0].filePath, {
          size: "normal",
        });
        const size = image.getSize();
        return `empty=${image.isEmpty()}, size=${size.width} × ${size.height}`;
      },
      desktopResult,
    );
  });

  const thumbnailButton = app.querySelector<HTMLButtonElement>(
    '[data-action="thumbnail"]',
  );
  thumbnailButton?.addEventListener("click", () => {
    void runAction(
      "eagle.app.createThumbnailFromPath()",
      async () => {
        const items = await eagle.item.getSelected();
        if (items.length === 0) {
          return "no selected item";
        }
        const image = await eagle.app.createThumbnailFromPath(
          items[0].filePath,
          { width: 200, height: 200 },
        );
        const size = image.getSize();
        return `empty=${image.isEmpty()}, size=${size.width} × ${size.height}`;
      },
      desktopResult,
    );
  });

  const capturePageButton = app.querySelector<HTMLButtonElement>(
    '[data-action="capture-page"]',
  );
  capturePageButton?.addEventListener("click", () => {
    void runAction(
      "eagle.window.capturePage()",
      async () => {
        const image = await eagle.window.capturePage();
        const size = image.getSize();
        return `empty=${image.isEmpty()}, size=${size.width} × ${size.height}`;
      },
      desktopResult,
    );
  });

  const writeLogButton = app.querySelector<HTMLButtonElement>(
    '[data-action="write-log"]',
  );
  writeLogButton?.addEventListener("click", () => {
    void runAction(
      "eagle.log.*",
      () => {
        eagle.log.debug("Eagle API probe debug");
        eagle.log.info("Eagle API probe info");
        eagle.log.warn("Eagle API probe warning");
        eagle.log.error("Eagle API probe error");
        return "completed; inspect Eagle logs";
      },
      desktopResult,
    );
  });

  const lifecycleOutput = app.querySelector<HTMLElement>(
    '[data-role="lifecycle-events"]',
  );
  const lifecycleState = {
    pluginCreate: "not observed",
    pluginRun: "not observed",
    themeChanged: "not observed",
    pluginBeforeExit: "not observed",
    pluginShow: "not observed",
    pluginHide: "not observed",
    libraryChanged: "not observed",
  };
  const renderLifecycleState = (): void => {
    if (lifecycleOutput !== null) {
      lifecycleOutput.textContent = [
        `eagle.onPluginCreate = ${lifecycleState.pluginCreate}`,
        `eagle.onPluginRun = ${lifecycleState.pluginRun}`,
        `eagle.onThemeChanged = ${lifecycleState.themeChanged}`,
        `eagle.onPluginBeforeExit = ${lifecycleState.pluginBeforeExit}`,
        `eagle.onPluginShow = ${lifecycleState.pluginShow}`,
        `eagle.onPluginHide = ${lifecycleState.pluginHide}`,
        `eagle.onLibraryChanged = ${lifecycleState.libraryChanged}`,
      ].join("\n");
    }
  };

  try {
    eagle.onPluginCreate(() => {
      lifecycleState.pluginCreate = "observed";
      renderLifecycleState();
    });
    eagle.onPluginRun(() => {
      lifecycleState.pluginRun = "observed";
      renderLifecycleState();
    });
    eagle.onThemeChanged((theme) => {
      lifecycleState.themeChanged = `observed (${theme})`;
      renderLifecycleState();
    });
    eagle.onPluginBeforeExit(() => {
      lifecycleState.pluginBeforeExit = "observed";
      renderLifecycleState();
    });
    eagle.onPluginShow(() => {
      lifecycleState.pluginShow = "observed";
      renderLifecycleState();
    });
    eagle.onPluginHide(() => {
      lifecycleState.pluginHide = "observed";
      renderLifecycleState();
    });
    eagle.onLibraryChanged(() => {
      lifecycleState.libraryChanged = "observed";
      renderLifecycleState();
    });
    renderLifecycleState();
  } catch (error) {
    if (lifecycleOutput !== null) {
      lifecycleOutput.textContent = `registration = Error: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  }

  type ProbeReader = () => unknown | Promise<unknown>;

  const probes: ReadonlyArray<readonly [string, ProbeReader]> = [
    ["eagle.app.version", () => eagle.app.version],
    ["eagle.app.build", () => eagle.app.build],
    ["eagle.app.locale", () => eagle.app.locale],
    ["eagle.app.theme", () => eagle.app.theme],
    ["eagle.app.isDarkColors()", () => eagle.app.isDarkColors()],
    [
      'eagle.app.getPath("appData")',
      async () =>
        (await eagle.app.getPath("appData")).length > 0
          ? "(path available)"
          : "(empty path)",
    ],
    ["eagle.os.version()", () => eagle.os.version()],
    ["eagle.os.type()", () => eagle.os.type()],
    ["eagle.os.arch()", () => eagle.os.arch()],
    [
      "eagle.window.getSize()",
      async () => {
        const [width, height] = await eagle.window.getSize();
        return `${width} × ${height}`;
      },
    ],
    [
      "eagle.window.getBounds()",
      async () => JSON.stringify(await eagle.window.getBounds()),
    ],
    ["eagle.window.getOpacity()", () => eagle.window.getOpacity()],
    ["eagle.window.isResizable()", () => eagle.window.isResizable()],
    ["eagle.window.isMaximized()", () => eagle.window.isMaximized()],
    ["eagle.window.isFullScreen()", () => eagle.window.isFullScreen()],
    [
      "eagle.screen.getAllDisplays()",
      async () => `${(await eagle.screen.getAllDisplays()).length} display(s)`,
    ],
    [
      "eagle.library.info()",
      async () => {
        const info = await eagle.library.info();
        const keys = Object.keys(info);
        return keys.length > 0 ? `keys: ${keys.join(", ")}` : "(no keys)";
      },
    ],
    [
      "eagle.library.info().name",
      async () => (await eagle.library.info()).name,
    ],
    [
      "eagle.library.info().applicationVersion",
      async () => (await eagle.library.info()).applicationVersion,
    ],
    ["eagle.item.countAll()", () => eagle.item.countAll()],
    ["eagle.item.countSelected()", () => eagle.item.countSelected()],
    [
      "eagle.folder.getSelected()",
      async () => `${(await eagle.folder.getSelected()).length} folder(s)`,
    ],
    [
      "eagle.tag.getRecentTags()",
      async () => `${(await eagle.tag.getRecentTags()).length} tag(s)`,
    ],
  ];

  const safeProbes: ReadonlyArray<readonly [string, ProbeReader]> = [
    ["eagle.app.arch", () => eagle.app.arch],
    ["eagle.app.platform", () => eagle.app.platform],
    [
      "eagle.app.execPath",
      () =>
        eagle.app.execPath.length > 0 ? "(path available)" : "(empty path)",
    ],
    ["eagle.app.pid", () => eagle.app.pid],
    ["eagle.app.isWindows", () => eagle.app.isWindows],
    ["eagle.app.isMac", () => eagle.app.isMac],
    [
      "eagle.app.runningUnderARM64Translation",
      () => eagle.app.runningUnderARM64Translation,
    ],
    [
      "eagle.app.userDataPath",
      () =>
        eagle.app.userDataPath.length > 0 ? "(path available)" : "(empty path)",
    ],
    [
      "eagle.os.tmpdir()",
      () =>
        eagle.os.tmpdir().length > 0 ? "(path available)" : "(empty path)",
    ],
    ["eagle.os.release()", () => eagle.os.release()],
    [
      "eagle.os.hostname()",
      () =>
        eagle.os.hostname().length > 0 ? "(value available)" : "(empty string)",
    ],
    [
      "eagle.os.homedir()",
      () =>
        eagle.os.homedir().length > 0 ? "(path available)" : "(empty path)",
    ],
    [
      "eagle.window.getPosition()",
      async () => JSON.stringify(await eagle.window.getPosition()),
    ],
    ["eagle.window.isMinimized()", () => eagle.window.isMinimized()],
    ["eagle.window.isAlwaysOnTop()", () => eagle.window.isAlwaysOnTop()],
    [
      "eagle.screen.getCursorScreenPoint()",
      async () => JSON.stringify(await eagle.screen.getCursorScreenPoint()),
    ],
    [
      "eagle.screen.getPrimaryDisplay()",
      async () => {
        const display = await eagle.screen.getPrimaryDisplay();
        return `${display.id}: ${display.size.width} × ${display.size.height}, scale=${display.scaleFactor}`;
      },
    ],
    [
      "eagle.screen.getDisplayNearestPoint()",
      async () => {
        const point = await eagle.screen.getCursorScreenPoint();
        const display = await eagle.screen.getDisplayNearestPoint(point);
        return `display=${display.id}`;
      },
    ],
    [
      "eagle.item.getSelected()",
      async () => `${(await eagle.item.getSelected()).length} item(s)`,
    ],
    [
      "eagle.item.getAll()",
      async () => `${(await eagle.item.getAll()).length} item(s)`,
    ],
    [
      "eagle.item.getById(selected)",
      async () => {
        const selected = await eagle.item.getSelected();
        if (selected.length === 0) {
          return "no selected item";
        }
        const item = await eagle.item.getById(selected[0].id);
        return item.id === selected[0].id ? "found" : "mismatch";
      },
    ],
    [
      "eagle.item.getIdsWithModifiedAt()",
      async () => `${(await eagle.item.getIdsWithModifiedAt()).length} item(s)`,
    ],
    [
      "eagle.item.get({isSelected:true})",
      async () =>
        `${(await eagle.item.get({ isSelected: true })).length} item(s)`,
    ],
    [
      "eagle.item.getByIds(selected)",
      async () => {
        const selected = await eagle.item.getSelected();
        if (selected.length === 0) {
          return "no selected item";
        }
        return `${(await eagle.item.getByIds([selected[0].id])).length} item(s)`;
      },
    ],
    [
      "eagle.folder.getRecents()",
      async () => `${(await eagle.folder.getRecents()).length} folder(s)`,
    ],
    [
      "eagle.folder.getAll()",
      async () => `${(await eagle.folder.getAll()).length} folder(s)`,
    ],
    [
      "eagle.folder.getById(selected)",
      async () => {
        const selected = await eagle.folder.getSelected();
        if (selected.length === 0) {
          return "no selected folder";
        }
        const folder = await eagle.folder.getById(selected[0].id);
        return folder.id === selected[0].id ? "found" : "mismatch";
      },
    ],
    [
      "eagle.folder.get({isSelected:true})",
      async () =>
        `${(await eagle.folder.get({ isSelected: true })).length} folder(s)`,
    ],
    [
      "eagle.folder.getByIds(selected)",
      async () => {
        const selected = await eagle.folder.getSelected();
        if (selected.length === 0) {
          return "no selected folder";
        }
        return `${(await eagle.folder.getByIds([selected[0].id])).length} folder(s)`;
      },
    ],
    ["eagle.tag.get()", async () => `${(await eagle.tag.get()).length} tag(s)`],
    [
      "eagle.tag.getStarredTags()",
      async () => `${(await eagle.tag.getStarredTags()).length} tag(s)`,
    ],
    [
      "eagle.tagGroup.get()",
      async () => `${(await eagle.tagGroup.get()).length} tag group(s)`,
    ],
    [
      "Object.keys(eagle)",
      () => {
        const keys = Object.keys(eagle).sort();
        const relatedKeys = keys.filter((key) => /smart|folder/i.test(key));
        const ownKeys = Object.getOwnPropertyNames(eagle).sort();
        const hiddenKeys = ownKeys.filter((key) => !keys.includes(key));
        return [
          `keys=${keys.join(", ") || "(none)"}`,
          `smart/folder candidates=${relatedKeys.join(", ") || "(none)"}`,
          `non-enumerable keys=${hiddenKeys.join(", ") || "(none)"}`,
        ].join("\n");
      },
    ],
    [
      "Object.keys(eagle.extraModule)",
      () => {
        const runtimeEagle = eagle as unknown as Record<string, unknown>;
        const extraModule = runtimeEagle.extraModule;
        if (extraModule === null || typeof extraModule !== "object") {
          return `unavailable (${formatProbeValue(extraModule)})`;
        }
        const keys = Object.keys(extraModule).sort();
        return keys.join(", ") || "(none)";
      },
    ],
    [
      "eagle.smartFolder.getAll()",
      async () => {
        if (eagle.smartFolder === undefined) {
          return "unavailable (eagle.smartFolder is undefined)";
        }
        return `${(await eagle.smartFolder.getAll()).length} smart folder(s)`;
      },
    ],
    [
      "eagle.smartFolder.getRules()",
      async () => {
        if (eagle.smartFolder === undefined) {
          return "unavailable (eagle.smartFolder is undefined)";
        }
        const rules = await eagle.smartFolder.getRules();
        return `${Object.keys(rules).length} rule(s)`;
      },
    ],
  ];

  const probeOutput = app.querySelector<HTMLElement>(
    '[data-role="api-probes"]',
  );
  const safeProbeOutput = app.querySelector<HTMLElement>(
    '[data-role="safe-probes"]',
  );

  const formatProbeValue = (value: unknown): string => {
    if (value === undefined) {
      return "(undefined)";
    }
    if (value === null) {
      return "(null)";
    }
    if (typeof value === "string") {
      return value.length === 0 ? "(empty string)" : value;
    }
    return String(value);
  };

  function formatValue(value: unknown): string {
    if (value === undefined) {
      return "(undefined)";
    }
    if (value === null) {
      return "(null)";
    }
    return typeof value === "string" ? value : String(value);
  }

  const runProbeSet = async (
    probeSet: ReadonlyArray<readonly [string, ProbeReader]>,
    output: HTMLElement | null,
  ): Promise<void> => {
    if (output === null) {
      return;
    }

    const lines: string[] = [];
    for (const [label, read] of probeSet) {
      try {
        lines.push(`${label} = ${formatProbeValue(await read())}`);
      } catch (error) {
        lines.push(
          `${label} = Error: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
      output.textContent = lines.join("\n");
    }
  };

  const runApiProbe = async (): Promise<void> => {
    await runProbeSet(probes, probeOutput);
  };

  const runSafeSweep = async (): Promise<void> => {
    await runProbeSet(safeProbes, safeProbeOutput);
  };

  const refreshProbeButton = app.querySelector<HTMLButtonElement>(
    '[data-action="refresh-probes"]',
  );
  refreshProbeButton?.addEventListener("click", () => {
    void runApiProbe();
  });

  const safeSweepButton = app.querySelector<HTMLButtonElement>(
    '[data-action="safe-sweep"]',
  );
  safeSweepButton?.addEventListener("click", () => {
    void runSafeSweep();
  });

  void runApiProbe();
}
