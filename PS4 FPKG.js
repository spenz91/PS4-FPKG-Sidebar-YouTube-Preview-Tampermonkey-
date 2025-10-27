// ==UserScript==
// @name         PS4 FPKG Sidebar + YouTube Preview
// @namespace    local.safe.sidebar
// @version      0.5.0
// @description  Left sidebar: load URLs from a local .txt, search. Click plays YouTube gameplay on right and fills input#url (no auto-submit).
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      www.youtube.com
// ==/UserScript==

(function () {
	'use strict';

	// Update: wider list and default path to your folder
	const SIDEBAR_WIDTH = 520; // was 340
	const DEFAULT_FILE = 'file:///C:/Users/Thomas/Downloads/PS4%20FPKG/ps4_fpkg_english_links.txt';
	const CONCURRENCY = 0;

	// Embedded URL list (parsed at runtime; non-.pkg lines are ignored)
	const EMBEDDED_TXT = `
https://archive.org/download/ps4-fpkg-collection-english-a/A%20Hat%20in%20Time%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/A%20Monster%27s%20Expedition%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/A%20Plague%20Tale%20Innocence%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.09%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/A%20Short%20Hike%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/A%20Way%20Out%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/Absolute%20Drift%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/ABZU%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/Ace%20Attorney%20Investigations%20Collection%20-%20%5BJP%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/ACE%20COMBAT%207%20SKIES%20UNKNOWN%20-%20%5BEU%5D%20%5BEN%5D%20%5B2.20%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/ADR1FT%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/Alan%20Wake%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/Alien%20Isolation%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/Amnesia%20Collection%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/Amnesia%20Rebirth%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.30%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/Amnesia%20The%20Bunker%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.81%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/Amplitude%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/Ancestors%20Legacy%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/Ancestors%20The%20Humankind%20Odyssey%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/Another%20World%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/ARK%20Survival%20Evolved%20-%20%5BEU%5D%20%5BEN%5D%20%5B2.98%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/ARMORED%20CORE%20VI%20FIRES%20OF%20RUBICON%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.08%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/Ashen%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/Assassin%27s%20Creed%20Chronicles%20Trilogy%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/Assassin%27s%20Creed%20III%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/Assassin%27s%20Creed%20IV%20Black%20Flag%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/Assassin%27s%20Creed%20Mirage%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/Assassin%27s%20Creed%20Odyssey%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.56%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/Assassin%27s%20Creed%20Origins%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.44%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/Assassin%27s%20Creed%20Rogue%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/Assassin%27s%20Creed%20Syndicate%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.52%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/Assassin%27s%20Creed%20The%20Ezio%20Collection%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/Assassin%27s%20Creed%20Unity%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/Assassin%27s%20Creed%20Valhalla%20-%20%5BEU%5D%20%5BEN%5D%20%5B8.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/Assetto%20Corsa%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.20%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/Assetto%20Corsa%20Competizione%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.12%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/ASTRONEER%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.64%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/Atari%20Flashback%20Classics%20vol.1%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/Atari%20Flashback%20Classics%20vol.2%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/Atari%20Flashback%20Classics%20vol.3%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/Atomfall%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.06%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/Atomic%20Heart%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.29%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/Attack%20on%20Titan%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/Attack%20On%20Titan%202%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.11%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/AVICII%20Invector%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/Axiom%20Verge%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/Axiom%20Verge%202%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Back%20to%20Bed%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Backbone%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Bad%20North%20-%20%5BEU%5D%20%5BEN%5D%20%5B2.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/BALAN%20WONDERWORLD%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Balatro%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.14%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Baldur%27s%20Gate%20and%20Baldur%27s%20Gate%20II%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Baldur%27s%20Gate%20Dark%20Alliance%20II%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Batman%20Arkham%20Asylum%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Batman%20Arkham%20City%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/BATMAN%20ARKHAM%20KNIGHT%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.18%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Battlefield%201%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.27%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Battlefield%204%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.24%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Battlefield%20Hardline%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.09%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Battlefield%20V%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.38%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/BATTLESHIP%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Bayonetta%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Beat%20Cop%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/BELOW%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Bendy%20and%20the%20Dark%20Revival%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Bendy%20and%20the%20Ink%20Machine%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Beyond%20Two%20Souls%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Biomutant%20-%20%5BEU%5D%20%5BEN%5D%20%5B2.09%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Bioshock%20Infinite%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/BioShock%20The%20Collection%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Black%20Skylands%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.06%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Blair%20Witch%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Blasphemous%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.08%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Blasphemous%202%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Bloodborne%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.09%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Bonfire%20Peaks%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.23%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Borderlands%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Borderlands%202%20%2B%20The%20Pre-Sequel%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.10%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Borderlands%203%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.30%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Bound%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Braid%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.08%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Bramble%20The%20Mountain%20King%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Brawlhalla%20-%20%5BEU%5D%20%5BEN%5D%20%5B10.50%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Broforce%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Brotato%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Bugsnax%20-%20%5BUS%5D%20%5BEN%5D%20%5B2.08%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Bulletstorm%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Burnout%20Paradise%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/Bus%20Simulator%2021%20-%20%5BEU%5D%20%5BEN%5D%20%5B2.28%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-b/BUTCHER%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Call%20of%20Cthulhu%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Call%20of%20Duty%20Advanced%20Warfare%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.24%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Call%20of%20Duty%20Black%20Ops%204%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.26%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Call%20of%20Duty%20Black%20Ops%206%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.58%5D%20%5BCP%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Call%20of%20Duty%20Black%20Ops%20Cold%20War%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.41%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Call%20of%20Duty%20Black%20Ops%20III%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.33%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Call%20of%20Duty%20Ghosts%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.21%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Call%20of%20Duty%20Infinite%20Warfare%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.25%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Call%20of%20Duty%20Modern%20Warfare%20%282007%29%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Call%20of%20Duty%20Modern%20Warfare%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.67%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Call%20of%20Duty%20Modern%20Warfare%202%20%282009%29%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Call%20of%20Duty%20Modern%20Warfare%20II%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.08%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Call%20of%20Duty%20Modern%20Warfare%20III%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.33%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Call%20of%20Duty%20Vanguard%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.26%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Call%20of%20Duty%20WWII%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.25%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Call%20Of%20The%20Sea%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Carrion%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Carto%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Catherine%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Celeste%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Chained%20Echoes%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.13%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Chernobylite%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.12%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Chess%20Ultra%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Chicken%20Police%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Child%20of%20Light%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Chimparty%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Cities%20Skylines%20-%20%5BUS%5D%20%5BEN%5D%20%5B16.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Citizen%20Sleeper%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Cocoon%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/CODE%20VEIN%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.53%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Coffee%20Talk%20Episode%202%20Hibiscus%20%26%20Butterfly%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/CoffeeTalk%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Conan%20Exiles%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.80%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Concrete%20Genie%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Control%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.12%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Cook%2C%20Serve%2C%20Delicious%21%203%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Crash%20Bandicoot%204%20It%27s%20About%20Time%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Crash%20Bandicoot%20N.%20Sane%20Trilogy%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Crash%20Team%20Racing%20Nitro-Fueled%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.21%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Creature%20in%20the%20Well%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Cricket%2024%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.30%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/CRISIS%20CORE%20FINAL%20FANTASY%20VII%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Crossing%20Souls%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Crow%20Country%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Crypt%20of%20the%20Necrodancer%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Crysis%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Crysis%202%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Crysis%203%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Cult%20of%20the%20Lamb%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.29%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Cuphead%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-c/Cyberpunk%202077%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.31%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Dandara%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.17%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Dangerous%20Golf%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/DARK%20SOULS%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/DARK%20SOULS%20II%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/DARK%20SOULS%20III%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Darksiders%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Darksiders%20Genesis%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Darksiders%20II%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Darksiders%20III%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.11%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Darkwood%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.06%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/DAVE%20THE%20DIVER%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.23%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Day%20of%20the%20Tentacle%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/DAYS%20GONE%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.81%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Dead%20Cells%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.51%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Dead%20Island%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Dead%20Island%202%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.10%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Dead%20Island%20Riptide%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Dead%20Nation%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/DEAD%20RISING%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Dead%20Rising%202%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Dead%20Rising%202%20Off%20The%20Record%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Dead%20Rising%204%20Frank%27s%20Big%20Package%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Deadlight%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Deadpool%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/DEATH%20STRANDING%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.12%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Death%27s%20Door%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Deep%20Rock%20Galactic%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.43%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Despot%27s%20Game%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Destroy%20All%20Humans%21%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.08%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Destroy%20All%20Humans%21%202%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Detroit%20Become%20Human%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.08%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Deus%20Ex%20Mankind%20Divided%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.14%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Devil%20May%20Cry%204%20-%20%5BJP%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Devil%20May%20Cry%205%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.10%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Devil%20May%20Cry%20Trilogy%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Diablo%20II%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.23%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Diablo%20III%20Reaper%20of%20Souls%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.46%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/DIRT%205%20-%20%5BUS%5D%20%5BEN%5D%20%5B6.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/DiRT%20Rally%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/DiRT%20Rally%202.0%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.29%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Disc%20Jam%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.20%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Disco%20Elysium%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.19%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Dishonored%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Dishonored%202%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.06%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Dishonored%20Death%20of%20the%20Outsider%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Disney%20Epic%20Mickey%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Divinity%20Original%20Sin%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.08%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Divinity%20Original%20Sin%202%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.15%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/DmC%20Devil%20May%20Cry%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Doki%20Doki%20Literature%20Club%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.06%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Don%27t%20Starve%20Together%20-%20%5BUS%5D%20%5BEN%5D%20%5B3.15%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/DOOM%20%281993%29%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.09%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/DOOM%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.12%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/DOOM%202%20%281994%29%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.08%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Doom%203%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/DOOM%20Eternal%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.26%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Downwell%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Dragon%20Age%20Inquisition%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.12%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/DRAGON%20BALL%20FighterZ%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.38%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/DRAGON%20BALL%20XENOVERSE%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/DRAGON%20BALL%20XENOVERSE%202%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.45%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/DRAGON%20BALL%20Z%20KAKAROT%20-%20%5BEU%5D%20%5BEN%5D%20%5B2.11%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/DRAGON%20QUEST%20BUILDERS%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/DRAGON%20QUEST%20BUILDERS%202%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/DRAGON%20QUEST%20HEROES%20II%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.06%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/DRAGON%20QUEST%20HEROES%20The%20World%20Tree%27s%20Woe%20and%20the%20Blight%20Below%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/DRAGON%20QUEST%20XI%20Echoes%20of%20an%20Elusive%20Age%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/DRAGON%20QUEST%20XI%20S%20Echoes%20of%20an%20Elusive%20Age%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Dragon%27s%20Dogma%20Dark%20Arisen%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Dreams%20-%20%5BEU%5D%20%5BEN%5D%20%5B2.64%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/DREDGE%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.08%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/DRIVECLUB%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.28%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Dying%20Light%202%20Stay%20Human%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.56%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-d/Dying%20Light%20The%20Following%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.31%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-e/EA%20SPORTS%20FC%2024%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.22%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-e/EA%20SPORTS%20UFC%204%20-%20%5BUS%5D%20%5BEN%5D%20%5B28.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-e/eFootball%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.31%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-e/El%20Hijo%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-e/ELDEN%20RING%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.21%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-e/ELDEN%20RING%20NIGHTREIGN%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.10%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-e/Eldest%20Souls%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-e/Electrician%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-e/Enter%20the%20Gungeon%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.16%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-e/Everybody%27s%20Gone%20To%20The%20Rapture%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-e/Evil%20West%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.06%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-e/Exit%20the%20Gungeon%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-e/Expeditions%20A%20Mudrunner%20Game%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.06%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/F.I.S.T.%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.22%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/F1%2024%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.18%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/Fallout%204%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.37%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/FAR%20Changing%20Tides%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/Far%20Cry%203%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/Far%20Cry%203%20Blood%20Dragon%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/Far%20Cry%204%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/Far%20Cry%205%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.19%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/Far%20Cry%206%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.12%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/Far%20Cry%20New%20Dawn%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.06%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/Far%20Cry%20Primal%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/FAR%20Lone%20Sails%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/Farming%20Simulator%2022%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.30%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/Fear%20The%20Spotlight%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/FEZ%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/Fight%27N%20Rage%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.06%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/FINAL%20FANTASY%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/FINAL%20FANTASY%20II%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/FINAL%20FANTASY%20III%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/FINAL%20FANTASY%20IV%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/FINAL%20FANTASY%20IX%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/FINAL%20FANTASY%20V%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/FINAL%20FANTASY%20VI%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/FINAL%20FANTASY%20VII%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/FINAL%20FANTASY%20VII%20REMAKE%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/FINAL%20FANTASY%20VIII%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/FINAL%20FANTASY%20X%20X-2%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/FINAL%20FANTASY%20XII%20THE%20ZODIAC%20AGE%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.08%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/FINAL%20FANTASY%20XV%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.29%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/Firewatch%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.08%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/Fist%20of%20the%20North%20Star%20Lost%20Paradise%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.09%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/Five%20Nights%20at%20Freddy%27s%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/Five%20Nights%20at%20Freddy%27s%202%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/Five%20Nights%20at%20Freddy%27s%203%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/Five%20Nights%20at%20Freddy%27s%204%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/Five%20Nights%20at%20Freddy%27s%20Into%20the%20Pit%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/Five%20Nights%20at%20Freddy%27s%20Sister%20Location%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/FlatOut%204%20Total%20Insanity%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/Floor%20Kids%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/flOw%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/Flower%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/For%20The%20King%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/Frantics%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/Frostpunk%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-f/Furi%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-g/Gang%20Beasts%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.18%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-g/Ghost%20of%20Tsushima%20-%20%5BUS%5D%20%5BEN%5D%20%5B2.18%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-g/Ghostbusters%20Spirits%20Unleashed%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.23%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-g/Ghostbusters%20The%20Video%20Game%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.06%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-g/Ghostrunner%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.14%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-g/Goat%20Simulator%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-g/God%20of%20War%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.35%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-g/God%20of%20War%20III%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-g/God%20of%20War%20Ragnar%C3%B6k%20-%20%5BUS%5D%20%5BEN%5D%20%5B6.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-g/Going%20Under%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-g/Golf%20Club%20Wasteland%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-g/Gone%20Home%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-g/GoNNER%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-g/GONNER2%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-g/Gran%20Turismo%207%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.55%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-g/Gran%20Turismo%207%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.34%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-g/Gran%20Turismo%20SPORT%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.69%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-g/Grand%20Theft%20Auto%20V%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.27%5D%20%5BSP%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-g/Grand%20Theft%20Auto%20V%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.52%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-g/Gravity%20Rush%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-g/GRAVITY%20RUSH%202%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.11%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-g/GRID%20Legends%20-%20%5BUS%5D%20%5BEN%5D%20%5B6.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-g/Grim%20Fandango%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-g/GRIS%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-g/Grounded%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.14%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-g/Grow%20Home%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-g/Guacamelee%21%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-g/Guacamelee%21%202%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-g/Guilty%20Gear%20-Strive-%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.45%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-h/Hades%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-h/Heavenly%20Bodies%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.14%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-h/HEAVY%20RAIN%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-h/Hellblade%20Senua%27s%20Sacrifice%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-h/Helldivers%20-%20%5BEU%5D%20%5BEN%5D%20%5B7.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-h/Hello%20Neighbor%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-h/Hello%20Neighbor%202%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.06%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-h/Hello%20Neighbor%20Hide%20And%20Seek%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-h/High%20on%20Life%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.11%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-h/HITMAN%203%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.13%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-h/Hitman%20Absolution%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-h/Hitman%20Blood%20Money%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-h/Hitman%20GO%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-h/Hogwarts%20Legacy%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-h/Hollow%20Knight%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-h/Hollow%20Knight%20Silksong%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-h/Horizon%20Forbidden%20West%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.18%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-h/Horizon%20Zero%20Dawn%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.54%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-h/HOT%20WHEELS%20UNLEASHED%202%20-%20Turbocharged%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.17%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-h/Hotline%20Miami%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-h/Hotline%20Miami%202%20Wrong%20Number%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-h/Human%20Fall%20Flat%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.20%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-h/HUMANITY%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.08%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-h/Hyper%20Light%20Drifter%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-i/I%20am%20Bread%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-i/inFAMOUS%20First%20Light%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-i/inFAMOUS%20Second%20Son%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-i/Injustice%202%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-i/Inscryption%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-i/INSIDE%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-i/Inside%20My%20Radio%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-i/It%20Takes%20Two%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-j/Jetpack%20Joyride%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-j/John%20Wick%20Hex%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-j/JoJo%27s%20Bizarre%20Adventure%20All-Star%20Battle%20R%20-%20%5BEU%5D%20%5BEN%5D%20%5B2.33%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-j/JoJo%27s%20Bizarre%20Adventure%20Eyes%20of%20Heaven%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-j/Journey%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-j/Journey%20To%20The%20Savage%20Planet%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.08%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-j/Judgment%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.09%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-j/JUMP%20FORCE%20-%20%5BEU%5D%20%5BEN%5D%20%5B3.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-j/Jump%20King%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-j/Jurassic%20World%20Evolution%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.34%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-j/Jurassic%20World%20Evolution%202%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.33%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-j/Just%20Cause%203%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-j/Just%20Cause%204%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.31%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-j/Just%20Deal%20With%20It%21%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-j/Just%20Die%20Already%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-j/Just%20Shapes%20%26%20Beats%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.13%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-j/JUST%20SING%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-k/Keep%20Talking%20and%20Nobody%20Explodes%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-k/Kena%20Bridge%20of%20Spirits%20-%20%5BEU%5D%20%5BEN%5D%20%5B2.08%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-k/Kentucky%20Route%20Zero%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-k/Kerbal%20Space%20Program%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-k/KeyWe%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-k/Killing%20Floor%202%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.76%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-k/KILLZONE%20SHADOW%20FALL%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.81%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-k/Kingdom%20Come%20Deliverance%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-k/KINGDOM%20HEARTS%201.5%20%2B%202.5%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-k/Kingdom%20Hearts%202.8%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-k/KINGDOM%20HEARTS%20III%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.10%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-k/KINGDOM%20HEARTS%20Melody%20of%20Memory%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-k/KNACK%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.10%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-k/KNACK%202%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-k/Knowledge%20is%20Power%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-k/Knowledge%20is%20Power%20Decades%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/L.A.%20Noire%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Lara%20Croft%20and%20the%20Temple%20of%20Osiris%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Lara%20Croft%20GO%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Laser%20League%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Layers%20of%20Fear%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Layers%20of%20Fear%202%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/LEGO%20Batman%203%20Beyond%20Gotham%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/LEGO%20CITY%20UNDERCOVER%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/LEGO%20DC%20Super-Villains%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.08%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/LEGO%20Harry%20Potter%20Collection%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/LEGO%20Jurassic%20World%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/LEGO%20MARVEL%20Super%20Heroes%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/LEGO%20MARVEL%20Super%20Heroes%202%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.06%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/LEGO%20MARVEL%27s%20Avengers%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.06%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/LEGO%20STAR%20WARS%20The%20Force%20Awakens%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/LEGO%20Star%20Wars%20The%20Skywalker%20Saga%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.10%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/LEGO%20The%20Hobbit%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/LEGO%20The%20Incredibles%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/LEGO%20Worlds%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.18%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Let%27s%20Sing%2010%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Let%27s%20Sing%2011%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Let%27s%20Sing%2012%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Let%27s%20Sing%2013%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Let%27s%20Sing%202016%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Let%27s%20Sing%202017%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Let%27s%20Sing%202018%20%28Germany%29%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Let%27s%20Sing%202019%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Let%27s%20Sing%202020%20%28France%29%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Let%27s%20Sing%202020%20%28Germany%29%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Let%27s%20Sing%202020%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Let%27s%20Sing%202021%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Let%27s%20Sing%202022%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Let%27s%20Sing%208%20%28Spain%29%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Let%27s%20Sing%209%20%28Spain%29%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Let%27s%20Sing%20Abba%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Let%27s%20Sing%20Country%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Let%27s%20Sing%20Queen%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Lies%20of%20P%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.08%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Life%20Is%20Strange%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Life%20is%20Strange%202%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.17%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Life%20is%20Strange%20Before%20the%20Storm%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Life%20is%20Strange%20True%20Colors%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Like%20A%20Dragon%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.10%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Like%20a%20Dragon%20Infinite%20Wealth%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.16%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Like%20a%20Dragon%20Ishin%21%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Like%20a%20Dragon%20Pirates%20in%20Hawaii%20-%20%5BJP%5D%20%5BEN%5D%20%5B1.10%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Like%20a%20Dragon%20The%20Man%20Who%20Erased%20His%20Name%20-%20%5BJP%5D%20%5BEN%5D%20%5B1.10%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/LIMBO%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Little%20Big%20Adventure%20-%20Twinsen%27s%20Quest%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Little%20Nightmares%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Little%20Nightmares%20II%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Little%20Nightmares%20III%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/LittleBigPlanet%203%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.28%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/LocoRoco%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/LocoRoco%202%20-%20%5BAS%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Lonely%20Mountains%20Downhill%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.30%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Lost%20Judgment%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.11%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-l/Lovers%20in%20a%20Dangerous%20Spacetime%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Mad%20Max%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.06%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Madden%20NFL%2024%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.14%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Mafia%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Mafia%20II%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Mafia%20III%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.12%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Maneater%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.13%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Mantis%20Burn%20Racing%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Marvel%20Ultimate%20Alliance%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Marvel%20Ultimate%20Alliance%202%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/MARVEL%20vs.%20CAPCOM%20Fighting%20Collection%20-%20%5BJP%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/MARVEL%20VS.%20CAPCOM%20INFINITE%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Marvel%27s%20Avengers%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.79%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Marvel%27s%20Guardians%20of%20the%20Galaxy%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Marvel%27s%20Guardians%20of%20the%20Galaxy%20The%20Telltale%20Series%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Marvel%27s%20Midnight%20Suns%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Marvel%27s%20Spider-Man%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.19%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Marvel%27s%20Spider-Man%20Miles%20Morales%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.09%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Mass%20Effect%20Andromeda%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.10%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Mass%20Effect%20Trilogy%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/MediEvil%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Mega%20Man%2011%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Melbits%20World%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/METAL%20GEAR%20SOLID%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/METAL%20GEAR%20SOLID%202%20Sons%20of%20Liberty%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.40%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/METAL%20GEAR%20SOLID%203%20Snake%20Eater%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.40%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/METAL%20GEAR%20SOLID%20V%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.11%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Metal%20Slug%20Tactics%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Metaphor%20ReFantazio%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.09%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Metro%20Exodus%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.08%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Metro%20Redux%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Micro%20Machines%20World%20Series%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Middle-earth%20Shadow%20of%20Mordor%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Middle-earth%20Shadow%20of%20War%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.18%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Minecraft%20-%20%5BEU%5D%20%5BEN%5D%20%5B3.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Minit%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Mirror%27s%20Edge%20Catalyst%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/MLB%20The%20Show%2020%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.08%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Monopoly%20Madness%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.06%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Monster%20Boy%20and%20the%20Cursed%20Kingdom%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Monster%20Energy%20Supercross%206%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.08%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Monster%20Hunter%20Rise%20-%20%5BEU%5D%20%5BEN%5D%20%5B16.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Monster%20Hunter%20World%20Iceborne%20-%20%5BEU%5D%20%5BEN%5D%20%5B15.21%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Monster%20Jam%20Showdown%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.11%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Monster%20Jam%20Steel%20Titans%202%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Mortal%20Kombat%2011%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.30%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Mortal%20Kombat%20X%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Mortal%20Shell%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.12%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/MotoGP%2024%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.11%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Moving%20Out%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Moving%20Out%202%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/MudRunner%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.10%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Mutant%20Year%20Zero%20Road%20to%20Eden%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.14%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/Mutazione%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.83%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/MX%20vs%20ATV%20Legends%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.09%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/My%20Friend%20Pedro%20-%20Blood%20Bullets%20Bananas%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/My%20Name%20is%20Mayo%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-m/My%20Name%20is%20Mayo%202%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/NARUTO%20SHIPPUDEN%20Ultimate%20Ninja%20STORM%204%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.11%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/NARUTO%20SHIPPUDEN%20Ultimate%20Ninja%20STORM%204%20ROAD%20TO%20BORUTO%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/NARUTO%20SHIPPUDEN%20Ultimate%20Ninja%20STORM%20TRILOGY%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/NARUTO%20X%20BORUTO%20Ultimate%20Ninja%20STORM%20CONNECTIONS%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.50%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/NBA%202K%20Playgrounds%202%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.20%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/NBA%202K14%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/NBA%202K24%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/Necromunda%20Hired%20Gun%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.09%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/Necromunda%20Underhive%20Wars%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.10%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/Need%20for%20Speed%20Heat%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/Need%20for%20Speed%20Payback%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.10%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/Need%20for%20Speed%20Rivals%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/Neon%20Drive%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/Neon%20White%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/Neva%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.30%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/New%20Tales%20from%20the%20Borderlands%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/Nex%20Machina%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.06%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/NHL%2024%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.60%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/Ni%20no%20Kuni%20II%20Revenant%20Kingdom%20-%20%5BEU%5D%20%5BEN%5D%20%5B4.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/Ni%20no%20Kuni%20Wrath%20of%20the%20White%20Witch%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/Nidhogg%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/Nidhogg%202%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/NieR%20Automata%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.06%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/NieR%20Replicant%20ver.1.22474487139...%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/Night%20in%20the%20Woods%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/Night%20Slashers%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/Nine%20Sols%20-%20%5BJP%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/NINJA%20GAIDEN%203%20Razor%27s%20Edge%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/NINJA%20GAIDEN%20%CE%A3%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/NINJA%20GAIDEN%20%CE%A32%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/Nioh%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.23%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/Nioh%202%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.27%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/No%20Man%27s%20Sky%20-%20%5BUS%5D%20%5BEN%5D%20%5B6.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/No%20More%20Heroes%203%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/Nobody%20Saves%20the%20World%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/NOT%20A%20HERO%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/Nour%20Play%20With%20Your%20Food%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/Nova-111%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/NOW%20That%27s%20What%20I%20Call%20Sing%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-n/Nuclear%20Throne%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-o/Observer%20System%20Redux%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-o/Octodad%20Dadliest%20Catch%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-o/Oddworld%20New%20%27n%27%20Tasty%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-o/Oddworld%20Soulstorm%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.20%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-o/Oddworld%20Stranger%27s%20Wrath%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-o/Old%20Man%27s%20Journey%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-o/OlliOlli%201%2B2%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-o/OlliOlli%20World%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-o/OMORI%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-o/ONE%20PIECE%20ODYSSEY%20-%20%5BEU%5D%20%5BEN%5D%20%5B2.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-o/ONE%20PIECE%20PIRATE%20WARRIORS%203%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-o/ONE%20PIECE%20PIRATE%20WARRIORS%204%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.80%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-o/ONE%20PIECE%20WORLD%20SEEKER%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-o/ONRUSH%20-%20%5BEU%5D%20%5BEN%5D%20%5B5.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-o/Orcs%20Must%20Die%21%203%20-%20%5BEU%5D%20%5BEN%5D%20%5B2.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-o/Outer%20Wilds%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.15%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-o/Outlast%20%26%20Outlast%20Whistleblower%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-o/Outlast%202%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-o/Overcooked%21%20All%20You%20Can%20Eat%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-o/Owlboy%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-o/Oxenfree%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-o/OXENFREE%20II%20Lost%20Signals%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.06%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-p/P.T.%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-p/PAC-MAN%20Championship%20Edition%202%20%2B%20Arcade%20Game%20Series%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-p/PaRappa%20The%20Rapper%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-p/Patapon%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-p/Patapon%202%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-p/Persona%203%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.08%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-p/Persona%203%20Dancing%20in%20Moonlight%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-p/Persona%204%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-p/Persona%204%20Arena%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-p/Persona%204%20Dancing%20All%20Night%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-p/Persona%205%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-p/Persona%205%20Dancing%20in%20Starlight%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-p/Persona%205%20Strikers%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-p/Persona%205%20Tactica%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-p/PES%202025%20%28Season%20Update%29%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.08%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-p/PGA%20TOUR%202K23%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.19%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-p/Pinball%20Arcade%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.33%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-p/Pinball%20FX3%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.19%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-p/Planet%20Coaster%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.19%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-p/Planet%20of%20Lana%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-p/Ponpu%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-p/Potion%20Craft%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-p/Prey%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.12%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-p/Prince%20Of%20Persia%20The%20Lost%20Crown%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.42%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-p/Prison%20Architect%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.22%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-p/Prodeus%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.06%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-p/PROTOTYPE%201%2B2%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-a/ps4-fpkg-collection-english-a_files.xml
https://archive.org/download/ps4-fpkg-collection-english-a/ps4-fpkg-collection-english-a_meta.sqlite
https://archive.org/download/ps4-fpkg-collection-english-a/ps4-fpkg-collection-english-a_meta.xml
https://archive.org/download/ps4-fpkg-collection-english-b/ps4-fpkg-collection-english-b_archive.torrent
https://archive.org/download/ps4-fpkg-collection-english-b/ps4-fpkg-collection-english-b_files.xml
https://archive.org/download/ps4-fpkg-collection-english-b/ps4-fpkg-collection-english-b_meta.sqlite
https://archive.org/download/ps4-fpkg-collection-english-b/ps4-fpkg-collection-english-b_meta.xml
https://archive.org/download/ps4-fpkg-collection-english-c/ps4-fpkg-collection-english-c_files.xml
https://archive.org/download/ps4-fpkg-collection-english-c/ps4-fpkg-collection-english-c_meta.sqlite
https://archive.org/download/ps4-fpkg-collection-english-c/ps4-fpkg-collection-english-c_meta.xml
https://archive.org/download/ps4-fpkg-collection-english-d/ps4-fpkg-collection-english-d_archive.torrent
https://archive.org/download/ps4-fpkg-collection-english-d/ps4-fpkg-collection-english-d_files.xml
https://archive.org/download/ps4-fpkg-collection-english-d/ps4-fpkg-collection-english-d_meta.sqlite
https://archive.org/download/ps4-fpkg-collection-english-d/ps4-fpkg-collection-english-d_meta.xml
https://archive.org/download/ps4-fpkg-collection-english-e/ps4-fpkg-collection-english-e_archive.torrent
https://archive.org/download/ps4-fpkg-collection-english-e/ps4-fpkg-collection-english-e_files.xml
https://archive.org/download/ps4-fpkg-collection-english-e/ps4-fpkg-collection-english-e_meta.sqlite
https://archive.org/download/ps4-fpkg-collection-english-e/ps4-fpkg-collection-english-e_meta.xml
https://archive.org/download/ps4-fpkg-collection-english-f/ps4-fpkg-collection-english-f_archive.torrent
https://archive.org/download/ps4-fpkg-collection-english-f/ps4-fpkg-collection-english-f_files.xml
https://archive.org/download/ps4-fpkg-collection-english-f/ps4-fpkg-collection-english-f_meta.sqlite
https://archive.org/download/ps4-fpkg-collection-english-f/ps4-fpkg-collection-english-f_meta.xml
https://archive.org/download/ps4-fpkg-collection-english-g/ps4-fpkg-collection-english-g_archive.torrent
https://archive.org/download/ps4-fpkg-collection-english-g/ps4-fpkg-collection-english-g_files.xml
https://archive.org/download/ps4-fpkg-collection-english-g/ps4-fpkg-collection-english-g_meta.sqlite
https://archive.org/download/ps4-fpkg-collection-english-g/ps4-fpkg-collection-english-g_meta.xml
https://archive.org/download/ps4-fpkg-collection-english-h/ps4-fpkg-collection-english-h_archive.torrent
https://archive.org/download/ps4-fpkg-collection-english-h/ps4-fpkg-collection-english-h_files.xml
https://archive.org/download/ps4-fpkg-collection-english-h/ps4-fpkg-collection-english-h_meta.sqlite
https://archive.org/download/ps4-fpkg-collection-english-h/ps4-fpkg-collection-english-h_meta.xml
https://archive.org/download/ps4-fpkg-collection-english-i/ps4-fpkg-collection-english-i_archive.torrent
https://archive.org/download/ps4-fpkg-collection-english-i/ps4-fpkg-collection-english-i_files.xml
https://archive.org/download/ps4-fpkg-collection-english-i/ps4-fpkg-collection-english-i_meta.sqlite
https://archive.org/download/ps4-fpkg-collection-english-i/ps4-fpkg-collection-english-i_meta.xml
https://archive.org/download/ps4-fpkg-collection-english-j/ps4-fpkg-collection-english-j_archive.torrent
https://archive.org/download/ps4-fpkg-collection-english-j/ps4-fpkg-collection-english-j_files.xml
https://archive.org/download/ps4-fpkg-collection-english-j/ps4-fpkg-collection-english-j_meta.sqlite
https://archive.org/download/ps4-fpkg-collection-english-j/ps4-fpkg-collection-english-j_meta.xml
https://archive.org/download/ps4-fpkg-collection-english-k/ps4-fpkg-collection-english-k_archive.torrent
https://archive.org/download/ps4-fpkg-collection-english-k/ps4-fpkg-collection-english-k_files.xml
https://archive.org/download/ps4-fpkg-collection-english-k/ps4-fpkg-collection-english-k_meta.sqlite
https://archive.org/download/ps4-fpkg-collection-english-k/ps4-fpkg-collection-english-k_meta.xml
https://archive.org/download/ps4-fpkg-collection-english-l/ps4-fpkg-collection-english-l_archive.torrent
https://archive.org/download/ps4-fpkg-collection-english-l/ps4-fpkg-collection-english-l_files.xml
https://archive.org/download/ps4-fpkg-collection-english-l/ps4-fpkg-collection-english-l_meta.sqlite
https://archive.org/download/ps4-fpkg-collection-english-l/ps4-fpkg-collection-english-l_meta.xml
https://archive.org/download/ps4-fpkg-collection-english-m/ps4-fpkg-collection-english-m_archive.torrent
https://archive.org/download/ps4-fpkg-collection-english-m/ps4-fpkg-collection-english-m_files.xml
https://archive.org/download/ps4-fpkg-collection-english-m/ps4-fpkg-collection-english-m_meta.sqlite
https://archive.org/download/ps4-fpkg-collection-english-m/ps4-fpkg-collection-english-m_meta.xml
https://archive.org/download/ps4-fpkg-collection-english-n/ps4-fpkg-collection-english-n_files.xml
https://archive.org/download/ps4-fpkg-collection-english-n/ps4-fpkg-collection-english-n_meta.sqlite
https://archive.org/download/ps4-fpkg-collection-english-n/ps4-fpkg-collection-english-n_meta.xml
https://archive.org/download/ps4-fpkg-collection-english-o/ps4-fpkg-collection-english-o_archive.torrent
https://archive.org/download/ps4-fpkg-collection-english-o/ps4-fpkg-collection-english-o_files.xml
https://archive.org/download/ps4-fpkg-collection-english-o/ps4-fpkg-collection-english-o_meta.sqlite
https://archive.org/download/ps4-fpkg-collection-english-o/ps4-fpkg-collection-english-o_meta.xml
https://archive.org/download/ps4-fpkg-collection-english-p/ps4-fpkg-collection-english-p_archive.torrent
https://archive.org/download/ps4-fpkg-collection-english-p/ps4-fpkg-collection-english-p_files.xml
https://archive.org/download/ps4-fpkg-collection-english-p/ps4-fpkg-collection-english-p_meta.sqlite
https://archive.org/download/ps4-fpkg-collection-english-p/ps4-fpkg-collection-english-p_meta.xml
https://archive.org/download/ps4-fpkg-collection-english-q/ps4-fpkg-collection-english-q_archive.torrent
https://archive.org/download/ps4-fpkg-collection-english-q/ps4-fpkg-collection-english-q_files.xml
https://archive.org/download/ps4-fpkg-collection-english-q/ps4-fpkg-collection-english-q_meta.sqlite
https://archive.org/download/ps4-fpkg-collection-english-q/ps4-fpkg-collection-english-q_meta.xml
https://archive.org/download/ps4-fpkg-collection-english-r/ps4-fpkg-collection-english-r_files.xml
https://archive.org/download/ps4-fpkg-collection-english-r/ps4-fpkg-collection-english-r_meta.sqlite
https://archive.org/download/ps4-fpkg-collection-english-r/ps4-fpkg-collection-english-r_meta.xml
https://archive.org/download/ps4-fpkg-collection-english-s/ps4-fpkg-collection-english-s_archive.torrent
https://archive.org/download/ps4-fpkg-collection-english-s/ps4-fpkg-collection-english-s_files.xml
https://archive.org/download/ps4-fpkg-collection-english-s/ps4-fpkg-collection-english-s_meta.sqlite
https://archive.org/download/ps4-fpkg-collection-english-s/ps4-fpkg-collection-english-s_meta.xml
https://archive.org/download/ps4-fpkg-collection-english-t/ps4-fpkg-collection-english-t_archive.torrent
https://archive.org/download/ps4-fpkg-collection-english-t/ps4-fpkg-collection-english-t_files.xml
https://archive.org/download/ps4-fpkg-collection-english-t/ps4-fpkg-collection-english-t_meta.sqlite
https://archive.org/download/ps4-fpkg-collection-english-t/ps4-fpkg-collection-english-t_meta.xml
https://archive.org/download/ps4-fpkg-collection-english-t/ps4-fpkg-collection-english-t_reviews.xml
https://archive.org/download/ps4-fpkg-collection-english-u/ps4-fpkg-collection-english-u_archive.torrent
https://archive.org/download/ps4-fpkg-collection-english-u/ps4-fpkg-collection-english-u_files.xml
https://archive.org/download/ps4-fpkg-collection-english-u/ps4-fpkg-collection-english-u_meta.sqlite
https://archive.org/download/ps4-fpkg-collection-english-u/ps4-fpkg-collection-english-u_meta.xml
https://archive.org/download/ps4-fpkg-collection-english-v/ps4-fpkg-collection-english-v_archive.torrent
https://archive.org/download/ps4-fpkg-collection-english-v/ps4-fpkg-collection-english-v_files.xml
https://archive.org/download/ps4-fpkg-collection-english-v/ps4-fpkg-collection-english-v_meta.sqlite
https://archive.org/download/ps4-fpkg-collection-english-v/ps4-fpkg-collection-english-v_meta.xml
https://archive.org/download/ps4-fpkg-collection-english-w/ps4-fpkg-collection-english-w_archive.torrent
https://archive.org/download/ps4-fpkg-collection-english-w/ps4-fpkg-collection-english-w_files.xml
https://archive.org/download/ps4-fpkg-collection-english-w/ps4-fpkg-collection-english-w_meta.sqlite
https://archive.org/download/ps4-fpkg-collection-english-w/ps4-fpkg-collection-english-w_meta.xml
https://archive.org/download/ps4-fpkg-collection-english-x/ps4-fpkg-collection-english-x_archive.torrent
https://archive.org/download/ps4-fpkg-collection-english-x/ps4-fpkg-collection-english-x_files.xml
https://archive.org/download/ps4-fpkg-collection-english-x/ps4-fpkg-collection-english-x_meta.sqlite
https://archive.org/download/ps4-fpkg-collection-english-x/ps4-fpkg-collection-english-x_meta.xml
https://archive.org/download/ps4-fpkg-collection-english-y/ps4-fpkg-collection-english-y_archive.torrent
https://archive.org/download/ps4-fpkg-collection-english-y/ps4-fpkg-collection-english-y_files.xml
https://archive.org/download/ps4-fpkg-collection-english-y/ps4-fpkg-collection-english-y_meta.sqlite
https://archive.org/download/ps4-fpkg-collection-english-y/ps4-fpkg-collection-english-y_meta.xml
https://archive.org/download/ps4-fpkg-collection-english-z/ps4-fpkg-collection-english-z_archive.torrent
https://archive.org/download/ps4-fpkg-collection-english-z/ps4-fpkg-collection-english-z_files.xml
https://archive.org/download/ps4-fpkg-collection-english-z/ps4-fpkg-collection-english-z_meta.sqlite
https://archive.org/download/ps4-fpkg-collection-english-z/ps4-fpkg-collection-english-z_meta.xml
https://archive.org/download/ps4-fpkg-collection-english-p/Psychonauts%202%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.08%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-p/Pummel%20Party%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-p/Pyre%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-q/Quake%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.08%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-q/Quake%20II%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/Rabbids%20Party%20of%20Legends%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/RAD%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.06%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/RAGE%202%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.09%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/Rain%20World%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.12%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/Ratchet%20%26%20Clank%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.09%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/Ravenswatch%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/Rayman%20Legends%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/Red%20Dead%20Redemption%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/Red%20Dead%20Redemption%202%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.13%5D%20%5BSP%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/Red%20Dead%20Redemption%202%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.32%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/Red%20Faction%20Guerrilla%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/Redout%202%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.06%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/RESIDENT%20EVIL%202%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/RESIDENT%20EVIL%203%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/resident%20evil%204%20%282005%29%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/Resident%20Evil%204%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.11%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/RESIDENT%20EVIL%205%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/RESIDENT%20EVIL%206%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/RESIDENT%20EVIL%207%20biohazard%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/Resident%20Evil%20Origins%20Collection%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/RESIDENT%20EVIL%20REVELATIONS%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/RESIDENT%20EVIL%20REVELATIONS%202%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/Resident%20Evil%20Village%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.12%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/RESOGUN%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.10%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/Return%20of%20the%20Obra%20Dinn%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/Rez%20Infinite%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.06%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/Ride%204%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.34%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/RiME%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/Rise%20of%20the%20Tomb%20Raider%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.06%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/Risk%20of%20Rain%202%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.18%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/Rock%20Band%204%20-%20%5BUS%5D%20%5BEN%5D%20%5B2.21%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/Rock%20Band%204%20Expansion%20Pack%201.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/Rock%20Band%204%20Expansion%20Pack%202.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/Rock%20Band%204%20Expansion%20Pack%203.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/Rock%20Band%204%20Expansion%20Pack%204.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/Rocket%20League%20-%20%5BUS%5D%20%5BEN%5D%20%5B2.39%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/Rocksmith%202014%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.10%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/Rogue%20Legacy%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/Rogue%20Legacy%202%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-r/ROLLERDROME%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Sackboy%20A%20Big%20Adventure%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.22%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Saints%20Row%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.17%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Saints%20Row%20Gat%20out%20of%20Hell%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Saints%20Row%20IV%20Re-Elected%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Saints%20Row%20The%20Third%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.11%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/SAMURAI%20WARRIORS%205%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Sayonara%20Wild%20Hearts%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Sea%20of%20Solitude%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Sea%20of%20Stars%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.11%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Season%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Sekiro%20Shadows%20Die%20Twice%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.06%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Serial%20Cleaner%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Serial%20Cleaners%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/SHADOW%20OF%20THE%20COLOSSUS%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Shadow%20of%20the%20Tomb%20Raider%20-%20%5BEU%5D%20%5BEN%5D%20%5B2.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Shadow%20Warrior%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Shadow%20Warrior%202%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.06%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Shadow%20Warrior%203%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.13%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Shovel%20Knight%20Treasure%20Trove%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Sid%20Meier%27s%20Civilization%20VI%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.19%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Sid%20Meier%27s%20Civilization%20VII%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.11%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/SIFU%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.27%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Skabma%20-%20Snowfall%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Skater%20XL%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.15%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Skyrim%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.30%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Slay%20the%20Spire%20-%20%5BUS%5D%20%5BEN%5D%20%5B2.30%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Sleeping%20Dogs%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Slime%203K%20Rise%20Against%20Despot%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Slime%20Rancher%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.20%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Snake%20Pass%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Sniper%20Elite%203%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Sniper%20Elite%204%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.20%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Sniper%20Elite%205%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.29%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Sniper%20Elite%20Resistance%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.09%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Sniper%20Elite%20V2%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.06%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Sniper%20Ghost%20Warrior%20Contracts%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.09%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Sniper%20Ghost%20Warrior%20Contracts%202%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/SNK%20Collection%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/SnowRunner%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.49%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Solar%20Ash%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/SOMA%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.10%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Somerville%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Sonic%20Mania%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Sonic%20Origins%20-%20%5BEU%5D%20%5BEN%5D%20%5B2.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/SONIC%20X%20SHADOW%20GENERATIONS%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.10%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Sound%20Shapes%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.14%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/South%20Park%20The%20Fractured%20But%20Whole%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.10%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/South%20Park%20The%20Stick%20of%20Truth%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/SpeedRunners%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Spelunky%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Spelunky%202%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.24%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/SPIDERHECK%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.15%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Spiritfarer%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.15%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/SpongeBob%20SquarePants%20Battle%20For%20Bikini%20Bottom%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/SpongeBob%20SquarePants%20The%20Cosmic%20Shake%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/SpongeBob%20SquarePants%20The%20Patrick%20Star%20Game%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Spyro%20Reignited%20Trilogy%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Stalker%20Call%20of%20Prypiat%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.06%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Stalker%20Clear%20Sky%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.06%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Stalker%20Shadow%20of%20Chornobyl%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.06%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/STAR%20WARS%20Battlefront%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.12%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/STAR%20WARS%20Battlefront%20II%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.55%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/STAR%20WARS%20Jedi%20Fallen%20Order%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.12%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/STAR%20WARS%20Jedi%20Survivor%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/STAR%20WARS%20Squadrons%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.10%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Stardew%20Valley%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.62%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/STARWHAL%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Stellaris%20-%20%5BEU%5D%20%5BEN%5D%20%5B6.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Stick%20Fight%20The%20Game%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Stories%20Untold%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Stray%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Street%20Fighter%206%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.22%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Street%20Fighter%20Collection%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/STREET%20FIGHTER%20IV%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/STREET%20FIGHTER%20V%20-%20%5BEU%5D%20%5BEN%5D%20%5B3.10%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Streets%20of%20Rage%204%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.09%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Subnautica%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.21%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Subnautica%20Below%20Zero%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.21%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/SUPER%20BOMBERMAN%20R%202%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.31%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Super%20Crazy%20Rhythm%20Castle%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Super%20Meat%20Boy%21%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Super%20Monkey%20Ball%20Banana%20Blitz%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Super%20Monkey%20Ball%20Banana%20Mania%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/SUPERHOT%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/SUPERHOT%20MIND%20CONTROL%20DELETE%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Superliminal%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/Surgeon%20Simulator%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-s/System%20Shock%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Tacoma%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Taiko%20No%20Tatsujin%20-%20Drum%20Session%20-%20%5BJP%5D%20%5BEN%5D%20%5B1.28%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Tales%20from%20the%20Borderlands%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Tearaway%20Unfolded%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Teenage%20Mutant%20Ninja%20Turtles%20Shredder%27s%20Revenge%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.10%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/TEKKEN%207%20-%20%5BEU%5D%20%5BEN%5D%20%5B5.10%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Telling%20Lies%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Terraria%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.35%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Tetris%20Effect%20Connected%20-%20%5BEU%5D%20%5BEN%5D%20%5B2.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Amazing%20Spider-Man%202%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Artful%20Escape%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Awesome%20Adventures%20of%20Captain%20Spirit%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Binding%20of%20Isaac%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.16%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Bug%20Butcher%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Callisto%20Protocol%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.26%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Cub%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Dark%20Pictures%20Anthology%20House%20Of%20Ashes%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Dark%20Pictures%20Anthology%20Little%20Hope%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.09%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Dark%20Pictures%20Anthology%20Man%20of%20Medan%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.19%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Dark%20Pictures%20Anthology%20The%20Devil%20in%20Me%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Deadly%20Tower%20of%20Monsters%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Eternal%20Castle%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Evil%20Within%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.06%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Evil%20Within%202%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Expanse%20A%20Telltale%20Series%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Falconeer%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Forest%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.15%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Forgotten%20City%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Gardens%20Between%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Knight%20Witch%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Last%20Campfire%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Last%20Guardian%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Last%20of%20Us%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.11%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Long%20Dark%20-%20%5BEU%5D%20%5BEN%5D%20%5B2.39%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Lord%20of%20the%20Rings%20Gollum%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Messenger%20-%20%5BUS%5D%20%5BEN%5D%20%5B2.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Metronomicon%20Slay%20the%20Dance%20Floor%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.09%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Mooseman%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Occupation%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.08%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Order%201886%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Outer%20Worlds%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.08%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Pathless%20-%20%5BUS%5D%20%5BEN%5D%20%5B2.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Pedestrian%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Quarry%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/THE%20QUIET%20MAN%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Sexy%20Brutale%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Sims%204%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.95%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Sinking%20City%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Stanley%20Parable%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Surge%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.17%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Surge%202%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.10%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Talos%20Principle%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Touryst%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Unfinished%20Swan%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Vanishing%20of%20Ethan%20Carter%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Walking%20Dead%20The%20Telltale%20Series%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Wild%20at%20Heart%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.06%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Witcher%203%20Wild%20Hunt%20-%20%5BEU%5D%20%5BEN%5D%20%5B4.06%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Witness%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/The%20Wolf%20Among%20Us%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Thief%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Thimbleweed%20Park%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/This%20Is%20the%20Police%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/This%20Is%20the%20Police%202%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/This%20War%20of%20Mine%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Thomas%20Was%20Alone%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Thronebreaker%20The%20Witcher%20Tales%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Thumper%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.06%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Time%20on%20Frog%20Island%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Tiny%20Tina%27s%20Wonderlands%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.10%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Titanfall%202%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.13%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Tom%20Clancy%27s%20Ghost%20Recon%20Wildlands%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.31%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Tomb%20Raider%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Tomb%20Raider%20I-III%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Tomb%20Raider%20IV-VI%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Tony%20Hawk%27s%20Pro%20Skater%201%2B2%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.10%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Tony%20Hawk%27s%20Pro%20Skater%203%2B4%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Tools%20Up%21%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Tooth%20and%20Tail%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.71%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/TopSpin%202K25%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/TowerFall%20Ascension%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/TowerFall%20Dark%20World%20Expansion.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Trackmania%20Turbo%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Train%20Sim%20World%204%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.56%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Train%20Valley%202%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Transference%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Transistor%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Trash%20Sailors%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Travis%20Strikes%20Again%20No%20More%20Heroes%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Treadnauts%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Trek%20to%20Yomi%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Trials%20Fusion%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.16%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Trials%20Rising%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.12%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Tricky%20Towers%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.80%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Trine%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Trine%202%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Trine%203%20The%20Artifacts%20of%20Power%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Trine%204%20The%20Nightmare%20Prince%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Trine%205%20A%20Clockwork%20Conspiracy%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Tropico%205%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Tropico%206%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Trover%20Saves%20the%20Universe%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Tunic%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Turnip%20Boy%20Commits%20Tax%20Evasion%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Twelve%20Minutes%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Two%20Point%20Campus%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.13%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-t/Two%20Point%20Hospital%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.15%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-u/Ultimate%20Chicken%20Horse%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.10%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-u/Uncanny%20Valley%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-u/Uncharted%204%20A%20Thief%27s%20End%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.33%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-u/Uncharted%20The%20Lost%20Legacy%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.09%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-u/Uncharted%20The%20Nathan%20Drake%20Collection%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-u/Undertale%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.08%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-u/Unrailed%21%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-u/Unravel%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-u/Unravel%20TWO%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-u/Unspottable%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-u/Until%20Dawn%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-u/Untitled%20Goose%20Game%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-v/Valiant%20Hearts%20Coming%20Home%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-v/Valiant%20Hearts%20The%20Great%20War%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-v/Vampyr%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.09%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-v/Vanquish%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-v/Viewfinder%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-v/Visage%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-w/Watch%20Dogs%20Legion%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.24%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-w/WATCH_DOGS%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-w/WATCH_DOGS%202%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.18%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-w/We%20Happy%20Few%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.09%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-w/Webbed%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-w/Weird%20West%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.11%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-w/What%20Remains%20of%20Edith%20Finch%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-w/WHAT%20THE%20GOLF%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-w/WIPEOUT%20OMEGA%20COLLECTION%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-w/Wolfenstein%20II%20The%20New%20Colossus%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.07%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-w/Wolfenstein%20The%20New%20Order%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-w/Wolfenstein%20The%20Old%20Blood%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-w/Wolfenstein%20Youngblood%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.08%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-w/Wonder%20Boy%20The%20Dragon%27s%20Trap%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-w/Wordhunters%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-w/World%20War%20Z%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.53%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-w/Worms%20Battlegrounds%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-w/Worms%20W.M.D%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.13%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-w/Wreckfest%20-%20%5BEU%5D%20%5BEN%5D%20%5B2.22%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-w/WWE%202K%20Battlegrounds%20-%20%5BUS%5D%20%5BEN%5D%20%5B16.00%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-w/WWE%202K24%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.24%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-x/XCOM%202%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.06%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-y/YAKUZA%200%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-y/YAKUZA%203%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-y/YAKUZA%204%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-y/YAKUZA%205%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.03%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-y/YAKUZA%206%20The%20Song%20of%20Life%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.05%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-y/YAKUZA%20KIWAMI%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.09%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-y/YAKUZA%20KIWAMI%202%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.04%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-y/You%20Suck%20At%20Parking%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.10%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-z/Zero%20Escape%20The%20Nonary%20Games%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.02%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-z/Zombie%20Army%204%20Dead%20War%20-%20%5BUS%5D%20%5BEN%5D%20%5B1.48%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-z/Zombie%20Army%20Trilogy%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-z/ZONE%20OF%20THE%20ENDERS%20THE%202nd%20RUNNER%20M%E2%88%80RS%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.01%5D.pkg
https://archive.org/download/ps4-fpkg-collection-english-o/%C5%8CKAMI%20-%20%5BEU%5D%20%5BEN%5D%20%5B1.00%5D.pkg
`;

	// Only activate if the exact target input exists on the page
	if (!document.querySelector('input#url[name="url"][type="text"][placeholder="http://xxx.xxx.xx.xx/game.pkg"]')) {
		return;
	}

	const style = `
#fpkg_sidebar{position:fixed;top:0;left:0;width:${SIDEBAR_WIDTH}px;height:100vh;background:#0f1115;color:#e6e6e6;z-index:2147483647;
box-shadow:2px 0 8px rgba(0,0,0,.3);font:14px/1.35 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif}
#fpkg_header{display:flex;gap:8px;align-items:center;padding:10px;border-bottom:1px solid #222}
#fpkg_title{font-weight:700;font-size:14px;margin-right:auto}
#fpkg_search{flex:1;min-width:0;padding:6px 8px;background:#0b0d11;border:1px solid #242833;color:#dfe3ea;border-radius:6px;outline:none}
#fpkg_tools{display:flex;gap:6px}
#fpkg_tools button{padding:6px 8px;background:#1a1f2b;border:1px solid #2a3142;color:#dfe3ea;border-radius:6px;cursor:pointer}
#fpkg_tools button:hover{background:#212837}
#fpkg_list{height:calc(100vh - 54px);overflow:auto;padding:6px}
.fpkg_item{display:flex;align-items:center;gap:8px;padding:8px;border-radius:8px;cursor:pointer}
.fpkg_item:hover{background:#161a23}
.fpkg_name{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fpkg_meta{opacity:.66;font-size:12px}
#fpkg_empty{opacity:.7;padding:12px}

/* Right preview panel */
#fpkg_preview{position:fixed;top:0;right:0;width:560px;height:100vh;background:#0b0d11;border-left:1px solid #222;z-index:2147483646;display:flex;flex-direction:column}
#fpkg_preview_header{display:flex;align-items:center;gap:8px;padding:10px;border-bottom:1px solid #222}
#fpkg_preview_title{flex:1;color:#e6e6e6;font-weight:600}
#fpkg_player_wrap{flex:1;display:flex;align-items:center;justify-content:center;padding:8px}
#fpkg_player_wrap iframe{width:100%;height:100%;max-height:calc(100vh - 52px);border:0;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.35)}
	`;
	if (typeof GM_addStyle === 'function') GM_addStyle(style);
	else {
		const s = document.createElement('style');
		s.textContent = style;
		document.head.appendChild(s);
	}

	const root = document.createElement('aside');
	root.id = 'fpkg_sidebar';
	root.innerHTML = `
		<div id="fpkg_header">
			<div id="fpkg_title">Game URLs</div>
			<input id="fpkg_search" type="search" placeholder="Search games…" />
			<div id="fpkg_tools">
				<button id="fpkg_reload" title="Reload default file">↻</button>
				<button id="fpkg_refresh_covers" title="Clear YouTube cache">YT ↻</button>
			</div>
		</div>
		<div id="fpkg_list"><div id="fpkg_empty">Load URLs to begin…</div></div>
	`;
	document.body.appendChild(root);

	// Right-side YouTube preview panel
	const preview = document.createElement('section');
	preview.id = 'fpkg_preview';
	preview.innerHTML = `
		<div id="fpkg_preview_header">
			<div id="fpkg_preview_title">YouTube Preview</div>
		</div>
		<div id="fpkg_player_wrap"><div style="color:#9aa4b2">Select a game to load gameplay…</div></div>
	`;
	document.body.appendChild(preview);

	let entries = []; // { name, url }
	let filtered = [];
	const ytCache = new Map(); // name -> videoId

	function decodeNameFromUrl(url) {
		try {
			const seg = url.split('/').pop() || url;
			const dec = decodeURIComponent(seg);
			let name = dec.replace(/\.pkg$/i, '');
			while (/\s-\s\[[^\]]+\]\s*$/i.test(name)) name = name.replace(/\s-\s\[[^\]]+\]\s*$/i, '');
			return name.trim();
		} catch {
			return url;
		}
	}

	function render() {
		const list = document.getElementById('fpkg_list');
		list.innerHTML = '';
		if (!filtered.length) {
			const d = document.createElement('div');
			d.id = 'fpkg_empty';
			d.textContent = 'No matches.';
			list.appendChild(d);
			return;
		}
		for (const e of filtered) {
			const row = document.createElement('div');
			row.className = 'fpkg_item';
			row.dataset.url = e.url;
			row.dataset.name = e.name;

			const name = document.createElement('div');
			name.className = 'fpkg_name';
			name.textContent = e.name;

			const meta = document.createElement('div');
			meta.className = 'fpkg_meta';
			meta.textContent = new URL(e.url).hostname.replace(/^www\./, '');

			row.appendChild(name);
			row.appendChild(meta);

			row.addEventListener('click', () => {
				const input = document.querySelector('input#url[name="url"]');
				if (input) {
					input.value = e.url;
					input.dispatchEvent(new Event('input', { bubbles: true }));
					input.focus();
				} else {
					navigator.clipboard?.writeText(e.url).catch(()=>{});
					alert('Filled clipboard with URL (no input#url found).');
				}
				loadYouTubePreview(e.name);
			});

			list.appendChild(row);
		}
	}

	function applyFilter(term) {
		const q = term.trim().toLowerCase();
		filtered = q ? entries.filter(e => e.name.toLowerCase().includes(q)) : [...entries];
		filtered.sort((a, b) => a.name.localeCompare(b.name));
		render();
	}

	function gmReq(opts) {
		return new Promise((resolve, reject) => {
			GM_xmlhttpRequest({
				method: opts.method || 'GET',
				url: opts.url,
				headers: opts.headers || {},
				data: opts.data,
				onload: (res) => resolve(res),
				ontimeout: reject,
				onerror: reject,
			});
		});
	}

	function cleanupCandidates(original) {
			const candidates = new Set();
			let base = original
				.replace(/[®™]/g, '')
				.replace(/\s{2,}/g, ' ')
				.trim();
			// remove trailing tokens like " - [US] [EN] [1.27]"
			while (/\s-\s\[[^\]]+\]\s*$/i.test(base)) base = base.replace(/\s-\s\[[^\]]+\]\s*$/i, '').trim();
			// remove bracketed regions/versions anywhere
			base = base.replace(/\[[^\]]+\]/g, '').replace(/\s{2,}/g, ' ').trim();
			candidates.add(base);
			candidates.add(base.replace(/[:\-].*$/, '').trim());
			candidates.add(base.replace(/\b(Remaster(?:ed)?|Remake|Definitive Edition|HD Collection|Ultimate Edition|Trilogy|Collection|Director'?s Cut)\b/gi, '').replace(/\s{2,}/g, ' ').trim());
			// strip punctuation
			candidates.add(base.replace(/[^\w\s]/g, ' ').replace(/\s{2,}/g, ' ').trim());
			// split on common separators to add sub-title candidates
			for (const sep of ['+', '/', '&', ' and ']) {
				if (base.includes(sep)) {
					for (const part of base.split(sep)) {
						const p = part.replace(/[^\w\s]/g, ' ').replace(/\s{2,}/g, ' ').trim();
						if (p) candidates.add(p);
					}
				}
			}
			// heuristic for Borderlands Handsome Collection
			const lower = base.toLowerCase();
			if (lower.includes('borderlands') && (lower.includes('pre-sequel') || lower.includes('pre sequel')) && /\b2\b/.test(lower)) {
				candidates.add('Borderlands The Handsome Collection');
			}
			return Array.from(candidates).filter(Boolean);
		}

	async function fetchYouTubeId(gameName) {
		if (ytCache.has(gameName)) return ytCache.get(gameName);
		const names = cleanupCandidates(gameName);
		const primary = names[0] || gameName;

		async function searchOnce(term) {
			// Filter to videos only via sp param (type=video)
			const url = 'https://www.youtube.com/results?sp=EgIQAQ%3D%3D&search_query=' + encodeURIComponent(term);
			const res = await gmReq({ url, headers: { 'Accept': 'text/html' } });
			if (res.status !== 200 || !res.responseText) return null;
			const html = res.responseText;
			// Prefer first videoRenderer's videoId
			const vrIdx = html.indexOf('"videoRenderer"');
			if (vrIdx !== -1) {
				const tail = html.slice(vrIdx);
				const mvr = tail.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
				if (mvr && mvr[1]) return mvr[1];
			}
			// Fallback: first videoId anywhere
			const any = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
			if (any && any[1]) return any[1];
			// Fallback: first watch?v= id in markup
			const m2 = html.match(/\bwatch\?v=([a-zA-Z0-9_-]{11})/);
			return m2 && m2[1] ? m2[1] : null;
		}

		// Use primary cleaned name: prefer PS4 gameplay trailer first
		let vid = await searchOnce(primary + ' ps4 gameplay trailer');
		if (!vid) vid = await searchOnce(primary + ' gameplay trailer');
		if (!vid) vid = await searchOnce(primary + ' ps4 gameplay');
		if (!vid) vid = await searchOnce(primary + ' gameplay');
		if (vid) {
			ytCache.set(gameName, vid);
			return vid;
		}
		return null;
	}

	async function loadYouTubePreview(gameName) {
		document.getElementById('fpkg_preview_title').textContent = gameName + ' — Gameplay';
		const wrap = document.getElementById('fpkg_player_wrap');
		wrap.innerHTML = '<div style="color:#9aa4b2">Loading YouTube…</div>';
		const vid = await fetchYouTubeId(gameName);
		if (!vid) {
			wrap.innerHTML = '<div style="color:#f5c451">No video found</div>';
			return;
		}
		wrap.innerHTML = '<iframe allowfullscreen src="https://www.youtube.com/embed/' + vid + '?autoplay=1&rel=0"></iframe>';
	}

	function pumpQueue() {
		if (stopScoring) return;
		while (inflight < CONCURRENCY && queue.length) {
			const idx = queue.shift();
			if (idx == null) break;
			inflight++;
			const e = entries[idx];
			fetchScoreFor(e.name).then((s) => {
				e.score = s != null ? s : null;
			}).finally(() => {
				inflight--;
				applyFilter(document.getElementById('fpkg_search').value || '');
				pumpQueue();
			});
		}
	}

	function scheduleScoring() {
		queue = [];
		for (let i = 0; i < entries.length; i++) queue.push(i);
		inflight = 0;
		stopScoring = false;
		pumpQueue();
	}

	function parseTxt(txt) {
		const lines = txt.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
		const urls = lines.filter(l => /^https?:\/\/.+\.pkg$/i.test(l));
		const out = [];
		for (const u of urls) {
			out.push({ url: u, name: decodeNameFromUrl(u) });
		}
		return out;
	}

	function loadFromEmbedded() {
		const cachedTxt = GM_getValue('embedded_txt');
		const txt = (cachedTxt && String(cachedTxt)) || EMBEDDED_TXT;
		try {
			entries = parseTxt(txt || '');
			applyFilter(document.getElementById('fpkg_search').value || '');
			// no scoring now
			return true;
		} catch {
			return false;
		}
	}

	async function loadFromDefault() {
		try {
			const res = await gmReq({ url: DEFAULT_FILE });
			const txt = res.responseText || '';
			entries = parseTxt(txt);
			// persist for automatic future loads
			GM_setValue('embedded_txt', txt);
			applyFilter(document.getElementById('fpkg_search').value || '');
			// no scoring
		} catch {
			// fallback to embedded cached content, if available
			if (!loadFromEmbedded()) {
			const empty = document.getElementById('fpkg_empty');
				if (empty) empty.textContent = 'Could not read default file. Use “Load .txt” once; it will auto-load next time.';
			}
		}
	}

	document.getElementById('fpkg_search').addEventListener('input', (e) => {
		applyFilter(e.target.value || '');
	});

// removed manual file upload controls

	document.getElementById('fpkg_reload').addEventListener('click', () => {
		if (!loadFromDefault()) loadFromEmbedded();
	});

document.getElementById('fpkg_refresh_covers').addEventListener('click', () => {
	ytCache.clear();
	alert('YouTube cache cleared. Click a game again to re-search.');
});

	loadFromDefault() || loadFromEmbedded();
})();
