# **O-ASIS DUAL-TRACK: GAME DESIGN DOCUMENT (GDD)**
## **The Living Thermodynamic Sandbox — Persistent Planetary MMO & Resilience Simulator**

**Repository Target:** `https://github.com/kyberlex/one-dual-track`  
**License:** AGPL-3.0-or-later  
**Architect:** Kyberlex (`kyberlex@proton.me`)  
**Status:** Living Canonical GDD — Persistent Working Specification  

---

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    O-ASIS DUAL-TRACK: LIVING WORLD MMO                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ • World Structure : Persistent, continuous planetary sandbox (Zero Game Over)│
│ • Factions        : O.N.E. (Commons/Usufruct) vs. Legacy (Debt/Foreclosure) │
│ • Topology        : Uber H3 Hexagonal Global Grid (Resolution 6-7)          │
│ • Node Founding   : Quorum Rule (Requires >= 3-5 players/agents to spawn)   │
│ • Property Logic  : Dynamic Usufruct ("Use it or lose it" + Sabbatical Lock)│
│ • Personal Gear   : Inviolable Personal Inventory preserved across sessions │
│ • Real Bridge     : Level unlocks real CAD (.STL) & Home Assistant YAML     │
│ • Engine & Comms  : SvelteKit + Canvas/WebGL + WebRTC P2P + Tor (.onion)    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## **I. IL MONDO PERSISTENTE: ZERO "GAME OVER" GLOBALE, SOLO VITA DEI NODI**

In `O-ASIS Dual-Track`, **non esiste una schermata formale di "Hai Vinto" o "Hai Perso"**.  
Il gioco non è una partita arcade a round, ma una **simulazione planetaria persistente e vivente** (ispirata alla libertà sandbox di *EVE Online* e *Rust*, ma interamente basata sulla cooperazione termodinamica, l'ingegneria open-source e la demarchia ateniese):

1. **La Lotta Perpetua dei Nodi (PvE Cooperativo Planetario):**  
   Il pianeta Terra è una scacchiera esagonale continua. I singoli Nodi territoriali nascono, crescono, commerciano, si federano oppure collassano sotto gli attacchi del sistema o del clima.
2. **Umanità Unita contro il Sistema (No Griefing, No Tossicità):**  
   Tutti i giocatori umani reali giocano nella fazione **O.N.E. (I Costruttori del Nuovo Mondo)**. Non ci sono giocatori umani che fanno i predatori o i banchieri sadici contro altri cittadini:
   * **Il Nemico è il Sistema (LEGACY ENGINE):** Un'Intelligenza Artificiale Avversaria implacabile e fredda che simula la finanza predatoria, gli ufficiali giudiziari, i monopoli energetici e i decreti burocratici.
   * La cooperazione umana è totale: se un vicino è in difficoltà, tutta la comunità corre ad aiutarlo.

---

## **II. COME SI ENTRA NEL MONDO: FONDAZIONE E LA REGOLA DEL QUORUM**

Nessun essere umano può sopravvivere da solo a una crisi sistemica. La solitudine è la condanna del vecchio mondo. Per questo, la nascita di un Nodo obbedisce a una regola ferrea:

### **1. La Scelta Iniziale:**
Il giocatore apre la mappa globale 2.5D a esagoni:
* **Opzione A: Entrare in un Nodo Esistente:**  
  Può zoomare su un qualsiasi Nodo O.N.E. già attivo sulla Terra (es. *Detroit Delray*, *Val di Susa*, *Atacama*, o nodi fondati da altri giocatori) e richiedere asilo/residenza come nuovo cittadino.
* **Opzione B: Proporre la Fondazione di un Nuovo Nodo:**  
  Può selezionare un esagono libero sulla mappa del pianeta (la propria città reale, una vallata, un'area dismessa).

### **2. La Regola del Quorum di Fondazione (No Lone Wolves):**
* Un singolo giocatore **non può fondare un nodo da solo**.
* Quando proponi un nuovo insediamento, viene piantato uno **"Shadow Beacon" (Segnale di Richiamo)** sull'esagono.
* Il Nodo si attiva e inizia a funzionare **SOLO quando ci sono almeno 3 o 5 giocatori (veri in P2P o agenti AI simulati se si gioca offline)** pronti a comporre il nucleo fondatore cooperativo!
* La sussistenza iniziale richiede una divisione equa dei compiti: uno all'idraulica/energia, uno alla terra/cibo, uno all'officina, uno alla cura comune.

---

## **III. PERSISTENZA DEL GIOCATORE & LA REGOLA DELL'USUFRUTTO DINAMICO ("USE IT OR LOSE IT")**

Cosa succede quando ti disconnetti dal gioco e torni dopo qualche giorno o settimana?  
Il mondo continua a girare in tempo reale!

### **1. Se il Nodo è ancora vivo quando ti riconnetti:**
* Riappari esattamente all'interno del tuo Nodo.
* **Se torni entro un tempo normale (o avevi dichiarato il Congedo / Vacanza):**  
  La tua casa è lì, esattamente come l'avevi lasciata, intatta e riscaldata.
* **SE HAI ABBANDONATO IL GIOCO PER TROPPO TEMPO (SENZA DICHIARARE LA VACANZA):**  
  Qui scatta la vera legge costituzionale di O.N.E.: **L'Abitazione è in Usufrutto, non in Proprietà Speculativa!**
  * Nessuna casa può rimanere sfitta o abbandonata mentre altre persone cercano un tetto.
  * Se ti assenti per troppe settimane senza comunicare il Sabbatical, il Consiglio di quartiere ha dichiarato la casa "Abbandonata" e l'ha **riassegnata a una nuova famiglia o coppia bisognosa**.
  * **Cosa perdi?** Hai perso l'usufrutto dell'alloggio e i mobili pesanti rimasti all'interno.
  * **Che fine fanno i mobili pesanti? (L'Emporio Civico del Riuso / The Furniture Swap Shop):**  
    Nel mondo di O.N.E. nulla va sprecato o finisce in discarica! I mobili lasciati indietro (letti, armadi, tavoli, sedie, librerie) vengono inventariati e trasferiti automaticamente nel **Negozio / Deposito Mobili del Nodo (Circular Furniture Exchange)**:
    * Qualsiasi nuovo arrivato, giovane o nuova coppia può entrare nel negozio del Nodo e prendere gratuitamente quei mobili per arredare la propria casa!
    * Se un mobile è usurato, la falegnameria del FabLab lo ripara, lo vernicia con oli naturali o lo scompone per ricavarne legname utile.
  * **COSA CONSERVI SEMPRE (INVIOLABILE)?**  
    Tutte le tue **cose personali, i tuoi vestiti, i tuoi attrezzi, il tuo computer, i tuoi crediti e gli strumenti** che avevi nel tuo zaino e nell'inventario personale quando hai lasciato il gioco sono **salvi al 100%**!
  * Al rientro, non sei senza diritti: chiedi un nuovo alloggio libero al Pool Civico del quartiere, ti viene assegnato un nuovo modulo e puoi andare all'Emporio del Riuso a scegliere i mobili per riarredarlo a costo zero.

### **2. La Funzione "Vacanza / Sabbatical Lock":**
Se sai che per 2 o 3 settimane devi studiare, lavorare o non puoi giocare, non vieni punito:
* Attivi sul tuo personaggio la modalità **"In Congedo / Vacanza"**.
* La tua casa viene **congelata e protetta** per tutta la durata dichiarata del congedo: nessuno può riassegnarla!

### **3. Se il Nodo è stato distrutto dagli avversari Legacy durante la tua assenza:**
* Se il Cartello Legacy ha fatto irruzione, staccato l'energia o sequestrato il capannone mentre eri offline:
* Al login ti risvegli come **"Rifugiato Termodinamico"** con il tuo zaino personale intatto.
* Puoi metterti in marcia sulla mappa verso il Nodo alleato più vicino per portare le tue competenze e la tua testimonianza.

---

## **IV. LA FASE DI TRANSIZIONE: TURNI DI LAVORO, ROBOT & COMMERCIO FIAT**

Se stiamo gamificando la realtà **al giorno d'oggi (2026)**, non abbiamo androidi magici. Il gioco è una scuola di emancipazione materiale:

### **1. I Turni di Sussistenza a Rotazione (The Chore Roster):**
* All'inizio la sussistenza richiede circa **4 ore al giorno di lavoro manuale** a turni:
  * *Turno Terra:* Orti, compost, serre.
  * *Turno Impianti:* Filtri acqua, batterie, caldaie, generatori.
  * *Turno Cura:* Cucina comune, pane, bambini, pulizia.
* Nessun parassita, nessun servo: i turni ruotano tra tutti i residenti.

### **2. Costruire i Robot per Cancellare i Turni (Tech Tree):**
* Nel FabLab del Nodo si usano schede open-source (ESP32), motori di recupero e stampanti 3D per fabbricare automazioni:
  * Elettrovalvole automatiche per irrigazione $\rightarrow$ *Cancella 2 ore di fatica umana al giorno.*
  * Rover agricolo su ruote e braccio robotico cartesiano $\rightarrow$ *Cancella i compiti di trapianto e raccolta.*
* **Meccanica:** Ogni robot completato **cancella fisicamente turni umani dal tabellone**, liberando tempo libero per tutti.

### **3. L'Interfaccia Commerciale con il Mondo Esterno (Vendere Lavoro per Comprare Hardware):**
Un Nodo nascente non può fabbricare chip avanzati, inverter industriali o antibiotici complessi.  
Per comprarli dal mondo capitalista senza fare debiti bancari:
* **Export di Servizi Digitali:** I residenti informatici, legali, traduttori e ingegneri svolgono lavori da remoto per committenti esterni.
* **Export di Beni Fisici di Pregio:** Vendita all'esterno di miele biologico, conserve, zafferano o pezzi meccanici di precisione usciti dall'officina CNC.
* **Cassa Comune di Importazione (Zero Dividendi):**  
  La valuta fiat (Euro / Dollari) guadagnata all'esterno viene versata nella cassa comune del Nodo, con un unico scopo: **comprare hardware critico non producibile in loco** (batterie industriali, celle solari, farmaci salvavita).
* **Decoupling Finale:** Man mano che il Nodo si attrezza e si connette con altri Nodi vicini, l'interscambio diventa P2P basato su matrici fisiche di Leontief, azzerando la dipendenza dal denaro fiat.

---

## **V. L'ABITARE: "SKELETON & INFILL" E DINAMICA DI COPPIA**

* **Architettura Bioclimatica Mass-Customization:** Scheletro modulare a norme termodinamiche (tubi, micro-rete DC 48V, pompa di calore) + Pelle bioclimatica vernacolare locale (larice/pietra sulle Alpi, loft a Detroit, terra cruda al sud) + Pareti interne a secco mobili.
* **Convivenza e Matrimoni (La Realtà):**
  * Il partner vive quasi sempre altrove! Quando due persone decidono di vivere insieme:
    * *Scenario 1:* Uno si trasferisce dall'altro e rilascia il proprio alloggio singolo al Pool Civico (zero burocrazia).
    * *Scenario 2:* Entrambi rilasciano i loro due monolocali al Pool Civico (la comunità guadagna due alloggi) e prendono un appartamento familiare da 2-3 vani dal catalogo civico aperto.
* **Il Buffer di Riserva Fisiologico (5–8%):** Ogni distretto mantiene sempre una quota di alloggi liberi e pronti per nuove coppie, nuovi arrivi e manutenzioni.
* **Separazione / Divorzio:** Nessun pignoramento, nessun dramma. Entrambi conservano il diritto all'alloggio: chi lascia la casa comune accede subito a un nuovo modulo autonomo nello stesso quartiere.

---

## **VI. IL SORTEGGIO CIVICO PER LE ASSEMBLEE (ATHENIAN SORTITION ENGINE)**

* **Zero Politici, Zero Campagne:** Assemblee di quartiere composte da **7 o 9 cittadini estratti a sorte** dall'anagrafe del Nodo ogni 6 o 12 mesi, con *cooling-off* di 3 anni.
* **Ruolo dell'Assemblea:** Grandi scelte etiche e allocazione del surplus energetico/alimentare, giustizia riparativa di prossimità, audit trasparente anti-borsa nera.
* **Gameplay Stile Reigns:** Dilemmi comunitari rapidi con le schede dei consiglieri sorteggiati (con età, carattere e priorità) e votazione a maggioranza qualificata (5 su 7).

---

## **VII. IL SALTO ONTOLOGICO: "DUAL-TRACK HANDSHAKE" (DAL GIOCO ALLA REALTÀ)**

1. **Sblocco Open Hardware:** Completare le tappe sblocca file CAD **.STL / .3MF** per stampanti 3D e codice **YAML per Home Assistant (Zigbee / MQTT)** per replicare la micro-rete a casa propria.
2. **Telemetria Reale (Proof of Usufruct):** Collegare veri sensori IoT (Shelly, inverter solari) conferisce al Nodo di gioco scudi di stabilità fisica.

---

## **VIII. INTERFACCIA: ESTREMA SEMPLICITÀ (SOLO 4 BARRE & ZERO COMPLICAZIONI)**

Per non rendere il gioco un pesante foglio Excel, l'interfaccia è minimale e gestibile con un solo dito su smartphone:
* **Le 4 Barre in Alto:**
  1. ⚡ **Energia / Calore**
  2. 💧 **Acqua**
  3. 🥗 **Cibo**
  4. ⏳ **Tempo Libero & Felicità**
* **Controlli Tattili Intuitivi:**  
  Trascini le persone sui compiti (Drag & Drop). I robot si costruiscono con un click e liberano le persone in automatico. Il commercio estero è un semplice furgone che invii e torna con le batterie. Le decisioni di coppia e assemblea sono pop-up a 2 opzioni chiare.

---

## **IX. FISICA DELL'ENTROPIA: USURA NEL TEMPO, MANUTENZIONE & RICICLO CIRCOLARE (CLOSED LOOP)**

Nel mondo reale e nella fisica di O.N.E., vige il **Secondo Principio della Termodinamica**: l'entropia non si ferma, le cose materiali si consumano e si degradano con il tempo e con l'uso.  
Se gli oggetti fossero eterni e indistruttibili, il gioco diventerebbe statico e noioso. L'usura e il riciclo creano il battito cardiaco vitale di una vera economia ecologica:

### **1. La Barra dell'Usura (Durability & Wear-and-Tear):**
Ogni componente, macchina, mobile e infrastruttura possiede una percentuale di **Integrità / Durabilità**:
* **Impianti & Macchine:** I banchi batteria perdono capacità chimica dopo migliaia di cicli; i filtri dell'acqua si intasano di calcare; le cinghie e i cuscinetti dei motori si consumano.
* **Mobili & Abitazioni:** I tavoli si rigano, le sedie si allentano, i tessuti si logorano, le guarnizioni delle finestre invecchiano.
* **Utensili dell'Officina:** Le punte delle frese CNC perdono il filo, le resistenze degli estrusori 3D si ossidano.

### **2. Il Bivio di Fine Ciclo: Riparare o Riciclare? (Repair vs. Upcycle):**
Quando un oggetto o impianto scende sotto il 20% di durabilità, compare un bivio tattico immediato:
1. **Opzione Riparazione Preventiva (Manutenzione Artigiana):**  
   Il giocatore (o l'artigiano/meccanico assegnato al turno di manutenzione) spende 30 minuti di lavoro d'officina e un goccio di lubrificante/ricambi stampati per rimettere a nuovo l'oggetto (l'integrità torna al 100%).  
   *Valore sociale:* Mantiene centrale il ruolo dell'artigianato umano esperto nel quartiere.
2. **Opzione Riciclo Circolare a Rifiuti Zero (Closed-Loop Shredding):**  
   Se l'oggetto è arrivato a fine vita strutturale e non conviene ripararlo, viene smontato e gettato nell'**Area di Rigenerazione del FabLab**:
   * **I Metalli (Alluminio, Rame, Acciaio):** Vengono rifusi nel piccolo forno a induzione solare del Nodo per colare nuovi lingotti ed estrusi per la fresa CNC.
   * **Le Plastiche & Polimeri:** Triturati in granuli dal trinciatore meccanico e ri-estrusi come bobine di filo per stampanti 3D per fabbricare nuovi raccordi idraulici.
   * **I Mobili in Legno Usurati:** Le assi sane vengono piallate per costruire scaffali; gli sfridi e la segatura diventano cippato per il compostaggio biologico delle serre o biochar per arricchire la terra.
   * **Le Batterie Esauste:** Vengono disassemblate cella per cella: quelle ancora al 70% di capacità vengono riutilizzate per alimentare l'illuminazione pubblica notturna; le celle completamente morte vanno alla decantazione chimica per il recupero dei sali di litio/sodio.

### **3. Impatto sul Gioco (Il Ritmo Vitale):**
* Circa il **10–15% dell'energia e del tempo del Nodo** è naturalmente dedicato al ciclo virtuoso di manutenzione e riciclo.
* Se trascuri la manutenzione, i tubi iniziano a gocciolare (perdi acqua 💧), le pompe fanno rumore, le batterie disperdono calore (perdi energia ⚡) e i residenti si lamentano della sedia rotta (scende il morale ⏳).
* Se mantieni il ciclo attivo, il Nodo funziona come un orologio svizzero splendente e **non produce un solo grammo di spazzatura**, incarnando la perfezione della termodinamica circolare!

---

## **X. IL MOTORE AVVERSARIO LEGACY (L'INTELLIGENZA ARTIFICIALE ANTAGONISTA: PVE COOPERATIVO)**

Per eliminare alla radice il *griefing*, il trolling distruttivo e la tossicità tipica dei giochi PvP (dove giocatori sadici passano ore a distruggere il lavoro altrui offline), **la fazione LEGACY è interamente guidata da un Motore Algoritmico Simulato (AI Adversarial Director, ispirato allo Storyteller di RimWorld)**.

Tutti i giocatori umani sono uniti nella cooperazione. Il "Cattivo" è il **Sistema Istituzionale e Finanziario Impersonale**:

### **1. La Logica dell'AI Director di Legacy (Calcolo delle Vulnerabilità):**
L'algoritmo Legacy monitora costantemente i dati termodinamici e la telemetria di ogni Nodo O.N.E. del pianeta:
* Se un Nodo accumula una vulnerabilità (es. ha ancora il 30% di dipendenza dalla rete elettrica esterna, o ha una riserva di cibo troppo bassa):
* L'AI Legacy seleziona ed esegue **attacchi di stress-test sistemici mirati**:
  * **Attacco 1: Pignoramento Giudiziario (NPL Debt Strike):** L'AI individua una vecchia ipoteca o fallimento pregresso sull'area e invia una squadra di Ufficiali Giudiziari per notificare il sequestro dei macchinari. *Contromossa:* I cittadini devono opporre la certificazione di *Custodia Civilis* o la resistenza pacifica coordinata.
  * **Attacco 2: Stacco di Rete (Grid Severing):** Nei giorni di gelo estremo, l'AI Legacy stacca la corrente centrale. *Contromossa:* Attivazione dell'accumulo batterie e della separazione galvanica (Island Mode).
  * **Attacco 3: Ispezione Fiscale & Blocchi Stradali:** Se il Nodo esporta molto lavoro verso l'esterno, l'AI Legacy tenta di bloccare i furgoni del commercio con controlli doganali.
  * **Attacco 4: Cooptazione / Falso UBI:** L'AI tenta di corrompere singoli residenti offrendo sussidi in denaro fiat facile per incentivare la nascita di una borsa nera interna.

### **2. Difficoltà Adattiva & Solidarietà Planetaria:**
* L'AI Legacy non è stupida né invincibile: la sua intensità scala con la grandezza del Nodo.
* Quando un Nodo subisce un attacco pesante dall'AI Legacy, invia un segnale di **S.O.S. Mesh** agli esagoni vicini: altri giocatori reali su nodi limitrofi possono inviare furgoni di emergenza con cibo, batterie o volontari per respingere la crisi.

### **3. Modalità Speciale: "Red-Team Audit Sandbox" (Solo per Eventi/Hackathon):**
Per gli hacker, gli economisti e i crittografi che vogliono testare matematicamente le falle della Costituzione di O.N.E., esiste una modalità opzionale isolata (Sandbox di Stress-Test):
* Durante hackathon pubblici o sessioni di audit, programmatori selezionati possono prendere i comandi dell'AI Legacy per scagliare exploit economici coordinati e verificare se le matrici di Leontief e gli scudi legali resistono alla pressione.

---

## **XI. LEVE OPEN-SOURCE: COSTRUIRE SUI GIGANTI (ZERO REINVENTING THE WHEEL)**

Scrivere un motore grafico, una mappa planetaria o un sistema di controlli touch da zero sarebbe uno spreco di anni. Il simulatore/gioco è costruito assemblando blocchi open-source d'élite (licenze MIT / Apache 2.0 / BSD):

1. **Rendering Grafico 2D, Controlli Touch & Drag-and-Drop:**
   * **`Phaser.js` (o `Pixi.js`):** Il motore 2D WebGL/Canvas più diffuso e collaudato al mondo.
   * *Cosa fa già gratis per noi:* Gestione del drag-and-drop degli abitanti sui compiti, zoom a due dita (pinch-to-zoom), animazioni a 60 FPS su qualsiasi smartphone, gestione della telecamera e degli effetti sonori. Zero codice grafico a basso livello da scrivere da zero.
2. **Mappa Planetaria a Esagoni:**
   * **`Uber H3 (h3-js)`:** La libreria open-source ufficiale di Uber per la griglia esagonale planetaria. Permette di partizionare la Terra in esagoni (risoluzione 6–7, raggio 3–8 km) con 3 righe di JavaScript, calcolando all'istante vicinati, distanze e percorsi.
   * **`MapLibre GL`:** La mappa vettoriale fluida open-source per il rendering del globo in stile dark-mode solarpunk/cyberpunk.
3. **Motore di Simulazione & Game Loop (Colony Sim / Incremental):**
   * Pattern e architetture collaudate da giochi open-source (come i motori di *A Dark Room*, *Universal Paperclips* e *Subterrans*): cicli di calcolo a intervalli temporali regolari (*ticks*) per aggiornare la termodinamica di Leontief.
4. **Cosa Scriviamo NOI (Il 10% Unico e Rivoluzionario di O.N.E.):**
   * Le 4 barre termodinamiche (Energia, Acqua, Cibo, Tempo Libero/Felicità).
   * L'algoritmo del Sorteggio Ateniese e i bivi morali stile *Reigns*.
   * La regola costituzionale dell'Usufrutto dinamico e l'Emporio dei Mobili del Nodo.
   * L'AI Adversarial Director di Legacy e le difese non-violente.
   * Il ponte fisico Dual-Track per sbloccare file CAD (.STL) e automazioni Home Assistant (.YAML).




