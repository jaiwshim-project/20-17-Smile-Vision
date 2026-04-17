/* ============================================================
   Smile Vision AI — Dental Scoring Engine v1.0
   치아 상태 점수화 엔진 & 알고리즘
   ============================================================

   [총점 구조]
   Total Score = W1×색상 + W2×정렬 + W3×대칭 + W4×간격 + W5×형태 + W6×잇몸라인

   [가중치]
   색상(Whiteness)   : 25%  — 환자 체감 변화 최대
   정렬(Alignment)   : 20%  — 스마일 인상 결정
   대칭(Symmetry)    : 18%  — 얼굴 조화
   간격(Spacing)     : 15%  — 심미 완성도
   형태(Shape)       : 12%  — 치아 개별 완성도
   잇몸라인(Gumline) : 10%  — 전체 조화

   ============================================================ */

const ScoringEngine = {

  // ---- 가중치 ----
  weights: {
    whiteness: 0.25,
    alignment: 0.20,
    symmetry:  0.18,
    spacing:   0.15,
    shape:     0.12,
    gumline:   0.10,
  },

  // ---- 평가 기준 상세 ----
  criteria: {
    whiteness: {
      label: '색상 (Whiteness)',
      weight: 25,
      icon: '🎨',
      description: '치아 표면 색상의 밝기, 균일도, 착색 정도',
      levels: [
        { range: [90, 100], grade: 'S', label: '최우수', desc: 'VITA shade A1 이상. 착색 없음. 전체 치아 색상 완벽 균일' },
        { range: [75, 89],  grade: 'A', label: '우수',   desc: 'A2~A1 범위. 미세 착색 1~2개소. 균일도 높음' },
        { range: [60, 74],  grade: 'B', label: '보통',   desc: 'A3~A2 범위. 부분 착색 존재. 치아간 색차 눈에 띔' },
        { range: [40, 59],  grade: 'C', label: '주의',   desc: 'A3.5~A3 범위. 전반적 황변. 치아간 색차 뚜렷' },
        { range: [0, 39],   grade: 'D', label: '심각',   desc: 'A4 이하. 심한 착색/변색. 즉시 시술 권장' },
      ],
      subFactors: [
        { name: '밝기 (Brightness)', weight: 40, desc: 'VITA shade 기준 색상 단계' },
        { name: '균일도 (Uniformity)', weight: 30, desc: '치아 간 색상 편차' },
        { name: '착색도 (Staining)', weight: 20, desc: '커피/담배 등 외인성 착색' },
        { name: '투명도 (Translucency)', weight: 10, desc: '절단연 자연 투명감' },
      ],
    },

    alignment: {
      label: '정렬 (Alignment)',
      weight: 20,
      icon: '📐',
      description: '치아 배열의 직선성, 회전, 경사 정도',
      levels: [
        { range: [90, 100], grade: 'S', label: '최우수', desc: '전치부 완벽 직선 배열. 회전/경사 없음' },
        { range: [75, 89],  grade: 'A', label: '우수',   desc: '미세 회전 1~2개. 전체적 정렬 양호' },
        { range: [60, 74],  grade: 'B', label: '보통',   desc: '경도 총생 또는 회전 2~3개. 시각적 인지 가능' },
        { range: [40, 59],  grade: 'C', label: '주의',   desc: '중등도 총생/전위. 뚜렷한 배열 불량' },
        { range: [0, 39],   grade: 'D', label: '심각',   desc: '심한 총생/전위. 교정 또는 라미네이트 필수' },
      ],
      subFactors: [
        { name: '직선성 (Linearity)', weight: 35, desc: '상악 전치부 정렬 직선도' },
        { name: '회전 (Rotation)', weight: 25, desc: '개별 치아 축 회전 정도' },
        { name: '경사 (Tipping)', weight: 20, desc: '순설/근원심 경사 각도' },
        { name: '총생도 (Crowding)', weight: 20, desc: '공간 부족으로 인한 겹침' },
      ],
    },

    symmetry: {
      label: '대칭 (Symmetry)',
      weight: 18,
      icon: '⚖️',
      description: '좌우 치아의 크기, 위치, 형태 대칭성',
      levels: [
        { range: [90, 100], grade: 'S', label: '최우수', desc: '좌우 완벽 대칭. 중심선 정확' },
        { range: [75, 89],  grade: 'A', label: '우수',   desc: '미세 비대칭 1개소. 전체적 대칭 양호' },
        { range: [60, 74],  grade: 'B', label: '보통',   desc: '크기/위치 비대칭 2~3개소. 시각적 인지 가능' },
        { range: [40, 59],  grade: 'C', label: '주의',   desc: '뚜렷한 좌우 비대칭. 중심선 편위' },
        { range: [0, 39],   grade: 'D', label: '심각',   desc: '심한 비대칭. 얼굴 부조화 초래' },
      ],
      subFactors: [
        { name: '크기 대칭 (Size)', weight: 30, desc: '좌우 대응 치아 크기 일치도' },
        { name: '위치 대칭 (Position)', weight: 30, desc: '좌우 대응 치아 수직/수평 위치' },
        { name: '중심선 (Midline)', weight: 25, desc: '치아 중심선과 얼굴 중심선 일치' },
        { name: '형태 대칭 (Shape)', weight: 15, desc: '좌우 대응 치아 형태 유사도' },
      ],
    },

    spacing: {
      label: '간격 (Spacing)',
      weight: 15,
      icon: '↔️',
      description: '치아 사이 간격의 균일성과 적정성',
      levels: [
        { range: [90, 100], grade: 'S', label: '최우수', desc: '치간 접촉점 완벽. 간격 균일' },
        { range: [75, 89],  grade: 'A', label: '우수',   desc: '미세 간격 1개소. 전체적 균일' },
        { range: [60, 74],  grade: 'B', label: '보통',   desc: '간격 불균일 2~3개소. 부분 이개(diastema)' },
        { range: [40, 59],  grade: 'C', label: '주의',   desc: '뚜렷한 이개 또는 겹침. 음식물 끼임 우려' },
        { range: [0, 39],   grade: 'D', label: '심각',   desc: '전반적 간격 불량. 기능적 문제 동반' },
      ],
      subFactors: [
        { name: '접촉점 (Contact)', weight: 35, desc: '인접 치아 간 적절한 접촉' },
        { name: '균일도 (Evenness)', weight: 30, desc: '치간 간격의 균일성' },
        { name: '이개 (Diastema)', weight: 20, desc: '비정상적 틈새 유무' },
        { name: '블랙 트라이앵글 (Black Triangle)', weight: 15, desc: '치간 유두 소실로 인한 어두운 삼각' },
      ],
    },

    shape: {
      label: '형태 (Shape)',
      weight: 12,
      icon: '🦷',
      description: '개별 치아의 형태 완성도와 비율',
      levels: [
        { range: [90, 100], grade: 'S', label: '최우수', desc: '황금비율(1:0.7:0.6) 충족. 자연스러운 형태' },
        { range: [75, 89],  grade: 'A', label: '우수',   desc: '비율 근접. 미세 형태 이상 1~2개' },
        { range: [60, 74],  grade: 'B', label: '보통',   desc: '비율 편차 존재. 마모 또는 파절 흔적' },
        { range: [40, 59],  grade: 'C', label: '주의',   desc: '뚜렷한 형태 이상. 마모/파절 다수' },
        { range: [0, 39],   grade: 'D', label: '심각',   desc: '심한 마모/파절. 보철 필요' },
      ],
      subFactors: [
        { name: '폭/길이 비율 (W:L Ratio)', weight: 30, desc: '이상적 비율 75~80%' },
        { name: '치아간 비율 (Golden Ratio)', weight: 25, desc: '중절치:측절치:견치 = 1:0.7:0.6' },
        { name: '절단연 (Incisal Edge)', weight: 25, desc: '절단연 형태, 마모, 파절 상태' },
        { name: '표면 질감 (Texture)', weight: 20, desc: '에나멜 표면 매끄러움/균열' },
      ],
    },

    gumline: {
      label: '잇몸라인 (Gumline)',
      weight: 10,
      icon: '🏔️',
      description: '잇몸 라인의 연속성, 대칭성, 건강도',
      levels: [
        { range: [90, 100], grade: 'S', label: '최우수', desc: '좌우 대칭 잇몸라인. 건강한 분홍색' },
        { range: [75, 89],  grade: 'A', label: '우수',   desc: '미세 비대칭 1개소. 전체적 양호' },
        { range: [60, 74],  grade: 'B', label: '보통',   desc: '잇몸라인 불규칙 2~3개소. 경도 퇴축' },
        { range: [40, 59],  grade: 'C', label: '주의',   desc: '뚜렷한 잇몸라인 불균형. 거미 스마일 또는 퇴축' },
        { range: [0, 39],   grade: 'D', label: '심각',   desc: '심한 잇몸 퇴축/증식. 치주 치료 선행 필요' },
      ],
      subFactors: [
        { name: '연속성 (Continuity)', weight: 30, desc: '잇몸 마진 라인의 매끄러운 연속성' },
        { name: '대칭성 (Symmetry)', weight: 30, desc: '좌우 잇몸 높이 대칭' },
        { name: '건강도 (Health)', weight: 25, desc: '잇몸 색상, 부종, 출혈 유무' },
        { name: '노출도 (Display)', weight: 15, desc: '미소 시 잇몸 노출량 적정성' },
      ],
    },
  },

  // ---- 종합 점수 계산 ----
  calculateTotal(scores) {
    const w = this.weights;
    return Math.round(
      (scores.whiteness || 0) * w.whiteness +
      (scores.alignment || 0) * w.alignment +
      (scores.symmetry  || 0) * w.symmetry  +
      (scores.spacing   || 0) * w.spacing   +
      (scores.shape     || 0) * w.shape     +
      (scores.gumline   || 0) * w.gumline
    );
  },

  // ---- 등급 판정 ----
  getGrade(score) {
    if (score >= 90) return { grade: 'S', label: '최우수', color: '#0066FF', bg: '#EBF3FF' };
    if (score >= 75) return { grade: 'A', label: '우수',   color: '#10B981', bg: '#D1FAE5' };
    if (score >= 60) return { grade: 'B', label: '보통',   color: '#F59E0B', bg: '#FEF3C7' };
    if (score >= 40) return { grade: 'C', label: '주의',   color: '#EF4444', bg: '#FEE2E2' };
    return              { grade: 'D', label: '심각',   color: '#991B1B', bg: '#FEE2E2' };
  },

  // 개별 항목 등급
  getItemGrade(key, score) {
    const levels = this.criteria[key]?.levels || [];
    for (const lv of levels) {
      if (score >= lv.range[0] && score <= lv.range[1]) return lv;
    }
    return levels[levels.length - 1];
  },

  // ---- 시술 후 예상 점수 계산 ----
  // 각 항목별 라미네이트 개선 가능 범위 (평균 기준)
  improvementFactors: {
    whiteness: { min: 25, max: 45 },  // 색상 개선 폭 가장 큼
    alignment: { min: 20, max: 35 },  // 정렬 개선
    symmetry:  { min: 15, max: 30 },  // 대칭 개선
    spacing:   { min: 20, max: 40 },  // 간격 개선 폭 큼
    shape:     { min: 15, max: 30 },  // 형태 개선
    gumline:   { min: 5,  max: 15 },  // 잇몸은 라미네이트로 제한적
  },

  predictAfterScores(scores) {
    const predicted = {};
    for (const [key, val] of Object.entries(scores)) {
      const factor = this.improvementFactors[key];
      if (!factor) { predicted[key] = val; continue; }
      // 현재 점수가 낮을수록 개선 폭이 큼
      const deficit = 100 - val;
      const improvement = factor.min + (deficit / 100) * (factor.max - factor.min);
      predicted[key] = Math.min(98, Math.round(val + improvement));
    }
    predicted.total = this.calculateTotal(predicted);
    return predicted;
  },

  // ---- 치료 추천 로직 ----
  getRecommendation(scores) {
    const total = this.calculateTotal(scores);
    const weakest = Object.entries(scores)
      .filter(([k]) => this.weights[k])
      .sort((a, b) => a[1] - b[1]);

    const recommendations = [];

    // 최약 항목 기반 추천 (기준: 65점 미만이면 시술 추천)
    if (scores.whiteness < 65) {
      recommendations.push({
        priority: 1,
        treatment: '라미네이트 (색상 개선)',
        reason: `색상 점수 ${scores.whiteness}점으로 황변/착색이 관찰됩니다`,
        impact: '색상 +' + (this.improvementFactors.whiteness.max) + '점 개선 가능',
      });
    }
    if (scores.alignment < 65) {
      recommendations.push({
        priority: scores.alignment < 40 ? 1 : 2,
        treatment: scores.alignment < 40 ? '교정 + 라미네이트' : '라미네이트 (정렬 개선)',
        reason: `정렬 점수 ${scores.alignment}점으로 배열 개선이 필요합니다`,
        impact: '정렬 +' + (this.improvementFactors.alignment.max) + '점 개선 가능',
      });
    }
    if (scores.spacing < 65) {
      recommendations.push({
        priority: 2,
        treatment: '라미네이트 (간격 교정)',
        reason: `간격 점수 ${scores.spacing}점으로 치간 간격이 불균일합니다`,
        impact: '간격 +' + (this.improvementFactors.spacing.max) + '점 개선 가능',
      });
    }
    if (scores.symmetry < 60) {
      recommendations.push({
        priority: 2,
        treatment: '라미네이트 (대칭 개선)',
        reason: `대칭 점수 ${scores.symmetry}점으로 좌우 비대칭이 관찰됩니다`,
        impact: '대칭 +' + (this.improvementFactors.symmetry.max) + '점 개선 가능',
      });
    }
    if (scores.gumline < 50) {
      recommendations.push({
        priority: 3,
        treatment: '잇몸 성형술 (선행)',
        reason: `잇몸라인 ${scores.gumline}점으로 잇몸 치료가 선행되어야 합니다`,
        impact: '잇몸 +' + (this.improvementFactors.gumline.max) + '점 개선 가능',
      });
    }

    if (recommendations.length === 0) {
      if (total >= 80) {
        recommendations.push({
          priority: 3,
          treatment: '치아 미백',
          reason: '전체적으로 양호하며 미백만으로 충분합니다',
          impact: '색상 밝기 1~2단계 개선',
        });
      } else {
        recommendations.push({
          priority: 2,
          treatment: '라미네이트 종합 시술',
          reason: '전반적 개선이 필요합니다',
          impact: `종합 점수 ${total}→${this.predictAfterScores(scores).total} 개선 가능`,
        });
      }
    }

    return recommendations.sort((a, b) => a.priority - b.priority);
  },

  // ---- Gemini AI 분석 프롬프트 생성 ----
  generateAnalysisPrompt() {
    return `당신은 치과 심미 전문 AI 분석가입니다. 이 치아 사진을 아래 6가지 기준으로 엄격하게 분석해주세요.

중요: 라미네이트 시술을 받지 않은 일반 자연치아는 대부분 35~55점 범위입니다.
70점 이상은 이미 미백이나 시술을 받은 상태에서만 가능합니다.
엄격한 기준으로 평가하세요. 관대하게 점수를 주지 마세요.

## 평가 기준 (각 항목 0~100점, 엄격 기준)

### 1. 색상 (whiteness) — 가중치 25%
- 밝기: VITA shade 기준 (A1=85, A2=65, A3=45, A3.5=35, A4=20, B계열=-5 추가감점)
- 균일도: 치아 간 색상 편차 (완벽 균일=100, 편차 있음=50, 심한 편차=20)
- 착색도: 커피/담배/음식 착색 (없음=100, 미세=60, 뚜렷=30, 심함=10)
- 투명도: 절단연 자연 투명감 (이상적=100, 불투명=40)
- 참고: 한국인 평균 자연치 색상은 A3~A3.5 (35~45점)

### 2. 정렬 (alignment) — 가중치 20%
- 직선성: 상악 전치부 정렬 (완벽=100, 미세 불규칙=60, 뚜렷=35, 심한 부정교합=15)
- 회전: 개별 치아 축 회전 (없음=100, 1개 미세=60, 2개 이상=35, 심함=15)
- 경사: 순설/근원심 경사 (없음=100, 미세=55, 뚜렷=30)
- 총생도: 겹침 (없음=100, 미세=50, 뚜렷=25, 심함=10)
- 참고: 교정 경험 없는 성인 대부분은 40~55점

### 3. 대칭 (symmetry) — 가중치 18%
- 크기 대칭: 좌우 대응 치아 크기 (일치=100, 미세 차이=60, 뚜렷=35)
- 위치 대칭: 좌우 수직/수평 위치 (일치=100, 편차=50, 뚜렷=30)
- 중심선: 치아-얼굴 중심선 (일치=100, 1mm 편위=60, 2mm+=30)
- 형태 대칭: 좌우 형태 (일치=100, 차이=50, 뚜렷=25)
- 참고: 완벽한 대칭은 시술 없이 거의 불가능, 자연치 평균 45~55점

### 4. 간격 (spacing) — 가중치 15%
- 접촉점: 인접 치아 접촉 (완벽=100, 부분 느슨=55, 이개=30)
- 균일도: 치간 간격 (균일=100, 불균일=45, 심함=20)
- 이개(diastema): 틈새 (없음=100, 0.5mm=50, 1mm+=25, 2mm+=10)
- 블랙 트라이앵글: 치간 어두운 삼각 (없음=100, 미세=55, 뚜렷=25)
- 참고: 자연치 대부분 간격 불균일, 평균 40~55점

### 5. 형태 (shape) — 가중치 12%
- 폭/길이 비율: 이상적 75~80% (적합=100, 편차 10%=55, 편차 20%+=30)
- 황금비율: 중절치:측절치:견치=1:0.7:0.6 (충족=100, 근접=55, 미달=30)
- 절단연: 마모/파절 (없음=100, 미세 마모=55, 뚜렷=30, 파절=15)
- 표면 질감: 에나멜 (매끄러움=100, 미세 균열=55, 거침=30)
- 참고: 30대 이상 성인 대부분 마모 존재, 평균 40~55점

### 6. 잇몸라인 (gumline) — 가중치 10%
- 연속성: 잇몸 마진 (매끄러움=100, 불규칙=55, 심한 불규칙=30)
- 대칭성: 좌우 잇몸 높이 (대칭=100, 비대칭=50, 심함=25)
- 건강도: 색상/부종 (건강 분홍=100, 경도 염증=50, 부종/출혈=20)
- 노출도: 미소 시 (적정=100, 거미스마일=40, 과도 퇴축=35)
- 참고: 잇몸 건강한 편이면 50~65점, 완벽은 드묾

## 등급 기준 (엄격)
S(90~100): 최우수 — 전문 시술 받은 연예인급
A(75~89): 우수 — 미백+부분 시술 상태
B(60~74): 보통 — 관리가 잘 된 자연치
C(40~59): 주의 — 일반적인 자연치 (시술 추천)
D(0~39): 심각 — 즉시 시술 필요

대부분의 시술 전 환자는 C등급(40~59점)에 해당합니다.
B등급(60+) 이상은 이미 관리가 잘 된 상태입니다.

반드시 아래 JSON 형식으로만 응답하세요:

{
  "scores": {
    "whiteness": <0-100>,
    "alignment": <0-100>,
    "symmetry": <0-100>,
    "spacing": <0-100>,
    "shape": <0-100>,
    "gumline": <0-100>
  },
  "details": {
    "whiteness": "구체적 소견 (VITA shade 포함)",
    "alignment": "구체적 소견",
    "symmetry": "구체적 소견",
    "spacing": "구체적 소견",
    "shape": "구체적 소견",
    "gumline": "구체적 소견"
  },
  "findings": [
    "핵심 발견사항 1",
    "핵심 발견사항 2",
    "핵심 발견사항 3"
  ],
  "urgency": "low|medium|high",
  "primary_concern": "가장 시급한 문제 한 줄 요약"
}`;
  },
};
