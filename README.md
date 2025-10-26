### PS4 FPKG Sidebar + YouTube Preview (Tampermonkey)

Small userscript that adds a left sidebar with an embedded list of game .pkg URLs and a right YouTube gameplay preview panel. Clicking a game fills the page input and loads a gameplay video.

### Install
- Install Tampermonkey in your browser.
- Open `PS4 FPKG.js` and install it into Tampermonkey.

### Features
- Left sidebar with a searchable list of embedded .pkg URLs.
- Click a game to:
  - Fill `input#url` with the selected .pkg link (fires an input event).
  - Show a YouTube gameplay preview on the right.
- Controls in header:
  - `↻` Reload: Re-parse the default file if available; else reload embedded list.
  - `YT ↻` Clear YouTube cache: Clears cached video IDs; click a game again to re-search.
