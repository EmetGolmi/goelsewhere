// =============================================================================
// GO ELSEWHERE — DOMESTIC SMALL TOWNS DATABASE
// domestic-towns.js
//
// Philosophy: "Small Town Charm" is a vibe, not a compromise.
// These are destinations people skip because they don't know they exist —
// and they're often the most memorable stops of any trip.
//
// Data model mirrors corridors.js:
//   - Each town has a gateway (nearest served airport)
//   - corridorMode = drive (all domestic towns are drive-from-gateway)
//   - Flight data reflects direct service to the gateway from major US hubs
//   - Designed to work with the existing scoring engine
//
// Sections:
//   DOMESTIC_GATEWAYS      — airport metadata with direct flight origins
//   DOMESTIC_TOWNS         — destination objects (mirrors international corridors)
//   getDirectFlightOrigins()  — helper: "can I fly direct to TPA from X?"
//   getTownsByGateway()       — filter by gateway
//   getTownsByVibe()          — filter by vibe tags
// =============================================================================


// ─── DOMESTIC GATEWAY AIRPORTS ───────────────────────────────────────────────
//
// Direct flight data: US cities with nonstop service to each gateway.
// Sources: airline route maps (Southwest, American, Delta, United, Spirit, Frontier)
// Note: "direct" here means nonstop — one-stop connections not listed.
//
// Format: { city: string, iata: string, avgRtFlight: string }
// avgRtFlight is a rough range, round-trip, per person, off-peak

const DOMESTIC_GATEWAYS = {

  TPA: {
    name: 'Tampa, FL',
    iata: 'TPA',
    region: 'Florida Gulf Coast',
    directFrom: [
      { city: 'New York (JFK/LGA/EWR)', iata: ['JFK','LGA','EWR'], avgRt: '$120–220', carriers: ['Delta','JetBlue','American','United','Spirit'] },
      { city: 'Boston (BOS)',            iata: ['BOS'],             avgRt: '$100–200', carriers: ['JetBlue','Spirit','Frontier','American'] },
      { city: 'Philadelphia (PHL)',      iata: ['PHL'],             avgRt: '$90–180',  carriers: ['American','Spirit','Frontier'] },
      { city: 'Washington D.C. (DCA/IAD/BWI)', iata: ['DCA','IAD','BWI'], avgRt: '$80–180', carriers: ['American','Southwest','Spirit','Frontier','United'] },
      { city: 'Chicago (ORD/MDW)',       iata: ['ORD','MDW'],       avgRt: '$100–200', carriers: ['American','United','Southwest','Spirit','Frontier'] },
      { city: 'Detroit (DTW)',           iata: ['DTW'],             avgRt: '$90–190',  carriers: ['Delta','Spirit'] },
      { city: 'Cleveland (CLE)',         iata: ['CLE'],             avgRt: '$100–200', carriers: ['Frontier','Spirit','American'] },
      { city: 'Pittsburgh (PIT)',        iata: ['PIT'],             avgRt: '$90–180',  carriers: ['Spirit','Frontier','American'] },
      { city: 'Charlotte (CLT)',         iata: ['CLT'],             avgRt: '$80–150',  carriers: ['American'] },
      { city: 'Atlanta (ATL)',           iata: ['ATL'],             avgRt: '$70–160',  carriers: ['Delta','Spirit','Frontier'] },
      { city: 'Nashville (BNA)',         iata: ['BNA'],             avgRt: '$80–170',  carriers: ['Southwest','American','Spirit'] },
      { city: 'Indianapolis (IND)',      iata: ['IND'],             avgRt: '$100–190', carriers: ['Southwest','Spirit','Frontier'] },
      { city: 'Minneapolis (MSP)',       iata: ['MSP'],             avgRt: '$110–220', carriers: ['Delta','Sun Country','Spirit'] },
      { city: 'Kansas City (MCI)',       iata: ['MCI'],             avgRt: '$100–200', carriers: ['Southwest','Frontier','American'] },
      { city: 'Denver (DEN)',            iata: ['DEN'],             avgRt: '$120–240', carriers: ['Frontier','Southwest','United','Spirit'] },
      { city: 'Dallas (DFW/DAL)',        iata: ['DFW','DAL'],       avgRt: '$100–210', carriers: ['American','Southwest','Spirit'] },
      { city: 'Houston (IAH/HOU)',       iata: ['IAH','HOU'],       avgRt: '$90–190',  carriers: ['United','Southwest','Spirit'] },
      { city: 'Los Angeles (LAX/BUR/LGB)', iata: ['LAX','BUR'],    avgRt: '$150–300', carriers: ['American','JetBlue','Spirit','Frontier'] },
      { city: 'San Francisco Bay (SFO/OAK/SJC)', iata: ['SFO','OAK'], avgRt: '$160–320', carriers: ['United','Delta','Southwest'] },
      { city: 'Seattle (SEA)',           iata: ['SEA'],             avgRt: '$160–320', carriers: ['Alaska','Delta','Frontier'] },
    ],
    notes: 'TPA is one of the most connected mid-size airports in the US — Southwest operates a major hub here. Spirit and Frontier offer deep-discount fares from Northeast/Midwest.',
  },

  MSY: {
    name: 'New Orleans, LA',
    iata: 'MSY',
    region: 'Louisiana / Gulf South',
    directFrom: [
      { city: 'New York (JFK/LGA/EWR)', iata: ['JFK','LGA','EWR'], avgRt: '$130–250', carriers: ['Delta','JetBlue','American','United','Spirit'] },
      { city: 'Boston (BOS)',            iata: ['BOS'],             avgRt: '$130–250', carriers: ['JetBlue','Spirit','American'] },
      { city: 'Philadelphia (PHL)',      iata: ['PHL'],             avgRt: '$110–220', carriers: ['American','Spirit'] },
      { city: 'Washington D.C. (DCA/IAD/BWI)', iata: ['DCA','IAD','BWI'], avgRt: '$100–210', carriers: ['American','Southwest','United'] },
      { city: 'Chicago (ORD/MDW)',       iata: ['ORD','MDW'],       avgRt: '$100–220', carriers: ['American','United','Southwest','Spirit'] },
      { city: 'Atlanta (ATL)',           iata: ['ATL'],             avgRt: '$80–160',  carriers: ['Delta','Spirit'] },
      { city: 'Dallas (DFW/DAL)',        iata: ['DFW','DAL'],       avgRt: '$80–180',  carriers: ['American','Southwest'] },
      { city: 'Houston (IAH/HOU)',       iata: ['IAH','HOU'],       avgRt: '$70–160',  carriers: ['United','Southwest','Spirit'] },
      { city: 'Denver (DEN)',            iata: ['DEN'],             avgRt: '$120–250', carriers: ['Frontier','United','Southwest'] },
      { city: 'Los Angeles (LAX)',       iata: ['LAX'],             avgRt: '$150–300', carriers: ['American','Delta','Southwest','Spirit'] },
      { city: 'San Francisco (SFO)',     iata: ['SFO'],             avgRt: '$160–320', carriers: ['United','Delta','Southwest'] },
      { city: 'Minneapolis (MSP)',       iata: ['MSP'],             avgRt: '$120–240', carriers: ['Delta','Sun Country'] },
      { city: 'Nashville (BNA)',         iata: ['BNA'],             avgRt: '$90–180',  carriers: ['Southwest','American'] },
      { city: 'Charlotte (CLT)',         iata: ['CLT'],             avgRt: '$90–190',  carriers: ['American'] },
      { city: 'Miami (MIA)',             iata: ['MIA'],             avgRt: '$80–170',  carriers: ['American','Spirit'] },
    ],
    notes: 'MSY rebuilt post-Katrina and now receives strong direct service. Southwest, Spirit, and Frontier cover the budget corridor well.',
  },

  CRP: {
    name: 'Corpus Christi, TX',
    iata: 'CRP',
    region: 'Texas Gulf Coast',
    directFrom: [
      { city: 'Dallas (DFW)',            iata: ['DFW'],             avgRt: '$90–180',  carriers: ['American'] },
      { city: 'Houston (IAH/HOU)',       iata: ['IAH','HOU'],       avgRt: '$80–160',  carriers: ['United','Southwest'] },
      { city: 'Denver (DEN)',            iata: ['DEN'],             avgRt: '$130–250', carriers: ['United','Frontier'] },
      { city: 'Chicago (ORD)',           iata: ['ORD'],             avgRt: '$140–280', carriers: ['American','United'] },
      { city: 'Phoenix (PHX)',           iata: ['PHX'],             avgRt: '$120–240', carriers: ['American','Frontier'] },
      { city: 'Atlanta (ATL)',           iata: ['ATL'],             avgRt: '$120–240', carriers: ['Delta'] },
      { city: 'Charlotte (CLT)',         iata: ['CLT'],             avgRt: '$130–260', carriers: ['American'] },
    ],
    notes: 'CRP is a smaller airport — fewer direct routes than TPA/MSY, but the Texas corridor (DFW, IAH) is well-served. For Northeast travelers, Houston or Dallas connections are common.',
    nearbyAlt: 'SAT (San Antonio, 140mi) adds Southwest nonstop from many more cities. Consider as alternate gateway.',
  },

  FLL: {
    name: 'Fort Lauderdale, FL',
    iata: 'FLL',
    region: 'South Florida',
    directFrom: [
      { city: 'New York (JFK/LGA/EWR)', iata: ['JFK','LGA','EWR'], avgRt: '$80–180',  carriers: ['JetBlue','Spirit','Frontier','Delta','American'] },
      { city: 'Boston (BOS)',            iata: ['BOS'],             avgRt: '$80–180',  carriers: ['JetBlue','Spirit','Frontier','American'] },
      { city: 'Philadelphia (PHL)',      iata: ['PHL'],             avgRt: '$70–160',  carriers: ['American','Spirit','Frontier'] },
      { city: 'Washington D.C. (DCA/BWI/IAD)', iata: ['DCA','BWI','IAD'], avgRt: '$70–160', carriers: ['Southwest','Spirit','American','United'] },
      { city: 'Chicago (ORD/MDW)',       iata: ['ORD','MDW'],       avgRt: '$80–180',  carriers: ['American','United','Southwest','Spirit','Frontier'] },
      { city: 'Detroit (DTW)',           iata: ['DTW'],             avgRt: '$80–180',  carriers: ['Delta','Spirit','Frontier'] },
      { city: 'Pittsburgh (PIT)',        iata: ['PIT'],             avgRt: '$80–170',  carriers: ['Spirit','Frontier','American'] },
      { city: 'Cleveland (CLE)',         iata: ['CLE'],             avgRt: '$80–170',  carriers: ['Spirit','Frontier'] },
      { city: 'Baltimore (BWI)',         iata: ['BWI'],             avgRt: '$60–150',  carriers: ['Southwest','Spirit'] },
      { city: 'Minneapolis (MSP)',       iata: ['MSP'],             avgRt: '$100–210', carriers: ['Delta','Sun Country','Spirit'] },
      { city: 'Denver (DEN)',            iata: ['DEN'],             avgRt: '$100–220', carriers: ['Frontier','Southwest','United'] },
      { city: 'Dallas (DFW)',            iata: ['DFW'],             avgRt: '$90–200',  carriers: ['American','Spirit'] },
      { city: 'Los Angeles (LAX)',       iata: ['LAX'],             avgRt: '$130–260', carriers: ['Spirit','JetBlue','Frontier'] },
      { city: 'Atlanta (ATL)',           iata: ['ATL'],             avgRt: '$70–160',  carriers: ['Delta','Spirit','Frontier'] },
      { city: 'Toronto (YYZ)',           iata: ['YYZ'],             avgRt: '$130–250', carriers: ['Air Canada','WestJet','Spirit'] },
      { city: 'Montreal (YUL)',          iata: ['YUL'],             avgRt: '$130–250', carriers: ['Air Transat','Spirit'] },
    ],
    notes: 'FLL is one of the cheapest airports to fly into in the US — Spirit and Frontier use it as a major hub. Often significantly cheaper than MIA for the same South Florida trip.',
  },

  MIA: {
    name: 'Miami, FL',
    iata: 'MIA',
    region: 'South Florida (Miami)',
    directFrom: [
      { city: 'New York (JFK/EWR)',      iata: ['JFK','EWR'],       avgRt: '$90–200',  carriers: ['American','JetBlue','Delta','United'] },
      { city: 'Boston (BOS)',            iata: ['BOS'],             avgRt: '$90–200',  carriers: ['American','JetBlue'] },
      { city: 'Chicago (ORD)',           iata: ['ORD'],             avgRt: '$100–220', carriers: ['American','United'] },
      { city: 'Washington D.C. (DCA/IAD)', iata: ['DCA','IAD'],    avgRt: '$80–190',  carriers: ['American','United'] },
      { city: 'Los Angeles (LAX)',       iata: ['LAX'],             avgRt: '$140–280', carriers: ['American','Delta'] },
      { city: 'Dallas (DFW)',            iata: ['DFW'],             avgRt: '$100–220', carriers: ['American'] },
      { city: 'Atlanta (ATL)',           iata: ['ATL'],             avgRt: '$80–170',  carriers: ['Delta','American'] },
    ],
    notes: 'MIA is American Airlines\' international hub — strongest for international connections but more expensive for domestic than FLL (25mi away).',
  },

  PBI: {
    name: 'Palm Beach, FL',
    iata: 'PBI',
    region: 'South Florida (Palm Beach / Treasure Coast)',
    directFrom: [
      { city: 'New York (JFK/EWR/LGA)', iata: ['JFK','EWR','LGA'], avgRt: '$90–200',  carriers: ['JetBlue','Delta','American','United'] },
      { city: 'Boston (BOS)',            iata: ['BOS'],             avgRt: '$90–190',  carriers: ['JetBlue','American'] },
      { city: 'Philadelphia (PHL)',      iata: ['PHL'],             avgRt: '$80–180',  carriers: ['American'] },
      { city: 'Washington D.C. (DCA/IAD)', iata: ['DCA','IAD'],    avgRt: '$80–180',  carriers: ['American','United'] },
      { city: 'Chicago (ORD)',           iata: ['ORD'],             avgRt: '$100–220', carriers: ['American','United'] },
      { city: 'Charlotte (CLT)',         iata: ['CLT'],             avgRt: '$80–170',  carriers: ['American'] },
      { city: 'Atlanta (ATL)',           iata: ['ATL'],             avgRt: '$80–170',  carriers: ['Delta'] },
    ],
    notes: 'PBI is the most convenient gateway for the Treasure Coast (Stuart, Jensen Beach). Closer to Stuart than FLL and usually quieter.',
  },
};


// ─── DOMESTIC TOWNS DATABASE ──────────────────────────────────────────────────
//
// Schema mirrors international destinations in corridors.js:
// corridorMode is always 'drive' for domestic towns.
// flightCostPerPerson = 0 (covered by gateway flight cost from DOMESTIC_GATEWAYS)
// Nightly rates = realistic Airbnb/hotel ranges, not resort pricing.

const DOMESTIC_TOWNS = [

  // ════════════════════════════════════════════════════════════════
  // NEAR TAMPA (TPA)
  // ════════════════════════════════════════════════════════════════

  {
    flag: '🦀',
    name: 'Dunedin, FL',
    why: 'Scottish-founded waterfront town with a walkable craft beer scene, Old World charm, and Honeymoon Island a short drive away',
    flightCostPerPerson: 0,
    nightlyHotelRate: 120,
    dailyExpensesPerPerson: 55,
    corridorId: 'TPA',
    corridorMode: 'drive',
    corridorHours: 0.75,
    corridorCost: 0,
    minNights: 2,
    sweetSpotNights: 3,
    maxNights: 5,
    tags: ['small-town', 'beach', 'walkable', 'craft-beer', 'florida'],
    vibe: ['Small Town Charm 🏘️', 'Beach & Sun', 'City & Culture'],
    timing: {
      neverRecommend: { months: [], reason: '' },
      beachSeason: { months: [10,11,12,1,2,3,4,5], note: 'Gulf coast, mild winters' },
      shoulder: { months: [10,11], discount: '15–25% cheaper', tradeoffs: 'Still warm, fewer crowds' },
      peak: { months: [1,2,3], premium: '20–30% more', note: 'Snowbird season' },
      avoid: { months: [7,8,9], reason: 'Heat and humidity at peak — thunderstorm season', hardBlock: false },
    },
    peakSeason: 'January–March',
    shoulderSeason: 'October–November, April–May',
    avoidMonths: [7,8,9],
    avgTempF: { Jan:65, Feb:67, Mar:71, Apr:77, May:83, Jun:88, Jul:90, Aug:90, Sep:88, Oct:81, Nov:74, Dec:67 },
    iata: 'TPA',
    proTip: 'Honeymoon Island State Park is 15 minutes north — one of Florida\'s least developed Gulf beaches. Dolphin sightings at the causeway are routine.',
    highlight: 'The Pinellas Trail runs through town — rent bikes and ride the coast.',
    nearbyAttractions: ['Honeymoon Island State Park', 'Caladesi Island (ferry)', 'Clearwater Beach (20min)'],
    experienceType: 'seasonal',
    domestic: true,
  },

  {
    flag: '♨️',
    name: 'Safety Harbor, FL',
    why: 'Quiet spa town on Tampa Bay with a charming main street, historic mineral springs, and none of the tourist machinery of the coast',
    flightCostPerPerson: 0,
    nightlyHotelRate: 110,
    dailyExpensesPerPerson: 50,
    corridorId: 'TPA',
    corridorMode: 'drive',
    corridorHours: 0.5,
    corridorCost: 0,
    minNights: 2,
    sweetSpotNights: 3,
    maxNights: 4,
    tags: ['small-town', 'spa', 'bay', 'florida', 'walkable'],
    vibe: ['Small Town Charm 🏘️', 'Nature & Escape'],
    timing: {
      neverRecommend: { months: [], reason: '' },
      beachSeason: { months: [10,11,12,1,2,3,4,5], note: 'Bay access year-round' },
      shoulder: { months: [10,11,4,5], discount: '20% cheaper', tradeoffs: 'Shoulder warmth, minimal crowds' },
      peak: { months: [1,2,3], premium: '15–25% more', note: 'Snowbird peak' },
      avoid: { months: [7,8], reason: 'High heat and humidity', hardBlock: false },
    },
    peakSeason: 'January–March',
    shoulderSeason: 'October–November',
    avoidMonths: [7,8],
    avgTempF: { Jan:64, Feb:66, Mar:70, Apr:76, May:83, Jun:88, Jul:91, Aug:91, Sep:88, Oct:81, Nov:73, Dec:66 },
    iata: 'TPA',
    proTip: 'The Safety Harbor Resort and Spa sits on Philippe Park, a 100-acre preserve. Even if you\'re not staying there, the park trails and Tampa Bay views are free.',
    highlight: 'Philippe Park archaeological site — Tocobaga Native American mound overlooking the bay.',
    nearbyAttractions: ['Philippe Park', 'Safety Harbor Spa', 'Clearwater (20min)', 'Tampa Bay waterfront'],
    experienceType: 'seasonal',
    domestic: true,
  },

  {
    flag: '🦑',
    name: 'Tarpon Springs, FL',
    why: 'The only authentic Greek sponge-diving community in the US — Dodecanese Boulevard feels transported from the Aegean',
    flightCostPerPerson: 0,
    nightlyHotelRate: 115,
    dailyExpensesPerPerson: 60,
    corridorId: 'TPA',
    corridorMode: 'drive',
    corridorHours: 1,
    corridorCost: 0,
    minNights: 1,
    sweetSpotNights: 2,
    maxNights: 4,
    tags: ['small-town', 'cultural', 'greek', 'historic', 'florida', 'food'],
    vibe: ['Small Town Charm 🏘️', 'City & Culture'],
    timing: {
      neverRecommend: { months: [], reason: '' },
      beachSeason: { months: [10,11,12,1,2,3,4,5], note: 'Fred Howard Park beach nearby' },
      shoulder: { months: [4,5,10,11], discount: '15–20% cheaper', tradeoffs: 'Warm, manageable crowds' },
      peak: { months: [1,2,3], premium: '20–30% more', note: 'Epiphany Cross Dive in January draws massive crowds' },
      avoid: { months: [7,8], reason: 'High heat', hardBlock: false },
    },
    peakSeason: 'January (Epiphany), February–March',
    shoulderSeason: 'October–November',
    avoidMonths: [7,8],
    avgTempF: { Jan:63, Feb:65, Mar:69, Apr:75, May:82, Jun:87, Jul:90, Aug:90, Sep:87, Oct:80, Nov:72, Dec:65 },
    iata: 'TPA',
    proTip: 'The Greek Epiphany Cross Dive on January 6th is one of the most unusual American traditions — young Greek Orthodox men dive into Spring Bayou to retrieve a blessed cross. Free to watch.',
    highlight: 'Lunch at Hellas Restaurant on Dodecanese — spanakopita, fresh-grilled octopus, and loukoumades.',
    nearbyAttractions: ['Sponge docks', 'St. Nicholas Greek Orthodox Cathedral', 'Anclote River Park', 'Fred Howard Park beach'],
    experienceType: 'culinary',
    domestic: true,
    specialEvent: { name: 'Greek Epiphany', month: 1, date: 'January 6', note: 'Cross Dive draws thousands — book accommodation months ahead' },
  },

  {
    flag: '🏺',
    name: 'Dade City, FL',
    why: 'Old Florida antique town — genuine pre-Disney Florida, leafy and quiet, with a real Main Street and no chain restaurants in sight',
    flightCostPerPerson: 0,
    nightlyHotelRate: 95,
    dailyExpensesPerPerson: 45,
    corridorId: 'TPA',
    corridorMode: 'drive',
    corridorHours: 1,
    corridorCost: 0,
    minNights: 1,
    sweetSpotNights: 2,
    maxNights: 3,
    tags: ['small-town', 'antiques', 'historic', 'inland-florida', 'old-florida'],
    vibe: ['Small Town Charm 🏘️', 'Farm & Countryside 🌾'],
    timing: {
      neverRecommend: { months: [], reason: '' },
      shoulder: { months: [10,11,2,3,4], discount: '10–15%', tradeoffs: 'Comfortable inland temps' },
      peak: { months: [1,2], premium: '10%', note: 'Best antique hunting weather' },
      avoid: { months: [7,8], reason: 'Inland Florida heat is oppressive', hardBlock: false },
    },
    peakSeason: 'January–March',
    shoulderSeason: 'October–November',
    avoidMonths: [7,8],
    avgTempF: { Jan:62, Feb:64, Mar:68, Apr:74, May:81, Jun:87, Jul:90, Aug:90, Sep:87, Oct:80, Nov:71, Dec:64 },
    iata: 'TPA',
    proTip: 'The antique shops along 7th Street are independently owned and genuinely old — no curated "vintage." Florida pre-1970 memorabilia everywhere.',
    highlight: 'Kafe Kokopelli — a genuinely good café in an unexpected location.',
    nearbyAttractions: ['Withlacoochee State Trail', 'Crystal River (60min)', 'Weekiwachee Springs (45min)'],
    experienceType: 'seasonal',
    domestic: true,
  },

  {
    flag: '🍓',
    name: 'Plant City, FL',
    why: 'Strawberry capital of the world — classic Americana with a winter strawberry festival that\'s been running since 1930',
    flightCostPerPerson: 0,
    nightlyHotelRate: 90,
    dailyExpensesPerPerson: 40,
    corridorId: 'TPA',
    corridorMode: 'drive',
    corridorHours: 0.5,
    corridorCost: 0,
    minNights: 1,
    sweetSpotNights: 2,
    maxNights: 3,
    tags: ['small-town', 'americana', 'food', 'festival', 'florida'],
    vibe: ['Small Town Charm 🏘️', 'Farm & Countryside 🌾'],
    timing: {
      neverRecommend: { months: [], reason: '' },
      shoulder: { months: [11,12,3,4], discount: '10–20%', tradeoffs: 'Good weather, no festival crowds' },
      peak: { months: [2,3], premium: '10–20%', note: 'Florida Strawberry Festival late Feb–early March' },
      avoid: { months: [6,7,8,9], reason: 'Summer heat and humidity, nothing happening', hardBlock: false },
    },
    peakSeason: 'February–March (Strawberry Festival)',
    shoulderSeason: 'November–December, April',
    avoidMonths: [6,7,8,9],
    avgTempF: { Jan:63, Feb:65, Mar:69, Apr:75, May:81, Jun:87, Jul:91, Aug:91, Sep:88, Oct:81, Nov:73, Dec:65 },
    iata: 'TPA',
    proTip: 'The Florida Strawberry Festival (late February–early March, 11 days) is genuinely beloved — 500,000+ attendees, carnival rides, country music headliners, and strawberry shortcake you can eat in line.',
    highlight: 'U-pick strawberry farms just outside town, January–March.',
    nearbyAttractions: ['Florida Strawberry Festival', 'Tampa (30min)', 'Ybor City (35min)'],
    experienceType: 'gathering',
    domestic: true,
    specialEvent: { name: 'Florida Strawberry Festival', months: [2,3], window: '11 days, late February', note: '500K+ attendees — book early' },
  },

  {
    flag: '🦦',
    name: 'Crystal River, FL',
    why: 'The only place in North America where you can legally swim with wild manatees — plus first-magnitude springs with water you can see 50 feet through',
    flightCostPerPerson: 0,
    nightlyHotelRate: 120,
    dailyExpensesPerPerson: 60,
    corridorId: 'TPA',
    corridorMode: 'drive',
    corridorHours: 1.25,
    corridorCost: 0,
    minNights: 2,
    sweetSpotNights: 3,
    maxNights: 4,
    tags: ['small-town', 'wildlife', 'springs', 'snorkel', 'nature', 'florida'],
    vibe: ['Small Town Charm 🏘️', 'Nature & Escape'],
    timing: {
      neverRecommend: { months: [], reason: '' },
      manateeSwimming: { months: [11,12,1,2,3], peak: [12,1,2], note: 'Manatees crowd the springs in cooler months for warm water — peak Dec–Feb' },
      shoulder: { months: [10,11,3,4], discount: '15%', tradeoffs: 'Fewer manatees but still beautiful' },
      peak: { months: [12,1,2], premium: '20–30%', note: 'Manatee season peak — book tours weeks ahead' },
      avoid: { months: [6,7,8,9], reason: 'Manatees disperse in summer heat — the main event isn\'t there', hardBlock: false },
    },
    peakSeason: 'November–March (manatee season)',
    shoulderSeason: 'October, April',
    avoidMonths: [6,7,8,9],
    avgTempF: { Jan:62, Feb:64, Mar:68, Apr:74, May:82, Jun:88, Jul:91, Aug:91, Sep:87, Oct:80, Nov:72, Dec:64 },
    iata: 'TPA',
    proTip: 'Swim with manatees, not at them — passive snorkeling only. River Ventures is the best-reviewed outfitter. The 72°F spring water is stunning even without manatees.',
    highlight: 'Three Sisters Springs — a cathedral of clear water with manatees floating in shafts of light.',
    nearbyAttractions: ['Three Sisters Springs', 'Kings Bay', 'Homosassa Springs (30min)', 'Cedar Key (50min)'],
    experienceType: 'wildlife',
    domestic: true,
  },


  // ════════════════════════════════════════════════════════════════
  // NEAR NEW ORLEANS (MSY)
  // ════════════════════════════════════════════════════════════════

  {
    flag: '🍺',
    name: 'Abita Springs, LA',
    why: 'Home of Abita Beer, a quirky roadside attraction, and a pine forest setting that feels nothing like the surrounding swamp-and-delta — the anti-New Orleans',
    flightCostPerPerson: 0,
    nightlyHotelRate: 100,
    dailyExpensesPerPerson: 50,
    corridorId: 'MSY',
    corridorMode: 'drive',
    corridorHours: 0.75,
    corridorCost: 0,
    minNights: 1,
    sweetSpotNights: 2,
    maxNights: 3,
    tags: ['small-town', 'quirky', 'craft-beer', 'louisiana', 'roadside'],
    vibe: ['Small Town Charm 🏘️', 'Off the Map'],
    timing: {
      neverRecommend: { months: [], reason: '' },
      shoulder: { months: [3,4,10,11], discount: '10–20%', tradeoffs: 'Ideal temperatures' },
      peak: { months: [2,3], premium: '10%', note: 'Mardi Gras proximity — NOLA overflow' },
      avoid: { months: [7,8], reason: 'Louisiana summer heat is extreme', hardBlock: false },
    },
    peakSeason: 'March–April, October–November',
    shoulderSeason: 'February, December',
    avoidMonths: [7,8],
    avgTempF: { Jan:56, Feb:60, Mar:66, Apr:73, May:80, Jun:86, Jul:90, Aug:90, Sep:85, Oct:76, Nov:66, Dec:58 },
    iata: 'MSY',
    proTip: 'The Abita Mystery House (UCM Museum) is one of America\'s finest examples of outsider art and roadside weirdness — a genuine must-visit. $5 admission.',
    highlight: 'Abita Brewery tour: see where 25+ Louisiana craft beers are made, taste the Turbodog on-site.',
    nearbyAttractions: ['Abita Mystery House (UCM Museum)', 'Abita Brewery', 'Tammany Trace bike trail', 'Fontainebleau State Park'],
    experienceType: 'culinary',
    domestic: true,
  },

  {
    flag: '🎨',
    name: 'Covington, LA',
    why: 'Arts town on the north shore of Lake Pontchartrain with a charming 19th-century downtown, galleries, and restaurants that draw New Orleans chefs who wanted more space',
    flightCostPerPerson: 0,
    nightlyHotelRate: 115,
    dailyExpensesPerPerson: 55,
    corridorId: 'MSY',
    corridorMode: 'drive',
    corridorHours: 0.75,
    corridorCost: 0,
    minNights: 2,
    sweetSpotNights: 3,
    maxNights: 4,
    tags: ['small-town', 'arts', 'louisiana', 'walkable', 'food'],
    vibe: ['Small Town Charm 🏘️', 'City & Culture'],
    timing: {
      neverRecommend: { months: [], reason: '' },
      shoulder: { months: [3,4,5,10,11], discount: '10–20%', tradeoffs: 'Best weather window' },
      peak: { months: [3,4], premium: '10%', note: 'Spring art walk season' },
      avoid: { months: [7,8], reason: 'Extreme heat and humidity', hardBlock: false },
    },
    peakSeason: 'March–April, October–November',
    shoulderSeason: 'February, December',
    avoidMonths: [7,8],
    avgTempF: { Jan:55, Feb:59, Mar:65, Apr:72, May:79, Jun:85, Jul:90, Aug:90, Sep:85, Oct:75, Nov:65, Dec:57 },
    iata: 'MSY',
    proTip: 'The Three Rivers Art Festival in May is Covington\'s signature event. Year-round: walk Columbia Street and Lee Lane for galleries, boutiques, and the best coffee on the Northshore.',
    highlight: 'Table restaurant — James Beard-adjacent cooking in an unexpected location.',
    nearbyAttractions: ['Bogue Falaya Park (kayak/canoe)', 'Abita Springs (15min)', 'Mandeville lakefront (10min)', 'New Orleans (45min via causeway)'],
    experienceType: 'culinary',
    domestic: true,
  },

  {
    flag: '🦞',
    name: 'Breaux Bridge, LA',
    why: '"Crawfish Capital of the World" — deep Cajun culture, zydeco music, and food authenticity that tourist New Orleans tries and fails to approximate',
    flightCostPerPerson: 0,
    nightlyHotelRate: 95,
    dailyExpensesPerPerson: 45,
    corridorId: 'MSY',
    corridorMode: 'drive',
    corridorHours: 2,
    corridorCost: 0,
    minNights: 1,
    sweetSpotNights: 2,
    maxNights: 3,
    tags: ['small-town', 'cajun', 'food', 'louisiana', 'music', 'cultural'],
    vibe: ['Small Town Charm 🏘️', 'City & Culture', 'Off the Map'],
    timing: {
      neverRecommend: { months: [], reason: '' },
      crawfishSeason: { months: [1,2,3,4,5,6], peak: [3,4,5], note: 'Crawfish season Jan–June, peak March–May' },
      shoulder: { months: [10,11,2,3], discount: '10%', tradeoffs: 'Shoulder spring is ideal' },
      peak: { months: [4,5], premium: '10%', note: 'Crawfish Festival (first weekend May) is the pilgrimage event' },
      avoid: { months: [7,8,9], reason: 'Bayou country heat and mosquitoes are intense', hardBlock: false },
    },
    peakSeason: 'March–May (crawfish season)',
    shoulderSeason: 'November–February',
    avoidMonths: [7,8,9],
    avgTempF: { Jan:53, Feb:57, Mar:63, Apr:70, May:77, Jun:83, Jul:87, Aug:87, Sep:82, Oct:73, Nov:63, Dec:54 },
    iata: 'MSY',
    proTip: 'Café des Amis on Main Street hosts the Zydeco Breakfast every Saturday — live zydeco music, dancing in the aisles, and Cajun brunch. 9am start, show up early.',
    highlight: 'Crawfish Festival (first weekend in May) — 30,000 people, live music, and more boiled crawfish than you\'ve ever seen.',
    nearbyAttractions: ['Henderson Swamp (airboat tours)', 'Lafayette (20min)', 'Atchafalaya Basin', 'St. Martinville (30min, Evangeline Oak)'],
    experienceType: 'culinary',
    domestic: true,
    specialEvent: { name: 'Breaux Bridge Crawfish Festival', months: [5], window: 'First weekend in May', note: '30,000 attendees — book accommodation in Lafayette' },
  },

  {
    flag: '🌿',
    name: 'St. Francisville, LA',
    why: 'Antebellum plantation country in the Mississippi bluff country — moss-draped streets, beautifully preserved architecture, and the feeling of having wandered into a different century',
    flightCostPerPerson: 0,
    nightlyHotelRate: 130,
    dailyExpensesPerPerson: 55,
    corridorId: 'MSY',
    corridorMode: 'drive',
    corridorHours: 1.5,
    corridorCost: 0,
    minNights: 2,
    sweetSpotNights: 3,
    maxNights: 4,
    tags: ['small-town', 'historic', 'plantation', 'louisiana', 'arts'],
    vibe: ['Small Town Charm 🏘️', 'City & Culture', 'Nature & Escape'],
    timing: {
      neverRecommend: { months: [], reason: '' },
      shoulder: { months: [3,4,10,11], discount: '15%', tradeoffs: 'Perfect temperatures for plantation walks' },
      peak: { months: [3,4], premium: '20%', note: 'Audubon Pilgrimage (spring tour of antebellum homes) and Azalea Trail' },
      avoid: { months: [7,8], reason: 'Louisiana summer heat and humidity', hardBlock: false },
    },
    peakSeason: 'March–April',
    shoulderSeason: 'October–November, February',
    avoidMonths: [7,8],
    avgTempF: { Jan:53, Feb:57, Mar:64, Apr:71, May:78, Jun:84, Jul:88, Aug:88, Sep:83, Oct:73, Nov:62, Dec:54 },
    iata: 'MSY',
    proTip: 'Rosedown Plantation State Historic Site is the most intact antebellum plantation complex in the South — 28 acres of formal gardens. The Audubon Pilgrimage (March) lets you inside private homes normally closed.',
    highlight: 'The Myrtles Plantation — one of the most beautifully preserved antebellum homes in the US, with a reputation as the most haunted.',
    nearbyAttractions: ['Rosedown Plantation', 'The Myrtles Plantation', 'Audubon State Historic Site', 'Tunica Hills (hiking)'],
    experienceType: 'ancient',
    domestic: true,
  },

  {
    flag: '⛵',
    name: 'Mandeville, LA',
    why: 'Lakefront town on the north shore of Lake Pontchartrain — lovely old downtown, strong local restaurant culture, and a gentler pace than New Orleans 45 minutes away',
    flightCostPerPerson: 0,
    nightlyHotelRate: 110,
    dailyExpensesPerPerson: 55,
    corridorId: 'MSY',
    corridorMode: 'drive',
    corridorHours: 0.75,
    corridorCost: 0,
    minNights: 1,
    sweetSpotNights: 2,
    maxNights: 3,
    tags: ['small-town', 'lakefront', 'louisiana', 'walkable', 'food'],
    vibe: ['Small Town Charm 🏘️', 'Nature & Escape'],
    timing: {
      neverRecommend: { months: [], reason: '' },
      shoulder: { months: [3,4,5,10,11], discount: '10–15%', tradeoffs: 'Best lake weather' },
      avoid: { months: [7,8], reason: 'Extreme heat, lake not inviting for swimming', hardBlock: false },
    },
    peakSeason: 'March–April, October–November',
    shoulderSeason: 'February, May, December',
    avoidMonths: [7,8],
    avgTempF: { Jan:55, Feb:59, Mar:65, Apr:72, May:79, Jun:85, Jul:89, Aug:89, Sep:85, Oct:75, Nov:65, Dec:57 },
    iata: 'MSY',
    proTip: 'The Mandeville Trailhead on the lakefront is the start of the Tammany Trace — a 31-mile rail trail through Northshore towns. Rent bikes in Mandeville and ride to Abita Springs.',
    highlight: 'Lakefront Sunsets at Fontainebleau State Park — the old Fontainebleau plantation ruins are on the beach.',
    nearbyAttractions: ['Tammany Trace (bike trail)', 'Fontainebleau State Park', 'Covington (15min)', 'New Orleans (45min via Causeway)'],
    experienceType: 'seasonal',
    domestic: true,
  },


  // ════════════════════════════════════════════════════════════════
  // NEAR CORPUS CHRISTI (CRP)
  // ════════════════════════════════════════════════════════════════

  {
    flag: '🦜',
    name: 'Rockport, TX',
    why: 'Birding capital of Texas — millions of migrating birds funnel through this barrier town each spring and fall, making it one of the top birding destinations in North America',
    flightCostPerPerson: 0,
    nightlyHotelRate: 110,
    dailyExpensesPerPerson: 50,
    corridorId: 'CRP',
    corridorMode: 'drive',
    corridorHours: 0.5,
    corridorCost: 0,
    minNights: 2,
    sweetSpotNights: 3,
    maxNights: 5,
    tags: ['small-town', 'birding', 'art', 'fishing', 'texas', 'coastal'],
    vibe: ['Small Town Charm 🏘️', 'Nature & Escape'],
    timing: {
      neverRecommend: { months: [], reason: '' },
      birdingPeak: { months: [4,5,9,10], note: 'Spring migration April–May, fall migration September–October' },
      beachSeason: { months: [3,4,5,10,11,12], note: 'Gulf Coast beach season' },
      shoulder: { months: [3,11,12], discount: '15–20%', tradeoffs: 'Good weather, fewer crowds' },
      peak: { months: [4,5], premium: '15–25%', note: 'Hummer/Bird Celebration in October is massive' },
      avoid: { months: [7,8], reason: 'Heat and humidity at peak, Hurricane season risk', hardBlock: false },
    },
    peakSeason: 'April–May (spring migration), October (Hummer festival)',
    shoulderSeason: 'November–March',
    avoidMonths: [7,8,9],
    avgTempF: { Jan:59, Feb:62, Mar:68, Apr:74, May:80, Jun:85, Jul:89, Aug:90, Sep:86, Oct:79, Nov:70, Dec:62 },
    iata: 'CRP',
    proTip: 'Aransas National Wildlife Refuge (25min) is the sole wintering ground for the endangered whooping crane — December through March. Boat tours from Rockport docks get you within 30 feet.',
    highlight: 'Hummingbird and Fall Birding Celebration (October): 300+ species recorded, workshops, guided tours.',
    nearbyAttractions: ['Aransas National Wildlife Refuge', 'Goose Island State Park', 'Port Aransas (30min)', 'Fulton Mansion State Historic Site'],
    experienceType: 'wildlife',
    domestic: true,
    specialEvent: { name: 'Hummer/Bird Celebration', months: [10], window: 'Mid-October', note: 'Largest hummingbird festival in US' },
  },

  {
    flag: '🏄',
    name: 'Port Aransas, TX',
    why: 'Laid-back barrier island beach town — funky, independent, and stubbornly unhurried despite being just an hour from a major city',
    flightCostPerPerson: 0,
    nightlyHotelRate: 130,
    dailyExpensesPerPerson: 60,
    corridorId: 'CRP',
    corridorMode: 'drive',
    corridorHours: 1,
    corridorCost: 0,
    minNights: 2,
    sweetSpotNights: 3,
    maxNights: 5,
    tags: ['small-town', 'beach', 'laid-back', 'texas', 'island', 'fishing'],
    vibe: ['Small Town Charm 🏘️', 'Beach & Sun'],
    timing: {
      neverRecommend: { months: [], reason: '' },
      beachSeason: { months: [3,4,5,10,11,12,1,2], note: 'Gulf Coast beach season, mild winters' },
      shoulder: { months: [1,2,11,12], discount: '20–30% cheaper', tradeoffs: 'Cooler but very pleasant, fishing is excellent' },
      peak: { months: [3,4,5,6], premium: '20–40% more', note: 'Spring break and early summer draw crowds' },
      avoid: { months: [7,8,9], reason: 'Heat, humidity, and Hurricane season risk', hardBlock: false },
    },
    peakSeason: 'March–June',
    shoulderSeason: 'October–February',
    avoidMonths: [7,8,9],
    avgTempF: { Jan:59, Feb:62, Mar:68, Apr:74, May:80, Jun:85, Jul:89, Aug:90, Sep:86, Oct:80, Nov:71, Dec:62 },
    iata: 'CRP',
    proTip: 'Take the free Aransas Pass–Port Aransas ferry instead of the bridge — it\'s part of the experience. Dolphins follow the ferry.',
    highlight: 'Deep-sea fishing charters are the local sport — access to Gulf billfish, redfish, and trout year-round.',
    nearbyAttractions: ['Mustang Island State Park', 'Leonabelle Turnbull Birding Center', 'Rockport (30min)', 'University of Texas Marine Science Institute (free public aquarium)'],
    experienceType: 'seasonal',
    domestic: true,
  },

  {
    flag: '⚔️',
    name: 'Goliad, TX',
    why: 'Tiny historic town with a Spanish mission and colonial fort — one of the most dramatically undervisited historic sites in the US, where the forgotten massacre of the Texas Revolution occurred',
    flightCostPerPerson: 0,
    nightlyHotelRate: 85,
    dailyExpensesPerPerson: 35,
    corridorId: 'CRP',
    corridorMode: 'drive',
    corridorHours: 1,
    corridorCost: 0,
    minNights: 1,
    sweetSpotNights: 2,
    maxNights: 3,
    tags: ['small-town', 'historic', 'texas', 'mission', 'undervisited'],
    vibe: ['Small Town Charm 🏘️', 'Off the Map'],
    timing: {
      neverRecommend: { months: [], reason: '' },
      shoulder: { months: [10,11,2,3,4], discount: '10%', tradeoffs: 'Perfect mild weather' },
      avoid: { months: [7,8], reason: 'Texas inland summer heat', hardBlock: false },
    },
    peakSeason: 'March (Texas Independence month), October',
    shoulderSeason: 'November–February, April–May',
    avoidMonths: [7,8],
    avgTempF: { Jan:56, Feb:60, Mar:66, Apr:73, May:80, Jun:86, Jul:91, Aug:91, Sep:85, Oct:76, Nov:66, Dec:58 },
    iata: 'CRP',
    proTip: 'Presidio La Bahía is a fully intact Spanish colonial fort — used continuously from 1749 through the Texas Revolution. The 1836 Goliad Massacre happened here. Stunning and completely overlooked by tourists.',
    highlight: 'Mission Espíritu Santo — active Spanish mission since 1749, with the original church still standing.',
    nearbyAttractions: ['Presidio La Bahía', 'Mission Espíritu Santo State Park', 'Coleto Creek Reservoir (30min)'],
    experienceType: 'ancient',
    domestic: true,
  },

  {
    flag: '🤠',
    name: 'Refugio, TX',
    why: 'Ranching country — very old Texas, deep roots, and the kind of quiet that reminds you how much of the Gulf Coast is empty scrubland and sky',
    flightCostPerPerson: 0,
    nightlyHotelRate: 80,
    dailyExpensesPerPerson: 35,
    corridorId: 'CRP',
    corridorMode: 'drive',
    corridorHours: 0.75,
    corridorCost: 0,
    minNights: 1,
    sweetSpotNights: 2,
    maxNights: 3,
    tags: ['small-town', 'ranch', 'texas', 'off-beaten-path', 'old-texas'],
    vibe: ['Small Town Charm 🏘️', 'Farm & Countryside 🌾', 'Off the Map'],
    timing: {
      neverRecommend: { months: [], reason: '' },
      shoulder: { months: [10,11,2,3], discount: '5–10%', tradeoffs: 'Mild temperatures' },
      avoid: { months: [7,8], reason: 'South Texas summer heat is extreme', hardBlock: false },
    },
    peakSeason: 'November–March',
    shoulderSeason: 'October, April',
    avoidMonths: [7,8],
    avgTempF: { Jan:58, Feb:62, Mar:68, Apr:75, May:81, Jun:87, Jul:91, Aug:91, Sep:86, Oct:78, Nov:68, Dec:60 },
    iata: 'CRP',
    proTip: 'Mission Valley and the surrounding ranch country is classic South Texas brush — if you\'re into hunting or wildlife (white-tailed deer country), this is it. The county seat has been here since 1834.',
    highlight: 'Lake Texana State Park (40min east) — largemouth bass fishing, camping, migration birding in spring.',
    nearbyAttractions: ['Goliad (30min)', 'Rockport (50min)', 'Lake Texana State Park'],
    experienceType: 'seasonal',
    domestic: true,
  },


  // ════════════════════════════════════════════════════════════════
  // NEAR FORT LAUDERDALE (FLL) / SOUTH FLORIDA
  // Gateway note: FLL for budget, PBI for Treasure Coast proximity
  // ════════════════════════════════════════════════════════════════

  {
    flag: '⚓',
    name: 'Stuart, FL',
    why: '"Sailfish Capital of the World" — a Treasure Coast gem with a genuinely revitalized downtown, the St. Lucie River, and none of the overdevelopment that defines the rest of South Florida',
    flightCostPerPerson: 0,
    nightlyHotelRate: 130,
    dailyExpensesPerPerson: 60,
    corridorId: 'PBI',
    corridorMode: 'drive',
    corridorHours: 0.75,
    corridorCost: 0,
    corridorAlt: 'FLL',
    corridorAltHours: 1.25,
    minNights: 2,
    sweetSpotNights: 4,
    maxNights: 7,
    tags: ['small-town', 'sailfish', 'florida', 'fishing', 'treasure-coast', 'walkable'],
    vibe: ['Small Town Charm 🏘️', 'Beach & Sun', 'Nature & Escape'],
    timing: {
      neverRecommend: { months: [], reason: '' },
      beachSeason: { months: [10,11,12,1,2,3,4,5], note: 'Treasure Coast beach season' },
      sailfishPeak: { months: [11,12,1,2,3], note: 'Sailfish season November–March — the reason sportfishing charters exist here' },
      shoulder: { months: [4,5,10,11], discount: '15–25%', tradeoffs: 'Warm, manageable crowds' },
      peak: { months: [1,2,3], premium: '20–35%', note: 'Peak winter season and sailfish tournaments' },
      avoid: { months: [7,8,9], reason: 'Hurricane season risk and summer heat', hardBlock: false },
    },
    peakSeason: 'December–March',
    shoulderSeason: 'October–November, April–May',
    avoidMonths: [7,8,9],
    avgTempF: { Jan:68, Feb:70, Mar:74, Apr:78, May:83, Jun:88, Jul:91, Aug:91, Sep:89, Oct:83, Nov:77, Dec:70 },
    iata: 'PBI',
    proTip: 'The Downtown Stuart waterfront along Flagler Avenue is one of Florida\'s most genuine small-town commercial streets — independent restaurants, art galleries, and a weekend farmers market. No Applebee\'s in sight.',
    highlight: 'Bathtub Beach on Hutchinson Island — protected lagoon-style beach with natural rock reef. One of Florida\'s most unusual shore environments.',
    nearbyAttractions: ['Bathtub Beach (Hutchinson Island)', 'Jonathan Dickinson State Park', 'Jensen Beach (10min)', 'Martin County Sailing and Windsurfing'],
    experienceType: 'seasonal',
    domestic: true,
  },

  {
    flag: '🎣',
    name: 'Jensen Beach, FL',
    why: 'Quieter and more local than Stuart, just north — old Florida fishing town with a laid-back causeway culture and Indian River Lagoon access',
    flightCostPerPerson: 0,
    nightlyHotelRate: 115,
    dailyExpensesPerPerson: 55,
    corridorId: 'PBI',
    corridorMode: 'drive',
    corridorHours: 0.75,
    corridorCost: 0,
    corridorAlt: 'FLL',
    corridorAltHours: 1.25,
    minNights: 2,
    sweetSpotNights: 3,
    maxNights: 5,
    tags: ['small-town', 'fishing', 'florida', 'old-florida', 'treasure-coast'],
    vibe: ['Small Town Charm 🏘️', 'Beach & Sun'],
    timing: {
      neverRecommend: { months: [], reason: '' },
      beachSeason: { months: [10,11,12,1,2,3,4,5], note: 'Treasure Coast beach season' },
      shoulder: { months: [4,5,10,11], discount: '15–20%', tradeoffs: 'Warm, local crowds only' },
      peak: { months: [1,2,3], premium: '20–30%', note: 'Snowbird peak' },
      avoid: { months: [7,8,9], reason: 'Hurricane season and heat', hardBlock: false },
    },
    peakSeason: 'November–April',
    shoulderSeason: 'October, May',
    avoidMonths: [7,8,9],
    avgTempF: { Jan:68, Feb:70, Mar:74, Apr:78, May:83, Jun:88, Jul:91, Aug:91, Sep:89, Oct:83, Nov:77, Dec:70 },
    iata: 'PBI',
    proTip: 'Indian River Lagoon has some of the highest biodiversity of any estuary in North America — paddleboard or kayak rentals available on the causeway. Manatees year-round.',
    highlight: 'Sea turtle nesting season (May–October) — Jensen Beach is a major nesting spot. Guided night tours available.',
    nearbyAttractions: ['Indian River Lagoon', 'Stuart (10min)', 'Hutchinson Island beaches', 'Sea turtle nesting tours (summer)'],
    experienceType: 'wildlife',
    domestic: true,
  },

  {
    flag: '🌊',
    name: 'Delray Beach, FL',
    why: 'Atlantic Avenue is one of Florida\'s most genuinely walkable and independently-spirited main streets — artsy, alive at night, and still not Miami',
    flightCostPerPerson: 0,
    nightlyHotelRate: 160,
    dailyExpensesPerPerson: 70,
    corridorId: 'FLL',
    corridorMode: 'drive',
    corridorHours: 0.5,
    corridorCost: 0,
    corridorAlt: 'PBI',
    corridorAltHours: 0.5,
    minNights: 2,
    sweetSpotNights: 4,
    maxNights: 6,
    tags: ['small-town', 'beach', 'walkable', 'arts', 'florida', 'nightlife'],
    vibe: ['Small Town Charm 🏘️', 'Beach & Sun', 'City & Culture'],
    timing: {
      neverRecommend: { months: [], reason: '' },
      beachSeason: { months: [10,11,12,1,2,3,4,5], note: 'Year-round good; winter is peak' },
      shoulder: { months: [4,5,10,11], discount: '20–30%', tradeoffs: 'Warm, smaller crowds' },
      peak: { months: [1,2,3], premium: '30–50% more', note: 'Peak snowbird and spring break' },
      avoid: { months: [7,8,9], reason: 'Heat and hurricane season', hardBlock: false },
    },
    peakSeason: 'December–April',
    shoulderSeason: 'October–November, May',
    avoidMonths: [7,8,9],
    avgTempF: { Jan:70, Feb:72, Mar:75, Apr:79, May:83, Jun:88, Jul:90, Aug:91, Sep:89, Oct:84, Nov:79, Dec:72 },
    iata: 'FLL',
    proTip: 'Atlantic Avenue between Swinton and A1A is the walkable core — 30+ restaurants, galleries, and bars within half a mile. Delray\'s First Art Walk (second Friday of each month) is free.',
    highlight: 'The Colony Hotel — a 1926 Mediterranean Revival landmark, perfectly restored, with a rooftop bar worth the trip alone.',
    nearbyAttractions: ['Atlantic Avenue', 'Morikami Museum and Japanese Gardens', 'Palm Beach (30min)', 'Boca Raton (15min)'],
    experienceType: 'seasonal',
    domestic: true,
  },

  {
    flag: '🌴',
    name: 'Deerfield Beach, FL',
    why: 'Underrated stretch of South Florida coast — genuinely local, less crowded than Fort Lauderdale or Boca Raton, with a strong fishing pier culture',
    flightCostPerPerson: 0,
    nightlyHotelRate: 130,
    dailyExpensesPerPerson: 60,
    corridorId: 'FLL',
    corridorMode: 'drive',
    corridorHours: 0.25,
    corridorCost: 0,
    minNights: 2,
    sweetSpotNights: 3,
    maxNights: 5,
    tags: ['small-town', 'beach', 'florida', 'pier', 'local'],
    vibe: ['Small Town Charm 🏘️', 'Beach & Sun'],
    timing: {
      neverRecommend: { months: [], reason: '' },
      beachSeason: { months: [10,11,12,1,2,3,4,5], note: 'Year-round good; winter is peak' },
      shoulder: { months: [4,5,10,11], discount: '20–25%', tradeoffs: 'Less crowded, still warm' },
      peak: { months: [1,2,3], premium: '25–40%', note: 'Peak winter snowbird season' },
      avoid: { months: [7,8,9], reason: 'Heat and hurricane season', hardBlock: false },
    },
    peakSeason: 'November–April',
    shoulderSeason: 'October, May',
    avoidMonths: [7,8,9],
    avgTempF: { Jan:70, Feb:72, Mar:75, Apr:79, May:83, Jun:88, Jul:90, Aug:91, Sep:89, Oct:84, Nov:79, Dec:72 },
    iata: 'FLL',
    proTip: 'Deerfield Beach Pier is a working fishing pier — go at dawn to see the local fishers, who are entirely separate from the tourist infrastructure two blocks away.',
    highlight: 'Quiet beach north of the pier gets almost no foot traffic despite being 10 min from FLL airport.',
    nearbyAttractions: ['Quiet Waters Park (kayak, water skiing)', 'Boca Raton (20min)', 'Delray Beach (20min)', 'Fort Lauderdale (20min)'],
    experienceType: 'seasonal',
    domestic: true,
  },

  {
    flag: '🐎',
    name: 'Davie, FL',
    why: 'Somehow still horse country — a Western-themed small town with working ranches, rodeos, and equestrian trails inside one of the most urbanized counties in Florida',
    flightCostPerPerson: 0,
    nightlyHotelRate: 110,
    dailyExpensesPerPerson: 50,
    corridorId: 'FLL',
    corridorMode: 'drive',
    corridorHours: 0.2,
    corridorCost: 0,
    minNights: 1,
    sweetSpotNights: 2,
    maxNights: 3,
    tags: ['small-town', 'western', 'horses', 'rodeo', 'florida', 'unusual'],
    vibe: ['Small Town Charm 🏘️', 'Farm & Countryside 🌾', 'Off the Map'],
    timing: {
      neverRecommend: { months: [], reason: '' },
      shoulder: { months: [10,11,1,2,3,4], discount: '10%', tradeoffs: 'Best equestrian weather' },
      peak: { months: [1,2,3], premium: '10–20%', note: 'Winter rodeo season' },
      avoid: { months: [7,8], reason: 'South Florida summer heat; rodeo season is off', hardBlock: false },
    },
    peakSeason: 'November–April (rodeo season)',
    shoulderSeason: 'October, May',
    avoidMonths: [7,8],
    avgTempF: { Jan:70, Feb:72, Mar:75, Apr:80, May:83, Jun:88, Jul:91, Aug:91, Sep:89, Oct:84, Nov:79, Dec:72 },
    iata: 'FLL',
    proTip: 'Young At Art Museum and Flamingo Gardens are both in Davie and both excellent. But the real story is the Western overlay — working ranches with horses on the side streets just miles from a major airport.',
    highlight: 'Bergeron Rodeo Grounds hosts PRCA rodeo events — a legitimate surprise 15 minutes from Fort Lauderdale airport.',
    nearbyAttractions: ['Bergeron Rodeo Grounds', 'Young At Art Children\'s Museum', 'Flamingo Gardens', 'Tree Tops Park (equestrian trails)'],
    experienceType: 'seasonal',
    domestic: true,
  },

];


// ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────

/**
 * Get all domestic towns for a specific gateway
 */
function getTownsByGateway(iata) {
  return DOMESTIC_TOWNS.filter(t =>
    t.corridorId === iata || t.corridorAlt === iata
  );
}

/**
 * Get towns by vibe tag
 */
function getTownsByVibe(vibeLabel) {
  return DOMESTIC_TOWNS.filter(t =>
    t.vibe && t.vibe.some(v => v.includes(vibeLabel) || vibeLabel.includes(v.replace(/[^a-zA-Z ]/g,'').trim()))
  );
}

/**
 * Given a user's origin airport, return all domestic gateways
 * with direct flight availability, sorted by avg round-trip cost.
 */
function getDirectGatewaysFromOrigin(originIata) {
  const results = [];
  for (const [gwIata, gw] of Object.entries(DOMESTIC_GATEWAYS)) {
    const match = gw.directFrom.find(d =>
      Array.isArray(d.iata)
        ? d.iata.includes(originIata)
        : d.iata === originIata
    );
    if (match) {
      results.push({
        gateway: gwIata,
        gatewayName: gw.name,
        region: gw.region,
        avgRt: match.avgRt,
        carriers: match.carriers,
        towns: getTownsByGateway(gwIata),
      });
    }
  }
  return results;
}

/**
 * Check if a direct flight exists between two airports
 */
function hasDirectFlight(originIata, gatewayIata) {
  const gw = DOMESTIC_GATEWAYS[gatewayIata];
  if (!gw) return false;
  return gw.directFrom.some(d =>
    Array.isArray(d.iata) ? d.iata.includes(originIata) : d.iata === originIata
  );
}

/**
 * Get the flight cost estimate for a specific origin → gateway pair
 */
function getFlightEstimate(originIata, gatewayIata) {
  const gw = DOMESTIC_GATEWAYS[gatewayIata];
  if (!gw) return null;
  const match = gw.directFrom.find(d =>
    Array.isArray(d.iata) ? d.iata.includes(originIata) : d.iata === originIata
  );
  return match ? { avgRt: match.avgRt, carriers: match.carriers, direct: true } : null;
}

module.exports = {
  DOMESTIC_GATEWAYS,
  DOMESTIC_TOWNS,
  getTownsByGateway,
  getTownsByVibe,
  getDirectGatewaysFromOrigin,
  hasDirectFlight,
  getFlightEstimate,
};
