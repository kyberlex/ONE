/**
 * Canonical Seed Nodes & Territory Data (Agent SIM-0 & SIM-2)
 * Initial Solarpunk O.N.E. Usufruct Commons & Surrounding Legacy Debt Zones.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

export const SEED_ONE_NODES = [
  {
    id: 'node-delray',
    name: 'Detroit Delray Commons',
    bioregion: 'Great Lakes Basin',
    status: 'ACTIVE_USUFRUCT',
    coordinates: { q: 0, r: 0 },
    population: 28,
    thermoConfig: {
      solarCapacityKw: 140,
      windCapacityKw: 45,
      batteryCapacityKwh: 380,
      cisternCapacityL: 60000,
      greenhouseAreaM2: 650
    },
    description: 'Post-industrial brownfield regenerated into a solarpunk fablab, solar microgrid, and aquaponic commons.'
  },
  {
    id: 'node-susa',
    name: 'Val di Susa Watershed Node',
    bioregion: 'Western Alpine Arc',
    status: 'FEDERATED_COMMONS',
    coordinates: { q: -2, r: 2 },
    population: 34,
    thermoConfig: {
      solarCapacityKw: 85,
      windCapacityKw: 60,
      batteryCapacityKwh: 420,
      cisternCapacityL: 90000,
      greenhouseAreaM2: 500
    },
    description: 'Alpine cooperative with micro-hydro generation, ancient chestnut agroforestry, and high mutualist resilience.'
  },
  {
    id: 'node-atacama',
    name: 'Atacama Solar Oasis',
    bioregion: 'High Altiplano',
    status: 'FEDERATED_COMMONS',
    coordinates: { q: 3, r: -2 },
    population: 22,
    thermoConfig: {
      solarCapacityKw: 220,
      windCapacityKw: 20,
      batteryCapacityKwh: 500,
      cisternCapacityL: 40000,
      greenhouseAreaM2: 800
    },
    description: 'High-radiation desert node powered by ultra-efficient PV and atmospheric dew collectors with closed battery loops.'
  },
  {
    id: 'node-rojava',
    name: 'Rojava Agro-Ecological Node',
    bioregion: 'Mesopotamian Plains',
    status: 'FEDERATED_COMMONS',
    coordinates: { q: 2, r: 2 },
    population: 40,
    thermoConfig: {
      solarCapacityKw: 110,
      windCapacityKw: 30,
      batteryCapacityKwh: 310,
      cisternCapacityL: 75000,
      greenhouseAreaM2: 950
    },
    description: 'Democratic confederalist commons with regenerative dryland agriculture and cooperative bakery chains.'
  }
];

export const LEGACY_ZONES = [
  {
    id: 'legacy-megacity',
    name: 'Metropolitan Financial Core',
    status: 'LEGACY_DEBT_MONOPOLY',
    coordinates: { q: 1, r: -1 },
    debtPerCapitaEur: 78000,
    smogIndex: 82,
    threatRating: 'CRITICAL',
    description: 'Corporate high-rises, predatory mortgage securitization, and private speculative landlord cartels.'
  },
  {
    id: 'legacy-petro',
    name: 'Petrochemical Refineries & Fracking Basin',
    status: 'LEGACY_EXTRACTIVE',
    coordinates: { q: -1, r: 1 },
    debtPerCapitaEur: 54000,
    smogIndex: 94,
    threatRating: 'HIGH',
    description: 'Fossil fuel enclave with heavy environmental degradation and vulnerable centralized transmission lines.'
  },
  {
    id: 'legacy-suburb',
    name: 'Foreclosed Car-Dependent Sprawl',
    status: 'LEGACY_DISTRESSED_MORTGAGE',
    coordinates: { q: 2, r: -1 },
    debtPerCapitaEur: 62000,
    smogIndex: 45,
    threatRating: 'MODERATE',
    description: 'Subdivided McMansions with negative home equity, high auto dependency, and fragile supply chains.'
  },
  {
    id: 'legacy-industrial-park',
    name: 'Logistics Hub & Automated Warehouses',
    status: 'LEGACY_EXTRACTIVE',
    coordinates: { q: -2, r: 0 },
    debtPerCapitaEur: 41000,
    smogIndex: 68,
    threatRating: 'HIGH',
    description: 'Algorithmic gig-economy fulfillment centers surrounded by security checkpoints and low wages.'
  }
];
