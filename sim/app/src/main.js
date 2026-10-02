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
import { PanelCitizenController } from './ui/panel_citizen.js';
import { PanelPassportController } from './ui/panel_passport.js';
import { PanelConvoysController } from './ui/panel_convoys.js';
import { PanelChatController } from './ui/panel_chat.js';
import { PanelFeedbackController } from './ui/panel_feedback.js';
import { PanelHandbookController } from './ui/panel_handbook.js';
import { PanelInviteController } from './ui/panel_invite.js';
import { NavGroupManager } from './ui/nav_groups.js';
import { GuideTourController } from './ui/guide_tour.js';
import { StarterObjectivesController } from './ui/starter_objectives.js';
import { ChatEngine } from './engine/chat_engine.js';
import { storageIDB } from './engine/storage_idb.js';
import { CitizenPassportManager } from './engine/citizen_passport.js';
import { P2PMeshManager } from './engine/p2p_mesh.js';
import { PlayerProfileManager } from './engine/player_profile.js';
import { ZoomCoordinator, ZOOM_LEVELS } from './engine/zoom_coordinator.js';
import { Prop3DViewer } from './settlement/prop_3d_viewer.js';
import { GLOBAL_STARTER_NODES, CLIMATE_ZONES } from './data/bioregions.js';
import { i18n, t } from './i18n/index.js';

window.addEventListener('DOMContentLoaded', () => {
  console.log('🌍 [O-ASIS Dual-Track] Initializing planetary living engine & bioclimatic settlements...');

  // Check for URL invite / joinNode parameters (ITEM 18)
  const urlParams = new URLSearchParams(window.location.search);
  const joinNodeParam = urlParams.get('joinNode') || urlParams.get('node');
  const inviteRoomParam = urlParams.get('invite') || urlParams.get('room');

  // 1. Initialize Simulation Engine
  const sim = new SimulationManager();

  // Active Node state (match from URL invite if specified)
  let initialNode = { ...GLOBAL_STARTER_NODES[0] };
  if (joinNodeParam) {
    const matchedNode = GLOBAL_STARTER_NODES.find(n => 
      n.id.toLowerCase() === joinNodeParam.toLowerCase() || 
      n.name.toLowerCase().includes(joinNodeParam.toLowerCase())
    );
    if (matchedNode) {
      initialNode = { ...matchedNode };
      console.log(`🌐 [Main] Joining settlement from URL parameter: ${matchedNode.name}`);
    }
  }
  let activeNode = initialNode;
  sim.node.id = activeNode.id;
  sim.node.name = activeNode.name;
  sim.node.lng = activeNode.lng;
  sim.node.country = activeNode.country;
  sim.node.currencySymbol = activeNode.currencySymbol || '$';
  sim.node.currencyCode = activeNode.currencyCode || 'USD';
  sim.node.currencyName = activeNode.currencyName || 'US Dollar';
  if (sim.adversary) {
    sim.adversary.currencySymbol = sim.node.currencySymbol;
  }
  sim.timezoneOffset = typeof activeNode.lng === 'number' ? Math.round(activeNode.lng / 15) : -5;
  if (sim.trade) {
    sim.trade.playerNodeId = activeNode.id;
  }
  let currentView = 'world'; // 'world' | 'settlement'
  let panelPassport = null;
  let panelInvite = null;
  let panelHandbook = null;
  let chatEngine = null;
  let panelChat = null;
  let guideTour = null;
  let starterObjectives = null;

  // 1b. Initialize Serverless P2P WebRTC Mesh
  storageIDB.getActiveIdentity().then(id => { if (id) sim.myIdentity = id; });

  const p2pMesh = new P2PMeshManager(sim, delta => {
    // Process verified remote action delta
    if (delta.type === 'CHAT_MESSAGE') {
      if (chatEngine) {
        chatEngine.addMessage(delta.payload);
        if (panelChat) {
          panelChat.updateUnreadBadge();
          if (panelChat.isOpen) {
            panelChat.render();
            panelChat.scrollToBottom();
          }
        }
        if (settlementRenderer && delta.payload.authorName) {
          settlementRenderer.showCitizenSpeechBubble(delta.payload.authorName, delta.payload.text);
        }
      }
    } else if (delta.type === 'CLAIM_DWELLING') {
      settlementRenderer.claimDwelling(delta.payload.dwellingId, delta.payload.vocationId || 'farmer', delta.authorName, true);
      hud.showNotification({
        title: '🌐 ' + t('peerClaimedDwellingTitle', 'Dwelling Claimed'),
        message: t('peerClaimedDwellingDesc', '{author} claimed dwelling #{num}').replace('{author}', delta.authorName).replace('{num}', delta.payload.dwellingNumber)
      });
      updateHomeUi();
    } else if (delta.type === 'RELEASE_DWELLING') {
      settlementRenderer.releaseDwelling(delta.payload.dwellingId);
      hud.showNotification({
        title: '🌐 ' + t('peerReleasedDwellingTitle', 'Dwelling Released'),
        message: t('peerReleasedDwellingDesc', '{author} released dwelling #{num}').replace('{author}', delta.authorName).replace('{num}', delta.payload.dwellingNumber)
      });
      updateHomeUi();
    } else if (delta.type === 'CHORE_ALLOCATION') {
      if (sim.node.choreAssignments[delta.payload.chore] !== undefined) {
        sim.node.choreAssignments[delta.payload.chore] = delta.payload.hours;
        sim.node.updateLaborAndMorale();
        if (activePanel === 'chores') panelNode.render('chores');
        hud.showNotification({
          title: '🌐 ' + t('peerChoreUpdateTitle', 'Work Shifts'),
          message: t('peerChoreUpdateDesc', '{author}: {chore} set to {hours}h').replace('{author}', delta.authorName).replace('{chore}', delta.payload.chore).replace('{hours}', delta.payload.hours)
        });
      }
    } else if (delta.type === 'MACHINERY_REPAIR') {
      sim.thermo.repairMachinery(delta.payload.machineryKey);
      if (activePanel === 'machinery') panelNode.render('machinery');
      hud.showNotification({
        title: '🌐 ' + t('peerRepairedTitle', 'Infrastructure Repaired'),
        message: t('peerRepairedDesc', '{author} repaired {machine}').replace('{author}', delta.authorName).replace('{machine}', delta.payload.machineryKey)
      });
    } else if (delta.type === 'VOLUNTEER_CONTRIBUTION') {
      if (sim.civicProjects) {
        sim.civicProjects.contributeHours(delta.payload.projectId, delta.payload.hours, delta.authorName);
        if (activePanel === 'projects') panelNode.render('projects');
        hud.showNotification({
          title: '🌐 ' + t('peerDonatedTitle', 'Civic Project Contribution'),
          message: t('peerDonatedDesc', '{author} contributed {hours}h to {project}').replace('{author}', delta.authorName).replace('{hours}', delta.payload.hours).replace('{project}', delta.payload.projectId)
        });
      }
    } else if (delta.type === 'PROJECT_MATERIAL_ALLOCATION') {
      if (sim.civicProjects) {
        sim.civicProjects.allocateAllAvailableMaterials(delta.payload.projectId);
        if (activePanel === 'projects') panelNode.render('projects');
      }
    } else if (delta.type === 'CITIZEN_SOVEREIGN_DEPARTURE') {
      // Free any dwelling claimed by this departing citizen
      if (settlementRenderer && settlementRenderer.dwellings) {
        const dwellingToRelease = settlementRenderer.dwellings.find(d => 
          d.occupant && (d.occupant.id === delta.payload.id || d.occupant.name === delta.authorName)
        );
        if (dwellingToRelease) {
          settlementRenderer.releaseDwelling(dwellingToRelease.id);
        }
      }

      // Check if this device is paired with the same departing identity
      storageIDB.getActiveIdentity().then(async myIdentity => {
        if (myIdentity && (myIdentity.id === delta.payload.id || myIdentity.pubKeyHex === delta.authorPubKey)) {
          console.log('[Main] Sovereign departure detected from paired device: auto-purging...');
          PlayerProfileManager.releaseDwelling();
          await storageIDB.purgeCitizenIdentity(myIdentity.id);
          if (panelPassport) {
            panelPassport.activeIdentity = null;
            panelPassport.privateKeyJwk = null;
            panelPassport.updateHudBadge();
            panelPassport.onIdentityChanged(null);
            panelPassport.renderCreationWizard();
          }
          hud.showNotification({
            title: '🔥 ' + t('gameResetTitle', 'Game Reset'),
            message: t('gameResetDesc', 'Local data has been cleared. You can start fresh.')
          });
        } else {
          hud.showNotification({
            title: '🌐 ' + t('peerDepartedTitle', 'Citizen Departed'),
            message: t('peerDepartedDesc', '{author} left the node. Dwelling released.').replace('{author}', delta.authorName)
          });
        }
      });
    }
  });

  // 1c. Auto-join serverless signaling room if invited
  if (inviteRoomParam) {
    p2pMesh.joinSignalingRoom(inviteRoomParam);
  }

  // 2. Initialize UI Panels
  panelInvite = new PanelInviteController(sim, p2pMesh, {
    onPeerJoined: peerName => {
      hud.showNotification({
        title: '🤝 ' + t('peerConnectedTitle', 'Peer Connected'),
        message: t('peerConnectedDesc', '{name} established a direct P2P link with your settlement!').replace('{name}', peerName)
      });
      if (chatEngine) {
        chatEngine.addMessage({
          id: `arrive-${Date.now()}`,
          channel: 'VILLAGE',
          authorToken: 'system',
          authorName: 'Village Mesh',
          text: t('chatPeerArrivedViaInvite', '🎉 {name} arrived in the settlement via multiplayer invite link! Welcome to the commons!').replace('{name}', peerName),
          timestamp: Date.now(),
          isSystem: true
        });
        if (panelChat && panelChat.isOpen) panelChat.render();
      }
    }
  });

  const panelNode = new PanelNodeController(sim, async (actionType, payload) => {
    const identity = await storageIDB.getActiveIdentity();
    if (identity && identity.privateKeyJwk) {
      const delta = await CitizenPassportManager.createSignedDelta(
        actionType,
        payload,
        identity,
        identity.privateKeyJwk,
        sim.tickCount
      );
      await storageIDB.appendEvent(delta);
      p2pMesh.broadcastDelta(delta);
    }
  });

  const panelDilemma = new PanelDilemmaController(sim);
  const panelDualTrack = new PanelDualTrackController(sim);
  const panelFeedback = new PanelFeedbackController(sim);
  const prop3dViewer = new Prop3DViewer();
  const panelCitizen = new PanelCitizenController(sim, {
    onLocateDwelling: dwelling => {
      if (settlementRenderer) {
        settlementRenderer.camera.x = -dwelling.x;
        settlementRenderer.camera.y = -dwelling.y;
        settlementRenderer.camera.targetZoom = 1.6;
      }
    },
    onOpenChat: citizenName => {
      if (panelChat) {
        if (citizenName) {
          panelChat.openWhisperWith(citizenName);
        } else {
          panelChat.open();
        }
      }
    }
  });
  panelPassport = new PanelPassportController(sim, identity => {
    p2pMesh.setIdentity(identity);
    sim.myIdentity = identity;
    if (identity) {
      hud.showNotification({
        title: '🔑 ' + (identity.name || t('defaultPioneerName', 'Pioneer')),
        message: t('characterActiveReady', 'Character profile active. Ready to build resilience!')
      });

      // If new player hasn't completed onboarding tour, launch walkthrough
      if (guideTour && !guideTour.isCompleted()) {
        setTimeout(() => {
          if (guideTour && !guideTour.isCompleted() && (!panelPassport || !panelPassport.isOpen)) {
            guideTour.start(0);
          }
        }, 600);
      }
    } else {
      hud.showNotification({
        title: '🔥 ' + t('gameResetTitle', 'Data Cleared'),
        message: t('gameResetDwellingFree', 'Game cleared. Dwelling returned to civic housing pool.')
      });
      if (settlementRenderer) {
        const homeDwelling = settlementRenderer.dwellings.find(d => d.isPlayerHome);
        if (homeDwelling) {
          settlementRenderer.releaseDwelling(homeDwelling.id);
        }
      }
    }
    updateHomeUi();
  }, p2pMesh, {
    onOpenInviteModal: () => {
      if (panelInvite) panelInvite.open({ node: activeNode });
    }
  });

  let activePanel = null;

  // 3. Initialize Dwelling Usufruct Modal
  const panelDwelling = new PanelDwellingController(
    sim,
    claimedDwelling => {
      settlementRenderer.claimDwelling(claimedDwelling.id);
      hud.showNotification({
        title: '🔑 ' + t('yourHomeBadge', 'Your Dwelling'),
        message: t('claimedDwellingNotice', 'Claimed dwelling #{num}. It is freely yours under usufruct!').replace('{num}', claimedDwelling.number)
      });
      updateHomeUi();
      sim.saveToLocalStorage();

      // Log signed event delta in distributed DB & broadcast to P2P mesh
      storageIDB.getActiveIdentity().then(async identity => {
        if (identity && identity.privateKeyJwk) {
          const delta = await CitizenPassportManager.createSignedDelta(
            'CLAIM_DWELLING',
            { nodeId: activeNode.id, dwellingId: claimedDwelling.id, dwellingNumber: claimedDwelling.number },
            identity,
            identity.privateKeyJwk,
            sim.tickCount
          );
          await storageIDB.appendEvent(delta);
          p2pMesh.broadcastDelta(delta);
        }
      });
    },
    releasedDwelling => {
      settlementRenderer.releaseDwelling(releasedDwelling.id);
      hud.showNotification({
        title: '🔄 ' + t('btnReleaseToPool', 'Release to Civic Pool'),
        message: t('releasedDwellingNotice', 'Dwelling #{num} returned to community housing reserve pool.').replace('{num}', releasedDwelling.number)
      });
      updateHomeUi();
      sim.saveToLocalStorage();

      // Log signed event delta in distributed DB & broadcast to P2P mesh
      storageIDB.getActiveIdentity().then(async identity => {
        if (identity && identity.privateKeyJwk) {
          const delta = await CitizenPassportManager.createSignedDelta(
            'RELEASE_DWELLING',
            { nodeId: activeNode.id, dwellingId: releasedDwelling.id, dwellingNumber: releasedDwelling.number },
            identity,
            identity.privateKeyJwk,
            sim.tickCount
          );
          await storageIDB.appendEvent(delta);
          p2pMesh.broadcastDelta(delta);
        }
      });
    },
    dwelling => {
      zoomCoordinator.setLevel(ZOOM_LEVELS.BUILDING, dwelling);
    },
    dwelling => {
      settlementRenderer.knockOnDwelling(dwelling);
    }
  );

  // 3b. Initialize Inter-Node Trade Convoys Modal
  const panelConvoys = new PanelConvoysController(sim, convoy => {
    worldMap.updateTradeConvoys(sim.trade.convoys, sim.trade);
  });

  // 3c. Initialize Collapsible Nav Groups Manager
  const navGroupManager = new NavGroupManager(panelDilemma);

  // 4. Initialize HUD
  const hud = new HudController(sim, panelType => {
    activePanel = panelType;
    if (panelType === 'chores') {
      panelNode.open('chores');
      if (starterObjectives) starterObjectives.completeObjective('choose_vocation');
    }
    else if (panelType === 'housing') panelNode.open('housing');
    else if (panelType === 'agriculture') panelNode.open('agriculture');
    else if (panelType === 'machinery') {
      panelNode.open('machinery');
      if (starterObjectives) {
        starterObjectives.completeObjective('inspect_grid');
        starterObjectives.completeObjective('preventive_maintenance');
      }
    }
    else if (panelType === 'tech') {
      panelDualTrack.open();
      if (starterObjectives) starterObjectives.completeObjective('automate_fablab');
    }
    else if (panelType === 'convoys') {
      panelConvoys.open();
      if (starterObjectives) starterObjectives.completeObjective('explore_trade');
    }
    else if (panelType === 'council') {
      const councilBtn = document.getElementById('btn-open-council');
      if (councilBtn) councilBtn.classList.remove('has-alert');
      navGroupManager.updateAlertState(false);
      if (sim.sortition.activeDilemma) {
        panelDilemma.openDilemma(sim.sortition.activeDilemma);
      } else if (panelDilemma.activePeerReviewData) {
        panelDilemma.openPeerReview(panelDilemma.activePeerReviewData);
      } else {
        panelDilemma.openAssemblyCodex();
      }
    }
  });

  panelHandbook = new PanelHandbookController(sim, hud);

  // Re-render open modals on language change
  i18n.onLanguageChange(() => {
    if (activePanel === 'chores' || activePanel === 'housing' || activePanel === 'agriculture' || activePanel === 'machinery') {
      panelNode.render(activePanel);
    } else if (activePanel === 'tech') {
      panelDualTrack.render();
    } else if (activePanel === 'convoys') {
      panelConvoys.render();
    }
    panelDilemma.render();
    panelFeedback.render();
    if (panelHandbook && panelHandbook.isOpen()) {
      panelHandbook.render();
    }
    if (panelChat) {
      panelChat.render();
      if (typeof panelChat.updateLauncherText === 'function') panelChat.updateLauncherText();
    }
    if (panelDwelling && panelDwelling.isOpen && panelDwelling.currentDwelling) {
      panelDwelling.render();
    }
    if (panelPassport && panelPassport.isOpen) {
      panelPassport.render();
    }
    updateSettlementMetaHeader();
    updateHomeUi();
    if (hud) {
      hud.updateStaticTranslations();
      hud.update(sim.getFullState());
    }
    if (starterObjectives) {
      starterObjectives.render();
    }
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
      const bTitle = building.nameKey ? t(building.nameKey, building.name) : building.name;
      hud.showNotification({
        title: bTitle,
        message: t('interiorEnteredNotice', 'Entered interior view. Click fixtures to inspect in 3D. Press [ESC] or [-] to zoom out.')
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
      panelCitizen.open(citizen);
    },
    onSelectCivicProject: project => {
      panelNode.open('projects');
    }
  });

  // 5b. Initialize P2P Village Chat & Mesh Telegram Engine
  chatEngine = new ChatEngine(sim, msg => {
    if (panelChat) {
      panelChat.updateUnreadBadge();
      if (panelChat.isOpen) {
        panelChat.render();
        panelChat.scrollToBottom(false);
      }
    }
    if (settlementRenderer && msg.authorName) {
      settlementRenderer.showCitizenSpeechBubble(msg.authorName, msg.text);
    }
  });

  panelChat = new PanelChatController(sim, chatEngine, p2pMesh, sentMsg => {
    if (settlementRenderer) {
      settlementRenderer.showCitizenSpeechBubble(sentMsg.authorName || 'Player (You)', sentMsg.text);
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
  worldMap.updateSolarTerminator(sim.currentHour, sim.currentDay);

  // 7. Initialize 4-Level Discrete Zoom Orchestrator (WORLD ↔ REGION ↔ NODE ↔ BUILDING)
  let viewTransitionTimeout = null;

  function clearViewTransitions() {
    if (viewTransitionTimeout) {
      clearTimeout(viewTransitionTimeout);
      viewTransitionTimeout = null;
    }
    const worldPanel = document.getElementById('world-map-view');
    if (worldPanel) {
      worldPanel.classList.remove('transition-dive-out', 'transition-ascend-in');
    }
  }

  const zoomCoordinator = new ZoomCoordinator({
    initialLevel: ZOOM_LEVELS.NODE,
    getActiveNode: () => activeNode,
    onLevelChange: (level, previousLevel, targetEntity) => {
      const worldPanel = document.getElementById('world-map-view');
      const settlementPanel = document.getElementById('settlement-view');

      clearViewTransitions();

      const isComingFromMap = (previousLevel === ZOOM_LEVELS.WORLD || previousLevel === ZOOM_LEVELS.REGION);
      const isGoingToMap = (level === ZOOM_LEVELS.WORLD || level === ZOOM_LEVELS.REGION);

      if (isGoingToMap) {
        currentView = 'world';
        if (settlementRenderer.activeInterior) {
          settlementRenderer.exitInterior();
        }

        if (!isComingFromMap) {
          // Node -> Map transitions (Node -> Region or Node -> World chained)
          worldPanel.classList.remove('hidden');
          worldPanel.classList.add('active', 'transition-ascend-in');
          worldMap.resize();

          if (level === ZOOM_LEVELS.REGION) {
            // Node -> Region: Region map lands centered on the active node
            worldMap.showRegion(activeNode, false);
            worldMap.updateSolarTerminator(sim.currentHour, sim.currentDay);

            viewTransitionTimeout = setTimeout(() => {
              worldPanel.classList.remove('transition-ascend-in');
              settlementPanel.classList.remove('active');
              settlementPanel.classList.add('hidden');
              settlementRenderer.stop();
              worldMap.resize();
            }, 480);
          } else if (level === ZOOM_LEVELS.WORLD) {
            // Node -> World: Two-stage chain!
            // Stage 1: Ascend from Node up to Region
            worldMap.showRegion(activeNode, false);
            worldMap.updateSolarTerminator(sim.currentHour, sim.currentDay);

            viewTransitionTimeout = setTimeout(() => {
              worldPanel.classList.remove('transition-ascend-in');
              settlementPanel.classList.remove('active');
              settlementPanel.classList.add('hidden');
              settlementRenderer.stop();
              worldMap.resize();
              // Stage 2: Immediately continue zooming out from Region all the way to Earth!
              worldMap.showWorld(true);
            }, 440);
          }
        } else {
          // Map internal navigation: Region <-> World
          worldPanel.classList.remove('hidden');
          worldPanel.classList.add('active');
          settlementPanel.classList.remove('active');
          settlementPanel.classList.add('hidden');
          settlementRenderer.stop();
          setTimeout(() => {
            worldMap.resize();
            if (level === ZOOM_LEVELS.REGION) {
              worldMap.showRegion(activeNode, true);
            } else {
              worldMap.showWorld(true);
            }
            worldMap.updateSolarTerminator(sim.currentHour, sim.currentDay);
          }, 50);
        }
      } else if (level === ZOOM_LEVELS.NODE) {
        currentView = 'settlement';
        if (settlementRenderer.activeInterior) {
          settlementRenderer.exitInterior();
        } else {
          const hudBar = document.getElementById('hud-interior-bar');
          if (hudBar) hudBar.classList.add('hidden');
          const settlementHeader = document.getElementById('settlement-header-bar');
          if (settlementHeader) settlementHeader.classList.remove('hidden');
        }

        if (isComingFromMap) {
          if (previousLevel === ZOOM_LEVELS.WORLD) {
            // World -> Node: Two-stage chain!
            // Stage 1: Camera swoops from space down to the region
            worldMap.showRegion(activeNode, true);

            viewTransitionTimeout = setTimeout(() => {
              // Stage 2: Settlement awakens underneath, map dives in and dissolves!
              settlementPanel.classList.remove('hidden');
              settlementPanel.classList.add('active');
              settlementRenderer.start();
              settlementRenderer.resize();

              worldPanel.classList.add('transition-dive-out');

              viewTransitionTimeout = setTimeout(() => {
                worldPanel.classList.remove('active', 'transition-dive-out');
                worldPanel.classList.add('hidden');
                settlementRenderer.resize();
              }, 520);
            }, 850);
          } else {
            // Region -> Node: Direct dive into the village
            settlementPanel.classList.remove('hidden');
            settlementPanel.classList.add('active');
            settlementRenderer.start();
            settlementRenderer.resize();

            worldPanel.classList.remove('hidden');
            worldPanel.classList.add('active', 'transition-dive-out');

            viewTransitionTimeout = setTimeout(() => {
              worldPanel.classList.remove('active', 'transition-dive-out');
              worldPanel.classList.add('hidden');
              settlementRenderer.resize();
            }, 520);
          }
        } else {
          settlementPanel.classList.remove('hidden');
          settlementPanel.classList.add('active');
          settlementRenderer.start();
          settlementRenderer.resize();
          worldPanel.classList.remove('active');
          worldPanel.classList.add('hidden');
        }
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

  // Initialize Interactive Onboarding Guide (ITEM 17)
  guideTour = new GuideTourController(sim, zoomCoordinator, settlementRenderer, hud);

  // Initialize Interactive Starter Objectives (First Quest HUD)
  starterObjectives = new StarterObjectivesController(sim, {
    settlementRenderer,
    panelDwelling,
    panelNode,
    panelDualTrack,
    panelConvoys,
    worldMap,
    zoomCoordinator,
    hud
  });

  function updateSettlementMetaHeader() {
    const nameEl = document.getElementById('settlement-node-name');
    const tagEl = document.getElementById('settlement-climate-tag');
    const climate = CLIMATE_ZONES[activeNode.climateKey] || CLIMATE_ZONES.TEMPERATE;

    if (nameEl) nameEl.textContent = activeNode.name;
    if (tagEl) {
      const climName = climate.nameKey ? t(climate.nameKey, climate.name) : climate.name;
      const dwellType = climate.dwellingTypeKey ? t(climate.dwellingTypeKey, climate.dwellingType) : climate.dwellingType;
      tagEl.textContent = `${climName} • ${dwellType}`;
    }
  }

  function updateHomeUi() {
    const profile = PlayerProfileManager.getProfile();
    const btnHome = document.getElementById('btn-my-home');
    const homePillText = document.getElementById('home-pill-text');
    const btnQuickClaim = document.getElementById('btn-quick-claim');

    if (profile) {
      if (starterObjectives) {
        starterObjectives.completeObjective('claim_dwelling');
      }
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
    sim.node.id = node.id;
    sim.node.name = node.name;
    sim.node.lng = node.lng;
    sim.node.country = node.country;
    sim.node.currencySymbol = node.currencySymbol || '$';
    sim.node.currencyCode = node.currencyCode || 'USD';
    sim.node.currencyName = node.currencyName || 'US Dollar';
    if (sim.adversary) {
      sim.adversary.currencySymbol = sim.node.currencySymbol;
    }
    sim.timezoneOffset = typeof node.lng === 'number' ? Math.round(node.lng / 15) : -5;
    sim.node.population = node.population;
    if (sim.trade) {
      sim.trade.playerNodeId = node.id;
    }
    settlementRenderer.setNode(node);
    updateSettlementMetaHeader();
    updateHomeUi();
    zoomCoordinator.setLevel(ZOOM_LEVELS.NODE, null, true);

    const dwellTypology = CLIMATE_ZONES[node.climateKey]?.dwellingTypeKey
      ? t(CLIMATE_ZONES[node.climateKey].dwellingTypeKey, CLIMATE_ZONES[node.climateKey].dwellingType)
      : (CLIMATE_ZONES[node.climateKey]?.dwellingType || 'Bioclimatic');
    hud.showNotification({
      title: `🏘️ ${node.name}`,
      message: `${node.bioregion} (${node.country}). Architectural style: ${dwellTypology}.`
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
          title: '🏘️ ' + t('civicHousingBufferFull', 'Civic Housing Buffer Full'),
          message: t('civicHousingBufferFullDesc', 'All dwellings in this node are currently occupied. Expand capacity or join another federated node!')
        });
      }
    });
  }

  // Bind Floating Facilities Quick-Access Dock (All 8 Core Commons Infrastructures)
  const facilitiesDock = document.getElementById('hud-facilities-dock');
  if (facilitiesDock) {
    facilitiesDock.addEventListener('click', e => {
      const btn = e.target.closest('.facility-dock-btn');
      if (!btn) return;
      const infraId = btn.dataset.infraId;
      if (!infraId || !settlementRenderer) return;

      const building = settlementRenderer.focusOnBuilding(infraId);
      if (building) {
        facilitiesDock.querySelectorAll('.facility-dock-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const bTitle = building.nameKey ? t(building.nameKey, building.name) : building.name;
        const bDesc = building.descKey ? t(building.descKey, building.desc) : building.desc;

        let onClickAction = null;
        let actionPrompt = '';
        if (infraId === 'infra-solar') {
          actionPrompt = ' ➔ ' + t('inspectMachineryPrompt', 'Inspect Machinery');
          onClickAction = () => {
            panelNode.open('machinery');
            if (starterObjectives) starterObjectives.completeObjective('inspect_grid');
          };
        } else if (infraId === 'infra-fablab') {
          actionPrompt = ' ➔ ' + t('openFabLabPrompt', 'Open FabLab Studio');
          onClickAction = () => {
            panelDualTrack.open('techTree');
            if (starterObjectives) starterObjectives.completeObjective('automate_fablab');
          };
        } else if (infraId === 'infra-food') {
          actionPrompt = ' ➔ ' + t('openAgriPrompt', 'Open Agriculture');
          onClickAction = () => panelNode.open('agriculture');
        } else if (infraId === 'infra-mesh') {
          actionPrompt = ' ➔ ' + t('openChoresPrompt', 'Open Chores');
          onClickAction = () => panelNode.open('chores');
        }

        hud.showNotification({
          title: bTitle,
          message: bDesc + (actionPrompt ? ` <span style="text-decoration:underline; font-weight:bold; color:#34d399;">${actionPrompt}</span>` : ''),
          onClick: onClickAction,
          type: 'info'
        });
      }
    });

    // Double-click to enter building interior directly
    facilitiesDock.addEventListener('dblclick', e => {
      const btn = e.target.closest('.facility-dock-btn');
      if (!btn) return;
      const infraId = btn.dataset.infraId;
      if (!infraId || !settlementRenderer) return;
      const building = settlementRenderer.infrastructures.find(inf => inf.id === infraId);
      if (building) {
        zoomCoordinator.setLevel(ZOOM_LEVELS.BUILDING, building);
      }
    });
  }

  // Connect Top 4 Resource Meters to glide to their corresponding infrastructure
  const meterMap = [
    { id: 'meter-energy', infraId: 'infra-solar' },
    { id: 'meter-water', infraId: 'infra-water' },
    { id: 'meter-food', infraId: 'infra-food' },
    { id: 'meter-morale', infraId: 'infra-fablab' }
  ];
  meterMap.forEach(({ id, infraId }) => {
    const el = document.getElementById(id);
    if (el) {
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => {
        if (currentView === 'village' && settlementRenderer) {
          const b = settlementRenderer.focusOnBuilding(infraId);
          if (b && facilitiesDock) {
            facilitiesDock.querySelectorAll('.facility-dock-btn').forEach(btn => {
              btn.classList.toggle('active', btn.dataset.infraId === infraId);
            });
            const bTitle = b.nameKey ? t(b.nameKey, b.name) : b.name;
            const bDesc = b.descKey ? t(b.descKey, b.desc) : b.desc;
            hud.showNotification({
              title: bTitle,
              message: bDesc,
              type: 'info'
            });
          }
        }
      });
    }
  });

  // Bind Interior Prop Tooltip Click to Open 3D Inspector
  const interiorPropTooltip = document.getElementById('interior-prop-tooltip');
  if (interiorPropTooltip) {
    interiorPropTooltip.addEventListener('click', () => {
      if (settlementRenderer.hoveredInteriorProp) {
        prop3dViewer.open(settlementRenderer.hoveredInteriorProp);
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
            const climName = res.climate.nameKey ? t(res.climate.nameKey, res.climate.name) : res.climate.name;
            const dwellTypology = res.climate.dwellingTypeKey ? t(res.climate.dwellingTypeKey, res.climate.dwellingType) : res.climate.dwellingType;
            locInfo.innerHTML = `
              <div><strong>${t('bioregionYourBioregion', '📍 Your Bioregion:')}</strong> ${climName}</div>
              <div><strong>${t('bioregionArchTypology', 'Architectural Typology:')}</strong> ${dwellTypology}</div>
              <div><strong>${t('bioregionNearestNode', 'Nearest Node: {node} (~{dist} km)').replace('{node}', res.nearestNode.name).replace('{dist}', res.distanceKm)}</strong></div>
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
            title: '📍 ' + t('locateBiomeFoundTitle', 'Bioregion Identified'),
            message: t('locateBiomeFoundDesc', 'Climate: {climate}. Nearest node: {node} ({dist} km).')
              .replace('{climate}', res.climate.name)
              .replace('{node}', res.nearestNode.name)
              .replace('{dist}', res.distanceKm)
          });
        },
        err => {
          btnLocate.innerHTML = `📍 <span>${t('btnLocateMe', 'Locate My Bioregion')}</span>`;
          hud.showNotification({
            title: '🛰️ ' + t('mapWorldTitle', 'Planetary World Map'),
            message: t('mapClickToFound', 'Click any point on the map to inspect or found a node!')
          });
        }
      );
    });
  }

  // 7. Connect Simulation Events to UI
  sim.onTickListeners.push(state => {
    hud.update(state);
    worldMap.updateSolarTerminator(state.hour, state.day);
    worldMap.updateTradeConvoys(sim.trade.convoys, sim.trade);
    if (activePanel === 'convoys') {
      panelConvoys.render();
    }
    if (chatEngine) {
      chatEngine.tickAmbientChatter(state.tick, sim.thermo, sim.node);
    }
  });

  sim.onNotificationListeners.push(notif => {
    hud.showNotification(notif);
  });

  sim.onDilemmaListeners.push(dilemmaData => {
    panelDilemma.activeDilemmaData = dilemmaData;
    const councilBtn = document.getElementById('btn-open-council');
    if (councilBtn) councilBtn.classList.add('has-alert');
    const title = dilemmaData.dilemma.titleKey ? t(dilemmaData.dilemma.titleKey, dilemmaData.dilemma.title) : dilemmaData.dilemma.title;
    hud.showNotification({
      title: '🏛️ ' + t('councilDeliberationBadge', 'Citizen Assembly Deliberation'),
      message: `${title} (${t('clickToVoteHint', 'Click to vote')})`,
      onClick: () => {
        if (councilBtn) councilBtn.classList.remove('has-alert');
        navGroupManager.updateAlertState(false);
        panelDilemma.openDilemma(dilemmaData);
      }
    });
  });

  sim.onCrisisListeners.push(crisis => {
    const isTourActive = Boolean(guideTour && guideTour.isActive);
    const isHandbookOpen = Boolean(panelHandbook && panelHandbook.isOpen());

    if (!isTourActive && !isHandbookOpen) {
      panelDilemma.openCrisis(crisis);
    } else {
      panelDilemma.activeCrisisData = crisis;
    }

    const councilBtn = document.getElementById('btn-open-council');
    if (councilBtn) councilBtn.classList.add('has-alert');
    navGroupManager.updateAlertState(true);

    const crisisName = crisis.nameKey ? t(crisis.nameKey, crisis.name) : crisis.name;
    hud.showNotification({
      title: '⚠️ ' + t('systemAttackBadge', 'System Stress Event'),
      message: t('crisisActionNotice', '{name}: an urgent collective decision is needed!').replace('{name}', crisisName),
      onClick: () => {
        if (councilBtn) councilBtn.classList.remove('has-alert');
        navGroupManager.updateAlertState(false);
        panelDilemma.openCrisis(crisis);
      }
    });
  });

  sim.onPeerReview(reviewData => {
    panelDilemma.activePeerReviewData = reviewData;
    const councilBtn = document.getElementById('btn-open-council');
    if (councilBtn) councilBtn.classList.add('has-alert');
    navGroupManager.updateAlertState(true);
    const title = reviewData.docket.titleKey ? t(reviewData.docket.titleKey, reviewData.docket.title) : reviewData.docket.title;
    hud.showNotification({
      title: '🏛️ ' + t('newDocketNoticeTitle', 'Incoming Assembly Proposal'),
      message: `${title} (${t('clickToVoteHint', 'Click to vote')})`,
      onClick: () => {
        if (councilBtn) councilBtn.classList.remove('has-alert');
        navGroupManager.updateAlertState(false);
        panelDilemma.openPeerReview(reviewData);
      }
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
  if (savedProfile && !joinNodeParam) {
    PlayerProfileManager.touchPresence();
    const savedNode = GLOBAL_STARTER_NODES.find(n => n.id === savedProfile.nodeId || n.name === savedProfile.nodeName);
    if (savedNode) {
      activeNode = savedNode;
      sim.node.name = savedNode.name;
      sim.node.population = savedNode.population;
      sim.node.country = savedNode.country;
      sim.node.currencySymbol = savedNode.currencySymbol || '$';
      sim.node.currencyCode = savedNode.currencyCode || 'USD';
      sim.node.currencyName = savedNode.currencyName || 'US Dollar';
      if (sim.adversary) {
        sim.adversary.currencySymbol = sim.node.currencySymbol;
      }
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

  // 9b. Welcome Flow for Multiplayer Invitees (ITEM 18)
  if (inviteRoomParam) {
    storageIDB.getActiveIdentity().then(identity => {
      const isNewPioneer = !identity || identity.id?.startsWith('cit-legacy-') || identity.pubKeyHex === 'legacy_key';
      if (isNewPioneer) {
        setTimeout(() => {
          if (panelPassport) {
            panelPassport.open({
              inviteContext: {
                inviteNode: activeNode.name,
                inviteRoom: inviteRoomParam
              }
            });
          }
          hud.showNotification({
            title: '👋 ' + t('inviteWelcomeTitle', 'Settlement Invitation'),
            message: t('inviteWelcomeDesc', 'You arrived in {node} via multiplayer invitation! Mint your sovereign identity to join the commons.').replace('{node}', activeNode.name)
          });
        }, 900);
      } else {
        setTimeout(() => {
          hud.showNotification({
            title: '🌐 ' + t('inviteConnectedTitle', 'Connected to Settlement'),
            message: t('inviteConnectedDesc', 'Joined {node} via multiplayer link. P2P room: {room}').replace('{node}', activeNode.name).replace('{room}', inviteRoomParam)
          });
        }, 900);
      }
    });
  }

  sim.start();
  hud.update(sim.getFullState());
  zoomCoordinator.setLevel(ZOOM_LEVELS.NODE, null, true); // Start at NODE village level

  // Check if first-time onboarding tour should start (only if not arriving via invite wizard)
  setTimeout(() => {
    if (!inviteRoomParam && guideTour && !guideTour.isCompleted() && (!panelPassport || !panelPassport.isOpen)) {
      guideTour.start(0);
    }
  }, 1400);

  // Expose app context for telemetry and inspection
  window.app = {
    sim,
    activeNode,
    settlementRenderer,
    worldMap,
    zoomCoordinator,
    prop3dViewer,
    chatEngine,
    panelChat,
    guideTour,
    starterObjectives,
    panelInvite,
    p2pMesh,
    panelNode,
    panelDualTrack,
    panelConvoys,
    panelDilemma,
    panelFeedback,
    panelHandbook,
    panelPassport,
    panelDwelling,
    hud
  };

  console.log('✅ [O-ASIS Dual-Track] Planetary cartography & bioclimatic village engine running at 60 FPS.');
});
