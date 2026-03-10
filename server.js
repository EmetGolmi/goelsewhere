require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Duffel } = require('@duffel/api');
const { ALL_EXPERIENCES } = require('./experiences');
const { DOMESTIC_TOWNS, DOMESTIC_GATEWAYS, getTownsByGateway } = require('./domestic-towns');
const { WORLD_PARKS } = require('./world_parks_data');
const { CHRISTMAS_TOWNS } = require('./christmas-towns.js');
const { UNESCO_TIER2 } = require('./unesco-tier2.js');
const zipcodes = require('zipcodes');
const { MASTER_DESTINATIONS } = require('./master-destinations.js');

const app = express();
const PORT = process.env.PORT || 8080;

// ── Airport coordinates for ZIP-to-airport distance calc ──
const AIRPORT_COORDS = {
  JFK: { lat: 40.6413, lng: -73.7781, name: 'New York JFK' },
  EWR: { lat: 40.6895, lng: -74.1745, name: 'Newark' },
  LGA: { lat: 40.7769, lng: -73.8740, name: 'New York LGA' },
  PHL: { lat: 39.8721, lng: -75.2411, name: 'Philadelphia' },
  ABE: { lat: 40.6524, lng: -75.4408, name: 'Lehigh Valley', routeNote: 'Domestic only \u00b7 Florida, Nashville, Denver, Charlotte' },
  ACY: { lat: 39.4576, lng: -74.5772, name: 'Atlantic City', routeNote: 'Domestic only \u00b7 Florida focus \u00b7 Budget carriers \u00b7 Parking free' },
  BOS: { lat: 42.3656, lng: -71.0096, name: 'Boston' },
  DCA: { lat: 38.8512, lng: -77.0402, name: 'Washington Reagan' },
  IAD: { lat: 38.9531, lng: -77.4565, name: 'Washington Dulles' },
  BWI: { lat: 39.1754, lng: -76.6684, name: 'Baltimore' },
  CLT: { lat: 35.2140, lng: -80.9431, name: 'Charlotte' },
  ATL: { lat: 33.6407, lng: -84.4277, name: 'Atlanta' },
  MIA: { lat: 25.7959, lng: -80.2870, name: 'Miami' },
  MCO: { lat: 28.4312, lng: -81.3081, name: 'Orlando' },
  TPA: { lat: 27.9755, lng: -82.5332, name: 'Tampa' },
  MSY: { lat: 29.9934, lng: -90.2580, name: 'New Orleans' },
  ORD: { lat: 41.9742, lng: -87.9073, name: 'Chicago O\'Hare' },
  DTW: { lat: 42.2124, lng: -83.3534, name: 'Detroit' },
  MSP: { lat: 44.8848, lng: -93.2223, name: 'Minneapolis' },
  DFW: { lat: 32.8998, lng: -97.0403, name: 'Dallas/Fort Worth' },
  IAH: { lat: 29.9902, lng: -95.3368, name: 'Houston' },
  AUS: { lat: 30.1975, lng: -97.6664, name: 'Austin' },
  BNA: { lat: 36.1263, lng: -86.6774, name: 'Nashville' },
  DEN: { lat: 39.8561, lng: -104.6737, name: 'Denver' },
  PHX: { lat: 33.4373, lng: -112.0078, name: 'Phoenix' },
  LAS: { lat: 36.0840, lng: -115.1537, name: 'Las Vegas' },
  SLC: { lat: 40.7899, lng: -111.9791, name: 'Salt Lake City' },
  LAX: { lat: 33.9416, lng: -118.4085, name: 'Los Angeles' },
  SFO: { lat: 37.6213, lng: -122.3790, name: 'San Francisco' },
  SEA: { lat: 47.4502, lng: -122.3088, name: 'Seattle' },
  PDX: { lat: 45.5898, lng: -122.5951, name: 'Portland' },
  // West Coast regional
  SBA: { lat: 34.4262, lng: -119.8403, name: 'Santa Barbara', driveNote: 'Central Coast · Channel Islands access' },
  SBP: { lat: 35.2368, lng: -120.6424, name: 'San Luis Obispo', driveNote: 'Central Coast · Wine country' },
  SMF: { lat: 38.6954, lng: -121.5908, name: 'Sacramento', driveNote: 'NorCal · Lake Tahoe 2 hrs · Gold Country' },
  FAT: { lat: 36.7762, lng: -119.7181, name: 'Fresno', driveNote: 'Central Valley · Yosemite 1.5 hrs · Sequoia 1 hr' },
  MFR: { lat: 42.3742, lng: -122.8735, name: 'Medford', driveNote: 'Southern Oregon · Crater Lake 1.5 hrs' },
  EUG: { lat: 44.1246, lng: -123.2119, name: 'Eugene', driveNote: 'Pacific NW · Oregon Coast 1 hr' },
  GEG: { lat: 47.6199, lng: -117.5339, name: 'Spokane', driveNote: 'Inland NW · Glacier NP 4 hrs · Coeur d\'Alene 30 min' },
  // Mountain West — Idaho
  BOI: { lat: 43.5644, lng: -116.2228, name: 'Boise', driveNote: 'High Desert · Snake River Canyon' },
  SUN: { lat: 43.5044, lng: -114.2963, name: 'Hailey/Sun Valley', driveNote: 'Central Idaho · Sawtooth Mountains' },
  IDA: { lat: 43.5146, lng: -112.0702, name: 'Idaho Falls', driveNote: 'Eastern Idaho · Yellowstone south entrance 1.5 hrs' },
  // Mountain West — Montana/Wyoming
  FCA: { lat: 48.3105, lng: -114.2560, name: 'Kalispell', driveNote: 'Glacier NP gateway · West entrance 30 min' },
  BZN: { lat: 45.7775, lng: -111.1603, name: 'Bozeman', driveNote: 'Southern Montana · Yellowstone north entrance 1.5 hrs · Big Sky 45 min' },
  JAC: { lat: 43.6073, lng: -110.7377, name: 'Jackson Hole', driveNote: 'Grand Teton NP gateway · Yellowstone south 1 hr' },
  // Mountain West — Colorado
  ASE: { lat: 39.2232, lng: -106.8688, name: 'Aspen', driveNote: 'Colorado Rockies · Skiing' },
  GJT: { lat: 39.1224, lng: -108.5268, name: 'Grand Junction', driveNote: 'Western Slope · Arches NP 1.5 hrs · Canyonlands 2 hrs' },
  DRO: { lat: 37.1515, lng: -107.7538, name: 'Durango', driveNote: 'Southwest CO · Mesa Verde NP 35 min · Silverton 50 min' },
  MTJ: { lat: 38.5098, lng: -107.8938, name: 'Montrose', driveNote: 'Black Canyon NP 15 min · Telluride 1 hr' },
  // Mountain West — Utah/Arizona
  SGU: { lat: 37.0363, lng: -113.5103, name: 'St. George', driveNote: 'Southwest Utah · Zion NP 45 min · Bryce Canyon 2 hrs' },
  CNY: { lat: 38.7559, lng: -109.7548, name: 'Moab', driveNote: 'Canyon Country · Arches NP 5 min · Canyonlands 30 min' },
  FLG: { lat: 35.1385, lng: -111.6709, name: 'Flagstaff', driveNote: 'Colorado Plateau · Grand Canyon South Rim 1.5 hrs' },
  // Nevada
  RNO: { lat: 39.4991, lng: -119.7681, name: 'Reno', driveNote: 'Sierra Nevada · Lake Tahoe 45 min · Burning Man corridor' },
  // Southeast / Gulf
  FLL: { lat: 26.0742, lng: -80.1506, name: 'Fort Lauderdale' },
  PBI: { lat: 26.6832, lng: -80.0956, name: 'West Palm Beach' },
  JAX: { lat: 30.4941, lng: -81.6879, name: 'Jacksonville' },
  SAV: { lat: 32.1276, lng: -81.2021, name: 'Savannah' },
  CHS: { lat: 32.8986, lng: -80.0405, name: 'Charleston' },
  RDU: { lat: 35.8776, lng: -78.7875, name: 'Raleigh-Durham' },
  GSO: { lat: 36.0978, lng: -79.9373, name: 'Greensboro' },
  RIC: { lat: 37.5052, lng: -77.3197, name: 'Richmond' },
  ORF: { lat: 36.8946, lng: -76.2012, name: 'Norfolk' },
  MEM: { lat: 35.0424, lng: -89.9767, name: 'Memphis' },
  BHM: { lat: 33.5629, lng: -86.7535, name: 'Birmingham' },
  HSV: { lat: 34.6372, lng: -86.7751, name: 'Huntsville' },
  SDF: { lat: 38.1744, lng: -85.7360, name: 'Louisville' },
  LEX: { lat: 38.0365, lng: -84.6059, name: 'Lexington' },
  MYR: { lat: 33.6797, lng: -78.9283, name: 'Myrtle Beach' },
  PNS: { lat: 30.4734, lng: -87.1866, name: 'Pensacola' },
  MOB: { lat: 30.6914, lng: -88.2456, name: 'Mobile' },
  JAN: { lat: 32.3112, lng: -90.0759, name: 'Jackson MS' },
  SHV: { lat: 32.4466, lng: -93.8256, name: 'Shreveport' },
  LIT: { lat: 34.7294, lng: -92.2243, name: 'Little Rock' },
  XNA: { lat: 36.2819, lng: -94.3068, name: 'NW Arkansas' },
  TLH: { lat: 30.3965, lng: -84.3503, name: 'Tallahassee' },
  RSW: { lat: 26.5362, lng: -81.7552, name: 'Fort Myers' },
  SRQ: { lat: 27.3954, lng: -82.5544, name: 'Sarasota' },
  // Midwest / Plains
  MKE: { lat: 42.9472, lng: -87.8966, name: 'Milwaukee' },
  MDW: { lat: 41.7868, lng: -87.7522, name: 'Chicago Midway' },
  CMH: { lat: 39.9980, lng: -82.8919, name: 'Columbus' },
  IND: { lat: 39.7173, lng: -86.2944, name: 'Indianapolis' },
  CVG: { lat: 39.0488, lng: -84.6678, name: 'Cincinnati' },
  CLE: { lat: 41.4117, lng: -81.8498, name: 'Cleveland' },
  PIT: { lat: 40.4915, lng: -80.2329, name: 'Pittsburgh' },
  STL: { lat: 38.7487, lng: -90.3700, name: 'St. Louis' },
  MCI: { lat: 39.2976, lng: -94.7139, name: 'Kansas City' },
  OMA: { lat: 41.3032, lng: -95.8941, name: 'Omaha' },
  DSM: { lat: 41.5340, lng: -93.6631, name: 'Des Moines' },
  FSD: { lat: 43.5820, lng: -96.7419, name: 'Sioux Falls' },
  FAR: { lat: 46.9207, lng: -96.8158, name: 'Fargo' },
  BIS: { lat: 46.7724, lng: -100.7467, name: 'Bismarck' },
  RAP: { lat: 44.0453, lng: -103.0574, name: 'Rapid City' },
  BUF: { lat: 42.9405, lng: -78.7322, name: 'Buffalo' },
  SYR: { lat: 43.1112, lng: -76.1063, name: 'Syracuse' },
  ROC: { lat: 43.1189, lng: -77.6724, name: 'Rochester NY' },
  ALB: { lat: 42.7483, lng: -73.8017, name: 'Albany' },
  BTV: { lat: 44.4720, lng: -73.1533, name: 'Burlington VT' },
  PWM: { lat: 43.6462, lng: -70.3093, name: 'Portland ME' },
  MHT: { lat: 42.9326, lng: -71.4357, name: 'Manchester NH' },
  BDL: { lat: 41.9389, lng: -72.6832, name: 'Hartford' },
  ISP: { lat: 40.7952, lng: -73.1002, name: 'Long Island' },
  SWF: { lat: 41.5041, lng: -74.1048, name: 'Stewart/Newburgh' },
  HPN: { lat: 41.0670, lng: -73.7076, name: 'Westchester' },
  // Texas
  SAT: { lat: 29.5337, lng: -98.4698, name: 'San Antonio' },
  ELP: { lat: 31.8064, lng: -106.3778, name: 'El Paso' },
  MAF: { lat: 31.9425, lng: -102.2019, name: 'Midland/Odessa' },
  AMA: { lat: 35.2194, lng: -101.7060, name: 'Amarillo' },
  LBB: { lat: 33.6636, lng: -101.8227, name: 'Lubbock' },
  CRP: { lat: 27.7704, lng: -97.5012, name: 'Corpus Christi' },
  HRL: { lat: 26.2285, lng: -97.6544, name: 'Harlingen' },
  // Mountain / West
  ABQ: { lat: 35.0402, lng: -106.6094, name: 'Albuquerque' },
  TUS: { lat: 32.1161, lng: -110.9410, name: 'Tucson' },
  OKC: { lat: 35.3931, lng: -97.6007, name: 'Oklahoma City' },
  TUL: { lat: 36.1984, lng: -95.8881, name: 'Tulsa' },
  ICT: { lat: 37.6499, lng: -97.4331, name: 'Wichita' },
  COS: { lat: 38.8058, lng: -104.7008, name: 'Colorado Springs' },
  BIL: { lat: 45.8077, lng: -108.5430, name: 'Billings' },
  MSO: { lat: 46.9163, lng: -114.0906, name: 'Missoula' },
  // Pacific
  SNA: { lat: 33.6757, lng: -117.8678, name: 'Orange County' },
  SAN: { lat: 32.7338, lng: -117.1933, name: 'San Diego' },
  OAK: { lat: 37.7213, lng: -122.2208, name: 'Oakland' },
  SJC: { lat: 37.3639, lng: -121.9289, name: 'San Jose' },
  BUR: { lat: 34.2007, lng: -118.3585, name: 'Burbank' },
  PSP: { lat: 33.8297, lng: -116.5067, name: 'Palm Springs' },
  // Hawaii & Alaska
  HNL: { lat: 21.3187, lng: -157.9224, name: 'Honolulu' },
  OGG: { lat: 20.8986, lng: -156.4305, name: 'Maui' },
  KOA: { lat: 19.7388, lng: -156.0456, name: 'Kona' },
  LIH: { lat: 21.9760, lng: -159.3390, name: 'Kauai' },
  ANC: { lat: 61.1743, lng: -149.9982, name: 'Anchorage' },
  FAI: { lat: 64.8151, lng: -147.8564, name: 'Fairbanks' },
  JNU: { lat: 58.3550, lng: -134.5763, name: 'Juneau' },
  // Puerto Rico / Caribbean
  SJU: { lat: 18.4394, lng: -66.0018, name: 'San Juan' },
  // Canada
  YYC: { lat: 51.1315, lng: -114.0108, name: 'Calgary', driveNote: 'Banff NP 1.5 hrs · Jasper 4 hrs · Canadian Rockies gateway' },
  YVR: { lat: 49.1947, lng: -123.1790, name: 'Vancouver' },
  YYZ: { lat: 43.6777, lng: -79.6248, name: 'Toronto' },
  YUL: { lat: 45.4706, lng: -73.7408, name: 'Montreal' },
};

// ── ZIP code → lat/lng lookup ──
// Resolve any US ZIP code to lat/lng using the zipcodes database


// Haversine distance in miles
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 3959; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Approximate drive time in minutes (assumes ~45mph avg with metro traffic)
function estimateDriveMin(distanceMiles) {
  return Math.round(distanceMiles / 45 * 60);
}

function resolveZip(zip) {
  const result = zipcodes.lookup(zip);
  if (!result) return null;
  return { lat: result.latitude, lng: result.longitude };
}

app.use(cors({
  origin: ['http://goelsewhere.travel', 'https://goelsewhere.travel', 'http://localhost:3000', 'http://localhost:3002']
}));
app.use(express.json());
app.use(express.static('.'));

const duffel = new Duffel({
  token: process.env.DUFFEL_API_KEY,
});

// ── Live hotel pricing (enriched offline) ──
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

// ── Quality tier helpers ──
function getQualityTier(impliedRate) {
  if (impliedRate < 50)  return 'budget';
  if (impliedRate < 120) return 'midrange';
  if (impliedRate < 200) return 'comfort';
  return 'upscale';
}

function getTieredRate(baseMidRate, tier) {
  const multipliers = { budget: 0.6, midrange: 1.0, comfort: 1.35, upscale: 1.8 };
  return Math.round(baseMidRate * (multipliers[tier] || 1.0));
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
  // UNESCO Tier 2
  'Chichén Itzá, Mexico': 'CUN',
  'Iguazú Falls, Argentina': 'IGR',
  'Granada, Spain': 'GRX',
  'Prague, Czech Republic': 'PRG',
  'Fez, Morocco': 'FEZ',
  'Victoria Falls, Zambia': 'LVI',
  'Bagan, Myanmar': 'NYU',
  'Ha Long Bay, Vietnam': 'HAN',
  'Serengeti, Tanzania': 'JRO',
  'Uluru, Australia': 'AYQ',
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

  // White Christmas: force Dec 22 → Jan 2 window
  if (timing === 'White Christmas') {
    let depart = new Date(year, 11, 22); // Dec 22
    if (depart - now < 7 * 24 * 60 * 60 * 1000) {
      depart = new Date(year + 1, 11, 22);
    }
    const ret = new Date(depart.getFullYear() + 1, 0, 2); // Jan 2 next year
    return {
      departure: depart.toISOString().split('T')[0],
      return: ret.toISOString().split('T')[0]
    };
  }

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

// ── /api/airports — find nearby airports from ZIP code ──
app.get('/api/airports', (req, res) => {
  const zip = (req.query.zip || '').trim();
  if (!/^\d{5}$/.test(zip)) {
    return res.status(400).json({ error: 'Please provide a 5-digit US ZIP code' });
  }

  const location = resolveZip(zip);
  if (!location) {
    return res.status(404).json({ error: 'ZIP code not recognized. Try a nearby major city ZIP.' });
  }

  const airports = [];
  for (const [iata, info] of Object.entries(AIRPORT_COORDS)) {
    const dist = haversineDistance(location.lat, location.lng, info.lat, info.lng);
    if (dist <= 150) {
      airports.push({
        iata,
        name: info.name,
        distanceMiles: Math.round(dist),
        driveMin: estimateDriveMin(dist),
        ...(info.routeNote && { routeNote: info.routeNote }),
        ...(info.driveNote && { driveNote: info.driveNote }),
      });
    }
  }

  airports.sort((a, b) => a.distanceMiles - b.distanceMiles);

  res.json({
    zip,
    location: { lat: location.lat, lng: location.lng },
    airports,
  });
});

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

// ── /api/parks ──
app.get('/api/parks', (req, res) => {
  const { region, tag, gateway } = req.query;
  let parks = WORLD_PARKS;
  if (region) parks = parks.filter(p => p.region.toLowerCase().includes(region.toLowerCase()));
  if (tag) parks = parks.filter(p => p.tags.some(t => t.toLowerCase().includes(tag.toLowerCase())));
  if (gateway) parks = parks.filter(p => p.gateway.toLowerCase().includes(gateway.toLowerCase()));
  res.json(parks);
});

// ── /api/christmas-towns ──
app.get('/api/christmas-towns', (req, res) => {
  const { trainTown, snow, region, maxNightly } = req.query;
  let towns = [...CHRISTMAS_TOWNS];
  if (trainTown === 'true') towns = towns.filter(t => t.trainTown === true);
  if (snow) towns = towns.filter(t => t.snowReliability === snow);
  if (region) towns = towns.filter(t => t.region.toLowerCase().includes(region.toLowerCase()));
  if (maxNightly) towns = towns.filter(t => t.nightlyMid <= parseInt(maxNightly));
  res.json({ towns, total: towns.length });
});

// ── /api/unesco ──
app.get('/api/unesco', (req, res) => {
  const { region, vibe } = req.query;
  let sites = UNESCO_TIER2.filter(s => !s.alreadyInCorridors);
  if (region) sites = sites.filter(s => s.region.toLowerCase().includes(region.toLowerCase()));
  if (vibe) sites = sites.filter(s => s.vibes && s.vibes.includes(vibe));
  res.json({ sites, total: sites.length });
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
    const passengers = Array.from({ length: Math.min(totalAdults, 9) }, () => ({ type: 'adult' }));
    const offerRequest = await duffel.offerRequests.create({
      slices: [
        { origin: originCode, destination: destCode, departure_date: dates.departure },
        { origin: destCode, destination: originCode, departure_date: dates.return },
      ],
      passengers,
      cabin_class: 'economy',
    });

    const offers = offerRequest.data?.offers || [];
    if (offers.length === 0) {
      return res.json({ price: null, note: 'No flights found for this route' });
    }

    const cheapest = offers.reduce((min, o) =>
      parseFloat(o.total_amount) < parseFloat(min.total_amount) ? o : min
    );

    res.json({
      price: parseFloat(cheapest.total_amount),
      currency: cheapest.total_currency,
      origin: originCode,
      destination: destCode,
      departure: dates.departure,
      return: dates.return,
      airline: cheapest.owner?.name || 'Various',
      stops: (cheapest.slices?.[0]?.segments?.length || 1) - 1,
    });

  } catch (err) {
    console.error('Duffel error:', err?.errors || err.message);
    res.status(500).json({
      error: 'Flight search failed',
      detail: err?.errors?.[0]?.message || err.message,
    });
  }
});

// ── Corridor destinations (module-level for reuse) ──
const CORRIDORS = [
    // ── ULTRA-BUDGET ──
    { flag:'🇬🇹', name:'Antigua, Guatemala', why:'Cobblestone streets under three volcanoes, Spanish colonial churches, and $2 street food that rivals fine dining.', flightCostPerPerson:300, nightlyHotelRate:40, dailyExpensesPerPerson:30, tags:['City & Culture','Off the Map','Small Town Charm'], timing:['Winter Escape','Spring Break','Fall',"I'm Flexible"], genre:['city-historic','small-town-historic'] },
    { flag:'🇳🇮', name:'Granada, Nicaragua', why:'Candy-colored colonial city on a lake full of tiny volcanic islands. Central America\'s best-kept secret.', flightCostPerPerson:350, nightlyHotelRate:35, dailyExpensesPerPerson:25, tags:['City & Culture','Off the Map','Small Town Charm'], timing:['Winter Escape','Spring Break',"I'm Flexible"], genre:['city-historic','small-town-coastal'] },
    { flag:'🇰🇭', name:'Siem Reap, Cambodia', why:'Angkor Wat at sunrise, night markets, $1 beers. A place that rewires how you think about travel.', flightCostPerPerson:550, nightlyHotelRate:25, dailyExpensesPerPerson:15, tags:['City & Culture','Off the Map'], timing:['Winter Escape','Fall',"I'm Flexible"], genre:['city-historic','off-the-map-spiritual'], unesco:true, unescoSite:'Angkor', unescoYear:1992 },
    { flag:'🇻🇳', name:'Hanoi, Vietnam', why:'Thousand-year-old temples, pho on every corner, motorbike chaos that somehow works. Absurdly cheap.', flightCostPerPerson:550, nightlyHotelRate:30, dailyExpensesPerPerson:20, tags:['City & Culture','Off the Map'], timing:['Spring Break','Fall','Winter Escape',"I'm Flexible"], genre:['city-emerging','off-the-map-emerging'], unesco:true, unescoSite:'Ha Long Bay', unescoYear:1994 },
    { flag:'🇹🇭', name:'Chiang Mai, Thailand', why:'Mountain temples, night bazaars, Thai cooking classes for $15. The digital nomad capital for a reason.', flightCostPerPerson:550, nightlyHotelRate:30, dailyExpensesPerPerson:20, tags:['City & Culture','Nature & Escape','Off the Map','Farm & Countryside'], timing:['Winter Escape','Fall',"I'm Flexible"], genre:['city-emerging','off-the-map-emerging','nature-jungle'] },
    { flag:'🇻🇳', name:'Da Nang, Vietnam', why:'Miles of uncrowded beach, marble mountains, incredible seafood. Vietnam\'s best family-friendly coast.', flightCostPerPerson:550, nightlyHotelRate:35, dailyExpensesPerPerson:25, tags:['Beach & Sun','Family-First','Off the Map'], timing:['Spring Break','Summer',"I'm Flexible"], genre:['beach-pacific','family-beach'] },
    { flag:'🇻🇳', name:'Hoi An, Vietnam', why:'Lantern-lit ancient town, tailor shops on every corner, $1 banh mi, and rice paddies a bike ride away. Impossibly charming.', flightCostPerPerson:550, nightlyHotelRate:35, dailyExpensesPerPerson:20, tags:['Small Town Charm','City & Culture','Off the Map'], timing:['Spring Break','Fall','Winter Escape',"I'm Flexible"], genre:['city-historic','small-town-arts','off-the-map-emerging'], unesco:true, unescoSite:'Hoi An Ancient Town', unescoYear:1999 },
    { flag:'🇮🇳', name:'Goa, India', why:'Palm-fringed beaches, Portuguese-Indian fusion food, beach shacks at sunset. India\'s chill side.', flightCostPerPerson:650, nightlyHotelRate:30, dailyExpensesPerPerson:20, tags:['Beach & Sun','Off the Map'], timing:['Winter Escape','Fall',"I'm Flexible"], genre:['beach-pacific','off-the-map-emerging'] },
    { flag:'🇧🇴', name:'La Paz, Bolivia', why:'World\'s highest capital, salt flats that mirror the sky, Death Road mountain biking. Truly otherworldly.', flightCostPerPerson:450, nightlyHotelRate:35, dailyExpensesPerPerson:25, tags:['Nature & Escape','Off the Map'], timing:['Summer','Fall',"I'm Flexible"], genre:['nature-mountain','nature-desert','off-the-map-extreme'], nearestParks:['Salar de Uyuni'] },
    { flag:'🇲🇽', name:'Mexico City, Mexico', why:'World-class museums, $3 taco crawls, Aztec ruins downtown. One of the great cities, at a fraction of the price.', flightCostPerPerson:250, nightlyHotelRate:60, dailyExpensesPerPerson:35, tags:['City & Culture','Family-First'], timing:['Spring Break','Fall','Winter Escape',"I'm Flexible"], genre:['city-grand','family-cultural'], majorCity:true, minNights:2, maxNights:10 },
    { flag:'🇪🇬', name:'Cairo, Egypt', why:'The Pyramids. The Sphinx. The Egyptian Museum. Five thousand years of history and some of the best food in the Middle East.', flightCostPerPerson:550, nightlyHotelRate:40, dailyExpensesPerPerson:25, tags:['City & Culture','Off the Map'], timing:['Fall','Winter Escape','Spring Break',"I'm Flexible"], genre:['city-grand','off-the-map-emerging'], majorCity:true },
    { flag:'🇱🇦', name:'Luang Prabang, Laos', why:'Monks at dawn, waterfalls in the jungle, French-Lao fusion cuisine on the Mekong. Pure magic.', flightCostPerPerson:600, nightlyHotelRate:30, dailyExpensesPerPerson:15, tags:['Nature & Escape','Off the Map','Small Town Charm'], timing:['Winter Escape','Fall',"I'm Flexible"], genre:['city-historic','off-the-map-spiritual'], unesco:true, unescoSite:'Town of Luang Prabang', unescoYear:1995 },
    { flag:'🇮🇳', name:'Kerala, India', why:'Houseboat through the backwaters, Ayurvedic spa villages, spice plantations in the hills. India\'s most peaceful state.', flightCostPerPerson:650, nightlyHotelRate:35, dailyExpensesPerPerson:20, tags:['Nature & Escape','Off the Map','Farm & Countryside'], timing:['Winter Escape','Fall',"I'm Flexible"], genre:['nature-jungle','farm-pastoral','off-the-map-emerging'] },
    { flag:'🇲🇽', name:'Oaxaca, Mexico', why:'Mezcal tastings, Zapotec ruins, mole with 30 ingredients. Mexico\'s cultural soul at backpacker prices.', flightCostPerPerson:300, nightlyHotelRate:50, dailyExpensesPerPerson:35, tags:['City & Culture','Off the Map','Farm & Countryside'], timing:['Fall','Winter Escape','Spring Break',"I'm Flexible"], genre:['city-emerging','city-historic','farm-working'], unesco:true, unescoSite:'Historic Centre of Oaxaca and Monte Albán', unescoYear:1987 },
    { flag:'🇷🇴', name:'Bucharest, Romania', why:'Art Deco palaces, the world\'s heaviest building, craft beer scene, and Transylvanian castles two hours away.', flightCostPerPerson:450, nightlyHotelRate:50, dailyExpensesPerPerson:30, tags:['City & Culture','Off the Map'], timing:['Summer','Fall',"I'm Flexible"], genre:['city-emerging','off-the-map-emerging'] },
    { flag:'🇮🇳', name:'Rajasthan, India', why:'Tiger safaris, desert forts, palaces turned into hotels. A riot of color and history at unbeatable prices.', flightCostPerPerson:650, nightlyHotelRate:40, dailyExpensesPerPerson:25, tags:['City & Culture','Nature & Escape','Off the Map','Farm & Countryside'], timing:['Winter Escape','Fall',"I'm Flexible"], genre:['nature-desert','off-the-map-spiritual','nature-wildlife'] },
    { flag:'🇵🇭', name:'El Nido, Philippines', why:'Limestone cliffs, hidden lagoons, island-hopping by outrigger canoe. Southeast Asia\'s most photogenic coast.', flightCostPerPerson:600, nightlyHotelRate:40, dailyExpensesPerPerson:20, tags:['Beach & Sun','Nature & Escape','Off the Map','Small Town Charm'], timing:['Winter Escape','Spring Break',"I'm Flexible"], genre:['beach-pacific','nature-coastal','off-the-map-remote'] },

    // ── BUDGET ──
    { flag:'🇲🇽', name:'Bacalar, Mexico', why:'A lake with seven shades of blue, zero crowds, and Tulum prices from five years ago. Still a genuine secret.', flightCostPerPerson:350, nightlyHotelRate:55, dailyExpensesPerPerson:30, tags:['Beach & Sun','Nature & Escape','Off the Map','Small Town Charm'], timing:['Spring Break','Summer','Winter Escape',"I'm Flexible"], genre:['beach-caribbean','nature-coastal','off-the-map-remote'] },
    { flag:'🇨🇴', name:'Medellín, Colombia', why:'Eternal spring weather, cable cars over green hills, craft coffee scene, salsa dancing every night.', flightCostPerPerson:350, nightlyHotelRate:55, dailyExpensesPerPerson:35, tags:['City & Culture','Nature & Escape'], timing:['Spring Break','Summer','Fall',"I'm Flexible"], genre:['city-emerging','nature-mountain'], nearestParks:['El Cocuy National Park','Tayrona National Park'] },
    { flag:'🇹🇭', name:'Bangkok, Thailand', why:'Glittering temples, rooftop bars, street food that puts restaurants to shame. Overwhelming in the best way.', flightCostPerPerson:550, nightlyHotelRate:45, dailyExpensesPerPerson:30, tags:['City & Culture','Off the Map'], timing:['Winter Escape','Fall',"I'm Flexible"], genre:['city-grand','off-the-map-emerging'], majorCity:true },
    { flag:'🇧🇷', name:'Salvador, Brazil', why:'Afro-Brazilian drumming, colonial Pelourinho, capoeira on the beach. Brazil\'s cultural heartbeat, not its price tag.', flightCostPerPerson:500, nightlyHotelRate:55, dailyExpensesPerPerson:35, tags:['Beach & Sun','City & Culture','Off the Map'], timing:['Summer','Spring Break',"I'm Flexible"], genre:['beach-atlantic','city-emerging','off-the-map-emerging'], nearestParks:['Chapada Diamantina National Park'] },
    { flag:'🇩🇴', name:'Las Terrenas, Dominican Republic', why:'A French-Caribbean beach town most Americans have never heard of. Walkable, affordable, beautiful.', flightCostPerPerson:350, nightlyHotelRate:60, dailyExpensesPerPerson:35, tags:['Beach & Sun','City & Culture','Family-First','Small Town Charm'], timing:['Spring Break','Summer','Winter Escape',"I'm Flexible"], genre:['beach-caribbean','small-town-coastal','family-beach'], lodgingTypes:['villa','boutique-hotel','eco-lodge'], minNights:2, maxNights:10 },
    { flag:'🇭🇺', name:'Budapest, Hungary', why:'Thermal baths, ruin bars, Danube sunsets, and pastries that rival Vienna at half the price.', flightCostPerPerson:450, nightlyHotelRate:65, dailyExpensesPerPerson:40, tags:['City & Culture'], timing:['Spring Break','Summer','Fall','White Christmas',"I'm Flexible"], genre:['city-grand','city-historic'], snowProbability:true, christmasVibe:'city-christmas' },
    { flag:'🇱🇰', name:'Galle, Sri Lanka', why:'Dutch colonial fort on a tropical headland, whale watching, tea country trains. Incredible value.', flightCostPerPerson:650, nightlyHotelRate:40, dailyExpensesPerPerson:25, tags:['Beach & Sun','City & Culture','Off the Map','Small Town Charm'], timing:['Winter Escape','Spring Break',"I'm Flexible"], genre:['city-historic','small-town-coastal','off-the-map-emerging'] },
    { flag:'🇨🇴', name:'Cartagena, Colombia', why:'Colonial walled city, Caribbean beaches 20 min away, world-class food, dollar goes three times as far.', flightCostPerPerson:350, nightlyHotelRate:70, dailyExpensesPerPerson:40, tags:['Beach & Sun','City & Culture','Off the Map'], timing:['Spring Break','Summer','Winter Escape',"I'm Flexible"], genre:['city-historic','city-coastal','beach-caribbean'], lodgingTypes:['colonial-mansion','boutique-hotel','hostel'], nearestParks:['Tayrona National Park'], unesco:true, unescoSite:'Port, Fortresses and Group of Monuments, Cartagena', unescoYear:1984 },
    { flag:'🇲🇦', name:'Chefchaouen, Morocco', why:'The Blue City. Every wall painted indigo, tucked in the Rif Mountains, with no crowds and mint tea on every rooftop.', flightCostPerPerson:500, nightlyHotelRate:50, dailyExpensesPerPerson:30, tags:['Small Town Charm','Off the Map','City & Culture'], timing:['Spring Break','Fall',"I'm Flexible"], genre:['small-town-arts','off-the-map-remote'] },
    { flag:'🇮🇳', name:'Mumbai, India', why:'Bollywood energy, colonial architecture, legendary street food from vada pav to pav bhaji. India\'s maximalist, magnificent heart.', flightCostPerPerson:650, nightlyHotelRate:50, dailyExpensesPerPerson:30, tags:['City & Culture','Off the Map'], timing:['Winter Escape','Fall','Spring Break',"I'm Flexible"], genre:['city-grand','off-the-map-emerging'], majorCity:true },
    { flag:'🇮🇩', name:'Bali, Indonesia', why:'Rice terraces, temple ceremonies, surf breaks, and $8 massages. Spiritual and hedonistic in equal measure.', flightCostPerPerson:600, nightlyHotelRate:50, dailyExpensesPerPerson:30, tags:['Beach & Sun','Nature & Escape','Off the Map','Farm & Countryside'], timing:['Summer','Fall',"I'm Flexible"], genre:['beach-pacific','nature-jungle','farm-pastoral'], nearestParks:['Kawah Ijen Volcano'] },
    { flag:'🇪🇨', name:'Quito, Ecuador', why:'Colonial old town straddling the equator, cloud forests an hour away, gateway to the Amazon.', flightCostPerPerson:400, nightlyHotelRate:60, dailyExpensesPerPerson:35, tags:['City & Culture','Nature & Escape','Off the Map'], timing:['Summer','Fall',"I'm Flexible"], genre:['city-historic','nature-mountain','off-the-map-emerging'], nearestParks:['Huascarán National Park'] },
    { flag:'🇬🇪', name:'Tbilisi, Georgia', why:'Ancient wine country, sulphur baths, jaw-dropping Caucasus mountains, and some of the friendliest people anywhere.', flightCostPerPerson:550, nightlyHotelRate:55, dailyExpensesPerPerson:30, tags:['City & Culture','Nature & Escape','Off the Map','Farm & Countryside'], timing:['Summer','Fall','Spring Break',"I'm Flexible"], genre:['city-emerging','off-the-map-emerging','farm-wine'] },
    { flag:'🇧🇿', name:'Placencia, Belize', why:'English-speaking, tiny beach strip, second-largest barrier reef in the world. Snorkel from shore.', flightCostPerPerson:400, nightlyHotelRate:70, dailyExpensesPerPerson:35, tags:['Beach & Sun','Nature & Escape','Off the Map','Small Town Charm'], timing:['Spring Break','Summer','Winter Escape',"I'm Flexible"], genre:['beach-caribbean','small-town-coastal','nature-coastal'] },
    { flag:'🇵🇱', name:'Kraków, Poland', why:'Medieval old town, incredible food, actual snow for Christmas, costs half of Western Europe.', flightCostPerPerson:450, nightlyHotelRate:65, dailyExpensesPerPerson:40, tags:['City & Culture','White Christmas'], timing:['White Christmas','Fall','Winter Escape',"I'm Flexible"], genre:['city-historic','city-christmas'], snowProbability:true, christmasVibe:'city-christmas' },
    { flag:'🇹🇷', name:'Istanbul, Turkey', why:'Hagia Sophia, Grand Bazaar, Bosphorus ferries, and kebabs that redefine the word. Two continents, one city.', flightCostPerPerson:500, nightlyHotelRate:60, dailyExpensesPerPerson:40, tags:['City & Culture','Off the Map'], timing:['Spring Break','Fall',"I'm Flexible"], genre:['city-grand','city-historic'], majorCity:true },
    { flag:'🇵🇦', name:'Bocas del Toro, Panama', why:'Caribbean island chain with reggae vibes, over-water bungalows, and sloth sanctuaries. Panama\'s hidden coast.', flightCostPerPerson:400, nightlyHotelRate:65, dailyExpensesPerPerson:35, tags:['Beach & Sun','Nature & Escape','Off the Map','Small Town Charm'], timing:['Spring Break','Summer','Winter Escape',"I'm Flexible"], genre:['beach-caribbean','off-the-map-remote'] },
    { flag:'🇲🇦', name:'Essaouira, Morocco', why:'Wind-swept Atlantic ramparts, blue fishing boats, Hendrix history, and no cruise ship crowds. Marrakech\'s cooler cousin.', flightCostPerPerson:500, nightlyHotelRate:55, dailyExpensesPerPerson:35, tags:['Beach & Sun','City & Culture','Off the Map','Small Town Charm'], timing:['Spring Break','Fall',"I'm Flexible"], genre:['beach-atlantic','small-town-coastal','off-the-map-emerging'], lodgingTypes:['riad','kasbah','boutique-hotel'] },
    { flag:'🇭🇳', name:'Roatán, Honduras', why:'Caribbean reef diving for a fraction of Belize prices, uncrowded white sand, West End village nightlife.', flightCostPerPerson:400, nightlyHotelRate:70, dailyExpensesPerPerson:35, tags:['Beach & Sun','Nature & Escape','Off the Map','Small Town Charm'], timing:['Spring Break','Winter Escape',"I'm Flexible"], genre:['beach-caribbean','nature-coastal','off-the-map-remote'] },
    { flag:'🇲🇹', name:'Valletta, Malta', why:'Honey-colored fortress city smaller than most neighborhoods. Knights Templar history, blue grottoes, and great diving.', flightCostPerPerson:500, nightlyHotelRate:65, dailyExpensesPerPerson:40, tags:['City & Culture','Beach & Sun','Small Town Charm'], timing:['Spring Break','Summer','Fall',"I'm Flexible"], genre:['city-historic','beach-mediterranean','small-town-historic'] },
    { flag:'🇲🇦', name:'Marrakech, Morocco', why:'The medina is unlike anywhere on earth. Spice markets, rooftop dinners, Atlas Mountains nearby.', flightCostPerPerson:500, nightlyHotelRate:65, dailyExpensesPerPerson:40, tags:['City & Culture','Off the Map'], timing:['Fall','Winter Escape','Spring Break',"I'm Flexible"], genre:['city-grand','off-the-map-emerging'], lodgingTypes:['riad','kasbah','boutique-hotel'], unesco:true, unescoSite:'Medina of Marrakesh', unescoYear:1985 },
    { flag:'🇵🇷', name:'Rincón, Puerto Rico', why:'No passport needed, direct flights from most US cities, surf town with great family beaches.', flightCostPerPerson:300, nightlyHotelRate:80, dailyExpensesPerPerson:45, tags:['Beach & Sun','Family-First','Small Town Charm'], timing:['Spring Break','Summer','Winter Escape',"I'm Flexible"], genre:['beach-caribbean','family-beach','small-town-coastal'], nearestParks:['El Yunque National Forest'], minNights:3, maxNights:10, unesco:true, unescoSite:'La Fortaleza and San Juan National Historic Site', unescoYear:1983 },
    { flag:'🇹🇷', name:'Cappadocia, Turkey', why:'Hot air balloons over fairy chimneys at dawn, cave hotels, underground cities. Genuinely surreal.', flightCostPerPerson:550, nightlyHotelRate:65, dailyExpensesPerPerson:35, tags:['Nature & Escape','Off the Map','Farm & Countryside'], timing:['Spring Break','Fall',"I'm Flexible"], genre:['nature-desert','off-the-map-extreme'], unesco:true, unescoSite:'Göreme National Park and Rock Sites of Cappadocia', unescoYear:1985 },
    { flag:'🇲🇪', name:'Kotor, Montenegro', why:'Fjord-like bay, Venetian old town, hiking fortress walls at sunset. Croatia quality, half the price.', flightCostPerPerson:500, nightlyHotelRate:65, dailyExpensesPerPerson:40, tags:['City & Culture','Nature & Escape','Off the Map','Small Town Charm'], timing:['Spring Break','Summer',"I'm Flexible"], genre:['city-historic','small-town-coastal','off-the-map-emerging'] },
    { flag:'🇧🇿', name:'San Ignacio, Belize', why:'Maya ruins in the jungle, cave tubing, howler monkeys. The adventure side of Belize most people miss.', flightCostPerPerson:400, nightlyHotelRate:65, dailyExpensesPerPerson:40, tags:['Nature & Escape','Off the Map','Family-First','Small Town Charm'], timing:['Spring Break','Summer','Winter Escape',"I'm Flexible"], genre:['nature-jungle','family-adventure','off-the-map-remote'] },

    // ── MID-RANGE ──
    { flag:'🇵🇪', name:'Cusco, Peru', why:'Gateway to Machu Picchu, Inca stonework, altitude-defying nightlife, and Sacred Valley day trips.', flightCostPerPerson:500, nightlyHotelRate:70, dailyExpensesPerPerson:40, tags:['City & Culture','Nature & Escape','Off the Map'], timing:['Summer','Fall','Spring Break',"I'm Flexible"], genre:['city-historic','nature-mountain','off-the-map-spiritual'], unesco:true, unescoSite:'Historic Sanctuary of Machu Picchu', unescoYear:1983 },
    { flag:'🇨🇦', name:'Québec City, Canada', why:'A European walled city in North America. Magical in snow. No passport needed.', flightCostPerPerson:300, nightlyHotelRate:100, dailyExpensesPerPerson:55, tags:['City & Culture','White Christmas','Family-First','Small Town Charm'], timing:['White Christmas','Winter Escape',"I'm Flexible"], genre:['city-historic','city-christmas','family-cultural'], snowProbability:true, christmasVibe:'city-christmas', unesco:true, unescoSite:'Historic District of Old Québec', unescoYear:1985 },
    { flag:'🇨🇷', name:'Monteverde, Costa Rica', why:'Cloud forest canopy walks, zip lines, hummingbirds everywhere. Family adventure without the fuss.', flightCostPerPerson:350, nightlyHotelRate:85, dailyExpensesPerPerson:45, tags:['Nature & Escape','Family-First','Farm & Countryside'], timing:['Spring Break','Summer','Winter Escape',"I'm Flexible"], genre:['nature-jungle','family-adventure'] },
    { flag:'🇯🇲', name:'Negril, Jamaica', why:'Seven Mile Beach, genuine reggae culture, strong villa market for families. More affordable than the resort side.', flightCostPerPerson:350, nightlyHotelRate:90, dailyExpensesPerPerson:50, tags:['Beach & Sun','Family-First','Small Town Charm'], timing:['Spring Break','Summer','Winter Escape',"I'm Flexible"], genre:['beach-caribbean','family-beach','small-town-coastal'], lodgingTypes:['great-house','eco-lodge','villa'], minNights:2, maxNights:10 },
    { flag:'🇹🇿', name:'Zanzibar, Tanzania', why:'Spice island with turquoise water, Stone Town history, and dhow sailing at sunset. Africa meets Arabia.', flightCostPerPerson:700, nightlyHotelRate:60, dailyExpensesPerPerson:35, tags:['Beach & Sun','City & Culture','Off the Map','Small Town Charm'], timing:['Summer','Winter Escape',"I'm Flexible"], genre:['beach-pacific','off-the-map-emerging','small-town-coastal'] },
    { flag:'🇬🇷', name:'Thessaloniki, Greece', why:'Greece\'s real food capital, Byzantine walls, waterfront bars, and half the tourists of Athens.', flightCostPerPerson:550, nightlyHotelRate:75, dailyExpensesPerPerson:45, tags:['City & Culture','Beach & Sun'], timing:['Spring Break','Summer','Fall',"I'm Flexible"], genre:['city-coastal','beach-mediterranean'] },
    { flag:'🇯🇴', name:'Petra, Jordan', why:'Rose-red city carved into cliffs, Wadi Rum desert camps, Dead Sea floats. Lawrence of Arabia, for real.', flightCostPerPerson:600, nightlyHotelRate:85, dailyExpensesPerPerson:50, tags:['City & Culture','Nature & Escape','Off the Map'], timing:['Spring Break','Fall',"I'm Flexible"], genre:['nature-desert','off-the-map-extreme','city-historic'], unesco:true, unescoSite:'Petra', unescoYear:1985 },
    { flag:'🇵🇹', name:'Porto, Portugal', why:'Arguably the most beautiful city in Europe. Cheaper than Lisbon, better food, world-famous wine.', flightCostPerPerson:500, nightlyHotelRate:90, dailyExpensesPerPerson:50, tags:['City & Culture','Nature & Escape','Farm & Countryside'], timing:['Spring Break','Summer','Fall',"I'm Flexible"], genre:['city-emerging','city-coastal','farm-wine'], lodgingTypes:['quinta','boutique-hotel','guesthouse'], unesco:true, unescoSite:'Cultural Landscape of Sintra', unescoYear:1995 },
    { flag:'🇪🇸', name:'Seville, Spain', why:'Flamenco courtyards, Moorish palaces, tapas crawls, and the best orange trees you\'ll ever walk under.', flightCostPerPerson:500, nightlyHotelRate:95, dailyExpensesPerPerson:55, tags:['City & Culture'], timing:['Spring Break','Fall',"I'm Flexible"], genre:['city-grand','city-historic'], lodgingTypes:['cave-hotel','parador','boutique-hotel'], unesco:true, unescoSite:'Cathedral, Alcázar and Archivo de Indias in Seville', unescoYear:1987 },
    { flag:'🇪🇸', name:'Valencia, Spain', why:'Las Fallas fireworks, City of Arts and Sciences, paella on the beach where paella was invented.', flightCostPerPerson:500, nightlyHotelRate:90, dailyExpensesPerPerson:50, tags:['City & Culture','Beach & Sun','Family-First'], timing:['Spring Break','Summer','Fall',"I'm Flexible"], genre:['city-coastal','beach-mediterranean','family-cultural'] },
    { flag:'🇧🇪', name:'Bruges, Belgium', why:'Medieval canals, chocolate shops on every corner, horse-drawn carriages, and the best beer on earth. A living fairy tale.', flightCostPerPerson:450, nightlyHotelRate:110, dailyExpensesPerPerson:55, tags:['City & Culture','Small Town Charm'], timing:['Spring Break','Fall','White Christmas',"I'm Flexible"], genre:['city-historic','city-christmas','small-town-historic'], snowProbability:true, christmasVibe:'city-christmas', unesco:true, unescoSite:'Historic Centre of Brugge', unescoYear:2000 },
    { flag:'🇦🇷', name:'Buenos Aires, Argentina', why:'Tango in San Telmo, world-class steak for $20, bookshops in old theaters. Paris of South America, Argentine prices.', flightCostPerPerson:600, nightlyHotelRate:85, dailyExpensesPerPerson:50, tags:['City & Culture'], timing:['Spring Break','Fall',"I'm Flexible"], genre:['city-grand','city-coastal'], majorCity:true },
    { flag:'🇭🇷', name:'Hvar, Croatia', why:'Mediterranean sunshine, clear Adriatic water, ancient stone towns. Still affordable before peak summer.', flightCostPerPerson:550, nightlyHotelRate:100, dailyExpensesPerPerson:55, tags:['Beach & Sun','City & Culture','Small Town Charm'], timing:['Spring Break','Summer',"I'm Flexible"], genre:['beach-mediterranean','small-town-coastal'], nearestParks:['Plitvice Lakes National Park'] },

    // ── UPPER-MID ──
    { flag:'🇰🇷', name:'Seoul, South Korea', why:'K-BBQ alleys, palace grounds, neon nightlife, and the world\'s fastest internet. Futuristic and ancient at once.', flightCostPerPerson:700, nightlyHotelRate:110, dailyExpensesPerPerson:55, tags:['City & Culture','Off the Map'], timing:['Spring Break','Fall',"I'm Flexible"], genre:['city-grand','off-the-map-emerging'], majorCity:true, lodgingTypes:['hanok','pension','resort'] },
    { flag:'🇴🇲', name:'Muscat, Oman', why:'Wadis, frankincense souks, sea turtle beaches, and Arabian hospitality without the Dubai price tag.', flightCostPerPerson:700, nightlyHotelRate:110, dailyExpensesPerPerson:50, tags:['Nature & Escape','City & Culture','Off the Map'], timing:['Fall','Winter Escape',"I'm Flexible"], genre:['nature-desert','city-coastal','off-the-map-emerging'] },
    { flag:'🇪🇸', name:'San Sebastián, Spain', why:'More Michelin stars per capita than Paris. Pintxos bars, surf beach, Basque culture. Worth the splurge.', flightCostPerPerson:500, nightlyHotelRate:130, dailyExpensesPerPerson:70, tags:['City & Culture','Beach & Sun'], timing:['Summer','Fall',"I'm Flexible"], genre:['city-coastal','beach-atlantic'] },
    { flag:'🇫🇷', name:'Colmar, France', why:'Half-timbered houses along canals, Alsatian wine route, Christmas markets that define the genre. A storybook town.', flightCostPerPerson:500, nightlyHotelRate:120, dailyExpensesPerPerson:60, tags:['Small Town Charm','White Christmas','Farm & Countryside'], timing:['Fall','White Christmas',"I'm Flexible"], genre:['small-town-christmas','farm-wine','small-town-arts'], snowProbability:true, christmasVibe:'city-christmas' },
    { flag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', name:'Edinburgh, Scotland', why:'Castle on a volcanic rock, whisky trails, literary pubs, and the Highlands a short drive away.', flightCostPerPerson:500, nightlyHotelRate:140, dailyExpensesPerPerson:65, tags:['City & Culture','Nature & Escape','Family-First'], timing:['Summer','Fall','White Christmas',"I'm Flexible"], genre:['city-grand','city-historic','city-christmas'], snowProbability:true, christmasVibe:'city-christmas' },
    { flag:'🇭🇷', name:'Dubrovnik, Croatia', why:'Walled city above the Adriatic, Game of Thrones filming, island-hopping by ferry. Peak Mediterranean.', flightCostPerPerson:550, nightlyHotelRate:140, dailyExpensesPerPerson:65, tags:['Beach & Sun','City & Culture','Small Town Charm'], timing:['Spring Break','Summer',"I'm Flexible"], genre:['city-historic','beach-mediterranean','small-town-coastal'], nearestParks:['Plitvice Lakes National Park'], unesco:true, unescoSite:'Old City of Dubrovnik', unescoYear:1979 },
    { flag:'🇮🇸', name:'Reykjavik, Iceland', why:'Northern lights, geothermal pools, waterfalls everywhere. Jaw-dropping in winter. Short flight from the East Coast.', flightCostPerPerson:400, nightlyHotelRate:170, dailyExpensesPerPerson:80, tags:['Nature & Escape','Off the Map'], timing:['Winter Escape','White Christmas',"I'm Flexible"], genre:['city-emerging','nature-arctic','nature-christmas'], snowProbability:true, christmasVibe:'nature-christmas', lodgingTypes:['ice-hotel-nearby','guesthouse','boutique-hotel'], nearestParks:['Þingvellir National Park','Vatnajökull National Park'], minNights:5, maxNights:14, unesco:true, unescoSite:'Þingvellir National Park', unescoYear:2004 },
    { flag:'🇧🇷', name:'Rio de Janeiro, Brazil', why:'Carnival, Sugarloaf, Copacabana, samba until sunrise. The world\'s greatest party city with nature to match.', flightCostPerPerson:650, nightlyHotelRate:105, dailyExpensesPerPerson:60, tags:['Beach & Sun','City & Culture'], timing:['Spring Break','Summer','Winter Escape',"I'm Flexible"], genre:['city-grand','beach-atlantic','city-coastal'], majorCity:true },
    { flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', name:'Cotswolds, England', why:'Honey-stone villages, rolling green hills, cozy pubs with fireplaces, and sheep around every bend. Peak English countryside.', flightCostPerPerson:500, nightlyHotelRate:150, dailyExpensesPerPerson:60, tags:['Small Town Charm','Farm & Countryside','Nature & Escape'], timing:['Spring Break','Summer','Fall',"I'm Flexible"], genre:['farm-pastoral','small-town-historic'] },
    { flag:'🇿🇦', name:'Cape Town, South Africa', why:'Table Mountain, penguin colonies, winelands, and two oceans. One of the world\'s great cities, surprisingly affordable.', flightCostPerPerson:800, nightlyHotelRate:120, dailyExpensesPerPerson:55, tags:['City & Culture','Nature & Escape','Beach & Sun','Farm & Countryside'], timing:['Spring Break','Fall',"I'm Flexible"], genre:['city-grand','city-coastal','nature-mountain','farm-wine'], majorCity:true, nearestParks:['Namib-Naukluft National Park'] },
    { flag:'🇫🇷', name:'Provence, France', why:'Lavender fields, rosé vineyards, Roman ruins, village markets with fresh goat cheese. The good life, defined.', flightCostPerPerson:550, nightlyHotelRate:150, dailyExpensesPerPerson:65, tags:['Farm & Countryside','Small Town Charm','City & Culture'], timing:['Spring Break','Summer',"I'm Flexible"], genre:['farm-wine','farm-pastoral','small-town-arts'] },
    { flag:'🇦🇹', name:'Hallstatt, Austria', why:'Mirror lake, Alpine peaks, salt mines, and pastel houses. The tiny village that launched a thousand postcards.', flightCostPerPerson:500, nightlyHotelRate:160, dailyExpensesPerPerson:65, tags:['Small Town Charm','Nature & Escape','White Christmas'], timing:['Summer','Fall','White Christmas',"I'm Flexible"], genre:['small-town-mountain','nature-mountain','nature-christmas'], snowProbability:true, christmasVibe:'nature-christmas' },
    { flag:'🇳🇴', name:'Bergen, Norway', why:'Gateway to the fjords, colorful Bryggen wharf, hiking trails from the city center. Expensive but transcendent.', flightCostPerPerson:500, nightlyHotelRate:180, dailyExpensesPerPerson:80, tags:['Nature & Escape','City & Culture','Small Town Charm'], timing:['Summer',"I'm Flexible"], genre:['city-coastal','nature-coastal','small-town-coastal'] },
    { flag:'🇮🇹', name:'Cinque Terre, Italy', why:'Five candy-colored fishing villages clinging to cliffs above the Ligurian Sea. Hike between them, eat pesto at each stop.', flightCostPerPerson:550, nightlyHotelRate:170, dailyExpensesPerPerson:70, tags:['Small Town Charm','Beach & Sun','Nature & Escape'], timing:['Spring Break','Summer',"I'm Flexible"], genre:['small-town-coastal','beach-mediterranean','nature-coastal'] },
    { flag:'🇰🇪', name:'Masai Mara, Kenya', why:'The Great Migration, big-five safaris, Maasai culture, stargazing with zero light pollution. Bucket list, period.', flightCostPerPerson:800, nightlyHotelRate:200, dailyExpensesPerPerson:70, tags:['Nature & Escape','Off the Map'], timing:['Summer','Fall',"I'm Flexible"], genre:['nature-wildlife','off-the-map-extreme'] },
    { flag:'🇳🇴', name:'Lofoten Islands, Norway', why:'Arctic fishing villages, midnight sun, northern lights, and dramatic peaks rising from the sea. Norway\'s crown jewel.', flightCostPerPerson:600, nightlyHotelRate:190, dailyExpensesPerPerson:80, tags:['Nature & Escape','Off the Map','Small Town Charm'], timing:['Summer','Winter Escape',"I'm Flexible"], genre:['nature-arctic','off-the-map-remote','small-town-coastal'] },
    { flag:'🇮🇹', name:'Tuscany, Italy', why:'Cypress-lined roads, Chianti vineyards, Renaissance hilltop towns, and farm-to-table dinners under the stars.', flightCostPerPerson:550, nightlyHotelRate:190, dailyExpensesPerPerson:75, tags:['Farm & Countryside','Small Town Charm','City & Culture'], timing:['Spring Break','Summer','Fall',"I'm Flexible"], genre:['farm-wine','farm-pastoral','city-historic'] },

    // ── PREMIUM ──
    { flag:'🇬🇷', name:'Santorini, Greece', why:'Whitewashed cliffs over a volcanic caldera, legendary sunsets, wine from vines older than most countries.', flightCostPerPerson:600, nightlyHotelRate:230, dailyExpensesPerPerson:85, tags:['Beach & Sun','City & Culture','Small Town Charm'], timing:['Spring Break','Summer',"I'm Flexible"], genre:['beach-mediterranean','small-town-coastal','city-historic'] },
    { flag:'🇯🇵', name:'Kyoto, Japan', why:'Bamboo groves, thousand-gate shrines, geisha district, kaiseki dinners. Japan\'s spiritual heart.', flightCostPerPerson:800, nightlyHotelRate:190, dailyExpensesPerPerson:80, tags:['City & Culture','Nature & Escape'], timing:['Spring Break','Fall',"I'm Flexible"], genre:['city-grand','city-historic','off-the-map-spiritual'], lodgingTypes:['ryokan','machiya-townhouse','capsule-hotel'], nearestParks:['Shiretoko National Park','Daisetsuzan National Park'], minNights:6, maxNights:21, unesco:true, unescoSite:'Historic Monuments of Ancient Kyoto', unescoYear:1994 },
    { flag:'🇫🇷', name:'French Riviera, France', why:'Azure coast, hilltop villages, Matisse museums, rosé on the beach. Glamorous but the back roads are affordable.', flightCostPerPerson:550, nightlyHotelRate:230, dailyExpensesPerPerson:90, tags:['Beach & Sun','City & Culture'], timing:['Summer','Spring Break',"I'm Flexible"], genre:['beach-mediterranean','city-coastal'] },
    { flag:'🇯🇵', name:'Tokyo, Japan', why:'Neon-lit streets, Michelin-star ramen for $10, ancient temples minutes from Shibuya Crossing.', flightCostPerPerson:850, nightlyHotelRate:210, dailyExpensesPerPerson:100, tags:['City & Culture','Off the Map'], timing:['Spring Break','Fall','White Christmas',"I'm Flexible"], genre:['city-grand','off-the-map-emerging'], majorCity:true, lodgingTypes:['ryokan','machiya-townhouse','capsule-hotel'], minNights:6, maxNights:21 },
    { flag:'🇮🇹', name:'Amalfi Coast, Italy', why:'Cliffside villages, limoncello with a view, and the best pasta you will ever eat. Worth every cent.', flightCostPerPerson:600, nightlyHotelRate:300, dailyExpensesPerPerson:100, tags:['Beach & Sun','City & Culture','Small Town Charm'], timing:['Spring Break','Summer',"I'm Flexible"], genre:['beach-mediterranean','small-town-coastal','city-historic'], unesco:true, unescoSite:'Costiera Amalfitana', unescoYear:1997 },
    { flag:'🇦🇷', name:'Patagonia, Argentina', why:'End-of-the-world glaciers, epic hiking, estancia stays. Remote, dramatic, unforgettable.', flightCostPerPerson:900, nightlyHotelRate:230, dailyExpensesPerPerson:90, tags:['Nature & Escape','Off the Map','Farm & Countryside'], timing:['Fall','Winter Escape',"I'm Flexible"], genre:['nature-mountain','off-the-map-extreme','nature-wildlife'], nearestParks:['Parque Nacional Los Glaciares','Torres del Paine National Park'], minNights:7, maxNights:21 },
    { flag:'🇫🇮', name:'Lapland, Finland', why:'Northern lights from a glass igloo, reindeer safaris, Santa Claus Village. Winter wonderland turned real.', flightCostPerPerson:600, nightlyHotelRate:300, dailyExpensesPerPerson:95, tags:['Nature & Escape','White Christmas','Family-First'], timing:['White Christmas','Winter Escape',"I'm Flexible"], genre:['nature-arctic','nature-christmas','family-adventure'], snowProbability:true, christmasVibe:'nature-christmas', lodgingTypes:['glass-igloo','log-cabin','arctic-resort'], minNights:6, maxNights:14 },
    { flag:'🇨🇭', name:'Swiss Alps, Switzerland', why:'Staggering mountain scenery, world-class skiing, chocolate and fondue in a chalet. A splurge that delivers.', flightCostPerPerson:600, nightlyHotelRate:340, dailyExpensesPerPerson:130, tags:['Nature & Escape','White Christmas','Small Town Charm'], timing:['Winter Escape','White Christmas','Summer',"I'm Flexible"], genre:['nature-mountain','nature-christmas','small-town-mountain'], snowProbability:true, christmasVibe:'nature-christmas' },
    { flag:'🇳🇿', name:'Queenstown, New Zealand', why:'Bungee jumping, fjord cruises, Lord of the Rings landscapes, and the world\'s best adventure town.', flightCostPerPerson:1100, nightlyHotelRate:260, dailyExpensesPerPerson:90, tags:['Nature & Escape','Family-First'], timing:['Summer','Fall',"I'm Flexible"], genre:['nature-mountain','family-adventure','nature-coastal'], nearestParks:['Milford Sound / Fiordland','Mount Aspiring NP'], minNights:8, maxNights:21 },
    { flag:'🇪🇨', name:'Galápagos, Ecuador', why:'Swim with sea lions, walk among giant tortoises, see blue-footed boobies. Evolution\'s living laboratory.', flightCostPerPerson:700, nightlyHotelRate:380, dailyExpensesPerPerson:100, tags:['Nature & Escape','Off the Map'], timing:['Summer','Fall',"I'm Flexible"], genre:['nature-wildlife','off-the-map-extreme','beach-pacific'], nearestParks:['Parque Nacional Galápagos'], minNights:5, maxNights:14 },

    // ── UNESCO TIER 2 ──
    { flag:'🇲🇽', name:'Chichén Itzá, Mexico', why:'The most visited Maya ruin and one of the New Seven Wonders. Pair with Mérida for the best food in Mexico.', flightCostPerPerson:350, nightlyHotelRate:100, dailyExpensesPerPerson:40, tags:['City & Culture','Off the Map','Nature & Escape'], timing:['Spring Break','Fall','Winter Escape',"I'm Flexible"], genre:['city-historic','off-the-map-spiritual'], minNights:5, maxNights:10, unesco:true, unescoSite:'Pre-Hispanic City of Chichen-Itza', unescoYear:1988 },
    { flag:'🇦🇷', name:'Iguazú Falls, Argentina', why:'275 waterfalls in a 2km arc. Eleanor Roosevelt said "Poor Niagara." Do both the Argentina and Brazil sides.', flightCostPerPerson:700, nightlyHotelRate:130, dailyExpensesPerPerson:50, tags:['Nature & Escape','Off the Map'], timing:['Spring Break','Fall','Summer',"I'm Flexible"], genre:['nature-coastal','off-the-map-extreme'], minNights:3, maxNights:5, unesco:true, unescoSite:'Iguazu National Park', unescoYear:1984 },
    { flag:'🇪🇸', name:'Granada, Spain', why:'The Alhambra is arguably the most beautiful building on Earth. Tapas are free with every drink. Snow on the Sierra Nevada behind it.', flightCostPerPerson:650, nightlyHotelRate:110, dailyExpensesPerPerson:50, tags:['City & Culture','Off the Map'], timing:['Spring Break','Fall',"I'm Flexible"], genre:['city-historic','city-grand'], minNights:4, maxNights:7, unesco:true, unescoSite:'Alhambra, Generalife and Albayzín, Granada', unescoYear:1984 },
    { flag:'🇨🇿', name:'Prague, Czech Republic', why:'One of Europe\'s most architecturally dense cities. Christmas market on Old Town Square, $2 beer, the Charles Bridge at dawn.', flightCostPerPerson:600, nightlyHotelRate:100, dailyExpensesPerPerson:50, tags:['City & Culture','White Christmas'], timing:['Spring Break','Fall','White Christmas',"I'm Flexible"], genre:['city-grand','city-historic','city-christmas'], snowProbability:true, christmasVibe:'city-christmas', minNights:4, maxNights:7, unesco:true, unescoSite:'Historic Centre of Prague', unescoYear:1992 },
    { flag:'🇲🇦', name:'Fez, Morocco', why:'The world\'s largest living medieval city — 9,000 alleys, no cars, the Chouara tanneries, the oldest university on earth.', flightCostPerPerson:550, nightlyHotelRate:80, dailyExpensesPerPerson:35, tags:['City & Culture','Off the Map'], timing:['Spring Break','Fall',"I'm Flexible"], genre:['city-historic','off-the-map-emerging'], lodgingTypes:['riad','kasbah','boutique-hotel'], minNights:3, maxNights:6, unesco:true, unescoSite:'Medina of Fez', unescoYear:1981 },
    { flag:'🇿🇲', name:'Victoria Falls, Zambia', why:'The largest curtain of falling water on Earth — 1.7km wide. Combine with a Botswana Chobe safari.', flightCostPerPerson:1200, nightlyHotelRate:150, dailyExpensesPerPerson:80, tags:['Nature & Escape','Off the Map'], timing:['Summer','Fall',"I'm Flexible"], genre:['nature-wildlife','off-the-map-extreme'], minNights:4, maxNights:8, unesco:true, unescoSite:'Mosi-oa-Tunya / Victoria Falls', unescoYear:1989 },
    { flag:'🇲🇲', name:'Bagan, Myanmar', why:'3,500 Buddhist temples on a plain, visible from hot air balloons at sunrise. One of the most otherworldly landscapes in Asia.', flightCostPerPerson:1000, nightlyHotelRate:80, dailyExpensesPerPerson:30, tags:['Nature & Escape','Off the Map'], timing:['Winter Escape','Fall',"I'm Flexible"], genre:['off-the-map-spiritual','off-the-map-extreme'], minNights:3, maxNights:5, unesco:true, unescoSite:'Ancient City of Bagan', unescoYear:2019 },
    { flag:'🇻🇳', name:'Ha Long Bay, Vietnam', why:'1,600 limestone islands emerging from emerald water. Overnight on a junk boat through caves and floating villages.', flightCostPerPerson:600, nightlyHotelRate:90, dailyExpensesPerPerson:35, tags:['Nature & Escape','Off the Map','Beach & Sun'], timing:['Spring Break','Fall','Winter Escape',"I'm Flexible"], genre:['nature-coastal','off-the-map-emerging'], minNights:5, maxNights:10, unesco:true, unescoSite:'Ha Long Bay', unescoYear:1994 },
    { flag:'🇹🇿', name:'Serengeti, Tanzania', why:'The Great Migration — 1.5 million wildebeest. The most spectacular wildlife event on Earth. Combine with Ngorongoro Crater and Zanzibar.', flightCostPerPerson:1100, nightlyHotelRate:300, dailyExpensesPerPerson:100, tags:['Nature & Escape','Off the Map'], timing:['Summer','Fall',"I'm Flexible"], genre:['nature-wildlife','off-the-map-extreme'], minNights:7, maxNights:14, unesco:true, unescoSite:'Serengeti National Park', unescoYear:1981 },
    { flag:'🇦🇺', name:'Uluru, Australia', why:'The most sacred site of the Anangu people. Uluru at sunrise changes from ochre to deep red to violet. Field of Light art installation nearby.', flightCostPerPerson:1300, nightlyHotelRate:200, dailyExpensesPerPerson:80, tags:['Nature & Escape','Off the Map'], timing:['Spring Break','Fall',"I'm Flexible"], genre:['nature-desert','off-the-map-spiritual','off-the-map-extreme'], minNights:3, maxNights:5, unesco:true, unescoSite:'Uluru-Kata Tjuta National Park', unescoYear:1987 },

    // ── LUXURY ──
    { flag:'🇲🇻', name:'Maldives', why:'Overwater villas, bioluminescent beaches, reef snorkeling from your room. The ultimate beach splurge.', flightCostPerPerson:1200, nightlyHotelRate:550, dailyExpensesPerPerson:100, tags:['Beach & Sun','Nature & Escape'], timing:['Winter Escape','Spring Break',"I'm Flexible"], genre:['beach-pacific','nature-coastal'] },
    { flag:'🇵🇫', name:'Bora Bora, French Polynesia', why:'Mount Otemanu, glass-floor bungalows, lagoon so blue it looks fake. The postcard destination that actually delivers.', flightCostPerPerson:1500, nightlyHotelRate:650, dailyExpensesPerPerson:120, tags:['Beach & Sun','Nature & Escape'], timing:['Summer','Winter Escape',"I'm Flexible"], genre:['beach-pacific','nature-coastal'] },
];

// ── /api/destinations — full combined dataset for admin tool ──
app.get('/api/destinations', (req, res) => {
  const corridors = CORRIDORS.map(d => ({ ...d, source: 'corridor' }));
  const xmasTowns = CHRISTMAS_TOWNS.map(d => ({ ...d, source: 'christmas-town' }));
  const unesco = UNESCO_TIER2.map(d => ({ ...d, source: 'unesco-tier2' }));
  const domestic = DOMESTIC_TOWNS.map(d => ({ ...d, source: 'domestic-town' }));
  const master = MASTER_DESTINATIONS.map(d => ({ ...d, source: d.source?.[0] || 'master' }));
  const all = [...master, ...corridors, ...xmasTowns, ...unesco, ...domestic];
  res.json({ count: all.length, destinations: all });
});

// ── /api/search — full trip search ──
app.post('/api/search', async (req, res) => {
  const { origin, budget, timing, adults, children, nights, rooms, vibes, genres, tripDays: rawTripDays } = req.body;

  const destinations = MASTER_DESTINATIONS;

  const totalAdults = parseInt(adults) || 2;
  const totalPeople = totalAdults + (parseInt(children) || 0);
  const budgetNum = parseFloat(budget) || 3500;
  const nightsNum = parseInt(nights) || 7;
  const roomsNum = parseInt(rooms) || Math.ceil(totalAdults / 2);
  const tripDaysNum = parseInt(rawTripDays) || 8;
  const vibesArr = vibes || [];
  const originCode = resolveIATA(origin);

  // Implied nightly hotel rate based on user's budget
  const impliedNightlyRate = (budgetNum * 0.45) / nightsNum / roomsNum;
  const userTier = getQualityTier(impliedNightlyRate);

  const isWhiteChristmas = timing === 'White Christmas';
  const genresArr = genres || [];

  // ── Vibe name normalization for hardExclude ──
  const vibeNorm = vibesArr.length > 0 ? vibesArr[0] : null;
  const vibeKey =
    vibeNorm === 'City & Culture' ? 'city-culture' :
    vibeNorm === 'Beach & Sun' ? 'beach-sun' :
    vibeNorm === 'Nature & Escape' ? 'nature-escape' :
    vibeNorm === 'Small Town Charm' ? 'small-town' :
    vibeNorm === 'Farm & Countryside' ? 'farm-countryside' :
    vibeNorm === 'Family-First' ? 'family-first' :
    vibeNorm === 'Off the Map' ? 'off-the-map' :
    isWhiteChristmas ? 'white-christmas' : null;

  // ── Hard Exclude — binary filter, runs before scoring ──
  function hardExclude(d) {
    // White Christmas rules
    if (isWhiteChristmas || vibeKey === 'white-christmas') {
      if (!d.snowProbability && !d.christmasVibe) return true;
      const tropicalTags = ['beach','tropical','caribbean','snorkeling','reef','rainforest','surf','palm trees','coral'];
      if (d.tags && d.tags.some(t => tropicalTags.includes(t.toLowerCase()))) return true;
    }
    // Beach & Sun rules
    if (vibeKey === 'beach-sun') {
      const beachGenres = ['beach-caribbean','beach-pacific','beach-mediterranean','beach-atlantic','beach-gulf'];
      if (!d.genre || !d.genre.some(g => beachGenres.includes(g))) return true;
    }
    // Nature & Escape rules
    if (vibeKey === 'nature-escape') {
      const natureGenres = ['nature-mountain','nature-wildlife','nature-jungle','nature-coastal','nature-desert','nature-arctic','nature-christmas','small-town-mountain'];
      if (!d.genre || !d.genre.some(g => natureGenres.includes(g))) return true;
    }
    // Small Town Charm rules
    if (vibeKey === 'small-town') {
      if (d.genre && d.genre.includes('city-grand')) return true;
      if (d.majorCity === true) return true;
    }
    // City & Culture rules
    if (vibeKey === 'city-culture') {
      const cityGenres = ['city-grand','city-historic','city-emerging','city-coastal','city-christmas'];
      if (!d.genre || !d.genre.some(g => cityGenres.includes(g))) return true;
    }
    // Farm & Countryside rules
    if (vibeKey === 'farm-countryside') {
      const farmGenres = ['farm-wine','farm-working','farm-pastoral'];
      if (!d.genre || !d.genre.some(g => farmGenres.includes(g))) return true;
    }
    // Genre sub-filter (if user selected specific genres)
    if (genresArr.length > 0) {
      if (!d.genre || !d.genre.some(g => genresArr.includes(g))) return true;
    }
    return false;
  }

  // ── Origin-aware White Christmas scoring ──
  function getOriginRegion(code) {
    if (!code) return 'other';
    const west = ['LAX','SFO','SEA','PDX','SAN','SJC','SMF','RNO','LAS','PHX'];
    const mtn  = ['DEN','SLC','BOI','BZN','GEG','FAT'];
    const mw   = ['ORD','MDW','MSP','DTW','MCI','STL','CLE','CMH'];
    const se   = ['ATL','MIA','FLL','MCO','TPA','CLT','BNA','MSY'];
    const ne   = ['JFK','LGA','EWR','BOS','PHL','DCA','IAD','BWI','ABE','ACY'];
    if (west.includes(code)) return 'west';
    if (mtn.includes(code))  return 'mountain';
    if (mw.includes(code))   return 'midwest';
    if (se.includes(code))   return 'southeast';
    if (ne.includes(code))   return 'northeast';
    return 'other';
  }
  const originRegion = getOriginRegion(originCode);
  const XMAS_ORIGIN_BOOST = {
    west:      { boost: ['JAC','BZN','FCA','YYC','ASE','FLG','SGU'], penalty: ['YZF','YXY','FAI'] },
    mountain:  { boost: ['YYC','KEF','HEL','YZF','PRG'], penalty: [] },
    midwest:   { boost: ['YQB','PRG','YYC'], penalty: ['YZF','YXY'] },
    southeast: { boost: ['KEF','HEL','PRG','YQB','YZF'], penalty: [] },
    northeast: { boost: ['YQB','PRG','EDI'], penalty: [] },
  };

  // Score destinations
  const scored = destinations.flatMap(d => {
    // Hard exclude filter (replaces the old snowProbability-only check)
    if (hardExclude(d)) return [];

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

    const midRate = getHotelRate(d.name, d.nightlyHotelRate);
    const recommendedRate = getTieredRate(midRate, userTier);
    const recommendedTier = userTier;
    const estimatedCost =
      (effectiveFlightCost * totalPeople) +
      (recommendedRate * nightsNum * roomsNum) +
      (d.dailyExpensesPerPerson * nightsNum * totalPeople);

    // Quality match — filter destinations whose mid-rate is far from implied rate
    // Skip filter for White Christmas — we want to mix budget levels (domestic towns + intl snow cities)
    const rateRatio = midRate / impliedNightlyRate;
    const rateDiff = Math.abs(rateRatio - 1);
    if (!isWhiteChristmas) {
      if (rateDiff > 0.5) return []; // skip destinations >50% off from implied rate
    }
    if (rateDiff <= 0.25) score += 20;
    else if (rateDiff <= 0.5) score += 10;

    // Budget fit — hard 5% over-budget cap, 85-100% sweet spot
    const ratio = estimatedCost / budgetNum;
    let budgetWarning = null;
    if (ratio > 1.05) {
      return []; // hard cap: filter out anything >5% over budget
    } else if (ratio > 1.0) {
      score += 5;
      budgetWarning = `~${Math.round((ratio - 1.0) * 100)}% over budget`;
    } else if (ratio >= 0.85) {
      score += 30; // sweet spot
    } else if (ratio >= 0.70) {
      score += 15;
    } else if (ratio >= 0.55) {
      score += 8; // too cheap — consider tier upgrade
    } else {
      score += 2; // mismatch
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

    // Nights-fit scoring — penalize if trip length doesn't match destination
    const destMinNights = d.minNights || (travelHours > 8 ? 6 : 3);
    const destMaxNights = d.maxNights || (travelHours > 8 ? 21 : 14);
    let nightsWarning = null;
    if (nightsNum < destMinNights) {
      score -= 25;
      nightsWarning = `Best with ${destMinNights}+ nights`;
    } else if (nightsNum > destMaxNights) {
      score -= 10;
    }

    // UNESCO boost — reward destinations with verified UNESCO sites
    let unescoLabel = null;
    if (d.unesco === true) {
      score += 10;
      unescoLabel = d.unescoSite || 'UNESCO World Heritage Site';
    }

    // Genre match bonus — reward destinations matching user-selected genres
    let matchedGenre = null;
    if (genresArr.length > 0 && d.genre) {
      const matches = d.genre.filter(g => genresArr.includes(g));
      score += matches.length * 20;
      matchedGenre = matches[0] || null;
    } else if (d.genre && d.genre.length > 0) {
      matchedGenre = d.genre[0]; // show most distinctive genre
    }

    // Origin-aware White Christmas scoring
    if (isWhiteChristmas && originRegion !== 'other') {
      const destCode = destinationIATA[d.name];
      const boosts = XMAS_ORIGIN_BOOST[originRegion];
      if (boosts) {
        if (boosts.boost.includes(destCode)) score += 20;
        if (boosts.penalty.includes(destCode)) score -= 25;
      }
    }

    const flightCostTotal = effectiveFlightCost * totalPeople;
    const hotelCostTotal = recommendedRate * nightsNum * roomsNum;
    const expensesCostTotal = d.dailyExpensesPerPerson * nightsNum * totalPeople;

    return [{ ...d, score, estimatedCost, hopRoute, travelWarning, budgetWarning, nightsWarning, recommendedTier, recommendedRate, travelHours, flightCostTotal, hotelCostTotal, expensesCostTotal, unesco: d.unesco || false, unescoLabel, matchedGenre }];
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

      const domesticMidRate = t.nightlyHotelRate;
      const domesticRecommendedRate = getTieredRate(domesticMidRate, userTier);
      const estimatedCost =
        (flightCostPerPerson * totalPeople) +
        (domesticRecommendedRate * nightsNum * roomsNum) +
        (t.dailyExpensesPerPerson * nightsNum * totalPeople);

      // Budget fit — hard 5% over-budget cap, 85-100% sweet spot
      const ratio = estimatedCost / budgetNum;
      let budgetWarning = null;
      if (ratio > 1.05) {
        return null; // hard cap: filter out
      } else if (ratio > 1.0) {
        score += 5;
        budgetWarning = `~${Math.round((ratio - 1.0) * 100)}% over budget`;
      } else if (ratio >= 0.85) {
        score += 30;
      } else if (ratio >= 0.70) {
        score += 15;
      } else if (ratio >= 0.55) {
        score += 8;
      } else {
        score += 2;
      }

      // Nights-fit scoring for domestic
      const domMinNights = t.minNights || 2;
      const domMaxNights = t.maxNights || 10;
      let nightsWarning = null;
      if (nightsNum < domMinNights) {
        score -= 25;
        nightsWarning = `Best with ${domMinNights}+ nights`;
      } else if (nightsNum > domMaxNights) {
        score -= 10;
      }

      // Vibe match
      const vibeMatches = vibesArr.filter(v =>
        t.vibe && t.vibe.some(tv => tv.includes(v) || v.includes(tv.replace(/[^a-zA-Z ]/g,'').trim()))
      ).length;
      score += vibeMatches * 20;

      // Domestic bonus — short travel, no passport
      score += 10;

      const domFlightCostTotal = flightCostPerPerson * totalPeople;
      const domHotelCostTotal = domesticRecommendedRate * nightsNum * roomsNum;
      const domExpensesCostTotal = t.dailyExpensesPerPerson * nightsNum * totalPeople;

      return {
        ...t,
        score,
        estimatedCost,
        flightCostPerPerson,
        budgetWarning,
        nightsWarning,
        domestic: true,
        recommendedTier: userTier,
        recommendedRate: domesticRecommendedRate,
        lodgingTypes: t.lodgingTypes || ['vacation-rental', 'bed-and-breakfast', 'motel'],
        travelHours: 3,
        flightCostTotal: domFlightCostTotal,
        hotelCostTotal: domHotelCostTotal,
        expensesCostTotal: domExpensesCostTotal,
      };
    });

    scored.push(...domesticScored.filter(Boolean));
  }

  // ── Christmas towns (when White Christmas selected) ──
  if (isWhiteChristmas) {
    // Determine flight cost region from origin
    const neAirports = new Set(['JFK','EWR','LGA','PHL','BOS','DCA','IAD','BWI','ABE','ACY','BDL','ALB','BTV','PWM','MHT','ISP','SWF','HPN','PIT','BUF','SYR','ROC','PHL']);
    const seAirports = new Set(['ATL','CLT','MIA','MCO','TPA','FLL','PBI','JAX','SAV','CHS','RDU','GSO','RIC','ORF','MEM','BHM','HSV','SDF','LEX','MYR','PNS','MOB','JAN','SHV','TLH','RSW','SRQ','BNA','MSY']);
    const mwAirports = new Set(['ORD','MDW','DTW','MSP','MKE','CMH','IND','CVG','CLE','STL','MCI','OMA','DSM','FSD','FAR','BIS','RAP']);
    function getXmasFlightCost(town) {
      if (!originCode) return 220;
      // Check if origin airport is near the town's nearest airport
      if (town.nearestAirport && town.nearestAirport.toUpperCase().includes(originCode)) return 150;
      if (neAirports.has(originCode)) return 180;
      if (seAirports.has(originCode)) return 220;
      if (mwAirports.has(originCode)) return 200;
      return 280; // West
    }

    const xmasScored = CHRISTMAS_TOWNS.map(town => {
      // Genre sub-filter for Christmas towns
      if (genresArr.length > 0) {
        if (!town.genre || !town.genre.some(g => genresArr.includes(g))) return null;
      }

      let score = 0;
      const flightCostPerPerson = getXmasFlightCost(town);
      const dailyExpensesPerPerson = 50;
      const recommendedRate = getTieredRate(town.nightlyMid, userTier);
      const estimatedCost =
        (flightCostPerPerson * totalPeople) +
        (recommendedRate * nightsNum * roomsNum) +
        (dailyExpensesPerPerson * nightsNum * totalPeople);

      // Budget fit — same logic
      const ratio = estimatedCost / budgetNum;
      let budgetWarning = null;
      if (ratio > 1.05) return null;
      else if (ratio > 1.0) { score += 5; budgetWarning = `~${Math.round((ratio - 1.0) * 100)}% over budget`; }
      else if (ratio >= 0.85) score += 30;
      else if (ratio >= 0.70) score += 15;
      else if (ratio >= 0.55) score += 8;
      else score += 2;

      // Snow reliability bonus
      if (town.snowReliability === 'guaranteed') score += 15;
      else if (town.snowReliability === 'high') score += 10;
      else if (town.snowReliability === 'moderate') score += 5;

      // White Christmas timing boost
      score += 15;

      // Domestic bonus
      score += 10;

      // Genre match bonus for Christmas towns
      let xmasMatchedGenre = town.christmasVibe || (town.genre ? town.genre[0] : null);
      if (genresArr.length > 0 && town.genre) {
        const matches = town.genre.filter(g => genresArr.includes(g));
        score += matches.length * 20;
        if (matches.length > 0) xmasMatchedGenre = matches[0];
      }

      // Origin-aware boost for Christmas towns
      if (originRegion !== 'other') {
        const nearestCode = town.nearestAirport ? town.nearestAirport.match(/[A-Z]{3}/)?.[0] : null;
        const boosts = XMAS_ORIGIN_BOOST[originRegion];
        if (boosts && nearestCode) {
          if (boosts.boost.includes(nearestCode)) score += 20;
          if (boosts.penalty.includes(nearestCode)) score -= 25;
        }
      }

      const flightCostTotal = flightCostPerPerson * totalPeople;
      const hotelCostTotal = recommendedRate * nightsNum * roomsNum;
      const expensesCostTotal = dailyExpensesPerPerson * nightsNum * totalPeople;

      return {
        flag: town.country === 'Canada' ? '🇨🇦' : '🇺🇸',
        name: `${town.name}, ${town.state}`,
        why: town.notes,
        vibe: town.vibe,
        score,
        estimatedCost,
        budgetWarning,
        christmasTown: true,
        snowReliability: town.snowReliability,
        trainTown: town.trainTown || false,
        domestic: true,
        recommendedTier: userTier,
        recommendedRate,
        dailyExpensesPerPerson,
        travelHours: 3,
        flightCostTotal,
        hotelCostTotal,
        expensesCostTotal,
        tags: town.tags || [],
        genre: town.genre || [],
        matchedGenre: xmasMatchedGenre,
      };
    });

    scored.push(...xmasScored.filter(Boolean));
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
      const passengers = Array.from({ length: Math.min(totalPeople, 9) }, () => ({ type: 'adult' }));
      const offerReq = await duffel.offerRequests.create({
        slices: [
          { origin: originCode, destination: searchDestCode, departure_date: dates.departure },
          { origin: searchDestCode, destination: originCode, departure_date: dates.return },
        ],
        passengers,
        cabin_class: 'economy',
      });
      const offers = offerReq.data?.offers || [];
      const cheapest = offers.length > 0
        ? offers.reduce((min, o) => parseFloat(o.total_amount) < parseFloat(min.total_amount) ? o : min)
        : null;
      const flightPrice = cheapest ? parseFloat(cheapest.total_amount) : null;
      // Add round-trip ground transport cost when using a hop route
      const totalFlightCost = (flightPrice && d.hopRoute)
        ? flightPrice + (d.hopRoute.groundCost * 2 * totalPeople)
        : flightPrice;
      const hotelEstimate = d.recommendedRate * nightsNum * roomsNum;
      const mealsEstimate = d.dailyExpensesPerPerson * totalPeople * nightsNum;
      const totalEstimate = totalFlightCost
        ? Math.round(totalFlightCost + hotelEstimate + mealsEstimate)
        : d.estimatedCost;
      // Update breakdown if live flight price available
      const liveFlightCostTotal = totalFlightCost || d.flightCostTotal;
      return { ...d, flightPrice: totalFlightCost, totalEstimate, dates, flightCostTotal: liveFlightCostTotal, hotelCostTotal: hotelEstimate, expensesCostTotal: mealsEstimate };
    } catch {
      return { ...d, flightPrice: null, totalEstimate: d.estimatedCost };
    }
  }));

  res.json({ results, origin: originCode, isWhiteChristmas });
});

app.listen(PORT, () => {
  console.log(`Go Elsewhere server running on http://localhost:${PORT}`);
});
