================================================================================
  MATTIAFARINARO.GITHUB.IO — DOCUMENTAZIONE TECNICA COMPLETA
  Versione 2.0 — Architettura modulare
================================================================================

INDICE
  1. Struttura del repository
  2. Come caricare i file su GitHub
  3. Architettura del codice
  4. Moduli JavaScript (cartella js/)
  5. Moduli CSS (cartella css/)
  6. Pagine HTML
  7. Google Sheets — guida alla gestione
  8. Come aggiungere un articolo
  9. Come modificare il sito
  10. Troubleshooting

================================================================================
  1. STRUTTURA DEL REPOSITORY
================================================================================

  mattiafarinaro.github.io/       ← root del repository GitHub
  │
  ├── index.html                  ← Homepage
  ├── pensieri.html               ← Pagina tutti gli articoli
  ├── foto.jpg                    ← La tua foto (caricala tu)
  │
  ├── css/
  │   ├── base.css                ← Variabili, reset, tipografia, footer
  │   ├── nav.css                 ← Navbar fissa + hamburger mobile
  │   ├── blog.css                ← Card blog, griglia, articolo in evidenza
  │   └── modal.css               ← Modal lettura articoli
  │
  ├── js/
  │   ├── config.js               ← ID Google Sheet e GID dei fogli
  │   ├── csv.js                  ← Parser CSV + funzioni fetch
  │   ├── utils.js                ← formatDate, readTime, getFoto, sortByOrder
  │   ├── nav.js                  ← toggleMenu, closeMenu
  │   └── modal.js                ← openModal, closeModal
  │
  └── README.txt                  ← Questo file (tienilo in locale, non serve su GitHub)

IMPORTANTE: foto.jpg va caricata da te nella root del repository.
Il file README.txt puoi tenerlo solo in locale sul tuo pc.

================================================================================
  2. COME CARICARE I FILE SU GITHUB
================================================================================

PRIMO CARICAMENTO (repository nuovo o da zero):
  1. Vai su github.com → accedi al repository mattiafarinaro.github.io
  2. Clicca "Add file" → "Upload files"
  3. Carica TUTTI questi file/cartelle mantenendo la struttura:
       index.html
       pensieri.html
       foto.jpg
       css/base.css
       css/nav.css
       css/blog.css
       css/modal.css
       js/config.js
       js/csv.js
       js/utils.js
       js/nav.js
       js/modal.js
  4. Clicca "Commit changes"
  5. Aspetta 1-2 minuti → il sito si aggiorna

AGGIORNAMENTO SINGOLO FILE (es. hai corretto index.html):
  1. Vai nel repository → clicca sul file da aggiornare
  2. Clicca l'icona matita (Edit)
  3. Incolla il nuovo contenuto
  4. Clicca "Commit changes"

NOTA: GitHub Pages pubblica automaticamente tutto quello che è nella
branch "main" (o "master") della root del repository.

================================================================================
  3. ARCHITETTURA DEL CODICE
================================================================================

Il sito usa un'architettura a file separati (NO framework, NO build step).
Ogni pagina HTML include i CSS e JS necessari nell'ordine corretto:

  HTML → carica CSS (base, nav, blog, modal) → carica JS (config, csv, utils, nav, modal) → logica pagina

ORDINE DI CARICAMENTO SCRIPT (critico — non modificare):
  1. config.js   → definisce SHEET_ID, GID, csvUrl()
  2. csv.js      → usa csvUrl() da config.js
  3. utils.js    → funzioni pure, nessuna dipendenza
  4. nav.js      → usa DOM, nessuna dipendenza JS
  5. modal.js    → usa formatDate() e readTime() da utils.js
  6. <script>    → logica specifica della pagina, usa tutto il resto

================================================================================
  4. MODULI JAVASCRIPT (cartella js/)
================================================================================

── config.js ────────────────────────────────────────────────────────────────

  Contiene l'ID del Google Spreadsheet pubblicato e i GID (ID numerici)
  di ogni foglio. È l'UNICO file da modificare se cambi il foglio Google.

  Funzione esposta:
    csvUrl(sheet)  → ritorna l'URL CSV per il foglio specificato
                     es. csvUrl('blog') → URL del foglio Blog

  Come trovare i GID:
    Apri il Google Sheet → clicca su una scheda → guarda l'URL
    Il numero dopo "&gid=" è il GID di quel foglio.

── csv.js ────────────────────────────────────────────────────────────────────

  Parser CSV conforme RFC 4180. Gestisce:
  - Celle multiriga (Alt+Invio in Google Sheets)
  - Virgolette escaped ("")
  - Intestazioni con nomi lunghi (es. "pubblicato (SI/NO)")

  Funzioni esposte:
    parseCSV(text)              → parsifica testo CSV grezzo → Array<Object>
    fetchSheet(sheet)           → scarica e parsifica un foglio → Promise<Array>
    filterVisible(rows, keyword)→ filtra righe dove colonna con keyword = SI
    filterPublished(rows)       → filtra righe dove "pubblicato" = SI

  NOTA: filterPublished e filterVisible usano ricerca parziale sul nome
  della colonna — funziona anche se la colonna si chiama "pubblicato (SI/NO)".

── utils.js ─────────────────────────────────────────────────────────────────

  Funzioni pure di utilità.

  Funzioni esposte:
    readTime(text)    → stima minuti di lettura (200 parole/min)
                        es. "3 min" oppure null se testo vuoto
    formatDate(raw)   → formatta data italiana in modo elegante
                        es. "marzo 2026" → "Mar 2026"
                            "15 marzo 2026" → "15 Mar 2026"
    getFoto(row)      → estrae URL foto da una riga CSV
                        cerca qualsiasi colonna che contiene "foto"
    sortByOrder(rows) → ordina per colonna "ordine" (numero intero)

── nav.js ────────────────────────────────────────────────────────────────────

  Gestione hamburger menu mobile. Usa opacity/visibility invece di
  display:none/flex per compatibilità con iOS Safari.

  Funzioni esposte (chiamate inline dagli elementi HTML):
    toggleMenu()  → apre/chiude il menu mobile
    closeMenu()   → chiude il menu mobile

  Gestisce anche la chiusura con tasto Escape.

── modal.js ─────────────────────────────────────────────────────────────────

  Apertura e chiusura del modal per la lettura degli articoli.
  Compatibile con entrambe le pagine (index.html e pensieri.html)
  grazie alla ricerca flessibile degli elementi DOM.

  Funzioni esposte:
    openModal(article, fotoUrl)  → apre il modal con i dati dell'articolo
                                   article: oggetto riga dal CSV
                                   fotoUrl: stringa URL (può essere vuota)
    closeModal(event, force)     → chiude il modal
                                   force=true chiude senza controllare il target

  Gestisce anche la chiusura con tasto Escape.

================================================================================
  5. MODULI CSS (cartella css/)
================================================================================

── base.css ─────────────────────────────────────────────────────────────────

  - Variabili CSS (:root) per tutti i colori e font
  - Reset box-sizing e margin/padding
  - Stili globali body, sezioni, section-label, footer
  - Animazione fadeUp
  - Media query base (< 900px)

  Per cambiare i colori del sito: modifica solo le variabili in :root.
  Variabili disponibili:
    --bg         sfondo principale (crema)
    --surface    sfondo bianco per sezioni
    --ink        colore principale testo (nero)
    --ink-muted  testo secondario (grigio)
    --ink-faint  testo terziale (grigio chiaro)
    --border     bordi (nero 10% opacità)
    --serif      font titoli
    --sans       font corpo testo

── nav.css ──────────────────────────────────────────────────────────────────

  - Navbar fissa con backdrop-filter blur
  - Link con hover e classe .active
  - Hamburger button (tre linee → X animata)
  - Overlay mobile (opacity/visibility per iOS)
  - Media query: mostra hamburger sotto 900px

── blog.css ─────────────────────────────────────────────────────────────────

  - Card blog per la home (griglia 2 colonne)
  - Articolo in evidenza per pensieri.html (card nera metà foto / metà testo)
  - Griglia articoli pensieri.html (3 colonne → 2 → 1)
  - Filtro foto grayscale(75%) con transizione a colori su hover
  - Responsive completo

── modal.css ────────────────────────────────────────────────────────────────

  - Overlay scuro fullscreen
  - Box modale centrato (max 720px)
  - Foto hero 16:9
  - Testo giustificato con sillabazione automatica (hyphens: auto)
  - Su mobile: modale sale dal basso a tutta larghezza

================================================================================
  6. PAGINE HTML
================================================================================

── index.html ───────────────────────────────────────────────────────────────

  Sezioni (in ordine):
    1. Nav + menu mobile
    2. Hero — nome, bio, pannello nero con foto e dettagli istituzionali
    3. Chi sono — bio completa + dati statistici
    4. Aree di lavoro — griglia schede da Google Sheets
    5. Pensieri — ultimi 2 articoli + link "Tutti gli articoli →"
    6. Modal articolo
    7. Contatti — lista + pulsanti social
    8. Footer

  Dati dinamici (da Google Sheets):
    - Sezione Hero: ruolo, assessorato, sede, email, telefono
    - Chi sono: bio_breve, bio_completa, bio_headline, citta
    - Aree di lavoro: tutte le schede
    - Pensieri: ultimi 2 articoli pubblicati
    - Contatti: tutti i recapiti e social

── pensieri.html ────────────────────────────────────────────────────────────

  Sezioni (in ordine):
    1. Nav + menu mobile
    2. Header pagina con titolo editoriale e contatori dinamici
    3. Barra filtri per categoria (generata automaticamente)
    4. Articolo in evidenza (il primo / più recente)
    5. Griglia tutti gli altri articoli
    6. Modal articolo
    7. Footer

  Dati dinamici (da Google Sheets):
    - Tutti gli articoli pubblicati (foglio Blog)
    - Categorie per i filtri (generate automaticamente)
    - Contatori (n° articoli, n° categorie)

================================================================================
  7. GOOGLE SHEETS — GUIDA ALLA GESTIONE
================================================================================

Link al Google Spreadsheet:
https://docs.google.com/spreadsheets/d/e/2PACX-1vS9e2zmWZkr0CJ4PZR65tYOUOkJK7uYPpmHtfRl9LW69muNpulG27o0Ui8nS0jdOjorRNVypcGW3Iv5/

Il foglio ha 4 schede. I dati si aggiornano ad ogni caricamento del sito.

── FOGLIO 1: Contatti (riga 2) ──────────────────────────────────────────────

  Colonna              Contenuto
  ─────────────────────────────────────────────────────────────────────
  email_personale      La tua email diretta
  telefono             Il tuo cellulare
  indirizzo            Indirizzo fisico dell'ufficio
  telefono_ufficio     Centralino assessorato
  email_assessorato    Email istituzionale assessorato
  linkedin_url         URL profilo LinkedIn (opzionale)
  facebook_url         URL profilo Facebook (opzionale)
  instagram_url        URL profilo Instagram (opzionale)
  twitter_url          URL profilo Twitter/X (opzionale)

  I pulsanti social appaiono SOLO se la cella contiene un URL.

── FOGLIO 2: Blog ───────────────────────────────────────────────────────────

  Colonna              Contenuto
  ─────────────────────────────────────────────────────────────────────
  titolo               Titolo dell'articolo
  categoria            Categoria (Giovani / Cultura / Istruzione / ...)
  data                 Data in formato libero (es. "Marzo 2026")
  estratto             Anteprima breve (~300 caratteri)
  testo_completo       Testo completo (Alt+Invio per separare paragrafi)
                       Supporta tag HTML: <a href="...">link</a>
  foto                 URL immagine (opzionale, da Ufficio Stampa PAT o GitHub)
  pubblicato (SI/NO)   SI = visibile | NO = bozza nascosta

── FOGLIO 3: Aree di lavoro ─────────────────────────────────────────────────

  Colonna              Contenuto
  ─────────────────────────────────────────────────────────────────────
  titolo               Nome area (parole chiave per icona automatica:
                       Istruzione, Cultura, Giovani, Pari Opportunità,
                       Coordinamento, Gabinetto/Ufficio)
  descrizione          Testo descrittivo (~200 caratteri)
  ordine               Numero intero per sequenza (1, 2, 3...)
  visibile             SI = visibile | NO = nascosta
  link                 URL opzionale per "Approfondisci →"

── FOGLIO 4: Profilo (riga 2) ───────────────────────────────────────────────

  Colonna              Contenuto
  ─────────────────────────────────────────────────────────────────────
  nome_completo        Nome e cognome per esteso
  ruolo                Titolo istituzionale (virgole = a capo nel pannello)
  assessorato          Nome assessorato (virgole = a capo nel pannello)
  bio_breve            Frase breve nell'hero (~200 caratteri)
  bio_completa         Bio sezione "Chi sono" (Alt+Invio tra paragrafi)
  bio_headline         Titolo grande sopra la bio (opzionale)
  citta                Città visualizzata nell'hero
  indirizzo            Indirizzo ufficio per il pannello nero

================================================================================
  8. COME AGGIUNGERE UN ARTICOLO
================================================================================

  1. Apri il Google Sheet → scheda "Blog"
  2. Aggiungi una nuova riga in fondo
  3. Compila: titolo, categoria, data, estratto, testo_completo, foto
  4. Scrivi NO in "pubblicato (SI/NO)" mentre lavori
  5. Quando pronto, cambia in SI
  6. Il sito si aggiorna automaticamente al prossimo caricamento

  Per aggiungere un link nel testo:
    <a href="https://..." target="_blank">testo del link</a>

  Per andare a capo tra paragrafi nel testo_completo:
    Alt+Invio (tieni Alt premuto e premi Invio)
    NON usare Invio da solo (chiude la cella)

================================================================================
  9. COME MODIFICARE IL SITO
================================================================================

  CAMBIARE I COLORI
    Apri css/base.css → modifica le variabili in :root
    I colori principali sono --bg, --surface, --ink, --ink-muted

  CAMBIARE IL FONT
    Apri css/base.css → modifica --serif e --sans in :root
    Aggiorna anche il link Google Fonts in ciascun HTML

  AGGIUNGERE UNA SEZIONE
    1. Aggiungi HTML in index.html
    2. Aggiungi CSS in css/base.css (o crea un nuovo file CSS)
    3. Se serve un nuovo foglio: aggiungilo in js/config.js

  AGGIORNARE IL GOOGLE SHEET
    Modifica SHEET_ID e i GID in js/config.js
    I GID si trovano nell'URL di ogni scheda del foglio:
    docs.google.com/spreadsheets/...#gid=NUMERO_QUI

  CAMBIARE LA FOTO
    Sostituisci foto.jpg nella root del repository.
    Il file deve chiamarsi esattamente "foto.jpg".

================================================================================
  10. TROUBLESHOOTING
================================================================================

  PROBLEMA: Il sito non aggiorna i dati dal foglio
  SOLUZIONE: Verifica che il foglio sia pubblicato sul web:
             File → Condividi → Pubblica sul web → Pubblica
             Attiva "Ripubblica automaticamente in caso di modifiche"

  PROBLEMA: Un articolo non appare
  SOLUZIONE: Verifica che la colonna "pubblicato (SI/NO)" contenga
             esattamente "SI" in maiuscolo, senza spazi

  PROBLEMA: La foto non appare
  SOLUZIONE: L'URL potrebbe non essere accessibile per restrizioni CORS.
             Scarica la foto, caricala su GitHub come foto-articolo.jpg
             e usa "./foto-articolo.jpg" come URL nel foglio

  PROBLEMA: Il menu hamburger non funziona
  SOLUZIONE: Verifica che nav.js sia caricato PRIMA dello script di pagina.
             Controlla l'ordine dei tag <script> in fondo all'HTML.

  PROBLEMA: La pagina mostra "Errore nel caricamento degli articoli"
  SOLUZIONE: Apri la console del browser (F12 → Console) e leggi il messaggio.
             Di solito è un problema di URL nel foglio Google o CORS.

  PROBLEMA: I testi del foglio Profilo non si aggiornano sul sito
  SOLUZIONE: Il browser potrebbe avere la pagina in cache.
             Prova Ctrl+Shift+R (Windows) o Cmd+Shift+R (Mac) per forzare
             il ricaricamento senza cache.

================================================================================
  NOTE TECNICHE
================================================================================

  - Nessun framework (no React, no Vue, no Node.js)
  - Nessun build step — i file sono pronti da caricare
  - Compatibile con GitHub Pages (hosting statico)
  - Compatibile con tutti i browser moderni
  - Ottimizzato per mobile (responsive design)
  - Font: DM Serif Display + DM Sans (Google Fonts, caricati online)
  - Dati: Google Sheets CSV pubblico (aggiornamento automatico)

================================================================================
  FINE DOCUMENTAZIONE
================================================================================
