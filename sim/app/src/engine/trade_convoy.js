/**
 * Inter-Node Trade & Barter Logistics Engine (Agent SIM-1 & SIM-2)
 * Implements:
 * 1. Multi-hex and planetary barter logistics between federated O.N.E. nodes.
 * 2. Non-monetary thermodynamic mutual aid (Leontief physical input-output exchange).
 * 3. Bioregional specialization (surplus vs. deficit reciprocal bonuses).
 * 4. Autonomous low-carbon convoy fleet (Solar Rovers, Maglev Rail, Cargo Airships, Electric Barges).
 * 5. Real-time geo-interpolated coordinates for 60 FPS planetary map rendering.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { GLOBAL_STARTER_NODES } from '../data/bioregions.js';

export const CONVOY_VEHICLES = {
  SOLAR_ROVER: {
    id: 'SOLAR_ROVER',
    name: 'Autonomous Solar Cargo Rover',
    icon: '🚚',
    speedKmH: 45,
    maxPayload: 800,
    energyDrawKwh: 12,
    terrain: 'Overland & Rural Tracks',
    desc: 'Dual-axis solar roof utility vehicle with modular flatbed for overland regional deliveries.'
  },
  MAGLEV_RAIL: {
    id: 'MAGLEV_RAIL',
    name: 'Open-Access Electric Rail',
    icon: '🚆',
    speedKmH: 180,
    maxPayload: 3500,
    energyDrawKwh: 28,
    terrain: 'Federated Rail Corridors',
    desc: 'High-speed electrified freight cars running along shared continental commons corridors.'
  },
  SOLAR_AIRSHIP: {
    id: 'SOLAR_AIRSHIP',
    name: 'Bioclimatic Cargo Dirigible',
    icon: '🎈',
    speedKmH: 75,
    maxPayload: 2200,
    energyDrawKwh: 0, // Wind currents + thin-film solar envelope
    terrain: 'Global Stratospheric Corridors',
    desc: 'Zero-emission solar-buoyant airship harnessing high-altitude jet streams for trans-oceanic transit.'
  },
  ELECTRIC_BARGE: {
    id: 'ELECTRIC_BARGE',
    name: 'Electric River & Coastal Barge',
    icon: '⛴️',
    speedKmH: 38,
    maxPayload: 5000,
    energyDrawKwh: 15,
    terrain: 'Inland Waterways & Canals',
    desc: 'High-displacement electric catamaran barge charged at community river locks and micro-hydro stations.'
  }
};

export const COMMODITY_TYPES = {
  ENERGY: {
    id: 'ENERGY',
    name: 'Solidarity Energy Cells',
    unit: 'kWh',
    icon: '⚡',
    baseEquivalence: 1.0, // 1 kWh baseline
    maxPerCargoUnit: 500
  },
  WATER: {
    id: 'WATER',
    name: 'Filtered Bioregional Water',
    unit: 'Liters',
    icon: '💧',
    baseEquivalence: 0.025, // 40 L = 1 kWh equiv
    maxPerCargoUnit: 12000
  },
  FOOD: {
    id: 'FOOD',
    name: 'Heirloom Crop Granary',
    unit: 'kcal',
    icon: '🥗',
    baseEquivalence: 0.00067, // 1,500 kcal = 1 kWh equiv
    maxPerCargoUnit: 600000
  },
  MATERIALS: {
    id: 'MATERIALS',
    name: 'Circular FabLab Feedstock',
    unit: 'kg',
    icon: '♻️',
    baseEquivalence: 1.25, // 0.8 kg recycled Al/PETG = 1 kWh equiv
    maxPerCargoUnit: 400
  },
  SPARE_PARTS: {
    id: 'SPARE_PARTS',
    name: 'Precision Machinery Parts',
    unit: 'kits',
    icon: '🧰',
    baseEquivalence: 20.0, // 1 kit = 20 kWh equiv
    maxPerCargoUnit: 25
  }
};

/**
 * Bioregional trade profiles defining each node's natural surplus and critical deficits
 */
export const BIOREGIONAL_TRADE_PROFILES = {
  'node-detroit': {
    surplus: 'MATERIALS',
    secondarySurplus: 'SPARE_PARTS',
    deficit: 'WATER',
    desc: 'Industrial recycling hub with abundant structural metals and CNC components; seeks fresh water and diverse crops.'
  },
  'node-val-di-susa': {
    surplus: 'WATER',
    secondarySurplus: 'FOOD',
    deficit: 'ENERGY',
    desc: 'Alpine glacial headwaters and mountain heirloom seed vaults; seeks solar storage cells and fabrication filaments.'
  },
  'node-sahel': {
    surplus: 'ENERGY',
    secondarySurplus: 'FOOD',
    deficit: 'WATER',
    desc: 'Vast solar radiation yield and drought-hardy sorghum; urgently seeks bulk purified water and sediment filtration.'
  },
  'node-amazon': {
    surplus: 'FOOD',
    secondarySurplus: 'MATERIALS',
    deficit: 'SPARE_PARTS',
    desc: 'Super-abundant tropical agroforestry and bio-resins; seeks precision electrical spares and solar inverters.'
  },
  'node-alaska': {
    surplus: 'SPARE_PARTS',
    secondarySurplus: 'ENERGY',
    deficit: 'FOOD',
    desc: 'Sub-zero server cooling, geothermal microgrids, and cold-alloy metallurgy; in chronic deficit of fresh calories.'
  },
  'node-kerala': {
    surplus: 'FOOD',
    secondarySurplus: 'WATER',
    deficit: 'MATERIALS',
    desc: 'High-yield monsoon polyculture, spirulina, and spices; seeks structural aluminium and electronics.'
  }
};

/**
 * Great-circle Haversine distance in kilometers
 */
export function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export class TradeConvoyEngine {
  constructor(playerNodeId = 'node-detroit') {
    this.playerNodeId = playerNodeId;
    this.convoys = [];
    this.convoyHistory = [];
    this.allNodes = [...GLOBAL_STARTER_NODES];
    this.solidarityPacts = new Set(); // Set of nodeIds where mutual aid has been established
    this.totalGoodsExchanged = {
      energyKwh: 0,
      waterL: 0,
      foodKcal: 0,
      materialsKg: 0,
      spareParts: 0
    };
  }

  setNodes(nodes) {
    if (nodes && nodes.length > 0) {
      this.allNodes = [...nodes];
    }
  }

  getNodeById(id) {
    return this.allNodes.find(n => n.id === id);
  }

  getTradeProfile(nodeId) {
    return BIOREGIONAL_TRADE_PROFILES[nodeId] || {
      surplus: 'FOOD',
      secondarySurplus: 'WATER',
      deficit: 'ENERGY',
      desc: 'Emerging autonomous commons node engaged in decentralized bioregional exchange.'
    };
  }

  /**
   * Calculates travel duration in simulation ticks (1 tick = 1 hour)
   */
  calculateTransitTicks(originNode, destNode, vehicle) {
    const distKm = calculateHaversineDistanceKm(originNode.lat, originNode.lng, destNode.lat, destNode.lng);
    // Scaled transit time: minimum 4 hours, capped at 32 hours for global journeys
    const rawHours = distKm / (vehicle.speedKmH * 3.2);
    return Math.max(4, Math.min(32, Math.round(rawHours)));
  }

  /**
   * Calculates the barter return goods based on non-speculative metabolic equivalence
   */
  calculateBarterReturn(originNodeId, destNodeId, outgoingCommodity, outgoingAmount) {
    const destProfile = this.getTradeProfile(destNodeId);
    const inType = destProfile.surplus; // What the partner node pays back
    const inCommodity = COMMODITY_TYPES[inType];
    const outCommodity = COMMODITY_TYPES[outgoingCommodity];

    if (!outCommodity || !inCommodity) return null;

    // Metabolic equivalence base: (amount * baseEquiv) = value in kWh baseline
    const baselineValue = outgoingAmount * outCommodity.baseEquivalence;

    // Reciprocity bonus: if the destination desperately needs what we are sending (+35% bonus)
    const matchesDeficit = destProfile.deficit === outgoingCommodity;
    const reciprocityMultiplier = matchesDeficit ? 1.35 : 1.05;

    const returnAmount = Math.round((baselineValue / inCommodity.baseEquivalence) * reciprocityMultiplier);

    return {
      commodity: inType,
      amount: returnAmount,
      unit: inCommodity.unit,
      name: inCommodity.name,
      icon: inCommodity.icon,
      isBonusApplied: matchesDeficit
    };
  }

  /**
   * Dispatches a new convoy from the player's settlement to a target node
   */
  dispatchConvoy({
    originNodeId = this.playerNodeId,
    destNodeId,
    vehicleId,
    commodityType,
    amount,
    isSolidarity = false,
    thermo,
    node
  }) {
    const origin = this.getNodeById(originNodeId) || this.getNodeById(this.playerNodeId) || this.allNodes[0];
    const dest = this.getNodeById(destNodeId);
    const vehicle = CONVOY_VEHICLES[vehicleId];
    const commodity = COMMODITY_TYPES[commodityType];

    if (!origin || !dest || !vehicle || !commodity) {
      return { success: false, reason: 'Invalid convoy parameters.' };
    }

    if (origin.id === dest.id) {
      return { success: false, reason: 'Cannot dispatch convoy to the same node.' };
    }

    // 1. Verify and deduct resource payload from thermodynamics / node stocks
    if (commodityType === 'ENERGY') {
      if (thermo.energy.batteryStoredKwh < amount + vehicle.energyDrawKwh) {
        return { success: false, reason: `Insufficient stored energy! Needs ${amount + vehicle.energyDrawKwh} kWh.` };
      }
      thermo.energy.batteryStoredKwh -= (amount + vehicle.energyDrawKwh);
    } else if (commodityType === 'WATER') {
      if (thermo.water.cisternStoredL < amount) {
        return { success: false, reason: `Insufficient water reserve! Needs ${amount} Liters.` };
      }
      if (thermo.energy.batteryStoredKwh < vehicle.energyDrawKwh) {
        return { success: false, reason: `Insufficient battery for vehicle propulsion! Needs ${vehicle.energyDrawKwh} kWh.` };
      }
      thermo.water.cisternStoredL -= amount;
      thermo.energy.batteryStoredKwh -= vehicle.energyDrawKwh;
    } else if (commodityType === 'FOOD') {
      if (thermo.food.granaryStoredKcal < amount) {
        return { success: false, reason: `Insufficient granary calories! Needs ${amount.toLocaleString()} kcal.` };
      }
      if (thermo.energy.batteryStoredKwh < vehicle.energyDrawKwh) {
        return { success: false, reason: `Insufficient battery for vehicle propulsion! Needs ${vehicle.energyDrawKwh} kWh.` };
      }
      thermo.food.granaryStoredKcal -= amount;
      thermo.energy.batteryStoredKwh -= vehicle.energyDrawKwh;
    } else if (commodityType === 'MATERIALS') {
      const totalMat = (thermo.circularMaterials?.recycledAluminiumKg || 0) + (thermo.circularMaterials?.recycledPetgKg || 0);
      if (totalMat < amount) {
        return { success: false, reason: `Insufficient recycled circular materials! Needs ${amount} kg.` };
      }
      if (thermo.circularMaterials.recycledAluminiumKg >= amount) {
        thermo.circularMaterials.recycledAluminiumKg -= amount;
      } else {
        const rem = amount - thermo.circularMaterials.recycledAluminiumKg;
        thermo.circularMaterials.recycledAluminiumKg = 0;
        thermo.circularMaterials.recycledPetgKg = Math.max(0, thermo.circularMaterials.recycledPetgKg - rem);
      }
      thermo.energy.batteryStoredKwh -= vehicle.energyDrawKwh;
    } else if (commodityType === 'SPARE_PARTS') {
      // Deducts workshop labor or materials
      if (thermo.energy.batteryStoredKwh < vehicle.energyDrawKwh + 10) {
        return { success: false, reason: `Insufficient energy for precision machining spares!` };
      }
      thermo.energy.batteryStoredKwh -= (vehicle.energyDrawKwh + 10);
    }

    const transitTicks = this.calculateTransitTicks(origin, dest, vehicle);
    const returnCargo = isSolidarity ? null : this.calculateBarterReturn(originNodeId, destNodeId, commodityType, amount);

    const convoy = {
      id: `convoy-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
      name: `${vehicle.name} to ${dest.name}`,
      originNodeId,
      destNodeId,
      originName: origin.name,
      destName: dest.name,
      vehicleId,
      vehicleName: vehicle.name,
      vehicleIcon: vehicle.icon,
      distanceKm: calculateHaversineDistanceKm(origin.lat, origin.lng, dest.lat, dest.lng),
      outgoingCommodity: commodityType,
      outgoingCommodityName: commodity.name,
      outgoingUnit: commodity.unit,
      outgoingIcon: commodity.icon,
      outgoingAmount: amount,
      returnCargo,
      isSolidarity,
      status: 'OUTBOUND', // 'OUTBOUND' | 'EXCHANGING' | 'INBOUND' | 'COMPLETED'
      progressTicks: 0,
      transitTicks,
      totalTicks: isSolidarity ? Math.round(transitTicks * 1.8) : transitTicks * 2 + 1,
      createdAtTick: 0
    };

    this.convoys.push(convoy);

    // Solidarity mission bonus on morale immediately on departure
    if (isSolidarity && node) {
      node.communityMorale = Math.min(100, (node.communityMorale || 75) + 6);
      this.solidarityPacts.add(destNodeId);
    }

    return {
      success: true,
      convoy,
      message: `Convoy dispatched! ${vehicle.icon} ${vehicle.name} carrying ${amount.toLocaleString()} ${commodity.unit} ${commodity.icon} to ${dest.name}. ETA: ${transitTicks}h.`
    };
  }

  /**
   * Discrete tick loop for all active convoys
   */
  tick(currentTick, thermo, node) {
    const notifications = [];

    for (let i = this.convoys.length - 1; i >= 0; i--) {
      const c = this.convoys[i];
      c.progressTicks++;

      // Check Outbound -> Destination arrival (Unloading/Exchanging)
      if (c.status === 'OUTBOUND' && c.progressTicks >= c.transitTicks) {
        c.status = 'INBOUND';
        if (c.isSolidarity) {
          notifications.push({
            type: 'CONVOY_SOLIDARITY_DELIVERED',
            title: '🤝 Solidarity Cargo Delivered!',
            message: `Our mutual aid shipment arrived at ${c.destName}. The community expressed immense gratitude; federated resilience cemented!`
          });
        } else {
          notifications.push({
            type: 'CONVOY_ARRIVED_DEST',
            title: `🔄 Barter Exchanged at ${c.destName}`,
            message: `${c.vehicleIcon} ${c.vehicleName} unloaded ${c.outgoingAmount} ${c.outgoingUnit} and loaded ${c.returnCargo?.amount} ${c.returnCargo?.unit} of ${c.returnCargo?.name}. Returning home!`
          });
        }
      }

      // Check Inbound -> Home arrival (Delivered)
      if (c.status === 'INBOUND' && c.progressTicks >= c.totalTicks) {
        c.status = 'COMPLETED';
        this.convoys.splice(i, 1);
        this.convoyHistory.unshift({ ...c, completedAtTick: currentTick });

        if (c.returnCargo && thermo) {
          const ret = c.returnCargo;
          if (ret.commodity === 'ENERGY') {
            const space = thermo.energy.batteryCapacityKwh - thermo.energy.batteryStoredKwh;
            const added = Math.min(space, ret.amount);
            thermo.energy.batteryStoredKwh += added;
            this.totalGoodsExchanged.energyKwh += added;
          } else if (ret.commodity === 'WATER') {
            const space = thermo.water.cisternCapacityL - thermo.water.cisternStoredL;
            const added = Math.min(space, ret.amount);
            thermo.water.cisternStoredL += added;
            this.totalGoodsExchanged.waterL += added;
          } else if (ret.commodity === 'FOOD') {
            const space = thermo.food.granaryCapacityKcal - thermo.food.granaryStoredKcal;
            const added = Math.min(space, ret.amount);
            thermo.food.granaryStoredKcal += added;
            this.totalGoodsExchanged.foodKcal += added;
          } else if (ret.commodity === 'MATERIALS') {
            thermo.circularMaterials.recycledAluminiumKg += Math.round(ret.amount * 0.6);
            thermo.circularMaterials.recycledPetgKg += Math.round(ret.amount * 0.4);
            this.totalGoodsExchanged.materialsKg += ret.amount;
          } else if (ret.commodity === 'SPARE_PARTS') {
            // Repair all machinery by +15% durability!
            if (thermo.machinery) {
              for (const key of Object.keys(thermo.machinery)) {
                thermo.machinery[key].durability = Math.min(100, thermo.machinery[key].durability + 15);
              }
            }
            this.totalGoodsExchanged.spareParts += ret.amount;
          }

          if (node) {
            node.communityMorale = Math.min(100, (node.communityMorale || 75) + 8);
          }

          notifications.push({
            type: 'CONVOY_HOME_SAFE',
            title: '🏁 Trade Convoy Returned Home!',
            message: `${c.vehicleIcon} Successfully imported ${ret.amount.toLocaleString()} ${ret.unit} of ${ret.name} from ${c.destName}. Local reserves enriched!`
          });
        } else if (c.isSolidarity) {
          notifications.push({
            type: 'CONVOY_SOLIDARITY_RETURNED',
            title: '🕊️ Solidarity Fleet Re-docked',
            message: `${c.vehicleIcon} Caravan crew returned safely from ${c.destName}. Mutual trust between bioregions strengthened.`
          });
        }
      }
    }

    return notifications;
  }

  /**
   * Calculates interpolated geographical coordinates for Leaflet map rendering
   */
  getConvoyGeoPosition(convoy) {
    const origin = this.getNodeById(convoy.originNodeId);
    const dest = this.getNodeById(convoy.destNodeId);
    if (!origin || !dest) return null;

    let fraction = 0;
    if (convoy.status === 'OUTBOUND') {
      fraction = Math.min(1.0, convoy.progressTicks / convoy.transitTicks);
      return {
        lat: origin.lat + (dest.lat - origin.lat) * fraction,
        lng: origin.lng + (dest.lng - origin.lng) * fraction,
        fraction,
        headingOutbound: true
      };
    } else {
      // Inbound return journey
      const inboundTicks = convoy.progressTicks - convoy.transitTicks;
      const totalInbound = convoy.totalTicks - convoy.transitTicks;
      fraction = Math.min(1.0, Math.max(0, inboundTicks / totalInbound));
      return {
        lat: dest.lat + (origin.lat - dest.lat) * fraction,
        lng: dest.lng + (origin.lng - dest.lng) * fraction,
        fraction,
        headingOutbound: false
      };
    }
  }

  serialize() {
    return {
      convoys: this.convoys,
      convoyHistory: this.convoyHistory.slice(0, 20),
      solidarityPacts: Array.from(this.solidarityPacts),
      totalGoodsExchanged: this.totalGoodsExchanged
    };
  }

  deserialize(data) {
    if (!data) return;
    this.convoys = data.convoys || [];
    this.convoyHistory = data.convoyHistory || [];
    this.solidarityPacts = new Set(data.solidarityPacts || []);
    this.totalGoodsExchanged = data.totalGoodsExchanged || this.totalGoodsExchanged;
  }
}
