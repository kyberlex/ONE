/**
 * 2D Interactive Planetary Cartography & Geolocation Engine (Agent SIM-2)
 * Built with Leaflet & CartoDB Dark Matter tiles.
 * Allows player to explore Earth, auto-locate their physical bioregion,
 * inspect federated O.N.E. nodes, found new nodes, and zoom into settlements.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import L from 'leaflet';
import { GLOBAL_STARTER_NODES, getClimateZoneFromLat, createCustomGlobalNode } from '../data/bioregions.js';
import { fetchNearestTownName, getRegionalMajorCities, formatPopulation, estimateViewportBounds, calculateDistanceKm } from '../data/cities.js';
import { t } from '../i18n/index.js';
import { getNightPolygonCoordinates, isPointInNight } from './solar_terminator.js';

export class WorldMapController {
  constructor(containerId, onSelectNodeCallback, onFoundNodeCallback, onDiscreteZoomGestureCallback = null, onRegionCitiesChangedCallback = null) {
    this.containerId = containerId;
    this.onSelectNode = onSelectNodeCallback || (() => {});
    this.onFoundNode = onFoundNodeCallback || (() => {});
    this.onDiscreteZoomGesture = onDiscreteZoomGestureCallback;
    this.onRegionCitiesChanged = onRegionCitiesChangedCallback || (() => {});
    this.nodes = [...GLOBAL_STARTER_NODES];
    this.map = null;
    this.markersLayer = null;
    this.regionalCitiesLayer = null;
    this.activePlacedBeaconMarker = null;
    this.currentPlacedLocation = null;
    this.meshLinksLayer = null;
    this.userLocationMarker = null;
    this.terminatorLayer = null;
    this.nodeMarkers = new Map();
    this.lastHour = 12;
    this.lastDay = 80;

    this.initMap();
  }

  showWorld(animate = true) {
    if (!this.map) return;
    this.map.invalidateSize();
    if (animate) {
      this.map.flyTo([20, 0], 2.5, { duration: 1.1 });
    } else {
      this.map.fitBounds([[-60, -175], [75, 175]], { animate: false, padding: [10, 10] });
    }
  }

  showRegion(node, animate = true) {
    if (!this.map || !node) return;
    if (animate) {
      this.map.flyTo([node.lat, node.lng], 7.0, { duration: 1.0 });
    } else {
      this.map.setView([node.lat, node.lng], 7.0, { animate: false });
    }

    // Open popup for this node so the visit button is immediately accessible
    setTimeout(() => {
      if (!this.markersLayer) return;
      this.markersLayer.eachLayer(layer => {
        if (layer.getLatLng) {
          const pos = layer.getLatLng();
          if (Math.abs(pos.lat - node.lat) < 0.001 && Math.abs(pos.lng - node.lng) < 0.001) {
            layer.openPopup();
          }
        }
      });
    }, animate ? 550 : 50);
  }

  initMap() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    // Global delegated click handler for popup visit/enter node buttons
    document.addEventListener('click', e => {
      const enterBtn = e.target.closest('.btn-popup-enter-node');
      if (enterBtn) {
        e.preventDefault();
        e.stopPropagation();
        const nodeId = enterBtn.getAttribute('data-node-id');
        const node = this.nodes.find(n => n.id === nodeId);
        if (node) {
          if (this.map) this.map.closePopup();
          this.onSelectNode(node);
        }
      }
    });

    // Optional discrete gesture trapping on map container
    container.addEventListener('wheel', e => {
      if (this.onDiscreteZoomGesture) {
        const delta = e.deltaY < 0 ? 30 : -30;
        const handled = this.onDiscreteZoomGesture(delta);
        if (handled) {
          e.preventDefault();
        }
      }
    }, { passive: false });

    // Center on Atlantic/Equator view initially with zero-void strict bounds
    this.map = L.map(this.containerId, {
      center: [20, 0],
      zoom: 2.5,
      minZoom: 2,
      maxZoom: 17,
      zoomControl: false,
      attributionControl: false,
      worldCopyJump: false,
      maxBounds: [[-85, -180], [85, 180]],
      maxBoundsViscosity: 1.0
    });

    // Zoom control at top-right
    L.control.zoom({ position: 'topright' }).addTo(this.map);

    const tileLayerBounds = [[-85.05112878, -180], [85.05112878, 180]];

    const baseUrl = import.meta.env.BASE_URL || '/';
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const lowResUrl = `${cleanBase}/assets/map/world_low.webp`;
    const highResUrl = `${cleanBase}/assets/map/world_high.webp`;

    // 100% Offline-First Earth Base Layer: Bundled Dual-Resolution Raster (0 KB network egress)
    // 1. Instant local render with low-res (230 KB) in the background tilePane
    this.earthImageLayer = L.imageOverlay(lowResUrl, tileLayerBounds, {
      pane: 'tilePane',
      opacity: 1.0,
      interactive: false,
      crossOrigin: true
    }).addTo(this.map);

    // 2. Seamlessly upgrade to high-res (1.1 MB) once decoded in memory
    const highImg = new Image();
    highImg.src = highResUrl;
    highImg.onload = () => {
      if (this.earthImageLayer) {
        this.earthImageLayer.setUrl(highResUrl);
      }
    };

    // Dedicated pane for solar terminator night shadow between satellite tiles and markers
    this.map.createPane('terminatorPane');
    const termPane = this.map.getPane('terminatorPane');
    if (termPane) {
      termPane.style.zIndex = '350';
      termPane.style.pointerEvents = 'none';
      termPane.style.filter = 'blur(5px)';
    }

    this.terminatorLayer = L.polygon(getNightPolygonCoordinates(12, 80), {
      pane: 'terminatorPane',
      fillColor: '#020617',
      fillOpacity: 0.62,
      stroke: false,
      interactive: false
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);
    this.regionalCitiesLayer = L.layerGroup().addTo(this.map);
    this.meshLinksLayer = L.layerGroup().addTo(this.map);
    this.convoysLayer = L.layerGroup().addTo(this.map);

    this.renderAllNodes();
    this.renderMeshLinks();
    this.bindMapEvents();

    // Dynamically refresh the 3-5 largest regional cities whenever the user pans, zooms, or stops moving
    this.map.on('moveend', () => {
      this.refreshShownRegionCities();
    });
  }


  renderAllNodes() {
    this.markersLayer.clearLayers();
    this.nodeMarkers.clear();

    for (const node of this.nodes) {
      const climate = getClimateZoneFromLat(node.lat);

      // Custom Solarpunk Bioluminescent HTML Marker
      const customIcon = L.divIcon({
        className: 'one-node-leaflet-marker',
        html: `
          <div class="node-marker-wrapper" style="--node-accent: ${climate.accentColor};">
            <div class="marker-pulse-ring"></div>
            <div class="marker-center-badge">
              <img src="/one-logo-white.svg" alt="O.N.E." class="marker-logo-img" />
            </div>
            <div class="marker-name-tag">${node.name.split(' ')[0]}</div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      const marker = L.marker([node.lat, node.lng], { icon: customIcon });

      // Rich glassmorphic popup
      const popupHtml = `
        <div class="node-map-popup" style="--climate-color: ${climate.accentColor};">
          <div class="popup-header">
            <img src="/one-logo-white.svg" alt="O.N.E." class="popup-logo" />
            <div>
              <h4>${node.name}</h4>
              <span class="popup-bioregion">${node.bioregion} • ${node.country}</span>
            </div>
          </div>

          <div class="popup-climate-pill">
            <span>${climate.nameKey ? t(climate.nameKey, climate.name) : climate.name}</span> • <strong>${climate.dwellingTypeKey ? t(climate.dwellingTypeKey, climate.dwellingType) : climate.dwellingType}</strong>
          </div>

          <p class="popup-quote">"${node.quote}"</p>

          <div class="popup-stats-grid">
            <div><strong>${t('populationLabel', 'Population:')}</strong> ${node.population} pax</div>
            <div><strong>${t('civicReserveLabel', 'Civic Reserve:')}</strong> <span class="text-green">${t('freePodsLabel', '{count} Free Pods').replace('{count}', node.freeHousingBuffer)}</span></div>
          </div>

          <div class="popup-actions">
            <button class="btn-popup-enter-node" data-node-id="${node.id}">
              🔭 ${t('btnVisitVillage', 'Visit & Enter Village')}
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'one-custom-leaflet-popup',
        maxWidth: 320,
        minWidth: 280
      });

      marker.on('popupopen', e => {
        const popupEl = e.popup?.getElement();
        const enterBtn = popupEl ? popupEl.querySelector(`.btn-popup-enter-node`) : document.querySelector(`.btn-popup-enter-node[data-node-id="${node.id}"]`);
        if (enterBtn) {
          L.DomEvent.disableClickPropagation(enterBtn);
          enterBtn.onclick = ev => {
            ev.preventDefault();
            ev.stopPropagation();
            if (this.map) this.map.closePopup();
            this.onSelectNode(node);
          };
        }
      });

      // Double-click on node marker directly visits and enters the node
      marker.on('dblclick', ev => {
        L.DomEvent.stopPropagation(ev);
        if (this.map) this.map.closePopup();
        this.onSelectNode(node);
      });

      this.markersLayer.addLayer(marker);
      this.nodeMarkers.set(node.id, { marker, node });
    }
    this.updateSolarTerminator(this.lastHour, this.lastDay);
  }

  renderMeshLinks() {
    this.meshLinksLayer.clearLayers();

    // Draw lines between linked nodes
    for (const node of this.nodes) {
      if (node.meshLinks) {
        for (const targetId of node.meshLinks) {
          const targetNode = this.nodes.find(n => n.id === targetId);
          if (targetNode) {
            const polyline = L.polyline([[node.lat, node.lng], [targetNode.lat, targetNode.lng]], {
              color: '#34d399',
              weight: 2.5,
              opacity: 0.85,
              dashArray: '6, 10',
              className: 'mesh-link-animated'
            });
            this.meshLinksLayer.addLayer(polyline);

          }
        }
      }
    }
  }

  updateTradeConvoys(convoys, tradeEngine = null) {
    if (!this.convoysLayer) return;
    this.convoysLayer.clearLayers();
    if (!convoys || convoys.length === 0) return;

    for (const convoy of convoys) {
      let originLat, originLng, destLat, destLng, progressPct;
      const isDrone = convoy.type === 'vtol_drone' || convoy.vehicleType === 'drone';
      const vehicleIcon = isDrone ? '🚁' : '🚴';
      const vehicleName = isDrone ? 'Autonomous Courier Drone' : 'Solar Cargo Trike';
      const originName = convoy.originName || 'Home Settlement';
      const destName = (convoy.destination || convoy.destName || convoy.targetNodeName || 'Sister Node').replace(/_/g, ' ');

      if (tradeEngine && tradeEngine.getConvoyGeoPosition && tradeEngine.getNodeById) {
        const pos = tradeEngine.getConvoyGeoPosition(convoy);
        const origin = tradeEngine.getNodeById(convoy.originNodeId);
        const dest = tradeEngine.getNodeById(convoy.destNodeId);
        if (pos && origin && dest) {
          originLat = origin.lat; originLng = origin.lng;
          destLat = dest.lat; destLng = dest.lng;
          progressPct = convoy.progressTicks / convoy.totalTicks;
        }
      }

      if (originLat === undefined) {
        const homeNode = this.nodes.find(n => n.id === 'val_di_susa' || n.isPlayerHome) || this.nodes[0] || { lat: 45.13, lng: 7.05 };
        const destNode = this.nodes.find(n => n.id === convoy.destination || n.id === convoy.destNodeId) || this.nodes[1] || { lat: 43.32, lng: 10.86 };

        originLat = homeNode.lat;
        originLng = homeNode.lng;
        destLat = destNode.lat;
        destLng = destNode.lng;

        const totalDays = Math.max(1, (convoy.etaDay - convoy.departureDay) || (convoy.daysRemaining ? convoy.daysRemaining + 1 : 2));
        progressPct = Math.max(0.05, Math.min(0.95, (1 - ((convoy.daysRemaining || 1) / totalDays))));
      }

      const currLat = originLat + (destLat - originLat) * (progressPct || 0.5);
      const currLng = originLng + (destLng - originLng) * (progressPct || 0.5);

      // Draw highlighted animated active convoy route
      const routeLine = L.polyline([[originLat, originLng], [destLat, destLng]], {
        color: '#f59e0b',
        weight: 3.5,
        opacity: 0.85,
        dashArray: '6, 12',
        className: 'convoy-route-animated'
      });
      this.convoysLayer.addLayer(routeLine);

      // Custom animated convoy vehicle icon with pulsing halo
      const customIcon = L.divIcon({
        className: 'convoy-leaflet-marker',
        html: `
          <div class="convoy-marker-wrapper" style="position: relative; text-align: center;">
            <div class="convoy-pulse-ring" style="position: absolute; top: -5px; left: -5px; width: 34px; height: 34px; border-radius: 50%; border: 2px solid ${isDrone ? '#38bdf8' : '#fbbf24'}; animation: convoyPulse 1.8s infinite;"></div>
            <div class="convoy-vehicle-badge" style="width: 24px; height: 24px; border-radius: 50%; background: #0f172a; border: 1.5px solid ${isDrone ? '#38bdf8' : '#fbbf24'}; display: flex; align-items: center; justify-content: center; font-size: 13px;">${vehicleIcon}</div>
            <div class="convoy-tag" style="background: rgba(15,23,42,0.9); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; padding: 1px 4px; font-size: 9px; font-weight: 700; color: #f8fafc; white-space: nowrap; margin-top: 2px;">${destName.split(' ')[0]} (${Math.round((progressPct || 0.5) * 100)}%)</div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker([currLat, currLng], { icon: customIcon });
      this.convoysLayer.addLayer(marker);
    }
  }

  /**
   * Renders 3 to 5 largest regional cities/towns in the shown region on the map
   */
  renderRegionalCities(cities) {
    if (!this.regionalCitiesLayer) return;
    this.regionalCitiesLayer.clearLayers();
    if (!cities || cities.length === 0) return;

    for (const city of cities) {
      // High-visibility yellow city label matching user's visual requirements
      const cityIcon = L.divIcon({
        className: 'regional-city-leaflet-marker',
        html: `
          <div class="city-marker-label" title="${city.name} (${city.popFormatted || formatPopulation(city.pop)} pop • ${city.distanceKm} km away)">
            <span class="city-marker-name">${city.name}</span>
            <span class="city-marker-sub">${city.popFormatted || formatPopulation(city.pop)}</span>
          </div>
        `,
        iconSize: [110, 42],
        iconAnchor: [55, 21]
      });

      const marker = L.marker([city.lat, city.lng], {
        icon: cityIcon,
        zIndexOffset: -50
      });

      marker.bindPopup(`
        <div class="regional-city-popup">
          <h4>🏙️ ${city.name}</h4>
          <span class="city-popup-country">${city.country || ''}</span>
          <div class="city-popup-details">
            <div><strong>Population:</strong> ${(city.pop || 0).toLocaleString()} residents</div>
            <div><strong>Distance to Node:</strong> ${city.distanceKm} km</div>
          </div>
        </div>
      `, {
        className: 'one-custom-leaflet-popup',
        maxWidth: 240
      });

      this.regionalCitiesLayer.addLayer(marker);
    }
  }

  /**
   * Refreshes the 3-5 largest cities inside the currently shown map viewport
   */
  refreshShownRegionCities() {
    if (!this.map) return [];
    const bounds = this.map.getBounds();
    const center = this.map.getCenter();
    const refLat = this.currentPlacedLocation ? this.currentPlacedLocation.lat : center.lat;
    const refLng = this.currentPlacedLocation ? this.currentPlacedLocation.lng : center.lng;

    const majorCities = getRegionalMajorCities(refLat, refLng, bounds, 5);
    this.renderRegionalCities(majorCities);

    if (typeof this.onRegionCitiesChanged === 'function') {
      this.onRegionCitiesChanged(majorCities);
    }
    return majorCities;
  }

  /**
   * Updates or places the user's active seed beacon marker with Solarpunk styling
   */
  updatePlacementBeacon(lat, lng, name, climate, majorCities = [], openPopup = false) {
    this.currentPlacedLocation = { lat, lng, name, climate, majorCities };

    if (this.activePlacedBeaconMarker) {
      this.map.removeLayer(this.activePlacedBeaconMarker);
      this.activePlacedBeaconMarker = null;
    }

    const beaconIcon = L.divIcon({
      className: 'one-node-leaflet-marker is-placed-beacon',
      html: `
        <div class="node-marker-wrapper" style="--node-accent: ${climate.accentColor || '#10b981'};">
          <div class="marker-pulse-ring beacon-placing-pulse"></div>
          <div class="marker-center-badge">
            <span style="font-size: 18px; filter: drop-shadow(0 0 6px rgba(16, 185, 129, 0.8));">🌱</span>
          </div>
          <div class="marker-name-tag">${name}</div>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 24]
    });

    this.activePlacedBeaconMarker = L.marker([lat, lng], {
      icon: beaconIcon,
      zIndexOffset: 1000
    }).addTo(this.map);

    const popupHtml = `
      <div class="found-node-popup">
        <div class="popup-header">
          <img src="/one-logo-white.svg" alt="O.N.E." class="popup-logo" />
          <div>
            <h4>${name}</h4>
            <span class="popup-bioregion">[${lat.toFixed(3)}°, ${lng.toFixed(3)}°]</span>
          </div>
        </div>
        <p>${t('foundNodeDesc', 'Establish a new self-sufficient resilient haven here according to the local climate zone:')}</p>
        <div class="popup-climate-pill" style="--climate-color: ${climate.accentColor || '#10b981'};">
          <span>${climate.nameKey ? t(climate.nameKey, climate.name) : climate.name}</span> • <strong>${climate.dwellingTypeKey ? t(climate.dwellingTypeKey, climate.dwellingType) : climate.dwellingType}</strong>
        </div>
        <div class="found-form">
          <input type="text" id="input-node-name" class="input-node-name" placeholder="Name your Node" value="${name}" />
          <button id="btn-confirm-found" class="btn-primary" style="width: 100%; margin-top: 8px;">
            🌱 ${t('btnConfirmFound', 'Plant O.N.E. Beacon')}
          </button>
        </div>
      </div>
    `;

    this.activePlacedBeaconMarker.bindPopup(popupHtml, {
      className: 'one-custom-leaflet-popup',
      maxWidth: 340
    });

    if (openPopup) {
      this.activePlacedBeaconMarker.openPopup();
    }

    this.activePlacedBeaconMarker.on('popupopen', () => {
      const confirmBtn = document.getElementById('btn-confirm-found');
      const nameInput = document.getElementById('input-node-name');
      if (confirmBtn && nameInput) {
        confirmBtn.onclick = () => {
          const finalName = nameInput.value.trim() || name;
          const newNode = createCustomGlobalNode({ name: finalName, lat, lng });
          this.nodes.push(newNode);
          this.renderAllNodes();
          this.renderMeshLinks();
          this.map.closePopup();
          this.onFoundNode({
            ...newNode,
            name: finalName,
            majorCities
          });
        };
      }
    });
  }

  async resolveLocation(lat, lng, openPopup = false) {
    const climate = getClimateZoneFromLat(lat);
    const center = this.map ? this.map.getCenter() : null;
    const isNearby = center && calculateDistanceKm(lat, lng, center.lat, center.lng) < 60;
    const bounds = (isNearby && this.map && this.map.getZoom() >= 6.0) ? this.map.getBounds() : estimateViewportBounds(lat, lng, 7.0);

    const [geocoded, majorCities] = await Promise.all([
      fetchNearestTownName(lat, lng),
      Promise.resolve(getRegionalMajorCities(lat, lng, bounds, 5))
    ]);

    const nodeName = geocoded.nodeName;
    this.renderRegionalCities(majorCities);
    this.updatePlacementBeacon(lat, lng, nodeName, climate, majorCities, openPopup);

    if (typeof this.onRegionCitiesChanged === 'function') {
      this.onRegionCitiesChanged(majorCities);
    }

    return {
      nodeName,
      rawTown: geocoded.rawTown,
      majorCities,
      climate,
      lat,
      lng
    };
  }

  bindMapEvents() {
    // Click anywhere on map to plant or reposition beacon
    this.map.on('click', async e => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      const climate = getClimateZoneFromLat(lat);

      // 1. Immediately place marker with loading feedback
      this.updatePlacementBeacon(lat, lng, 'Locating town...', climate, [], false);

      // 2. Fetch nearest town name & 3-5 regional cities asynchronously
      const res = await this.resolveLocation(lat, lng, true);

      // 3. Trigger callback so UI updates instantly
      this.onFoundNode({
        id: `node-placed-${Date.now().toString(36)}`,
        name: res.nodeName,
        rawTown: res.rawTown,
        lat,
        lng,
        climate,
        majorCities: res.majorCities
      });
    });
  }

  /**
   * Geolocation: Centers map smoothly on user's real-world coordinates,
   * searches web for nearest town name and appends "-ONE",
   * and renders 3-5 largest regional cities in the region.
   */
  locateUser(onSuccess = () => {}, onError = () => {}) {
    const handleResolvedPosition = async (lat, lng, isFallback = false, originalErr = null) => {
      const climate = getClimateZoneFromLat(lat);
      this.updatePlacementBeacon(lat, lng, 'Locating town...', climate, [], false);

      // 1. Pre-calculate target cities immediately with estimated bounds so they appear on screen without lag
      const targetBounds = estimateViewportBounds(lat, lng, 7.0);
      const [geocoded, targetCities] = await Promise.all([
        fetchNearestTownName(lat, lng),
        Promise.resolve(getRegionalMajorCities(lat, lng, targetBounds, 5))
      ]);

      const nodeName = geocoded.nodeName;
      this.renderRegionalCities(targetCities);
      this.updatePlacementBeacon(lat, lng, nodeName, climate, targetCities, false);

      // 2. Smoothly fly to target position
      this.map.flyTo([lat, lng], 7.0, { duration: 1.5 });

      // 3. When flight finishes, refresh with exact pixel viewport bounds
      this.map.once('moveend', () => {
        this.refreshShownRegionCities();
      });

      // Find nearest existing starter node for distance comparison
      let nearestNode = null;
      let minDistanceKm = Infinity;
      for (const node of this.nodes) {
        const d = calculateDistanceKm(lat, lng, node.lat, node.lng);
        if (d < minDistanceKm) {
          minDistanceKm = d;
          nearestNode = node;
        }
      }

      const payload = {
        lat,
        lng,
        climate,
        nodeName,
        rawTown: geocoded.rawTown,
        majorCities: targetCities,
        nearestNode,
        distanceKm: Math.round(minDistanceKm),
        isFallback,
        originalErr
      };

      if (!isFallback) {
        onSuccess(payload);
      } else {
        onError(payload);
      }
    };

    if (!navigator.geolocation) {
      console.warn('Geolocation not supported, using current view center');
      const center = this.map ? this.map.getCenter() : { lat: 45.138, lng: 7.054 };
      handleResolvedPosition(center.lat, center.lng, true, new Error('Geolocation unsupported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        handleResolvedPosition(pos.coords.latitude, pos.coords.longitude, false);
      },
      err => {
        console.warn('Geolocation failed or denied:', err.message);
        const center = this.map ? this.map.getCenter() : { lat: 45.138, lng: 7.054 };
        handleResolvedPosition(center.lat || 45.138, center.lng || 7.054, true, err);
      },
      { timeout: 7000, enableHighAccuracy: false }
    );
  }

  calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  flyToNode(nodeId) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node && this.map) {
      this.map.flyTo([node.lat, node.lng], 7.0, { duration: 2.0 });
    }
  }

  updateSolarTerminator(hour = 12, day = 80) {
    this.lastHour = hour;
    this.lastDay = day;
    if (!this.map || !this.terminatorLayer) return;

    const coords = getNightPolygonCoordinates(hour, day);
    this.terminatorLayer.setLatLngs(coords);

    // Update node marker night lights
    for (const [nodeId, item] of this.nodeMarkers.entries()) {
      const inNight = isPointInNight(item.node.lat, item.node.lng, hour, day);
      const el = item.marker.getElement();
      if (el) {
        if (inNight) {
          el.classList.add('is-night');
        } else {
          el.classList.remove('is-night');
        }
      }
    }
  }

  resize() {
    if (this.map) {
      this.map.invalidateSize();
    }
  }
}
