require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Amadeus = require('amadeus');
const { ALL_EXPERIENCES } = require('./experiences');
const { DOMESTIC_TOWNS, DOMESTIC_GATEWAYS, getTownsByGateway } = require('./domestic-towns');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
  origin: ['http://goelsewhere.travel', 'https://goelsewhere.travel', 'http://localhost:3000', 'http://localhost:3002']
}));
app.use(express.json());
app.use(express.static('.'));

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY,
  clientSecret: process.env.AMADEUS_API_SECRET
});

// ── Live hotel pricing from Amadeus (enriched offline) ──
let hotelData = {};
try {
  hotelData = require('./hotel-data.json');
  const count = Object.values(hotelData).filter(d => d.medianRate).length;
  console.log(`Loaded hotel-data.json: ${count} destinations with live rates`);
} catch {
  console.log('hotel-data.json not found, using static hotel rates');
}

function getHotelRate(destName, staticRate) {
  const entry = hotelData[destName];
  return (entry && entry.medianRate) ? entry.medianRate : staticRate;
}

// ── IATA lookup: city name → nearest airport code ──
const cityToIATA = {
  'new york': 'JFK', 'nyc': 'JFK', 'newark': 'EWR',
  'los angeles': 'LAX', 'la': 'LAX',
  'chicago': 'ORD',
  'miami': 'MIA',
  'philadelphia': 'PHL', 'philly': 'PHL',
  'washington': 'DCA', 'dc': 'DCA',
  'boston': 'BOS',
  'atlanta': 'ATL',
  'dallas': 'DFW',
  'houston': 'IAH',
  'san francisco': 'SFO', 'sf': 'SFO',
  'seattle': 'SEA',
  'denver': 'DEN',
  'phoenix': 'PHX',
  'orlando': 'MCO',
  'charlotte': 'CLT',
  'minneapolis': 'MSP',
  'detroit': 'DTW',
  'baltimore': 'BWI',
  'tampa': 'TPA',
  'portland': 'PDX',
  'las vegas': 'LAS',
  'nashville': 'BNA',
  'austin': 'AUS',
};

function resolveIATA(input) {
  if (!input) return null;
  const clean = input.trim().toUpperCase();
  if (clean.length === 3) return clean; // already IATA
  return cityToIATA[input.trim().toLowerCase()] || null;
}

// ── Destination IATA codes ──
const destinationIATA = {
  // Central America & Caribbean
  'Antigua, Guatemala': 'GUA',
  'Granada, Nicaragua': 'MGA',
  'Bacalar, Mexico': 'CUN',
  'Oaxaca, Mexico': 'OAX',
  'Mexico City, Mexico': 'MEX',
  'San Ignacio, Belize': 'BZE',
  'Placencia, Belize': 'BZE',
  'Monteverde, Costa Rica': 'SJO',
  'Bocas del Toro, Panama': 'BOC',
  'Rincón, Puerto Rico': 'BQN',
  'Las Terrenas, Dominican Republic': 'SDQ',
  'Negril, Jamaica': 'MBJ',
  'Roatán, Honduras': 'RTB',
  // South America
  'Cartagena, Colombia': 'CTG',
  'Medellín, Colombia': 'MDE',
  'Quito, Ecuador': 'UIO',
  'Galápagos, Ecuador': 'GPS',
  'Cusco, Peru': 'CUZ',
  'Buenos Aires, Argentina': 'EZE',
  'Patagonia, Argentina': 'FTE',
  'La Paz, Bolivia': 'LPB',
  'Salvador, Brazil': 'SSA',
  // Southeast Asia
  'Hanoi, Vietnam': 'HAN',
  'Da Nang, Vietnam': 'DAD',
  'Siem Reap, Cambodia': 'REP',
  'Chiang Mai, Thailand': 'CNX',
  'Bangkok, Thailand': 'BKK',
  'Bali, Indonesia': 'DPS',
  'Luang Prabang, Laos': 'LPQ',
  'El Nido, Philippines': 'PPS',
  // South Asia
  'Goa, India': 'GOI',
  'Kerala, India': 'COK',
  'Rajasthan, India': 'JAI',
  'Galle, Sri Lanka': 'CMB',
  // East Asia
  'Tokyo, Japan': 'NRT',
  'Kyoto, Japan': 'KIX',
  'Seoul, South Korea': 'ICN',
  // Middle East
  'Istanbul, Turkey': 'IST',
  'Cappadocia, Turkey': 'NAV',
  'Petra, Jordan': 'AMM',
  'Muscat, Oman': 'MCT',
  // Africa
  'Cairo, Egypt': 'CAI',
  'Marrakech, Morocco': 'RAK',
  'Essaouira, Morocco': 'ESU',
  'Zanzibar, Tanzania': 'ZNZ',
  'Cape Town, South Africa': 'CPT',
  'Masai Mara, Kenya': 'NBO',
  'Stone Town, Mozambique': 'MPM',
  // Europe — budget & obscure
  'Bucharest, Romania': 'OTP',
  'Budapest, Hungary': 'BUD',
  'Kraków, Poland': 'KRK',
  'Tbilisi, Georgia': 'TBS',
  'Kotor, Montenegro': 'TIV',
  'Thessaloniki, Greece': 'SKG',
  'Valletta, Malta': 'MLA',
  // Europe — mid
  'Porto, Portugal': 'OPO',
  'Seville, Spain': 'SVQ',
  'Hvar, Croatia': 'SPU',
  'Dubrovnik, Croatia': 'DBV',
  'Québec City, Canada': 'YQB',
  'Edinburgh, Scotland': 'EDI',
  'San Sebastián, Spain': 'EAS',
  'Reykjavik, Iceland': 'KEF',
  // Europe — premium
  'Santorini, Greece': 'JTR',
  'Amalfi Coast, Italy': 'NAP',
  'French Riviera, France': 'NCE',
  'Bergen, Norway': 'BGO',
  'Lofoten Islands, Norway': 'EVE',
  'Swiss Alps, Switzerland': 'ZRH',
  'Lapland, Finland': 'RVN',
  // New — Small Town Charm / Farm & Countryside / Festivals
  'Hoi An, Vietnam': 'DAD',
  'Chefchaouen, Morocco': 'TNG',
  'Mumbai, India': 'BOM',
  'Valencia, Spain': 'VLC',
  'Bruges, Belgium': 'BRU',
  'Colmar, France': 'SXB',
  'Cotswolds, England': 'BRS',
  'Rio de Janeiro, Brazil': 'GIG',
  'Provence, France': 'MRS',
  'Hallstatt, Austria': 'SZG',
  'Cinque Terre, Italy': 'PSA',
  'Tuscany, Italy': 'FLR',
  // Oceania & luxury
  'Queenstown, New Zealand': 'ZQN',
  'Maldives': 'MLE',
  'Bora Bora, French Polynesia': 'BOB',
};

// ── Nonstop/1-stop route map from major US airports ──
// Values: Set of destination IATA codes reachable nonstop or with 1 stop
const nonstopRoutes = {
  JFK: new Set(['CUN','MEX','CTG','MDE','BQN','SDQ','MBJ','SJO','BOC','GIG','SSA','EZE','LPB','BZE','GUA','MGA','RTB','UIO','CUZ','LHR','CDG','FCO','NAP','PSA','FLR','OPO','SVQ','VLC','EAS','NCE','MRS','SXB','BRS','EDI','LIS','ATH','JTR','SKG','SPU','DBV','TIV','BRU','BUD','KRK','OTP','TBS','IST','NAV','AMM','TLV','CAI','RAK','TNG','ESU','NBO','CPT','ZNZ','KEF','BGO','NRT','KIX','ICN','BOM','GOI','DAD','HAN','BKK','CNX','DPS','MLE','SZG','ZRH','RVN','MLA']),
  EWR: new Set(['CUN','MEX','CTG','BQN','SDQ','MBJ','SJO','GIG','EZE','BZE','LHR','CDG','FCO','NAP','OPO','SVQ','NCE','EDI','ATH','SPU','DBV','BRU','BUD','IST','CAI','RAK','KEF','NRT','BOM','BKK','DPS','MLE','SZG','ZRH','MLA']),
  LAX: new Set(['CUN','MEX','GUA','SJO','CTG','BQN','MBJ','GIG','EZE','BZE','LHR','CDG','FCO','NAP','OPO','NCE','ATH','IST','CAI','NRT','KIX','ICN','BKK','HAN','DAD','CNX','DPS','PPS','SZG','ZRH','KEF','NBO','MLE','ZQN','BOB','BOM','GOI','AMM']),
  ORD: new Set(['CUN','MEX','CTG','BQN','SDQ','MBJ','SJO','GIG','EZE','LHR','CDG','FCO','NAP','OPO','EDI','ATH','SPU','DBV','BRU','BUD','KRK','IST','CAI','RAK','KEF','NRT','ICN','BKK','DPS','SZG','ZRH','MLE','MLA','NBO']),
  MIA: new Set(['CUN','MEX','CTG','MDE','BQN','SDQ','MBJ','SJO','BOC','GIG','SSA','EZE','UIO','BZE','GUA','MGA','RTB','LPB','LHR','CDG','FCO','IST','CAI','RAK','NRT','BKK','DPS','MLE']),
  ATL: new Set(['CUN','MEX','CTG','BQN','SDQ','MBJ','SJO','GIG','EZE','BZE','LHR','CDG','FCO','NAP','OPO','ATH','IST','CAI','NRT','ICN','BKK','DPS','SZG','ZRH','KEF','NBO','MLE']),
  BOS: new Set(['CUN','MEX','BQN','SDQ','MBJ','SJO','EZE','LHR','CDG','FCO','OPO','EDI','ATH','IST','CAI','KEF','NRT','BKK','ZRH','MLE','BRU','KRK']),
  SFO: new Set(['CUN','MEX','SJO','CTG','GIG','EZE','LHR','CDG','FCO','ATH','IST','NRT','KIX','ICN','BKK','HAN','DPS','PPS','ZRH','KEF','NBO','ZQN','BOB','BOM','MLE']),
  SEA: new Set(['CUN','MEX','SJO','LHR','CDG','FCO','KEF','NRT','KIX','ICN','BKK','HAN','DPS','ZRH']),
  DEN: new Set(['CUN','MEX','BQN','SJO','MBJ','LHR','CDG','FCO','KEF','NRT','ICN','ZRH']),
  MCO: new Set(['CUN','MEX','CTG','BQN','SDQ','MBJ','SJO','BZE','GIG','LHR','CDG','FCO','IST','KEF','BKK']),
  DCA: new Set(['CUN','MEX','BQN','SDQ','MBJ','SJO','LHR','CDG','FCO','KEF','IST','NRT','BKK','ZRH']),
  IAD: new Set(['CUN','MEX','BQN','SDQ','MBJ','SJO','CTG','EZE','LHR','CDG','FCO','NAP','OPO','ATH','IST','CAI','RAK','KEF','NRT','ICN','BKK','DPS','SZG','ZRH','NBO','MLE','EDI']),
  PHL: new Set(['CUN','MEX','BQN','SDQ','MBJ','SJO','LHR','CDG','FCO','IST','KEF','NRT','BKK','ZRH']),
};
// LGA has very few international routes; treat it like JFK for scoring
nonstopRoutes.LGA = nonstopRoutes.JFK;

// ── Gateway hop routes: origin → gateway hubs with round-trip anchor cost/person ──
const gatewayRoutes = {
  JFK: [
    { gateway: 'LHR', city: 'London', cost: 400 },
    { gateway: 'CDG', city: 'Paris', cost: 450 },
    { gateway: 'FCO', city: 'Rome', cost: 450 },
    { gateway: 'MAD', city: 'Madrid', cost: 420 },
    { gateway: 'LIS', city: 'Lisbon', cost: 380 },
    { gateway: 'KEF', city: 'Reykjavik', cost: 300 },
    { gateway: 'IST', city: 'Istanbul', cost: 480 },
  ],
  EWR: [
    { gateway: 'LHR', city: 'London', cost: 420 },
    { gateway: 'CDG', city: 'Paris', cost: 460 },
    { gateway: 'FCO', city: 'Rome', cost: 470 },
    { gateway: 'MAD', city: 'Madrid', cost: 440 },
    { gateway: 'LIS', city: 'Lisbon', cost: 400 },
    { gateway: 'KEF', city: 'Reykjavik', cost: 320 },
    { gateway: 'IST', city: 'Istanbul', cost: 500 },
  ],
  LGA: [
    { gateway: 'LHR', city: 'London', cost: 420 },
    { gateway: 'CDG', city: 'Paris', cost: 460 },
    { gateway: 'FCO', city: 'Rome', cost: 470 },
    { gateway: 'KEF', city: 'Reykjavik', cost: 320 },
  ],
  BOS: [
    { gateway: 'LHR', city: 'London', cost: 380 },
    { gateway: 'CDG', city: 'Paris', cost: 430 },
    { gateway: 'FCO', city: 'Rome', cost: 460 },
    { gateway: 'KEF', city: 'Reykjavik', cost: 280 },
    { gateway: 'LIS', city: 'Lisbon', cost: 400 },
    { gateway: 'IST', city: 'Istanbul', cost: 500 },
  ],
  PHL: [
    { gateway: 'LHR', city: 'London', cost: 400 },
    { gateway: 'CDG', city: 'Paris', cost: 450 },
    { gateway: 'FCO', city: 'Rome', cost: 470 },
    { gateway: 'KEF', city: 'Reykjavik', cost: 310 },
    { gateway: 'IST', city: 'Istanbul', cost: 490 },
  ],
  DCA: [
    { gateway: 'LHR', city: 'London', cost: 420 },
    { gateway: 'CDG', city: 'Paris', cost: 460 },
    { gateway: 'FCO', city: 'Rome', cost: 480 },
    { gateway: 'KEF', city: 'Reykjavik', cost: 320 },
    { gateway: 'IST', city: 'Istanbul', cost: 500 },
  ],
  IAD: [
    { gateway: 'LHR', city: 'London', cost: 400 },
    { gateway: 'CDG', city: 'Paris', cost: 440 },
    { gateway: 'FCO', city: 'Rome', cost: 460 },
    { gateway: 'MAD', city: 'Madrid', cost: 430 },
    { gateway: 'KEF', city: 'Reykjavik', cost: 310 },
    { gateway: 'IST', city: 'Istanbul', cost: 480 },
  ],
  ATL: [
    { gateway: 'LHR', city: 'London', cost: 430 },
    { gateway: 'CDG', city: 'Paris', cost: 470 },
    { gateway: 'FCO', city: 'Rome', cost: 480 },
    { gateway: 'MAD', city: 'Madrid', cost: 440 },
    { gateway: 'IST', city: 'Istanbul', cost: 510 },
  ],
  ORD: [
    { gateway: 'LHR', city: 'London', cost: 420 },
    { gateway: 'CDG', city: 'Paris', cost: 450 },
    { gateway: 'FCO', city: 'Rome', cost: 470 },
    { gateway: 'MAD', city: 'Madrid', cost: 440 },
    { gateway: 'KEF', city: 'Reykjavik', cost: 330 },
    { gateway: 'NRT', city: 'Tokyo', cost: 650 },
    { gateway: 'ICN', city: 'Seoul', cost: 620 },
    { gateway: 'IST', city: 'Istanbul', cost: 500 },
  ],
  MIA: [
    { gateway: 'LHR', city: 'London', cost: 440 },
    { gateway: 'CDG', city: 'Paris', cost: 470 },
    { gateway: 'FCO', city: 'Rome', cost: 480 },
    { gateway: 'MAD', city: 'Madrid', cost: 420 },
    { gateway: 'LIS', city: 'Lisbon', cost: 400 },
    { gateway: 'IST', city: 'Istanbul', cost: 520 },
  ],
  DFW: [
    { gateway: 'LHR', city: 'London', cost: 450 },
    { gateway: 'CDG', city: 'Paris', cost: 480 },
    { gateway: 'FCO', city: 'Rome', cost: 500 },
    { gateway: 'NRT', city: 'Tokyo', cost: 680 },
    { gateway: 'ICN', city: 'Seoul', cost: 650 },
    { gateway: 'IST', city: 'Istanbul', cost: 520 },
  ],
  IAH: [
    { gateway: 'LHR', city: 'London', cost: 450 },
    { gateway: 'CDG', city: 'Paris', cost: 480 },
    { gateway: 'FCO', city: 'Rome', cost: 500 },
    { gateway: 'NRT', city: 'Tokyo', cost: 700 },
    { gateway: 'IST', city: 'Istanbul', cost: 520 },
  ],
  LAX: [
    { gateway: 'LHR', city: 'London', cost: 450 },
    { gateway: 'CDG', city: 'Paris', cost: 480 },
    { gateway: 'FCO', city: 'Rome', cost: 500 },
    { gateway: 'NRT', city: 'Tokyo', cost: 550 },
    { gateway: 'ICN', city: 'Seoul', cost: 520 },
    { gateway: 'BKK', city: 'Bangkok', cost: 550 },
    { gateway: 'KEF', city: 'Reykjavik', cost: 380 },
    { gateway: 'IST', city: 'Istanbul', cost: 530 },
  ],
  SFO: [
    { gateway: 'LHR', city: 'London', cost: 450 },
    { gateway: 'CDG', city: 'Paris', cost: 480 },
    { gateway: 'FCO', city: 'Rome', cost: 500 },
    { gateway: 'NRT', city: 'Tokyo', cost: 530 },
    { gateway: 'ICN', city: 'Seoul', cost: 500 },
    { gateway: 'BKK', city: 'Bangkok', cost: 530 },
    { gateway: 'KEF', city: 'Reykjavik', cost: 370 },
    { gateway: 'IST', city: 'Istanbul', cost: 530 },
  ],
  SEA: [
    { gateway: 'LHR', city: 'London', cost: 460 },
    { gateway: 'CDG', city: 'Paris', cost: 490 },
    { gateway: 'FCO', city: 'Rome', cost: 510 },
    { gateway: 'NRT', city: 'Tokyo', cost: 520 },
    { gateway: 'ICN', city: 'Seoul', cost: 490 },
    { gateway: 'KEF', city: 'Reykjavik', cost: 350 },
  ],
  DEN: [
    { gateway: 'LHR', city: 'London', cost: 450 },
    { gateway: 'CDG', city: 'Paris', cost: 480 },
    { gateway: 'FCO', city: 'Rome', cost: 500 },
    { gateway: 'NRT', city: 'Tokyo', cost: 650 },
    { gateway: 'KEF', city: 'Reykjavik', cost: 340 },
    { gateway: 'IST', city: 'Istanbul', cost: 520 },
  ],
  MCO: [
    { gateway: 'LHR', city: 'London', cost: 430 },
    { gateway: 'CDG', city: 'Paris', cost: 460 },
    { gateway: 'FCO', city: 'Rome', cost: 480 },
    { gateway: 'KEF', city: 'Reykjavik', cost: 330 },
    { gateway: 'IST', city: 'Istanbul', cost: 510 },
  ],
};

// ── Gateway connections: gateway → destinations reachable by ground ──
// Costs are one-way per person; scoring doubles for round-trip. Max 12hr cap.
const gatewayConnections = {
  LHR: [
    { dest: 'Cotswolds, England', mode: 'train', cost: 40, hours: 1.5 },
    { dest: 'Edinburgh, Scotland', mode: 'train', cost: 70, hours: 4.5 },
    { dest: 'Bruges, Belgium', mode: 'train', cost: 55, hours: 2.5 },
    { dest: 'Colmar, France', mode: 'train', cost: 80, hours: 5 },
  ],
  CDG: [
    { dest: 'Provence, France', mode: 'train', cost: 50, hours: 3 },
    { dest: 'Colmar, France', mode: 'train', cost: 50, hours: 2.5 },
    { dest: 'Swiss Alps, Switzerland', mode: 'train', cost: 65, hours: 4 },
    { dest: 'Bruges, Belgium', mode: 'train', cost: 35, hours: 1.5 },
    { dest: 'French Riviera, France', mode: 'train', cost: 60, hours: 5.5 },
    { dest: 'Hallstatt, Austria', mode: 'train', cost: 90, hours: 9 },
    { dest: 'Seville, Spain', mode: 'train', cost: 100, hours: 10 },
    { dest: 'Porto, Portugal', mode: 'train', cost: 110, hours: 11 },
    { dest: 'Budapest, Hungary', mode: 'train', cost: 100, hours: 11 },
  ],
  FCO: [
    { dest: 'Amalfi Coast, Italy', mode: 'train', cost: 25, hours: 2.5 },
    { dest: 'Tuscany, Italy', mode: 'train', cost: 30, hours: 1.5 },
    { dest: 'Cinque Terre, Italy', mode: 'train', cost: 40, hours: 4 },
    { dest: 'French Riviera, France', mode: 'train', cost: 70, hours: 6 },
  ],
  MAD: [
    { dest: 'Seville, Spain', mode: 'train', cost: 35, hours: 2.5 },
    { dest: 'Valencia, Spain', mode: 'train', cost: 30, hours: 1.5 },
    { dest: 'San Sebastián, Spain', mode: 'train', cost: 40, hours: 5 },
    { dest: 'Porto, Portugal', mode: 'train', cost: 50, hours: 5.5 },
  ],
  LIS: [
    { dest: 'Porto, Portugal', mode: 'train', cost: 25, hours: 3 },
    { dest: 'Seville, Spain', mode: 'train', cost: 40, hours: 6 },
  ],
  KEF: [],
  IST: [
    { dest: 'Cappadocia, Turkey', mode: 'bus', cost: 30, hours: 10 },
    { dest: 'Kotor, Montenegro', mode: 'bus', cost: 60, hours: 10 },
    { dest: 'Thessaloniki, Greece', mode: 'bus', cost: 40, hours: 9 },
  ],
  NRT: [
    { dest: 'Kyoto, Japan', mode: 'train', cost: 120, hours: 2.5 },
  ],
  ICN: [],
  BKK: [
    { dest: 'Chiang Mai, Thailand', mode: 'train', cost: 25, hours: 11 },
    { dest: 'Siem Reap, Cambodia', mode: 'bus', cost: 30, hours: 8 },
  ],
};

function getRouteScore(originCode, destIATA) {
  if (!originCode || !destIATA) return 0;
  const routes = nonstopRoutes[originCode];
  if (!routes) return 0; // unknown origin, no bonus/penalty
  return routes.has(destIATA) ? 15 : -5;
}

// ── Travel time estimates (one-way hours from typical US origin) ──
const travelHoursMap = {
  // Central America & Caribbean
  GUA: 6, MGA: 7, CUN: 4, OAX: 6, MEX: 5, BZE: 5, SJO: 6, BOC: 7,
  BQN: 4, SDQ: 4, MBJ: 4, RTB: 6,
  // South America
  CTG: 6, MDE: 7, UIO: 8, GPS: 10, CUZ: 10, EZE: 13, FTE: 16,
  LPB: 12, SSA: 12, GIG: 11,
  // Southeast Asia
  HAN: 20, DAD: 22, REP: 22, CNX: 22, BKK: 20, DPS: 24, LPQ: 24, PPS: 22,
  // South Asia
  GOI: 20, COK: 22, JAI: 20, CMB: 22, BOM: 18,
  // East Asia
  NRT: 14, KIX: 15, ICN: 14,
  // Middle East
  IST: 12, NAV: 14, AMM: 14, MCT: 16,
  // Africa
  CAI: 13, RAK: 10, TNG: 10, ESU: 12, ZNZ: 20, CPT: 20, NBO: 18, MPM: 22,
  // Europe
  OTP: 12, BUD: 11, KRK: 11, TBS: 14, TIV: 12, SKG: 12, MLA: 12,
  OPO: 9, SVQ: 10, SPU: 12, DBV: 12, YQB: 3, EDI: 8, EAS: 10, KEF: 6,
  JTR: 12, NAP: 10, NCE: 10, BGO: 10, EVE: 14, ZRH: 9, RVN: 14,
  VLC: 10, BRU: 9, SXB: 10, BRS: 8, MRS: 10, SZG: 10, PSA: 10, FLR: 10,
  // Oceania & luxury
  ZQN: 22, MLE: 22, BOB: 16,
};

function hoursToTravelDays(hours) {
  if (hours <= 8) return 0.5;
  if (hours <= 14) return 1;
  if (hours <= 22) return 1.5;
  return 2;
}

// ── Date helpers (season-aware) ──
// Target departure dates per season (month is 0-indexed)
const seasonTargets = {
  'Spring Break': { month: 2, day: 20 },   // March 20
  'Summer':       { month: 6, day: 1 },    // July 1
  'Fall':         { month: 9, day: 15 },    // October 15
  'Winter Escape':{ month: 1, day: 1 },     // February 1
  'White Christmas':{ month: 11, day: 20 }, // December 20
};

function getDates(timing, nights) {
  const now = new Date();
  const year = now.getFullYear();
  const season = seasonTargets[timing];

  let depart;
  if (!season) {
    // "I'm Flexible" or unknown → 60 days from now
    depart = new Date(now);
    depart.setDate(depart.getDate() + 60);
  } else {
    depart = new Date(year, season.month, season.day);
    // If the target date is less than 7 days away or already past, roll to next year
    if (depart - now < 7 * 24 * 60 * 60 * 1000) {
      depart = new Date(year + 1, season.month, season.day);
    }
  }

  const ret = new Date(depart);
  ret.setDate(ret.getDate() + (nights || 7));
  return {
    departure: depart.toISOString().split('T')[0],
    return: ret.toISOString().split('T')[0]
  };
}

// ── /api/experiences ──
app.get('/api/experiences', (req, res) => {
  res.json(ALL_EXPERIENCES);
});

// ── /api/towns ──
app.get('/api/towns', (req, res) => {
  const grouped = {};
  for (const [iata, gw] of Object.entries(DOMESTIC_GATEWAYS)) {
    grouped[iata] = {
      gateway: gw,
      towns: getTownsByGateway(iata),
    };
  }
  res.json(grouped);
});

// ── /api/flights ──
app.post('/api/flights', async (req, res) => {
  const { origin, destination, timing, adults, children, nights } = req.body;

  const originCode = resolveIATA(origin);
  const destCode = destinationIATA[destination] || resolveIATA(destination);

  if (!originCode) {
    return res.status(400).json({ error: `Could not find airport for "${origin}"` });
  }
  if (!destCode) {
    return res.status(400).json({ error: `No airport mapped for "${destination}"` });
  }

  const dates = getDates(timing, nights);
  const totalAdults = Math.max(1, parseInt(adults) || 1);

  try {
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: originCode,
      destinationLocationCode: destCode,
      departureDate: dates.departure,
      returnDate: dates.return,
      adults: Math.min(totalAdults, 9), // Amadeus max 9
      currencyCode: 'USD',
      max: 3
    });

    const offers = response.data;
    if (!offers || offers.length === 0) {
      return res.json({ price: null, note: 'No flights found for this route' });
    }

    // Return cheapest total price
    const cheapest = offers.reduce((min, o) =>
      parseFloat(o.price.total) < parseFloat(min.price.total) ? o : min
    );

    res.json({
      price: parseFloat(cheapest.price.total),
      currency: cheapest.price.currency,
      origin: originCode,
      destination: destCode,
      departure: dates.departure,
      return: dates.return,
      airline: cheapest.validatingAirlineCodes?.[0] || 'Various',
      stops: cheapest.itineraries?.[0]?.segments?.length - 1 || 0
    });

  } catch (err) {
    console.error('Amadeus error:', err?.response?.data || err.message);
    res.status(500).json({
      error: 'Flight search failed',
      detail: err?.response?.data?.errors?.[0]?.detail || err.message
    });
  }
});

// ── /api/search — full trip search ──
app.post('/api/search', async (req, res) => {
  const { origin, budget, timing, adults, children, nights, rooms, vibes, tripDays: rawTripDays } = req.body;

  const destinations = [
    // ── ULTRA-BUDGET ──
    { flag:'🇬🇹', name:'Antigua, Guatemala', why:'Cobblestone streets under three volcanoes, Spanish colonial churches, and $2 street food that rivals fine dining.', flightCostPerPerson:300, nightlyHotelRate:40, dailyExpensesPerPerson:30, tags:['City & Culture','Off the Map','Small Town Charm'], timing:['Winter Escape','Spring Break','Fall',"I'm Flexible"] },
    { flag:'🇳🇮', name:'Granada, Nicaragua', why:'Candy-colored colonial city on a lake full of tiny volcanic islands. Central America\'s best-kept secret.', flightCostPerPerson:350, nightlyHotelRate:35, dailyExpensesPerPerson:25, tags:['City & Culture','Off the Map','Small Town Charm'], timing:['Winter Escape','Spring Break',"I'm Flexible"] },
    { flag:'🇰🇭', name:'Siem Reap, Cambodia', why:'Angkor Wat at sunrise, night markets, $1 beers. A place that rewires how you think about travel.', flightCostPerPerson:550, nightlyHotelRate:25, dailyExpensesPerPerson:15, tags:['City & Culture','Off the Map'], timing:['Winter Escape','Fall',"I'm Flexible"] },
    { flag:'🇻🇳', name:'Hanoi, Vietnam', why:'Thousand-year-old temples, pho on every corner, motorbike chaos that somehow works. Absurdly cheap.', flightCostPerPerson:550, nightlyHotelRate:30, dailyExpensesPerPerson:20, tags:['City & Culture','Off the Map'], timing:['Spring Break','Fall','Winter Escape',"I'm Flexible"] },
    { flag:'🇹🇭', name:'Chiang Mai, Thailand', why:'Mountain temples, night bazaars, Thai cooking classes for $15. The digital nomad capital for a reason.', flightCostPerPerson:550, nightlyHotelRate:30, dailyExpensesPerPerson:20, tags:['City & Culture','Nature & Escape','Off the Map','Farm & Countryside'], timing:['Winter Escape','Fall',"I'm Flexible"] },
    { flag:'🇻🇳', name:'Da Nang, Vietnam', why:'Miles of uncrowded beach, marble mountains, incredible seafood. Vietnam\'s best family-friendly coast.', flightCostPerPerson:550, nightlyHotelRate:35, dailyExpensesPerPerson:25, tags:['Beach & Sun','Family-First','Off the Map'], timing:['Spring Break','Summer',"I'm Flexible"] },
    { flag:'🇻🇳', name:'Hoi An, Vietnam', why:'Lantern-lit ancient town, tailor shops on every corner, $1 banh mi, and rice paddies a bike ride away. Impossibly charming.', flightCostPerPerson:550, nightlyHotelRate:35, dailyExpensesPerPerson:20, tags:['Small Town Charm','City & Culture','Off the Map'], timing:['Spring Break','Fall','Winter Escape',"I'm Flexible"] },
    { flag:'🇮🇳', name:'Goa, India', why:'Palm-fringed beaches, Portuguese-Indian fusion food, beach shacks at sunset. India\'s chill side.', flightCostPerPerson:650, nightlyHotelRate:30, dailyExpensesPerPerson:20, tags:['Beach & Sun','Off the Map'], timing:['Winter Escape','Fall',"I'm Flexible"] },
    { flag:'🇧🇴', name:'La Paz, Bolivia', why:'World\'s highest capital, salt flats that mirror the sky, Death Road mountain biking. Truly otherworldly.', flightCostPerPerson:450, nightlyHotelRate:35, dailyExpensesPerPerson:25, tags:['Nature & Escape','Off the Map'], timing:['Summer','Fall',"I'm Flexible"] },
    { flag:'🇲🇽', name:'Mexico City, Mexico', why:'World-class museums, $3 taco crawls, Aztec ruins downtown. One of the great cities, at a fraction of the price.', flightCostPerPerson:250, nightlyHotelRate:60, dailyExpensesPerPerson:35, tags:['City & Culture','Family-First'], timing:['Spring Break','Fall','Winter Escape',"I'm Flexible"] },
    { flag:'🇪🇬', name:'Cairo, Egypt', why:'The Pyramids. The Sphinx. The Egyptian Museum. Five thousand years of history and some of the best food in the Middle East.', flightCostPerPerson:550, nightlyHotelRate:40, dailyExpensesPerPerson:25, tags:['City & Culture','Off the Map'], timing:['Fall','Winter Escape','Spring Break',"I'm Flexible"] },
    { flag:'🇱🇦', name:'Luang Prabang, Laos', why:'Monks at dawn, waterfalls in the jungle, French-Lao fusion cuisine on the Mekong. Pure magic.', flightCostPerPerson:600, nightlyHotelRate:30, dailyExpensesPerPerson:15, tags:['Nature & Escape','Off the Map','Small Town Charm'], timing:['Winter Escape','Fall',"I'm Flexible"] },
    { flag:'🇮🇳', name:'Kerala, India', why:'Houseboat through the backwaters, Ayurvedic spa villages, spice plantations in the hills. India\'s most peaceful state.', flightCostPerPerson:650, nightlyHotelRate:35, dailyExpensesPerPerson:20, tags:['Nature & Escape','Off the Map','Farm & Countryside'], timing:['Winter Escape','Fall',"I'm Flexible"] },
    { flag:'🇲🇽', name:'Oaxaca, Mexico', why:'Mezcal tastings, Zapotec ruins, mole with 30 ingredients. Mexico\'s cultural soul at backpacker prices.', flightCostPerPerson:300, nightlyHotelRate:50, dailyExpensesPerPerson:35, tags:['City & Culture','Off the Map','Farm & Countryside'], timing:['Fall','Winter Escape','Spring Break',"I'm Flexible"] },
    { flag:'🇷🇴', name:'Bucharest, Romania', why:'Art Deco palaces, the world\'s heaviest building, craft beer scene, and Transylvanian castles two hours away.', flightCostPerPerson:450, nightlyHotelRate:50, dailyExpensesPerPerson:30, tags:['City & Culture','Off the Map'], timing:['Summer','Fall',"I'm Flexible"] },
    { flag:'🇮🇳', name:'Rajasthan, India', why:'Tiger safaris, desert forts, palaces turned into hotels. A riot of color and history at unbeatable prices.', flightCostPerPerson:650, nightlyHotelRate:40, dailyExpensesPerPerson:25, tags:['City & Culture','Nature & Escape','Off the Map','Farm & Countryside'], timing:['Winter Escape','Fall',"I'm Flexible"] },
    { flag:'🇵🇭', name:'El Nido, Philippines', why:'Limestone cliffs, hidden lagoons, island-hopping by outrigger canoe. Southeast Asia\'s most photogenic coast.', flightCostPerPerson:600, nightlyHotelRate:40, dailyExpensesPerPerson:20, tags:['Beach & Sun','Nature & Escape','Off the Map','Small Town Charm'], timing:['Winter Escape','Spring Break',"I'm Flexible"] },

    // ── BUDGET ──
    { flag:'🇲🇽', name:'Bacalar, Mexico', why:'A lake with seven shades of blue, zero crowds, and Tulum prices from five years ago. Still a genuine secret.', flightCostPerPerson:350, nightlyHotelRate:55, dailyExpensesPerPerson:30, tags:['Beach & Sun','Nature & Escape','Off the Map','Small Town Charm'], timing:['Spring Break','Summer','Winter Escape',"I'm Flexible"] },
    { flag:'🇨🇴', name:'Medellín, Colombia', why:'Eternal spring weather, cable cars over green hills, craft coffee scene, salsa dancing every night.', flightCostPerPerson:350, nightlyHotelRate:55, dailyExpensesPerPerson:35, tags:['City & Culture','Nature & Escape'], timing:['Spring Break','Summer','Fall',"I'm Flexible"] },
    { flag:'🇹🇭', name:'Bangkok, Thailand', why:'Glittering temples, rooftop bars, street food that puts restaurants to shame. Overwhelming in the best way.', flightCostPerPerson:550, nightlyHotelRate:45, dailyExpensesPerPerson:30, tags:['City & Culture','Off the Map'], timing:['Winter Escape','Fall',"I'm Flexible"] },
    { flag:'🇧🇷', name:'Salvador, Brazil', why:'Afro-Brazilian drumming, colonial Pelourinho, capoeira on the beach. Brazil\'s cultural heartbeat, not its price tag.', flightCostPerPerson:500, nightlyHotelRate:55, dailyExpensesPerPerson:35, tags:['Beach & Sun','City & Culture','Off the Map'], timing:['Summer','Spring Break',"I'm Flexible"] },
    { flag:'🇩🇴', name:'Las Terrenas, Dominican Republic', why:'A French-Caribbean beach town most Americans have never heard of. Walkable, affordable, beautiful.', flightCostPerPerson:350, nightlyHotelRate:60, dailyExpensesPerPerson:35, tags:['Beach & Sun','City & Culture','Family-First','Small Town Charm'], timing:['Spring Break','Summer','Winter Escape',"I'm Flexible"] },
    { flag:'🇭🇺', name:'Budapest, Hungary', why:'Thermal baths, ruin bars, Danube sunsets, and pastries that rival Vienna at half the price.', flightCostPerPerson:450, nightlyHotelRate:65, dailyExpensesPerPerson:40, tags:['City & Culture'], timing:['Spring Break','Summer','Fall','White Christmas',"I'm Flexible"] },
    { flag:'🇱🇰', name:'Galle, Sri Lanka', why:'Dutch colonial fort on a tropical headland, whale watching, tea country trains. Incredible value.', flightCostPerPerson:650, nightlyHotelRate:40, dailyExpensesPerPerson:25, tags:['Beach & Sun','City & Culture','Off the Map','Small Town Charm'], timing:['Winter Escape','Spring Break',"I'm Flexible"] },
    { flag:'🇨🇴', name:'Cartagena, Colombia', why:'Colonial walled city, Caribbean beaches 20 min away, world-class food, dollar goes three times as far.', flightCostPerPerson:350, nightlyHotelRate:70, dailyExpensesPerPerson:40, tags:['Beach & Sun','City & Culture','Off the Map'], timing:['Spring Break','Summer','Winter Escape',"I'm Flexible"] },
    { flag:'🇲🇦', name:'Chefchaouen, Morocco', why:'The Blue City. Every wall painted indigo, tucked in the Rif Mountains, with no crowds and mint tea on every rooftop.', flightCostPerPerson:500, nightlyHotelRate:50, dailyExpensesPerPerson:30, tags:['Small Town Charm','Off the Map','City & Culture'], timing:['Spring Break','Fall',"I'm Flexible"] },
    { flag:'🇮🇳', name:'Mumbai, India', why:'Bollywood energy, colonial architecture, legendary street food from vada pav to pav bhaji. India\'s maximalist, magnificent heart.', flightCostPerPerson:650, nightlyHotelRate:50, dailyExpensesPerPerson:30, tags:['City & Culture','Off the Map'], timing:['Winter Escape','Fall','Spring Break',"I'm Flexible"] },
    { flag:'🇮🇩', name:'Bali, Indonesia', why:'Rice terraces, temple ceremonies, surf breaks, and $8 massages. Spiritual and hedonistic in equal measure.', flightCostPerPerson:600, nightlyHotelRate:50, dailyExpensesPerPerson:30, tags:['Beach & Sun','Nature & Escape','Off the Map','Farm & Countryside'], timing:['Summer','Fall',"I'm Flexible"] },
    { flag:'🇪🇨', name:'Quito, Ecuador', why:'Colonial old town straddling the equator, cloud forests an hour away, gateway to the Amazon.', flightCostPerPerson:400, nightlyHotelRate:60, dailyExpensesPerPerson:35, tags:['City & Culture','Nature & Escape','Off the Map'], timing:['Summer','Fall',"I'm Flexible"] },
    { flag:'🇬🇪', name:'Tbilisi, Georgia', why:'Ancient wine country, sulphur baths, jaw-dropping Caucasus mountains, and some of the friendliest people anywhere.', flightCostPerPerson:550, nightlyHotelRate:55, dailyExpensesPerPerson:30, tags:['City & Culture','Nature & Escape','Off the Map','Farm & Countryside'], timing:['Summer','Fall','Spring Break',"I'm Flexible"] },
    { flag:'🇧🇿', name:'Placencia, Belize', why:'English-speaking, tiny beach strip, second-largest barrier reef in the world. Snorkel from shore.', flightCostPerPerson:400, nightlyHotelRate:70, dailyExpensesPerPerson:35, tags:['Beach & Sun','Nature & Escape','Off the Map','Small Town Charm'], timing:['Spring Break','Summer','Winter Escape',"I'm Flexible"] },
    { flag:'🇵🇱', name:'Kraków, Poland', why:'Medieval old town, incredible food, actual snow for Christmas, costs half of Western Europe.', flightCostPerPerson:450, nightlyHotelRate:65, dailyExpensesPerPerson:40, tags:['City & Culture','White Christmas'], timing:['White Christmas','Fall','Winter Escape',"I'm Flexible"] },
    { flag:'🇹🇷', name:'Istanbul, Turkey', why:'Hagia Sophia, Grand Bazaar, Bosphorus ferries, and kebabs that redefine the word. Two continents, one city.', flightCostPerPerson:500, nightlyHotelRate:60, dailyExpensesPerPerson:40, tags:['City & Culture','Off the Map'], timing:['Spring Break','Fall',"I'm Flexible"] },
    { flag:'🇵🇦', name:'Bocas del Toro, Panama', why:'Caribbean island chain with reggae vibes, over-water bungalows, and sloth sanctuaries. Panama\'s hidden coast.', flightCostPerPerson:400, nightlyHotelRate:65, dailyExpensesPerPerson:35, tags:['Beach & Sun','Nature & Escape','Off the Map','Small Town Charm'], timing:['Spring Break','Summer','Winter Escape',"I'm Flexible"] },
    { flag:'🇲🇦', name:'Essaouira, Morocco', why:'Wind-swept Atlantic ramparts, blue fishing boats, Hendrix history, and no cruise ship crowds. Marrakech\'s cooler cousin.', flightCostPerPerson:500, nightlyHotelRate:55, dailyExpensesPerPerson:35, tags:['Beach & Sun','City & Culture','Off the Map','Small Town Charm'], timing:['Spring Break','Fall',"I'm Flexible"] },
    { flag:'🇭🇳', name:'Roatán, Honduras', why:'Caribbean reef diving for a fraction of Belize prices, uncrowded white sand, West End village nightlife.', flightCostPerPerson:400, nightlyHotelRate:70, dailyExpensesPerPerson:35, tags:['Beach & Sun','Nature & Escape','Off the Map','Small Town Charm'], timing:['Spring Break','Winter Escape',"I'm Flexible"] },
    { flag:'🇲🇹', name:'Valletta, Malta', why:'Honey-colored fortress city smaller than most neighborhoods. Knights Templar history, blue grottoes, and great diving.', flightCostPerPerson:500, nightlyHotelRate:65, dailyExpensesPerPerson:40, tags:['City & Culture','Beach & Sun','Small Town Charm'], timing:['Spring Break','Summer','Fall',"I'm Flexible"] },
    { flag:'🇲🇦', name:'Marrakech, Morocco', why:'The medina is unlike anywhere on earth. Spice markets, rooftop dinners, Atlas Mountains nearby.', flightCostPerPerson:500, nightlyHotelRate:65, dailyExpensesPerPerson:40, tags:['City & Culture','Off the Map'], timing:['Fall','Winter Escape','Spring Break',"I'm Flexible"] },
    { flag:'🇵🇷', name:'Rincón, Puerto Rico', why:'No passport needed, direct flights from most US cities, surf town with great family beaches.', flightCostPerPerson:300, nightlyHotelRate:80, dailyExpensesPerPerson:45, tags:['Beach & Sun','Family-First','Small Town Charm'], timing:['Spring Break','Summer','Winter Escape',"I'm Flexible"] },
    { flag:'🇹🇷', name:'Cappadocia, Turkey', why:'Hot air balloons over fairy chimneys at dawn, cave hotels, underground cities. Genuinely surreal.', flightCostPerPerson:550, nightlyHotelRate:65, dailyExpensesPerPerson:35, tags:['Nature & Escape','Off the Map','Farm & Countryside'], timing:['Spring Break','Fall',"I'm Flexible"] },
    { flag:'🇲🇪', name:'Kotor, Montenegro', why:'Fjord-like bay, Venetian old town, hiking fortress walls at sunset. Croatia quality, half the price.', flightCostPerPerson:500, nightlyHotelRate:65, dailyExpensesPerPerson:40, tags:['City & Culture','Nature & Escape','Off the Map','Small Town Charm'], timing:['Spring Break','Summer',"I'm Flexible"] },
    { flag:'🇧🇿', name:'San Ignacio, Belize', why:'Maya ruins in the jungle, cave tubing, howler monkeys. The adventure side of Belize most people miss.', flightCostPerPerson:400, nightlyHotelRate:65, dailyExpensesPerPerson:40, tags:['Nature & Escape','Off the Map','Family-First','Small Town Charm'], timing:['Spring Break','Summer','Winter Escape',"I'm Flexible"] },

    // ── MID-RANGE ──
    { flag:'🇵🇪', name:'Cusco, Peru', why:'Gateway to Machu Picchu, Inca stonework, altitude-defying nightlife, and Sacred Valley day trips.', flightCostPerPerson:500, nightlyHotelRate:70, dailyExpensesPerPerson:40, tags:['City & Culture','Nature & Escape','Off the Map'], timing:['Summer','Fall','Spring Break',"I'm Flexible"] },
    { flag:'🇨🇦', name:'Québec City, Canada', why:'A European walled city in North America. Magical in snow. No passport needed.', flightCostPerPerson:300, nightlyHotelRate:100, dailyExpensesPerPerson:55, tags:['City & Culture','White Christmas','Family-First','Small Town Charm'], timing:['White Christmas','Winter Escape',"I'm Flexible"] },
    { flag:'🇨🇷', name:'Monteverde, Costa Rica', why:'Cloud forest canopy walks, zip lines, hummingbirds everywhere. Family adventure without the fuss.', flightCostPerPerson:350, nightlyHotelRate:85, dailyExpensesPerPerson:45, tags:['Nature & Escape','Family-First','Farm & Countryside'], timing:['Spring Break','Summer','Winter Escape',"I'm Flexible"] },
    { flag:'🇯🇲', name:'Negril, Jamaica', why:'Seven Mile Beach, genuine reggae culture, strong villa market for families. More affordable than the resort side.', flightCostPerPerson:350, nightlyHotelRate:90, dailyExpensesPerPerson:50, tags:['Beach & Sun','Family-First','Small Town Charm'], timing:['Spring Break','Summer','Winter Escape',"I'm Flexible"] },
    { flag:'🇹🇿', name:'Zanzibar, Tanzania', why:'Spice island with turquoise water, Stone Town history, and dhow sailing at sunset. Africa meets Arabia.', flightCostPerPerson:700, nightlyHotelRate:60, dailyExpensesPerPerson:35, tags:['Beach & Sun','City & Culture','Off the Map','Small Town Charm'], timing:['Summer','Winter Escape',"I'm Flexible"] },
    { flag:'🇬🇷', name:'Thessaloniki, Greece', why:'Greece\'s real food capital, Byzantine walls, waterfront bars, and half the tourists of Athens.', flightCostPerPerson:550, nightlyHotelRate:75, dailyExpensesPerPerson:45, tags:['City & Culture','Beach & Sun'], timing:['Spring Break','Summer','Fall',"I'm Flexible"] },
    { flag:'🇯🇴', name:'Petra, Jordan', why:'Rose-red city carved into cliffs, Wadi Rum desert camps, Dead Sea floats. Lawrence of Arabia, for real.', flightCostPerPerson:600, nightlyHotelRate:85, dailyExpensesPerPerson:50, tags:['City & Culture','Nature & Escape','Off the Map'], timing:['Spring Break','Fall',"I'm Flexible"] },
    { flag:'🇵🇹', name:'Porto, Portugal', why:'Arguably the most beautiful city in Europe. Cheaper than Lisbon, better food, world-famous wine.', flightCostPerPerson:500, nightlyHotelRate:90, dailyExpensesPerPerson:50, tags:['City & Culture','Nature & Escape','Farm & Countryside'], timing:['Spring Break','Summer','Fall',"I'm Flexible"] },
    { flag:'🇪🇸', name:'Seville, Spain', why:'Flamenco courtyards, Moorish palaces, tapas crawls, and the best orange trees you\'ll ever walk under.', flightCostPerPerson:500, nightlyHotelRate:95, dailyExpensesPerPerson:55, tags:['City & Culture'], timing:['Spring Break','Fall',"I'm Flexible"] },
    { flag:'🇪🇸', name:'Valencia, Spain', why:'Las Fallas fireworks, City of Arts and Sciences, paella on the beach where paella was invented.', flightCostPerPerson:500, nightlyHotelRate:90, dailyExpensesPerPerson:50, tags:['City & Culture','Beach & Sun','Family-First'], timing:['Spring Break','Summer','Fall',"I'm Flexible"] },
    { flag:'🇧🇪', name:'Bruges, Belgium', why:'Medieval canals, chocolate shops on every corner, horse-drawn carriages, and the best beer on earth. A living fairy tale.', flightCostPerPerson:450, nightlyHotelRate:110, dailyExpensesPerPerson:55, tags:['City & Culture','Small Town Charm'], timing:['Spring Break','Fall','White Christmas',"I'm Flexible"] },
    { flag:'🇦🇷', name:'Buenos Aires, Argentina', why:'Tango in San Telmo, world-class steak for $20, bookshops in old theaters. Paris of South America, Argentine prices.', flightCostPerPerson:600, nightlyHotelRate:85, dailyExpensesPerPerson:50, tags:['City & Culture'], timing:['Spring Break','Fall',"I'm Flexible"] },
    { flag:'🇭🇷', name:'Hvar, Croatia', why:'Mediterranean sunshine, clear Adriatic water, ancient stone towns. Still affordable before peak summer.', flightCostPerPerson:550, nightlyHotelRate:100, dailyExpensesPerPerson:55, tags:['Beach & Sun','City & Culture','Small Town Charm'], timing:['Spring Break','Summer',"I'm Flexible"] },

    // ── UPPER-MID ──
    { flag:'🇰🇷', name:'Seoul, South Korea', why:'K-BBQ alleys, palace grounds, neon nightlife, and the world\'s fastest internet. Futuristic and ancient at once.', flightCostPerPerson:700, nightlyHotelRate:110, dailyExpensesPerPerson:55, tags:['City & Culture','Off the Map'], timing:['Spring Break','Fall',"I'm Flexible"] },
    { flag:'🇴🇲', name:'Muscat, Oman', why:'Wadis, frankincense souks, sea turtle beaches, and Arabian hospitality without the Dubai price tag.', flightCostPerPerson:700, nightlyHotelRate:110, dailyExpensesPerPerson:50, tags:['Nature & Escape','City & Culture','Off the Map'], timing:['Fall','Winter Escape',"I'm Flexible"] },
    { flag:'🇪🇸', name:'San Sebastián, Spain', why:'More Michelin stars per capita than Paris. Pintxos bars, surf beach, Basque culture. Worth the splurge.', flightCostPerPerson:500, nightlyHotelRate:130, dailyExpensesPerPerson:70, tags:['City & Culture','Beach & Sun'], timing:['Summer','Fall',"I'm Flexible"] },
    { flag:'🇫🇷', name:'Colmar, France', why:'Half-timbered houses along canals, Alsatian wine route, Christmas markets that define the genre. A storybook town.', flightCostPerPerson:500, nightlyHotelRate:120, dailyExpensesPerPerson:60, tags:['Small Town Charm','White Christmas','Farm & Countryside'], timing:['Fall','White Christmas',"I'm Flexible"] },
    { flag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', name:'Edinburgh, Scotland', why:'Castle on a volcanic rock, whisky trails, literary pubs, and the Highlands a short drive away.', flightCostPerPerson:500, nightlyHotelRate:140, dailyExpensesPerPerson:65, tags:['City & Culture','Nature & Escape','Family-First'], timing:['Summer','Fall','White Christmas',"I'm Flexible"] },
    { flag:'🇭🇷', name:'Dubrovnik, Croatia', why:'Walled city above the Adriatic, Game of Thrones filming, island-hopping by ferry. Peak Mediterranean.', flightCostPerPerson:550, nightlyHotelRate:140, dailyExpensesPerPerson:65, tags:['Beach & Sun','City & Culture','Small Town Charm'], timing:['Spring Break','Summer',"I'm Flexible"] },
    { flag:'🇮🇸', name:'Reykjavik, Iceland', why:'Northern lights, geothermal pools, waterfalls everywhere. Jaw-dropping in winter. Short flight from the East Coast.', flightCostPerPerson:400, nightlyHotelRate:170, dailyExpensesPerPerson:80, tags:['Nature & Escape','Off the Map'], timing:['Winter Escape','White Christmas',"I'm Flexible"] },
    { flag:'🇧🇷', name:'Rio de Janeiro, Brazil', why:'Carnival, Sugarloaf, Copacabana, samba until sunrise. The world\'s greatest party city with nature to match.', flightCostPerPerson:650, nightlyHotelRate:105, dailyExpensesPerPerson:60, tags:['Beach & Sun','City & Culture'], timing:['Spring Break','Summer','Winter Escape',"I'm Flexible"] },
    { flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', name:'Cotswolds, England', why:'Honey-stone villages, rolling green hills, cozy pubs with fireplaces, and sheep around every bend. Peak English countryside.', flightCostPerPerson:500, nightlyHotelRate:150, dailyExpensesPerPerson:60, tags:['Small Town Charm','Farm & Countryside','Nature & Escape'], timing:['Spring Break','Summer','Fall',"I'm Flexible"] },
    { flag:'🇿🇦', name:'Cape Town, South Africa', why:'Table Mountain, penguin colonies, winelands, and two oceans. One of the world\'s great cities, surprisingly affordable.', flightCostPerPerson:800, nightlyHotelRate:120, dailyExpensesPerPerson:55, tags:['City & Culture','Nature & Escape','Beach & Sun','Farm & Countryside'], timing:['Spring Break','Fall',"I'm Flexible"] },
    { flag:'🇫🇷', name:'Provence, France', why:'Lavender fields, rosé vineyards, Roman ruins, village markets with fresh goat cheese. The good life, defined.', flightCostPerPerson:550, nightlyHotelRate:150, dailyExpensesPerPerson:65, tags:['Farm & Countryside','Small Town Charm','City & Culture'], timing:['Spring Break','Summer',"I'm Flexible"] },
    { flag:'🇦🇹', name:'Hallstatt, Austria', why:'Mirror lake, Alpine peaks, salt mines, and pastel houses. The tiny village that launched a thousand postcards.', flightCostPerPerson:500, nightlyHotelRate:160, dailyExpensesPerPerson:65, tags:['Small Town Charm','Nature & Escape','White Christmas'], timing:['Summer','Fall','White Christmas',"I'm Flexible"] },
    { flag:'🇳🇴', name:'Bergen, Norway', why:'Gateway to the fjords, colorful Bryggen wharf, hiking trails from the city center. Expensive but transcendent.', flightCostPerPerson:500, nightlyHotelRate:180, dailyExpensesPerPerson:80, tags:['Nature & Escape','City & Culture','Small Town Charm'], timing:['Summer',"I'm Flexible"] },
    { flag:'🇮🇹', name:'Cinque Terre, Italy', why:'Five candy-colored fishing villages clinging to cliffs above the Ligurian Sea. Hike between them, eat pesto at each stop.', flightCostPerPerson:550, nightlyHotelRate:170, dailyExpensesPerPerson:70, tags:['Small Town Charm','Beach & Sun','Nature & Escape'], timing:['Spring Break','Summer',"I'm Flexible"] },
    { flag:'🇰🇪', name:'Masai Mara, Kenya', why:'The Great Migration, big-five safaris, Maasai culture, stargazing with zero light pollution. Bucket list, period.', flightCostPerPerson:800, nightlyHotelRate:200, dailyExpensesPerPerson:70, tags:['Nature & Escape','Off the Map'], timing:['Summer','Fall',"I'm Flexible"] },
    { flag:'🇳🇴', name:'Lofoten Islands, Norway', why:'Arctic fishing villages, midnight sun, northern lights, and dramatic peaks rising from the sea. Norway\'s crown jewel.', flightCostPerPerson:600, nightlyHotelRate:190, dailyExpensesPerPerson:80, tags:['Nature & Escape','Off the Map','Small Town Charm'], timing:['Summer','Winter Escape',"I'm Flexible"] },
    { flag:'🇮🇹', name:'Tuscany, Italy', why:'Cypress-lined roads, Chianti vineyards, Renaissance hilltop towns, and farm-to-table dinners under the stars.', flightCostPerPerson:550, nightlyHotelRate:190, dailyExpensesPerPerson:75, tags:['Farm & Countryside','Small Town Charm','City & Culture'], timing:['Spring Break','Summer','Fall',"I'm Flexible"] },

    // ── PREMIUM ──
    { flag:'🇬🇷', name:'Santorini, Greece', why:'Whitewashed cliffs over a volcanic caldera, legendary sunsets, wine from vines older than most countries.', flightCostPerPerson:600, nightlyHotelRate:230, dailyExpensesPerPerson:85, tags:['Beach & Sun','City & Culture','Small Town Charm'], timing:['Spring Break','Summer',"I'm Flexible"] },
    { flag:'🇯🇵', name:'Kyoto, Japan', why:'Bamboo groves, thousand-gate shrines, geisha district, kaiseki dinners. Japan\'s spiritual heart.', flightCostPerPerson:800, nightlyHotelRate:190, dailyExpensesPerPerson:80, tags:['City & Culture','Nature & Escape'], timing:['Spring Break','Fall',"I'm Flexible"] },
    { flag:'🇫🇷', name:'French Riviera, France', why:'Azure coast, hilltop villages, Matisse museums, rosé on the beach. Glamorous but the back roads are affordable.', flightCostPerPerson:550, nightlyHotelRate:230, dailyExpensesPerPerson:90, tags:['Beach & Sun','City & Culture'], timing:['Summer','Spring Break',"I'm Flexible"] },
    { flag:'🇯🇵', name:'Tokyo, Japan', why:'Neon-lit streets, Michelin-star ramen for $10, ancient temples minutes from Shibuya Crossing.', flightCostPerPerson:850, nightlyHotelRate:210, dailyExpensesPerPerson:100, tags:['City & Culture','Off the Map'], timing:['Spring Break','Fall','White Christmas',"I'm Flexible"] },
    { flag:'🇮🇹', name:'Amalfi Coast, Italy', why:'Cliffside villages, limoncello with a view, and the best pasta you will ever eat. Worth every cent.', flightCostPerPerson:600, nightlyHotelRate:300, dailyExpensesPerPerson:100, tags:['Beach & Sun','City & Culture','Small Town Charm'], timing:['Spring Break','Summer',"I'm Flexible"] },
    { flag:'🇦🇷', name:'Patagonia, Argentina', why:'End-of-the-world glaciers, epic hiking, estancia stays. Remote, dramatic, unforgettable.', flightCostPerPerson:900, nightlyHotelRate:230, dailyExpensesPerPerson:90, tags:['Nature & Escape','Off the Map','Farm & Countryside'], timing:['Fall','Winter Escape',"I'm Flexible"] },
    { flag:'🇫🇮', name:'Lapland, Finland', why:'Northern lights from a glass igloo, reindeer safaris, Santa Claus Village. Winter wonderland turned real.', flightCostPerPerson:600, nightlyHotelRate:300, dailyExpensesPerPerson:95, tags:['Nature & Escape','White Christmas','Family-First'], timing:['White Christmas','Winter Escape',"I'm Flexible"] },
    { flag:'🇨🇭', name:'Swiss Alps, Switzerland', why:'Staggering mountain scenery, world-class skiing, chocolate and fondue in a chalet. A splurge that delivers.', flightCostPerPerson:600, nightlyHotelRate:340, dailyExpensesPerPerson:130, tags:['Nature & Escape','White Christmas','Small Town Charm'], timing:['Winter Escape','White Christmas','Summer',"I'm Flexible"] },
    { flag:'🇳🇿', name:'Queenstown, New Zealand', why:'Bungee jumping, fjord cruises, Lord of the Rings landscapes, and the world\'s best adventure town.', flightCostPerPerson:1100, nightlyHotelRate:260, dailyExpensesPerPerson:90, tags:['Nature & Escape','Family-First'], timing:['Summer','Fall',"I'm Flexible"] },
    { flag:'🇪🇨', name:'Galápagos, Ecuador', why:'Swim with sea lions, walk among giant tortoises, see blue-footed boobies. Evolution\'s living laboratory.', flightCostPerPerson:700, nightlyHotelRate:380, dailyExpensesPerPerson:100, tags:['Nature & Escape','Off the Map'], timing:['Summer','Fall',"I'm Flexible"] },

    // ── LUXURY ──
    { flag:'🇲🇻', name:'Maldives', why:'Overwater villas, bioluminescent beaches, reef snorkeling from your room. The ultimate beach splurge.', flightCostPerPerson:1200, nightlyHotelRate:550, dailyExpensesPerPerson:100, tags:['Beach & Sun','Nature & Escape'], timing:['Winter Escape','Spring Break',"I'm Flexible"] },
    { flag:'🇵🇫', name:'Bora Bora, French Polynesia', why:'Mount Otemanu, glass-floor bungalows, lagoon so blue it looks fake. The postcard destination that actually delivers.', flightCostPerPerson:1500, nightlyHotelRate:650, dailyExpensesPerPerson:120, tags:['Beach & Sun','Nature & Escape'], timing:['Summer','Winter Escape',"I'm Flexible"] },
  ];

  const totalAdults = parseInt(adults) || 2;
  const totalPeople = totalAdults + (parseInt(children) || 0);
  const budgetNum = parseFloat(budget) || 3500;
  const nightsNum = parseInt(nights) || 8;
  const roomsNum = parseInt(rooms) || Math.ceil(totalAdults / 2);
  const tripDaysNum = parseInt(rawTripDays) || 9;
  const vibesArr = vibes || [];
  const originCode = resolveIATA(origin);

  // Score destinations
  const scored = destinations.map(d => {
    let score = 0;

    // Check if a gateway hop route is cheaper than a direct flight
    let hopRoute = null;
    let effectiveFlightCost = d.flightCostPerPerson;

    if (originCode && gatewayRoutes[originCode]) {
      for (const gw of gatewayRoutes[originCode]) {
        const connections = gatewayConnections[gw.gateway];
        if (!connections) continue;
        const conn = connections.find(c => c.dest === d.name);
        if (!conn) continue;
        const hopCost = gw.cost + (conn.cost * 2); // round-trip ground
        if (hopCost < effectiveFlightCost) {
          effectiveFlightCost = hopCost;
          hopRoute = {
            gatewayCode: gw.gateway,
            gatewayCity: gw.city,
            flightCost: gw.cost,
            mode: conn.mode,
            groundCost: conn.cost,
            hours: conn.hours,
            totalPerPerson: hopCost
          };
        }
      }
    }

    const effectiveHotelRate = getHotelRate(d.name, d.nightlyHotelRate);
    const estimatedCost =
      (effectiveFlightCost * totalPeople) +
      (effectiveHotelRate * nightsNum * roomsNum) +
      (d.dailyExpensesPerPerson * nightsNum * totalPeople);

    // Budget fit (max 50 pts) — reward using the budget well, penalize over or way under
    const ratio = estimatedCost / budgetNum;
    if (ratio > 1.0) {
      // Over budget: steep penalty
      score -= Math.min(50, (ratio - 1.0) * 200);
    } else if (ratio >= 0.6) {
      // Sweet spot: 60-100% of budget — higher utilization scores better
      score += 35 + 15 * ((ratio - 0.6) / 0.4);
    } else {
      // Way under budget: scales down linearly
      score += 35 * (ratio / 0.6);
    }

    // Route accessibility from origin (+15 nonstop, -5 connections only)
    score += getRouteScore(originCode, destinationIATA[d.name]);

    const vibeMatches = vibesArr.filter(v => d.tags.includes(v)).length;
    score += vibeMatches * 20;
    if (vibesArr.length === 0) score += 10;
    if (timing && d.timing.includes(timing)) score += 15;
    if (parseInt(children) > 0 && d.tags.includes('Family-First')) score += 15;

    // Travel time penalty based on trip length
    const destIATA = destinationIATA[d.name];
    let travelHours;
    if (hopRoute) {
      travelHours = (travelHoursMap[hopRoute.gatewayCode] || 10) + hopRoute.hours;
    } else {
      travelHours = travelHoursMap[destIATA] || 12;
    }
    const travelDaysOneWay = hoursToTravelDays(travelHours);
    const totalTravelDays = travelDaysOneWay * 2;
    const travelRatio = totalTravelDays / tripDaysNum;

    // Penalize if travel time exceeds 25% of total trip days
    if (travelRatio > 0.25) {
      score -= Math.min(30, (travelRatio - 0.25) * 100);
    }

    // Flag destinations requiring 2+ travel days each way on short trips
    let travelWarning = null;
    if (travelDaysOneWay >= 2 && tripDaysNum <= 9) {
      travelWarning = `~${Math.round(totalTravelDays)} of ${tripDaysNum} days spent in transit`;
    }

    return { ...d, score, estimatedCost, hopRoute, travelWarning };
  });

  // ── Domestic small towns (when "Small Town Charm" vibe selected) ──
  if (vibesArr.includes('Small Town Charm')) {
    const domesticScored = DOMESTIC_TOWNS.map(t => {
      let score = 0;

      // Look up flight cost to the gateway
      const gw = DOMESTIC_GATEWAYS[t.corridorId];
      let flightCostPerPerson = t.flightCostPerPerson || 0;
      if (gw && originCode) {
        const match = gw.directFrom.find(d =>
          Array.isArray(d.iata) ? d.iata.includes(originCode) : d.iata === originCode
        );
        if (match) {
          // Parse avg round-trip cost from range like "$180–$280"
          const nums = match.avgRt.match(/\d+/g);
          flightCostPerPerson = nums ? Math.round((parseInt(nums[0]) + parseInt(nums[nums.length - 1])) / 2) : 250;
        } else {
          // No direct flight to this gateway — lower priority
          flightCostPerPerson = 350;
          score -= 10;
        }
      }

      const estimatedCost =
        (flightCostPerPerson * totalPeople) +
        (t.nightlyHotelRate * nightsNum * roomsNum) +
        (t.dailyExpensesPerPerson * nightsNum * totalPeople);

      // Budget fit (same logic)
      const ratio = estimatedCost / budgetNum;
      if (ratio > 1.0) {
        score -= Math.min(50, (ratio - 1.0) * 200);
      } else if (ratio >= 0.6) {
        score += 35 + 15 * ((ratio - 0.6) / 0.4);
      } else {
        score += 35 * (ratio / 0.6);
      }

      // Vibe match
      const vibeMatches = vibesArr.filter(v =>
        t.vibe && t.vibe.some(tv => tv.includes(v) || v.includes(tv.replace(/[^a-zA-Z ]/g,'').trim()))
      ).length;
      score += vibeMatches * 20;

      // Domestic bonus — short travel, no passport
      score += 10;

      return {
        ...t,
        score,
        estimatedCost,
        flightCostPerPerson,
        domestic: true,
      };
    });

    scored.push(...domesticScored);
  }

  const top5 = scored.sort((a, b) => b.score - a.score).slice(0, 5);

  // Fetch real flight prices for top 5 in parallel
  const results = await Promise.all(top5.map(async (d) => {
    const destCode = destinationIATA[d.name];
    // If hop route exists, search for flights to the gateway instead
    const searchDestCode = d.hopRoute ? d.hopRoute.gatewayCode : destCode;
    if (!originCode || !searchDestCode) {
      return { ...d, flightPrice: null, totalEstimate: d.estimatedCost };
    }
    try {
      const dates = getDates(timing, nightsNum);
      const flightRes = await amadeus.shopping.flightOffersSearch.get({
        originLocationCode: originCode,
        destinationLocationCode: searchDestCode,
        departureDate: dates.departure,
        returnDate: dates.return,
        adults: Math.min(totalPeople, 9),
        currencyCode: 'USD',
        max: 1
      });
      const cheapest = flightRes.data?.[0];
      const flightPrice = cheapest ? parseFloat(cheapest.price.total) : null;
      // Add round-trip ground transport cost when using a hop route
      const totalFlightCost = (flightPrice && d.hopRoute)
        ? flightPrice + (d.hopRoute.groundCost * 2 * totalPeople)
        : flightPrice;
      const hotelEstimate = getHotelRate(d.name, d.nightlyHotelRate) * nightsNum * roomsNum;
      const mealsEstimate = d.dailyExpensesPerPerson * totalPeople * nightsNum;
      const totalEstimate = totalFlightCost
        ? Math.round(totalFlightCost + hotelEstimate + mealsEstimate)
        : d.estimatedCost;
      return { ...d, flightPrice: totalFlightCost, totalEstimate, dates };
    } catch {
      return { ...d, flightPrice: null, totalEstimate: d.estimatedCost };
    }
  }));

  res.json({ results, origin: originCode });
});

app.listen(PORT, () => {
  console.log(`Go Elsewhere server running on http://localhost:${PORT}`);
});
