# drawio-obsidian — Mobile (iOS/iPadOS) support — WORK IN PROGRESS

Fork of `zapthedingbat/drawio-obsidian` adding iPhone/iPad support.
Branch: `mobile-support`. Fork: `llabusch93/drawio-obsidian`.
Draft PR: `zapthedingbat/drawio-obsidian#120` (addresses upstream issue #33).

## STATUS (2026-06-05): NOT WORKING YET — editor blank on iPad

Desktop is unaffected. On iPad the editor view opens but the drawio canvas stays
blank. The transport fix landed, but drawio's `app.min.js` still fails to start
on iOS and the real error is being masked. Root cause not yet identified. The
vault copy has been reverted to the original 1.5.4 desktop-only build.

## Build & deploy (everything in Docker, nothing on the host)

```
devcontainer up --workspace-folder .                      # once
devcontainer exec --workspace-folder . npm run build      # -> dist/main.js (~8 MB)
OBSIDIAN_VAULT=/Users/llabusch/Documents/SecondBrain ./scripts/deploy-to-vault.sh
```

- TS is transpiled with **sucrase**, NOT `@rollup/plugin-typescript` (the latter
  breaks under the pinned TS 4.4 on newer `@codemirror` type-only-export syntax).
- The `jgraph/drawio` submodule (pinned `4776522`) must be checked out or main.js
  cannot inline the 8 MB app. Restore it with a shallow SHA fetch over HTTPS:
  `git -C drawio init && git -C drawio remote add origin https://github.com/jgraph/drawio.git && git -C drawio fetch --depth 1 origin 4776522cd7b6a958c87babebf4ac45b6388828d2 && git -C drawio checkout FETCH_HEAD`
- On iPad, Obsidian only re-reads main.js after a FULL app quit + reopen (toggling
  the plugin is unreliable for an 8 MB file). Obsidian mobile's webview is NOT
  Safari-inspectable (App Store build) — debug via the on-screen diagnostic
  Notice, not Web Inspector.

## What is confirmed working / fixed

- **Transport: `data:` URL → `iframe.srcdoc`** (`DrawioClient.createFrameElement`).
  The original `data:text/html,` frame has a null origin in iOS WKWebView, which
  blocks `<script>` injection and the parent<->child postMessage handshake.
  srcdoc is same-origin. CONFIRMED on device: `gotIframeMsg=true, bootRan=true`.
- **`Frame.ts` cookie + localStorage stubs**: the original
  `Object.defineProperty(document,"cookie",…)` and `…"localStorage"…` were written
  for the `data:` URL's opaque origin. On same-origin srcdoc those native
  accessors are non-configurable, so the defineProperty THREW and aborted init
  before `mxLoadResources=false`/`mxscript` were set. Now wrapped in try/catch.
  CONFIRMED fixed on device: `mxLoadResources=false` is now reached.

## The open bug

On iPad the diagnostic Notice reports (build `[b6]`):

```
gotIframeMsg=true, bootRan=true, scripts=4, mxLoadResources=false,
mxClient=false, app=false, missing=none,
errs=err:Script error.@?:0 ; err:Script error.@?:0
```

Reading: srcdoc + bootstrap + init all run; all 4 scripts inject; init completes;
NO missing/cross-origin resources are requested; but drawio's `app.min.js` fails
to define `mxClient` and throws **two errors that iOS masks as opaque
"Script error." (no file/line)** via `window.onerror`.

### Ruled out
- Node/Electron deps (none exist).
- The transport (srcdoc works — handshake completes).
- cookie / localStorage defineProperty (fixed).
- Missing / cross-origin resource loads (`missing=none`).
- A synchronous top-level throw (`Frame.addScript` wraps `appendChild`; no
  `addScript:` entry was ever captured).
- A `setTimeout` / `requestAnimationFrame` callback throw (wrapped; no `async:`
  entry captured).

### Why the error is opaque
iOS WKWebView reports errors from `about:srcdoc` scripts as cross-origin-sanitized
"Script error." in `window.onerror` (message only, `error` object null, no
file/line). Only a same-origin `try/catch` in the actual failing execution
context can reveal it.

### NEXT STEPS (start here next session)
1. The `[b6]` build (currently committed) added a **`console.error` override** and
   an **`addEventListener` callback wrap** in `Frame.ts` to catch the real error
   (drawio usually `console.error`s its own failures; `App.main` may run on the
   window `load` event). It was deployed but the resulting Notice `errs=` line was
   **not yet read**. First action: rebuild/deploy `[b6]`, retest on iPad, read
   `errs=` for a `cerr:` / new entry — that should finally name the failure.
2. If still opaque, strongest hypothesis: **iOS WKWebView chokes on the ~8 MB
   inline script** (`scriptElement.text = <8MB>` in `Frame.addScript`). Try
   loading `app.min.js` via a **blob: URL `<script src>`** instead of inline text,
   and add a `blob:` passthrough to `RequestManager.resolveResourceUrl` (it
   currently rewrites unknown URLs to `https://app.diagrams.net/...`).
3. Re-verify the `mxClient` probe (it is conceivable `App` is defined while
   `mxClient` reads false — double-check the detection in `reportDiagnostics`).

## Diagnostic scaffolding to REMOVE before merge (NOT for shipping)
- `DrawioClient.ts`: `reportDiagnostics()`, the `gotIframeMsg` field, the
  `__bootRan/__bootErr` block inside the srcdoc bootstrap, the `[b6]` Notice, and
  the `Notice` import if it ends up unused.
- `Frame.ts`: the whole async-capture block (`reportAsync`, `wrapAsync`, the
  `setTimeout`/`requestAnimationFrame`/`addEventListener` wraps, the
  `console.error` override) and the try/catch reporting inside `addScript`.
  KEEP the cookie + localStorage try/catch — those are real fixes.
- `RequestManager.ts`: the `__missingRes` tracking.

## Keepers (the real change set)
- `DrawioClient.ts`: srcdoc transport (+ viewport meta / `touch-action`).
- `Frame.ts`: cookie + localStorage try/catch.
- `DiagramViewBase.ts`: mobile PNG-to-vault export.
- `DiagramPlugin.ts`: mobile ribbon icon + file-explorer optional chaining.
- `FontManager.ts`: fetch try/catch (offline/mobile safe).
- `manifest.json`: `isDesktopOnly:false`, `minAppVersion:1.0.0`, version `1.6.0`.
- `rollup.config.js` + `package.json`: sucrase build.
- `.devcontainer/`, `scripts/deploy-to-vault.sh`.
