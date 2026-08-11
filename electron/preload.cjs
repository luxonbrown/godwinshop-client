const { contextBridge } = require('electron');

// Minimal, safe desktop bridge.
// Nothing privileged (fs, shell, db) is exposed to the renderer.
contextBridge.exposeInMainWorld('godwinshopDesktop', {
  platform: process.platform,
  isDesktop: true
});