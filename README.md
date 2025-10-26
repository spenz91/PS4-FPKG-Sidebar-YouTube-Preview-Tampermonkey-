### PS4 FPKG Sidebar + YouTube Preview (Tampermonkey)

Small userscript that adds a left sidebar with an embedded list of game .pkg URLs and a right YouTube gameplay preview panel. Clicking a game fills the page input and loads a gameplay video.

### Install
- Install Tampermonkey in your browser.
- Open `PS4 FPKG.js` and install it into Tampermonkey.

### Auto‑activation
- The script runs on all pages but activates only if the page contains this exact input element:
  - `input#url[name="url"][type="text"][placeholder="http://xxx.xxx.xx.xx/game.pkg"]`
- If it doesn’t exist, the script exits without injecting anything.

### Features
- Left sidebar with a searchable list of embedded .pkg URLs.
- Click a game to:
  - Fill `input#url` with the selected .pkg link (fires an input event).
  - Show a YouTube gameplay preview on the right.
- Controls in header:
  - `↻` Reload: Re-parse the default file if available; else reload embedded list.
  - `YT ↻` Clear YouTube cache: Clears cached video IDs; click a game again to re-search.

### Embedded list
- The URL list is embedded directly in the script (`EMBEDDED_TXT`).
- To update it, edit `EMBEDDED_TXT` inside `PS4 FPKG.js` and save.

### Notes
- YouTube results are fetched from the public results page (no API key). If a video fails to load, your browser/site CSP may block embeds.

### Troubleshooting
- Sidebar doesn’t appear:
  - Confirm the page has the exact input (id, name, type, and placeholder must match).
  - Ensure Tampermonkey is enabled and the script is active.
- Video doesn’t show:
  - Click `YT ↻` then click the game again.
  - Some pages may block YouTube iframes; try another browser.


