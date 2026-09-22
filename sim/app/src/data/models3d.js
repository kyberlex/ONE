/**
 * 3D Open Hardware Blueprints & Dual-Scale Solarpunk Archetypes (Agent SIM-4)
 * Inspired by post_work_commons.jpeg:
 * 1. Autonomous Mobility Pod (Electric Shuttle)
 * 2. Solarpunk Bioclimatic Living Pod (Nautilus Dome)
 * 3. Hex-Loft Modular Family Pavilion
 * 4. Robotic Aeroponic Farming Cylinder
 * 5. FabLab Ergonomic Modular Furniture Kit
 *
 * Each model supports dual scales:
 * - Model Scale (1:50 / 1:20): Optimized for desktop 3D printing with integrated exhibition plinth.
 * - Real Scale (1:1): Real-world engineering dimensions for CAD/BIM.
 * With the official O.N.E. logo embossed in physical relief directly onto all geometries!
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import * as THREE from 'three';

const ONE_ASCII_BANNER = `# ==========================================================
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

export const BLUEPRINT_ARCHETYPES = [
  {
    id: 'autonomous_mobility_pod',
    name: 'Autonomous Mobility Pod ("Commuter Commons")',
    category: 'VEHICLES',
    tagline: 'Solar-electric autonomous shuttle for shared bioregional transit',
    description: 'Aerodynamic biomorphic micro-bus with panoramic solar glass canopy, roof-mounted LiDAR dome, swappable LiFePO4 battery bay, and embossed O.N.E. emblems on front, doors, and roof.',
    scaleMiniature: '1:50 (Printable: 96mm x 44mm x 42mm + Plinth)',
    scaleReal: '1:1 (Real: 4.8m x 2.2m x 2.1m)',
    printSpecs: {
      layerHeight: '0.20 mm',
      infill: '15% Gyroid',
      supports: 'Tree supports on wheel arches',
      material: 'PETG / PLA'
    },
    yamlContent: `${ONE_ASCII_BANNER}
# TELEMETRY & BMS GATEWAY: CAN-Bus / ESP32 + RTK-GPS
# ==========================================================

sensor:
  - platform: mqtt
    name: 'ONE Pod 01 Battery SoC'
    state_topic: 'one/fleet/pod01/battery/soc'
    unit_of_measurement: '%'
  - platform: mqtt
    name: 'ONE Pod 01 Solar Roof Generation'
    state_topic: 'one/fleet/pod01/solar/power_w'
    unit_of_measurement: 'W'
  - platform: mqtt
    name: 'ONE Pod 01 Autonomy State'
    state_topic: 'one/fleet/pod01/drive_state'

automation:
  - id: 'one_pod_smart_solar_recharge'
    alias: '[O.N.E.] Autonomous Return-to-Depot at 20% SoC'
    trigger:
      - platform: numeric_state
        entity_id: sensor.one_pod_01_battery_soc
        below: 20
    action:
      - service: mqtt.publish
        data:
          topic: 'one/fleet/pod01/command'
          payload: 'RETURN_TO_SOLAR_DEPOT'`
  },
  {
    id: 'bioclimatic_living_pod',
    name: 'Solarpunk Bioclimatic Nautilus Pod',
    category: 'HOUSING',
    tagline: 'Single/Couple living capsule with integrated curved solar skin',
    description: 'Passive-solar curved dwelling with cross-ventilation gills, roof solar cell ribs, panoramic bay entrance, and embossed O.N.E. usufruct insignia stamped on the archway, apex, and foundation.',
    scaleMiniature: '1:50 (Printable: 110mm x 90mm x 60mm + Plinth)',
    scaleReal: '1:1 (Real: 5.5m x 4.5m x 3.0m)',
    printSpecs: {
      layerHeight: '0.20 mm',
      infill: '10% Gyroid',
      supports: 'None (Self-supporting dome arches)',
      material: 'Recycled PETG / PLA'
    },
    yamlContent: `${ONE_ASCII_BANNER}
# BIOCLIMATIC LIVING POD CLIMATE & HVAC AUTOMATION
# ==========================================================

climate:
  - platform: generic_thermostat
    name: 'ONE Nautilus Pod Thermal Loop'
    heater: switch.geothermal_heatpump
    target_sensor: sensor.pod_internal_temp
    min_temp: 18
    max_temp: 24
    target_temp: 21`
  },
  {
    id: 'hex_loft_pavilion',
    name: 'Hex-Loft Modular Family Pavilion',
    category: 'HOUSING',
    tagline: 'Expandable hexagonal timber & steel family home',
    description: 'Modular 2-3 room pavilion using reciprocal timber beams, green living roof canopy with water catchment gutter, and embossed O.N.E. insignia stamped on the facade, roof apex, and deck threshold.',
    scaleMiniature: '1:50 (Printable: 120mm x 120mm x 55mm + Plinth)',
    scaleReal: '1:1 (Real: 8.0m x 8.0m x 3.6m)',
    printSpecs: {
      layerHeight: '0.20 mm',
      infill: '15%',
      supports: 'Touching buildplate only',
      material: 'Woodfill PLA / PETG'
    },
    yamlContent: `${ONE_ASCII_BANNER}
# HEX-LOFT RAINWATER HARVESTING & SOLAR INVERTER
# ==========================================================

sensor:
  - platform: template
    sensors:
      hex_pavilion_water_buffer:
        friendly_name: 'Hex Pavilion Rainwater Reserve'
        value_template: "{{ states('sensor.cistern_level') | float * 0.8 }}"
        unit_of_measurement: 'L'`
  },
  {
    id: 'robotic_aeroponic_cylinder',
    name: 'Robotic Aeroponic Farming Column',
    category: 'AGRICULTURE',
    tagline: 'Automated vertical food tower with misting manifold',
    description: 'Spiral multi-cup rotating vertical aeroponic column for 48 crop sites with quick-snap bayonet joints, central ultrasonic misting tube, and embossed O.N.E. logo on the nutrient reservoir and solar crown.',
    scaleMiniature: '1:20 (Printable: 60mm x 60mm x 140mm + Plinth)',
    scaleReal: '1:1 (Real: 0.6m x 0.6m x 2.4m)',
    printSpecs: {
      layerHeight: '0.20 mm (3 perimeters for watertightness)',
      infill: '25%',
      supports: 'None',
      material: 'Food-safe PETG'
    },
    yamlContent: `${ONE_ASCII_BANNER}
# VERTICAL AEROPONIC TOWER ULTRASONIC MISTING CONTROLLER
# ==========================================================

automation:
  - id: 'one_aeroponic_cycle_timer'
    alias: '[O.N.E.] 30s Mist Every 5 Minutes'
    trigger:
      - platform: time_pattern
        minutes: '/5'
    action:
      - service: switch.turn_on
        target:
          entity_id: switch.tower_misting_pump
      - delay: '00:00:30'
      - service: switch.turn_off
        target:
          entity_id: switch.tower_misting_pump`
  },
  {
    id: 'modular_furniture_kit',
    name: 'Circular FabLab Furniture Kit',
    category: 'FURNITURE',
    tagline: 'Interlocking flat-pack ergonomic bed and solar desk',
    description: 'Precision CNC-cut interlocking plywood furniture designed for the Circular Furniture Swap Shop. No screws required; stamped with the O.N.E. circular medallion on headboard, desk, and joints.',
    scaleMiniature: '1:20 (Printable: 80mm x 50mm x 35mm + Plinth)',
    scaleReal: '1:1 (Real: 2.0m x 1.2m x 0.75m)',
    printSpecs: {
      layerHeight: '0.16 mm',
      infill: '20%',
      supports: 'None',
      material: 'PLA / Woodfill'
    },
    yamlContent: `${ONE_ASCII_BANNER}
# SOLAR DESK OCCUPANCY & BIOPHILIC TASK LIGHTING
# ==========================================================

light:
  - platform: switch
    name: 'ONE Solar Desk Biophilic Task Light'
    entity_id: switch.desk_led_relay`
  }
];

/**
 * Builds the 3D Procedural Mesh with Three.js
 * Scale factor: 1.0 for model scale, 50.0 for real scale.
 * Stamping: embeds embossed O.N.E. circular medallion logo on the geometry.
 */
export function buildArchetypeMesh(archetypeId, scaleFactor = 1.0) {
  const group = new THREE.Group();
  group.name = archetypeId;

  // Common PBR Materials
  const bodyWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xecfdf5,
    roughness: 0.25,
    metalness: 0.1
  });

  const emeraldGlowMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    roughness: 0.3,
    metalness: 0.2,
    emissive: 0x064e3b,
    emissiveIntensity: 0.35
  });

  const glassCanopyMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.65,
    roughness: 0.1,
    transmission: 0.8,
    thickness: 1.2
  });

  const solarPanelMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.2,
    metalness: 0.85
  });

  const darkTrimMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.6,
    metalness: 0.2
  });

  const woodMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.7,
    metalness: 0.05
  });

  // Helper to create the High-Fidelity Embossed O.N.E. Medallion Logo
  function createOneLogoMedallion(radius = 0.4) {
    const logoGroup = new THREE.Group();
    logoGroup.name = 'ONE_LOGO_EMBOSSED';

    // 1. Outer beveled backing disk (ensures solid watertight base for 3D slicing)
    const baseGeo = new THREE.CylinderGeometry(radius * 1.05, radius * 1.05, radius * 0.12, 32);
    const baseMesh = new THREE.Mesh(baseGeo, darkTrimMat);
    baseMesh.rotation.x = Math.PI / 2;
    logoGroup.add(baseMesh);

    // 2. Outer raised rim torus
    const ringGeo = new THREE.TorusGeometry(radius * 0.95, radius * 0.09, 16, 32);
    const ringMesh = new THREE.Mesh(ringGeo, emeraldGlowMat);
    logoGroup.add(ringMesh);

    // 3. 6 Geodesic Peripheral Nodes & Circular Connecting Lattice
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const nx = radius * 0.78 * Math.cos(angle);
      const ny = radius * 0.78 * Math.sin(angle);

      // Node point
      const nodeGeo = new THREE.CylinderGeometry(radius * 0.08, radius * 0.08, radius * 0.14, 12);
      const nodeMesh = new THREE.Mesh(nodeGeo, emeraldGlowMat);
      nodeMesh.rotation.x = Math.PI / 2;
      nodeMesh.position.set(nx, ny, 0.02);
      logoGroup.add(nodeMesh);

      // Geodesic spoke to center core
      const spokeGeo = new THREE.BoxGeometry(radius * 0.78, radius * 0.05, radius * 0.08);
      const spokeMesh = new THREE.Mesh(spokeGeo, emeraldGlowMat);
      spokeMesh.position.set(nx / 2, ny / 2, 0.02);
      spokeMesh.rotation.z = angle;
      logoGroup.add(spokeMesh);

      // Hexagonal chord connecting to next node
      const nextAngle = ((i + 1) * Math.PI) / 3;
      const nnx = radius * 0.78 * Math.cos(nextAngle);
      const nny = radius * 0.78 * Math.sin(nextAngle);
      const midX = (nx + nnx) / 2;
      const midY = (ny + nny) / 2;
      const chordLen = radius * 0.78;
      const chordGeo = new THREE.BoxGeometry(chordLen, radius * 0.04, radius * 0.07);
      const chordMesh = new THREE.Mesh(chordGeo, emeraldGlowMat);
      chordMesh.position.set(midX, midY, 0.02);
      chordMesh.rotation.z = angle + Math.PI / 6;
      logoGroup.add(chordMesh);
    }

    // 4. Central Raised Core Disk
    const coreGeo = new THREE.CylinderGeometry(radius * 0.38, radius * 0.38, radius * 0.18, 24);
    const coreMesh = new THREE.Mesh(coreGeo, emeraldGlowMat);
    coreMesh.rotation.x = Math.PI / 2;
    coreMesh.position.z = 0.02;
    logoGroup.add(coreMesh);

    // 5. Embossed Physical 3D Letters "O • N • E" in relief on the core
    const letterZ = 0.12;
    const letterMat = bodyWhiteMat;

    // Letter 'O' (Left)
    const oRingGeo = new THREE.TorusGeometry(radius * 0.09, radius * 0.025, 8, 16);
    const oMesh = new THREE.Mesh(oRingGeo, letterMat);
    oMesh.position.set(-radius * 0.20, 0, letterZ);
    logoGroup.add(oMesh);

    // Center Dot '•'
    const dot1Geo = new THREE.BoxGeometry(radius * 0.03, radius * 0.03, radius * 0.04);
    const dot1Mesh = new THREE.Mesh(dot1Geo, letterMat);
    dot1Mesh.position.set(-radius * 0.09, 0, letterZ);
    logoGroup.add(dot1Mesh);

    // Letter 'N' (Center)
    const nLeft = new THREE.BoxGeometry(radius * 0.03, radius * 0.16, radius * 0.04);
    const nLeftMesh = new THREE.Mesh(nLeft, letterMat);
    nLeftMesh.position.set(-radius * 0.04, 0, letterZ);
    logoGroup.add(nLeftMesh);

    const nDiag = new THREE.BoxGeometry(radius * 0.03, radius * 0.18, radius * 0.04);
    const nDiagMesh = new THREE.Mesh(nDiag, letterMat);
    nDiagMesh.rotation.z = -Math.PI / 4.2;
    nDiagMesh.position.set(0, 0, letterZ);
    logoGroup.add(nDiagMesh);

    const nRight = new THREE.BoxGeometry(radius * 0.03, radius * 0.16, radius * 0.04);
    const nRightMesh = new THREE.Mesh(nRight, letterMat);
    nRightMesh.position.set(radius * 0.04, 0, letterZ);
    logoGroup.add(nRightMesh);

    // Center Dot '•'
    const dot2Mesh = new THREE.Mesh(dot1Geo, letterMat);
    dot2Mesh.position.set(radius * 0.09, 0, letterZ);
    logoGroup.add(dot2Mesh);

    // Letter 'E' (Right)
    const eVert = new THREE.BoxGeometry(radius * 0.03, radius * 0.16, radius * 0.04);
    const eVertMesh = new THREE.Mesh(eVert, letterMat);
    eVertMesh.position.set(radius * 0.15, 0, letterZ);
    logoGroup.add(eVertMesh);

    const eTop = new THREE.BoxGeometry(radius * 0.09, radius * 0.025, radius * 0.04);
    const eTopMesh = new THREE.Mesh(eTop, letterMat);
    eTopMesh.position.set(radius * 0.19, radius * 0.068, letterZ);
    logoGroup.add(eTopMesh);

    const eMid = new THREE.BoxGeometry(radius * 0.07, radius * 0.025, radius * 0.04);
    const eMidMesh = new THREE.Mesh(eMid, letterMat);
    eMidMesh.position.set(radius * 0.18, 0, letterZ);
    logoGroup.add(eMidMesh);

    const eBot = new THREE.BoxGeometry(radius * 0.09, radius * 0.025, radius * 0.04);
    const eBotMesh = new THREE.Mesh(eBot, letterMat);
    eBotMesh.position.set(radius * 0.19, -radius * 0.068, letterZ);
    logoGroup.add(eBotMesh);

    return logoGroup;
  }

  // Helper to create an Exhibition Pedestal / Plinth with Embossed O.N.E. Front Plaque
  function createExhibitionPlinth(width, depth, height = 0.22) {
    const plinthGroup = new THREE.Group();
    plinthGroup.name = 'ONE_EXHIBITION_PLINTH';

    // Base stand
    const baseGeo = new THREE.BoxGeometry(width, height, depth);
    const baseMesh = new THREE.Mesh(baseGeo, darkTrimMat);
    plinthGroup.add(baseMesh);

    // Front embossed plaque
    const plaqueGeo = new THREE.BoxGeometry(width * 0.55, height * 0.75, 0.06);
    const plaqueMesh = new THREE.Mesh(plaqueGeo, bodyWhiteMat);
    plaqueMesh.position.set(0, 0, depth / 2 + 0.03);
    plinthGroup.add(plaqueMesh);

    // Embossed O.N.E. Medallion on the front plaque
    const plinthLogo = createOneLogoMedallion(height * 0.32);
    plinthLogo.position.set(-width * 0.18, 0, depth / 2 + 0.07);
    plinthGroup.add(plinthLogo);

    // Raised decorative label bars (representing "O.N.E. DUAL-TRACK")
    const bar1Geo = new THREE.BoxGeometry(width * 0.26, height * 0.14, 0.04);
    const bar1Mesh = new THREE.Mesh(bar1Geo, emeraldGlowMat);
    bar1Mesh.position.set(width * 0.08, height * 0.12, depth / 2 + 0.07);
    plinthGroup.add(bar1Mesh);

    const bar2Geo = new THREE.BoxGeometry(width * 0.22, height * 0.10, 0.04);
    const bar2Mesh = new THREE.Mesh(bar2Geo, emeraldGlowMat);
    bar2Mesh.position.set(width * 0.06, -height * 0.12, depth / 2 + 0.07);
    plinthGroup.add(bar2Mesh);

    return plinthGroup;
  }

  // -------------------------------------------------------------
  // 1. AUTONOMOUS MOBILITY POD
  // -------------------------------------------------------------
  if (archetypeId === 'autonomous_mobility_pod') {
    // Exhibition Plinth
    const plinth = createExhibitionPlinth(5.2, 2.6, 0.22);
    plinth.position.y = -0.11;
    group.add(plinth);

    // Aerodynamic chassis body
    const bodyGeo = new THREE.BoxGeometry(4.2, 1.6, 2.0);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyWhiteMat);
    bodyMesh.position.y = 1.1;
    group.add(bodyMesh);

    // Front curved nose
    const noseGeo = new THREE.CylinderGeometry(1.0, 1.0, 1.6, 24, 1, false, 0, Math.PI);
    const noseMesh = new THREE.Mesh(noseGeo, bodyWhiteMat);
    noseMesh.rotation.z = Math.PI / 2;
    noseMesh.rotation.x = Math.PI / 2;
    noseMesh.position.set(2.1, 1.1, 0);
    group.add(noseMesh);

    // Rear aerodynamic taper
    const rearGeo = new THREE.CylinderGeometry(0.9, 0.9, 1.6, 24, 1, false, 0, Math.PI);
    const rearMesh = new THREE.Mesh(rearGeo, bodyWhiteMat);
    rearMesh.rotation.z = -Math.PI / 2;
    rearMesh.rotation.x = Math.PI / 2;
    rearMesh.position.set(-2.1, 1.1, 0);
    group.add(rearMesh);

    // Panoramic glass cabin
    const cabinGeo = new THREE.CylinderGeometry(0.95, 0.95, 1.5, 24, 1, false, 0, Math.PI);
    const cabinMesh = new THREE.Mesh(cabinGeo, glassCanopyMat);
    cabinMesh.rotation.z = Math.PI / 2;
    cabinMesh.rotation.x = Math.PI / 2;
    cabinMesh.position.set(0.5, 1.6, 0);
    group.add(cabinMesh);

    // Roof solar panel array
    const solarGeo = new THREE.BoxGeometry(2.4, 0.05, 1.6);
    const solarMesh = new THREE.Mesh(solarGeo, solarPanelMat);
    solarMesh.position.set(0, 1.95, 0);
    group.add(solarMesh);

    // LiDAR sensor dome on roof
    const lidarGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.25, 16);
    const lidarMesh = new THREE.Mesh(lidarGeo, darkTrimMat);
    lidarMesh.position.set(1.4, 2.05, 0);
    group.add(lidarMesh);

    // 4 Aerodynamic wheels
    const wheelPositions = [
      [1.4, 0.4, 1.05],
      [-1.4, 0.4, 1.05],
      [1.4, 0.4, -1.05],
      [-1.4, 0.4, -1.05]
    ];
    for (const pos of wheelPositions) {
      const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.25, 24);
      const wheelMesh = new THREE.Mesh(wheelGeo, darkTrimMat);
      wheelMesh.rotation.x = Math.PI / 2;
      wheelMesh.position.set(pos[0], pos[1], pos[2]);
      group.add(wheelMesh);
    }

    // EMBOSSED O.N.E. LOGO 1: Front Grill
    const logoFront = createOneLogoMedallion(0.35);
    logoFront.rotation.y = Math.PI / 2;
    logoFront.position.set(3.12, 1.1, 0);
    group.add(logoFront);

    // EMBOSSED O.N.E. LOGO 2: Roof Solar Deck
    const logoRoof = createOneLogoMedallion(0.32);
    logoRoof.rotation.x = -Math.PI / 2;
    logoRoof.position.set(-0.8, 1.98, 0);
    group.add(logoRoof);

    // EMBOSSED O.N.E. LOGO 3: Left Passenger Door
    const logoLeft = createOneLogoMedallion(0.26);
    logoLeft.position.set(0.3, 1.0, 1.02);
    group.add(logoLeft);

    // EMBOSSED O.N.E. LOGO 4: Right Passenger Door
    const logoRight = createOneLogoMedallion(0.26);
    logoRight.rotation.y = Math.PI;
    logoRight.position.set(0.3, 1.0, -1.02);
    group.add(logoRight);

    // EMBOSSED O.N.E. LOGO 5: Rear Tailgate
    const logoRear = createOneLogoMedallion(0.30);
    logoRear.rotation.y = -Math.PI / 2;
    logoRear.position.set(-3.02, 1.1, 0);
    group.add(logoRear);
  }

  // -------------------------------------------------------------
  // 2. BIOCLIMATIC LIVING POD (NAUTILUS DOME)
  // -------------------------------------------------------------
  else if (archetypeId === 'bioclimatic_living_pod') {
    // Exhibition Plinth
    const plinth = createExhibitionPlinth(6.2, 6.2, 0.25);
    plinth.position.y = -0.45;
    group.add(plinth);

    // Main bioclimatic curved dome
    const domeGeo = new THREE.SphereGeometry(2.5, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const domeMesh = new THREE.Mesh(domeGeo, bodyWhiteMat);
    group.add(domeMesh);

    // Base deck foundation
    const deckGeo = new THREE.CylinderGeometry(2.8, 2.9, 0.4, 32);
    const deckMesh = new THREE.Mesh(deckGeo, woodMat);
    deckMesh.position.y = -0.2;
    group.add(deckMesh);

    // Circular panoramic entrance bay
    const portalGeo = new THREE.TorusGeometry(1.1, 0.15, 16, 32);
    const portalMesh = new THREE.Mesh(portalGeo, emeraldGlowMat);
    portalMesh.position.set(0, 1.1, 2.3);
    group.add(portalMesh);

    const windowGlassGeo = new THREE.CircleGeometry(1.0, 24);
    const windowGlassMesh = new THREE.Mesh(windowGlassGeo, glassCanopyMat);
    windowGlassMesh.position.set(0, 1.1, 2.3);
    group.add(windowGlassMesh);

    // Curved solar array ribs on roof
    const solarRibGeo = new THREE.TorusGeometry(2.3, 0.08, 12, 32, Math.PI * 0.6);
    for (let r = -1; r <= 1; r++) {
      const ribMesh = new THREE.Mesh(solarRibGeo, solarPanelMat);
      ribMesh.rotation.y = r * 0.4;
      ribMesh.rotation.x = -Math.PI * 0.3;
      ribMesh.position.set(0, 1.2, 0);
      group.add(ribMesh);
    }

    // EMBOSSED O.N.E. LOGO 1: Over Entrance Archway
    const logoEntrance = createOneLogoMedallion(0.38);
    logoEntrance.position.set(0, 2.45, 1.8);
    logoEntrance.rotation.x = -0.4;
    group.add(logoEntrance);

    // EMBOSSED O.N.E. LOGO 2: Roof Dome Apex Cap
    const logoApex = createOneLogoMedallion(0.35);
    logoApex.position.set(0, 2.52, 0);
    logoApex.rotation.x = -Math.PI / 2;
    group.add(logoApex);

    // EMBOSSED O.N.E. LOGO 3: Rear Facade Shell
    const logoRear = createOneLogoMedallion(0.35);
    logoRear.position.set(0, 1.4, -2.48);
    logoRear.rotation.y = Math.PI;
    group.add(logoRear);

    // EMBOSSED O.N.E. LOGO 4: Foundation Step Plaque
    const logoStep = createOneLogoMedallion(0.25);
    logoStep.position.set(0, -0.1, 2.88);
    group.add(logoStep);
  }

  // -------------------------------------------------------------
  // 3. HEX-LOFT FAMILY PAVILION
  // -------------------------------------------------------------
  else if (archetypeId === 'hex_loft_pavilion') {
    // Exhibition Plinth
    const plinth = createExhibitionPlinth(7.6, 7.6, 0.25);
    plinth.position.y = -0.45;
    group.add(plinth);

    // Hexagonal foundation
    const hexBaseGeo = new THREE.CylinderGeometry(3.5, 3.6, 0.35, 6);
    const hexBaseMesh = new THREE.Mesh(hexBaseGeo, woodMat);
    group.add(hexBaseMesh);

    // 6 Timber Pillars
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = 3.0 * Math.cos(angle);
      const z = 3.0 * Math.sin(angle);
      const pillarGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.8, 12);
      const pillarMesh = new THREE.Mesh(pillarGeo, woodMat);
      pillarMesh.position.set(x, 1.4, z);
      group.add(pillarMesh);
    }

    // Interior bioclimatic living pod
    const roomGeo = new THREE.CylinderGeometry(2.4, 2.4, 2.4, 6);
    const roomMesh = new THREE.Mesh(roomGeo, bodyWhiteMat);
    roomMesh.position.y = 1.2;
    group.add(roomMesh);

    // Hexagonal green roof canopy
    const roofGeo = new THREE.ConeGeometry(4.0, 1.2, 6);
    const roofMesh = new THREE.Mesh(roofGeo, emeraldGlowMat);
    roofMesh.position.y = 3.2;
    group.add(roofMesh);

    // EMBOSSED O.N.E. LOGO 1: Front Facade Lintel
    const logoHex = createOneLogoMedallion(0.42);
    logoHex.position.set(0, 2.0, 2.42);
    group.add(logoHex);

    // EMBOSSED O.N.E. LOGO 2: Roof Apex Spire Crown
    const logoCrown = createOneLogoMedallion(0.38);
    logoCrown.position.set(0, 3.82, 0);
    logoCrown.rotation.x = -Math.PI / 2;
    group.add(logoCrown);

    // EMBOSSED O.N.E. LOGO 3: Rear Facade
    const logoRear = createOneLogoMedallion(0.42);
    logoRear.position.set(0, 2.0, -2.42);
    logoRear.rotation.y = Math.PI;
    group.add(logoRear);

    // EMBOSSED O.N.E. LOGO 4: Foundation Entry Step
    const logoStep = createOneLogoMedallion(0.30);
    logoStep.position.set(0, 0.05, 3.52);
    logoStep.rotation.x = -Math.PI / 2;
    group.add(logoStep);
  }

  // -------------------------------------------------------------
  // 4. ROBOTIC AEROPONIC TOWER
  // -------------------------------------------------------------
  else if (archetypeId === 'robotic_aeroponic_cylinder') {
    // Exhibition Plinth
    const plinth = createExhibitionPlinth(3.2, 3.2, 0.22);
    plinth.position.y = -0.11;
    group.add(plinth);

    // Base water reservoir tank
    const tankGeo = new THREE.CylinderGeometry(1.2, 1.3, 0.8, 32);
    const tankMesh = new THREE.Mesh(tankGeo, darkTrimMat);
    tankMesh.position.y = 0.4;
    group.add(tankMesh);

    // Vertical column
    const colGeo = new THREE.CylinderGeometry(0.45, 0.45, 3.2, 24);
    const colMesh = new THREE.Mesh(colGeo, bodyWhiteMat);
    colMesh.position.y = 2.4;
    group.add(colMesh);

    // 16 Aeroponic plant cup pods arranged in spiral
    for (let i = 0; i < 16; i++) {
      const y = 1.0 + i * 0.16;
      const angle = (i * Math.PI) / 2.5;
      const cupGeo = new THREE.CylinderGeometry(0.12, 0.08, 0.25, 12);
      const cupMesh = new THREE.Mesh(cupGeo, emeraldGlowMat);
      cupMesh.rotation.z = Math.PI / 3;
      cupMesh.rotation.y = angle;
      cupMesh.position.set(0.52 * Math.cos(angle), y, 0.52 * Math.sin(angle));
      group.add(cupMesh);
    }

    // Top solar LED umbrella
    const topCapGeo = new THREE.CylinderGeometry(0.8, 0.5, 0.2, 24);
    const topCapMesh = new THREE.Mesh(topCapGeo, solarPanelMat);
    topCapMesh.position.y = 4.1;
    group.add(topCapMesh);

    // EMBOSSED O.N.E. LOGO 1: Front Nutrient Tank
    const logoTank = createOneLogoMedallion(0.35);
    logoTank.position.set(0, 0.4, 1.32);
    group.add(logoTank);

    // EMBOSSED O.N.E. LOGO 2: Rear Tank
    const logoTankRear = createOneLogoMedallion(0.35);
    logoTankRear.rotation.y = Math.PI;
    logoTankRear.position.set(0, 0.4, -1.32);
    group.add(logoTankRear);

    // EMBOSSED O.N.E. LOGO 3: Top Solar Umbrella Apex
    const logoApex = createOneLogoMedallion(0.32);
    logoApex.position.set(0, 4.22, 0);
    logoApex.rotation.x = -Math.PI / 2;
    group.add(logoApex);

    // EMBOSSED O.N.E. LOGO 4: Telemetry Module
    const logoTelemetry = createOneLogoMedallion(0.20);
    logoTelemetry.position.set(0.48, 1.8, 0);
    logoTelemetry.rotation.y = Math.PI / 2;
    group.add(logoTelemetry);
  }

  // -------------------------------------------------------------
  // 5. FABLAB ERGONOMIC FURNITURE KIT
  // -------------------------------------------------------------
  else if (archetypeId === 'modular_furniture_kit') {
    // Exhibition Plinth
    const plinth = createExhibitionPlinth(3.6, 3.6, 0.22);
    plinth.position.y = -0.11;
    group.add(plinth);

    // Minimalist Interlocking Slatted Bed
    const bedFrameGeo = new THREE.BoxGeometry(2.1, 0.3, 1.4);
    const bedFrameMesh = new THREE.Mesh(bedFrameGeo, woodMat);
    bedFrameMesh.position.set(0, 0.25, 0);
    group.add(bedFrameMesh);

    // Mattress
    const mattressGeo = new THREE.BoxGeometry(1.95, 0.22, 1.25);
    const mattressMesh = new THREE.Mesh(mattressGeo, bodyWhiteMat);
    mattressMesh.position.set(0, 0.5, 0);
    group.add(mattressMesh);

    // Headboard
    const headboardGeo = new THREE.BoxGeometry(0.15, 0.9, 1.4);
    const headboardMesh = new THREE.Mesh(headboardGeo, woodMat);
    headboardMesh.position.set(-1.05, 0.65, 0);
    group.add(headboardMesh);

    // Solar Work Desk alongside
    const deskTopGeo = new THREE.BoxGeometry(1.2, 0.08, 0.7);
    const deskTopMesh = new THREE.Mesh(deskTopGeo, woodMat);
    deskTopMesh.position.set(0.3, 0.75, 1.4);
    group.add(deskTopMesh);

    // Desk legs
    const deskLegGeo = new THREE.BoxGeometry(0.08, 0.75, 0.7);
    const leg1 = new THREE.Mesh(deskLegGeo, darkTrimMat);
    leg1.position.set(-0.25, 0.38, 1.4);
    group.add(leg1);
    const leg2 = new THREE.Mesh(deskLegGeo, darkTrimMat);
    leg2.position.set(0.85, 0.38, 1.4);
    group.add(leg2);

    // EMBOSSED O.N.E. LOGO 1: Bed Headboard Center
    const logoHeadboard = createOneLogoMedallion(0.28);
    logoHeadboard.rotation.y = Math.PI / 2;
    logoHeadboard.position.set(-0.96, 0.8, 0);
    group.add(logoHeadboard);

    // EMBOSSED O.N.E. LOGO 2: Bed Front Footboard
    const logoFootboard = createOneLogoMedallion(0.22);
    logoFootboard.rotation.y = -Math.PI / 2;
    logoFootboard.position.set(1.06, 0.3, 0);
    group.add(logoFootboard);

    // EMBOSSED O.N.E. LOGO 3: Solar Desk Corner Plaque
    const logoDesk = createOneLogoMedallion(0.18);
    logoDesk.rotation.x = -Math.PI / 2;
    logoDesk.position.set(0.75, 0.8, 1.6);
    group.add(logoDesk);

    // EMBOSSED O.N.E. LOGO 4: Desk Frame Joint
    const logoJoint = createOneLogoMedallion(0.18);
    logoJoint.position.set(0.3, 0.4, 1.76);
    group.add(logoJoint);
  }

  // Apply scale
  group.scale.set(scaleFactor, scaleFactor, scaleFactor);
  return group;
}
