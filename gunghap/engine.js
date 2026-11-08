/* 사주 궁합 계산 엔진 — 만세력(절기·음력 변환), 명식, 신살, 궁합 점수 */
(function (root) {
'use strict';
const D2R = Math.PI / 180;
const mod = (a, n) => ((a % n) + n) % n;
const INT = Math.floor;

const STEM_H = '甲乙丙丁戊己庚辛壬癸', STEM_K = '갑을병정무기경신임계';
const BR_H = '子丑寅卯辰巳午未申酉戌亥', BR_K = '자축인묘진사오미신유술해';
const ANIMAL = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];
const EL = ['목', '화', '토', '금', '수'], EL_H = '木火土金水';
const BR_EL = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];
// 지장간 (여기 → 정기). 마지막이 정기
const HIDDEN = [[8, 9], [9, 7, 5], [4, 2, 0], [0, 1], [1, 9, 4], [4, 6, 2], [2, 5, 3], [3, 1, 5], [4, 8, 6], [6, 7], [7, 3, 4], [4, 0, 8]];
const TEN = [['비견', '겁재'], ['식신', '상관'], ['편재', '정재'], ['편관', '정관'], ['편인', '정인']];
const STAGES = ['장생', '목욕', '관대', '건록', '제왕', '쇠', '병', '사', '묘', '절', '태', '양'];
const STAGE_START = [11, 6, 2, 9, 2, 9, 5, 0, 8, 3];
const SINSAL12 = ['겁살', '재살', '천살', '지살', '도화살', '월살', '망신살', '장성살', '반안살', '역마살', '육해살', '화개살'];
const SINSAL12_START = [5, 2, 11, 8]; // b%4 → 겁살 위치
const JIEQI = ['입춘', '경칩', '청명', '입하', '망종', '소서', '입추', '백로', '한로', '입동', '대설', '소한'];

const GWIIN = [[1, 7], [0, 8], [11, 9], [11, 9], [1, 7], [0, 8], [1, 7], [2, 6], [5, 3], [5, 3]];
const MUNCHANG = [5, 6, 8, 9, 8, 9, 11, 0, 2, 3];
const YANGIN = [3, null, 6, null, 6, null, 9, null, 0, null];
const HONGYEOM = [6, 6, 2, 7, 4, 4, 10, 9, 0, 8];
const BAEKHO = ['0,4', '1,7', '2,10', '3,1', '4,4', '8,10', '9,1'];
const GOEGANG = ['6,4', '6,10', '8,4', '8,10', '4,10'];
const WONJIN = ['0,7', '1,6', '2,9', '3,8', '4,11', '5,10'];
const GWIMUN = ['0,9', '1,6', '2,7', '3,8', '4,11', '5,10'];
const HYEONG = ['2,5', '5,8', '2,8', '1,10', '7,10', '1,7', '0,3'];
const PA = ['0,9', '1,4', '2,11', '3,6', '5,8', '7,10'];
const WOLDEOK = [8, 6, 2, 0]; // 월지 b%4 → 천간
const LIUHE_EL = { '0,1': 2, '2,11': 0, '3,10': 1, '4,9': 3, '5,8': 4, '6,7': 1 };
const SAMHAP_EL = [4, 3, 1, 0];

const pairKey = (a, b) => (a < b ? a + ',' + b : b + ',' + a);
const stemEl = s => s >> 1;
const stemName = s => STEM_K[s] + EL[s >> 1];
const pillarH = p => STEM_H[p.s] + BR_H[p.b];
const pillarK = p => STEM_K[p.s] + BR_K[p.b];

function tenGod(day, target) {
  const rel = mod(stemEl(target) - stemEl(day), 5);
  return TEN[rel][(day % 2) === (target % 2) ? 0 : 1];
}
const tenGodBr = (day, b) => tenGod(day, HIDDEN[b][HIDDEN[b].length - 1]);
function stage(s, b) {
  return s % 2 === 0 ? mod(b - STAGE_START[s], 12) : mod(STAGE_START[s] - b, 12);
}
const sinsal12 = (base, t) => mod(t - SINSAL12_START[base % 4], 12);

/* ---------- 달력 ---------- */
function jdFromDate(d, m, y) {
  const a = INT((14 - m) / 12), yy = y + 4800 - a, mm = m + 12 * a - 3;
  return d + INT((153 * mm + 2) / 5) + 365 * yy + INT(yy / 4) - INT(yy / 100) + INT(yy / 400) - 32045;
}
function jdToDate(jd) {
  const a = jd + 32044, b = INT((4 * a + 3) / 146097), c = a - INT((b * 146097) / 4);
  const d = INT((4 * c + 3) / 1461), e = c - INT((1461 * d) / 4), m = INT((5 * e + 2) / 153);
  return [e - INT((153 * m + 2) / 5) + 1, m + 3 - 12 * INT(m / 10), b * 100 + d - 4800 + INT(m / 10)];
}
// 태양 시황경 (Meeus 저정밀, 오차 약 0.01°)
function sunLon(jd) {
  const T = (jd - 2451545) / 36525;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) * D2R;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M) + (0.019993 - 0.000101 * T) * Math.sin(2 * M) + 0.000289 * Math.sin(3 * M);
  const om = (125.04 - 1934.136 * T) * D2R;
  return mod(L0 + C - 0.00569 - 0.00478 * Math.sin(om), 360);
}
function findTerm(target, jd) {
  for (let i = 0; i < 12; i++) {
    const diff = mod(target - sunLon(jd) + 180, 360) - 180;
    jd += diff * 365.2422 / 360;
    if (Math.abs(diff) < 1e-7) break;
  }
  return jd;
}
// 음력 (한국 표준시 UTC+9 기준 천문 계산)
function newMoon(k) {
  const T = k / 1236.85, T2 = T * T, T3 = T2 * T, dr = D2R;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
  C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
  C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
  C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
  C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
  C1 = C1 + 0.0010 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
  const deltat = T < -11 ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3 : -0.000278 + 0.000265 * T + 0.000262 * T2;
  return Jd1 + C1 - deltat;
}
const TZ = 9;
const newMoonDay = k => INT(newMoon(k) + 0.5 + TZ / 24);
const sunSector = dn => INT(sunLon(dn - 0.5 - TZ / 24) / 30);
function lunarMonth11(yy) {
  const off = jdFromDate(31, 12, yy) - 2415021, k = INT(off / 29.530588853);
  let nm = newMoonDay(k);
  if (sunSector(nm) >= 9) nm = newMoonDay(k - 1);
  return nm;
}
function leapMonthOffset(a11) {
  const k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last, i = 1, arc = sunSector(newMoonDay(k + i));
  do { last = arc; i++; arc = sunSector(newMoonDay(k + i)); } while (arc !== last && i < 14);
  return i - 1;
}
function solarToLunar(dd, mm, yy) {
  const dn = jdFromDate(dd, mm, yy), k = INT((dn - 2415021.076998695) / 29.530588853);
  let ms = newMoonDay(k + 1);
  if (ms > dn) ms = newMoonDay(k);
  let a11 = lunarMonth11(yy), b11 = a11, ly;
  if (a11 >= ms) { ly = yy; a11 = lunarMonth11(yy - 1); } else { ly = yy + 1; b11 = lunarMonth11(yy + 1); }
  const ld = dn - ms + 1, diff = INT((ms - a11) / 29);
  let leap = false, lm = diff + 11;
  if (b11 - a11 > 365) {
    const lmd = leapMonthOffset(a11);
    if (diff >= lmd) { lm = diff + 10; if (diff === lmd) leap = true; }
  }
  if (lm > 12) lm -= 12;
  if (lm >= 11 && diff < 4) ly -= 1;
  return { d: ld, m: lm, y: ly, leap };
}
function lunarToSolar(ld, lm, ly, leap) {
  let a11, b11;
  if (lm < 11) { a11 = lunarMonth11(ly - 1); b11 = lunarMonth11(ly); } else { a11 = lunarMonth11(ly); b11 = lunarMonth11(ly + 1); }
  const k = INT(0.5 + (a11 - 2415021.076998695) / 29.530588853);
  let off = lm - 11; if (off < 0) off += 12;
  if (b11 - a11 > 365) {
    const leapOff = leapMonthOffset(a11);
    let leapMonth = leapOff - 2; if (leapMonth < 0) leapMonth += 12;
    if (leap && lm !== leapMonth) return null;
    if (leap || off >= leapOff) off += 1;
  } else if (leap) return null;
  const [d, m, y] = jdToDate(newMoonDay(k + off) + ld - 1);
  return { d, m, y };
}

/* ---------- 한국 표준시·일광절약시간 ---------- */
const DST = [[194806010000, 194809130000], [194904030000, 194909110000], [195004010000, 195009100000], [195105060000, 195109090000],
  [195505050000, 195509090000], [195605200000, 195609300000], [195705050000, 195709220000], [195805040000, 195809210000],
  [195905030000, 195909200000], [196005010000, 196009180000], [198705100200, 198710110300], [198805080200, 198810090300]];
function zoneInfo(y, m, d, h, mi) {
  const k = (((y * 100 + m) * 100 + d) * 100 + h) * 100 + mi;
  const std = (k >= 195403210000 && k < 196108100000) || (k >= 190804010000 && k < 191201010000) ? 510 : 540;
  const dst = DST.some(([a, b]) => k >= a && k < b);
  return { std, off: std + (dst ? 60 : 0), dst };
}

const fmtJD = jd => {
  const t = new Date((jd - 2440587.5) * 864e5 - 69000 + 9 * 36e5);
  const p = n => String(n).padStart(2, '0');
  return `${t.getUTCFullYear()}년 ${t.getUTCMonth() + 1}월 ${t.getUTCDate()}일 ${p(t.getUTCHours())}:${p(t.getUTCMinutes())}`;
};

/* ---------- 명식 ---------- */
function computeChart(inp, opts) {
  const res = { input: inp, warnings: [] };
  let { y, m, d } = inp;
  if (inp.cal === 'lunar') {
    const s = lunarToSolar(d, m, y, inp.leap);
    if (!s) throw new Error(`음력 ${y}년에는 윤${m}월이 없습니다. 윤달 체크를 해제해 주세요.`);
    const back = solarToLunar(s.d, s.m, s.y);
    if (back.d !== d || back.m !== m || back.leap !== !!inp.leap) throw new Error(`음력 ${y}년 ${inp.leap ? '윤' : ''}${m}월은 ${d - 1}일까지 있는 작은달입니다.`);
    res.lunar = { y, m, d, leap: !!inp.leap };
    ({ y, m, d } = s);
  } else {
    const t = new Date(Date.UTC(y, m - 1, d));
    if (t.getUTCMonth() !== m - 1) throw new Error(`${y}년 ${m}월에는 ${d}일이 없습니다.`);
    res.lunar = solarToLunar(d, m, y);
  }
  res.solar = { y, m, d };
  const hasTime = !!inp.hasTime;
  const h = hasTime ? inp.h : 12, mi = hasTime ? inp.mi : 0;
  const z = zoneInfo(y, m, d, h, mi);
  if (z.dst && hasTime) res.warnings.push('출생일이 당시 일광절약시간(서머타임) 기간이라 1시간을 빼고 계산했습니다.');
  const utMs = Date.UTC(y, m - 1, d, h, mi) - z.off * 60000;
  const jdTT = utMs / 864e5 + 2440587.5 + 69 / 86400;
  const lon = inp.lon == null ? z.std / 4 : inp.lon;
  const lmt = new Date(utMs + lon * 4 * 60000);
  const lmMin = lmt.getUTCHours() * 60 + lmt.getUTCMinutes();
  res.correction = Math.round((lon * 4) - z.off);
  res.lmt = { h: lmt.getUTCHours(), mi: lmt.getUTCMinutes() };

  let dayJ = jdFromDate(lmt.getUTCDate(), lmt.getUTCMonth() + 1, lmt.getUTCFullYear());
  let hourStemDay = dayJ;
  if (hasTime && lmMin >= 23 * 60) {
    dayJ += 1; hourStemDay = dayJ; // 통자시: 23시부터 다음 날
  }
  const dIdx = mod(dayJ + 49, 60);
  const day = { s: dIdx % 10, b: dIdx % 12 };
  let hour = null;
  if (hasTime) {
    const hb = INT(mod(lmMin + 60, 1440) / 120);
    const hsd = mod(hourStemDay + 49, 60) % 10;
    hour = { s: mod((hsd % 5) * 2 + hb, 10), b: hb };
  }
  const L = sunLon(jdTT);
  const mIdx = INT(mod(L - 315, 360) / 30);
  let Y = y; if (m <= 2 && mIdx >= 10) Y -= 1;
  const year = { s: mod(Y - 4, 10), b: mod(Y - 4, 12) };
  const month = { s: mod((year.s % 5) * 2 + 2 + mIdx, 10), b: (mIdx + 2) % 12 };
  const prevT = mod(315 + mIdx * 30, 360);
  const prevJD = findTerm(prevT, jdTT - mod(L - prevT, 360) / 360 * 365.2422);
  const nextJD = findTerm(mod(prevT + 30, 360), jdTT + mod(prevT + 30 - L, 360) / 360 * 365.2422);
  res.terms = { prev: { name: JIEQI[mIdx], at: fmtJD(prevJD) }, next: { name: JIEQI[(mIdx + 1) % 12], at: fmtJD(nextJD) } };
  const near = Math.min(jdTT - prevJD, nextJD - jdTT);
  if (near < 0.125) res.warnings.push(`출생 시각이 절기 경계(${near === jdTT - prevJD ? res.terms.prev.name : res.terms.next.name})와 3시간 이내라 월주${mIdx === 0 || mIdx === 11 ? '·년주' : ''}가 달라질 수 있습니다.`);
  const hr = mod(lmMin + 60, 120);
  if (hasTime && (hr < 8 || hr > 112)) res.warnings.push('출생 시각이 시진 경계에 가까워 시주가 달라질 수 있습니다.');
  res.yearSaju = Y;
  res.P = { year, month, day, hour };
  res.ds = day.s; res.db = day.b; res.dEl = stemEl(day.s);

  // 대운
  const forward = (year.s % 2 === 0) === (inp.sex === 'M');
  const days = forward ? nextJD - jdTT : jdTT - prevJD;
  const dNum = Math.max(1, Math.round(days / 3));
  const m60 = mod(6 * month.s - 5 * month.b, 60);
  res.daewoon = { forward, start: dNum, list: [] };
  for (let k = 1; k <= 10; k++) {
    const n = mod(m60 + (forward ? k : -k), 60);
    res.daewoon.list.push({ s: n % 10, b: n % 12, age: dNum + 10 * (k - 1) });
  }
  analyzeChart(res);
  return res;
}

function analyzeChart(c) {
  const { year, month, day, hour } = c.P;
  const ds = day.s, dEl = stemEl(ds);
  const pills = [['year', year], ['month', month], ['day', day], ['hour', hour]].filter(x => x[1]);
  // 단순 오행 개수
  const cnt = [0, 0, 0, 0, 0]; let yang = 0, total = 0;
  for (const [, p] of pills) {
    cnt[stemEl(p.s)]++; cnt[BR_EL[p.b]]++;
    if (p.s % 2 === 0) yang++; if (p.b % 2 === 0) yang++;
    total += 2;
  }
  c.count = cnt; c.total = total; c.yang = yang; c.yin = total - yang;
  // 가중 오행 (지장간 반영, 월지 가중)
  const w = [0, 0, 0, 0, 0];
  const BW = { year: 1, month: 3, day: 1.5, hour: 1 };
  for (const [k, p] of pills) {
    if (k !== 'day') w[stemEl(p.s)] += 1;
    const hs = HIDDEN[p.b], bw = BW[k];
    hs.forEach((s, i) => { w[stemEl(s)] += bw * (i === hs.length - 1 ? 0.7 : 0.3 / (hs.length - 1)); });
  }
  c.weighted = w;
  const tot = w.reduce((a, b) => a + b, 0);
  const sup = w[dEl] + w[mod(dEl + 4, 5)];
  const ratio = sup / tot;
  c.ratio = ratio;
  c.strength = ratio >= 0.68 ? '극신강' : ratio >= 0.52 ? '신강' : ratio >= 0.38 ? '중화' : ratio >= 0.24 ? '신약' : '극신약';
  let cands = ratio >= 0.52 ? [1, 2, 3].map(x => mod(dEl + x, 5)) : ratio < 0.38 ? [mod(dEl + 4, 5), dEl] : [0, 1, 2, 3, 4];
  cands = cands.slice().sort((a, b) => w[a] - w[b]);
  const yong = cands[0];
  const hee = cands.length > 1 ? cands[1] : mod(yong + 4, 5);
  const gi = mod(yong + 3, 5);
  let johu = null;
  if ([11, 0, 1].includes(month.b) && w[1] < 1.5) johu = 1;
  if ([5, 6, 7].includes(month.b) && w[4] < 1.5) johu = 4;
  c.yong = yong; c.hee = hee; c.gi = gi; c.johu = johu;
  c.needs = [...new Set([yong, hee, johu].filter(x => x !== null))];
  // 공망
  const st = mod(day.b - day.s, 12);
  c.gongmang = [mod(st + 10, 12), mod(st + 11, 12)];
  // 기둥별 정보
  c.cols = {};
  for (const [k, p] of pills) {
    c.cols[k] = {
      stemTG: k === 'day' ? '일간' : tenGod(ds, p.s),
      brTG: tenGodBr(ds, p.b),
      hidden: HIDDEN[p.b],
      stage: STAGES[stage(ds, p.b)],
      sinsal: SINSAL12[sinsal12(year.b, p.b)],
    };
  }
  // 신살
  const S = [];
  const LBL = { year: '년', month: '월', day: '일', hour: '시' };
  const add = (name, where, kind) => S.push({ name, where, kind });
  for (const [k, p] of pills) {
    if (GWIIN[ds].includes(p.b)) add('천을귀인', LBL[k] + '지', 'good');
    if (MUNCHANG[ds] === p.b) add('문창귀인', LBL[k] + '지', 'good');
    if (YANGIN[ds] === p.b) add('양인살', LBL[k] + '지', 'strong');
    if (HONGYEOM[ds] === p.b) add('홍염살', LBL[k] + '지', 'love');
    if (BAEKHO.includes(p.s + ',' + p.b)) add('백호대살', LBL[k] + '주', 'strong');
    if (k !== 'day' && c.gongmang.includes(p.b)) add('공망', LBL[k] + '지', 'weak');
    if (k !== 'month' && WOLDEOK[month.b % 4] === p.s) add('월덕귀인', LBL[k] + '간', 'good');
  }
  if (GOEGANG.includes(day.s + ',' + day.b)) add('괴강살', '일주', 'strong');
  for (const base of [['year', year.b], ['day', day.b]]) {
    for (const [k, p] of pills) {
      if (k === base[0]) continue;
      const i = sinsal12(base[1], p.b);
      if (i === 4) add('도화살', LBL[k] + '지', 'love');
      if (i === 9) add('역마살', LBL[k] + '지', 'move');
      if (i === 11) add('화개살', LBL[k] + '지', 'spirit');
    }
  }
  const season = INT(mod(year.b + 1, 12) / 3);
  const gosin = [2, 5, 8, 11][season], gwasuk = [10, 1, 4, 7][season];
  for (const [k, p] of pills) {
    if (k === 'year') continue;
    if (p.b === gosin) add('고신살', LBL[k] + '지', 'weak');
    if (p.b === gwasuk) add('과숙살', LBL[k] + '지', 'weak');
  }
  for (let i = 0; i < pills.length; i++) for (let j = i + 1; j < pills.length; j++) {
    const key = pairKey(pills[i][1].b, pills[j][1].b), w2 = LBL[pills[i][0]] + '·' + LBL[pills[j][0]] + '지';
    if (WONJIN.includes(key)) add('원진살', w2, 'weak');
    if (GWIMUN.includes(key)) add('귀문관살', w2, 'spirit');
  }
  // 같은 이름 중복 위치 합치기
  const merged = {};
  for (const s of S) { (merged[s.name] = merged[s.name] || { name: s.name, kind: s.kind, where: [] }).where.push(s.where); }
  c.sinsal = Object.values(merged).map(x => ({ ...x, where: [...new Set(x.where)] }));
  c.gosin = gosin; c.gwasuk = gwasuk;
  c.dohwa = [year.b, day.b].map(b => mod(SINSAL12_START[b % 4] + 4, 12));
}

/* ---------- 관계 판정 ---------- */
function branchRel(a, b) {
  const r = [];
  if (a === b) { r.push([4, 6, 9, 11].includes(a) ? { t: '자형', v: -10 } : { t: '동일', v: 5 }); return r; }
  const k = pairKey(a, b);
  if ((a + b) % 12 === 1) r.push({ t: '육합', v: 30, el: LIUHE_EL[k] });
  if (a % 4 === b % 4) r.push({ t: '삼합', v: 20, el: SAMHAP_EL[a % 4] });
  if (Math.abs(a - b) === 6) r.push({ t: '충', v: -30 });
  if (HYEONG.includes(k)) r.push({ t: '형', v: -18 });
  if (WONJIN.includes(k)) r.push({ t: '원진', v: -18 });
  if (GWIMUN.includes(k)) r.push({ t: '귀문', v: -8 });
  if (PA.includes(k)) r.push({ t: '파', v: -8 });
  if ((a + b) % 12 === 7) r.push({ t: '해', v: -10 });
  return r;
}
function stemRel(a, b) {
  const ea = stemEl(a), eb = stemEl(b);
  if (Math.abs(a - b) === 5) return { t: '합', el: [2, 3, 4, 0, 1][Math.min(a, b)] };
  if (Math.abs(a - b) === 6 && Math.min(a, b) <= 3) return { t: '충' };
  if (ea === eb) return { t: '비화' };
  if (mod(eb - ea, 5) === 1) return { t: '생', dir: 'ab' };
  if (mod(ea - eb, 5) === 1) return { t: '생', dir: 'ba' };
  if (mod(eb - ea, 5) === 2) return { t: '극', dir: 'ab' };
  return { t: '극', dir: 'ba' };
}

root.Saju = {
  STEM_H, STEM_K, BR_H, BR_K, ANIMAL, EL, EL_H, BR_EL, HIDDEN, STAGES, SINSAL12, GWIIN, MUNCHANG, HONGYEOM,
  mod, stemEl, stemName, pillarH, pillarK, tenGod, tenGodBr, stage, sinsal12, branchRel, stemRel,
  computeChart, solarToLunar, lunarToSolar, sunLon, jdFromDate,
};
})(typeof window !== 'undefined' ? window : globalThis);
