/**
 * Global Cities & Regional Urban Hubs Registry
 * Provides offline-first gazetteer and online reverse-geocoding service.
 * Used for:
 * 1. Reverse-geocoding nearest town names with web search + "-ONE" suffix.
 * 2. Identifying the 3-5 largest regional cities/towns in the active region.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function formatPopulation(pop) {
  if (!pop || isNaN(pop)) return '';
  if (pop >= 1000000) {
    return (pop / 1000000).toFixed(1).replace('.0', '') + 'M';
  }
  if (pop >= 1000) {
    return Math.round(pop / 1000) + 'k';
  }
  return String(pop);
}

export function sanitizePlaceName(raw) {
  if (!raw || typeof raw !== 'string') return 'Haven';
  let cleaned = raw
    .replace(/^(comune di|città di|ville de|city of|municipio de|stadt|gemeinde)\s+/i, '')
    .replace(/\s+(metropolitan area|metropolis|municipality|comune|distretto)$/i, '')
    .replace(/[0-9#@*&^%$!~]+/g, '')
    .trim();
  
  if (!cleaned) cleaned = 'Haven';
  // Capitalize nicely
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/**
 * Curated Global Gazetteer covering major and secondary regional cities across all continents.
 */
export const GLOBAL_CITIES = [
  // Italy & Alpine Region
  { name: 'Susa', pop: 6700, lat: 45.138, lng: 7.054, country: 'Italy' },
  { name: 'Torino', pop: 870000, lat: 45.0703, lng: 7.6869, country: 'Italy' },
  { name: 'Milano', pop: 1370000, lat: 45.4642, lng: 9.1900, country: 'Italy' },
  { name: 'Roma', pop: 2870000, lat: 41.9028, lng: 12.4964, country: 'Italy' },
  { name: 'Genova', pop: 580000, lat: 44.4056, lng: 8.9463, country: 'Italy' },
  { name: 'Bologna', pop: 390000, lat: 44.4949, lng: 11.3426, country: 'Italy' },
  { name: 'Firenze', pop: 382000, lat: 43.7696, lng: 11.2558, country: 'Italy' },
  { name: 'Napoli', pop: 960000, lat: 40.8518, lng: 14.2681, country: 'Italy' },
  { name: 'Venezia', pop: 261000, lat: 45.4408, lng: 12.3155, country: 'Italy' },
  { name: 'Verona', pop: 257000, lat: 45.4384, lng: 10.9916, country: 'Italy' },
  { name: 'Trieste', pop: 204000, lat: 45.6495, lng: 13.7768, country: 'Italy' },
  { name: 'Padova', pop: 21000, lat: 45.4064, lng: 11.8768, country: 'Italy' },
  { name: 'Brescia', pop: 196000, lat: 45.5416, lng: 10.2118, country: 'Italy' },
  { name: 'Bergamo', pop: 120000, lat: 45.6983, lng: 9.6773, country: 'Italy' },
  { name: 'Aosta', pop: 34000, lat: 45.7371, lng: 7.3201, country: 'Italy' },
  { name: 'Ivrea', pop: 23600, lat: 45.4673, lng: 7.8762, country: 'Italy' },
  { name: 'Pinerolo', pop: 36000, lat: 44.8856, lng: 7.3308, country: 'Italy' },
  { name: 'Cuneo', pop: 56000, lat: 44.3845, lng: 7.5427, country: 'Italy' },
  { name: 'Asti', pop: 76000, lat: 44.9008, lng: 8.2069, country: 'Italy' },
  { name: 'Alessandria', pop: 93000, lat: 44.9129, lng: 8.6152, country: 'Italy' },
  { name: 'Novara', pop: 104000, lat: 45.4469, lng: 8.6200, country: 'Italy' },
  { name: 'Vercelli', pop: 46000, lat: 45.3259, lng: 8.4239, country: 'Italy' },
  { name: 'Biella', pop: 44000, lat: 45.5629, lng: 8.0583, country: 'Italy' },
  { name: 'Trento', pop: 118000, lat: 46.0748, lng: 11.1217, country: 'Italy' },
  { name: 'Bolzano', pop: 107000, lat: 46.4983, lng: 11.3548, country: 'Italy' },
  { name: 'Udine', pop: 99000, lat: 46.0711, lng: 13.2346, country: 'Italy' },
  { name: 'Como', pop: 84000, lat: 45.8081, lng: 9.0852, country: 'Italy' },
  { name: 'Savona', pop: 61000, lat: 44.3079, lng: 8.4811, country: 'Italy' },
  { name: 'Sanremo', pop: 54000, lat: 43.8160, lng: 7.7766, country: 'Italy' },
  { name: 'La Spezia', pop: 93000, lat: 44.1025, lng: 9.8241, country: 'Italy' },
  { name: 'Parma', pop: 198000, lat: 44.8015, lng: 10.3279, country: 'Italy' },
  { name: 'Piacenza', pop: 103000, lat: 45.0526, lng: 9.6930, country: 'Italy' },
  { name: 'Reggio Emilia', pop: 171000, lat: 44.6983, lng: 10.6312, country: 'Italy' },
  { name: 'Modena', pop: 185000, lat: 44.6471, lng: 10.9252, country: 'Italy' },
  { name: 'Ferrara', pop: 132000, lat: 44.8381, lng: 11.6198, country: 'Italy' },
  { name: 'Ravenna', pop: 158000, lat: 44.4184, lng: 12.2035, country: 'Italy' },
  { name: 'Rimini', pop: 150000, lat: 44.0594, lng: 12.5683, country: 'Italy' },
  { name: 'Perugia', pop: 166000, lat: 43.1107, lng: 12.3908, country: 'Italy' },
  { name: 'Ancona', pop: 101000, lat: 43.6158, lng: 13.5189, country: 'Italy' },
  { name: 'Bari', pop: 320000, lat: 41.1171, lng: 16.8719, country: 'Italy' },
  { name: 'Catania', pop: 311000, lat: 37.5079, lng: 15.0873, country: 'Italy' },
  { name: 'Palermo', pop: 673000, lat: 38.1157, lng: 13.3615, country: 'Italy' },
  { name: 'Cagliari', pop: 154000, lat: 39.2238, lng: 9.1217, country: 'Italy' },

  // France & Western Alps
  { name: 'Chamonix', pop: 8900, lat: 45.9237, lng: 6.8694, country: 'France' },
  { name: 'Briançon', pop: 11000, lat: 44.8994, lng: 6.6433, country: 'France' },
  { name: 'Chambéry', pop: 59000, lat: 45.5646, lng: 5.9178, country: 'France' },
  { name: 'Grenoble', pop: 160000, lat: 45.1885, lng: 5.7245, country: 'France' },
  { name: 'Lyon', pop: 520000, lat: 45.7640, lng: 4.8357, country: 'France' },
  { name: 'Annecy', pop: 130000, lat: 45.8992, lng: 6.1294, country: 'France' },
  { name: 'Valence', pop: 64000, lat: 44.9334, lng: 4.8924, country: 'France' },
  { name: 'Saint-Étienne', pop: 173000, lat: 45.4397, lng: 4.3872, country: 'France' },
  { name: 'Nice', pop: 342000, lat: 43.7102, lng: 7.2620, country: 'France' },
  { name: 'Marseille', pop: 870000, lat: 43.2965, lng: 5.3698, country: 'France' },
  { name: 'Toulon', pop: 176000, lat: 43.1242, lng: 5.9280, country: 'France' },
  { name: 'Aix-en-Provence', pop: 145000, lat: 43.5297, lng: 5.4474, country: 'France' },
  { name: 'Avignon', pop: 92000, lat: 43.9493, lng: 4.8055, country: 'France' },
  { name: 'Montpellier', pop: 295000, lat: 43.6108, lng: 3.8767, country: 'France' },
  { name: 'Nîmes', pop: 148000, lat: 43.8367, lng: 4.3601, country: 'France' },
  { name: 'Toulouse', pop: 490000, lat: 43.6047, lng: 1.4442, country: 'France' },
  { name: 'Bordeaux', pop: 260000, lat: 44.8378, lng: -0.5792, country: 'France' },
  { name: 'Paris', pop: 2160000, lat: 48.8566, lng: 2.3522, country: 'France' },
  { name: 'Strasbourg', pop: 287000, lat: 48.5734, lng: 7.7521, country: 'France' },
  { name: 'Lille', pop: 234000, lat: 50.6292, lng: 3.0573, country: 'France' },
  { name: 'Nantes', pop: 318000, lat: 47.2184, lng: -1.5536, country: 'France' },
  { name: 'Rennes', pop: 220000, lat: 48.1173, lng: -1.6778, country: 'France' },
  { name: 'Dijon', pop: 156000, lat: 47.3220, lng: 5.0415, country: 'France' },

  // Switzerland
  { name: 'Geneva', pop: 203000, lat: 46.2044, lng: 6.1432, country: 'Switzerland' },
  { name: 'Lausanne', pop: 140000, lat: 46.5197, lng: 6.6323, country: 'Switzerland' },
  { name: 'Sion', pop: 35000, lat: 46.2331, lng: 7.3606, country: 'Switzerland' },
  { name: 'Bern', pop: 134000, lat: 46.9480, lng: 7.4474, country: 'Switzerland' },
  { name: 'Zurich', pop: 421000, lat: 47.3769, lng: 8.5417, country: 'Switzerland' },
  { name: 'Winterthur', pop: 114000, lat: 47.4999, lng: 8.7241, country: 'Switzerland' },
  { name: 'Basel', pop: 173000, lat: 47.5596, lng: 7.5886, country: 'Switzerland' },
  { name: 'Lugano', pop: 63000, lat: 46.0037, lng: 8.9511, country: 'Switzerland' },
  { name: 'Lucerne', pop: 82000, lat: 47.0502, lng: 8.3093, country: 'Switzerland' },
  { name: 'St. Gallen', pop: 76000, lat: 47.4245, lng: 9.3767, country: 'Switzerland' },
  { name: 'Schaffhausen', pop: 36000, lat: 47.6959, lng: 8.6349, country: 'Switzerland' },
  { name: 'Frauenfeld', pop: 25000, lat: 47.5583, lng: 8.8986, country: 'Switzerland' },

  // Spain & Portugal
  { name: 'Madrid', pop: 3300000, lat: 40.4168, lng: -3.7038, country: 'Spain' },
  { name: 'Barcelona', pop: 1630000, lat: 41.3879, lng: 2.1699, country: 'Spain' },
  { name: 'Valencia', pop: 792000, lat: 39.4699, lng: -0.3763, country: 'Spain' },
  { name: 'Sevilla', pop: 688000, lat: 37.3891, lng: -5.9845, country: 'Spain' },
  { name: 'Zaragoza', pop: 675000, lat: 41.6488, lng: -0.8891, country: 'Spain' },
  { name: 'Málaga', pop: 578000, lat: 36.7213, lng: -4.4214, country: 'Spain' },
  { name: 'Bilbao', pop: 346000, lat: 43.2630, lng: -2.9350, country: 'Spain' },
  { name: 'Santiago de Compostela', pop: 98000, lat: 42.8782, lng: -8.5448, country: 'Spain' },
  { name: 'Vigo', pop: 295000, lat: 42.2406, lng: -8.7207, country: 'Spain' },
  { name: 'A Coruña', pop: 247000, lat: 43.3623, lng: -8.4115, country: 'Spain' },
  { name: 'Ourense', pop: 105000, lat: 42.3364, lng: -7.8639, country: 'Spain' },
  { name: 'Lugo', pop: 98000, lat: 43.0125, lng: -7.5558, country: 'Spain' },
  { name: 'Granada', pop: 232000, lat: 37.1773, lng: -3.5986, country: 'Spain' },
  { name: 'Palma de Mallorca', pop: 419000, lat: 39.5696, lng: 2.6502, country: 'Spain' },
  { name: 'Las Palmas', pop: 381000, lat: 28.1235, lng: -15.4363, country: 'Spain' },
  { name: 'Lisbon', pop: 545000, lat: 38.7223, lng: -9.1393, country: 'Portugal' },
  { name: 'Porto', pop: 231000, lat: 41.1579, lng: -8.6291, country: 'Portugal' },
  { name: 'Braga', pop: 193000, lat: 41.5454, lng: -8.4265, country: 'Portugal' },
  { name: 'Coimbra', pop: 143000, lat: 40.2033, lng: -8.4103, country: 'Portugal' },
  { name: 'Faro', pop: 67000, lat: 37.0194, lng: -7.9304, country: 'Portugal' },

  // Germany, Austria & Central Europe
  { name: 'Berlin', pop: 3670000, lat: 52.5200, lng: 13.4050, country: 'Germany' },
  { name: 'Munich', pop: 1480000, lat: 48.1351, lng: 11.5820, country: 'Germany' },
  { name: 'Hamburg', pop: 1890000, lat: 53.5511, lng: 9.9937, country: 'Germany' },
  { name: 'Cologne', pop: 1080000, lat: 50.9375, lng: 6.9603, country: 'Germany' },
  { name: 'Frankfurt', pop: 764000, lat: 50.1109, lng: 8.6821, country: 'Germany' },
  { name: 'Stuttgart', pop: 635000, lat: 48.7758, lng: 9.1829, country: 'Germany' },
  { name: 'Augsburg', pop: 300000, lat: 48.3705, lng: 10.8978, country: 'Germany' },
  { name: 'Freiburg', pop: 231000, lat: 47.9990, lng: 7.8421, country: 'Germany' },
  { name: 'Karlsruhe', pop: 313000, lat: 49.0069, lng: 8.4037, country: 'Germany' },
  { name: 'Mannheim', pop: 310000, lat: 49.4875, lng: 8.4660, country: 'Germany' },
  { name: 'Ulm', pop: 126000, lat: 48.4011, lng: 9.9876, country: 'Germany' },
  { name: 'Konstanz', pop: 85000, lat: 47.6779, lng: 9.1732, country: 'Germany' },
  { name: 'Friedrichshafen', pop: 62000, lat: 47.6542, lng: 9.4795, country: 'Germany' },
  { name: 'Reutlingen', pop: 116000, lat: 48.4833, lng: 9.2167, country: 'Germany' },
  { name: 'Bregenz', pop: 29000, lat: 47.5031, lng: 9.7471, country: 'Austria' },
  { name: 'Dornbirn', pop: 50000, lat: 47.4125, lng: 9.7417, country: 'Austria' },
  { name: 'Düsseldorf', pop: 620000, lat: 51.2277, lng: 6.7735, country: 'Germany' },
  { name: 'Leipzig', pop: 600000, lat: 51.3397, lng: 12.3731, country: 'Germany' },
  { name: 'Dresden', pop: 556000, lat: 51.0504, lng: 13.7373, country: 'Germany' },
  { name: 'Nuremberg', pop: 515000, lat: 49.4521, lng: 11.0767, country: 'Germany' },
  { name: 'Freiburg', pop: 231000, lat: 47.9990, lng: 7.8421, country: 'Germany' },
  { name: 'Vienna', pop: 1930000, lat: 48.2082, lng: 16.3738, country: 'Austria' },
  { name: 'Graz', pop: 292000, lat: 47.0707, lng: 15.4395, country: 'Austria' },
  { name: 'Linz', pop: 207000, lat: 48.3064, lng: 14.2858, country: 'Austria' },
  { name: 'Salzburg', pop: 155000, lat: 47.8095, lng: 13.0550, country: 'Austria' },
  { name: 'Innsbruck', pop: 131000, lat: 47.2692, lng: 11.4041, country: 'Austria' },
  { name: 'Prague', pop: 1330000, lat: 50.0755, lng: 14.4378, country: 'Czechia' },
  { name: 'Warsaw', pop: 1790000, lat: 52.2297, lng: 21.0122, country: 'Poland' },
  { name: 'Kraków', pop: 780000, lat: 50.0647, lng: 19.9450, country: 'Poland' },
  { name: 'Budapest', pop: 1750000, lat: 47.4979, lng: 19.0402, country: 'Hungary' },
  { name: 'Amsterdam', pop: 872000, lat: 52.3676, lng: 4.9041, country: 'Netherlands' },
  { name: 'Rotterdam', pop: 651000, lat: 51.9244, lng: 4.4777, country: 'Netherlands' },
  { name: 'Brussels', pop: 1220000, lat: 50.8503, lng: 4.3517, country: 'Belgium' },
  { name: 'Antwerp', pop: 529000, lat: 51.2194, lng: 4.4025, country: 'Belgium' },

  // UK & Northern Europe
  { name: 'London', pop: 8980000, lat: 51.5074, lng: -0.1278, country: 'United Kingdom' },
  { name: 'Birmingham', pop: 1140000, lat: 52.4862, lng: -1.8904, country: 'United Kingdom' },
  { name: 'Manchester', pop: 553000, lat: 53.4808, lng: -2.2426, country: 'United Kingdom' },
  { name: 'Glasgow', pop: 635000, lat: 55.8642, lng: -4.2518, country: 'United Kingdom' },
  { name: 'Edinburgh', pop: 527000, lat: 55.9533, lng: -3.1883, country: 'United Kingdom' },
  { name: 'Liverpool', pop: 498000, lat: 53.4084, lng: -2.9916, country: 'United Kingdom' },
  { name: 'Bristol', pop: 467000, lat: 51.4545, lng: -2.5879, country: 'United Kingdom' },
  { name: 'Dublin', pop: 554000, lat: 53.3498, lng: -6.2603, country: 'Ireland' },
  { name: 'Stockholm', pop: 975000, lat: 59.3293, lng: 18.0686, country: 'Sweden' },
  { name: 'Oslo', pop: 699000, lat: 59.9139, lng: 10.7522, country: 'Norway' },
  { name: 'Copenhagen', pop: 638000, lat: 55.6761, lng: 12.5683, country: 'Denmark' },
  { name: 'Helsinki', pop: 658000, lat: 60.1699, lng: 24.9384, country: 'Finland' },
  { name: 'Reykjavík', pop: 133000, lat: 64.1466, lng: -21.9426, country: 'Iceland' },
  { name: 'Athens', pop: 664000, lat: 37.9838, lng: 23.7275, country: 'Greece' },
  { name: 'Thessaloniki', pop: 325000, lat: 40.6401, lng: 22.9444, country: 'Greece' },

  // North America - United States & Canada
  { name: 'Detroit', pop: 639000, lat: 42.3314, lng: -83.0458, country: 'United States' },
  { name: 'Ann Arbor', pop: 123000, lat: 42.2808, lng: -83.7430, country: 'United States' },
  { name: 'Grand Rapids', pop: 198000, lat: 42.9634, lng: -85.6681, country: 'United States' },
  { name: 'Lansing', pop: 112000, lat: 42.7325, lng: -84.5555, country: 'United States' },
  { name: 'Chicago', pop: 2740000, lat: 41.8781, lng: -87.6298, country: 'United States' },
  { name: 'Cleveland', pop: 372000, lat: 41.4993, lng: -81.6944, country: 'United States' },
  { name: 'Columbus', pop: 905000, lat: 39.9612, lng: -82.9988, country: 'United States' },
  { name: 'Indianapolis', pop: 887000, lat: 39.7684, lng: -86.1581, country: 'United States' },
  { name: 'Milwaukee', pop: 577000, lat: 43.0389, lng: -87.9065, country: 'United States' },
  { name: 'Minneapolis', pop: 429000, lat: 44.9778, lng: -93.2650, country: 'United States' },
  { name: 'New York', pop: 8330000, lat: 40.7128, lng: -74.0060, country: 'United States' },
  { name: 'Philadelphia', pop: 1580000, lat: 39.9526, lng: -75.1652, country: 'United States' },
  { name: 'Boston', pop: 675000, lat: 42.3601, lng: -71.0589, country: 'United States' },
  { name: 'Washington', pop: 689000, lat: 38.9072, lng: -77.0369, country: 'United States' },
  { name: 'Pittsburgh', pop: 300000, lat: 40.4406, lng: -79.9959, country: 'United States' },
  { name: 'Toronto', pop: 2930000, lat: 43.6532, lng: -79.3832, country: 'Canada' },
  { name: 'Montreal', pop: 1780000, lat: 45.5017, lng: -73.5673, country: 'Canada' },
  { name: 'Ottawa', pop: 1017000, lat: 45.4215, lng: -75.6972, country: 'Canada' },
  { name: 'Quebec City', pop: 549000, lat: 46.8139, lng: -71.2080, country: 'Canada' },
  { name: 'Windsor', pop: 233000, lat: 42.3149, lng: -83.0364, country: 'Canada' },
  { name: 'Hamilton', pop: 569000, lat: 43.2557, lng: -79.8711, country: 'Canada' },
  { name: 'Vancouver', pop: 675000, lat: 49.2827, lng: -123.1207, country: 'Canada' },
  { name: 'Calgary', pop: 1300000, lat: 51.0447, lng: -114.0719, country: 'Canada' },
  { name: 'Edmonton', pop: 1010000, lat: 53.5461, lng: -113.4938, country: 'Canada' },
  { name: 'Seattle', pop: 749000, lat: 47.6062, lng: -122.3321, country: 'United States' },
  { name: 'Portland', pop: 652000, lat: 45.5152, lng: -122.6784, country: 'United States' },
  { name: 'San Francisco', pop: 873000, lat: 37.7749, lng: -122.4194, country: 'United States' },
  { name: 'San Jose', pop: 1013000, lat: 37.3382, lng: -121.8863, country: 'United States' },
  { name: 'Los Angeles', pop: 3890000, lat: 34.0522, lng: -118.2437, country: 'United States' },
  { name: 'San Diego', pop: 1380000, lat: 32.7157, lng: -117.1611, country: 'United States' },
  { name: 'Phoenix', pop: 1608000, lat: 33.4484, lng: -112.0740, country: 'United States' },
  { name: 'Denver', pop: 715000, lat: 39.7392, lng: -104.9903, country: 'United States' },
  { name: 'Salt Lake City', pop: 200000, lat: 40.7608, lng: -111.8910, country: 'United States' },
  { name: 'Dallas', pop: 1304000, lat: 32.7767, lng: -96.7970, country: 'United States' },
  { name: 'Houston', pop: 2304000, lat: 29.7604, lng: -95.3698, country: 'United States' },
  { name: 'Austin', pop: 961000, lat: 30.2672, lng: -97.7431, country: 'United States' },
  { name: 'San Antonio', pop: 1434000, lat: 29.4241, lng: -98.4936, country: 'United States' },
  { name: 'Atlanta', pop: 498000, lat: 33.7490, lng: -84.3880, country: 'United States' },
  { name: 'Miami', pop: 442000, lat: 25.7617, lng: -80.1918, country: 'United States' },
  { name: 'New Orleans', pop: 383000, lat: 29.9511, lng: -90.0715, country: 'United States' },
  { name: 'Fairbanks', pop: 32000, lat: 64.8378, lng: -147.7164, country: 'United States' },
  { name: 'Anchorage', pop: 291000, lat: 61.2181, lng: -149.9003, country: 'United States' },
  { name: 'Whitehorse', pop: 28000, lat: 60.7212, lng: -135.0568, country: 'Canada' },

  // Mexico & Central America
  { name: 'Mexico City', pop: 9200000, lat: 19.4326, lng: -99.1332, country: 'Mexico' },
  { name: 'Guadalajara', pop: 1495000, lat: 20.6597, lng: -103.3496, country: 'Mexico' },
  { name: 'Monterrey', pop: 1142000, lat: 25.6866, lng: -100.3161, country: 'Mexico' },
  { name: 'Puebla', pop: 1542000, lat: 19.0414, lng: -98.2063, country: 'Mexico' },
  { name: 'Tijuana', pop: 1810000, lat: 32.5149, lng: -117.0382, country: 'Mexico' },
  { name: 'Guatemala City', pop: 2930000, lat: 14.6349, lng: -90.5069, country: 'Guatemala' },
  { name: 'San José', pop: 342000, lat: 9.9281, lng: -84.0907, country: 'Costa Rica' },
  { name: 'Panama City', pop: 880000, lat: 8.9824, lng: -79.5199, country: 'Panama' },

  // South America
  { name: 'Quito', pop: 2011000, lat: -0.1807, lng: -78.4678, country: 'Ecuador' },
  { name: 'Guayaquil', pop: 2698000, lat: -2.1894, lng: -79.8891, country: 'Ecuador' },
  { name: 'Cuenca', pop: 331000, lat: -2.9001, lng: -79.0059, country: 'Ecuador' },
  { name: 'Loja', pop: 214000, lat: -3.9931, lng: -79.2042, country: 'Ecuador' },
  { name: 'Vilcabamba', pop: 4800, lat: -4.2625, lng: -79.2225, country: 'Ecuador' },
  { name: 'Bogotá', pop: 7181000, lat: 4.7110, lng: -74.0721, country: 'Colombia' },
  { name: 'Medellín', pop: 2569000, lat: 6.2442, lng: -75.5812, country: 'Colombia' },
  { name: 'Cali', pop: 2227000, lat: 3.4516, lng: -76.5320, country: 'Colombia' },
  { name: 'Lima', pop: 9750000, lat: -12.0464, lng: -77.0428, country: 'Peru' },
  { name: 'Cusco', pop: 428000, lat: -13.5319, lng: -71.9675, country: 'Peru' },
  { name: 'Arequipa', pop: 1008000, lat: -16.4090, lng: -71.5375, country: 'Peru' },
  { name: 'Manaus', pop: 2219000, lat: -3.1190, lng: -60.0217, country: 'Brazil' },
  { name: 'Belém', pop: 1499000, lat: -1.4558, lng: -48.4902, country: 'Brazil' },
  { name: 'São Paulo', pop: 12325000, lat: -23.5505, lng: -46.6333, country: 'Brazil' },
  { name: 'Rio de Janeiro', pop: 6748000, lat: -22.9068, lng: -43.1729, country: 'Brazil' },
  { name: 'Brasília', pop: 3055000, lat: -15.7975, lng: -47.8919, country: 'Brazil' },
  { name: 'Salvador', pop: 2886000, lat: -12.9714, lng: -38.5014, country: 'Brazil' },
  { name: 'Belo Horizonte', pop: 2521000, lat: -19.9167, lng: -43.9345, country: 'Brazil' },
  { name: 'Curitiba', pop: 1948000, lat: -25.4284, lng: -49.2733, country: 'Brazil' },
  { name: 'Porto Alegre', pop: 1488000, lat: -30.0346, lng: -51.2177, country: 'Brazil' },
  { name: 'Buenos Aires', pop: 3075000, lat: -34.6037, lng: -58.3816, country: 'Argentina' },
  { name: 'Córdoba', pop: 1329000, lat: -31.4201, lng: -64.1888, country: 'Argentina' },
  { name: 'Rosario', pop: 948000, lat: -32.9587, lng: -60.6930, country: 'Argentina' },
  { name: 'Mendoza', pop: 115000, lat: -32.8895, lng: -68.8458, country: 'Argentina' },
  { name: 'Santiago', pop: 6257000, lat: -33.4489, lng: -70.6693, country: 'Chile' },
  { name: 'Valparaíso', pop: 296000, lat: -33.0472, lng: -71.6127, country: 'Chile' },
  { name: 'Montevideo', pop: 1381000, lat: -34.9011, lng: -56.1645, country: 'Uruguay' },
  { name: 'La Paz', pop: 816000, lat: -16.4897, lng: -68.1193, country: 'Bolivia' },

  // Africa
  { name: 'Niamey', pop: 1026000, lat: 13.5116, lng: 2.1254, country: 'Niger' },
  { name: 'Dakar', pop: 1146000, lat: 14.7167, lng: -17.4677, country: 'Senegal' },
  { name: 'Bamako', pop: 2009000, lat: 12.6392, lng: -8.0029, country: 'Mali' },
  { name: 'Ouagadougou', pop: 2453000, lat: 12.3714, lng: -1.5197, country: 'Burkina Faso' },
  { name: 'Abidjan', pop: 4707000, lat: 5.3600, lng: -4.0083, country: "Côte d'Ivoire" },
  { name: 'Accra', pop: 2291000, lat: 5.6037, lng: -0.1870, country: 'Ghana' },
  { name: 'Lagos', pop: 15388000, lat: 6.5244, lng: 3.3792, country: 'Nigeria' },
  { name: 'Kano', pop: 3848000, lat: 12.0022, lng: 8.5920, country: 'Nigeria' },
  { name: 'Cairo', pop: 9540000, lat: 30.0444, lng: 31.2357, country: 'Egypt' },
  { name: 'Alexandria', pop: 5200000, lat: 31.2001, lng: 29.9187, country: 'Egypt' },
  { name: 'Casablanca', pop: 3359000, lat: 33.5731, lng: -7.5898, country: 'Morocco' },
  { name: 'Marrakech', pop: 928000, lat: 31.6295, lng: -7.9811, country: 'Morocco' },
  { name: 'Tunis', pop: 1056000, lat: 36.8065, lng: 10.1815, country: 'Tunisia' },
  { name: 'Algiers', pop: 2988000, lat: 36.7538, lng: 3.0588, country: 'Algeria' },
  { name: 'Addis Ababa', pop: 3384000, lat: 9.0300, lng: 38.7400, country: 'Ethiopia' },
  { name: 'Nairobi', pop: 4397000, lat: -1.2921, lng: 36.8219, country: 'Kenya' },
  { name: 'Mombasa', pop: 1208000, lat: -4.0435, lng: 39.6682, country: 'Kenya' },
  { name: 'Kampala', pop: 1680000, lat: 0.3476, lng: 32.5825, country: 'Uganda' },
  { name: 'Kigali', pop: 1132000, lat: -1.9706, lng: 30.1044, country: 'Rwanda' },
  { name: 'Dar es Salaam', pop: 6701000, lat: -6.7924, lng: 39.2083, country: 'Tanzania' },
  { name: 'Kinshasa', pop: 14342000, lat: -4.4419, lng: 15.2663, country: 'DR Congo' },
  { name: 'Johannesburg', pop: 5635000, lat: -26.2041, lng: 28.0473, country: 'South Africa' },
  { name: 'Cape Town', pop: 4618000, lat: -33.9249, lng: 18.4241, country: 'South Africa' },
  { name: 'Durban', pop: 3120000, lat: -29.8587, lng: 31.0218, country: 'South Africa' },

  // Asia & Middle East
  { name: 'Tokyo', pop: 13960000, lat: 35.6762, lng: 139.6503, country: 'Japan' },
  { name: 'Yokohama', pop: 3740000, lat: 35.4437, lng: 139.6380, country: 'Japan' },
  { name: 'Osaka', pop: 2691000, lat: 34.6937, lng: 135.5023, country: 'Japan' },
  { name: 'Kyoto', pop: 1475000, lat: 35.0116, lng: 135.7681, country: 'Japan' },
  { name: 'Nagoya', pop: 2296000, lat: 35.1815, lng: 136.9066, country: 'Japan' },
  { name: 'Fukuoka', pop: 1538000, lat: 33.5904, lng: 130.4017, country: 'Japan' },
  { name: 'Sapporo', pop: 1952000, lat: 43.0618, lng: 141.3545, country: 'Japan' },
  { name: 'Seoul', pop: 9776000, lat: 37.5665, lng: 126.9780, country: 'South Korea' },
  { name: 'Busan', pop: 3448000, lat: 35.1796, lng: 129.0756, country: 'South Korea' },
  { name: 'Beijing', pop: 21540000, lat: 39.9042, lng: 116.4074, country: 'China' },
  { name: 'Shanghai', pop: 24280000, lat: 31.2304, lng: 121.4737, country: 'China' },
  { name: 'Guangzhou', pop: 15300000, lat: 23.1291, lng: 113.2644, country: 'China' },
  { name: 'Shenzhen', pop: 12590000, lat: 22.5431, lng: 114.0579, country: 'China' },
  { name: 'Chengdu', pop: 16330000, lat: 30.5728, lng: 104.0668, country: 'China' },
  { name: 'Chongqing', pop: 31020000, lat: 29.5630, lng: 106.5516, country: 'China' },
  { name: 'Wuhan', pop: 11210000, lat: 30.5928, lng: 114.3055, country: 'China' },
  { name: 'Hong Kong', pop: 7482000, lat: 22.3193, lng: 114.1694, country: 'Hong Kong' },
  { name: 'Taipei', pop: 2646000, lat: 25.0330, lng: 121.5654, country: 'Taiwan' },
  { name: 'Bangkok', pop: 10539000, lat: 13.7563, lng: 100.5018, country: 'Thailand' },
  { name: 'Chiang Mai', pop: 131000, lat: 18.7883, lng: 98.9853, country: 'Thailand' },
  { name: 'Hanoi', pop: 8053000, lat: 21.0285, lng: 105.8542, country: 'Vietnam' },
  { name: 'Ho Chi Minh City', pop: 8993000, lat: 10.8231, lng: 106.6297, country: 'Vietnam' },
  { name: 'Da Nang', pop: 1134000, lat: 16.0544, lng: 108.2022, country: 'Vietnam' },
  { name: 'Vientiane', pop: 948000, lat: 17.9757, lng: 102.6331, country: 'Laos' },
  { name: 'Luang Prabang', pop: 55000, lat: 19.8893, lng: 102.1347, country: 'Laos' },
  { name: 'Phnom Penh', pop: 2129000, lat: 11.5564, lng: 104.9282, country: 'Cambodia' },
  { name: 'Kuala Lumpur', pop: 1800000, lat: 3.1390, lng: 101.6869, country: 'Malaysia' },
  { name: 'Singapore', pop: 5686000, lat: 1.3521, lng: 103.8198, country: 'Singapore' },
  { name: 'Jakarta', pop: 10562000, lat: -6.2088, lng: 106.8456, country: 'Indonesia' },
  { name: 'Surabaya', pop: 2874000, lat: -7.2575, lng: 112.7521, country: 'Indonesia' },
  { name: 'Bandung', pop: 2444000, lat: -6.9175, lng: 107.6191, country: 'Indonesia' },
  { name: 'Manila', pop: 1780000, lat: 14.5995, lng: 120.9842, country: 'Philippines' },
  { name: 'Delhi', pop: 16787000, lat: 28.7041, lng: 77.1025, country: 'India' },
  { name: 'Mumbai', pop: 12442000, lat: 19.0760, lng: 72.8777, country: 'India' },
  { name: 'Bengaluru', pop: 8443000, lat: 12.9716, lng: 77.5946, country: 'India' },
  { name: 'Hyderabad', pop: 6809000, lat: 17.3850, lng: 78.4867, country: 'India' },
  { name: 'Kolkata', pop: 4496000, lat: 22.5726, lng: 88.3639, country: 'India' },
  { name: 'Chennai', pop: 7088000, lat: 13.0827, lng: 80.2707, country: 'India' },
  { name: 'Kochi', pop: 677000, lat: 9.9312, lng: 76.2673, country: 'India' },
  { name: 'Thiruvananthapuram', pop: 957000, lat: 8.5241, lng: 76.9366, country: 'India' },
  { name: 'Dubai', pop: 3331000, lat: 25.2048, lng: 55.2708, country: 'UAE' },
  { name: 'Istanbul', pop: 15462000, lat: 41.0082, lng: 28.9784, country: 'Turkey' },
  { name: 'Ankara', pop: 5663000, lat: 39.9334, lng: 32.8597, country: 'Turkey' },
  { name: 'Izmir', pop: 4367000, lat: 38.4237, lng: 27.1428, country: 'Turkey' },

  // Australia & Oceania
  { name: 'Sydney', pop: 5312000, lat: -33.8688, lng: 151.2093, country: 'Australia' },
  { name: 'Melbourne', pop: 5078000, lat: -37.8136, lng: 144.9631, country: 'Australia' },
  { name: 'Brisbane', pop: 2514000, lat: -27.4698, lng: 153.0251, country: 'Australia' },
  { name: 'Perth', pop: 2059000, lat: -31.9505, lng: 115.8605, country: 'Australia' },
  { name: 'Adelaide', pop: 1345000, lat: -34.9285, lng: 138.6007, country: 'Australia' },
  { name: 'Auckland', pop: 1657000, lat: -36.8485, lng: 174.7633, country: 'New Zealand' },
  { name: 'Wellington', pop: 215000, lat: -41.2865, lng: 174.7762, country: 'New Zealand' },
  { name: 'Christchurch', pop: 383000, lat: -43.5321, lng: 172.6362, country: 'New Zealand' }
];

/**
 * Finds the closest city/town in the offline database.
 */
export function findNearestCityOffline(lat, lng) {
  let closest = null;
  let minD = Infinity;

  for (const c of GLOBAL_CITIES) {
    const d = calculateDistanceKm(lat, lng, c.lat, c.lng);
    if (d < minD) {
      minD = d;
      closest = { ...c, distanceKm: d };
    }
  }

  return closest || { name: 'Pioneer Haven', pop: 1000, lat, lng, country: 'Earth', distanceKm: 0 };
}

/**
 * Estimates the visible geographic bounds for a center coordinate at a given Leaflet zoom level.
 */
export function estimateViewportBounds(lat, lng, zoom = 7.0, width = 800, height = 440) {
  function latToY(l, z) {
    const sin = Math.sin(l * Math.PI / 180);
    const clampedSin = Math.max(-0.9999, Math.min(0.9999, sin));
    const y = 0.5 - Math.log((1 + clampedSin) / (1 - clampedSin)) / (4 * Math.PI);
    return y * 256 * Math.pow(2, z);
  }
  function yToLat(y, z) {
    const n = Math.PI - 2 * Math.PI * y / (256 * Math.pow(2, z));
    return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
  }
  function lngToX(ln, z) {
    return (ln + 180) / 360 * 256 * Math.pow(2, z);
  }
  function xToLng(x, z) {
    return x / (256 * Math.pow(2, z)) * 360 - 180;
  }

  const centerY = latToY(lat, zoom);
  const centerX = lngToX(lng, zoom);
  const halfH = height / 2;
  const halfW = width / 2;

  const north = yToLat(centerY - halfH, zoom);
  const south = yToLat(centerY + halfH, zoom);
  const west = xToLng(centerX - halfW, zoom);
  const east = xToLng(centerX + halfW, zoom);

  return {
    south, north, west, east,
    getSouth: () => south,
    getNorth: () => north,
    getWest: () => west,
    getEast: () => east,
    contains: (pt) => {
      const pLat = Array.isArray(pt) ? pt[0] : (pt.lat !== undefined ? pt.lat : 0);
      const pLng = Array.isArray(pt) ? pt[1] : (pt.lng !== undefined ? pt.lng : 0);
      const inLat = pLat >= south && pLat <= north;
      const inLng = west <= east ? (pLng >= west && pLng <= east) : (pLng >= west || pLng <= east);
      return inLat && inLng;
    }
  };
}

/**
 * Checks whether a city is inside given bounds (supporting Leaflet LatLngBounds or custom bounds)
 */
function isCityInBounds(city, bounds) {
  if (!bounds) return false;
  if (typeof bounds.contains === 'function') {
    try {
      if (bounds.contains([city.lat, city.lng]) || bounds.contains({ lat: city.lat, lng: city.lng })) {
        return true;
      }
    } catch (_) {}
  }
  if (typeof bounds.getSouth === 'function') {
    const s = bounds.getSouth();
    const n = bounds.getNorth();
    const w = bounds.getWest();
    const e = bounds.getEast();
    const inLat = city.lat >= s && city.lat <= n;
    const inLng = w <= e ? (city.lng >= w && city.lng <= e) : (city.lng >= w || city.lng <= e);
    return inLat && inLng;
  }
  if (bounds.south !== undefined && bounds.north !== undefined) {
    const inLat = city.lat >= bounds.south && city.lat <= bounds.north;
    const inLng = bounds.west <= bounds.east
      ? (city.lng >= bounds.west && city.lng <= bounds.east)
      : (city.lng >= bounds.west || city.lng <= bounds.east);
    return inLat && inLng;
  }
  return false;
}

/**
 * Queries the 3 to 5 largest towns/cities in the shown region.
 * Filters strictly by map bounds (or viewport radius if bounds has < 3 cities),
 * and sorts descending by population.
 */
export function getRegionalMajorCities(centerLat, centerLng, bounds = null, count = 5) {
  let candidates = [];

  if (bounds) {
    candidates = GLOBAL_CITIES.filter(c => isCityInBounds(c, bounds));
  }

  // If fewer than 3 cities within visible bounds (e.g. zoomed in close to rural ground),
  // expand radius centered around the target location
  if (candidates.length < 3) {
    const radiusKm = 180;
    candidates = GLOBAL_CITIES.filter(c => calculateDistanceKm(centerLat, centerLng, c.lat, c.lng) <= radiusKm);
  }

  // If still fewer than 3, expand radius to 300 km
  if (candidates.length < 3) {
    const radiusKm = 300;
    candidates = GLOBAL_CITIES.filter(c => calculateDistanceKm(centerLat, centerLng, c.lat, c.lng) <= radiusKm);
  }

  // If still fewer than 3 (remote tundra/desert), expand to 600 km
  if (candidates.length < 3) {
    const radiusKm = 600;
    candidates = GLOBAL_CITIES.filter(c => calculateDistanceKm(centerLat, centerLng, c.lat, c.lng) <= radiusKm);
  }

  // Attach distanceKm and popFormatted
  const withDistance = candidates.map(c => ({
    ...c,
    distanceKm: calculateDistanceKm(centerLat, centerLng, c.lat, c.lng),
    popFormatted: formatPopulation(c.pop)
  }));

  // Sort descending by population: largest cities first!
  withDistance.sort((a, b) => (b.pop || 0) - (a.pop || 0));

  // Limit to desired count (typically 3 to 5)
  return withDistance.slice(0, Math.min(count, withDistance.length));
}

/**
 * Searches the web for the nearest town/city name for a given (lat, lng),
 * and appends "-ONE" (e.g. "Susa-ONE", "Detroit-ONE").
 *
 * Tries:
 * 1. Komoot Photon reverse geocode (CORS-friendly OpenStreetMap)
 * 2. BigDataCloud / Nominatim fallback
 * 3. Offline gazetteer nearest match
 */
export async function fetchNearestTownName(lat, lng) {
  let resolvedTown = null;

  // 1. Try Photon reverse geocoding (OpenStreetMap with CORS support)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2200);

    const res = await fetch(`https://photon.komoot.io/reverse?lat=${lat.toFixed(5)}&lon=${lng.toFixed(5)}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.features && data.features.length > 0) {
        const props = data.features[0].properties || {};
        const place = props.city || props.town || props.village || props.municipality || props.locality || props.name;
        if (place && typeof place === 'string') {
          resolvedTown = sanitizePlaceName(place);
        }
      }
    }
  } catch (err) {
    // Graceful fallback to offline/secondary
    console.debug('[fetchNearestTownName] Photon lookup failed or timed out:', err.message);
  }

  // 2. If Photon didn't find a town, try secondary fallback (Nominatim)
  if (!resolvedTown) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat.toFixed(5)}&lon=${lng.toFixed(5)}&format=json&zoom=14`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const place = addr.town || addr.village || addr.city || addr.municipality || addr.hamlet || addr.county;
        if (place) {
          resolvedTown = sanitizePlaceName(place);
        }
      }
    } catch (err) {
      console.debug('[fetchNearestTownName] Nominatim lookup failed or timed out:', err.message);
    }
  }

  // 3. Fallback to offline gazetteer if web was unreachable or returned ocean/wilds
  if (!resolvedTown) {
    const nearest = findNearestCityOffline(lat, lng);
    resolvedTown = nearest.name;
  }

  // Ensure clean name and append "-ONE"
  resolvedTown = sanitizePlaceName(resolvedTown);
  const oneName = `${resolvedTown}-ONE`;

  return {
    rawTown: resolvedTown,
    nodeName: oneName
  };
}
