/**
 * UNESCO WORLD HERITAGE SITES — Tier 2 Destination Data
 * For Go Elsewhere / goelsewhere.travel
 *
 * TIER DEFINITION:
 *   Tier 1 = Already in corridors.js — just add unesco: true flag
 *   Tier 2 = High travel demand, not yet in corridors — add as new destinations (THIS FILE)
 *   Tier 3 = Reference only, too niche/remote for current audience
 *
 * SCHEMA:
 *   name          — Display name
 *   unescoName    — Official UNESCO inscription name
 *   country       — Country
 *   region        — Broad region
 *   lat/lng       — Coordinates
 *   gateway       — Nearest airport IATA + drive time (same format as world_parks_data.js)
 *   tags          — Descriptive tags
 *   inscribed     — Year of UNESCO inscription
 *   notes         — Editorial one-liner
 *   nightlyMid    — Estimated midrange nightly hotel rate (USD)
 *   vibes         — Which Go Elsewhere vibe tags apply
 *   minNights     — Recommended minimum nights
 *   maxNights     — Recommended maximum nights
 */

module.exports.UNESCO_TIER2 = [

  // ─── LATIN AMERICA ────────────────────────────────────────────────────────

  {
    name: 'Machu Picchu',
    unescoName: 'Historic Sanctuary of Machu Picchu',
    country: 'Peru',
    region: 'South America / Andes',
    lat: -13.1631,
    lng: -72.5450,
    gateway: 'LIM (Lima) → CUZ (Cusco, 1 hr flight) → Aguas Calientes (train 3.5 hrs)',
    tags: ['Inca', 'mountain citadel', 'UNESCO', 'trekking', 'Inca Trail', 'Huayna Picchu', 'altitude'],
    inscribed: 1983,
    notes: 'The most visited archaeological site in the Americas. Take the train from Cusco — the Inca Trail requires permits booked months ahead. Altitude at Cusco (11,000 ft) demands 2 acclimatization days.',
    nightlyMid: 120,
    vibes: ['nature-escape', 'off-the-map', 'city-culture'],
    minNights: 7,
    maxNights: 14,
  },

  {
    name: 'Cartagena Old City',
    unescoName: 'Port, Fortresses and Group of Monuments, Cartagena',
    country: 'Colombia',
    region: 'South America / Caribbean Coast',
    lat: 10.4236,
    lng: -75.5510,
    gateway: 'CTG (Cartagena, on-site)',
    tags: ['walled city', 'colonial', 'UNESCO', 'caribbean', 'salsa', 'colonial architecture', 'beach nearby'],
    inscribed: 1984,
    notes: 'Already in corridors — add unesco: true. Pastel-walled colonial city inside 16th century Spanish fortifications. Rosario Islands 45 min by boat.',
    nightlyMid: 140,
    vibes: ['city-culture', 'beach-sun', 'off-the-map'],
    minNights: 4,
    maxNights: 10,
    alreadyInCorridors: true,
  },

  {
    name: 'Havana',
    unescoName: 'Old Havana and its Fortification System',
    country: 'Cuba',
    region: 'Caribbean',
    lat: 23.1356,
    lng: -82.3590,
    gateway: 'HAV (Havana, on-site)',
    tags: ['colonial', 'UNESCO', 'cars', 'salsa', 'rum', 'cigars', 'caribbean', 'art deco'],
    inscribed: 1982,
    notes: 'Already in corridors — add unesco: true. The most intact Spanish colonial city in the Americas, preserved by accident. 1950s American cars everywhere. Unique political situation — check current US travel rules.',
    nightlyMid: 80,
    vibes: ['city-culture', 'off-the-map'],
    minNights: 5,
    maxNights: 10,
    alreadyInCorridors: true,
  },

  {
    name: 'Chichén Itzá',
    unescoName: 'Pre-Hispanic City of Chichen-Itza',
    country: 'Mexico',
    region: 'Mexico / Yucatan',
    lat: 20.6843,
    lng: -88.5677,
    gateway: 'CUN (Cancún, 2.5 hrs drive) or MID (Mérida, 1.5 hrs drive)',
    tags: ['Maya', 'UNESCO', 'pyramid', 'archaeological', 'equinox', 'Yucatan', 'Mexico'],
    inscribed: 1988,
    notes: 'The most visited archaeological site in Mexico. Usually paired with Tulum or Mérida. Go at opening (8am) before tour buses arrive. Equinox shadow effect March 20 and Sept 22 — book a year ahead.',
    nightlyMid: 100,
    vibes: ['city-culture', 'off-the-map', 'nature-escape'],
    minNights: 5,
    maxNights: 10,
  },

  {
    name: 'Oaxaca',
    unescoName: 'Historic Centre of Oaxaca and Archaeological Zone of Monte Albán',
    country: 'Mexico',
    region: 'Mexico / South',
    lat: 17.0732,
    lng: -96.7266,
    gateway: 'OAX (Oaxaca, on-site)',
    tags: ['UNESCO', 'mezcal', 'indigenous culture', 'mole', 'Day of the Dead', 'Monte Albán', 'Mexico', 'textiles'],
    inscribed: 1987,
    notes: 'Mexico\'s cultural capital. Monte Albán Zapotec ruins above the city, mezcal distilleries, the best mole on earth, extraordinary textile markets. Day of the Dead (Nov 1–2) is transformative.',
    nightlyMid: 90,
    vibes: ['city-culture', 'off-the-map', 'small-town'],
    minNights: 5,
    maxNights: 10,
  },

  {
    name: 'Iguazú Falls',
    unescoName: 'Iguazu National Park (Argentina) / Iguaçu National Park (Brazil)',
    country: 'Argentina / Brazil',
    region: 'South America / Southern Cone',
    lat: -25.6953,
    lng: -54.4367,
    gateway: 'IGR (Iguazú, Argentina side, on-site) or FOZ (Foz do Iguaçu, Brazil side, on-site)',
    tags: ['waterfall', 'UNESCO', 'national park', 'wildlife', 'Argentina', 'Brazil', 'Devil\'s Throat'],
    inscribed: 1984,
    notes: 'Eleanor Roosevelt said "Poor Niagara" when she first saw it. 275 waterfalls in a 2km arc. Do both sides — Argentina for the walkways inside the falls, Brazil for the panoramic view.',
    nightlyMid: 130,
    vibes: ['nature-escape', 'off-the-map'],
    minNights: 3,
    maxNights: 5,
  },

  // ─── EUROPE ───────────────────────────────────────────────────────────────

  {
    name: 'Alhambra & Granada',
    unescoName: 'Alhambra, Generalife and Albayzín, Granada',
    country: 'Spain',
    region: 'Europe / Iberia',
    lat: 37.1760,
    lng: -3.5881,
    gateway: 'GRX (Granada, on-site) or MAD (Madrid, 4.5 hrs by AVE train)',
    tags: ['Moorish', 'UNESCO', 'palace', 'gardens', 'Andalusia', 'Spain', 'Albayzín', 'tapas'],
    inscribed: 1984,
    notes: 'The Alhambra is arguably the most beautiful building on Earth. Book tickets 3 months ahead — daily visitors are capped. Albayzín (Moorish quarter) is a separate UNESCO site across the gorge. Snow on the Sierra Nevada behind it in winter.',
    nightlyMid: 110,
    vibes: ['city-culture', 'off-the-map'],
    minNights: 4,
    maxNights: 7,
  },

  {
    name: 'Amalfi Coast',
    unescoName: 'Costiera Amalfitana',
    country: 'Italy',
    region: 'Europe / Mediterranean',
    lat: 40.6340,
    lng: 14.6027,
    gateway: 'NAP (Naples, 1 hr drive) or SA (Salerno, 30 min)',
    tags: ['UNESCO', 'cliffside villages', 'Mediterranean', 'Italy', 'Positano', 'Ravello', 'lemon groves', 'boat'],
    inscribed: 1997,
    notes: 'Positano, Ravello, Amalfi — vertical villages on limestone cliffs above turquoise water. Spring and fall are best (summer is a traffic jam). Ravello\'s Villa Rufolo gardens and Gore Vidal\'s terrace view.',
    nightlyMid: 200,
    vibes: ['beach-sun', 'city-culture', 'off-the-map'],
    minNights: 5,
    maxNights: 10,
  },

  {
    name: 'Dubrovnik Old City',
    unescoName: 'Old City of Dubrovnik',
    country: 'Croatia',
    region: 'Europe / Balkans',
    lat: 42.6507,
    lng: 18.0944,
    gateway: 'DBV (Dubrovnik, on-site)',
    tags: ['UNESCO', 'walled city', 'Adriatic', 'Croatia', 'Game of Thrones', 'medieval', 'city walls'],
    inscribed: 1979,
    notes: 'The most intact medieval walled city in Europe. Walk the complete city walls in 2 hours. Go in October–March — summer is overwhelming. The Adriatic below the walls in winter light is stunning.',
    nightlyMid: 130,
    vibes: ['city-culture', 'beach-sun', 'off-the-map'],
    minNights: 3,
    maxNights: 7,
  },

  {
    name: 'Prague Historic Centre',
    unescoName: 'Historic Centre of Prague',
    country: 'Czech Republic',
    region: 'Europe / Central',
    lat: 50.0755,
    lng: 14.4378,
    gateway: 'PRG (Prague, on-site)',
    tags: ['UNESCO', 'medieval', 'baroque', 'Charles Bridge', 'Christmas market', 'Central Europe', 'beer'],
    inscribed: 1992,
    notes: 'Prague Christmas market on Old Town Square is one of Europe\'s finest — mulled wine, trdelník, the astronomical clock. The city survived WWII nearly intact, making it one of the most architecturally dense cities in Europe.',
    nightlyMid: 100,
    vibes: ['city-culture', 'white-christmas'],
    minNights: 4,
    maxNights: 7,
  },

  {
    name: 'Bruges Historic Centre',
    unescoName: 'Flemish Béguinages / Historic Centre of Brugge',
    country: 'Belgium',
    region: 'Europe / Western',
    lat: 51.2093,
    lng: 3.2247,
    gateway: 'BRU (Brussels, 1 hr train) or LGG (Liège, 1.5 hrs)',
    tags: ['UNESCO', 'medieval', 'canals', 'chocolate', 'beer', 'Belgium', 'Christmas market', 'lace'],
    inscribed: 2000,
    notes: 'The best-preserved medieval city in Northern Europe. Canals frozen in winter, Christmas market on the Markt, the Groeningemuseum. A day trip from Brussels but worth staying — it\'s different at night.',
    nightlyMid: 140,
    vibes: ['city-culture', 'white-christmas', 'small-town'],
    minNights: 2,
    maxNights: 5,
  },

  {
    name: 'Sintra',
    unescoName: 'Cultural Landscape of Sintra',
    country: 'Portugal',
    region: 'Europe / Iberia',
    lat: 38.7976,
    lng: -9.3895,
    gateway: 'LIS (Lisbon, 40 min train)',
    tags: ['UNESCO', 'palaces', 'romantic', 'Portugal', 'Pena Palace', 'Moorish castle', 'forests'],
    inscribed: 1995,
    notes: 'Already paired with LIS corridor — add unesco: true. Colorful fairy-tale palaces in a misty forested mountain above the Atlantic. Pena Palace is the most photographed building in Portugal.',
    nightlyMid: 110,
    vibes: ['city-culture', 'off-the-map', 'nature-escape'],
    minNights: 1,
    maxNights: 3,
    alreadyInCorridors: true,
  },

  {
    name: 'Cappadocia',
    unescoName: 'Göreme National Park and the Rock Sites of Cappadocia',
    country: 'Turkey',
    region: 'Europe / Middle East crossover',
    lat: 38.6431,
    lng: 34.8289,
    gateway: 'ASR (Kayseri, 1 hr drive) or NAV (Nevşehir, 45 min)',
    tags: ['UNESCO', 'hot air balloon', 'cave hotel', 'fairy chimneys', 'Turkey', 'underground cities', 'surreal'],
    inscribed: 1985,
    notes: 'Hot air balloons over fairy chimney rock formations at sunrise is one of the iconic travel images of the 21st century. Stay in a cave hotel. Underground cities carved by early Christians. Book balloon flights 2 weeks ahead.',
    nightlyMid: 130,
    vibes: ['off-the-map', 'nature-escape', 'city-culture'],
    minNights: 4,
    maxNights: 7,
  },

  // ─── AFRICA / MIDDLE EAST ────────────────────────────────────────────────

  {
    name: 'Petra',
    unescoName: 'Petra',
    country: 'Jordan',
    region: 'Middle East',
    lat: 30.3285,
    lng: 35.4444,
    gateway: 'AMM (Amman, 3.5 hrs drive) or AQJ (Aqaba, 1.5 hrs)',
    tags: ['UNESCO', 'Nabataean', 'rock-carved city', 'Jordan', 'Treasury', 'desert', 'archaeology'],
    inscribed: 1985,
    notes: 'The Treasury carved from rose-red sandstone — approached through a 1.2km slot canyon (the Siq). Petra by Night (candlelit walk, 3 nights/week) is worth the extra cost. Wadi Rum desert is 1.5 hrs away.',
    nightlyMid: 120,
    vibes: ['off-the-map', 'city-culture', 'nature-escape'],
    minNights: 5,
    maxNights: 10,
  },

  {
    name: 'Marrakech Medina',
    unescoName: 'Medina of Marrakesh',
    country: 'Morocco',
    region: 'Africa / North Africa',
    lat: 31.6295,
    lng: -7.9811,
    gateway: 'RAK (Marrakech, on-site)',
    tags: ['UNESCO', 'medina', 'souk', 'riad', 'Djemaa el-Fna', 'Morocco', 'spice market', 'Atlas Mountains nearby'],
    inscribed: 1985,
    notes: 'Already in corridors — add unesco: true. Djemaa el-Fna square at dusk with storytellers, snake charmers, food stalls. The souks are a full day. Atlas Mountains for trekking or a day trip to Aït Benhaddou (another UNESCO site).',
    nightlyMid: 90,
    vibes: ['city-culture', 'off-the-map'],
    minNights: 4,
    maxNights: 8,
    alreadyInCorridors: true,
  },

  {
    name: 'Fez Medina',
    unescoName: 'Medina of Fez',
    country: 'Morocco',
    region: 'Africa / North Africa',
    lat: 34.0541,
    lng: -5.0006,
    gateway: 'FEZ (Fez, on-site)',
    tags: ['UNESCO', 'medina', 'tanneries', 'university', 'Morocco', 'medieval', 'labyrinth', 'Al-Attarine madrasa'],
    inscribed: 1981,
    notes: 'The world\'s largest living medieval city — 9,000 alleys, no cars. The Chouara tanneries viewed from a leather shop balcony is one of the great sensory experiences in travel. Al-Qarawiyyin, founded 859 AD, is the world\'s oldest university.',
    nightlyMid: 80,
    vibes: ['off-the-map', 'city-culture'],
    minNights: 3,
    maxNights: 6,
  },

  {
    name: 'Victoria Falls',
    unescoName: 'Mosi-oa-Tunya / Victoria Falls',
    country: 'Zambia / Zimbabwe',
    region: 'Africa / Southern Africa',
    lat: -17.9243,
    lng: 25.8572,
    gateway: 'LVI (Livingstone, Zambia, on-site) or VFA (Victoria Falls, Zimbabwe, on-site)',
    tags: ['UNESCO', 'waterfall', 'Africa', 'Zambia', 'Zimbabwe', 'bungee', 'rafting', 'safari nearby'],
    inscribed: 1989,
    notes: 'The largest curtain of falling water on Earth — 1.7km wide. Accessible from both Zambia (Livingstone) and Zimbabwe (Vic Falls town). Combine with a Botswana Chobe safari (1 hr drive). Devil\'s Pool swimming at the edge of the falls (Zambia side, dry season only).',
    nightlyMid: 150,
    vibes: ['nature-escape', 'off-the-map'],
    minNights: 4,
    maxNights: 8,
  },

  // ─── ASIA ─────────────────────────────────────────────────────────────────

  {
    name: 'Angkor Wat',
    unescoName: 'Angkor',
    country: 'Cambodia',
    region: 'Asia / Southeast Asia',
    lat: 13.4125,
    lng: 103.8670,
    gateway: 'REP (Siem Reap, on-site)',
    tags: ['UNESCO', 'Khmer', 'temple', 'sunrise', 'Cambodia', 'Angkor Thom', 'Ta Prohm', 'archaeology'],
    inscribed: 1992,
    notes: 'The largest religious monument ever built. Buy a 3-day pass — you need it. Sunrise at the main temple, Bayon faces mid-morning, Ta Prohm (the tree-root temple) at dusk. Cool season November–March.',
    nightlyMid: 70,
    vibes: ['off-the-map', 'city-culture', 'nature-escape'],
    minNights: 4,
    maxNights: 7,
  },

  {
    name: 'Hội An Ancient Town',
    unescoName: 'Hoi An Ancient Town',
    country: 'Vietnam',
    region: 'Asia / Southeast Asia',
    lat: 15.8801,
    lng: 108.3380,
    gateway: 'DAD (Da Nang, 30 min drive)',
    tags: ['UNESCO', 'lanterns', 'trading port', 'Vietnam', 'tailors', 'cycling', 'Full Moon Festival', 'beaches nearby'],
    inscribed: 1999,
    notes: 'A 15th–19th century trading port preserved almost completely. Monthly Full Moon Lantern Festival — electric lights turned off, paper lanterns floated on the river. An Bằng Beach is 4km away. Best tailors in Southeast Asia.',
    nightlyMid: 60,
    vibes: ['city-culture', 'beach-sun', 'off-the-map'],
    minNights: 4,
    maxNights: 8,
  },

  {
    name: 'Luang Prabang',
    unescoName: 'Town of Luang Prabang',
    country: 'Laos',
    region: 'Asia / Southeast Asia',
    lat: 19.8869,
    lng: 102.1353,
    gateway: 'LPQ (Luang Prabang, on-site)',
    tags: ['UNESCO', 'Buddhist', 'monks', 'alms giving', 'Mekong', 'Laos', 'waterfalls', 'temples', 'French colonial'],
    inscribed: 1995,
    notes: 'The most spiritual town in Southeast Asia. Dawn alms-giving ceremony (tak bat) — hundreds of monks in saffron robes collecting rice in silence. Kuang Si waterfalls (turquoise terraced pools, 30 min away). Slow boats on the Mekong.',
    nightlyMid: 55,
    vibes: ['off-the-map', 'city-culture', 'nature-escape'],
    minNights: 4,
    maxNights: 8,
  },

  {
    name: 'Bagan',
    unescoName: 'Ancient City of Bagan',
    country: 'Myanmar',
    region: 'Asia / Southeast Asia',
    lat: 21.1717,
    lng: 94.8585,
    gateway: 'NYU (Bagan/Nyaung-U, on-site) via RGN (Yangon) or MDL (Mandalay)',
    tags: ['UNESCO', 'temples', 'Myanmar', 'hot air balloon', 'Buddhist', 'plains', 'archaeology', 'pagodas'],
    inscribed: 2019,
    notes: '3,500 Buddhist temples on a plain — visible from hot air balloons at sunrise. Check current Myanmar travel advisories (political situation as of 2026). One of the most otherworldly landscapes in Asia.',
    nightlyMid: 80,
    vibes: ['off-the-map', 'nature-escape'],
    minNights: 3,
    maxNights: 5,
  },

  {
    name: 'Kyoto Historic Monuments',
    unescoName: 'Historic Monuments of Ancient Kyoto',
    country: 'Japan',
    region: 'Asia / Japan',
    lat: 35.0116,
    lng: 135.7681,
    gateway: 'KIX (Osaka/Kansai, 1.5 hrs) or ITM (Itami, 1 hr) — Shinkansen from Tokyo 2.5 hrs',
    tags: ['UNESCO', 'Japan', 'temples', 'geisha', 'bamboo', 'Fushimi Inari', 'Arashiyama', 'cherry blossom', 'ryokan'],
    inscribed: 1994,
    notes: 'Already likely in NRT corridors — add unesco: true. 17 UNESCO components including Kinkaku-ji (Golden Pavilion), Fushimi Inari, Ryōan-ji. Cherry blossom (late March–April) and fall foliage (November) are peak. Nishiki Market for food.',
    nightlyMid: 130,
    vibes: ['city-culture', 'off-the-map', 'nature-escape'],
    minNights: 4,
    maxNights: 10,
    alreadyInCorridors: true,
  },

  {
    name: 'Ha Long Bay',
    unescoName: 'Ha Long Bay',
    country: 'Vietnam',
    region: 'Asia / Southeast Asia',
    lat: 20.9101,
    lng: 107.1839,
    gateway: 'HAN (Hanoi, 3.5 hrs drive) or VDO (Van Don Airport, 1 hr)',
    tags: ['UNESCO', 'limestone karsts', 'cruise', 'kayaking', 'Vietnam', 'emerald water', 'junk boat'],
    inscribed: 1994,
    notes: '1,600 limestone islands emerging from emerald water. Overnight on a traditional junk boat is the only way to do it — multi-day cruise through caves, floating villages, and karst formations that appear painted.',
    nightlyMid: 90,
    vibes: ['nature-escape', 'off-the-map', 'beach-sun'],
    minNights: 5,
    maxNights: 10,
  },

  {
    name: 'Serengeti National Park',
    unescoName: 'Serengeti National Park',
    country: 'Tanzania',
    region: 'Africa / East Africa',
    lat: -2.3333,
    lng: 34.8333,
    gateway: 'JRO (Kilimanjaro, 3 hrs drive) or ARK (Arusha, 3 hrs)',
    tags: ['UNESCO', 'safari', 'Great Migration', 'wildebeest', 'Big Five', 'Tanzania', 'Maasai Mara', 'camping'],
    inscribed: 1981,
    notes: 'The Great Migration (1.5 million wildebeest) July–October is the most spectacular wildlife event on Earth. Combine with Ngorongoro Crater (1 hr) and Zanzibar beach (fly, 1 hr) for the full East Africa circuit.',
    nightlyMid: 300,
    vibes: ['nature-escape', 'off-the-map'],
    minNights: 7,
    maxNights: 14,
  },

  // ─── OCEANIA ──────────────────────────────────────────────────────────────

  {
    name: 'Uluru-Kata Tjuta',
    unescoName: 'Uluru-Kata Tjuta National Park',
    country: 'Australia',
    region: 'Oceania / Australia',
    lat: -25.3444,
    lng: 131.0369,
    gateway: 'AYQ (Ayers Rock/Uluru, on-site)',
    tags: ['UNESCO', 'sacred', 'Anangu', 'desert', 'Australia', 'monolith', 'outback', 'sunrise/sunset'],
    inscribed: 1987,
    notes: 'The most sacred site of the Anangu people. Climbing is now prohibited (banned 2019) — respect it. Uluru at sunrise and sunset changes color dramatically (ochre to deep red to violet). Field of Light art installation nearby.',
    nightlyMid: 200,
    vibes: ['off-the-map', 'nature-escape'],
    minNights: 3,
    maxNights: 5,
  },

  // ─── CANADA ───────────────────────────────────────────────────────────────

  {
    name: 'Quebec City Historic District',
    unescoName: 'Historic District of Old Québec',
    country: 'Canada',
    region: 'North America / Canada',
    lat: 46.8122,
    lng: -71.2145,
    gateway: 'YQB (Quebec City, 20 min)',
    tags: ['UNESCO', 'walled city', 'Château Frontenac', 'French', 'Canada', 'Christmas market', 'sleigh rides'],
    inscribed: 1985,
    notes: 'The only walled city north of Mexico. Château Frontenac is one of the most photographed hotels in the world. Christmas market and Winter Carnival (February) make it a year-round destination. Already in christmas-towns.js.',
    nightlyMid: 200,
    vibes: ['city-culture', 'white-christmas'],
    minNights: 3,
    maxNights: 6,
  },

];

/**
 * TIER 1 — Add `unesco: true` to these existing corridor destinations:
 *
 * corridors.js destinations that are already UNESCO sites:
 *   CTG  → Cartagena Historic Centre (1984)
 *   HAV  → Old Havana (1982)
 *   RAK  → Medina of Marrakesh (1985)
 *   LIS  → Sintra Cultural Landscape (1995) — Sintra day trip
 *   NRT  → Historic Monuments of Ancient Kyoto (1994) — Kyoto
 *   KEF  → Þingvellir National Park (2004) — day trip from Reykjavík
 *   YYC  → Banff National Park (1984)
 *   SDQ  → Colonial City of Santo Domingo (1990) — if in corridors
 *   SJU  → La Fortaleza and San Juan National Historic Site (1983)
 *
 * In corridors.js, for each of the above, add:
 *   unesco: true,
 *   unescoSite: 'Official UNESCO inscription name',
 *   unescoYear: YYYY,
 */

/**
 * USAGE IN server.js:
 *
 * const { UNESCO_TIER2 } = require('./unesco-tier2.js');
 *
 * app.get('/api/unesco', (req, res) => {
 *   const { region, vibe } = req.query;
 *   let sites = UNESCO_TIER2.filter(s => !s.alreadyInCorridors); // new destinations only
 *   if (region) sites = sites.filter(s => s.region.toLowerCase().includes(region.toLowerCase()));
 *   if (vibe) sites = sites.filter(s => s.vibes && s.vibes.includes(vibe));
 *   res.json({ sites, total: sites.length });
 * });
 *
 * In the main /api/search, when vibe includes 'city-culture' or 'off-the-map',
 * boost score by 10 points for destinations with unesco: true.
 */
