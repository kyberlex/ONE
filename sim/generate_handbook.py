#!/usr/bin/env python3
"""
O-ASIS Dual-Track: Player Field Manual & Survival Rulebook Generator
Compiles the gamer-centric Markdown guide (sim/USER_GUIDE.md) into a clean,
searchable vector PDF (sim/O-ASIS_User_Handbook.pdf) with Solarpunk typography,
A4 paged CSS, running headers/footers, and embedded high-DPI screenshots.

Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later
"""

import os
import re
import sys
import subprocess
import markdown
import pymupdf

def compile_markdown_handbook():
    sim_dir = os.path.dirname(os.path.abspath(__file__))
    guide_path = os.path.join(sim_dir, 'USER_GUIDE.md')
    pdf_out = os.path.join(sim_dir, 'O-ASIS_User_Handbook.pdf')
    temp_html = os.path.join(sim_dir, 'handbook_temp.html')

    if not os.path.exists(guide_path):
        print(f"❌ Error: {guide_path} not found.")
        sys.exit(1)

    with open(guide_path, 'r', encoding='utf-8') as f:
        md_text = f.read()

    # Add page breaks to major visual sub-sections that have their own screenshot
    sections_to_break = [
        '### Trade Convoys (Solidarity Barter)',
        '### 1-Click Multiplayer Rooms (WebRTC + Nostr)',
        '### Village Chat & Secret Encrypted Whispers',
    ]
    for sec in sections_to_break:
        md_text = md_text.replace(sec, f'<div class="page-break"></div>\n\n{sec}')

    # Convert Markdown to HTML with standard extensions
    html_body = markdown.markdown(md_text, extensions=['tables', 'fenced_code', 'toc', 'attr_list'])

    # Transform image + caption pairs into semantic figures
    fig_pattern = r'<p><img\s+([^>]+)/>\s*<em>(.*?)</em></p>'
    html_body = re.sub(
        fig_pattern,
        r'<figure class="handbook-figure"><img \1 /><figcaption>\2</figcaption></figure>',
        html_body,
        flags=re.DOTALL
    )

    # Wrap keyboard key references in kbd tags
    html_body = re.sub(r'<code>(\[[^\]]+\])</code>', r'<kbd>\1</kbd>', html_body)

    # Solarpunk Print CSS
    css = """
@page {
  size: A4 portrait;
  margin: 14mm 16mm 14mm 16mm;
  @top-left {
    content: "🌱 O-ASIS DUAL-TRACK • RESILIENCE MMO";
    font-size: 7.2pt;
    font-weight: 700;
    color: #10b981;
    letter-spacing: 0.8px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  @top-right {
    content: "PLAYER FIELD MANUAL & SURVIVAL RULEBOOK";
    font-size: 7.2pt;
    color: #94a3b8;
    letter-spacing: 0.8px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  @bottom-left {
    content: "Kyberlex <kyberlex@proton.me> • AGPL-3.0-or-later • 100% Free Commons";
    font-size: 7pt;
    color: #64748b;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  @bottom-right {
    content: "Page " counter(page) " of " counter(pages);
    font-size: 7.2pt;
    color: #94a3b8;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
}

@page :first {
  @top-left { content: none; }
  @top-right { content: none; }
  @bottom-left { content: none; }
  @bottom-right { content: none; }
}

* {
  box-sizing: border-box;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background-color: #070c16;
  color: #e2e8f0;
  font-size: 8.8pt;
  line-height: 1.45;
}

.page-break {
  break-before: page;
  page-break-before: always;
}

/* Headings */
h1 {
  font-size: 20pt;
  color: #f8fafc;
  margin-top: 0;
  margin-bottom: 6px;
  letter-spacing: -0.5px;
  border-bottom: 2px solid #10b981;
  padding-bottom: 8px;
  line-height: 1.2;
}

h2 {
  font-size: 13pt;
  color: #38bdf8;
  border-left: 4px solid #10b981;
  padding-left: 8px;
  margin-top: 20px;
  margin-bottom: 8px;
  letter-spacing: -0.2px;
  break-before: page;
  page-break-before: always;
  break-after: avoid;
  page-break-after: avoid;
}

h2:first-of-type {
  break-before: avoid;
  page-break-before: avoid;
  margin-top: 14px;
}

h3 {
  font-size: 10.5pt;
  color: #f1f5f9;
  margin-top: 12px;
  margin-bottom: 5px;
  break-after: avoid;
  page-break-after: avoid;
}

h4 {
  font-size: 9.2pt;
  color: #38bdf8;
  margin-top: 10px;
  margin-bottom: 3px;
  break-after: avoid;
  page-break-after: avoid;
}

p {
  margin: 0 0 6px 0;
  color: #cbd5e1;
  text-align: justify;
}

ul, ol {
  margin: 0 0 6px 0;
  padding-left: 18px;
  color: #cbd5e1;
}

li {
  margin-bottom: 3px;
}

strong {
  color: #f8fafc;
}

em {
  color: #94a3b8;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0;
  font-size: 8.2pt;
  break-inside: avoid;
  page-break-inside: avoid;
}

th {
  background: #0f172a;
  color: #38bdf8;
  border-bottom: 2px solid #10b981;
  text-align: left;
  padding: 6px 8px;
  font-weight: 700;
}

td {
  padding: 5px 8px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.15);
  color: #cbd5e1;
  vertical-align: top;
}

tr:nth-child(even) {
  background: rgba(30, 41, 59, 0.35);
}

.handbook-figure {
  margin: 10px auto;
  text-align: center;
  break-inside: avoid;
  page-break-inside: avoid;
  display: block;
}

.handbook-figure img {
  max-width: 95%;
  max-height: 118mm;
  height: auto;
  border-radius: 6px;
  border: 1px solid rgba(16, 185, 129, 0.4);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
  display: block;
  margin: 0 auto;
}

.handbook-figure figcaption {
  font-size: 7.8pt;
  color: #94a3b8;
  font-style: italic;
  margin-top: 5px;
  line-height: 1.3;
}

code, kbd {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  background: rgba(30, 41, 59, 0.85);
  color: #38bdf8;
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 8pt;
  border: 1px solid rgba(56, 189, 248, 0.35);
}

kbd {
  font-weight: 700;
  box-shadow: 0 1px 2px rgba(0,0,0,0.4);
}

pre {
  background: #0f172a;
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 8pt;
  color: #38bdf8;
  overflow: hidden;
  break-inside: avoid;
}

hr {
  border: 0;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(16, 185, 129, 0.5), transparent);
  margin: 14px 0;
}

blockquote {
  margin: 10px 0;
  padding: 8px 14px;
  background: rgba(16, 185, 129, 0.08);
  border-left: 3.5px solid #10b981;
  border-radius: 0 6px 6px 0;
  color: #e2e8f0;
}
"""

    html_doc = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>O-ASIS Dual-Track: Player Field Manual &amp; Survival Rulebook</title>
<style>
{css}
</style>
</head>
<body>
{html_body}
</body>
</html>"""

    with open(temp_html, 'w', encoding='utf-8') as f:
        f.write(html_doc)

    chrome_bin = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    if not os.path.exists(chrome_bin):
        print(f"❌ Error: Chrome binary not found at {chrome_bin}")
        sys.exit(1)

    cmd = [
        chrome_bin,
        '--headless',
        '--disable-gpu',
        '--allow-file-access-from-files',
        '--no-pdf-header-footer',
        f'--print-to-pdf={pdf_out}',
        f'file://{temp_html}'
    ]

    print("📄 Compiling Markdown to Vector PDF via Chrome...")
    subprocess.run(cmd, check=True)

    if os.path.exists(temp_html):
        os.remove(temp_html)

    # Verify output with PyMuPDF
    doc = pymupdf.open(pdf_out)
    print(f"✅ Successfully compiled '{os.path.basename(pdf_out)}': {len(doc)} pages.")
    for i, page in enumerate(doc):
        txt = page.get_text().strip()
        first_line = txt.split('\\n')[0] if txt else "(EMPTY)"
        imgs = len(page.get_images())
        print(f"   Page {i+1:02d}: '{first_line[:40]}' | {imgs} imgs | {len(txt)} chars")
    doc.close()

if __name__ == '__main__':
    compile_markdown_handbook()
