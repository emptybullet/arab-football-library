/* ═══════════════════════════════════════════════
   ARAB FOOTBALL LIBRARY — app.js
═══════════════════════════════════════════════ */

const D = AFL_DATA;
const flag = t => D.flags[t] || '🏳️';

// ── STATE ──────────────────────────────────────
let state = {
  currentSection: 'competitions',
  currentEdition: null,
  currentRound: 0,
  prevSection: null,
};

// ── INIT ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderEditionsGrid();
  renderTeams();
  renderHistory();
  renderRecords();
  headerScroll();
});

function headerScroll() {
  window.addEventListener('scroll', () => {
    document.getElementById('header').classList.toggle('scrolled', window.scrollY > 60);
  });
}

// ── NAVIGATION ─────────────────────────────────
function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
  document.getElementById(`section-${id}`)?.classList.remove('hidden');
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelector(`.nav-link[onclick*="${id}"]`)?.classList.add('active');
  state.currentSection = id;
  document.getElementById('hero').classList.toggle('hidden', id !== 'home');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showHome() {
  document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
  document.getElementById('hero').classList.remove('hidden');
}

// ── EDITIONS GRID ──────────────────────────────
function renderEditionsGrid() {
  const grid = document.getElementById('editions-grid');
  grid.innerHTML = D.editions.map(e => `
    <div class="edition-card" onclick="openEdition('${e.id}')">
      <div class="ec-year">${e.year}</div>
      <div class="ec-host">${flag(e.host)} ${e.host} · ${e.city}</div>
      <div class="ec-champion">
        <div>
          <div class="ec-champ-label">🏆 البطل</div>
          <div class="ec-champ-name">${flag(e.champion)} ${e.champion}</div>
        </div>
      </div>
      <div class="ec-meta">
        <span class="ec-tag">${e.teams} منتخب</span>
        ${e.matches ? `<span class="ec-tag">${e.matches} مباراة</span>` : ''}
        ${e.goals ? `<span class="ec-tag">${e.goals} هدف</span>` : ''}
        <span class="ec-tag">${e.format}</span>
      </div>
    </div>`).join('');
}

// ── OPEN EDITION ───────────────────────────────
function openEdition(id) {
  const edition = D.editions.find(e => e.id === id);
  if (!edition) return;
  state.currentEdition = edition;
  state.currentRound = 0;

  // Hero block
  document.getElementById('edition-hero-block').innerHTML = `
    <div class="edition-hero">
      <div class="eh-top">
        <div>
          <div class="eh-title">🏆 كأس العرب ${edition.year}</div>
          <div class="eh-sub">${edition.dates} · ${edition.city}، ${edition.host}</div>
          <div class="eh-stats">
            <div class="eh-stat"><span class="ehs-n">${edition.teams}</span><span class="ehs-l">منتخب</span></div>
            ${edition.matches ? `<div class="eh-stat"><span class="ehs-n">${edition.matches}</span><span class="ehs-l">مباراة</span></div>` : ''}
            ${edition.goals ? `<div class="eh-stat"><span class="ehs-n">${edition.goals}</span><span class="ehs-l">هدف</span></div>` : ''}
            <div class="eh-stat"><span class="ehs-n">${edition.format}</span><span class="ehs-l">النظام</span></div>
          </div>
        </div>
        <div class="eh-podium">
          <div class="podium-item">
            <span class="podium-flag">${flag(edition.champion)}</span>
            <div class="podium-place">🥇 البطل</div>
            <div class="podium-name">${edition.champion}</div>
          </div>
          <div class="podium-item">
            <span class="podium-flag">${flag(edition.runner)}</span>
            <div class="podium-place">🥈 الوصيف</div>
            <div class="podium-name">${edition.runner}</div>
          </div>
          ${edition.third ? `<div class="podium-item">
            <span class="podium-flag">${flag(edition.third)}</span>
            <div class="podium-place">🥉 الثالث</div>
            <div class="podium-name">${edition.third}</div>
          </div>` : ''}
        </div>
      </div>
      ${edition.note ? `<div class="eh-note"><strong>ملاحظة:</strong> ${edition.note}</div>` : ''}
    </div>`;

  // Sidebar
  const sidebar = document.getElementById('edition-sidebar');
  sidebar.innerHTML = `
    <div class="es-label">الأدوار</div>
    ${edition.rounds.map((r, i) => `
      <div class="es-item ${i === 0 ? 'active' : ''}" id="es-${i}" onclick="switchRound(${i})">
        <span>${r.label}</span>
        <span class="es-count">${r.matches.length}</span>
      </div>`).join('')}
    ${edition.standings && edition.standings.length ? `
      <div class="es-label" style="margin-top:.75rem">الجداول</div>
      <div class="es-item" id="es-standings" onclick="switchRound('standings')">
        <span>جداول المجموعات</span>
      </div>` : ''}`;

  renderRound(0);
  showSection('edition');
}

function switchRound(i) {
  document.querySelectorAll('.es-item').forEach(el => el.classList.remove('active'));
  document.getElementById(`es-${i}`)?.classList.add('active');
  state.currentRound = i;
  renderRound(i);
}

function renderRound(i) {
  const edition = state.currentEdition;
  if (i === 'standings') {
    renderStandings();
    return;
  }
  const round = edition.rounds[i];
  const main = document.getElementById('edition-main');
  main.innerHTML = `
    <div class="sec-head"><h3>${round.label}</h3><div class="sec-line"></div></div>
    <div class="matches-list">
      ${round.matches.map((m, mi) => `
        <div class="match-card ${m.isFinal ? 'is-final' : ''}" onclick="openMatch(${i}, ${mi})">
          <div class="match-home">
            <div class="match-team">${m.h} ${flag(m.h)}</div>
            <div class="match-date">${m.date || ''}</div>
          </div>
          <div class="match-score-box">
            <span class="match-score">${m.s}</span>
            <span class="match-label">${m.isFinal ? '🏆' : 'نتيجة'}</span>
          </div>
          <div class="match-away">
            <div class="match-team">${flag(m.a)} ${m.a}</div>
            <div class="match-date">${m.venue || ''}</div>
          </div>
        </div>`).join('')}
    </div>`;
}

function renderStandings() {
  const edition = state.currentEdition;
  const main = document.getElementById('edition-main');
  let html = '<div class="standings-wrap">';
  edition.standings.forEach(g => {
    html += `<div class="group-label">${g.label}</div>
      <table class="standings-table">
        <thead><tr>
          <th>المنتخب</th><th>ل</th><th>ف</th><th>ت</th><th>خ</th>
          <th>له</th><th>عليه</th><th>ف.أ</th><th class="pts">ن</th>
        </tr></thead><tbody>`;
    g.rows.forEach((r, i) => {
      const gd = r.gf - r.ga;
      const pts = r.w * 3 + r.d;
      html += `<tr class="${r.q ? 'qualified' : ''}">
        <td>${i + 1}. ${flag(r.t)} ${r.t}</td>
        <td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td>
        <td>${r.gf}</td><td>${r.ga}</td>
        <td>${gd > 0 ? '+' + gd : gd}</td>
        <td class="pts">${pts}</td>
      </tr>`;
    });
    html += '</tbody></table>';
  });
  html += '<p style="font-size:11px;color:var(--text-4);margin-top:.5rem">الحد الأخضر = تأهل لدور الإقصاء</p></div>';
  document.getElementById('edition-main').innerHTML = html;
}

// ── MATCH DETAIL ───────────────────────────────
function openMatch(roundIdx, matchIdx) {
  const edition = state.currentEdition;
  const round = edition.rounds[roundIdx];
  const m = round.matches[matchIdx];

  document.getElementById('match-back-btn').onclick = () => {
    showSection('edition');
  };

  document.getElementById('match-detail-block').innerHTML = `
    <div class="match-hero">
      <div class="mh-grid">
        <div class="mh-team">
          <span class="mh-flag">${flag(m.h)}</span>
          <div class="mh-name">${m.h}</div>
        </div>
        <div class="mh-score-block">
          <span class="mh-score">${m.s}</span>
          <div class="mh-round">${round.label}</div>
        </div>
        <div class="mh-team">
          <span class="mh-flag">${flag(m.a)}</span>
          <div class="mh-name">${m.a}</div>
        </div>
      </div>
      <div class="mh-meta">
        <div class="mhm-item"><div class="mhm-label">التاريخ</div><div class="mhm-value">${m.date || '—'}</div></div>
        <div class="mhm-item"><div class="mhm-label">البطولة</div><div class="mhm-value">كأس العرب ${edition.year}</div></div>
        <div class="mhm-item"><div class="mhm-label">المكان</div><div class="mhm-value">${edition.city}، ${edition.host}</div></div>
        ${m.att ? `<div class="mhm-item"><div class="mhm-label">الحضور</div><div class="mhm-value">${m.att}</div></div>` : ''}
      </div>
    </div>
    <div class="match-detail-grid">
      <div class="detail-card">
        <h3>الأهداف</h3>
        ${m.goals && m.goals.length
          ? m.goals.map(g => `<div class="goal-row"><span class="goal-icon">⚽</span><span>${g}</span></div>`).join('')
          : '<span style="color:var(--text-4);font-size:13px">لا أهداف · مباراة بلا أهداف</span>'}
      </div>
      <div class="detail-card">
        <h3>ملاحظات</h3>
        <p style="font-size:13px;color:var(--text-2);line-height:1.65">${m.note || '—'}</p>
      </div>
    </div>`;

  showSection('match');
}

function backToEditions() {
  showSection('competitions');
}

// ── TEAMS ──────────────────────────────────────
const TEAMS_DATA = [
  {f:'🇩🇿',ar:'الجزائر',en:'Algeria',titles:'🏆 2021',apps:5},
  {f:'🇧🇭',ar:'البحرين',en:'Bahrain',titles:'وصيف 1985، 2002',apps:8},
  {f:'🇪🇬',ar:'مصر',en:'Egypt',titles:'🏆 1992',apps:7},
  {f:'🇮🇶',ar:'العراق',en:'Iraq',titles:'🏆 1964، 1966، 1985، 1988',apps:9},
  {f:'🇯🇴',ar:'الأردن',en:'Jordan',titles:'10 مشاركات',apps:10},
  {f:'🇰🇼',ar:'الكويت',en:'Kuwait',titles:'9 مشاركات',apps:9},
  {f:'🇱🇧',ar:'لبنان',en:'Lebanon',titles:'3rd 1963',apps:8},
  {f:'🇱🇾',ar:'ليبيا',en:'Libya',titles:'وصيف 1964',apps:6},
  {f:'🇲🇦',ar:'المغرب',en:'Morocco',titles:'🏆 2012',apps:5},
  {f:'🇲🇷',ar:'موريتانيا',en:'Mauritania',titles:'',apps:3},
  {f:'🇴🇲',ar:'عُمان',en:'Oman',titles:'',apps:3},
  {f:'🇵🇸',ar:'فلسطين',en:'Palestine',titles:'',apps:6},
  {f:'🇶🇦',ar:'قطر',en:'Qatar',titles:'وصيف 1998، 3rd 2021',apps:5},
  {f:'🇸🇦',ar:'السعودية',en:'Saudi Arabia',titles:'🏆 1998، 2002',apps:9},
  {f:'🇸🇩',ar:'السودان',en:'Sudan',titles:'',apps:4},
  {f:'🇸🇾',ar:'سوريا',en:'Syria',titles:'وصيف 1963، 1966، 1988',apps:9},
  {f:'🇹🇳',ar:'تونس',en:'Tunisia',titles:'🏆 1963، وصيف 2021',apps:7},
  {f:'🇦🇪',ar:'الإمارات',en:'UAE',titles:'',apps:4},
  {f:'🇾🇪',ar:'اليمن',en:'Yemen',titles:'',apps:4},
];

function renderTeams() {
  document.getElementById('teams-grid').innerHTML = TEAMS_DATA.map(t => `
    <div class="team-card">
      <span class="team-flag">${t.f}</span>
      <div class="team-name-ar">${t.ar}</div>
      <div class="team-name-en">${t.en}</div>
      ${t.titles ? `<div class="team-titles">${t.titles}</div>` : ''}
    </div>`).join('');
}

// ── HISTORY ────────────────────────────────────
const HISTORY = [
  {y:1963,host:'🇱🇧 لبنان',champ:'🇹🇳 تونس',runner:'🇸🇾 سوريا',teams:5,matches:10,goals:36},
  {y:1964,host:'🇰🇼 الكويت',champ:'🇮🇶 العراق',runner:'🇱🇾 ليبيا',teams:5,matches:10,goals:28},
  {y:1966,host:'🇮🇶 العراق',champ:'🇮🇶 العراق',runner:'🇸🇾 سوريا',teams:8,matches:15,goals:null},
  {y:1985,host:'🇸🇦 السعودية',champ:'🇮🇶 العراق',runner:'🇧🇭 البحرين',teams:6,matches:9,goals:null},
  {y:1988,host:'🇯🇴 الأردن',champ:'🇮🇶 العراق',runner:'🇸🇾 سوريا',teams:10,matches:21,goals:null},
  {y:1992,host:'🇸🇾 سوريا',champ:'🇪🇬 مصر أولمبي',runner:'🇸🇦 السعودية',teams:6,matches:9,goals:null},
  {y:1998,host:'🇶🇦 قطر',champ:'🇸🇦 السعودية',runner:'🇶🇦 قطر',teams:12,matches:17,goals:null},
  {y:2002,host:'🇰🇼 الكويت',champ:'🇸🇦 السعودية',runner:'🇧🇭 البحرين',teams:10,matches:21,goals:null},
  {y:2009,host:'—',champ:null,runner:null,teams:0,matches:0,goals:0,cancelled:true},
  {y:2012,host:'🇸🇦 السعودية',champ:'🇲🇦 المغرب',runner:'🇱🇾 ليبيا',teams:11,matches:13,goals:null},
  {y:2021,host:'🇶🇦 قطر',champ:'🇩🇿 الجزائر',runner:'🇹🇳 تونس',teams:16,matches:32,goals:83},
];

function renderHistory() {
  const tb = document.getElementById('history-table');
  tb.innerHTML = `
    <thead><tr>
      <th>السنة</th><th>المضيف</th><th>🥇 البطل</th>
      <th>🥈 الوصيف</th><th>الفرق</th><th>المباريات</th><th>الأهداف</th>
    </tr></thead>
    <tbody>${HISTORY.map(h => `
      <tr>
        <td><span class="ht-year" onclick="jumpToYear(${h.y})">${h.y}</span></td>
        <td>${h.host}</td>
        <td class="${h.cancelled ? 'ht-cancelled' : 'ht-champ'}">${h.cancelled ? 'ألغيت' : h.champ}</td>
        <td>${h.runner || '—'}</td>
        <td>${h.teams || '—'}</td>
        <td>${h.matches || '—'}</td>
        <td>${h.goals || '—'}</td>
      </tr>`).join('')}
    </tbody>`;
}

function jumpToYear(y) {
  const edition = D.editions.find(e => e.year === y);
  if (edition) openEdition(edition.id);
}

// ── RECORDS ────────────────────────────────────
function renderRecords() {
  document.getElementById('records-grid').innerHTML = `
    <div class="record-card">
      <h3>الأكثر تتويجاً</h3>
      <div class="record-row"><span class="record-icon">🥇</span><span>العراق — 4 ألقاب (1964، 1966، 1985، 1988)</span></div>
      <div class="record-row"><span class="record-icon">🥈</span><span>المغرب — لقبان (2012)</span></div>
      <div class="record-row"><span class="record-icon">🥈</span><span>السعودية — لقبان (1998، 2002)</span></div>
      <div class="record-row"><span class="record-icon">🏆</span><span>تونس، مصر، الجزائر — لقب واحد لكل</span></div>
    </div>
    <div class="record-card">
      <h3>أرقام قياسية في المباريات</h3>
      <div class="record-row"><span class="record-icon">⚽</span><span>أكبر فوز: ليبيا 21–0 عُمان (1966)</span></div>
      <div class="record-row"><span class="record-icon">👥</span><span>أكبر حضور: 63,439 (قطر–الإمارات، ربع 2021)</span></div>
      <div class="record-row"><span class="record-icon">🎯</span><span>أكثر أهداف في نسخة: 83 هدفاً (2021)</span></div>
      <div class="record-row"><span class="record-icon">🏟️</span><span>أكبر نهائي: 55,000 مشجع (2021)</span></div>
    </div>
    <div class="record-card">
      <h3>أرقام المنتخبات</h3>
      <div class="record-row"><span class="record-icon">🇯🇴</span><span>الأردن — أكثر مشاركة: 10 مرات متتالية (1963–2002)</span></div>
      <div class="record-row"><span class="record-icon">🇸🇾</span><span>سوريا — 3 نهائيات بلا لقب (1963، 1966، 1988)</span></div>
      <div class="record-row"><span class="record-icon">🇮🇶</span><span>العراق — فاز في النسخة التي استضافها (1966)</span></div>
      <div class="record-row"><span class="record-icon">🇮🇶</span><span>العراق — دافع عن لقبه 3 مرات متتالية</span></div>
    </div>
    <div class="record-card">
      <h3>الاستضافة</h3>
      <div class="record-row"><span class="record-icon">🇶🇦</span><span>قطر — 3 استضافات (1998، 2021، 2025)</span></div>
      <div class="record-row"><span class="record-icon">🇸🇦</span><span>السعودية — استضافتان (1985، 2012)</span></div>
      <div class="record-row"><span class="record-icon">🇰🇼</span><span>الكويت — استضافتان (1964، 2002)</span></div>
      <div class="record-row"><span class="record-icon">📅</span><span>أطول توقف: 19 عاماً بين 1966 و1985</span></div>
    </div>
    <div class="record-card">
      <h3>هدافو البطولات</h3>
      <div class="record-row"><span class="record-icon">👟</span><span>الجزيري (تونس) — 4 أهداف في نسخة 2021</span></div>
      <div class="record-row"><span class="record-icon">⚡</span><span>أحمد راضي (العراق) — أبرز لاعب في 1985 و1988</span></div>
      <div class="record-row"><span class="record-icon">🌟</span><span>حسام حسن (مصر) — مشارك في 1988 و1992</span></div>
    </div>
    <div class="record-card">
      <h3>حقائق طريفة</h3>
      <div class="record-row"><span class="record-icon">💡</span><span>نسخة 2009 ألغيت قبل إقامتها</span></div>
      <div class="record-row"><span class="record-icon">🏅</span><span>نسخة 1992 أُقيمت كجزء من الألعاب العربية</span></div>
      <div class="record-row"><span class="record-icon">🌍</span><span>البطولة توقفت 19 عاماً (1966–1985)</span></div>
      <div class="record-row"><span class="record-icon">🇩🇿</span><span>الجزائر انتظر 58 عاماً من 1963 للقب 2021</span></div>
    </div>`;
}
