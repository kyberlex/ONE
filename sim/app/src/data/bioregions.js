/**
 * Global Bioregions, Climate Archetypes & Architectural Typologies (Agent SIM-2 & SIM-4)
 * Maps real planetary geography to bioclimatic architecture:
 * - Arctic: Earth-sheltered geodesic snow domes with thermal mass.
 * - Temperate: Modular reciprocal timber Hex-Lofts with living green roofs.
 * - Arid: Rammed-earth windcatcher cool-towers with passive evaporative cooling.
 * - Tropical: Elevated bamboo/timber stilt pavilions with monsoon gutters.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

export const CLIMATE_ZONES = {
  ARCTIC: {
    id: 'ARCTIC',
    name: 'Arctic / Subpolar',
    description: 'Extreme cold, permafrost ground, long winter nights, high thermal insulation requirements.',
    dwellingType: 'Geodesic Earth-Sheltered Snow Dome',
    dwellingDesc: 'Triple-glazed aerogel geodesic dome embedded into thermal turf berms with rocket thermal mass stove and indoor LED aeroponic tubes.',
    groundColor: '#1e293b',
    terrainType: 'Tundra & Snow',
    accentColor: '#38bdf8',
    buildingMaterial: 'Recycled Aerogel & Timber',
    solarEfficiencyFactor: 0.65,
    heatingDemandFactor: 2.2,
    waterCatchmentType: 'Snow-Melt Cistern'
  },
  TEMPERATE: {
    id: 'TEMPERATE',
    name: 'Temperate / Alpine',
    description: 'Four balanced seasons, rich soils, moderate rainfall, ideal for timber reciprocal frame construction.',
    dwellingType: 'Hex-Loft Modular Family Pavilion',
    dwellingDesc: 'Reciprocal timber hexagonal pavilion with living sedum roof, biophilic glass canopy, and modular wall slots.',
    groundColor: '#064e3b',
    terrainType: 'Deciduous & Meadows',
    accentColor: '#10b981',
    buildingMaterial: 'Reciprocal Local Timber & Bio-Resin',
    solarEfficiencyFactor: 1.0,
    heatingDemandFactor: 1.0,
    waterCatchmentType: 'Living Green Roof Gutter'
  },
  ARID: {
    id: 'ARID',
    name: 'Arid / Mediterranean / Desert',
    description: 'Abundant solar radiation, low precipitation, extreme day/night thermal swing, focus on passive cooling.',
    dwellingType: 'Rammed-Earth Nautilus Cool-Tower',
    dwellingDesc: 'High thermal mass compressed earth blocks with central windcatcher chimney for passive evaporative cooling and solar desalination basin.',
    groundColor: '#78350f',
    terrainType: 'Arid Steppe & Sand',
    accentColor: '#f59e0b',
    buildingMaterial: 'Compressed Rammed Earth & Ceramic',
    solarEfficiencyFactor: 1.45,
    heatingDemandFactor: 0.35,
    waterCatchmentType: 'Deep Aquifer & Fog Harvesting Net'
  },
  TROPICAL: {
    id: 'TROPICAL',
    name: 'Tropical / Monsoon',
    description: 'High humidity, heavy seasonal rainfall, warm year-round temperatures, requires elevated natural ventilation.',
    dwellingType: 'Bamboo Stilt Bioclimatic Pavilion',
    dwellingDesc: 'Elevated timber and giant bamboo stilt construction with breathable louvers, open cross-ventilation, and monsoon runoff gutters.',
    groundColor: '#022c22',
    terrainType: 'Rainforest Canopy',
    accentColor: '#34d399',
    buildingMaterial: 'Structural Bamboo & Interlocking Wood',
    solarEfficiencyFactor: 1.1,
    heatingDemandFactor: 0.0,
    waterCatchmentType: 'Monsoon High-Flow Flume'
  }
};

/**
 * Determines climate zone from geographical latitude
 */
export function getClimateZoneFromLat(lat) {
  const absLat = Math.abs(lat);
  if (absLat >= 56) return CLIMATE_ZONES.ARCTIC;
  if (absLat >= 28 && absLat < 56) return CLIMATE_ZONES.TEMPERATE;
  if (absLat >= 14 && absLat < 28) return CLIMATE_ZONES.ARID;
  return CLIMATE_ZONES.TROPICAL;
}

/**
 * Bioregional currency resolver based on sovereign host territory
 */
export function getCurrencyForCountry(country) {
  if (!country) return { symbol: '$', code: 'USD', name: 'US Dollar' };
  const c = country.toLowerCase();
  if (c.includes('ital') || c.includes('franc') || c.includes('german') || c.includes('spain') || c.includes('euro')) {
    return { symbol: '€', code: 'EUR', name: 'Euro' };
  }
  if (c.includes('unit') || c.includes('state') || c.includes('usa') || c.includes('canada')) {
    return { symbol: '$', code: 'USD', name: 'US Dollar' };
  }
  if (c.includes('brazil')) {
    return { symbol: 'R$', code: 'BRL', name: 'Brazilian Real' };
  }
  if (c.includes('india')) {
    return { symbol: '₹', code: 'INR', name: 'Indian Rupee' };
  }
  if (c.includes('niger') || c.includes('mali') || c.includes('senegal')) {
    return { symbol: 'CFA', code: 'XOF', name: 'West African CFA Franc' };
  }
  if (c.includes('uk') || c.includes('britain')) {
    return { symbol: '£', code: 'GBP', name: 'British Pound' };
  }
  if (c.includes('japan')) {
    return { symbol: '¥', code: 'JPY', name: 'Japanese Yen' };
  }
  if (c.includes('china')) {
    return { symbol: '¥', code: 'CNY', name: 'Chinese Yuan' };
  }
  return { symbol: '$', code: 'USD', name: 'US Dollar' };
}

/**
 * Interpolates dynamic localized currency symbol across text strings
 */
export function interpolateCurrency(text, symbol = '$') {
  if (!text || typeof text !== 'string') return text;
  return text
    .replace(/€\s?([0-9.,]+)/g, `${symbol}$1`)
    .replace(/\$\s?([0-9.,]+)/g, `${symbol}$1`)
    .replace(/\[CURRENCY\]\s?([0-9.,]+)/g, `${symbol}$1`);
}

/**
 * Formats a numeric amount with the localized currency symbol
 */
export function formatBioregionalCurrency(amount, symbol = '$') {
  const num = Math.round(Number(amount) || 0);
  return `${symbol}${num.toLocaleString()}`;
}

/**
 * Pre-populated Global O.N.E. Pioneer Nodes
 */
export const GLOBAL_STARTER_NODES = [
  {
    id: 'node-detroit',
    name: 'Detroit Delray Commons',
    bioregion: 'Great Lakes Basin',
    country: 'United States',
    currencySymbol: '$',
    currencyCode: 'USD',
    currencyName: 'US Dollar',
    lat: 42.3015,
    lng: -83.1098,
    climateKey: 'TEMPERATE',
    population: 28,
    freeHousingBuffer: 4,
    quote: 'Converting post-industrial rust into high-density urban greenhouses, solar microgrids, and free housing.',
    tagline: 'The North American Pioneer Hub',
    meshLinks: ['node-val-di-susa', 'node-alaska']
  },
  {
    id: 'node-val-di-susa',
    name: 'Val di Susa Eco-Federation',
    bioregion: 'Cottian Alps Bioregion',
    country: 'Italy',
    currencySymbol: '€',
    currencyCode: 'EUR',
    currencyName: 'Euro',
    lat: 45.1328,
    lng: 7.0542,
    climateKey: 'TEMPERATE',
    population: 24,
    freeHousingBuffer: 5,
    quote: 'Mountain defense community transformed into decentralized alpine solar mesh and timber commons.',
    tagline: 'Alpine Free Usufruct Node',
    meshLinks: ['node-detroit', 'node-sahel']
  },
  {
    id: 'node-alaska',
    name: 'Yukon-Alaska Resilient Haven',
    bioregion: 'Subarctic Boreal Shield',
    country: 'United States / Canada',
    currencySymbol: '$',
    currencyCode: 'USD',
    currencyName: 'US Dollar',
    lat: 64.8378,
    lng: -147.7164,
    climateKey: 'ARCTIC',
    population: 18,
    freeHousingBuffer: 3,
    quote: 'Geodesic turf domes defying sub-zero blizzards with indoor aeroponics and wind turbines.',
    tagline: 'Subpolar Thermal Sanctuary',
    meshLinks: ['node-detroit']
  },
  {
    id: 'node-sahel',
    name: 'Sahel Solar Oasis',
    bioregion: 'Niger River Basin',
    country: 'Niger',
    currencySymbol: 'CFA',
    currencyCode: 'XOF',
    currencyName: 'West African CFA Franc',
    lat: 13.5116,
    lng: 2.1254,
    climateKey: 'ARID',
    population: 32,
    freeHousingBuffer: 6,
    quote: 'Rammed-earth windcatchers and solar micro-drip agroforestry reclaiming the desert.',
    tagline: 'Desert Cool-Tower Stronghold',
    meshLinks: ['node-val-di-susa', 'node-amazon']
  },
  {
    id: 'node-amazon',
    name: 'Amazonas Bioregional Basin',
    bioregion: 'Rio Negro Watershed',
    country: 'Brazil',
    currencySymbol: 'R$',
    currencyCode: 'BRL',
    currencyName: 'Brazilian Real',
    lat: -3.1190,
    lng: -60.0217,
    climateKey: 'TROPICAL',
    population: 26,
    freeHousingBuffer: 4,
    quote: 'Elevated bamboo stilt pavilions living in harmony with river levels and medicinal agroforestry.',
    tagline: 'Equatorial Canopy Commons',
    meshLinks: ['node-sahel', 'node-kerala']
  },
  {
    id: 'node-kerala',
    name: 'Kerala Coastal Autonomous Commune',
    bioregion: 'Malabar Coast',
    country: 'India',
    currencySymbol: '₹',
    currencyCode: 'INR',
    currencyName: 'Indian Rupee',
    lat: 9.9312,
    lng: 76.2673,
    climateKey: 'TROPICAL',
    population: 30,
    freeHousingBuffer: 5,
    quote: 'Monsoon water storage and democratic participatory planning powering local post-work fablabs.',
    tagline: 'Monsoon Permaculture Hub',
    meshLinks: ['node-amazon', 'node-val-di-susa']
  }
];

/**
 * Creates a new custom node at any coordinate on Earth
 */
export function createCustomGlobalNode({ name, lat, lng, country = 'Local Commons', pioneerCount = 5 }) {
  const climate = getClimateZoneFromLat(lat);
  const nodeId = `node-custom-${Date.now().toString(36)}`;
  const cur = getCurrencyForCountry(country);

  return {
    id: nodeId,
    name: name || `O.N.E. Node [${lat.toFixed(2)}, ${lng.toFixed(2)}]`,
    bioregion: `${climate.name} Bioregion`,
    country,
    currencySymbol: cur.symbol,
    currencyCode: cur.code,
    currencyName: cur.name,
    lat,
    lng,
    climateKey: climate.id,
    population: pioneerCount,
    freeHousingBuffer: 3,
    quote: `Pioneer O.N.E. community founded under the ${climate.dwellingType} architecture.`,
    tagline: `Self-Determined ${climate.name} Commons`,
    meshLinks: ['node-detroit']
  };
}
