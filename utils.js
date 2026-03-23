/**
 * utils.js
 * Funzioni di utilità condivise tra tutte le pagine.
 */

/**
 * Stima il tempo di lettura di un testo.
 * @param {string} text - Testo (può contenere HTML)
 * @returns {string|null} Es. "3 min" oppure null se testo vuoto
 */
function readTime(text) {
  if (!text || !text.trim()) return null;
  const words = text.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
  const mins  = Math.max(1, Math.round(words / 200));
  return `${mins} min`;
}

/**
 * Formatta una data in italiano in formato compatto elegante.
 * Accetta formati liberi come "Marzo 2026", "15 marzo 2026", "2026".
 * @param {string} raw - Stringa data grezza dal foglio
 * @returns {string} Es. "Mar 2026" oppure stringa originale se non riconosciuta
 */
function formatDate(raw) {
  if (!raw) return '';
  const months = {
    'gennaio': 'Gen', 'febbraio': 'Feb', 'marzo': 'Mar',
    'aprile': 'Apr',  'maggio': 'Mag',   'giugno': 'Giu',
    'luglio': 'Lug',  'agosto': 'Ago',   'settembre': 'Set',
    'ottobre': 'Ott', 'novembre': 'Nov',  'dicembre': 'Dic',
  };
  const d = raw.toLowerCase();
  for (const [it, abbr] of Object.entries(months)) {
    if (d.includes(it)) {
      const numMatch  = d.match(/\b(\d{1,2})\b/);
      const yearMatch = d.match(/\b(\d{4})\b/);
      const year = yearMatch ? yearMatch[1] : '';
      const day  = numMatch && numMatch[1] !== year ? numMatch[1] : '';
      return day ? `${day} ${abbr} ${year}`.trim() : `${abbr} ${year}`.trim();
    }
  }
  return raw;
}

/**
 * Recupera l'URL della foto da un oggetto riga del CSV.
 * Cerca qualsiasi colonna il cui nome contiene "foto".
 * @param {Object} row - Riga del CSV
 * @returns {string} URL oppure stringa vuota
 */
function getFoto(row) {
  const key = Object.keys(row).find(k => k.toLowerCase().includes('foto')) || 'foto';
  return row[key] || '';
}

/**
 * Ordina un array di articoli per data (più recente prima).
 * Usa il campo "ordine" se presente, altrimenti l'ordine del foglio.
 * @param {Array<Object>} rows
 * @returns {Array<Object>}
 */
function sortByOrder(rows) {
  return [...rows].sort((a, b) => {
    const oa = parseInt(a.ordine) || 999;
    const ob = parseInt(b.ordine) || 999;
    return oa - ob;
  });
}
