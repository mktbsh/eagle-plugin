/// <reference types="../eagle-plugin" />
import type * as Electron from "electron";

declare const electronDisplay: Electron.Display;
declare const electronImage: Electron.NativeImage;

const _display: Eagle.Display = electronDisplay;
const _image: Eagle.NativeImage = electronImage;

const eagleRectangle: Eagle.Rectangle = {
  x: 0,
  y: 0,
  width: 100,
  height: 100,
};
const _electronRectangle: Electron.Rectangle = eagleRectangle;

const eagleOpenDialogOptions: Eagle.ShowOpenDialogOptions = {
  title: "Open image",
  filters: [{ name: "Images", extensions: ["png", "jpg"] }],
  properties: ["openFile", "multiSelections"],
};
const _electronOpenDialogOptions: Electron.OpenDialogOptions =
  eagleOpenDialogOptions;

const eagleMenuItem: Eagle.ContextMenuItem = {
  id: "edit",
  label: "Edit",
  click: () => {},
  submenu: [{ id: "crop", label: "Crop" }],
};
const _electronMenuItem: Electron.MenuItemConstructorOptions = eagleMenuItem;
