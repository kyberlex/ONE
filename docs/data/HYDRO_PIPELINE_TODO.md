# O.N.E. Hydrographic & Urban Audit Pipeline — Task Roadmap

Questo documento traccia l'avanzamento e la roadmap rigorosa per l'allineamento idrologico (HydroBASINS) e l'audit termodinamico dei quartieri dell'Interactive Platform Hub (`docs/index.html` e `scripts/build_docs_hub.py`).

---

## 🟢 Fase 1 — Pipeline Scientifica & Ricalcolo Isolati (COMPLETATA)
- [x] **Dati Reali Quartieri (OSM + PVGIS + ERA5):** Download e processamento delle geometrie vettoriali reali da OpenStreetMap (licenza ODbL), radiazione/temperatura oraria PVGIS 2015-2020 e serie precipitazioni ERA5.
- [x] **Modello Energetico & Idrologico Mensile (`scripts/compute_urban_blocks.py`):**
  - Calcolo EPV (solare utile 55%, PR 80%, rendimento 20%).
  - Calcolo fabbisogno termico invernale scalato su gradi-giorno riscaldamento (base 15°C) con riferimento IWU TABULA.
  - Simulazione giornaliera serbatoi cisterne distribuite contro serie storica pioggia.
  - Generazione automatica di `data/urban_blocks_model.json` e aggiornamento `docs/data/urban_blocks.json`.
- [x] **Integrazione UI Vettoriale Realistica:**
  - Sostituzione vecchie foto aeree e poligoni disegnati a mano con rendering vettoriale su canvas delle sagome reali OSM (scala metrica 100m reale e attribuzione ODbL).
  - Eliminazione dicitura irrealistica "€0 / Perpetual" in favore di "Rent €0 • upkeep pooled" (manutenzione condivisa).
  - Aggiunta pannello collapsible "Assumptions, formulas & data sources" con trasparenza totale sui parametri e alert per dati mancanti.
- [x] **Sostituzione Città USA (Seattle & Chicago):**
  - Rimozione Austin e Detroit (prive di dati sui livelli degli edifici in OSM).
  - Inserimento di **Seattle (Capitol Hill)** e **Chicago (Lakeview)** con livelli tracciati e modelli termodinamici completi.
- [x] **Bacino dell'Elba per Berlino:**
  - Estrazione confini reali da HydroBASINS Level 6 (MAIN_BAS 2060024170, 9 sub-bacini, 138.383 km²).
  - Download e semplificazione corsi fluviali Elba e Havel da OSM.
  - Aggiunta di `basin-elbe` nell'Interactive Hub (`scripts/build_docs_hub.py`) e assegnazione di Berlino al suo bacino naturale.

---

## 🟢 Fase 2 — Confini Idrologici Reali HydroBASINS per i 14 Bacini Esistenti (COMPLETATA)
Obiettivo: Sostituire tutti i poligoni schematici disegnati a mano a 7-8 vertici con geometrie ufficiali unificate ed estratte da HydroBASINS (WWF / HydroSHEDS v1c) per i 14 bacini storici del portale.

- [x] **Download shapefile continentali HydroBASINS (Level 05 / Level 06):**
  - Africa (`hybas_af`) per Congo e Nilo.
  - Asia (`hybas_as`) per Indo, Kerala, Tigri-Eufrate (Rojava), Yangtze.
  - Sud America (`hybas_sa`) per Amazzonia e Atacama.
  - Nord America (`hybas_na`) per Cascadia e Grandi Laghi.
  - Oceania (`hybas_au`) per Murray-Darling.
  - Europa (`hybas_eu`) per Po, Reno e Baltico.
- [x] **Script Automatizzato di Estrazione (`scripts/extract_all_hydrobasins.py`):**
  - Identificazione automatica `MAIN_BAS` per ciascun bacino.
  - Unione geometrica `unary_union` e semplificazione cartesiana conservativa (0.04° - 0.08° per fluidità canvas).
  - Estrazione dei corsi d'acqua principali da OSM (Overpass relations).
- [ ] **Aggiornamento Provenienza:** Documentazione esaustiva con hash SHA-256 e licenze in `data/basins/PROVENANCE.md`.
- [x] **Ricompilazione Hub:** Generazione di `docs/index.html` con i nuovi vettori idrografici esatti.

---

## 🟢 Fase 3 — Aggiunta Bacini Mancanti per Copertura Totale Città (COMPLETATA)
Obiettivo: Eliminare qualsiasi disallineamento geografico (città che risiedono al di fuori del proprio bacino assegnato) integrando bacini idrografici dedicati estratti anch'essi da HydroBASINS.

- [x] **Bacino del Tamigi (`basin-thames`):**
  - Inclusione di **Londra (Hackney)** nel proprio bacino naturale invece di assegnarla forzatamente al Reno.
  - Metriche idrologiche e parametri per il simulatore.
- [x] **Bacino della Penisola Iberica (Tago / Duero - `basin-tagus` o `basin-iberian`):**
  - Inclusione di **Madrid (Lavapiés)** nel proprio bacino naturale invece di assegnarla al Po.
  - Profilo bioclimatico semi-arido e gestione stress idrico.
- [x] **Bacino del Fiume Tone / Baia di Tokyo (`basin-tone` o `basin-kanto`):**
  - Inclusione di **Tokyo (Setagaya)** nel bacino della pianura del Kanto/Tone invece di assegnarla allo Yangtze cinese.
  - Modellazione monsonica e regimazione delle piene urbane.
- [x] **Verifica Bacino Reno per Zurigo:**
  - Controllo inclusione idrologica della Limmat e dell'Aare (sottobacino dell'alto Reno).
- [x] **Audit e Test Interattivo Zoom:**
  - Verifica automatizzata che per ciascuna delle 8 città lo zoom-in e zoom-out dal rispettivo bacino sia geometricamente perfetto e contenuto al 100% nei poligoni (`isPointInPoly === true`).

---

## 🟡 Fase 4 — Rigenerazione Video Storyboard (Berlino) (ATTIVA)
- [ ] Aggiornare lo script video con i numeri reali certificati di Berlino (6% copertura solare a Gennaio, 16% post-retrofit Passivhaus, 1.774 MWh solare annuo, 817 alloggi stimati).
- [ ] Rendering e validazione finale per la campagna di divulgazione tecnica (Winter Challenge).

