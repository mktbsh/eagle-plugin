/// <reference types="../eagle-plugin" />
import type * as Electron from "electron";

const displayLike: Eagle.DisplayLike = {
  id: 1,
  bounds: { x: 0, y: 0, width: 1920, height: 1080 },
  workArea: { x: 0, y: 0, width: 1920, height: 1040 },
  size: { width: 1920, height: 1080 },
  workAreaSize: { width: 1920, height: 1040 },
  scaleFactor: 1,
  rotation: 0,
  touchSupport: "unknown",
  accelerometerSupport: "unknown",
  colorDepth: 24,
  colorSpace: "srgb",
  depthPerComponent: 8,
  detected: true,
  displayFrequency: 60,
  internal: false,
  label: "Display 1",
  maximumCursorSize: { width: 64, height: 64 },
  monochrome: false,
  nativeOrigin: { x: 0, y: 0 },
};

const _display: Electron.Display = displayLike;
