/**
 * Planetary Hex World State (Agent SIM-2)
 * Manages the global hexagonal partition: O.N.E. Commons vs Legacy Debt Territories.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { Hex } from './hex.js';
import { SEED_ONE_NODES, LEGACY_ZONES } from '../data/initial_nodes.js';

export class HexWorld {
  constructor(radius = 4) {
    this.radius = radius;
    this.tiles = new Map(); // key: "q,r" -> Tile Object
    this.generateWorld();
  }

  generateWorld() {
    const center = new Hex(0, 0);
    const allHexes = center.spiral(this.radius);

    // 1. Initialize all hexes as natural/wild commons
    for (const h of allHexes) {
      this.tiles.set(h.toString(), {
        hex: h,
        type: 'WILD_COMMONS', // WILD_COMMONS | ONE_NODE | LEGACY_ZONE
        name: `Commons Sector [${h.q}, ${h.r}]`,
        biome: this.getProceduralBiome(h),
        fertility: Math.floor(Math.random() * 40 + 60),
        solarPotential: Math.floor(Math.random() * 30 + 70),
        waterSource: Math.random() > 0.6,
        data: null
      });
    }

    // 2. Place Canonical O.N.E. Nodes
    for (const nodeData of SEED_ONE_NODES) {
      const h = new Hex(nodeData.coordinates.q, nodeData.coordinates.r);
      const key = h.toString();
      if (this.tiles.has(key)) {
        this.tiles.set(key, {
          hex: h,
          type: 'ONE_NODE',
          name: nodeData.name,
          biome: nodeData.bioregion,
          fertility: 90,
          solarPotential: 95,
          waterSource: true,
          data: nodeData
        });
      }
    }

    // 3. Place Legacy Debt & Extractive Zones
    for (const legData of LEGACY_ZONES) {
      const h = new Hex(legData.coordinates.q, legData.coordinates.r);
      const key = h.toString();
      if (this.tiles.has(key)) {
        this.tiles.set(key, {
          hex: h,
          type: 'LEGACY_ZONE',
          name: legData.name,
          biome: 'Industrial Smog / Paved Asphalt',
          fertility: 15,
          solarPotential: 50,
          waterSource: false,
          threatRating: legData.threatRating,
          data: legData
        });
      }
    }
  }

  getProceduralBiome(hex) {
    const d = hex.distanceTo(new Hex(0, 0));
    if (d === 0) return 'Regenerated Urban Commons';
    if (hex.r < -1) return 'Highland Watershed / Forest';
    if (hex.q > 1) return 'Sun-Drenched Arid Basin';
    if (hex.r > 1) return 'Alluvial River Valley';
    return 'Temperate Agro-Forestry Belt';
  }

  getTile(q, r) {
    return this.tiles.get(`${q},${r}`);
  }

  getAllTiles() {
    return Array.from(this.tiles.values());
  }

  /**
   * Returns active trade/data connections between O.N.E. nodes
   */
  getActiveMeshLinks() {
    const oneNodes = this.getAllTiles().filter(t => t.type === 'ONE_NODE');
    const links = [];
    for (let i = 0; i < oneNodes.length; i++) {
      for (let j = i + 1; j < oneNodes.length; j++) {
        // Connect if distance <= 5
        if (oneNodes[i].hex.distanceTo(oneNodes[j].hex) <= 5) {
          links.push({
            from: oneNodes[i].hex,
            to: oneNodes[j].hex,
            status: 'ACTIVE_ENCRYPTED_MESH'
          });
        }
      }
    }
    return links;
  }
}
