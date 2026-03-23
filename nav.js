/**
 * nav.js
 * Gestione navbar e hamburger menu mobile.
 * Funziona su tutte le pagine del sito.
 */

function toggleMenu() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('nav-mobile');
  if (!btn || !menu) return;
  btn.classList.toggle('open');
  menu.classList.toggle('open');
  document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
}

function closeMenu() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('nav-mobile');
  if (!btn || !menu) return;
  btn.classList.remove('open');
  menu.classList.remove('open');
  document.body.style.overflow = '';
}

// Chiudi il menu con Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu();
});
