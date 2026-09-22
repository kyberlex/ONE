/**
 * Italian (IT) Translation Dictionary
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

export const it = {
  // Brand & Meta
  appTitle: 'O-ASIS Dual-Track | Sandbox Termodinamico Vivente & MMO di Resilienza',
  appSubtitle: 'Simulatore planetario cooperativo persistente basato su termodinamica di Leontief, usufrutto dinamico, demarchia ateniese e hardware aperto dual-track.',

  // Top HUD Resource Meters
  meterEnergyTitle: '⚡ Energia / Calore',
  meterEnergyTooltip: 'Flusso energetico conservato (kWh) e accumulo LiFePO4',
  meterWaterTitle: '💧 Acqua / Cisterna',
  meterWaterTooltip: 'Riserva idrica potabile e grigia conservata (Litri)',
  meterFoodTitle: '🥗 Cibo / Granaio',
  meterFoodTooltip: 'Scorte alimentari e pavimento biometrico di sussistenza (2.200 kcal/die)',
  meterMoraleTitle: '⏳ Tempo Libero / Morale',
  meterMoraleTooltip: 'Ore libere discrezionali e coesione sociale della comunità',

  meterMeshOk: 'Mesh OK',
  meterGreywaterLoop: 'Riciclo 65%',
  meterDays: 'giorni',
  meterMorale: 'Morale',
  meterCitizens: 'Cittadini',
  meterFreePerDay: 'Libere/die',

  // Right Stack & Ticker
  legacySystemAlert: '🏦 Allerta Sistema Legacy:',
  defaultTicker: '🌱 O-ASIS Dual-Track inizializzato. Nodo Detroit Delray operativo.',

  // Time & Controls
  dayPrefix: 'Giorno',
  speedPause: '⏸ Pausa',
  speed1x: '1x Normale',
  speed2x: '2x Rapido',
  speed5x: '5x Iper',

  // Bottom Navigation Buttons
  navChores: '📋 Turni & Manutenzione',
  navHousing: '🏘️ Alloggi & Usufrutto',
  navTech: '🤖 Robot & Dual-Track STL',
  navCouncil: '🏛️ Consiglio Sorteggiato',

  // Node Operational Hub Modal
  nodeHubTitle: 'Detroit Delray Commons — Hub Operativo',
  tabChores: '📋 Tabellone Turni',
  tabHousing: '🏘️ Alloggi in Usufrutto & Riuso',
  tabMachinery: '⚙️ Macchinari & Entropia',

  // Chore Roster
  choresTitle: 'Allocazione del Lavoro di Sussistenza (base 4h/die)',
  choresSubtitle: 'I robot costruiti nel FabLab cancellano per sempre ore di fatica umana, liberando tempo per tutti!',
  populationLabel: 'Popolazione:',
  freeTimeLabel: 'Tempo Libero:',
  moraleLabel: 'Morale:',
  dailyChoresLabel: 'Turni Giornalieri:',
  workerHoursTotal: 'ore-lavoro totali',
  requiredLabel: 'Fabbisogno:',
  robotCancelledLabel: 'Cancellate da robot:',

  choreAgriName: '🥗 Turno Terra (Agricoltura)',
  choreAgriDesc: 'Serre, orti intensivi, compostaggio, miceli.',
  choreFacName: '⚡ Turno Impianti (Infrastrutture)',
  choreFacDesc: 'Inverter solari, batterie, pompe idrauliche, acque grigie.',
  choreCareName: '❤️ Turno Cura (Salute Comunitaria)',
  choreCareDesc: 'Cucina comune, asilo nido, presidio medico, igiene.',
  choreWorkName: '🔧 Turno Officina (FabLab & Riparazioni)',
  choreWorkDesc: 'Manutenzione preventiva, fresa CNC, trituratore plastico a ciclo chiuso.',

  // Vocazioni Comunitarie & Ruoli Indispensabili
  vocationSelectorTitle: 'La Tua Vocazione Preferita (Scelta Libera):',
  vocationSelectorSub: 'In O.N.E. scegli liberamente la tua vocazione. I lavori fisici pesanti sono premiati con moltiplicatore fino a 2.0x, dimezzando le ore di impegno comunitario!',
  vocationDomainAgri: '🌾 Terra & Agro-Ecologia',
  vocationDomainFac: '⚡ Energia, Acqua & Mesh',
  vocationDomainCare: '❤️ Sanità, Istruzione & Cura',
  vocationDomainWork: '🛠️ FabLab & Officina Circolare',
  vocationBonusLabel: 'Bonus Sistemico di Gioco:',
  vocationEffortCredit: 'Credito Lavoro',
  heavyLaborBadge: 'Lavoro Pesante: Credito 2.0x 🏋️ (Dimezza le ore!)',
  technicalLaborBadge: 'Lavoro Tecnico: Credito 1.5x ⚙️',
  socialLaborBadge: 'Cura Sociale: Credito 1.2x - 1.4x ❤️',
  workshopLaborBadge: 'Officina Artigiana: Credito 1.6x - 2.0x 🔨',
  vocationActiveStatus: 'Vocazione Attiva',
  vocationChangePrompt: 'Clicca su un ruolo per specializzarti',
  yourVocationLabel: 'La Tua Vocazione:',
  laborCreditBadge: 'Moltiplicatore Credito Lavoro:',
  nodeDemographicsTitle: 'Demografia della Comunità per Vocazione',

  // 11 Vocazioni Comunitarie (Nomi, Descrizioni, Bonus)
  voc_farmer_name: 'Agro-Ecologo Rigenerativo & Agricoltore',
  voc_farmer_desc: 'Gestione serre aeroponiche, policolture bio-intensive, compostaggio termofilo e rigenerazione del suolo vivente.',
  voc_farmer_bonus: '2.0x Credito Lavoro Pesante. Dimezza le ore umane necessarie per la sovranità alimentare.',

  voc_forester_name: 'Custode delle Foreste & Apicoltore',
  voc_forester_desc: 'Food forest agroforestale, ceduazione sostenibile, biomassa per riscaldamento passivo e arnie per l’impollinazione.',
  voc_forester_bonus: '1.8x Credito Lavoro. Produce miele, cera e legname custodendo la biodiversità del bacino idrografico.',

  voc_electrician_name: 'Elettricista di Microrete & Fotovoltaico',
  voc_electrician_desc: 'Taratura inverter FV bifacciali, manutenzione turbine eoliche ad asse verticale e bilanciamento celle LiFePO4.',
  voc_electrician_bonus: '1.5x Credito Lavoro. Mitiga l’entropia e garantisce l’autonomia dell’isola energetica 24/7.',

  voc_water_name: 'Tecnico Idraulico & Fitodepurazione',
  voc_water_desc: 'Gestione cisterne pluviali, filtraggio fitodepurativo delle acque grigie (ciclo chiuso 65%) e pompe solari.',
  voc_water_bonus: '1.4x Credito Lavoro. Mantiene l’acqua potabile purissima e preserva le riserve di falda nei periodi di siccità.',

  voc_mesh_name: 'Ingegnere di Rete Mesh & Telemetria IoT',
  voc_mesh_desc: 'Comunicazioni mesh ottiche e LoRa, sensori ambientali ESP32, SCADA locale e sicurezza crittografica.',
  voc_mesh_bonus: '1.2x Credito Lavoro. Mantiene il nodo federato a livello globale e avvisa in anticipo contro gli attacchi esterni.',

  voc_nurse_name: 'Infermiere di Comunità & Medico',
  voc_nurse_desc: 'Presidio di pronto soccorso, dispensario fitoterapico, controlli biometrici preventivi e cure palliative.',
  voc_nurse_bonus: '1.4x Credito Lavoro. Eleva la soglia sanitaria della comunità e protegge il morale durante le ondate di calore.',

  voc_teacher_name: 'Educatore dei Commons & Insegnante',
  voc_teacher_desc: 'Educazione libertaria dell’infanzia, laboratori pratici (coding, botanica, falegnameria) e alfabetizzazione costituzionale.',
  voc_teacher_bonus: '1.2x Credito Lavoro. Alimenta la coesione sociale a lungo termine, aumentando il morale base del +10%.',

  voc_chef_name: 'Cuoco Comunitario & Panificatore',
  voc_chef_desc: 'Cucina della Casa Comune, fermentazione a lievito madre, pianificazione nutrizionale e pasti comunitari a scarto zero.',
  voc_chef_bonus: '1.3x Credito Lavoro. Ottimizza l’efficienza exergetica nutrizionale (+10% di resa calorica dal raccolto).',

  voc_mediator_name: 'Facilitatore Civico & Mediatore',
  voc_mediator_desc: 'Logistica dell’Assemblea Sorteggiata, mediazione nonviolenta riparativa e turnazione dei compiti civici.',
  voc_mediator_bonus: '1.0x Credito Lavoro. Disinnesca le frizioni interne e blocca le divisioni durante gli attacchi dell’Adversary.',

  voc_blacksmith_name: 'Meccanico Tornitore & Fabbro',
  voc_blacksmith_desc: 'Fonderia a induzione per alluminio riciclato, saldatura, riparazione macchine agricole e riciclo filamenti plastici.',
  voc_blacksmith_bonus: '2.0x Credito Lavoro Pesante. Azzera il rischio di guasti bloccanti e accelera i cicli di fusione del FabLab.',

  voc_carpenter_name: 'Falegname & Artigiano del Riuso',
  voc_carpenter_desc: 'Realizzazione arredi modulari in legno, restauro mobili recuperati e gestione dell’Emporio Civico del Riuso.',
  voc_carpenter_bonus: '1.6x Credito Lavoro. Assicura che i pionieri ricevano subito e gratis letti, tavoli e armadi.',

  // Housing & Usufruct
  usufructTitle: 'Usufrutto Dinamico ("Use It or Lose It")',
  usufructSubtitle: 'Affitti speculativi e sfratti sono fisicamente impossibili nel codice. Gli alloggi abbandonati tornano al pool civico; i beni personali sono inviolabili al 100%.',
  totalPodsLabel: 'Alloggi Totali:',
  occupiedLabel: 'Occupati:',
  civicReserveLabel: 'Riserva Civica:',
  furnitureShopTitle: '🛋️ Emporio Civico del Riuso (Furniture Swap Shop)',
  furnitureShopSubtitle: 'I mobili pesanti lasciati negli alloggi riassegnati sono liberamente disponibili a costo zero per qualsiasi nuovo arrivato:',
  furnitureBeds: '🛏️ Letti:',
  furnitureChairs: '🪑 Sedie:',
  furnitureTables: '🪵 Tavoli:',
  furnitureWardrobes: '🚪 Armadi:',
  furnitureWorkbenches: '🔨 Banchi da lavoro:',
  bioclimaticHousingUnitsTitle: 'Moduli Abitativi Bioclimatici',
  podOccupied: 'Occupato',
  podCivicReserve: '🟢 Riserva Civica',
  sabbaticalActiveBadge: '🔒 Congedo Attivo',

  // Machinery & Entropy
  entropyTitle: 'Secondo Principio della Termodinamica (Entropia & Usura)',
  entropySubtitle: 'I macchinari si degradano con il carico. Se l’integrità scende sotto il 25%, l’efficienza crolla e compaiono perdite. Esegui la manutenzione artigiana o il riciclo nel FabLab.',
  durabilityLabel: 'Integrità',
  btnArtisanRepair: '🔧 Riparazione Artigiana',
  circularBufferTitle: '♻️ Deposito Materiali Circolari del FabLab',
  matAluminum: '🧱 Alluminio:',
  matFilament: '🧵 Filamento PETG:',
  matCopper: '⚡ Cavo di Rame:',
  matBiochar: '🌱 Biochar:',
  btnSmeltMetals: 'Rifondi Metalli di Recupero',
  btnShredPlastics: 'Trita Plastiche per Stampante 3D',
  btnCompostBiochar: 'Composta Biochar per le Serre',

  // Dual-Track & Tech Tree
  dualTrackTitle: '🤖 Albero Tecnologico Robot & Ponte Hardware Dual-Track',
  dualTrackSubtitle: 'Costruire automazioni cancella per sempre turni umani dal tabellone. Ogni traguardo nel simulatore sblocca veri progetti open-hardware per stampanti 3D e Home Assistant!',
  availableStocks: 'Scorte FabLab Disponibili:',
  activeRobotsBadge: 'Attivi',
  cancelsHumanChore: 'Cancella la fatica umana giornaliera di',
  costLabel: 'Costo:',
  btnFabricateRobot: '🛠️ Fabbrica nel FabLab',
  btnInsufficientMaterials: '❌ Materiali Insufficienti',
  realHardwareBlueprintTitle: '🔌 PROGETTO HARDWARE REALE',
  btnDownloadStl: '📥 Scarica CAD (.STL)',
  btnViewYaml: '📄 Vedi YAML per Home Assistant',
  yamlCopiedAlert: 'Configurazione YAML per Home Assistant copiata negli appunti!',

  // Athenian Sortition Council & Dilemmas
  councilDeliberationBadge: '🏛️ DELIBERA DEMARCHICA ATENIESE',
  councilLocalMediation: 'Pannello di Mediazione Locale',
  councilNeighborhood: 'Consiglio di Sorteggio di Quartiere',
  councilStanceTitle: 'Orientamento dell\'Assemblea',
  thresholdLabel: 'Soglia Richiesta',
  votesNeeded: 'voti necessari',
  thresholdMet: 'RATIFICATA',
  thresholdPending: 'IN ATTESA',
  inspectJurors: 'Ispeziona Giurati Estratti',
  citizensLabel: 'Cittadini',
  inFavor: 'a Favore',
  against: 'Contrari',
  btnRatifyA: 'Ratifica Opzione A',
  btnRatifyB: 'Ratifica Opzione B',
  councilInRecess: 'Il Consiglio è in pausa. La deliberazione si avvierà al manifestarsi di un dilemma comunitario.',

  // Legacy Adversary Stress Events
  systemAttackBadge: '⚠️ ATTACCO DI STRESS SISTEMICO RILEVATO',
  threatConsequenceTitle: 'Conseguenze della Minaccia:',
  threatLabel: 'Minaccia:',
  btnDeployCountermeasure: 'Attiva Contromisura',

  // Map & Hex Tooltips
  usufructBadge: 'USUFRUTTO',
  legacyDebtBadge: 'ZONA A DEBITO',
  commonsLabel: '🌱 Bene Comune',
  unclaimedTerritoryDesc: 'Territorio libero pronto per una fondazione cooperativa!',

  // World Map, Geolocation & Bioclimatic Settlement
  viewWorldMap: '🌍 Mappa del Mondo',
  viewVillage: '🏘️ Visuale Villaggio',
  btnLocateMe: '📍 Trova la mia Bioregione',
  btnBackToMap: '🌍 Torna alla Mappa del Mondo',
  btnVisitVillage: '🔭 Visita & Entra nel Villaggio',
  mapSatellite: 'Vista Satellitare',
  mapPhysical: 'Rilievo Fisico',
  foundNodeTitle: 'Fonda Nuovo Nodo O.N.E.',

  foundNodeDesc: 'Stabilisci un nuovo insediamento autosufficiente secondo la zona bioclimatica locale:',
  btnConfirmFound: 'Pianta Faro O.N.E.',
  btnClaimUsufruct: 'Prendi Dimora in Usufrutto (Gratuito)',
  yourHomeBadge: 'La tua Dimora Primaria in Usufrutto',
  yourHomeDesc: 'Detieni usufrutto attivo su questa dimora bioclimatica. I tuoi effetti personali sono strettamente inviolabili sotto gli invarianti costituzionali di Classe-0.',
  btnReleaseToPool: 'Rilascia alla Riserva Civica',
  dwellingOccupiedTitle: 'Residente in Usufrutto Attivo',
  inhabitantName: 'Abitante:',
  inhabitantRole: 'Vocazione:',
  laborDuty: 'Lavoro Sociale:',
  sabbaticalStatus: 'Protezione Anno Sabbatico:',
  occupiedWarning: 'Questa dimora è attualmente abitata. La casa non può essere comprata né pignorata.',
  vacantReserveTitle: 'Dimora Libera della Riserva Civica',
  vacantReserveDesc: 'Questa dimora è libera e immediatamente disponibile in usufrutto. Zero affitto, zero mutuo, zero debito.',
  buildingMaterialLabel: 'Materiali Costruttivi:',
  solarEfficiencyLabel: 'Efficienza Solare:',
  waterCatchmentLabel: 'Sistema Idrico:',
  heatingDemandLabel: 'Fattore Termico:',
  circularFurnitureTitle: 'Mobili Circolari Inclusi:',
  furnitureNote: 'Forniti dall\'Emporio Civico del Riuso locale a costo zero.',
  constitutionalGuaranteesTitle: 'Garanzie Costituzionali (AGPL-3.0)',
  welcomeBackHomeTitle: 'Bentornato a Casa!',
  welcomeBackHomeMsg: 'La tua dimora in usufrutto a',
  welcomeBackHomeSub: 'è al sicuro. Congedo sabatico: 30 giorni protetti.',
  inviolableGearTitle: 'Beni Personali:',
  sabbaticalDesc: 'Protegge il tuo alloggio fino a 180 giorni mentre sei offline o viaggi sulla Terra. Il riassegnamento è bloccato.',
  myHomePill: 'Casa Mia',

  // Crisi dell'Avversario Tradizionale (Italiano)
  crisis_npl_name: 'Attacco di Crediti Deteriorati (Lawfare di Pignoramento)',
  crisis_npl_desc: 'Un fondo speculativo ha acquistato un mutuo in sofferenza del 2011 sul territorio del nodo. Ufficiali giudiziari e guardie private hanno notificato un avviso di sequestro di 24 ore ai cancelli!',
  crisis_npl_impact: 'Se irrisolto: il 30% dei macchinari del FabLab viene sequestrato e il commercio esterno bloccato.',
  crisis_npl_opt1_label: 'Atto di Custodia Civile (Catena Umana Nonviolenta)',
  crisis_npl_opt1_cost: 'Richiede 4 ore di presidio comunitario, zero euro pagati',
  crisis_npl_opt2_label: 'Paga l\'Estorsione dal Fondo Fiat di Emergenza',
  crisis_npl_opt2_cost: 'Costa €2.500 dalla riserva hardware',

  crisis_grid_name: 'Stacco della Rete & Blackout Improvviso',
  crisis_grid_desc: 'Il monopolista elettrico regionale ha tagliato arbitrariamente l\'allaccio ad alta tensione durante un gelo fuori stagione, adducendo armoniche non certificate della microrete.',
  crisis_grid_impact: 'Se l\'isolamento fallisce: le pompe dell\'acqua si fermano, la temperatura delle serre scende sotto gli 8°C.',
  crisis_grid_opt1_label: 'Attiva Isolamento Galvanico a Isola & Taglio Carichi Non Critici',
  crisis_grid_opt1_cost: 'Consuma 30 kWh di accumulo batterie, isola completamente il nodo',
  crisis_grid_opt2_label: 'Avvia il Generatore Diesel Inquinante',
  crisis_grid_opt2_cost: 'Costa €450 in combustibili fossili, genera fumi tossici',

  crisis_tax_name: 'Ispezione Fiscale & Blocco Stradale',
  crisis_tax_desc: 'La polizia stradale e gli ispettori fiscali hanno fermato il furgone del nodo che trasportava conserve biologiche e prototipi CNC verso un gruppo d\'acquisto solidale.',
  crisis_tax_impact: 'Entrate fiat esterne bloccate; beni esportati confiscati se non contrastati.',
  crisis_tax_opt1_label: 'Devia la Logistica su Strade Secondarie & Scambio di Credito Diretto',
  crisis_tax_opt1_cost: 'Sposta il 100% del commercio in baratto diretto con i nodi federati',
  crisis_tax_opt2_label: 'Accetta e Paga la Sanzione Fiscale sul Trasporto',
  crisis_tax_opt2_cost: 'Costa €950 in valuta fiat',

  crisis_ubi_name: 'Falso Reddito di Base & Infiltrazione Speculativa',
  crisis_ubi_desc: 'Una società speculativa di proptech distribuisce carte prepagate da €500 ai giovani residenti, tentando di convincerli a subaffittare le case comuni per contanti.',
  crisis_ubi_impact: 'Se non fermato: emerge un mercato nero degli affitti, minando l\'usufrutto dinamico.',
  crisis_ubi_opt1_label: 'Convoca il Consiglio per Sorteggio & Apri Bilancio Termodinamico di Leontief',
  crisis_ubi_opt1_cost: 'Dimostra la superiorità fisica dell\'usufrutto; rafforza il patto non speculativo',
  crisis_ubi_opt2_label: 'Ignora e Spera che Prevalga la Moralità Individuale',
  crisis_ubi_opt2_cost: 'Zero costi oggi, rischio di frammentazione interna domani',

  // Dilemmi Civici del Consiglio per Sorteggio (Italiano)
  dil_refugees_title: 'Arrivo di 4 Rifugiati Termodinamici',
  dil_refugees_summary: 'Una famiglia il cui alloggio ha perso elettricità e acqua per il distacco delle utenze commerciali ha raggiunto i cancelli del comune in cerca di asilo.',
  dil_refugees_quote: '"Abbiamo moduli liberi nella Riserva Civica, ma il granaio si consumerà più rapidamente."',
  dil_refugees_optA_label: 'Concedi Asilo & Dimora in Usufrutto Incondizionato',
  dil_refugees_optA_desc: 'Assegna 2 moduli della riserva civica, garantisci la soglia di sussistenza, integra nei turni.',
  dil_refugees_optB_label: 'Offri Razioni di Emergenza e Guida verso Nodo Federato',
  dil_refugees_optB_desc: 'Fornisci 3 giorni di razioni e accumulatori, guidandoli verso l\'hub alpino più grande.',

  dil_solar_title: 'Assegnazione del Surplus Solare Estivo',
  dil_solar_summary: 'I pannelli fotovoltaici generano 60 kWh/h oltre il fabbisogno diurno. Il banco batterie è pieno al 95%.',
  dil_solar_quote: '"Fondiamo alluminio grezzo per il nuovo rover agricolo o accumuliamo acqua calda per le serre notturne?"',
  dil_solar_optA_label: 'Fondi Alluminio di Recupero in Lingotti nel FabLab',
  dil_solar_optA_desc: 'Alimenta il forno a induzione per fondere 40kg di alluminio strutturale per ricambi robotici.',
  dil_solar_optB_label: 'Accumula Calore & Raffresca il Buffer Idrico',
  dil_solar_optB_desc: 'Raffresca le cisterne d\'acqua per proteggere le serre dall\'ondata di calore imminente.',

  dil_fiat_title: 'Esportazione Miele Artigianale vs Mense Comunitarie',
  dil_fiat_summary: 'Il nostro apiario agroforestale ha prodotto 180kg di miele millefiori. Un rivenditore biologico cittadino offre €2.200.',
  dil_fiat_quote: '"Con €2.200 possiamo acquistare regolatori MPPT ad altissima efficienza che non possiamo fabbricare qui."',
  dil_fiat_optA_label: 'Esporta sul Mercato Esterno per il Fondo Hardware',
  dil_fiat_optA_desc: 'Deposita €2.200 nella cassa importazioni comunitaria; acquista componenti elettronici critici.',
  dil_fiat_optB_label: 'Distribuisci al 100% alle Mense e alla Clinica Medica',
  dil_fiat_optB_desc: 'Privilegia la nutrizione biofisica e sciroppi antibiotici naturali per bambini e anziani.',

  dil_sabbatical_title: 'Controversia sulla Scadenza dell\'Anno Sabbatico',
  dil_sabbatical_summary: 'Un cittadino ha dichiarato un blocco sabbatico di 30 giorni per prestare soccorso in un nodo alluvionato, ma è assente da 52 giorni senza contatto radio. Una giovane coppia ha bisogno di casa.',
  dil_sabbatical_quote: '"La Costituzione stabilisce che dopo 45 giorni senza comunicazioni la dimora torna alla Riserva Civica. Ma si trattava di mutuo soccorso!"',
  dil_sabbatical_optA_label: 'Riassegna la Dimora alla Riserva & Mobili all\'Emporio',
  dil_sabbatical_optA_desc: 'Applica rigorosamente l\'usufrutto dinamico; assegna il modulo alla coppia. Custodisci gli effetti personali.',
  dil_sabbatical_optB_label: 'Concedi Proroga Straordinaria di 30 Giorni per Mutuo Soccorso',
  dil_sabbatical_optB_desc: 'Mantieni la dimora protetta; invita la coppia a soggiornare temporaneamente nel padiglione comune.',

  dil_mesh_title: 'Espansione Ripetitore Mesh LoRa vs Sauna Comune',
  dil_mesh_summary: 'L\'officina FabLab dispone di legname di recupero, microcontrollori e mini-pannelli solari per un solo grande progetto questo mese.',
  dil_mesh_quote: '"Un ponte LoRa in quota ci connette a 3 altri hub bioregionali. Una sauna a legna rigenera lo spirito dopo i turni nei campi."',
  dil_mesh_optA_label: 'Installa Ripetitore Crittografico LoRa in Quota',
  dil_mesh_optA_desc: 'Potenzia la resilienza della rete mesh contro la censura delle telecomunicazioni tradizionali.',
  dil_mesh_optB_label: 'Costruisci Sauna & Bagno Civico a Biomassa Solare',
  dil_mesh_optB_desc: 'Riduci drasticamente l\'affaticamento fisico e aumenta il morale comunitario del 15%.'
};


