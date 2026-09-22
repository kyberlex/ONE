/**
 * Astronomical Solar Terminator Calculation Engine (Agent SIM-2)
 * Computes subsolar position, solar declination, and the day/night terminator curve
 * across Earth's surface for Leaflet cartography.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

/**
 * Calculates solar declination (delta in degrees) based on simulation day of year [1..365]
 */
export function getSolarDeclination(dayOfYear = 80) {
  // Axial tilt of Earth: ~23.44 degrees
  // Spring equinox occurs around day 80 (delta = 0)
  const fraction = ((2 * Math.PI) / 365) * (dayOfYear - 80);
  const delta = 23.44 * Math.sin(fraction);
  // Avoid division by zero at exact equinox
  if (Math.abs(delta) < 0.08) {
    return delta >= 0 ? 0.08 : -0.08;
  }
  return delta;
}

/**
 * Calculates subsolar longitude (lambda in degrees [-180, 180]) based on hour [0..24)
 */
export function getSubsolarLongitude(hour = 12) {
  // At 12:00 UTC, sun is at 0 degrees longitude (Greenwich)
  // Earth rotates 15 degrees per hour from East to West
  let lng = (12 - hour) * 15;
  while (lng > 180) lng -= 360;
  while (lng < -180) lng += 360;
  return lng;
}

/**
 * Determines whether a given coordinate (lat, lng) is currently in night
 */
export function isPointInNight(lat, lng, hour = 12, dayOfYear = 80) {
  const delta = getSolarDeclination(dayOfYear) * DEG2RAD;
  const subLng = getSubsolarLongitude(hour) * DEG2RAD;
  const phi = lat * DEG2RAD;
  const lambda = lng * DEG2RAD;

  // Sine of solar elevation angle
  const sinAltitude = Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.cos(lambda - subLng);
  return sinAltitude < -0.02; // True twilight/night threshold
}

/**
 * Generates Leaflet-compatible polygon vertices for the night hemisphere.
 * Returns array of [lat, lng] pairs.
 */
export function getNightPolygonCoordinates(hour = 12, dayOfYear = 80, stepDeg = 2) {
  const deltaDeg = getSolarDeclination(dayOfYear);
  const deltaRad = deltaDeg * DEG2RAD;
  const tanDelta = Math.tan(deltaRad);
  const subLngDeg = getSubsolarLongitude(hour);

  const points = [];
  const MAX_LAT = 84.0; // Strictly within Web Mercator EPSG:3857 limit (85.0511)
  const minLng = -180;
  const maxLng = 180;

  // Compute latitude for each longitude along the terminator
  const terminatorPoints = [];
  for (let lng = minLng; lng <= maxLng; lng += stepDeg) {
    const diffRad = (lng - subLngDeg) * DEG2RAD;
    const latRad = Math.atan(-Math.cos(diffRad) / tanDelta);
    let latDeg = latRad * RAD2DEG;
    latDeg = Math.max(-MAX_LAT, Math.min(MAX_LAT, latDeg));
    terminatorPoints.push([latDeg, lng]);
  }

  // If delta > 0, South Pole is in polar darkness (night covers latitudes < terminator)
  // If delta < 0, North Pole is in polar darkness (night covers latitudes > terminator)
  if (deltaDeg > 0) {
    const southPoleLat = -MAX_LAT;
    points.push([southPoleLat, minLng]);
    points.push([southPoleLat, maxLng]);
    for (let i = terminatorPoints.length - 1; i >= 0; i--) {
      points.push(terminatorPoints[i]);
    }
    points.push([southPoleLat, minLng]);
  } else {
    const northPoleLat = MAX_LAT;
    points.push([northPoleLat, minLng]);
    points.push([northPoleLat, maxLng]);
    for (let i = terminatorPoints.length - 1; i >= 0; i--) {
      points.push(terminatorPoints[i]);
    }
    points.push([northPoleLat, minLng]);
  }

  return points;
}
