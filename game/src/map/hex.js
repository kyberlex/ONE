/**
 * Axial & Cube Hexagonal Coordinates Library
 * Pure mathematical functions for hex grids (flat-top and pointy-top).
 * Based on Red Blob Games hexagonal grid algorithms.
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

export class Hex {
  constructor(q, r, s = -q - r) {
    this.q = q;
    this.r = r;
    this.s = s;
    if (Math.round(q + r + s) !== 0) {
      throw new Error(`Invalid cube coordinate: q=${q}, r=${r}, s=${s}`);
    }
  }

  toString() {
    return `${this.q},${this.r}`;
  }

  static fromString(str) {
    const [q, r] = str.split(',').map(Number);
    return new Hex(q, r);
  }

  equals(other) {
    return this.q === other.q && this.r === other.r;
  }

  add(other) {
    return new Hex(this.q + other.q, this.r + other.r, this.s + other.s);
  }

  subtract(other) {
    return new Hex(this.q - other.q, this.r - other.r, this.s - other.s);
  }

  scale(k) {
    return new Hex(this.q * k, this.r * k, this.s * k);
  }

  distanceTo(other) {
    return (
      (Math.abs(this.q - other.q) +
        Math.abs(this.r - other.r) +
        Math.abs(this.s - other.s)) /
      2
    );
  }

  // 6 axial neighbor directions (pointy-top orientation)
  static directions = [
    new Hex(1, 0, -1),
    new Hex(1, -1, 0),
    new Hex(0, -1, 1),
    new Hex(-1, 0, 1),
    new Hex(-1, 1, 0),
    new Hex(0, 1, -1)
  ];

  neighbor(directionIndex) {
    return this.add(Hex.directions[(directionIndex % 6 + 6) % 6]);
  }

  neighbors() {
    return Hex.directions.map(dir => this.add(dir));
  }

  ring(radius) {
    if (radius === 0) return [this];
    const results = [];
    let current = this.add(Hex.directions[4].scale(radius));
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < radius; j++) {
        results.push(current);
        current = current.neighbor(i);
      }
    }
    return results;
  }

  spiral(radius) {
    const results = [this];
    for (let k = 1; k <= radius; k++) {
      results.push(...this.ring(k));
    }
    return results;
  }
}

/**
 * Layout converts between Hex coordinates and Screen (Pixel) coordinates.
 * We use Pointy-Top Hexagons for aesthetic Solarpunk maps.
 */
export class HexLayout {
  constructor(size, origin = { x: 0, y: 0 }) {
    this.size = size; // { x: radius, y: radius }
    this.origin = origin;
  }

  // Pointy-topped orientation constants
  static SQRT3 = Math.sqrt(3);

  hexToPixel(hex) {
    const x = (HexLayout.SQRT3 * hex.q + (HexLayout.SQRT3 / 2) * hex.r) * this.size.x;
    const y = (1.5 * hex.r) * this.size.y;
    return {
      x: x + this.origin.x,
      y: y + this.origin.y
    };
  }

  pixelToHex(point) {
    const pt = {
      x: (point.x - this.origin.x) / this.size.x,
      y: (point.y - this.origin.y) / this.size.y
    };
    const q = (HexLayout.SQRT3 / 3 * pt.x - 1 / 3 * pt.y);
    const r = (2 / 3 * pt.y);
    return this.roundHex(q, r);
  }

  roundHex(q, r) {
    let s = -q - r;
    let roundQ = Math.round(q);
    let roundR = Math.round(r);
    let roundS = Math.round(s);

    const qDiff = Math.abs(roundQ - q);
    const rDiff = Math.abs(roundR - r);
    const sDiff = Math.abs(roundS - s);

    if (qDiff > rDiff && qDiff > sDiff) {
      roundQ = -roundR - roundS;
    } else if (rDiff > sDiff) {
      roundR = -roundQ - roundS;
    } else {
      roundS = -roundQ - roundR;
    }

    return new Hex(roundQ, roundR, roundS);
  }

  polygonCorners(hex) {
    const center = this.hexToPixel(hex);
    const corners = [];
    for (let i = 0; i < 6; i++) {
      const angle = (2 * Math.PI / 6) * (i + 0.5); // Pointy top has 30 deg offset
      corners.push({
        x: center.x + this.size.x * Math.cos(angle),
        y: center.y + this.size.y * Math.sin(angle)
      });
    }
    return corners;
  }
}
