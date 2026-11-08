/* 궁합 분석 — 점수와 쉬운 말 풀이 생성 */
(function (root) {
'use strict';
const S = root.Saju;
const { STEM_H, BR_H, BR_K, EL, EL_H, ANIMAL, mod, stemEl, tenGod, stage, STAGES, branchRel, stemRel, GWIIN, MUNCHANG, HONGYEOM } = S;

const batchim = w => { const c = w.charCodeAt(w.length - 1); if (c < 0xAC00 || c > 0xD7A3) return null; return (c - 0xAC00) % 28 !== 0; };
const j = (w, a, b) => { const h = batchim(w); return w + (h === null ? `${a}(${b})` : h ? a : b); };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// 다섯 기운을 쉬운 말로
const NAT = ['나무', '불', '흙', '쇠', '물'];
const nat = e => `${NAT[e]}(${EL[e]})`;
const NAT_ROLE = ['성장·새 출발', '열정·표현', '안정·믿음', '결단·정리', '지혜·휴식'];
const LUCK = [
  { color: '초록색', act: '산책, 식물 키우기, 새로운 계획 세우기' },
  { color: '빨간색·주황색', act: '운동, 여행, 햇볕 쬐기, 밝은 조명' },
  { color: '노란색·갈색', act: '규칙적인 식사, 저축, 정해진 일과 지키기' },
  { color: '흰색·은색', act: '정리정돈, 약속 지키기, 계획 마무리하기' },
  { color: '검정색·남색', act: '충분한 잠, 물가 산책, 깊은 대화' },
];
const MANY = [
  '하고 싶은 일이 생기면 끝까지 밀고 나가는 힘이 있어요. 대신 고집이 셀 수 있어요.',
  '열정적이고 감정 표현이 풍부해요. 대신 성격이 급하고 쉽게 달아오를 수 있어요.',
  '신중하고 믿음직해요. 대신 변화를 싫어하고 결정이 느릴 수 있어요.',
  '원칙이 분명하고 결단력이 있어요. 대신 말이 날카롭게 들릴 수 있어요.',
  '생각이 깊고 상황에 유연하게 맞춰요. 대신 걱정이 많고 속마음을 잘 안 보여요.',
];
const NONE = [
  '새로운 일을 시작하는 힘이 조금 약할 수 있어요.',
  '감정을 겉으로 표현하는 걸 아끼는 편이에요.',
  '한 가지를 꾸준히 이어 가는 것이 숙제예요.',
  '맺고 끊는 게 어려워 거절을 잘 못할 수 있어요.',
  '쉬어 가는 여유가 부족해 무리하기 쉬워요.',
];
const SHENG = ['물이 나무를 키우듯', '나무가 불을 살리듯', '불이 타고 남은 재가 흙이 되듯', '흙 속에서 쇠가 나오듯', '바위틈에서 물이 솟듯']; // index = 받는 쪽 오행
const KE = ['도끼가 나무를 다듬듯', '물이 불을 끄듯', '나무뿌리가 흙을 파고들듯', '불이 쇠를 녹이듯', '둑이 물을 막듯']; // index = 당하는 쪽 오행

const DAYMASTER = [
  '큰 나무 같은 사람이에요. 한번 마음먹으면 꾸준히 밀고 나가고 책임감이 강해요. 자존심이 세서 먼저 사과하는 건 어려워해요.',
  '꽃과 덩굴 같은 사람이에요. 부드럽고 사교적이라 어디서든 잘 어울려요. 겉보기보다 끈질기고 생활력이 강해요.',
  '태양 같은 사람이에요. 밝고 솔직해서 주변을 환하게 만들어요. 대신 관심과 인정을 받고 싶어 하는 마음이 커요.',
  '촛불 같은 사람이에요. 따뜻하고 세심해서 한 사람에게 깊이 마음을 써요. 마음이 여려 작은 말에도 오래 신경 써요.',
  '큰 산 같은 사람이에요. 듬직하고 너그러워서 믿음을 줘요. 대신 한번 정한 생각은 잘 바꾸지 않아요.',
  '밭의 흙 같은 사람이에요. 실속 있고 남을 잘 챙겨요. 현실적이지만 속마음을 잘 드러내지 않아요.',
  '바위나 무쇠 같은 사람이에요. 결단력 있고 의리가 강해요. 말이 직설적이라 가끔 날카롭게 들려요.',
  '반짝이는 보석 같은 사람이에요. 깔끔하고 감각이 뛰어나요. 자존심이 강하고 상처를 쉽게 잊지 못해요.',
  '큰 강이나 바다 같은 사람이에요. 생각의 폭이 넓고 자유로워요. 속마음을 깊이 감춰서 상대가 읽기 어려워해요.',
  '비나 이슬 같은 사람이에요. 감수성과 눈치가 뛰어나고 조용히 다정해요. 생각과 걱정이 많은 편이에요.',
];
const TG_PLAIN = {
  비견: ['친구 같은 사람', '나와 닮은 사람이라 편해요. 다만 서로 양보를 잘 안 할 수 있어요.', '친구'],
  겁재: ['라이벌 같은 사람', '함께 있으면 의욕이 생기지만, 누가 주도할지나 돈 문제로 부딪히기 쉬워요.', '라이벌'],
  식신: ['챙겨 주고 싶은 사람', '같이 먹고 놀며 즐거움을 나누기 좋아요. 자연스럽게 베풀고 싶어져요.', '챙겨 주고픈'],
  상관: ['재미있는 사람', '나의 끼와 말솜씨를 끌어내 줘요. 대신 다툴 때 말이 날카로워지기 쉬워요.', '재미있는'],
  편재: ['설레는 사람', '매력에 끌려 자꾸 관심이 가요. 대신 상대를 내 뜻대로 하고 싶은 마음도 생겨요.', '설레는'],
  정재: ['지켜 주고 싶은 사람', '함께 생활을 꾸려 가기 좋은 안정적인 짝으로 느껴요.', '지켜 주고픈'],
  편관: ['카리스마 있는 사람', '끌리면서도 긴장돼요. 상대 앞에서 더 잘하고 싶어지지만 부담도 느껴요.', '카리스마'],
  정관: ['믿고 기댈 수 있는 사람', '나를 바르게 이끌어 주는 든든한 존재로 느껴요.', '든든한'],
  편인: ['나를 알아주는 사람', '깊은 대화가 잘 통하지만, 생활 방식에서는 엇갈릴 수 있어요.', '잘 통하는'],
  정인: ['나를 품어 주는 사람', '곁에 있으면 위로받고 마음이 편안해져요.', '포근한'],
};
const STAGE_PLAIN = {
  장생: [85, '새싹이 돋는 상태', '상대 곁에서 희망이 생기고 한 뼘씩 성장하는 느낌을 받아요.'],
  목욕: [70, '설레는 상태', '연애 감정은 풍부하지만 기분이 자주 오르락내리락해요.'],
  관대: [82, '자신감이 붙는 상태', '상대와 함께 있으면 당당해지고 바깥일에도 힘이 나요.'],
  건록: [90, '든든한 상태', '상대 곁에서 뿌리를 내린 듯 안정되고 편안해요.'],
  제왕: [88, '힘이 넘치는 상태', '에너지가 가장 강해요. 다만 내가 주도권을 쥐려 할 수 있어요.'],
  쇠: [62, '차분한 상태', '불꽃 같은 설렘보다는 편안함으로 오래 이어 가요.'],
  병: [50, '지치기 쉬운 상태', '상대에게 기대고 싶어지고, 피곤함을 쉽게 느낄 수 있어요.'],
  사: [45, '조용해지는 상태', '상대 앞에서 말수가 줄고 감정을 속으로 삭여요.'],
  묘: [55, '깊이 간직하는 상태', '애착이 깊어지지만 지나치면 집착이 될 수 있어요.'],
  절: [40, '롤러코스터 상태', '극적으로 시작했다가 갑자기 식을 수 있어 꾸준함이 필요해요.'],
  태: [60, '가능성의 상태', '아직은 시작 단계라 관계를 키우려면 시간이 필요해요.'],
  양: [72, '보살핌 받는 상태', '상대에게 챙김을 받으며 편안하게 기대게 돼요.'],
};
const SINSAL_MEANING = {
  천을귀인: '어려울 때 도와주는 사람이 나타나는 행운의 별이에요.',
  문창귀인: '머리가 좋고 말과 글에 재능이 있는 별이에요.',
  월덕귀인: '마음이 너그럽고 나쁜 일을 비껴가는 복의 별이에요.',
  양인살: '칼처럼 강한 기운이에요. 추진력과 승부욕이 크지만 고집으로 다툴 수 있어요.',
  백호대살: '에너지가 아주 강한 별이에요. 능력이 뛰어나지만 무리하지 않게 조심하면 좋아요.',
  괴강살: '리더 기질의 별이에요. 카리스마가 있지만 연인과 기싸움을 하기 쉬워요.',
  홍염살: '이성에게 인기가 많은 매력의 별이에요.',
  도화살: '사람을 끌어당기는 매력의 별이에요. 인기가 많고 예술 감각이 있어요.',
  역마살: '이동의 별이에요. 여행·이사·해외와 인연이 많고 한곳에 머물면 답답해해요.',
  화개살: '예술과 생각의 별이에요. 혼자만의 시간과 취미를 중요하게 여겨요.',
  공망: '비어 있는 자리예요. 그 부분에 허전함을 느끼지만, 욕심을 내려놓으면 오히려 편해져요.',
  고신살: '혼자 있는 시간이 꼭 필요한 별이에요. 연애에서 외로움을 느끼기 쉬워요.',
  과숙살: '혼자 있는 시간이 꼭 필요한 별이에요. 연인과 마음의 거리가 생기기 쉬워요.',
  원진살: '괜히 서운하고 미운 감정이 생기기 쉬운 기운이에요.',
  귀문관살: '눈치와 직감이 아주 예민한 별이에요. 대신 신경이 날카로워지기 쉬워요.',
};
const ANIMAL_REL = {
  육합: '띠끼리 잘 맞아요. 자라 온 분위기가 비슷해 양가 가족과도 잘 어울리는 편이에요.',
  삼합: '띠끼리 잘 맞아요. 바라보는 방향이 같아 함께 일을 꾸리기 좋아요.',
  충: '띠끼리 부딪히는 사이예요. 집안 분위기나 세대 감각이 달라 처음엔 낯설 수 있지만, 서로의 빈 곳을 채워 주기도 해요.',
  원진: '띠끼리 사소한 일로 서운해지기 쉬운 사이예요. 감정은 그때그때 풀어 주세요.',
  형: '띠끼리 서로를 고치려 들면 다투기 쉬운 사이예요. 존중하면 서로를 성장시켜요.',
  해: '띠끼리 겉으론 무난해도 속으로 서운함이 쌓이기 쉬운 사이예요.',
  파: '띠끼리 작은 약속이 어긋나기 쉬운 사이예요. 계획을 함께 확인해 주세요.',
  자형: '같은 띠라 약점도 닮아서 같은 문제로 함께 흔들릴 수 있어요.',
  동일: '같은 띠라 공감대가 많아 친구처럼 편해요.',
};
const ILJI = {
  육합: '생활 궁합이 아주 좋아요. 생활 습관과 감정 표현 방식이 톱니바퀴처럼 맞물려서, 함께 지낼수록 편해지는 사이예요.',
  삼합: "같은 목표를 향해 힘을 모으는 '한 팀' 같은 사이예요. 함께 무언가를 이뤄 갈 때 더 가까워져요.",
  충: '생활 방식이 많이 달라요. 잠자는 시간, 정리 습관, 감정 표현에서 부딪히기 쉬워요. 떨어져 있으면 보고 싶고 붙어 있으면 다투는 패턴이 생길 수 있으니, 각자의 시간과 공간을 꼭 지켜 주세요.',
  형: "서로를 고쳐 주려다 상처를 주기 쉬운 사이예요. '이렇게 해'보다 '나는 이게 편해'라고 말해 보세요.",
  자형: '닮은 점이 많아서 같은 일로 동시에 예민해지기 쉬워요. 한 사람이 힘들 때 다른 한 사람이 한발 물러나 주세요.',
  원진: '가끔 별 이유 없이 상대가 밉게 보이는 순간이 와요. 서운한 건 쌓아 두지 말고 그날 바로 가볍게 이야기해 주세요.',
  귀문: '말하지 않아도 마음이 통하는 직감이 있어요. 그만큼 서로의 기분에 예민하게 반응하기도 해요.',
  파: '큰 싸움보다는 작은 약속이 어긋나면서 서운해지기 쉬워요. 약속과 계획을 함께 확인하는 습관이 좋아요.',
  해: "겉으로는 괜찮아 보여도 속으로 '나만 손해 보나' 하는 마음이 쌓이기 쉬워요. 고맙다는 말을 자주 해 주세요.",
  동일: '생활 패턴과 감정의 결이 닮아서 함께 있으면 편해요.',
};
const term = t => `<span class="term">명리 용어: ${t}</span>`;

function personProfile(c) {
  const n = c.input.name;
  const max = Math.max(...c.count);
  const many = [0, 1, 2, 3, 4].filter(e => c.count[e] === max && max >= 3);
  const none = [0, 1, 2, 3, 4].filter(e => c.count[e] === 0);
  const strength = /신강/.test(c.strength) ? '자기 주관이 뚜렷하고 에너지가 강한 편이에요. 스스로 결정하고 이끌어 가는 게 편해요.'
    : /신약/.test(c.strength) ? '섬세하고 주변 사람들과 어울리며 힘을 얻는 편이에요. 혼자보다 함께일 때 더 잘해요.'
    : '기운의 균형이 잘 잡혀 있어 상황에 따라 이끌기도 하고 맞춰 주기도 해요.';
  return {
    nature: DAYMASTER[c.ds],
    many: many.map(e => `${j(NAT[e], '이', '가')} 많아요(${c.count[e]}개). ${MANY[e]}`),
    none: none.map(e => `${j(NAT[e], '이', '가')} 없어요. ${NONE[e]}`),
    strength,
    luck: { el: c.yong, name: nat(c.yong), ...LUCK[c.yong] },
  };
}

function stemRelPlain(A, B, nA, nB) {
  const r = stemRel(A.ds, B.ds);
  if (r.t === '합') return { score: 95, label: '자연스럽게 끌림', good: '처음부터 서로에게 자연스럽게 끌리는 사이예요.', term: '일간 천간합',
    text: "두 사람은 서로를 자석처럼 끌어당기는 사이예요. 명리학에서 가장 좋은 짝으로 꼽는 조합 중 하나로, 함께 있으면 '나'보다 '우리'를 먼저 생각하게 돼요." };
  if (r.t === '충') return { score: 35, label: '정반대 성향', bad: '생각하고 결정하는 방식이 정반대라 자주 부딪혀요.', term: '일간 천간충',
    text: '생각하는 방식과 결정하는 스타일이 정반대예요. 그래서 강하게 끌리기도 하지만 자주 부딪혀요. 중요한 일은 누가 결정할지 미리 나눠 두면 싸움이 확 줄어요.' };
  if (r.t === '비화') return { score: A.ds % 2 === B.ds % 2 ? 62 : 68, label: '닮은꼴', good: '성향이 닮아 친구처럼 말이 잘 통해요.', bad: '둘 다 고집을 부리면 양보 없는 싸움이 되기 쉬워요.', term: '일간 비화(같은 오행)',
    text: `둘 다 ${nat(A.dEl)} 기운을 타고난 닮은꼴이에요. 말이 잘 통하고 친구처럼 편하지만, 둘 다 고집을 부리면 양보 없는 싸움이 될 수 있어요.` };
  const [giver, taker, g, t] = r.dir === 'ab' ? [nA, nB, A, B] : [nB, nA, B, A];
  if (r.t === '생') return { score: 82, label: `${giver}님이 챙겨 주는 사이`, good: `${j(giver + '님', '이', '가')} ${taker}님을 자꾸 챙겨 주고 싶어지는 따뜻한 사이예요.`, term: '일간 상생',
    text: `${SHENG[t.dEl]}, ${j(giver + '님', '이', '가')} ${taker}님을 자꾸 챙겨 주고 싶어지는 관계예요. 따뜻한 사이지만 한쪽만 계속 주다 보면 지칠 수 있으니, ${taker}님이 고마움을 자주 표현해 주세요.` };
  return { score: 52, label: `${giver}님이 이끄는 사이`, bad: `${j(giver + '님', '이', '가')} 이끌고 ${j(taker + '님', '이', '가')} 맞추는 구도라 한쪽이 답답할 수 있어요.`, term: '일간 상극',
    text: `${KE[t.dEl]}, ${j(giver + '님', '이', '가')} 이끌고 ${j(taker + '님', '이', '가')} 맞춰 주는 관계가 되기 쉬워요. 적당하면 서로를 성장시키지만, 지나치면 ${taker}님이 답답함을 느껴요. 이끄는 쪽이 한 박자 천천히 가 주세요.` };
}

const SPOUSE_SCORE = {
  M: { 정재: 95, 편재: 85, 정관: 70, 편관: 62, 식신: 72, 상관: 60, 정인: 70, 편인: 58, 비견: 58, 겁재: 50 },
  F: { 정관: 95, 편관: 85, 정재: 70, 편재: 62, 식신: 70, 상관: 55, 정인: 72, 편인: 58, 비견: 58, 겁재: 50 },
};

function supply(me, other) {
  const share = e => other.count[e] / other.total;
  const s1 = Math.min(1, share(me.yong) / 0.25), s2 = Math.min(1, share(me.hee) / 0.25);
  const g = Math.max(0, share(me.gi) - 0.25);
  let sc = 40 + 40 * s1 + 20 * s2 - 60 * g;
  if (me.johu !== null && me.johu !== me.yong) sc += 8 * Math.min(1, share(me.johu) / 0.25);
  return clamp(sc, 15, 98);
}
const amount = n => (n >= 3 ? '넉넉히 갖고 있어요' : n >= 1 ? '조금 갖고 있어요' : '거의 갖고 있지 않아요');

function compat(A, B) {
  const nA = A.input.name, nB = B.input.name;
  const cats = [];
  const P = s => `<p>${s}</p>`;

  // 1. 타고난 성격 (일간)
  const r1 = stemRelPlain(A, B, nA, nB);
  cats.push({ key: 'ilgan', name: '타고난 성격', sub: '두 사람의 본바탕', w: 18, score: r1.score, label: r1.label, good: r1.good, bad: r1.bad, term: r1.term,
    html: P(r1.text) + `<div class="duo"><div><b>${nA}님은</b><p>${DAYMASTER[A.ds]}</p></div><div><b>${nB}님은</b><p>${DAYMASTER[B.ds]}</p></div></div>` });

  // 2. 함께 사는 궁합 (일지)
  const rr = branchRel(A.db, B.db);
  const s2 = clamp(62 + rr.reduce((a, r) => a + r.v, 0), 15, 98);
  const pos2 = rr.some(r => r.v > 0), neg2 = rr.some(r => r.v < 0);
  cats.push({ key: 'ilji', name: '함께 사는 궁합', sub: '생활 습관·애정 표현', w: 22, score: s2,
    label: !rr.length ? '무난함' : pos2 && neg2 ? '끌림과 갈등이 함께' : pos2 ? '잘 맞물림' : rr.some(r => r.t === '동일') ? '닮은 생활' : '부딪히기 쉬움',
    good: pos2 ? '생활 습관과 애정 표현이 잘 맞물려요.' : null,
    bad: neg2 ? '함께 지낼 때 생활 방식이나 감정 표현에서 부딪히기 쉬워요.' : null,
    term: `일지(배우자 자리) ${rr.length ? rr.map(r => r.t).join('·') : '합·충 없음'}`,
    html: P('사주에서 태어난 날의 아래 글자는 \'배우자 자리\'라고 불러요. 두 사람의 이 자리를 맞대 보면 함께 생활할 때의 궁합을 알 수 있어요.')
      + (rr.length ? rr.map(r => P(ILJI[r.t])).join('') : P('생활 궁합에서 특별히 끌리거나 부딪히는 요소가 없어요. 큰 자극은 없지만 그만큼 무난하고 담백하게 지낼 수 있어요.')) });

  // 3. 서로 채워 주는 기운 (오행)
  const sAB = supply(A, B), sBA = supply(B, A);
  const s3 = Math.round((sAB + sBA) / 2);
  const missA = [0, 1, 2, 3, 4].filter(e => A.count[e] === 0), missB = [0, 1, 2, 3, 4].filter(e => B.count[e] === 0);
  const sum = A.count.map((v, i) => v + B.count[i]);
  const missSum = [0, 1, 2, 3, 4].filter(e => sum[e] === 0);
  let t3 = P('사람은 누구나 나무·불·흙·쇠·물 다섯 가지 기운을 저마다 다른 비율로 갖고 태어나요. 내게 필요한 기운을 상대가 갖고 있으면 함께 있을 때 마음이 편하고 힘이 나요.');
  t3 += P(`${nA}님에게 가장 도움이 되는 기운은 <b>${nat(A.yong)}</b>이에요. ${j(nB + '님', '은', '는')} 이 기운을 ${amount(B.count[A.yong])}.`);
  t3 += P(`${nB}님에게 가장 도움이 되는 기운은 <b>${nat(B.yong)}</b>이에요. ${j(nA + '님', '은', '는')} 이 기운을 ${amount(A.count[B.yong])}.`);
  t3 += P(sAB >= 75 && sBA >= 75 ? '서로가 서로에게 필요한 기운을 채워 주는, 아주 이상적인 관계예요.'
    : sAB >= 75 ? `${j(nB + '님', '이', '가')} ${nA}님에게 필요한 기운을 잘 채워 줘요. ${j(nA + '님', '은', '는')} ${nB}님 곁에서 힘을 얻어요.`
    : sBA >= 75 ? `${j(nA + '님', '이', '가')} ${nB}님에게 필요한 기운을 잘 채워 줘요. ${j(nB + '님', '은', '는')} ${nA}님 곁에서 힘을 얻어요.`
    : '서로의 부족한 기운을 넉넉히 채워 주는 사이는 아니에요. 아래 \'함께 하면 좋은 것\'을 생활에 더해 보세요.');
  const fill = [];
  const fA = missA.filter(e => B.count[e] > 0), fB = missB.filter(e => A.count[e] > 0);
  if (fA.length) fill.push(`${nA}님에게 없는 ${j(fA.map(e => NAT[e]).join('·'), '을', '를')} ${j(nB + '님', '이', '가')}`);
  if (fB.length) fill.push(`${nB}님에게 없는 ${j(fB.map(e => NAT[e]).join('·'), '을', '를')} ${j(nA + '님', '이', '가')}`);
  if (fill.length) t3 += P(`${fill.join(', ')} 갖고 있어서 서로의 빈자리를 메워 줘요.`);
  if (missSum.length) t3 += P(`두 사람을 합쳐도 ${missSum.map(e => NAT[e]).join('·')} 기운이 없어요. 이 기운이 맡는 ${missSum.map(e => NAT_ROLE[e]).join(', ')} 쪽은 둘 다 놓치기 쉬우니 의식적으로 챙겨 주세요.`);
  const heavy = [];
  if (B.count[A.gi] / B.total > 0.3) heavy.push(`${nB}님에게 많은 ${NAT[A.gi]} 기운은 ${nA}님에게`);
  if (A.count[B.gi] / A.total > 0.3) heavy.push(`${nA}님에게 많은 ${NAT[B.gi]} 기운은 ${nB}님에게`);
  if (heavy.length) t3 += P(`${heavy.join(', ')} 조금 버거운 기운이에요. 상대의 그런 면이 가끔 부담스럽게 느껴질 수 있어요.`);
  cats.push({ key: 'ohaeng', name: '서로 채워 주는 기운', sub: '나무·불·흙·쇠·물', w: 18, score: s3,
    label: sAB >= 75 && sBA >= 75 ? '서로 채워 줌' : sAB >= 75 || sBA >= 75 ? '한쪽이 채워 줌' : '보완이 적음',
    good: s3 >= 70 ? '서로에게 부족한 기운을 채워 주는 사이예요.' : null,
    bad: s3 < 60 ? '서로의 부족한 기운을 채워 주는 힘이 약해요.' : null,
    term: '오행 · 용신', html: t3, extra: { sum } });

  // 4. 서로를 어떻게 느끼나 (십성)
  const tAB = tenGod(A.ds, B.ds), tBA = tenGod(B.ds, A.ds);
  const sex = c => (c.input.sex === 'F' ? 'F' : 'M');
  const s4 = Math.round((SPOUSE_SCORE[sex(A)][tAB] + SPOUSE_SCORE[sex(B)][tBA]) / 2);
  const isStar = (c, tg) => (sex(c) === 'M' ? ['편재', '정재'] : ['편관', '정관']).includes(tg);
  const sa = isStar(A, tAB), sb = isStar(B, tBA);
  let t4 = `<div class="duo"><div><b>${nA}님 눈에 비친 ${nB}님</b><p><strong>${TG_PLAIN[tAB][0]}</strong> · ${TG_PLAIN[tAB][1]}</p></div><div><b>${nB}님 눈에 비친 ${nA}님</b><p><strong>${TG_PLAIN[tBA][0]}</strong> · ${TG_PLAIN[tBA][1]}</p></div></div>`;
  t4 += P('옛 명리학에서는 상대가 나에게 \'배우자의 별\'에 해당하면 자연스럽게 짝으로 느낀다고 봐요.');
  t4 += P(sa && sb ? '두 사람 모두 상대가 자신의 배우자 별에 해당해요. 서로를 자연스럽게 연인이자 짝으로 받아들이는 사이예요.'
    : sa ? `${nA}님에게 ${j(nB + '님', '은', '는')} 배우자 별에 해당해 짝으로 느끼기 쉬워요. 반면 ${nB}님은 ${nA}님을 연인보다 '${TG_PLAIN[tBA][0]}'으로 먼저 느낄 수 있어요.`
    : sb ? `${nB}님에게 ${j(nA + '님', '은', '는')} 배우자 별에 해당해 짝으로 느끼기 쉬워요. 반면 ${nA}님은 ${nB}님을 연인보다 '${TG_PLAIN[tAB][0]}'으로 먼저 느낄 수 있어요.`
    : '서로가 상대의 배우자 별에 해당하지는 않아요. 첫눈에 반하기보다는 친구나 동료로 시작해 정이 깊어지는 사이에 가까워요.');
  cats.push({ key: 'spouse', name: '서로를 어떻게 느끼나', sub: '상대가 나에게 어떤 사람인지', w: 12, score: s4, label: `${TG_PLAIN[tAB][2]} · ${TG_PLAIN[tBA][2]}`,
    good: sa || sb ? '상대를 연인이자 짝으로 자연스럽게 느끼는 사이예요.' : null,
    bad: s4 < 60 ? '연인보다 친구나 라이벌처럼 느끼기 쉬워요.' : null,
    term: `십성 · ${nA}→${nB} ${tAB}, ${nB}→${nA} ${tBA}`, html: t4 });

  // 5. 상대 곁에서의 내 컨디션 (십이운성)
  const stA = STAGES[stage(A.ds, B.db)], stB = STAGES[stage(B.ds, A.db)];
  const s5 = Math.round((STAGE_PLAIN[stA][0] + STAGE_PLAIN[stB][0]) / 2);
  cats.push({ key: 'stage', name: '상대 곁의 내 컨디션', sub: '함께 있을 때 기운 변화', w: 8, score: s5, label: `${STAGE_PLAIN[stA][1].replace(' 상태', '')} · ${STAGE_PLAIN[stB][1].replace(' 상태', '')}`,
    good: s5 >= 75 ? '함께 있으면 두 사람 모두 기운이 살아나요.' : null,
    bad: s5 < 55 ? '함께 있을 때 한쪽이 쉽게 지치거나 감정이 들쭉날쭉해요.' : null,
    term: `십이운성 · ${stA}, ${stB}`,
    html: P('상대 곁에 있을 때 내 기운이 어떤 상태가 되는지 보는 풀이예요.')
      + `<div class="duo"><div><b>${nA}님은 ${nB}님 곁에서</b><p><strong>${STAGE_PLAIN[stA][1]}</strong> · ${STAGE_PLAIN[stA][2]}</p></div><div><b>${nB}님은 ${nA}님 곁에서</b><p><strong>${STAGE_PLAIN[stB][1]}</strong> · ${STAGE_PLAIN[stB][2]}</p></div></div>` });

  // 6. 특별한 인연의 별 (신살)
  let s6 = 60; const notes = []; let love = false, helper = false;
  const brs = c => ['year', 'month', 'day', 'hour'].filter(k => c.P[k]).map(k => [k, c.P[k].b]);
  for (const [X, Y, nx, ny] of [[A, B, nA, nB], [B, A, nB, nA]]) {
    const g = brs(Y).filter(([, b]) => GWIIN[X.ds].includes(b));
    if (g.length) { helper = true; s6 += Math.min(2, g.length) * 6; notes.push(`<li class="good"><b>든든한 귀인</b> ${j(ny + '님', '은', '는')} ${nx}님이 어려울 때 결정적인 도움을 주는 사람이에요.</li>`); }
    const dh = [Y.P.day.b, Y.P.year.b].filter(b => X.dohwa.includes(b));
    if (dh.length) { love = true; s6 += 7; notes.push(`<li class="love"><b>강한 이끌림</b> ${j(nx + '님', '은', '는')} ${ny}님에게서 이성적인 매력을 강하게 느껴요.</li>`); }
    if (HONGYEOM[X.ds] === Y.P.day.b) { love = true; s6 += 5; notes.push(`<li class="love"><b>오래가는 설렘</b> ${j(nx + '님', '은', '는')} ${ny}님과 함께 있을 때 설렘이 오래가요.</li>`); }
    if (MUNCHANG[X.ds] === Y.P.day.b) { s6 += 4; notes.push(`<li class="good"><b>잘 통하는 대화</b> ${j(nx + '님', '은', '는')} ${ny}님과 대화가 잘 통하고 함께 배우는 일이 즐거워요.</li>`); }
    if (X.gongmang.includes(Y.P.day.b)) { s6 -= 8; notes.push(`<li class="weak"><b>채워지지 않는 마음</b> ${j(nx + '님', '은', '는')} ${ny}님에게 뭔가 채워지지 않는 허전함을 느낄 수 있어요. 상대에게 바라는 것을 현실적으로 맞추면 편해져요.</li>`); }
    const gs = brs(X).filter(([k, b]) => (k === 'day' || k === 'hour') && (b === X.gosin || b === X.gwasuk));
    if (gs.length) { s6 -= 4; notes.push(`<li class="weak"><b>혼자만의 시간</b> ${j(nx + '님', '은', '는')} 혼자 있는 시간이 꼭 필요한 사람이에요. 그걸 거절로 오해하지 않도록 미리 이야기해 두세요.</li>`); }
  }
  let wj = 0;
  for (const [ka, ba] of brs(A)) for (const [kb, bb] of brs(B)) {
    if (ka === 'day' && kb === 'day') continue;
    if ((ka === 'day' || kb === 'day' || (ka === 'year' && kb === 'year')) && branchRel(ba, bb).some(r => r.t === '원진')) wj++;
  }
  if (wj) { s6 -= 4 * Math.min(2, wj); notes.push('<li class="weak"><b>괜한 서운함</b> 별것 아닌 일로 서운해지는 순간이 종종 와요. 감정이 쌓이기 전에 가볍게 말해 주세요.</li>'); }
  const bk = c => c.sinsal.some(s => (s.name === '백호대살' && s.where.includes('일주')) || s.name === '괴강살');
  if (bk(A) && bk(B)) { s6 -= 5; notes.push('<li class="weak"><b>기싸움 주의</b> 두 사람 모두 기가 센 편이라 누가 이기나 싸움이 붙기 쉬워요. 집안일·돈·여가처럼 영역을 나눠 각자 결정하면 좋아요.</li>'); }
  s6 = clamp(Math.round(s6), 20, 98);
  if (!notes.length) notes.push('<li>두 사람 사이에 특별히 작용하는 인연의 별은 없어요. 큰 자극 없이 담백한 사이예요.</li>');
  cats.push({ key: 'sinsal', name: '특별한 인연의 별', sub: '끌림·도움·서운함', w: 10, score: s6, label: love ? '강한 끌림' : helper ? '서로 돕는 인연' : s6 < 55 ? '서운함 주의' : '담백함',
    good: love ? '서로에게 이성적인 매력을 강하게 느끼는 사이예요.' : helper ? '어려울 때 서로 돕는 귀인 같은 사이예요.' : null,
    bad: s6 < 55 ? '작은 일로 서운함이 쌓이기 쉬워요.' : null,
    term: '신살 · 귀인·도화·홍염·공망·원진', html: `<ul class="notes">${notes.join('')}</ul>` });

  // 7. 띠 / 8. 가족·사회생활
  const pairScore = rs => {
    if (!rs.length) return 66;
    if (rs.some(r => r.t === '육합' || r.t === '삼합')) return rs.some(r => r.v < 0) ? 72 : 90;
    if (rs.some(r => r.t === '동일')) return 68;
    return Math.min(...rs.map(r => ({ 충: 38, 원진: 40, 형: 48, 자형: 55, 해: 55, 파: 55, 귀문: 58 }[r.t] || 66)));
  };
  const ry = branchRel(A.P.year.b, B.P.year.b), s7 = pairScore(ry);
  cats.push({ key: 'tti', name: '띠 궁합', sub: '집안 분위기·배경', w: 7, score: s7, label: `${ANIMAL[A.P.year.b]}띠 · ${ANIMAL[B.P.year.b]}띠`,
    good: s7 >= 80 ? '띠가 잘 맞아 양가 가족과도 잘 어울려요.' : null, bad: s7 < 50 ? '띠끼리 부딪혀 집안 분위기 차이를 느끼기 쉬워요.' : null,
    term: `년지 ${BR_K[A.P.year.b]}·${BR_K[B.P.year.b]} ${ry.map(r => r.t).join('·')}`,
    html: P(`${j(nA + '님', '은', '는')} ${ANIMAL[A.P.year.b]}띠, ${j(nB + '님', '은', '는')} ${ANIMAL[B.P.year.b]}띠예요. ${ry.length ? ry.map(r => ANIMAL_REL[r.t]).join(' ') : '띠끼리 특별히 맞거나 부딪히는 게 없어 무난해요.'}`)
      + '<p class="fine">사주에서는 띠가 양력 1월 1일이 아니라 입춘(2월 4일 무렵)에 바뀌어요. 그래서 1월~2월 초에 태어난 사람은 전년도 띠가 돼요. 띠 궁합은 참고용이라 비중을 낮게 두었어요.</p>' });
  const rm = branchRel(A.P.month.b, B.P.month.b);
  const sm = stemRel(A.P.month.s, B.P.month.s);
  const s8 = clamp(pairScore(rm) + (sm.t === '합' ? 6 : sm.t === '충' ? -6 : 0), 20, 98);
  cats.push({ key: 'wolji', name: '가족·사회생활 궁합', sub: '일하는 리듬·가족 문화', w: 5, score: s8,
    label: rm.some(r => r.v > 0) ? '잘 맞음' : rm.some(r => r.v < 0) ? '차이가 있음' : '무난함',
    good: s8 >= 80 ? '일하는 리듬과 가족 문화가 잘 맞아요.' : null, bad: s8 < 50 ? '일하는 리듬이나 가족 문화가 달라 맞춰 가야 해요.' : null,
    term: `월주 ${rm.map(r => r.t).join('·') || '무난'}`,
    html: P(`태어난 달은 자라 온 가정 환경과 사회생활 스타일을 보여 줘요. ${rm.length ? (rm.some(r => r.v > 0) ? '두 사람은 일하는 리듬과 가족 문화가 비슷해서 서로의 가족과도 잘 어울려요.' : '두 사람은 자라 온 가정 분위기나 일하는 리듬이 달라요. 서로의 가족 문화를 \'틀림\'이 아닌 \'다름\'으로 봐 주세요.') : '두 사람은 가족 문화와 사회생활에서 크게 부딪히지 않아요.'}${sm.t === '합' ? ' 사회생활의 호흡도 잘 맞아요.' : sm.t === '충' ? ' 다만 일을 처리하는 방식에서는 의견이 갈리기 쉬워요.' : ''}`) });

  // 교차 매트릭스 (전문가용)
  const K = ['hour', 'day', 'month', 'year'];
  let hap = 0, chung = 0;
  const matrix = K.map(ka => K.map(kb => {
    const pa = A.P[ka], pb = B.P[kb];
    if (!pa || !pb) return null;
    const st = stemRel(pa.s, pb.s), br = branchRel(pa.b, pb.b);
    if (st.t === '합') hap++; if (st.t === '충') chung++;
    br.forEach(r => { if (r.v > 0 && r.t !== '동일') hap++; if (r.t === '충') chung++; });
    return { st, br };
  }));

  let total = cats.reduce((a, c) => a + c.score * c.w, 0) / 100;
  total += clamp(hap - chung, -4, 4);
  total = Math.round(clamp(total, 20, 99));
  const G = total >= 90 ? ['천생연분', '보기 드물게 잘 맞는 천생연분이에요.']
    : total >= 80 ? ['아주 좋은 인연', '서로에게 좋은 영향을 주는 아주 좋은 인연이에요.']
    : total >= 70 ? ['좋은 인연', '잘 맞는 부분이 많은 좋은 인연이에요.']
    : total >= 60 ? ['노력하면 깊어지는 인연', '잘 맞는 점과 다른 점이 섞여 있어서, 서로 노력할수록 깊어지는 인연이에요.']
    : total >= 50 ? ['서로 맞춰 가는 인연', '다른 점이 꽤 많아서, 서로 맞춰 가는 과정이 필요한 인연이에요.']
    : ['배려가 꼭 필요한 인연', '부딪히는 부분이 많아서, 다툼을 푸는 방법을 함께 익혀야 하는 인연이에요.'];

  const ranked = cats.slice().sort((a, b) => b.score - a.score);
  const strengths = ranked.filter(c => c.good && c.score >= 68).slice(0, 3);
  const cautions = ranked.slice().reverse().filter(c => c.bad && c.score < 62).slice(0, 3);
  const story = [G[1]];
  if (strengths[0]) story.push(`특히 ${strengths[0].good}`);
  if (cautions[0]) story.push(`다만 ${cautions[0].bad}`);
  const advice = [];
  if (rr.some(r => r.t === '충')) advice.push('함께 지낼 때는 각자의 방이나 혼자 있는 시간처럼 나만의 공간을 꼭 지켜 주세요.');
  if (rr.some(r => r.t === '원진' || r.t === '해') || wj) advice.push('서운한 감정은 하루를 넘기지 말고, 그날 짧게라도 말로 풀어 주세요.');
  if (rr.some(r => r.t === '형' || r.t === '자형')) advice.push('상대의 습관을 고치려는 말 대신 "나는 이렇게 하면 편해"처럼 내 마음을 말해 보세요.');
  if (r1.score <= 52) advice.push('중요한 결정은 분야를 나눠서 각자 최종 결정권을 갖는 방식이 다툼을 줄여요.');
  if (r1.score === 82) advice.push('주는 쪽이 지치지 않도록, 받는 쪽이 고맙다는 말을 자주 해 주세요.');
  const luckSet = [...new Set([A.yong, B.yong, ...missSum])];
  advice.push(`함께 하면 좋은 것: ${luckSet.map(e => `${LUCK[e].act} (${NAT[e]} 기운)`).join(' / ')}`);
  if (s3 >= 75) advice.push('서로가 서로의 부족한 기운을 채워 주는 사이예요. 힘들 때 상대에게 기대는 걸 망설이지 마세요.');

  return { cats, total, grade: G[0], gradeText: G[1], story: story.join(' '), matrix, hap, chung, strengths, cautions, advice, sum, missSum };
}

function yearFlow(A, B, from, n) {
  const out = [];
  for (let Y = from; Y < from + n; Y++) {
    const ys = mod(Y - 4, 10), yb = mod(Y - 4, 12);
    let total = 0;
    const per = [A, B].map(c => {
      const tags = []; let v = 0;
      const rs = branchRel(yb, c.db), ts = rs.map(r => r.t);
      const pos = ts.some(t => t === '육합' || t === '삼합');
      if (pos && ts.some(t => ['충', '형', '자형', '원진'].includes(t))) tags.push({ t: '좋은 일과 다툼이 섞임', k: 'mid' });
      else if (pos) { v += 2; tags.push({ t: '연애·가정 순조', k: 'good' }); }
      else if (ts.includes('충')) { v -= 3; tags.push({ t: '변화·다툼 주의', k: 'bad' }); }
      else if (ts.includes('형') || ts.includes('자형')) { v -= 2; tags.push({ t: '예민해지기 쉬움', k: 'bad' }); }
      else if (ts.includes('원진')) { v -= 1; tags.push({ t: '서운함 주의', k: 'bad' }); }
      const tg = tenGod(c.ds, ys);
      if ((c.input.sex === 'F' ? ['편관', '정관'] : ['편재', '정재']).includes(tg)) { v += 1; tags.push({ t: '연애·결혼 이슈', k: 'love' }); }
      if (c.dohwa.includes(yb)) { v += 1; tags.push({ t: '인기·매력 상승', k: 'love' }); }
      if (c.needs.includes(stemEl(ys))) { v += 1; tags.push({ t: '힘이 나는 해', k: 'good' }); }
      else if (stemEl(ys) === c.gi) { v -= 1; tags.push({ t: '지치기 쉬운 해', k: 'bad' }); }
      total += v;
      return { tags, v };
    });
    if (yb % 4 === A.db % 4 && yb % 4 === B.db % 4 && A.db !== B.db) total += 2;
    const mood = total >= 3 ? ['좋은 해', 'good', '함께 좋은 일을 만들기 좋아요. 여행, 동거, 결혼 같은 계획을 세우기 좋아요.']
      : total <= -3 ? ['조심할 해', 'bad', '서로 예민해지기 쉬워요. 큰 결정은 서두르지 말고 배려를 더해 주세요.']
      : ['평범한 해', 'mid', '큰 굴곡 없이 흘러가요. 일상을 꾸준히 함께하면 좋아요.'];
    out.push({ Y, ys, yb, per, total, mood });
  }
  return out;
}

root.Compat = { compat, yearFlow, personProfile, SINSAL_MEANING, DAYMASTER, NAT, LUCK, j };
})(typeof window !== 'undefined' ? window : globalThis);
