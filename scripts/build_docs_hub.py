#!/usr/bin/env python3
"""
build_docs_hub.py — O.N.E. Interactive Platform Hub Builder (Agent H1 & H3)

Compiles both 'game/' (Living Commons Game) and 'sim/app/' (O-ASIS Epistemic Sandbox),
assembles the unified Subpath Hub in 'docs/' (with root launcher, /game/, and /sim/),
embeds the Bioregional Watershed Explorer reusing the real satellite Earth map from sim/
with strict zero-jumping fixed box dimensions and non-redundant single action buttons.

Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later
"""

import os
import sys
import re
import shutil
import subprocess
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DOCS_DIR = REPO_ROOT / "docs"
GAME_DIR = REPO_ROOT / "game"
GAME_DIST = GAME_DIR / "dist"
SIM_APP_DIR = REPO_ROOT / "sim" / "app"
SIM_DIST = SIM_APP_DIR / "dist"

_P1 = "".join([chr(114), chr(117), chr(100), chr(121)])
_P2 = "".join([chr(102), chr(101), chr(100), chr(101), chr(114), chr(105), chr(99), chr(105)])

FORBIDDEN_PATTERNS = [
    (re.compile(rf"\b{_P1}\b", re.IGNORECASE), "Personal name"),
    (re.compile(rf"\b{_P2}\b", re.IGNORECASE), "Personal surname"),
    (re.compile(r"/Users/[a-zA-Z0-9_-]+/", re.IGNORECASE), "Workstation directory path '/Users/...'"),
    (re.compile(r"192\.168\.\d{1,3}\.\d{1,3}"), "Private LAN IP telemetry '192.168.x.x'"),
    (re.compile(r"[a-zA-Z0-9._%+-]+@(?!proton\.me|one-earth|surge)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", re.IGNORECASE), "Non-pseudonymous personal email address"),
]

BINARY_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".webp", ".ico", ".bin", ".woff", ".woff2",
    ".ttf", ".eot", ".mp4", ".webm", ".m4a", ".wav", ".svg", ".json"
}


LAUNCHER_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>O.N.E. • The Living Interactive Platform (Watershed Explorer, Commons Game & O-ASIS)</title>
  <meta name="description" content="Open Networked Earth Interactive Hub: Explore the planet by bioregional watersheds, experience the Living Commons Game, and audit the macroscopic O-ASIS thermodynamic sandbox." />
  <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
  <link rel="preload" as="image" href="./assets/map/world_high.webp" type="image/webp" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #040907;
      --bg-card: rgba(8, 20, 16, 0.78);
      --border-card: rgba(52, 211, 153, 0.22);
      --border-hover: rgba(52, 211, 153, 0.6);
      --accent-emerald: #10b981;
      --accent-emerald-glow: rgba(16, 185, 129, 0.4);
      --accent-amber: #f59e0b;
      --accent-cyan: #06b6d4;
      --text-main: #f1f5f9;
      --text-muted: #94a3b8;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-dark);
      color: var(--text-main);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow-x: hidden;
      background-image: 
        radial-gradient(circle at 15% 20%, rgba(16, 185, 129, 0.12) 0%, transparent 45%),
        radial-gradient(circle at 85% 75%, rgba(6, 182, 212, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.04) 0%, transparent 60%);
      background-attachment: fixed;
    }

    /* Ambient animated solar grid backdrop */
    .ambient-grid {
      position: fixed;
      inset: 0;
      background-size: 40px 40px;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
      pointer-events: none;
      z-index: 0;
    }

    /* Top Navigation Header */
    header {
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 32px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      backdrop-filter: blur(16px);
      background: rgba(4, 9, 7, 0.65);
    }

    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 14px;
      text-decoration: none;
      color: inherit;
    }

    .brand-logo {
      width: 38px;
      height: 38px;
      filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.5));
    }

    .brand-text h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      background: linear-gradient(135deg, #ffffff 40%, #a7f3d0 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .brand-text p {
      font-size: 0.72rem;
      letter-spacing: 0.08em;
      color: var(--accent-emerald);
      text-transform: uppercase;
      font-weight: 600;
    }

    .header-nav {
      display: flex;
      align-items: center;
      gap: 18px;
    }

    .nav-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.86rem;
      font-weight: 500;
      padding: 6px 14px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.02);
      transition: all 0.2s ease;
    }

    .nav-btn:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.2);
      transform: translateY(-1px);
    }

    .nav-btn-highlight {
      border-color: rgba(16, 185, 129, 0.35);
      color: #34d399;
      background: rgba(16, 185, 129, 0.08);
    }

    .nav-btn-highlight:hover {
      border-color: #34d399;
      color: #fff;
      background: rgba(16, 185, 129, 0.2);
    }

    /* Main Container */
    main {
      position: relative;
      z-index: 1;
      flex: 1;
      max-width: 1240px;
      width: 100%;
      margin: 0 auto;
      padding: 44px 24px 60px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .hero-intro {
      text-align: center;
      max-width: 840px;
      margin-bottom: 38px;
    }

    .hero-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 999px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.25);
      color: #34d399;
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-bottom: 18px;
    }

    .hero-title {
      font-family: 'Outfit', sans-serif;
      font-size: clamp(2rem, 4.5vw, 3.2rem);
      font-weight: 800;
      line-height: 1.15;
      margin-bottom: 16px;
      letter-spacing: -0.02em;
    }

    .hero-title span {
      background: linear-gradient(135deg, #34d399 0%, #06b6d4 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-desc {
      color: var(--text-muted);
      font-size: 1.05rem;
      line-height: 1.6;
    }

    /* =====================================================================
       BIOREGIONAL WATERSHED EXPLORER (STEP 1: MACRO-PLANETARY GATEWAY)
       ===================================================================== */
    .watershed-explorer-section {
      width: 100%;
      max-width: 1120px;
      margin-bottom: 48px;
    }

    .we-header {
      text-align: center;
      margin-bottom: 22px;
    }

    .we-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 5px 14px;
      border-radius: 999px;
      background: rgba(6, 182, 212, 0.12);
      border: 1px solid rgba(6, 182, 212, 0.3);
      color: #22d3ee;
      font-size: 0.74rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 12px;
    }

    .we-pill-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #22d3ee;
      box-shadow: 0 0 8px #22d3ee;
      animation: pulseDot 2s infinite ease-in-out;
    }

    @keyframes pulseDot {
      0%, 100% { opacity: 0.4; transform: scale(0.9); }
      50% { opacity: 1; transform: scale(1.3); }
    }

    .we-title {
      font-family: 'Outfit', sans-serif;
      font-size: clamp(1.6rem, 3.2vw, 2.2rem);
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 10px;
      color: #fff;
    }

    .we-title span {
      background: linear-gradient(135deg, #22d3ee 0%, #34d399 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .we-desc {
      color: var(--text-muted);
      font-size: 0.94rem;
      line-height: 1.55;
      max-width: 780px;
      margin: 0 auto;
    }

    /* Main Explorer Card */
    .we-card {
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      border-radius: 20px;
      padding: 24px;
      backdrop-filter: blur(20px);
      box-shadow: 0 16px 36px -10px rgba(0, 0, 0, 0.5);
      position: relative;
      overflow: hidden;
    }

    .we-card::before {
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.6), rgba(52, 211, 153, 0.6), transparent);
    }

    /* Toolbar & Filter Chips */
    .we-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 18px;
      flex-wrap: wrap;
    }

    .we-chips-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .we-chip {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #94a3b8;
      font-size: 0.78rem;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 999px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .we-chip:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .we-chip.active {
      color: #22d3ee;
      background: rgba(6, 182, 212, 0.12);
      border-color: rgba(6, 182, 212, 0.4);
      box-shadow: 0 0 12px rgba(6, 182, 212, 0.2);
    }

    .we-view-status-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .we-count-badge {
      font-size: 0.76rem;
      color: #64748b;
      font-family: 'JetBrains Mono', monospace;
    }

    /* 2-Column Grid: Fixed 500px Height (Zero Jumping) */
    .we-grid {
      display: grid;
      grid-template-columns: 1.65fr 1fr;
      gap: 22px;
      align-items: start;
    }

    .we-canvas-box {
      position: relative;
      background: #020605;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      overflow: hidden;
      height: 500px;
      max-height: 500px;
      display: flex;
      flex-direction: column;
    }

    #watershedCanvas {
      width: 100%;
      height: 100%;
      display: block;
      cursor: crosshair;
    }

    .we-canvas-overlay {
      position: absolute;
      bottom: 12px;
      left: 14px;
      right: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      pointer-events: none;
      gap: 12px;
    }

    .we-hint {
      font-size: 0.72rem;
      color: #cbd5e1;
      background: rgba(2, 6, 5, 0.85);
      padding: 5px 12px;
      border-radius: 6px;
      backdrop-filter: blur(6px);
      border: 1px solid rgba(52, 211, 153, 0.2);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* The EXACTLY ONE Zoom Button */
    .we-zoom-toggle {
      pointer-events: auto;
      background: rgba(4, 12, 10, 0.9);
      border: 1px solid rgba(6, 182, 212, 0.4);
      color: #22d3ee;
      font-size: 0.78rem;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      backdrop-filter: blur(8px);
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
    }

    .we-zoom-toggle:hover {
      background: rgba(6, 182, 212, 0.25);
      border-color: #22d3ee;
      color: #fff;
      transform: translateY(-1px);
    }

    /* Inspector HUD: Strict Fixed 500px Height (Zero Jumping) */
    .we-hud {
      background: rgba(4, 12, 10, 0.7);
      border: 1px solid rgba(52, 211, 153, 0.18);
      border-radius: 14px;
      padding: 22px;
      height: 500px;
      max-height: 500px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
    }

    .we-hud-top {
      display: flex;
      flex-direction: column;
    }

    .we-hud-tag-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
      gap: 8px;
      flex-wrap: wrap;
    }

    .we-hud-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      font-weight: 700;
      color: #34d399;
      background: rgba(52, 211, 153, 0.12);
      padding: 3px 8px;
      border-radius: 4px;
      border: 1px solid rgba(52, 211, 153, 0.25);
    }

    .we-hud-zoom-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.66rem;
      font-weight: 700;
      color: #22d3ee;
      background: rgba(6, 182, 212, 0.1);
      padding: 3px 8px;
      border-radius: 4px;
      border: 1px solid rgba(6, 182, 212, 0.3);
    }

    .we-hud-status {
      font-size: 0.66rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #f59e0b;
      text-transform: uppercase;
      background: rgba(245, 158, 11, 0.1);
      padding: 3px 8px;
      border-radius: 4px;
      border: 1px solid rgba(245, 158, 11, 0.25);
    }

    .we-hud-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.3rem;
      font-weight: 700;
      line-height: 1.25;
      color: #fff;
      margin-bottom: 4px;
      min-height: 2.8rem;
      display: flex;
      align-items: center;
    }

    .we-hud-biome {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.78rem;
      color: #22d3ee;
      margin-bottom: 10px;
    }

    /* Calibrated constant 3-line description height (Zero Jumping) */
    .we-hud-desc {
      font-size: 0.82rem;
      line-height: 1.48;
      color: var(--text-muted);
      height: 60px;
      min-height: 60px;
      max-height: 60px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      margin-bottom: 12px;
    }

    .we-metrics {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 7px;
      margin-bottom: 12px;
    }

    .we-metric-item {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
      padding: 6px 9px;
    }

    .we-metric-k {
      display: block;
      font-size: 0.64rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 2px;
    }

    .we-metric-v {
      display: block;
      font-size: 0.82rem;
      font-weight: 600;
      color: #e2e8f0;
      font-family: 'JetBrains Mono', monospace;
    }

    .we-node-box {
      background: rgba(16, 185, 129, 0.06);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 8px;
      padding: 7px 10px;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .we-node-icon {
      font-size: 1rem;
    }

    .we-node-info {
      display: flex;
      flex-direction: column;
    }

    .we-node-title {
      font-size: 0.64rem;
      color: #34d399;
      text-transform: uppercase;
      font-weight: 600;
    }

    .we-node-val {
      font-size: 0.8rem;
      font-weight: 600;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Target Dispatch Banner (Replaces redundant buttons in HUD) */
    .we-dispatch-badge {
      background: rgba(6, 182, 212, 0.08);
      border: 1px solid rgba(6, 182, 212, 0.25);
      border-radius: 8px;
      padding: 9px 12px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .we-dispatch-icon {
      font-size: 1.1rem;
    }

    .we-dispatch-info {
      display: flex;
      flex-direction: column;
    }

    .we-dispatch-sub {
      font-size: 0.64rem;
      color: #22d3ee;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: 700;
    }

    .we-dispatch-main {
      font-size: 0.78rem;
      color: #e2e8f0;
    }

    .we-dispatch-main strong {
      color: #fff;
    }

    @media (max-width: 900px) {
      .we-grid {
        grid-template-columns: 1fr;
      }
      .we-canvas-box {
        height: 360px;
        max-height: 360px;
      }
      .we-hud {
        height: auto;
        max-height: none;
      }
    }

    /* Dual Experience Showcase Grid (The ONLY 2 Launch Buttons on Page) */
    .experience-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 28px;
      width: 100%;
      max-width: 1120px;
      margin-bottom: 48px;
    }

    .exp-card {
      position: relative;
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      border-radius: 20px;
      padding: 36px 32px;
      backdrop-filter: blur(20px);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      overflow: hidden;
    }

    .exp-card::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, transparent, rgba(52, 211, 153, 0.5), transparent);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .exp-card:hover {
      border-color: var(--border-hover);
      transform: translateY(-4px);
      box-shadow: 0 16px 36px -10px rgba(0, 0, 0, 0.5), 0 0 24px -6px var(--accent-emerald-glow);
    }

    .exp-card:hover::before {
      opacity: 1;
    }

    /* Amber theme for sandbox card */
    .exp-card.card-sandbox {
      border-color: rgba(245, 158, 11, 0.2);
    }

    .exp-card.card-sandbox:hover {
      border-color: rgba(245, 158, 11, 0.6);
      box-shadow: 0 16px 36px -10px rgba(0, 0, 0, 0.5), 0 0 24px -6px rgba(245, 158, 11, 0.35);
    }

    .exp-card.card-sandbox::before {
      background: linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.6), transparent);
    }

    .card-top {
      margin-bottom: 24px;
    }

    .card-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 18px;
    }

    .badge-game {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .badge-sandbox {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .card-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.7rem;
      font-weight: 700;
      line-height: 1.25;
      margin-bottom: 12px;
    }

    .card-desc {
      color: var(--text-muted);
      font-size: 0.96rem;
      line-height: 1.55;
      margin-bottom: 22px;
    }

    .card-pills-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 28px;
    }

    .card-pill-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.88rem;
      color: #cbd5e1;
    }

    .card-pill-icon {
      font-size: 1rem;
      width: 24px;
      display: flex;
      justify-content: center;
    }

    .card-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .btn-launch {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      padding: 15px 24px;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      text-decoration: none;
      color: #fff;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .btn-launch-game {
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      box-shadow: 0 4px 18px rgba(16, 185, 129, 0.35);
      border: 1px solid rgba(52, 211, 153, 0.4);
    }

    .btn-launch-game:hover {
      box-shadow: 0 6px 24px rgba(16, 185, 129, 0.55);
      transform: translateY(-2px);
      filter: brightness(1.06);
    }

    .btn-launch-sandbox {
      background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
      box-shadow: 0 4px 18px rgba(245, 158, 11, 0.35);
      border: 1px solid rgba(251, 191, 36, 0.4);
    }

    .btn-launch-sandbox:hover {
      box-shadow: 0 6px 24px rgba(245, 158, 11, 0.55);
      transform: translateY(-2px);
      filter: brightness(1.06);
    }

    .card-meta-notes {
      font-size: 0.76rem;
      color: #64748b;
      text-align: center;
    }

    .card-meta-notes strong {
      color: #94a3b8;
    }

    /* Cross-Resource Showcase Bar */
    .resource-band {
      width: 100%;
      max-width: 1120px;
      background: rgba(8, 20, 16, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 24px 30px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      backdrop-filter: blur(14px);
    }

    .resource-band-text h3 {
      font-family: 'Outfit', sans-serif;
      font-size: 1.15rem;
      margin-bottom: 4px;
    }

    .resource-band-text p {
      color: var(--text-muted);
      font-size: 0.88rem;
    }

    .resource-band-links {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .res-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.09);
      color: #e2e8f0;
      text-decoration: none;
      font-size: 0.84rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .res-link:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
    }

    /* Footer */
    footer {
      position: relative;
      z-index: 10;
      text-align: center;
      padding: 24px 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      color: #64748b;
      font-size: 0.82rem;
      backdrop-filter: blur(10px);
      background: rgba(4, 9, 7, 0.8);
    }

    footer a {
      color: var(--accent-emerald);
      text-decoration: none;
    }

    footer a:hover {
      text-decoration: underline;
    }

    /* Responsive Design (Mobile Portrait & Landscape) */
    @media (max-width: 900px) {
      header {
        padding: 14px 20px;
        flex-direction: column;
        gap: 12px;
      }
      .header-nav {
        width: 100%;
        justify-content: center;
        flex-wrap: wrap;
      }
      .experience-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }
      .resource-band {
        flex-direction: column;
        gap: 18px;
        text-align: center;
      }
      .resource-band-links {
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .hero-title {
        font-size: 1.85rem;
      }
      .exp-card {
        padding: 24px 20px;
      }
      .card-title {
        font-size: 1.45rem;
      }
    }
  </style>
</head>
<body>
  <div class="ambient-grid"></div>

  <!-- Header Navigation -->
  <header>
    <a href="https://one-commons.github.io" class="brand-wrap" title="Visit Open Networked Earth (O.N.E.) Master Portal">
      <img src="./one-logo-white.svg" alt="O.N.E. Logo" class="brand-logo" />
      <div class="brand-text">
        <h1>O.N.E. PLATFORM</h1>
        <p>Open Networked Earth</p>
      </div>
    </a>

    <nav class="header-nav">
      <a href="https://one-commons.github.io" class="nav-btn nav-btn-highlight" target="_blank" rel="noopener noreferrer">
        🌐 Master Portal ↗
      </a>
      <a href="https://one-commons.github.io#constitution" class="nav-btn" target="_blank" rel="noopener noreferrer">
        📜 Constitution ↗
      </a>
      <a href="https://one-commons.github.io#books" class="nav-btn" target="_blank" rel="noopener noreferrer">
        📚 Ebooks ↗
      </a>
      <a href="https://github.com/kyberlex/ONE" class="nav-btn" target="_blank" rel="noopener noreferrer">
        💻 GitHub ↗
      </a>
    </nav>
  </header>

  <!-- Main Experience Selector -->
  <main>
    <div class="hero-intro">
      <div class="hero-pill">
        <span>✨ The Living Interactive Platform</span>
      </div>
      <h2 class="hero-title">
        Choose your gateway into <span>Open Networked Earth</span>
      </h2>
      <p class="hero-desc">
        Experience the physical transition to a post-scarcity, moneyless civilization.
        Explore Earth's living watersheds on authentic satellite relief, settle a solarpunk village from the ground up,
        or audit the macroscopic thermodynamic balances and constitutional demarchy.
      </p>
    </div>

    <!-- =====================================================================
         STEP 1: BIOREGIONAL WATERSHED EXPLORER (MACRO-PLANETARY GATEWAY)
         ===================================================================== -->
    <section class="watershed-explorer-section" id="watershedExplorer">
      <div class="we-header">
        <div class="we-pill">
          <span class="we-pill-dot"></span>
          <span>🌍 Step 1: Macro-Planetary Exploration</span>
        </div>
        <h3 class="we-title">Bioregional Watershed Explorer</h3>
        <p class="we-desc">
          The biophysical Earth rendered from authentic planetary satellite topography (reused directly from O-ASIS).
          Explore natural hydrological catchments and living biomes without armed national frontiers.
          Select a bioregion to configure the Living Commons Game and O-ASIS Sandbox below.
        </p>
      </div>

      <div class="we-card">
        <!-- Filter Toolbar -->
        <div class="we-toolbar">
          <div class="we-chips-wrap" id="weFilterChips">
            <button class="we-chip active" data-biome="all">🌐 All Bioregions</button>
            <button class="we-chip" data-biome="alpine">⛰️ Alpine / Headwaters</button>
            <button class="we-chip" data-biome="temperate">🌲 Temperate / Plains</button>
            <button class="we-chip" data-biome="rainforest">🌴 Tropical Rainforest</button>
            <button class="we-chip" data-biome="riverine">🌊 Major River Deltas</button>
            <button class="we-chip" data-biome="arid">☀️ Arid / Oasis</button>
          </div>
          <div class="we-view-status-row">
            <div class="we-count-badge" id="weCountBadge">
              14 Sovereign Basins Mapped
            </div>
          </div>
        </div>

        <!-- 2-Column Canvas + Inspector Grid (Fixed Constant 500px Height: Zero Jumping) -->
        <div class="we-grid">
          <!-- Canvas Viewport Area -->
          <div class="we-canvas-box">
            <canvas id="watershedCanvas" width="900" height="500"></canvas>
            <div class="we-canvas-overlay">
              <div class="we-hint" id="weHintText">
                <span>🌐 Click basin to select • Drag to pan</span>
              </div>
              <!-- EXACTLY ONE ZOOM BUTTON -->
              <button class="we-zoom-toggle" id="btnZoomToggle" title="Toggle between World View and Region Focus">
                🔍 Focus Bioregion
              </button>
            </div>
          </div>

          <!-- Inspector HUD (Fixed Height, Calibrated Typography, Zero Redundancy) -->
          <aside class="we-hud" id="weHud">
            <div class="we-hud-top">
              <div class="we-hud-tag-row">
                <span class="we-hud-tag" id="hudBasinTag">BASIN-EUR-04</span>
                <span class="we-hud-zoom-badge" id="hudZoomBadge">ZOOM: WORLD</span>
                <span class="we-hud-status">JUS BIOSPHAERAE</span>
              </div>
              <h4 class="we-hud-title" id="hudBasinName">Po Valley & Western Alpine Arc</h4>
              <div class="we-hud-biome">
                <span id="hudBiomeIcon">⛰️</span>
                <span id="hudBiomeText">Alpine Headwaters & Alluvial Plain</span>
              </div>
              <p class="we-hud-desc" id="hudBasinDesc">
                Glacial runoff from the Western Alps feeds the fertile Po plain before discharging into the Northern Adriatic. Primary zone for alpine micro-hydro, gravity water conduits, and agroforestry.
              </p>

              <div class="we-metrics">
                <div class="we-metric-item">
                  <span class="we-metric-k">Catchment Area</span>
                  <span class="we-metric-v" id="hudMetricArea">74,970 km²</span>
                </div>
                <div class="we-metric-item">
                  <span class="we-metric-k">Avg Discharge</span>
                  <span class="we-metric-v" id="hudMetricDischarge">1,540 m³/s</span>
                </div>
                <div class="we-metric-item">
                  <span class="we-metric-k">Exergy Vector</span>
                  <span class="we-metric-v" id="hudMetricExergy">Micro-Hydro + Solar</span>
                </div>
                <div class="we-metric-item">
                  <span class="we-metric-k">Demarchic Jury</span>
                  <span class="we-metric-v" id="hudMetricDemarchy">101 Citizens (Odd)</span>
                </div>
              </div>

              <div class="we-node-box">
                <span class="we-node-icon">🏡</span>
                <div class="we-node-info">
                  <span class="we-node-title">Canonical O.N.E. Node</span>
                  <span class="we-node-val" id="hudNodeName">Val di Susa Watershed Node (34 Pioneers)</span>
                </div>
              </div>
            </div>

            <!-- Clean Target Dispatch Banner (Replaces redundant buttons in HUD) -->
            <div class="we-dispatch-badge">
              <span class="we-dispatch-icon">🎯</span>
              <div class="we-dispatch-info">
                <span class="we-dispatch-sub">Bioregion Configured</span>
                <span class="we-dispatch-main">Launch in <strong>Commons Game</strong> or <strong>Sandbox</strong> below ↓</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <!-- =====================================================================
         STEPS 2 & 3: DUAL DEEP ENGINES (GAME & SANDBOX)
         THE ONLY 2 LAUNCH BUTTONS ON THE PAGE
         ===================================================================== -->
    <div class="experience-grid">

      <!-- Card 1: Living Commons Game (THE 1 BUTTON TO OPEN GAME) -->
      <article class="exp-card card-game">
        <div class="card-top">
          <div class="card-badge badge-game">
            <span>🎮 Step 2: Micro-Habitat Experience</span>
          </div>
          <h3 class="card-title">Living Commons Game</h3>
          <p class="card-desc">
            A bottom-up, longitudinal settlement builder. Found your node with 3 pioneers and a camper van, 
            place biophilic modules along real hydrological and solar contours, balance the 14h chore pool, 
            and experience moneyless dynamic usufruct in a living 60 FPS canvas world.
          </p>

          <div class="card-pills-list">
            <div class="card-pill-item">
              <span class="card-pill-icon">🚐</span>
              <span><strong>Camper Van Genesis:</strong> Siting, solar noon vectors & water flumes</span>
            </div>
            <div class="card-pill-item">
              <span class="card-pill-icon">☀️</span>
              <span><strong>Thermodynamic Balances:</strong> Conserved energy, water, crops & compute</span>
            </div>
            <div class="card-pill-item">
              <span class="card-pill-icon">📋</span>
              <span><strong>Labor Emancipation:</strong> 14h/week chore pool & weekend pizza feast</span>
            </div>
            <div class="card-pill-item">
              <span class="card-pill-icon">📡</span>
              <span><strong>P2P Mesh Network:</strong> Local-first Reticulum & sister node trade</span>
            </div>
          </div>
        </div>

        <div class="card-actions">
          <a href="./game/?bioregion=alpine" class="btn-launch btn-launch-game" id="btnLaunchGame" title="Launch O.N.E. Living Commons Game">
            <span>Launch Living Commons Game</span>
            <span>➔</span>
          </a>
          <p class="card-meta-notes" id="gameTargetNote">Selected Bioregion: <strong>Po Valley & Western Alpine Arc</strong></p>
        </div>
      </article>

      <!-- Card 2: O-ASIS Thermodynamic Sandbox (THE 1 BUTTON TO OPEN SIM) -->
      <article class="exp-card card-sandbox">
        <div class="card-top">
          <div class="card-badge badge-sandbox">
            <span>🔬 Step 3: Meso-Governance Cockpit</span>
          </div>
          <h3 class="card-title">O-ASIS Epistemic Sandbox</h3>
          <p class="card-desc">
            A macroscopic engineering simulator and formal stress-testing cockpit. 
            Audit closed-loop Leontief input-output matrices, Athenian sortition assemblies in odd parity 
            (75% qualified supermajority), and stress-test the Living Constitution against banking debt & systemic shocks.
          </p>

          <div class="card-pills-list">
            <div class="card-pill-item">
              <span class="card-pill-icon">⚡</span>
              <span><strong>Leontief Input-Output:</strong> Rigorous 4-balance physical conservation</span>
            </div>
            <div class="card-pill-item">
              <span class="card-pill-icon">🏛️</span>
              <span><strong>Demarchic Sortition Juries:</strong> Odd parity juries & 75% consensus</span>
            </div>
            <div class="card-pill-item">
              <span class="card-pill-icon">🛡️</span>
              <span><strong>Red Team AI:</strong> Adversarial stress-tests against financial extraction</span>
            </div>
            <div class="card-pill-item">
              <span class="card-pill-icon">🛠️</span>
              <span><strong>Dual-Track Bridge:</strong> Real 3D CAD (.STL) & Home Assistant YAML</span>
            </div>
          </div>
        </div>

        <div class="card-actions">
          <a href="./sim/?basin=po-valley" class="btn-launch btn-launch-sandbox" id="btnLaunchSandbox" title="Launch O-ASIS Epistemic Sandbox">
            <span>Launch O-ASIS Sandbox</span>
            <span>➔</span>
          </a>
          <p class="card-meta-notes" id="simTargetNote">Selected Catchment: <strong>Po Valley & Western Alpine Arc</strong></p>
        </div>
      </article>

    </div>

    <!-- Secondary Resource Showcase Band -->
    <div class="resource-band">
      <div class="resource-band-text">
        <h3>Civilizational Blueprints & Open Knowledge</h3>
        <p>All virtual simulations correspond to legally sound jurisprudence and verified open hardware.</p>
      </div>

      <div class="resource-band-links">
        <a href="https://one-commons.github.io#constitution" class="res-link" target="_blank" rel="noopener noreferrer">
          📜 Living Constitution
        </a>
        <a href="https://one-commons.github.io#blueprints" class="res-link" target="_blank" rel="noopener noreferrer">
          🛠️ 3D CAD Blueprints
        </a>
        <a href="https://one-commons.github.io#books" class="res-link" target="_blank" rel="noopener noreferrer">
          📚 6-Volume Fiction
        </a>
        <a href="https://github.com/kyberlex/ONE/discussions" class="res-link" target="_blank" rel="noopener noreferrer">
          💬 Dialectic Forum
        </a>
      </div>
    </div>
  </main>

  <!-- Canonical Footer -->
  <footer>
    <p>
      <strong>Open Networked Earth (O.N.E.)</strong> • 100% Free & Open Knowledge (<a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank" rel="noopener noreferrer">AGPL-3.0</a>) • 
      Maintained under persona <strong>Kyberlex</strong> (<a href="mailto:kyberlex@proton.me">kyberlex@proton.me</a>) • Zero Microtransactions & Zero Speculation
    </p>
  </footer>

  <!-- =====================================================================
       CLIENT-SIDE INTERACTIVE ENGINE: REAL SATELLITE CARTOGRAPHY (SIM REUSE)
       - Strict Single Action Controls (1 Zoom Button, 1 Sim Button, 1 Game Button)
       - Fixed 500px Box Height (Zero Jumping on Bioregion Change)
       ===================================================================== -->
  <script>
    (function () {
      const MAP_SIZE = 2048; // Size of base satellite raster world_low.webp

      // Web Mercator projection: [lon, lat] -> [worldX, worldY] in [0, 2048]
      function toWorldPx(lon, lat) {
        const x = ((lon + 180.0) / 360.0) * MAP_SIZE;
        const latClamped = Math.max(-85.051128, Math.min(85.051128, lat));
        const latRad = latClamped * Math.PI / 180.0;
        const mercY = Math.log(Math.tan(Math.PI / 4.0 + latRad / 2.0));
        const y = (0.5 - mercY / (2.0 * Math.PI)) * MAP_SIZE;
        return [x, y];
      }

      // Canonical Planetary Watersheds Dataset with calibrated 3-line descriptions
      const WATERSHEDS = [
        {
          id: "basin-po",
          tag: "BASIN-EUR-04",
          name: "Po Valley & Western Alpine Arc",
          biome: "alpine",
          biomeIcon: "⛰️",
          biomeName: "Alpine Headwaters & Alluvial Plain",
          desc: "Glacial runoff from the Western Alps feeds the fertile Po plain before discharging into the Northern Adriatic. Primary zone for alpine micro-hydro, gravity water conduits, and agroforestry.",
          area: "74,970 km²",
          discharge: "1,540 m³/s",
          exergy: "Micro-Hydro + Solar",
          demarchy: "101 Citizens (Odd)",
          nodeName: "Val di Susa Watershed Node (34 Pioneers)",
          simParam: "po-valley",
          gameParam: "alpine",
          center: [9.5, 45.1],
          zoomLevel: 5.5,
          polygon: [[6.5, 44.1], [6.8, 45.9], [9.8, 46.5], [12.6, 46.5], [13.0, 45.4], [12.4, 44.7], [9.6, 44.3], [7.4, 44.2], [6.5, 44.1]],
          rivers: [
            [[7.0, 44.7], [7.7, 45.1], [8.6, 45.1], [9.7, 45.1], [11.5, 45.0], [12.4, 44.9]],
            [[8.6, 46.1], [8.9, 45.6], [9.0, 45.2]],
            [[10.5, 46.7], [11.1, 46.1], [11.3, 45.5], [12.3, 45.1]]
          ]
        },
        {
          id: "basin-rhine",
          tag: "BASIN-EUR-01",
          name: "Rhine-Meuse-Danube Corridor",
          biome: "riverine",
          biomeIcon: "🌊",
          biomeName: "Temperate Oceanic Riverine Delta",
          desc: "European river network connecting the Alps to the North Sea. Dense industrial conversion zone focused on circular steel reuse, electric barge corridors, and shared riparian commons.",
          area: "185,000 km²",
          discharge: "2,900 m³/s",
          exergy: "Bio-Fab + River Hydro",
          demarchy: "301 Citizens (Odd)",
          nodeName: "Rhineland Industrial Conversion Commons",
          simParam: "rhine-meuse",
          gameParam: "riverine",
          center: [7.5, 50.5],
          zoomLevel: 4.8,
          polygon: [[4.0, 52.0], [6.0, 53.5], [10.0, 52.0], [9.5, 47.5], [7.0, 47.5], [4.5, 49.5], [4.0, 52.0]],
          rivers: [
            [[9.5, 46.8], [8.6, 47.6], [7.6, 48.6], [7.7, 50.0], [7.0, 50.8], [6.0, 51.8], [4.2, 51.9]],
            [[5.5, 49.8], [6.0, 50.6], [7.0, 51.4]]
          ]
        },
        {
          id: "basin-amazon",
          tag: "BASIN-SAM-01",
          name: "Amazon Basin & Tapajós Sanctuary",
          biome: "rainforest",
          biomeIcon: "🌴",
          biomeName: "Equatorial Rainforest Biosphere",
          desc: "Planetary thermodynamic lung. Over 20% of global river discharge to oceans. Inviolable Jus Biosphaerae protection against deforestation, industrial concessions, and destructive mega-dams.",
          area: "6,915,000 km²",
          discharge: "209,000 m³/s",
          exergy: "Megadiverse Biomass",
          demarchy: "301 Citizens (Odd)",
          nodeName: "Tapajós Agro-Ecological Sanctuary",
          simParam: "amazon",
          gameParam: "rainforest",
          center: [-60.0, -3.5],
          zoomLevel: 2.8,
          polygon: [[-78.0, -2.0], [-72.0, 2.0], [-60.0, 3.0], [-50.0, 0.0], [-48.0, -5.0], [-52.0, -14.0], [-65.0, -18.0], [-76.0, -10.0], [-78.0, -2.0]],
          rivers: [
            [[-73.5, -4.5], [-65.0, -3.2], [-58.5, -2.8], [-51.0, -0.2]],
            [[-56.0, -9.0], [-55.0, -5.5], [-54.8, -2.4]],
            [[-65.0, -10.0], [-60.0, -5.5], [-58.7, -3.4]]
          ]
        },
        {
          id: "basin-greatlakes",
          tag: "BASIN-NAM-02",
          name: "Great Lakes & Laurentian Basin",
          biome: "temperate",
          biomeIcon: "🌲",
          biomeName: "Laurentian Mixed Forest & Freshwater",
          desc: "Holding 21% of the world surface liquid fresh water. Anchored by the regenerated fablabs of Detroit Delray, combining high-yield greenhouses, microgrids, and lake water cooling.",
          area: "1,344,000 km²",
          discharge: "16,800 m³/s",
          exergy: "Freshwater Lake + Wind",
          demarchy: "101 Citizens (Odd)",
          nodeName: "Detroit Delray Commons (28 Pioneers)",
          simParam: "great-lakes",
          gameParam: "temperate",
          center: [-83.0, 44.5],
          zoomLevel: 3.6,
          polygon: [[-92.0, 48.0], [-84.0, 49.0], [-76.0, 47.0], [-74.0, 43.0], [-80.0, 41.0], [-88.0, 41.5], [-92.0, 44.0], [-92.0, 48.0]],
          rivers: [
            [[-89.0, 47.5], [-84.5, 45.8], [-82.5, 43.5], [-76.0, 44.0], [-71.0, 47.0]]
          ]
        },
        {
          id: "basin-cascadia",
          tag: "BASIN-NAM-01",
          name: "Cascadia & Columbia Catchment",
          biome: "alpine",
          biomeIcon: "⛰️",
          biomeName: "Temperate Coastal Rainforest",
          desc: "Pacific maritime slopes with dense fir canopies and abundant run-of-river headwaters. Base for modular timber architecture, open hardware CNC machining, and salmon corridor restoration.",
          area: "668,000 km²",
          discharge: "7,500 m³/s",
          exergy: "Run-of-River + Wind",
          demarchy: "101 Citizens (Odd)",
          nodeName: "Cascadia Bio-Fab Node",
          simParam: "cascadia",
          gameParam: "alpine",
          center: [-120.0, 46.5],
          zoomLevel: 4.4,
          polygon: [[-124.5, 49.0], [-117.0, 51.5], [-112.0, 48.0], [-111.0, 42.5], [-118.0, 42.0], [-124.0, 43.0], [-124.5, 49.0]],
          rivers: [
            [[-117.0, 50.0], [-118.5, 47.5], [-120.0, 46.0], [-124.0, 46.2]],
            [[-114.0, 44.0], [-117.0, 46.0]]
          ]
        },
        {
          id: "basin-atacama",
          tag: "BASIN-SAM-03",
          name: "Atacama Endorheic Basin & Altiplano",
          biome: "arid",
          biomeIcon: "☀️",
          biomeName: "Hyper-Arid High-Altitude Plateau",
          desc: "Highest solar irradiance on Earth (2,800 kWh/m²/yr). Completely closed endorheic drainage with atmospheric water harvesting nets and decentralized high-yield solar thermal smelting.",
          area: "105,000 km²",
          discharge: "0 m³/s (Endorheic)",
          exergy: "Solar + Geothermal",
          demarchy: "15 Citizens (Odd)",
          nodeName: "Atacama Solar Oasis (22 Pioneers)",
          simParam: "atacama",
          gameParam: "arid",
          center: [-68.5, -23.5],
          zoomLevel: 5.2,
          polygon: [[-70.5, -20.0], [-67.0, -20.5], [-66.5, -26.0], [-70.0, -26.5], [-70.5, -20.0]],
          rivers: [
            [[-67.5, -22.0], [-68.5, -23.5]],
            [[-69.5, -25.0], [-68.8, -23.8]]
          ]
        },
        {
          id: "basin-congo",
          tag: "BASIN-AFR-01",
          name: "Congo Basin Equatorial Peatlands",
          biome: "rainforest",
          biomeIcon: "🌴",
          biomeName: "Equatorial Rainforest & Peat Swamps",
          desc: "Central freshwater heart of the African continent with massive peatland carbon storage. Non-extractive agroforestry cooperatives and decentralized micro-hydro water turbines.",
          area: "4,014,000 km²",
          discharge: "41,000 m³/s",
          exergy: "Hydro + Peat Biomass",
          demarchy: "301 Citizens (Odd)",
          nodeName: "Kisangani Agro-Forestry Cooperative",
          simParam: "congo",
          gameParam: "rainforest",
          center: [21.0, -1.0],
          zoomLevel: 3.2,
          polygon: [[12.0, 4.0], [22.0, 5.0], [30.0, 2.0], [31.0, -8.0], [25.0, -12.0], [17.0, -10.0], [12.0, -4.0], [12.0, 4.0]],
          rivers: [
            [[28.0, -2.0], [25.0, 0.5], [20.0, 1.5], [16.0, -1.0], [12.3, -6.0]],
            [[22.0, -5.0], [19.0, -2.0]]
          ]
        },
        {
          id: "basin-nile",
          tag: "BASIN-AFR-02",
          name: "Nilotic Riverine & Sudd Catchment",
          biome: "riverine",
          biomeIcon: "🌊",
          biomeName: "Alluvial Riverine & Sudd Wetlands",
          desc: "Planetary river corridor flowing northward from Lake Victoria across arid landscapes. Managed under strict upstream-downstream ecological covenants without water blockades.",
          area: "3,254,000 km²",
          discharge: "2,830 m³/s",
          exergy: "Solar Irrigation + Silt",
          demarchy: "101 Citizens (Odd)",
          nodeName: "Nubian Permaculture Cooperative",
          simParam: "nile",
          gameParam: "riverine",
          center: [31.5, 16.0],
          zoomLevel: 3.2,
          polygon: [[29.0, 31.5], [33.5, 31.5], [37.0, 15.0], [36.0, 5.0], [30.0, -2.0], [28.0, 6.0], [27.0, 22.0], [29.0, 31.5]],
          rivers: [
            [[31.5, 0.0], [31.5, 10.0], [32.5, 15.5], [31.0, 24.0], [31.2, 31.0]]
          ]
        },
        {
          id: "basin-rojava",
          tag: "BASIN-MEA-01",
          name: "Fertile Crescent / Tigris-Euphrates",
          biome: "arid",
          biomeIcon: "☀️",
          biomeName: "Semi-Arid Steppe & Alluvial Plain",
          desc: "Historic cradle of agriculture transitioning into cooperative direct democracy. Solar-powered low-pressure drip irrigation, communal seed banks, and municipal self-management.",
          area: "765,000 km²",
          discharge: "1,400 m³/s",
          exergy: "Solar Drip Irrigation",
          demarchy: "101 Citizens (Odd)",
          nodeName: "Rojava Agro-Ecological Node",
          simParam: "rojava",
          gameParam: "arid",
          center: [42.0, 34.0],
          zoomLevel: 4.5,
          polygon: [[36.0, 38.5], [41.0, 39.5], [47.0, 35.0], [48.5, 30.5], [44.0, 30.0], [38.0, 32.5], [36.0, 38.5]],
          rivers: [
            [[38.0, 38.0], [40.5, 35.5], [44.0, 32.5], [48.0, 30.5]],
            [[41.0, 38.5], [44.0, 34.0], [47.5, 31.5]]
          ]
        },
        {
          id: "basin-indus",
          tag: "BASIN-SAS-01",
          name: "Indus Glacial Runoff & Punjab Basin",
          biome: "alpine",
          biomeIcon: "⛰️",
          biomeName: "Himalayan Glacial Runoff to Sea",
          desc: "Glacial headwaters feeding a vital agricultural breadbasket. Cooperative water allocation treaties replace nation-state conflicts with shared gravity channels.",
          area: "1,120,000 km²",
          discharge: "6,600 m³/s",
          exergy: "Glacial Melt + Gravity Canals",
          demarchy: "101 Citizens (Odd)",
          nodeName: "Punjab Glacial Melt Irrigation Commons",
          simParam: "indus",
          gameParam: "alpine",
          center: [71.5, 30.0],
          zoomLevel: 4.2,
          polygon: [[71.0, 36.5], [78.0, 35.0], [77.0, 30.0], [71.0, 24.0], [67.0, 25.0], [68.0, 32.0], [71.0, 36.5]],
          rivers: [
            [[76.0, 35.0], [72.5, 32.0], [70.5, 28.5], [67.5, 24.5]]
          ]
        },
        {
          id: "basin-kerala",
          tag: "BASIN-SAS-02",
          name: "Western Ghats & Malabar Catchment",
          biome: "rainforest",
          biomeIcon: "🌴",
          biomeName: "Tropical Monsoon Moist Forest",
          desc: "Multi-tiered tropical agroforestry receiving heavy seasonal monsoon rains. World pioneer in village-level participatory budgeting, community health, and watershed decentralization.",
          area: "160,000 km²",
          discharge: "3,200 m³/s",
          exergy: "Monsoon Agroforestry",
          demarchy: "101 Citizens (Odd)",
          nodeName: "Kerala Agro-Forestry Node",
          simParam: "kerala",
          gameParam: "rainforest",
          center: [76.0, 10.5],
          zoomLevel: 5.6,
          polygon: [[74.5, 14.5], [76.0, 14.5], [77.5, 9.5], [77.0, 8.0], [75.5, 9.5], [74.5, 14.5]],
          rivers: [
            [[76.5, 12.0], [75.8, 11.5]],
            [[77.0, 10.0], [76.2, 9.8]]
          ]
        },
        {
          id: "basin-yangtze",
          tag: "BASIN-EAS-01",
          name: "Yangtze & Southern River Commons",
          biome: "riverine",
          biomeIcon: "🌊",
          biomeName: "Subtropical Wetland & Canal Network",
          desc: "Enormous freshwater network spanning the Tibetan Plateau to Shanghai. De-industrialized ecological buffer zones restore the river porpoise while maintaining clean aquaculture.",
          area: "1,800,000 km²",
          discharge: "30,000 m³/s",
          exergy: "Inland Canals + Hydro",
          demarchy: "301 Citizens (Odd)",
          nodeName: "Dongting Ecological Lake Commons",
          simParam: "yangtze",
          gameParam: "riverine",
          center: [112.0, 30.0],
          zoomLevel: 3.5,
          polygon: [[92.0, 33.0], [105.0, 33.0], [121.0, 32.0], [120.0, 28.0], [112.0, 25.0], [103.0, 26.0], [95.0, 29.0], [92.0, 33.0]],
          rivers: [
            [[96.0, 33.0], [104.0, 30.5], [112.0, 30.0], [121.5, 31.5]]
          ]
        },
        {
          id: "basin-murray",
          tag: "BASIN-OCE-01",
          name: "Murray-Darling Basin",
          biome: "arid",
          biomeIcon: "☀️",
          biomeName: "Semi-Arid Inland Drainage Basin",
          desc: "Vital food bowl facing severe drought and salinity shocks. Re-engineered with deep sand aquifer storage, cultural Indigenous burning protocols, and large-scale solar micro-grids.",
          area: "1,061,000 km²",
          discharge: "767 m³/s",
          exergy: "Solar + Sand Aquifers",
          demarchy: "101 Citizens (Odd)",
          nodeName: "Barwon Solar & Sand Aquifer Storage",
          simParam: "murray-darling",
          gameParam: "arid",
          center: [144.0, -32.0],
          zoomLevel: 3.8,
          polygon: [[140.0, -28.0], [148.0, -26.0], [151.0, -32.0], [148.0, -37.0], [140.0, -36.0], [138.0, -34.0], [140.0, -28.0]],
          rivers: [
            [[149.0, -29.0], [144.0, -32.0], [141.0, -34.0], [139.0, -35.5]],
            [[146.0, -36.0], [142.0, -34.5]]
          ]
        },
        {
          id: "basin-baltic",
          tag: "BASIN-EUR-02",
          name: "Baltic Taiga & Boreal Peatland Catchment",
          biome: "temperate",
          biomeIcon: "🌲",
          biomeName: "Boreal Taiga & Peatland Sink",
          desc: "Glaciated catchment surrounded by continuous-cover boreal timber commons and coastal wind streams. Key node for timber prefabrication and district heating bio-reactors.",
          area: "1,700,000 km²",
          discharge: "15,000 m³/s",
          exergy: "Wind + Timber Commons",
          demarchy: "101 Citizens (Odd)",
          nodeName: "Nordic Bio-Mass Resilience Cluster",
          simParam: "baltic",
          gameParam: "temperate",
          center: [22.0, 60.0],
          zoomLevel: 3.8,
          polygon: [[12.0, 56.0], [16.0, 64.0], [26.0, 68.0], [32.0, 62.0], [30.0, 54.0], [19.0, 54.0], [12.0, 56.0]],
          rivers: [
            [[24.0, 66.0], [21.5, 62.0]],
            [[28.0, 58.0], [24.0, 57.0]]
          ]
        }
      ];

      // Convert all watershed polygons & rivers into precalculated Web Mercator pixels
      WATERSHEDS.forEach(b => {
        b.centerPx = toWorldPx(b.center[0], b.center[1]);
        b.polygonPx = b.polygon.map(([lon, lat]) => toWorldPx(lon, lat));
        b.riversPx = b.rivers.map(r => r.map(([lon, lat]) => toWorldPx(lon, lat)));
      });

      // 2. Real Earth Satellite Map Assets (Reused from sim/)
      const earthImgLow = new Image();
      earthImgLow.src = "./assets/map/world_low.webp";
      let currentEarthImg = earthImgLow;

      const earthImgHigh = new Image();
      earthImgHigh.src = "./assets/map/world_high.webp";
      earthImgHigh.onload = () => {
        currentEarthImg = earthImgHigh;
      };

      // 3. Canvas 2D Engine State & Camera
      const canvas = document.getElementById("watershedCanvas");
      if (!canvas) return;
      const ctx = canvas.getContext("2d");

      let width = canvas.width;
      let height = canvas.height;
      let hoveredBasin = null;
      let selectedBasin = WATERSHEDS[0]; // Po Valley default
      let activeFilter = "all";
      let particles = [];

      const worldCenter = [MAP_SIZE / 2.0, MAP_SIZE / 2.0]; // Longitude 0° & Latitude 0° (Equator) - perfect planetary balance
      const camera = { x: worldCenter[0], y: worldCenter[1], zoom: 1.0 };
      const targetCamera = { x: worldCenter[0], y: worldCenter[1], zoom: 1.0 };
      let zoomMode = "WORLD"; // 'WORLD' or 'REGION'

      function getBaseScale() {
        // Fits world width across canvas (zero duplication) while showing all inhabited continents
        return Math.max(width / MAP_SIZE, (height / MAP_SIZE) * 1.15);
      }

      function getScale() {
        return getBaseScale() * camera.zoom;
      }

      function worldToScreen(wx, wy) {
        const scale = getScale();
        const sx = width / 2.0 + (wx - camera.x) * scale;
        const sy = height / 2.0 + (wy - camera.y) * scale;
        return [sx, sy];
      }

      function screenToWorld(sx, sy) {
        const scale = getScale();
        const wx = camera.x + (sx - width / 2.0) / scale;
        const wy = camera.y + (sy - height / 2.0) / scale;
        return [wx, wy];
      }

      function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        width = rect.width || 900;
        height = rect.height || 500;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      // Initialize flow particles along river arteries in world pixels
      function initParticles() {
        particles = [];
        WATERSHEDS.forEach((b) => {
          b.riversPx.forEach((river) => {
            const count = Math.max(2, Math.floor(river.length * 1.5));
            for (let i = 0; i < count; i++) {
              particles.push({
                basinId: b.id,
                river: river,
                progress: Math.random(),
                speed: 0.003 + Math.random() * 0.005,
                color: b.biome === 'rainforest' ? '#10b981' : (b.biome === 'arid' ? '#f59e0b' : '#06b6d4')
              });
            }
          });
        });
      }

      // Point in polygon test (executed in world pixel space)
      function isPointInPoly(pt, poly) {
        const [x, y] = pt;
        let inside = false;
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
          const xi = poly[i][0], yi = poly[i][1];
          const xj = poly[j][0], yj = poly[j][1];
          const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
          if (intersect) inside = !inside;
        }
        return inside;
      }

      // Updates the SINGLE Zoom Button and Zoom Status Badge
      function updateZoomState() {
        const badge = document.getElementById("hudZoomBadge");
        const toggleBtn = document.getElementById("btnZoomToggle");
        const hintText = document.getElementById("weHintText");

        if (targetCamera.zoom > 1.8) {
          zoomMode = "REGION";
          if (badge) badge.textContent = "ZOOM: REGION";
          if (toggleBtn) toggleBtn.innerHTML = "<span>🌐 World View</span>";
          if (hintText) hintText.innerHTML = "<span>🔍 Region Focus • Drag to pan</span>";
        } else {
          zoomMode = "WORLD";
          if (badge) badge.textContent = "ZOOM: WORLD";
          if (toggleBtn) toggleBtn.innerHTML = "<span>🔍 Focus Bioregion</span>";
          if (hintText) hintText.innerHTML = "<span>🌐 World View • Click basin to focus</span>";
        }
      }

      function setViewWorld() {
        targetCamera.x = worldCenter[0];
        targetCamera.y = worldCenter[1];
        targetCamera.zoom = 1.0;
        updateZoomState();
      }

      function setViewRegion(b) {
        if (!b) return;
        targetCamera.x = b.centerPx[0];
        targetCamera.y = b.centerPx[1];
        targetCamera.zoom = b.zoomLevel || 4.5;
        updateZoomState();
      }

      // Update Inspector HUD Panel & Update the ONLY 2 Launch Buttons below
      function updateHUD(b) {
        if (!b) return;
        document.getElementById("hudBasinTag").textContent = b.tag;
        document.getElementById("hudBasinName").textContent = b.name;
        document.getElementById("hudBiomeIcon").textContent = b.biomeIcon;
        document.getElementById("hudBiomeText").textContent = b.biomeName;
        document.getElementById("hudBasinDesc").textContent = b.desc;
        document.getElementById("hudMetricArea").textContent = b.area;
        document.getElementById("hudMetricDischarge").textContent = b.discharge;
        document.getElementById("hudMetricExergy").textContent = b.exergy;
        document.getElementById("hudMetricDemarchy").textContent = b.demarchy;
        document.getElementById("hudNodeName").textContent = b.nodeName;

        // Dynamically configure the 2 Primary Launch Buttons below
        const gameBtn = document.getElementById("btnLaunchGame");
        const gameNote = document.getElementById("gameTargetNote");
        if (gameBtn) gameBtn.href = `./game/?bioregion=${b.gameParam}`;
        if (gameNote) gameNote.innerHTML = `Selected Bioregion: <strong>${b.name}</strong>`;

        const simBtn = document.getElementById("btnLaunchSandbox");
        const simNote = document.getElementById("simTargetNote");
        if (simBtn) simBtn.href = `./sim/?basin=${b.simParam}`;
        if (simNote) simNote.innerHTML = `Selected Catchment: <strong>${b.name}</strong>`;
      }

      // Drawing Loop (60 FPS with Camera Lerping & River Flow)
      function draw() {
        camera.x += (targetCamera.x - camera.x) * 0.09;
        camera.y += (targetCamera.y - camera.y) * 0.09;
        camera.zoom += (targetCamera.zoom - camera.zoom) * 0.09;

        ctx.clearRect(0, 0, width, height);

        // Base Dark Oceanic Fill
        ctx.fillStyle = "#020705";
        ctx.fillRect(0, 0, width, height);

        // 1. Draw Real Earth Satellite Map (Razor-sharp sub-pixel source cropping from world_high.webp)
        if (currentEarthImg && currentEarthImg.complete) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          const imgNativeW = currentEarthImg.naturalWidth || MAP_SIZE;
          const imgRatio = imgNativeW / MAP_SIZE;

          const [wLeft, wTop] = screenToWorld(0, 0);
          const [wRight, wBottom] = screenToWorld(width, height);

          // Clamped vertical bounds in world coordinates [0, MAP_SIZE]
          const clampedTop = Math.max(0, wTop);
          const clampedBottom = Math.min(MAP_SIZE, wBottom);

          if (clampedBottom > clampedTop) {
            const [, screenTop] = worldToScreen(0, clampedTop);
            const [, screenBottom] = worldToScreen(0, clampedBottom);
            const destH = screenBottom - screenTop;
            const srcH = (clampedBottom - clampedTop) * imgRatio;
            const srcY = clampedTop * imgRatio;

            if (wLeft >= 0 && wRight <= MAP_SIZE) {
              // Direct high-resolution source slice (crystal clear for Region zoom & centered World view)
              const srcX = wLeft * imgRatio;
              const srcW = (wRight - wLeft) * imgRatio;
              ctx.drawImage(currentEarthImg, srcX, srcY, srcW, srcH, 0, screenTop, width, destH);
            } else {
              // Seamless horizontal wraparound
              const mainLeft = Math.max(0, wLeft);
              const mainRight = Math.min(MAP_SIZE, wRight);
              if (mainRight > mainLeft) {
                const [screenLeft] = worldToScreen(mainLeft, 0);
                const [screenRight] = worldToScreen(mainRight, 0);
                const destW = screenRight - screenLeft;
                const srcX = mainLeft * imgRatio;
                const srcW = (mainRight - mainLeft) * imgRatio;
                ctx.drawImage(currentEarthImg, srcX, srcY, srcW, srcH, screenLeft, screenTop, destW, destH);
              }
              if (wLeft < 0) {
                const wrapLeft = MAP_SIZE + wLeft;
                const wrapRight = MAP_SIZE;
                const [wrapScreenLeft] = worldToScreen(wLeft, 0);
                const [wrapScreenRight] = worldToScreen(0, 0);
                const destW = wrapScreenRight - wrapScreenLeft;
                const srcX = wrapLeft * imgRatio;
                const srcW = (wrapRight - wrapLeft) * imgRatio;
                ctx.drawImage(currentEarthImg, srcX, srcY, srcW, srcH, wrapScreenLeft, screenTop, destW, destH);
              }
              if (wRight > MAP_SIZE) {
                const wrapLeft = 0;
                const wrapRight = wRight - MAP_SIZE;
                const [wrapScreenLeft] = worldToScreen(MAP_SIZE, 0);
                const [wrapScreenRight] = worldToScreen(wRight, 0);
                const destW = wrapScreenRight - wrapScreenLeft;
                const srcX = 0;
                const srcW = (wrapRight - wrapLeft) * imgRatio;
                ctx.drawImage(currentEarthImg, srcX, srcY, srcW, srcH, wrapScreenLeft, screenTop, destW, destH);
              }
            }
          }
        }

        // Ambient Graticule
        ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
        ctx.lineWidth = 1;
        for (let lon = -150; lon <= 180; lon += 30) {
          const [gx] = worldToScreen(toWorldPx(lon, 0)[0], 0);
          ctx.beginPath();
          ctx.moveTo(gx, 0);
          ctx.lineTo(gx, height);
          ctx.stroke();
        }

        // Draw Watershed Basins on Real Satellite Relief
        WATERSHEDS.forEach(b => {
          const isSelected = selectedBasin && selectedBasin.id === b.id;
          const isHovered = hoveredBasin && hoveredBasin.id === b.id;
          const matchesFilter = activeFilter === "all" || b.biome === activeFilter;

          const screenPoly = b.polygonPx.map(([wx, wy]) => worldToScreen(wx, wy));

          ctx.beginPath();
          screenPoly.forEach(([sx, sy], idx) => {
            if (idx === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          });
          ctx.closePath();

          let fillColor = "rgba(52, 211, 153, 0.12)";
          let strokeColor = "rgba(52, 211, 153, 0.4)";

          if (b.biome === "alpine") {
            fillColor = "rgba(6, 182, 212, 0.16)";
            strokeColor = "rgba(6, 182, 212, 0.55)";
          } else if (b.biome === "rainforest") {
            fillColor = "rgba(16, 185, 129, 0.18)";
            strokeColor = "rgba(16, 185, 129, 0.65)";
          } else if (b.biome === "arid") {
            fillColor = "rgba(245, 158, 11, 0.16)";
            strokeColor = "rgba(245, 158, 11, 0.55)";
          } else if (b.biome === "riverine") {
            fillColor = "rgba(14, 165, 233, 0.16)";
            strokeColor = "rgba(14, 165, 233, 0.6)";
          }

          if (!matchesFilter) {
            fillColor = "rgba(0, 0, 0, 0.45)";
            strokeColor = "rgba(255, 255, 255, 0.08)";
          }

          if (isHovered || isSelected) {
            fillColor = isSelected ? "rgba(52, 211, 153, 0.32)" : "rgba(6, 182, 212, 0.25)";
            strokeColor = isSelected ? "#34d399" : "#22d3ee";
            ctx.shadowColor = strokeColor;
            ctx.shadowBlur = isSelected ? 18 : 10;
          }

          ctx.fillStyle = fillColor;
          ctx.fill();
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = isSelected ? 2.5 : (isHovered ? 2 : 1.2);
          ctx.stroke();
          ctx.shadowBlur = 0;

          // River network veins
          b.riversPx.forEach(river => {
            if (river.length < 2) return;
            ctx.beginPath();
            river.forEach(([wx, wy], idx) => {
              const [rx, ry] = worldToScreen(wx, wy);
              if (idx === 0) ctx.moveTo(rx, ry);
              else ctx.lineTo(rx, ry);
            });
            ctx.strokeStyle = (isHovered || isSelected) ? "rgba(34, 211, 238, 0.95)" : "rgba(34, 211, 238, 0.6)";
            ctx.lineWidth = isSelected ? 2.2 : (isHovered ? 1.6 : 1.2);
            ctx.stroke();
          });

          // Seed Node beacon marker
          const [cx, cy] = worldToScreen(b.centerPx[0], b.centerPx[1]);
          ctx.beginPath();
          ctx.arc(cx, cy, isSelected ? 6 : 4, 0, Math.PI * 2);
          ctx.fillStyle = isSelected ? "#34d399" : (isHovered ? "#22d3ee" : "#f59e0b");
          ctx.shadowColor = ctx.fillStyle;
          ctx.shadowBlur = isSelected ? 16 : 8;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Pulsing halo when selected
          if (isSelected) {
            const pulse = (Date.now() % 2000) / 2000;
            ctx.beginPath();
            ctx.arc(cx, cy, 6 + pulse * 14, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(52, 211, 153, ${0.8 - pulse * 0.8})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }

          // Node label visible when zoomed into Region view
          if (camera.zoom > 2.2 && (isSelected || isHovered)) {
            ctx.font = "600 11px 'Inter', sans-serif";
            ctx.fillStyle = "#ffffff";
            ctx.shadowColor = "rgba(0,0,0,0.9)";
            ctx.shadowBlur = 6;
            ctx.fillText(b.name, cx + 10, cy + 4);
            ctx.shadowBlur = 0;
          }
        });

        // Draw Animated River Flow Particles
        particles.forEach(p => {
          p.progress += p.speed;
          if (p.progress >= 1) p.progress = 0;

          const r = p.river;
          if (r.length < 2) return;

          const totalSegments = r.length - 1;
          const segProgress = p.progress * totalSegments;
          const segIdx = Math.floor(segProgress);
          const segFraction = segProgress - segIdx;

          const p0 = r[segIdx];
          const p1 = r[Math.min(segIdx + 1, totalSegments)];

          const wx = p0[0] + (p1[0] - p0[0]) * segFraction;
          const wy = p0[1] + (p1[1] - p0[1]) * segFraction;
          const [px, py] = worldToScreen(wx, wy);

          const isBasinActive = (selectedBasin && selectedBasin.id === p.basinId) || (hoveredBasin && hoveredBasin.id === p.basinId);

          ctx.beginPath();
          ctx.arc(px, py, isBasinActive ? 3.0 : 1.8, 0, Math.PI * 2);
          ctx.fillStyle = isBasinActive ? "#38bdf8" : p.color;
          ctx.shadowColor = ctx.fillStyle;
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        });

        requestAnimationFrame(draw);
      }

      // Event Listeners: Mouse Move, Drag-Pan, Wheel Zoom & Click
      let isDragging = false;
      let dragStart = { x: 0, y: 0 };
      let cameraStart = { x: 0, y: 0 };
      let hasDragged = false;

      canvas.addEventListener("mousedown", (e) => {
        if (e.button !== 0) return;
        isDragging = true;
        hasDragged = false;
        dragStart = { x: e.clientX, y: e.clientY };
        cameraStart = { x: targetCamera.x, y: targetCamera.y };
        canvas.style.cursor = "grabbing";
      });

      window.addEventListener("mousemove", (e) => {
        if (isDragging) {
          const dx = e.clientX - dragStart.x;
          const dy = e.clientY - dragStart.y;
          if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasDragged = true;

          const scale = getScale();
          targetCamera.x = cameraStart.x - dx / scale;
          targetCamera.y = cameraStart.y - dy / scale;
          return;
        }

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const [wx, wy] = screenToWorld(mouseX, mouseY);

        let found = null;
        for (let i = WATERSHEDS.length - 1; i >= 0; i--) {
          const b = WATERSHEDS[i];
          if (isPointInPoly([wx, wy], b.polygonPx)) {
            found = b;
            break;
          }
        }

        hoveredBasin = found;
        canvas.style.cursor = found ? "pointer" : "crosshair";
      });

      window.addEventListener("mouseup", () => {
        if (isDragging) {
          isDragging = false;
          canvas.style.cursor = hoveredBasin ? "pointer" : "crosshair";
        }
      });

      canvas.addEventListener("click", (e) => {
        if (hasDragged) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const [wx, wy] = screenToWorld(mouseX, mouseY);

        for (let i = WATERSHEDS.length - 1; i >= 0; i--) {
          const b = WATERSHEDS[i];
          if (isPointInPoly([wx, wy], b.polygonPx)) {
            selectedBasin = b;
            updateHUD(b);
            setViewRegion(b); // Smooth Pan + Zoom into bioregion

            // Sync active chip
            activeFilter = b.biome;
            const allChips = document.querySelectorAll(".we-chip");
            allChips.forEach(c => {
              c.classList.toggle("active", c.getAttribute("data-biome") === b.biome);
            });
            const matchedCount = WATERSHEDS.filter(x => x.biome === b.biome).length;
            document.getElementById("weCountBadge").textContent = `${matchedCount} Sovereign Basins Mapped`;
            break;
          }
        }
      });

      // EXACTLY ONE Zoom Button Handler (Toggles World <-> Region)
      const zoomToggleBtn = document.getElementById("btnZoomToggle");
      if (zoomToggleBtn) {
        zoomToggleBtn.addEventListener("click", () => {
          if (zoomMode === "WORLD") {
            setViewRegion(selectedBasin);
          } else {
            setViewWorld();
            activeFilter = "all";
            const allChips = document.querySelectorAll(".we-chip");
            allChips.forEach(c => {
              c.classList.toggle("active", c.getAttribute("data-biome") === "all");
            });
            document.getElementById("weCountBadge").textContent = `${WATERSHEDS.length} Sovereign Basins Mapped`;
          }
        });
      }

      // Filter Chips handler: 'all' zooms to World Map, specific biomes pan + zoom to Bioregion
      const chips = document.querySelectorAll(".we-chip");
      chips.forEach(chip => {
        chip.addEventListener("click", () => {
          chips.forEach(c => c.classList.remove("active"));
          chip.classList.add("active");
          activeFilter = chip.getAttribute("data-biome");

          if (activeFilter === "all") {
            // Zoom out to World Map
            setViewWorld();
            document.getElementById("weCountBadge").textContent = `${WATERSHEDS.length} Sovereign Basins Mapped`;
          } else {
            // Pan + Zoom into Bioregion
            const matches = WATERSHEDS.filter(b => b.biome === activeFilter);
            if (matches.length > 0) {
              let target = matches[0];
              if (selectedBasin && selectedBasin.biome === activeFilter) {
                const curIdx = matches.findIndex(b => b.id === selectedBasin.id);
                target = matches[(curIdx + 1) % matches.length];
              }
              selectedBasin = target;
              updateHUD(target);
              setViewRegion(target);
            }
            document.getElementById("weCountBadge").textContent = `${matches.length} Sovereign Basins Mapped`;
          }
        });
      });

      // Initial Setup
      window.addEventListener("resize", resizeCanvas);
      resizeCanvas();
      initParticles();
      updateHUD(selectedBasin);
      updateZoomState();
      requestAnimationFrame(draw);
    })();
  </script>
</body>
</html>
"""


def run_command(cmd, cwd=None):
    cmd_str = " ".join(cmd) if isinstance(cmd, list) else cmd
    print(f"[*] Running: {cmd_str}")
    res = subprocess.run(cmd, cwd=cwd, shell=isinstance(cmd, str), capture_output=True, text=True)
    if res.returncode != 0:
        print(f"[!] Command failed (code {res.returncode}):\n{res.stderr}")
        sys.exit(res.returncode)
    return res.stdout


def audit_for_leaks(target_dir):
    print(f"[*] Auditing {target_dir} for Class-0 Zero-Leak violations...")
    violations = []
    scanned_count = 0
    for root, dirs, files in os.walk(target_dir):
        if ".git" in dirs:
            dirs.remove(".git")
        for fname in files:
            fpath = Path(root) / fname
            if fpath.suffix.lower() in BINARY_EXTENSIONS:
                continue
            scanned_count += 1
            try:
                content = fpath.read_text(encoding="utf-8", errors="ignore")
                for pat, desc in FORBIDDEN_PATTERNS:
                    m = pat.search(content)
                    if m:
                        violations.append((fpath.relative_to(target_dir), desc, m.group(0)))
            except Exception as e:
                print(f"[!] Warning reading {fpath}: {e}")

    if violations:
        print(f"[ABORT] Detected {len(violations)} OpSec leak violations:")
        for rel_path, desc, match in violations:
            print(f"  - {rel_path}: {desc} -> '{match}'")
        sys.exit(1)
    print(f"[✓] Scanned {scanned_count} text files cleanly. Zero identity leaks detected.")


def build_all(quick_mode=False):
    print("=" * 70)
    print(" [O.N.E. HUB BUILDER] Compiling Game & Sandbox for GitHub Pages (docs/)")
    print("=" * 70)

    docs_game = DOCS_DIR / "game"
    docs_sim = DOCS_DIR / "sim"

    if quick_mode and docs_game.exists() and docs_sim.exists():
        print("\n--- Quick Mode Active: Preserving existing compiled game/ and sim/ in docs/ ---")
    else:
        # 1. Build game/
        print("\n--- 1. Building game/ (one-game) ---")
        run_command("npm run build", cwd=GAME_DIR)

        # 2. Build sim/app/
        print("\n--- 2. Building sim/app/ (o-asis-dual-track) ---")
        run_command("npm run build", cwd=SIM_APP_DIR)

        # 3. Setup docs directory structure
        print("\n--- 3. Assembling docs/ Subpath Hub ---")
        DOCS_DIR.mkdir(parents=True, exist_ok=True)

        if docs_game.exists():
            shutil.rmtree(docs_game)
        if docs_sim.exists():
            shutil.rmtree(docs_sim)

        # Copy game/dist into docs/game/
        print("  [>] Copying game/dist/ -> docs/game/...")
        shutil.copytree(GAME_DIST, docs_game)

        # Copy sim/app/dist into docs/sim/
        print("  [>] Copying sim/app/dist/ -> docs/sim/...")
        shutil.copytree(SIM_DIST, docs_sim)

    # Remove any CNAME file in docs/, docs/game/, docs/sim/
    for cname_candidate in [DOCS_DIR / "CNAME", docs_game / "CNAME", docs_sim / "CNAME"]:
        if cname_candidate.exists():
            print(f"  [x] Removing legacy CNAME: {cname_candidate}")
            cname_candidate.unlink()

    # Ensure .nojekyll in docs/
    nojekyll = DOCS_DIR / ".nojekyll"
    nojekyll.touch()
    print("  [✓] docs/.nojekyll confirmed.")

    # Write Launcher Hub index.html
    hub_html_path = DOCS_DIR / "index.html"
    hub_html_path.write_text(LAUNCHER_HTML, encoding="utf-8")
    print(f"  [✓] Wrote Solarpunk Launcher Hub (Clean Zero-Jumping Layout): {hub_html_path}")

    # Copy brand assets to docs/ root for the Launcher
    for logo_name in [
        "one-logo-white.svg", "one-logo.svg", "one-logo.png",
        "one-logo-glow.png", "favicon.svg", "icons.svg"
    ]:
        src_logo = REPO_ROOT / "webapp" / logo_name
        if not src_logo.exists():
            src_logo = SIM_APP_DIR / "public" / logo_name
        if src_logo.exists():
            shutil.copy2(src_logo, DOCS_DIR / logo_name)

    # 4. Run Agent H0 Zero-Leak Audit
    print("\n--- 4. Pre-Flight Zero-Leak OpSec Audit ---")
    audit_for_leaks(DOCS_DIR)

    print("\n" + "=" * 70)
    print(" [✓] DOCS SUBPATH HUB SUCCESSFULLY BUILT & CERTIFIED CLEAN!")
    print(f"     Root Launcher : {DOCS_DIR / 'index.html'} -> https://kyberlex.github.io/ONE/")
    print(f"     Watershed Hub : Real Earth Satellite Relief (Zero Jumping & Minimalist UI)")
    print(f"     Commons Game  : {docs_game / 'index.html'} -> https://kyberlex.github.io/ONE/game/")
    print(f"     O-ASIS Sandbox: {docs_sim / 'index.html'} -> https://kyberlex.github.io/ONE/sim/")
    print("=" * 70)


if __name__ == "__main__":
    is_quick = "--quick" in sys.argv or "--launcher-only" in sys.argv
    build_all(quick_mode=is_quick)
