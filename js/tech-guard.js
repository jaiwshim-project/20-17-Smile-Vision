/* ============================================================
   Tech Page Guard — 비밀번호 보호
   ============================================================ */
(function() {
  const PASS = '9633';
  const KEY = 'sv_tech_auth';
  const EXPIRY = 24 * 60 * 60 * 1000; // 24시간

  // 인증 확인
  const stored = localStorage.getItem(KEY);
  if (stored) {
    const ts = parseInt(stored);
    if (Date.now() - ts < EXPIRY) return; // 인증 유효
  }

  // 페이지 내용 숨기기
  document.documentElement.style.visibility = 'hidden';

  window.addEventListener('DOMContentLoaded', () => {
    document.documentElement.style.visibility = 'visible';
    document.body.innerHTML = `
      <div style="min-height:100vh; display:flex; align-items:center; justify-content:center; background:#0F172A; font-family:system-ui,sans-serif;">
        <div style="text-align:center; color:#FFF; max-width:360px; padding:20px;">
          <div style="font-size:2.5rem; margin-bottom:16px;">&#x1F512;</div>
          <h2 style="margin-bottom:8px;">기술 문서 보호</h2>
          <p style="color:rgba(255,255,255,0.5); font-size:0.875rem; margin-bottom:24px;">이 페이지는 비공개 기술 문서입니다.<br>비밀번호를 입력하세요.</p>
          <input type="password" id="techPass" placeholder="비밀번호" style="width:100%; padding:12px 16px; border:2px solid rgba(255,255,255,0.15); border-radius:8px; background:rgba(255,255,255,0.05); color:#FFF; font-size:1rem; text-align:center; outline:none;" onkeydown="if(event.key==='Enter')checkTechPass()">
          <button onclick="checkTechPass()" style="width:100%; margin-top:12px; padding:12px; background:#0066FF; color:#FFF; border:none; border-radius:8px; font-size:0.9375rem; font-weight:700; cursor:pointer;">확인</button>
          <div id="techPassError" style="color:#EF4444; font-size:0.8125rem; margin-top:12px; display:none;">비밀번호가 틀렸습니다</div>
        </div>
      </div>
    `;
    document.getElementById('techPass').focus();
  });

  window.checkTechPass = function() {
    const input = document.getElementById('techPass').value;
    if (input === PASS) {
      localStorage.setItem(KEY, Date.now().toString());
      location.reload();
    } else {
      document.getElementById('techPassError').style.display = 'block';
      document.getElementById('techPass').value = '';
      document.getElementById('techPass').focus();
    }
  };
})();
