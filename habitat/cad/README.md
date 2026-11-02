# **MHU OPEN-BIM CAD, CNC & IFC4 PIPELINE (`habitat/cad/`)**

> **Parametric FreeCAD Macros, ISO 16739-1 (IFC4) Models, and R2010 2D CNC DXF Sheets.**  
> **Author:** Kyberlex (`kyberlex@proton.me`) | **Pillar:** 4A (Open-BIM & Timber Architect)  
> **License:** AGPL-3.0-or-later

---

## **1. Zero-Proprietary CAD Architecture**

Every structural component of the **Modular Habitat Unit (MHU)** is generated deterministically from human-readable Python/FreeCAD scripts (`.FCMacro` and `.py`). This guarantees:
* **100% Parametric Adaptability:** Incoming Pillar 4A Co-Stewards can adjust snow/wind loads, timber cross-sections (e.g. C24 vs. GL24h glulam), or bolt diameters in code and regenerate all `.stl`, `.dxf`, and `.ifc` files in seconds.
* **80–100 Year Timber Longevity:** The structural frame is completely decoupled from plumbing and electrical wiring (Shearing Layer 2 vs. Layer 4), ensuring zero moisture traps and full inspectability.

---

## **2. Artifact Matrix**

| Generator Script | Generated 2D CNC (`.dxf`) | Generated 3D Mesh / BIM (`.stl` / `.ifc`) | Governing Standard |
| :--- | :--- | :--- | :--- |
| [`generate_mhu_gusset.FCMacro`](generate_mhu_gusset.FCMacro) | `mhu_nodal_gusset_18mm.dxf` | `mhu_nodal_gusset_18mm.stl` | Eurocode 5 (EN 1995-1-1) Johansen double-shear ($F_{v,Rk} = 54.55\text{ kN}$) |
| [`generate_helical_pile_docking.FCMacro`](generate_helical_pile_docking.FCMacro) | `helical_pile_docking_flange_s355.dxf` | `helical_pile_docking_flange_s355.stl` | Eurocode 3 (EN 1993-1-8) + ISO 1461 hot-dip galvanized reversible pile |
| [`generate_mhu_portal_frame.FCMacro`](generate_mhu_portal_frame.FCMacro) | `mhu_portal_frame_3bay.dxf` | `mhu_portal_frame_3bay.stl` | 3-Bay ($54\text{ m}^2$) portal frame kinematics & EC5 bending audit |
| [`export_mhu_ifc4.py`](export_mhu_ifc4.py) | — | `mhu_portal_frame_3bay.ifc` | ISO 16739-1 (IFC4 Reference View) for FreeCAD / BlenderBIM / Bonsai |
| [`generate_wetroom_core_iso21542.FCMacro`](generate_wetroom_core_iso21542.FCMacro) | `mhu_wetroom_core_iso21542.dxf` | `mhu_wetroom_core_iso21542.stl` | ISO 21542 / DIN 18040-2 wheelchair-accessible wet-room + $800 \times 800\text{ mm}$ Utility Spine |

---

## **3. Headless Regeneration & Verification**

All macros run both inside the FreeCAD GUI and headlessly via standard Python 3:

```bash
# Regenerate IFC4 Open-BIM model
python3 habitat/cad/export_mhu_ifc4.py

# Run the complete Eurocode 5, Helical Pile & CAD integrity test suite
python3 habitat/test_habitat_specs.py
```

