/// <reference types="../eagle-plugin" />

async function exerciseDesktopAPI() {
  await eagle.window.show();
  await eagle.window.showInactive();
  await eagle.window.hide();
  await eagle.window.focus();
  await eagle.window.minimize();
  await eagle.window.isMinimized();
  await eagle.window.restore();
  await eagle.window.maximize();
  await eagle.window.unmaximize();
  await eagle.window.isMaximized();
  await eagle.window.setFullScreen(true);
  await eagle.window.isFullScreen();
  await eagle.window.setAspectRatio(16 / 9);
  await eagle.window.setBackgroundColor("#fff");
  await eagle.window.setSize(640, 480);
  const _size: [number, number] = await eagle.window.getSize();
  await eagle.window.setBounds({ x: 10, width: 800 });
  const _bounds: Eagle.Rectangle = await eagle.window.getBounds();
  await eagle.window.setResizable(true);
  await eagle.window.isResizable();
  await eagle.window.setAlwaysOnTop(true);
  await eagle.window.isAlwaysOnTop();
  await eagle.window.setPosition(10, 20);
  await eagle.window.getPosition();
  await eagle.window.setOpacity(0.5);
  await eagle.window.getOpacity();
  await eagle.window.flashFrame(true);
  await eagle.window.setIgnoreMouseEvents(true);
  const image = await eagle.window.capturePage({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });
  eagle.window.setReferer("https://example.com");

  const _png: Buffer = image.toPNG();
  const _jpeg: Buffer = image.toJPEG(80);
  const _bitmap: Buffer = image.toBitmap({ scaleFactor: 2 });
  const _dataURL: string = image.toDataURL();
  const _isEmpty: boolean = image.isEmpty();
  const _imageSize: Eagle.Size = image.getSize();

  const _dark: boolean = eagle.app.isDarkColors();
  const _appData: string = await eagle.app.getPath("appData");
  await eagle.app.getFileIcon("/tmp/image.png", { size: "small" });
  await eagle.app.createThumbnailFromPath("/tmp/image.png", {
    width: 200,
    height: 200,
  });
  await eagle.app.show();

  const _tmpdir: string = eagle.os.tmpdir();
  const _osVersion: string = eagle.os.version();
  const _osType: string = eagle.os.type();
  const _release: string = eagle.os.release();
  const _hostname: string = eagle.os.hostname();
  const _homedir: string = eagle.os.homedir();
  const _arch: Eagle.Architecture = eagle.os.arch();

  await eagle.screen.getCursorScreenPoint();
  await eagle.screen.getPrimaryDisplay();
  await eagle.screen.getAllDisplays();
  await eagle.screen.getDisplayNearestPoint({ x: 10, y: 20 });

  await eagle.notification.show({
    title: "Done",
    body: "Export completed",
    duration: 3000,
  });
  eagle.contextMenu.open([
    {
      id: "export",
      label: "Export",
      click: () => {},
      submenu: [{ id: "png", label: "PNG" }],
    },
  ]);

  const openResult = await eagle.dialog.showOpenDialog({
    title: "Open",
    properties: ["openFile", "multiSelections"],
  });
  const _filePaths: string[] = openResult.filePaths;
  const saveResult = await eagle.dialog.showSaveDialog({
    title: "Save",
    properties: ["showHiddenFiles"],
  });
  const _filePath: string | undefined = saveResult.filePath;
  const messageResult = await eagle.dialog.showMessageBox({
    message: "Continue?",
    type: "question",
    buttons: ["Yes", "No"],
  });
  const _response: number = messageResult.response;
  await eagle.dialog.showErrorBox("Error", "Something failed");

  eagle.clipboard.clear();
  eagle.clipboard.has("text/plain");
  eagle.clipboard.writeText("text");
  eagle.clipboard.readText();
  const buffer = Buffer.from("data");
  eagle.clipboard.writeBuffer("application/octet-stream", buffer);
  eagle.clipboard.readBuffer("application/octet-stream");
  eagle.clipboard.writeImage(image);
  eagle.clipboard.readImage();
  eagle.clipboard.writeHTML("<b>text</b>");
  eagle.clipboard.readHTML();
  eagle.clipboard.copyFiles(["/tmp/image.png"]);

  await eagle.drag.startDrag(["/tmp/image.png"]);
  await eagle.shell.beep();
  await eagle.shell.openExternal("https://example.com");
  await eagle.shell.openPath("/tmp/image.png");
  await eagle.shell.showItemInFolder("/tmp/image.png");

  eagle.log.debug("debug");
  eagle.log.info(["info"]);
  eagle.log.warn({ warning: true });
  eagle.log.error(new Error("failed"));
}

void exerciseDesktopAPI;
