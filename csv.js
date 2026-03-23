/**
 * csv.js
 * Parser CSV conforme RFC 4180.
 * Gestisce celle multiriga (Alt+Invio in Google Sheets),
 * virgolette escaped e valori vuoti.
 */

/**
 * Parsifica un testo CSV e ritorna un array di oggetti.
 * La prima riga è trattata come intestazione.
 * @param {string} text - Testo CSV grezzo
 * @returns {Array<Object>}
 */
function parseCSV(text) {
  const raw = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const cells = [];
  let cur = '', inQ = false, i = 0;

  while (i < raw.length) {
    const c = raw[i];
    if (c === '"') {
      if (inQ && raw[i + 1] === '"') { cur += '"'; i += 2; continue; }
      inQ = !inQ; i++; continue;
    }
    if (c === ',' && !inQ) { cells.push(cur); cur = ''; i++; continue; }
    if (c === '\n' && !inQ) { cells.push(cur); cells.push('\n'); cur = ''; i++; continue; }
    cur += c; i++;
  }
  cells.push(cur);

  const allRows = [[]];
  cells.forEach(cell => {
    if (cell === '\n') allRows.push([]);
    else allRows[allRows.length - 1].push(cell);
  });

  const headers = allRows[0].map(h => h.trim());
  const rows = [];
  for (let r = 1; r < allRows.length; r++) {
    const vals = allRows[r];
    if (!vals.length || vals.every(v => !v.trim())) continue;
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = (vals[idx] || '').trim(); });
    rows.push(obj);
  }
  return rows;
}

/**
 * Scarica e parsifica un foglio CSV dal Google Spreadsheet.
 * @param {string} sheet - Chiave del foglio (da config.js)
 * @returns {Promise<Array<Object>>}
 */
async function fetchSheet(sheet) {
  const res = await fetch(csvUrl(sheet));
  if (!res.ok) throw new Error(`Fetch fallito per il foglio: ${sheet}`);
  return parseCSV(await res.text());
}

/**
 * Filtra le righe di un foglio per il valore SI/NO di una colonna.
 * Cerca la colonna per parola chiave parziale (es. "pubblicato" trova "pubblicato (SI/NO)").
 * @param {Array<Object>} rows
 * @param {string} keyword - Parola chiave nel nome colonna
 * @returns {Array<Object>}
 */
function filterVisible(rows, keyword) {
  if (!rows.length) return [];
  const key = Object.keys(rows[0]).find(k => k.toLowerCase().includes(keyword)) || keyword;
  return rows.filter(r => (r[key] || 'SI').trim().toUpperCase() !== 'NO');
}

/**
 * Filtra le righe pubblicate (pubblicato = SI).
 * @param {Array<Object>} rows
 * @returns {Array<Object>}
 */
function filterPublished(rows) {
  if (!rows.length) return [];
  const key = Object.keys(rows[0]).find(k => k.toLowerCase().includes('pubblicato')) || 'pubblicato';
  return rows.filter(r => (r[key] || '').trim().toUpperCase() === 'SI');
}
