/**
 * Pure JavaScript Zero-Dependency QR Code Generator (SVG Renderer)
 * Produces crisp, scalable SVG QR codes for pairing PC ↔ Phone ↔ Tablet.
 * Supports Byte mode (UTF-8) with Reed-Solomon Error Correction Level L/M.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

// Galois Field GF(256) math tables
const EXP_TABLE = new Uint8Array(512);
const LOG_TABLE = new Uint8Array(256);

(function initGaloisField() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x;
    LOG_TABLE[x] = i;
    x <<= 1;
    if (x & 256) x ^= 0x11d; // Generator polynomial x^8 + x^4 + x^3 + x^2 + 1
  }
  for (let i = 255; i < 512; i++) {
    EXP_TABLE[i] = EXP_TABLE[i - 255];
  }
})();

function gfMul(x, y) {
  if (x === 0 || y === 0) return 0;
  return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]];
}

function polyMul(p1, p2) {
  const result = new Uint8Array(p1.length + p2.length - 1);
  for (let i = 0; i < p1.length; i++) {
    for (let j = 0; j < p2.length; j++) {
      result[i + j] ^= gfMul(p1[i], p2[j]);
    }
  }
  return result;
}

function getGeneratorPoly(degree) {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    poly = polyMul(poly, new Uint8Array([1, EXP_TABLE[i]]));
  }
  return poly;
}

function computeReedSolomon(data, ecLength) {
  const gen = getGeneratorPoly(ecLength);
  const result = new Uint8Array(data.length + ecLength);
  result.set(data);

  for (let i = 0; i < data.length; i++) {
    const factor = result[i];
    if (factor !== 0) {
      for (let j = 0; j < gen.length; j++) {
        result[i + j] ^= gfMul(gen[j], factor);
      }
    }
  }
  return result.slice(data.length);
}

// QR Code Version specs: [version, totalBytes, ecBytes, remainderBits] for Level L
const VERSION_SPECS_L = [
  null,
  { version: 1, total: 26, ec: 7, remainder: 0 },
  { version: 2, total: 44, ec: 10, remainder: 7 },
  { version: 3, total: 70, ec: 15, remainder: 7 },
  { version: 4, total: 100, ec: 20, remainder: 7 },
  { version: 5, total: 134, ec: 26, remainder: 7 },
  { version: 6, total: 172, ec: 36, remainder: 7 },
  { version: 7, total: 196, ec: 40, remainder: 0 },
  { version: 8, total: 242, ec: 48, remainder: 0 },
  { version: 9, total: 292, ec: 60, remainder: 0 },
  { version: 10, total: 346, ec: 72, remainder: 0 }
];

// Alignment pattern locations
const ALIGNMENT_LOCATIONS = [
  [],
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50]
];

export class QRCodeSVG {
  /**
   * Generates an SVG string representation of a QR Code.
   * @param {string} text - The content to encode
   * @param {object} options - Configuration options { size: 200, color: '#10b981', background: 'transparent', margin: 2 }
   * @returns {string} SVG markup
   */
  static generateSVG(text, options = {}) {
    const size = options.size || 220;
    const color = options.color || '#10b981'; // Solarpunk emerald green
    const background = options.background || 'transparent';
    const margin = options.margin !== undefined ? options.margin : 2;

    const matrix = this.createMatrix(text);
    const moduleCount = matrix.length;
    const totalCount = moduleCount + margin * 2;
    const cellSize = (size / totalCount).toFixed(2);

    let rects = '';
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (matrix[r][c]) {
          const x = ((c + margin) * (size / totalCount)).toFixed(2);
          const y = ((r + margin) * (size / totalCount)).toFixed(2);
          rects += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${color}" rx="0.5"/>`;
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="geometricPrecision">
      ${background !== 'transparent' ? `<rect width="100%" height="100%" fill="${background}"/>` : ''}
      ${rects}
    </svg>`;
  }

  /**
   * Creates the 2D boolean grid for the QR code
   */
  static createMatrix(text) {
    const utf8Encoder = new TextEncoder();
    const dataBytes = utf8Encoder.encode(text);

    // Find smallest version that fits data (Mode Byte: 4 bits mode + 8 bits length + data)
    let version = 1;
    for (; version <= 10; version++) {
      const spec = VERSION_SPECS_L[version];
      const capacity = spec.total - spec.ec - (version <= 9 ? 2 : 3);
      if (dataBytes.length <= capacity) break;
    }
    if (version > 10) version = 10; // Cap at 10

    const spec = VERSION_SPECS_L[version];
    const dataCapacity = spec.total - spec.ec;

    // Bit buffer encoding: Byte Mode = 0100
    const bits = [];
    function pushBits(val, len) {
      for (let i = len - 1; i >= 0; i--) {
        bits.push((val >> i) & 1);
      }
    }

    pushBits(0b0100, 4); // Byte mode
    pushBits(dataBytes.length, version <= 9 ? 8 : 16); // Character count indicator
    for (let i = 0; i < dataBytes.length; i++) {
      pushBits(dataBytes[i], 8);
    }

    // Terminator (up to 4 zeros)
    const terminatorLen = Math.min(4, dataCapacity * 8 - bits.length);
    pushBits(0, terminatorLen);

    // Byte padding
    while (bits.length % 8 !== 0) {
      bits.push(0);
    }

    // Pad bytes 0xEC, 0x11 alternating
    const padBytes = [0xec, 0x11];
    let padIdx = 0;
    while (bits.length < dataCapacity * 8) {
      pushBits(padBytes[padIdx % 2], 8);
      padIdx++;
    }

    // Convert bits to bytes
    const finalData = new Uint8Array(dataCapacity);
    for (let i = 0; i < finalData.length; i++) {
      let b = 0;
      for (let j = 0; j < 8; j++) {
        b = (b << 1) | bits[i * 8 + j];
      }
      finalData[i] = b;
    }

    // Error Correction
    const ecBytes = computeReedSolomon(finalData, spec.ec);

    // Assemble codewords
    const allCodewords = new Uint8Array(spec.total);
    allCodewords.set(finalData, 0);
    allCodewords.set(ecBytes, finalData.length);

    // Matrix dimensions
    const moduleCount = version * 4 + 17;
    const matrix = Array.from({ length: moduleCount }, () => Array(moduleCount).fill(null));

    // Place function patterns
    this.placeFinderPatterns(matrix, moduleCount);
    this.placeTimingPatterns(matrix, moduleCount);
    this.placeAlignmentPatterns(matrix, version);

    // Reserve format bits area
    this.reserveFormatBits(matrix, moduleCount);

    // Place data bits with standard mask 0 ((row + col) % 2 === 0)
    let bitIdx = 0;
    const totalBits = spec.total * 8;
    const allBits = [];
    for (let i = 0; i < allCodewords.length; i++) {
      for (let j = 7; j >= 0; j--) {
        allBits.push((allCodewords[i] >> j) & 1);
      }
    }

    let upwards = true;
    for (let right = moduleCount - 1; right > 0; right -= 2) {
      if (right === 6) right--; // Skip vertical timing column
      const rows = upwards
        ? Array.from({ length: moduleCount }, (_, i) => moduleCount - 1 - i)
        : Array.from({ length: moduleCount }, (_, i) => i);

      for (const r of rows) {
        for (const c of [right, right - 1]) {
          if (matrix[r][c] === null) {
            let bit = bitIdx < allBits.length ? allBits[bitIdx++] : 0;
            // Apply mask 0: invert if (r + c) % 2 === 0
            if ((r + c) % 2 === 0) bit ^= 1;
            matrix[r][c] = bit === 1;
          }
        }
      }
      upwards = !upwards;
    }

    // Apply Format Information (Level L, Mask 0 = 0b111011111000100)
    this.applyFormatBits(matrix, moduleCount, 0b111011111000100);

    return matrix;
  }

  static placeFinderPatterns(matrix, count) {
    const finders = [
      [0, 0],
      [count - 7, 0],
      [0, count - 7]
    ];
    for (const [row, col] of finders) {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isBlack = (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
          matrix[row + r][col + c] = isBlack;
        }
      }
      // Separator border
      for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
          if (r === -1 || r === 7 || c === -1 || c === 7) {
            const tr = row + r;
            const tc = col + c;
            if (tr >= 0 && tr < count && tc >= 0 && tc < count) {
              matrix[tr][tc] = false;
            }
          }
        }
      }
    }
  }

  static placeTimingPatterns(matrix, count) {
    for (let i = 8; i < count - 8; i++) {
      const val = i % 2 === 0;
      if (matrix[6][i] === null) matrix[6][i] = val;
      if (matrix[i][6] === null) matrix[i][6] = val;
    }
  }

  static placeAlignmentPatterns(matrix, version) {
    const locs = ALIGNMENT_LOCATIONS[version] || [];
    for (const r of locs) {
      for (const c of locs) {
        if (matrix[r][c] !== null) continue; // Skip finders
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const isBlack = Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0);
            matrix[r + dr][c + dc] = isBlack;
          }
        }
      }
    }
  }

  static reserveFormatBits(matrix, count) {
    for (let i = 0; i < 9; i++) {
      if (matrix[8][i] === null) matrix[8][i] = false;
      if (matrix[i][8] === null) matrix[i][8] = false;
    }
    for (let i = count - 8; i < count; i++) {
      if (matrix[8][i] === null) matrix[8][i] = false;
      if (matrix[i][8] === null) matrix[i][8] = false;
    }
    // Dark module
    matrix[count - 8][8] = true;
  }

  static applyFormatBits(matrix, count, formatBits) {
    // 15-bit format information sequence
    const bits = [];
    for (let i = 14; i >= 0; i--) {
      bits.push((formatBits >> i) & 1);
    }

    // Top-left
    matrix[8][0] = bits[0] === 1;
    matrix[8][1] = bits[1] === 1;
    matrix[8][2] = bits[2] === 1;
    matrix[8][3] = bits[3] === 1;
    matrix[8][4] = bits[4] === 1;
    matrix[8][5] = bits[5] === 1;
    matrix[8][7] = bits[6] === 1;
    matrix[8][8] = bits[7] === 1;
    matrix[7][8] = bits[8] === 1;
    matrix[5][8] = bits[9] === 1;
    matrix[4][8] = bits[10] === 1;
    matrix[3][8] = bits[11] === 1;
    matrix[2][8] = bits[12] === 1;
    matrix[1][8] = bits[13] === 1;
    matrix[0][8] = bits[14] === 1;

    // Bottom-left / Top-right
    for (let i = 0; i < 7; i++) {
      matrix[count - 1 - i][8] = bits[i] === 1;
    }
    for (let i = 0; i < 8; i++) {
      matrix[8][count - 8 + i] = bits[7 + i] === 1;
    }
    matrix[count - 8][8] = true; // Always 1
  }
}
