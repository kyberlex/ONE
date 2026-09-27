#!/usr/bin/env python3
"""
Anchor World Snapshot Engine (Agent SIM-0 & SIM-5)
Canonical Headless Peer & Long-Term Git-as-a-State-Anchor for O-ASIS Dual-Track.

Invariants:
- 100% Serverless & Free Software (AGPL-3.0-or-later)
- Cryptographic Transparency: Deterministic SHA-256 thermoConsensusHash
- Strict Zero-Leak OpSec: Author is exclusively Kyberlex <kyberlex@proton.me>

Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later
"""

import os
import sys
import json
import hashlib
import argparse
import subprocess
from datetime import datetime, timezone

SCHEMA_VERSION = 1
CANONICAL_NETWORK = "O-ASIS Confederated Mesh"
DEFAULT_TIMESTAMP = "2026-09-27T00:00:00Z"

STARTER_NODES = {
    "node-detroit": {
        "id": "node-detroit",
        "name": "Detroit Delray Commons",
        "bioregion": "Great Lakes Basin",
        "country": "United States",
        "currencySymbol": "$",
        "currencyCode": "USD",
        "currencyName": "US Dollar",
        "lat": 42.3015,
        "lng": -83.1098,
        "climateKey": "TEMPERATE",
        "population": 28,
        "morale": 85,
        "fiatTreasury": 12500,
        "thermo": {
            "energy": {
                "batteryStoredKwh": 8500,
                "batteryCapacityKwh": 10000,
                "solarGenerationKwh": 450,
                "consumptionKwh": 320
            },
            "water": {
                "cisternStoredL": 32000,
                "cisternCapacityL": 50000,
                "rainInflowL": 620,
                "consumptionL": 440
            },
            "food": {
                "granaryStoredKcal": 1800000,
                "dailyBiometricFloorKcal": 61600,
                "daysRemaining": 29.2
            },
            "compute": {
                "meshMflops": 12000,
                "activePeers": 12
            }
        },
        "robots": {
            "farmRover": 1,
            "esp32Valves": 1,
            "mpptOptimizer": 1,
            "cleaningBot": 0,
            "cncSorter": 0
        },
        "civicProjects": {
            "amphitheater": { "progress": 35, "donatedHours": 70, "targetHours": 200, "completed": False },
            "biogasDigester": { "progress": 15, "donatedHours": 45, "targetHours": 300, "completed": False },
            "deepRainReservoir": { "progress": 0, "donatedHours": 0, "targetHours": 400, "completed": False },
            "solarTower": { "progress": 0, "donatedHours": 0, "targetHours": 500, "completed": False },
            "seedVault": { "progress": 0, "donatedHours": 0, "targetHours": 350, "completed": False }
        },
        "dwellings": {
            "totalPods": 32,
            "occupiedPods": 28,
            "claimedPods": 1,
            "sabbaticalLocks": 0
        },
        "chores": {
            "landHours": 38,
            "facilitiesHours": 24,
            "careHours": 18,
            "workshopHours": 16
        }
    },
    "node-val-di-susa": {
        "id": "node-val-di-susa",
        "name": "Val di Susa Eco-Federation",
        "bioregion": "Cottian Alps Bioregion",
        "country": "Italy",
        "currencySymbol": "€",
        "currencyCode": "EUR",
        "currencyName": "Euro",
        "lat": 45.1328,
        "lng": 7.0542,
        "climateKey": "TEMPERATE",
        "population": 24,
        "morale": 88,
        "fiatTreasury": 14200,
        "thermo": {
            "energy": { "batteryStoredKwh": 9200, "batteryCapacityKwh": 12000, "solarGenerationKwh": 410, "consumptionKwh": 290 },
            "water": { "cisternStoredL": 41000, "cisternCapacityL": 60000, "rainInflowL": 750, "consumptionL": 380 },
            "food": { "granaryStoredKcal": 1650000, "dailyBiometricFloorKcal": 52800, "daysRemaining": 31.2 },
            "compute": { "meshMflops": 10500, "activePeers": 10 }
        },
        "robots": { "farmRover": 1, "esp32Valves": 1, "mpptOptimizer": 0, "cleaningBot": 0, "cncSorter": 1 },
        "civicProjects": {
            "amphitheater": { "progress": 50, "donatedHours": 100, "targetHours": 200, "completed": False },
            "biogasDigester": { "progress": 10, "donatedHours": 30, "targetHours": 300, "completed": False },
            "deepRainReservoir": { "progress": 0, "donatedHours": 0, "targetHours": 400, "completed": False },
            "solarTower": { "progress": 0, "donatedHours": 0, "targetHours": 500, "completed": False },
            "seedVault": { "progress": 0, "donatedHours": 0, "targetHours": 350, "completed": False }
        },
        "dwellings": { "totalPods": 29, "occupiedPods": 24, "claimedPods": 0, "sabbaticalLocks": 1 },
        "chores": { "landHours": 32, "facilitiesHours": 20, "careHours": 16, "workshopHours": 18 }
    },
    "node-alaska": {
        "id": "node-alaska",
        "name": "Yukon-Alaska Resilient Haven",
        "bioregion": "Subarctic Boreal Shield",
        "country": "United States / Canada",
        "currencySymbol": "$",
        "currencyCode": "USD",
        "currencyName": "US Dollar",
        "lat": 64.8378,
        "lng": -147.7164,
        "climateKey": "ARCTIC",
        "population": 18,
        "morale": 82,
        "fiatTreasury": 9800,
        "thermo": {
            "energy": { "batteryStoredKwh": 7800, "batteryCapacityKwh": 10000, "solarGenerationKwh": 280, "consumptionKwh": 310 },
            "water": { "cisternStoredL": 26000, "cisternCapacityL": 40000, "rainInflowL": 350, "consumptionL": 280 },
            "food": { "granaryStoredKcal": 1350000, "dailyBiometricFloorKcal": 39600, "daysRemaining": 34.0 },
            "compute": { "meshMflops": 8000, "activePeers": 8 }
        },
        "robots": { "farmRover": 0, "esp32Valves": 1, "mpptOptimizer": 1, "cleaningBot": 0, "cncSorter": 0 },
        "civicProjects": {
            "amphitheater": { "progress": 10, "donatedHours": 20, "targetHours": 200, "completed": False },
            "biogasDigester": { "progress": 25, "donatedHours": 75, "targetHours": 300, "completed": False },
            "deepRainReservoir": { "progress": 0, "donatedHours": 0, "targetHours": 400, "completed": False },
            "solarTower": { "progress": 0, "donatedHours": 0, "targetHours": 500, "completed": False },
            "seedVault": { "progress": 10, "donatedHours": 35, "targetHours": 350, "completed": False }
        },
        "dwellings": { "totalPods": 21, "occupiedPods": 18, "claimedPods": 0, "sabbaticalLocks": 0 },
        "chores": { "landHours": 24, "facilitiesHours": 22, "careHours": 14, "workshopHours": 12 }
    },
    "node-sahel": {
        "id": "node-sahel",
        "name": "Sahel Solar Oasis",
        "bioregion": "Niger River Basin",
        "country": "Niger",
        "currencySymbol": "CFA",
        "currencyCode": "XOF",
        "currencyName": "West African CFA Franc",
        "lat": 13.5116,
        "lng": 2.1254,
        "climateKey": "ARID",
        "population": 32,
        "morale": 84,
        "fiatTreasury": 18000,
        "thermo": {
            "energy": { "batteryStoredKwh": 11500, "batteryCapacityKwh": 14000, "solarGenerationKwh": 620, "consumptionKwh": 360 },
            "water": { "cisternStoredL": 35000, "cisternCapacityL": 65000, "rainInflowL": 380, "consumptionL": 480 },
            "food": { "granaryStoredKcal": 2100000, "dailyBiometricFloorKcal": 70400, "daysRemaining": 29.8 },
            "compute": { "meshMflops": 13500, "activePeers": 14 }
        },
        "robots": { "farmRover": 1, "esp32Valves": 1, "mpptOptimizer": 1, "cleaningBot": 0, "cncSorter": 0 },
        "civicProjects": {
            "amphitheater": { "progress": 20, "donatedHours": 40, "targetHours": 200, "completed": False },
            "biogasDigester": { "progress": 5, "donatedHours": 15, "targetHours": 300, "completed": False },
            "deepRainReservoir": { "progress": 15, "donatedHours": 60, "targetHours": 400, "completed": False },
            "solarTower": { "progress": 5, "donatedHours": 25, "targetHours": 500, "completed": False },
            "seedVault": { "progress": 0, "donatedHours": 0, "targetHours": 350, "completed": False }
        },
        "dwellings": { "totalPods": 38, "occupiedPods": 32, "claimedPods": 0, "sabbaticalLocks": 0 },
        "chores": { "landHours": 42, "facilitiesHours": 28, "careHours": 22, "workshopHours": 18 }
    },
    "node-amazon": {
        "id": "node-amazon",
        "name": "Amazonas Bioregional Basin",
        "bioregion": "Rio Negro Watershed",
        "country": "Brazil",
        "currencySymbol": "R$",
        "currencyCode": "BRL",
        "currencyName": "Brazilian Real",
        "lat": -3.1190,
        "lng": -60.0217,
        "climateKey": "TROPICAL",
        "population": 26,
        "morale": 89,
        "fiatTreasury": 13000,
        "thermo": {
            "energy": { "batteryStoredKwh": 8900, "batteryCapacityKwh": 11000, "solarGenerationKwh": 480, "consumptionKwh": 310 },
            "water": { "cisternStoredL": 48000, "cisternCapacityL": 55000, "rainInflowL": 950, "consumptionL": 420 },
            "food": { "granaryStoredKcal": 1950000, "dailyBiometricFloorKcal": 57200, "daysRemaining": 34.0 },
            "compute": { "meshMflops": 11000, "activePeers": 11 }
        },
        "robots": { "farmRover": 1, "esp32Valves": 1, "mpptOptimizer": 0, "cleaningBot": 0, "cncSorter": 0 },
        "civicProjects": {
            "amphitheater": { "progress": 40, "donatedHours": 80, "targetHours": 200, "completed": False },
            "biogasDigester": { "progress": 20, "donatedHours": 60, "targetHours": 300, "completed": False },
            "deepRainReservoir": { "progress": 0, "donatedHours": 0, "targetHours": 400, "completed": False },
            "solarTower": { "progress": 0, "donatedHours": 0, "targetHours": 500, "completed": False },
            "seedVault": { "progress": 15, "donatedHours": 52, "targetHours": 350, "completed": False }
        },
        "dwellings": { "totalPods": 30, "occupiedPods": 26, "claimedPods": 0, "sabbaticalLocks": 0 },
        "chores": { "landHours": 36, "facilitiesHours": 22, "careHours": 18, "workshopHours": 16 }
    },
    "node-kerala": {
        "id": "node-kerala",
        "name": "Kerala Coastal Autonomous Commune",
        "bioregion": "Malabar Coast",
        "country": "India",
        "currencySymbol": "₹",
        "currencyCode": "INR",
        "currencyName": "Indian Rupee",
        "lat": 9.9312,
        "lng": 76.2673,
        "climateKey": "TROPICAL",
        "population": 30,
        "morale": 91,
        "fiatTreasury": 15500,
        "thermo": {
            "energy": { "batteryStoredKwh": 9600, "batteryCapacityKwh": 12000, "solarGenerationKwh": 510, "consumptionKwh": 340 },
            "water": { "cisternStoredL": 45000, "cisternCapacityL": 52000, "rainInflowL": 880, "consumptionL": 460 },
            "food": { "granaryStoredKcal": 2200000, "dailyBiometricFloorKcal": 66000, "daysRemaining": 33.3 },
            "compute": { "meshMflops": 12500, "activePeers": 13 }
        },
        "robots": { "farmRover": 1, "esp32Valves": 1, "mpptOptimizer": 1, "cleaningBot": 0, "cncSorter": 0 },
        "civicProjects": {
            "amphitheater": { "progress": 60, "donatedHours": 120, "targetHours": 200, "completed": False },
            "biogasDigester": { "progress": 30, "donatedHours": 90, "targetHours": 300, "completed": False },
            "deepRainReservoir": { "progress": 10, "donatedHours": 40, "targetHours": 400, "completed": False },
            "solarTower": { "progress": 0, "donatedHours": 0, "targetHours": 500, "completed": False },
            "seedVault": { "progress": 5, "donatedHours": 18, "targetHours": 350, "completed": False }
        },
        "dwellings": { "totalPods": 34, "occupiedPods": 30, "claimedPods": 0, "sabbaticalLocks": 0 },
        "chores": { "landHours": 40, "facilitiesHours": 26, "careHours": 20, "workshopHours": 18 }
    }
}

CANONICAL_CASE_LAW = [
    {
        "docketId": "SIM-QA-01",
        "title": "Quorum Scaling for Emerging Nodes (< 50 Pop)",
        "originNode": "Detroit Delray Commons",
        "constitutionalArticle": "Art. 4.2.1",
        "ratified": True,
        "ratifiedTick": 0,
        "threshold": 0.75,
        "precedentRule": "Emerging communities (<50 citizens) hold sovereign council sortitions with 3 randomly drawn citizens in odd parity."
    },
    {
        "docketId": "SIM-QA-02",
        "title": "Dual-Tier Tool Classification: Personal Craft vs. Civic Library",
        "originNode": "Val di Susa Eco-Federation",
        "constitutionalArticle": "Art. 3.1 & 3.4",
        "ratified": True,
        "ratifiedTick": 0,
        "threshold": 0.75,
        "precedentRule": "Hand tools are inviolable personal property; heavy machining tools circulate through the open FabLab tool library."
    }
]

def get_canonical_paths():
    """Returns absolute paths to repo root and public snapshot file."""
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    snapshot_path = os.path.join(repo_root, "sim", "app", "public", "world_snapshot.json")
    return repo_root, snapshot_path

def compute_consensus_hash(payload_dict):
    """
    Computes deterministic SHA-256 consensus hash over canonical state.
    Excludes thermoConsensusHash field itself to ensure reproducible hashing.
    """
    hashable_data = {k: v for k, v in payload_dict.items() if k != "thermoConsensusHash"}
    canonical_json = json.dumps(hashable_data, sort_keys=True, separators=(',', ':'))
    return hashlib.sha256(canonical_json.encode('utf-8')).hexdigest()

def create_genesis_snapshot():
    """Generates the canonical Genesis Block snapshot state object."""
    state = {
        "schemaVersion": SCHEMA_VERSION,
        "network": CANONICAL_NETWORK,
        "genesis": True,
        "tick": 0,
        "day": 1,
        "timestamp": DEFAULT_TIMESTAMP,
        "nodes": STARTER_NODES,
        "caseLawPrecedents": CANONICAL_CASE_LAW,
        "metadata": {
            "engineVersion": "0.1.0",
            "consensusStandard": "Git-as-a-State-Anchor (O-ASIS Dual-Track Protocol)",
            "p2pTransport": "WebRTC DataChannel + Nostr NIP-01 + BroadcastChannel",
            "author": "Kyberlex <kyberlex@proton.me>",
            "license": "AGPL-3.0-or-later"
        }
    }
    state["thermoConsensusHash"] = compute_consensus_hash(state)
    return state

def validate_snapshot(state):
    """Validates schema conformance and cryptographic hash integrity."""
    required_keys = ["schemaVersion", "network", "tick", "nodes", "thermoConsensusHash"]
    for k in required_keys:
        if k not in state:
            return False, f"Missing required key: {k}"

    if state["schemaVersion"] != SCHEMA_VERSION:
        return False, f"Unsupported schemaVersion: {state['schemaVersion']}"

    computed = compute_consensus_hash(state)
    if computed != state["thermoConsensusHash"]:
        return False, f"Consensus hash mismatch! Expected {computed}, found {state['thermoConsensusHash']}"

    return True, "Valid"

def write_snapshot_file(state, file_path):
    """Writes state to JSON file with deterministic formatting."""
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2, sort_keys=False)
        f.write("\n")

def read_snapshot_file(file_path):
    """Reads snapshot file from disk."""
    if not os.path.exists(file_path):
        return None
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

def advance_simulation_state(state, delta_ticks=1):
    """
    Advances deterministic simulation headlessly for delta_ticks.
    Computes thermodynamic cycles and updates hash.
    """
    state["tick"] = state.get("tick", 0) + delta_ticks
    state["day"] = (state["tick"] // 24) + 1
    state["genesis"] = False
    state["timestamp"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    # Minor deterministic drift across nodes to simulate living physical flows
    for node_id, node in state.get("nodes", {}).items():
        thermo = node.get("thermo", {})
        energy = thermo.get("energy", {})
        water = thermo.get("water", {})
        food = thermo.get("food", {})

        # Energy solar curve based on local hour
        lng = node.get("lng", 0)
        local_hour = ((state["tick"] + int(round(lng / 15))) % 24 + 24) % 24
        is_day = 6 <= local_hour < 21

        gen = 450 if is_day else 0
        con = 320 if is_day else 180
        delta_e = (gen - con) * delta_ticks
        cur_e = energy.get("batteryStoredKwh", 8000)
        max_e = energy.get("batteryCapacityKwh", 10000)
        energy["batteryStoredKwh"] = max(0, min(max_e, cur_e + delta_e))

        # Water cycles
        cur_w = water.get("cisternStoredL", 30000)
        max_w = water.get("cisternCapacityL", 50000)
        delta_w = int(round((water.get("rainInflowL", 500) - water.get("consumptionL", 400)) * 0.1 * delta_ticks))
        water["cisternStoredL"] = max(0, min(max_w, cur_w + delta_w))

    state["thermoConsensusHash"] = compute_consensus_hash(state)
    return state

def main():
    parser = argparse.ArgumentParser(description="O-ASIS Git-as-a-State-Anchor Snapshot Engine")
    parser.add_argument("--generate-genesis", action="store_true", help="Generate or reset to canonical Genesis Block snapshot")
    parser.add_argument("--check", action="store_true", help="Validate existing public world snapshot integrity")
    parser.add_argument("--advance", type=int, default=0, help="Advance simulation by N ticks deterministically")
    parser.add_argument("--get-stamp", action="store_true", help="Print commit message stamp (Tick <N> [Hash: <hash>])")
    parser.add_argument("--export", type=str, default=None, help="Export snapshot to specified path")
    args = parser.parse_args()

    repo_root, snapshot_path = get_canonical_paths()

    # 1. Read existing or create genesis
    state = read_snapshot_file(snapshot_path)

    if args.generate_genesis or state is None:
        print("[*] Generating canonical Genesis Block #1 snapshot...")
        state = create_genesis_snapshot()
        write_snapshot_file(state, snapshot_path)
        print(f"  [✓] Genesis snapshot written to: {snapshot_path}")
        print(f"  [✓] Consensus Hash (SHA-256): {state['thermoConsensusHash']}")

    # 2. Advance ticks if specified
    if args.advance > 0:
        print(f"[*] Advancing simulation state by {args.advance} ticks...")
        state = advance_simulation_state(state, args.advance)
        write_snapshot_file(state, snapshot_path)
        print(f"  [✓] State updated: Tick {state['tick']}, Day {state['day']}")
        print(f"  [✓] New Consensus Hash: {state['thermoConsensusHash']}")

    # 3. Export if requested
    if args.export:
        dest_path = os.path.abspath(args.export)
        write_snapshot_file(state, dest_path)
        print(f"[✓] Snapshot exported to: {dest_path}")

    # 4. Get stamp for git commit messages
    if args.get_stamp:
        short_hash = state.get("thermoConsensusHash", "")[:8]
        tick = state.get("tick", 0)
        print(f"Tick {tick} [Hash: {short_hash}]")
        return 0

    # 5. Check validation
    if args.check or True:
        valid, msg = validate_snapshot(state)
        if not valid:
            print(f"❌ Snapshot validation failed: {msg}")
            sys.exit(1)
        else:
            print(f"✅ Snapshot integrity verified: Tick {state['tick']}, Hash {state['thermoConsensusHash'][:12]}... (OK)")

    return 0

if __name__ == "__main__":
    sys.exit(main())
