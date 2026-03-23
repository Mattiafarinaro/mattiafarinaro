/**
 * modal.js
 * Apertura e chiusura del modal per la lettura degli articoli.
 * Usato sia in index.html che in pensieri.html.
 */

/**
 * Apre il modal con i dati dell'articolo.
 * @param {Object} article - Oggetto articolo dal CSV
 * @param {string} [fotoUrl] - URL della foto (opzionale)
 */
function openModal(article, fotoUrl) {
  const overlay  = document.getElementById('modal-overlay');
  const imgEl    = document.getElementById('modal-img') || document.getElementById('modal-hero-img');
  const metaEl   = document.getElementById('modal-meta');
  const dateEl   = document.getElementById('modal-date');
  const catEl    = document.getElementById('modal-cat');
  const readEl   = document.getElementById('modal-read');
  const titleEl  = document.getElementById('modal-title');
  const bodyEl   = document.getElementById('modal-body');

  if (!overlay || !titleEl || !bodyEl) return;

  // Foto
  if (imgEl) {
    if (fotoUrl) {
      imgEl.src   = fotoUrl;
      imgEl.alt   = article.titolo || '';
      imgEl.style.display = 'block';
      imgEl.onerror = () => { imgEl.style.display = 'none'; };
    } else {
      imgEl.style.display = 'none';
    }
  }

  // Meta (gestisce sia il layout home che pensieri)
  const data = formatDate(article.data);
  const cat  = article.categoria || '';
  const rt   = readTime(article.testo_completo);

  if (metaEl && !dateEl) {
    // Layout home: un solo elemento modal-meta
    metaEl.textContent = `${data}${cat ? ' · ' + cat : ''}`;
  }
  if (dateEl) dateEl.textContent = data;
  if (catEl)  { catEl.textContent = cat; catEl.style.display = cat ? 'inline' : 'none'; }
  if (readEl) readEl.textContent = rt ? `${rt} di lettura` : '';

  // Titolo
  titleEl.textContent = article.titolo || '';

  // Corpo — rispetta i ritorni a capo e i tag HTML
  const paras = (article.testo_completo || '').split(/\n+/).filter(p => p.trim());
  bodyEl.innerHTML = paras.map(p => `<p>${p}</p>`).join('');

  // Apri
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/**
 * Chiude il modal.
 * @param {Event|null} e - Evento click (null se chiamata diretta)
 * @param {boolean} [force] - Forza chiusura senza controllare il target
 */
function closeModal(e, force) {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;
  if (force || (e && e.target === overlay)) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// Chiudi il modal con Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal(null, true);
});
