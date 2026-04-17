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
      <button class="sidebar-api-btn" onclick="openApiKeyModal()">
        <span class="sidebar-api-icon" id="sidebarApiIcon">&#x1F511;</span>
        <span class="sidebar-api-text">
          <span id="sidebarApiLabel">Gemini API 키 설정</span>
          <span class="sidebar-api-status" id="sidebarApiStatus"></span>
        </span>
      </button>
      <button class="sidebar-api-btn" onclick="openModal('supabaseModal')" style="margin-top:6px;" id="sidebarSupabaseBtn">
        <span class="sidebar-api-icon" id="sidebarDbIcon">&#x1F5C4;</span>
        <span class="sidebar-api-text">
          <span id="sidebarDbLabel">Supabase DB 연결</span>
          <span class="sidebar-api-status" id="sidebarDbStatus"></span>
        </span>
      </button>
      <div style="font-size:0.7rem; color:rgba(255,255,255,0.25); margin-top:10px;">Smile Vision AI v1.0</div>
    </div>
  </aside>
  <!-- Gemini API Key Modal (공통) -->
  <div class="modal-overlay" id="geminiApiModal">
    <div class="modal">
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:1.25rem;">&#x1F511;</span> Gemini API 키 설정
        </h3>
        <button class="btn btn-sm btn-secondary" onclick="closeModal('geminiApiModal')" style="font-size:1rem; padding:4px 10px;">&#x2715;</button>
      </div>
      <div class="modal-body">
        <div style="padding:16px; background:var(--primary-bg); border-radius:var(--radius-md); margin-bottom:20px;">
          <p style="font-size:0.8125rem; color:var(--primary); font-weight:600; margin-bottom:6px;">AI 기능 사용에 필요합니다</p>
          <p style="font-size:0.8125rem; color:var(--text-tertiary);">AI 시뮬레이터, 챗봇 등 Gemini 기반 기능을 사용하려면 API 키가 필요합니다.</p>
        </div>
        <div class="form-group">
          <label class="form-label">API Key</label>
          <div style="position:relative;">
            <input type="password" class="form-input" id="geminiKeyInput" placeholder="AIza..." style="padding-right:44px;">
            <button onclick="toggleKeyVisibility()" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; font-size:1.1rem; color:var(--text-tertiary);" id="toggleKeyBtn" title="보기/숨기기">&#x1F441;</button>
          </div>
        </div>
        <div id="geminiKeyStatus" style="margin-top:8px;"></div>
        <div style="margin-top:16px; padding:12px 16px; background:var(--gray-50); border-radius:var(--radius-sm); border:1px solid var(--gray-200);">
          <p style="font-size:0.75rem; font-weight:600; color:var(--text-secondary); margin-bottom:6px;">API 키 발급 방법</p>
          <ol style="font-size:0.75rem; color:var(--text-tertiary); padding-left:16px; line-height:1.8;">
            <li><a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" style="color:var(--primary); font-weight:600; text-decoration:underline;">Google AI Studio</a> 접속</li>
            <li>"Get API Key" 클릭</li>
            <li>"Create API Key" 버튼으로 키 생성</li>
            <li>생성된 키를 위 입력란에 붙여넣기</li>
          </ol>
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:6px; margin-top:10px; padding:8px 16px; background:var(--primary); color:#FFF; font-size:0.75rem; font-weight:600; border-radius:var(--radius-full); text-decoration:none; transition:all 0.2s ease;">&#x1F517; Google AI Studio에서 API 키 발급받기</a>
        </div>
        <p style="font-size:0.6875rem; color:var(--text-disabled); margin-top:12px;">&#x1F512; API 키는 이 브라우저의 로컬 스토리지에만 저장되며 외부로 전송되지 않습니다.</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="removeApiKey()">키 삭제</button>
        <div style="flex:1;"></div>
        <button class="btn btn-secondary" onclick="closeModal('geminiApiModal')">취소</button>
        <button class="btn btn-primary" onclick="saveGeminiKey()">&#x1F511; 저장</button>
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
          <a href="scoring.html" class="footer-link">Dental Scoring v1.0</a>
          <a href="command-center.html" class="footer-link">지휘센터</a>
          <span class="footer-link" style="cursor:default;">Gemini 2.5 Flash</span>
          <span class="footer-link" style="cursor:default;">MediaPipe Face Mesh</span>
        </div>
        <div class="footer-section">
          <h4>Technology</h4>
          <span class="footer-link" style="cursor:default;">Supabase DB</span>
          <span class="footer-link" style="cursor:default;">Dental Scoring v1.0</span>
          <a href="image-generation.html" class="footer-link">Image Generation AI</a>
          <a href="pipeline.html" class="footer-link">4-Stage Pipeline</a>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="footer-copy">&copy; ${new Date().getFullYear()} Smile Vision AI. Powered by AX Dental Solutions.</div>
        <div class="footer-badges">
          <span class="footer-badge">Gemini AI</span>
          <span class="footer-badge">Supabase</span>
          <span class="footer-badge">MediaPipe</span>
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
const GeminiAPI = {
  apiKey: '',
  setKey(key) {
    this.apiKey = key;
    Store.set('gemini_key', key);
  },

  getKey() {
    if (!this.apiKey) this.apiKey = Store.get('gemini_key', '');
    return this.apiKey;
  },

  async chat(prompt, imageBase64 = null) {
    const key = this.getKey();
    if (!key) throw new Error('Gemini API 키가 설정되지 않았습니다.');

    const parts = [];
    if (imageBase64) {
      const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
      parts.push({
        inline_data: {
          mime_type: 'image/jpeg',
          data: base64Data
        }
      });
    }
    parts.push({ text: prompt });

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts }] })
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Gemini API 오류');
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  },

  // Gemini 이미지 생성 (gemini-2.0-flash 이미지 생성 모드)
  async generateImage(prompt, imageBase64 = null) {
    const key = this.getKey();
    if (!key) throw new Error('Gemini API 키가 설정되지 않았습니다.');

    const parts = [];
    if (imageBase64) {
      const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
      parts.push({
        inline_data: {
          mime_type: 'image/jpeg',
          data: base64Data
        }
      });
    }
    parts.push({ text: prompt });

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE']
          }
        })
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Gemini 이미지 생성 오류');
    }

    const data = await res.json();
    const resParts = data.candidates?.[0]?.content?.parts || [];

    // 이미지 파트 찾기 (camelCase: inlineData / snake_case: inline_data 둘 다 대응)
    for (const part of resParts) {
      const inl = part.inlineData || part.inline_data;
      if (inl && (inl.mimeType || inl.mime_type || '').startsWith('image/')) {
        const mime = inl.mimeType || inl.mime_type;
        return 'data:' + mime + ';base64,' + inl.data;
      }
    }
    throw new Error('이미지가 생성되지 않았습니다');
  }
};

// --- Gemini API Key Modal Functions ---
function openApiKeyModal() {
  const key = GeminiAPI.getKey();
  const input = document.getElementById('geminiKeyInput');
  if (input) {
    input.value = key || '';
    input.type = 'password';
  }
  const toggleBtn = document.getElementById('toggleKeyBtn');
  if (toggleBtn) toggleBtn.innerHTML = '&#x1F441;';
  updateGeminiKeyStatus();
  openModal('geminiApiModal');
}

function saveGeminiKey() {
  const input = document.getElementById('geminiKeyInput');
  const key = input ? input.value.trim() : '';
  if (!key) {
    showToast('API 키를 입력하세요', 'warning');
    return;
  }
  GeminiAPI.setKey(key);
  updateSidebarApiState();
  updateGeminiKeyStatus();
  showToast('Gemini API 키가 저장되었습니다', 'success');
  closeModal('geminiApiModal');
}

function removeApiKey() {
  GeminiAPI.apiKey = '';
  Store.remove('gemini_key');
  const input = document.getElementById('geminiKeyInput');
  if (input) input.value = '';
  updateSidebarApiState();
  updateGeminiKeyStatus();
  showToast('API 키가 삭제되었습니다', 'info');
}

function toggleKeyVisibility() {
  const input = document.getElementById('geminiKeyInput');
  const btn = document.getElementById('toggleKeyBtn');
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = '&#x1F648;';
  } else {
    input.type = 'password';
    btn.innerHTML = '&#x1F441;';
  }
}

function updateGeminiKeyStatus() {
  const el = document.getElementById('geminiKeyStatus');
  if (!el) return;
  const key = GeminiAPI.getKey();
  if (key) {
    const masked = key.substring(0, 6) + '••••••' + key.substring(key.length - 4);
    el.innerHTML = `<div style="display:flex; align-items:center; gap:8px; font-size:0.8125rem;">
      <span style="color:var(--success); font-weight:600;">&#x2713; 연결됨</span>
      <span style="color:var(--text-tertiary); font-family:monospace; font-size:0.75rem;">${masked}</span>
    </div>`;
  } else {
    el.innerHTML = '<span style="font-size:0.8125rem; color:var(--text-tertiary);">API 키가 설정되지 않았습니다</span>';
  }
}

function updateSidebarApiState() {
  const key = GeminiAPI.getKey();
  const btn = document.querySelector('.sidebar-api-btn');
  const icon = document.getElementById('sidebarApiIcon');
  const label = document.getElementById('sidebarApiLabel');
  const status = document.getElementById('sidebarApiStatus');
  if (!btn) return;

  if (key) {
    btn.classList.add('connected');
    icon.innerHTML = '&#x2705;';
    label.textContent = 'Gemini API';
    status.textContent = '연결됨 — ' + key.substring(0, 6) + '••••';
    status.className = 'sidebar-api-status on';
  } else {
    btn.classList.remove('connected');
    icon.innerHTML = '&#x1F511;';
    label.textContent = 'Gemini API 키 설정';
    status.textContent = '키를 설정하세요';
    status.className = 'sidebar-api-status off';
  }
}

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
  updateSidebarApiState();
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
