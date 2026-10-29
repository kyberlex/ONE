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
      height: 560px;
      max-height: 560px;
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

    /* Inspector HUD: Fixed 560px Height with Clean Internal Scroll */
    .we-hud {
      background: rgba(4, 12, 10, 0.78);
      border: 1px solid rgba(52, 211, 153, 0.22);
      border-radius: 14px;
      padding: 18px 20px;
      height: 560px;
      max-height: 560px;
      overflow-y: auto;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      scrollbar-width: thin;
      scrollbar-color: rgba(52, 211, 153, 0.25) rgba(0, 0, 0, 0.2);
    }

    .we-hud::-webkit-scrollbar {
      width: 5px;
    }
    .we-hud::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
    }
    .we-hud::-webkit-scrollbar-thumb {
      background: rgba(52, 211, 153, 0.25);
      border-radius: 4px;
    }
    .we-hud::-webkit-scrollbar-thumb:hover {
      background: rgba(52, 211, 153, 0.45);
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
      font-size: 1.2rem;
      font-weight: 700;
      line-height: 1.25;
      color: #fff;
      margin-bottom: 3px;
      min-height: 2.2rem;
      display: flex;
      align-items: center;
    }

    .we-hud-biome {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.76rem;
      color: #22d3ee;
      margin-bottom: 8px;
    }

    /* Block Selector Pills Strip (Milestone 1.4) */
    .we-block-pills {
      display: flex;
      align-items: center;
      gap: 5px;
      overflow-x: auto;
      padding-bottom: 6px;
      margin-bottom: 8px;
      scrollbar-width: none;
    }
    .we-block-pills::-webkit-scrollbar {
      display: none;
    }

    .we-block-pill {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #94a3b8;
      font-size: 0.68rem;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 6px;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      user-select: none;
    }

    .we-block-pill:hover {
      background: rgba(52, 211, 153, 0.12);
      border-color: rgba(52, 211, 153, 0.35);
      color: #e2e8f0;
    }

    .we-block-pill.active {
      background: rgba(52, 211, 153, 0.22);
      border-color: #34d399;
      color: #34d399;
      box-shadow: 0 0 10px rgba(52, 211, 153, 0.25);
    }

    /* Calibrated description height */
    .we-hud-desc {
      font-size: 0.78rem;
      line-height: 1.42;
      color: var(--text-muted);
      height: 44px;
      min-height: 44px;
      max-height: 44px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      margin-bottom: 8px;
    }

    /* Interactive Track Toggle: [ Track A: Debt Extraction ] vs [ Track B: O.N.E. Usufruct ] */
    .we-audit-toggle {
      display: flex;
      align-items: center;
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 3px;
      margin-bottom: 8px;
      gap: 4px;
    }

    .we-toggle-btn {
      flex: 1;
      text-align: center;
      padding: 5px 8px;
      font-size: 0.7rem;
      font-weight: 700;
      border-radius: 6px;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.2s ease;
      background: transparent;
      color: #64748b;
    }

    .we-toggle-btn:hover {
      color: #e2e8f0;
    }

    .we-toggle-btn.active-track-a {
      background: rgba(239, 68, 68, 0.18);
      color: #f87171;
      border-color: rgba(239, 68, 68, 0.4);
      box-shadow: 0 0 12px rgba(239, 68, 68, 0.2);
    }

    .we-toggle-btn.active-track-b {
      background: rgba(16, 185, 129, 0.18);
      color: #34d399;
      border-color: rgba(16, 185, 129, 0.4);
      box-shadow: 0 0 12px rgba(16, 185, 129, 0.2);
    }

    .we-metrics {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
      margin-bottom: 8px;
    }

    .we-metric-item {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
      padding: 5px 8px;
      display: flex;
      flex-direction: column;
    }

    .we-metric-k {
      display: block;
      font-size: 0.6rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 1px;
    }

    .we-metric-v {
      display: block;
      font-size: 0.84rem;
      font-weight: 700;
      color: #e2e8f0;
      font-family: 'JetBrains Mono', monospace;
      transition: color 0.2s ease;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .we-metric-v.val-track-a {
      color: #f87171;
    }

    .we-metric-v.val-track-b {
      color: #34d399;
    }

    .we-metric-sub {
      display: block;
      font-size: 0.58rem;
      color: #475569;
      margin-top: 1px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Engineering Bottleneck Card (Milestone 1.4) */
    .we-bottleneck-card {
      background: rgba(245, 158, 11, 0.06);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 8px;
      padding: 7px 9px;
      margin-bottom: 6px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      animation: alertPulse 3s infinite ease-in-out;
    }

    @keyframes alertPulse {
      0%, 100% { border-color: rgba(245, 158, 11, 0.3); box-shadow: 0 0 8px rgba(245, 158, 11, 0.08); }
      50% { border-color: rgba(245, 158, 11, 0.6); box-shadow: 0 0 14px rgba(245, 158, 11, 0.22); }
    }

    .we-bottleneck-head {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.66rem;
      font-weight: 700;
      color: #fbbf24;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .we-bottleneck-desc {
      font-size: 0.68rem;
      line-height: 1.3;
      color: #cbd5e1;
    }

    .we-bottleneck-actions {
      display: flex;
      gap: 6px;
      margin-top: 2px;
      flex-wrap: wrap;
    }

    .we-btn-cta {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.62rem;
      font-weight: 700;
      color: #fff;
      background: rgba(245, 158, 11, 0.18);
      border: 1px solid rgba(245, 158, 11, 0.4);
      padding: 3px 7px;
      border-radius: 5px;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .we-btn-cta:hover {
      background: rgba(245, 158, 11, 0.35);
      border-color: #fbbf24;
      color: #fff;
      transform: translateY(-1px);
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
                <span class="we-hud-status" id="hudStatus">JUS BIOSPHAERAE</span>
              </div>
              <h4 class="we-hud-title" id="hudBasinName">Po Valley &amp; Western Alpine Arc</h4>
              <div class="we-hud-biome">
                <span id="hudBiomeIcon">⛰️</span>
                <span id="hudBiomeText">Alpine Headwaters &amp; Alluvial Plain</span>
              </div>

              <!-- Block Selector Pills Strip (Milestone 1.4) -->
              <div class="we-block-pills" id="weBlockPills" title="Select Urban Audit Preset or Basin Overview">
                <!-- Dynamically generated pills -->
              </div>

              <p class="we-hud-desc" id="hudBasinDesc">
                Glacial runoff from the Western Alps feeds the fertile Po plain before discharging into the Northern Adriatic. Primary zone for alpine micro-hydro, gravity water conduits, and agroforestry.
              </p>

              <!-- Interactive Track Toggle: [ Track A: Debt Extraction ] vs [ Track B: O.N.E. Usufruct ] -->
              <div class="we-audit-toggle" id="weAuditToggle" style="display: none;">
                <button type="button" class="we-toggle-btn active-track-a" id="btnTrackA">Track A: Debt Extraction</button>
                <button type="button" class="we-toggle-btn" id="btnTrackB">Track B: O.N.E. Usufruct</button>
              </div>

              <!-- 4 Calibrated Telemetry Metrics with Dynamic Roll-up -->
              <div class="we-metrics" id="weMetrics">
                <div class="we-metric-item">
                  <span class="we-metric-k" id="hudMetricLabel1">Catchment Area</span>
                  <span class="we-metric-v" id="hudMetricVal1">74,970 km²</span>
                  <span class="we-metric-sub" id="hudMetricSub1">Planetary Hydrology</span>
                </div>
                <div class="we-metric-item">
                  <span class="we-metric-k" id="hudMetricLabel2">Avg Discharge</span>
                  <span class="we-metric-v" id="hudMetricVal2">1,540 m³/s</span>
                  <span class="we-metric-sub" id="hudMetricSub2">River Confluence</span>
                </div>
                <div class="we-metric-item">
                  <span class="we-metric-k" id="hudMetricLabel3">Exergy Vector</span>
                  <span class="we-metric-v" id="hudMetricVal3">Micro-Hydro + Solar</span>
                  <span class="we-metric-sub" id="hudMetricSub3">Renewable Potential</span>
                </div>
                <div class="we-metric-item">
                  <span class="we-metric-k" id="hudMetricLabel4">Demarchic Jury</span>
                  <span class="we-metric-v" id="hudMetricVal4">101 Citizens (Odd)</span>
                  <span class="we-metric-sub" id="hudMetricSub4">Constitutional Quorum</span>
                </div>
              </div>

              <!-- Engineering Bottleneck Card (Urban Block mode) -->
              <div class="we-bottleneck-card" id="hudBottleneckCard" style="display: none;">
                <div class="we-bottleneck-head">
                  <span id="hudBottleneckIcon">⚠️</span>
                  <span id="hudBottleneckTitle">Critical Winter Solar Deficit (Jan WCR: 28%)</span>
                </div>
                <div class="we-bottleneck-desc" id="hudBottleneckDesc">
                  January solar insolation leaves a 72% heating deficit. Mandates Passivhaus envelope retrofits (U &lt; 0.12 W/m²K) and 48V DC bus Tier-2 load-shedding states.
                </div>
                <div class="we-bottleneck-actions">
                  <a href="https://github.com/kyberlex/ONE/tree/main/habitat" target="_blank" rel="noopener noreferrer" class="we-btn-cta" id="hudCtaHabitat">
                    🛠️ Habitat Open Hardware
                  </a>
                  <a href="./sim/?basin=po-valley" class="we-btn-cta" id="hudCtaSim">
                    🔬 O-ASIS Stress-Test
                  </a>
                </div>
              </div>

              <!-- Canonical Node Box (Watershed mode) -->
              <div class="we-node-box" id="hudNodeBox">
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

      // Urban Blocks Benchmark Dataset (Milestone 1.1 & 1.4)
      const URBAN_BLOCKS = [{"id": "milan-loreto", "name": "Milan — Loreto / NoLo Block", "basinId": "basin-po", "city": "Milan, Italy", "flag": "🇮🇹", "center": [9.2185, 45.488], "bbox": [9.215, 45.486, 9.222, 45.49], "typology": "Dense 5-6 storey perimeter courtyard block", "units": 164, "inhabitants": 380, "roofArea_m2": 4850, "bioclimatic": {"solar_annual_kwh_m2": 1320, "solar_jan_kwh_m2": 38, "precip_annual_mm": 940}, "legacy_financial": {"monthly_rent_eur": 1250, "grid_elec_eur_kwh": 0.32, "elec_demand_kwh_unit_yr": 2400, "water_eur_m3": 2.1, "water_demand_m3_capita_yr": 55, "drain_30y_eur": 79000000, "drain_30y_label": "€79.0M"}, "audit_thermodynamics": {"epv_mwh_yr": 841, "rain_liters_yr": 3875150, "rain_label": "3.88M L/yr", "cistern_autonomy_days": 68, "wcr_jan": 0.28, "wcr_jan_pct": "28%"}, "bottleneck": {"title": "Critical Winter Insolation Deficit (Jan WCR: 28%)", "desc": "January solar insolation leaves a 72% heating deficit. Mandates Passivhaus envelope retrofits (U < 0.12 W/m²K) and 48V DC bus Tier-2 load-shedding states.", "action": "Passivhaus retrofits + 48V DC bus shedding", "habitat_link": "https://github.com/kyberlex/ONE/tree/main/habitat", "sim_link": "./sim/?basin=po-valley"}, "polygons": [[[9.2165, 45.4892], [9.2205, 45.4892], [9.2205, 45.4886], [9.2165, 45.4886], [9.2165, 45.4892]], [[9.2165, 45.4886], [9.2173, 45.4886], [9.2173, 45.4868], [9.2165, 45.4868], [9.2165, 45.4886]], [[9.2197, 45.4886], [9.2205, 45.4886], [9.2205, 45.4868], [9.2197, 45.4868], [9.2197, 45.4886]], [[9.2165, 45.4868], [9.2205, 45.4868], [9.2205, 45.4862], [9.2165, 45.4862], [9.2165, 45.4868]], [[9.218, 45.4878], [9.219, 45.4878], [9.219, 45.4872], [9.218, 45.4872], [9.218, 45.4878]]]}, {"id": "zurich-hardbrucke", "name": "Zurich — Hardbrücke / Industriequartier", "basinId": "basin-rhine", "city": "Zurich, Switzerland", "flag": "🇨🇭", "center": [8.5175, 47.3875], "bbox": [8.514, 47.3855, 8.521, 47.3895], "typology": "Industrial conversion & mixed residential cooperative block", "units": 142, "inhabitants": 310, "roofArea_m2": 5600, "bioclimatic": {"solar_annual_kwh_m2": 1180, "solar_jan_kwh_m2": 28, "precip_annual_mm": 1080}, "legacy_financial": {"monthly_rent_eur": 2100, "grid_elec_eur_kwh": 0.28, "elec_demand_kwh_unit_yr": 2600, "water_eur_m3": 2.4, "water_demand_m3_capita_yr": 50, "drain_30y_eur": 111800000, "drain_30y_label": "€111.8M"}, "audit_thermodynamics": {"epv_mwh_yr": 868, "rain_liters_yr": 5140800, "rain_label": "5.14M L/yr", "cistern_autonomy_days": 110, "wcr_jan": 0.22, "wcr_jan_pct": "22%"}, "bottleneck": {"title": "Severe Winter Deficit & Thermal Peak (Jan WCR: 22%)", "desc": "Altiplano overcast conditions create a 78% January exergy gap. Requires Limmat heat-pump coupling and seasonal water thermal buffer storage.", "action": "District water heat exchange + seasonal storage", "habitat_link": "https://github.com/kyberlex/ONE/tree/main/habitat", "sim_link": "./sim/?basin=rhine-meuse"}, "polygons": [[[8.515, 47.389], [8.5195, 47.389], [8.5195, 47.3882], [8.515, 47.3882], [8.515, 47.389]], [[8.515, 47.3882], [8.516, 47.3882], [8.516, 47.3865], [8.515, 47.3865], [8.515, 47.3882]], [[8.5185, 47.3882], [8.5195, 47.3882], [8.5195, 47.3865], [8.5185, 47.3865], [8.5185, 47.3882]], [[8.515, 47.3865], [8.5195, 47.3865], [8.5195, 47.3858], [8.515, 47.3858], [8.515, 47.3865]], [[8.5168, 47.3876], [8.5178, 47.3876], [8.5178, 47.387], [8.5168, 47.387], [8.5168, 47.3876]]]}, {"id": "madrid-lavapies", "name": "Madrid — Lavapiés Superblock", "basinId": "basin-po", "city": "Madrid, Spain", "flag": "🇪🇸", "center": [-3.702, 40.4095], "bbox": [-3.7055, 40.4075, -3.6985, 40.4115], "typology": "High-density corrala courtyard urban superblock", "units": 195, "inhabitants": 440, "roofArea_m2": 5100, "bioclimatic": {"solar_annual_kwh_m2": 1820, "solar_jan_kwh_m2": 75, "precip_annual_mm": 420}, "legacy_financial": {"monthly_rent_eur": 1100, "grid_elec_eur_kwh": 0.26, "elec_demand_kwh_unit_yr": 2500, "water_eur_m3": 1.9, "water_demand_m3_capita_yr": 50, "drain_30y_eur": 82500000, "drain_30y_label": "€82.5M"}, "audit_thermodynamics": {"epv_mwh_yr": 1219, "rain_liters_yr": 1820700, "rain_label": "1.82M L/yr", "cistern_autonomy_days": 28, "wcr_jan": 0.54, "wcr_jan_pct": "54%"}, "bottleneck": {"title": "Severe Hydrological Stress & Drought (28 Days Autonomy)", "desc": "Arid summer regime limits rainwater buffer to 28 days. Mandates closed-loop greywater reed bed recycling and atmospheric condenser arrays.", "action": "Greywater reed beds + atmospheric condensers", "habitat_link": "https://github.com/kyberlex/ONE/tree/main/habitat", "sim_link": "./sim/?basin=po-valley"}, "polygons": [[[-3.704, 40.4108], [-3.7, 40.4108], [-3.7, 40.41], [-3.704, 40.41], [-3.704, 40.4108]], [[-3.704, 40.41], [-3.7032, 40.41], [-3.7032, 40.4085], [-3.704, 40.4085], [-3.704, 40.41]], [[-3.7008, 40.41], [-3.7, 40.41], [-3.7, 40.4085], [-3.7008, 40.4085], [-3.7008, 40.41]], [[-3.704, 40.4085], [-3.7, 40.4085], [-3.7, 40.4078], [-3.704, 40.4078], [-3.704, 40.4085]]]}, {"id": "berlin-kreuzberg", "name": "Berlin — Kreuzberg Courtyard Block", "basinId": "basin-baltic", "city": "Berlin, Germany", "flag": "🇩🇪", "center": [13.418, 52.499], "bbox": [13.414, 52.4965, 13.422, 52.5015], "typology": "Gründerzeit perimeter block with dual inner courtyards", "units": 178, "inhabitants": 390, "roofArea_m2": 5400, "bioclimatic": {"solar_annual_kwh_m2": 1050, "solar_jan_kwh_m2": 22, "precip_annual_mm": 570}, "legacy_financial": {"monthly_rent_eur": 1350, "grid_elec_eur_kwh": 0.38, "elec_demand_kwh_unit_yr": 2400, "water_eur_m3": 2.3, "water_demand_m3_capita_yr": 52, "drain_30y_eur": 92800000, "drain_30y_label": "€92.8M"}, "audit_thermodynamics": {"epv_mwh_yr": 745, "rain_liters_yr": 2616300, "rain_label": "2.62M L/yr", "cistern_autonomy_days": 45, "wcr_jan": 0.18, "wcr_jan_pct": "18%"}, "bottleneck": {"title": "Critical Winter Solar Insolation Void (Jan WCR: 18%)", "desc": "Northern latitude leads to an 82% winter energy gap. Requires external vacuum insulation panels and district bio-pellet CHP cogeneration.", "action": "Vacuum insulation panels + district CHP backup", "habitat_link": "https://github.com/kyberlex/ONE/tree/main/habitat", "sim_link": "./sim/?basin=baltic"}, "polygons": [[[13.4155, 52.5005], [13.4205, 52.5005], [13.4205, 52.4998], [13.4155, 52.4998], [13.4155, 52.5005]], [[13.4155, 52.4998], [13.4165, 52.4998], [13.4165, 52.498], [13.4155, 52.498], [13.4155, 52.4998]], [[13.4195, 52.4998], [13.4205, 52.4998], [13.4205, 52.498], [13.4195, 52.498], [13.4195, 52.4998]], [[13.4155, 52.498], [13.4205, 52.498], [13.4205, 52.4972], [13.4155, 52.4972], [13.4155, 52.498]], [[13.4175, 52.4995], [13.4185, 52.4995], [13.4185, 52.4985], [13.4175, 52.4985], [13.4175, 52.4995]]]}, {"id": "london-hackney", "name": "London — Hackney Mixed Terrace Block", "basinId": "basin-rhine", "city": "London, United Kingdom", "flag": "🇬🇧", "center": [-0.0555, 51.5465], "bbox": [-0.059, 51.5445, -0.052, 51.5485], "typology": "Victorian terrace & light industrial conversion cluster", "units": 130, "inhabitants": 290, "roofArea_m2": 4200, "bioclimatic": {"solar_annual_kwh_m2": 1020, "solar_jan_kwh_m2": 24, "precip_annual_mm": 620}, "legacy_financial": {"monthly_rent_eur": 1850, "grid_elec_eur_kwh": 0.34, "elec_demand_kwh_unit_yr": 2500, "water_eur_m3": 2.2, "water_demand_m3_capita_yr": 52, "drain_30y_eur": 90900000, "drain_30y_label": "€90.9M"}, "audit_thermodynamics": {"epv_mwh_yr": 563, "rain_liters_yr": 2213400, "rain_label": "2.21M L/yr", "cistern_autonomy_days": 51, "wcr_jan": 0.2, "wcr_jan_pct": "20%"}, "bottleneck": {"title": "High Uninsulated Brick Transmission (Jan WCR: 20%)", "desc": "Uninsulated solid brick envelopes waste 64% of heating energy. Mandates internal breathable wood-fiber insulation and air-source heat pumps.", "action": "Internal wood-fiber insulation + heat pumps", "habitat_link": "https://github.com/kyberlex/ONE/tree/main/habitat", "sim_link": "./sim/?basin=rhine-meuse"}, "polygons": [[[-0.058, 51.5478], [-0.0535, 51.5478], [-0.0535, 51.5472], [-0.058, 51.5472], [-0.058, 51.5478]], [[-0.058, 51.5468], [-0.0535, 51.5468], [-0.0535, 51.5462], [-0.058, 51.5462], [-0.058, 51.5468]], [[-0.058, 51.5458], [-0.0535, 51.5458], [-0.0535, 51.5452], [-0.058, 51.5452], [-0.058, 51.5458]]]}, {"id": "austin-east", "name": "Austin — East Austin Low-Rise Cluster", "basinId": "basin-cascadia", "city": "Austin, United States", "flag": "🇺🇸", "center": [-97.7225, 30.2625], "bbox": [-97.7265, 30.26, -97.7185, 30.265], "typology": "Subtropical low-rise mixed courtyard & workshop infill", "units": 110, "inhabitants": 240, "roofArea_m2": 4900, "bioclimatic": {"solar_annual_kwh_m2": 1750, "solar_jan_kwh_m2": 82, "precip_annual_mm": 870}, "legacy_financial": {"monthly_rent_eur": 1600, "grid_elec_eur_kwh": 0.15, "elec_demand_kwh_unit_yr": 5000, "water_eur_m3": 1.8, "water_demand_m3_capita_yr": 60, "drain_30y_eur": 66700000, "drain_30y_label": "€66.7M"}, "audit_thermodynamics": {"epv_mwh_yr": 1126, "rain_liters_yr": 3623550, "rain_label": "3.62M L/yr", "cistern_autonomy_days": 100, "wcr_jan": 0.65, "wcr_jan_pct": "65%"}, "bottleneck": {"title": "Extreme Summer Thermal Cooling Peak (AC Grid Load)", "desc": "Summer cooling load exceeds winter heating by 320%. Mandates high-albedo cool roofs, external solar brise-soleil and nocturnal radiative night flushing.", "action": "Cool-roof albedo + passive brise-soleil", "habitat_link": "https://github.com/kyberlex/ONE/tree/main/habitat", "sim_link": "./sim/?basin=cascadia"}, "polygons": [[[-97.725, 30.264], [-97.72, 30.264], [-97.72, 30.2632], [-97.725, 30.2632], [-97.725, 30.264]], [[-97.725, 30.2625], [-97.7215, 30.2625], [-97.7215, 30.2618], [-97.725, 30.2618], [-97.725, 30.2625]], [[-97.725, 30.2612], [-97.72, 30.2612], [-97.72, 30.2605], [-97.725, 30.2605], [-97.725, 30.2612]]]}, {"id": "detroit-corktown", "name": "Detroit — Corktown Infill Block", "basinId": "basin-greatlakes", "city": "Detroit, United States", "flag": "🇺🇸", "center": [-83.0685, 42.3315], "bbox": [-83.0725, 42.329, -83.0645, 42.334], "typology": "Post-industrial brick warehouse & infill timber housing", "units": 125, "inhabitants": 275, "roofArea_m2": 5200, "bioclimatic": {"solar_annual_kwh_m2": 1290, "solar_jan_kwh_m2": 36, "precip_annual_mm": 850}, "legacy_financial": {"monthly_rent_eur": 1200, "grid_elec_eur_kwh": 0.2, "elec_demand_kwh_unit_yr": 3500, "water_eur_m3": 2.1, "water_demand_m3_capita_yr": 55, "drain_30y_eur": 57700000, "drain_30y_label": "€57.7M"}, "audit_thermodynamics": {"epv_mwh_yr": 881, "rain_liters_yr": 3757000, "rain_label": "3.76M L/yr", "cistern_autonomy_days": 91, "wcr_jan": 0.25, "wcr_jan_pct": "25%"}, "bottleneck": {"title": "Continental Sub-Zero Freezing & Cistern Risk (Jan WCR: 25%)", "desc": "Deep winter frost requires earth-sheltered subterranean cistern thermal insulation and triple-pane krypton-filled glazing envelopes.", "action": "Subterranean earth-sheltered cisterns + triple-pane", "habitat_link": "https://github.com/kyberlex/ONE/tree/main/habitat", "sim_link": "./sim/?basin=great-lakes"}, "polygons": [[[-83.071, 42.333], [-83.066, 42.333], [-83.066, 42.3322], [-83.071, 42.3322], [-83.071, 42.333]], [[-83.071, 42.3315], [-83.067, 42.3315], [-83.067, 42.3308], [-83.071, 42.3308], [-83.071, 42.3315]], [[-83.071, 42.3302], [-83.066, 42.3302], [-83.066, 42.3295], [-83.071, 42.3295], [-83.071, 42.3302]]]}, {"id": "tokyo-setagaya", "name": "Tokyo — Setagaya Dense Residential Fabric", "basinId": "basin-yangtze", "city": "Tokyo, Japan", "flag": "🇯🇵", "center": [139.6535, 35.6465], "bbox": [139.65, 35.644, 139.657, 35.649], "typology": "High-density micro-lot residential & shared rooftop alley", "units": 160, "inhabitants": 320, "roofArea_m2": 4600, "bioclimatic": {"solar_annual_kwh_m2": 1360, "solar_jan_kwh_m2": 70, "precip_annual_mm": 1530}, "legacy_financial": {"monthly_rent_eur": 1450, "grid_elec_eur_kwh": 0.29, "elec_demand_kwh_unit_yr": 2350, "water_eur_m3": 2.0, "water_demand_m3_capita_yr": 50, "drain_30y_eur": 88000000, "drain_30y_label": "€88.0M"}, "audit_thermodynamics": {"epv_mwh_yr": 822, "rain_liters_yr": 5982300, "rain_label": "5.98M L/yr", "cistern_autonomy_days": 125, "wcr_jan": 0.42, "wcr_jan_pct": "42%"}, "bottleneck": {"title": "Monsoonal Rain Peak & High Summer Humidity", "desc": "Heavy precipitation creates urban runoff surges. Mandates bioretention swales, high-volume detention retention tanks, and desiccant dehumidification.", "action": "Bioretention swales + desiccant cooling", "habitat_link": "https://github.com/kyberlex/ONE/tree/main/habitat", "sim_link": "./sim/?basin=yangtze"}, "polygons": [[[139.6515, 35.648], [139.6555, 35.648], [139.6555, 35.6472], [139.6515, 35.6472], [139.6515, 35.648]], [[139.6515, 35.6468], [139.6555, 35.6468], [139.6555, 35.646], [139.6515, 35.646], [139.6515, 35.6468]], [[139.6515, 35.6455], [139.6555, 35.6455], [139.6555, 35.6447], [139.6515, 35.6447], [139.6515, 35.6455]]]}];

      // Pre-calculate Web Mercator projection coordinates for Urban Blocks
      URBAN_BLOCKS.forEach(block => {
        block.centerPx = toWorldPx(block.center[0], block.center[1]);
        block.polygonsPx = block.polygons.map(poly => poly.map(pt => toWorldPx(pt[0], pt[1])));
      });

      // Inspector HUD State
      let currentBlock = null;
      let currentTrack = "A"; // "A": Debt Extraction, "B": O.N.E. Usufruct
      let activeAnimations = {};

      // Dynamic numeric counter roll-up with easing (ease-out cubic)
      function animateNumericValue(elementId, targetVal, prefix = "", suffix = "", duration = 800) {
        const el = document.getElementById(elementId);
        if (!el) return;
        if (activeAnimations[elementId]) {
          cancelAnimationFrame(activeAnimations[elementId]);
        }
        const startTime = performance.now();
        const startVal = 0;

        function step(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1.0);
          const ease = 1 - Math.pow(1 - progress, 3);
          const current = startVal + (targetVal - startVal) * ease;

          let formatted;
          if (Number.isInteger(targetVal)) {
            formatted = Math.round(current).toLocaleString();
          } else {
            formatted = current.toFixed(1);
          }
          el.textContent = `${prefix}${formatted}${suffix}`;

          if (progress < 1.0) {
            activeAnimations[elementId] = requestAnimationFrame(step);
          } else {
            delete activeAnimations[elementId];
          }
        }
        activeAnimations[elementId] = requestAnimationFrame(step);
      }

      // Renders Block Selector Pills
      function renderBlockSelectorPills() {
        const container = document.getElementById("weBlockPills");
        if (!container) return;
        container.innerHTML = "";

        // Pill 1: Basin Overview
        const basinPill = document.createElement("button");
        basinPill.type = "button";
        basinPill.className = `we-block-pill ${!currentBlock ? 'active' : ''}`;
        basinPill.innerHTML = `<span>🌐</span> <span>Basin Overview</span>`;
        basinPill.addEventListener("click", () => {
          setBasinOverview();
        });
        container.appendChild(basinPill);

        // 8 Urban Blocks Pills
        URBAN_BLOCKS.forEach(blk => {
          const pill = document.createElement("button");
          pill.type = "button";
          const isAct = currentBlock && currentBlock.id === blk.id;
          pill.className = `we-block-pill ${isAct ? 'active' : ''}`;
          pill.innerHTML = `<span>${blk.flag || '🏢'}</span> <span>${blk.name.split('—')[0].trim()}</span>`;
          pill.title = blk.name;
          pill.addEventListener("click", () => {
            setUrbanBlock(blk.id);
          });
          container.appendChild(pill);
        });
      }

      function setUrbanBlock(blockId) {
        const blk = URBAN_BLOCKS.find(x => x.id === blockId);
        if (!blk) return;
        currentBlock = blk;
        const parentBasin = WATERSHEDS.find(b => b.id === blk.basinId);
        if (parentBasin) selectedBasin = parentBasin;

        zoomMode = "URBAN";
        targetCamera.x = blk.centerPx[0];
        targetCamera.y = blk.centerPx[1];
        targetCamera.zoom = 22.0;

        renderBlockSelectorPills();
        updateHUD();
        updateZoomState();
      }

      function setBasinOverview() {
        currentBlock = null;
        zoomMode = "REGION";
        if (selectedBasin) {
          targetCamera.x = selectedBasin.centerPx[0];
          targetCamera.y = selectedBasin.centerPx[1];
          targetCamera.zoom = selectedBasin.zoomLevel || 4.5;
        }
        renderBlockSelectorPills();
        updateHUD();
        updateZoomState();
      }

      // Updates the SINGLE Zoom Button and Zoom Status Badge
      function updateZoomState() {
        const badge = document.getElementById("hudZoomBadge");
        const toggleBtn = document.getElementById("btnZoomToggle");
        const hintText = document.getElementById("weHintText");

        if (zoomMode === "URBAN") {
          if (badge) badge.textContent = "ZOOM: TACTICAL (32x)";
          if (toggleBtn) toggleBtn.innerHTML = "<span>🔍 Bioregion Focus</span>";
          if (hintText) hintText.innerHTML = "<span>🎯 Tactical Rooftop Lock • Toggle Track A/B</span>";
        } else if (targetCamera.zoom > 1.8) {
          zoomMode = "REGION";
          if (badge) badge.textContent = "ZOOM: REGION";
          if (toggleBtn) toggleBtn.innerHTML = "<span>🌐 World View</span>";
          if (hintText) hintText.innerHTML = "<span>🔍 Bioregion Focus • Click block pill to audit</span>";
        } else {
          zoomMode = "WORLD";
          if (badge) badge.textContent = "ZOOM: WORLD";
          if (toggleBtn) toggleBtn.innerHTML = "<span>🔍 Focus Bioregion</span>";
          if (hintText) hintText.innerHTML = "<span>🌐 World View • Click basin to focus</span>";
        }
      }

      function setViewWorld() {
        currentBlock = null;
        targetCamera.x = worldCenter[0];
        targetCamera.y = worldCenter[1];
        targetCamera.zoom = 1.0;
        renderBlockSelectorPills();
        updateHUD();
        updateZoomState();
      }

      function setViewRegion(b) {
        if (!b) return;
        currentBlock = null;
        selectedBasin = b;
        targetCamera.x = b.centerPx[0];
        targetCamera.y = b.centerPx[1];
        targetCamera.zoom = b.zoomLevel || 4.5;
        renderBlockSelectorPills();
        updateHUD();
        updateZoomState();
      }

      // Update Inspector HUD Panel & Dual Launch Buttons
      function updateHUD(b = selectedBasin) {
        if (!b) return;

        const auditToggle = document.getElementById("weAuditToggle");
        const bottleneckCard = document.getElementById("hudBottleneckCard");
        const nodeBox = document.getElementById("hudNodeBox");
        const statusEl = document.getElementById("hudStatus");

        const l1 = document.getElementById("hudMetricLabel1");
        const v1 = document.getElementById("hudMetricVal1");
        const s1 = document.getElementById("hudMetricSub1");

        const l2 = document.getElementById("hudMetricLabel2");
        const v2 = document.getElementById("hudMetricVal2");
        const s2 = document.getElementById("hudMetricSub2");

        const l3 = document.getElementById("hudMetricLabel3");
        const v3 = document.getElementById("hudMetricVal3");
        const s3 = document.getElementById("hudMetricSub3");

        const l4 = document.getElementById("hudMetricLabel4");
        const v4 = document.getElementById("hudMetricVal4");
        const s4 = document.getElementById("hudMetricSub4");

        [v1, v2, v3, v4].forEach(el => {
          if (el) {
            el.classList.remove("val-track-a", "val-track-b");
          }
        });

        if (!currentBlock) {
          // WATERSHED MACRO VIEW
          if (statusEl) statusEl.textContent = "JUS BIOSPHAERAE";
          document.getElementById("hudBasinTag").textContent = b.tag;
          document.getElementById("hudBasinName").textContent = b.name;
          document.getElementById("hudBiomeIcon").textContent = b.biomeIcon;
          document.getElementById("hudBiomeText").textContent = b.biomeName;
          document.getElementById("hudBasinDesc").textContent = b.desc;

          if (auditToggle) auditToggle.style.display = "none";
          if (bottleneckCard) bottleneckCard.style.display = "none";
          if (nodeBox) nodeBox.style.display = "flex";

          if (l1) l1.textContent = "Catchment Area";
          if (v1) v1.textContent = b.area;
          if (s1) s1.textContent = "Planetary Hydrology";

          if (l2) l2.textContent = "Avg Discharge";
          if (v2) v2.textContent = b.discharge;
          if (s2) s2.textContent = "River Confluence";

          if (l3) l3.textContent = "Exergy Vector";
          if (v3) v3.textContent = b.exergy;
          if (s3) s3.textContent = "Renewable Potential";

          if (l4) l4.textContent = "Demarchic Jury";
          if (v4) v4.textContent = b.demarchy;
          if (s4) s4.textContent = "Constitutional Quorum";

          document.getElementById("hudNodeName").textContent = b.nodeName;
        } else {
          // URBAN BLOCK AUDIT VIEW (Milestones 1.1 - 1.4)
          const blk = currentBlock;
          if (statusEl) statusEl.textContent = "COMMONS AUDIT";
          document.getElementById("hudBasinTag").textContent = `${b.tag} // URBAN AUDIT`;
          document.getElementById("hudBasinName").textContent = blk.name;
          document.getElementById("hudBiomeIcon").textContent = blk.flag || "🏢";
          document.getElementById("hudBiomeText").textContent = `${blk.typology} • ${blk.units} Units • ${blk.roofArea_m2.toLocaleString()} m² Roof`;
          document.getElementById("hudBasinDesc").textContent = `Autonomous urban block audit. Evaluating Passivhaus thermal envelope retrofits, N-type TOPCon solar exergy, and rainwater closed-loop cistern resilience.`;

          if (auditToggle) auditToggle.style.display = "flex";
          if (bottleneckCard) bottleneckCard.style.display = "flex";
          if (nodeBox) nodeBox.style.display = "none";

          // Populate Bottleneck Card
          const bTitle = document.getElementById("hudBottleneckTitle");
          const bDesc = document.getElementById("hudBottleneckDesc");
          const bSim = document.getElementById("hudCtaSim");
          if (bTitle) bTitle.textContent = blk.bottleneck.title;
          if (bDesc) bDesc.textContent = blk.bottleneck.desc;
          if (bSim) bSim.href = blk.bottleneck.sim_link;

          if (currentTrack === "A") {
            // TRACK A: DEBT EXTRACTION
            [v1, v2, v3, v4].forEach(el => el && el.classList.add("val-track-a"));

            if (l1) l1.textContent = "30-Year Wealth Drain";
            const drainMil = blk.legacy_financial.drain_30y_eur / 1000000;
            animateNumericValue("hudMetricVal1", drainMil, "€", "M Extracted", 750);
            if (s1) s1.textContent = "Compound Rent & Interest";

            if (l2) l2.textContent = "Monthly Rent/Mortgage";
            animateNumericValue("hudMetricVal2", blk.legacy_financial.monthly_rent_eur, "€", " / month", 750);
            if (s2) s2.textContent = "Per Housing Unit";

            if (l3) l3.textContent = "Commercial Grid Bill";
            const elecCostYear = Math.round(blk.legacy_financial.grid_elec_eur_kwh * blk.legacy_financial.elec_demand_kwh_unit_yr * blk.units / 1000);
            animateNumericValue("hudMetricVal3", elecCostYear, "€", "k / year", 750);
            if (s3) s3.textContent = `€${blk.legacy_financial.grid_elec_eur_kwh}/kWh Tariff`;

            if (l4) l4.textContent = "Municipal Water Drain";
            const waterCostYear = Math.round(blk.legacy_financial.water_eur_m3 * blk.legacy_financial.water_demand_m3_capita_yr * blk.inhabitants / 1000);
            animateNumericValue("hudMetricVal4", waterCostYear, "€", "k / year", 750);
            if (s4) s4.textContent = `€${blk.legacy_financial.water_eur_m3}/m³ Municipal Rate`;
          } else {
            // TRACK B: O.N.E. USUFRUCT
            [v1, v2, v3, v4].forEach(el => el && el.classList.add("val-track-b"));

            if (l1) l1.textContent = "Perpetual Housing Cost";
            if (v1) v1.textContent = "€0 / Perpetual Shelter";
            if (s1) s1.textContent = "Zero-Debt Dynamic Usufruct";

            if (l2) l2.textContent = "Rooftop Solar Exergy";
            animateNumericValue("hudMetricVal2", blk.audit_thermodynamics.epv_mwh_yr, "", " MWh / yr", 750);
            if (s2) s2.textContent = "N-type TOPCon + 48V DC Bus";

            if (l3) l3.textContent = "Rainwater Harvesting";
            const rainMil = blk.audit_thermodynamics.rain_liters_yr / 1000000;
            animateNumericValue("hudMetricVal3", rainMil, "", "M Liters / yr", 750);
            if (s3) s3.textContent = "EPDM Catchment Runoff";

            if (l4) l4.textContent = "Cistern Water Autonomy";
            animateNumericValue("hudMetricVal4", blk.audit_thermodynamics.cistern_autonomy_days, "", " Days Reserves", 750);
            if (s4) s4.textContent = "150 L/capita/day Resilient Buffer";
          }
        }

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

        // 3. Draw Tactical Rooftop Polygons & HUD Brackets when Urban Block is Active (Milestone 1.2)
        if (currentBlock && currentBlock.polygonsPx) {
          const isTrackB = currentTrack === "B";
          const strokeCol = isTrackB ? "#34d399" : "#f87171";
          const fillCol = isTrackB ? "rgba(16, 185, 129, 0.22)" : "rgba(239, 68, 68, 0.22)";
          const dashOffset = -performance.now() * 0.015;

          ctx.save();
          currentBlock.polygonsPx.forEach(poly => {
            if (poly.length < 2) return;
            ctx.beginPath();
            const [startPx, startPy] = worldToScreen(poly[0][0], poly[0][1]);
            ctx.moveTo(startPx, startPy);
            for (let i = 1; i < poly.length; i++) {
              const [px, py] = worldToScreen(poly[i][0], poly[i][1]);
              ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fillStyle = fillCol;
            ctx.fill();

            ctx.strokeStyle = strokeCol;
            ctx.lineWidth = 2.0;
            ctx.setLineDash([8, 4]);
            ctx.lineDashOffset = dashOffset;
            ctx.stroke();
          });
          ctx.restore();

          // Draw HUD Targeting Corner Brackets around block center
          const [scx, scy] = worldToScreen(currentBlock.centerPx[0], currentBlock.centerPx[1]);
          const bSize = Math.max(70, Math.min(180, 50 * (camera.zoom / 10)));
          const bracketLen = 14;

          ctx.strokeStyle = strokeCol;
          ctx.lineWidth = 2;
          ctx.beginPath();
          // Top-Left
          ctx.moveTo(scx - bSize, scy - bSize + bracketLen);
          ctx.lineTo(scx - bSize, scy - bSize);
          ctx.lineTo(scx - bSize + bracketLen, scy - bSize);
          // Top-Right
          ctx.moveTo(scx + bSize - bracketLen, scy - bSize);
          ctx.lineTo(scx + bSize, scy - bSize);
          ctx.lineTo(scx + bSize, scy - bSize + bracketLen);
          // Bottom-Left
          ctx.moveTo(scx - bSize, scy + bSize - bracketLen);
          ctx.lineTo(scx - bSize, scy + bSize);
          ctx.lineTo(scx - bSize + bracketLen, scy + bSize);
          // Bottom-Right
          ctx.moveTo(scx + bSize - bracketLen, scy + bSize);
          ctx.lineTo(scx + bSize, scy + bSize);
          ctx.lineTo(scx + bSize, scy + bSize - bracketLen);
          ctx.stroke();

          // Radar scanning line across the targeting box
          const scanY = scy - bSize + ((performance.now() * 0.06) % (bSize * 2));
          ctx.strokeStyle = isTrackB ? "rgba(52, 211, 153, 0.45)" : "rgba(239, 68, 68, 0.45)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(scx - bSize + 4, scanY);
          ctx.lineTo(scx + bSize - 4, scanY);
          ctx.stroke();

          // On-Canvas HUD Telemetry Badge
          ctx.font = "700 11px 'JetBrains Mono', monospace";
          const telemetryText = `LOCK: ${currentBlock.name.split('—')[0].trim().toUpperCase()} [${currentBlock.center[1].toFixed(3)}°N, ${currentBlock.center[0].toFixed(3)}°E]`;
          const subText = `A_ROOF: ${currentBlock.roofArea_m2.toLocaleString()} m² • ${isTrackB ? currentBlock.audit_thermodynamics.epv_mwh_yr + ' MWh/yr PV' : currentBlock.legacy_financial.drain_30y_label + ' 30Y DRAIN'}`;

          ctx.fillStyle = "rgba(4, 12, 10, 0.85)";
          ctx.strokeStyle = strokeCol;
          ctx.lineWidth = 1;
          const boxW = Math.max(ctx.measureText(telemetryText).width, ctx.measureText(subText).width) + 18;
          const boxH = 38;
          const boxX = scx - boxW / 2;
          const boxY = scy - bSize - boxH - 8;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(boxX, boxY, boxW, boxH, 6);
          } else {
            ctx.rect(boxX, boxY, boxW, boxH);
          }
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = strokeCol;
          ctx.fillText(telemetryText, boxX + 9, boxY + 15);
          ctx.fillStyle = "#cbd5e1";
          ctx.font = "600 10px 'JetBrains Mono', monospace";
          ctx.fillText(subText, boxX + 9, boxY + 29);
        }

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

      // Interactive Track A / Track B Toggle Handlers (Milestone 1.4)
      const btnTrackA = document.getElementById("btnTrackA");
      const btnTrackB = document.getElementById("btnTrackB");

      if (btnTrackA && btnTrackB) {
        btnTrackA.addEventListener("click", () => {
          currentTrack = "A";
          btnTrackA.classList.add("active-track-a");
          btnTrackB.classList.remove("active-track-b");
          updateHUD();
        });

        btnTrackB.addEventListener("click", () => {
          currentTrack = "B";
          btnTrackB.classList.add("active-track-b");
          btnTrackA.classList.remove("active-track-a");
          updateHUD();
        });
      }

      // EXACTLY ONE Zoom Button Handler (Toggles World <-> Region <-> Urban)
      const zoomToggleBtn = document.getElementById("btnZoomToggle");
      if (zoomToggleBtn) {
        zoomToggleBtn.addEventListener("click", () => {
          if (zoomMode === "URBAN") {
            // Zoom out to Region Focus
            setBasinOverview();
          } else if (zoomMode === "WORLD") {
            // Zoom into Region Focus
            setViewRegion(selectedBasin);
          } else {
            // Zoom out to World View
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
      renderBlockSelectorPills();

      // Check URL query parameters for ?audit=<id>
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const auditParam = urlParams.get("audit");
        if (auditParam) {
          const matchBlock = URBAN_BLOCKS.find(b => b.id === auditParam || b.id.includes(auditParam));
          if (matchBlock) {
            setUrbanBlock(matchBlock.id);
          } else {
            updateHUD(selectedBasin);
          }
        } else {
          updateHUD(selectedBasin);
        }
      } catch (err) {
        updateHUD(selectedBasin);
      }

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

    # Guarantee docs/data/urban_blocks.json is present
    data_dir = DOCS_DIR / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    urban_blocks_file = data_dir / "urban_blocks.json"
    if not urban_blocks_file.exists():
        src_blocks = REPO_ROOT / "docs" / "data" / "urban_blocks.json"
        if src_blocks.exists():
            shutil.copy2(src_blocks, urban_blocks_file)

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
