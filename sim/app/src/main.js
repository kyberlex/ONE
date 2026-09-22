/**
 * O-ASIS Dual-Track Web Simulator & Living MMO Entry Point
 * Planetary 2D Earth Map (Leaflet) + 60 FPS Bioclimatic Settlement Village Engine.
 * Fully internationalized for 14 languages.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { SimulationManager } from './engine/simulation.js';
import { WorldMapController } from './map/world_map.js';
import { SettlementRenderer } from './settlement/settlement_renderer.js';
import { HudController } from './ui/hud.js';
import { PanelNodeController } from './ui/panel_node.js';
import { PanelDilemmaController } from './ui/panel_dilemma.js';
import { PanelDualTrackController } from './ui/panel_dualtrack.js';
import { PanelDwellingController } from './ui/panel_dwelling.js';
import { PlayerProfileManager } from './engine/player_profile.js';
import { ZoomCoordinator, ZOOM_LEVELS } from './engine/zoom_coordinator.js';
import { Prop3DViewer } from './settlement/prop_3d_viewer.js';
import { GLOBAL_STARTER_NODES, CLIMATE_ZONES } from './data/bioregions.js';
import { i18n, t } from './i18n/index.js';

window.addEventListener('DOMContentLoaded', () => {
  console.log('🌍 [O-ASIS Dual-Track] Initializing planetary living engine & bioclimatic settlements...');

  // 1. Initialize Simulation Engine
  const sim = new SimulationManager();

  // Active Node state
  let activeNode = { ...GLOBAL_STARTER_NODES[0] };
  let currentView = 'world'; // 'world' | 'settlement'

  // 2. Initialize UI Panels
  const panelNode = new PanelNodeController(sim);
  const panelDilemma = new PanelDilemmaController(sim);
  const panelDualTrack = new PanelDualTrackController(sim);
  const prop3dViewer = new Prop3DViewer();

  let activePanel = null;

  // 3. Initialize Dwelling Usufruct Modal
  const panelDwelling = new PanelDwellingController(
    sim,
    claimedDwelling => {
      settlementRenderer.claimDwelling(claimedDwelling.id);
      hud.showNotification({
        title: '🔑 ' + t('yourHomeBadge', 'Your Primary Usufruct Home'),
        message: `Dwelling #${claimedDwelling.number} claimed in ${activeNode.name}. Usufruct guaranteed at zero cost!`
      });
      updateHomeUi();
      sim.saveToLocalStorage();
    },
    releasedDwelling => {
      settlementRenderer.releaseDwelling(releasedDwelling.id);
      hud.showNotification({
        title: '🔄 ' + t('btnReleaseToPool', 'Release to Civic Pool'),
        message: `Dwelling #${releasedDwelling.number} returned to community housing reserve pool.`
      });
      updateHomeUi();
      sim.saveToLocalStorage();
    },
    dwelling => {
      zoomCoordinator.setLevel(ZOOM_LEVELS.BUILDING, dwelling);
    },
    dwelling => {
      settlementRenderer.knockOnDwelling(dwelling);
    }
  );

  // 4. Initialize HUD
  const hud = new HudController(sim, panelType => {
    activePanel = panelType;
    if (panelType === 'chores') panelNode.open('chores');
    else if (panelType === 'housing') panelNode.open('housing');
    else if (panelType === 'agriculture') panelNode.open('agriculture');
    else if (panelType === 'machinery') panelNode.open('machinery');
    else if (panelType === 'tech') panelDualTrack.open();
    else if (panelType === 'council') {
      if (sim.sortition.activeDilemma) {
        panelDilemma.openDilemma(sim.sortition.activeDilemma);
      } else {
        hud.showNotification({
          title: t('navCouncil', '🏛️ Sortition Council'),
          message: t('councilInRecess', 'Assembly is in recess. Deliberation begins when a community dilemma emerges.')
        });
      }
    }
  });

  // Re-render open modals on language change
  i18n.onLanguageChange(() => {
    if (activePanel === 'chores' || activePanel === 'housing' || activePanel === 'agriculture' || activePanel === 'machinery') {
      panelNode.render(activePanel);
    } else if (activePanel === 'tech') {
      panelDualTrack.render();
    }
    panelDilemma.render();
    updateSettlementMetaHeader();
  });


  // 5. Initialize Bioclimatic Settlement Canvas (60 FPS)
  const settlementCanvas = document.getElementById('settlement-canvas');
  const settlementRenderer = new SettlementRenderer(settlementCanvas, {
    sim,
    node: activeNode,
    climate: CLIMATE_ZONES[activeNode.climateKey] || CLIMATE_ZONES.TEMPERATE,
    onSelectDwelling: dwelling => {
      panelDwelling.open(dwelling, activeNode);
    },
    onSelectBuilding: building => {
      zoomCoordinator.setLevel(ZOOM_LEVELS.BUILDING, building);
      hud.showNotification({
        title: building.name,
        message: `Entered interior view. Click fixtures to inspect in 3D. Press [ESC] or [-] to zoom out.`
      });
    },
    onSelectInteriorProp: prop => {
      // Direct 3D model inspection for furniture, tools, and fixtures
      prop3dViewer.open(prop);
    },
    onDiscreteZoomGesture: (delta, targetEntity) => {
      return zoomCoordinator.handleGestureDelta(delta, targetEntity);
    },
    onInteriorStateChange: (isInside, entity) => {
      if (isInside) {
        zoomCoordinator.setLevel(ZOOM_LEVELS.BUILDING, entity);
      } else {
        zoomCoordinator.setLevel(ZOOM_LEVELS.NODE);
      }
    },
    onSelectCitizen: citizen => {
      if (citizen.isPlayer) {
        const homeDwelling = settlementRenderer.dwellings.find(d => d.isPlayerHome);
        if (homeDwelling) {
          panelDwelling.open(homeDwelling, activeNode);
        } else {
          activePanel = 'chores';
          panelNode.open('chores');
        }
        hud.showNotification({
          title: '👑 You (Player Pioneer)',
          message: `Active vocation: ${citizen.vocation.icon} ${citizen.vocation.defaultName}. Manage your duties in the Chores panel!`
        });
      } else if (citizen.isHuman) {
        hud.showNotification({
          title: `🌐 ${citizen.name} (Online Peer)`,
          message: `Real human participant connected via OpenMesh telemetry. Role: ${citizen.vocation.defaultName}.`
        });
      } else {
        hud.showNotification({
          title: `🤖 ${citizen.name} (Autonomous Resident)`,
          message: `Simulated community member assigned to ${citizen.vocation.defaultName}.`
        });
      }
    }
  });

  // 6. Initialize 2D Earth Cartography (Leaflet Dark Matter)
  const worldMap = new WorldMapController(
    'world-leaflet-map',
    selectedNode => {
      // Enter village on clicking "Visit & Enter Village"
      enterVillage(selectedNode);
    },
    foundedNode => {
      // Founded custom node
      hud.showNotification({
        title: '🌱 ' + t('foundNodeTitle', 'Found New O.N.E. Node'),
        message: `${foundedNode.name} established in ${foundedNode.bioregion}! Pioneers assembling.`
      });
      enterVillage(foundedNode);
    },
    delta => {
      return zoomCoordinator.handleGestureDelta(delta);
    }
  );

  // 7. Initialize 4-Level Discrete Zoom Orchestrator (WORLD ↔ REGION ↔ NODE ↔ BUILDING)
  const zoomCoordinator = new ZoomCoordinator({
    initialLevel: ZOOM_LEVELS.NODE,
    getActiveNode: () => activeNode,
    onLevelChange: (level, previousLevel, targetEntity) => {
      const worldPanel = document.getElementById('world-map-view');
      const settlementPanel = document.getElementById('settlement-view');

      if (level === ZOOM_LEVELS.WORLD) {
        currentView = 'world';
        worldPanel.classList.remove('hidden');
        worldPanel.classList.add('active');
        settlementPanel.classList.remove('active');
        settlementPanel.classList.add('hidden');

        if (settlementRenderer.activeInterior) {
          settlementRenderer.exitInterior();
        }
        settlementRenderer.stop();
        worldMap.showWorld();
        setTimeout(() => worldMap.resize(), 50);
      } else if (level === ZOOM_LEVELS.REGION) {
        currentView = 'world';
        worldPanel.classList.remove('hidden');
        worldPanel.classList.add('active');
        settlementPanel.classList.remove('active');
        settlementPanel.classList.add('hidden');

        if (settlementRenderer.activeInterior) {
          settlementRenderer.exitInterior();
        }
        settlementRenderer.stop();
        worldMap.showRegion(activeNode);
        setTimeout(() => worldMap.resize(), 50);
      } else if (level === ZOOM_LEVELS.NODE) {
        currentView = 'settlement';
        settlementPanel.classList.remove('hidden');
        settlementPanel.classList.add('active');
        worldPanel.classList.remove('active');
        worldPanel.classList.add('hidden');

        if (settlementRenderer.activeInterior) {
          settlementRenderer.exitInterior();
        } else {
          const hudBar = document.getElementById('hud-interior-bar');
          if (hudBar) hudBar.classList.add('hidden');
          const settlementHeader = document.getElementById('settlement-header-bar');
          if (settlementHeader) settlementHeader.classList.remove('hidden');
        }
        settlementRenderer.start();
        settlementRenderer.resize();
      } else if (level === ZOOM_LEVELS.BUILDING) {
        currentView = 'settlement';
        settlementPanel.classList.remove('hidden');
        settlementPanel.classList.add('active');
        worldPanel.classList.remove('active');
        worldPanel.classList.add('hidden');

        settlementRenderer.start();
        settlementRenderer.resize();

        if (!settlementRenderer.activeInterior) {
          let entityToEnter = targetEntity;
          if (!entityToEnter) {
            const playerHome = settlementRenderer.dwellings.find(d => d.isPlayerHome);
            if (playerHome) {
              entityToEnter = playerHome;
            } else {
              entityToEnter = settlementRenderer.infrastructures.find(inf => inf.type === 'WORKSHOP') || settlementRenderer.agora;
            }
          }
          settlementRenderer.enterInterior(entityToEnter);
        }
      }
    }
  });

  // Start with NODE level on settlement view
  zoomCoordinator.setLevel(ZOOM_LEVELS.NODE);

  function updateSettlementMetaHeader() {
    const nameEl = document.getElementById('settlement-node-name');
    const tagEl = document.getElementById('settlement-climate-tag');
    const climate = CLIMATE_ZONES[activeNode.climateKey] || CLIMATE_ZONES.TEMPERATE;

    if (nameEl) nameEl.textContent = activeNode.name;
    if (tagEl) tagEl.textContent = `${climate.name} • ${climate.dwellingType}`;
  }

  function updateHomeUi() {
    const profile = PlayerProfileManager.getProfile();
    const btnHome = document.getElementById('btn-my-home');
    const homePillText = document.getElementById('home-pill-text');
    const btnQuickClaim = document.getElementById('btn-quick-claim');

    if (profile) {
      if (btnHome) {
        btnHome.classList.remove('hidden');
        if (homePillText) {
          const shortName = profile.nodeName.split(' ')[0];
          homePillText.textContent = `${shortName} (#${profile.dwellingNumber})`;
        }
      }

      if (btnQuickClaim && activeNode) {
        if (profile.nodeId === activeNode.id || profile.nodeName === activeNode.name) {
          btnQuickClaim.innerHTML = `👑 <span>${t('yourHomeBadge', 'Your Primary Home')} (#${profile.dwellingNumber})</span>`;
          btnQuickClaim.classList.add('active-home');
        } else {
          btnQuickClaim.innerHTML = `🔑 <span>${t('btnClaimUsufruct', 'Claim Usufruct Dwelling')}</span>`;
          btnQuickClaim.classList.remove('active-home');
        }
      }
    } else {
      if (btnHome) btnHome.classList.add('hidden');
      if (btnQuickClaim) {
        btnQuickClaim.innerHTML = `🔑 <span>${t('btnClaimUsufruct', 'Claim Usufruct Dwelling')}</span>`;
        btnQuickClaim.classList.remove('active-home');
      }
    }
  }

  function enterVillage(node) {
    activeNode = node;
    sim.node.name = node.name;
    sim.node.population = node.population;
    settlementRenderer.setNode(node);
    updateSettlementMetaHeader();
    updateHomeUi();
    zoomCoordinator.setLevel(ZOOM_LEVELS.NODE, null, true);

    hud.showNotification({
      title: `🏘️ ${node.name}`,
      message: `${node.bioregion} (${node.country}). Architectural style: ${CLIMATE_ZONES[node.climateKey]?.dwellingType || 'Bioclimatic'}.`
    });
  }

  // Bind Top View Switcher Buttons
  const btnViewWorld = document.getElementById('btn-view-world');
  const btnViewVillage = document.getElementById('btn-view-village');
  if (btnViewWorld) btnViewWorld.addEventListener('click', () => zoomCoordinator.setLevel(ZOOM_LEVELS.WORLD));
  if (btnViewVillage) btnViewVillage.addEventListener('click', () => zoomCoordinator.setLevel(ZOOM_LEVELS.NODE));

  // Bind My Home Shortcut Button
  const btnMyHome = document.getElementById('btn-my-home');
  if (btnMyHome) {
    btnMyHome.addEventListener('click', () => {
      const profile = PlayerProfileManager.getProfile();
      if (!profile) return;

      const targetNode = GLOBAL_STARTER_NODES.find(n => n.id === profile.nodeId || n.name === profile.nodeName) || GLOBAL_STARTER_NODES[0];
      enterVillage(targetNode);

      setTimeout(() => {
        const homeDwelling = settlementRenderer.dwellings.find(d => d.isPlayerHome);
        if (homeDwelling) {
          zoomCoordinator.setLevel(ZOOM_LEVELS.BUILDING, homeDwelling);
        }
      }, 300);
    });
  }

  // Bind Settlement Back Button
  const btnBackToWorld = document.getElementById('btn-back-to-world');
  if (btnBackToWorld) btnBackToWorld.addEventListener('click', () => zoomCoordinator.setLevel(ZOOM_LEVELS.WORLD));

  // Bind Quick Claim Usufruct Button in Settlement Header
  const btnQuickClaim = document.getElementById('btn-quick-claim');
  if (btnQuickClaim) {
    btnQuickClaim.addEventListener('click', () => {
      const myHome = settlementRenderer.dwellings.find(d => d.isPlayerHome);
      if (myHome) {
        panelDwelling.open(myHome, activeNode);
        return;
      }
      const vacantDwelling = settlementRenderer.dwellings.find(d => !d.isOccupied);
      if (vacantDwelling) {
        panelDwelling.open(vacantDwelling, activeNode);
      } else {
        hud.showNotification({
          title: '🏘️ Civic Housing Buffer Full',
          message: 'All dwellings in this node are currently occupied. Expand capacity or join another federated node!'
        });
      }
    });
  }

  // Bind Interior Prop Tooltip Click to Open 3D Inspector
  const interiorPropTooltip = document.getElementById('interior-prop-tooltip');
  if (interiorPropTooltip) {
    interiorPropTooltip.addEventListener('click', () => {
      if (settlementRenderer.hoveredInteriorProp) {
        prop3dViewer.open(settlementRenderer.hoveredInteriorProp);
      }
    });
  }

  // Bind Map Style Toggle Button (Satellite / Topo)
  const btnToggleStyle = document.getElementById('btn-toggle-map-style');
  const mapStyleLabel = document.getElementById('map-style-label');
  const mapStyleIcon = document.getElementById('map-style-icon');
  if (btnToggleStyle) {
    btnToggleStyle.addEventListener('click', () => {
      const newStyle = worldMap.toggleMapStyle();
      if (newStyle === 'satellite') {
        if (mapStyleIcon) mapStyleIcon.textContent = '🛰️';
        if (mapStyleLabel) mapStyleLabel.textContent = t('mapSatellite', 'Satellite Earth');
      } else {
        if (mapStyleIcon) mapStyleIcon.textContent = '⛰️';
        if (mapStyleLabel) mapStyleLabel.textContent = t('mapPhysical', 'Physical Topo');
      }
    });
  }

  // Bind Geolocation Button
  const btnLocate = document.getElementById('btn-locate-bioregion');
  const locInfo = document.getElementById('user-location-info');

  if (btnLocate) {
    btnLocate.addEventListener('click', () => {
      btnLocate.textContent = '🛰️ Scanning Bioregion...';
      worldMap.locateUser(
        res => {
          btnLocate.innerHTML = `📍 <span>${t('btnLocateMe', 'Locate My Bioregion')}</span>`;
          if (locInfo) {
            locInfo.classList.remove('hidden');
            locInfo.innerHTML = `
              <div><strong>📍 Your Bioregion:</strong> ${res.climate.name}</div>
              <div><strong>Architectural Typology:</strong> ${res.climate.dwellingType}</div>
              <div><strong>Nearest Node:</strong> ${res.nearestNode.name} (~${res.distanceKm} km)</div>
              <button id="btn-quick-visit-nearest" class="btn-primary" style="margin-top: 6px; padding: 4px 8px; font-size: 11px; width: 100%;">
                🔭 ${t('btnVisitVillage', 'Visit Nearest Haven')}
              </button>
            `;

            const visitBtn = document.getElementById('btn-quick-visit-nearest');
            if (visitBtn) {
              visitBtn.addEventListener('click', () => {
                enterVillage(res.nearestNode);
              });
            }
          }

          hud.showNotification({
            title: '📍 Bioregion Located',
            message: `Identified ${res.climate.name}. Nearest resilient haven: ${res.nearestNode.name} (${res.distanceKm} km).`
          });
        },
        err => {
          btnLocate.innerHTML = `📍 <span>${t('btnLocateMe', 'Locate My Bioregion')}</span>`;
          hud.showNotification({
            title: '🛰️ Geolocation Notice',
            message: 'Centered on pioneer hub. You can click anywhere on Earth to found a node!'
          });
        }
      );
    });
  }

  // 7. Connect Simulation Events to UI
  sim.onTickListeners.push(state => {
    hud.update(state);
  });

  sim.onNotificationListeners.push(notif => {
    hud.showNotification(notif);
  });

  sim.onDilemmaListeners.push(dilemmaData => {
    panelDilemma.openDilemma(dilemmaData);
    hud.showNotification({
      title: '🏛️ Athenian Council Summoned',
      message: dilemmaData.dilemma.title
    });
  });

  sim.onCrisisListeners.push(crisis => {
    panelDilemma.openCrisis(crisis);
    hud.showNotification({
      title: '⚠️ SYSTEM ATTACK',
      message: `${crisis.name}: Legacy Adversary pressure mounting!`
    });
  });

  // 8. Keyboard Shortcuts
  window.addEventListener('keydown', e => {
    if (e.code === 'Space') {
      e.preventDefault();
      const newSpeed = sim.speedMultiplier === 0 ? 1 : 0;
      sim.setSpeed(newSpeed);
      hud.updateSpeedButtons(newSpeed);
    } else if (e.key === '1') {
      sim.setSpeed(1);
      hud.updateSpeedButtons(1);
    } else if (e.key === '2') {
      sim.setSpeed(2);
      hud.updateSpeedButtons(2);
    } else if (e.key === '5') {
      sim.setSpeed(5);
      hud.updateSpeedButtons(5);
    } else if (e.key === 'm' || e.key === 'M') {
      switchView(currentView === 'world' ? 'settlement' : 'world');
    }
  });

  // 9. Check Saved Player Home & Start Simulation
  const savedProfile = PlayerProfileManager.getProfile();
  if (savedProfile) {
    PlayerProfileManager.touchPresence();
    const savedNode = GLOBAL_STARTER_NODES.find(n => n.id === savedProfile.nodeId || n.name === savedProfile.nodeName);
    if (savedNode) {
      activeNode = savedNode;
      sim.node.name = savedNode.name;
      sim.node.population = savedNode.population;
      settlementRenderer.setNode(savedNode);
    }
    setTimeout(() => {
      hud.showNotification({
        title: '🏠 ' + t('welcomeBackHomeTitle', 'Welcome Back Home!'),
        message: `${t('welcomeBackHomeMsg', 'Your usufruct dwelling in')} ${savedProfile.nodeName} (#${savedProfile.dwellingNumber}) ${t('welcomeBackHomeSub', 'is secure. Sabbatical Lock: 30 days protected.')}`
      });
    }, 1200);
  }
  updateHomeUi();

  sim.start();
  hud.update(sim.getFullState());
  zoomCoordinator.setLevel(ZOOM_LEVELS.NODE, null, true); // Start at NODE village level

  // Expose app context for telemetry and inspection
  window.app = {
    sim,
    activeNode,
    settlementRenderer,
    worldMap,
    zoomCoordinator,
    prop3dViewer
  };

  console.log('✅ [O-ASIS Dual-Track] Planetary cartography & bioclimatic village engine running at 60 FPS.');
});
