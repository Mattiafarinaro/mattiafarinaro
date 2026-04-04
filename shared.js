/* shared.js — logica condivisa tra index.html e pensieri.html */

const SHEET_ID = '2PACX-1vS9e2zmWZkr0CJ4PZR65tYOUOkJK7uYPpmHtfRl9LW69muNpulG27o0Ui8nS0jdOjorRNVypcGW3Iv5';
const GID = { contatti:'0', blog:'1088622999', aree:'1703680427', profilo:'396150809' };
const BASE_CSV = `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?single=true&output=csv&gid=`;
const FORMSPREE_ID = 'YOUR_FORM_ID';

/* CSV PARSER */
function parseCSV(text) {
  const raw = text.replace(/\r\n/g,'\n').replace(/\r/g,'\n');
  const cells=[]; let cur='',inQ=false,i=0;
  while(i<raw.length){const c=raw[i];if(c==='"'){if(inQ&&raw[i+1]==='"'){cur+='"';i+=2;continue;}inQ=!inQ;i++;continue;}if(c===','&&!inQ){cells.push(cur);cur='';i++;continue;}if(c==='\n'&&!inQ){cells.push(cur);cells.push('\n');cur='';i++;continue;}cur+=c;i++;}
  cells.push(cur);
  const allRows=[[]];cells.forEach(c=>{if(c==='\n')allRows.push([]);else allRows[allRows.length-1].push(c);});
  const headers=allRows[0].map(h=>h.trim()),rows=[];
  for(let r=1;r<allRows.length;r++){const v=allRows[r];if(!v.length||v.every(x=>!x.trim()))continue;const o={};headers.forEach((h,i)=>{o[h]=(v[i]||'').trim();});rows.push(o);}
  return rows;
}

async function fetchSheet(gid) {
  const res = await fetch(BASE_CSV + gid);
  if (!res.ok) throw new Error('CSV fetch failed gid=' + gid);
  return parseCSV(await res.text());
}

/* UTILS */
function getFoto(r) {
  const k = Object.keys(r).find(k => k.toLowerCase().includes('foto')) || 'foto';
  return r[k] || '';
}

function readTime(text) {
  if (!text || !text.trim()) return null;
  const w = text.replace(/<[^>]+>/g,'').split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(w/200))} min`;
}

function formatDate(raw) {
  if (!raw) return '';
  const m = {gennaio:'Gen',febbraio:'Feb',marzo:'Mar',aprile:'Apr',maggio:'Mag',giugno:'Giu',luglio:'Lug',agosto:'Ago',settembre:'Set',ottobre:'Ott',novembre:'Nov',dicembre:'Dic'};
  const d = raw.toLowerCase();
  for (const [it,abbr] of Object.entries(m)) {
    if (!d.includes(it)) continue;
    const nm=d.match(/\b(\d{1,2})\b/),ym=d.match(/\b(\d{4})\b/);
    const yr=ym?ym[1]:'',dy=nm&&nm[1]!==yr?nm[1]:'';
    return (dy?dy+' ':'')+abbr+(yr?' '+yr:'');
  }
  return raw;
}

function slugify(str) {
  return (str||'').toLowerCase()
    .replace(/[àáâ]/g,'a').replace(/[èéê]/g,'e').replace(/[ìíî]/g,'i')
    .replace(/[òóô]/g,'o').replace(/[ùúû]/g,'u').replace(/ä/g,'a')
    .replace(/ö/g,'o').replace(/ü/g,'u').replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'').slice(0,60);
}

/* MARKDOWN */
function renderMarkdown(text) {
  if (!text) return '';
  const lines=text.split('\n'); let html='',inList=false;
  for (let i=0;i<lines.length;i++) {
    let line=lines[i]; const tr=line.trimStart();
    line=line.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    line=line.replace(/\*\*\*(.*?)\*\*\*/g,'<strong><em>$1</em></strong>');
    line=line.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>');
    line=line.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g,'<em>$1</em>');
    line=line.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
    line=line.replace(/`([^`]+)`/g,'<code>$1</code>');
    if(/^---+$/.test(tr)){if(inList){html+='</ul>';inList=false;}html+='<hr>';continue;}
    if(/^### /.test(tr)){if(inList){html+='</ul>';inList=false;}html+=`<h4>${line.replace(/^###+ /,'')}</h4>`;continue;}
    if(/^## /.test(tr)){if(inList){html+='</ul>';inList=false;}html+=`<h3>${line.replace(/^##+ /,'')}</h3>`;continue;}
    if(/^# /.test(tr)){if(inList){html+='</ul>';inList=false;}html+=`<h2>${line.replace(/^#+ /,'')}</h2>`;continue;}
    if(/^[*-] /.test(tr)){if(!inList){html+='<ul>';inList=true;}html+=`<li>${line.replace(/^[*-] /,'')}</li>`;continue;}
    if(/^> /.test(tr)){if(inList){html+='</ul>';inList=false;}html+=`<blockquote>${line.replace(/^> /,'')}</blockquote>`;continue;}
    if(tr===''){if(inList){html+='</ul>';inList=false;}continue;}
    if(inList){html+='</ul>';inList=false;}
    html+=`<p>${line}</p>`;
  }
  if(inList)html+='</ul>';
  return html;
}

function stripMarkdown(text) {
  if (!text) return '';
  return text.replace(/#{1,6} /g,'').replace(/\*\*\*(.*?)\*\*\*/g,'$1')
    .replace(/\*\*(.*?)\*\*/g,'$1').replace(/\*(.*?)\*/g,'$1')
    .replace(/`([^`]+)`/g,'$1').replace(/\[([^\]]+)\]\([^)]+\)/g,'$1')
    .replace(/^[*>-] /gm,'').replace(/^---+$/gm,'').replace(/\n+/g,' ').trim();
}

/* NAV MOBILE */
function toggleMenu() {
  const btn=document.getElementById('hamburger'),menu=document.getElementById('nav-mobile');
  if(!btn||!menu)return;
  const open=menu.classList.toggle('open');
  btn.setAttribute('aria-expanded',open);
  document.body.style.overflow=open?'hidden':'';
}
function closeMenu() {
  const btn=document.getElementById('hamburger'),menu=document.getElementById('nav-mobile');
  if(!btn||!menu)return;
  menu.classList.remove('open');btn.setAttribute('aria-expanded','false');document.body.style.overflow='';
}

/* MODAL + URL ROUTING + SHARE */
let _articles=[];
let _lastFocus=null;

function setModalData(arr){ _articles=arr; }

function openArticleBySlug(slug) {
  const idx=_articles.findIndex(r=>slugify(r.titolo)===slug);
  if(idx!==-1) openModal(idx,true);
}

function openModal(i, fromURL) {
  const r=_articles[i]; if(!r)return;
  const foto=getFoto(r), rt=readTime(r.testo_completo), slug=slugify(r.titolo);
  if(!fromURL){ const u=new URL(window.location.href);u.searchParams.set('a',slug);history.pushState({slug},'',u); }
  const img=document.getElementById('modal-img')||document.getElementById('modal-hero-img');
  if(img){if(foto){img.src=foto;img.alt=r.titolo||'';img.style.display='block';img.onerror=()=>img.style.display='none';}else img.style.display='none';}
  const metaEl=document.getElementById('modal-meta');
  const dateEl=document.getElementById('modal-date');
  const catEl=document.getElementById('modal-cat');
  const readEl=document.getElementById('modal-read');
  if(metaEl&&!dateEl) metaEl.textContent=`${formatDate(r.data)}${r.categoria?' · '+r.categoria:''}`;
  if(dateEl) dateEl.textContent=formatDate(r.data);
  if(catEl){catEl.textContent=r.categoria||'';catEl.style.display=r.categoria?'inline':'none';}
  if(readEl) readEl.textContent=rt?rt+' di lettura':'';
  const titleEl=document.getElementById('modal-title');
  const bodyEl=document.getElementById('modal-body');
  if(titleEl) titleEl.textContent=r.titolo||'';
  if(bodyEl) bodyEl.innerHTML=renderMarkdown(r.testo_completo||'');
  _renderShareBar(r,slug);
  _lastFocus=document.activeElement;
  const ov=document.getElementById('modal-overlay');
  ov.classList.add('open');
  document.body.style.overflow='hidden';
  setTimeout(()=>ov.querySelector('.modal-close')?.focus(),50);
}

function closeModal(e,force){
  const ov=document.getElementById('modal-overlay'); if(!ov)return;
  if(force||(e&&e.target===ov)){
    ov.classList.remove('open');document.body.style.overflow='';_lastFocus?.focus();
    const u=new URL(window.location.href);u.searchParams.delete('a');history.pushState({},'',u);
  }
}

window.addEventListener('popstate',()=>{
  const slug=new URLSearchParams(window.location.search).get('a');
  if(slug){openArticleBySlug(slug);}else{closeModal(null,true);}
});

function _renderShareBar(article,slug){
  const bar=document.getElementById('modal-share'); if(!bar)return;
  const u=new URL(window.location.href);u.searchParams.set('a',slug);
  const shareUrl=u.toString(), title=article.titolo||'Articolo di Mattia Farinaro';
  const liEl=`data-url="${shareUrl.replace(/"/g,'&quot;')}" data-title="${title.replace(/"/g,'&quot;')}"`;
  bar.innerHTML=`<div class="share-bar">
    <span class="share-label">Condividi</span>
    ${navigator.share?`<button class="share-btn" onclick="nativeShare(this)" ${liEl}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>Condividi</button>`:''}
    <button class="share-btn" id="copy-btn" onclick="copyLink(this)" ${liEl}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>Copia link</button>
    <a class="share-btn" href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}" target="_blank" rel="noopener"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>LinkedIn</a>
  </div>`;
}

function nativeShare(btn){navigator.share({title:btn.dataset.title,url:btn.dataset.url}).catch(()=>{});}

async function copyLink(btn){
  try{await navigator.clipboard.writeText(btn.dataset.url);const orig=btn.innerHTML;btn.textContent='✓ Copiato!';setTimeout(()=>btn.innerHTML=orig,2000);}
  catch{prompt('Copia questo link:',btn.dataset.url);}
}

/* FORM */
function initContactForm(){
  const form=document.getElementById('contact-form'); if(!form)return;
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const btn=document.getElementById('form-submit'),status=document.getElementById('form-status');
    btn.disabled=true;btn.textContent='Invio…';status.className='form-status';
    try{
      const res=await fetch(`https://formspree.io/f/${FORMSPREE_ID}`,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}});
      if(res.ok){status.className='form-status success';status.textContent='Messaggio inviato! Ti rispondo presto.';form.reset();}
      else throw new Error();
    }catch{status.className='form-status error';status.textContent="Errore nell'invio. Scrivimi via email.";}
    btn.disabled=false;btn.innerHTML='Invia messaggio <span aria-hidden="true">→</span>';
  });
}

/* GLOBAL KEYS */
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();closeModal(null,true);}});

/* FOOTER YEAR */
const _fy=document.getElementById('footer-year');
if(_fy)_fy.textContent=new Date().getFullYear();
