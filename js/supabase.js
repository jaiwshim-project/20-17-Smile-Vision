/* ============================================================
   Smile Vision AI — Supabase Client
   ============================================================ */

// Supabase CDN (경량 클라이언트)
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>

const SupabaseDB = {
  client: null,
  bucket: 'smile-vision',

  // --- 초기화 ---
  // 1순위: localStorage 저장값 (사용자가 Supabase 모달에서 직접 설정한 경우)
  // 2순위: /api/config로 서버 환경변수에서 공급 (기본 SaaS 동작)
  // 하드코딩 키 제거됨. 서버 환경변수가 없으면 supabase 모달에서 수동 설정 필요.
  init() {
    const url = Store.get('supabase_url', '');
    const key = Store.get('supabase_key', '');
    if (url && key) {
      this.client = supabase.createClient(url, key);
      return true;
    }
    // 서버 설정 fetch (비동기) — initAsync로 후속 초기화
    this.initAsync();
    return false;
  },

  async initAsync() {
    try {
      const r = await fetch('/api/config');
      if (!r.ok) return false;
      const c = await r.json();
      if (c.supabase_url && c.supabase_anon_key) {
        Store.set('supabase_url', c.supabase_url);
        Store.set('supabase_key', c.supabase_anon_key);
        this.client = supabase.createClient(c.supabase_url, c.supabase_anon_key);
        // 이후 updateSidebarDbState 등 UI 갱신
        if (typeof updateSidebarDbState === 'function') updateSidebarDbState();
        return true;
      }
    } catch (e) { console.warn('/api/config 로드 실패', e); }
    return false;
  },

  isReady() {
    return !!this.client;
  },

  setConfig(url, key) {
    Store.set('supabase_url', url);
    Store.set('supabase_key', key);
    this.client = supabase.createClient(url, key);
  },

  getConfig() {
    return {
      url: Store.get('supabase_url', ''),
      key: Store.get('supabase_key', ''),
    };
  },

  // ============================================================
  // 이미지 업로드 (Storage)
  // ============================================================
  async uploadImage(base64DataUrl, folder, filename) {
    if (!this.client) throw new Error('Supabase 미연결');

    // base64 → Blob
    const res = await fetch(base64DataUrl);
    const blob = await res.blob();
    const path = `${folder}/${filename}`;

    const { data, error } = await this.client.storage
      .from(this.bucket)
      .upload(path, blob, { upsert: true, contentType: blob.type });

    if (error) throw error;

    // Public URL 반환
    const { data: urlData } = this.client.storage
      .from(this.bucket)
      .getPublicUrl(path);

    return urlData.publicUrl;
  },

  // ============================================================
  // 고객 (Patients)
  // ============================================================
  // ============================================================
  // 회원 (Users) — SaaS 기능
  // ============================================================
  async upsertUser({ email, name, clinic, role }) {
    if (!this.client) throw new Error('Supabase 미연결');
    const payload = { email, name, clinic, role: role || '상담실장', last_login_at: new Date().toISOString() };
    const { data, error } = await this.client.from('users')
      .upsert(payload, { onConflict: 'email' }).select().single();
    if (error) throw error;
    return data;
  },

  async getUserByEmail(email) {
    if (!this.client) throw new Error('Supabase 미연결');
    const { data, error } = await this.client.from('users')
      .select('*').eq('email', email).maybeSingle();
    if (error) throw error;
    return data;
  },

  async listUsers() {
    if (!this.client) throw new Error('Supabase 미연결');
    const { data, error } = await this.client.from('users')
      .select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async updateUserTier(userId, tier) {
    if (!this.client) throw new Error('Supabase 미연결');
    const { data, error } = await this.client.from('users')
      .update({ tier }).eq('id', userId).select().single();
    if (error) throw error;
    return data;
  },

  async getAllMonthlyUsage() {
    if (!this.client) throw new Error('Supabase 미연결');
    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);
    const { data, error } = await this.client.from('api_call_logs')
      .select('user_id').gte('created_at', monthStart.toISOString());
    if (error) throw error;
    const counts = {};
    (data || []).forEach(row => {
      if (row.user_id) counts[row.user_id] = (counts[row.user_id] || 0) + 1;
    });
    return counts;
  },

  // ============================================================
  // 환자 (Patients)
  // ============================================================
  async createPatient({ name, phone, age, gender, memo }) {
    if (!this.client) throw new Error('Supabase 미연결');
    const { data, error } = await this.client
      .from('patients')
      .insert([{ name, phone, age: age || null, gender: gender || null, memo: memo || null }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getPatients({ search, limit = 50, offset = 0 } = {}) {
    if (!this.client) throw new Error('Supabase 미연결');
    let query = this.client
      .from('patients')
      .select('*, simulations(count)')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getPatient(id) {
    if (!this.client) throw new Error('Supabase 미연결');
    const { data, error } = await this.client
      .from('patients')
      .select('*, simulations(*), consultations(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async updatePatient(id, updates) {
    if (!this.client) throw new Error('Supabase 미연결');
    const { data, error } = await this.client
      .from('patients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deletePatient(id) {
    if (!this.client) throw new Error('Supabase 미연결');
    const { error } = await this.client
      .from('patients')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async getPatientCount() {
    if (!this.client) throw new Error('Supabase 미연결');
    const { count, error } = await this.client
      .from('patients')
      .select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count;
  },

  // ============================================================
  // 시뮬레이션 (Simulations)
  // ============================================================
  async saveSimulation({ patientId, beforeImage, afterImages, scores, findings, recommendation, selectedStyle, orthoData }) {
    if (!this.client) throw new Error('Supabase 미연결');

    const ts = Date.now();
    const folder = `simulations/${patientId || 'anonymous'}`;

    // 이미지를 DB에 직접 저장 (base64)
    // 크기 제한: 원본이 너무 크면 리사이즈
    function compressImage(dataUrl, maxWidth = 800) {
      return new Promise((resolve) => {
        if (!dataUrl) { resolve(null); return; }
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, maxWidth / img.width);
          const canvas = document.createElement('canvas');
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = () => resolve(null);
        img.src = dataUrl;
      });
    }

    const [beforeData, naturalData, whiteData, premiumData] = await Promise.all([
      compressImage(beforeImage),
      compressImage(afterImages?.natural),
      compressImage(afterImages?.white),
      compressImage(afterImages?.premium),
    ]);

    const row = {
      patient_id: patientId || null,
      before_image_url: null,
      after_natural_url: null,
      after_white_url: null,
      after_premium_url: null,
      before_image_data: beforeData,
      after_natural_data: naturalData,
      after_white_data: whiteData,
      after_premium_data: premiumData,
      score_whiteness: scores?.whiteness || 0,
      score_alignment: scores?.alignment || 0,
      score_symmetry: scores?.symmetry || 0,
      score_spacing: scores?.spacing || 0,
      score_shape: scores?.shape || 0,
      score_gumline: scores?.gumline || 0,
      total_score: scores?.total || 0,
      predicted_score: scores?.predicted || 0,
      findings: findings || [],
      recommendation: recommendation || '',
      selected_style: selectedStyle || 'natural',
    };

    // 교정 전용 데이터 추가 (컬럼이 있을 때만)
    if (orthoData) {
      row.ortho_angles = orthoData.angles || null;
      row.ortho_ratios = orthoData.ratios || null;
      row.ortho_problems = orthoData.problems || null;
      row.ortho_recommendation = orthoData.recommendation || null;
      row.ortho_duration_months = orthoData.duration_months || null;
      row.ortho_malocclusion = orthoData.malocclusion_class || null;
      row.ortho_persuasion = orthoData.persuasion || null;
      row.analysis_type = 'orthodontics';
    }

    // 첫 시도: 6항목 전체 저장
    let { data, error } = await this.client
      .from('simulations')
      .insert([row])
      .select()
      .single();

    // score_shape/score_gumline 컬럼이 없으면 제외하고 재시도
    if (error && error.message?.includes('score_shape') || error?.message?.includes('score_gumline')) {
      delete row.score_shape;
      delete row.score_gumline;
      const retry = await this.client
        .from('simulations')
        .insert([row])
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) throw error;
    return data;
  },

  async getSimulations({ patientId, limit = 20 } = {}) {
    if (!this.client) throw new Error('Supabase 미연결');
    let query = this.client
      .from('simulations')
      .select('*, patients(name, phone)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (patientId) query = query.eq('patient_id', patientId);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async updateSimulationStatus(id, status) {
    if (!this.client) throw new Error('Supabase 미연결');
    const { data, error } = await this.client
      .from('simulations')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // ============================================================
  // 상담 (Consultations)
  // ============================================================
  async createConsultation({ patientId, simulationId, treatmentType, price, notes }) {
    if (!this.client) throw new Error('Supabase 미연결');
    const { data, error } = await this.client
      .from('consultations')
      .insert([{
        patient_id: patientId,
        simulation_id: simulationId || null,
        treatment_type: treatmentType || '',
        price: price || 0,
        notes: notes || '',
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // ============================================================
  // 대시보드 통계
  // ============================================================
  async getDashboardStats() {
    if (!this.client) throw new Error('Supabase 미연결');

    const today = new Date().toISOString().split('T')[0];

    const [patientsRes, todaySimsRes, consultRes] = await Promise.all([
      this.client.from('patients').select('*', { count: 'exact', head: true }),
      this.client.from('simulations').select('*', { count: 'exact', head: true }).gte('created_at', today),
      this.client.from('consultations').select('status, price'),
    ]);

    const consults = consultRes.data || [];
    const totalRevenue = consults.filter(c => c.status === '계약완료' || c.status === '시술완료').reduce((s, c) => s + (c.price || 0), 0);
    const contractCount = consults.filter(c => c.status === '계약완료').length;

    return {
      totalPatients: patientsRes.count || 0,
      todaySimulations: todaySimsRes.count || 0,
      totalRevenue,
      contractCount,
      conversionRate: consults.length > 0 ? Math.round(contractCount / consults.length * 100) : 0,
    };
  },
};

// 페이지 로드 시 자동 초기화
document.addEventListener('DOMContentLoaded', () => {
  SupabaseDB.init();
});
