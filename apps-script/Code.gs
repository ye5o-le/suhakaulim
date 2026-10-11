/**
 * 말 영양성분표 결과 집계 (Google Apps Script 웹 앱)
 *
 * POST: 한 사람의 결과를 저장하고 집계를 돌려줍니다.
 *       같은 기기·같은 반에서 다시 하면 이전 줄을 덮어씁니다.
 * GET:  ?class=반 → 그 반의 유형별 인원을 돌려줍니다 (class가 비면 반 구분 없이 전체).
 */
const SHEET_NAME = '결과';
const HEADER = ['시간', '반', '기기ID', '유형', '말 건강 점수', '놀림', '가시', '매운맛', '불통', '무심함'];
const TYPES = ['tease', 'thorn', 'spicy', 'block', 'cold', 'clean'];
const SCORE_KEYS = ['tease', 'thorn', 'spicy', 'block', 'cold'];

function doGet(e) {
  const cls = clean_(e && e.parameter && e.parameter.class, 20);
  return json_(tally_(cls));
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: 'bad_json' });
  }
  const cls = clean_(body.class, 20);
  const device = clean_(body.device, 64);
  const type = String(body.type || '');
  if (!device || TYPES.indexOf(type) < 0) return json_({ ok: false, error: 'bad_input' });

  const s = body.scores || {};
  const health = clamp_(s.health, 0, 100);
  const row = [new Date(), cls, device, type, health].concat(SCORE_KEYS.map(function (k) { return clamp_(s[k], 0, 9); }));

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet_();
    const last = sh.getLastRow();
    let target = 0;
    if (last > 1) {
      const keys = sh.getRange(2, 2, last - 1, 2).getValues(); // 반, 기기ID
      for (let i = 0; i < keys.length; i++) {
        if (String(keys[i][0]) === cls && String(keys[i][1]) === device) { target = i + 2; break; }
      }
    }
    if (target) sh.getRange(target, 1, 1, row.length).setValues([row]);
    else sh.appendRow(row);
  } finally {
    lock.releaseLock();
  }
  const t = tally_(cls);
  t.ok = true;
  return json_(t);
}

function tally_(cls) {
  const counts = {};
  TYPES.forEach(function (k) { counts[k] = 0; });
  const sh = sheet_();
  const last = sh.getLastRow();
  if (last > 1) {
    sh.getRange(2, 2, last - 1, 3).getValues().forEach(function (r) { // 반, 기기ID, 유형
      if (cls && String(r[0]) !== cls) return;
      if (counts.hasOwnProperty(r[2])) counts[r[2]]++;
    });
  }
  return { class: cls, counts: counts };
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADER);
    sh.setFrozenRows(1);
    sh.getRange('B:C').setNumberFormat('@'); // "2-3" 같은 반 이름이 날짜로 바뀌지 않게
  }
  return sh;
}

function clean_(v, max) {
  return String(v == null ? '' : v).replace(/[^\w가-힣\-]/g, '').slice(0, max);
}

function clamp_(v, lo, hi) {
  const n = Math.round(Number(v));
  return isNaN(n) ? '' : Math.min(hi, Math.max(lo, n));
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
