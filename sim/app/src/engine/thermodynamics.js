/**
 * Leontief & Thermodynamics Engine Craftsman (Agent SIM-1)
 * Physical substrate modeling 4 conserved flows (⚡ kWh, 💧 Liters, 🥗 kcal, 💻 Compute)
 * and Second-Law Entropy (Wear-and-Tear, Repair, Closed-Loop Circular Recycling).
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

export const WEATHER_TYPES = {
  SUNNY: { id: 'SUNNY', icon: '☀️', name: 'Sunny & Clear', cloudCover: 0.05, rainfallMmPerHour: 0.0, windSpeedKmh: 14, temperatureC: 24 },
  PARTLY_CLOUDY: { id: 'PARTLY_CLOUDY', icon: '⛅', name: 'Partly Cloudy', cloudCover: 0.35, rainfallMmPerHour: 0.0, windSpeedKmh: 18, temperatureC: 21 },
  OVERCAST: { id: 'OVERCAST', icon: '☁️', name: 'Overcast Skies', cloudCover: 0.85, rainfallMmPerHour: 0.0, windSpeedKmh: 22, temperatureC: 17 },
  RAIN: { id: 'RAIN', icon: '🌧️', name: 'Gentle Rain', cloudCover: 0.95, rainfallMmPerHour: 3.8, windSpeedKmh: 28, temperatureC: 15 },
  STORMY: { id: 'STORMY', icon: '⛈️', name: 'Thunderstorm', cloudCover: 1.0, rainfallMmPerHour: 14.5, windSpeedKmh: 58, temperatureC: 13 },
  HEATWAVE: { id: 'HEATWAVE', icon: '🌡️', name: 'Extreme Heatwave', cloudCover: 0.0, rainfallMmPerHour: 0.0, windSpeedKmh: 8, temperatureC: 39 },
  COLD_SNAP: { id: 'COLD_SNAP', icon: '❄️', name: 'Polar Cold Snap', cloudCover: 0.45, rainfallMmPerHour: 0.0, windSpeedKmh: 34, temperatureC: 1 }
};

export const DISASTER_TYPES = {
  HAILSTORM: {
    id: 'HAILSTORM',
    name: 'Severe Hailstorm',
    icon: '🧊',
    desc: 'Golf-ball sized hail cracks solar array glass and greenhouse polycarbonate!',
    durationHours: 6,
    machineryDamage: { solarInverters: 25, greenhouseHvac: 20 },
    solarPenalty: 0.5
  },
  FLASH_FLOOD: {
    id: 'FLASH_FLOOD',
    name: 'Flash Flood & River Swell',
    icon: '🌊',
    desc: 'Heavy torrential runoff silts up filtration systems and fills water basins to overflow!',
    durationHours: 8,
    machineryDamage: { waterPumpsFilters: 25 },
    waterSurgeL: 12000
  },
  GALE_WIND: {
    id: 'GALE_WIND',
    name: 'Gale-force Windstorm',
    icon: '🌪️',
    desc: 'Severe gusts trigger automatic turbine braking and align LoRa masts into safe mode!',
    durationHours: 12,
    machineryDamage: { fablabCnc3D: 10 },
    windSpeedKmh: 75
  },
  HEATWAVE_DROUGHT: {
    id: 'HEATWAVE_DROUGHT',
    name: 'Scorching Heat & Drought',
    icon: '☀️',
    desc: 'Persistent heatwave drives water evaporation and stresses battery cooling systems!',
    durationHours: 24,
    machineryDamage: { batteryBank: 15, greenhouseHvac: 15 },
    waterDemandMultiplier: 1.6
  }
};

export class ThermodynamicEngine {
  constructor(config = {}) {
    // ⚡ Energy (kWh)
    this.energy = {
      solarCapacityKw: config.solarCapacityKw ?? 120, // Peak kWp
      windCapacityKw: config.windCapacityKw ?? 40,   // Wind kW
      batteryCapacityKwh: config.batteryCapacityKwh ?? 350,
      batteryStoredKwh: config.batteryStoredKwh ?? 280,
      batteryHealth: 1.0, // [0, 1] wear
      gridConnected: config.gridConnected ?? true,
      islandMode: false,
      lastProductionKwh: 0,
      lastConsumptionKwh: 0,
      lastSolarKw: 0,
      lastWindKw: 0,
      isNight: false,
      netFlowKwh: 0
    };

    // 💧 Water (Liters)
    this.water = {
      cisternCapacityL: config.cisternCapacityL ?? 50000,
      cisternStoredL: config.cisternStoredL ?? 32000,
      wellPumpRateLph: config.wellPumpRateLph ?? 800, // Liters per hour if powered
      rainCollectorAreaM2: config.rainCollectorAreaM2 ?? 800,
      greywaterRecoveryRate: 0.65, // 65% greywater loop
      lastProductionL: 0,
      lastConsumptionL: 0,
      netFlowL: 0
    };

    // 🥗 Food, Calories & Agro-Ecological Sovereignty (kcal)
    this.food = {
      granaryCapacityKcal: config.granaryCapacityKcal ?? 3000000, // ~45 days for 30 people
      granaryStoredKcal: config.granaryStoredKcal ?? 1800000,
      greenhouseAreaM2: config.greenhouseAreaM2 ?? 600,
      openPermacultureAreaM2: config.openPermacultureAreaM2 ?? 1400,
      indoorYieldKcalPerHour: 1400, // High-density aeroponic/hydroponic arrays
      outdoorYieldKcalPerHour: 1000, // Regenerative permaculture, food forest & raised beds
      lastIndoorHarvestKcal: 0,
      lastOutdoorHarvestKcal: 0,
      lastProductionKcal: 0,
      lastConsumptionKcal: 0,
      netFlowKcal: 0,
      soilMoisturePct: 75,
      disasterLossKcal: 0,
      savedByResilienceKcal: 0,
      activeAgroStress: null
    };

    // 💻 Compute & Mesh Telecom (MFLOPS / Bandwidth)
    this.compute = {
      localClusterMflops: config.localClusterMflops ?? 8500,
      meshBandwidthMbps: config.meshBandwidthMbps ?? 100,
      usedMflops: 3200,
      nodeTelemetryStatus: 'HEALTHY' // HEALTHY | DEGRADED | ISLANDED
    };

    // ⚙️ Second-Law Entropy: Machines & Infrastructure Durability [0, 100]%
    // Now with Lifecycle Age (operatingHours, ageYears, and lifecycleHealth)
    this.machinery = {
      solarInverters: { 
        name: 'Solar Inverters & MPPT', 
        durability: 94, 
        operatingHours: 4200, 
        ageYears: 1.4, 
        lifecycleHealth: 96, 
        nominalCapacity: '120 kWp',
        leakRisk: false 
      },
      batteryBank: { 
        name: 'LiFePO4 Battery Cells', 
        durability: 91, 
        operatingHours: 8700, 
        ageYears: 2.1, 
        lifecycleHealth: 92, 
        nominalCapacity: '350 kWh',
        leakRisk: false 
      },
      waterPumpsFilters: { 
        name: 'Water Pumps & Reverse Osmosis', 
        durability: 88, 
        operatingHours: 5100, 
        ageYears: 1.8, 
        lifecycleHealth: 94, 
        nominalCapacity: '800 L/h',
        leakRisk: false 
      },
      fablabCnc3D: { 
        name: 'FabLab CNC Mills & 3D Printers', 
        durability: 85, 
        operatingHours: 6300, 
        ageYears: 2.5, 
        lifecycleHealth: 90, 
        nominalCapacity: '6 Stations',
        leakRisk: false 
      },
      greenhouseHvac: { 
        name: 'Bioclimatic Greenhouse HVAC', 
        durability: 92, 
        operatingHours: 7200, 
        ageYears: 2.0, 
        lifecycleHealth: 95, 
        nominalCapacity: '600 m²',
        leakRisk: false 
      }
    };

    // Circular Raw Materials Stored in FabLab (from recycling shredder)
    this.circularMaterials = {
      aluminumIngotsKg: 45,
      petgFilamentSpools: 18,
      copperWireMeters: 120,
      biocharKg: 350
    };

    // Dynamic Atmospheric & Meteorological State
    this.weather = {
      type: 'PARTLY_CLOUDY',
      icon: '⛅',
      name: 'Partly Cloudy',
      cloudCover: 0.35,
      rainfallMmPerHour: 0.0,
      windSpeedKmh: 18,
      temperatureC: 21,
      durationHoursLeft: 14,
      activeDisaster: null // Holds disaster object if an active disaster is underway
    };
  }

  /**
   * Advances meteorological cycle dynamically
   */
  updateWeather(currentTick) {
    // If an active disaster is occurring, decrement duration
    if (this.weather.activeDisaster) {
      this.weather.activeDisaster.durationHoursLeft--;
      if (this.weather.activeDisaster.durationHoursLeft <= 0) {
        console.log(`[Thermodynamics] Disaster ${this.weather.activeDisaster.name} has concluded.`);
        this.weather.activeDisaster = null;
      }
    }

    this.weather.durationHoursLeft--;
    if (this.weather.durationHoursLeft <= 0) {
      // Pick next weather based on natural weather transitions
      const types = ['SUNNY', 'PARTLY_CLOUDY', 'OVERCAST', 'RAIN', 'STORMY'];
      const r = Math.random();
      let nextType = 'PARTLY_CLOUDY';
      if (this.weather.type === 'SUNNY') {
        nextType = r < 0.6 ? 'PARTLY_CLOUDY' : (r < 0.85 ? 'SUNNY' : 'HEATWAVE');
      } else if (this.weather.type === 'PARTLY_CLOUDY') {
        nextType = r < 0.4 ? 'SUNNY' : (r < 0.8 ? 'OVERCAST' : 'RAIN');
      } else if (this.weather.type === 'OVERCAST') {
        nextType = r < 0.5 ? 'RAIN' : (r < 0.8 ? 'PARTLY_CLOUDY' : 'STORMY');
      } else if (this.weather.type === 'RAIN') {
        nextType = r < 0.4 ? 'OVERCAST' : (r < 0.7 ? 'PARTLY_CLOUDY' : (r < 0.85 ? 'RAIN' : 'STORMY'));
      } else if (this.weather.type === 'STORMY') {
        nextType = r < 0.6 ? 'RAIN' : 'OVERCAST';
      } else {
        nextType = 'PARTLY_CLOUDY';
      }

      const wConfig = WEATHER_TYPES[nextType] || WEATHER_TYPES.PARTLY_CLOUDY;
      this.weather.type = wConfig.id;
      this.weather.icon = wConfig.icon;
      this.weather.name = wConfig.name;
      this.weather.cloudCover = wConfig.cloudCover;
      this.weather.rainfallMmPerHour = wConfig.rainfallMmPerHour;
      this.weather.windSpeedKmh = wConfig.windSpeedKmh + Math.floor((Math.random() - 0.5) * 6);
      this.weather.temperatureC = wConfig.temperatureC + Math.floor((Math.random() - 0.5) * 4);
      this.weather.durationHoursLeft = 12 + Math.floor(Math.random() * 24); // 12 to 36 hours duration
    }

    // Rare chance of spontaneous disaster every ~72-120 ticks if none is active
    if (!this.weather.activeDisaster && Math.random() < 0.005) { // ~0.5% per hour
      const disasterKeys = Object.keys(DISASTER_TYPES);
      const chosenKey = disasterKeys[Math.floor(Math.random() * disasterKeys.length)];
      this.triggerDisaster(chosenKey);
    }
  }

  /**
   * Manually or dynamically triggers a meteorological disaster
   */
  triggerDisaster(disasterKey) {
    const template = DISASTER_TYPES[disasterKey];
    if (!template) return false;

    this.weather.activeDisaster = {
      ...template,
      durationHoursLeft: template.durationHours
    };

    // Apply immediate damage
    if (template.machineryDamage) {
      for (const [mKey, damage] of Object.entries(template.machineryDamage)) {
        if (this.machinery[mKey]) {
          this.machinery[mKey].durability = Math.max(0, this.machinery[mKey].durability - damage);
          if (this.machinery[mKey].durability < 20) {
            this.machinery[mKey].leakRisk = true;
          }
        }
      }
    }

    // Apply surge water if flood
    if (template.waterSurgeL) {
      this.water.cisternStoredL = Math.min(this.water.cisternCapacityL, this.water.cisternStoredL + template.waterSurgeL);
    }

    // Switch weather state to match disaster
    if (disasterKey === 'HAILSTORM' || disasterKey === 'FLASH_FLOOD') {
      this.weather.type = 'STORMY';
      this.weather.icon = '⛈️';
      this.weather.name = 'Violent Storm';
      this.weather.rainfallMmPerHour = 18.0;
      this.weather.cloudCover = 1.0;
    } else if (disasterKey === 'GALE_WIND') {
      this.weather.windSpeedKmh = template.windSpeedKmh || 75;
      this.weather.icon = '🌪️';
    } else if (disasterKey === 'HEATWAVE_DROUGHT') {
      this.weather.type = 'HEATWAVE';
      this.weather.icon = '🌡️';
      this.weather.name = 'Extreme Heatwave';
      this.weather.temperatureC = 41;
    }

    return this.weather.activeDisaster;
  }

  /**
   * Calculates instantaneous solar insolation factor based on hour of day (0 - 23)
   */
  getSolarFactor(hour) {
    if (hour < 6 || hour > 20) return 0;
    // Bell curve between 6:00 and 20:00, peak at 13:00
    const normalized = (hour - 6) / 14; // 0 to 1
    const rawSun = Math.sin(normalized * Math.PI);
    const cloudPenalty = 1 - this.weather.cloudCover * 0.75;
    return Math.max(0, rawSun * cloudPenalty);
  }

  /**
   * Main discrete thermodynamic step (1 tick = 1 hour)
   * @param {number} hour 0-23
   * @param {number} population Citizen count
   * @param {object} choreAllocation Active labor assignments
   */
  tick(hour, population, choreAllocation = {}, options = {}) {
    // -------------------------------------------------------------
    // 0. 🌤️ METEOROLOGICAL UPDATE
    // -------------------------------------------------------------
    this.updateWeather();

    // -------------------------------------------------------------
    // 1. ⚡ ENERGY STEP
    // -------------------------------------------------------------
    const isNight = (hour < 6 || hour >= 21);
    this.energy.isNight = isNight;

    const sunFactor = this.getSolarFactor(hour);
    let solarGen = isNight ? 0 : this.energy.solarCapacityKw * sunFactor;
    
    // Disaster penalty (e.g. Hailstorm cracked solar cells)
    if (this.weather.activeDisaster?.solarPenalty && !isNight) {
      solarGen *= this.weather.activeDisaster.solarPenalty;
    }

    // Wind generation (cut-in 10 km/h, rated at 45 km/h, max storm shutoff 65 km/h)
    let windFactor = 0;
    if (this.weather.windSpeedKmh >= 10 && this.weather.windSpeedKmh <= 65) {
      windFactor = Math.min(1.0, (this.weather.windSpeedKmh - 10) / 35);
    } else if (this.weather.windSpeedKmh > 65) {
      // Automatic safety brake during extreme storm
      windFactor = 0.15;
    }
    const windGen = this.energy.windCapacityKw * windFactor;

    this.energy.lastSolarKw = Math.round(solarGen * 10) / 10;
    this.energy.lastWindKw = Math.round(windGen * 10) / 10;
    const totalEnergyGen = solarGen + windGen;

    // Energy consumption:
    // Base life support ~0.4 kWh/capita/hour (lighting, basic appliances)
    const residentialDemand = population * 0.4;
    // Greenhouse lighting/climate ~15 kWh
    const greenhouseDemand = (hour < 7 || hour > 19) ? 12 : 6;
    // Water pumps & purification ~8 kWh
    const waterSystemDemand = 7.5;
    // FabLab machinery (scales with active workshop labor)
    const workshopLabor = choreAllocation.workshop || 0;
    const fablabDemand = 5 + workshopLabor * 2.5;
    // Compute cluster ~4 kWh
    const computeDemand = 4.2;

    // Temperature HVAC impact (Heating below 12°C, Cooling above 28°C)
    let hvacThermalDemand = 0;
    if (this.weather.temperatureC < 12) {
      hvacThermalDemand = (12 - this.weather.temperatureC) * 0.75;
    } else if (this.weather.temperatureC > 28) {
      hvacThermalDemand = (this.weather.temperatureC - 28) * 1.1;
    }

    // Machinery wear & aging penalty:
    // Lifecycle health degrades nominal conversion efficiency
    const inverterLifecycle = (this.machinery.solarInverters.lifecycleHealth || 100) / 100;
    const inverterEfficiency = (this.machinery.solarInverters.durability < 20 ? 0.80 : 0.96) * inverterLifecycle;
    const effectiveGen = totalEnergyGen * inverterEfficiency;
    const totalEnergyDemand = residentialDemand + greenhouseDemand + waterSystemDemand + fablabDemand + computeDemand + hvacThermalDemand;

    const energyDelta = effectiveGen - totalEnergyDemand;
    this.energy.lastProductionKwh = effectiveGen;
    this.energy.lastConsumptionKwh = totalEnergyDemand;
    this.energy.netFlowKwh = energyDelta;

    if (energyDelta >= 0) {
      // Surplus: charge battery bank with 92% roundtrip efficiency
      const chargeRate = energyDelta * 0.92;
      const batteryMaxCap = this.energy.batteryCapacityKwh * this.energy.batteryHealth * ((this.machinery.batteryBank.lifecycleHealth || 100) / 100);
      const spaceAvailable = batteryMaxCap - this.energy.batteryStoredKwh;
      this.energy.batteryStoredKwh += Math.min(chargeRate, Math.max(0, spaceAvailable));
    } else {
      // Deficit: discharge battery bank
      const deficit = Math.abs(energyDelta);
      if (this.energy.batteryStoredKwh >= deficit) {
        this.energy.batteryStoredKwh -= deficit;
      } else {
        // Battery depleted! Island brownout or reliance on external grid
        this.energy.batteryStoredKwh = 0;
      }
    }

    // -------------------------------------------------------------
    // 2. 💧 WATER STEP
    // -------------------------------------------------------------
    // Rain catchment from dynamic weather
    const rainLiters = this.water.rainCollectorAreaM2 * (this.weather.rainfallMmPerHour || 0);
    // Well extraction (if battery > 10% or surplus energy available)
    const pumpActive = this.energy.batteryStoredKwh > 15;
    const pumpedWater = pumpActive ? this.water.wellPumpRateLph : 0;
    const totalWaterInflow = rainLiters + pumpedWater;

    // Consumption:
    // Biometric requirement: ~1.5 L/capita/hour for hydration, cooking, hygiene
    const humanWaterUse = population * 1.5;
    // Greenhouse irrigation (scales with temperature and drought multiplier)
    const droughtMult = this.weather.activeDisaster?.waterDemandMultiplier || (this.weather.temperatureC > 30 ? 1.35 : 1.0);
    const greenhouseWater = (18 + (this.food.greenhouseAreaM2 / 50)) * droughtMult;
    // FabLab cooling & cleaning ~5 L/hour
    const workshopWater = 5;

    // Machinery wear penalty: if pumps/filters < 20%, 25% water leakage
    const pumpLifecycle = (this.machinery.waterPumpsFilters.lifecycleHealth || 100) / 100;
    const leakFactor = (this.machinery.waterPumpsFilters.durability < 20 ? 1.25 : 1.0) / Math.max(0.7, pumpLifecycle);
    const totalWaterDemand = (humanWaterUse + greenhouseWater + workshopWater) * leakFactor;

    // Greywater loop: recovers 65% of human sanitation water back to treatment
    const recoveredGreywater = humanWaterUse * this.water.greywaterRecoveryRate;
    const netWaterDelta = totalWaterInflow + recoveredGreywater - totalWaterDemand;

    this.water.lastProductionL = totalWaterInflow + recoveredGreywater;
    this.water.lastConsumptionL = totalWaterDemand;
    this.water.netFlowL = netWaterDelta;

    this.water.cisternStoredL = Math.max(
      0,
      Math.min(this.water.cisternCapacityL, this.water.cisternStoredL + netWaterDelta)
    );

    // -------------------------------------------------------------
    // 3. 🥗 FOOD & CALORIES STEP (DUAL-TRACK AGRO-ECOLOGY & RESILIENCE)
    // -------------------------------------------------------------
    const agroResilience = options.agroResilience || {};
    const robots = options.robots || {};
    const agriLabor = choreAllocation.agriculture || 1;

    // Human biological floor: ~91.7 kcal/capita/hour (2,200 kcal/die)
    const hourlyBiometricDemand = population * (2200 / 24);

    // --- SOIL MOISTURE DYNAMICS ---
    let moistureDelta = -0.7; // Base hourly evapotranspiration
    if (this.weather.temperatureC > 26) {
      moistureDelta -= (this.weather.temperatureC - 26) * 0.15;
    }
    if (this.weather.rainIntensity > 0) {
      moistureDelta += this.weather.rainIntensity * 12;
    }
    // Permaculture Mulch & Biochar retains 60% of moisture loss
    if (moistureDelta < 0 && agroResilience.permacultureMulch?.installed) {
      moistureDelta *= 0.4;
    }
    // Automated or manual irrigation
    if (this.water.cisternStoredL > 500) {
      const irrAmt = robots.esp32Valves?.count > 0 ? 1.8 : 1.2;
      moistureDelta += irrAmt;
    }
    this.food.soilMoisturePct = Math.max(15, Math.min(100, (this.food.soilMoisturePct || 75) + moistureDelta));

    // --- PILLAR 1: INDOOR BIOCLIMATIC HYDROPONICS / AEROPONICS ---
    // High-density vertical towers inside the geodesic dome
    const waterMultiplier = this.water.cisternStoredL > 400 ? 1.0 : (this.water.cisternStoredL > 100 ? 0.55 : 0.2);
    const powerMultiplier = this.energy.batteryStoredKwh > 10 ? 1.0 : (this.energy.batteryStoredKwh > 2 ? 0.55 : 0.25);
    const hvacLifecycle = (this.machinery.greenhouseHvac.lifecycleHealth || 100) / 100;
    const hvacDurability = (this.machinery.greenhouseHvac.durability || 100) / 100;
    const indoorLaborBonus = 0.85 + (agriLabor * 0.05) + (robots.farmRover?.count ? 0.08 : 0);

    // Thermal stress inside dome: If ambient > 33°C, greenhouse requires active cooling
    let indoorThermalMult = 1.0;
    if (this.weather.temperatureC > 33) {
      const hvacCoolingEffective = hvacDurability * hvacLifecycle;
      indoorThermalMult = Math.max(0.45, 0.70 + (0.30 * hvacCoolingEffective));
    }

    const indoorHarvest = this.food.indoorYieldKcalPerHour * indoorLaborBonus * waterMultiplier * powerMultiplier * hvacLifecycle * indoorThermalMult;

    // --- PILLAR 2: OUTDOOR REGENERATIVE PERMACULTURE & FOOD FOREST ---
    // Exposed open fields, polyculture beds, berries, agroforestry
    const solarFactor = 0.35 + 0.65 * (this.weather.solarMultiplier || 1.0);
    const outdoorLaborBonus = 0.80 + (agriLabor * 0.08);
    
    // Soil moisture optimal between 45% and 85%
    let soilFactor = 0.85;
    if (this.food.soilMoisturePct >= 45 && this.food.soilMoisturePct <= 85) {
      soilFactor = 1.08;
    } else if (this.food.soilMoisturePct < 30) {
      soilFactor = 0.55; // Drought stress
    } else if (this.food.soilMoisturePct > 92 && !agroResilience.keylineSwales?.installed) {
      soilFactor = 0.60; // Waterlogged roots
    }

    let weatherBonus = 1.0;
    if (this.weather.type === 'RAIN') weatherBonus = 1.15;
    else if (this.weather.type === 'SUNNY') weatherBonus = 1.10;

    const potentialOutdoor = this.food.outdoorYieldKcalPerHour * solarFactor * outdoorLaborBonus * soilFactor * weatherBonus;

    // --- METEOROLOGICAL DISASTER & RESILIENCE MITIGATION ON OUTDOOR CROPS ---
    let grossLossPct = 0;
    let mitigationPct = 0;
    const activeMitigationNames = [];
    const disaster = this.weather.activeDisaster;

    if (disaster) {
      if (disaster.type === 'HAIL') {
        grossLossPct = 0.75;
        if (agroResilience.hailNetting?.installed) {
          mitigationPct += 0.85;
          activeMitigationNames.push('Anti-Hail Netting (-85% damage)');
        }
        if (agriLabor >= 3 || robots.farmRover?.count > 0) {
          mitigationPct += 0.10;
          activeMitigationNames.push('Emergency Canopy Deploy (-10%)');
        }
      } else if (disaster.type === 'FLOOD') {
        grossLossPct = 0.65;
        if (agroResilience.keylineSwales?.installed) {
          mitigationPct += 0.80;
          activeMitigationNames.push('Keyline Bioswales (-80% damage)');
        }
        if (agriLabor >= 2) {
          mitigationPct += 0.12;
          activeMitigationNames.push('Ditch Maintenance (-12%)');
        }
      } else if (disaster.type === 'GALE') {
        grossLossPct = 0.55;
        if (agroResilience.agroforestryWindbreak?.installed) {
          mitigationPct += 0.75;
          activeMitigationNames.push('Windbreak Hedgerow (-75% damage)');
        }
        if (robots.farmRover?.count > 0) {
          mitigationPct += 0.10;
          activeMitigationNames.push('Rover Wind-Ties (-10%)');
        }
      } else if (disaster.type === 'DROUGHT') {
        grossLossPct = 0.60;
        if (agroResilience.permacultureMulch?.installed) {
          mitigationPct += 0.70;
          activeMitigationNames.push('Biochar & Straw Mulch (-70% damage)');
        }
        if (robots.esp32Valves?.count > 0) {
          mitigationPct += 0.20;
          activeMitigationNames.push('ESP32 Smart Pulse Drip (-20%)');
        }
      }
    } else if (this.weather.type === 'COLD_SNAP') {
      grossLossPct = 0.45;
      if (agroResilience.permacultureMulch?.installed) {
        mitigationPct += 0.50;
        activeMitigationNames.push('Mulch Thermal Ground Cover (-50%)');
      }
    }

    const clampedMitigation = Math.min(0.95, mitigationPct);
    const netLossPct = grossLossPct * (1 - clampedMitigation);
    const outdoorHarvest = potentialOutdoor * (1 - netLossPct);

    const disasterLossKcal = potentialOutdoor * netLossPct;
    const savedByResilienceKcal = potentialOutdoor * (grossLossPct * clampedMitigation);

    this.food.lastIndoorHarvestKcal = indoorHarvest;
    this.food.lastOutdoorHarvestKcal = outdoorHarvest;
    this.food.disasterLossKcal = disasterLossKcal;
    this.food.savedByResilienceKcal = savedByResilienceKcal;

    if (grossLossPct > 0) {
      this.food.activeAgroStress = {
        disasterType: disaster ? disaster.type : 'COLD_SNAP',
        name: disaster ? disaster.name : 'Cold Snap Frost',
        grossLossPct: Math.round(grossLossPct * 100),
        netLossPct: Math.round(netLossPct * 100),
        mitigatedPct: Math.round(clampedMitigation * 100),
        lostKcalPerHour: Math.round(disasterLossKcal),
        savedKcalPerHour: Math.round(savedByResilienceKcal),
        activeMitigations: activeMitigationNames
      };
    } else {
      this.food.activeAgroStress = null;
    }

    // --- TOTAL HARVEST & GRANARY BUFFER UPDATE ---
    const hourlyHarvest = indoorHarvest + outdoorHarvest;
    const foodDelta = hourlyHarvest - hourlyBiometricDemand;
    this.food.lastProductionKcal = hourlyHarvest;
    this.food.lastConsumptionKcal = hourlyBiometricDemand;
    this.food.netFlowKcal = foodDelta;

    this.food.granaryStoredKcal = Math.max(
      0,
      Math.min(this.food.granaryCapacityKcal, this.food.granaryStoredKcal + foodDelta)
    );

    // -------------------------------------------------------------
    // 4. ⚙️ SECOND-LAW ENTROPY & INFRASTRUCTURE AGING STEP
    // -------------------------------------------------------------
    const baseWear = 0.025; // 0.025% per hour -> ~0.6% per day
    this.machinery.solarInverters.durability = Math.max(0, this.machinery.solarInverters.durability - baseWear * 0.8);
    this.machinery.batteryBank.durability = Math.max(0, this.machinery.batteryBank.durability - baseWear * 0.6);
    this.machinery.waterPumpsFilters.durability = Math.max(0, this.machinery.waterPumpsFilters.durability - baseWear * 1.1);
    this.machinery.fablabCnc3D.durability = Math.max(0, this.machinery.fablabCnc3D.durability - baseWear * (0.5 + workshopLabor * 0.3));
    this.machinery.greenhouseHvac.durability = Math.max(0, this.machinery.greenhouseHvac.durability - baseWear * 0.7);

    // Advance operating hours and slow lifecycle degradation (~0.001% per hour, ~0.7% per month)
    for (const key of Object.keys(this.machinery)) {
      const m = this.machinery[key];
      m.operatingHours = (m.operatingHours || 0) + 1;
      m.ageYears = Number(((m.operatingHours) / 8760).toFixed(2));
      m.lifecycleHealth = Math.max(65, Number(((m.lifecycleHealth || 100) - 0.0008).toFixed(4)));
      m.leakRisk = m.durability < 20;
    }
  }

  /**
   * Artisan Preventive Maintenance Action
   * Restores short-term equipment durability back to 100%.
   */
  repairMachinery(key) {
    if (!this.machinery[key]) return false;
    this.machinery[key].durability = 100;
    this.machinery[key].leakRisk = false;
    return true;
  }

  /**
   * Capital Overhaul / Closed-Loop Rebuild in FabLab
   * Uses circular raw materials (aluminum, PETG, copper) to rebuild an aged machine,
   * restoring lifecycleHealth to 100% and operating hours to zero.
   */
  rebuildMachinery(key) {
    const m = this.machinery[key];
    if (!m) return false;

    // Check material cost
    const alCost = 10;
    const petgCost = 3;
    const cuCost = 15;

    if (
      this.circularMaterials.aluminumIngotsKg >= alCost &&
      this.circularMaterials.petgFilamentSpools >= petgCost &&
      this.circularMaterials.copperWireMeters >= cuCost
    ) {
      this.circularMaterials.aluminumIngotsKg -= alCost;
      this.circularMaterials.petgFilamentSpools -= petgCost;
      this.circularMaterials.copperWireMeters -= cuCost;

      m.durability = 100;
      m.lifecycleHealth = 100;
      m.operatingHours = 0;
      m.ageYears = 0.0;
      m.leakRisk = false;
      return true;
    }
    return false;
  }

  /**
   * Closed-Loop Circular Shredder / Smelter Action (FabLab Upcycle)
   * Converts broken hardware into raw 3D printing filament, metal ingots & biochar.
   */
  recycleHardware(category) {
    if (category === 'metals') {
      this.circularMaterials.aluminumIngotsKg += 12;
      this.circularMaterials.copperWireMeters += 25;
    } else if (category === 'plastics') {
      this.circularMaterials.petgFilamentSpools += 4;
    } else if (category === 'biomass') {
      this.circularMaterials.biocharKg += 50;
      // Biochar boosts greenhouse yield by 2%
      this.food.hydroponicYieldKcalPerHour *= 1.02;
    }
    return this.circularMaterials;
  }

  /**
   * Summary metrics for HUD & UI
   */
  getSnapshot() {
    return {
      energy: {
        currentKwh: Math.round(this.energy.batteryStoredKwh),
        capacityKwh: Math.round(this.energy.batteryCapacityKwh * this.energy.batteryHealth * ((this.machinery.batteryBank.lifecycleHealth || 100) / 100)),
        percent: Math.round((this.energy.batteryStoredKwh / (this.energy.batteryCapacityKwh * this.energy.batteryHealth)) * 100),
        netDelta: Number(this.energy.netFlowKwh.toFixed(1)),
        isSolarActive: !this.energy.isNight && this.energy.lastSolarKw > 1,
        solarKw: this.energy.lastSolarKw,
        windKw: this.energy.lastWindKw,
        isNight: this.energy.isNight
      },
      water: {
        currentL: Math.round(this.water.cisternStoredL),
        capacityL: this.water.cisternCapacityL,
        percent: Math.round((this.water.cisternStoredL / this.water.cisternCapacityL) * 100),
        netDelta: Number(this.water.netFlowL.toFixed(0))
      },
      food: {
        currentKcal: Math.round(this.food.granaryStoredKcal),
        capacityKcal: this.food.granaryCapacityKcal,
        percent: Math.round((this.food.granaryStoredKcal / this.food.granaryCapacityKcal) * 100),
        daysRemaining: Number((this.food.granaryStoredKcal / (30 * 2200)).toFixed(1)),
        netDelta: Number(this.food.netFlowKcal.toFixed(0)),
        lastIndoorHarvestKcal: Math.round(this.food.lastIndoorHarvestKcal || 0),
        lastOutdoorHarvestKcal: Math.round(this.food.lastOutdoorHarvestKcal || 0),
        lastTotalHarvestKcal: Math.round(this.food.lastProductionKcal || 0),
        lastDemandKcal: Math.round(this.food.lastConsumptionKcal || 0),
        soilMoisturePct: Math.round(this.food.soilMoisturePct || 70),
        disasterLossKcal: Math.round(this.food.disasterLossKcal || 0),
        savedByResilienceKcal: Math.round(this.food.savedByResilienceKcal || 0),
        activeAgroStress: this.food.activeAgroStress
      },
      compute: {
        status: this.compute.nodeTelemetryStatus,
        mflops: this.compute.localClusterMflops,
        pingMs: 12
      },
      weather: this.weather,
      machinery: this.machinery,
      circularMaterials: this.circularMaterials
    };
  }
}
