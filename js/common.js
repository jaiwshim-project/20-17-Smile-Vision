/* ============================================================
   Smile Vision AI — Common JavaScript
   ============================================================ */

// --- Sidebar Toggle (Mobile) ---
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) sidebar.classList.toggle('open');
}

// Close sidebar on overlay click (mobile)
document.addEventListener('click', (e) => {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;
  if (sidebar.classList.contains('open') &&
      !sidebar.contains(e.target) &&
      !e.target.closest('.hamburger')) {
    sidebar.classList.remove('open');
  }
});

// --- Active Nav Highlight ---
function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item').forEach(item => {
    const href = item.getAttribute('href');
    if (href === path) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}
document.addEventListener('DOMContentLoaded', setActiveNav);

// --- Toast Notifications ---
function showToast(message, type = 'info', duration = 3000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  if (type === 'success') toast.style.background = 'var(--success)';
  else if (type === 'error') toast.style.background = 'var(--danger)';
  else if (type === 'warning') toast.style.background = 'var(--warning)';
  toast.textContent = message;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// --- Modal Helpers ---
function openModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) overlay.classList.add('active');
}

function closeModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) overlay.classList.remove('active');
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
  }
});

// --- Number Formatting ---
function formatNumber(n) {
  if (n >= 100000000) return (n / 100000000).toFixed(1) + '억';
  if (n >= 10000) return (n / 10000).toFixed(1) + '만';
  return n.toLocaleString('ko-KR');
}

function formatCurrency(n) {
  return n.toLocaleString('ko-KR') + '원';
}

// --- Date Formatting ---
function formatDate(d) {
  const date = new Date(d);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

function formatTime(d) {
  const date = new Date(d);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

// --- Local Storage Helpers ---
const Store = {
  get(key, fallback = null) {
    try {
      const val = localStorage.getItem('sv_' + key);
      return val ? JSON.parse(val) : fallback;
    } catch { return fallback; }
  },
  set(key, val) {
    localStorage.setItem('sv_' + key, JSON.stringify(val));
  },
  remove(key) {
    localStorage.removeItem('sv_' + key);
  }
};

// ============================================================
// 세션 (SaaS 간편 로그인)
// ============================================================
const Session = {
  KEY: 'session',
  TTL_MS: 1000 * 60 * 60 * 24 * 7, // 7일
  login({ userId, name, role = '상담실장', clinic = '', email = '', tier = 'free', is_admin = false }) {
    Store.set(this.KEY, { userId, name, role, clinic, email, tier, is_admin, loggedAt: Date.now() });
  },
  logout() { Store.remove(this.KEY); },
  get() {
    const s = Store.get(this.KEY, null);
    if (!s) return null;
    if (Date.now() - s.loggedAt > this.TTL_MS) { this.logout(); return null; }
    return s;
  },
  isLoggedIn() { return !!this.get(); }
};

async function logoutAndRefresh() {
  Session.logout();
  showToast('로그아웃되었습니다', 'info');
  setTimeout(() => window.location.href = 'index.html', 500);
}

function ensureSessionBadge() {
  let el = document.getElementById('sessionBadge');
  if (!el) {
    el = document.createElement('div');
    el.id = 'sessionBadge';
    el.style.cssText = 'position:fixed; top:14px; right:14px; z-index:120;';
    document.body.appendChild(el);
  }
  return el;
}

function updateSessionUI() {
  const s = Session.get();
  const el = ensureSessionBadge();
  if (!el) return;
  if (s) {
    el.textContent = '';
    const badge = document.createElement('span');
    badge.style.cssText = 'padding:6px 12px; background:var(--primary-bg,#EBF3FF); color:var(--primary,#0066FF); border-radius:var(--radius-full,999px); font-size:0.8125rem; font-weight:600; display:inline-flex; align-items:center; gap:8px;';
    const nameEl = document.createElement('strong');
    nameEl.textContent = s.name;
    badge.appendChild(nameEl);
    const metaEl = document.createElement('span');
    metaEl.style.cssText = 'font-weight:500; color:var(--text-tertiary,#666);';
    metaEl.textContent = `· ${s.clinic || ''} · ${s.role}`;
    badge.appendChild(metaEl);
    const tier = (s.tier || 'free').toLowerCase();
    const tierMap = {
      free: { label: 'Free', bg: '#F1F5F9', fg: '#475569' },
      pro:  { label: 'Pro',  bg: '#FEF3C7', fg: '#92400E' },
      max:  { label: 'Max',  bg: '#DBEAFE', fg: '#1D4ED8' }
    };
    const tm = tierMap[tier] || tierMap.free;
    const tierEl = document.createElement('span');
    tierEl.style.cssText = `padding:2px 8px; background:${tm.bg}; color:${tm.fg}; border-radius:999px; font-size:0.6875rem; font-weight:700;`;
    tierEl.textContent = s.is_admin ? `${tm.label} · ADMIN` : tm.label;
    badge.appendChild(tierEl);
    const out = document.createElement('a');
    out.href = '#';
    out.style.cssText = 'color:#EF4444; text-decoration:none;';
    out.textContent = '로그아웃';
    out.onclick = (e) => { e.preventDefault(); logoutAndRefresh(); };
    badge.appendChild(out);
    el.appendChild(badge);
  } else {
    el.innerHTML = `<button class="btn btn-sm btn-primary" onclick="openModal('loginModal')">로그인</button>`;
  }
}
document.addEventListener('DOMContentLoaded', updateSessionUI);

// 스마트 로그인 — 등록된 이메일이면 즉시, 신규면 가입 폼 펼치기
async function smartLogin() {
  const email = (document.getElementById('loginEmail')?.value || '').trim();
  if (!email) { showToast('이메일을 입력하세요', 'warning'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('이메일 형식이 올바르지 않습니다', 'warning'); return; }
  if (typeof SupabaseDB === 'undefined' || !SupabaseDB.client) {
    showToast('Supabase 미연결', 'error');
    return;
  }
  const signupVisible = document.getElementById('signupFields')?.style.display !== 'none';
  const btn = document.getElementById('loginBtn');
  if (btn) { btn.disabled = true; btn.textContent = '확인 중...'; }
  try {
    const existing = await SupabaseDB.getUserByEmail(email);
    if (existing && !signupVisible) {
      Session.login({
        userId: existing.id, name: existing.name || email.split('@')[0],
        role: existing.role || '상담실장', clinic: existing.clinic || '',
        email: existing.email, tier: existing.tier || 'free',
        is_admin: existing.is_admin === true
      });
      closeModal('loginModal');
      showToast(`${existing.name}님 환영합니다`, 'success');
      updateSessionUI();
      return;
    }
    if (existing && signupVisible) {
      showToast('이미 가입된 이메일입니다. 폼을 닫고 다시 시도하세요.', 'info');
      toggleSignupFields();
      return;
    }
    if (!existing && !signupVisible) {
      showToast('처음 사용하시는 이메일입니다. 가입 정보를 입력하세요.', 'info');
      toggleSignupFields();
      return;
    }
    // 신규 가입 — 즉시 upsertUser (매직링크 없는 간단 가입)
    const name = (document.getElementById('loginName')?.value || '').trim();
    const clinic = (document.getElementById('loginClinic')?.value || '').trim();
    const role = document.getElementById('loginRole')?.value || '상담실장';
    if (!name || !clinic) { showToast('이름과 병원명을 입력하세요', 'warning'); return; }
    const created = await SupabaseDB.upsertUser({ email, name, clinic, role });
    Session.login({
      userId: created.id, name: created.name, role: created.role,
      clinic: created.clinic, email: created.email,
      tier: 'free', is_admin: false
    });
    closeModal('loginModal');
    showToast(`${name}님 가입 완료 — Free 등급으로 시작합니다`, 'success');
    updateSessionUI();
  } catch (e) {
    console.error('로그인 실패', e);
    showToast('로그인 실패: ' + e.message, 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '🚀 로그인'; }
  }
}

function toggleSignupFields(e) {
  if (e) e.preventDefault();
  const fields = document.getElementById('signupFields');
  const link = document.getElementById('toggleSignupLink');
  if (!fields) return;
  const hidden = fields.style.display === 'none';
  fields.style.display = hidden ? 'block' : 'none';
  if (link) link.textContent = hidden ? '가입 정보 숨기기 ▴' : '처음이신가요? 가입 정보 입력 ▾';
}

// 페이지 로드 시 DB에서 tier/is_admin 동기화
async function refreshSessionFromDb() {
  const s = Session.get();
  if (!s?.email) return;
  if (typeof SupabaseDB === 'undefined' || !SupabaseDB.client) return;
  try {
    const u = await SupabaseDB.getUserByEmail(s.email);
    if (!u) return;
    Session.login({
      userId: u.id, name: u.name || s.name, role: u.role || s.role,
      clinic: u.clinic || s.clinic, email: u.email,
      tier: u.tier || 'free', is_admin: u.is_admin === true
    });
    updateSessionUI();
  } catch (e) { console.warn('session refresh 실패', e); }
}
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(refreshSessionFromDb, 400);
});

// Enter 키로 로그인 제출
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const loginModal = document.getElementById('loginModal');
    if (loginModal && loginModal.classList.contains('active')) {
      e.preventDefault();
      smartLogin();
    }
  }
});

// --- Generate Sidebar HTML ---
function renderSidebar(activePage) {
  return `
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <img src="img/logo.png" alt="Smile Vision AI" class="sidebar-logo-img">
      </div>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-section-label">Main</div>
      <a href="index.html" class="nav-item ${activePage === 'index' ? 'active' : ''}">
        <span class="nav-item-icon">&#x1F3E0;</span> 홈
      </a>
      <a href="simulator.html" class="nav-item ${activePage === 'simulator' ? 'active' : ''}">
        <span class="nav-item-icon">&#x1F4F7;</span> AI 시뮬레이터
      </a>
      <a href="compare.html" class="nav-item ${activePage === 'compare' ? 'active' : ''}">
        <span class="nav-item-icon">&#x1F504;</span> Before/After
      </a>

      <a href="orthodontics.html" class="nav-item ${activePage === 'ortho' ? 'active' : ''}">
        <span class="nav-item-icon">&#x1FA7B;</span> 교정·교열·교합 분석
      </a>
      <a href="ortho-report.html" class="nav-item ${activePage === 'ortho-report' ? 'active' : ''}">
        <span class="nav-item-icon">&#x1F4CB;</span> 교정·교열·교합 리포트
      </a>

      <div class="nav-section-label">Management</div>
      <a href="patients.html" class="nav-item ${activePage === 'patients' ? 'active' : ''}">
        <span class="nav-item-icon">&#x1F465;</span> 환자 관리
      </a>
      <a href="dashboard.html" class="nav-item ${activePage === 'dashboard' ? 'active' : ''}">
        <span class="nav-item-icon">&#x1F4CA;</span> 대시보드
      </a>

      <div class="nav-section-label">AI</div>
      <a href="chatbot.html" class="nav-item ${activePage === 'chatbot' ? 'active' : ''}">
        <span class="nav-item-icon">&#x1F4AC;</span> AI 상담 챗봇
      </a>
      <a href="command-center.html" class="nav-item ${activePage === 'command' ? 'active' : ''}">
        <span class="nav-item-icon">&#x1F3AF;</span> 지휘센터
      </a>

    </nav>
    <div class="sidebar-footer">
      <button class="sidebar-api-btn" onclick="openModal('supabaseModal')" id="sidebarSupabaseBtn">
        <span class="sidebar-api-icon" id="sidebarDbIcon">&#x1F5C4;</span>
        <span class="sidebar-api-text">
          <span id="sidebarDbLabel">Supabase DB 연결</span>
          <span class="sidebar-api-status" id="sidebarDbStatus"></span>
        </span>
      </button>
      <div style="font-size:0.7rem; color:rgba(255,255,255,0.25); margin-top:10px;">Smile Vision AI v1.0</div>
    </div>
  </aside>
  <!-- 🚀 로그인 모달 (SaaS 간편 로그인) -->
  <div class="modal-overlay" id="loginModal">
    <div class="modal" style="max-width:420px;">
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:1.25rem;">&#x1F680;</span> 로그인
        </h3>
        <button class="btn btn-sm btn-secondary" onclick="closeModal('loginModal')" style="font-size:1rem; padding:4px 10px;">&#x2715;</button>
      </div>
      <div class="modal-body">
        <div style="padding:14px; background:var(--primary-bg); border-radius:var(--radius-md); margin-bottom:20px;">
          <p style="font-size:0.8125rem; color:var(--primary); font-weight:600; line-height:1.55;">&#x2728; <strong>이전에 가입한 이메일이면 즉시 로그인</strong>됩니다.<br>처음이시면 하단 '가입 정보 입력'을 펼쳐 가입하세요.</p>
        </div>
        <div class="form-group">
          <label class="form-label">이메일 <span style="color:var(--danger,#EF4444);">*</span></label>
          <input type="email" class="form-input" id="loginEmail" placeholder="you@clinic.co.kr" autocomplete="email">
        </div>
        <div id="signupFields" style="display:none; border-top:1px solid var(--gray-200,#E2E8F0); margin-top:16px; padding-top:16px;">
          <div style="font-size:0.8125rem; color:var(--text-secondary); font-weight:600; margin-bottom:10px;">신규 가입 정보</div>
          <div class="form-group">
            <label class="form-label">이름 <span style="color:#EF4444;">*</span></label>
            <input type="text" class="form-input" id="loginName" placeholder="홍길동">
          </div>
          <div class="form-group">
            <label class="form-label">병원명 <span style="color:#EF4444;">*</span></label>
            <input type="text" class="form-input" id="loginClinic" placeholder="예: 스마일치과">
          </div>
          <div class="form-group">
            <label class="form-label">역할</label>
            <select class="form-input" id="loginRole">
              <option value="상담실장">상담실장</option>
              <option value="원장">원장</option>
              <option value="코디네이터">코디네이터</option>
              <option value="치위생사">치위생사</option>
              <option value="관리자">관리자 (CEO)</option>
            </select>
          </div>
        </div>
        <div style="margin-top:14px;">
          <a href="#" id="toggleSignupLink" onclick="toggleSignupFields(event)" style="font-size:0.8125rem; color:var(--primary); font-weight:600; text-decoration:none;">처음이신가요? 가입 정보 입력 &#x25BE;</a>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('loginModal')">취소</button>
        <button class="btn btn-primary" id="loginBtn" onclick="smartLogin()">&#x1F680; 로그인</button>
      </div>
    </div>
  </div>
  <!-- Supabase 설정 모달 (공통) -->
  <div class="modal-overlay" id="supabaseModal">
    <div class="modal" style="max-width:520px;">
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:1.25rem;">&#x1F5C4;</span> Supabase DB 연결
        </h3>
        <button class="btn btn-sm btn-secondary" onclick="closeModal('supabaseModal')" style="font-size:1rem; padding:4px 10px;">&#x2715;</button>
      </div>
      <div class="modal-body">
        <div style="padding:16px; background:var(--primary-bg); border-radius:var(--radius-md); margin-bottom:20px;">
          <p style="font-size:0.8125rem; color:var(--primary); font-weight:600; margin-bottom:6px;">고객 데이터 영구 저장에 필요합니다</p>
          <p style="font-size:0.8125rem; color:var(--text-tertiary);">고객 정보, 시뮬레이션 결과, Before/After 이미지가 Supabase DB에 저장됩니다.</p>
        </div>
        <div class="form-group">
          <label class="form-label">Project URL</label>
          <input type="text" class="form-input" id="supabaseUrlInput" placeholder="https://xxxx.supabase.co">
        </div>
        <div class="form-group">
          <label class="form-label">Anon Key</label>
          <input type="password" class="form-input" id="supabaseKeyInput" placeholder="eyJhbGciOi...">
        </div>
        <div id="supabaseStatus" style="margin-top:8px;"></div>
        <div style="margin-top:16px; padding:12px 16px; background:var(--gray-50); border-radius:var(--radius-sm); border:1px solid var(--gray-200);">
          <p style="font-size:0.75rem; font-weight:600; color:var(--text-secondary); margin-bottom:6px;">설정 방법</p>
          <ol style="font-size:0.75rem; color:var(--text-tertiary); padding-left:16px; line-height:1.8;">
            <li><a href="https://supabase.com/dashboard" target="_blank" rel="noopener" style="color:var(--primary); font-weight:600;">Supabase Dashboard</a> 접속 → 프로젝트 생성</li>
            <li>Settings > API에서 URL과 anon key 복사</li>
            <li>SQL Editor에서 <code>sql/schema.sql</code> 내용 실행</li>
            <li>Storage에서 <code>smile-vision</code> 버킷 생성 (Public)</li>
          </ol>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="removeSupabaseConfig()">연결 해제</button>
        <div style="flex:1;"></div>
        <button class="btn btn-secondary" onclick="closeModal('supabaseModal')">취소</button>
        <button class="btn btn-primary" onclick="saveSupabaseConfig()">&#x1F5C4; 연결 테스트 + 저장</button>
      </div>
    </div>
  </div>`;
}

// --- Premium Footer (공통) ---
function renderFooter() {
  return `
  <footer class="premium-footer">
    <div class="footer-inner">
      <div class="footer-top">
        <div class="footer-brand">
          <img src="img/logo.png" alt="Smile Vision AI" class="footer-brand-logo">
          <p>AI 기반 치과 시뮬레이션 플랫폼. 환자의 현재 치아를 촬영하면 라미네이트 시술 후 모습을 실시간으로 보여줍니다.</p>
        </div>
        <div class="footer-section">
          <h4>Platform</h4>
          <a href="simulator.html" class="footer-link">AI 시뮬레이터</a>
          <a href="patients.html" class="footer-link">환자 관리</a>
          <a href="dashboard.html" class="footer-link">대시보드</a>
          <a href="chatbot.html" class="footer-link">AI 상담 챗봇</a>
        </div>
        <div class="footer-section">
          <h4>AI Engine</h4>
          <a href="orthovision.html" class="footer-link">OrthoVision AI Engine</a>
          <a href="scoring.html" class="footer-link">Dental Scoring v1.0</a>
          <a href="command-center.html" class="footer-link">지휘센터</a>
          <span class="footer-link" style="cursor:default;">Gemini 2.5 Flash</span>
          <a href="mediapipe.html" class="footer-link">MediaPipe Face Mesh</a>
        </div>
        <div class="footer-section">
          <h4>Technology</h4>
          <span class="footer-link" style="cursor:default;">Supabase DB</span>
          <a href="scoring.html" class="footer-link">Dental Scoring v1.0</a>
          <a href="image-generation.html" class="footer-link">Image Generation AI</a>
          <a href="pipeline.html" class="footer-link">4-Stage Pipeline</a>
          <a href="mediapipe.html" class="footer-link">MediaPipe Face Mesh</a>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="footer-left">
          <div class="footer-copy">&copy; ${new Date().getFullYear()} Smile Vision AI. Powered by AX Dental Solutions.</div>
          <div class="footer-badges">
            <span class="footer-badge">Gemini AI</span>
            <span class="footer-badge">Supabase</span>
            <span class="footer-badge">MediaPipe</span>
            <a href="admin-dashboard.html" class="footer-badge" style="background:rgba(0,102,255,0.15); border-color:rgba(0,102,255,0.4); color:#60A5FA; text-decoration:none; cursor:pointer;">🛠 관리자 대시보드</a>
          </div>
        </div>
        <div class="footer-cta">
          <a href="brochure.html" class="brochure-btn" title="원장 및 상담실장 대상 소개자료">
            <span class="brochure-icon">📄</span>
            <span class="brochure-text">소개자료</span>
          </a>
        </div>
      </div>
    </div>
  </footer>`;
}

// 모든 페이지에 자동 삽입
document.addEventListener('DOMContentLoaded', () => {
  const content = document.querySelector('.content');
  if (content) content.insertAdjacentHTML('afterend', renderFooter());
});

// --- Supabase Config (공통) ---
function saveSupabaseConfig() {
  const url = (document.getElementById('supabaseUrlInput')?.value || '').trim();
  const key = (document.getElementById('supabaseKeyInput')?.value || '').trim();
  if (!url || !key) { showToast('URL과 Key를 모두 입력하세요', 'warning'); return; }

  if (typeof SupabaseDB !== 'undefined') {
    SupabaseDB.setConfig(url, key);
    SupabaseDB.getPatientCount()
      .then(count => {
        document.getElementById('supabaseStatus').innerHTML =
          '<span style="color:var(--success); font-weight:600;">&#x2713; 연결 성공! (환자 ' + count + '명)</span>';
        showToast('Supabase 연결 성공!', 'success');
        updateSidebarDbState();
        setTimeout(() => closeModal('supabaseModal'), 1000);
      })
      .catch(err => {
        document.getElementById('supabaseStatus').innerHTML =
          '<span style="color:var(--danger); font-weight:600;">&#x274C; 연결 실패: ' + err.message + '</span>';
      });
  } else {
    Store.set('supabase_url', url);
    Store.set('supabase_key', key);
    showToast('설정 저장됨 (supabase.js 미로드)', 'warning');
  }
}

function removeSupabaseConfig() {
  Store.remove('supabase_url');
  Store.remove('supabase_key');
  if (typeof SupabaseDB !== 'undefined') SupabaseDB.client = null;
  updateSidebarDbState();
  showToast('Supabase 연결이 해제되었습니다', 'info');
}

// --- Gemini API Helper ---
// SaaS 방식: 본사 서버(/api/gemini)가 GEMINI_API_KEY를 보관하고 공동 사용
// 브라우저는 키를 알 필요 없음. 프록시에만 prompt 전송.
const GeminiAPI = {
  // 호환성용 (기존 코드에서 getKey() 체크 → 항상 true)
  getKey() { return 'server-managed'; },

  _buildBody(body) {
    try {
      const s = typeof Session !== 'undefined' ? Session.get() : null;
      if (s?.email) body.user_email = s.email;
    } catch {}
    return body;
  },

  async chat(prompt, imageBase64 = null) {
    const body = this._buildBody({ prompt, imageBase64, model: 'gemini-2.5-flash' });
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      let msg = 'Gemini API 오류';
      try { const err = await res.json(); msg = err.error || msg; } catch {}
      throw new Error(msg);
    }
    const data = await res.json();
    return data.text || '';
  },

  // Gemini 이미지 생성 (gemini-2.5-flash-image)
  async generateImage(prompt, imageBase64 = null) {
    const body = this._buildBody({
      prompt, imageBase64,
      model: 'gemini-2.5-flash-image',
      mode: 'image'
    });
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      let msg = 'Gemini 이미지 생성 오류';
      try { const err = await res.json(); msg = err.error || msg; } catch {}
      throw new Error(msg);
    }
    const data = await res.json();
    if (!data.imageDataUrl) throw new Error('이미지가 생성되지 않았습니다');
    return data.imageDataUrl;
  },

  // 서버 키 등록 여부 진단용 (선택)
  async checkServerStatus() {
    try {
      const res = await fetch('/api/gemini', { method: 'GET' });
      if (!res.ok) return { ok: false };
      return await res.json();
    } catch { return { ok: false }; }
  }
};

// --- Gemini 키는 서버(/api/gemini)에서 관리 — 브라우저 UI 제거됨 ---

function updateSidebarDbState() {
  const btn = document.getElementById('sidebarSupabaseBtn');
  const icon = document.getElementById('sidebarDbIcon');
  const label = document.getElementById('sidebarDbLabel');
  const status = document.getElementById('sidebarDbStatus');
  if (!btn) return;

  const cfg = Store.get('supabase_url', '');
  if (cfg) {
    btn.classList.add('connected');
    icon.innerHTML = '&#x2705;';
    label.textContent = 'Supabase DB';
    status.textContent = '연결됨';
    status.className = 'sidebar-api-status on';
  } else {
    btn.classList.remove('connected');
    icon.innerHTML = '&#x1F5C4;';
    label.textContent = 'Supabase DB 연결';
    status.textContent = 'DB를 연결하세요';
    status.className = 'sidebar-api-status off';
  }
}

// Init sidebar state on load
document.addEventListener('DOMContentLoaded', () => {
  updateSidebarDbState();
});

// --- Sample Data Generator ---
const SampleData = {
  patients: [
    { id: 'P001', name: '김민수', age: 34, phone: '010-1234-5678', gender: '남', status: '상담중', lastVisit: '2026-04-15', score: 58, treatment: '라미네이트' },
    { id: 'P002', name: '이지은', age: 28, phone: '010-2345-6789', gender: '여', status: '계약완료', lastVisit: '2026-04-14', score: 72, treatment: '치아미백' },
    { id: 'P003', name: '박서준', age: 41, phone: '010-3456-7890', gender: '남', status: '치료중', lastVisit: '2026-04-13', score: 45, treatment: '임플란트' },
    { id: 'P004', name: '최유나', age: 25, phone: '010-4567-8901', gender: '여', status: '상담대기', lastVisit: '2026-04-16', score: 63, treatment: '교정' },
    { id: 'P005', name: '정현우', age: 37, phone: '010-5678-9012', gender: '남', status: '계약완료', lastVisit: '2026-04-12', score: 51, treatment: '라미네이트' },
    { id: 'P006', name: '한소희', age: 30, phone: '010-6789-0123', gender: '여', status: '치료완료', lastVisit: '2026-04-10', score: 92, treatment: '라미네이트' },
    { id: 'P007', name: '오민혁', age: 45, phone: '010-7890-1234', gender: '남', status: '상담중', lastVisit: '2026-04-16', score: 38, treatment: '임플란트' },
    { id: 'P008', name: '윤서아', age: 33, phone: '010-8901-2345', gender: '여', status: '상담대기', lastVisit: '2026-04-16', score: 67, treatment: '치아미백' },
  ],

  dailyRevenue: [
    { date: '04/10', revenue: 1520, patients: 8 },
    { date: '04/11', revenue: 2340, patients: 12 },
    { date: '04/12', revenue: 1890, patients: 10 },
    { date: '04/13', revenue: 3100, patients: 15 },
    { date: '04/14', revenue: 2760, patients: 14 },
    { date: '04/15', revenue: 2950, patients: 13 },
    { date: '04/16', revenue: 3420, patients: 16 },
  ],

  treatmentMix: [
    { name: '라미네이트', value: 42, color: '#0066FF' },
    { name: '치아미백', value: 25, color: '#00D4AA' },
    { name: '임플란트', value: 18, color: '#F59E0B' },
    { name: '교정', value: 15, color: '#8B5CF6' },
  ],
};
