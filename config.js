/**
 * config.js
 * Configurazione centrale del Google Spreadsheet.
 * Modifica qui per aggiornare le sorgenti dati.
 */

const SHEET_ID = '2PACX-1vS9e2zmWZkr0CJ4PZR65tYOUOkJK7uYPpmHtfRl9LW69muNpulG27o0Ui8nS0jdOjorRNVypcGW3Iv5';

const GID = {
  contatti: '0',
  blog:     '1088622999',
  aree:     '1703680427',
  profilo:  '396150809',
};

const BASE_CSV = `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?single=true&output=csv&gid=`;

/**
 * Ritorna l'URL CSV per un determinato foglio.
 * @param {string} sheet - Chiave del foglio (contatti, blog, aree, profilo)
 */
function csvUrl(sheet) {
  return BASE_CSV + GID[sheet];
}
