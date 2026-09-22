/**
 * O-ASIS Dual-Track Interior Architectural Renderer (Agent SIM-2 & SIM-5)
 * Renders high-fidelity floorplans of common facilities and private usufruct dwellings.
 * Features enlarged animated avatars, detailed furniture, 3D printers, screens, tools, and fireplaces.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { PlayerProfileManager } from '../engine/player_profile.js';

export class InteriorRenderer {
  /**
   * Builds prop objects and occupant avatars for a room
   */
  static buildInteriorScene(interiorData, climate, sim) {
    const type = interiorData.type;
    const isPlayerHome = interiorData.isPlayerHome;
    const isGuest = interiorData.isGuest;

    const width = 640;
    const height = 420;
    let floorType = 'wood'; // wood | concrete | tile | stone | greenhouse
    let roomTitle = interiorData.name;
    const props = [];
    const occupants = [];

    if (type === 'WORKSHOP') {
      floorType = 'concrete';
      roomTitle = '💻 FabLab & Circular Workshop';

      // Heavy Workbench & 3D Printers (Left wall)
      props.push({
        id: 'printer-3d',
        type: 'PRINTER_3D',
        name: '🖨️ Dual-Track CoreXY 3D Printer (Prusa MK4)',
        desc: 'High-speed PETG/PLA additive manufacturing station. Produces hydroponic brackets and sensor enclosures.',
        x: -200, y: -120, w: 75, h: 65
      });
      props.push({
        id: 'cnc-mill',
        type: 'CNC_MILL',
        name: '⚙️ Open-Source CNC Router & Laser Cutter',
        desc: 'Automated 3-axis milling spindle for plywood cabinetry, aluminum brackets, and PCB isolation routing.',
        x: -110, y: -120, w: 85, h: 65
      });
      props.push({
        id: 'workbench-tooling',
        type: 'WORKBENCH',
        name: '🔨 Heavy Assembly Workbench & Pegboard',
        desc: 'Solid beechwood bench equipped with cast-iron vises, torque wrenches, and digital calipers.',
        x: -155, y: -45, w: 180, h: 55
      });

      // Plastic Recycling Station (Right Top)
      props.push({
        id: 'plastic-shredder',
        type: 'SHREDDER',
        name: '♻️ Precious Plastic Shredder & Extruder Hopper',
        desc: 'Grinds municipal plastic waste and scrap prints into granules, then re-extrudes uniform 1.75mm filament spools.',
        x: 180, y: -120, w: 90, h: 70
      });

      // Electronics Workbench (Right Mid)
      props.push({
        id: 'electronics-station',
        type: 'ELECTRONICS',
        name: '⚡ Electronics Soldering & Sensor Test Bench',
        desc: 'Temperature-controlled soldering iron, digital storage oscilloscope, and ESP32 programming dock.',
        x: 175, y: -25, w: 130, h: 55
      });

      // Dual-Track CAD Workstation (Center Bottom)
      props.push({
        id: 'cad-laptop',
        type: 'CAD_LAPTOP',
        name: '💻 Dual-Track CAD & Telemetry Workstation',
        desc: 'FreeCAD modeling suite linked to local mesh git repositories. Compiles validated .STL and YAML packages.',
        x: -30, y: 90, w: 120, h: 55
      });

      // Material Storage Barrels (Right Bottom)
      props.push({
        id: 'scrap-bins',
        type: 'SCRAP_BINS',
        name: '📦 Circular Materials Buffer (Al, PETG, Cu)',
        desc: 'Sorted ingots, spools, and wire reels awaiting closed-loop remanufacturing.',
        x: 190, y: 90, w: 85, h: 50
      });

      // Occupants
      occupants.push({
        name: 'Marcus Vance',
        role: 'Hardware Maker',
        icon: '🔧',
        x: -150, y: -15,
        activity: 'soldering',
        bubble: 'Calibrating 0.4mm nozzle... ✨',
        color: '#38bdf8'
      });
      occupants.push({
        name: 'Tariq Al-Mansoor',
        role: 'Circular Engineer',
        icon: '💻',
        x: -20, y: 65,
        activity: 'cad',
        bubble: 'Compiling rover hub STL 🤖',
        color: '#f59e0b'
      });

    } else if (type === 'ENERGY') {
      floorType = 'concrete';
      roomTitle = '⚡ Solar PV & Microgrid Powerhouse';

      props.push({
        id: 'inverter-bank',
        type: 'INVERTERS',
        name: '⚡ Hybrid Solar MPPT Inverter Rack',
        desc: 'Multi-string smart inverters converting rooftop DC photovoltaic solar energy into pure sine wave 230V AC.',
        x: -160, y: -120, w: 180, h: 65
      });
      props.push({
        id: 'battery-bank',
        type: 'BATTERY_RACK',
        name: '🔋 Conserved LiFePO4 Modular Battery Storage',
        desc: 'Prismatic lithium-iron-phosphate cells with integrated active cell balancers and 6,000-cycle life.',
        x: 160, y: -110, w: 150, h: 90
      });
      props.push({
        id: 'scada-monitor',
        type: 'SCADA_DESK',
        name: '🖥️ SCADA Microgrid Telemetry Console',
        desc: 'Real-time frequency, voltage, and galvanic islanding monitor connected to Home Assistant.',
        x: 0, y: 70, w: 150, h: 60
      });
      props.push({
        id: 'switchgear',
        type: 'SWITCHGEAR',
        name: '🛡️ Galvanic Isolation & Safety Switchgear',
        desc: 'High-voltage DC contactors and surge suppression arresters ensuring islanded commons safety.',
        x: -190, y: 45, w: 80, h: 80
      });

      occupants.push({
        name: 'Hiroshi Tanaka',
        role: 'Grid Architect',
        icon: '⚡',
        x: 0, y: 40,
        activity: 'scada',
        bubble: 'Microgrid frequency nominal (50.02 Hz) ⚡',
        color: '#10b981'
      });

    } else if (type === 'WATER') {
      floorType = 'tile';
      roomTitle = '💧 Rain Catchment & Water Filtration Plant';

      props.push({
        id: 'cistern-tank',
        type: 'CISTERN_TANK',
        name: '💧 Glass Potable Water Storage Tank',
        desc: 'Multi-thousand liter food-grade cistern with optical water level sensors and aerobic aeration.',
        x: -150, y: -50, w: 140, h: 140
      });
      props.push({
        id: 'filter-columns',
        type: 'FILTERS',
        name: '🧪 Sand, Biochar & Ceramic Ultrafiltration Columns',
        desc: 'Gravity-fed physical filtration media eliminating sediment, microplastics, and heavy metals.',
        x: 140, y: -110, w: 160, h: 70
      });
      props.push({
        id: 'uv-sterilizer',
        type: 'UV_TUBE',
        name: '🟣 UV-C LED Water Disinfection Chamber',
        desc: '254nm germicidal ultraviolet lamp destroying 99.99% of biological pathogens with zero chlorine.',
        x: 150, y: -10, w: 130, h: 45
      });
      props.push({
        id: 'water-lab',
        type: 'WATER_LAB',
        name: '🔬 Water Quality & Hydro-Purity Lab',
        desc: 'Continuous turbidity, TDS, and pH monitoring telemetry tied to the civic mesh.',
        x: 0, y: 80, w: 140, h: 55
      });

      occupants.push({
        name: 'Elena Rostova',
        role: 'Water Steward',
        icon: '💧',
        x: 0, y: 50,
        activity: 'testing',
        bubble: 'TDS at 24 ppm. Exceptional purity! 💧',
        color: '#06b6d4'
      });

    } else if (type === 'FOOD') {
      floorType = 'greenhouse';
      roomTitle = '🥗 Aeroponic Greenhouse Dome Interior';

      props.push({
        id: 'aeroponic-tower-1',
        type: 'AERO_TOWER',
        name: '🌿 Vertical Aeroponic Column A',
        desc: 'Rotating 3D printed vertical tower delivering pulsed micro-droplet nutrient mist to suspended plant roots.',
        x: -180, y: -65, w: 50, h: 120
      });
      props.push({
        id: 'aeroponic-tower-2',
        type: 'AERO_TOWER',
        name: '🌿 Vertical Aeroponic Column B',
        desc: 'High-density vertical crop tower yielding organic heirloom strawberries and dwarf butterhead lettuces.',
        x: -95, y: -65, w: 50, h: 120
      });
      props.push({
        id: 'germination-bed',
        type: 'GERMINATION_BED',
        name: '🌸 Microgreen Nursery & LED Germination Bench',
        desc: 'Heated bottom-mat nursery for heirloom seeds under dual-spectrum photosynthetic LED arrays.',
        x: 150, y: -80, w: 140, h: 70
      });
      props.push({
        id: 'harvest-crates',
        type: 'HARVEST_CRATES',
        name: '🧺 Freshly Picked Vegetable Crates',
        desc: 'Daily harvest crates destined for the communal dining hall and granary reserve buffer.',
        x: 160, y: 60, w: 120, h: 55
      });
      props.push({
        id: 'seed-vault',
        type: 'SEED_VAULT',
        name: '🗄️ Bioregional Open Seed Library',
        desc: 'Climate-resilient, non-patented open-pollinated seed varieties preserved for collective food sovereignty.',
        x: -180, y: 80, w: 100, h: 60
      });

      occupants.push({
        name: 'Maya Lin',
        role: 'Agro-Ecologist',
        icon: '🥗',
        x: -130, y: -15,
        activity: 'harvesting',
        bubble: 'Crisp romaine harvest is flourishing! 🥗',
        color: '#22c55e'
      });

    } else if (type === 'SCHOOL') {
      floorType = 'wood';
      roomTitle = '📚 Commons Forest School & Discovery Atelier';

      props.push({
        id: 'blackboard',
        type: 'BLACKBOARD',
        name: '📖 Natural Slate Permaculture Blackboard',
        desc: 'Handmade chalk board with diagrams of the nitrogen cycle, photovoltaic equations, and children drawings.',
        x: 0, y: -140, w: 220, h: 55
      });
      props.push({
        id: 'student-desk-1',
        type: 'DESK_STUDENT',
        name: '✏️ Handcrafted Timber Study Desk',
        desc: 'Low wooden desk equipped with non-toxic botanical watercolors, recycled paper notebooks, and seed pens.',
        x: -140, y: -20, w: 80, h: 45
      });
      props.push({
        id: 'student-desk-2',
        type: 'DESK_STUDENT',
        name: '🔬 Nature Discovery & Microscopy Bench',
        desc: 'Brass optical microscope, quartz magnifying glass, and pressed flower herbarium collection.',
        x: 0, y: -20, w: 80, h: 45
      });
      props.push({
        id: 'student-desk-3',
        type: 'DESK_STUDENT',
        name: '📐 Open Hardware Experimentation Station',
        desc: 'Wooden gears, solar demonstration cells, and breadboards where children learn computing hands-on.',
        x: 140, y: -20, w: 80, h: 45
      });
      props.push({
        id: 'reading-rug',
        type: 'READING_RUG',
        name: '🧶 Woven Storytelling Rug & Floor Cushions',
        desc: 'Cozy wool and organic cotton circular carpet for group stories, reading, and contemplative alloparenting.',
        x: -120, y: 80, w: 130, h: 70
      });
      props.push({
        id: 'toy-shelf',
        type: 'TOY_SHELF',
        name: '🧸 Montessori & Natural Curiosity Atelier',
        desc: 'Smooth pine building blocks, constellation globes, and botanical puzzles.',
        x: 140, y: 80, w: 120, h: 65
      });

      occupants.push({
        name: 'Amina Diallo',
        role: 'Pedagogue & Mentor',
        icon: '📚',
        x: 50, y: -110,
        activity: 'teaching',
        bubble: 'Who can tell me how rain returns to groundwater? 🌧️',
        color: '#ec4899'
      });
      occupants.push({
        name: 'Leo Lin',
        role: 'Pupil (Age 8)',
        icon: '🎒',
        x: -140, y: -30,
        isChild: true,
        activity: 'drawing',
        bubble: 'Drawing our solar panels! ☀️',
        color: '#facc15'
      });
      occupants.push({
        name: 'Mia Ramos',
        role: 'Pupil (Age 6)',
        icon: '🎒',
        x: -110, y: 90,
        isChild: true,
        activity: 'blocks',
        bubble: 'Building a microgrid! 🧱',
        color: '#facc15'
      });

    } else if (type === 'ELDER_CARE') {
      floorType = 'wood';
      roomTitle = '🏡 Intergenerational Elder Sanctuary & Hearth';

      props.push({
        id: 'stone-hearth',
        type: 'FIREPLACE',
        name: '🔥 River-Stone Fireplace & Radiant Hearth',
        desc: 'Clean-burning masonry rocket stove providing gentle, long-lasting thermal mass heating and warm ambiance.',
        x: 0, y: -130, w: 160, h: 75
      });
      props.push({
        id: 'rocking-chair-left',
        type: 'ROCKING_CHAIR',
        name: '🪑 Carved Oak Rocking Chair & Wool Blanket',
        desc: 'Ergonomic rocking chair made from reclaimed fallen oak, paired with a hand-spun merino wool throw.',
        x: -100, y: -45, w: 60, h: 65
      });
      props.push({
        id: 'rocking-chair-right',
        type: 'ROCKING_CHAIR',
        name: '🪑 Companion Rocking Chair by the Fire',
        desc: 'Comfortable armchair with velvet cushion positioned next to the warm stone chimney.',
        x: 100, y: -45, w: 60, h: 65
      });
      props.push({
        id: 'bookshelf-elders',
        type: 'BOOKSHELF',
        name: '📖 Living History Archives & Herbal Codex',
        desc: 'Historical chronicles, medicinal plant field guides, and community audio diaries.',
        x: -200, y: 40, w: 80, h: 100
      });
      props.push({
        id: 'tea-chess-table',
        type: 'CHESS_TABLE',
        name: '☕ Samovar & Handcrafted Chess Table',
        desc: 'Traditional copper tea samovar alongside an active wooden chess board with carved pine pieces.',
        x: 0, y: 15, w: 75, h: 45
      });
      props.push({
        id: 'window-bench',
        type: 'WINDOW_BENCH',
        name: '🌸 Veranda Window Seat Overlooking Garden',
        desc: 'Padded window bench with views of the shared garden, framed by potted blooming jasmine.',
        x: 180, y: 50, w: 95, h: 50
      });

      occupants.push({
        name: 'Arthur Pendelton',
        role: 'Master Mentor (Age 78)',
        icon: '🧓',
        x: -100, y: -55,
        isElder: true,
        activity: 'reading',
        bubble: 'The mint tea is delightful today. ☕',
        color: '#e2e8f0'
      });
      occupants.push({
        name: 'Evelyn Reed',
        role: 'Elder Healer (Age 74)',
        icon: '🧓',
        x: 80, y: -35,
        isElder: true,
        activity: 'chess',
        bubble: 'Check! Your move, neighbor. ♟️',
        color: '#e2e8f0'
      });

    } else if (type === 'AGORA') {
      floorType = 'stone';
      roomTitle = '🏛️ Central Agora & Demarchy Amphitheater';

      props.push({
        id: 'speaker-podium',
        type: 'PODIUM',
        name: '🎙️ Democratic Assembly Speaker Rostrum',
        desc: 'Open podium where any citizen or visitor can present proposals without institutional censorship.',
        x: 0, y: -20, w: 75, h: 50
      });
      props.push({
        id: 'sortition-kleroterion',
        type: 'KLEROTERION',
        name: '🏺 Athenian Sortition Lottery Urn',
        desc: 'Mechanical sortition machine for unbiased selection of 7 random citizens into governing juries.',
        x: -90, y: -20, w: 45, h: 55
      });
      props.push({
        id: 'constitutional-plaque',
        type: 'CONSTITUTION_PLAQUE',
        name: '📜 Bronze Constitutional Tablet (AGPL-3.0)',
        desc: 'Engraved with the inviolable class-0 invariants: Zero Speculation, Dynamic Usufruct, Non-Commercial Purity.',
        x: 0, y: -140, w: 200, h: 45
      });
      props.push({
        id: 'stone-benches',
        type: 'BENCHES_AGORA',
        name: '🏛️ Semi-Circular Concentric Assembly Tiers',
        desc: 'Acoustically tuned concentric stone seating holding community deliberative assemblies.',
        x: 0, y: 70, w: 320, h: 70
      });

      occupants.push({
        name: 'Fatima Zahra',
        role: 'Civic Mediator',
        icon: '🏛️',
        x: 0, y: -35,
        activity: 'speaking',
        bubble: 'Assembly convened: consensus deliberative agenda open. 📜',
        color: '#a855f7'
      });
      occupants.push({
        name: 'Mateo Fernandez',
        role: 'Council Delegate',
        icon: '🗳️',
        x: -90, y: 60,
        activity: 'listening',
        bubble: 'Voting on the microgrid battery reserve expansion. 🗳️',
        color: '#38bdf8'
      });

    } else if (type === 'GARDEN') {
      floorType = 'stone';
      roomTitle = '🌸 Shared Intergenerational Garden Pavilion';

      props.push({
        id: 'central-fountain',
        type: 'FOUNTAIN',
        name: '⛲ Recirculating Stone Lotus Fountain',
        desc: 'Solar-pumped bubbling water fountain creating soothing white noise and bird bathing sanctuary.',
        x: 0, y: 0, w: 90, h: 90
      });
      props.push({
        id: 'tea-table-wicker',
        type: 'TEA_TABLE',
        name: '🪑 Woven Wicker Tea Table & Chairs',
        desc: 'Shaded table for outdoor communal lunches, chess games, and intergenerational chats.',
        x: -150, y: -40, w: 80, h: 55
      });
      props.push({
        id: 'herb-bed',
        type: 'HERB_BED',
        name: '🌿 Raised Fragrant Herb & Lavender Box',
        desc: 'Living chamomile, rosemary, peppermint, and sage for free community tea harvesting.',
        x: 150, y: -40, w: 90, h: 50
      });
      props.push({
        id: 'seed-swap-bench',
        type: 'SEED_SWAP',
        name: '🌱 Community Seed & Cutting Exchange Bench',
        desc: 'Open bench where neighbors leave propagated plant cuttings and flower seed packets.',
        x: 160, y: 70, w: 80, h: 45
      });

      occupants.push({
        name: 'Giacomo Valli',
        role: 'Forest Elder',
        icon: '🧓',
        x: -130, y: -45,
        isElder: true,
        activity: 'tea',
        bubble: 'These peppermint leaves are exceptionally sweet. 🌿',
        color: '#e2e8f0'
      });
      occupants.push({
        name: 'Chloe Chen',
        role: 'Pupil (Age 7)',
        icon: '🎒',
        x: 40, y: -20,
        isChild: true,
        activity: 'fountain',
        bubble: 'Look at the finches bathing! 🐦',
        color: '#facc15'
      });

    } else {
      // DWELLING (Private Usufruct Pod)
      floorType = 'wood';
      const dNum = interiorData.entity ? interiorData.entity.number : 1;
      const occupant = interiorData.entity?.occupant;

      if (isPlayerHome) {
        roomTitle = `👑 Your Primary Usufruct Home (Pod #${dNum})`;
      } else if (occupant) {
        roomTitle = `🏡 ${occupant.name}'s Residence (Pod #${dNum})`;
      } else {
        roomTitle = `📦 Vacant Civic Reserve Pod #${dNum}`;
      }

      // 1. Bed with linen & duvet (Left top)
      props.push({
        id: 'bed-platform',
        type: 'BED',
        name: '🛏️ Birch Platform Bed with Organic Linen',
        desc: 'Solid birch platform frame with breathable natural latex mattress and organic wool duvet.',
        x: -160, y: -80, w: 105, h: 80
      });

      // 2. Personal Workstation Desk & Laptop (Right top)
      props.push({
        id: 'desk-laptop',
        type: 'DESK_LAPTOP',
        name: '💻 Personal Workstation & Mesh Terminal',
        desc: 'Solar-powered laptop running local AI inference and decentralised encrypted mesh telecom.',
        x: 140, y: -80, w: 110, h: 55
      });

      // 3. Modular Reclaimed Wardrobe (Left bottom)
      props.push({
        id: 'wardrobe-cabinet',
        type: 'WARDROBE',
        name: '🚪 Cedar Wardrobe (Circular Swap Shop)',
        desc: 'Modular double-door cedar wardrobe from the circular furniture pool with personal clothing cubbies.',
        x: -170, y: 65, w: 80, h: 70
      });

      // 4. Kitchenette & Kettle (Right bottom)
      props.push({
        id: 'kitchenette-counter',
        type: 'KITCHENETTE',
        name: '🍳 Kitchenette & Induction Hotplate',
        desc: 'Solid maple food preparation counter with efficient induction burner, kettle, and mug rack.',
        x: 150, y: 65, w: 105, h: 60
      });

      // 5. Reading Armchair & Woven Rug (Center)
      props.push({
        id: 'armchair-rug',
        type: 'ARMCHAIR_RUG',
        name: '🪑 Reclaimed Oak Armchair & Wool Rug',
        desc: 'Comfortable reading chair over a hand-woven geometrical kilim wool rug.',
        x: -25, y: 15, w: 65, h: 65
      });

      // 6. Monstera Houseplant (Center top)
      props.push({
        id: 'houseplant-monstera',
        type: 'HOUSEPLANT',
        name: '🪴 Potted Monstera Deliciosa',
        desc: 'Lush green houseplant in a handcrafted terracotta pot purifying indoor air.',
        x: 35, y: -110, w: 35, h: 45
      });

      // 7. Panoramic Solarpunk Picture Window (Top wall)
      props.push({
        id: 'picture-window',
        type: 'PICTURE_WINDOW',
        name: '🪟 Triple-Glazed Bioclimatic Window',
        desc: 'High-performance timber-aluminum window framing the outdoor settlement and solar microgrid.',
        x: 0, y: -140, w: 80, h: 32
      });

      if (isPlayerHome) {
        const prof = PlayerProfileManager.getProfile();
        const pApp = prof?.appearance || getCitizenAppearance(prof?.name || 'Player (You)');
        occupants.push({
          name: prof?.name || 'Player (You)',
          role: 'Pioneer & Usufructuary',
          icon: '👑',
          x: 140, y: -60,
          isPlayer: true,
          gender: pApp.gender,
          hairStyle: pApp.hairStyle,
          hairColor: pApp.hairColor,
          skinTone: pApp.skinTone,
          activity: 'laptop',
          bubble: 'Your private sanctuary. 100% debt-free! 👑',
          color: '#fbbf24'
        });
      } else if (occupant) {
        const isNight = sim ? (sim.currentHour >= 21 || sim.currentHour < 6) : false;
        occupants.push({
          name: occupant.name,
          role: occupant.role || 'Citizen',
          icon: isNight ? '😴' : (occupant.icon || '🧑'),
          x: isGuest ? -25 : 140,
          y: isGuest ? 15 : -60,
          activity: isNight ? 'sleeping' : (isGuest ? 'hosting' : 'laptop'),
          isSleeping: isNight,
          bubble: isNight ? 'Sleeping peacefully... zzz 😴' : (isGuest ? `Welcome in! Make yourself at home! ☕` : 'Resting in private usufruct sanctuary. 🔒'),
          color: '#34d399'
        });
      }
    }

    return {
      width,
      height,
      floorType,
      roomTitle,
      props,
      occupants
    };
  }

  /**
   * Main interior rendering entry point
   */
  static renderInterior(ctx, w, h, interiorScene, tick, weather, hour = 12) {
    if (!interiorScene) return;

    ctx.save();

    const isNight = (hour >= 21 || hour < 6);

    // 1. Dark ambient vignette background
    const bgGrad = ctx.createRadialGradient(0, 0, 100, 0, 0, 600);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(-w, -h, w * 2, h * 2);

    const rw = interiorScene.width;
    const rh = interiorScene.height;

    // 1.5 Nighttime stars and celestial glow outside the building
    if (isNight) {
      const now = Date.now();
      ctx.save();
      for (let i = 0; i < 45; i++) {
        const sx = (((i * 183.7) % (w * 1.8)) - w * 0.9);
        const sy = (((i * 119.3) % (h * 1.8)) - h * 0.9);
        if (Math.abs(sx) < rw / 2 + 15 && Math.abs(sy) < rh / 2 + 15) continue;
        const twinkle = (Math.sin(now * 0.003 + i * 2) + 1) * 0.4 + 0.2;
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 2. Draw Floor Surface
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(-rw / 2, -rh / 2, rw, rh, 16);
    ctx.clip();

    if (interiorScene.floorType === 'concrete') {
      // Polished industrial epoxy concrete
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-rw / 2, -rh / 2, rw, rh);
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
      ctx.lineWidth = 1;
      for (let x = -rw / 2; x <= rw / 2; x += 60) {
        ctx.beginPath(); ctx.moveTo(x, -rh / 2); ctx.lineTo(x, rh / 2); ctx.stroke();
      }
      for (let y = -rh / 2; y <= rh / 2; y += 60) {
        ctx.beginPath(); ctx.moveTo(-rw / 2, y); ctx.lineTo(rw / 2, y); ctx.stroke();
      }
    } else if (interiorScene.floorType === 'tile') {
      // Clean waterproof ceramic grid
      ctx.fillStyle = '#0f2937';
      ctx.fillRect(-rw / 2, -rh / 2, rw, rh);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1;
      for (let x = -rw / 2; x <= rw / 2; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, -rh / 2); ctx.lineTo(x, rh / 2); ctx.stroke();
      }
      for (let y = -rh / 2; y <= rh / 2; y += 40) {
        ctx.beginPath(); ctx.moveTo(-rw / 2, y); ctx.lineTo(rw / 2, y); ctx.stroke();
      }
    } else if (interiorScene.floorType === 'stone') {
      // Natural cut flagstone
      ctx.fillStyle = '#292524';
      ctx.fillRect(-rw / 2, -rh / 2, rw, rh);
      ctx.strokeStyle = 'rgba(120, 113, 108, 0.3)';
      ctx.lineWidth = 2;
      for (let r = 50; r <= 300; r += 45) {
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
      }
    } else if (interiorScene.floorType === 'greenhouse') {
      // Permaculture mulch, moss and stone pavers
      ctx.fillStyle = '#14281d';
      ctx.fillRect(-rw / 2, -rh / 2, rw, rh);
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.25)';
      ctx.lineWidth = 1;
      // Geodesic radial floor lines
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * 320, Math.sin(a) * 220);
        ctx.stroke();
      }
    } else {
      // Warm Scandinavian light oak wooden planks
      ctx.fillStyle = '#3b2f20';
      ctx.fillRect(-rw / 2, -rh / 2, rw, rh);
      ctx.strokeStyle = 'rgba(113, 63, 18, 0.5)';
      ctx.lineWidth = 1.5;
      for (let y = -rh / 2; y <= rh / 2; y += 22) {
        ctx.beginPath(); ctx.moveTo(-rw / 2, y); ctx.lineTo(rw / 2, y); ctx.stroke();
      }
    }

    ctx.restore();

    // 3. Draw Architectural Outer Walls
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(-rw / 2, -rh / 2, rw, rh, 16);
    ctx.stroke();

    // Inner bioluminescent edge trim
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.beginPath();
    ctx.roundRect(-rw / 2 + 7, -rh / 2 + 7, rw - 14, rh - 14, 12);
    ctx.stroke();

    // 3.5. Draw Doorways & Entrances (So citizens visibly walk through thresholds)
    const isAgora = interiorScene.roomTitle?.includes('Agora');
    const mainDoorW = isAgora ? 90 : 75;

    // South Main Portal / Threshold
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-mainDoorW / 2, rh / 2 - 12, mainDoorW, 24);
    ctx.fillStyle = isAgora ? '#292524' : '#1e293b';
    ctx.fillRect(-mainDoorW / 2 + 4, rh / 2 - 8, mainDoorW - 8, 16);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-mainDoorW / 2 + 4, rh / 2 - 8, mainDoorW - 8, 16);

    // Glowing doorway pillars
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-mainDoorW / 2 - 4, rh / 2 - 10, 6, 20);
    ctx.fillRect(mainDoorW / 2 - 2, rh / 2 - 10, 6, 20);

    // Floor entrance label / arrow
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.fillText('🚪 VILLAGE PORTAL', 0, rh / 2 - 14);

    if (isAgora) {
      // West Colonnade Portico
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-rw / 2 - 12, 35, 24, 55);
      ctx.fillStyle = '#292524';
      ctx.fillRect(-rw / 2 - 8, 39, 16, 47);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-rw / 2 - 8, 39, 16, 47);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-rw / 2 - 10, 31, 20, 6);
      ctx.fillRect(-rw / 2 - 10, 92, 20, 6);

      // East Colonnade Portico
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(rw / 2 - 12, 35, 24, 55);
      ctx.fillStyle = '#292524';
      ctx.fillRect(rw / 2 - 8, 39, 16, 47);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(rw / 2 - 8, 39, 16, 47);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(rw / 2 - 10, 31, 20, 6);
      ctx.fillRect(rw / 2 - 10, 92, 20, 6);
    } else if (interiorScene.roomTitle?.includes('Garden')) {
      // West School Connecting Gate
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-rw / 2 - 12, 10, 24, 55);
      ctx.fillStyle = '#14532d';
      ctx.fillRect(-rw / 2 - 8, 14, 16, 47);
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-rw / 2 - 8, 14, 16, 47);
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(-rw / 2 - 10, 6, 20, 6);
      ctx.fillRect(-rw / 2 - 10, 67, 20, 6);

      // East Sanctuary Connecting Gate
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(rw / 2 - 12, 10, 24, 55);
      ctx.fillStyle = '#14532d';
      ctx.fillRect(rw / 2 - 8, 14, 16, 47);
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(rw / 2 - 8, 14, 16, 47);
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(rw / 2 - 10, 6, 20, 6);
      ctx.fillRect(rw / 2 - 10, 67, 20, 6);
    }

    // 3.8 Nighttime Solarpunk LED Sconces & Warm Fixtures
    if (isNight) {
      ctx.save();
      // Warm floor ambient wash
      ctx.fillStyle = 'rgba(251, 191, 36, 0.06)';
      ctx.fillRect(-rw / 2 + 8, -rh / 2 + 8, rw - 16, rh - 16);

      // Solarpunk wall sconces along top wall
      for (let sx = -rw / 2 + 75; sx < rw / 2; sx += 135) {
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(sx - 5, -rh / 2 + 8, 10, 5);

        const sconceGrad = ctx.createRadialGradient(sx, -rh / 2 + 10, 2, sx, -rh / 2 + 10, 55);
        sconceGrad.addColorStop(0, 'rgba(251, 191, 36, 0.35)');
        sconceGrad.addColorStop(0.6, 'rgba(245, 158, 11, 0.12)');
        sconceGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = sconceGrad;
        ctx.beginPath();
        ctx.arc(sx, -rh / 2 + 10, 55, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 4. Render All Interior Props
    for (const prop of interiorScene.props) {
      InteriorRenderer.renderProp(ctx, prop, tick, isNight);
    }

    // 5. Render Enlarged Occupant Avatars
    for (const occ of interiorScene.occupants) {
      InteriorRenderer.renderAvatar(ctx, occ, tick, isNight);
    }

    ctx.restore();
  }

  /**
   * Renders individual interior props with vector details
   */
  static renderProp(ctx, prop, tick, isNight = false) {
    ctx.save();
    ctx.translate(prop.x, prop.y);

    if (prop.type === 'PRINTER_3D') {
      // 3D Printer Frame
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);

      // Glass build plate
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-prop.w / 2 + 8, prop.h / 2 - 16, prop.w - 16, 10);

      // Moving Print Head on Gantry
      const headX = Math.sin(tick * 0.12) * (prop.w / 2 - 20);
      const headY = Math.sin(tick * 0.05) * 8 - 4;
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(headX - 6, headY, 12, 10);

      // Extruder blue status light
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(headX, headY + 11, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Top Spool of PETG
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(0, -prop.h / 2 + 5, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('CORE-XY', -20, prop.h / 2 - 20);

    } else if (prop.type === 'CNC_MILL') {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);

      // Safety acrylic window
      ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
      ctx.fillRect(-prop.w / 2 + 6, -prop.h / 2 + 6, prop.w - 12, prop.h - 18);

      // Moving Spindle
      const spinX = Math.cos(tick * 0.08) * 15;
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(spinX - 4, -12, 8, 22);

      // Tiny milling sparks
      if (Math.random() < 0.45) {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(spinX + (Math.random() - 0.5) * 6, 10, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

    } else if (prop.type === 'WORKBENCH') {
      // Heavy beechwood table
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;
      ctx.strokeRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);

      // Tabletop vice
      ctx.fillStyle = '#475569';
      ctx.fillRect(-prop.w / 2 + 6, -prop.h / 2 - 4, 18, 12);

      // Pegboard rack with tools
      ctx.fillStyle = '#334155';
      ctx.fillRect(-prop.w / 2 + 30, -prop.h / 2 + 4, prop.w - 40, 14);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('🔧 🪚 📐 🔨', -prop.w / 2 + 40, -prop.h / 2 + 15);

    } else if (prop.type === 'SHREDDER') {
      ctx.fillStyle = '#334155';
      ctx.fillRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);

      // Shredder hopper
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(-25, -prop.h / 2);
      ctx.lineTo(25, -prop.h / 2);
      ctx.lineTo(15, -5);
      ctx.lineTo(-15, -5);
      ctx.closePath();
      ctx.fill();

      // Extruded filament spool
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, 16, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '8px sans-serif';
      ctx.fillText('RECYCLE', -18, prop.h / 2 - 4);

    } else if (prop.type === 'ELECTRONICS') {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);
      ctx.strokeStyle = '#38bdf8';
      ctx.strokeRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);

      // Oscilloscope screen
      ctx.fillStyle = '#022c22';
      ctx.fillRect(-prop.w / 2 + 8, -prop.h / 2 + 6, 40, 26);
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < 36; x += 4) {
        const y = Math.sin((x + tick * 4) * 0.2) * 8;
        if (x === 0) ctx.moveTo(-prop.w / 2 + 10 + x, -prop.h / 2 + 19 + y);
        else ctx.lineTo(-prop.w / 2 + 10 + x, -prop.h / 2 + 19 + y);
      }
      ctx.stroke();

      // Soldering iron with wispy smoke
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(prop.w / 2 - 25, 4, 14, 4);
      if (Math.random() < 0.6) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(prop.w / 2 - 18, -4 - (tick % 10), 2, 0, Math.PI * 2);
        ctx.fill();
      }

    } else if (prop.type === 'CAD_LAPTOP' || prop.type === 'DESK_LAPTOP') {
      // Wooden desk
      ctx.fillStyle = '#5c3a21';
      ctx.fillRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);
      ctx.strokeStyle = '#854d0e';
      ctx.strokeRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);

      // Open Laptop with Glowing Screen
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-18, -12, 36, 24);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.fillRect(-16, -10, 32, 18);

      // Animated 3D wireframe rotating on screen
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      const angle = tick * 0.05;
      ctx.strokeRect(-8 + Math.cos(angle) * 3, -6 + Math.sin(angle) * 2, 16, 10);

      // Coffee mug
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(28, 4, 4, 0, Math.PI * 2);
      ctx.fill();

    } else if (prop.type === 'INVERTERS') {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.strokeRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);

      // 4 Inverter modular blocks
      for (let i = 0; i < 4; i++) {
        const ix = -prop.w / 2 + 10 + i * 42;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(ix, -prop.h / 2 + 8, 34, prop.h - 16);
        // Blinking Green Sync LED
        const ledOn = (Math.floor(tick / 8) + i) % 2 === 0;
        ctx.fillStyle = ledOn ? '#10b981' : '#064e3b';
        ctx.beginPath();
        ctx.arc(ix + 17, -prop.h / 2 + 16, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.font = '7px monospace';
        ctx.fillText('MPPT', ix + 6, prop.h / 2 - 12);
      }

    } else if (prop.type === 'BATTERY_RACK') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);

      // 3 Rack-mounted battery units
      for (let i = 0; i < 3; i++) {
        const by = -prop.h / 2 + 8 + i * 26;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-prop.w / 2 + 6, by, prop.w - 12, 22);

        // Digital SOC display
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 8px monospace';
        ctx.fillText(`LiFePO4 • 51.2V [96%]`, -prop.w / 2 + 14, by + 14);
      }

    } else if (prop.type === 'CISTERN_TANK') {
      // Glass Water Cylinder
      ctx.fillStyle = 'rgba(14, 165, 233, 0.25)';
      ctx.beginPath();
      ctx.roundRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h, 20);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Water Level Ripples
      const waterY = prop.h / 2 - prop.h * 0.75;
      ctx.fillStyle = 'rgba(2, 132, 199, 0.4)';
      ctx.beginPath();
      ctx.roundRect(-prop.w / 2 + 4, waterY, prop.w - 8, prop.h - waterY - 4, 16);
      ctx.fill();

      // Rising bubbles
      for (let i = 0; i < 3; i++) {
        const bx = -20 + i * 20 + Math.sin(tick * 0.1 + i) * 6;
        const by = prop.h / 2 - ((tick * 1.5 + i * 35) % (prop.h * 0.7));
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('32,000 L', -22, -10);

    } else if (prop.type === 'AERO_TOWER') {
      // Vertical Tower
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.strokeRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);

      // Sprouting organic greens & berries
      for (let y = -prop.h / 2 + 15; y < prop.h / 2 - 10; y += 22) {
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(-prop.w / 2 - 6, y, 7, 0, Math.PI * 2);
        ctx.arc(prop.w / 2 + 6, y + 4, 7, 0, Math.PI * 2);
        ctx.fill();

        // Strawberry red dots
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(prop.w / 2 + 6, y + 6, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Mist pulsing effect
      const mistA = Math.abs(Math.sin(tick * 0.08)) * 0.35;
      ctx.fillStyle = `rgba(52, 211, 153, ${mistA})`;
      ctx.fillRect(-prop.w / 2 - 10, -prop.h / 2, prop.w + 20, prop.h);

    } else if (prop.type === 'BLACKBOARD') {
      // Dark slate with wood frame
      ctx.fillStyle = '#1c3024';
      ctx.fillRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 4;
      ctx.strokeRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);

      // Chalk equations & drawings
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = '10px sans-serif';
      ctx.fillText('☀️ Solar PV ➔ 🔋 LiFePO4 ➔ 🥗 Calories', -prop.w / 2 + 14, -prop.h / 2 + 20);
      ctx.fillText('dE/dt = Q_sun - W_civic | closed loop', -prop.w / 2 + 14, -prop.h / 2 + 38);

    } else if (prop.type === 'FIREPLACE') {
      // River stone masonry
      ctx.fillStyle = '#44403c';
      ctx.fillRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);
      ctx.strokeStyle = '#78716c';
      ctx.lineWidth = 2;
      ctx.strokeRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);

      // Firebox opening
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(-35, -prop.h / 2 + 18, 70, prop.h - 22);

      // Animated Flames
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(0, prop.h / 2 - 14, 18 + Math.sin(tick * 0.2) * 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(Math.sin(tick * 0.25) * 4, prop.h / 2 - 18, 10, 0, Math.PI * 2);
      ctx.fill();

      // Radiant hearth glow on floor
      const glowGrad = ctx.createRadialGradient(0, prop.h / 2, 5, 0, prop.h / 2, 60);
      glowGrad.addColorStop(0, 'rgba(234, 88, 12, 0.4)');
      glowGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(-60, prop.h / 2, 120, 40);

    } else if (prop.type === 'BED') {
      // Wooden frame
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);
      ctx.strokeStyle = '#b45309';
      ctx.strokeRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);

      // Soft mattress & teal duvet
      ctx.fillStyle = '#0d9488';
      ctx.fillRect(-prop.w / 2 + 6, -prop.h / 2 + 20, prop.w - 12, prop.h - 24);

      // Pillows
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-prop.w / 2 + 10, -prop.h / 2 + 4, 38, 14);
      ctx.fillRect(prop.w / 2 - 48, -prop.h / 2 + 4, 38, 14);

      if (isNight) {
        // Softly tucked blanket over sleeping occupant silhouette
        ctx.fillStyle = '#0f766e';
        ctx.beginPath();
        ctx.ellipse(2, 6, 26, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Resting head on pillow
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(-prop.w / 2 + 25, -prop.h / 2 + 11, 7, 0, Math.PI * 2);
        ctx.fill();

        // Slumber animation
        const now = Date.now();
        const zProg = ((now * 0.001) % 2.2);
        const zAlpha = Math.max(0, 1 - (zProg / 2.2));
        ctx.fillStyle = `rgba(254, 240, 138, ${zAlpha * 0.85})`;
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.fillText('z', -prop.w / 2 + 36, -prop.h / 2 - 2 - zProg * 8);
      }

    } else if (prop.type === 'PICTURE_WINDOW') {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;
      ctx.strokeRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);

      if (isNight) {
        // Window framing dark night sky with stars outside
        ctx.fillStyle = '#090d16';
        ctx.fillRect(-prop.w / 2 + 3, -prop.h / 2 + 3, prop.w - 6, prop.h - 6);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-18, -4, 1.2, 0, Math.PI * 2);
        ctx.arc(14, 2, 1.2, 0, Math.PI * 2);
        ctx.arc(24, -6, 0.9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(254, 240, 138, 0.25)';
        ctx.beginPath();
        ctx.arc(0, -6, 8, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Daylight solarpunk view
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-prop.w / 2 + 3, -prop.h / 2 + 3, prop.w - 6, prop.h - 6);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(-prop.w / 2 + 3, prop.h / 2 - 9, prop.w - 6, 6);
      }

    } else if (prop.type === 'FOUNTAIN') {
      // Stone rim
      ctx.fillStyle = '#57534e';
      ctx.beginPath();
      ctx.arc(0, 0, prop.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#a8a29e';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Water pool with ripples
      ctx.fillStyle = 'rgba(14, 165, 233, 0.6)';
      ctx.beginPath();
      ctx.arc(0, 0, prop.w / 2 - 8, 0, Math.PI * 2);
      ctx.fill();

      // Concentric ripple animation
      const r = (tick * 0.8) % (prop.w / 2 - 10);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();

    } else if (prop.type === 'BENCHES_AGORA') {
      // Concentric Assembly Tiers (Limestone with cedar cushions)
      ctx.fillStyle = '#292524';
      ctx.beginPath();
      ctx.roundRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h, 12);
      ctx.fill();
      ctx.strokeStyle = '#44403c';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Stepped tier levels
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(-prop.w / 2 + 10, -prop.h / 2 + 8, prop.w - 20, 22);
      ctx.fillStyle = '#292524';
      ctx.fillRect(-prop.w / 2 + 10, -prop.h / 2 + 34, prop.w - 20, 26);

      // Cedar wood bench slats
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-prop.w / 2 + 14, -prop.h / 2 + 12, prop.w - 28, 14);
      ctx.fillRect(-prop.w / 2 + 14, -prop.h / 2 + 38, prop.w - 28, 18);

      // Bioluminescent teal edge trim
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(-prop.w / 2 + 14, -prop.h / 2 + 12, prop.w - 28, 14);
      ctx.strokeRect(-prop.w / 2 + 14, -prop.h / 2 + 38, prop.w - 28, 18);

      // Tier label
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.textAlign = 'center';
      ctx.fillText('🏛️ CONCENTRIC CITIZEN TIERS', 0, prop.h / 2 - 4);

    } else if (prop.type === 'PODIUM') {
      // Demarchic Assembly Speaker Rostrum
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.roundRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h, 6);
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Polished walnut desk top
      ctx.fillStyle = '#451a03';
      ctx.fillRect(-prop.w / 2 + 4, -prop.h / 2 + 4, prop.w - 8, prop.h - 8);

      // Microphone stem & condenser
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(12, -prop.h / 2 + 10);
      ctx.lineTo(8, -prop.h / 2 - 12);
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(8, -prop.h / 2 - 14, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Bronze Civic Rostrum emblem
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'center';
      ctx.fillText('🎙️ ROSTRUM', 0, 4);

    } else if (prop.type === 'KLEROTERION') {
      // Athenian Sortition Lottery Urn
      ctx.fillStyle = '#44403c';
      ctx.beginPath();
      ctx.roundRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h, 8);
      ctx.fill();
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Terracotta urn vase
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.ellipse(0, -2, 14, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Greek key / geometric rim
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-12, -18, 24, 4);

      // Animated glowing token pulse
      const pulse = Math.sin(tick * 0.15) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(56, 189, 248, ${pulse})`;
      ctx.beginPath();
      ctx.arc(0, -2, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.fillStyle = '#fde047';
      ctx.textAlign = 'center';
      ctx.fillText('🏺 SORTITION', 0, prop.h / 2 - 4);

    } else if (prop.type === 'CONSTITUTION_PLAQUE') {
      // Bronze Constitutional Wall Tablet
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.strokeRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);

      // Patina bronze face
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-prop.w / 2 + 4, -prop.h / 2 + 4, prop.w - 8, prop.h - 8);

      // Engraved Solarpunk Invariants
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'center';
      ctx.fillText('📜 O.N.E. CONSTITUTION • AGPL-3.0', 0, -prop.h / 2 + 16);
      ctx.font = '8px Inter, sans-serif';
      ctx.fillStyle = '#fed7aa';
      ctx.fillText('Dynamic Usufruct • Non-Commercial Purity • Thermodynamic Balance', 0, -prop.h / 2 + 30);

    } else if (prop.type === 'SCADA_DESK') {
      // SCADA Telemetry Console (ENERGY)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h, 8);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Triple SCADA monitors
      for (let i = 0; i < 3; i++) {
        const mx = -prop.w / 2 + 10 + i * 46;
        ctx.fillStyle = '#022c22';
        ctx.fillRect(mx, -prop.h / 2 + 6, 38, 26);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1;
        ctx.strokeRect(mx, -prop.h / 2 + 6, 38, 26);

        // Animated telemetry waveform
        ctx.beginPath();
        for (let x = 0; x < 32; x += 4) {
          const y = Math.sin((x + tick * 3 + i * 10) * 0.25) * 6;
          if (x === 0) ctx.moveTo(mx + 3 + x, -prop.h / 2 + 19 + y);
          else ctx.lineTo(mx + 3 + x, -prop.h / 2 + 19 + y);
        }
        ctx.stroke();
      }

      // Live readout text
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('SCADA 50.02Hz • 230V AC', -prop.w / 2 + 14, prop.h / 2 - 8);

    } else if (prop.type === 'SWITCHGEAR') {
      // Galvanic Isolation Switchgear (ENERGY)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.strokeRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);

      // Warning hazard stripes top
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-prop.w / 2 + 4, -prop.h / 2 + 4, prop.w - 8, 6);

      // Red Rotary Master Isolator Switch
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(0, 4, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillRect(-2, -6, 4, 20);

      ctx.font = 'bold 7px Inter, sans-serif';
      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ ISOLATION', 0, prop.h / 2 - 6);

    } else if (prop.type === 'FILTERS') {
      // Multi-layer Sand & Biochar Filter Columns (WATER)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);

      // 3 Glass filter cylinders
      for (let i = 0; i < 3; i++) {
        const cx = -prop.w / 2 + 15 + i * 48;
        // Glass column
        ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
        ctx.fillRect(cx, -prop.h / 2 + 8, 34, prop.h - 16);
        // Media layers: gravel (grey), sand (amber), biochar (black)
        ctx.fillStyle = '#475569';
        ctx.fillRect(cx, -prop.h / 2 + 8, 34, 14);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(cx, -prop.h / 2 + 22, 34, 14);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(cx, -prop.h / 2 + 36, 34, prop.h - 52);

        // Water droplet animation
        const dropY = -prop.h / 2 + 10 + ((tick * 1.5 + i * 20) % (prop.h - 24));
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(cx + 17, dropY, 2, 0, Math.PI * 2);
        ctx.fill();
      }

    } else if (prop.type === 'UV_TUBE') {
      // UV-C LED Water Disinfection (WATER)
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h, 8);
      ctx.fill();
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Glowing ultraviolet quartz chamber
      const uvGlow = Math.sin(tick * 0.1) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(168, 85, 247, ${uvGlow})`;
      ctx.fillRect(-prop.w / 2 + 12, -6, prop.w - 24, 12);

      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.fillStyle = '#f3e8ff';
      ctx.textAlign = 'center';
      ctx.fillText('🟣 254nm UV-C STERILIZER', 0, prop.h / 2 - 6);

    } else if (prop.type === 'WATER_LAB') {
      // Water Quality Testing Desk (WATER)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);
      ctx.strokeStyle = '#38bdf8';
      ctx.strokeRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);

      // Test tube rack
      for (let i = 0; i < 4; i++) {
        const tx = -prop.w / 2 + 14 + i * 14;
        ctx.fillStyle = i % 2 === 0 ? '#06b6d4' : '#10b981';
        ctx.fillRect(tx, -prop.h / 2 + 8, 8, 22);
      }

      // Digital TDS meter
      ctx.fillStyle = '#022c22';
      ctx.fillRect(15, -prop.h / 2 + 8, 48, 20);
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('18 ppm', 22, -prop.h / 2 + 22);

      ctx.font = '8px Inter, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('🔬 HYDRO-PURITY LAB', -prop.w / 2 + 14, prop.h / 2 - 8);

    } else if (prop.type === 'GERMINATION_BED') {
      // Nursery Seedling Table with Grow LEDs (FOOD)
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);

      // Horticultural Pink LED Grow Light array
      ctx.fillStyle = 'rgba(236, 72, 153, 0.35)';
      ctx.fillRect(-prop.w / 2 + 6, -prop.h / 2 + 6, prop.w - 12, 12);

      // Microgreen seed plug trays
      for (let y = -prop.h / 2 + 24; y < prop.h / 2 - 6; y += 12) {
        for (let x = -prop.w / 2 + 10; x < prop.w / 2 - 10; x += 14) {
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

    } else if (prop.type === 'HARVEST_CRATES') {
      // Fresh Vegetable Harvest Crates (FOOD)
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);

      // Produce overflowing: tomatoes (red), lettuce (green), carrots (orange)
      const produce = ['#ef4444', '#22c55e', '#f97316'];
      for (let i = 0; i < 15; i++) {
        const px = -prop.w / 2 + 12 + (i % 5) * 20;
        const py = -prop.h / 2 + 12 + Math.floor(i / 5) * 14;
        ctx.fillStyle = produce[i % produce.length];
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();
      }

    } else if (prop.type === 'SEED_VAULT') {
      // Bioregional Open Seed Vault (FOOD)
      ctx.fillStyle = '#451a03';
      ctx.fillRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);
      ctx.strokeStyle = '#ca8a04';
      ctx.strokeRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);

      // Drawers with brass handles
      for (let r = 0; r < 2; r++) {
        const dy = -prop.h / 2 + 6 + r * 24;
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-prop.w / 2 + 6, dy, prop.w - 12, 18);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(-10, dy + 7, 20, 4);
      }

      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'center';
      ctx.fillText('🗄️ SEED LIBRARY', 0, prop.h / 2 - 4);

    } else if (prop.type === 'STUDENT_DESKS') {
      // Birch School Desks (SCHOOL)
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);
      ctx.strokeStyle = '#d97706';
      ctx.strokeRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);

      // Notebooks & pencils on top
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-prop.w / 2 + 8, -prop.h / 2 + 6, 18, 14);
      ctx.fillRect(prop.w / 2 - 26, -prop.h / 2 + 6, 18, 14);
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(-prop.w / 2 + 30, -prop.h / 2 + 10, 8, 2);

    } else if (prop.type === 'MICROSCOPE_BENCH') {
      // Nature Discovery Microscope Bench (SCHOOL)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);
      ctx.strokeStyle = '#38bdf8';
      ctx.strokeRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);

      // Microscope icon
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔬', -16, 6);

      // Specimen dishes
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(18, 0, 8, 0, Math.PI * 2);
      ctx.fill();

    } else if (prop.type === 'NATURE_DISPLAY') {
      // Glass Terrarium & Forest Display (SCHOOL)
      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.fillRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);

      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🦋 🌿 🌰', 0, 4);

    } else if (prop.type === 'ARMCHAIRS') {
      // Cozy Woven Wingback Armchairs (ELDER_CARE)
      for (let i = -1; i <= 1; i += 2) {
        ctx.fillStyle = '#065f46';
        ctx.beginPath();
        ctx.roundRect(i * 26 - 16, -18, 32, 36, 6);
        ctx.fill();
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Wool tartan cushion
        ctx.fillStyle = '#b45309';
        ctx.fillRect(i * 26 - 10, -6, 20, 16);
      }

    } else if (prop.type === 'HERBAL_DISPENSARY') {
      // Apothecary Herb Cabinet (ELDER_CARE)
      ctx.fillStyle = '#451a03';
      ctx.fillRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);
      ctx.strokeStyle = '#ca8a04';
      ctx.strokeRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);

      // Amber glass tincture bottles
      for (let i = 0; i < 4; i++) {
        const bx = -prop.w / 2 + 10 + i * 18;
        ctx.fillStyle = '#d97706';
        ctx.fillRect(bx, -12, 10, 18);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(bx + 2, -16, 6, 4);
      }

    } else if (prop.type === 'VERANDA_PLANTS') {
      // Veranda Potted Foliage (ELDER_CARE)
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🪴 🌺 🌿', 0, 6);

    } else if (prop.type === 'TEA_TABLE') {
      // Wicker Tea Table & Teapot (GARDEN)
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(0, 0, prop.w / 2 - 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Ceramic teapot & steam
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      if (Math.random() < 0.7) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(Math.sin(tick * 0.1) * 2, -12 - (tick % 8), 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

    } else if (prop.type === 'HERB_BED') {
      // Raised Herb & Lavender Box (GARDEN)
      ctx.fillStyle = '#451a03';
      ctx.fillRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.strokeRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);

      // Lush aromatic herbs
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🌿 🌸 🍃', 0, 4);

    } else if (prop.type === 'SEED_SWAP') {
      // Community Seed & Cutting Swap Bench (GARDEN)
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);
      ctx.strokeStyle = '#ca8a04';
      ctx.strokeRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);

      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🌱 ✉️ 🌾', 0, 4);

    } else if (prop.type === 'DINING_TABLE') {
      // Oak Dining Table with Sourdough (DWELLING)
      ctx.fillStyle = '#5c3a21';
      ctx.fillRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);
      ctx.strokeStyle = '#854d0e';
      ctx.strokeRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);

      // Linen runner & bowls
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(-prop.w / 2 + 10, -6, prop.w - 20, 12);
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 6, 0, 0, Math.PI * 2);
      ctx.fill();

    } else if (prop.type === 'HYDROPONIC_WINDOW') {
      // Triple-Glazed Bioclimatic Hydroponic Window (DWELLING)
      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.fillRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);

      // Microgreen rails in window
      for (let x = -prop.w / 2 + 10; x < prop.w / 2 - 10; x += 16) {
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(x, 4, 4, 0, Math.PI * 2);
        ctx.fill();
      }

    } else if (prop.type === 'SCRAP_BINS') {
      // Circular Materials Buffer (WORKSHOP)
      ctx.fillStyle = '#334155';
      ctx.fillRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);
      ctx.strokeStyle = '#94a3b8';
      ctx.strokeRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);

      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('📦 ♻️ 🔩', 0, 5);

    } else {
      // Generic furniture / workbench fallback
      ctx.fillStyle = '#475569';
      ctx.fillRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);
      ctx.strokeStyle = '#94a3b8';
      ctx.strokeRect(-prop.w / 2, -prop.h / 2, prop.w, prop.h);
      ctx.fillStyle = '#fff';
      ctx.font = '10px sans-serif';
      ctx.fillText(prop.name.slice(0, 14), -prop.w / 2 + 6, 4);
    }

    ctx.restore();
  }

  /**
   * Renders enlarged animated avatars inside interiors (approx 3x scale)
   * With distinct hairstyles, hair colors, skin tones and clothing for women, men, elders, and children.
   */
  static renderAvatar(ctx, occ, tick, isNight = false) {
    if (occ.isSleeping && isNight) {
      return; // Sleeping occupant is drawn tucked inside the bed
    }

    ctx.save();
    ctx.translate(occ.x, occ.y);

    const isChild = occ.isChild;
    const isElder = occ.isElder;
    const scale = isChild ? 1.8 : 2.4;
    ctx.scale(scale, scale);

    const appearance = getCitizenAppearance(occ);
    const gender = occ.gender || appearance.gender;
    const skin = occ.skinTone || appearance.skinTone;
    const hairColor = occ.hairColor || appearance.hairColor;
    const hairStyle = occ.hairStyle || appearance.hairStyle;

    // Subtle breathing / walking animation
    const isWalking = occ.isWalking;
    const walkSwing = isWalking ? Math.sin(tick * 0.35) * 4 : 0;
    const breathY = isWalking ? Math.abs(Math.sin(tick * 0.35)) * 1.5 : Math.sin(tick * 0.08) * 0.8;

    // 1. Shadow underneath
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 8, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Legs / Shoes with walking animation
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-4, 2 + walkSwing, 3, 7);
    ctx.fillRect(1, 2 - walkSwing, 3, 7);

    // 3. Body / Clothes (solarpunk flared tunic for women, classic straight workwear for men)
    ctx.fillStyle = occ.color || '#38bdf8';
    if (gender === 'F') {
      ctx.beginPath();
      ctx.moveTo(-6, -8 + breathY);
      ctx.lineTo(6, -8 + breathY);
      ctx.lineTo(7, 3 + breathY);
      ctx.lineTo(-7, 3 + breathY);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillRect(-6, -8 + breathY, 12, 11);
    }

    // 4. Arms with walking swing
    ctx.fillStyle = occ.color || '#38bdf8';
    ctx.fillRect(-8, -7 + breathY - walkSwing * 0.8, 2, 9);
    ctx.fillRect(6, -7 + breathY + walkSwing * 0.8, 2, 9);

    // 5. Head with biocultural skin tones
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(0, -13 + breathY, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // 6. Hair & Facial Features
    ctx.fillStyle = hairColor;

    if (hairStyle === 'ponytail') {
      // Base top hair arc
      ctx.beginPath();
      ctx.arc(0, -15 + breathY, 5.5, Math.PI * 0.9, Math.PI * 2.1);
      ctx.fill();
      // Side hair tie + ponytail flowing down on left
      ctx.beginPath();
      ctx.arc(-5.5, -12 + breathY, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-7.5, -12 + breathY, 3, 9);
    } else if (hairStyle === 'long') {
      // Full head arc + two flowing side locks down the shoulders
      ctx.beginPath();
      ctx.arc(0, -15 + breathY, 5.6, Math.PI * 0.85, Math.PI * 2.15);
      ctx.fill();
      ctx.fillRect(-6.5, -14 + breathY, 2.2, 11);
      ctx.fillRect(4.3, -14 + breathY, 2.2, 11);
    } else if (hairStyle === 'bob') {
      // Rounded sleek bob framing face
      ctx.beginPath();
      ctx.arc(0, -15 + breathY, 5.8, Math.PI * 0.8, Math.PI * 2.2);
      ctx.fill();
      ctx.fillRect(-6.5, -14 + breathY, 2.5, 7.5);
      ctx.fillRect(4, -14 + breathY, 2.5, 7.5);
    } else if (hairStyle === 'bun' || hairStyle === 'chignon') {
      // High elegant top knot / chignon bun
      ctx.beginPath();
      ctx.arc(0, -15 + breathY, 5.5, Math.PI * 0.9, Math.PI * 2.1);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -19.5 + breathY, 3.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (hairStyle === 'pigtails') {
      // Twin side buns/pigtails for girl pupils
      ctx.beginPath();
      ctx.arc(0, -15 + breathY, 5.2, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-6, -15 + breathY, 2.8, 0, Math.PI * 2);
      ctx.arc(6, -15 + breathY, 2.8, 0, Math.PI * 2);
      ctx.fill();
    } else if (hairStyle === 'messy') {
      // Textured spiky/wavy bangs
      ctx.beginPath();
      ctx.arc(0, -15 + breathY, 5.8, Math.PI * 0.85, Math.PI * 2.15);
      ctx.fill();
      ctx.fillRect(-2, -18.5 + breathY, 4, 3);
    } else if (hairStyle === 'fade') {
      // Short fade cut
      ctx.beginPath();
      ctx.arc(0, -15.5 + breathY, 5.2, Math.PI, Math.PI * 2);
      ctx.fill();
    } else if (hairStyle === 'beard') {
      // Short hair + neat beard/jawline
      ctx.beginPath();
      ctx.arc(0, -15 + breathY, 5.5, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -10.5 + breathY, 4.2, Math.PI * 0.15, Math.PI * 0.85);
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = hairColor;
      ctx.stroke();
    } else if (hairStyle === 'receding') {
      // Elder male classic temples
      ctx.beginPath();
      ctx.arc(0, -14.5 + breathY, 5.8, Math.PI * 1.15, Math.PI * 1.85);
      ctx.fill();
    } else {
      // Classic clean crop
      ctx.beginPath();
      ctx.arc(0, -15 + breathY, 5.5, Math.PI, Math.PI * 2);
      ctx.fill();
    }

    // 7. Role Emblem / Crown
    if (occ.isPlayer) {
      ctx.font = '7px sans-serif';
      ctx.fillText('👑', -4, -20 + breathY);
    }

    // 8. Speech / Thought Bubble (Guaranteed Centering & Responsive Box)
    if (occ.bubble) {
      ctx.save();
      ctx.scale(1 / scale, 1 / scale);
      ctx.font = '11px system-ui, sans-serif';
      const textWidth = ctx.measureText(occ.bubble).width;
      const bubbleW = textWidth + 24;
      const bubbleH = 24;
      const bubbleY = -62;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      ctx.strokeStyle = occ.isPlayer ? '#fbbf24' : '#38bdf8';
      ctx.lineWidth = 1.2;

      // Rounded bubble container
      ctx.beginPath();
      ctx.roundRect(-bubbleW / 2, bubbleY, bubbleW, bubbleH, 7);
      ctx.fill();
      ctx.stroke();

      // Downward pointer arrow connecting bubble to avatar
      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      ctx.beginPath();
      ctx.moveTo(-4, bubbleY + bubbleH - 0.5);
      ctx.lineTo(0, bubbleY + bubbleH + 4.5);
      ctx.lineTo(4, bubbleY + bubbleH - 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Render text strictly centered within the container
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(occ.bubble, 0, bubbleY + (bubbleH / 2));
      ctx.restore();
    }

    ctx.restore();
  }
}

/**
 * Deterministically derives gender, hair style, hair color, and skin tone for a citizen
 */
export function getCitizenAppearance(citizen) {
  if (citizen && typeof citizen === 'object') {
    if (citizen.appearance) {
      return {
        gender: citizen.appearance.gender || 'F',
        skinTone: citizen.appearance.skinTone || '#fbb77a',
        hairColor: citizen.appearance.hairColor || '#1e293b',
        hairStyle: citizen.appearance.hairStyle || 'ponytail'
      };
    }
    if (citizen.gender && citizen.hairStyle) {
      return {
        gender: citizen.gender,
        skinTone: citizen.skinTone || '#fbb77a',
        hairColor: citizen.hairColor || '#1e293b',
        hairStyle: citizen.hairStyle
      };
    }
    if (citizen.isPlayer) {
      const prof = PlayerProfileManager.getProfile();
      if (prof?.appearance) {
        return {
          gender: prof.appearance.gender || 'F',
          skinTone: prof.appearance.skinTone || '#fbb77a',
          hairColor: prof.appearance.hairColor || '#1e293b',
          hairStyle: prof.appearance.hairStyle || 'ponytail'
        };
      }
    }
  }

  const name = typeof citizen === 'string' ? citizen : (citizen?.name || 'Citizen');
  const isChild = Boolean(citizen?.isChild);
  const isElder = Boolean(citizen?.isElder);
  const isPlayer = Boolean(citizen?.isPlayer);

  // Deterministic 32-bit integer hash from citizen name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const posHash = Math.abs(hash);

  // Canonical Solarpunk pioneer female & male names
  const firstName = name.trim().split(' ')[0].toLowerCase();
  const femaleNames = new Set([
    'maya', 'amina', 'elena', 'chloe', 'nia', 'ingrid', 'zara', 'sofia',
    'freja', 'ananya', 'olga', 'fatima', 'lucia', 'evelyn', 'clara', 'sora',
    'tara', 'anna', 'laura', 'giulia', 'maria', 'sara', 'alice', 'emma', 'eva'
  ]);
  const maleNames = new Set([
    'dante', 'marcus', 'tariq', 'kaelen', 'siddharth', 'hiroshi', 'mateo',
    'lucas', 'liam', 'youssef', 'giacomo', 'arthur', 'kenji', 'bao', 'dmitri',
    'leo', 'john', 'marco'
  ]);

  let gender = 'M';
  if (femaleNames.has(firstName)) gender = 'F';
  else if (maleNames.has(firstName)) gender = 'M';
  else gender = (posHash % 2 === 0) ? 'F' : 'M';

  // Biocultural diversity of human skin tones
  const skinTones = [
    '#fed7aa', // Light peach
    '#fcd34d', // Warm beige / sandy
    '#fbb77a', // Golden olive
    '#d97706', // Caramel / Tan
    '#92400e', // Deep bronze
    '#78350f'  // Rich espresso
  ];
  const skinTone = isPlayer ? '#fed7aa' : skinTones[(posHash >> 2) % skinTones.length];

  // Natural hair colors
  const hairColors = [
    '#1e293b', // Jet Black
    '#3b1d11', // Dark Brown
    '#78350f', // Chestnut Brown
    '#d97706', // Golden / Honey Blonde
    '#9a3412', // Auburn / Copper Red
    '#0f172a'  // Midnight Black
  ];
  let hairColor = hairColors[(posHash >> 4) % hairColors.length];
  if (isElder) hairColor = (posHash % 2 === 0) ? '#e2e8f0' : '#cbd5e1';

  // Varied recognizable hairstyles
  let hairStyle = 'short';
  if (isChild) {
    hairStyle = gender === 'F' ? 'pigtails' : 'messy';
  } else if (isElder) {
    hairStyle = gender === 'F' ? 'chignon' : 'receding';
  } else if (gender === 'F') {
    const fStyles = ['ponytail', 'long', 'bob', 'bun'];
    hairStyle = fStyles[(posHash >> 6) % fStyles.length];
  } else {
    const mStyles = ['short', 'messy', 'fade', 'beard'];
    hairStyle = mStyles[(posHash >> 6) % mStyles.length];
  }

  return { gender, skinTone, hairColor, hairStyle };
}
