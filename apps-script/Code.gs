/**
 * ===================================================================
 *  Interactive Logic Simulator - ตัวรับข้อมูลความก้าวหน้าและกิจกรรมสด
 *  รายวิชาคอมพิวเตอร์ 4 (ว32281) โรงเรียนหนองหงส์พิทยาคม
 * ===================================================================
 *
 *  วิธีติดตั้งอ่านได้ที่ docs/คู่มือติดตั้งแดชบอร์ด.md
 *  สรุปสั้น ๆ: สร้าง Google Sheet > ส่วนขยาย > Apps Script > วางโค้ดนี้ทับทั้งหมด
 *  > แก้รหัส 2 ค่าด้านล่าง > Deploy เป็น Web App > คัดลอก URL ไปใส่ในเว็บแอป
 *
 *  สคริปต์นี้ทำ 2 หน้าที่
 *  1. เก็บความก้าวหน้าของแต่ละคู่ ลงชีต "ผลกิจกรรม" ให้แดชบอร์ดครูอ่าน
 *  2. รับคำตอบกิจกรรมสด (คลาวด์คำ แบบทดสอบ โพล จับคู่ ตอบสั้น ภาพ SOS)
 *     ลงชีต "กิจกรรมสด" ใช้แทนระบบตอบรับการมีส่วนร่วมของบุคคลที่สาม
 */

/* ====== แก้ไข 2 บรรทัดนี้ก่อนใช้งาน ======
 * ไฟล์นี้เป็นตัวอย่างสาธารณะ จึงไม่ใส่รหัสจริงไว้
 * ไฟล์ที่ใส่รหัสจริงให้แล้วอยู่ที่ apps-script/Code.local.gs (ไม่ถูก push ขึ้น GitHub)
 */

/** รหัสสำหรับให้เว็บแอปของนักเรียนส่งข้อมูลเข้ามา */
const CLASS_SECRET = 'CHANGE_ME_CLASS';

/** รหัสสำหรับให้ครูเปิดดูแดชบอร์ด (ต้องต่างจากรหัสด้านบน และห้ามบอกนักเรียน) */
const TEACHER_KEY = 'CHANGE_ME_TEACHER';

/* ============ ไม่ต้องแก้ส่วนด้านล่างนี้ ============ */

const SHEET_NAME = 'ผลกิจกรรม';
const SHEET_LIVE = 'กิจกรรมสด';

/** โฟลเดอร์ใน Google Drive ที่เก็บภาพหน้าจอ SOS ระบบสร้างให้เองครั้งแรกที่มีคนส่งภาพ */
const SOS_FOLDER_NAME = 'ILS-ภาพ SOS จากนักเรียน';

/** ลำดับคอลัมน์ในชีต ต้องตรงกับลำดับใน writeRow() */
const HEADERS = [
  'อัปเดตล่าสุด',
  'ห้องเรียน',
  'รหัสคู่',
  'ชื่อ Driver',
  'เลขที่ Driver',
  'ชื่อ Navigator',
  'เลขที่ Navigator',
  'ภารกิจ 1 สุ่มข้อสอบ',
  'ภารกิจ 2 เงื่อนไขจบเกม',
  'คะแนนจำลอง',
  'ใบงาน (%)',
  'สร้าง PDF แล้ว',
  'ไฟล์ .capx',
  'สลับบทบาท (ครั้ง)',
  'รหัสเครื่อง',
];

const LIVE_HEADERS = [
  'เวลาที่ตอบ',
  'ห้องเรียน',
  'รหัสกิจกรรม',
  'ชื่อกิจกรรม',
  'ชื่อผู้ตอบ',
  'เลขที่',
  'รหัสคู่',
  'คำตอบ',
  'คะแนน',
  'คะแนนเต็ม',
  'เวลาที่ใช้ (วินาที)',
];

/**
 * บังคับให้คอลัมน์ที่ระบุเก็บเป็นข้อความล้วน
 *
 * Google Sheets แปลงข้อความอย่าง "5/1" เป็นวันที่ให้เองโดยอัตโนมัติ
 * ทำให้ชื่อห้องเรียนและรหัสคู่ที่เขียนลงไปเปลี่ยนรูป พออ่านกลับมาเทียบจึงไม่ตรง
 * ข้อมูลดูเหมือนหายทั้งที่เขียนสำเร็จ และไม่มีข้อความแจ้งเตือนใด ๆ
 */
function forceTextColumns(sheet, columns) {
  columns.forEach(function (col) {
    sheet.getRange(1, col, sheet.getMaxRows(), 1).setNumberFormat('@');
  });
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  // เขียนหัวตารางถ้ายังไม่มี
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#dee7ff');
    sheet.setFrozenRows(1);
    // ห้องเรียน รหัสคู่ และเลขที่ ต้องเป็นข้อความ ไม่ให้ถูกแปลงเป็นวันที่หรือตัวเลข
    forceTextColumns(sheet, [2, 3, 5, 7]);
  }
  return sheet;
}

function getLiveSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_LIVE);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_LIVE);
  }
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, LIVE_HEADERS.length).setValues([LIVE_HEADERS]);
    sheet.getRange(1, 1, 1, LIVE_HEADERS.length).setFontWeight('bold').setBackground('#ffe6cc');
    sheet.setFrozenRows(1);
    // ห้องเรียน รหัสกิจกรรม เลขที่ รหัสคู่ และคำตอบ ต้องเป็นข้อความล้วน
    forceTextColumns(sheet, [2, 3, 6, 7, 8]);
  }
  return sheet;
}

/** กุญแจระบุคู่ ใช้ห้องเรียน + รหัสคู่ เพื่อให้ข้อมูลของคู่เดิมถูกเขียนทับแทนการเพิ่มแถวใหม่ */
function rowKey(classroom, pairCode) {
  return String(classroom).trim() + '|' + String(pairCode).trim();
}

function buildRow(p) {
  return [
    new Date(),
    p.classroom || '',
    p.pairCode || '',
    p.driverName || '',
    p.driverNumber || '',
    p.navigatorName || '',
    p.navigatorNumber || '',
    p.mission1Passed ? 'ผ่าน' : 'ยังไม่ผ่าน',
    p.mission2Passed ? 'ผ่าน' : 'ยังไม่ผ่าน',
    Number(p.bestScore) || 0,
    Number(p.worksheetPercent) || 0,
    p.pdfGenerated ? 'แล้ว' : 'ยังไม่ได้สร้าง',
    p.capxFileName || '',
    Number(p.roleSwitchCount) || 0,
    p.deviceId || '',
  ];
}

/**
 * ลบข้อมูลของคู่ใดคู่หนึ่งออกจากชีต
 * คืนค่า true เมื่อพบและลบแล้ว, false เมื่อไม่พบแถวนั้น
 */
function deleteRowByPair(classroom, pairCode) {
  const sheet = getSheet();
  const key = rowKey(classroom, pairCode);
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i += 1) {
    if (rowKey(values[i][1], values[i][2]) === key) {
      sheet.deleteRow(i + 1); // +1 เพราะแถวในชีตนับจาก 1 และแถวแรกเป็นหัวตาราง
      return true;
    }
  }
  return false;
}

/* ==================== กิจกรรมสด ==================== */

/**
 * กิจกรรมที่กำลังเปิดอยู่ของแต่ละห้อง เก็บไว้ใน Script Properties ไม่ใช่ในชีต
 * เพราะเครื่องนักเรียนต้องถามค่านี้บ่อย การอ่าน Properties เร็วกว่าการเปิดชีตมาก
 */
function liveKey(classroom) {
  return 'live:' + String(classroom).trim();
}

function getLiveSession(classroom) {
  const raw = PropertiesService.getScriptProperties().getProperty(liveKey(classroom));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

function setLiveSession(classroom, session) {
  PropertiesService.getScriptProperties().setProperty(
    liveKey(classroom),
    JSON.stringify(session),
  );
}

/** กุญแจระบุผู้ตอบ ใช้ทับคำตอบเดิมเมื่อนักเรียนส่งซ้ำ แทนการเพิ่มแถวใหม่ */
function liveRowKey(activityId, name, number) {
  return (
    String(activityId).trim() +
    '|' +
    String(name).trim().toLowerCase() +
    '|' +
    String(number).trim()
  );
}

function getSosFolder() {
  const found = DriveApp.getFoldersByName(SOS_FOLDER_NAME);
  if (found.hasNext()) return found.next();
  return DriveApp.createFolder(SOS_FOLDER_NAME);
}

/**
 * บันทึกภาพหน้าจอที่นักเรียนส่งมาลง Google Drive ของครู
 * ไฟล์ถูกเก็บแบบส่วนตัว ไม่เปิดสิทธิ์ให้ใครเข้าถึงผ่านลิงก์
 * จอครูดูภาพผ่านคำสั่ง sosImage ซึ่งต้องใช้รหัสครูเท่านั้น
 */
function saveSosImage(classroom, name, base64, fileName) {
  const bytes = Utilities.base64Decode(base64);
  const safeName =
    Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyyMMdd-HHmmss') +
    '_' +
    String(classroom).replace(/[\\/]/g, '-') +
    '_' +
    String(name).replace(/[\\/]/g, '-') +
    '.jpg';
  const blob = Utilities.newBlob(bytes, 'image/jpeg', safeName);
  const file = getSosFolder().createFile(blob);
  file.setDescription('ภาพ SOS จาก ' + name + ' ไฟล์ต้นทาง ' + (fileName || '-'));
  return file.getId();
}

function handleLiveRespond(body, preparedImageId) {
  const r = body.response || {};
  if (!r.classroom || !r.studentName) {
    return jsonOut({ ok: false, error: 'ไม่มีชื่อผู้ตอบหรือห้องเรียน' });
  }

  const session = getLiveSession(r.classroom);
  if (!session) {
    return jsonOut({ ok: false, error: 'ตอนนี้ยังไม่มีกิจกรรมที่เปิดอยู่' });
  }
  if (!session.open) {
    return jsonOut({ ok: false, error: 'ครูปิดรับคำตอบของกิจกรรมนี้แล้ว' });
  }
  if (session.activityId !== r.activityId) {
    return jsonOut({ ok: false, error: 'กิจกรรมเปลี่ยนไปแล้ว กดโหลดกิจกรรมใหม่อีกครั้ง' });
  }

  let answer = String(r.answer || '');

  // ภาพ SOS ถูกบันทึกลง Drive ไปแล้วก่อนเข้าล็อก ที่นี่บันทึกเฉพาะรหัสไฟล์ลงชีต
  const imageId = preparedImageId || '';
  if (imageId) answer = 'IMG:' + imageId;

  const sheet = getLiveSheet();
  const key = liveRowKey(r.activityId, r.studentName, r.studentNumber);
  const lastRow = sheet.getLastRow();

  /**
   * อ่านเฉพาะคอลัมน์ C ถึง F (รหัสกิจกรรม ชื่อกิจกรรม ชื่อผู้ตอบ เลขที่) เพื่อหาแถวเดิม
   * ไม่อ่านทั้งชีต เพราะทั้งห้องส่งคำตอบพร้อมกันแล้วต้องเข้าคิวกันทีละคน
   * ยิ่งอ่านข้อมูลน้อย คิวยิ่งเดินเร็ว นักเรียนคนท้าย ๆ จึงไม่ต้องรอจนหมดเวลา
   */
  let targetRow = -1;
  if (lastRow > 1) {
    const scan = sheet.getRange(2, 3, lastRow - 1, 4).getValues();
    for (let i = 0; i < scan.length; i += 1) {
      if (liveRowKey(scan[i][0], scan[i][2], scan[i][3]) === key) {
        targetRow = i + 2;
        break;
      }
    }
  }

  const row = [
    new Date(),
    r.classroom,
    r.activityId,
    session.title || '',
    r.studentName,
    String(r.studentNumber || ''),
    String(r.pairCode || ''),
    answer,
    Number(r.score) || 0,
    Number(r.total) || 0,
    Number(r.seconds) || 0,
  ];

  if (targetRow > 0) {
    sheet.getRange(targetRow, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }

  return jsonOut({ ok: true, imageId: imageId });
}

function readLiveResponses(classroom, activityId) {
  const sheet = getLiveSheet();
  const values = sheet.getDataRange().getValues();
  const out = [];
  const room = String(classroom).trim();

  for (let i = 1; i < values.length; i += 1) {
    const v = values[i];
    if (String(v[1]).trim() !== room) continue;
    if (activityId && String(v[2]).trim() !== String(activityId).trim()) continue;
    out.push({
      submittedAt: v[0] ? new Date(v[0]).toISOString() : '',
      classroom: String(v[1] || ''),
      activityId: String(v[2] || ''),
      studentName: String(v[4] || ''),
      studentNumber: String(v[5] || ''),
      pairCode: String(v[6] || ''),
      answer: String(v[7] || ''),
      score: Number(v[8]) || 0,
      total: Number(v[9]) || 0,
      seconds: Number(v[10]) || 0,
    });
  }
  return out;
}

function clearLiveResponses(classroom, activityId) {
  const sheet = getLiveSheet();
  const values = sheet.getDataRange().getValues();
  const room = String(classroom).trim();
  let removed = 0;

  // ลบจากล่างขึ้นบน เพื่อไม่ให้หมายเลขแถวเลื่อนระหว่างลบ
  for (let i = values.length - 1; i >= 1; i -= 1) {
    const v = values[i];
    if (String(v[1]).trim() !== room) continue;
    if (activityId && String(v[2]).trim() !== String(activityId).trim()) continue;
    sheet.deleteRow(i + 1);
    removed += 1;
  }
  return removed;
}

/* ==================== ตัวรับคำขอ ==================== */

/** รับข้อมูลจากเว็บแอปของนักเรียน คำสั่งลบ และคำสั่งกิจกรรมสดจากแดชบอร์ดของครู */
function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonOut({ ok: false, error: 'ข้อมูลที่ส่งมาไม่ถูกต้อง' });
  }
  const action = body.action || '';

  /**
   * อัปโหลดภาพขึ้น Drive เป็นงานที่ช้าที่สุด (หลักวินาที) จึงทำนอกล็อก
   * ถ้าทำในล็อก นักเรียนคนอื่นทั้งห้องจะต้องรอคิวตามไปด้วยจนอาจหมดเวลา
   */
  let preparedImageId = '';
  if (action === 'liveRespond' && body.image && body.image.base64) {
    if (body.classSecret !== CLASS_SECRET) {
      return jsonOut({ ok: false, error: 'รหัสห้องเรียนไม่ถูกต้อง' });
    }
    const who = body.response || {};
    try {
      preparedImageId = saveSosImage(
        who.classroom,
        who.studentName,
        body.image.base64,
        body.image.name,
      );
    } catch (err) {
      return jsonOut({ ok: false, error: 'บันทึกภาพไม่สำเร็จ ' + String(err) });
    }
  }

  // กันข้อมูลชนกันเมื่อหลายคู่ส่งพร้อมกัน เผื่อเวลารอคิวไว้ให้พอกับทั้งห้อง
  // ขอคิวก่อนเข้า try เพื่อให้ releaseLock ถูกเรียกเฉพาะตอนที่ถือคิวอยู่จริงเท่านั้น
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(45000)) {
    return jsonOut({ ok: false, error: 'ระบบกำลังบันทึกของเพื่อนอยู่ รอสักครู่แล้วกดส่งอีกครั้ง' });
  }

  try {

    /* ---------- คำสั่งของครู ต้องใช้รหัสครูเท่านั้น ---------- */
    if (action === 'delete' || action === 'liveStart' || action === 'liveClose' || action === 'liveClear') {
      if (body.teacherKey !== TEACHER_KEY) {
        return jsonOut({ ok: false, error: 'รหัสครูไม่ถูกต้อง ไม่มีสิทธิ์ทำรายการนี้' });
      }

      if (action === 'delete') {
        if (!body.classroom || !body.pairCode) {
          return jsonOut({ ok: false, error: 'ไม่ได้ระบุห้องเรียนหรือรหัสคู่ที่ต้องการลบ' });
        }
        const removed = deleteRowByPair(body.classroom, body.pairCode);
        return jsonOut({
          ok: removed,
          error: removed ? '' : 'ไม่พบข้อมูลของคู่นี้ในชีต อาจถูกลบไปแล้ว',
        });
      }

      if (action === 'liveStart') {
        if (!body.classroom || !body.activityId) {
          return jsonOut({ ok: false, error: 'ไม่ได้ระบุห้องเรียนหรือกิจกรรม' });
        }
        const session = {
          classroom: String(body.classroom).trim(),
          activityId: String(body.activityId),
          presetId: String(body.presetId || ''),
          type: String(body.type || ''),
          title: String(body.title || ''),
          prompt: String(body.prompt || ''),
          open: true,
          openedAt: new Date().toISOString(),
        };
        setLiveSession(session.classroom, session);
        return jsonOut({ ok: true, session: session });
      }

      if (action === 'liveClose') {
        const session = getLiveSession(body.classroom);
        if (!session) return jsonOut({ ok: false, error: 'ไม่มีกิจกรรมที่เปิดอยู่' });
        session.open = false;
        setLiveSession(body.classroom, session);
        return jsonOut({ ok: true, session: session });
      }

      // liveClear
      const removedCount = clearLiveResponses(body.classroom, body.activityId);
      return jsonOut({ ok: true, removed: removedCount });
    }

    /* ---------- คำสั่งของนักเรียน ใช้รหัสห้องเรียน ---------- */
    if (action === 'liveRespond') {
      if (body.classSecret !== CLASS_SECRET) {
        return jsonOut({ ok: false, error: 'รหัสห้องเรียนไม่ถูกต้อง' });
      }
      return handleLiveRespond(body, preparedImageId);
    }

    /* ---------- ส่งความก้าวหน้าตามปกติ ---------- */
    if (body.secret !== CLASS_SECRET) {
      return jsonOut({ ok: false, error: 'รหัสห้องเรียนไม่ถูกต้อง' });
    }

    const p = body.payload || {};
    if (!p.classroom || !p.pairCode) {
      return jsonOut({ ok: false, error: 'ไม่มีข้อมูลห้องเรียนหรือรหัสคู่' });
    }

    const sheet = getSheet();
    const key = rowKey(p.classroom, p.pairCode);
    const values = sheet.getDataRange().getValues();

    let targetRow = -1;
    for (let i = 1; i < values.length; i += 1) {
      if (rowKey(values[i][1], values[i][2]) === key) {
        targetRow = i + 1;
        break;
      }
    }

    const row = buildRow(p);
    if (targetRow > 0) {
      sheet.getRange(targetRow, 1, 1, row.length).setValues([row]);
    } else {
      sheet.appendRow(row);
    }

    return jsonOut({ ok: true, updated: targetRow > 0 ? 'แก้ไขแถวเดิม' : 'เพิ่มแถวใหม่' });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** ส่งข้อมูลให้แดชบอร์ดของครู และให้เครื่องนักเรียนถามหากิจกรรมที่เปิดอยู่ */
function doGet(e) {
  try {
    const params = (e && e.parameter) || {};
    const action = params.action || '';

    /* ---------- นักเรียนถามว่าตอนนี้เปิดกิจกรรมอะไรอยู่ ---------- */
    if (action === 'livePoll') {
      if (params.classSecret !== CLASS_SECRET) {
        return jsonOut({ ok: false, error: 'รหัสห้องเรียนไม่ถูกต้อง' });
      }
      const session = getLiveSession(params.classroom || '');
      return jsonOut({ ok: true, session: session });
    }

    /* ---------- คำสั่งที่เหลือเป็นของครูทั้งหมด ---------- */
    if (params.key !== TEACHER_KEY) {
      return jsonOut({ ok: false, error: 'รหัสครูไม่ถูกต้อง' });
    }

    if (action === 'liveResponses') {
      return jsonOut({
        ok: true,
        session: getLiveSession(params.classroom || ''),
        responses: readLiveResponses(params.classroom || '', params.activityId || ''),
      });
    }

    if (action === 'sosImage') {
      const file = DriveApp.getFileById(params.fileId);
      const blob = file.getBlob();
      return jsonOut({
        ok: true,
        mimeType: blob.getContentType(),
        base64: Utilities.base64Encode(blob.getBytes()),
      });
    }

    /* ---------- ไม่ระบุ action = ขอรายการความก้าวหน้าทั้งหมด (แบบเดิม) ---------- */
    const sheet = getSheet();
    const values = sheet.getDataRange().getValues();
    const rows = [];

    for (let i = 1; i < values.length; i += 1) {
      const v = values[i];
      if (!v[2]) continue; // ข้ามแถวว่าง
      rows.push({
        updatedAt: v[0] ? new Date(v[0]).toISOString() : '',
        classroom: String(v[1] || ''),
        pairCode: String(v[2] || ''),
        driverName: String(v[3] || ''),
        driverNumber: String(v[4] || ''),
        navigatorName: String(v[5] || ''),
        navigatorNumber: String(v[6] || ''),
        mission1Passed: v[7] === 'ผ่าน',
        mission2Passed: v[8] === 'ผ่าน',
        bestScore: Number(v[9]) || 0,
        worksheetPercent: Number(v[10]) || 0,
        pdfGenerated: v[11] === 'แล้ว',
        capxFileName: String(v[12] || ''),
        roleSwitchCount: Number(v[13]) || 0,
      });
    }

    return jsonOut({ ok: true, count: rows.length, rows: rows });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  }
}

/**
 * ฟังก์ชันทดสอบ กดปุ่ม Run ในหน้า Apps Script เพื่อสร้างหัวตารางและขอสิทธิ์เข้าถึงชีต
 * ควรรันครั้งเดียวหลังวางโค้ดเสร็จ ก่อน Deploy
 *
 * ครั้งแรกจะมีหน้าต่างขอสิทธิ์ 2 อย่าง คือเข้าถึง Google Sheets และ Google Drive
 * สิทธิ์ Drive ใช้เก็บภาพหน้าจอ SOS ที่นักเรียนส่งเข้ามาเท่านั้น
 */
function ตั้งค่าเริ่มต้น() {
  const sheet = getSheet();
  const live = getLiveSheet();
  // ตั้งรูปแบบซ้ำให้ชีตที่สร้างไว้ก่อนหน้านี้ด้วย กันชื่อห้องอย่าง 5/1 กลายเป็นวันที่
  forceTextColumns(sheet, [2, 3, 5, 7]);
  forceTextColumns(live, [2, 3, 6, 7, 8]);
  Logger.log('สร้างชีต "%s" เรียบร้อย มีข้อมูลอยู่ %s แถว', SHEET_NAME, sheet.getLastRow() - 1);
  Logger.log('สร้างชีต "%s" เรียบร้อย มีข้อมูลอยู่ %s แถว', SHEET_LIVE, live.getLastRow() - 1);
  if (CLASS_SECRET === 'CHANGE_ME_CLASS' || TEACHER_KEY === 'CHANGE_ME_TEACHER') {
    Logger.log('เตือน: ยังไม่ได้เปลี่ยนรหัส CLASS_SECRET และ TEACHER_KEY');
  }
}

/** ล้างกิจกรรมสดที่ค้างอยู่ของทุกห้อง ใช้เมื่อต้องการเริ่มใหม่ทั้งหมด */
function ล้างกิจกรรมสดที่ค้างอยู่() {
  const props = PropertiesService.getScriptProperties();
  const keys = props.getKeys().filter(function (k) {
    return k.indexOf('live:') === 0;
  });
  keys.forEach(function (k) {
    props.deleteProperty(k);
  });
  Logger.log('ล้างกิจกรรมที่ค้างอยู่ %s ห้อง', keys.length);
}
