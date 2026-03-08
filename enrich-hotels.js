#!/usr/bin/env node
require('dotenv').config();
const Amadeus = require('amadeus');
const fs = require('fs');

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY,
  clientSecret: process.env.AMADEUS_API_SECRET
});

// ── Extract destinationIATA from server.js ──
const serverSrc = fs.readFileSync('./server.js', 'utf8');
const iataBlock = serverSrc.match(/const destinationIATA = \{([\s\S]*?)\};/);
if (!iataBlock) {
  console.error('Could not find destinationIATA in server.js');
  process.exit(1);
}
// Convert to valid JS object — the block uses single quotes and special chars
const destinationIATA = eval('({' + iataBlock[1] + '})');

// ── Airport → city code overrides (where they differ) ──
const cityCodeOverrides = {
  NRT: 'TYO',  // Narita → Tokyo
  KIX: 'OSA',  // Kansai → Osaka (nearest city code for Kyoto)
  EZE: 'BUE',  // Ezeiza → Buenos Aires
  GIG: 'RIO',  // Galeão → Rio de Janeiro
  ICN: 'SEL',  // Incheon → Seoul
};

// ── Currency conversion to USD (approximate rates) ──
const toUSD = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  COP: 0.00024,  // Colombian Peso
  INR: 0.012,    // Indian Rupee
  JOD: 1.41,     // Jordanian Dinar
  JPY: 0.0067,   // Japanese Yen
  KRW: 0.00075,  // Korean Won
  MAD: 0.10,     // Moroccan Dirham
  MXN: 0.058,    // Mexican Peso
  NOK: 0.095,    // Norwegian Krone
  NZD: 0.61,     // New Zealand Dollar
  OMR: 2.60,     // Omani Rial
  PLN: 0.25,     // Polish Zloty
  THB: 0.029,    // Thai Baht
  VND: 0.000041, // Vietnamese Dong
  XPF: 0.0091,   // CFP Franc
  ZAR: 0.055,    // South African Rand
  BRL: 0.18,     // Brazilian Real
  GEL: 0.37,     // Georgian Lari
  TRY: 0.031,    // Turkish Lira
  ISK: 0.0072,   // Icelandic Króna
  HRK: 0.14,     // Croatian Kuna
  HUF: 0.0027,   // Hungarian Forint
  RON: 0.22,     // Romanian Leu
  LKR: 0.0033,   // Sri Lankan Rupee
  KHR: 0.00025,  // Cambodian Riel
  IDR: 0.000063, // Indonesian Rupiah
  PHP: 0.018,    // Philippine Peso
  LAK: 0.000046, // Lao Kip
  MVR: 0.065,    // Maldivian Rufiyaa
  CHF: 1.13,     // Swiss Franc
  SEK: 0.097,    // Swedish Krona
  DKK: 0.145,    // Danish Krone
  CAD: 0.74,     // Canadian Dollar
  ARS: 0.001,    // Argentine Peso
  PEN: 0.27,     // Peruvian Sol
  BOB: 0.14,     // Bolivian Boliviano
  EGP: 0.020,    // Egyptian Pound
  KES: 0.0077,   // Kenyan Shilling
  TZS: 0.00039,  // Tanzanian Shilling
};

function convertToUSD(amount, currency) {
  const rate = toUSD[currency];
  if (rate) return Math.round(amount * rate * 100) / 100;
  // Unknown currency — return as-is and flag it
  console.warn(`    ⚠ Unknown currency: ${currency}, cannot convert ${amount}`);
  return amount;
}

// ── Helpers ──
const delay = ms => new Promise(r => setTimeout(r, ms));

function median(arr) {
  if (arr.length === 0) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Check-in 60 days from now, 1-night stay
const checkIn = new Date();
checkIn.setDate(checkIn.getDate() + 60);
const checkInDate = checkIn.toISOString().split('T')[0];
const checkOut = new Date(checkIn);
checkOut.setDate(checkOut.getDate() + 1);
const checkOutDate = checkOut.toISOString().split('T')[0];

async function fetchHotelData(destName, airportCode) {
  const cityCode = cityCodeOverrides[airportCode] || airportCode;

  // Step 1: Hotel List API
  const listRes = await amadeus.referenceData.locations.hotels.byCity.get({
    cityCode,
  });
  const hotelList = listRes.data || [];
  if (hotelList.length === 0) {
    return { cityCode, airportCode, hotels: [], medianRate: null, note: 'No hotels in city list' };
  }

  // Take up to 20 hotel IDs to search (API allows up to 50)
  const hotelIds = hotelList.slice(0, 20).map(h => h.hotelId).join(',');

  await delay(500);

  // Step 2: Hotel Search API
  const offersRes = await amadeus.shopping.hotelOffersSearch.get({
    hotelIds,
    checkInDate,
    checkOutDate,
    adults: 2,
    currency: 'USD',
  });
  const offersData = offersRes.data || [];

  // Extract nightly rates from all returned offers, converting to USD
  const allRates = [];
  for (const hotel of offersData) {
    const offer = hotel.offers?.[0];
    if (offer?.price?.total) {
      const originalCurrency = offer.price.currency || 'USD';
      const originalRate = parseFloat(offer.price.total);
      const rateUSD = convertToUSD(originalRate, originalCurrency);
      allRates.push({
        hotelId: hotel.hotel?.hotelId,
        name: hotel.hotel?.name,
        rateUSD,
        originalRate,
        originalCurrency,
      });
    }
  }

  // Sort by USD rate ascending, take 5 cheapest
  allRates.sort((a, b) => a.rateUSD - b.rateUSD);
  const cheapest5 = allRates.slice(0, 5);
  const usdRates = cheapest5.map(h => h.rateUSD);
  const medianRate = usdRates.length > 0 ? Math.round(median(usdRates)) : null;

  return { cityCode, airportCode, hotels: cheapest5, medianRate };
}

async function main() {
  console.log(`\nAmadeus Hotel Enrichment`);
  console.log(`Check-in: ${checkInDate} → Check-out: ${checkOutDate} (1 night, 2 adults)\n`);

  const entries = Object.entries(destinationIATA);
  const results = {};

  // Deduplicate: multiple destinations may share the same IATA code
  // (e.g., Da Nang & Hoi An → DAD). Fetch once, reuse.
  const cache = {};

  let success = 0, empty = 0, errors = 0;

  for (let i = 0; i < entries.length; i++) {
    const [name, airportCode] = entries[i];
    const cityCode = cityCodeOverrides[airportCode] || airportCode;
    const tag = `[${i + 1}/${entries.length}]`;

    // Reuse cached result if we already fetched this city code
    if (cache[cityCode]) {
      results[name] = { ...cache[cityCode] };
      const status = results[name].medianRate ? '✓ (cached)' : '⚠ (cached)';
      const rate = results[name].medianRate ? ` $${results[name].medianRate}/night` : '';
      console.log(`${tag} ${name} (${cityCode}) ${status}${rate}`);
      if (results[name].medianRate) success++;
      else empty++;
      continue;
    }

    process.stdout.write(`${tag} ${name} (${cityCode})... `);

    try {
      const data = await fetchHotelData(name, airportCode);
      results[name] = data;
      cache[cityCode] = data;

      if (data.medianRate) {
        console.log(`✓ ${data.hotels.length} offers, median $${data.medianRate}/night`);
        success++;
      } else {
        const note = data.note || 'No pricing available';
        console.log(`⚠ ${note}`);
        empty++;
      }
    } catch (err) {
      const detail = err?.response?.data?.errors?.[0]?.detail || err.message;
      console.log(`✗ ${detail}`);
      results[name] = {
        cityCode,
        airportCode,
        hotels: [],
        medianRate: null,
        error: detail,
      };
      cache[cityCode] = results[name];
      errors++;
    }

    await delay(500);
  }

  // Write output
  fs.writeFileSync('./hotel-data.json', JSON.stringify(results, null, 2));

  // Summary
  console.log('\n════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('════════════════════════════════════════');
  console.log(`  Total destinations:  ${entries.length}`);
  console.log(`  ✓ Got pricing:       ${success}`);
  console.log(`  ⚠ No data:           ${empty}`);
  console.log(`  ✗ Errors:            ${errors}`);
  console.log('════════════════════════════════════════');

  // List destinations that got data vs. didn't
  const withData = entries.filter(([n]) => results[n]?.medianRate).map(([n]) => n);
  const withoutData = entries.filter(([n]) => !results[n]?.medianRate).map(([n]) => n);

  if (withData.length > 0) {
    console.log(`\n✓ Destinations with pricing (${withData.length}):`);
    for (const n of withData) {
      console.log(`  $${results[n].medianRate}/night  ${n}`);
    }
  }

  if (withoutData.length > 0) {
    console.log(`\n⚠ Destinations without pricing (${withoutData.length}):`);
    for (const n of withoutData) {
      const reason = results[n]?.error || results[n]?.note || 'No offers returned';
      console.log(`  ${n} — ${reason}`);
    }
  }

  console.log(`\nResults written to hotel-data.json`);
}

main().catch(err => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
