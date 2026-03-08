// =============================================================================
// GO ELSEWHERE — BUCKET LIST EXPERIENCES DATABASE
// experiences.js
//
// Structure:
//   BUCKET_LIST_EXPERIENCES — flat array, each entry is a witnessable moment
//   CHOCOLATE_EXPERIENCES   — dedicated section for chocolate pilgrimages
//   EXPERIENCE_CATEGORIES   — enum + display metadata
//   getExperiencesByCategory()  — filter helper
//   getExperiencesByMonth()     — timing filter helper
//   getExperiencesByGateway()   — corridor/gateway filter helper
// =============================================================================


// ─── CATEGORY METADATA ────────────────────────────────────────────────────────

const EXPERIENCE_CATEGORIES = {
  celestial:  { label: 'Celestial Events',      emoji: '🌌', description: 'Things that require dark sky, geography, or rare alignment' },
  wildlife:   { label: 'Wildlife Encounters',   emoji: '🐋', description: 'Right place, right season — nature on its own schedule' },
  seasonal:   { label: 'Seasonal Spectacles',   emoji: '🌸', description: 'Go somewhere because of the weather, not despite it' },
  ancient:    { label: 'Human-Scale Wonders',   emoji: '🏛️', description: 'Ruins, lost cities, underground worlds' },
  culinary:   { label: 'Culinary Pilgrimages',  emoji: '🍜', description: 'Eating something where it was invented' },
  gathering:  { label: 'Human Gatherings',      emoji: '🎉', description: 'Being somewhere when the whole world shows up' },
  immersive:  { label: 'Immersive Seasons',     emoji: '🌿', description: 'Weather as the destination — monsoon, fireflies, midnight sun' },
  chocolate:  { label: 'Chocolate Pilgrimages', emoji: '🍫', description: 'From bean-to-bar workshops to Europe\'s grandest cacao festivals' },
};


// ─── MAIN EXPERIENCE DATABASE ─────────────────────────────────────────────────
//
// Schema per entry:
// {
//   id            : string — unique slug
//   name          : string — display name
//   tagline       : string — one-line hook
//   category      : keyof EXPERIENCE_CATEGORIES
//   gateway       : string | string[] — IATA gateway code(s)
//   gatewayCity   : string — human-readable gateway city
//   accessNote    : string — Go Elsewhere's honest access story
//   flightEst     : string — rough round-trip estimate from major US cities
//   months        : number[] — valid experience months (1=Jan)
//   peakMonths    : number[] — sweet spot months
//   hardBlockMonths: number[] — never recommend in these months (experience impossible)
//   liveDataSource: string | null — URL or service for live forecast
//   liveDataNote  : string | null — what the live data tells you
//   cost          : string — rough on-the-ground cost note
//   proTip        : string
//   wrongAssumption: string | null — myth Go Elsewhere corrects
//   unlock        : string | null — special program or trick
// }

const BUCKET_LIST_EXPERIENCES = [

  // ══════════════════════════════════════════════════════════════════
  // CELESTIAL
  // ══════════════════════════════════════════════════════════════════

  {
    id: 'aurora-iceland',
    name: 'Aurora Borealis — Iceland',
    tagline: 'The whole city watches the sky together',
    category: 'celestial',
    gateway: 'KEF',
    gatewayCity: 'Reykjavík',
    accessNote: 'Direct flight from BOS/JFK/EWR. Icelandair free stopover program means you can see the aurora at zero extra airfare cost en route to Europe.',
    flightEst: '$380–450 rt from East Coast',
    months: [9,10,11,12,1,2,3,4],
    peakMonths: [11,12,1,2],
    hardBlockMonths: [5,6,7],
    liveDataSource: 'https://services.swpc.noaa.gov/text/27-day-outlook.txt',
    liveDataNote: 'NOAA 27-day Kp index forecast. Kp ≥ 3 = good show at Reykjavík.',
    cost: 'Tours $60–120/person. Self-drive just as good.',
    proTip: 'Drive 45 min from Reykjavík toward Þingvellir. Zero light pollution, same sky.',
    wrongAssumption: 'Iceland is expensive. It is — but Icelandair stopover is free, and aurora hunting requires only a rental car and darkness.',
    unlock: 'Icelandair free stopover: add Iceland to any transatlantic itinerary at no extra airfare cost.',
  },

  {
    id: 'aurora-norway',
    name: 'Aurora Borealis — Tromsø, Norway',
    tagline: 'Dog sleds, Sami culture, and a sky on fire',
    category: 'celestial',
    gateway: 'OSL',
    gatewayCity: 'Oslo → Tromsø domestic',
    accessNote: 'NYC→Oslo direct (Norse/SAS), then 2hr domestic to Tromsø. Sits directly under the auroral oval. Arguably the best infrastructure for aurora tourism on earth.',
    flightEst: '$600–700 total from East Coast',
    months: [9,10,11,12,1,2,3,4],
    peakMonths: [1,2],
    hardBlockMonths: [5,6,7],
    liveDataSource: 'https://services.swpc.noaa.gov/text/27-day-outlook.txt',
    liveDataNote: 'NOAA Kp forecast. Tromsø needs Kp ≥ 0 — any aurora activity shows here.',
    cost: 'Dog sled tours $150–300/person. Self-drive tundra viewing free.',
    proTip: 'September is underrated — temperatures tolerable, still fully dark, and shoulder prices.',
    wrongAssumption: null,
    unlock: null,
  },

  {
    id: 'aurora-finland-rovaniemi',
    name: 'Aurora Borealis — Rovaniemi, Finland',
    tagline: 'Glass igloos, reindeer, and Santa\'s actual address',
    category: 'celestial',
    gateway: 'HEL',
    gatewayCity: 'Helsinki → Rovaniemi domestic',
    accessNote: 'Helsinki direct from US East Coast, then 1.5hr domestic. Sits exactly on the Arctic Circle. Best for families — glass igloo cabins, reindeer safaris, and Finnish sauna culture.',
    flightEst: '$650–750 total from East Coast',
    months: [9,10,11,12,1,2,3,4],
    peakMonths: [11,12,1,2,3],
    hardBlockMonths: [5,6,7],
    liveDataSource: 'https://services.swpc.noaa.gov/text/27-day-outlook.txt',
    liveDataNote: 'NOAA Kp forecast. Rovaniemi: Kp ≥ 2 reliable.',
    cost: 'Glass igloos $250–500/night. Standard rooms $100–150.',
    proTip: 'Book glass igloo 6+ months in advance. They sell out by June.',
    wrongAssumption: 'This is only for Christmas. Rovaniemi is best February–March — darker, cheaper than December.',
    unlock: null,
  },

  {
    id: 'aurora-sweden-abisko',
    name: 'Aurora Borealis — Abisko, Sweden',
    tagline: 'The only aurora station above the cloud layer',
    category: 'celestial',
    gateway: 'ARN',
    gatewayCity: 'Stockholm → Kiruna domestic',
    accessNote: 'Stockholm direct from US, then domestic to Kiruna, then bus to Abisko. The Aurora Sky Station is built on a mountain above the regional cloud cover — the highest clear-sky aurora probability on the planet.',
    flightEst: '$650–750 total from East Coast',
    months: [9,10,11,12,1,2,3,4],
    peakMonths: [2,3],
    hardBlockMonths: [5,6,7],
    liveDataSource: 'https://services.swpc.noaa.gov/text/27-day-outlook.txt',
    liveDataNote: 'NOAA Kp forecast. Abisko needs Kp ≥ 1.',
    cost: 'Aurora Sky Station gondola + dinner $150/person. Simple lodges $90–130/night.',
    proTip: 'The Sky Station cable car operates only when aurora is forecast. Check auroraskystation.se day-of.',
    wrongAssumption: 'Iceland is better. Abisko has statistically higher clear-sky probability due to a unique microclimate. Connoisseur\'s choice.',
    unlock: null,
  },

  {
    id: 'aurora-canada-yellowknife',
    name: 'Aurora Borealis — Yellowknife, Canada',
    tagline: '240 aurora nights a year. Nobody tells Americans this.',
    category: 'celestial',
    gateway: 'YEG',
    gatewayCity: 'Edmonton → Yellowknife domestic',
    accessNote: 'From Chicago, Yellowknife is closer, cheaper, and more reliable than Iceland. Edmonton is 6.5hrs via major US hubs. Sits under the auroral oval — 240 aurora nights per year is the highest of any inhabited city on earth.',
    flightEst: '$300–350 rt from Midwest/Chicago',
    months: [9,10,11,12,1,2,3,4],
    peakMonths: [11,12,1,2],
    hardBlockMonths: [5,6,7],
    liveDataSource: 'https://services.swpc.noaa.gov/text/27-day-outlook.txt',
    liveDataNote: 'NOAA Kp. Yellowknife shows aurora at Kp ≥ 0.',
    cost: 'Aurora lodges $100–200/night. Tours $80–120/person.',
    proTip: 'Rent a car and drive north on Ingraham Trail. Free viewing, better than any tour.',
    wrongAssumption: 'You need to go to Iceland to see aurora. For Midwesterners, Yellowknife is cheaper, faster, and sees the lights twice as often.',
    unlock: null,
  },

  {
    id: 'aurora-alaska-fairbanks',
    name: 'Aurora Borealis — Fairbanks, Alaska',
    tagline: 'No passport. 200+ aurora nights. Glass-ceiling cabins.',
    category: 'celestial',
    gateway: 'FAI',
    gatewayCity: 'Fairbanks (domestic)',
    accessNote: 'Domestic flight, no passport. 200+ aurora nights per year. Glass-ceiling aurora cabins exist. Cheapest qualifying destination for US travelers who want the real experience without international airfare.',
    flightEst: '$350–500 rt from most US cities',
    months: [9,10,11,12,1,2,3,4],
    peakMonths: [11,12,1,2],
    hardBlockMonths: [5,6,7],
    liveDataSource: 'https://services.swpc.noaa.gov/text/27-day-outlook.txt',
    liveDataNote: 'NOAA Kp. Fairbanks: Kp ≥ 1.',
    cost: 'Glass cabins $200–350/night. Budget lodges $80–120.',
    proTip: 'Combine with Denali in September — aurora at night, bears and glaciers by day.',
    wrongAssumption: 'You need to leave the US to see northern lights. Fairbanks, Alaska: 200+ aurora nights, domestic flight.',
    unlock: null,
  },

  {
    id: 'aurora-canada-whitehorse',
    name: 'Aurora Borealis — Whitehorse, Yukon',
    tagline: 'Pacific Northwest\'s doorstep to the aurora belt',
    category: 'celestial',
    gateway: 'YXY',
    gatewayCity: 'Whitehorse (direct from Seattle)',
    accessNote: '2.5hr direct from Seattle. Same aurora belt as Yellowknife, wilder landscape. Best option for West Coast travelers — closer than Iceland and no international travel required.',
    flightEst: '$250–300 rt from Seattle; $280–380 from LA/SF',
    months: [9,10,11,12,1,2,3,4],
    peakMonths: [11,12,1,2],
    hardBlockMonths: [5,6,7],
    liveDataSource: 'https://services.swpc.noaa.gov/text/27-day-outlook.txt',
    liveDataNote: 'NOAA Kp forecast.',
    cost: 'B&B lodges $100–160/night. Aurora tours $80–100.',
    proTip: 'September sweet spot — tolerable temperatures (-5°C), full darkness, Klondike Gold Rush history nearby.',
    wrongAssumption: null,
    unlock: null,
  },

  {
    id: 'midnight-sun-scandinavia',
    name: 'Midnight Sun — Scandinavia & Iceland',
    tagline: 'The sun refuses to set. You stop believing in time.',
    category: 'celestial',
    gateway: ['KEF','OSL','ARN'],
    gatewayCity: 'Reykjavík / Tromsø / Whitehorse',
    accessNote: '24-hour daylight above the Arctic Circle in June and July. The inverse of aurora season — same destinations, opposite calendar. Midnight hiking, midnight golf, reading outside at 2am.',
    flightEst: '$380–700 rt depending on destination',
    months: [5,6,7],
    peakMonths: [6],
    hardBlockMonths: [],
    liveDataSource: null,
    liveDataNote: 'Midnight sun dates are astronomical — exact and predictable years in advance.',
    cost: 'No special costs. Daylight is free.',
    proTip: 'Whitehorse, Yukon gets 20+ hours of daylight at summer solstice, 2.5hr from Seattle, and you can fish the Yukon River at midnight.',
    wrongAssumption: 'Midnight sun is only a Scandinavian thing. Whitehorse, Yukon: 20hr daylight, domestic US-adjacent flight.',
    unlock: null,
  },

  {
    id: 'bioluminescence-mosquito-bay',
    name: 'Bioluminescence — Mosquito Bay, Puerto Rico',
    tagline: 'Every stroke of your hand makes the water glow blue',
    category: 'celestial',
    gateway: 'SJU',
    gatewayCity: 'San Juan, Puerto Rico',
    accessNote: 'Domestic flight from US, no passport. Vieques Island, a 35min ferry from Fajardo. Mosquito Bay is certified the brightest bioluminescent bay on earth by Guinness. Kayak tours operate year-round — the only timing variable is avoiding the full moon.',
    flightEst: '$180–250 rt from East Coast; $220–320 from elsewhere',
    months: [1,2,3,4,5,6,7,8,9,10,11,12],
    peakMonths: [6,7,8,9,10,11],
    hardBlockMonths: [],
    liveDataSource: null,
    liveDataNote: 'Moon phase is the only forecast needed. Avoid 3 days before and after full moon. Computable locally — no API required.',
    cost: 'Kayak tours $45–65/person. Vieques ferry $4 each way.',
    proTip: 'New moon = best experience. Book kayak tour, not electric boat — paddling activates more dinoflagellates.',
    wrongAssumption: 'Bioluminescence is in the Maldives or Thailand. Mosquito Bay is Guinness-certified #1 — domestic flight, no passport.',
    unlock: null,
  },

  {
    id: 'bioluminescence-holbox',
    name: 'Bioluminescence — Isla Holbox, Mexico',
    tagline: 'Wading into glowing water surrounded by whale sharks',
    category: 'celestial',
    gateway: 'CUN',
    gatewayCity: 'Cancún → bus+ferry to Holbox',
    accessNote: '2.5hr from Cancún by bus + 30min ferry. Bioluminescence peaks August–October during plankton bloom season, coinciding with whale shark season. Stand-up paddleboard in glowing water at night after snorkeling with whale sharks at dawn.',
    flightEst: '$280–400 rt from most US cities',
    months: [5,6,7,8,9,10,11],
    peakMonths: [8,9,10],
    hardBlockMonths: [],
    liveDataSource: null,
    liveDataNote: 'Moon phase calculation. Plankton density peaks August–October — plan accordingly.',
    cost: 'Night kayak tours $30–50/person. Holbox is car-free — accommodation $60–120/night.',
    proTip: 'Combine with whale shark snorkeling (dawn) + bioluminescence kayak (midnight) on the same day in August. One of travel\'s great double features.',
    wrongAssumption: null,
    unlock: null,
  },


  // ══════════════════════════════════════════════════════════════════
  // WILDLIFE
  // ══════════════════════════════════════════════════════════════════

  {
    id: 'whale-sharks-holbox',
    name: 'Whale Shark Migration — Isla Holbox, Mexico',
    tagline: 'Swim with the largest fish in the ocean for $40',
    category: 'wildlife',
    gateway: 'CUN',
    gatewayCity: 'Cancún',
    accessNote: 'Whale sharks aggregate at the surface to feed on fish eggs June–September, peak July–August. Snorkeling tours run directly from Holbox — no scuba certification needed. $280 from most US cities to Cancún, $40/person snorkel tour.',
    flightEst: '$280–400 rt from most US cities',
    months: [6,7,8,9],
    peakMonths: [7,8],
    hardBlockMonths: [1,2,3,4,5,10,11,12],
    liveDataSource: null,
    liveDataNote: 'NOAA ERDDAP sea surface temperature for Yucatán shelf as indirect signal. Whale sharks follow the fish egg bloom.',
    cost: '$40–60/person snorkel tour.',
    proTip: 'Tours depart 6am from Holbox docks. Book day before — same-day is usually available in shoulder weeks (June, September).',
    wrongAssumption: 'Whale sharks are in Thailand or the Maldives. Holbox is $280 from anywhere in the US, and the aggregation here is one of the largest in the world.',
    unlock: null,
  },

  {
    id: 'whale-sharks-la-paz',
    name: 'Whale Shark Season — La Paz, Baja California',
    tagline: 'Year-round presence, sea lions included',
    category: 'wildlife',
    gateway: 'SJD',
    gatewayCity: 'Los Cabos',
    accessNote: '2hr drive from SJD or direct to LAP. La Paz has whale sharks October–March, sea lions year-round (snorkel with them for $40). The Sea of Cortez is Jacques Cousteau\'s "the world\'s aquarium." Baja whale watching (gray whales calving in lagoons) January–March.',
    flightEst: '$220–350 rt from LA/SF; $300–420 from East Coast',
    months: [10,11,12,1,2,3],
    peakMonths: [11,12,1],
    hardBlockMonths: [],
    liveDataSource: null,
    liveDataNote: 'Sea temperature signal: when Sea of Cortez SST crosses 22°C (Oct-Nov), whale sharks arrive.',
    cost: 'Whale shark tours $60–80/person. Sea lion snorkel $40.',
    proTip: 'Los Islotes sea lion colony is 45min boat ride from La Paz marina. Pups born in June — most playful October–March.',
    wrongAssumption: null,
    unlock: null,
  },

  {
    id: 'whale-watching-baja-gray',
    name: 'Gray Whale Watching — Baja California, Mexico',
    tagline: 'Gray whales migrate to warm lagoons to calve — and let you touch them',
    category: 'wildlife',
    gateway: 'SJD',
    gatewayCity: 'Los Cabos / La Paz',
    accessNote: 'Gray whales migrate 12,000 miles from Alaska to Baja lagoons (Laguna San Ignacio, Ojo de Liebre) January–March to give birth. They approach boats willingly — "friendly whales" is the term. Multi-day van tours from La Paz $400–600/person.',
    flightEst: '$220–420 rt from US West Coast',
    months: [1,2,3],
    peakMonths: [2,3],
    hardBlockMonths: [4,5,6,7,8,9,10,11,12],
    liveDataSource: null,
    liveDataNote: 'Gray whale arrival is highly predictable — mid-January every year.',
    cost: 'Day tours $120/person from La Paz. Multi-day lagoon camps $400–600.',
    proTip: 'Laguna San Ignacio (UNESCO) is the gold standard. Whale boats here are the ones where the whales approach you, not the other way around.',
    wrongAssumption: 'Whale watching is an Alaska expedition. These whales come to warm Baja lagoons every January — drive-up access from La Paz.',
    unlock: null,
  },

  {
    id: 'whale-watching-iceland',
    name: 'Whale Watching — Húsavík, Iceland',
    tagline: 'Humpbacks and minkes return to feed as Arctic waters warm',
    category: 'wildlife',
    gateway: 'KEF',
    gatewayCity: 'Reykjavík',
    accessNote: 'Húsavík is the self-proclaimed whale watching capital of Europe. Humpback and minke whales return April onward as sea temperatures rise. Often combined with aurora trips (stay October–April for both, or split between seasons). Blue whales occasionally seen June–August.',
    flightEst: '$380–450 rt from East Coast',
    months: [4,5,6,7,8,9],
    peakMonths: [6,7],
    hardBlockMonths: [],
    liveDataSource: null,
    liveDataNote: null,
    cost: 'Tours $60–90/person from Húsavík harbor.',
    proTip: 'Midnight sun + whale watching in June: 3am boat tour in full daylight. Nowhere else on earth.',
    wrongAssumption: null,
    unlock: 'Icelandair free stopover: combine whale watching in June with any Europe trip.',
  },

  {
    id: 'wildebeest-migration',
    name: 'Great Wildebeest Migration — Masai Mara / Serengeti',
    tagline: 'Two million animals cross a crocodile-filled river. Nothing prepares you.',
    category: 'wildlife',
    gateway: 'NBO',
    gatewayCity: 'Nairobi, Kenya',
    accessNote: '1.5–2M wildebeest move in a loop between Tanzania and Kenya annually. The dramatic Mara River crossing (crocodiles taking wildebeest mid-leap) happens July–October in the Masai Mara. It is expensive — but not $10,000. Budget safaris exist.',
    flightEst: '$700–900 rt from US East Coast',
    months: [7,8,9,10],
    peakMonths: [8,9],
    hardBlockMonths: [],
    liveDataSource: null,
    liveDataNote: 'Migration timing varies by rainfall. No precise forecast tool — build in a 1-week window around late August.',
    cost: 'Budget safari camps $200–300/night all-inclusive. Mid-range $400–600.',
    proTip: 'Fly into Nairobi, take scheduled 45min prop flight to Masai Mara airstrip. Don\'t drive 8 hours.',
    wrongAssumption: 'Safari requires $10,000+. Budget camps in the Mara exist — meals, guides, game drives all included at $200–300/night.',
    unlock: null,
  },

  {
    id: 'monarch-butterflies-michoacan',
    name: 'Monarch Butterfly Migration — Michoacán, Mexico',
    tagline: 'A forest turns orange. Every branch is wings.',
    category: 'wildlife',
    gateway: 'MEX',
    gatewayCity: 'Mexico City',
    accessNote: 'Hundreds of millions of monarchs overwinter in the oyamel fir forests of Michoacán, an hour from Mexico City. Accessible via MEX or connecting from CUN. Peak December–February when colonies are densest. Sunrise is the spectacle — cold nights cluster the butterflies, then morning warmth makes the entire forest move at once.',
    flightEst: '$280–400 rt to MEX from most US cities',
    months: [11,12,1,2,3],
    peakMonths: [12,1,2],
    hardBlockMonths: [4,5,6,7,8,9,10],
    liveDataSource: 'https://journeynorth.org/monarchs/',
    liveDataNote: 'Journey North citizen science tracks colony size and timing each season.',
    cost: 'Reserve entry $10–15. Local guides $20–30/person. MEX to Morelia flight $60–80.',
    proTip: 'Arrive at the sanctuary at 10am — butterflies start warming up and flying. Earlier is silent clusters; later is a living orange tornado.',
    wrongAssumption: null,
    unlock: null,
  },

  {
    id: 'puffins-st-johns',
    name: 'Puffin Watching — St. John\'s, Newfoundland',
    tagline: 'North America\'s puffin capital. 2hr flight from Boston.',
    category: 'wildlife',
    gateway: 'YYT',
    gatewayCity: 'St. John\'s, Newfoundland',
    accessNote: 'Newfoundland is the seabird capital of North America. Puffins nest on coastal headlands May–August; boat tours from St. John\'s depart to Witless Bay Ecological Reserve where 260,000 puffins nest. Also: icebergs drifting past in June, humpback whales, and the cheapest aurora viewing on the East Coast ($180 flights).',
    flightEst: '$180–220 rt from Boston/NYC',
    months: [5,6,7,8],
    peakMonths: [6,7],
    hardBlockMonths: [],
    liveDataSource: null,
    liveDataNote: null,
    cost: 'Puffin boat tours $30–50/person. Icebergs are free — visible from Signal Hill.',
    proTip: 'Iceberg season peaks May–June. Combine with puffin tours and you get three spectacles (icebergs, puffins, humpbacks) in one trip.',
    wrongAssumption: 'Puffins are Iceland-only. Newfoundland has 260,000 nesting puffins — $180 from Boston.',
    unlock: null,
  },

  {
    id: 'fireflies-smoky-mountains',
    name: 'Synchronized Fireflies — Great Smoky Mountains, Tennessee',
    tagline: 'The only species in North America that blinks in unison. Like a slow strobe in the forest.',
    category: 'wildlife',
    gateway: null,
    gatewayCity: 'Gatlinburg, TN (drive-to)',
    accessNote: 'Photinus carolinus, the synchronous firefly, blinks in coordinated waves across the forest floor — a behavior found in only a handful of species worldwide. Late May to mid-June. Access via NPS lottery (free, competitive) or viewing along Elkmont trail. Drive-accessible from most of the Southeast and Mid-Atlantic.',
    flightEst: 'Drive-to from most of Southeast; $150–250 fly to Knoxville (TYS)',
    months: [5,6],
    peakMonths: [6],
    hardBlockMonths: [],
    liveDataSource: 'https://www.nps.gov/grsm/planyourvisit/fireflies.htm',
    liveDataNote: 'NPS announces viewing dates each spring based on temperature accumulation models. Usually 2 weeks notice.',
    cost: 'NPS lottery vehicle pass $1–2. Free to walk in.',
    proTip: 'Skip the lottery if you can hike in from Elkmont campground. Show starts 9:30–10:30pm, peaks for ~45 minutes, then darkness again.',
    wrongAssumption: 'Fireflies are everywhere. This species synchronizes — like a heartbeat made of light. There is nothing else like it in North America.',
    unlock: null,
  },


  // ══════════════════════════════════════════════════════════════════
  // SEASONAL
  // ══════════════════════════════════════════════════════════════════

  {
    id: 'cherry-blossoms-japan',
    name: 'Cherry Blossom Season — Japan',
    tagline: 'Fleeting by design. Two weeks, then gone.',
    category: 'seasonal',
    gateway: 'NRT',
    gatewayCity: 'Tokyo',
    accessNote: 'Tokyo and Kyoto are the anchors but Japan has 1,000 blossom observation points from Fukuoka (mid-March) to Hokkaido (late April). A single NRT gateway unlocks a rolling sakura chase up the archipelago. 2026: forecasts are 1–2 weeks early — Tokyo peak ~March 17.',
    flightEst: '$500–700 rt from West Coast; $650–900 from East Coast',
    months: [3,4],
    peakMonths: [3,4],
    hardBlockMonths: [],
    liveDataSource: 'https://sakura.weathermap.jp/en.php',
    liveDataNote: 'sakura.weathermap.jp updates Mon/Thu during season (Jan–April) with bloom forecasts for 58 official observation points.',
    cost: 'Parks are free. Sakura picnic supplies ¥1,000–3,000. Accommodation peaks 50–80% above normal.',
    proTip: 'Ueno Park and Shinjuku Gyoen in Tokyo are the classics. For less crowded: Yanaka Cemetery at night.',
    wrongAssumption: null,
    unlock: 'JAL/ANA Visit Japan domestic flight pass: fly NRT→Hokkaido (late April blossoms, less crowded) for ~$100.',
  },

  {
    id: 'cherry-blossoms-dc',
    name: 'Cherry Blossoms — Washington, D.C.',
    tagline: 'Free. Three miles of pink along the Tidal Basin.',
    category: 'seasonal',
    gateway: 'DCA',
    gatewayCity: 'Washington, D.C.',
    accessNote: 'Drive-to or train from most of the East Coast. 3,000 Yoshino cherry trees around the Tidal Basin. NPS peak bloom consensus for 2026: March 30–April 2. Free to visit.',
    flightEst: 'Drive / Amtrak from Northeast. $100–200 rt from Southeast.',
    months: [3,4],
    peakMonths: [3,4],
    hardBlockMonths: [],
    liveDataSource: 'https://www.nps.gov/subjects/cherryblossom/bloom-watch.htm',
    liveDataNote: 'NPS Bloom Watch page issues forecasts once bud stage is identified (usually mid-February onward).',
    cost: 'Free.',
    proTip: 'Pre-dawn (6–7am) is empty and perfectly lit. By 10am it\'s shoulder-to-shoulder. Bring a blanket and a thermos.',
    wrongAssumption: null,
    unlock: null,
  },

  {
    id: 'cherry-blossoms-jinhae',
    name: 'Cherry Blossoms — Jinhae, South Korea',
    tagline: 'Asia\'s largest cherry blossom festival. Somehow still off-radar for Western tourists.',
    category: 'seasonal',
    gateway: 'ICN',
    gatewayCity: 'Seoul',
    accessNote: '2hr from Seoul by train. The Jinhae Gunhangje Festival is the largest cherry blossom festival in Asia — a military port turns pink for ten days. Less crowded than Tokyo, deeper pastel tunnels, and Korean street food alongside.',
    flightEst: '$550–800 rt from US West Coast; $700–950 from East Coast',
    months: [3,4],
    peakMonths: [4],
    hardBlockMonths: [],
    liveDataSource: null,
    liveDataNote: 'Korean Meteorological Administration issues forecast late February. Typically late March–early April.',
    cost: 'Festival free. Train from Seoul $15 rt.',
    proTip: 'Gyeongwha Station is the Instagram tunnel. Arrive 7am to have it to yourself.',
    wrongAssumption: 'Cherry blossoms are Japan. Jinhae is Asia\'s largest blossom festival and you can do it in a day from Seoul.',
    unlock: null,
  },

  {
    id: 'tulips-netherlands',
    name: 'Tulip Fields — Keukenhof, Netherlands',
    tagline: 'Seven million flowers. Opened for 8 weeks only.',
    category: 'seasonal',
    gateway: 'AMS',
    gatewayCity: 'Amsterdam',
    accessNote: 'Keukenhof Gardens (Lisse, 30min from Amsterdam) is open only 8 weeks per year, April–May. But the real show is the agricultural fields between Haarlem and Den Helder — bright striped rows of commercial tulips visible from the road or by bike.',
    flightEst: '$400–650 rt from East Coast',
    months: [4,5],
    peakMonths: [4],
    hardBlockMonths: [],
    liveDataSource: null,
    liveDataNote: 'Keukenhof publishes estimated peak bloom periods 2–3 weeks in advance on their website.',
    cost: 'Keukenhof €22 adults. Fields by bike free (rent bikes at Haarlem station €12/day).',
    proTip: 'Rent a bike from Haarlem and ride through the Bollenstreek — you\'ll see the commercial fields up close with zero crowds. Superior to Keukenhof for photography.',
    wrongAssumption: null,
    unlock: null,
  },

  {
    id: 'sapporo-snow-festival',
    name: 'Sapporo Snow Festival — Japan',
    tagline: 'City-scale ice sculptures. Ten days in February.',
    category: 'seasonal',
    gateway: 'NRT',
    gatewayCity: 'Tokyo → Sapporo domestic',
    accessNote: 'Held annually in early February, the Sapporo Snow Festival transforms Odori Park into a display of enormous illuminated snow sculptures — some the size of buildings. NRT gateway + free JAL/ANA domestic hop to Sapporo (CTS).',
    flightEst: '$500–800 rt to NRT; ~$100 domestic hop CTS',
    months: [2],
    peakMonths: [2],
    hardBlockMonths: [],
    liveDataSource: null,
    liveDataNote: null,
    cost: 'Festival free. Hokkaido accommodation $80–150/night.',
    proTip: 'The Tsudome site (15min from downtown) has snow slides and interactive sculptures — better for kids and less crowded than Odori.',
    wrongAssumption: null,
    unlock: 'JAL/ANA Visit Japan domestic pass: ~$100 NRT→CTS, making Hokkaido effectively free to add.',
  },

  {
    id: 'harbin-ice-festival',
    name: 'Harbin Ice and Snow Festival — China',
    tagline: 'A city built entirely of illuminated ice. The largest ice festival in the world.',
    category: 'seasonal',
    gateway: 'HRB',
    gatewayCity: 'Harbin, China',
    accessNote: 'The Harbin International Ice and Snow Sculpture Festival runs January–February and features Zhaolin Park (ice lanterns) and Ice and Snow World (full illuminated ice city). The largest of its kind on earth — Sapporo is impressive, this is staggering. PEK or PVG connecting via Beijing/Shanghai.',
    flightEst: '$600–900 rt from West Coast via PEK',
    months: [1,2],
    peakMonths: [1,2],
    hardBlockMonths: [],
    liveDataSource: null,
    liveDataNote: null,
    cost: 'Ice and Snow World entry ¥330 (~$45). Evening is the main show — ice blocks glow from within.',
    proTip: 'Wear everything. Harbin in January is -20°C. Hand warmers, waterproof boots, face covering. The cold is part of the spectacle.',
    wrongAssumption: null,
    unlock: null,
  },

  {
    id: 'lavender-provence',
    name: 'Lavender Bloom — Provence, France',
    tagline: 'Violet rows as far as you can see. The smell arrives before the fields do.',
    category: 'seasonal',
    gateway: 'CDG',
    gatewayCity: 'Paris → Marseille/Avignon TGV',
    accessNote: 'Lavender blooms in Provence June into early July, peaking around the summer solstice. The Valensole Plateau is the most photogenic. TGV from Paris to Marseille is 3hrs — combine with Paris.',
    flightEst: '$400–700 rt from East Coast',
    months: [6,7],
    peakMonths: [6],
    hardBlockMonths: [],
    liveDataSource: null,
    liveDataNote: null,
    cost: 'Fields are free and roadside. Gordes/Valensole accommodations $90–180/night.',
    proTip: 'Hokkaido, Japan (Furano) has lavender fields in July that are equally stunning, less crowded, and accessible with a free JAL/ANA domestic hop.',
    wrongAssumption: null,
    unlock: null,
  },

  {
    id: 'lavender-hokkaido',
    name: 'Lavender Bloom — Furano, Hokkaido, Japan',
    tagline: 'Provence\'s equal. One-tenth the crowds.',
    category: 'seasonal',
    gateway: 'NRT',
    gatewayCity: 'Tokyo → Sapporo domestic',
    accessNote: 'Farm Tomita in Furano is Japan\'s most photographed lavender field. July peak. The JAL/ANA domestic free pass makes Hokkaido effectively zero incremental cost from Tokyo. Less famous than Provence, equally purple.',
    flightEst: '$500–800 rt to NRT + ~$100 domestic hop',
    months: [7],
    peakMonths: [7],
    hardBlockMonths: [],
    liveDataSource: null,
    liveDataNote: null,
    cost: 'Farm Tomita is free entry. Furano accommodation $80–130/night.',
    proTip: 'Combine with Asahiyama Zoo (the one with penguins that walk over glass tunnels in winter) if visiting outside July.',
    wrongAssumption: 'Lavender is Provence. Hokkaido\'s Furano is just as spectacular, costs the same, and sees a fraction of the tourists.',
    unlock: 'JAL/ANA Visit Japan domestic pass: ~$100 NRT→CTS.',
  },

  {
    id: 'fall-foliage-new-england',
    name: 'Fall Foliage — Vermont & New England',
    tagline: 'Mid-October: the whole landscape turns into a painting',
    category: 'seasonal',
    gateway: 'BOS',
    gatewayCity: 'Boston (drive-to from Northeast)',
    accessNote: 'Drive-accessible from all of the Northeast. Vermont Route 100 and Kancamagus Highway (NH) are the classics. Peak typically mid-October. Quebec City is a 2hr drive from Vermont and matches the color intensity — in a French medieval city.',
    flightEst: 'Drive from Northeast; $150–250 fly to BOS/BTV',
    months: [9,10],
    peakMonths: [10],
    hardBlockMonths: [],
    liveDataSource: 'https://smokymountains.com/fall-foliage-map/',
    liveDataNote: 'SmokyMountains.com foliage tracker updates weekly with peak predictions by state.',
    cost: 'Free (public roads). Vermont country inns $100–250/night in peak.',
    proTip: 'Craftsbury Common and Peacham, VT are less trafficked than Stowe but equally spectacular. Add Quebec City for a French accent on the same foliage.',
    wrongAssumption: null,
    unlock: null,
  },

  {
    id: 'oktoberfest',
    name: 'Oktoberfest — Munich, Germany',
    tagline: 'Six million people. Giant tents. Lederhosen as far as you can see.',
    category: 'gathering',
    gateway: 'MUC',
    gatewayCity: 'Munich',
    accessNote: 'Late September into early October. 6 million visitors over 16 days. The real Oktoberfest is at Theresienwiese — not tourist beer halls but the actual grounds, 14 major tents, Bavarian brass bands, carnival rides. U-Bahn from city center.',
    flightEst: '$450–700 rt from East Coast',
    months: [9,10],
    peakMonths: [9,10],
    hardBlockMonths: [],
    liveDataSource: null,
    liveDataNote: null,
    cost: 'Beer steins €14–16. Entry free. Accommodation near Munich doubles in price — book months ahead.',
    proTip: 'Book accommodation in Augsburg (30min train) — 40% cheaper than Munich during the festival.',
    wrongAssumption: null,
    unlock: null,
  },

  {
    id: 'dia-de-los-muertos-oaxaca',
    name: 'Día de los Muertos — Oaxaca, Mexico',
    tagline: 'The most visually stunning celebration of death in the world',
    category: 'gathering',
    gateway: 'OAX',
    gatewayCity: 'Oaxaca (via MEX)',
    accessNote: 'November 1–2. Oaxaca is considered the spiritual and artistic center of the celebration — elaborate ofrendas, marigold paths through cemeteries, mezcal poured for the returning dead. 1hr flight from Mexico City, or connecting from CUN. Not a Halloween party — a deeply moving family reunion across the living/dead divide.',
    flightEst: '$300–450 rt MEX + $60–80 domestic to OAX',
    months: [11],
    peakMonths: [11],
    hardBlockMonths: [],
    liveDataSource: null,
    liveDataNote: null,
    cost: 'Food and mezcal in Oaxaca is remarkably cheap. Accommodation doubles Nov 1–2 — book months in advance.',
    proTip: 'Visit the Xoxocotlán cemetery at midnight Nov 1st. Families gather with candles, food, and music. You\'re invited to observe — be respectful, not a spectator.',
    wrongAssumption: 'Day of the Dead is a Mexican Halloween. It is the opposite — a tender, joyful, and genuinely moving reunion with ancestors.',
    unlock: null,
  },

  {
    id: 'carnevale-venezia',
    name: 'Carnevale di Venezia — Venice, Italy',
    tagline: 'Elaborate masks. Historic palazzos. The whole city plays dress-up.',
    category: 'gathering',
    gateway: 'VCE',
    gatewayCity: 'Venice',
    accessNote: 'The 10 days before Lent (usually late January–February). Venice transforms into a city of masquerade — costumed figures in baroque masks photographing each other in front of Renaissance buildings. Historic balls ($300–600/person) and free outdoor spectacle both exist.',
    flightEst: '$450–700 rt from East Coast',
    months: [2],
    peakMonths: [2],
    hardBlockMonths: [],
    liveDataSource: null,
    liveDataNote: 'Dates shift with the Easter calendar — confirm yearly.',
    cost: 'St. Mark\'s Square is free. Palazzo balls $300–600/person. Masks €20–200 from artisan shops.',
    proTip: 'The best photos happen at dawn before the crowds arrive — gondoliers, mist, and a lone masked figure. 7–8am.',
    wrongAssumption: null,
    unlock: null,
  },

  {
    id: 'holi-india',
    name: 'Holi — India & Nepal',
    tagline: 'The festival of colors. The whole city dissolves into flying pigment.',
    category: 'gathering',
    gateway: 'DEL',
    gatewayCity: 'Delhi',
    accessNote: 'Hindu spring festival, usually March. The most immersive Holi is in Mathura and Vrindavan (2hrs from Delhi) — where it runs for 10 days, not just one. Delhi and Jaipur also have massive public celebrations. Nepal (KTM) has equally vibrant Holi with less tourist infrastructure and lower cost.',
    flightEst: '$650–900 rt from US East Coast',
    months: [3],
    peakMonths: [3],
    hardBlockMonths: [],
    liveDataSource: null,
    liveDataNote: 'Date is the full moon of Phalguna on the Hindu calendar — usually March, confirmed months in advance.',
    cost: 'Holi colors $1–2/bag. Accommodation Mathura $30–80/night.',
    proTip: 'Wear clothes you\'ll throw away. Protect your eyes with goggles. Natural colors (gulal) stain less than synthetic. The real show is Vrindavan\'s widow ashrams, who haven\'t been allowed to celebrate for decades and now do.',
    wrongAssumption: null,
    unlock: null,
  },

  {
    id: 'running-of-bulls-pamplona',
    name: 'Running of the Bulls — Pamplona, Spain',
    tagline: 'San Fermín festival. Eight days. One species with all the leverage.',
    category: 'gathering',
    gateway: 'MAD',
    gatewayCity: 'Madrid → Pamplona bus/train',
    accessNote: 'July 6–14. The encierro (running of the bulls) happens at 8am each morning — 825 meters, 6 fighting bulls, several hundred runners. Most visitors watch from barricades or balcony tickets ($30–60). The rest of San Fermín is concerts, fireworks, and non-stop revelry.',
    flightEst: '$450–700 rt to MAD; €20 bus to Pamplona',
    months: [7],
    peakMonths: [7],
    hardBlockMonths: [],
    liveDataSource: null,
    liveDataNote: null,
    cost: 'Festival free. Running participation free (and legal). Balcony viewing $30–60. Accommodation triples — book months in advance.',
    proTip: 'You don\'t have to run. The best viewing is from the corner at Estafeta Street — bulls bunch up here. Balcony tickets available via sanfermin.com.',
    wrongAssumption: null,
    unlock: null,
  },

  {
    id: 'la-tomatina',
    name: 'La Tomatina — Buñol, Spain',
    tagline: 'Last Wednesday of August. 150,000 tomatoes. Everyone is drenched.',
    category: 'gathering',
    gateway: 'MAD',
    gatewayCity: 'Madrid or Valencia',
    accessNote: 'The last Wednesday of August in Buñol (1hr from Valencia, 3hrs from Madrid). A one-hour tomato battle involving around 20,000 participants — by the end the streets run red. Tickets now required (€10–15). Combine with Valencia\'s architecture and beach.',
    flightEst: '$450–700 rt to MAD or VLC',
    months: [8],
    peakMonths: [8],
    hardBlockMonths: [],
    liveDataSource: null,
    liveDataNote: null,
    cost: 'Tomato fight ticket €10–15. Accommodation Valencia $80–130/night.',
    proTip: 'Wear old shoes — they are ruined. Protect your phone in a waterproof case. Goggles optional but sensible. The crowd compresses — arrive early for a position with room.',
    wrongAssumption: null,
    unlock: null,
  },

  {
    id: 'ice-hotel-sweden',
    name: 'Ice Hotel — Jukkasjärvi, Sweden',
    tagline: 'Rebuilt every December from Torne River ice. Sleep in a room carved from frozen water.',
    category: 'immersive',
    gateway: 'ARN',
    gatewayCity: 'Stockholm → Kiruna domestic',
    accessNote: 'The original ICEHOTEL in Jukkasjärvi (Kiruna, Lapland) has been rebuilt annually since 1990. Artist-designed ice rooms, reindeer pelts as bedding, and -5°C indoor temperatures. Now also has the ICEHOTEL 365 — a permanent cooled section open year-round. Aurora viewing from the adjacent warm cabins.',
    flightEst: '$650–800 rt + domestic to Kiruna',
    months: [12,1,2,3],
    peakMonths: [1,2],
    hardBlockMonths: [],
    liveDataSource: null,
    liveDataNote: null,
    cost: 'Ice room $300–500/night. Warm cabin (adjacent) $200–300. Art Suite (custom room) $600–900.',
    proTip: 'You sleep in a sleeping bag designed for these temps — it\'s cozy, not miserable. The morning sauna and hot lingonberry juice are part of the ritual.',
    wrongAssumption: 'Ice hotel costs $800+/night. Warm cabins adjacent to the ice building are $200–300 and you still get the experience.',
    unlock: null,
  },

  {
    id: 'monsoon-kerala',
    name: 'Monsoon Season — Kerala, India',
    tagline: 'Counterintuitively magical. Rice boat cruises while rain pours.',
    category: 'immersive',
    gateway: 'COK',
    gatewayCity: 'Kochi, Kerala',
    accessNote: 'July–August. The monsoon turns the Western Ghats a deep, impossible green. Kettuvallam (rice boat) houseboats cruise the backwater canals while rain falls on the roof. Ayurveda treatments are considered most effective during monsoon (higher humidity). 40–60% lower prices. Most tourists avoid this season entirely — their loss.',
    flightEst: '$700–1,000 rt from US (via Dubai/Doha)',
    months: [6,7,8,9],
    peakMonths: [7,8],
    hardBlockMonths: [],
    liveDataSource: null,
    liveDataNote: null,
    cost: 'Houseboat overnight $80–150 for private boat. Kochi accommodation $40–80/night.',
    proTip: 'The rain doesn\'t fall continuously — it comes in dramatic sheets, then breaks. The backwater cruise in the rain is the point.',
    wrongAssumption: 'Don\'t travel in monsoon season. Kerala in the monsoon is deliberately sought by those who know — the lush is maximal, the prices are low, the crowds are gone.',
    unlock: null,
  },

  {
    id: 'midnight-sun-marathon-tromso',
    name: 'Midnight Sun Marathon — Tromsø, Norway',
    tagline: 'Run a full marathon at midnight in broad daylight',
    category: 'immersive',
    gateway: 'OSL',
    gatewayCity: 'Oslo → Tromsø domestic',
    accessNote: 'June. The Midnight Sun Marathon starts at midnight when the sun is still fully above the horizon. 70°N latitude means no darkness. Runners from 50+ countries. Registration opens in autumn for June race. Also available: half marathon, 10K, children\'s races.',
    flightEst: '$600–750 rt from East Coast',
    months: [6],
    peakMonths: [6],
    hardBlockMonths: [],
    liveDataSource: null,
    liveDataNote: null,
    cost: 'Registration ~$100. Tromsø accommodation $120–200/night.',
    proTip: 'Race starts 8:30pm (full marathon), finishes in midnight sun. Bring sunglasses. The post-race breakfast at 2am in full daylight is disorienting in the best way.',
    wrongAssumption: null,
    unlock: null,
  },

  {
    id: 'songkran-thailand',
    name: 'Songkran Water Festival — Thailand',
    tagline: 'Thai New Year. Cities turn into 72-hour water fights.',
    category: 'gathering',
    gateway: 'BKK',
    gatewayCity: 'Bangkok',
    accessNote: 'April 13–15 (sometimes extended). Thai New Year is celebrated by dousing everyone you meet with water — from plastic cups to water cannons to pickup trucks with tanks. Bangkok\'s Silom Road and Khao San Road are epicenters. Chiang Mai is considered the most immersive version. Hot season timing makes the water genuinely welcome.',
    flightEst: '$550–800 rt from West Coast; $700–950 from East Coast',
    months: [4],
    peakMonths: [4],
    hardBlockMonths: [],
    liveDataSource: null,
    liveDataNote: null,
    cost: 'Water guns $2–5. Plastic bag phone protectors $1. Accommodation doubles in Chiang Mai — book months ahead.',
    proTip: 'Chiang Mai moat area is the best urban battle zone. Protect your phone — it will get soaked.',
    wrongAssumption: null,
    unlock: null,
  },

  {
    id: 'truffle-season-france-italy',
    name: 'Truffle Season — Périgord (France) & Umbria/Alba (Italy)',
    tagline: 'Black truffles hunted with dogs. White truffles in October at Alba.',
    category: 'culinary',
    gateway: ['CDG','FCO'],
    gatewayCity: 'Paris → Périgord; Rome → Umbria / Turin → Alba',
    accessNote: 'Black truffles in Périgord (Dordogne) and Umbria: October–December. White truffles in Alba, Piedmont: October only. Alba\'s Truffle Fair is the pilgrimage — auction, tasting, truffle hunting with dogs. A once-a-year thing.',
    flightEst: '$400–700 rt to CDG or FCO',
    months: [10,11,12],
    peakMonths: [10,11],
    hardBlockMonths: [],
    liveDataSource: null,
    liveDataNote: null,
    cost: 'Truffle hunting experience in Périgord $80–120/person. Alba Fair entry free; white truffle $200–400/100g.',
    proTip: 'For Périgord: rent a farmhouse outside Sarlat, hire a local hunter. The hunting is the experience — not just the eating.',
    wrongAssumption: null,
    unlock: null,
  },

  {
    id: 'salmon-run-alaska',
    name: 'Salmon Run — Brooks Falls, Alaska',
    tagline: 'Grizzly bears catch leaping sockeye salmon in midair. Peak September.',
    category: 'wildlife',
    gateway: 'ANC',
    gatewayCity: 'Anchorage → King Salmon floatplane',
    accessNote: 'Katmai National Park, accessible by small plane from King Salmon. July sees the first run (July Falls, highest bear count); September is quieter, bears at peak weight, more fish. The Brooks Falls platform puts you 50 feet from 12+ bears simultaneously. Famous from the Fat Bear Week rankings.',
    flightEst: '$400–600 rt to ANC; $350–500 floatplane from King Salmon',
    months: [7,9],
    peakMonths: [9],
    hardBlockMonths: [],
    liveDataSource: null,
    liveDataNote: null,
    cost: 'Park fee $15. Floatplane ~$400–500 rt. Brown Bear cabin overnight $60–100.',
    proTip: 'September is less crowded than July (Fat Bear season media peak). Fish still running, bears actively feeding. October is when they\'re gorged and waddling — amusing, not dramatic.',
    wrongAssumption: null,
    unlock: null,
  },

  {
    id: 'diwali-india',
    name: 'Diwali — India (Jaipur & Varanasi)',
    tagline: 'The festival of lights. Diyas, fireworks, and sweets everywhere.',
    category: 'gathering',
    gateway: 'DEL',
    gatewayCity: 'Delhi',
    accessNote: 'October or November (Hindu lunar calendar). Varanasi on Diwali night — thousands of oil lamps floating on the Ganges, fireworks reflecting in the river, ghats packed with worshippers — is one of the most visually overwhelming experiences in the world. Jaipur\'s old city blazes. 2–3hr train from Delhi to either city.',
    flightEst: '$650–900 rt from US East Coast',
    months: [10,11],
    peakMonths: [10,11],
    hardBlockMonths: [],
    liveDataSource: null,
    liveDataNote: 'Date set by Hindu lunar calendar — confirmed 2–3 months in advance.',
    cost: 'Varanasi accommodation $30–80/night. Train from Delhi $10–30.',
    proTip: 'Take a dawn boat on the Ganges the morning after Diwali — thousands of diyas still floating, smoke from the night still in the air.',
    wrongAssumption: null,
    unlock: null,
  },


  // ══════════════════════════════════════════════════════════════════
  // ANCIENT / HUMAN-SCALE WONDERS
  // ══════════════════════════════════════════════════════════════════

  {
    id: 'chichen-itza',
    name: 'Chichén Itzá & Yucatán Ruins — Mexico',
    tagline: 'New Seven Wonders. 2.5hr from Cancún.',
    category: 'ancient',
    gateway: 'CUN',
    gatewayCity: 'Cancún',
    accessNote: '2.5hr bus or 1hr car from Cancún. Also accessible via the colonial city of Valladolid (stay there instead of the tourist zone). Cobá offers climbing the pyramid (now prohibited at Chichén Itzá). Ek Balam is 45min from Valladolid and still climbable with almost no visitors.',
    flightEst: '$280–400 rt from most US cities',
    months: [11,12,1,2,3,4,5],
    peakMonths: [12,1,2,3],
    hardBlockMonths: [],
    liveDataSource: null,
    liveDataNote: null,
    cost: 'Entry $30 adults. Tour with guide $60–80/person from Cancún.',
    proTip: 'Base in Valladolid, not Cancún — 45min to Chichén Itzá, beautiful colonial city, cenotes nearby. Half the price.',
    wrongAssumption: 'Ancient pyramids require Egypt or far travel. Chichén Itzá is $280 from anywhere in the US and 2.5hrs from the beach.',
    unlock: null,
  },

  {
    id: 'lost-city-colombia',
    name: 'Lost City Trek — Colombia',
    tagline: 'Older than Machu Picchu. Deeper in the jungle. A tenth of the cost.',
    category: 'ancient',
    gateway: 'CTG',
    gatewayCity: 'Cartagena',
    accessNote: '4-day guided jungle trek to Ciudad Perdida (Teyuna), older than Machu Picchu and reached through active indigenous communities. Starts in Santa Marta (2hr bus from Cartagena). All-inclusive guided tour $350/person. No independent hiking permitted — must go with licensed agency.',
    flightEst: '$280–400 rt to CTG (Cartagena) from MIA',
    months: [12,1,2,3,4,5,6,7,8,9,10,11],
    peakMonths: [12,1,2,3],
    hardBlockMonths: [],
    liveDataSource: null,
    liveDataNote: null,
    cost: '$350/person all-inclusive (food, guides, hammocks). Santa Marta accommodation $30–60/night.',
    proTip: 'Book through Turcol or Magic Tour Colombia — the two licensed operators. 4 days is harder than it looks. Bring dry bags.',
    wrongAssumption: 'Machu Picchu is the only lost city. Ciudad Perdida is older, less visited, and $350 all-in vs. $1,500+ for Peru.',
    unlock: null,
  },
];


// ══════════════════════════════════════════════════════════════════════════════
// CHOCOLATE EXPERIENCES — DEDICATED SECTION
// ══════════════════════════════════════════════════════════════════════════════
//
// Three tiers:
//   'grand'       — flagship festivals, 5+ days, 10,000+ attendees
//   'specialist'  — curated festivals, deep knowledge focus
//   'origin'      — pilgrimages to cacao's birthplace; immersive, soulful
//
// ──────────────────────────────────────────────────────────────────────────────

const CHOCOLATE_EXPERIENCES = [

  // ─── EUROPE ───────────────────────────────────────────────────────────────

  {
    id: 'choc-eurochocolate-perugia',
    name: 'Eurochocolate — Perugia, Italy',
    tagline: 'Europe\'s largest chocolate festival. 10 days in a medieval Umbrian city.',
    tier: 'grand',
    category: 'chocolate',
    gateway: 'FCO',
    gatewayCity: 'Rome → Perugia (2hr train)',
    month: 10,
    monthLabel: 'October',
    accessNote: 'Running since 1993. 900,000+ visitors, chocolate sculptures the size of cars, live music, cooking classes, and the Chocoshow (artisan tasting market). Perugia itself is one of Italy\'s most beautiful medieval hilltowns.',
    flightEst: '$400–700 rt to FCO',
    cost: 'Entry free. Tasting tokens $10–30. Cooking classes $40–80.',
    proTip: 'The first weekend is peak crowd. Mid-week is better for the artisan market — shorter lines, more time with the chocolatiers.',
    highlight: 'Chocolate sculpture competition: life-size works from 400kg blocks',
    pairingNote: 'Combine with Umbrian truffles (same season) — Norcia truffle hunting is 1.5hr from Perugia.',
  },

  {
    id: 'choc-cioccolato-turin',
    name: 'CioccolaTò — Turin, Italy',
    tagline: 'In the city that invented the chocolate bar. November.',
    tier: 'grand',
    category: 'chocolate',
    gateway: 'MXP',
    gatewayCity: 'Milan → Turin (1hr train)',
    month: 11,
    monthLabel: 'November',
    accessNote: 'Turin (Torino) is the historic capital of Italian chocolate — the city that combined cocoa with hazelnuts to create gianduja, the ancestor of Nutella. CioccolaTò is held in Turin\'s elegant arcaded streets, with master chocolatiers showcasing the city\'s deep tradition.',
    flightEst: '$400–650 rt to MXP',
    cost: 'Entry free. Tasting passes $15–30.',
    proTip: 'Visit Caffè Al Bicerin — Turin\'s most famous café since 1763, serving the bicerin (coffee, chocolate, cream). The drink Turin invented. Then walk to Guido Gobino\'s workshop.',
    highlight: 'Gianduja: Turin\'s indigenous chocolate-hazelnut invention, tasted at its source',
    pairingNote: 'Combine with the white truffle season at the Alba Truffle Fair (1hr from Turin, same month).',
  },

  {
    id: 'choc-salon-paris',
    name: 'Salon du Chocolat — Paris, France',
    tagline: 'Chocolate fashion show. 300 exhibitors. 25 years running.',
    tier: 'grand',
    category: 'chocolate',
    gateway: 'CDG',
    gatewayCity: 'Paris',
    month: 10,
    monthLabel: 'October/November',
    accessNote: 'The Salon du Chocolat Paris (Porte de Versailles) draws 180,000+ visitors over 5 days. The famous Chocolate Fashion Show features couture dresses collaboratively designed by leading chocolatiers and fashion designers — wearable chocolate garments on the runway. 300+ exhibitors from 60 countries.',
    flightEst: '$400–700 rt from East Coast',
    cost: 'Entry €18 adults. Tastings additional.',
    proTip: 'The press/industry days (first two days) are theoretically restricted but the chocolate show itself is open. Book well ahead — tickets sell out.',
    highlight: 'Chocolate Fashion Show: runway gowns made entirely of chocolate by top chocolatiers',
    pairingNote: null,
  },

  {
    id: 'choc-salon-brussels',
    name: 'Salon du Chocolat — Brussels, Belgium',
    tagline: 'Three days. Belgian chocolate. A Fashion Show of chocolate dresses.',
    tier: 'grand',
    category: 'chocolate',
    gateway: 'BRU',
    gatewayCity: 'Brussels',
    month: 2,
    monthLabel: 'February',
    accessNote: 'The Brussels edition of the Salon du Chocolat is a 3-day event at Tour & Taxis, featuring its own Chocolate Fashion Show with models in dresses by Belgian and international designers. Brussels is the world capital of pralines — fitting venue for a festival devoted to chocolate as art.',
    flightEst: '$400–650 rt from East Coast',
    cost: 'Entry ~€15. Tasting extras.',
    proTip: 'Pierre Marcolini\'s flagship is a 10-min walk from Grand Place. Buy single-origin tablets alongside the festival.',
    highlight: 'Belgian praline masters demonstrating hand-rolling and ganache filling live',
    pairingNote: 'Combine with Carnevale di Venezia (same month) as a European February double feature.',
  },

  {
    id: 'choc-chocolart-tubingen',
    name: 'chocolART — Tübingen, Germany',
    tagline: 'Germany\'s largest chocolate festival, nested inside the Christmas Market.',
    tier: 'specialist',
    category: 'chocolate',
    gateway: 'STR',
    gatewayCity: 'Stuttgart → Tübingen (1hr)',
    month: 12,
    monthLabel: 'December',
    accessNote: 'Held in Tübingen\'s medieval marketplace alongside the town\'s Christmas Market, chocolART spans 10,000 square meters with fine chocolate tastings, praline courses, cocoa painting workshops, and what organizers call "chocolate lectures." Tübingen is one of Germany\'s most beautiful university towns.',
    flightEst: '$400–650 rt to STR or FRA',
    cost: 'Entry ~€8. Workshops €20–50.',
    proTip: 'The praline-making workshop (2hrs) is the sleeper event — sold out quickly. Book when tickets open.',
    highlight: 'The Christmas Market + chocolate festival overlap: mulled wine, spiced chocolate, and snow',
    pairingNote: null,
  },

  {
    id: 'choc-chocolate-love-terni',
    name: 'Chocolate Love Festival — Terni, Italy',
    tagline: 'Valentine\'s city + chocolate festival. Streets full of sculptures and sweets.',
    tier: 'specialist',
    category: 'chocolate',
    gateway: 'FCO',
    gatewayCity: 'Rome → Terni (1.5hr train)',
    month: 2,
    monthLabel: 'February',
    accessNote: 'Terni is the birthplace of Valentine\'s Day (Saint Valentine was bishop here). The February Chocolate Love Festival fills the city\'s piazzas with chocolatiers, guided Choco Tours through the medieval streets, chocolate sculptures, and patisserie demonstrations.',
    flightEst: '$400–700 rt to FCO',
    cost: 'Entry free. Tours €10–20.',
    proTip: 'The "Choco Tour" (guided walk hitting 8–10 artisan stops) is the best value. Ends at the Basilica di San Valentino.',
    highlight: 'Chocolate sculptures in the piazza + the city that invented Valentine\'s Day',
    pairingNote: null,
  },

  {
    id: 'choc-radovljica-slovenia',
    name: 'Radovljica Chocolate Festival — Slovenia',
    tagline: 'Charming medieval town. Small festival, serious chocolate.',
    tier: 'specialist',
    category: 'chocolate',
    gateway: 'LJU',
    gatewayCity: 'Ljubljana',
    month: 4,
    monthLabel: 'April',
    accessNote: 'Radovljica is a beautifully preserved medieval Slovenian town an hour from Ljubljana and 30min from Lake Bled. The April chocolate festival is intimate compared to Paris or Perugia — master chocolatiers, tastings, and demonstrations in a fairy-tale setting. Perfect addition to a Ljubljana / Bled trip.',
    flightEst: '$450–700 rt to LJU or VIE',
    cost: 'Entry free to low cost.',
    proTip: 'Pair with Lake Bled (30min, arguably the most photographed lake in Europe) and Ljubljana\'s Central Market for a long weekend.',
    highlight: 'Small-town intimacy: chocolatiers know your name by Day 2',
    pairingNote: 'Radovljica + Lake Bled + Ljubljana = one of Central Europe\'s best long-weekend routes.',
  },

  {
    id: 'choc-chocolate-week-london',
    name: 'Chocolate Week — London, UK',
    tagline: 'Chocolate jewelry. Chocolate art. Chocolate afternoon tea. A Chocolate Theatre.',
    tier: 'specialist',
    category: 'chocolate',
    gateway: 'LHR',
    gatewayCity: 'London',
    month: 10,
    monthLabel: 'October',
    accessNote: 'Chocolate Week (usually mid-October) is a city-wide celebration across London — afternoon tea menus, chocolate jewelry pop-ups, tempering workshops at Borough Market and Fortnum & Mason, and the Chocolate Theatre with celebrity chef demonstrations.',
    flightEst: '$400–700 rt from East Coast',
    cost: 'Most events free–£20. Afternoon tea £35–80.',
    proTip: 'Book the Fortnum & Mason tempering workshop and Paul A Young\'s ganache class — both sell out in the first week tickets open.',
    highlight: 'The Chocolate Theatre at Westfield: live demonstrations by Michelin-starred pastry chefs',
    pairingNote: null,
  },

  {
    id: 'choc-opatija-croatia',
    name: 'Opatija Chocolate Festival — Croatia',
    tagline: 'Adriatic coastal town. Top chocolatiers. Live demonstrations.',
    tier: 'specialist',
    category: 'chocolate',
    gateway: 'RJK',
    gatewayCity: 'Rijeka → Opatija (30min)',
    month: 3,
    monthLabel: 'Spring',
    accessNote: 'Opatija is a Habsburg-era resort town on the Istrian Riviera — palm trees, Art Nouveau villas, and the Adriatic. The spring chocolate festival brings together Croatian and international chocolatiers for tastings, live demonstrations, and a market in the seafront promenade.',
    flightEst: '$450–700 rt to ZAG or RJK',
    cost: 'Entry free to low cost.',
    proTip: 'Pair with the Istrian wine region (30min inland) and Pula\'s Roman amphitheater for a remarkable 5-day Adriatic route.',
    highlight: 'Seafront tasting with the Adriatic as backdrop — one of the more scenic festival settings',
    pairingNote: null,
  },

  {
    id: 'choc-stockholm-choklad',
    name: 'Stockholm Choklad Festivalen — Sweden',
    tagline: 'Nordic chocolate artistry. Baking and confectionery showcase.',
    tier: 'specialist',
    category: 'chocolate',
    gateway: 'ARN',
    gatewayCity: 'Stockholm',
    month: 11,
    monthLabel: 'Autumn',
    accessNote: 'Stockholm\'s Chocolate Festival showcases Scandinavian chocolate and baking artistry — a reflection of Sweden\'s serious fika culture and world-class pastry tradition. Intimate, design-forward, and food-nerd focused.',
    flightEst: '$450–700 rt from East Coast',
    cost: 'Tickets €20–40.',
    proTip: 'Combine with a visit to Vete-Katten, Stockholm\'s legendary konditori (pastry shop) since 1928. Princess cake, cinnamon rolls, and their house chocolate.',
    highlight: 'Nordic minimalism applied to chocolate: less sweetness, more complexity',
    pairingNote: null,
  },


  // ─── AMERICAS ─────────────────────────────────────────────────────────────

  {
    id: 'choc-grenada-festival',
    name: 'Grenada Chocolate Festival — Caribbean',
    tagline: 'Seed to bar. Work as a cocoa farmer for a day.',
    tier: 'origin',
    category: 'chocolate',
    gateway: 'GND',
    gatewayCity: 'Grenada',
    month: 5,
    monthLabel: 'May',
    accessNote: 'Running since 2014 on the Spice Isle. The festival follows the full journey from cacao pod to finished bar — plantation visits, pod harvesting, fermentation tanks, drying tables, and bean-to-bar production. Participants can spend a day working as a cocoa farmer. Grenada Chocolate Company and Diamond Chocolate are among the world\'s most awarded small producers.',
    flightEst: '$300–500 rt from East Coast via Barbados or Trinidad',
    cost: 'Festival events $20–80/day. Accommodation $80–150/night.',
    proTip: 'Pre-book the plantation immersion day — limited spots. Belmont Estate is the gold standard for the full cocoa-to-bar experience.',
    highlight: 'You harvest the pods. You taste the chocolate made from those pods. The same day.',
    pairingNote: 'Grenada\'s nutmeg is equally world-class — the "Spice Isle" moniker is earned. Pair chocolate with nutmeg ice cream.',
  },

  {
    id: 'choc-st-lucia-heritage',
    name: 'St. Lucia Chocolate Heritage Festival',
    tagline: 'Cocoa farms, heritage experiences, and chocolate spa treatments',
    tier: 'origin',
    category: 'chocolate',
    gateway: 'UVF',
    gatewayCity: 'St. Lucia',
    month: 8,
    monthLabel: 'August',
    accessNote: 'St. Lucia has been exporting cacao since the 18th century. The Chocolate Heritage Festival includes special cocoa farm tours, heritage experiences tracing cacao\'s colonial history, chocolate spa treatments (cacao wraps at resort spas), and savory + sweet chocolate food pairing events.',
    flightEst: '$350–550 rt from East Coast',
    cost: 'Farm tours $30–60. Chocolate spa $80–150.',
    proTip: 'Rabot Estate (Hotel Chocolat\'s St. Lucia property) is the apex experience — they own the plantation and serve everything made from it on-site.',
    highlight: 'Chocolate spa: cacao body scrub + wrap using beans harvested 200 meters away',
    pairingNote: null,
  },

  {
    id: 'choc-belize-festival',
    name: 'Belize Chocolate Festival — Punta Gorda',
    tagline: 'The chocolate capital of Belize. Cacao was currency here.',
    tier: 'origin',
    category: 'chocolate',
    gateway: 'BZE',
    gatewayCity: 'Belize City → Punta Gorda (1hr flight)',
    month: 5,
    monthLabel: 'May',
    accessNote: 'Three-day festival in Punta Gorda, the Toledo District — the heart of Belizean cacao culture and home to the Mayan farmers who have grown cacao for millennia. The festival pays explicit homage to cacao\'s ancient role as currency and food of the gods. Cacao tastings, farm visits, traditional Maya chocolate ceremony, and bean-to-bar workshops.',
    flightEst: '$300–500 rt to BZE from East Coast; $60 domestic to PND',
    cost: 'Events $20–60. Accommodation $50–100/night.',
    proTip: 'Visit the Che\'il Organic Farm before the festival — they grow heritage Criollo cacao, considered the most complex and rare variety in the world.',
    highlight: 'Traditional Maya cacao ceremony: cacao ground by hand, mixed with water and spices, drunk from a gourd',
    pairingNote: 'Pair with a day trip to Lubaantun — the Maya ruin where the famous Crystal Skull was found, 30min from Punta Gorda.',
  },

  {
    id: 'choc-albuquerque-sw',
    name: 'Southwest Chocolate & Coffee Fest — Albuquerque, NM',
    tagline: 'Claims to be the world\'s largest chocolate + coffee festival. 200 vendors.',
    tier: 'specialist',
    category: 'chocolate',
    gateway: 'ABQ',
    gatewayCity: 'Albuquerque, NM',
    month: 4,
    monthLabel: 'April',
    accessNote: 'Two days at the Albuquerque Convention Center. 200+ vendors, 22,000+ attendees, competitions, demonstrations, and a "World Mocktail Championship." The domestic US option for serious chocolate immersion without international travel.',
    flightEst: '$200–350 rt from most US cities',
    cost: 'Entry $20–30. Vendor tastings usually included.',
    proTip: 'Combine with a weekend in Santa Fe (1hr north) — green chile chocolate is its own category worth exploring.',
    highlight: 'Bean-to-bar education track: full seminars on origin, processing, and pairing',
    pairingNote: null,
  },

  {
    id: 'choc-northwest-seattle',
    name: 'Northwest Chocolate Festival — Seattle, WA',
    tagline: 'The premier bean-to-bar craft chocolate gathering in North America.',
    tier: 'specialist',
    category: 'chocolate',
    gateway: 'SEA',
    gatewayCity: 'Seattle',
    month: 11,
    monthLabel: 'November',
    accessNote: 'Considered the most serious chocolate enthusiast event in the US. Two days focused on craft bean-to-bar chocolate — cacao origin sessions, fermentation science, flavor pairing, and direct access to the makers. More seminars than spectacle. Not for casual chocolate lovers; for people who want to understand what they\'re tasting.',
    flightEst: '$150–300 rt from most US cities',
    cost: 'Tickets $40–60. Additional seminar passes available.',
    proTip: 'Pre-register for the masterclass sessions — cacao origin tastings with the farmers present via video call.',
    highlight: 'The only US festival with a structured cacao origin program: taste 12 origins side by side',
    pairingNote: null,
  },

  {
    id: 'choc-big-island-hawaii',
    name: 'Big Island Chocolate Festival — Hawaii',
    tagline: 'Hawaiian-grown cacao. Beach resort. Farmers present.',
    tier: 'specialist',
    category: 'chocolate',
    gateway: 'KOA',
    gatewayCity: 'Kona, Hawaii (Big Island)',
    month: 4,
    monthLabel: 'April',
    accessNote: 'Set at a beachside resort on the Kohala Coast, with a focus on Hawaiian-grown cacao (the only US state producing commercial cacao). Farm tours, chocolate-inspired cuisine, tastings, and demonstrations — with the farmers who grew the beans in attendance.',
    flightEst: '$400–700 rt from West Coast; $600–900 from East Coast',
    cost: 'Entry $60–100. Resort accommodation $150–300/night.',
    proTip: 'The day-before farm tour (Madre Chocolate, Manoa Chocolate) is better than the main festival day — intimate and educational.',
    highlight: 'The only festival where you\'re in the same US state as the cacao farm',
    pairingNote: null,
  },


  // ─── ORIGIN PILGRIMAGES ───────────────────────────────────────────────────

  {
    id: 'choc-oaxaca-origin',
    name: 'Chocolate Pilgrimage — Oaxaca & Chiapas, Mexico',
    tagline: 'One of cacao\'s ancient homelands. The chocolate is as old as civilization here.',
    tier: 'origin',
    category: 'chocolate',
    gateway: 'OAX',
    gatewayCity: 'Oaxaca',
    month: 9,
    monthLabel: 'September (festival) + year-round',
    accessNote: 'Oaxaca is simultaneously the home of mole negro (the world\'s most complex chocolate sauce), artisanal hand-ground chocolate (grind your own in the Mercado 20 de Noviembre), and a September cacao festival in San Cristóbal de las Casas (Chiapas, 6hr bus). The Mixtec and Zapotec people have cultivated cacao here for 3,000 years.',
    flightEst: '$300–450 rt to MEX + $60–80 domestic OAX',
    cost: 'Chocolate grinding tours $15–30. Markets $1–5 per tablet.',
    proTip: 'Visit Chocolate Mayordomo or Guelaguetza Mole shop on Calle Mina. Then go to Molino El Pujol and watch them grind cacao, sugar, and cinnamon into your custom bar in 10 minutes.',
    highlight: 'Watching a 3,000-year-old process: cacao nibs stone-ground into drinking chocolate before your eyes',
    pairingNote: 'Pair with Día de los Muertos (same city, November 1–2) for the full Oaxaca pilgrimage.',
  },

  {
    id: 'choc-india-emerging',
    name: 'India Cacao & Craft Chocolate Festival',
    tagline: 'India\'s emerging bean-to-bar scene. Farmers, chocolatiers, sustainability.',
    tier: 'origin',
    category: 'chocolate',
    gateway: 'BLR',
    gatewayCity: 'Bengaluru (Bangalore)',
    month: 10,
    monthLabel: 'October',
    accessNote: 'India is an emerging origin for single-estate craft chocolate, particularly from Kerala, Karnataka, and Tamil Nadu. The India Cacao & Craft Chocolate Festival brings together cacao farmers, craft chocolatiers, and sustainability experts to spotlight India\'s bean-to-bar movement — one of the few festivals where origin farmers and finished-product makers share the same stage.',
    flightEst: '$700–1,000 rt from US (via Dubai/Doha)',
    cost: 'Tickets $20–40. Accommodation $50–100/night in Bengaluru.',
    proTip: 'Pair with Kerala (3hr from Bengaluru) — active cacao farms open for visits year-round. Pacari and Mason & Co. source from here.',
    highlight: 'Direct conversation with cacao farmers and finished-bar makers — rare anywhere in the world',
    pairingNote: null,
  },
];


// ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────

/**
 * Filter bucket list experiences by category
 */
function getExperiencesByCategory(category) {
  const all = [...BUCKET_LIST_EXPERIENCES, ...CHOCOLATE_EXPERIENCES];
  return all.filter(e => e.category === category);
}

/**
 * Filter experiences by month (1=Jan, 12=Dec)
 */
function getExperiencesByMonth(month) {
  const bucketList = BUCKET_LIST_EXPERIENCES.filter(e =>
    e.months && e.months.includes(month)
  );
  const chocolate = CHOCOLATE_EXPERIENCES.filter(e =>
    e.month === month
  );
  return [...bucketList, ...chocolate];
}

/**
 * Filter experiences by gateway IATA code
 */
function getExperiencesByGateway(iata) {
  const all = [...BUCKET_LIST_EXPERIENCES, ...CHOCOLATE_EXPERIENCES];
  return all.filter(e => {
    if (Array.isArray(e.gateway)) return e.gateway.includes(iata);
    return e.gateway === iata;
  });
}

/**
 * Get all hard-blocked experiences for a given set of trip months
 * Used to filter the witness gallery — don't show impossible experiences
 */
function getHardBlockedExperiences(tripMonths) {
  return BUCKET_LIST_EXPERIENCES.filter(e =>
    e.hardBlockMonths &&
    e.hardBlockMonths.some(m => tripMonths.includes(m)) &&
    !e.months.some(m => tripMonths.includes(m))
  );
}

/**
 * Get experiences with live forecast data — for trip live tracker feature
 */
function getLiveTrackableExperiences() {
  return BUCKET_LIST_EXPERIENCES.filter(e => e.liveDataSource !== null);
}

/**
 * Get all chocolate experiences by tier
 */
function getChocolateByTier(tier) {
  return CHOCOLATE_EXPERIENCES.filter(e => e.tier === tier);
}

/**
 * Build a "What can I witness?" experience gallery for the UI
 * Given a user's trip months, returns categorized experiences
 * sorted by: perfect match → partial match → excluded with reason
 */
function buildWitnessGallery(tripMonths) {
  const gallery = {
    perfect: [],   // peak months overlap
    valid: [],     // valid months overlap but not peak
    offSeason: [], // experience exists but timing is wrong — with explanation
  };

  for (const exp of BUCKET_LIST_EXPERIENCES) {
    if (!exp.months) continue;

    const isPeak = exp.peakMonths && exp.peakMonths.some(m => tripMonths.includes(m));
    const isValid = exp.months.some(m => tripMonths.includes(m));
    const isHardBlocked = exp.hardBlockMonths &&
      exp.hardBlockMonths.some(m => tripMonths.includes(m)) &&
      !isValid;

    if (isPeak) {
      gallery.perfect.push({ ...exp, matchType: 'perfect' });
    } else if (isValid) {
      gallery.valid.push({ ...exp, matchType: 'valid' });
    } else if (isHardBlocked) {
      // Don't add to gallery — impossible experience, skip silently
    } else {
      // Off-season — show with honest tradeoff
      gallery.offSeason.push({ ...exp, matchType: 'offSeason' });
    }
  }

  return gallery;
}


// ─── EXPORTS ──────────────────────────────────────────────────────────────────

const ALL_EXPERIENCES = [...BUCKET_LIST_EXPERIENCES, ...CHOCOLATE_EXPERIENCES];

module.exports = {
  BUCKET_LIST_EXPERIENCES,
  CHOCOLATE_EXPERIENCES,
  ALL_EXPERIENCES,
  EXPERIENCE_CATEGORIES,
  getExperiencesByCategory,
  getExperiencesByMonth,
  getExperiencesByGateway,
  getHardBlockedExperiences,
  getLiveTrackableExperiences,
  getChocolateByTier,
  buildWitnessGallery,
};
