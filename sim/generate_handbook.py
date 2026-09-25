#!/usr/bin/env python3
"""
O-ASIS Dual-Track: Player Field Manual & Survival Handbook Generator
Compiles a gamer-centric, tactical survival handbook explaining player objectives,
the core survival loop, failure states, screen-by-screen controls, and build orders.

Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later
"""

import os
import sys
import base64
import subprocess
from io import BytesIO
from PIL import Image
import fitz  # PyMuPDF

def load_and_crop_b64(path, crop_box=None):
    im = Image.open(path)
    if crop_box:
        im = im.crop(crop_box)
    buf = BytesIO()
    im.save(buf, format='PNG', optimize=True)
    return base64.b64encode(buf.getvalue()).decode('utf-8')

def build_handbook_html():
    assets_dir = os.path.join(os.path.dirname(__file__), 'handbook_assets')
    
    # 6 Real In-Game UI Screenshots with smart crops for high legibility
    img_settlement = load_and_crop_b64(os.path.join(assets_dir, '01_settlement_village.png'), (0, 0, 1600, 963))
    img_world_map = load_and_crop_b64(os.path.join(assets_dir, '02_world_map.png'), (0, 0, 1600, 963))
    img_council = load_and_crop_b64(os.path.join(assets_dir, '03_sortition_council.png'), (350, 160, 1250, 820))
    img_chores = load_and_crop_b64(os.path.join(assets_dir, '04_chores_maintenance.png'), (340, 60, 1260, 890))
    img_housing = load_and_crop_b64(os.path.join(assets_dir, '05_housing_usufruct.png'), (340, 120, 1260, 840))
    img_robots = load_and_crop_b64(os.path.join(assets_dir, '06_dualtrack_robots.png'), (350, 60, 1250, 880))

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>O-ASIS Dual-Track: Player Field Manual &amp; Survival Handbook</title>
<style>
  @page {{
    size: A4 portrait;
    margin: 10mm 13mm 10mm 13mm;
  }}

  * {{
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }}

  body {{
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background-color: #070c16;
    color: #e2e8f0;
    font-size: 8.9pt;
    line-height: 1.38;
  }}

  /* Exact A4 Single Page Fit */
  .page {{
    page-break-after: always;
    break-after: page;
    height: 277mm;
    max-height: 277mm;
    box-sizing: border-box;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    padding: 0;
  }}

  .page-last {{
    page-break-after: avoid;
    break-after: avoid;
  }}

  /* Running Header & Footer */
  .doc-header {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(16, 185, 129, 0.3);
    padding-bottom: 4px;
    margin-bottom: 6px;
    font-size: 7.5pt;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: #94a3b8;
  }}

  .doc-header .brand {{
    color: #10b981;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 5px;
  }}

  .doc-footer {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(148, 163, 184, 0.2);
    padding-top: 4px;
    margin-top: 6px;
    font-size: 7.5pt;
    color: #64748b;
  }}

  /* Typography */
  h1, h2, h3, h4 {{
    color: #f8fafc;
    margin: 0 0 4px 0;
    font-weight: 700;
  }}

  h2 {{
    font-size: 13pt;
    color: #38bdf8;
    border-left: 3.5px solid #10b981;
    padding-left: 8px;
    margin-bottom: 5px;
    letter-spacing: -0.2px;
  }}

  h3 {{
    font-size: 9.8pt;
    color: #f1f5f9;
    margin-top: 6px;
    margin-bottom: 3px;
  }}

  p {{
    margin: 0 0 5px 0;
    color: #cbd5e1;
    text-align: justify;
  }}

  ul {{
    margin: 0 0 5px 0;
    padding-left: 16px;
    color: #cbd5e1;
  }}

  ol {{
    margin: 0 0 5px 0;
    padding-left: 16px;
    color: #cbd5e1;
  }}

  li {{
    margin-bottom: 2px;
  }}

  strong {{
    color: #f8fafc;
  }}

  /* Cover Styling */
  .cover-container {{
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    padding: 4px 0;
  }}

  .cover-top {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #10b981;
    padding-bottom: 8px;
  }}

  .cover-badge {{
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid #10b981;
    color: #10b981;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 8.2pt;
    font-weight: 700;
    letter-spacing: 1.2px;
  }}

  .cover-hero {{
    margin: 10px 0 8px 0;
  }}

  .cover-title {{
    font-size: 25pt;
    font-weight: 900;
    line-height: 1.1;
    letter-spacing: -0.5px;
    margin-bottom: 4px;
    background: linear-gradient(135deg, #10b981 0%, #38bdf8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }}

  .cover-sub {{
    font-size: 12pt;
    color: #94a3b8;
    font-weight: 400;
    margin-bottom: 10px;
    line-height: 1.25;
  }}

  .cover-summary-box {{
    background: rgba(30, 41, 59, 0.65);
    border: 1px solid rgba(56, 189, 248, 0.35);
    border-radius: 8px;
    padding: 10px 14px;
    margin-bottom: 10px;
  }}

  .cover-pillars-row {{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 7px;
    margin-bottom: 10px;
  }}

  .pillar-chip {{
    background: rgba(15, 23, 42, 0.85);
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 6px;
    padding: 5px 7px;
    text-align: center;
  }}

  .pillar-chip .icon {{
    font-size: 13pt;
    display: block;
    margin-bottom: 1px;
  }}

  .pillar-chip .label {{
    font-size: 7pt;
    font-weight: 700;
    text-transform: uppercase;
    color: #38bdf8;
    letter-spacing: 0.5px;
  }}

  .cover-toc-box {{
    background: rgba(15, 23, 42, 0.75);
    border: 1px solid rgba(16, 185, 129, 0.35);
    border-radius: 8px;
    padding: 10px 14px;
    margin-bottom: 10px;
  }}

  .toc-grid {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px 18px;
    font-size: 8.2pt;
    margin-top: 5px;
  }}

  .toc-item {{
    display: flex;
    justify-content: space-between;
    border-bottom: 1px dashed rgba(148, 163, 184, 0.2);
    padding-bottom: 2px;
  }}

  .toc-item span.title {{
    color: #e2e8f0;
    font-weight: 500;
  }}

  .toc-item span.page-num {{
    color: #10b981;
    font-weight: 700;
  }}

  .cover-objective-box {{
    background: rgba(16, 185, 129, 0.1);
    border-left: 3.5px solid #10b981;
    padding: 7px 11px;
    border-radius: 6px;
    font-size: 8pt;
    color: #cbd5e1;
    margin-bottom: 8px;
    line-height: 1.35;
  }}

  .cover-meta-grid {{
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    border-top: 1px solid rgba(148, 163, 184, 0.25);
    padding-top: 6px;
    font-size: 7.5pt;
  }}

  .meta-col label {{
    display: block;
    color: #64748b;
    font-size: 6.5pt;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 1px;
  }}

  .meta-col value {{
    color: #f1f5f9;
    font-weight: 600;
  }}

  /* Content Wrap */
  .content-wrap {{
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }}

  /* Screenshot Frame */
  .screenshot-frame {{
    background: #0b101d;
    border: 1px solid rgba(16, 185, 129, 0.4);
    border-radius: 7px;
    overflow: hidden;
    margin: 5px 0 2px 0;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
    text-align: center;
  }}

  .screenshot-frame img {{
    max-height: 104mm;
    width: 100%;
    object-fit: contain;
    display: block;
    margin: 0 auto;
  }}

  .figure-caption {{
    font-size: 7.4pt;
    color: #94a3b8;
    text-align: center;
    font-style: italic;
    margin-bottom: 5px;
    line-height: 1.25;
  }}

  .figure-caption strong {{
    color: #38bdf8;
    font-style: normal;
  }}

  /* Callout Alert Boxes */
  .callout {{
    border-radius: 6px;
    padding: 5px 9px;
    margin: 4px 0;
    font-size: 8.1pt;
    line-height: 1.32;
  }}

  .callout-emerald {{
    background: rgba(16, 185, 129, 0.09);
    border-left: 3px solid #10b981;
  }}

  .callout-cyan {{
    background: rgba(56, 189, 248, 0.09);
    border-left: 3px solid #38bdf8;
  }}

  .callout-amber {{
    background: rgba(245, 158, 11, 0.09);
    border-left: 3px solid #f59e0b;
  }}

  .callout-rose {{
    background: rgba(244, 63, 94, 0.09);
    border-left: 3px solid #f43f5e;
  }}

  .callout-title {{
    font-weight: 700;
    font-size: 8.2pt;
    margin-bottom: 1px;
    display: flex;
    align-items: center;
    gap: 4px;
  }}

  .callout-emerald .callout-title {{ color: #10b981; }}
  .callout-cyan .callout-title {{ color: #38bdf8; }}
  .callout-amber .callout-title {{ color: #f59e0b; }}
  .callout-rose .callout-title {{ color: #f43f5e; }}

  /* Metrics Grid */
  .metrics-grid {{
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
    margin: 4px 0;
  }}

  .metric-card {{
    background: rgba(30, 41, 59, 0.45);
    border: 1px solid rgba(148, 163, 184, 0.15);
    border-radius: 6px;
    padding: 5px 8px;
  }}

  .metric-card-header {{
    display: flex;
    justify-content: space-between;
    font-size: 8.2pt;
    font-weight: 700;
    margin-bottom: 1px;
  }}

  .metric-card-desc {{
    font-size: 7.5pt;
    color: #94a3b8;
    line-height: 1.25;
    margin: 0;
  }}

  /* Two Column Layout */
  .two-col {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 4px;
  }}

  /* Tables */
  table.handbook-table {{
    width: 100%;
    border-collapse: collapse;
    margin: 4px 0 5px 0;
    font-size: 7.8pt;
  }}

  table.handbook-table th {{
    background: rgba(16, 185, 129, 0.16);
    color: #f8fafc;
    text-align: left;
    padding: 3.5px 6px;
    font-weight: 600;
    border-bottom: 1.5px solid #10b981;
  }}

  table.handbook-table td {{
    padding: 3px 6px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    color: #cbd5e1;
  }}

  table.handbook-table tr:nth-child(even) td {{
    background: rgba(30, 41, 59, 0.25);
  }}

  .badge-tag {{
    display: inline-block;
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 6.6pt;
    font-weight: 700;
  }}
  .badge-green {{ background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid #10b981; }}
  .badge-blue {{ background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid #38bdf8; }}
  .badge-gold {{ background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid #fbbf24; }}
  .badge-red {{ background: rgba(244, 63, 94, 0.2); color: #f43f5e; border: 1px solid #f43f5e; }}
</style>
</head>
<body>

<!-- ========================================================================= -->
<!-- PAGE 1: COVER & TABLE OF CONTENTS                                         -->
<!-- ========================================================================= -->
<div class="page">
  <div class="doc-header">
    <div class="brand"><span>🌱</span> O.N.E. DUAL-TRACK ARCHITECTURE</div>
    <div>PLAYER FIELD MANUAL &amp; SURVIVAL HANDBOOK</div>
  </div>

  <div class="content-wrap cover-container">
    <div class="cover-top">
      <div>
        <div class="cover-badge">PLAYER OBJECTIVES &amp; TACTICAL STRATEGY</div>
      </div>
      <div style="text-align: right; font-size: 8pt; color: #94a3b8;">
        <span>Game Type:</span> <strong style="color: #f8fafc;">Living Thermodynamic MMO</strong><br>
        <span>Dual-Track:</span> <strong style="color: #10b981;">Unlocks Real 3D CAD &amp; YAML</strong>
      </div>
    </div>

    <div class="cover-hero">
      <div class="cover-title">
        O-ASIS DUAL-TRACK<br>
        <span style="font-size: 16pt; font-weight: 400; color: #cbd5e1;">Pioneer Survival Handbook &amp; Player Guide</span>
      </div>
      <div class="cover-sub">
        What to do, how to survive, how to liberate your citizens from manual chores, and how to defend against the Legacy Engine
      </div>

      <div class="cover-objective-box">
        🎯 <strong>YOUR ULTIMATE MISSION AS A PIONEER:</strong><br>
        You are the founding architect of an autonomous, zero-money bioclimatic settlement. Your goal is to <strong>keep your node alive against ecological shocks and systemic debt strikes</strong>, eliminate 100% of dependence on external corporate utilities, automate manual chores using FabLab robots to maximize citizen leisure time (18+ hrs/day), and federate with planetary nodes until the entire bioregion is emancipated.
      </div>

      <div class="cover-pillars-row">
        <div class="pillar-chip">
          <span class="icon">⚡</span>
          <span class="label">1. Defend the 4 Floors</span>
        </div>
        <div class="pillar-chip">
          <span class="icon">🔧</span>
          <span class="label">2. Fix Machine Wear</span>
        </div>
        <div class="pillar-chip">
          <span class="icon">🤖</span>
          <span class="label">3. Build Robots</span>
        </div>
        <div class="pillar-chip">
          <span class="icon">🏛️</span>
          <span class="label">4. Sortition Votes</span>
        </div>
      </div>

      <div class="cover-toc-box">
        <div style="font-weight: 700; color: #38bdf8; font-size: 8.5pt; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 2px;">
          Handbook Navigation
        </div>
        <div class="toc-grid">
          <div class="toc-item"><span class="title">1. What You Must Achieve &amp; The Survival Loop</span><span class="page-num">P. 2</span></div>
          <div class="toc-item"><span class="title">2. Settlement Screen: Reading the 4 Vital Signs</span><span class="page-num">P. 3</span></div>
          <div class="toc-item"><span class="title">3. Planetary Map: Choosing Bioregions &amp; Convoys</span><span class="page-num">P. 4</span></div>
          <div class="toc-item"><span class="title">4. Sortition Council: Voting on Civic Dilemmas</span><span class="page-num">P. 5</span></div>
          <div class="toc-item"><span class="title">5. Labor Management, Vocations &amp; Entropy</span><span class="page-num">P. 6</span></div>
          <div class="toc-item"><span class="title">6. Usufruct Housing &amp; Circular Furniture Depot</span><span class="page-num">P. 7</span></div>
          <div class="toc-item"><span class="title">7. Robot Tech Tree: Canceling Chores &amp; CAD STL</span><span class="page-num">P. 8</span></div>
          <div class="toc-item"><span class="title">8. First 7 Days Walkthrough, Hotkeys &amp; FAQ</span><span class="page-num">P. 9</span></div>
        </div>
      </div>

      <div class="cover-summary-box">
        <p style="margin: 0; font-size: 8.2pt; line-height: 1.35; color: #cbd5e1;">
          ⚠️ <strong>WHY PLAYERS FAIL:</strong> Settlements collapse when players neglect preventive maintenance (causing leaky water pipes and battery thermal runaway), let granary reserves fall below 15 days, or overwork citizens without building FabLab robots. This manual teaches you the exact tactical loop to prevent collapse.
        </p>
      </div>
    </div>

    <div class="cover-meta-grid">
      <div class="meta-col">
        <label>Author / Persona</label>
        <value>Kyberlex &lt;kyberlex@proton.me&gt;</value>
      </div>
      <div class="meta-col">
        <label>Engine Target</label>
        <value>github.com/kyberlex/one-dual-track</value>
      </div>
      <div class="meta-col">
        <label>License</label>
        <value>AGPL-3.0-or-later (100% Free)</value>
      </div>
    </div>
  </div>

  <div class="doc-footer">
    <div>O-ASIS Dual-Track • Living Thermodynamic Sandbox</div>
    <div>Page 1 of 9</div>
  </div>
</div>

<!-- ========================================================================= -->
<!-- PAGE 2: CHAPTER 1 - WHAT YOU MUST ACHIEVE & THE SURVIVAL LOOP             -->
<!-- ========================================================================= -->
<div class="page">
  <div class="doc-header">
    <div class="brand"><span>🌱</span> O.N.E. DUAL-TRACK ARCHITECTURE</div>
    <div>CHAPTER 1: OBJECTIVES, WIN/LOSS &amp; THE DAILY SURVIVAL LOOP</div>
  </div>

  <div class="content-wrap">
    <h2>1. What You Must Achieve: Win, Loss &amp; The Daily Loop</h2>
    <p>
      In O-ASIS Dual-Track, there is no artificial "You Win" popup because the simulation models a living world. Instead, your success is measured by **resilience, automation, and citizen freedom**:
    </p>

    <div class="two-col">
      <div class="callout callout-emerald">
        <div class="callout-title">🏆 YOUR THREE STRATEGIC VICTORIES</div>
        <ol style="margin: 0; padding-left: 14px; font-size: 7.8pt;">
          <li><strong>Energy &amp; Caloric Decoupling:</strong> Achieve 100% off-grid self-sufficiency where zero power or food is bought from predatory commercial networks.</li>
          <li><strong>The Leisure Breakthrough:</strong> Build enough FabLab robots to slash mandatory chores to under 1 hour/day, driving citizen morale above 95%.</li>
          <li><strong>Bioregional Tipping Point:</strong> Federate with neighboring nodes until 15–20% of the regional economy operates outside fiat debt systems.</li>
        </ol>
      </div>

      <div class="callout callout-rose">
        <div class="callout-title">☠️ HOW YOUR NODE CAN COLLAPSE</div>
        <ol style="margin: 0; padding-left: 14px; font-size: 7.8pt;">
          <li><strong>Thermodynamic Blackout:</strong> Battery bank drains to 0% during winter; water pumps and hydroponic aeroponics freeze and die.</li>
          <li><strong>Famine &amp; Attrition:</strong> Granary buffer empties; starving citizens suffer severe morale loss and defect to other settlements.</li>
          <li><strong>Legacy Foreclosure:</strong> Unmitigated legal vulnerability allows predatory bailiffs to seize workshop CNC mills and tractors.</li>
        </ol>
      </div>
    </div>

    <h3>The Core Gameplay Loop (What You Do Each Day)</h3>
    <p>
      Time progresses in discrete ticks (1 tick = 1 hour; 24 ticks = 1 day). Master this 4-step operational routine:
    </p>

    <table class="handbook-table">
      <thead>
        <tr>
          <th style="width: 18%;">Phase</th>
          <th style="width: 25%;">What to Check</th>
          <th>What You Must Do as a Player</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>1. Morning (06:00)</strong></td>
          <td>⚡ Energy Delta &amp; Cisterns</td>
          <td>Review overnight battery drain. If power is negative, throttle non-essential FabLab induction smelting and prioritize solar tracking.</td>
        </tr>
        <tr>
          <td><strong>2. Midday (12:00)</strong></td>
          <td>📋 Labor Roster &amp; Entropy</td>
          <td>Open Chores Hub (`[C]`). Verify that machinery durability is above 20%. Dispatch maintenance artisans to lubricate worn pumps.</td>
        </tr>
        <tr>
          <td><strong>3. Afternoon (16:00)</strong></td>
          <td>🤖 FabLab Robot Builds</td>
          <td>Open Tech Tree (`[T]`). If recycled stocks (Al, PETG, Wire) are available, craft the next robot to cancel permanent human labor slots.</td>
        </tr>
        <tr>
          <td><strong>4. Evening (20:00)</strong></td>
          <td>🏛️ Council Deliberation</td>
          <td>Open Sortition Council (`[A]`). Deliberate and vote on emerging community dilemmas or Legacy AI attacks using qualified majorities.</td>
        </tr>
      </tbody>
    </table>

    <h3>Your Opponent: The Legacy Engine AI (PvE Cooperative)</h3>
    <p>
      You do not fight other players. All human pioneers cooperate. Your single opponent is the **Legacy Engine AI**—an institutional storyteller that attacks systemic weak spots:
    </p>
    <ul>
      <li><strong>NPL Debt Strike:</strong> Claims an old bank mortgage on your land. <em>Counter:</em> Oppose legal trust defense (*Custodia Civilis*).</li>
      <li><strong>Grid Severing:</strong> Cuts external high-voltage ties during winter freezes. <em>Counter:</em> Island mode on LiFePO4 batteries.</li>
      <li><strong>Customs Blockade:</strong> Stops trade trucks. <em>Counter:</em> Reroute supplies through allied bioregional mesh routes.</li>
    </ul>
  </div>

  <div class="doc-footer">
    <div>O-ASIS Dual-Track • Living Thermodynamic Sandbox</div>
    <div>Page 2 of 9</div>
  </div>
</div>

<!-- ========================================================================= -->
<!-- PAGE 3: CHAPTER 2 - SETTLEMENT CANVAS & THE 4 THERMODYNAMIC METERS        -->
<!-- ========================================================================= -->
<div class="page">
  <div class="doc-header">
    <div class="brand"><span>🌱</span> O.N.E. DUAL-TRACK ARCHITECTURE</div>
    <div>CHAPTER 2: SETTLEMENT SCREEN: READING THE 4 VITAL SIGNS</div>
  </div>

  <div class="content-wrap">
    <h2>2. The Settlement Screen: Reading Your 4 Vital Signs</h2>
    <p>
      The Settlement Village View (`🏘️ Node`) is your operational cockpit. From here, you monitor village layout, track citizen movements, inspect buildings, and watch the **4 Top Conserved Resource Meters**.
    </p>

    <div class="screenshot-frame">
      <img src="data:image/png;base64,{img_settlement}" alt="Bioclimatic Settlement Village &amp; Solarpunk HUD" />
    </div>
    <div class="figure-caption">
      <strong>Figure 1:</strong> The Settlement Village View. Top HUD displays the 4 Vital Signs; center shows the Agora, modular hex-dwellings (#1–#28), and peripheral commons facilities (Solar, Rain Cistern, Aeroponics, FabLab).
    </div>

    <h3>How to Read &amp; Balance the 4 Vital Signs</h3>
    <p>
      If any of these 4 bars turn red, your settlement is in acute physical danger:
    </p>

    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-card-header" style="color: #fbbf24;">
          <span>⚡ Energy &amp; Power Buffer</span>
          <span style="font-size: 7.2pt; color: #10b981;">Target: &gt; 30% Overnight</span>
        </div>
        <p class="metric-card-desc">
          <strong>What it is:</strong> Stored LiFePO4 battery reserve (kWh) and real-time generation delta (kW).<br>
          <strong>Danger State:</strong> Negative delta during night drops buffer to 0%, shutting down water filters and greenhouse lighting.
        </p>
      </div>

      <div class="metric-card">
        <div class="metric-card-header" style="color: #38bdf8;">
          <span>💧 Water &amp; Cistern Reservoir</span>
          <span style="font-size: 7.2pt; color: #10b981;">Target: 65%+ Closed Loop</span>
        </div>
        <p class="metric-card-desc">
          <strong>What it is:</strong> Potable and agricultural water reserves in liters.<br>
          <strong>Danger State:</strong> If greywater reed-bed filtration drops below 50%, reserves drain 3x faster, forcing emergency water rationing.
        </p>
      </div>

      <div class="metric-card">
        <div class="metric-card-header" style="color: #4ade80;">
          <span>🥗 Food &amp; Granary Runway</span>
          <span style="font-size: 7.2pt; color: #10b981;">Target: &gt; 20 Days Runway</span>
        </div>
        <p class="metric-card-desc">
          <strong>What it is:</strong> Calorie buffer guaranteeing the 2,200 kcal/citizen/day floor.<br>
          <strong>Danger State:</strong> Under 10 days runway triggers panic; citizens prioritize emergency foraging over machine maintenance.
        </p>
      </div>

      <div class="metric-card">
        <div class="metric-card-header" style="color: #c084fc;">
          <span>⏳ Free Time &amp; Morale</span>
          <span style="font-size: 7.2pt; color: #10b981;">Target: &gt; 15h Free / &gt; 80%</span>
        </div>
        <p class="metric-card-desc">
          <strong>What it is:</strong> Uncoerced leisure hours per day and collective social cohesion.<br>
          <strong>Danger State:</strong> Forcing citizens into 6h+ chores drops morale below 50%, triggering depression and community fractures.
        </p>
      </div>
    </div>

    <div class="callout callout-cyan">
      <div class="callout-title">💡 Pro-Tip: Fast View Navigation</div>
      Use the **Discrete Zoom Bar** at the top right to zoom between `🌍 World`, `🏞️ Region`, `🏘️ Node`, and `🏢 Building`. Press `[Space]` to pause time when making complex chore adjustments.
    </div>
  </div>

  <div class="doc-footer">
    <div>O-ASIS Dual-Track • Living Thermodynamic Sandbox</div>
    <div>Page 3 of 9</div>
  </div>
</div>

<!-- ========================================================================= -->
<!-- PAGE 4: CHAPTER 3 - PLANETARY MAP & QUORUM FOUNDING                       -->
<!-- ========================================================================= -->
<div class="page">
  <div class="doc-header">
    <div class="brand"><span>🌱</span> O.N.E. DUAL-TRACK ARCHITECTURE</div>
    <div>CHAPTER 3: PLANETARY MAP: CHOOSING BIOREGIONS &amp; CONVOYS</div>
  </div>

  <div class="content-wrap">
    <h2>3. Planetary Map: Choosing Bioregions &amp; Convoys</h2>
    <p>
      Pressing `[M]` or clicking **🌍 World** switches to the planetary Earth map. The world is a living mesh of bioregions: you can inspect existing settlements, plant new founder beacons, and dispatch barter convoys.
    </p>

    <div class="screenshot-frame">
      <img src="data:image/png;base64,{img_world_map}" alt="Planetary Earth Map &amp; Bioregional Commons" />
    </div>
    <div class="figure-caption">
      <strong>Figure 2:</strong> Global Planetary Map showing active nodes (Detroit Delray, Val di Susa, Sahel, Kerala, Amazonas) interconnected via P2P telemetry mesh and electric convoy routes.
    </div>

    <h3>Strategic Bioregion Selection (Where Should You Build?)</h3>
    <p>
      Every bioregion presents distinct thermodynamic strengths and survival vulnerabilities:
    </p>
    <ul>
      <li><strong>Temperate Hex-Loft (Detroit Delray):</strong> Abundant industrial scrap metals and water, but severe winter heating loads requiring wood-thermal mass fireplaces and insulation retrofits.</li>
      <li><strong>Alpine Hydro-Basin (Val di Susa):</strong> High gravity hydro-power and mountain timber, but shorter agricultural growing seasons requiring passive solar greenhouses.</li>
      <li><strong>Arid Solar Corridor (Sahel / Atacama):</strong> Massive photovoltaic yields (high kWh generation), but critical water scarcity requiring 95% closed-loop aeroponics and solar atmospheric condensers.</li>
    </ul>

    <h3>The Quorum Rule: How to Spawn a New Settlement</h3>
    <p>
      You cannot play as a solitary survivalist. To establish a new node on a free hexagonal tile:
    </p>
    <ol>
      <li><strong>Plant a Shadow Beacon:</strong> Stake a claim on any unmortgaged bioregional hex.</li>
      <li><strong>Gather the Founding Quorum (&ge; 3–5 Pioneers):</strong> The node activates only when 3 to 5 real players (or simulated autonomous agents in offline mode) commit to the charter.</li>
      <li><strong>Divide the 4 Vital Roles:</strong> One pioneer leads Agro-Ecology, one Microgrid Power, one FabLab Tooling, and one Care/Sanitation.</li>
    </ol>

    <div class="callout callout-amber">
      <div class="callout-title">🚚 Dispatching Inter-Node Barter Convoys</div>
      When you have surplus food calories but lack inverter components, click **Trade Convoys** in the footer. Dispatch electric cargo vans across the mesh: trade calories for LiFePO4 cells without needing banks or fiat debt!
    </div>
  </div>

  <div class="doc-footer">
    <div>O-ASIS Dual-Track • Living Thermodynamic Sandbox</div>
    <div>Page 4 of 9</div>
  </div>
</div>

<!-- ========================================================================= -->
<!-- PAGE 5: CHAPTER 4 - ATHENIAN DEMARCHY & SORTITION COUNCIL                 -->
<!-- ========================================================================= -->
<div class="page">
  <div class="doc-header">
    <div class="brand"><span>🌱</span> O.N.E. DUAL-TRACK ARCHITECTURE</div>
    <div>CHAPTER 4: SORTITION COUNCIL: VOTING ON CIVIC DILEMMAS</div>
  </div>

  <div class="content-wrap">
    <h2>4. Sortition Council: Voting on Civic Dilemmas</h2>
    <p>
      When systemic crises occur, the game halts and summons the **Athenian Sortition Council** (`[A]`). You do not vote as an omnipotent dictator; policy is deliberated by randomly drawn citizen jurors.
    </p>

    <div class="screenshot-frame">
      <img src="data:image/png;base64,{img_council}" alt="Athenian Sortition Deliberation &amp; Donut Chart" />
    </div>
    <div class="figure-caption">
      <strong>Figure 3:</strong> Athenian Sortition Assembly Deliberation modal resolving the "Arrival of 4 Thermodynamic Refugees" dilemma, displaying the SVG Donut Chart with the golden 75% threshold indicator notch.
    </div>

    <h3>How to Deliberate Dilemmas &amp; Read the SVG Donut</h3>
    <p>
      The Donut Chart (< 90px) tells you the seated council's stance at a single glance:
    </p>
    <ul>
      <li><strong>Green Arc (In Favor) vs. Red Arc (Against):</strong> Shows real-time votes of sortitioned jurors based on their personal psychometrics (e.g. high tribal bias leans against refugees; high greed leans against communal investments).</li>
      <li><strong>Golden Outer Rim Notch:</strong> The exact constitutional threshold required to pass the measure.</li>
      <li><strong>Center Badge:</strong> Shows current tally (e.g. `0/3 BELOW` or `12/15 RATIFIED`).</li>
    </ul>

    <h3>Understanding Voting Thresholds</h3>
    <table class="handbook-table">
      <thead>
        <tr>
          <th style="width: 28%;">Council Tier</th>
          <th style="width: 32%;">Standard Decision (60%)</th>
          <th>Constitutional / Crisis Supermajority (75%)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Local Mediation Panel<br>(Pop &lt; 50 • 3 Jurors)</strong></td>
          <td>Requires <strong>2 of 3 votes</strong>.<br>Routine chores, minor maintenance shifts, local trade dispatch.</td>
          <td>Requires <strong>3 of 3 votes (Unanimous)</strong>.<br>Refugee intake, emergency rationing, land usufruct alterations.</td>
        </tr>
        <tr>
          <td><strong>Neighborhood Council<br>(Pop &ge; 50 • 15 Jurors)</strong></td>
          <td>Requires <strong>9 of 15 votes</strong>.<br>Building FabLab workshops, constructing microgrid extensions.</td>
          <td>Requires <strong>12 of 15 votes</strong>.<br>Amending community charters, external treaty ratifications.</td>
        </tr>
      </tbody>
    </table>

    <div class="callout callout-emerald">
      <div class="callout-title">⚖️ Tactical Advice: Balancing Hard Tradeoffs</div>
      In Figure 3, granting refugee asylum costs 15 kWh, 120 L water, and 8,800 kcal, but grants +15% morale and 4 new workers. If your granary has over 25 days runway, **always ratify sanctuary**: the long-term labor credit outweighs short-term food burn!
    </div>
  </div>

  <div class="doc-footer">
    <div>O-ASIS Dual-Track • Living Thermodynamic Sandbox</div>
    <div>Page 5 of 9</div>
  </div>
</div>

<!-- ========================================================================= -->
<!-- PAGE 6: CHAPTER 5 - LABOR ROSTER, VOCATIONS & ENTROPY                     -->
<!-- ========================================================================= -->
<div class="page">
  <div class="doc-header">
    <div class="brand"><span>🌱</span> O.N.E. DUAL-TRACK ARCHITECTURE</div>
    <div>CHAPTER 5: LABOR MANAGEMENT, VOCATIONS &amp; ENTROPY</div>
  </div>

  <div class="content-wrap">
    <h2>5. Labor Management, Vocations &amp; Entropy</h2>
    <p>
      Press `[C]` to open the **Operational Hub**. In early settlement stages, surviving requires **4 hours/day of labor per citizen**. How you distribute this labor determines whether the node flourishes or decays.
    </p>

    <div class="screenshot-frame">
      <img src="data:image/png;base64,{img_chores}" alt="Operational Hub &amp; Subsistence Labor Allocation" />
    </div>
    <div class="figure-caption">
      <strong>Figure 4:</strong> Operational Hub Chore Roster tab showing vocation specialization (Agro-Ecologist with 2x Labor Credit multiplier) and the 4 essential labor allocation branches.
    </div>

    <h3>Choosing Your Vocation &amp; Labor Multipliers</h3>
    <p>
      Your character's craft grants powerful systemic in-game multipliers:
    </p>
    <ul>
      <li><strong>Regenerative Agro-Ecologist (2x Credit):</strong> Halves the human work hours required to produce vegetable calories in aeroponic vertical towers.</li>
      <li><strong>Microgrid Solar Electrician (1.5x Credit):</strong> Boosts inverter efficiency and speeds up LiFePO4 battery pack assembly.</li>
      <li><strong>Mechanical Machinist &amp; Blacksmith (2x Credit):</strong> Triples metal recycling speed in the solar induction foundry and repairs broken CNC tooling.</li>
      <li><strong>Communal Chef &amp; Care Facilitator (1.3x Credit):</strong> Reduces daily calorie waste through optimized batch cooking and boosts baseline community morale.</li>
    </ul>

    <h3>Fighting Second-Law Entropy: The 20% Durability Rule</h3>
    <p>
      Every pump, solar inverter, and 3D printer loses integrity over time. Check the *Machinery &amp; Entropy* tab:
    </p>

    <div class="two-col">
      <div class="callout callout-cyan">
        <div class="callout-title">🔧 OPTION 1: PREVENTIVE REPAIR</div>
        When durability is between 20% and 50%, spend 30 minutes of workshop labor and 3D-printed bushings to restore integrity to 100%. Prevents sudden catastrophic leaks and electrical shorts.
      </div>
      <div class="callout callout-emerald">
        <div class="callout-title">♻️ OPTION 2: CLOSED-LOOP SHREDDING</div>
        When a machine drops under 10% durability and repair is uneconomical, shred it in the FabLab: PETG is turned into 3D printer filament; aluminum is recast into structural bars. Zero waste!
      </div>
    </div>

    <div class="callout callout-rose">
      <div class="callout-title">⚠️ What Happens If You Ignore Maintenance?</div>
      If machinery durability hits 0%, catastrophic failures trigger: water pipes burst (losing 2,000L/day), battery cells overheat (wasting 40% of stored kWh), and village morale plummets.
    </div>
  </div>

  <div class="doc-footer">
    <div>O-ASIS Dual-Track • Living Thermodynamic Sandbox</div>
    <div>Page 6 of 9</div>
  </div>
</div>

<!-- ========================================================================= -->
<!-- PAGE 7: CHAPTER 6 - DYNAMIC USUFRUCT & FURNITURE REUSE DEPOT              -->
<!-- ========================================================================= -->
<div class="page">
  <div class="doc-header">
    <div class="brand"><span>🌱</span> O.N.E. DUAL-TRACK ARCHITECTURE</div>
    <div>CHAPTER 6: USUFRUCT HOUSING &amp; FURNITURE DEPOT</div>
  </div>

  <div class="content-wrap">
    <h2>6. Usufruct Housing &amp; The Furniture Swap Shop</h2>
    <p>
      Press `[H]` to open the **Housing &amp; Usufruct Drawer**. O.N.E. completely eliminates landlords, rents, and mortgages. Housing operates under the strict constitutional rule of **Dynamic Usufruct ("Use It or Lose It")**.
    </p>

    <div class="screenshot-frame">
      <img src="data:image/png;base64,{img_housing}" alt="Dynamic Usufruct &amp; Furniture Swap Shop" />
    </div>
    <div class="figure-caption">
      <strong>Figure 5:</strong> Usufruct Housing Drawer showing 32 bioclimatic housing units (28 occupied, 4 civic reserve buffer), usufruct metrics, and the Circular Furniture Reuse Depot inventory.
    </div>

    <h3>How to Claim Your Dwelling</h3>
    <ol>
      <li>Click any glowing green **FREE** dwelling on the settlement canvas, or click **"Claim Usufruct Dwelling"** in the top bar.</li>
      <li>Your name is registered as the sovereign usufruct occupant. Zero rent, zero taxes, zero eviction risk as long as you reside in the community.</li>
      <li>Your personal living space is **constitutionally inviolable**: other citizens cannot enter without your explicit invitation.</li>
    </ol>

    <h3>Going Offline? Always Activate the "Sabbatical Lock"</h3>
    <p>
      If you need to leave the game for exams, travel, or work:
    </p>
    <ul>
      <li><strong>With Sabbatical Lock:</strong> Declare your leave in your dwelling card. Your home is **frozen and protected** for the entire declared period. Nobody can touch your dwelling or reassign it.</li>
      <li><strong>Without Sabbatical Lock (Prolonged Abandonment):</strong> If a player disappears for weeks without notification, the neighborhood council declares the home abandoned. The dwelling returns to the **Civic Housing Pool** to shelter an unhoused family.</li>
      <li><strong>What You NEVER Lose:</strong> Your **personal backpack, clothes, tools, computer, and cryptographic keys are 100% inviolable**. When you return, you simply claim an empty pod from the civic reserve.</li>
    </ul>

    <div class="callout callout-emerald">
      <div class="callout-title">🪑 Raiding the Circular Furniture Swap Shop</div>
      When abandoned pods are reclaimed, heavy furniture (beds, chairs, tables, wardrobes) is moved into the community Swap Shop (Figure 5). Any newcomer can furnish their empty module for free!
    </div>
  </div>

  <div class="doc-footer">
    <div>O-ASIS Dual-Track • Living Thermodynamic Sandbox</div>
    <div>Page 7 of 9</div>
  </div>
</div>

<!-- ========================================================================= -->
<!-- PAGE 8: CHAPTER 7 - DUAL-TRACK HARDWARE BRIDGE & ROBOT TECH TREE          -->
<!-- ========================================================================= -->
<div class="page">
  <div class="doc-header">
    <div class="brand"><span>🌱</span> O.N.E. DUAL-TRACK ARCHITECTURE</div>
    <div>CHAPTER 7: ROBOT TECH TREE: CANCELING CHORES &amp; CAD STL</div>
  </div>

  <div class="content-wrap">
    <h2>7. Robot Tech Tree: Canceling Chores &amp; CAD STL</h2>
    <p>
      Press `[T]` to open the **FabLab Robot Tech Tree**. This is the core engine of player progression: every robot you build **permanently deletes manual chore hours from human rosters**, while unlocking real CAD blueprints.
    </p>

    <div class="screenshot-frame">
      <img src="data:image/png;base64,{img_robots}" alt="FabLab Robot Tech Tree &amp; Dual-Track Blueprints" />
    </div>
    <div class="figure-caption">
      <strong>Figure 6:</strong> FabLab Robot Tech Tree showing available stocks (45kg Aluminum, 18 PETG spools, 120m Wire), robot cards showing daily human hours cancelled, and FabLab fabrication buttons.
    </div>

    <h3>The Optimal Pioneer Build Order (What to Build First)</h3>
    <p>
      Prioritize automations that cancel the most dangerous or time-consuming manual labor:
    </p>
    <ol>
      <li><strong>Tier 1: ESP32 Smart Irrigation Valves (Cost: 2 spools PETG, 15m Wire)</strong><br>
      <em>Effect:</em> Cancels <strong>2.0h daily chores</strong>. Automates aeroponic misting, cutting water waste by 35% and freeing up your greenhouse team.</li>
      <li><strong>Tier 2: SCADA Microgrid Auto-Balancer (Cost: 5kg Al, 1 spool PETG, 20m Wire)</strong><br>
      <em>Effect:</em> Cancels <strong>3.0h daily chores</strong>. Automates inverter contactors and galvanic grid isolation, protecting batteries during lightning strikes.</li>
      <li><strong>Tier 3: Autonomous Solar Agro-Rover (Cost: 18kg Al, 5 spools PETG, 40m Wire)</strong><br>
      <em>Effect:</em> Cancels <strong>4.0h daily chores</strong>. RTK-GPS robot automates bio-intensive seed planting, laser weeding, and micro-composting.</li>
      <li><strong>Tier 4: Closed-Loop Shredder &amp; Sorter Arm (Cost: 14kg Al, 3 spools PETG, 30m Wire)</strong><br>
      <em>Effect:</em> Cancels <strong>4.0h daily chores</strong>. Pulverizes plastic waste and re-extrudes fresh 3D printer filament automatically.</li>
    </ol>

    <h3>The Dual-Track Handshake: Exporting Real Blueprints</h3>
    <p>
      Every in-game milestone unlocks verified open-hardware engineering files:
    </p>
    <div class="two-col">
      <div>
        <h4 style="color: #38bdf8; margin: 0 0 2px 0; font-size: 8.2pt;">📥 Watertight CAD (.STL) Blueprints</h4>
        <p style="font-size: 7.5pt; line-height: 1.25;">Click **"Download .STL Blueprint"** to export 3D printable models (hydroponic net-cups, aeroponic spray hubs, sensor enclosures) with the embossed O.N.E. logo for your home 3D printer.</p>
      </div>
      <div>
        <h4 style="color: #fbbf24; margin: 0 0 2px 0; font-size: 8.2pt;">⚡ Home Assistant Automation (.YAML)</h4>
        <p style="font-size: 7.5pt; line-height: 1.25;">Copy production-ready MQTT/Zigbee configurations to connect physical battery monitors, ultrasonic cistern sensors, and ESP32 irrigation relays into your real home smart hub.</p>
      </div>
    </div>
  </div>

  <div class="doc-footer">
    <div>O-ASIS Dual-Track • Living Thermodynamic Sandbox</div>
    <div>Page 8 of 9</div>
  </div>
</div>

<!-- ========================================================================= -->
<!-- PAGE 9: CHAPTER 8 - FIRST 7 DAYS WALKTHROUGH, HOTKEYS & FAQ               -->
<!-- ========================================================================= -->
<div class="page page-last">
  <div class="doc-header">
    <div class="brand"><span>🌱</span> O.N.E. DUAL-TRACK ARCHITECTURE</div>
    <div>CHAPTER 8: FIRST 7 DAYS WALKTHROUGH, HOTKEYS &amp; FAQ</div>
  </div>

  <div class="content-wrap">
    <h2>8. Your First 7 Days as a Pioneer Founder</h2>
    <p>
      Follow this step-by-step tactical walkthrough to establish a rock-solid, collapse-proof settlement:
    </p>

    <table class="handbook-table">
      <thead>
        <tr>
          <th style="width: 15%;">Timeline</th>
          <th style="width: 32%;">Primary Goal</th>
          <th>Exact Step-by-Step Player Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Day 1</strong></td>
          <td>Claim Sanctuary &amp; Vocation</td>
          <td>Generate your cryptographic passport. Claim an empty green usufruct dwelling (`#1–#28`). Choose your craft (Agro-Ecologist or Solar Electrician recommended).</td>
        </tr>
        <tr>
          <td><strong>Day 2</strong></td>
          <td>Stabilize 4 Vital Signs</td>
          <td>Check the top HUD: ensure Energy delta is positive. Balance chore hours in the Hub (`[C]`): assign 2h to Land/Greenhouses and 2h to Water/Electrical.</td>
        </tr>
        <tr>
          <td><strong>Day 3</strong></td>
          <td>Perform First Maintenance</td>
          <td>Check the *Machinery &amp; Entropy* tab. Service the water pump filter and solar tracking actuator before durability drops under 20%.</td>
        </tr>
        <tr>
          <td><strong>Days 4–5</strong></td>
          <td>Fabricate First Robot</td>
          <td>Collect FabLab scrap metals and filament. Build the *ESP32 Smart Irrigation Valves* (`[T]`). Verify that 2.0h of human toil are deleted from the roster!</td>
        </tr>
        <tr>
          <td><strong>Days 6–7</strong></td>
          <td>Repel Legacy AI Strike</td>
          <td>When the Legacy AI triggers an NPL debt strike or grid disconnect, convene the Sortition Council (`[A]`), oppose legal foundation defenses, and island the microgrid.</td>
        </tr>
      </tbody>
    </table>

    <h3>Master Keyboard Shortcut Matrix</h3>
    <table class="handbook-table">
      <thead>
        <tr>
          <th style="width: 22%;">Shortcut Key</th>
          <th style="width: 30%;">Command Trigger</th>
          <th>Strategic Purpose in Gameplay</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>[ESC]</code></td>
          <td>Exit to Village / Close Drawers</td>
          <td>Closes open modals and returns camera to village overview.</td>
        </tr>
        <tr>
          <td><code>[Space]</code></td>
          <td>Toggle Pause / Play</td>
          <td>Freezes simulation ticks while planning complex chore changes.</td>
        </tr>
        <tr>
          <td><code>[1] / [2] / [5]</code></td>
          <td>1x / 2x / 5x Speed</td>
          <td>Fast-forwards daytime solar accumulation or speeds up robot builds.</td>
        </tr>
        <tr>
          <td><code>[M]</code></td>
          <td>Toggle World Map &harr; Node</td>
          <td>Inspects global bioregions and tracks inbound trade convoys.</td>
        </tr>
        <tr>
          <td><code>[C]</code></td>
          <td>Open Chores Hub</td>
          <td>Rebalances daily labor assignments and checks machine durability.</td>
        </tr>
        <tr>
          <td><code>[H]</code></td>
          <td>Open Housing &amp; Usufruct</td>
          <td>Manages dwelling allocations, sabbatical locks, and Swap Shop.</td>
        </tr>
        <tr>
          <td><code>[T]</code></td>
          <td>Open Robot Tech Tree</td>
          <td>Fabricates automations and downloads 3D CAD .STL blueprints.</td>
        </tr>
        <tr>
          <td><code>[A]</code></td>
          <td>Open Sortition Council</td>
          <td>Deliberates on community dilemmas and resolves Legacy attacks.</td>
        </tr>
      </tbody>
    </table>

    <div class="callout callout-cyan" style="margin-top: 4px;">
      <div class="callout-title">❓ Pioneer FAQ &amp; Field Diagnostics</div>
      <strong>Q: My battery buffer is negative at night! How do I stop a blackout?</strong> Pause (`[Space]`), open Chores (`[C]`), and shut down high-power FabLab induction smelting. Rely on wood-thermal mass fireplaces for heating until sunrise.<br>
      <strong>Q: A player left the game and their house is locked. Can we use it?</strong> If they activated a Sabbatical Lock, their home is protected. If they left without a lock for over 30 days, the Council votes to reassign it to the Civic Housing Pool.
    </div>

    <div class="callout callout-emerald" style="margin-top: 4px;">
      <div class="callout-title">🌍 Pioneer Call to Action: The Living Test</div>
      <em>"Do not treat O-ASIS as passive entertainment. Master its Leontief physics, build your village, download the open STL models, flash Home Assistant onto an ESP32 board, and begin assembling real thermodynamic resilience in the physical world."</em>
      <div style="text-align: right; margin-top: 2px; font-weight: 700; color: #10b981;">— Kyberlex &amp; The O.N.E. Commons Collective</div>
    </div>
  </div>

  <div class="doc-footer">
    <div>O-ASIS Dual-Track • Living Thermodynamic Sandbox</div>
    <div>Page 9 of 9</div>
  </div>
</div>

</body>
</html>
"""
    return html

def main():
    sim_dir = os.path.dirname(os.path.abspath(__file__))
    html_content = build_handbook_html()
    
    html_path = os.path.join(sim_dir, 'handbook_temp.html')
    pdf_path = os.path.join(sim_dir, 'O-ASIS_User_Handbook.pdf')

    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    print(f"Written temporary HTML to {html_path} ({len(html_content)} bytes)")

    chrome_bin = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    cmd = [
        chrome_bin,
        '--headless',
        '--disable-gpu',
        '--no-pdf-header-footer',
        f'--print-to-pdf={pdf_path}',
        f'file://{html_path}'
    ]
    print("Executing Chrome print-to-pdf...")
    subprocess.run(cmd, check=True)
    print(f"Generated PDF: {pdf_path}")

    # Remove temporary HTML
    if os.path.exists(html_path):
        os.remove(html_path)

    # Verify PDF with PyMuPDF
    doc = fitz.open(pdf_path)
    print(f"✅ Successfully compiled PDF handbook with {len(doc)} pages.")
    for i, page in enumerate(doc):
        text_snip = page.get_text()[:60].replace('\n', ' ')
        print(f"   Page {i+1}: {text_snip}...")

if __name__ == '__main__':
    main()
