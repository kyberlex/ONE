/**
 * Autonomous Working Robots & Cybernetic Machinery Manager (Agent SIM-4 / SIM-5)
 * Brings the FabLab robotics tech-tree to life directly on the living 2D canvas:
 * 1. Autonomous Agro-Rover (Weeding, seeding, and soil sensing)
 * 2. Smart Aeroponic Mist Drone (Quadcopter micro-misting & telemetry)
 * 3. SCADA Microgrid Auto-Balancer (Tracked solar crawler & cell balancing)
 * 4. Common House Sanitization Droid (UV-C disinfection & boulevard patrol)
 * 5. FabLab Circular Sorter Cobot (Articulated scrap shredding & filament spooling arm)
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

export class RobotManager {
  constructor(renderer) {
    this.renderer = renderer;
    this.sim = renderer.sim;
    this.robots = [];
  }

  /**
   * Synchronizes active robot instances with node.robots state
   */
  syncRobots() {
    if (!this.sim?.node?.robots) return;
    const nodeRobots = this.sim.node.robots;
    const desired = [];

    // 1. farmRover (Autonomous Agro-Rover)
    const roverCount = nodeRobots.farmRover?.count || 0;
    for (let i = 0; i < roverCount; i++) {
      desired.push({
        type: 'farmRover',
        index: i,
        name: roverCount > 1 ? `Agro-Rover Unit #${i + 1}` : 'Autonomous Agro-Rover Mark II',
        icon: '🚜',
        domain: 'agriculture',
        hoursCancelled: nodeRobots.farmRover.hoursCancelled || 4,
        taskDesc: 'Autonomous Weeding, Seeding & Aeroponic Bed Management',
        radius: 20
      });
    }

    // 2. esp32Valves (Smart Aeroponic Mist Drone)
    const droneCount = nodeRobots.esp32Valves?.count || 0;
    for (let i = 0; i < droneCount; i++) {
      desired.push({
        type: 'esp32Valves',
        index: i,
        name: droneCount > 1 ? `Agro-Drone Scout #${i + 1}` : 'ESP32 Smart Aeroponic Drone',
        icon: '🛸',
        domain: 'agriculture',
        hoursCancelled: nodeRobots.esp32Valves.hoursCancelled || 2,
        taskDesc: 'Soil Moisture Telemetry & Ultrasonic Micro-Misting',
        radius: 18
      });
    }

    // 3. mpptOptimizer (SCADA Microgrid Crawler)
    const scadaCount = nodeRobots.mpptOptimizer?.count || 0;
    for (let i = 0; i < scadaCount; i++) {
      desired.push({
        type: 'mpptOptimizer',
        index: i,
        name: scadaCount > 1 ? `SCADA Balancer Bot #${i + 1}` : 'SCADA Microgrid Auto-Balancer',
        icon: '⚡',
        domain: 'facilities',
        hoursCancelled: nodeRobots.mpptOptimizer.hoursCancelled || 3,
        taskDesc: 'LiFePO4 Cell Telemetry & Solar Azimuth Balancer',
        radius: 18
      });
    }

    // 4. cleaningBot (Sanitization & Linen Droid)
    const cleanCount = nodeRobots.cleaningBot?.count || 0;
    for (let i = 0; i < cleanCount; i++) {
      desired.push({
        type: 'cleaningBot',
        index: i,
        name: cleanCount > 1 ? `Sanitization Droid #${i + 1}` : 'Common House Sanitization Bot',
        icon: '🧼',
        domain: 'care',
        hoursCancelled: nodeRobots.cleaningBot.hoursCancelled || 2,
        taskDesc: 'UV-C Surface Disinfection & Pathway Clearing',
        radius: 16
      });
    }

    // 5. cncSorter (FabLab Sorter Cobot Arm)
    const armCount = nodeRobots.cncSorter?.count || 0;
    for (let i = 0; i < armCount; i++) {
      desired.push({
        type: 'cncSorter',
        index: i,
        name: armCount > 1 ? `Cobot Sorter Arm #${i + 1}` : 'FabLab Shredder & Sorter Arm',
        icon: '🦾',
        domain: 'workshop',
        hoursCancelled: nodeRobots.cncSorter.hoursCancelled || 4,
        taskDesc: 'Circular Metal Scrap Shredding & Spooling',
        radius: 22
      });
    }

    // Reconcile instances preserving animation state
    const updated = [];
    for (const d of desired) {
      const id = `robot-${d.type}-${d.index}`;
      let existing = this.robots.find(r => r.id === id);
      if (!existing) {
        existing = this.createRobot(id, d);
      }
      updated.push(existing);
    }
    this.robots = updated;
  }

  createRobot(id, def) {
    const r = {
      id,
      type: def.type,
      name: def.name,
      icon: def.icon,
      domain: def.domain,
      hoursCancelled: def.hoursCancelled,
      taskDesc: def.taskDesc,
      radius: def.radius,
      isRobot: true,
      workPhase: Math.random() * 10,
      facingX: 1,
      speed: 1.2
    };

    if (def.type === 'farmRover') {
      r.x = 250 + def.index * 30;
      r.y = 55 + (def.index % 2) * 35;
      r.rowTargets = [
        { x: 240, y: 55 + def.index * 25 },
        { x: 345, y: 55 + def.index * 25 },
        { x: 345, y: 95 + def.index * 25 },
        { x: 240, y: 95 + def.index * 25 }
      ];
      r.currentTargetIdx = 0;
      r.targetX = r.rowTargets[0].x;
      r.targetY = r.rowTargets[0].y;
      r.pauseTicks = 0;
    } else if (def.type === 'esp32Valves') {
      r.flightAngle = def.index * Math.PI;
      r.x = 295 + Math.cos(r.flightAngle) * 45;
      r.y = 70 + Math.sin(r.flightAngle * 2) * 25;
      r.altitude = 20;
    } else if (def.type === 'mpptOptimizer') {
      r.x = -280 + def.index * 25;
      r.y = -140;
      r.rackTargets = [
        { x: -330, y: -160 + def.index * 20 },
        { x: -230, y: -160 + def.index * 20 },
        { x: -230, y: -120 + def.index * 20 },
        { x: -330, y: -120 + def.index * 20 }
      ];
      r.currentTargetIdx = 0;
      r.targetX = r.rackTargets[0].x;
      r.targetY = r.rackTargets[0].y;
      r.pauseTicks = 0;
    } else if (def.type === 'cleaningBot') {
      r.angle = (def.index * Math.PI * 2) / 3;
      r.x = Math.cos(r.angle) * 165;
      r.y = Math.sin(r.angle) * 165;
    } else if (def.type === 'cncSorter') {
      r.x = -245 + def.index * 20;
      r.y = 95;
      r.armAngle1 = 0;
      r.armAngle2 = 0;
    }

    return r;
  }

  /**
   * Update kinematics, waypoints, and particle emissions
   */
  update(dt, simSpeed) {
    this.syncRobots();

    for (const r of this.robots) {
      r.workPhase += dt * (simSpeed === 0 ? 0.4 : Math.max(1, simSpeed * 1.5));

      if (r.type === 'farmRover') {
        if (simSpeed > 0) {
          if (r.pauseTicks > 0) {
            r.pauseTicks -= simSpeed;
            // Emit leaf/soil particle when active
            if (Math.random() < 0.18 && this.renderer.particles.length < 120) {
              this.renderer.particles.push({
                x: r.x + r.facingX * 12,
                y: r.y + 4,
                vx: (Math.random() - 0.5) * 0.8,
                vy: -Math.random() * 0.8,
                life: 18,
                maxLife: 18,
                color: '#34d399',
                size: 2,
                type: 'weed_leaf'
              });
            }
          } else {
            const dx = r.targetX - r.x;
            const dy = r.targetY - r.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 3 * simSpeed) {
              r.pauseTicks = Math.floor(60 / Math.max(1, simSpeed));
              r.currentTargetIdx = (r.currentTargetIdx + 1) % r.rowTargets.length;
              r.targetX = r.rowTargets[r.currentTargetIdx].x;
              r.targetY = r.rowTargets[r.currentTargetIdx].y;
            } else {
              r.facingX = dx >= 0 ? 1 : -1;
              r.x += (dx / dist) * r.speed * simSpeed;
              r.y += (dy / dist) * r.speed * simSpeed;
            }
          }
        }
      } else if (r.type === 'esp32Valves') {
        // Agro-drone elliptical flight path
        r.flightAngle += 0.022 * (simSpeed === 0 ? 0.2 : simSpeed);
        r.x = 295 + Math.cos(r.flightAngle) * 45;
        r.y = 70 + Math.sin(r.flightAngle * 2) * 25;
        r.altitude = 20 + Math.sin(r.workPhase * 3) * 4;

        // Periodic micro-misting aerosol spray
        if (simSpeed > 0 && Math.sin(r.workPhase * 2) > 0.4 && this.renderer.particles.length < 120) {
          if (Math.random() < 0.35) {
            this.renderer.particles.push({
              x: r.x + (Math.random() - 0.5) * 10,
              y: r.y + 6,
              vx: (Math.random() - 0.5) * 0.5,
              vy: Math.random() * 1.5 + 0.5,
              life: 25,
              maxLife: 25,
              color: 'rgba(186, 230, 253, 0.7)',
              size: 2.2,
              type: 'mist_droplet'
            });
          }
        }
      } else if (r.type === 'mpptOptimizer') {
        // SCADA Crawler patrols between solar rack junction boxes
        if (simSpeed > 0) {
          if (r.pauseTicks > 0) {
            r.pauseTicks -= simSpeed;
          } else {
            const dx = r.targetX - r.x;
            const dy = r.targetY - r.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 3 * simSpeed) {
              r.pauseTicks = Math.floor(70 / Math.max(1, simSpeed));
              r.currentTargetIdx = (r.currentTargetIdx + 1) % r.rackTargets.length;
              r.targetX = r.rackTargets[r.currentTargetIdx].x;
              r.targetY = r.rackTargets[r.currentTargetIdx].y;
            } else {
              r.facingX = dx >= 0 ? 1 : -1;
              r.x += (dx / dist) * 0.8 * simSpeed;
              r.y += (dy / dist) * 0.8 * simSpeed;
            }
          }
        }
      } else if (r.type === 'cleaningBot') {
        // Sanitizer Droid follows the inner circular boulevard
        if (simSpeed > 0) {
          r.angle += 0.007 * simSpeed;
          r.x = Math.cos(r.angle) * 165;
          r.y = Math.sin(r.angle) * 165;
          r.facingX = Math.cos(r.angle + Math.PI / 2) >= 0 ? 1 : -1;
        }
      } else if (r.type === 'cncSorter') {
        // Articulated robotic cobot arm rotation
        r.armAngle1 = Math.sin(r.workPhase * 1.4) * 0.65;
        r.armAngle2 = Math.cos(r.workPhase * 1.4) * 0.45;
        if (simSpeed > 0 && Math.random() < 0.08 && this.renderer.particles.length < 120) {
          this.renderer.particles.push({
            x: r.x + Math.sin(r.armAngle1) * 20,
            y: r.y - 12 + Math.cos(r.armAngle2) * 10,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -Math.random() * 1.8,
            life: 14,
            maxLife: 14,
            color: '#fbbf24',
            size: 2,
            type: 'spark'
          });
        }
      }
    }
  }

  /**
   * Raycast hit detection for robots
   */
  findRobotAt(x, y) {
    for (const r of this.robots) {
      const dist = Math.hypot(x - r.x, y - r.y);
      if (dist <= (r.radius || 18)) return r;
    }
    return null;
  }

  /**
   * Master render method for all robots
   */
  render(ctx, isNight) {
    for (const r of this.robots) {
      ctx.save();
      ctx.translate(r.x, r.y);

      // Render hover reticle if hovered
      if (this.renderer.hoveredEntity === r) {
        ctx.save();
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, r.radius + 4, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(34, 211, 238, 0.15)';
        ctx.beginPath();
        ctx.arc(0, 0, r.radius + 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (r.type === 'farmRover') {
        this.renderFarmRover(ctx, r, isNight);
      } else if (r.type === 'esp32Valves') {
        this.renderAgroDrone(ctx, r, isNight);
      } else if (r.type === 'mpptOptimizer') {
        this.renderMpptOptimizer(ctx, r, isNight);
      } else if (r.type === 'cleaningBot') {
        this.renderCleaningBot(ctx, r, isNight);
      } else if (r.type === 'cncSorter') {
        this.renderCncSorter(ctx, r, isNight);
      }

      // Cybernetic telemetry speech bubble
      const chatBubble = this.renderer.speechBubbles?.get(r.name);
      if (chatBubble && Date.now() < chatBubble.expiresAt) {
        const text = chatBubble.text;
        const now = Date.now();
        const alpha = Math.min(1.0, (chatBubble.expiresAt - now) / 500);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = '500 10px system-ui, sans-serif';
        const maxLen = 42;
        const displayText = text.length > maxLen ? text.slice(0, maxLen - 1) + '…' : text;
        const textWidth = ctx.measureText(displayText).width;
        const bw = Math.max(30, textWidth + 16);
        const bh = 20;
        const bubbleY = -r.radius - 24;
        const bx = -bw / 2;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(bx, bubbleY, bw, bh, 5);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-3, bubbleY + bh);
        ctx.lineTo(0, bubbleY + bh + 4);
        ctx.lineTo(3, bubbleY + bh);
        ctx.closePath();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#67e8f9';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(displayText, 0, bubbleY + bh / 2);
        ctx.restore();
      }

      ctx.restore();
    }
  }

  // -------------------------------------------------------------
  // 1. AUTONOMOUS AGRO-ROVER
  // -------------------------------------------------------------
  renderFarmRover(ctx, r, isNight) {
    const dir = r.facingX;

    // Soft ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 6, 15, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4 Wheels
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    // Front and rear wheels
    [-11, 11].forEach(wx => {
      [-6, 6].forEach(wy => {
        ctx.beginPath();
        ctx.roundRect(wx - 3, wy - 3, 6, 6, 2);
        ctx.fill();
        ctx.stroke();

        // Hubcap bolt
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(wx, wy, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1e293b';
      });
    });

    // Rover Chassis (Solarpunk Forest Green)
    ctx.fillStyle = '#065f46';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(-12, -7, 24, 14, 4);
    ctx.fill();
    ctx.stroke();

    // Top Solar PV Panel
    const solarGrad = ctx.createLinearGradient(-8, -5, 8, 5);
    solarGrad.addColorStop(0, '#0284c7');
    solarGrad.addColorStop(0.5, '#38bdf8');
    solarGrad.addColorStop(1, '#0369a1');
    ctx.fillStyle = solarGrad;
    ctx.beginPath();
    ctx.roundRect(-8, -4, 16, 8, 2);
    ctx.fill();

    // Front Laser Scanner Cone
    const scanAngle = Math.sin(r.workPhase * 3) * 0.35;
    ctx.save();
    ctx.translate(dir * 12, 0);
    ctx.rotate(scanAngle);
    const laserGrad = ctx.createRadialGradient(0, 0, 1, dir * 28, 0, 32);
    laserGrad.addColorStop(0, 'rgba(52, 211, 153, 0.45)');
    laserGrad.addColorStop(1, 'rgba(52, 211, 153, 0)');
    ctx.fillStyle = laserGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(dir * 28, -12);
    ctx.lineTo(dir * 28, 12);
    ctx.closePath();
    ctx.fill();

    // Laser diode
    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Night Headlight Pool
    if (isNight) {
      const lightGrad = ctx.createRadialGradient(dir * 12, 0, 2, dir * 38, 0, 42);
      lightGrad.addColorStop(0, 'rgba(253, 230, 138, 0.6)');
      lightGrad.addColorStop(1, 'rgba(253, 230, 138, 0)');
      ctx.fillStyle = lightGrad;
      ctx.beginPath();
      ctx.moveTo(dir * 12, 0);
      ctx.lineTo(dir * 38, -16);
      ctx.lineTo(dir * 38, 16);
      ctx.closePath();
      ctx.fill();
    }
  }

  // -------------------------------------------------------------
  // 2. SMART AEROPONIC MIST DRONE (QUADCOPTER)
  // -------------------------------------------------------------
  renderAgroDrone(ctx, r, isNight) {
    const alt = r.altitude || 20;

    // Ground Drop Shadow (scales with altitude)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.beginPath();
    ctx.ellipse(0, alt, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw elevated drone
    ctx.save();
    ctx.translate(0, -alt);

    // Conical Micro-Misting Spray (downward toward crops)
    if (Math.sin(r.workPhase * 2) > 0.2) {
      const mistGrad = ctx.createLinearGradient(0, 6, 0, alt);
      mistGrad.addColorStop(0, 'rgba(186, 230, 253, 0.45)');
      mistGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.2)');
      mistGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = mistGrad;
      ctx.beginPath();
      ctx.moveTo(0, 4);
      ctx.lineTo(-14, alt);
      ctx.lineTo(14, alt);
      ctx.closePath();
      ctx.fill();
    }

    // Carbon Fiber X-Arms
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-11, -9);
    ctx.lineTo(11, 9);
    ctx.moveTo(11, -9);
    ctx.lineTo(-11, 9);
    ctx.stroke();

    // 4 Spinning Rotor Discs
    const rotorAngles = [0, 1, 2, 3].map(i => r.workPhase * 18 + i * 1.5);
    const motorOffsets = [
      { x: -11, y: -9 },
      { x: 11, y: -9 },
      { x: 11, y: 9 },
      { x: -11, y: 9 }
    ];

    motorOffsets.forEach((m, idx) => {
      // Motor hub
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(m.x, m.y, 2, 0, Math.PI * 2);
      ctx.fill();

      // Spinning rotor blur disk
      ctx.fillStyle = 'rgba(224, 242, 254, 0.45)';
      ctx.beginPath();
      ctx.arc(m.x, m.y, 7, 0, Math.PI * 2);
      ctx.fill();

      // Blade line
      const rot = rotorAngles[idx];
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(m.x - Math.cos(rot) * 6, m.y - Math.sin(rot) * 6);
      ctx.lineTo(m.x + Math.cos(rot) * 6, m.y + Math.sin(rot) * 6);
      ctx.stroke();
    });

    // Central Dome (ESP32 Controller)
    const bodyGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, 6);
    bodyGrad.addColorStop(0, '#06b6d4');
    bodyGrad.addColorStop(1, '#0891b2');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    // Pulsing Strobe Beacon
    const strobeAlpha = 0.5 + Math.sin(r.workPhase * 8) * 0.5;
    ctx.fillStyle = `rgba(56, 189, 248, ${strobeAlpha})`;
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // -------------------------------------------------------------
  // 3. SCADA MICROGRID AUTO-BALANCER (CRAWLER)
  // -------------------------------------------------------------
  renderMpptOptimizer(ctx, r, isNight) {
    const dir = r.facingX;

    // Track Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 5, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dual Rubber Caterpillar Tracks
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    [-5, 5].forEach(ty => {
      ctx.beginPath();
      ctx.roundRect(-12, ty - 2.5, 24, 5, 2.5);
      ctx.fill();
      ctx.stroke();

      // Track link teeth
      for (let tx = -9; tx <= 9; tx += 4.5) {
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(tx, ty, 1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#1e293b';
    });

    // Chassis (Industrial Amber / SCADA Shield)
    ctx.fillStyle = '#d97706';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-9, -5, 18, 10, 3);
    ctx.fill();
    ctx.stroke();

    // Battery Cell Segment Indicator (3 LEDs)
    [-3.5, 0, 3.5].forEach(bx => {
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(bx, -2, 1, 0, Math.PI * 2);
      ctx.fill();
    });

    // Rotating 360° LiDAR / Thermal Scanner Turret
    const turretAngle = r.workPhase * 3;
    ctx.save();
    ctx.translate(0, 0);
    ctx.rotate(turretAngle);

    // Laser sweeping beam arc
    const arcGrad = ctx.createRadialGradient(0, 0, 2, 22, 0, 26);
    arcGrad.addColorStop(0, 'rgba(245, 158, 11, 0.45)');
    arcGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = arcGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(24, -8);
    ctx.lineTo(24, 8);
    ctx.closePath();
    ctx.fill();

    // Turret center
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(1.5, 0, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // -------------------------------------------------------------
  // 4. COMMON HOUSE SANITIZATION & LINEN DROID
  // -------------------------------------------------------------
  renderCleaningBot(ctx, r, isNight) {
    // UV-C Ground Sterilizer Glow underneath
    const uvGrad = ctx.createRadialGradient(0, 0, 3, 0, 0, 16);
    uvGrad.addColorStop(0, 'rgba(168, 85, 247, 0.55)');
    uvGrad.addColorStop(0.6, 'rgba(192, 132, 252, 0.2)');
    uvGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
    ctx.fillStyle = uvGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();

    // Spherical Pearl Dome
    const domeGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, 10);
    domeGrad.addColorStop(0, '#ffffff');
    domeGrad.addColorStop(0.7, '#f1f5f9');
    domeGrad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = domeGrad;
    ctx.strokeStyle = '#0d9488';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Turquoise Bumper Ring
    ctx.strokeStyle = '#14b8a6';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
    ctx.stroke();

    // OLED Screen Visor with Friendly Cybernetic Eyes
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.roundRect(-5.5, -3, 11, 6, 2.5);
    ctx.fill();

    // Expressive animated digital face
    ctx.fillStyle = '#22d3ee';
    ctx.font = 'bold 5px system-ui, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const isBlinking = Math.sin(r.workPhase * 4) > 0.85;
    ctx.fillText(isBlinking ? '- ‿ -' : '• ‿ •', 0, 0.5);
  }

  // -------------------------------------------------------------
  // 5. FABLAB SHREDDER & SORTER COBOT ARM
  // -------------------------------------------------------------
  renderCncSorter(ctx, r, isNight) {
    // Pedestal Base
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Base bolts
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 2) {
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * 6, Math.sin(angle) * 6, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Kinematic Arm
    const a1 = r.armAngle1 || 0;
    const a2 = r.armAngle2 || 0;

    // Segment 1 (Orange Bicep)
    const len1 = 18;
    const j1x = Math.sin(a1) * len1;
    const j1y = -Math.cos(a1) * len1;

    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(j1x, j1y);
    ctx.stroke();

    // Pivot Joint 1
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(j1x, j1y, 3, 0, Math.PI * 2);
    ctx.fill();

    // Segment 2 (Titanium Forearm)
    const len2 = 14;
    const j2x = j1x + Math.sin(a1 + a2) * len2;
    const j2y = j1y - Math.cos(a1 + a2) * len2;

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(j1x, j1y);
    ctx.lineTo(j2x, j2y);
    ctx.stroke();

    // End-Effector Gripper with Metal Scrap
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(j2x, j2y, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Clamped Scrap Pellet
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(j2x + Math.sin(a1 + a2) * 4, j2y - Math.cos(a1 + a2) * 4, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}
