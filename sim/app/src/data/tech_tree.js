/**
 * FabLab Tech Tree & Dual-Track Open Hardware Bridge (Agent SIM-4)
 * Bridges in-game resilience automation with real-world downloadable open CAD .STL files
 * and Home Assistant YAML automations.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

export const TECH_TREE_ITEMS = [
  {
    id: 'esp32Valves',
    name: 'ESP32 Smart Irrigation & Aeroponic Valves',
    category: 'AGRICULTURE',
    description: 'Automated solenoid valves governed by soil capacitive sensors. Replaces manual watering and reduces water waste by 35%.',
    hoursCancelledDaily: 2,
    domain: 'agriculture',
    materialCost: {
      aluminumIngotsKg: 0,
      petgFilamentSpools: 2,
      copperWireMeters: 15
    },
    realHardwareBridge: {
      cadFileName: 'hydroponic_tower_bracket_v2.stl',
      cadFileDescription: 'Modular 3D-printable interlocking bracket for vertical PVC aeroponic towers and 12V solenoid mounting.',
      cadContent: `solid hydroponic_bracket
  facet normal 0 0 1
    outer loop
      vertex 0 0 0
      vertex 10 0 0
      vertex 0 10 0
    endloop
  endfacet
  facet normal 0 0 1
    outer loop
      vertex 10 0 0
      vertex 10 10 0
      vertex 0 10 0
    endloop
  endfacet
endsolid hydroponic_bracket`,
      yamlFileName: 'homeassistant_irrigation_automation.yaml',
      yamlContent: `# ==========================================================
# O.N.E. DUAL-TRACK: HOME ASSISTANT IRRIGATION AUTOMATION
# Hardware: ESP32 + Capacitive Soil Sensor v1.2 + 12V Valve Relay
# Protocol: Zigbee2MQTT / ESPHome
# License: AGPL-3.0-or-later
# ==========================================================

automation:
  - id: 'one_greenhouse_adaptive_watering'
    alias: '[O.N.E.] Adaptive Aeroponic Misting'
    description: 'Triggers pulse misting based on root zone moisture and solar radiation'
    trigger:
      - platform: numeric_state
        entity_id: sensor.greenhouse_root_moisture_pct
        below: 45
    condition:
      - condition: numeric_state
        entity_id: sensor.water_cistern_level_liters
        above: 200
    action:
      - service: switch.turn_on
        target:
          entity_id: switch.aeroponic_solenoid_valve_1
      - delay:
          seconds: 45
      - service: switch.turn_off
        target:
          entity_id: switch.aeroponic_solenoid_valve_1
    mode: single`
    }
  },
  {
    id: 'mpptOptimizer',
    name: 'SCADA Microgrid Auto-Balancer & Islanding Guard',
    category: 'FACILITIES',
    description: 'Automates contactor switching between solar, LiFePO4 batteries, and galvanic grid isolation upon frequency drops.',
    hoursCancelledDaily: 3,
    domain: 'facilities',
    materialCost: {
      aluminumIngotsKg: 5,
      petgFilamentSpools: 1,
      copperWireMeters: 20
    },
    realHardwareBridge: {
      cadFileName: 'din_rail_esp32_enclosure.stl',
      cadFileDescription: 'Flame-retardant DIN-rail snap-in enclosure for dual relay ESP32 grid-islanding monitor.',
      cadContent: `solid din_rail_enclosure
  facet normal 0 0 1
    outer loop
      vertex 0 0 0
      vertex 25 0 0
      vertex 0 35 0
    endloop
  endfacet
endsolid din_rail_enclosure`,
      yamlFileName: 'homeassistant_microgrid_island_mode.yaml',
      yamlContent: `# ==========================================================
# O.N.E. DUAL-TRACK: HOME ASSISTANT MICROGRID ISLAND CONTROLLER
# Purpose: Detects grid instability and sheds discretionary loads
# Inverter: Deye / Victron / Growatt via Modbus/MQTT
# ==========================================================

automation:
  - id: 'one_island_mode_disconnect'
    alias: '[O.N.E.] Automatic Galvanic Islanding'
    trigger:
      - platform: numeric_state
        entity_id: sensor.grid_ac_voltage
        below: 195
    action:
      - service: switch.turn_off
        target:
          entity_id: switch.main_grid_contactor
      - service: switch.turn_off
        target:
          entity_id: group.tier3_discretionary_appliances
      - service: notify.notify
        data:
          title: '⚠️ [O.N.E.] Island Mode Engaged'
          message: 'External grid voltage collapsed. Node operating in 100% autonomous commons mode.'`
    }
  },
  {
    id: 'farmRover',
    name: 'Autonomous Solar Agro-Rover (Seeder/Weeder)',
    category: 'AGRICULTURE',
    description: 'Lightweight dual-track rover with RTK-GPS navigation. Automates bio-intensive seed planting, laser weeding, and micro-composting.',
    hoursCancelledDaily: 4,
    domain: 'agriculture',
    materialCost: {
      aluminumIngotsKg: 18,
      petgFilamentSpools: 5,
      copperWireMeters: 40
    },
    realHardwareBridge: {
      cadFileName: 'agro_rover_wheel_hub_coupler.stl',
      cadFileDescription: 'Heavy-duty planetary gear reduction hub coupler for 24V hub motors on rough terrain.',
      cadContent: `solid agro_rover_hub
  facet normal 0 0 1
    outer loop
      vertex 0 0 0
      vertex 50 0 0
      vertex 0 50 0
    endloop
  endfacet
endsolid agro_rover_hub`,
      yamlFileName: 'homeassistant_rover_telemetry.yaml',
      yamlContent: `# ==========================================================
# O.N.E. DUAL-TRACK: AGRO-ROVER TELEMETRY MQTT BRIDGE
# ==========================================================

sensor:
  - platform: mqtt
    name: 'Rover Battery State of Charge'
    state_topic: 'one/rover/battery/soc'
    unit_of_measurement: '%'
  - platform: mqtt
    name: 'Rover Soil Weed Density'
    state_topic: 'one/rover/vision/weed_index'
    unit_of_measurement: 'weeds/m²'`
    }
  },
  {
    id: 'cncSorter',
    name: 'FabLab Closed-Loop Shredder & Sorter Arm',
    category: 'WORKSHOP',
    description: 'Motorized dual-shaft shredder that pulverizes scrap PET/PP plastic into clean granules and extrudes fresh 3D printer filament.',
    hoursCancelledDaily: 4,
    domain: 'workshop',
    materialCost: {
      aluminumIngotsKg: 14,
      petgFilamentSpools: 3,
      copperWireMeters: 30
    },
    realHardwareBridge: {
      cadFileName: 'plastic_shredder_funnel_flange.stl',
      cadFileDescription: 'Reinforced feed hopper flange with safety interlock switch bracket for open-source plastic shredder.',
      cadContent: `solid shredder_flange
  facet normal 0 0 1
    outer loop
      vertex 0 0 0
      vertex 60 0 0
      vertex 0 60 0
    endloop
  endfacet
endsolid shredder_flange`,
      yamlFileName: 'homeassistant_fablab_recycling_monitor.yaml',
      yamlContent: `# ==========================================================
# O.N.E. DUAL-TRACK: FABLAB EXTRUDER TEMPERATURE PID
# ==========================================================

climate:
  - platform: generic_thermostat
    name: 'PETG Filament Extruder Nozzle'
    heater: switch.extruder_heating_band
    target_sensor: sensor.extruder_thermistor_temperature
    min_temp: 180
    max_temp: 260
    target_temp: 235`
    }
  }
];
