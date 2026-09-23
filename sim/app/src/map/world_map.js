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
import { t } from '../i18n/index.js';
import { getNightPolygonCoordinates, isPointInNight } from './solar_terminator.js';

export class WorldMapController {
  constructor(containerId, onSelectNodeCallback, onFoundNodeCallback, onDiscreteZoomGestureCallback = null) {
    this.containerId = containerId;
    this.onSelectNode = onSelectNodeCallback || (() => {});
    this.onFoundNode = onFoundNodeCallback || (() => {});
    this.onDiscreteZoomGesture = onDiscreteZoomGestureCallback;
    this.nodes = [...GLOBAL_STARTER_NODES];
    this.map = null;
    this.markersLayer = null;
    this.meshLinksLayer = null;
    this.userLocationMarker = null;
    this.terminatorLayer = null;
    this.nodeMarkers = new Map();
    this.lastHour = 12;
    this.lastDay = 80;

    this.initMap();
  }

  showWorld() {
    if (!this.map) return;
    this.map.invalidateSize();
    this.map.setView([20, 0], 2.5, { animate: false });
  }

  showRegion(node) {
    if (!this.map || !node) return;
    this.map.flyTo([node.lat, node.lng], 9, { duration: 0.8 });

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
    }, 450);
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

    // Center on Atlantic/Equator view initially
    this.map = L.map(this.containerId, {
      center: [20, 0],
      zoom: 2.5,
      minZoom: 2,
      maxZoom: 17,
      zoomControl: false,
      attributionControl: false,
      maxBounds: [[-84, -180], [84, 180]],
      maxBoundsViscosity: 0.8
    });

    // Zoom control at top-right
    L.control.zoom({ position: 'topright' }).addTo(this.map);

    // High-Resolution Photorealistic Satellite Earth (ESRI World Imagery - Free, No Watermark, No API Key)
    this.satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        attribution: 'ESRI World Imagery'
      }
    );

    // High-Contrast Physical / Topographic Map (ESRI World Physical Map - Free, No Watermark)
    this.physicalLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 10,
        attribution: 'ESRI Physical'
      }
    );

    // Subtle geopolitical boundary and place labels overlay
    this.referenceLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        opacity: 0.6
      }
    );

    // Add satellite layer by default
    this.satelliteLayer.addTo(this.map);
    this.referenceLayer.addTo(this.map);
    this.currentMapStyle = 'satellite';

    // Dedicated pane for solar terminator night shadow between satellite tiles and markers
    this.map.createPane('terminatorPane');
    const termPane = this.map.getPane('terminatorPane');
    if (termPane) {
      termPane.style.zIndex = '350';
      termPane.style.pointerEvents = 'none';
    }

    this.terminatorLayer = L.polygon(getNightPolygonCoordinates(12, 80), {
      pane: 'terminatorPane',
      fillColor: '#020617',
      fillOpacity: 0.58,
      color: '#38bdf8',
      weight: 1.5,
      opacity: 0.45,
      interactive: false
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);
    this.meshLinksLayer = L.layerGroup().addTo(this.map);
    this.convoysLayer = L.layerGroup().addTo(this.map);

    this.renderAllNodes();
    this.renderMeshLinks();
    this.bindMapEvents();
  }

  toggleMapStyle() {
    if (this.currentMapStyle === 'satellite') {
      this.map.removeLayer(this.satelliteLayer);
      this.physicalLayer.addTo(this.map);
      this.referenceLayer.bringToFront();
      this.currentMapStyle = 'physical';
    } else {
      this.map.removeLayer(this.physicalLayer);
      this.satelliteLayer.addTo(this.map);
      this.referenceLayer.bringToFront();
      this.currentMapStyle = 'satellite';
    }
    return this.currentMapStyle;
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
            <span>${climate.name}</span> • <strong>${climate.dwellingType}</strong>
          </div>

          <p class="popup-quote">"${node.quote}"</p>

          <div class="popup-stats-grid">
            <div><strong>${t('populationLabel', 'Population:')}</strong> ${node.population} pax</div>
            <div><strong>${t('civicReserveLabel', 'Civic Reserve:')}</strong> <span class="text-green">${node.freeHousingBuffer} Free Pods</span></div>
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

  updateTradeConvoys(convoys, tradeEngine) {
    if (!this.convoysLayer) return;
    this.convoysLayer.clearLayers();
    if (!convoys || convoys.length === 0 || !tradeEngine) return;

    for (const convoy of convoys) {
      const pos = tradeEngine.getConvoyGeoPosition(convoy);
      if (!pos) continue;

      const origin = tradeEngine.getNodeById(convoy.originNodeId);
      const dest = tradeEngine.getNodeById(convoy.destNodeId);
      if (!origin || !dest) continue;

      // Draw highlighted animated active convoy route
      const routeLine = L.polyline([[origin.lat, origin.lng], [dest.lat, dest.lng]], {
        color: '#f59e0b',
        weight: 3.5,
        opacity: 0.85,
        dashArray: '6, 12',
        className: 'convoy-route-animated'
      });
      this.convoysLayer.addLayer(routeLine);

      // Custom animated convoy vehicle icon
      const customIcon = L.divIcon({
        className: 'convoy-leaflet-marker',
        html: `
          <div class="convoy-marker-wrapper">
            <div class="convoy-pulse-ring"></div>
            <div class="convoy-vehicle-badge">${convoy.vehicleIcon}</div>
            <div class="convoy-tag">${convoy.outgoingCommodity} (${Math.round((convoy.progressTicks / convoy.totalTicks) * 100)}%)</div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker([pos.lat, pos.lng], { icon: customIcon });

      const remainingHours = Math.max(1, convoy.totalTicks - convoy.progressTicks);
      const popupHtml = `
        <div class="convoy-map-popup">
          <div class="convoy-popup-header">
            <span class="convoy-vehicle-large">${convoy.vehicleIcon}</span>
            <div>
              <h4>${convoy.vehicleName}</h4>
              <span class="convoy-route-badge">${convoy.originName} ➔ ${convoy.destName}</span>
            </div>
          </div>
          <div class="convoy-popup-body">
            <div><strong>Status:</strong> ${convoy.status === 'OUTBOUND' ? 'Outbound to Destination' : 'Returning with Barter Cargo'}</div>
            <div><strong>Cargo:</strong> ${convoy.outgoingAmount.toLocaleString()} ${convoy.outgoingUnit} ${convoy.outgoingIcon}</div>
            ${convoy.returnCargo ? `<div><strong>Reciprocal Load:</strong> ${convoy.returnCargo.amount.toLocaleString()} ${convoy.returnCargo.unit} ${convoy.returnCargo.icon}</div>` : ''}
            <div><strong>ETA:</strong> ${remainingHours} hour(s)</div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'one-custom-leaflet-popup',
        maxWidth: 280
      });

      this.convoysLayer.addLayer(marker);
    }
  }

  bindMapEvents() {
    // Click on unpopulated area to suggest founding a node!
    this.map.on('click', e => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      const climate = getClimateZoneFromLat(lat);

      const foundPopup = L.popup({
        className: 'one-custom-leaflet-popup',
        maxWidth: 320
      })
      .setLatLng(e.latlng)
      .setContent(`
        <div class="found-node-popup">
          <div class="popup-header">
            <img src="/one-logo-white.svg" alt="O.N.E." class="popup-logo" />
            <div>
              <h4>${t('foundNodeTitle', 'Found New O.N.E. Node')}</h4>
              <span class="popup-bioregion">[${lat.toFixed(3)}, ${lng.toFixed(3)}]</span>
            </div>
          </div>
          <p>${t('foundNodeDesc', 'Establish a new self-sufficient resilient haven here according to the local climate zone:')}</p>
          <div class="popup-climate-pill" style="--climate-color: ${climate.accentColor};">
            <span>${climate.name}</span> • <strong>${climate.dwellingType}</strong>
          </div>
          <div class="found-form">
            <input type="text" id="input-node-name" class="input-node-name" placeholder="Name your Node (e.g. Free Haven)" value="O.N.E. Haven ${Math.floor(Math.random() * 90 + 10)}" />
            <button id="btn-confirm-found" class="btn-primary" style="width: 100%; margin-top: 8px;">
              🌱 ${t('btnConfirmFound', 'Plant O.N.E. Beacon')}
            </button>
          </div>
        </div>
      `)
      .openOn(this.map);

      setTimeout(() => {
        const confirmBtn = document.getElementById('btn-confirm-found');
        const nameInput = document.getElementById('input-node-name');
        if (confirmBtn && nameInput) {
          confirmBtn.addEventListener('click', () => {
            const name = nameInput.value.trim() || `Node ${lat.toFixed(1)}_${lng.toFixed(1)}`;
            const newNode = createCustomGlobalNode({ name, lat, lng });
            this.nodes.push(newNode);
            this.renderAllNodes();
            this.renderMeshLinks();
            this.map.closePopup();
            this.onFoundNode(newNode);
          });
        }
      }, 50);
    });
  }

  /**
   * Geolocation: Centers map smoothly on user's real-world coordinates
   */
  locateUser(onSuccess = () => {}, onError = () => {}) {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      onError();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const climate = getClimateZoneFromLat(lat);

        // Fly smoothly to location
        this.map.flyTo([lat, lng], 8, { duration: 2.2 });

        // Add or update user location marker
        if (this.userLocationMarker) {
          this.map.removeLayer(this.userLocationMarker);
        }

        const userIcon = L.divIcon({
          className: 'user-location-marker',
          html: `
            <div class="user-pulse-dot"></div>
            <div class="user-label-pill">📍 You are here</div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        this.userLocationMarker = L.marker([lat, lng], { icon: userIcon }).addTo(this.map);

        // Find nearest existing node
        let nearestNode = null;
        let minDistanceKm = Infinity;
        for (const node of this.nodes) {
          const d = this.calculateDistanceKm(lat, lng, node.lat, node.lng);
          if (d < minDistanceKm) {
            minDistanceKm = d;
            nearestNode = node;
          }
        }

        onSuccess({
          lat,
          lng,
          climate,
          nearestNode,
          distanceKm: Math.round(minDistanceKm)
        });
      },
      err => {
        console.warn('Geolocation failed or denied:', err.message);
        // Default to temperate region center (e.g. Central Europe or Detroit)
        this.map.flyTo([42.3, -83.1], 5, { duration: 1.5 });
        onError(err);
      },
      { timeout: 10000, enableHighAccuracy: false }
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
      this.map.flyTo([node.lat, node.lng], 9, { duration: 2.0 });
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
