import { GlobalWindow } from "happy-dom";

const win = new GlobalWindow();
globalThis.window = win;
globalThis.document = win.document;
globalThis.DOMParser = win.DOMParser;
