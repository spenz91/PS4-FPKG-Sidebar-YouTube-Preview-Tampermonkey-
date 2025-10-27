### PS4 FPKG Sidebar + YouTube Preview (Tampermonkey)

Small userscript that adds a left sidebar with an embedded list of game .pkg URLs and a right YouTube gameplay preview panel. Clicking a game fills the page input and loads a gameplay video.

### Install
- Install Tampermonkey in your browser.
- Open `PS4 FPKG.js` and install it into Tampermonkey.

### Enable DPIv2 on PS5 (etaHEN)
1. On PS5, open Settings → etaHEN Toolbox → Services.
2. Turn on Direct Package Installer V2 (DPIv2). You should see DPIv2 listed in Services.
3. Find your PS5 IP in Network settings.
4. On a PC on the same LAN, open `http://PS5_IP:12800` (example: `http://192.168.1.50:12800`). This is the DPIv2 WebGUI.

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



