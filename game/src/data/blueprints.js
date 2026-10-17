/**
 * O.N.E. Dual-Track Open Hardware Blueprint Catalog & Archetypes
 * Art. 7: Every in-game simulation achievement corresponds to verified,
 * real-world open-hardware engineering blueprints (3D printable STL files
 * and Home Assistant Zigbee/MQTT automation YAML configurations).
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import * as THREE from 'three';

export const ONE_ASCII_BANNER = `# ==========================================================
#    ██████╗         ███╗   ██╗███████╗
#   ██╔═══██╗        ████╗  ██║██╔════╝
#   ██║   ██║        ██╔██╗ ██║█████╗  
#   ██║   ██║        ██║╚██╗██║██╔══╝  
#   ╚██████╔╝        ██║ ╚████║███████╗
#    ╚═════╝PEN      ╚═╝  ╚═══╝╚══════╝ETWORKED EARTH
# ==========================================================
# OFFICIAL O.N.E. DUAL-TRACK OPEN HARDWARE PACKAGE
# Usufruct License: AGPL-3.0-or-later
# ==========================================================`;

export const BLUEPRINT_ARCHETYPES = {
  // 1. MHU Couple Pod
  mhu_couple: {
    id: 'mhu_couple',
    name: 'Modular Habitat Unit — Couple Pod',
    category: 'HOUSING',
    tagline: 'Passivhaus single-bay modular dwelling with attached 30m² permaculture apron',
    description: 'Precision CNC-machined Cross-Laminated Timber (CLT) dwelling ($18-24 m²). Features 140mm Gutex wood-fiber insulation, 50mm decoupled service cavity, living sedum green roof, and 2-guest sleeping loft buffer (Capacity: 4). Stamped with official O.N.E. Usufruct medallion.',
    scaleMiniature: '1:50 (Printable: 88mm x 54mm x 48mm)',
    scaleReal: '1:1 (Real: 6.0m x 3.6m x 3.2m)',
    printSpecs: {
      layerHeight: '0.20 mm',
      infill: '15% Gyroid',
      supports: 'None (Self-supporting modular cassette walls)',
      material: 'Woodfill PLA / Recycled PETG'
    },
    bom: [
      { item: 'CLT 5-ply Wall Panels (100mm)', qty: '14 panels', source: 'Bioregional Sawmill / CNC' },
      { item: 'Gutex Thermosafe Woodfiber Insulation', qty: '45 m²', source: 'Circular Bio-materials' },
      { item: 'Triple-Glazed Argon Windows (Ug 0.6)', qty: '3 units', source: 'Regional Glazing Cooperative' },
      { item: 'Sedum Roof Substrate & Root Barrier', qty: '30 m²', source: 'Bioregional Nursery' },
      { item: 'ESP32 Room Climate / Air Quality Node', qty: '1 kit', source: 'Open Hardware FabLab' }
    ],
    yamlContent: `${ONE_ASCII_BANNER}
# MHU COUPLE POD PASSIVE-SOLAR CLIMATE & HRV AUTOMATION
# Entity: climate.mhu_couple_hvac
# ==========================================================

sensor:
  - platform: dht
    pin: GPIO22
    temperature:
      name: "MHU Couple Indoor Temperature"
      id: mhu_couple_temp
    humidity:
      name: "MHU Couple Indoor Humidity"
      id: mhu_couple_hum
    model: DHT22
    update_interval: 30s

  - platform: mhz19
    co2:
      name: "MHU Couple CO2 Concentration"
      id: mhu_couple_co2
    uart_id: uart_bus
    update_interval: 60s

switch:
  - platform: gpio
    pin: GPIO18
    name: "MHU Heat Recovery Ventilator (HRV)"
    id: mhu_hrv_fan

climate:
  - platform: thermostat
    name: "MHU Thermal Comfort Controller"
    sensor: mhu_couple_temp
    min_heating_off_time: 300s
    min_heating_run_time: 300s
    default_target_temperature_low: 19.5 °C
    default_target_temperature_high: 22.0 °C

automation:
  - id: 'mhu_co2_flush_purge'
    alias: '[O.N.E.] Automated Fresh Air Flush at 800ppm CO2'
    trigger:
      - platform: numeric_state
        entity_id: sensor.mhu_couple_co2
        above: 800
    action:
      - service: switch.turn_on
        target:
          entity_id: switch.mhu_hrv_fan
      - delay: '00:15:00'
      - service: switch.turn_off
        target:
          entity_id: switch.mhu_hrv_fan`
  },

  // 2. MHU Family Cluster
  mhu_family: {
    id: 'mhu_family',
    name: 'Modular Habitat Unit — Family Cluster',
    category: 'HOUSING',
    tagline: 'Multi-bay intergenerational pavilion with central glazed atrium & 60m² kitchen apron',
    description: 'Expanded modular timber structure ($45-54 m²) for 4 permanent residents + 2 guest buffer (Capacity: 6). Zero-step ramp access, acoustic-isolated children nooks, central sun atrium for passive winter solar gain, and sub-irrigated kitchen garden apron.',
    scaleMiniature: '1:50 (Printable: 130mm x 110mm x 52mm)',
    scaleReal: '1:1 (Real: 9.0m x 7.5m x 3.6m)',
    printSpecs: {
      layerHeight: '0.20 mm',
      infill: '15% Gyroid',
      supports: 'Touching buildplate only',
      material: 'PETG / Woodfill PLA'
    },
    bom: [
      { item: 'CLT Glulam Beams & Multi-Bay Posts', qty: '28 beams', source: 'Bioregional Timber Yard' },
      { item: 'Chamomile Green Roof Seed Mats', qty: '65 m²', source: 'Bioregional Nursery' },
      { item: 'Double-Skin Polycarbonate Skylight', qty: '12 m²', source: 'Regional Glazing Cooperative' },
      { item: 'Underfloor Radiant PEX Hydronic Loop', qty: '120 m', source: 'FabLab Plumbing Shop' },
      { item: 'Zigbee 8-Zone Smart Radiator Valves', qty: '4 units', source: 'Open Hardware FabLab' }
    ],
    yamlContent: `${ONE_ASCII_BANNER}
# MHU FAMILY CLUSTER ATRIUM VENTILATION & RAINWATER DUAL LOOP
# ==========================================================

automation:
  - id: 'mhu_family_atrium_summer_cooling'
    alias: '[O.N.E.] Passive Atrium Thermal Chimney Purge'
    trigger:
      - platform: numeric_state
        entity_id: sensor.mhu_atrium_temp
        above: 25.0
    condition:
      - condition: numeric_state
        entity_id: sensor.outdoor_temp
        below: 23.0
    action:
      - service: cover.open_cover
        target:
          entity_id: cover.atrium_clerestory_louvers
      - service: notify.settlement_log
        data:
          message: "Passive stack cooling active in Family MHU atrium."`
  },

  // 3. MHU Workshop Loft
  mhu_studio: {
    id: 'mhu_studio',
    name: 'MHU Workshop Loft & Prototyping Laboratory',
    category: 'FABRICATION',
    tagline: 'Living loft perched over LinuxCNC rapid-prototyping lab (+15% research speed)',
    description: 'Two-story hybrid timber/steel structure. Ground floor houses a 3-axis CNC router, resin 3D printers, electronics workstation, and dust extraction manifold. Upper mezzanine provides quiet living quarters for resident craft engineers.',
    scaleMiniature: '1:50 (Printable: 95mm x 65mm x 72mm)',
    scaleReal: '1:1 (Real: 6.8m x 4.5m x 5.0m)',
    printSpecs: {
      layerHeight: '0.20 mm',
      infill: '20%',
      supports: 'None',
      material: 'Tough PLA / PETG'
    },
    bom: [
      { item: 'Welded Steel Box Section Framing (100x100mm)', qty: '16 sections', source: 'Settlement Foundry' },
      { item: 'Acoustic Rockwool Baffles (Mezzanine Floor)', qty: '32 m²', source: 'Circular Bio-materials' },
      { item: 'High-CFM HEPA Dust Extraction Cyclone', qty: '1 unit', source: 'FabLab Mechanics Shop' },
      { item: 'LinuxCNC 3-Axis Controller & Stepper Drivers', qty: '1 rack', source: 'Open Hardware Electronics' }
    ],
    yamlContent: `${ONE_ASCII_BANNER}
# WORKSHOP LOFT CNC SAFETY & AUTOMATED DUST EXTRACTOR
# ==========================================================

automation:
  - id: 'workshop_cnc_cyclone_sync'
    alias: '[O.N.E.] Auto-Trigger Cyclone Dust Extraction on Spindle Start'
    trigger:
      - platform: numeric_state
        entity_id: sensor.linuxcnc_spindle_current_amps
        above: 1.5
    action:
      - service: switch.turn_on
        target:
          entity_id: switch.cyclone_vacuum_blastgate
      - service: switch.turn_on
        target:
          entity_id: switch.workshop_air_scrubber`
  },

  // 4. Communal Bathhouse & Sauna
  mhu_bathhouse: {
    id: 'mhu_bathhouse',
    name: 'Communal Solar Bathhouse & Cedar Sauna',
    category: 'CIVIC',
    tagline: 'Solar-thermal vacuum tube hot water heating with greywater reed-bed loop (+15 Morale)',
    description: 'Nordic-style communal bathhouse featuring an 85°C Finnish sauna lined with fragrant Western red cedar, wood-fired stone thermal mass heater, evacuated tube solar water preheaters, and gravity-fed greywater discharge into biological reed-beds.',
    scaleMiniature: '1:50 (Printable: 100mm x 70mm x 55mm)',
    scaleReal: '1:1 (Real: 7.2m x 5.0m x 3.8m)',
    printSpecs: {
      layerHeight: '0.20 mm',
      infill: '15%',
      supports: 'Touching buildplate only',
      material: 'Woodfill PLA'
    },
    bom: [
      { item: 'Aroma Cedar Tongue & Groove Planks', qty: '120 m²', source: 'Bioregional Timber Mill' },
      { item: 'Soapstone / Peridotite Sauna Heating Stones', qty: '150 kg', source: 'Local Karst Quarry' },
      { item: 'Solar Thermal Evacuated Vacuum Tubes (30 tubes)', qty: '2 manifolds', source: 'Regional Clean Energy Coop' },
      { item: 'PEX 1000L Insulated Thermal Storage Buffer', qty: '1 tank', source: 'Plumbing Commons' }
    ],
    yamlContent: `${ONE_ASCII_BANNER}
# COMMUNAL SAUNA THERMAL MASS & GREYWATER FLOW MONITOR
# ==========================================================

sensor:
  - platform: max6675
    name: "Sauna Stone Thermal Core"
    cs_pin: GPIO15
    update_interval: 10s

automation:
  - id: 'bathhouse_evening_sauna_ready'
    alias: '[O.N.E.] Announce Evening Sauna at 80°C'
    trigger:
      - platform: numeric_state
        entity_id: sensor.sauna_stone_thermal_core
        above: 80.0
    action:
      - service: notify.agora_mesh_broadcast
        data:
          title: "♨️ Evening Communal Sauna is Ready!"
          message: "Core thermal mass is at 80°C. Scented eucalyptus lian water prepared."`
  },

  // 5. Open Forest School & Nursery
  school_nursery: {
    id: 'school_nursery',
    name: 'Open Forest School & Discovery Nursery',
    category: 'EDUCATION',
    tagline: 'Reciprocal-roof hexagonal gazebo, outdoor blackboard & nature scouting (+15% resilience)',
    description: 'Outdoor open-air classroom framed with roundwood reciprocal timber beams, natural canvas weather blinds, cedar stump seating circle, sandpit, and botanical microscopy station. Enables community childcare and joyful youth micro-chores.',
    scaleMiniature: '1:50 (Printable: 90mm x 90mm x 45mm)',
    scaleReal: '1:1 (Real: 6.5m x 6.5m x 3.2m)',
    printSpecs: {
      layerHeight: '0.20 mm',
      infill: '15%',
      supports: 'None',
      material: 'PLA / Woodfill'
    },
    bom: [
      { item: 'Roundwood Peeled Chestnut Poles (Reciprocal Roof)', qty: '12 poles', source: 'Bioregional Coppice Woodland' },
      { item: 'Heavy Waxed Cotton Canvas Awning', qty: '42 m²', source: 'Textile Maker Space' },
      { item: 'Slate Blackboard Panel (2.4m x 1.2m)', qty: '2 slabs', source: 'Local Quarry' },
      { item: 'Weatherproof Children Microscope & Binocular Kit', qty: '4 kits', source: 'Open Science Lab' }
    ],
    yamlContent: `${ONE_ASCII_BANNER}
# FOREST SCHOOL ENVIRONMENTAL WEATHER & AIR TELEMETRY
# ==========================================================

sensor:
  - platform: bme280
    temperature:
      name: "Forest School Ambient Temp"
    humidity:
      name: "Forest School Relative Humidity"
    pressure:
      name: "Forest School Barometric Pressure"
    address: 0x76
    update_interval: 60s`
  },

  // 6. Autonomous Cargo Trike & Depot
  trike_depot: {
    id: 'trike_depot',
    name: 'Autonomous Cargo Trike & Solar Charging Depot',
    category: 'TRANSIT',
    tagline: 'Solar-electric heavy-duty cargo e-trike (250 kg payload) with swappable LiFePO4 battery',
    description: 'Tough cargo trike chassis constructed from bent chromoly steel tubing with rear differential, dual hydraulic disc brakes, 750W mid-drive motor, 1.2 kWh swappable battery pack, and overhead solar charging canopy.',
    scaleMiniature: '1:20 (Printable: 85mm x 45mm x 55mm)',
    scaleReal: '1:1 (Real: 2.4m x 1.1m x 1.6m)',
    printSpecs: {
      layerHeight: '0.20 mm',
      infill: '25% Gyroid (Structural strength)',
      supports: 'Tree supports under fork',
      material: 'PETG / Tough PLA'
    },
    bom: [
      { item: 'Chromoly 4130 Seamless Steel Tubing', qty: '12 meters', source: 'Foundry & Welding Shop' },
      { item: 'Mid-Drive Planetary Hub Motor (750W 48V)', qty: '1 unit', source: 'Regional E-Mobility Pool' },
      { item: 'LiFePO4 16S 48V 25Ah Swappable Battery Pack', qty: '2 packs', source: 'FabLab Battery Assembly' },
      { item: 'Heavy Duty 20-inch Cargo Rims & 3.0 Fat Tires', qty: '3 wheels', source: 'Logistics Hardware' }
    ],
    yamlContent: `${ONE_ASCII_BANNER}
# CARGO TRIKE CAN-BUS BMS & MESH TELEMETRY TRACKER
# ==========================================================

sensor:
  - platform: mqtt
    name: "Trike 01 Battery State of Charge"
    state_topic: "one/fleet/trike01/soc"
    unit_of_measurement: "%"

automation:
  - id: 'trike_solar_charge_priority'
    alias: '[O.N.E.] Prioritize Trike Fast-Charge when Solar > 3 kW'
    trigger:
      - platform: numeric_state
        entity_id: sensor.solar_generation_watts
        above: 3000
    action:
      - service: switch.turn_on
        target:
          entity_id: switch.trike_depot_charger`
  },

  // 7. Autonomous Drone Vertiport
  drone_vertiport: {
    id: 'drone_vertiport',
    name: 'Bioregional Autonomous Drone Vertiport',
    category: 'TRANSIT',
    tagline: 'Octocopter cargo drone (25 kg payload) with inductive landing pad & automated battery swap',
    description: 'Precision carbon-fiber octocopter drone system for rapid emergency medicine, critical seeds, and micro-component transit across 50 km bioregional corridors. Features RTK-GPS centimeter navigation and weatherproof automated charging dome.',
    scaleMiniature: '1:20 (Printable: 75mm x 75mm x 35mm)',
    scaleReal: '1:1 (Real: 1.8m x 1.8m x 0.6m)',
    printSpecs: {
      layerHeight: '0.16 mm',
      infill: '30%',
      supports: 'Touching buildplate only',
      material: 'Carbon-Fiber PETG / Nylon'
    },
    bom: [
      { item: 'Carbon Fiber Toray T700 Tubing & Motor Mounts', qty: '8 arms', source: 'FabLab Composites Bench' },
      { item: 'Brushless High-Torque Motors (400KV) & 18-inch Props', qty: '8 pairs', source: 'Electronics Cooperative' },
      { item: 'RTK-GPS Base + Rover Receiver Pair (Centimeter RTK)', qty: '1 set', source: 'Open Hardware Telemetry' },
      { item: 'Inductive Resonant Ground Charging Pad (48V 10A)', qty: '1 pad', source: 'FabLab Power Electronics' }
    ],
    yamlContent: `${ONE_ASCII_BANNER}
# AUTONOMOUS VERTIPORT RADAR & WEATHER DEPLOYMENT GATE
# ==========================================================

automation:
  - id: 'drone_weather_safety_gate'
    alias: '[O.N.E.] Abort Drone Flights if Wind Exceeds 45 km/h'
    trigger:
      - platform: numeric_state
        entity_id: sensor.bioregional_wind_speed
        above: 45
    action:
      - service: switch.turn_off
        target:
          entity_id: switch.vertiport_flight_authorization
      - service: notify.logistics_desk
        data:
          message: "⚠️ High winds detected. All aerial delivery drones held on pads."`
  },

  // 8. FarmBot CNC & Micro-Permaculture
  farm_bot: {
    id: 'farm_bot',
    name: 'FarmBot Bio-Intensive CNC Gantry',
    category: 'AGRICULTURE',
    tagline: 'Automated seed planting, weed suppression & ultrasonic root misting for 12m² beds',
    description: 'Open-source Cartesian 3-axis CNC robot mounted on raised cedar garden beds. Uses precision cameras for computer-vision weed identification, automated seed injector needle, soil moisture sensor probe, and rotary weed punch.',
    scaleMiniature: '1:20 (Printable: 110mm x 60mm x 45mm)',
    scaleReal: '1:1 (Real: 3.0m x 1.5m x 1.2m)',
    printSpecs: {
      layerHeight: '0.20 mm',
      infill: '20%',
      supports: 'None',
      material: 'PETG (UV-resistant outdoors)'
    },
    bom: [
      { item: 'V-Slot Aluminum Extrusions (20x40mm)', qty: '8 meters', source: 'Hardware Commons' },
      { item: 'NEMA 17 Stepper Motors (IP65 Weatherproof)', qty: '4 motors', source: 'FabLab Robotics Depot' },
      { item: 'Precision Solenoid Water Valve (12V Brass)', qty: '2 valves', source: 'Plumbing Supply' },
      { item: 'Raspberry Pi / ESP32 Vision Camera Module', qty: '1 kit', source: 'Electronics Lab' }
    ],
    yamlContent: `${ONE_ASCII_BANNER}
# FARMBOT CNC IRRIGATION & SOIL MOISTURE CONTROLLER
# ==========================================================

automation:
  - id: 'farmbot_targeted_dawn_watering'
    alias: '[O.N.E.] Dawn Deep Root Irrigation Cycle'
    trigger:
      - platform: time
        at: '05:30:00'
    condition:
      - condition: numeric_state
        entity_id: sensor.garden_soil_moisture
        below: 45
    action:
      - service: switch.turn_on
        target:
          entity_id: switch.farmbot_water_solenoid
      - delay: '00:08:00'
      - service: switch.turn_off
        target:
          entity_id: switch.farmbot_water_solenoid`
  },

  // 9. Rain Cistern & Water Loop
  rain_cistern: {
    id: 'rain_cistern',
    name: 'Bioclimatic 1,000L Rainwater Cistern & Vortex Filter',
    category: 'WATER',
    tagline: 'UV-stabilized food-grade underground cistern with vortex leaf separator',
    description: 'Modular rotational-molded high-density polyethylene (HDPE) rainwater cistern with stainless steel mesh pre-filter, calming inlet to prevent sediment disturbance, and overflow siphon connected to infiltration swales.',
    scaleMiniature: '1:50 (Printable: 50mm x 50mm x 45mm)',
    scaleReal: '1:1 (Real: 1.2m x 1.2m x 1.4m)',
    printSpecs: {
      layerHeight: '0.20 mm',
      infill: '15%',
      supports: 'None',
      material: 'PETG / PLA'
    },
    bom: [
      { item: 'Food-Grade Recycled Polyethylene Tank (1,000L)', qty: '1 unit', source: 'Water Infrastructure Coop' },
      { item: 'Stainless Steel Vortex Downspout Filter (200 micron)', qty: '1 unit', source: 'FabLab Plumbing Shop' },
      { item: 'Ultrasonic Liquid Level Sensor (JSN-SR04T Waterproof)', qty: '1 kit', source: 'Open Hardware Electronics' },
      { item: 'Brass 3/4-inch Full-Port Ball Valves', qty: '3 valves', source: 'Settlement Plumbing Yard' }
    ],
    yamlContent: `${ONE_ASCII_BANNER}
# RAINWATER CISTERN ULTRASONIC LEVEL & PURGE AUTOMATION
# ==========================================================

sensor:
  - platform: template
    sensors:
      cistern_liters_remaining:
        friendly_name: "Cistern Usable Volume"
        unit_of_measurement: "L"
        value_template: "{{ (1.0 - (states('sensor.cistern_sonar_distance') | float - 0.2) / 1.2) * 1000 }}"`
  },

  // 10. Solar Array & Microgrid
  solar_array: {
    id: 'solar_array',
    name: 'Bifacial Solar Ground Array with Dual-Axis Tracker',
    category: 'ENERGY',
    tagline: '1.5 kW ground mount with timber A-frame and microinverter MPPT telemetry',
    description: 'Ground-mounted high-efficiency monocrystalline bifacial photovoltaic array (3 panels, 1.5 kW total). Timber A-frame structure using treated regional pine with seasonal manual tilt adjustment (30° summer, 55° winter) and MPPT grid inverter.',
    scaleMiniature: '1:50 (Printable: 80mm x 45mm x 40mm)',
    scaleReal: '1:1 (Real: 3.6m x 2.0m x 1.8m)',
    printSpecs: {
      layerHeight: '0.20 mm',
      infill: '20%',
      supports: 'Touching buildplate only',
      material: 'PETG / PLA'
    },
    bom: [
      { item: 'Bifacial 500W Monocrystalline PV Modules', qty: '3 panels', source: 'Regional Clean Energy Coop' },
      { item: 'Treated Timber Posts (80x80mm) & Zinc Hardware', qty: '6 posts', source: 'Bioregional Sawmill' },
      { item: 'Hoymiles / Enphase Microinverter with Zigbee Gateway', qty: '1 unit', source: 'Electronics Cooperative' },
      { item: 'DC Isolator Switch & Grounding Rod Kit', qty: '1 kit', source: 'Microgrid Safety Stock' }
    ],
    yamlContent: `${ONE_ASCII_BANNER}
# BIFACIAL SOLAR ARRAY TELEMETRY & INVERTER MQTT SENSOR
# ==========================================================

sensor:
  - platform: mqtt
    name: "Solar Array Power Generation"
    state_topic: "one/energy/solar/power_watts"
    unit_of_measurement: "W"
    device_class: power`
  }
};

/**
 * Resolves the blueprint archetype for a given settlement building type.
 */
export function getBlueprintForBuildingType(buildingType) {
  if (BLUEPRINT_ARCHETYPES[buildingType]) {
    return BLUEPRINT_ARCHETYPES[buildingType];
  }
  // Fallback mappings
  if (buildingType === 'mhu_dwelling') return BLUEPRINT_ARCHETYPES.mhu_couple;
  if (buildingType === 'school') return BLUEPRINT_ARCHETYPES.school_nursery;
  if (buildingType === 'deep_well' || buildingType === 'reed_bed' || buildingType === 'retention_swale') return BLUEPRINT_ARCHETYPES.rain_cistern;
  if (buildingType === 'battery_bank') return BLUEPRINT_ARCHETYPES.solar_array;
  if (buildingType === 'fablab' || buildingType === 'foundry') return BLUEPRINT_ARCHETYPES.mhu_studio;
  if (buildingType === 'auto_valves') return BLUEPRINT_ARCHETYPES.farm_bot;
  return BLUEPRINT_ARCHETYPES.mhu_couple;
}

/**
 * Builds a watertight 3D procedural mesh using Three.js primitives
 * that can be rendered in WebGL and cleanly exported via STLExporter.
 */
export function buildWatertight3DMesh(archetypeId, scale = 1.0) {
  const root = new THREE.Group();
  root.name = archetypeId;

  // Common Solarpunk Materials
  const timberMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.8 });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
  const roofGreenMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.3 });
  const solarBlueMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.2, metalness: 0.6 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4, metalness: 0.7 });

  if (archetypeId === 'mhu_couple' || archetypeId === 'mhu_dwelling') {
    // 1. Foundation Skids
    const skidGeom = new THREE.BoxGeometry(6.4 * scale, 0.25 * scale, 0.3 * scale);
    const skid1 = new THREE.Mesh(skidGeom, timberMat);
    skid1.position.set(0, 0.12 * scale, 1.4 * scale);
    const skid2 = new THREE.Mesh(skidGeom, timberMat);
    skid2.position.set(0, 0.12 * scale, -1.4 * scale);
    root.add(skid1, skid2);

    // 2. CLT Main Body Box
    const bodyGeom = new THREE.BoxGeometry(6.0 * scale, 2.6 * scale, 3.4 * scale);
    const body = new THREE.Mesh(bodyGeom, wallMat);
    body.position.set(0, 1.55 * scale, 0);
    root.add(body);

    // 3. Panoramic Glazed Entrance
    const glassGeom = new THREE.BoxGeometry(0.15 * scale, 2.0 * scale, 1.6 * scale);
    const glass = new THREE.Mesh(glassGeom, glassMat);
    glass.position.set(3.0 * scale, 1.4 * scale, 0);
    root.add(glass);

    // 4. Overhanging Sedum Living Roof
    const roofGeom = new THREE.BoxGeometry(6.8 * scale, 0.35 * scale, 4.0 * scale);
    const roof = new THREE.Mesh(roofGeom, roofGreenMat);
    roof.position.set(0, 2.95 * scale, 0);
    root.add(roof);

    // 5. Embedded O.N.E. Logo Medallion on Apex
    const medallionGeom = new THREE.CylinderGeometry(0.35 * scale, 0.35 * scale, 0.1 * scale, 24);
    medallionGeom.rotateZ(Math.PI / 2);
    const medallion = new THREE.Mesh(medallionGeom, solarBlueMat);
    medallion.position.set(3.05 * scale, 2.6 * scale, 0);
    root.add(medallion);

  } else if (archetypeId === 'mhu_family') {
    // Multi-Bay Pavilion with Central Atrium
    const bay1Geom = new THREE.BoxGeometry(4.2 * scale, 2.7 * scale, 7.0 * scale);
    const bay1 = new THREE.Mesh(bay1Geom, wallMat);
    bay1.position.set(-2.5 * scale, 1.5 * scale, 0);

    const bay2Geom = new THREE.BoxGeometry(4.2 * scale, 2.7 * scale, 7.0 * scale);
    const bay2 = new THREE.Mesh(bay2Geom, wallMat);
    bay2.position.set(2.5 * scale, 1.5 * scale, 0);

    // Central Glass Atrium
    const atriumGeom = new THREE.BoxGeometry(1.6 * scale, 3.4 * scale, 7.2 * scale);
    const atrium = new THREE.Mesh(atriumGeom, glassMat);
    atrium.position.set(0, 1.85 * scale, 0);

    // Living Roof
    const roofGeom = new THREE.BoxGeometry(9.6 * scale, 0.35 * scale, 7.6 * scale);
    const roof = new THREE.Mesh(roofGeom, roofGreenMat);
    roof.position.set(0, 3.05 * scale, 0);

    root.add(bay1, bay2, atrium, roof);

  } else if (archetypeId === 'mhu_studio') {
    // Two-Story Workshop Loft
    const groundGeom = new THREE.BoxGeometry(6.5 * scale, 2.8 * scale, 4.4 * scale);
    const ground = new THREE.Mesh(groundGeom, wallMat);
    ground.position.set(0, 1.4 * scale, 0);

    const loftGeom = new THREE.BoxGeometry(6.5 * scale, 2.0 * scale, 4.4 * scale);
    const loft = new THREE.Mesh(loftGeom, timberMat);
    loft.position.set(0, 3.8 * scale, 0);

    const roofGeom = new THREE.ConeGeometry(4.2 * scale, 1.4 * scale, 4);
    roofGeom.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofGeom, solarBlueMat);
    roof.position.set(0, 5.5 * scale, 0);

    root.add(ground, loft, roof);

  } else if (archetypeId === 'mhu_bathhouse') {
    // Cedar Bathhouse with Stone Hearth & Solar Tubes
    const houseGeom = new THREE.BoxGeometry(6.8 * scale, 2.8 * scale, 4.8 * scale);
    const house = new THREE.Mesh(houseGeom, timberMat);
    house.position.set(0, 1.4 * scale, 0);

    const chimneyGeom = new THREE.BoxGeometry(0.8 * scale, 4.2 * scale, 0.8 * scale);
    const chimney = new THREE.Mesh(chimneyGeom, metalMat);
    chimney.position.set(2.4 * scale, 2.1 * scale, -1.6 * scale);

    const solarTubesGeom = new THREE.CylinderGeometry(0.08 * scale, 0.08 * scale, 3.5 * scale, 12);
    solarTubesGeom.rotateX(Math.PI / 3);
    const solarTubes = new THREE.Mesh(solarTubesGeom, solarBlueMat);
    solarTubes.position.set(-1.0 * scale, 3.2 * scale, 0);

    root.add(house, chimney, solarTubes);

  } else if (archetypeId === 'school_nursery') {
    // Hexagonal Open Gazebo
    const gazeboGeom = new THREE.CylinderGeometry(3.6 * scale, 3.6 * scale, 0.25 * scale, 6);
    const deck = new THREE.Mesh(gazeboGeom, timberMat);
    deck.position.set(0, 0.12 * scale, 0);

    const roofGeom = new THREE.ConeGeometry(4.2 * scale, 1.8 * scale, 6);
    const roof = new THREE.Mesh(roofGeom, roofGreenMat);
    roof.position.set(0, 3.2 * scale, 0);

    root.add(deck, roof);

  } else if (archetypeId === 'trike_depot') {
    // Cargo Trike Frame
    const frameGeom = new THREE.BoxGeometry(2.4 * scale, 0.8 * scale, 1.0 * scale);
    const frame = new THREE.Mesh(frameGeom, metalMat);
    frame.position.set(0, 0.8 * scale, 0);

    const wheelGeom = new THREE.CylinderGeometry(0.45 * scale, 0.45 * scale, 0.15 * scale, 16);
    wheelGeom.rotateZ(Math.PI / 2);
    const wheelFront = new THREE.Mesh(wheelGeom, metalMat);
    wheelFront.position.set(1.2 * scale, 0.45 * scale, 0);

    const wheelR1 = new THREE.Mesh(wheelGeom, metalMat);
    wheelR1.position.set(-0.9 * scale, 0.45 * scale, 0.55 * scale);
    const wheelR2 = new THREE.Mesh(wheelGeom, metalMat);
    wheelR2.position.set(-0.9 * scale, 0.45 * scale, -0.55 * scale);

    root.add(frame, wheelFront, wheelR1, wheelR2);

  } else if (archetypeId === 'drone_vertiport') {
    // Octocopter Drone Pad & Chassis
    const padGeom = new THREE.CylinderGeometry(2.4 * scale, 2.4 * scale, 0.2 * scale, 24);
    const pad = new THREE.Mesh(padGeom, metalMat);
    pad.position.set(0, 0.1 * scale, 0);

    const droneBodyGeom = new THREE.CylinderGeometry(0.6 * scale, 0.6 * scale, 0.25 * scale, 8);
    const droneBody = new THREE.Mesh(droneBodyGeom, wallMat);
    droneBody.position.set(0, 0.8 * scale, 0);

    root.add(pad, droneBody);

  } else if (archetypeId === 'farm_bot') {
    // Raised Bed + Gantry Rails
    const bedGeom = new THREE.BoxGeometry(3.2 * scale, 0.6 * scale, 1.6 * scale);
    const bed = new THREE.Mesh(bedGeom, timberMat);
    bed.position.set(0, 0.3 * scale, 0);

    const gantryGeom = new THREE.BoxGeometry(0.15 * scale, 1.2 * scale, 1.8 * scale);
    const gantry = new THREE.Mesh(gantryGeom, metalMat);
    gantry.position.set(0, 1.0 * scale, 0);

    root.add(bed, gantry);

  } else if (archetypeId === 'rain_cistern') {
    // Cylindrical Cistern
    const tankGeom = new THREE.CylinderGeometry(1.0 * scale, 1.0 * scale, 1.8 * scale, 24);
    const tank = new THREE.Mesh(tankGeom, glassMat);
    tank.position.set(0, 0.9 * scale, 0);
    root.add(tank);

  } else {
    // Generic Solar Ground Mount
    const postGeom = new THREE.BoxGeometry(0.2 * scale, 1.4 * scale, 0.2 * scale);
    const post = new THREE.Mesh(postGeom, timberMat);
    post.position.set(0, 0.7 * scale, 0);

    const pvGeom = new THREE.BoxGeometry(3.0 * scale, 0.08 * scale, 1.5 * scale);
    pvGeom.rotateX(Math.PI / 6);
    const pv = new THREE.Mesh(pvGeom, solarBlueMat);
    pv.position.set(0, 1.4 * scale, 0);

    root.add(post, pv);
  }

  return root;
}
