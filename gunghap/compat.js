/* 궁합 분석 — 점수와 해설 생성 */
(function (root) {
'use strict';
const S = root.Saju;
const { STEM_H, STEM_K, BR_H, BR_K, EL, EL_H, ANIMAL, mod, stemEl, stemName, tenGod, stage, STAGES, branchRel, stemRel, sinsal12, GWIIN, MUNCHANG, HONGYEOM } = S;

const batchim = w => { const c = w.charCodeAt(w.length - 1); if (c < 0xAC00 || c > 0xD7A3) return null; return (c - 0xAC00) % 28 !== 0; };
const j = (w, a, b) => { const h = batchim(w); return w + (h === null ? `${a}(${b})` : h ? a : b); };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ELF = e => `${EL[e]}(${EL_H[e]})`;

const DAYMASTER = [
  '큰 나무처럼 곧게 뻗어 나가는 기질입니다. 목표가 생기면 추진력이 강하고 책임감이 크지만, 자존심 때문에 먼저 굽히기를 어려워합니다.',
  '덩굴과 화초처럼 유연하고 사교적입니다. 환경에 잘 적응하고 섬세하게 사람을 챙기며, 겉보기보다 끈질긴 생활력이 있습니다.',
  '하늘의 태양처럼 밝고 열정적입니다. 감정 표현이 분명하고 숨김이 없으며, 주변을 환하게 만드는 대신 관심과 인정을 중요하게 여깁니다.',
  '촛불과 등불처럼 따뜻하고 세심합니다. 속에 열정을 품고 한 사람에게 깊이 헌신하지만, 마음이 예민해 작은 말에도 오래 흔들립니다.',
  '큰 산처럼 듬직하고 포용력이 있습니다. 쉽게 흔들리지 않아 믿음을 주지만, 한번 정한 생각은 잘 바꾸지 않고 변화에 느립니다.',
  '논밭의 흙처럼 실속 있고 배려심이 깊습니다. 현실 감각이 좋고 사람을 길러 내는 힘이 있으나, 속마음을 잘 드러내지 않습니다.',
  '바위와 무쇠처럼 결단력과 의리가 있습니다. 원칙이 분명하고 직설적이라 시원하지만, 말이 날카롭게 들릴 때가 있습니다.',
  '다듬어진 보석처럼 섬세하고 깔끔합니다. 미적 감각과 자존감이 높고 판단이 예리하지만, 상처를 잘 받고 쉽게 잊지 않습니다.',
  '큰 강과 바다처럼 스케일이 크고 지혜롭습니다. 포용력과 자유로움을 함께 지녔으며, 속을 깊이 감춰 상대가 읽기 어려워합니다.',
  '비와 이슬처럼 감수성과 직관이 뛰어납니다. 조용히 스며들어 상대를 적시는 다정함이 있으나, 걱정과 생각이 많은 편입니다.',
];
const TG_MEANING = {
  비견: '나와 같은 기운입니다. 대등한 친구이자 동료처럼 느껴져 편하지만, 서로 양보가 적을 수 있습니다.',
  겁재: '경쟁심과 자극을 주는 상대입니다. 함께 있으면 의욕이 생기지만 주도권과 돈 문제로 부딪히기 쉽습니다.',
  식신: '자연스럽게 베풀고 챙겨 주고 싶은 상대입니다. 함께 먹고 놀며 즐거움을 나누는 데 잘 맞습니다.',
  상관: '나의 표현력과 끼를 끌어내는 상대입니다. 대화가 재미있지만, 다툴 때 말이 날카로워지기 쉽습니다.',
  편재: '강한 흥미와 설렘을 느끼는 상대입니다. 매력에 끌리지만 상대를 내 뜻대로 하고 싶은 마음도 생깁니다.',
  정재: '아끼고 지켜 주고 싶은 상대입니다. 현실적이고 안정적인 동반자로 느끼며 생활을 함께 꾸리기 좋습니다.',
  편관: '카리스마와 긴장감을 주는 상대입니다. 끌리면서도 압박을 느끼며, 상대 앞에서 나를 단련하게 됩니다.',
  정관: '믿고 의지할 수 있는 상대입니다. 나를 바르게 이끌어 주는 존재로 느끼며 사회적으로도 자랑스럽게 여깁니다.',
  편인: '나를 독특한 방식으로 이해해 주는 상대입니다. 정신적 교감은 깊지만 생활 방식에서 엇갈릴 수 있습니다.',
  정인: '어머니처럼 나를 품어 주는 상대입니다. 곁에 있으면 위로와 지지를 받고 마음이 안정됩니다.',
};
const STAGE_MEANING = {
  장생: ['85', '새로 태어나는 자리입니다. 상대 곁에서 희망과 성장의 기운을 느낍니다.'],
  목욕: ['70', '설렘과 감정 기복이 큰 자리입니다. 연애 감정은 풍부하지만 마음이 자주 출렁입니다.'],
  관대: ['82', '자신감이 붙는 자리입니다. 상대와 함께 있으면 당당해지고 사회 활동에 힘이 납니다.'],
  건록: ['90', '자립과 안정의 자리입니다. 상대 곁에서 든든하게 뿌리내리는 느낌을 받습니다.'],
  제왕: ['88', '기운이 가장 왕성한 자리입니다. 힘이 넘치는 만큼 관계에서 주도권을 쥐려 합니다.'],
  쇠: ['62', '원숙하고 차분해지는 자리입니다. 열정보다 편안함으로 관계를 이어 갑니다.'],
  병: ['50', '기운이 약해지는 자리입니다. 상대에게 돌봄을 받고 싶어지고 쉽게 지칠 수 있습니다.'],
  사: ['45', '움직임이 멈추는 자리입니다. 상대 앞에서 말수가 줄고 감정을 안으로 삭입니다.'],
  묘: ['55', '저장하고 간직하는 자리입니다. 깊은 애착이 생기지만 집착으로 번지지 않게 해야 합니다.'],
  절: ['40', '끊어졌다 다시 이어지는 자리입니다. 관계가 극적으로 시작하거나 갑자기 식을 수 있습니다.'],
  태: ['60', '새로 잉태되는 자리입니다. 가능성은 크지만 관계를 키우려면 시간이 필요합니다.'],
  양: ['72', '길러지는 자리입니다. 상대에게 보살핌을 받으며 편안하게 기대게 됩니다.'],
};
const SINSAL_MEANING = {
  천을귀인: '가장 귀한 길신입니다. 어려울 때 도와주는 사람이 나타나고 위기를 넘기는 힘이 됩니다.',
  문창귀인: '학문과 글재주의 별입니다. 총명하고 표현력이 좋습니다.',
  월덕귀인: '덕을 쌓아 흉을 덜어 주는 별입니다. 인품이 너그럽고 화를 피해 갑니다.',
  양인살: '칼날처럼 강한 기운입니다. 추진력과 승부욕이 크지만 고집과 다툼을 조심해야 합니다.',
  백호대살: '강한 에너지가 몰린 기둥입니다. 능력이 뛰어나지만 사고나 큰 일을 겪기 쉬워 신중함이 필요합니다.',
  괴강살: '우두머리 기질의 별입니다. 결단력과 카리스마가 있으나 배우자와 기싸움이 생기기 쉽습니다.',
  홍염살: '이성을 끄는 화려한 매력의 별입니다. 인기가 많고 감정 표현이 풍부합니다.',
  도화살: '사람을 끄는 매력의 별입니다. 인기와 연애운이 강하고 예술 감각이 있습니다.',
  역마살: '움직임과 이동의 별입니다. 여행, 이사, 해외와 인연이 많고 한곳에 머무르기 답답해합니다.',
  화개살: '예술과 종교, 사색의 별입니다. 혼자만의 시간과 정신세계를 중시합니다.',
  공망: '비어 있는 자리입니다. 그 기둥이 뜻하는 일에 허전함이 있으나 집착을 내려놓으면 오히려 자유롭습니다.',
  고신살: '홀로 서는 별입니다. 독립심이 강하지만 연애와 결혼에서 외로움을 느끼기 쉽습니다.',
  과숙살: '홀로 지내는 별입니다. 배우자와 떨어져 지내거나 마음의 거리감이 생기기 쉽습니다.',
  원진살: '이유 없이 서운하고 미운 감정이 생기는 기운입니다. 오해를 쌓아 두지 않는 것이 중요합니다.',
  귀문관살: '예민한 직감과 영감의 별입니다. 감각이 뛰어나지만 신경이 날카로워지기 쉽습니다.',
};
const ANIMAL_REL = {
  육합: '띠끼리 육합입니다. 집안 분위기와 성장 배경이 잘 어울려 양가 관계도 원만한 편입니다.',
  삼합: '띠끼리 삼합입니다. 사회적 가치관과 목표가 같은 방향을 향해 함께 일을 도모하기 좋습니다.',
  충: '띠끼리 충입니다. 세대 감각과 집안 문화가 달라 처음엔 부딪히지만, 서로의 빈 곳을 채우기도 합니다.',
  원진: '띠끼리 원진입니다. 사소한 일로 서운함이 쌓이기 쉬우니 감정은 그때그때 풀어야 합니다.',
  형: '띠끼리 형입니다. 서로를 고치려 들면 갈등이 생기고, 존중하면 서로를 성장시킵니다.',
  해: '띠끼리 해입니다. 겉으론 무난해도 속으로 손해 본다는 느낌이 생기지 않게 주의하세요.',
  파: '띠끼리 파입니다. 작은 약속이 어긋나기 쉬우니 계획을 함께 확인하는 습관이 좋습니다.',
  자형: '같은 띠의 자형입니다. 같은 약점을 공유해 비슷한 문제로 함께 흔들릴 수 있습니다.',
  동일: '같은 띠입니다. 공유하는 감각이 많아 친구처럼 편안합니다.',
};
const ILJI_REL = {
  육합: '배우자궁(일지)끼리 육합합니다. 궁합에서 가장 반가운 조합 중 하나로, 생활 습관과 정서가 맞물려 함께 살수록 편안해집니다.',
  삼합: '배우자궁(일지)이 삼합(반합)을 이룹니다. 같은 목표를 향해 힘을 모으는 동지형 관계로, 함께 무언가를 이뤄 갈 때 사이가 더 좋아집니다.',
  충: '배우자궁(일지)이 충합니다. 생활 방식, 공간 사용, 감정 표현에서 부딪히기 쉽습니다. 떨어져 있으면 그립고 붙어 있으면 다투는 패턴이 생기기 쉬우니 각자의 시간과 공간을 인정해 주세요.',
  형: '배우자궁(일지)이 형을 이룹니다. 서로를 다듬으려다 상처를 주고받기 쉽습니다. 고치려 하기보다 인정하는 말투가 관계를 지킵니다.',
  자형: '같은 일지가 자형을 이룹니다. 닮은 약점끼리 만나 같은 문제로 동시에 예민해질 수 있습니다.',
  원진: '배우자궁(일지)이 원진입니다. 큰 이유 없이 상대가 밉게 보이는 순간이 옵니다. 서운함을 바로 말로 풀어내는 습관이 꼭 필요합니다.',
  귀문: '배우자궁(일지)이 귀문으로 얽혀 있습니다. 말하지 않아도 통하는 직감적 교감이 있지만, 그만큼 신경전도 예민해집니다.',
  파: '배우자궁(일지)이 파를 이룹니다. 큰 충돌보다는 작은 약속과 기대가 어긋나며 금이 가기 쉽습니다.',
  해: '배우자궁(일지)이 해를 이룹니다. 겉으로는 무난해도 속으로 서운함이 누적되기 쉬우니 감사 표현을 자주 해 주세요.',
  동일: '두 사람의 일지가 같습니다. 생활 패턴과 정서가 닮아 함께 있을 때 편안합니다.',
};

function relNames(rs) { return rs.map(r => r.t); }

function stemRelText(A, B, nA, nB) {
  const r = stemRel(A.ds, B.ds);
  const a = `${stemName(A.ds)}(${STEM_H[A.ds]})`, b = `${stemName(B.ds)}(${STEM_H[B.ds]})`;
  if (r.t === '합') return { score: 95, label: `천간합 · ${EL[r.el]}`, text: `${a}과 ${b}은 천간합(合化 ${ELF(r.el)}) 관계입니다. 서로를 자석처럼 끌어당기는 대표적인 인연 조합으로, 처음 만났을 때부터 편안함과 끌림을 함께 느끼기 쉽습니다. 합은 '묶인다'는 뜻도 있어, 함께 있으면 각자의 개성보다 둘의 관계를 먼저 생각하게 됩니다.` };
  if (r.t === '충') return { score: 35, label: '천간충', text: `${a}과 ${b}은 천간충 관계입니다. 생각의 방향과 결정 방식이 정면으로 부딪히기 쉽습니다. 강하게 끌리는 동시에 자주 충돌하는 조합이라, 의사결정의 역할을 미리 나누어 두면 충돌이 줄어듭니다.` };
  if (r.t === '비화') return { score: A.ds % 2 === B.ds % 2 ? 62 : 68, label: '비화(같은 오행)', text: `두 사람 모두 ${ELF(A.dEl)} 일간인 비화(比和) 관계입니다. 가치관과 생활 리듬이 비슷해 친구 같은 편안함이 있지만, 둘 다 같은 방향으로 고집을 부리면 경쟁 구도가 됩니다.${A.ds === B.ds ? ' 일간까지 같아 서로가 거울처럼 느껴집니다.' : ' 음양이 달라 서로의 부족한 결을 메워 줍니다.'}` };
  const [giver, taker, g, t] = r.dir === 'ab' ? [nA, nB, A, B] : [nB, nA, B, A];
  if (r.t === '생') return { score: 82, label: `상생 (${EL[g.dEl]}→${EL[t.dEl]})`, text: `${j(EL[g.dEl], '이', '가')} ${j(EL[t.dEl], '을', '를')} 생(生)해 주는 상생 관계입니다. ${j(giver + '님', '이', '가')} 주로 베풀고 챙기는 쪽, ${j(taker + '님', '이', '가')} 받으며 힘을 얻는 쪽이 되기 쉽습니다. 따뜻한 관계지만 한쪽만 주는 구조가 굳지 않도록 받는 쪽의 표현과 감사가 중요합니다.` };
  return { score: 52, label: `상극 (${EL[g.dEl]}→${EL[t.dEl]})`, text: `${j(EL[g.dEl], '이', '가')} ${j(EL[t.dEl], '을', '를')} 극(剋)하는 관계입니다. ${j(giver + '님', '이', '가')} 주도하고 ${j(taker + '님', '이', '가')} 맞추는 구도가 되기 쉽습니다. 적당한 긴장은 서로를 다듬어 주지만, 지나치면 ${taker}님이 압박을 느낍니다. 주도하는 쪽이 한 박자 늦추는 것이 열쇠입니다.` };
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

function compat(A, B) {
  const nA = A.input.name, nB = B.input.name;
  const cats = [];
  // 1. 일간
  const r1 = stemRelText(A, B, nA, nB);
  cats.push({ key: 'ilgan', name: '일간 궁합', sub: '성격·기질', w: 18, score: r1.score, label: r1.label,
    html: `<p>${r1.text}</p><div class="duo"><div><b>${nA}님 · ${stemName(A.ds)}</b><p>${DAYMASTER[A.ds]}</p></div><div><b>${nB}님 · ${stemName(B.ds)}</b><p>${DAYMASTER[B.ds]}</p></div></div>` });

  // 2. 일지(배우자궁)
  const rr = branchRel(A.db, B.db);
  const s2 = clamp(62 + rr.reduce((a, r) => a + r.v, 0), 15, 98);
  const t2 = rr.length ? rr.map(r => `<p>${ILJI_REL[r.t]}${r.el != null && r.t === '육합' ? ` 합하여 ${ELF(r.el)} 기운을 만듭니다.` : ''}</p>`).join('') : `<p>두 사람의 일지 ${BR_K[A.db]}(${BR_H[A.db]})와 ${BR_K[B.db]}(${BR_H[B.db]}) 사이에는 뚜렷한 합이나 충이 없습니다. 크게 끌리거나 부딪히는 자극은 적지만, 그만큼 무난하고 담백하게 생활을 꾸릴 수 있는 관계입니다.</p>`;
  cats.push({ key: 'ilji', name: '배우자궁', sub: '일지·생활 궁합', w: 22, score: s2, label: rr.length ? relNames(rr).join('·') : '무합무충', html: t2 });

  // 3. 오행 보완
  const sAB = supply(A, B), sBA = supply(B, A);
  const s3 = Math.round((sAB + sBA) / 2);
  const missA = [0, 1, 2, 3, 4].filter(e => A.count[e] === 0), missB = [0, 1, 2, 3, 4].filter(e => B.count[e] === 0);
  const sum = A.count.map((v, i) => v + B.count[i]);
  const missSum = [0, 1, 2, 3, 4].filter(e => sum[e] === 0);
  let t3 = `<p>${nA}님은 <b>${A.strength}</b> 사주로 ${ELF(A.yong)} 기운이 가장 필요하고(용신), ${nB}님은 <b>${B.strength}</b> 사주로 ${ELF(B.yong)} 기운이 가장 필요합니다.</p>`;
  t3 += `<p>${nB}님의 사주에는 ${nA}님의 용신 ${j(EL[A.yong], '이', '가')} ${B.count[A.yong]}개, ${nA}님의 사주에는 ${nB}님의 용신 ${j(EL[B.yong], '이', '가')} ${A.count[B.yong]}개 있습니다. `;
  t3 += sAB >= 75 && sBA >= 75 ? '서로가 서로에게 필요한 기운을 채워 주는 이상적인 보완 관계입니다.</p>'
    : sAB >= 75 ? `${j(nB + '님', '이', '가')} ${nA}님에게 필요한 기운을 잘 채워 줍니다. 반대로 ${nB}님은 관계 밖에서도 자신의 용신을 보충하면 좋습니다.</p>`
    : sBA >= 75 ? `${j(nA + '님', '이', '가')} ${nB}님에게 필요한 기운을 잘 채워 줍니다. 반대로 ${nA}님은 관계 밖에서도 자신의 용신을 보충하면 좋습니다.</p>`
    : '서로의 용신을 넉넉히 채워 주는 구조는 아니라서, 두 사람이 함께 용신 오행에 해당하는 활동(색, 방향, 취미)을 생활에 들이면 도움이 됩니다.</p>';
  const fill = [];
  const fA = missA.filter(e => B.count[e] > 0), fB = missB.filter(e => A.count[e] > 0);
  if (fA.length) fill.push(`${nA}님에게 없는 ${j(fA.map(e => EL[e]).join('·'), '을', '를')} ${j(nB + '님', '이', '가')}`);
  if (fB.length) fill.push(`${nB}님에게 없는 ${j(fB.map(e => EL[e]).join('·'), '을', '를')} ${j(nA + '님', '이', '가')}`);
  if (fill.length) t3 += `<p>${fill.join(', ')} 가지고 있어 빈자리를 메워 줍니다.</p>`;
  if (missSum.length) t3 += `<p>두 사람을 합쳐도 ${missSum.map(e => EL[e]).join('·')} 기운이 비어 있습니다. 이 기운이 상징하는 영역(${missSum.map(e => ['계획·성장', '표현·열정', '신뢰·중재', '결단·정리', '휴식·소통'][e]).join(', ')})은 둘 다 놓치기 쉬우니 의식적으로 챙기세요.</p>`;
  const giHeavy = [];
  if (B.count[A.gi] / B.total > 0.3) giHeavy.push(`${nB}님에게 많은 ${j(EL[A.gi], '은', '는')} ${nA}님에게 부담이 되는 기운(기신)`);
  if (A.count[B.gi] / A.total > 0.3) giHeavy.push(`${nA}님에게 많은 ${j(EL[B.gi], '은', '는')} ${nB}님에게 부담이 되는 기운(기신)`);
  if (giHeavy.length) t3 += `<p>${giHeavy.join('이고, ')}이라 상대의 강한 면이 버겁게 느껴질 때가 있습니다.</p>`;
  cats.push({ key: 'ohaeng', name: '오행 보완', sub: '용신·기운 교환', w: 18, score: s3, label: `주고받기 ${Math.round(sAB)}·${Math.round(sBA)}`, html: t3, extra: { sum } });

  // 4. 배우자성(십성)
  const tAB = tenGod(A.ds, B.ds), tBA = tenGod(B.ds, A.ds);
  const sex = c => (c.input.sex === 'F' ? 'F' : 'M');
  const s4 = Math.round((SPOUSE_SCORE[sex(A)][tAB] + SPOUSE_SCORE[sex(B)][tBA]) / 2);
  const star = c => (sex(c) === 'M' ? '재성(財星: 정재·편재)' : '관성(官星: 정관·편관)');
  const isStar = (c, tg) => (sex(c) === 'M' ? ['편재', '정재'] : ['편관', '정관']).includes(tg);
  let t4 = `<p>${nA}님에게 ${nB}님은 <b>${tAB}</b>입니다. ${TG_MEANING[tAB]}</p><p>${nB}님에게 ${nA}님은 <b>${tBA}</b>입니다. ${TG_MEANING[tBA]}</p>`;
  t4 += `<p>전통 명리에서 ${sex(A) === 'M' ? '남성' : '여성'}인 ${nA}님의 배우자 별은 ${star(A)}, ${sex(B) === 'M' ? '남성' : '여성'}인 ${nB}님의 배우자 별은 ${star(B)}입니다. `;
  const sa = isStar(A, tAB), sb = isStar(B, tBA);
  t4 += sa && sb ? '두 사람 모두 상대가 자신의 배우자 별에 해당해 서로를 자연스럽게 짝으로 받아들입니다.</p>'
    : sa ? `${nA}님에게는 ${j(nB + '님', '이', '가')} 배우자 별에 해당하지만, ${nB}님에게 ${nA}님은 ${tBA}에 가까워 연인보다 ${/인$/.test(tBA) ? '보호자' : /식신|상관/.test(tBA) ? '챙겨 줄 대상' : '동료'}처럼 느껴질 수 있습니다.</p>`
    : sb ? `${nB}님에게는 ${j(nA + '님', '이', '가')} 배우자 별에 해당하지만, ${nA}님에게 ${nB}님은 ${tAB}에 가까워 연인보다 ${/인$/.test(tAB) ? '보호자' : /식신|상관/.test(tAB) ? '챙겨 줄 대상' : '동료'}처럼 느껴질 수 있습니다.</p>`
    : '서로가 상대의 배우자 별에 직접 해당하지는 않습니다. 첫눈에 반하는 인연보다는 친구·동료로 시작해 정이 깊어지는 관계에 가깝습니다.</p>';
  cats.push({ key: 'spouse', name: '배우자성', sub: '십성으로 본 상대', w: 12, score: s4, label: `${tAB} · ${tBA}`, html: t4 });

  // 5. 십이운성
  const stA = STAGES[stage(A.ds, B.db)], stB = STAGES[stage(B.ds, A.db)];
  const s5 = Math.round((+STAGE_MEANING[stA][0] + +STAGE_MEANING[stB][0]) / 2);
  const t5 = `<p>십이운성은 한 사람의 일간이 상대의 배우자궁(일지)에 놓였을 때 어떤 상태가 되는지를 보여 줍니다.</p>
    <p>${nA}님의 ${j(stemName(A.ds), '이', '가')} ${nB}님의 일지 ${BR_K[B.db]}(${BR_H[B.db]})에서 <b>${stA}</b>입니다. ${STAGE_MEANING[stA][1]}</p>
    <p>${nB}님의 ${j(stemName(B.ds), '이', '가')} ${nA}님의 일지 ${BR_K[A.db]}(${BR_H[A.db]})에서 <b>${stB}</b>입니다. ${STAGE_MEANING[stB][1]}</p>`;
  cats.push({ key: 'stage', name: '십이운성', sub: '상대 곁의 내 기운', w: 8, score: s5, label: `${stA} · ${stB}`, html: t5 });

  // 6. 신살 인연
  let s6 = 60; const notes = [];
  const brs = c => ['year', 'month', 'day', 'hour'].filter(k => c.P[k]).map(k => [k, c.P[k].b]);
  const LBL = { year: '년지', month: '월지', day: '일지', hour: '시지' };
  for (const [X, Y, nx, ny] of [[A, B, nA, nB], [B, A, nB, nA]]) {
    const g = brs(Y).filter(([, b]) => GWIIN[X.ds].includes(b));
    if (g.length) { s6 += Math.min(2, g.length) * 6; notes.push(`<li class="good"><b>귀인</b> ${ny}님의 ${g.map(x => LBL[x[0]]).join('·')}에 ${nx}님의 천을귀인 ${j([...new Set(g.map(x => BR_K[x[1]]))].join('·'), '이', '가')} 있습니다. ${j(ny + '님', '은', '는')} ${nx}님이 어려울 때 결정적인 도움을 주는 귀인 역할을 합니다.</li>`); }
    const dh = [Y.P.day.b, Y.P.year.b].filter(b => X.dohwa.includes(b));
    if (dh.length) { s6 += 7; notes.push(`<li class="love"><b>도화</b> ${ny}님의 ${dh.includes(Y.P.day.b) ? '일지' : '년지'}가 ${nx}님의 도화 자리입니다. ${j(nx + '님', '은', '는')} ${ny}님에게서 강한 이성적 매력을 느낍니다.</li>`); }
    if (HONGYEOM[X.ds] === Y.P.day.b) { s6 += 5; notes.push(`<li class="love"><b>홍염</b> ${ny}님의 일지가 ${nx}님의 홍염 자리라 함께 있을 때 설렘이 오래갑니다.</li>`); }
    if (MUNCHANG[X.ds] === Y.P.day.b) { s6 += 4; notes.push(`<li class="good"><b>문창</b> ${ny}님의 일지가 ${nx}님의 문창귀인입니다. 대화가 잘 통하고 함께 배우는 일에 시너지가 납니다.</li>`); }
    if (X.gongmang.includes(Y.P.day.b)) { s6 -= 8; notes.push(`<li class="weak"><b>공망</b> ${ny}님의 일지가 ${nx}님의 공망에 들어 있습니다. ${j(nx + '님', '은', '는')} 상대에게 채워지지 않는 허전함을 느낄 수 있어, 기대치를 현실적으로 맞추는 것이 좋습니다.</li>`); }
    const gs = brs(X).filter(([k, b]) => (k === 'day' || k === 'hour') && (b === X.gosin || b === X.gwasuk));
    if (gs.length) { s6 -= 4; notes.push(`<li class="weak"><b>고신·과숙</b> ${nx}님의 ${gs.map(x => LBL[x[0]]).join('·')}에 고신·과숙살이 있어 혼자만의 시간이 꼭 필요한 사람입니다. 상대가 이를 거절로 오해하지 않게 미리 이야기해 두세요.</li>`); }
  }
  const crossWJ = [];
  for (const [ka, ba] of brs(A)) for (const [kb, bb] of brs(B)) {
    if (ka === 'day' && kb === 'day') continue;
    if ((ka === 'day' || kb === 'day' || (ka === 'year' && kb === 'year')) && branchRel(ba, bb).some(r => r.t === '원진')) crossWJ.push(`${nA}님 ${LBL[ka]}–${nB}님 ${LBL[kb]}`);
  }
  if (crossWJ.length) { s6 -= 4 * Math.min(2, crossWJ.length); notes.push(`<li class="weak"><b>원진</b> ${crossWJ.join(', ')} 사이에 원진이 걸려 있어 별것 아닌 일로 서운해지는 순간이 있습니다.</li>`); }
  const bk = c => c.sinsal.some(s => (s.name === '백호대살' && s.where.includes('일주')) || s.name === '괴강살');
  if (bk(A) && bk(B)) { s6 -= 5; notes.push('<li class="weak"><b>강한 기운</b> 두 사람 모두 일주에 백호·괴강 같은 강한 기운이 있어 기싸움이 붙기 쉽습니다. 결정권을 영역별로 나누면 좋습니다.</li>'); }
  s6 = clamp(Math.round(s6), 20, 98);
  if (!notes.length) notes.push('<li>두 사람 사이에 두드러지게 작용하는 신살 인연은 없습니다. 특별한 자극 없이 담백한 관계입니다.</li>');
  cats.push({ key: 'sinsal', name: '신살 인연', sub: '귀인·도화·공망', w: 10, score: s6, label: `${notes.length}개 작용`, html: `<ul class="notes">${notes.join('')}</ul>` });

  // 7. 띠 / 8. 월지
  const pairScore = rs => {
    if (!rs.length) return 66;
    if (rs.some(r => r.t === '육합' || r.t === '삼합')) return rs.some(r => r.v < 0) ? 72 : 90;
    if (rs.some(r => r.t === '동일')) return 68;
    return Math.min(...rs.map(r => ({ 충: 38, 원진: 40, 형: 48, 자형: 55, 해: 55, 파: 55, 귀문: 58 }[r.t] || 66)));
  };
  const ry = branchRel(A.P.year.b, B.P.year.b);
  cats.push({ key: 'tti', name: '띠 궁합', sub: '년지·집안 배경', w: 7, score: pairScore(ry), label: `${ANIMAL[A.P.year.b]}띠 · ${ANIMAL[B.P.year.b]}띠`,
    html: `<p>${nA}님은 ${BR_K[A.P.year.b]}(${BR_H[A.P.year.b]}) ${ANIMAL[A.P.year.b]}띠, ${nB}님은 ${BR_K[B.P.year.b]}(${BR_H[B.P.year.b]}) ${ANIMAL[B.P.year.b]}띠입니다. ${ry.length ? ry.map(r => ANIMAL_REL[r.t]).join(' ') : '띠 사이에 특별한 합이나 충이 없어 무난합니다.'}</p><p class="fine">띠는 입춘을 기준으로 바뀌므로 양력 1월~2월 초 출생은 전년도 띠가 됩니다. 띠 궁합은 집안과 사회적 배경을 보는 보조 지표라 비중을 낮게 두었습니다.</p>` });
  const rm = branchRel(A.P.month.b, B.P.month.b);
  const sm = stemRel(A.P.month.s, B.P.month.s);
  let s8 = pairScore(rm) + (sm.t === '합' ? 6 : sm.t === '충' ? -6 : 0);
  cats.push({ key: 'wolji', name: '월주 궁합', sub: '사회성·가족', w: 5, score: clamp(s8, 20, 98), label: rm.length ? relNames(rm).join('·') : '무난',
    html: `<p>월주는 부모·형제와 사회 환경, 그리고 타고난 계절감을 뜻합니다. ${nA}님은 ${S.pillarK(A.P.month)}월, ${nB}님은 ${S.pillarK(B.P.month)}월 생입니다. ${rm.length ? `월지끼리 ${relNames(rm).join('·')} 관계라 ${rm.some(r => r.v > 0) ? '가족 문화와 사회생활 리듬이 잘 맞습니다.' : '가족 문화나 일하는 리듬에서 차이를 느끼기 쉽습니다.'}` : '월지 사이에 큰 작용이 없어 서로의 가족과 무난하게 어울립니다.'}${sm.t === '합' ? ' 월간끼리도 합해 사회적인 호흡이 좋습니다.' : sm.t === '충' ? ' 월간끼리 충해 일 처리 방식에서 의견이 갈리기 쉽습니다.' : ''}</p>` });

  // 교차 매트릭스
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
  const grade = total >= 90 ? '천생연분' : total >= 80 ? '아주 좋은 인연' : total >= 70 ? '좋은 인연' : total >= 60 ? '노력하면 깊어지는 인연' : total >= 50 ? '서로 맞춰 가는 인연' : '갈등 관리가 필요한 인연';

  // 요약
  const ranked = cats.slice().sort((a, b) => b.score - a.score);
  const strengths = ranked.filter(c => c.score >= 70).slice(0, 3);
  const cautions = ranked.slice().reverse().filter(c => c.score < 62).slice(0, 3);
  const advice = [];
  if (rr.some(r => r.t === '충')) advice.push('함께 살거나 오래 붙어 지낼 때는 각자의 방, 혼자 있는 시간처럼 물리적 거리를 확보해 주세요.');
  if (rr.some(r => r.t === '원진' || r.t === '해')) advice.push('서운한 감정은 하루를 넘기지 말고 그날 짧게라도 말로 풀어 주세요.');
  if (rr.some(r => r.t === '형' || r.t === '자형')) advice.push('상대의 습관을 고치려는 말 대신 "나는 이렇게 하면 편해"처럼 내 입장으로 말해 보세요.');
  if (r1.score <= 52) advice.push('중요한 결정은 영역을 나누어 각자 최종 결정권을 갖는 방식이 다툼을 줄입니다.');
  if (r1.label.startsWith('상생')) advice.push('주는 쪽이 지치지 않도록 받는 쪽이 고마움을 자주 표현해 주세요.');
  if (missSum.length) advice.push(`둘 다 부족한 ${missSum.map(e => EL[e]).join('·')} 기운을 생활에 더해 보세요. (${missSum.map(e => ['목: 산책, 식물, 새 계획', '화: 운동, 여행, 밝은 조명', '토: 규칙적인 식사, 저축', '금: 정리정돈, 약속 지키기', '수: 충분한 수면, 깊은 대화'][e]).join(' / ')})`);
  if (s3 >= 75) advice.push('서로가 서로의 부족한 기운을 채워 주는 관계입니다. 힘들 때 상대에게 기대는 것을 주저하지 마세요.');
  if (!advice.length) advice.push('큰 충돌 요소가 적은 관계입니다. 지금처럼 일상의 대화를 꾸준히 이어 가는 것이 가장 좋은 처방입니다.');

  return { cats, total, grade, matrix, hap, chung, strengths, cautions, advice, sum, missSum };
}

function yearFlow(A, B, from, n) {
  const out = [];
  for (let Y = from; Y < from + n; Y++) {
    const ys = mod(Y - 4, 10), yb = mod(Y - 4, 12);
    let total = 0;
    const per = [A, B].map(c => {
      const tags = []; let v = 0;
      branchRel(yb, c.db).forEach(r => {
        if (r.t === '육합' || r.t === '삼합') { v += 2; tags.push({ t: `일지 ${r.t}`, k: 'good' }); }
        else if (r.t === '충') { v -= 3; tags.push({ t: '일지 충', k: 'bad' }); }
        else if (r.t === '형' || r.t === '자형') { v -= 2; tags.push({ t: '일지 형', k: 'bad' }); }
        else if (r.t === '원진') { v -= 1; tags.push({ t: '일지 원진', k: 'bad' }); }
      });
      const tg = tenGod(c.ds, ys);
      const isStar = (c.input.sex === 'F' ? ['편관', '정관'] : ['편재', '정재']).includes(tg);
      if (isStar) { v += 1; tags.push({ t: '배우자성의 해', k: 'love' }); }
      if (c.dohwa.includes(yb)) { v += 1; tags.push({ t: '도화', k: 'love' }); }
      if (c.needs.includes(stemEl(ys))) { v += 1; tags.push({ t: '용신운', k: 'good' }); }
      if (stemEl(ys) === c.gi) { v -= 1; tags.push({ t: '기신운', k: 'bad' }); }
      total += v;
      return { tags, v, tg };
    });
    if (yb % 4 === A.db % 4 && yb % 4 === B.db % 4 && A.db !== B.db) total += 2;
    const mood = total >= 3 ? ['순풍', 'good'] : total <= -3 ? ['주의', 'bad'] : ['평이', 'mid'];
    out.push({ Y, ys, yb, per, total, mood });
  }
  return out;
}

root.Compat = { compat, yearFlow, SINSAL_MEANING, DAYMASTER, j };
})(typeof window !== 'undefined' ? window : globalThis);
